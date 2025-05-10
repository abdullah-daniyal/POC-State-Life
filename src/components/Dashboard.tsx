"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import Header from "./Header"
import DataSummary from "./DataSummary"
import InsuranceDistribution from "./charts/InsuranceDistribution"
import ZoneDistribution from "./charts/ZoneDistribution"
import QueryStatusDistribution from "./charts/QueryStatusDistribution"
import InsuranceByTimeOfDay from "./charts/InsuranceByTimeOfDay"
import SimplifiedTimeDistribution from "./charts/SimplifiedTimeDistribution"
import RegionCityFilter from "./filters/RegionCityFilter"
import DateFilter from "./filters/DateFilter"
import Loader from "./Loader"
import {
  parseCSVData,
  getTimeOfDayDistribution,
  getZoneStatusDistribution,
  getStatusDistribution,
  getNatureOfComplaintsDistribution,
  getSimplifiedTimeDistribution,
} from "../utils/dataProcessing"
import { isToday, isWithinPastDays, getDateRangeText } from "../utils/dateUtils"
import type { InsuranceCall } from "../types"

// Default auto-refresh interval in milliseconds (5 minutes)
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000

const Dashboard: React.FC = () => {
  const [data, setData] = useState<InsuranceCall[]>([])
  const [filteredData, setFilteredData] = useState<InsuranceCall[]>([])
  const [regionFilteredData, setRegionFilteredData] = useState<InsuranceCall[]>([])
  const [dateFilter, setDateFilter] = useState<"today" | "past30days" | "all">("all") // Changed default to "all"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_INTERVAL)
  const [nextRefreshIn, setNextRefreshIn] = useState(refreshInterval)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch data function
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      const result = await parseCSVData()

      if (result.length === 0) {
        throw new Error("No data returned from the source")
      }

      setData(result)
      setLastRefreshed(new Date())

      // Apply initial filter (all data since we changed the default)
      setRegionFilteredData(result)
      setFilteredData(result)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please check if the Google Sheet is published and accessible.")
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh setup
  useEffect(() => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // Set up new intervals if auto-refresh is enabled
    if (autoRefreshEnabled) {
      // Set up the data refresh interval
      intervalRef.current = setInterval(() => {
        fetchData(false) // Don't show loading indicator for auto-refresh
        setNextRefreshIn(refreshInterval) // Reset countdown
      }, refreshInterval)

      // Set up countdown timer (updates every second)
      setNextRefreshIn(refreshInterval)
      countdownIntervalRef.current = setInterval(() => {
        setNextRefreshIn((prev) => Math.max(0, prev - 1000))
      }, 1000)
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [autoRefreshEnabled, refreshInterval, fetchData])

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => !prev)
  }, [])

  // Change refresh interval
  const changeRefreshInterval = useCallback((minutes: number) => {
    const newInterval = minutes * 60 * 1000
    setRefreshInterval(newInterval)
    setNextRefreshIn(newInterval)
  }, [])

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await fetchData(true)
    // Reset the countdown timer after manual refresh
    if (autoRefreshEnabled) {
      setNextRefreshIn(refreshInterval)
    }
  }, [fetchData, autoRefreshEnabled, refreshInterval])

  // Apply date filter to the region-filtered data
  useEffect(() => {
    if (dateFilter === "all") {
      setFilteredData(regionFilteredData)
      return
    }

    const dateFiltered = regionFilteredData.filter((call) => {
      const callDate = new Date(call.dateTime)
      if (dateFilter === "today") {
        return isToday(callDate)
      } else if (dateFilter === "past30days") {
        return isWithinPastDays(callDate, 30)
      }
      return true
    })

    setFilteredData(dateFiltered)
  }, [dateFilter, regionFilteredData])

  // Handle region/city filter changes
  const handleRegionFilterChange = useCallback((newFilteredData: InsuranceCall[]) => {
    setRegionFilteredData(newFilteredData)
  }, [])

  // Handle date filter changes
  const handleDateFilterChange = useCallback((filter: "today" | "past30days" | "all") => {
    setDateFilter(filter)
  }, [])

  const complaintDistribution = React.useMemo(() => {
    if (!filteredData.length) return null
    const { labels, data: counts } = getNatureOfComplaintsDistribution(filteredData)

    // Generate distinct colors for each complaint type
    const distinctColors = [
      "rgba(255, 99, 132, 0.7)", // Red
      "rgba(54, 162, 235, 0.7)", // Blue
      "rgba(255, 206, 86, 0.7)", // Yellow
      "rgba(75, 192, 192, 0.7)", // Teal
      "rgba(153, 102, 255, 0.7)", // Purple
      "rgba(255, 159, 64, 0.7)", // Orange
      "rgba(29, 209, 161, 0.7)", // Green
      "rgba(238, 90, 36, 0.7)", // Bright Orange
      "rgba(106, 137, 204, 0.7)", // Soft Blue
      "rgba(241, 196, 15, 0.7)", // Amber
    ]

    const distinctBorderColors = [
      "rgba(255, 99, 132, 1)", // Red
      "rgba(54, 162, 235, 1)", // Blue
      "rgba(255, 206, 86, 1)", // Yellow
      "rgba(75, 192, 192, 1)", // Teal
      "rgba(153, 102, 255, 1)", // Purple
      "rgba(255, 159, 64, 1)", // Orange
      "rgba(29, 209, 161, 1)", // Green
      "rgba(238, 90, 36, 1)", // Bright Orange
      "rgba(106, 137, 204, 1)", // Soft Blue
      "rgba(241, 196, 15, 1)", // Amber
    ]

    // Ensure we have enough colors for all complaint types
    const backgroundColors = labels.map((_, i) => distinctColors[i % distinctColors.length])
    const borderColors = labels.map((_, i) => distinctBorderColors[i % distinctBorderColors.length])

    return {
      labels,
      datasets: [
        {
          label: "Count",
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    }
  }, [filteredData])

  const timeOfDayData = React.useMemo(
    () => (filteredData.length ? getTimeOfDayDistribution(filteredData) : null),
    [filteredData],
  )

  const simplifiedTimeData = React.useMemo(
    () => (filteredData.length ? getSimplifiedTimeDistribution(filteredData) : null),
    [filteredData],
  )

  const zoneData = React.useMemo(
    () => (filteredData.length ? getZoneStatusDistribution(filteredData) : null),
    [filteredData],
  )

  const statusDistribution = React.useMemo(() => {
    if (!filteredData.length) return null
    const { labels, data: counts } = getStatusDistribution(filteredData)
    return {
      labels,
      datasets: [
        {
          label: "Status",
          data: counts,
          backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 99, 132, 0.7)"],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    }
  }, [filteredData])

  // Format the countdown timer
  const formatCountdown = (ms: number) => {
    if (!autoRefreshEnabled) return "Auto-refresh disabled"

    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Show loader while data is being fetched
  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-xl font-semibold mb-4">Error Loading Data</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="text-gray-700 mb-6">
            <h3 className="font-medium mb-2">To connect to Google Sheets:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your Google Sheet</li>
              <li>Go to File &gt; Share &gt; Publish to web</li>
              <li>Select "Entire Document" and "CSV" format</li>
              <li>Click "Publish" and confirm</li>
              <li>Make sure the sheet is also shared (viewable by anyone with the link)</li>
              <li>Check that the URL is correct and the file exists</li>
            </ol>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
            <p className="text-yellow-800 text-sm mb-2">
              <strong>Note:</strong> The current Google Sheets URL appears to be inaccessible. Please verify the sharing
              settings and URL.
            </p>
            <p className="text-yellow-800 text-sm">
              <strong>Required column headers:</strong> DateTime, PhoneNumber, NatureOfCall, PolicyNo, Zone, Status
            </p>
          </div>
          <button
            onClick={refreshData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          onRefresh={refreshData}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={toggleAutoRefresh}
          refreshInterval={refreshInterval / (60 * 1000)} // Convert to minutes
          onChangeRefreshInterval={changeRefreshInterval}
          nextRefreshIn={formatCountdown(nextRefreshIn)}
          lastRefreshed={lastRefreshed}
        />

        <div className="mt-8">
          {/* Date filter */}
          <DateFilter dateFilter={dateFilter} onDateFilterChange={handleDateFilterChange} />

          {/* Region/City filter */}
          <RegionCityFilter data={data} onFilterChange={handleRegionFilterChange} />

          {/* Date range info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <span className="text-blue-800 font-medium">Showing data for: {getDateRangeText(dateFilter)}</span>
          </div>

          {filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
              <div className="text-gray-500 text-lg">No data available for the selected filters</div>
              <button
                onClick={() => {
                  setDateFilter("all")
                  // Reset region filter by passing all data
                  handleRegionFilterChange(data)
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <DataSummary data={filteredData} />

              {/* Complaint Type Distribution (full width) */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {complaintDistribution && <InsuranceDistribution chartData={complaintDistribution} />}
              </div>

              {/* Query Status Distribution (full width) - Removed CallsTimeOfDay */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {statusDistribution && <QueryStatusDistribution chartData={statusDistribution} />}
              </div>

              {/* Call Distribution by Time (full width) */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {simplifiedTimeData && <SimplifiedTimeDistribution timeData={simplifiedTimeData} />}
              </div>

              {/* Complaint Types by Time of Day (full width) */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <InsuranceByTimeOfDay data={filteredData} />
              </div>

              {/* Query Status by Zone (full width) */}
              <div className="grid grid-cols-1 gap-6 mb-6">{zoneData && <ZoneDistribution zoneData={zoneData} />}</div>
            </>
          )}
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Insurance Call Analytics Dashboard • Data Visualization Project • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard
