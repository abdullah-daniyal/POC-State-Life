import React, { useEffect, useState } from 'react';
import Header from './Header';
import DataSummary from './DataSummary';
import InsuranceDistribution from './charts/InsuranceDistribution';
import InsuranceByGender from './charts/InsuranceByGender';
import CallsTimeOfDay from './charts/CallsTimeOfDay';
import CallTrends from './charts/CallTrends';
import InsuranceByTimeOfDay from './charts/InsuranceByTimeOfDay';
import { 
  parseCSVData,
  getInsuranceDistribution,
  getInsuranceByGender,
  getTimeOfDayDistribution
} from '../utils/dataProcessing';
import { InsuranceCall } from '../types';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<InsuranceCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await parseCSVData();
        setData(result);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const insuranceDistribution = React.useMemo(() => {
    if (!data.length) return null;
    const { labels, data: counts } = getInsuranceDistribution(data);
    
    return {
      labels,
      datasets: [
        {
          label: 'Count',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);
  
  const { distribution, insuranceTypes, genders } = React.useMemo(() => 
    data.length ? getInsuranceByGender(data) : { distribution: {}, insuranceTypes: [], genders: [] }
  , [data]);
  
  const timeOfDayData = React.useMemo(() => 
    data.length ? getTimeOfDayDistribution(data) : null
  , [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="mt-8">
          <DataSummary data={data} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {insuranceDistribution && <InsuranceDistribution chartData={insuranceDistribution} />}
            {timeOfDayData && <CallsTimeOfDay timeOfDayData={timeOfDayData} />}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CallTrends data={data} />
            <InsuranceByTimeOfDay data={data} />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <InsuranceByGender 
              insuranceTypes={insuranceTypes}
              genders={genders}
              distribution={distribution}
            />
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Insurance Call Analytics Dashboard • Data Visualization Project • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;