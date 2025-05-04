export interface InsuranceCall {
  dateTime: string
  phoneNumber: string
  insurance: string // Nature of Complaints
  policyNo: string
  zone: string
  status: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

export interface TimeOfDayData {
  Morning: number
  Afternoon: number
  Evening: number
  Night: number
}

export interface SimplifiedTimeData {
  Morning: number // 8 AM - 4:59 PM
  Evening: number // 5 PM - 12 AM
}

export interface ZoneData {
  [key: string]: {
    total: number
    closed: number
    referred: number
  }
}
