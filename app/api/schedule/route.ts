import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { enabled, time, days } = await request.json()

    if (enabled === undefined || !time || !days || !Array.isArray(days)) {
      return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 })
    }

    // Calculate next run time
    const nextRun = calculateNextRun(time, days)

    // Update schedule in database
    const { error } = await supabase.from("sync_schedule").upsert({
      id: "default", // Using a constant ID for the single schedule record
      enabled,
      time,
      days,
      next_run: nextRun,
      user_id: session.user.id,
    })

    if (error) {
      throw new Error(`Failed to update schedule: ${error.message}`)
    }

    // Log schedule update
    await supabase.from("logs").insert({
      id: uuidv4(),
      event: "Schedule Updated",
      details: `Schedule ${enabled ? "enabled" : "disabled"} for ${days.join(", ")} at ${time}`,
      status: "info",
    })

    return NextResponse.json({
      success: true,
      message: "Schedule updated successfully",
      nextRun,
    })
  } catch (error) {
    console.error("Schedule update error:", error)

    // Log error
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.from("logs").insert({
      id: uuidv4(),
      event: "Schedule Update Error",
      details: `Error updating schedule: ${error instanceof Error ? error.message : String(error)}`,
      status: "error",
    })

    return NextResponse.json(
      { error: "Failed to update schedule", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

function calculateNextRun(time: string, days: string[]) {
  if (!time || !days || days.length === 0) {
    return null
  }

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  const [hours, minutes] = time.split(":").map(Number)
  const now = new Date()

  // Set time to the specified hours and minutes
  const targetDate = new Date(now)
  targetDate.setHours(hours, minutes, 0, 0)

  // If the time is in the past for today, start checking from tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1)
  }

  // Find the next day that matches one in the days array
  const maxDaysToCheck = 7 // Check up to a week ahead
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dayOfWeek = targetDate.getDay()
    const dayName = Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek)

    if (dayName && days.includes(dayName)) {
      return targetDate.toISOString()
    }

    // Move to the next day
    targetDate.setDate(targetDate.getDate() + 1)
  }

  return null
}

