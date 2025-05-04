/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  
  /**
   * Check if a date is within the past N days
   */
  export const isWithinPastDays = (date: Date, days: number): boolean => {
    const now = new Date()
    const pastDate = new Date(now)
    pastDate.setDate(pastDate.getDate() - days)
    return date >= pastDate && date <= now
  }
  
  /**
   * Format a date as a readable string
   */
  export const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  /**
   * Get a readable date range string
   */
  export const getDateRangeText = (filter: "today" | "past30days" | "all"): string => {
    const today = new Date()
  
    switch (filter) {
      case "today":
        return `Today (${formatDate(today)})`
      case "past30days": {
        const pastDate = new Date(today)
        pastDate.setDate(pastDate.getDate() - 30)
        return `Past 30 Days (${formatDate(pastDate)} - ${formatDate(today)})`
      }
      case "all":
        return "All Time"
      default:
        return ""
    }
  }
  