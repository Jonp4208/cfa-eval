import type { ObjectId } from './mongo'

export type Department = 'Front Counter' | 'Drive Thru' | 'Kitchen' | 'Dining Room' | 'Outside';
export type Shift = 'opening' | 'mid' | 'closing' | 'all_day';
export type TaskStatus = 'pending' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type TaskInstanceStatus = 'in_progress' | 'completed';
export type TaskCategory = 'opening' | 'transition' | 'closing' | 'other';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  completedAt?: string;
  completedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  listId?: string;
}

export interface MongoId {
  $oid?: string;
  _id?: string;
  toString(): string;
}

export interface TaskList {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  _id?: string | MongoId;
  title: string;
  description?: string;
  estimatedTime?: number;
  scheduledTime?: string;
  status: TaskStatus;
  assignedTo?: {
    _id: string | MongoId;
    name: string;
  };
  completedBy?: {
    _id: string | MongoId;
    name: string;
  } | string;
  completedAt?: string | Date;
  nyTimeString?: string;
  priority: Priority;
  temperature?: number;
  equipmentId?: string;
  requiredPhotos?: boolean;
}

export interface TaskInstance {
  _id: string;
  taskList: string | TaskList;
  tasks: Task[];
  date: string;
  status: TaskStatus;
  completionRate: number;
  completedAt?: string;
  completedBy?: { _id: string, name: string };
  createdAt: string;
  updatedAt: string;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface CleaningTask {
  _id?: string
  id: string
  name: string
  area: 'kitchen_equipment' | 'food_prep' | 'storage' | 'floors'
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
  description: string
  requiredSupplies: string[]
  estimatedDuration: number
  isCritical: boolean
  lastCompleted?: string
  nextDue?: string
  createdBy: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CleaningTaskCompletion {
  id: string
  taskId: string
  completedAt: string
  completedBy: {
    _id: string
    name: string
    role?: string
  }
  notes?: string
  status: 'completed' | 'missed' | 'late'
  suppliesVerified: boolean
  stepsVerified: boolean
  createdAt: string
  updatedAt: string
}

export type TaskListType = TaskList