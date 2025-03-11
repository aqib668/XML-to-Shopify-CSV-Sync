"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Calendar, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ScheduleData = {
  enabled: boolean
  time: string
  days: string[]
  next_run: string | null
}

export function SyncSchedule() {
  const [schedule, setSchedule] = useState<ScheduleData>({
    enabled: false,
    time: "03:00",
    days: ["Mon", "Wed", "Fri"],
    next_run: null,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase.from("sync_schedule").select("*").single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setSchedule({
            enabled: data.enabled,
            time: data.time,
            days: data.days,
            next_run: data.next_run,
          })
        }
      } catch (error) {
        console.error("Error fetching schedule:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [supabase])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>Automatic sync schedule configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Automatic Sync</span>
              <Badge variant={schedule.enabled ? "default" : "outline"}>
                {schedule.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {schedule.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{schedule.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Days</p>
                      <p className="font-medium">{schedule.days.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-500">Next Scheduled Run</p>
                  <p className="font-medium">{formatDate(schedule.next_run)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

