import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const userEmail = sessionData.session.user.email

    // SQL to create tables and fix issues
    const sql = `
    -- Drop and recreate tables to fix issues
    DROP TABLE IF EXISTS public.settings;
    DROP TABLE IF EXISTS public.import_logs;
    DROP TABLE IF EXISTS public.profiles;
    
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      company TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create settings table
    CREATE TABLE IF NOT EXISTS public.settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      shopify_store TEXT,
      api_key TEXT,
      api_secret TEXT,
      access_token TEXT,
      low_inventory_threshold INTEGER DEFAULT 2,
      enable_notifications BOOLEAN DEFAULT TRUE,
      auto_publish BOOLEAN DEFAULT TRUE,
      overwrite_existing BOOLEAN DEFAULT FALSE,
      import_images BOOLEAN DEFAULT TRUE,
      sync_schedule TEXT DEFAULT 'manual',
      sync_time TEXT DEFAULT '02:00',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create import_logs table
    CREATE TABLE IF NOT EXISTS public.import_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      source TEXT NOT NULL,
      total_products INTEGER DEFAULT 0,
      new_products INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress',
      csv_filename TEXT,
      log_filename TEXT,
      error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create a trigger to create a profile when a new user signs up
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email)
      VALUES (NEW.id, NEW.email);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create the trigger if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
      ) THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
      END IF;
    END
    $$;
    
    -- Insert profile for current user if it doesn't exist
    INSERT INTO public.profiles (id, email)
    VALUES ('${userId}', '${userEmail}')
    ON CONFLICT (id) DO NOTHING;
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Database setup error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database setup complete" })
  } catch (error) {
    console.error("Error in database setup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

