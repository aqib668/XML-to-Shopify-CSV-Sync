import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import { v4 as uuidv4 } from "uuid"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
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

    // Get request body
    const { xmlUrl } = await request.json()

    if (!xmlUrl) {
      return NextResponse.json({ error: "XML URL is required" }, { status: 400 })
    }

    // Use admin client for operations that need to bypass RLS
    await supabaseAdmin.from("logs").insert({
      id: uuidv4(),
      event: "Sync Started",
      details: `Starting sync from ${xmlUrl}`,
      status: "info",
    })

    // Fetch XML data
    const xmlResponse = await fetch(xmlUrl)
    if (!xmlResponse.ok) {
      throw new Error(`Failed to fetch XML: ${xmlResponse.statusText}`)
    }

    const xmlText = await xmlResponse.text()

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })
    const xmlData = parser.parse(xmlText)

    // Get existing SKUs from database
    const { data: existingProducts } = await supabaseAdmin.from("products").select("sku")

    const existingSkus = new Set(existingProducts?.map((p) => p.sku) || [])

    // Extract products from XML
    const products = extractProductsFromXml(xmlData)

    // Filter new products
    const newProducts = products.filter((product) => !existingSkus.has(product.sku))

    // Save new products to database
    if (newProducts.length > 0) {
      await supabaseAdmin.from("products").insert(
        newProducts.map((product) => ({
          id: uuidv4(),
          sku: product.sku,
          title: product.title,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          vendor: product.vendor,
          product_type: product.product_type,
          data: product,
        })),
      )
    }

    // Update sync status
    await supabaseAdmin.from("sync_status").insert({
      id: uuidv4(),
      status: "success",
      new_products_count: newProducts.length,
      message: `Sync completed. Found ${newProducts.length} new products.`,
    })

    // Log completion
    await supabaseAdmin.from("logs").insert({
      id: uuidv4(),
      event: "Sync Completed",
      details: `Sync completed successfully. Found ${newProducts.length} new products.`,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      newProducts: newProducts.length,
      message: `Sync completed. Found ${newProducts.length} new products.`,
    })
  } catch (error) {
    console.error("Sync error:", error)

    // Log error with admin client
    try {
      await supabaseAdmin.from("logs").insert({
        id: uuidv4(),
        event: "Sync Error",
        details: `Error during sync: ${error instanceof Error ? error.message : String(error)}`,
        status: "error",
      })

      await supabaseAdmin.from("sync_status").insert({
        id: uuidv4(),
        status: "error",
        new_products_count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
      })
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json(
      { error: "Failed to sync products", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

function extractProductsFromXml(xmlData: any) {
  // This function would need to be adapted to the specific XML structure
  // This is a placeholder implementation
  const products = []

  try {
    // Assuming a structure like <products><product>...</product></products>
    const productNodes = xmlData.products?.product || []
    const productArray = Array.isArray(productNodes) ? productNodes : [productNodes]

    for (const product of productArray) {
      if (product) {
        products.push({
          sku: product.sku || product.id || "",
          title: product.name || product.title || "",
          description: product.description || "",
          price: Number.parseFloat(product.price || "0"),
          image_url: product.image || product.image_url || "",
          vendor: product.vendor || product.brand || "",
          product_type: product.category || product.type || "",
          // Store the full product data for CSV generation
          raw: product,
        })
      }
    }
  } catch (error) {
    console.error("Error extracting products from XML:", error)
  }

  return products
}

