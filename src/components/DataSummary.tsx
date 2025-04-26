import React from 'react';
import { InsuranceCall } from '../types';

interface DataSummaryProps {
  data: InsuranceCall[];
}

const DataSummary: React.FC<DataSummaryProps> = ({ data }) => {
  // Calculate total calls
  const totalCalls = data.length;
  
  // Count unique callers
  const uniqueCallers = new Set(data.map(call => call.name)).size;
  
  // Get most common insurance type
  const insuranceCounts: Record<string, number> = {};
  data.forEach(call => {
    insuranceCounts[call.insurance] = (insuranceCounts[call.insurance] || 0) + 1;
  });
  
  let mostCommonInsurance = '';
  let maxCount = 0;
  
  Object.entries(insuranceCounts).forEach(([insurance, count]) => {
    if (count > maxCount) {
      mostCommonInsurance = insurance;
      maxCount = count;
    }
  });
  
  // Calculate percentage
  const percentage = ((maxCount / totalCalls) * 100).toFixed(1);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Total Calls</p>
        <p className="text-3xl font-bold text-gray-800">{totalCalls}</p>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Unique Callers</p>
        <p className="text-3xl font-bold text-gray-800">{uniqueCallers}</p>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg">
        <p className="text-gray-500 text-sm font-medium mb-1">Most Common Insurance</p>
        <p className="text-3xl font-bold text-gray-800">{mostCommonInsurance}</p>
        <p className="text-sm text-gray-500 mt-1">{percentage}% of all calls</p>
      </div>
    </div>
  );
};

export default DataSummary;