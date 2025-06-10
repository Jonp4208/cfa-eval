import api from '@/lib/axios';
import { FoodSafetyChecklist, FoodSafetyChecklistCompletion, ChecklistItemCompletion, FoodItem, FoodItemCategory } from '../types/kitchen';
import { CleaningTask, CleaningTaskCompletion } from '../types/task';

export interface EquipmentStatus {
  id: string;
  status: 'operational' | 'maintenance' | 'repair' | 'offline';
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
  temperature?: number;
  issues?: string[];
  category: 'cooking' | 'refrigeration' | 'preparation' | 'cleaning';
  cleaningSchedules?: CleaningSchedule[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  maintenanceInterval: number;
  displayOrder?: number;
}

export interface EquipmentConfig {
  cooking: EquipmentItem[];
  refrigeration: EquipmentItem[];
  preparation: EquipmentItem[];
  cleaning: EquipmentItem[];
}

export interface MaintenanceRecord {
  date: string
  performedBy: {
    _id: string
    name: string
  }
  notes: string
  previousStatus: string
  newStatus: string
  type?: 'maintenance' | 'note'
}

export interface CleaningChecklistItem {
  name: string
  isRequired: boolean
}

export interface CleaningCompletionItem {
  name: string
  isCompleted: boolean
}

export interface CleaningSchedule {
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly'
  description: string
  checklist?: CleaningChecklistItem[]
  lastCompleted?: string
  nextDue?: string
  completionHistory?: CleaningCompletion[]
}

export interface CleaningCompletion {
  date: string
  performedBy: {
    _id: string
    name: string
  }
  notes?: string
  completedItems?: CleaningCompletionItem[]
}

export interface ShiftChecklistItem {
  id: string
  label: string
  isCompleted: boolean
  isRequired?: boolean
  type: 'opening' | 'transition' | 'closing'
  order: number
  createdAt?: string
  updatedAt?: string
  completedBy?: {
    id: string
    name: string
  }
  completedAt?: string
}

export interface ShiftChecklistCompletion {
  id: string
  type: 'opening' | 'transition' | 'closing'
  items: {
    id: string
    isCompleted: boolean
  }[]
  completedBy: {
    id: string
    name: string
  }
  completedAt: string
  notes?: string
}

export interface DailyChecklistItems {
  items: {
    id: string;
    isCompleted: boolean;
  }[];
}

export interface DailyChecklistCompletion {
  id: string;
  completedBy: string;
  completedAt: string;
  value?: any;
  notes?: string;
  status: string;
}

export interface DailyChecklistItemWithCompletions {
  id: string;
  name: string;
  frequency?: 'once' | 'multiple';
  requiredCompletions?: number;
  timeframe?: TimeFrame;
  completions: DailyChecklistCompletion[];
  completedCount: number;
  isCompleted: boolean;
}

export interface DailyChecklistHistoryItem {
  id: string;
  category: string;
  itemId: string;
  itemName: string;
  completedBy: string;
  completedAt: string;
  value?: any;
  notes?: string;
  status: string;
  timeframe: string;
}

export interface DailyChecklistHistoryResponse {
  dateRange: {
    start: string;
    end: string;
  };
  completions: DailyChecklistHistoryItem[];
  groupedByDate: Record<string, DailyChecklistHistoryItem[]>;
}

interface FoodSafetyConfig {
  dailyChecklistItems: Record<string, { id: string; name: string; frequency?: 'once' | 'multiple'; requiredCompletions?: number }[]>;
  temperatureRanges: Record<string, { min: number; max: number; warning: number; type?: 'product' }>;
}

export interface TemperatureLog {
  id: string;
  location: string;
  value: number;
  timestamp: string;
  status: 'pass' | 'warning' | 'fail';
  recordedBy: string;
  notes?: string;
  type: 'equipment' | 'product';
}

export interface TemperatureLogResponse {
  logs: TemperatureLog[];
  groupedLogs: Record<string, TemperatureLog[]>;
}

export interface LatestTemperatures {
  [location: string]: {
    value: number;
    timestamp: string;
    status: 'pass' | 'warning' | 'fail';
  };
}

export const kitchenService = {
  // Get all food safety checklists
  getAllChecklists: async (): Promise<FoodSafetyChecklist[]> => {
    try {
      const response = await api.get('/api/kitchen/food-safety/checklists');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Food safety checklists not found for store, returning empty array');
        return []; // Return empty array instead of throwing an error
      }
      throw error; // Re-throw other errors
    }
  },

  // Get a specific checklist
  getChecklist: async (id: string): Promise<FoodSafetyChecklist> => {
    const response = await api.get(`/api/kitchen/food-safety/checklists/${id}`);
    return response.data;
  },

  // Create a new checklist
  createChecklist: async (checklist: Omit<FoodSafetyChecklist, '_id' | 'createdBy' | 'store' | 'isActive'>): Promise<FoodSafetyChecklist> => {
    const response = await api.post('/api/kitchen/food-safety/checklists', checklist);
    return response.data;
  },

  // Update a checklist
  updateChecklist: async (id: string, checklist: Partial<FoodSafetyChecklist>): Promise<FoodSafetyChecklist> => {
    const response = await api.patch(`/api/kitchen/food-safety/checklists/${id}`, checklist);
    return response.data;
  },

  // Delete a checklist
  deleteChecklist: async (id: string): Promise<void> => {
    await api.delete(`/api/kitchen/food-safety/checklists/${id}`);
  },

  // Complete a checklist
  completeChecklist: async (
    id: string,
    completion: {
      items: Omit<ChecklistItemCompletion, 'completedAt'>[],
      notes?: string,
      score: number,
      overallStatus: CompletionStatus
    }
  ): Promise<FoodSafetyChecklistCompletion> => {
    const response = await api.post(
      `/api/kitchen/food-safety/checklists/${id}/complete`,
      completion
    );
    return response.data;
  },

  // Get checklist completions
  getChecklistCompletions: async (id: string): Promise<FoodSafetyChecklistCompletion[]> => {
    const response = await api.get(
      id === 'all'
        ? '/api/kitchen/food-safety/completions'
        : `/api/kitchen/food-safety/checklists/${id}/completions`
    )
    return response.data
  },

  // Review a checklist completion
  reviewCompletion: async (
    id: string,
    review: { notes: string }
  ): Promise<FoodSafetyChecklistCompletion> => {
    const response = await api.post(
      `/api/kitchen/food-safety/completions/${id}/review`,
      review
    );
    return response.data;
  },

  // Equipment configuration methods
  getEquipmentConfig: async (): Promise<EquipmentConfig> => {
    const response = await api.get('/api/kitchen/equipment/config');
    return response.data;
  },

  updateEquipmentConfig: async (category: keyof EquipmentConfig, items: EquipmentItem[]): Promise<void> => {
    await api.post('/api/kitchen/equipment/config', {
      category,
      items
    });
  },

  // Existing equipment methods
  getEquipmentStatuses: async (): Promise<Record<string, EquipmentStatus>> => {
    try {
      const response = await api.get('/api/kitchen/equipment/statuses');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Equipment statuses not found for store, returning empty object');
        return {}; // Return empty object instead of throwing an error
      }
      throw error; // Re-throw other errors
    }
  },

  updateEquipmentStatus: async (id: string, status: EquipmentStatus): Promise<void> => {
    await api.patch(`/api/kitchen/equipment/${id}/status`, status);
  },

  // Get maintenance history for equipment
  getEquipmentHistory: async (id: string): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/api/kitchen/equipment/${id}/history`)
    return response.data
  },

  // Add a standalone maintenance note
  addMaintenanceNote: async (equipmentId: string, data: { notes: string, type?: 'maintenance' | 'note' }): Promise<any> => {
    const response = await api.post(`/api/kitchen/equipment/${equipmentId}/history`, data);
    return response.data;
  },

  // Update a maintenance record
  updateMaintenanceRecord: async (equipmentId: string, recordDate: string, update: { notes: string }): Promise<void> => {
    await api.patch(`/api/kitchen/equipment/${equipmentId}/history/${recordDate}`, update)
  },

  // Delete a maintenance record
  deleteMaintenanceRecord: async (equipmentId: string, recordDate: string): Promise<void> => {
    await api.delete(`/api/kitchen/equipment/${equipmentId}/history/${recordDate}`)
  },

  // Get cleaning schedules for equipment
  getCleaningSchedules: async (id: string): Promise<CleaningSchedule[]> => {
    const response = await api.get(`/api/kitchen/equipment/${id}/cleaning-schedules`)
    return response.data
  },

  // Add cleaning schedule
  addCleaningSchedule: async (id: string, schedule: Omit<CleaningSchedule, 'completionHistory'>): Promise<void> => {
    await api.post(`/api/kitchen/equipment/${id}/cleaning-schedules`, schedule)
  },

  // Update cleaning schedule
  updateCleaningSchedule: async (id: string, scheduleName: string, schedule: Partial<CleaningSchedule>): Promise<void> => {
    await api.patch(`/api/kitchen/equipment/${id}/cleaning-schedules/${encodeURIComponent(scheduleName)}`, schedule)
  },

  // Delete cleaning schedule
  deleteCleaningSchedule: async (id: string, scheduleName: string): Promise<void> => {
    await api.delete(`/api/kitchen/equipment/${id}/cleaning-schedules/${encodeURIComponent(scheduleName)}`)
  },

  // Complete cleaning task
  completeCleaningSchedule: async (id: string, scheduleName: string, data: {
    notes?: string,
    completedItems?: CleaningCompletionItem[],
    isEarlyCompletion?: boolean
  }): Promise<void> => {
    await api.post(`/api/kitchen/equipment/${id}/cleaning-schedules/${encodeURIComponent(scheduleName)}/complete`, data)
  },

  // Cleaning Tasks
  getAllCleaningTasks: async (): Promise<CleaningTask[]> => {
    const response = await api.get('/api/kitchen/cleaning/tasks');
    return response.data.map((task: any) => ({
      ...task,
      id: task._id || task.id
    }));
  },

  getCleaningTask: async (id: string): Promise<CleaningTask> => {
    const response = await api.get(`/api/kitchen/cleaning/tasks/${id}`);
    const task = response.data;
    return {
      ...task,
      id: task._id || task.id
    };
  },

  createCleaningTask: async (task: Omit<CleaningTask, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'lastCompleted' | 'nextDue'>): Promise<CleaningTask> => {
    const response = await api.post('/api/kitchen/cleaning/tasks', task);
    const createdTask = response.data;
    return {
      ...createdTask,
      id: createdTask._id || createdTask.id
    };
  },

  updateCleaningTask: async (id: string, task: Partial<CleaningTask>): Promise<CleaningTask> => {
    const response = await api.patch(`/api/kitchen/cleaning/tasks/${id}`, task);
    const updatedTask = response.data;
    return {
      ...updatedTask,
      id: updatedTask._id || updatedTask.id
    };
  },

  deleteCleaningTask: async (id: string): Promise<void> => {
    await api.delete(`/api/kitchen/cleaning/tasks/${id}`);
  },

  completeCleaningTask: async (id: string, completion: {
    notes?: string
    status: 'completed' | 'missed' | 'late'
    suppliesVerified: boolean
    stepsVerified: boolean
  }): Promise<CleaningTaskCompletion> => {
    const response = await api.post(`/api/kitchen/cleaning/tasks/${id}/complete`, completion);
    return response.data;
  },

  getCleaningTaskCompletions: async (id: string): Promise<CleaningTaskCompletion[]> => {
    const response = await api.get(`/api/kitchen/cleaning/tasks/${id}/completions`);
    return response.data;
  },

  // Shift Checklist Methods
  getShiftChecklistItems: async (type: string): Promise<ShiftChecklistItem[]> => {
    const response = await api.get(`/api/kitchen/checklists/shift/${type}`);
    return response.data;
  },

  getShiftChecklistItemsWithCompletions: async (type: string): Promise<ShiftChecklistItem[]> => {
    try {
      // Get the checklist items
      const itemsResponse = await api.get(`/api/kitchen/checklists/shift/${type}`);
      const items = itemsResponse.data;

      // Get today's completions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      try {
        const completionsResponse = await api.get(`/api/kitchen/checklists/shift/${type}/completions`, {
          params: { startDate: todayStr }
        });
        const completions = completionsResponse.data;

        // If we have completions for today, mark the items as completed
        if (completions && completions.length > 0) {
          // Get the latest completion
          const latestCompletion = completions[0];

          // Mark items as completed based on the latest completion
          return items.map(item => {
            const completedItem = latestCompletion.items.find(i => i.id === item.id);
            return {
              ...item,
              isCompleted: completedItem ? completedItem.isCompleted : false,
              completedBy: completedItem && completedItem.isCompleted ? latestCompletion.completedBy : undefined,
              completedAt: completedItem && completedItem.isCompleted ? latestCompletion.completedAt : undefined
            };
          });
        }
      } catch (completionError: any) {
        if (completionError.response && completionError.response.status === 404) {
          console.log(`No completions found for ${type} checklist, continuing with default items`);
        } else {
          throw completionError;
        }
      }

      // If no completions found, return items as is
      return items;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log(`${type} checklist not found for store, returning empty array`);
        return []; // Return empty array instead of throwing an error
      }
      throw error; // Re-throw other errors
    }
  },

  updateShiftChecklistItems: async (type: string, items: ShiftChecklistItem[]): Promise<ShiftChecklistItem[]> => {
    const response = await api.put(`/api/kitchen/checklists/shift/${type}`, { items });
    return response.data;
  },

  completeShiftChecklist: async (type: string, completion: {
    items: { id: string; isCompleted: boolean }[]
    notes?: string
    forcePartialSave?: boolean
  }): Promise<ShiftChecklistCompletion> => {
    const response = await api.post(`/api/kitchen/checklists/shift/${type}/complete`, completion);
    return response.data;
  },

  getShiftChecklistCompletions: async (type: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<ShiftChecklistCompletion[]> => {
    const response = await api.get(`/api/kitchen/checklists/shift/${type}/completions`, { params });
    return response.data;
  },

  // Initialize shift checklist with default items
  initializeShiftChecklist: async (force: boolean = false): Promise<any> => {
    const response = await api.post(`/api/kitchen/checklists/shift-initialize`, {}, {
      params: { force: force ? 'true' : 'false' }
    });
    return response.data;
  },

  // Update daily checklist items configuration
  updateDailyChecklistItems: async (items: DailyChecklistItems): Promise<void> => {
    await api.post('/api/kitchen/food-safety/config/daily-items', { items })
  },

  // Get food safety configuration
  getFoodSafetyConfig: async (): Promise<FoodSafetyConfig> => {
    const response = await api.get('/api/kitchen/food-safety/config')
    return response.data
  },

  // Update food safety configuration
  updateFoodSafetyConfig: async (config: FoodSafetyConfig): Promise<void> => {
    await api.post('/api/kitchen/food-safety/config', config)
  },

  // Daily Checklist Methods
  getDailyChecklistItems: async (): Promise<Record<string, DailyChecklistItemWithCompletions[]>> => {
    try {
      const response = await api.get('/api/kitchen/food-safety/daily-checklist');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Daily checklist not found for store, returning empty object');
        return {}; // Return empty object instead of throwing an error
      }
      throw error; // Re-throw other errors
    }
  },

  completeDailyChecklistItem: async (
    category: string,
    itemId: string,
    data: { value?: any; notes?: string; status?: string }
  ): Promise<DailyChecklistCompletion> => {
    const response = await api.post(`/api/kitchen/food-safety/daily-checklist/${category}/${itemId}`, data);
    return response.data;
  },

  deleteDailyChecklistCompletion: async (completionId: string): Promise<void> => {
    await api.delete(`/api/kitchen/food-safety/daily-checklist/completion/${completionId}`);
  },

  getDailyChecklistHistory: async (
    params: {
      startDate?: string;
      endDate?: string;
      category?: string;
      itemId?: string;
    } = {}
  ): Promise<DailyChecklistHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.category) queryParams.append('category', params.category);
    if (params.itemId) queryParams.append('itemId', params.itemId);

    const response = await api.get(`/api/kitchen/food-safety/daily-checklist/history?${queryParams}`);
    return response.data;
  },

  // Temperature Log Methods
  getTemperatureLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    location?: string;
    type?: 'equipment' | 'product';
  }): Promise<TemperatureLogResponse> => {
    const response = await api.get('/api/kitchen/food-safety/temperature-logs', { params });
    return response.data;
  },

  recordTemperature: async (data: {
    location: string;
    value: number;
    notes?: string;
    type?: 'equipment' | 'product';
  }): Promise<TemperatureLog> => {
    const response = await api.post('/api/kitchen/food-safety/temperature-logs', data);
    return response.data;
  },

  recordMultipleTemperatures: async (temperatures: {
    location: string;
    value: number;
    notes?: string;
    type?: 'equipment' | 'product';
  }[]): Promise<{ logs: TemperatureLog[] }> => {
    const response = await api.post('/api/kitchen/food-safety/temperature-logs/batch', { temperatures });
    return response.data;
  },

  getLatestTemperatures: async (): Promise<LatestTemperatures> => {
    const response = await api.get('/api/kitchen/food-safety/temperature-logs/latest');
    return response.data;
  },

  // Food Quality Services
  getFoodQualityConfig: async () => {
    const response = await api.get('/api/kitchen/food-quality/config');
    return response.data;
  },

  updateFoodQualityConfig: async (config: any) => {
    const response = await api.post('/api/kitchen/food-quality/config', config);
    return response.data;
  },

  getFoodQualityStandards: async () => {
    const response = await api.get('/api/kitchen/food-quality/standards');
    return response.data;
  },

  createOrUpdateFoodQualityStandard: async (standard: any) => {
    const response = await api.post('/api/kitchen/food-quality/standards', standard);
    return response.data;
  },

  submitFoodQualityEvaluation: async (evaluation: any) => {
    const response = await api.post('/api/kitchen/food-quality/evaluations', evaluation);
    return response.data;
  },

  getFoodQualityEvaluations: async (params?: any) => {
    const response = await api.get('/api/kitchen/food-quality/evaluations', { params });
    return response.data;
  },

  getFoodQualityAnalytics: async (params?: any) => {
    const response = await api.get('/api/kitchen/food-quality/analytics', { params });
    return response.data;
  },

  // Food Items Management
  getFoodItems: async (): Promise<FoodItem[]> => {
    const response = await api.get('/api/kitchen/food-items');
    return response.data;
  },

  createFoodItem: async (item: Omit<FoodItem, '_id' | 'store' | 'createdBy' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> => {
    const response = await api.post('/api/kitchen/food-items', item);
    return response.data;
  },

  updateFoodItem: async (id: string, item: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await api.put(`/api/kitchen/food-items/${id}`, item);
    return response.data;
  },

  deleteFoodItem: async (id: string): Promise<void> => {
    await api.delete(`/api/kitchen/food-items/${id}`);
  },

  getFoodItemCategories: async (): Promise<FoodItemCategory[]> => {
    const response = await api.get('/api/kitchen/food-items/categories');
    return response.data;
  },
};