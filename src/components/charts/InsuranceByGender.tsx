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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InsuranceByGenderProps {
  insuranceTypes: string[];
  genders: string[];
  distribution: Record<string, Record<string, number>>;
}

const InsuranceByGender: React.FC<InsuranceByGenderProps> = ({ 
  insuranceTypes, 
  genders, 
  distribution 
}) => {
  const colors = {
    Male: 'rgba(54, 162, 235, 0.8)',
    Female: 'rgba(255, 99, 132, 0.8)',
    Other: 'rgba(255, 206, 86, 0.8)'
  };

  const borderColors = {
    Male: 'rgba(54, 162, 235, 1)',
    Female: 'rgba(255, 99, 132, 1)',
    Other: 'rgba(255, 206, 86, 1)'
  };

  const datasets = genders.map(gender => ({
    label: gender,
    data: insuranceTypes.map(insurance => distribution[insurance][gender]),
    backgroundColor: colors[gender as keyof typeof colors],
    borderColor: borderColors[gender as keyof typeof borderColors],
    borderWidth: 1,
  }));

  const chartData = {
    labels: insuranceTypes,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
      duration: 1500,
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Insurance by Gender</h2>
      <div className="w-full h-64 md:h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default InsuranceByGender;