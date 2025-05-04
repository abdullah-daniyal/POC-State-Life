import type React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { ChartData } from "../../types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface QueryStatusDistributionProps {
  chartData: ChartData
}

const QueryStatusDistribution: React.FC<QueryStatusDistributionProps> = ({ chartData }) => {
  // Check if chartData is null or undefined
  if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Status Distribution</h2>
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No query status data available</p>
        </div>
      </div>
    )
  }

  // Make sure we have unique labels
  const uniqueLabels = [...new Set(chartData.labels)]
  const uniqueData = uniqueLabels.map((label) => {
    const index = chartData.labels.indexOf(label)
    return chartData.datasets[0].data[index]
  })

  const uniqueChartData = {
    labels: uniqueLabels,
    datasets: [
      {
        ...chartData.datasets[0],
        data: uniqueData,
        backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Status Distribution</h2>
      <div className="w-full h-[300px]">
        <Pie
          data={uniqueChartData}
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
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0)
                    const percentage = Math.round((value / (total as number)) * 100)
                    return `${label}: ${value} (${percentage}%)`
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
              animateScale: true,
              animateRotate: true,
              duration: 2000,
            },
          }}
        />
      </div>
    </div>
  )
}

export default QueryStatusDistribution
