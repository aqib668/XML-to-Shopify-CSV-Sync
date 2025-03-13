import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Use correct environment variable names
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    })
    throw new Error('Missing required Supabase configuration')
  }

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not / or /login or /register,
  // redirect the user to /login
  if (
    !session &&
    !req.nextUrl.pathname.startsWith("/login") &&
    !req.nextUrl.pathname.startsWith("/register") &&
    !req.nextUrl.pathname.startsWith("/auth") &&
    req.nextUrl.pathname !== "/"
  ) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is / or /login or /register,
  // redirect the user to /dashboard
  if (
    session &&
    (req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register"))
  ) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

