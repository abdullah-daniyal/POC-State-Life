import type React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import type { InsuranceCall } from "../../types"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface InsuranceByTimeOfDayProps {
  data: InsuranceCall[]
}

// Update the InsuranceByTimeOfDay component to use only Morning and Evening time slots
const InsuranceByTimeOfDay: React.FC<InsuranceByTimeOfDayProps> = ({ data }) => {
  // Check if data is null or undefined
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Types by Time of Day</h2>
        <div className="w-full h-[300px] md:h-[350px] flex items-center justify-center">
          <p className="text-gray-500">No query type data available</p>
        </div>
      </div>
    )
  }

  // Updated to use only Morning and Evening
  const timeSlots = ["Morning", "Evening"]
  const complaintTypes = [...new Set(data.map((call) => call.insurance))]

  // Updated time of day function to match the new requirements
  const getTimeOfDay = (hour: number): string => {
    if (hour >= 8 && hour < 16) return "Morning" // 08:00 - 15:59
    return "Evening" // 16:00 - 00:00
  }

  const distribution: Record<string, Record<string, number>> = {}
  complaintTypes.forEach((complaint) => {
    distribution[complaint] = {
      Morning: 0,
      Evening: 0,
    }
  })

  data.forEach((call) => {
    const date = new Date(call.dateTime)
    const hour = date.getHours()

    // Only count calls between 8:00 and 00:00
    if (hour >= 8 && hour <= 23) {
      const timeSlot = getTimeOfDay(hour)
      distribution[call.insurance][timeSlot]++
    }
  })

  // Generate colors for each complaint type
  const colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(29, 209, 161, 0.8)",
    "rgba(238, 90, 36, 0.8)",
  ]

  const borderColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(29, 209, 161, 1)",
    "rgba(238, 90, 36, 1)",
  ]

  const datasets = complaintTypes.map((complaint, index) => ({
    label: complaint,
    data: timeSlots.map((slot) => distribution[complaint][slot]),
    backgroundColor: colors[index % colors.length],
    borderColor: borderColors[index % borderColors.length],
    borderWidth: 1,
  }))

  const chartData = {
    labels: timeSlots,
    datasets,
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Types by Time of Day</h2>

      {/* Add a note about the time slots */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Morning:</span> 08:00 - 15:59 |
          <span className="font-medium ml-2">Evening:</span> 16:00 - 00:00
        </div>
      </div>

      <div className="w-full h-[300px] md:h-[350px]">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                align: "start",
                labels: {
                  boxWidth: 15,
                  boxHeight: 15,
                  padding: 15,
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                titleFont: {
                  size: 14,
                },
                bodyFont: {
                  size: 12,
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
              y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  font: {
                    size: 12,
                  },
                },
              },
            },
            layout: {
              padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              },
            },
            animation: {
              duration: 1500,
            },
          }}
        />
      </div>
    </div>
  )
}

export default InsuranceByTimeOfDay
