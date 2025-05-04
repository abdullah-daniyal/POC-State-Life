"use client"

import type React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { SimplifiedTimeData } from "../../types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface SimplifiedTimeDistributionProps {
  timeData: SimplifiedTimeData
}

const SimplifiedTimeDistribution: React.FC<SimplifiedTimeDistributionProps> = ({ timeData }) => {
  // Check if timeData is null or undefined
  if (!timeData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Call Distribution by Time</h2>
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No time distribution data available</p>
        </div>
      </div>
    )
  }

  const labels = ["Morning (8 AM - 4:59 PM)", "Evening (5 PM - 12 AM)"]
  const data = [timeData.Morning, timeData.Evening]
  const total = data.reduce((a, b) => a + b, 0)

  // Calculate percentages
  const morningPercentage = total > 0 ? Math.round((timeData.Morning / total) * 100) : 0
  const eveningPercentage = total > 0 ? Math.round((timeData.Evening / total) * 100) : 0

  const colors = ["rgba(54, 162, 235, 0.8)", "rgba(153, 102, 255, 0.8)"] // Blue for Morning, Purple for Evening
  const borderColors = ["rgba(54, 162, 235, 1)", "rgba(153, 102, 255, 1)"]

  const chartData = {
    labels,
    datasets: [
      {
        label: "Calls",
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Call Distribution by Time</h2>
      <div className="w-full h-[300px]">
        <Doughnut
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
                callbacks: {
                  label: (context) => {
                    const label = context.label || ""
                    const value = context.raw as number
                    const percentage = context.dataIndex === 0 ? morningPercentage : eveningPercentage
                    return `${label}: ${value} calls (${percentage}%)`
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
            cutout: "60%",
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2000,
            },
          }}
        />
      </div>

      {/* Add a summary below the chart */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-blue-800 font-medium text-sm md:text-base">Morning</div>
          <div className="text-xl md:text-2xl font-bold">{timeData.Morning}</div>
          <div className="text-xs md:text-sm text-blue-600">{morningPercentage}% of calls</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-purple-800 font-medium text-sm md:text-base">Evening</div>
          <div className="text-xl md:text-2xl font-bold">{timeData.Evening}</div>
          <div className="text-xs md:text-sm text-purple-600">{eveningPercentage}% of calls</div>
        </div>
      </div>
    </div>
  )
}

export default SimplifiedTimeDistribution
