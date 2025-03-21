import Link from "next/link"
import { ArrowLeft, Check, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function ImportSuccessPage() {
  // In a real implementation, this would be passed as a parameter or stored in state
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const csvFilename = `shopify-import-${timestamp}.csv`
  const logFilename = `import-log-${timestamp}.txt`

  return (
    <DashboardShell>
      <DashboardHeader heading="Import Successful" text="Your products have been successfully processed." />

      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Import Completed</CardTitle>
          <CardDescription>
            Your XML feed has been successfully processed and converted to Shopify CSV format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="mb-2 font-medium">Import Summary</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Products Processed:</div>
              <div>157</div>
              <div>New Products Found:</div>
              <div>24</div>
              <div>Products with Images:</div>
              <div>142</div>
              <div>Products with Variants:</div>
              <div>89</div>
              <div>Products with Missing Data:</div>
              <div>3</div>
              <div>CSV Filename:</div>
              <div className="truncate">{csvFilename}</div>
              <div>Import Date:</div>
              <div>{new Date().toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Shopify CSV
          </Button>
          <Button variant="outline" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            View Import Log
          </Button>
          <div className="flex w-full space-x-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/import">Import More Products</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}

