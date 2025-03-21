import Image from "next/image"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function SlowMovingPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Slow-Moving Inventory" text="Products with low sales velocity over the past 30 days." />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slow-Moving Products</CardTitle>
              <CardDescription>Products with no sales in the last 30 days.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input className="w-[250px]" placeholder="Search products..." />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>No sales in 30 days</DropdownMenuItem>
                  <DropdownMenuItem>No sales in 60 days</DropdownMenuItem>
                  <DropdownMenuItem>No sales in 90 days</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>High inventory (10+)</DropdownMenuItem>
                  <DropdownMenuItem>Medium inventory (5-10)</DropdownMenuItem>
                  <DropdownMenuItem>Low inventory (1-4)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Inventory</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Days Since Last Sale</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slowMovingProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.inventory}</TableCell>
                  <TableCell>{product.daysSinceLastSale}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit product</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Create discount</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Archive product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

const slowMovingProducts = [
  {
    id: "1",
    name: "Vintage Denim Jacket",
    image: "/placeholder.svg?height=50&width=50",
    inventory: 12,
    daysSinceLastSale: 45,
    price: 89.99,
  },
  {
    id: "2",
    name: "Leather Crossbody Bag",
    image: "/placeholder.svg?height=50&width=50",
    inventory: 8,
    daysSinceLastSale: 38,
    price: 129.99,
  },
  {
    id: "3",
    name: "Wool Beanie Hat",
    image: "/placeholder.svg?height=50&width=50",
    inventory: 24,
    daysSinceLastSale: 62,
    price: 24.99,
  },
  {
    id: "4",
    name: "Canvas Sneakers",
    image: "/placeholder.svg?height=50&width=50",
    inventory: 6,
    daysSinceLastSale: 31,
    price: 59.99,
  },
  {
    id: "5",
    name: "Printed Silk Scarf",
    image: "/placeholder.svg?height=50&width=50",
    inventory: 15,
    daysSinceLastSale: 52,
    price: 34.99,
  },
]

