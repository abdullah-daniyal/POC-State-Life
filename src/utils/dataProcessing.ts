import type { InsuranceCall, TimeOfDayData, ZoneData, SimplifiedTimeData } from "../types";
import { csvData } from "../data/insuranceCalls";

// Month mapping for custom date format
const monthMap: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Function to parse custom DateTime format (e.g., "13-Jan-25 08:55")
function parseCustomDate(dateTimeStr: string): string {
  try {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, monthAbbr, year] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    const month = monthMap[monthAbbr];
    if (month === undefined) {
      throw new Error(`Invalid month abbreviation: ${monthAbbr}`);
    }

    // Assuming two-digit years are 2000-2099
    const fullYear = 2000 + parseInt(year, 10);
    const date = new Date(fullYear, month, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10));

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateTimeStr}`);
    }

    return date.toISOString();
  } catch (error) {
    console.error(`Error parsing date: ${dateTimeStr}`, error);
    return dateTimeStr; // Fallback to original string
  }
}

// Function to fetch and parse data from Google Sheets
export const parseCSVData = async (): Promise<InsuranceCall[]> => {
  try {
    // Add cache-busting query parameter
    const cacheBuster = `t=${Date.now()}`;
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQOUJvjJQe0qxRhYvRiXBGM9UwUE73Mpl-o7W0xdrZPxHA960-wZtgZg3LKLQPr7qchONmBboJhKz6Z/pub?gid=171725172&single=true&output=csv&${cacheBuster}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split("\n");

    if (lines.length === 0) {
      throw new Error("CSV data is empty");
    }

    // Get the header row to map column indices
    const headerRow = parseCSVLine(lines[0]);

    // Map column names to indices
    const columnMap = {
      dateTime: headerRow.findIndex((col) => col.trim().toLowerCase() === "datetime"),
      phoneNumber: headerRow.findIndex((col) => col.trim().toLowerCase() === "phonenumber"),
      insurance: headerRow.findIndex((col) => col.trim().toLowerCase() === "natureofcall"),
      policyNo: headerRow.findIndex((col) => col.trim().toLowerCase() === "policyno"),
      zone: headerRow.findIndex((col) => col.trim().toLowerCase() === "zone"),
      status: headerRow.findIndex((col) => col.trim().toLowerCase() === "status"),
    };

    // Validate that all required columns exist
    const missingColumns = Object.entries(columnMap)
      .filter(([_, index]) => index === -1)
      .map(([key]) => key);

    if (missingColumns.length > 0) {
      console.error("Missing columns in CSV:", missingColumns);
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Skip the header row
    const result = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = parseCSVLine(line);

        if (values.length < 6) return null; // Skip incomplete rows

        const dateTimeStr = values[columnMap.dateTime];
        const formattedDateTime = parseCustomDate(dateTimeStr);

        return {
          dateTime: formattedDateTime,
          phoneNumber: values[columnMap.phoneNumber],
          insurance: values[columnMap.insurance],
          policyNo: values[columnMap.policyNo],
          zone: values[columnMap.zone],
          status: values[columnMap.status],
        };
      })
      .filter((item): item is InsuranceCall => item !== null);

    if (result.length === 0) {
      throw new Error("No valid data rows found in CSV");
    }

    return result;
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
    throw error; // Let the caller handle the error
  }
};

// Helper function to parse CSV lines properly (handling quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
}

// Fallback parsing function for hardcoded data
export const fallbackParseCSVData = (): InsuranceCall[] => {
  const lines = csvData.split("\n");

  if (lines.length === 0) {
    return [];
  }

  // Get the header row to map column indices
  const headerRow = parseCSVLine(lines[0]);

  // Map column names to indices
  const columnMap = {
    dateTime: headerRow.findIndex((col) => col.trim().toLowerCase() === "datetime"),
    phoneNumber: headerRow.findIndex((col) => col.trim().toLowerCase() === "phonenumber"),
    insurance: headerRow.findIndex((col) => col.trim().toLowerCase() === "natureofcall"),
    policyNo: headerRow.findIndex((col) => col.trim().toLowerCase() === "policyno"),
    zone: headerRow.findIndex((col) => col.trim().toLowerCase() === "zone"),
    status: headerRow.findIndex((col) => col.trim().toLowerCase() === "status"),
  };

  // If headers aren't found, use default indices
  const defaultColumnMap = {
    dateTime: 0,
    phoneNumber: 1,
    insurance: 2,
    policyNo: 3,
    zone: 4,
    status: 5,
  };

  // Use the mapped indices if found, otherwise use defaults
  const finalColumnMap = {
    dateTime: columnMap.dateTime !== -1 ? columnMap.dateTime : defaultColumnMap.dateTime,
    phoneNumber: columnMap.phoneNumber !== -1 ? columnMap.phoneNumber : defaultColumnMap.phoneNumber,
    insurance: columnMap.insurance !== -1 ? columnMap.insurance : defaultColumnMap.insurance,
    policyNo: columnMap.policyNo !== -1 ? columnMap.policyNo : defaultColumnMap.policyNo,
    zone: columnMap.zone !== -1 ? columnMap.zone : defaultColumnMap.zone,
    status: columnMap.status !== -1 ? columnMap.status : defaultColumnMap.status,
  };

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseCSVLine(line);

      if (values.length < 6) return null; // Skip incomplete rows

      const dateTimeStr = values[finalColumnMap.dateTime];
      const formattedDateTime = parseCustomDate(dateTimeStr);

      return {
        dateTime: formattedDateTime,
        phoneNumber: values[finalColumnMap.phoneNumber],
        insurance: values[finalColumnMap.insurance],
        policyNo: values[finalColumnMap.policyNo],
        zone: values[finalColumnMap.zone],
        status: values[finalColumnMap.status],
      };
    })
    .filter((item): item is InsuranceCall => item !== null);
};

export const getInsuranceDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {};

  data.forEach((call) => {
    distribution[call.insurance] = (distribution[call.insurance] || 0) + 1;
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  };
};

export const getZoneStatusDistribution = (data: InsuranceCall[]): ZoneData => {
  const distribution: ZoneData = {};

  data.forEach((call) => {
    const zone = call.zone.trim() || "Unknown";

    if (!distribution[zone]) {
      distribution[zone] = {
        total: 0,
        closed: 0,
        referred: 0,
      };
    }

    distribution[zone].total += 1;

    const status = call.status.trim().toLowerCase();
    if (status === "query_closed") {
      distribution[zone].closed += 1;
    } else if (status === "query_referred") {
      distribution[zone].referred += 1;
    }
  });

  return distribution;
};

export const getStatusDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {
    "Query Closed": 0,
    "Query Referred": 0,
  };

  data.forEach((call) => {
    const status = call.status.trim().toLowerCase();
    if (status === "query_closed") {
      distribution["Query Closed"] += 1;
    } else if (status === "query_referred") {
      distribution["Query Referred"] += 1;
    }
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  };
};

export const getTimeOfDayDistribution = (data: InsuranceCall[]): TimeOfDayData => {
  const distribution: TimeOfDayData = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
  };

  data.forEach((call) => {
    const date = new Date(call.dateTime);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      distribution.Morning += 1;
    } else if (hour >= 12 && hour < 17) {
      distribution.Afternoon += 1;
    } else if (hour >= 17 && hour < 21) {
      distribution.Evening += 1;
    } else {
      distribution.Night += 1;
    }
  });

  return distribution;
};

export const getSimplifiedTimeDistribution = (data: InsuranceCall[]): SimplifiedTimeData => {
  const distribution: SimplifiedTimeData = {
    Morning: 0, // 08:00 - 15:59
    Evening: 0, // 16:00 - 00:00
  };

  data.forEach((call) => {
    const date = new Date(call.dateTime);
    const hour = date.getHours();

    if (hour >= 8 && hour < 16) {
      distribution.Morning += 1;
    } else if (hour >= 16 && hour <= 23) {
      distribution.Evening += 1;
    }
  });

  return distribution;
};

export const getNatureOfComplaintsDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {};

  data.forEach((call) => {
    distribution[call.insurance] = (distribution[call.insurance] || 0) + 1;
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution),
  };
};