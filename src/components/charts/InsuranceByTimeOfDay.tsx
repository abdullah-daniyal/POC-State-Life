import type React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import type { InsuranceCall } from "../../types"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface InsuranceByTimeOfDayProps {
  data: InsuranceCall[]
}

const InsuranceByTimeOfDay: React.FC<InsuranceByTimeOfDayProps> = ({ data }) => {
  // Check if data is null or undefined
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Complaint Types by Time of Day</h2>
        <div className="w-full h-64 md:h-72 flex items-center justify-center">
          <p className="text-gray-500">No complaint type data available</p>
        </div>
      </div>
    )
  }

  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"]
  const complaintTypes = [...new Set(data.map((call) => call.insurance))]

  const getTimeOfDay = (hour: number): string => {
    if (hour >= 5 && hour < 12) return "Morning"
    if (hour >= 12 && hour < 17) return "Afternoon"
    if (hour >= 17 && hour < 21) return "Evening"
    return "Night"
  }

  const distribution: Record<string, Record<string, number>> = {}
  complaintTypes.forEach((complaint) => {
    distribution[complaint] = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    }
  })

  data.forEach((call) => {
    const hour = new Date(call.dateTime).getHours()
    const timeSlot = getTimeOfDay(hour)
    distribution[call.insurance][timeSlot]++
  })

  // Generate colors for each complaint type
  const colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
  ]

  const borderColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Complaint Types by Time of Day</h2>
      <div className="w-full h-64 md:h-72">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  font: {
                    size: 14,
                  },
                  padding: 20,
                },
              },
            },
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
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
