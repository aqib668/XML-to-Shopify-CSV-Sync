"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fetchLowInventoryProducts } from "@/lib/shopify-api"

interface Product {
  id: string
  name: string
  sku: string
  inventory: number
  image: string
}

export function InventoryAlerts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLowInventoryProducts() {
      try {
        setLoading(true)
        // This function will use the Shopify API to fetch real data
        const data = await fetchLowInventoryProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch low inventory products:", err)
        setError("Failed to load inventory data. Please check your Shopify connection.")
        // Fallback to empty array if there's an error
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadLowInventoryProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading inventory data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No low inventory products found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                SKU: {product.sku} | {product.inventory} in stock
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/products/${product.id}`}>View</Link>
          </Button>
        </div>
      ))}
    </div>
  )
}

