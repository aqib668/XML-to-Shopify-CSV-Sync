// Central configuration file

// Site URL - used for authentication redirects and API endpoints
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

// Supabase configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cafqfaqreciqoyvhsqun.supabase.co"

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZnFmYXFyZWNpcW95dmhzcXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjEwOTUsImV4cCI6MjA1ODA5NzA5NX0.X5hsJeckWF5sEZNe2Cu3AW9_hd2vVQRA7Mer_5ctGOQ"

// Auth redirect paths
export const AUTH_REDIRECT_URL = `${SITE_URL}/auth/callback`
export const LOGIN_URL = `${SITE_URL}/login`

// Other configuration settings can be added here
export const LOW_INVENTORY_THRESHOLD = 2

