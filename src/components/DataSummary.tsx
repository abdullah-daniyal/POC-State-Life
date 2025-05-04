import type React from "react"
import type { InsuranceCall } from "../types"

interface DataSummaryProps {
  data: InsuranceCall[]
}

const DataSummary: React.FC<DataSummaryProps> = ({ data }) => {
  // Calculate total calls
  const totalCalls = data.length

  // Count unique callers
  const uniqueCallers = new Set(data.map((call) => call.phoneNumber)).size

  // Get most common complaint type
  const complaintCounts: Record<string, number> = {}
  data.forEach((call) => {
    complaintCounts[call.insurance] = (complaintCounts[call.insurance] || 0) + 1
  })

  let mostCommonComplaint = ""
  let maxCount = 0

  Object.entries(complaintCounts).forEach(([complaint, count]) => {
    if (count > maxCount) {
      mostCommonComplaint = complaint
      maxCount = count
    }
  })

  // Calculate percentage
  const percentage = ((maxCount / totalCalls) * 100).toFixed(1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Total Calls</p>
        <p className="text-3xl font-bold text-gray-800">{totalCalls}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Unique Callers</p>
        <p className="text-3xl font-bold text-gray-800">{uniqueCallers}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Most Common Complaint</p>
        <p className="text-3xl font-bold text-gray-800">{mostCommonComplaint}</p>
        <p className="text-sm text-gray-500 mt-1">{percentage}% of all calls</p>
      </div>
    </div>
  )
}

export default DataSummary
