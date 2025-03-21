"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProfile, getSession, type Profile, signOut } from "@/lib/supabase"

export function UserNav() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Update the getProfile function to handle errors better
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: sessionData, error: sessionError } = await getSession()

        if (sessionError || !sessionData.session) {
          router.push("/login")
          return
        }

        const userId = sessionData.session.user.id
        const { data, error } = await getProfile(userId)

        if (error) {
          console.error("Failed to load profile:", error)
          // Create a minimal profile object with just email to prevent UI errors
          const email = sessionData.session.user.email || "user@example.com"
          setProfile({
            id: userId,
            email: email,
            full_name: null,
            avatar_url: null,
            company: null,
            created_at: new Date().toISOString(),
          })
          return
        }

        if (data) {
          setProfile(data)
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()

      if (error) {
        throw error
      }

      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Failed to sign out:", err)
    }
  }

  if (isLoading || !profile) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  // Get initials from full name or email
  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    return profile.email.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || profile.email} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

