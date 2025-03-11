"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Calendar, Clock, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function SchedulePage() {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState("03:00")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [nextRun, setNextRun] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase.from("sync_schedule").select("*").eq("id", "default").single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setEnabled(data.enabled)
          setTime(data.time)
          setSelectedDays(data.days)
          setNextRun(data.next_run)
        } else {
          // Default values if no schedule exists
          setEnabled(false)
          setTime("03:00")
          setSelectedDays(["Mon", "Wed", "Fri"])
          setNextRun(null)
        }
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast({
          title: "Error",
          description: "Failed to load schedule settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [supabase, toast])

  const toggleDay = (day: string) => {
    setSelectedDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]))
  }

  const handleSaveSchedule = async () => {
    if (selectedDays.length === 0 && enabled) {
      toast({
        title: "Validation Error",
        description: "Please select at least one day for the schedule",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled,
          time,
          days: selectedDays,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save schedule")
      }

      const data = await response.json()
      setNextRun(data.nextRun)

      toast({
        title: "Schedule Saved",
        description: enabled ? `Sync scheduled for ${formatDate(data.nextRun)}` : "Automatic sync has been disabled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Sync Schedule</CardTitle>
          <CardDescription>Configure when the system should automatically sync products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id="auto-sync" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="auto-sync">Enable automatic sync</Label>
          </div>

          {enabled && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sync-time">Sync Time (24-hour format)</Label>
                  <div className="flex items-center space-x-2 max-w-xs">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input id="sync-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day}
                        variant={selectedDays.includes(day) ? "default" : "outline"}
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                {nextRun && (
                  <div className="flex items-start space-x-2 pt-4 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Next scheduled sync:</p>
                      <p className="text-gray-500">{formatDate(nextRun)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSchedule} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Schedule
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

