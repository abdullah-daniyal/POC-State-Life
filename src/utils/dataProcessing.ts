import type { InsuranceCall, TimeOfDayData, ZoneData, SimplifiedTimeData } from "../types"
import { csvData } from "../data/insuranceCalls"

// Function to fetch data from Google Sheets
export const parseCSVData = async (): Promise<InsuranceCall[]> => {
  try {
    // Fetch the sheet as CSV
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/e/2PACX-1vQOUJvjJQe0qxRhYvRiXBGM9UwUE73Mpl-o7W0xdrZPxHA960-wZtgZg3LKLQPr7qchONmBboJhKz6Z/pub?gid=171725172&single=true&output=csv`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    const lines = csvText.split("\n")

    if (lines.length === 0) {
      throw new Error("CSV data is empty")
    }

    // Get the header row to map column indices
    const headerRow = parseCSVLine(lines[0])

    // Map column names to indices
    const columnMap = {
      dateTime: headerRow.findIndex((col) => col.trim().toLowerCase() === "datetime"),
      phoneNumber: headerRow.findIndex((col) => col.trim().toLowerCase() === "phonenumber"),
      insurance: headerRow.findIndex((col) => col.trim().toLowerCase() === "natureofcall"),
      policyNo: headerRow.findIndex((col) => col.trim().toLowerCase() === "policyno"),
      zone: headerRow.findIndex((col) => col.trim().toLowerCase() === "zone"),
      status: headerRow.findIndex((col) => col.trim().toLowerCase() === "status"),
    }

    // Validate that all required columns exist
    const missingColumns = Object.entries(columnMap)
      .filter(([_, index]) => index === -1)
      .map(([key]) => key)

    if (missingColumns.length > 0) {
      console.error("Missing columns in CSV:", missingColumns)
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
    }

    // Skip the header row
    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        // Handle CSV parsing properly (considering quoted values)
        const values = parseCSVLine(line)

        if (values.length < 6) return null // Skip incomplete rows

        // Parse the date and time - FORMAT: "13-Dec-26 13:56"
        const dateTimeStr = values[columnMap.dateTime]
        let formattedDateTime = dateTimeStr

        try {
          // Handle the format "13-Dec-26 13:56"
          if (dateTimeStr.includes("-") && dateTimeStr.includes(" ")) {
            const date = new Date(dateTimeStr)
            if (!isNaN(date.getTime())) {
              formattedDateTime = date.toISOString()
            }
          }
        } catch (error) {
          console.error("Error parsing date:", dateTimeStr, error)
          // Keep the original string if parsing fails
        }

        return {
          dateTime: formattedDateTime,
          phoneNumber: values[columnMap.phoneNumber],
          insurance: values[columnMap.insurance], // NatureOfCall
          policyNo: values[columnMap.policyNo],
          zone: values[columnMap.zone],
          status: values[columnMap.status],
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

// Update the fallbackParseCSVData function to use the same column mapping approach
const fallbackParseCSVData = (): InsuranceCall[] => {
  const lines = csvData.split("\n")

  if (lines.length === 0) {
    return []
  }

  // Get the header row to map column indices
  const headerRow = parseCSVLine(lines[0])

  // Map column names to indices
  const columnMap = {
    dateTime: headerRow.findIndex((col) => col.trim().toLowerCase() === "datetime"),
    phoneNumber: headerRow.findIndex((col) => col.trim().toLowerCase() === "phonenumber"),
    insurance: headerRow.findIndex((col) => col.trim().toLowerCase() === "natureofcall"),
    policyNo: headerRow.findIndex((col) => col.trim().toLowerCase() === "policyno"),
    zone: headerRow.findIndex((col) => col.trim().toLowerCase() === "zone"),
    status: headerRow.findIndex((col) => col.trim().toLowerCase() === "status"),
  }

  // If headers aren't found, use default indices
  const defaultColumnMap = {
    dateTime: 0,
    phoneNumber: 1,
    insurance: 2,
    policyNo: 3,
    zone: 4,
    status: 5,
  }

  // Use the mapped indices if found, otherwise use defaults
  const finalColumnMap = {
    dateTime: columnMap.dateTime !== -1 ? columnMap.dateTime : defaultColumnMap.dateTime,
    phoneNumber: columnMap.phoneNumber !== -1 ? columnMap.phoneNumber : defaultColumnMap.phoneNumber,
    insurance: columnMap.insurance !== -1 ? columnMap.insurance : defaultColumnMap.insurance,
    policyNo: columnMap.policyNo !== -1 ? columnMap.policyNo : defaultColumnMap.policyNo,
    zone: columnMap.zone !== -1 ? columnMap.zone : defaultColumnMap.zone,
    status: columnMap.status !== -1 ? columnMap.status : defaultColumnMap.status,
  }

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseCSVLine(line)

      if (values.length < 6) return null // Skip incomplete rows

      // Parse the date and time - FORMAT: "13-Dec-26 13:56"
      const dateTimeStr = values[finalColumnMap.dateTime]
      let formattedDateTime = dateTimeStr

      try {
        // Handle the format "13-Dec-26 13:56"
        if (dateTimeStr.includes("-") && dateTimeStr.includes(" ")) {
          const date = new Date(dateTimeStr)
          if (!isNaN(date.getTime())) {
            formattedDateTime = date.toISOString()
          }
        }
      } catch (error) {
        console.error("Error parsing date:", dateTimeStr, error)
        // Keep the original string if parsing fails
      }

      return {
        dateTime: formattedDateTime,
        phoneNumber: values[finalColumnMap.phoneNumber],
        insurance: values[finalColumnMap.insurance], // NatureOfCall
        policyNo: values[finalColumnMap.policyNo],
        zone: values[finalColumnMap.zone],
        status: values[finalColumnMap.status],
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

// Update the getSimplifiedTimeDistribution function with new time ranges
export const getSimplifiedTimeDistribution = (data: InsuranceCall[]): SimplifiedTimeData => {
  const distribution: SimplifiedTimeData = {
    Morning: 0, // 08:00 - 15:59
    Evening: 0, // 16:00 - 00:00
  }

  data.forEach((call) => {
    const date = new Date(call.dateTime)
    const hour = date.getHours()

    if (hour >= 8 && hour < 16) {
      distribution.Morning += 1
    } else if (hour >= 16 && hour <= 23) {
      distribution.Evening += 1
    }
    // Note: Calls between 00:01 - 07:59 are not counted in this distribution
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
