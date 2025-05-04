"use client"

import type React from "react"
import { Clock } from "lucide-react"

interface DateFilterProps {
  dateFilter: "today" | "past30days" | "all"
  onDateFilterChange: (filter: "today" | "past30days" | "all") => void
}

const DateFilter: React.FC<DateFilterProps> = ({ dateFilter, onDateFilterChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-800">Date Filter</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onDateFilterChange("today")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "today" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Clock className="h-4 w-4 mr-1" />
            Today's Status
          </button>

          <button
            onClick={() => onDateFilterChange("past30days")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "past30days" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Past 30 Days
          </button>

          <button
            onClick={() => onDateFilterChange("all")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateFilter
