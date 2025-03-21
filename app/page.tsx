import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InventoryAlerts } from "@/components/inventory-alerts"
import { StatsCards } from "@/components/stats-cards"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your store's performance and inventory.">
        <Link href="/import">
          <Button>
            Import Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Low Inventory Alerts</CardTitle>
            <CardDescription>Products with inventory levels below the threshold (2 units).</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<InventoryAlertsSkeleton />}>
              <InventoryAlerts />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
            <CardDescription>Your recent product import activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Imported 120 products</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Imported 85 products</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 11:42 AM</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Imported 210 products</p>
                  <p className="text-sm text-muted-foreground">March 19, 2025 at 2:15 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/import/history" className="text-sm text-primary hover:underline">
              View all import history
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

function StatsCardSkeleton() {
  return (
    <>
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[120px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[100px]" />
              <Skeleton className="mt-2 h-4 w-[60px]" />
            </CardContent>
          </Card>
        ))}
    </>
  )
}

function InventoryAlertsSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-[60px]" />
          </div>
        ))}
    </div>
  )
}

