import Link from "next/link"
import { ArrowLeft, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function ImportLogsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Import Logs" text="View history of all product imports and download logs or CSV files.">
        <Button variant="outline" asChild>
          <Link href="/import">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Import
          </Link>
        </Button>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>All product imports with logs and generated CSV files.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>New Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell>{log.totalProducts}</TableCell>
                  <TableCell>{log.newProducts}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : log.status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View Log</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download CSV</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

const importLogs = [
  {
    id: "1",
    date: "2025-03-21 06:15:22",
    source: "https://eyyowholesale.com/xml/products/merchant/2737",
    totalProducts: 157,
    newProducts: 24,
    status: "Completed",
    csvFilename: "shopify-import-2025-03-21T06-15-22.csv",
    logFilename: "import-log-2025-03-21T06-15-22.txt",
  },
  {
    id: "2",
    date: "2025-03-14 02:00:00",
    source: "https://eyyowholesale.com/xml/products/merchant/2737",
    totalProducts: 152,
    newProducts: 5,
    status: "Completed",
    csvFilename: "shopify-import-2025-03-14T02-00-00.csv",
    logFilename: "import-log-2025-03-14T02-00-00.txt",
  },
  {
    id: "3",
    date: "2025-03-07 02:00:00",
    source: "https://eyyowholesale.com/xml/products/merchant/2737",
    totalProducts: 150,
    newProducts: 12,
    status: "Completed",
    csvFilename: "shopify-import-2025-03-07T02-00-00.csv",
    logFilename: "import-log-2025-03-07T02-00-00.txt",
  },
  {
    id: "4",
    date: "2025-02-28 02:00:00",
    source: "https://eyyowholesale.com/xml/products/merchant/2737",
    totalProducts: 0,
    newProducts: 0,
    status: "Failed",
    csvFilename: "",
    logFilename: "import-log-2025-02-28T02-00-00.txt",
  },
  {
    id: "5",
    date: "2025-02-21 02:00:00",
    source: "https://eyyowholesale.com/xml/products/merchant/2737",
    totalProducts: 145,
    newProducts: 8,
    status: "Completed",
    csvFilename: "shopify-import-2025-02-21T02-00-00.csv",
    logFilename: "import-log-2025-02-21T02-00-00.txt",
  },
]

