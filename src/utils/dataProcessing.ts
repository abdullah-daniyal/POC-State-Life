import { InsuranceCall, TimeOfDayData, ZoneData } from '../types';

export const parseCSVData = async (): Promise<InsuranceCall[]> => {
  const response = await fetch('/data/insurance_calls.csv');
  const csvText = await response.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      name: values[0],
      dateTime: values[1],
      phoneNumber: values[2],
      insurance: values[3],
      policyNo: values[4],
      zone: values[5],
      status: values[6]
    };
  });
};

export const getInsuranceDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {};
  
  data.forEach(call => {
    distribution[call.insurance] = (distribution[call.insurance] || 0) + 1;
  });
  
  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
};

export const getZoneStatusDistribution = (data: InsuranceCall[]): ZoneData => {
  const distribution: ZoneData = {};
  
  data.forEach(call => {
    if (!distribution[call.zone]) {
      distribution[call.zone] = {
        total: 0,
        closed: 0,
        referred: 0
      };
    }
    
    distribution[call.zone].total += 1;
    if (call.status === 'Query_Closed') {
      distribution[call.zone].closed += 1;
    } else if (call.status === 'Query_Referred') {
      distribution[call.zone].referred += 1;
    }
  });
  
  return distribution;
};

export const getTimeOfDayDistribution = (data: InsuranceCall[]): TimeOfDayData => {
  const distribution: TimeOfDayData = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0
  };
  
  data.forEach(call => {
    const date = new Date(call.dateTime);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) {
      distribution.Morning += 1;
    } else if (hour >= 12 && hour < 17) {
      distribution.Afternoon += 1;
    } else if (hour >= 17 && hour < 21) {
      distribution.Evening += 1;
    } else {
      distribution.Night += 1;
    }
  });
  
  return distribution;
};

export const getStatusDistribution = (data: InsuranceCall[]) => {
  const distribution: Record<string, number> = {
    'Query_Closed': 0,
    'Query_Referred': 0
  };
  
  data.forEach(call => {
    distribution[call.status] = (distribution[call.status] || 0) + 1;
  });
  
  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
};