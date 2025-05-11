import { useState, useEffect, useCallback, useRef } from "react"
import { parseCSVData } from "../utils/dataProcessing"
import type { InsuranceCall } from "../types"

// Get refresh interval from localStorage or use default (1 minute)
const getStoredInterval = (): number => {
  const stored = localStorage.getItem("refreshInterval")
  return stored ? parseInt(stored, 10) * 60 * 1000 : 60 * 1000 // Convert minutes to milliseconds
}

// Get auto-refresh enabled state from localStorage or use default (true)
const getStoredAutoRefresh = (): boolean => {
  const stored = localStorage.getItem("autoRefreshEnabled")
  return stored ? stored === "true" : true
}

// Cache key for storing the last successful response
const CACHE_KEY = "insuranceDataCache"
const CACHE_TIMESTAMP_KEY = "insuranceDataTimestamp"

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

interface CachedData {
  data: InsuranceCall[]
  timestamp: number
}

export const useDataRefresh = () => {
  const [data, setData] = useState<InsuranceCall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(getStoredAutoRefresh)
  const [refreshInterval, setRefreshInterval] = useState(getStoredInterval)
  const [nextRefreshIn, setNextRefreshIn] = useState(refreshInterval)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fetchingRef = useRef(false)

  // Load cached data
  const loadCachedData = useCallback((): CachedData | null => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10)
        if (Date.now() - timestamp < CACHE_DURATION) {
          return {
            data: JSON.parse(cachedData),
            timestamp,
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error loading cached data:", error)
      return null
    }
  }, [])

  // Save data to cache
  const saveToCache = useCallback((newData: InsuranceCall[]) => {
    try {
      const timestamp = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify(newData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString())
    } catch (error) {
      console.error("Error saving data to cache:", error)
    }
  }, [])

  // Fetch data function with debouncing and caching
  const fetchData = useCallback(async (showLoading = true, bypassCache = false) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return null
    }

    try {
      fetchingRef.current = true

      // Check cache first unless bypassing
      if (!bypassCache) {
        const cached = loadCachedData()
        if (cached) {
          setData(cached.data)
          setLastRefreshed(new Date(cached.timestamp))
          return cached.data
        }
      }

      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const result = await parseCSVData()

      if (!result || result.length === 0) {
        throw new Error("No data returned from the source")
      }

      // Update state and cache
      setData(result)
      setLastRefreshed(new Date())
      saveToCache(result)

      return result
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please check if the Google Sheet is published and accessible.")
      
      // Try to load cached data as fallback
      const cached = loadCachedData()
      if (cached) {
        setData(cached.data)
        setLastRefreshed(new Date(cached.timestamp))
        return cached.data
      }
      
      return null
    } finally {
      if (showLoading) {
        setLoading(false)
      }
      fetchingRef.current = false
    }
  }, [loadCachedData, saveToCache])

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("autoRefreshEnabled", String(newValue))
      return newValue
    })
  }, [])

  // Change refresh interval
  const changeRefreshInterval = useCallback((minutes: number) => {
    const newInterval = minutes * 60 * 1000
    setRefreshInterval(newInterval)
    setNextRefreshIn(newInterval)
    localStorage.setItem("refreshInterval", String(minutes))
  }, [])

  // Manual refresh function
  const refreshData = useCallback(async () => {
    const result = await fetchData(true, true) // Force bypass cache on manual refresh
    if (autoRefreshEnabled) {
      setNextRefreshIn(refreshInterval)
    }
    return result
  }, [fetchData, autoRefreshEnabled, refreshInterval])

  // Set up auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        fetchData(false) // Don't show loading indicator for auto-refresh
        setNextRefreshIn(refreshInterval)
      }, refreshInterval)

      setNextRefreshIn(refreshInterval)
      countdownIntervalRef.current = setInterval(() => {
        setNextRefreshIn((prev) => Math.max(0, prev - 1000))
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [autoRefreshEnabled, refreshInterval, fetchData])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    lastRefreshed,
    autoRefreshEnabled,
    refreshInterval: refreshInterval / (60 * 1000), // Convert back to minutes
    nextRefreshIn,
    toggleAutoRefresh,
    changeRefreshInterval,
    refreshData,
  }
}