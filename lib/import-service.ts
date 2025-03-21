// This file handles the import process and logging

import fs from "fs"
import path from "path"
import { parseXmlToProducts, convertProductsToCsv } from "./xml-to-csv"
import { findNewProducts } from "./shopify-api"

// Define the log entry interface
export interface ImportLog {
  id: string
  date: string
  source: string
  totalProducts: number
  newProducts: number
  status: "Completed" | "Failed" | "In Progress"
  csvFilename: string
  logFilename: string
  error?: string
}

// Process XML feed and generate CSV
export async function processXmlFeed(xmlUrl: string): Promise<ImportLog> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const csvFilename = `shopify-import-${timestamp}.csv`
  const logFilename = `import-log-${timestamp}.txt`

  // Create log entry
  const logEntry: ImportLog = {
    id: timestamp,
    date: new Date().toISOString(),
    source: xmlUrl,
    totalProducts: 0,
    newProducts: 0,
    status: "In Progress",
    csvFilename,
    logFilename,
  }

  try {
    // Log start of import
    await appendToLog(logFilename, `Import started at ${new Date().toISOString()}`)
    await appendToLog(logFilename, `Source: ${xmlUrl}`)

    // Fetch XML content
    await appendToLog(logFilename, "Fetching XML content...")
    const response = await fetch(xmlUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch XML: ${response.statusText}`)
    }
    const xmlContent = await response.text()

    // Parse XML to products
    await appendToLog(logFilename, "Parsing XML content...")
    const products = parseXmlToProducts(xmlContent)
    logEntry.totalProducts = products.length
    await appendToLog(logFilename, `Found ${products.length} products in XML feed`)

    // Find new products
    await appendToLog(logFilename, "Comparing with existing Shopify products...")
    const newProducts = await findNewProducts(products)
    logEntry.newProducts = newProducts.length
    await appendToLog(logFilename, `Found ${newProducts.length} new products`)

    // Convert products to CSV
    await appendToLog(logFilename, "Converting products to CSV format...")
    const csvContent = convertProductsToCsv(products)

    // Save CSV file
    await appendToLog(logFilename, `Saving CSV file as ${csvFilename}...`)
    const csvPath = path.join(process.cwd(), "data", "exports", csvFilename)
    fs.mkdirSync(path.dirname(csvPath), { recursive: true })
    fs.writeFileSync(csvPath, csvContent)

    // Update log entry
    logEntry.status = "Completed"
    await appendToLog(logFilename, `Import completed successfully at ${new Date().toISOString()}`)

    // Save log entry to database
    await saveImportLog(logEntry)

    return logEntry
  } catch (error) {
    // Handle error
    const errorMessage = error instanceof Error ? error.message : String(error)
    await appendToLog(logFilename, `ERROR: ${errorMessage}`)

    // Update log entry
    logEntry.status = "Failed"
    logEntry.error = errorMessage

    // Save log entry to database
    await saveImportLog(logEntry)

    throw error
  }
}

// Append message to log file
async function appendToLog(filename: string, message: string): Promise<void> {
  const logPath = path.join(process.cwd(), "data", "logs", filename)
  fs.mkdirSync(path.dirname(logPath), { recursive: true })

  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`

  fs.appendFileSync(logPath, logLine)
}

// Save import log to database
async function saveImportLog(log: ImportLog): Promise<void> {
  // In a real implementation, this would save to a database
  console.log("Saving import log:", log)

  // For now, we'll save to a JSON file
  const logsPath = path.join(process.cwd(), "data", "import-logs.json")

  let logs: ImportLog[] = []
  if (fs.existsSync(logsPath)) {
    const logsContent = fs.readFileSync(logsPath, "utf8")
    logs = JSON.parse(logsContent)
  }

  logs.unshift(log)
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2))
}

// Schedule imports based on settings
export async function scheduleImports(): Promise<void> {
  // This would be implemented with a cron job or similar
  // For now, we'll just log that it's been scheduled
  console.log("Scheduling imports based on settings")
}

