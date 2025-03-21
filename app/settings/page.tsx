"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Database, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession, getSettings, updateSettings } from "@/lib/supabase"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    shopify_store: "",
    api_key: "",
    api_secret: "",
    access_token: "",
    low_inventory_threshold: 2,
    enable_notifications: true,
    auto_publish: true,
    overwrite_existing: false,
    import_images: true,
    sync_schedule: "manual",
    sync_time: "02:00",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [databaseError, setDatabaseError] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true)
        setDatabaseError(false)

        const { data: sessionData, error: sessionError } = await getSession()

        if (sessionError || !sessionData.session) {
          router.push("/login")
          return
        }

        const currentUserId = sessionData.session.user.id
        setUserId(currentUserId)

        const { data, error } = await getSettings(currentUserId)

        if (error) {
          console.error("Error fetching settings:", error)

          // Check if this is a database table missing error
          if (
            error.message?.includes("doesn't exist") ||
            error.message?.includes("relation") ||
            error.message?.includes("database")
          ) {
            setDatabaseError(true)
          }

          setError(error.message || "Failed to load settings")
          return
        }

        if (data) {
          setSettings({
            shopify_store: data.shopify_store || "",
            api_key: data.api_key || "",
            api_secret: data.api_secret || "",
            access_token: data.access_token || "",
            low_inventory_threshold: data.low_inventory_threshold || 2,
            enable_notifications: data.enable_notifications !== undefined ? data.enable_notifications : true,
            auto_publish: data.auto_publish !== undefined ? data.auto_publish : true,
            overwrite_existing: data.overwrite_existing !== undefined ? data.overwrite_existing : false,
            import_images: data.import_images !== undefined ? data.import_images : true,
            sync_schedule: data.sync_schedule || "manual",
            sync_time: data.sync_time || "02:00",
          })
        }
      } catch (err: any) {
        console.error("Failed to load settings:", err)
        setError(err.message || "Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [router])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await updateSettings(userId, settings)

      if (error) {
        throw error
      }

      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      setError(err.message || "Failed to save settings")

      // Check if this is a database table missing error
      if (
        err.message?.includes("doesn't exist") ||
        err.message?.includes("relation") ||
        err.message?.includes("database")
      ) {
        setDatabaseError(true)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Manage your application settings and Shopify connection." />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (databaseError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Manage your application settings and Shopify connection." />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The database tables required for this application are missing or not set up correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to set up the database tables before you can use the settings page. This is a one-time setup
              process.
            </p>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-medium">Error details:</span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/database-setup")}>
              Set Up Database Tables
            </Button>
          </CardFooter>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your application settings and Shopify connection." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Shopify Connection</CardTitle>
            <CardDescription>Connect your application to your Shopify store.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveSettings}>
            <CardContent className="space-y-4">
              {error && !databaseError && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>
              )}

              {success && (
                <div className="p-3 text-sm bg-green-100 text-green-800 rounded-md">Settings saved successfully!</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="shopify-store">Shopify Store URL</Label>
                <Input
                  id="shopify-store"
                  placeholder="your-store.myshopify.com"
                  value={settings.shopify_store}
                  onChange={(e) => updateSetting("shopify_store", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  placeholder="API Key"
                  value={settings.api_key}
                  onChange={(e) => updateSetting("api_key", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input
                  id="api-secret"
                  type="password"
                  placeholder="API Secret"
                  value={settings.api_secret}
                  onChange={(e) => updateSetting("api_secret", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Access Token"
                  value={settings.access_token}
                  onChange={(e) => updateSetting("access_token", e.target.value)}
                />
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
                    Save Connection
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>Configure inventory alerts and thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inventory-threshold">Low Inventory Threshold</Label>
                <Input
                  id="inventory-threshold"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={settings.low_inventory_threshold}
                  onChange={(e) => updateSetting("low_inventory_threshold", Number.parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Products with inventory below this number will trigger alerts.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={settings.enable_notifications}
                  onCheckedChange={(checked) => updateSetting("enable_notifications", checked)}
                />
                <Label htmlFor="notifications">Enable email notifications</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>Configure product import settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-publish"
                  checked={settings.auto_publish}
                  onCheckedChange={(checked) => updateSetting("auto_publish", checked)}
                />
                <Label htmlFor="auto-publish">Auto-publish products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="overwrite"
                  checked={settings.overwrite_existing}
                  onCheckedChange={(checked) => updateSetting("overwrite_existing", checked)}
                />
                <Label htmlFor="overwrite">Overwrite existing products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="import-images"
                  checked={settings.import_images}
                  onCheckedChange={(checked) => updateSetting("import_images", checked)}
                />
                <Label htmlFor="import-images">Import product images</Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Auto Sync Schedule</Label>
                <Select value={settings.sync_schedule} onValueChange={(value) => updateSetting("sync_schedule", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (no auto sync)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.sync_schedule !== "manual" && (
                <div className="space-y-2">
                  <Label htmlFor="sync-time">Sync Time</Label>
                  <Input
                    id="sync-time"
                    type="time"
                    value={settings.sync_time}
                    onChange={(e) => updateSetting("sync_time", e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

