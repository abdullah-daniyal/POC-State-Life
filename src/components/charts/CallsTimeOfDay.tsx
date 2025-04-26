import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TimeOfDayData } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CallsTimeOfDayProps {
  timeOfDayData: TimeOfDayData;
}

const CallsTimeOfDay: React.FC<CallsTimeOfDayProps> = ({ timeOfDayData }) => {
  const labels = Object.keys(timeOfDayData);
  const data = Object.values(timeOfDayData);
  
  const colors = [
    'rgba(255, 159, 64, 0.8)',   // Morning - Orange
    'rgba(54, 162, 235, 0.8)',    // Afternoon - Blue
    'rgba(153, 102, 255, 0.8)',   // Evening - Purple
    'rgba(255, 99, 132, 0.8)',    // Night - Pink
  ];
  
  const borderColors = [
    'rgba(255, 159, 64, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 99, 132, 1)',
  ];
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Calls',
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Calls by Time of Day</h2>
      <div className="w-full h-64 md:h-72">
        <Doughnut 
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
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw as number;
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0);
                    const percentage = Math.round((value / (total as number)) * 100);
                    return `${label}: ${value} calls (${percentage}%)`;
                  }
                }
              }
            },
            cutout: '60%',
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2000,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CallsTimeOfDay;