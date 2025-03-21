"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Check, Copy, Database, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

export default function DatabaseSetupPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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

  const runScript = async () => {
    setIsRunning(true)
    setStatus("running")
    setErrorMessage("")

    try {
      // Run the SQL script directly using Supabase's rpc function
      const { error } = await supabase.rpc("exec_sql", { sql_query: sqlScript })

      if (error) {
        throw error
      }

      // Verify tables were created
      const { error: settingsError } = await supabase.from("settings").select("id").limit(1)

      if (settingsError) {
        throw new Error(
          "Tables were not created successfully. Please try running the script manually in the Supabase SQL Editor.",
        )
      }

      setStatus("success")

      // Redirect after success
      setTimeout(() => {
        router.push("/settings")
      }, 2000)
    } catch (err: any) {
      console.error("Error running SQL script:", err)
      setStatus("error")
      setErrorMessage(err.message || "An error occurred while setting up the database.")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Database Setup</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              Your database tables need to be created before you can use the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "error" && (
              <div className="mb-4 p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                <div className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Error setting up database
                </div>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {status === "success" && (
              <div className="mb-4 p-3 text-sm bg-green-100 text-green-800 rounded-md">
                <div className="font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Database setup successful!
                </div>
                <p className="mt-1">Redirecting to settings page...</p>
              </div>
            )}

            <Tabs defaultValue="automatic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
                <TabsTrigger value="manual">Manual Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="automatic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h3 className="font-medium">One-Click Database Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to automatically create all required database tables.
                  </p>
                  <Button className="w-full mt-2" onClick={runScript} disabled={isRunning || status === "success"}>
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up database...
                      </>
                    ) : (
                      "Set Up Database Tables"
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  <p>This will create the following tables:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                      <code>settings</code> - Stores application settings
                    </li>
                    <li>
                      <code>import_logs</code> - Records import activities
                    </li>
                    <li>
                      <code>profiles</code> - Stores user profiles
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Go to Supabase SQL Editor</h3>
                    <p className="text-sm text-muted-foreground">
                      Open your Supabase project dashboard and navigate to the SQL Editor.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-1"
                      onClick={() => window.open("https://app.supabase.com/project/cafqfaqreciqoyvhsqun/sql", "_blank")}
                    >
                      Open Supabase SQL Editor
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">2. Copy and Run the SQL Script</h3>
                    <p className="text-sm text-muted-foreground">
                      Copy the SQL script below and run it in the Supabase SQL Editor.
                    </p>

                    <div className="relative">
                      <pre className="p-4 rounded-md bg-muted overflow-auto text-xs max-h-[300px]">{sqlScript}</pre>
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
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">3. Return to the Application</h3>
                    <p className="text-sm text-muted-foreground">
                      After running the script, return to the application and try accessing the settings page again.
                    </p>
                    <Button className="mt-1" onClick={() => router.push("/settings")}>
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Dashboard
            </Button>
            <Button onClick={() => router.push("/settings")}>Try Settings Again</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

