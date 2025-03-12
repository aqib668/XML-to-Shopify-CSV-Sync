import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This client has admin privileges and should only be used server-side
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

