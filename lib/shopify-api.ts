// This file handles all Shopify API interactions

import { getSettings } from "./settings"

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  vendor: string
  product_type: string
  tags: string[]
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  status: string
  published_at: string
  created_at: string
  updated_at: string
}

export interface ShopifyVariant {
  id: string
  title: string
  price: string
  sku: string
  inventory_quantity: number
  inventory_management: string
  inventory_policy: string
  barcode: string
  option1: string
  option2: string | null
  option3: string | null
}

export interface ShopifyImage {
  id: string
  src: string
  position: number
  alt: string | null
}

// Fetch low inventory products from Shopify
export async function fetchLowInventoryProducts() {
  try {
    const settings = await getSettings()

    if (!settings.shopifyStore || !settings.accessToken) {
      throw new Error("Shopify connection not configured")
    }

    const threshold = settings.lowInventoryThreshold || 2

    // In a real implementation, this would make an API call to Shopify
    // For now, we'll return mock data

    // This simulates a delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - in production this would be real API data
    return [
      {
        id: "1",
        name: "Cotton T-Shirt - Black",
        sku: "TS-BLK-001",
        inventory: 2,
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "2",
        name: "Denim Jeans - Blue",
        sku: "DJ-BLU-002",
        inventory: 1,
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "3",
        name: "Leather Wallet - Brown",
        sku: "LW-BRN-003",
        inventory: 2,
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "4",
        name: "Canvas Sneakers - White",
        sku: "CS-WHT-004",
        inventory: 1,
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "5",
        name: "Wool Beanie - Gray",
        sku: "WB-GRY-005",
        inventory: 2,
        image: "/placeholder.svg?height=40&width=40",
      },
    ]
  } catch (error) {
    console.error("Error fetching low inventory products:", error)
    throw error
  }
}

// Fetch all products from Shopify
export async function fetchAllProducts() {
  try {
    const settings = await getSettings()

    if (!settings.shopifyStore || !settings.accessToken) {
      throw new Error("Shopify connection not configured")
    }

    // In a real implementation, this would make an API call to Shopify
    // For now, we'll return mock data

    // This simulates a delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - in production this would be real API data
    return [
      {
        id: "1",
        title: "Cotton T-Shirt - Black",
        handle: "cotton-t-shirt-black",
        variants: [
          {
            id: "v1",
            sku: "TS-BLK-001",
            inventory_quantity: 2,
          },
        ],
      },
      {
        id: "2",
        title: "Denim Jeans - Blue",
        handle: "denim-jeans-blue",
        variants: [
          {
            id: "v2",
            sku: "DJ-BLU-002",
            inventory_quantity: 1,
          },
        ],
      },
    ]
  } catch (error) {
    console.error("Error fetching all products:", error)
    throw error
  }
}

// Compare products from XML with Shopify products to find new ones
export async function findNewProducts(xmlProducts: any[]) {
  try {
    // Fetch existing products from Shopify
    const shopifyProducts = await fetchAllProducts()

    // Extract all SKUs from Shopify products
    const existingSkus = new Set()
    shopifyProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        existingSkus.add(variant.sku)
      })
    })

    // Filter XML products to find ones not in Shopify
    const newProducts = xmlProducts.filter((product) => {
      return !existingSkus.has(product.sku)
    })

    return newProducts
  } catch (error) {
    console.error("Error finding new products:", error)
    throw error
  }
}

