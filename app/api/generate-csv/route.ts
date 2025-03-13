import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import Papa from "papaparse"
import { supabaseAdmin } from "@/lib/supabase-admin"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Required environment variables are missing')
}

export async function GET(request: Request) {
  try {
    // Regular client for auth checks
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Log the start of CSV generation using admin client
    await supabaseAdmin.from("logs").insert({
      id: uuidv4(),
      event: "CSV Generation Started",
      details: "Starting to generate Shopify CSV",
      status: "info",
    })

    // Get products from database using admin client
    const { data: products, error } = await supabaseAdmin.from("products").select("*").eq("exported", false)

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    if (!products || products.length === 0) {
      await supabaseAdmin.from("logs").insert({
        id: uuidv4(),
        event: "CSV Generation Completed",
        details: "No new products to export",
        status: "info",
      })

      return NextResponse.json({ message: "No new products to export" }, { status: 200 })
    }

    // Transform products to Shopify CSV format
    const csvData = transformProductsToShopifyCsv(products)

    // Generate CSV
    const csv = Papa.unparse(csvData)

    // Mark products as exported using admin client
    const productIds = products.map((p) => p.id)
    await supabaseAdmin.from("products").update({ exported: true }).in("id", productIds)

    // Log completion using admin client
    await supabaseAdmin.from("logs").insert({
      id: uuidv4(),
      event: "CSV Generation Completed",
      details: `Successfully generated CSV with ${products.length} products`,
      status: "success",
    })

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="shopify-products-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV generation error:", error)

    // Log error using admin client
    try {
      await supabaseAdmin.from("logs").insert({
        id: uuidv4(),
        event: "CSV Generation Error",
        details: `Error generating CSV: ${error instanceof Error ? error.message : String(error)}`,
        status: "error",
      })
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json(
      { error: "Failed to generate CSV", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

function transformProductsToShopifyCsv(products: any[]) {
  // Transform products to match Shopify CSV format
  return products.map((product) => {
    return {
      Title: product.title || "",
      "URL handle": createUrlHandle(product.title),
      Description: product.description || "",
      Vendor: product.vendor || "",
      "Product category": product.product_type || "Apparel & Accessories > Clothing",
      Type: product.product_type || "",
      Tags: createTags(product),
      "Published on online store": "TRUE",
      Status: "active",
      SKU: product.sku || "",
      Barcode: product.barcode || "",
      "Option1 name": "Title",
      "Option1 value": "Default",
      "Option2 name": "",
      "Option2 value": "",
      "Option3 name": "",
      "Option3 value": "",
      Price: product.price || "0",
      "Price / International": "",
      "Compare-at price": "",
      "Compare-at price / International": "",
      "Cost per item": "",
      "Charge tax": "TRUE",
      "Tax code": "",
      "Inventory tracker": "shopify",
      "Inventory quantity": "100",
      "Continue selling when out of stock": "FALSE",
      "Weight value (grams)": "0",
      "Weight unit for display": "g",
      "Requires shipping": "TRUE",
      "Fulfillment service": "manual",
      "Product image URL": product.image_url || "",
      "Image position": "1",
      "Image alt text": product.title || "",
      "Variant image URL": "",
      "Gift card": "FALSE",
      "SEO title": product.title || "",
      "SEO description": truncate(product.description, 320) || "",
      "Google Shopping / Google product category": product.product_type || "Apparel & Accessories > Clothing",
      "Google Shopping / Gender": "Unisex",
      "Google Shopping / Age group": "Adult",
      "Google Shopping / MPN": product.sku || "",
      "Google Shopping / AdWords Grouping": product.product_type || "",
      "Google Shopping / AdWords labels": "",
      "Google Shopping / Condition": "new",
      "Google Shopping / Custom product": "FALSE",
      "Google Shopping / Custom label 0": "",
      "Google Shopping / Custom label 1": "",
      "Google Shopping / Custom label 2": "",
      "Google Shopping / Custom label 3": "",
      "Google Shopping / Custom label 4": "",
    }
  })
}

function createUrlHandle(title: string) {
  if (!title) return ""
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100)
}

function createTags(product: any) {
  const tags = []
  if (product.product_type) tags.push(product.product_type)
  if (product.vendor) tags.push(product.vendor)
  // Add more tag logic as needed
  return tags.join(", ")
}

function truncate(str: string, maxLength: number) {
  if (!str) return ""
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str
}

