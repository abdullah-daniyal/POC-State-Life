import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartData } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InsuranceDistributionProps {
  chartData: ChartData;
}

const InsuranceDistribution: React.FC<InsuranceDistributionProps> = ({ chartData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Insurance Distribution</h2>
      <div className="w-full h-64 md:h-72">
        <Pie 
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
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
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
  );
};

export default InsuranceDistribution;