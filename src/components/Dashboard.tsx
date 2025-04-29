import React, { useEffect, useState } from 'react';
import Header from './Header';
import DataSummary from './DataSummary';
import InsuranceDistribution from './charts/InsuranceDistribution';
import CallsTimeOfDay from './charts/CallsTimeOfDay';
import CallTrends from './charts/CallTrends';
import ZoneDistribution from './charts/ZoneDistribution';
import QueryStatusDistribution from './charts/QueryStatusDistribution';
import { 
  parseCSVData,
  getInsuranceDistribution,
  getTimeOfDayDistribution,
  getZoneStatusDistribution,
  getStatusDistribution
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
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);
  
  const timeOfDayData = React.useMemo(() => 
    data.length ? getTimeOfDayDistribution(data) : null
  , [data]);

  const zoneData = React.useMemo(() => 
    data.length ? getZoneStatusDistribution(data) : null
  , [data]);

  const statusDistribution = React.useMemo(() => {
    if (!data.length) return null;
    const { labels, data: counts } = getStatusDistribution(data);
    return {
      labels,
      datasets: [
        {
          label: 'Status',
          data: counts,
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

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
            {statusDistribution && <QueryStatusDistribution chartData={statusDistribution} />}
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            {zoneData && <ZoneDistribution zoneData={zoneData} />}
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