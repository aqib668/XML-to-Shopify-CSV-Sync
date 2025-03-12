"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"

type SyncStatusData = {
  last_sync: string | null
  new_products_count: number
  status: "success" | "error" | "idle"
  message: string
}

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusData>({
    last_sync: null,
    new_products_count: 0,
    status: "idle",
    message: "No sync has been performed yet",
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("sync_status")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setSyncStatus({
            last_sync: data.created_at,
            new_products_count: data.new_products_count,
            status: data.status,
            message: data.message,
          })
        }
      } catch (error) {
        console.error("Error fetching sync status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSyncStatus()

    // Set up real-time subscription
    const channel = supabase
      .channel("sync-status-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sync_status",
        },
        (payload) => {
          const newStatus = payload.new as any
          setSyncStatus({
            last_sync: newStatus.created_at,
            new_products_count: newStatus.new_products_count,
            status: newStatus.status,
            message: newStatus.message,
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"

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
        <CardTitle>Sync Status</CardTitle>
        <CardDescription>Current status of product synchronization</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {syncStatus.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : syncStatus.status === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="font-medium">
                {syncStatus.status === "success"
                  ? "Sync Completed"
                  : syncStatus.status === "error"
                    ? "Sync Failed"
                    : "No Sync Performed"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Last Sync</p>
                <p className="font-medium">{formatDate(syncStatus.last_sync)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">New Products</p>
                <p className="font-medium">{syncStatus.new_products_count}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500">Status Message</p>
              <p className="text-sm">{syncStatus.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

