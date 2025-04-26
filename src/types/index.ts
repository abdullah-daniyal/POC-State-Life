export interface InsuranceCall {
  name: string;
  dateTime: string;
  insurance: string;
  personId: string;
  gender: string;
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