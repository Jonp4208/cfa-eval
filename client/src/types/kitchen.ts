export type CheckType = 'yes_no' | 'temperature' | 'text';
export type ChecklistFrequency = 'daily' | 'weekly' | 'monthly' | 'multiple_daily';
export type CompletionStatus = 'pass' | 'fail' | 'warning' | 'not_applicable';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TimeFrame = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'closing' | '30min' | 'hourly';

export interface ValidationCriteria {
  minTemp?: number;
  maxTemp?: number;
  requiredValue?: 'yes' | 'no';
  requiredPattern?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface ChecklistItem {
  _id?: string;
  name: string;
  type: CheckType;
  description?: string;
  isCritical: boolean;
  validation?: ValidationCriteria;
  order: number;
}

export interface FoodSafetyChecklist {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  frequency: ChecklistFrequency;
  weeklyDay?: WeekDay;
  monthlyWeek?: 1 | 2 | 3 | 4;
  monthlyDay?: WeekDay;
  items: ChecklistItem[];
  department: string;
  passingScore?: number;
  requiresReview?: boolean;
  createdBy?: string;
  store?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistItemCompletion {
  item: string;
  value: any;
  status: CompletionStatus;
  notes?: string;
  photo?: string;
  completedAt?: string;
}

export interface FoodSafetyChecklistCompletion {
  _id?: string;
  checklist: string;
  completedBy: string;
  store: string;
  items: ChecklistItemCompletion[];
  overallStatus: CompletionStatus;
  score: number;
  notes?: string;
  completedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyChecklistItem {
  id: string;
  name: string;
  frequency?: 'once' | 'multiple';
  requiredCompletions?: number;
  timeframe?: TimeFrame;
}

// Food Quality Types
export type ProductType = 'sandwich_regular' | 'sandwich_spicy' | 'nuggets_8' | 'nuggets_12' | 'strips_4' | 'grilled_sandwich' | 'grilled_nuggets_8' | 'grilled_nuggets_12' | 'fries_small' | 'fries_medium' | 'fries_large';

export interface FoodQualityStandard {
  _id?: string;
  productType: ProductType;
  name: string;
  criteria: FoodQualityCriteria[];
  store: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodQualityCriteria {
  id: string;
  name: string;
  type: 'visual' | 'weight' | 'temperature' | 'taste' | 'measurement' | 'count' | 'yes_no';
  description?: string;
  required: boolean;
  validation?: {
    minWeight?: number;
    maxWeight?: number;
    minTemp?: number;
    maxTemp?: number;
    minCount?: number;
    maxCount?: number;
    minMeasurement?: number;
    maxMeasurement?: number;
    requiredValue?: 'yes' | 'no';
    minTasteRating?: number;
    maxTasteRating?: number;
  };
  order: number;
}

export interface FoodQualityEvaluation {
  _id?: string;
  productType: ProductType;
  evaluatedBy: string;
  store: string;
  items: FoodQualityItemEvaluation[];
  overallScore: number;
  overallStatus: CompletionStatus;
  notes?: string;
  photos?: string[];
  evaluatedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodQualityItemEvaluation {
  criteriaId: string;
  value: any;
  status: CompletionStatus;
  notes?: string;
  photo?: string;
}