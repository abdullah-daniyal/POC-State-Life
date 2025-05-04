import type React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import type { ZoneData } from "../../types"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ZoneDistributionProps {
  zoneData: ZoneData
}

const ZoneDistribution: React.FC<ZoneDistributionProps> = ({ zoneData }) => {
  // Check if zoneData is null or undefined
  if (!zoneData || Object.keys(zoneData).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Status by Zone</h2>
        <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center">
          <p className="text-gray-500">No zone data available</p>
        </div>
      </div>
    )
  }

  // Sort zones alphabetically for better visualization
  const zones = Object.keys(zoneData).sort()
  const closedData = zones.map((zone) => zoneData[zone].closed)
  const referredData = zones.map((zone) => zoneData[zone].referred)

  const data = {
    labels: zones,
    datasets: [
      {
        label: "Closed Queries",
        data: closedData,
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Referred Queries",
        data: referredData,
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Status by Zone</h2>
      <div className="w-full h-[300px] md:h-[400px]">
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y", // Make it a horizontal bar chart for better readability with many zones
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
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  font: {
                    size: 12,
                  },
                },
              },
              y: {
                stacked: true,
                ticks: {
                  font: {
                    size: 11,
                    weight: "bold",
                  },
                },
              },
            },
            layout: {
              padding: {
                top: 10,
                bottom: 30, // Extra padding at bottom for legend
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

export default ZoneDistribution
