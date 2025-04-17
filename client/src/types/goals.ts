export interface Step {
  text: string
  completed: boolean
  _id?: string
}

export type PeakPeriod = 'Breakfast' | 'Lunch' | 'Dinner' | 'All Day'
export type GoalPeriod = 'Monthly' | 'Quarterly' | 'Yearly'

export type Measurement = {
  value: number
  date: Date
  notes?: string
}

export interface KPI {
  name: string
  targetValue: number
  unit: string
  peak: 'Morning' | 'Lunch' | 'Dinner' | 'All Day'
  measurements?: Measurement[]
}

export interface Goal {
  _id: string
  name: string
  description: string
  businessArea: 'Front Counter' | 'Drive Thru' | 'Kitchen'
  goalPeriod: GoalPeriod
  kpis: KPI[]
  progress: number
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  steps: Step[]
  user: {
    _id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
} 