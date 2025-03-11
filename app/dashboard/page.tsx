"use client"

import { useState } from "react"
import { Clock, Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { SyncStatus } from "@/components/sync-status"
import { SyncSchedule } from "@/components/sync-schedule"

export default function DashboardPage() {
  const [xmlUrl, setXmlUrl] = useState("https://eyyowholesale.com/xml/products/merchant/2737")
  const [isLoading, setIsLoading] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ xmlUrl }),
      })

      if (!response.ok) {
        throw new Error("Sync failed")
      }

      const data = await response.json()

      toast({
        title: "Sync completed",
        description: `Found ${data.newProducts} new products`,
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "There was an error syncing products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCsv = async () => {
    try {
      const response = await fetch("/api/generate-csv", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to generate CSV")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "shopify-products.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "CSV Downloaded",
        description: "Your CSV file has been generated and downloaded",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error generating the CSV file",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleDownloadCsv}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <Tabs defaultValue="sync">
        <TabsList>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Sync</CardTitle>
              <CardDescription>Sync products from XML feed to Shopify CSV format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xml-url">XML Feed URL</Label>
                <Input
                  id="xml-url"
                  value={xmlUrl}
                  onChange={(e) => setXmlUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                />
              </div>
              <Button onClick={handleSync} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <SyncStatus />
            <SyncSchedule />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Sync</CardTitle>
              <CardDescription>Configure automatic daily sync settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-sync" checked={syncEnabled} onCheckedChange={setSyncEnabled} />
                <Label htmlFor="auto-sync">Enable daily sync</Label>
              </div>

              {syncEnabled && (
                <div className="grid gap-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sync-time">Sync Time</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <Input id="sync-time" type="time" defaultValue="03:00" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <Button key={day} variant="outline" size="sm" className="h-8 w-12">
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

