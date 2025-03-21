"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Clock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSettings } from "@/lib/settings"

export default function ImportPage() {
  const router = useRouter()
  const [xmlUrl, setXmlUrl] = useState("https://eyyowholesale.com/xml/products/merchant/2737")
  const [xmlContent, setXmlContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [syncSchedule, setSyncSchedule] = useState("manual")
  const [syncTime, setSyncTime] = useState("02:00")

  // Load settings on component mount
  useState(() => {
    async function loadSettings() {
      try {
        const settings = await getSettings()
        setSyncSchedule(settings.syncSchedule)
        setSyncTime(settings.syncTime)
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }

    loadSettings()
  })

  const handleImportFromUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real implementation, this would:
      // 1. Fetch the XML from the URL
      // 2. Parse the XML
      // 3. Compare with existing Shopify products
      // 4. Generate a CSV file with timestamp
      // 5. Save the CSV to the project folder
      // 6. Create a log entry

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push("/import/success")
    } catch (error) {
      console.error("Import failed:", error)
      alert("Import failed. Please check the URL and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportFromText = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Similar to URL import, but using the pasted XML content

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push("/import/success")
    } catch (error) {
      console.error("Import failed:", error)
      alert("Import failed. Please check the XML content and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Import Products" text="Import products from an XML feed into your Shopify store." />

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">Import from URL</TabsTrigger>
          <TabsTrigger value="text">Import from Text</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>XML Feed URL</CardTitle>
              <CardDescription>Enter the URL of your XML feed to import products.</CardDescription>
            </CardHeader>
            <form onSubmit={handleImportFromUrl}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="xml-url">XML Feed URL</Label>
                  <Input
                    id="xml-url"
                    placeholder="https://example.com/feed.xml"
                    value={xmlUrl}
                    onChange={(e) => setXmlUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Sync Schedule</Label>
                  <RadioGroup
                    defaultValue={syncSchedule}
                    onValueChange={setSyncSchedule}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual (one-time import)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {syncSchedule !== "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="sync-time">Sync Time</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="sync-time"
                        type="time"
                        value={syncTime}
                        onChange={(e) => setSyncTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">The time when the automatic sync will run.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Import Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>XML Content</CardTitle>
              <CardDescription>Paste your XML content directly to import products.</CardDescription>
            </CardHeader>
            <form onSubmit={handleImportFromText}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="xml-content">XML Content</Label>
                  <Textarea
                    id="xml-content"
                    placeholder="Paste your XML content here..."
                    className="min-h-[200px]"
                    value={xmlContent}
                    onChange={(e) => setXmlContent(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Import Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

