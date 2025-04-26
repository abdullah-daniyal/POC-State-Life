import { InsuranceCall, TimeOfDayData } from '../types';

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
      insurance: values[2],
      personId: values[3],
      gender: values[4]
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

export const getInsuranceByGender = (data: InsuranceCall[]) => {
  const distribution: Record<string, Record<string, number>> = {};
  
  const genders = ["Male", "Female", "Other"];
  const insuranceTypes = [...new Set(data.map(call => call.insurance))];
  
  insuranceTypes.forEach(insurance => {
    distribution[insurance] = {};
    genders.forEach(gender => {
      distribution[insurance][gender] = 0;
    });
  });
  
  data.forEach(call => {
    distribution[call.insurance][call.gender] = 
      (distribution[call.insurance][call.gender] || 0) + 1;
  });
  
  return { distribution, insuranceTypes, genders };
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