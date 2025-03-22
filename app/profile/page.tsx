"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { getProfile, getSession, type Profile, updateProfile } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: sessionData, error: sessionError } = await getSession()

        if (sessionError || !sessionData.session) {
          router.push("/login")
          return
        }

        const userId = sessionData.session.user.id
        const userEmail = sessionData.session.user.email || ""

        // Try to get profile
        const { data, error } = await getProfile(userId)

        if (error) {
          // If error is about missing table, suggest database setup
          if (error.message?.includes("doesn't exist") || error.message?.includes("relation")) {
            setError("Database tables not set up correctly. Please visit /api/setup-database to fix this issue.")
            setEmail(userEmail)
            return
          }

          throw error
        }

        if (data) {
          setProfile(data)
          setFullName(data.full_name || "")
          setEmail(data.email || userEmail)
          setCompany(data.company || "")
        } else {
          // If no data but no error, use session email
          setProfile({
            id: userId,
            email: userEmail,
            full_name: null,
            avatar_url: null,
            company: null,
            created_at: new Date().toISOString(),
          })
          setEmail(userEmail)
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err)
        setError(err.message || "Failed to load profile")

        // Try to at least set the email from session
        try {
          const { data: sessionData } = await getSession()
          if (sessionData.session?.user?.email) {
            setEmail(sessionData.session.user.email)
          }
        } catch (e) {
          console.error("Could not get email from session:", e)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!profile) {
        throw new Error("Profile not loaded")
      }

      const { error } = await updateProfile(profile.id, {
        full_name: fullName,
        company: company,
      })

      if (error) {
        throw error
      }

      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error("Failed to update profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Profile" text="Manage your account settings." />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and company details.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                  {error}
                  {error.includes("database") && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-destructive underline"
                      onClick={() => (window.location.href = "/api/setup-database")}
                    >
                      Click here to fix database issues
                    </Button>
                  )}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm bg-green-100 text-green-800 rounded-md">Profile updated successfully!</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
                <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button">Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

