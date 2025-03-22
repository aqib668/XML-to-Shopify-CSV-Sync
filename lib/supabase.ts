import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_REDIRECT_URL } from "./config"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Types for database tables
export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company: string | null
  created_at: string
}

export type ImportLog = {
  id: string
  user_id: string
  date: string
  source: string
  total_products: number
  new_products: number
  status: "completed" | "failed" | "in_progress"
  csv_filename: string
  log_filename: string
  error?: string
}

export type AppSettings = {
  id?: string
  user_id: string
  shopify_store: string
  api_key: string
  api_secret: string
  access_token: string
  low_inventory_threshold: number
  enable_notifications: boolean
  auto_publish: boolean
  overwrite_existing: boolean
  import_images: boolean
  sync_schedule: "manual" | "daily" | "weekly" | "monthly"
  sync_time: string
}

// Helper functions for authentication
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: AUTH_REDIRECT_URL,
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { data, error }
}

// Helper functions for profile management
export async function getProfile(userId: string) {
  try {
    // First check if the profiles table exists
    const { error: tableCheckError } = await supabase.from("profiles").select("count").limit(1)

    if (tableCheckError) {
      console.error("Profiles table doesn't exist:", tableCheckError)
      return {
        data: null,
        error: new Error("Profiles table doesn't exist. Please set up the database first."),
      }
    }

    // If table exists, try to get profile
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      // If no profile found for this user, create a default profile
      if (error.code === "PGRST116") {
        console.log("No profile found for user, creating default")

        // Get user email from auth
        const { data: userData } = await supabase.auth.getUser(userId)
        const email = userData?.user?.email || "user@example.com"

        // Create default profile
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({ id: userId, email: email })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return { data: newProfile, error: null }
      }
      throw error
    }

    return { data, error: null }
  } catch (err) {
    console.error("Error in getProfile:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to load profile"),
    }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId)

  return { data, error }
}

// Helper functions for settings
export async function getSettings(userId: string) {
  try {
    // First check if the settings table exists
    const { error: tableCheckError } = await supabase.from("settings").select("count").limit(1)

    if (tableCheckError) {
      console.error("Settings table doesn't exist:", tableCheckError)
      return {
        data: null,
        error: new Error("Settings table doesn't exist. Please set up the database first."),
      }
    }

    // If table exists, try to get settings
    const { data, error } = await supabase.from("settings").select("*").eq("user_id", userId).single()

    if (error) {
      // If no settings found for this user, create default settings
      if (error.code === "PGRST116") {
        console.log("No settings found for user, creating defaults")
        return await createDefaultSettings(userId)
      }
      throw error
    }

    return { data, error: null }
  } catch (err) {
    console.error("Error in getSettings:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to load settings"),
    }
  }
}

export async function createDefaultSettings(userId: string) {
  try {
    const defaultSettings: AppSettings = {
      user_id: userId,
      shopify_store: "",
      api_key: "",
      api_secret: "",
      access_token: "",
      low_inventory_threshold: 2,
      enable_notifications: true,
      auto_publish: true,
      overwrite_existing: false,
      import_images: true,
      sync_schedule: "manual",
      sync_time: "02:00",
    }

    const { data, error } = await supabase.from("settings").insert(defaultSettings).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error("Error in createDefaultSettings:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to create default settings"),
    }
  }
}

export async function updateSettings(userId: string, updates: Partial<AppSettings>) {
  try {
    // First check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from("settings")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (checkError) {
      // Settings don't exist, create them first
      if (checkError.code === "PGRST116") {
        console.log("No settings found for user, creating with updates")
        const defaultSettings: AppSettings = {
          user_id: userId,
          shopify_store: updates.shopify_store || "",
          api_key: updates.api_key || "",
          api_secret: updates.api_secret || "",
          access_token: updates.access_token || "",
          low_inventory_threshold: updates.low_inventory_threshold || 2,
          enable_notifications: updates.enable_notifications !== undefined ? updates.enable_notifications : true,
          auto_publish: updates.auto_publish !== undefined ? updates.auto_publish : true,
          overwrite_existing: updates.overwrite_existing !== undefined ? updates.overwrite_existing : false,
          import_images: updates.import_images !== undefined ? updates.import_images : true,
          sync_schedule: updates.sync_schedule || "manual",
          sync_time: updates.sync_time || "02:00",
        }

        const { data, error } = await supabase.from("settings").insert(defaultSettings).select().single()

        return { data, error }
      }
      throw checkError
    }

    // Settings exist, update them
    const { data, error } = await supabase.from("settings").update(updates).eq("user_id", userId).select().single()

    return { data, error }
  } catch (err) {
    console.error("Error in updateSettings:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to update settings"),
    }
  }
}

// Helper functions for import logs
export async function getImportLogs(userId: string) {
  const { data, error } = await supabase
    .from("import_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  return { data, error }
}

export async function createImportLog(log: Omit<ImportLog, "id">) {
  const { data, error } = await supabase.from("import_logs").insert(log).select().single()

  return { data, error }
}

export async function updateImportLog(id: string, updates: Partial<ImportLog>) {
  const { data, error } = await supabase.from("import_logs").update(updates).eq("id", id)

  return { data, error }
}

