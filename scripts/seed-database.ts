// This script can be used to initialize the database with a default user
// Run with: npx tsx scripts/seed-database.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cafqfaqreciqoyvhsqun.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZnFmYXFyZWNpcW95dmhzcXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjEwOTUsImV4cCI6MjA1ODA5NzA5NX0.X5hsJeckWF5sEZNe2Cu3AW9_hd2vVQRA7Mer_5ctGOQ"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate a random password
function generateRandomPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Create default user
    const email = "aqibshahzad48668@gmail.com"
    const password = generateRandomPassword()

    console.log(`Creating user with email: ${email}`)
    console.log(`Generated password: ${password}`)

    // Check if user already exists
    const { data: existingUsers } = await supabase.from("profiles").select("email").eq("email", email)

    if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists, skipping user creation")
    } else {
      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      console.log("User created successfully")

      // Wait for profile to be created via trigger
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile with additional info
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: "Aqib Shahzad",
            company: "Bolt App",
          })
          .eq("id", authData.user.id)

        if (profileError) {
          throw profileError
        }

        console.log("Profile updated successfully")
      }
    }

    // Create database tables if they don't exist
    console.log("Checking database tables...")

    // Check if settings table exists
    const { error: settingsError } = await supabase.from("settings").select("id").limit(1)

    if (settingsError && settingsError.code === "PGRST116") {
      console.log("Creating settings table...")

      // In a real implementation, you would use migrations
      // For this example, we'll assume the table is created elsewhere
      console.log("Please create the settings table manually with the following structure:")
      console.log(`
        CREATE TABLE settings (
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
      `)
    } else {
      console.log("Settings table exists")
    }

    // Check if import_logs table exists
    const { error: logsError } = await supabase.from("import_logs").select("id").limit(1)

    if (logsError && logsError.code === "PGRST116") {
      console.log("Creating import_logs table...")

      // In a real implementation, you would use migrations
      console.log("Please create the import_logs table manually with the following structure:")
      console.log(`
        CREATE TABLE import_logs (
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
      `)
    } else {
      console.log("Import logs table exists")
    }

    console.log("Database seeding completed successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

seedDatabase()

