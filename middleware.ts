import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/auth/callback") ||
    req.nextUrl.pathname.startsWith("/database-setup")

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isAuthRoute) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If user is authenticated and trying to access an auth route
  if (isAuthenticated && isAuthRoute && !req.nextUrl.pathname.startsWith("/database-setup")) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

