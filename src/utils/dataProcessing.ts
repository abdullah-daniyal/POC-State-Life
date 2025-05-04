import type { InsuranceCall, TimeOfDayData, ZoneData, SimplifiedTimeData } from "../types"
import { csvData } from "../data/insuranceCalls"

// Function to fetch data from Google Sheets
export const parseCSVData = async (): Promise<InsuranceCall[]> => {
  try {
    // Google Sheets ID from the URL
    // const sheetId = "1Sg7UHLUJmufu4vbixurVCAFqkDOF0J4nf0KeNHL-JDI"

    // Fetch the sheet as CSV
    // Note: This requires the sheet to be published to the web as CSV
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/e/2PACX-1vSDm7dw5fVfXXoppmPUfLZiOpoovL-sDDJtZL4xQyGVFk8wEdwAXdPvFIhvEY_5xAkqsqWOfV39NpFa/pub?gid=171725172&single=true&output=csv`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n")

    // Skip the header row
    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        // Handle CSV parsing properly (considering quoted values)
        const values = parseCSVLine(line)

        if (values.length < 6) return null // Skip incomplete rows

        // Parse the date and time
        const dateTimeStr = values[0]
        let formattedDateTime = dateTimeStr

        // Handle different date formats
        if (dateTimeStr.includes("-")) {
          const [datePart, timePart] = dateTimeStr.split("-")
          if (datePart.includes("/")) {
            const [day, month, year] = datePart.split("/")
            // Format as ISO date string for proper Date parsing
            formattedDateTime = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart || "00:00"}:00`
          }
        }

        return {
          dateTime: formattedDateTime,
          phoneNumber: values[1],
          insurance: values[2], // Nature of Complaints
          policyNo: values[3],
          zone: values[4],
          status: values[5],
        }
      })
      .filter((item): item is InsuranceCall => item !== null)
  } catch (error) {
    console.error("Error fetching or parsing data:", error)
    // Fallback to the hardcoded data if fetching fails
    return fallbackParseCSVData()
  }
}

// Helper function to parse CSV lines properly (handling quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add the last field
  result.push(current.trim())
  return result
}

// Fallback function using hardcoded data
const fallbackParseCSVData = (): InsuranceCall[] => {
  // Your existing hardcoded data parsing logic
  const lines = csvData.split("\n")

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseCSVLine(line)

      if (values.length < 6) return null // Skip incomplete rows

      // Parse the date and time
      const dateTimeStr = values[0]
      let formattedDateTime = dateTimeStr

      // Handle different date formats
      if (dateTimeStr.includes("-")) {
        const [datePart, timePart] = dateTimeStr.split("-")
        if (datePart.includes("/")) {
          const [day, month, year] = datePart.split("/")
          // Format as ISO date string for proper Date parsing
          formattedDateTime = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart || "00:00"}:00`
        }
      }

      return {
        dateTime: formattedDateTime,
        phoneNumber: values[1],
        insurance: values[2], // Nature of Complaints
        policyNo: values[3],
        zone: values[4],
        status: values[5],
      }
    })
    .filter((item): item is InsuranceCall => item !== null)
}

export const getInsuranceDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {}

  data.forEach((call) => {
    distribution[call.insurance] = (distribution[call.insurance] || 0) + 1
  })

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  }
}

// Update the getZoneStatusDistribution function to properly handle all zones
export const getZoneStatusDistribution = (data: InsuranceCall[]): ZoneData => {
  const distribution: ZoneData = {}

  data.forEach((call) => {
    // Make sure we have a valid zone
    const zone = call.zone.trim() || "Unknown"

    if (!distribution[zone]) {
      distribution[zone] = {
        total: 0,
        closed: 0,
        referred: 0,
      }
    }

    distribution[zone].total += 1

    // Normalize status values to handle any case variations
    const status = call.status.trim()
    if (status.toLowerCase() === "query_closed") {
      distribution[zone].closed += 1
    } else if (status.toLowerCase() === "query_referred") {
      distribution[zone].referred += 1
    }
  })

  return distribution
}

// Update the getStatusDistribution function to avoid duplicates
export const getStatusDistribution = (data: InsuranceCall[]) => {
  // Initialize with the two expected statuses
  const distribution: Record<string, number> = {
    "Query Closed": 0,
    "Query Referred": 0,
  }

  data.forEach((call) => {
    const status = call.status.trim()
    if (status.toLowerCase() === "query_closed") {
      distribution["Query Closed"] += 1
    } else if (status.toLowerCase() === "query_referred") {
      distribution["Query Referred"] += 1
    }
  })

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  }
}

export const getTimeOfDayDistribution = (data: InsuranceCall[]): TimeOfDayData => {
  const distribution: TimeOfDayData = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
  }

  data.forEach((call) => {
    const date = new Date(call.dateTime)
    const hour = date.getHours()

    if (hour >= 5 && hour < 12) {
      distribution.Morning += 1
    } else if (hour >= 12 && hour < 17) {
      distribution.Afternoon += 1
    } else if (hour >= 17 && hour < 21) {
      distribution.Evening += 1
    } else {
      distribution.Night += 1
    }
  })

  return distribution
}

// New function for simplified time distribution (Morning: 8 AM - 4:59 PM, Evening: 5 PM - 12 AM)
export const getSimplifiedTimeDistribution = (data: InsuranceCall[]): SimplifiedTimeData => {
  const distribution: SimplifiedTimeData = {
    Morning: 0, // 8 AM - 4:59 PM
    Evening: 0, // 5 PM - 12 AM
  }

  data.forEach((call) => {
    const date = new Date(call.dateTime)
    const hour = date.getHours()

    if (hour >= 8 && hour < 17) {
      distribution.Morning += 1
    } else if ((hour >= 17 && hour <= 23) || hour === 0) {
      distribution.Evening += 1
    }
    // Note: Calls between 12 AM - 8 AM are not counted in this distribution
  })

  return distribution
}

export const getNatureOfComplaintsDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {}

  data.forEach((call) => {
    distribution[call.insurance] = (distribution[call.insurance] || 0) + 1
  })

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  }
}
