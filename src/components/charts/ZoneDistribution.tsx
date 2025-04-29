import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ZoneData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ZoneDistributionProps {
  zoneData: ZoneData;
}

const ZoneDistribution: React.FC<ZoneDistributionProps> = ({ zoneData }) => {
  const zones = Object.keys(zoneData);
  const closedData = zones.map(zone => zoneData[zone].closed);
  const referredData = zones.map(zone => zoneData[zone].referred);

  const data = {
    labels: zones,
    datasets: [
      {
        label: 'Closed Queries',
        data: closedData,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Referred Queries',
        data: referredData,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Status by Zone</h2>
      <div className="w-full h-64 md:h-72">
        <Bar
          data={data}
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
  );
};

export default ZoneDistribution;