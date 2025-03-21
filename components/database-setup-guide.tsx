"use client"

import { useState } from "react"
import { Check, Copy, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DatabaseSetupGuide() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const sqlScript = `
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

-- Create import_logs table if it doesn't exist
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

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
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
  `.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
        <CardDescription>Your database tables need to be created before you can use the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instructions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="sql">SQL Script</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Go to Supabase SQL Editor</h3>
              <p className="text-sm text-muted-foreground">
                Open your Supabase project dashboard and navigate to the SQL Editor.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. Create a New Query</h3>
              <p className="text-sm text-muted-foreground">
                Click on "New Query" and paste the SQL script from the "SQL Script" tab.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">3. Run the Query</h3>
              <p className="text-sm text-muted-foreground">
                Click "Run" to execute the SQL script and create the necessary tables.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">4. Refresh the Application</h3>
              <p className="text-sm text-muted-foreground">
                After running the script, refresh this page to continue using the application.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="sql" className="mt-4">
            <div className="relative">
              <pre className="p-4 rounded-md bg-muted overflow-auto text-xs">{sqlScript}</pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(sqlScript)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => window.open("https://app.supabase.com/project/cafqfaqreciqoyvhsqun/sql", "_blank")}
        >
          Open Supabase SQL Editor
        </Button>
      </CardFooter>
    </Card>
  )
}

