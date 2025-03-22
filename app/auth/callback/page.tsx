"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Package } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Processing authentication...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the URL hash or query parameters
        const hash = window.location.hash
        const query = window.location.search

        console.log("Auth callback triggered", { hash, query })
        setMessage("Authenticating...")

        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session) {
          setMessage("Authentication successful! Redirecting...")
          console.log("Session obtained successfully")

          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            router.push("/")
            router.refresh()
          }, 1500)
        } else {
          console.log("No session found after auth callback")
          throw new Error("No session found")
        }
      } catch (err: any) {
        console.error("Auth callback error:", err)
        setError(err.message || "Authentication failed")
        setMessage("Authentication failed. Redirecting to login...")

        setTimeout(() => {
          router.push("/login?error=" + encodeURIComponent(err.message || "Authentication failed"))
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Authentication</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex justify-center">
          {error ? (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

