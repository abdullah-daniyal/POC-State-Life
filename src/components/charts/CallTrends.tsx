import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { InsuranceCall } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface CallTrendsProps {
  data: InsuranceCall[];
}

const CallTrends: React.FC<CallTrendsProps> = ({ data }) => {
  const callsByDate: Record<string, number> = {};
  
  // Group calls by date
  data.forEach(call => {
    const date = new Date(call.dateTime).toLocaleDateString();
    callsByDate[date] = (callsByDate[date] || 0) + 1;
  });
  
  const sortedDates = Object.keys(callsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  const lineColor = 'rgba(75, 192, 192, 1)';
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Number of Calls',
        data: sortedDates.map(date => callsByDate[date]),
        borderColor: lineColor,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: lineColor,
        pointBorderColor: lineColor,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        pointHoverBorderColor: lineColor,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Call Trends</h2>
      <div className="w-full h-64 md:h-72">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: {
                    size: 14,
                  },
                  padding: 20,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
            animation: {
              duration: 2000,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CallTrends;