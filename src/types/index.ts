export interface InsuranceCall {
  name: string;
  dateTime: string;
  phoneNumber: string;
  insurance: string;
  policyNo: string;
  zone: string;
  status: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface TimeOfDayData {
  Morning: number;
  Afternoon: number;
  Evening: number;
  Night: number;
}

export interface ZoneData {
  [key: string]: {
    total: number;
    closed: number;
    referred: number;
  };
}