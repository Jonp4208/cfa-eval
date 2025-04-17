import api from './api';
import { ShiftSetup, TimeBlock, Position } from '@/types/shifts';

export const shiftSetupService = {
  // Get all shift setups
  getShiftSetups: async (params?: {
    isTemplate?: boolean;
    status?: string;
    autoCreate?: boolean;
    weekOf?: string;
  }): Promise<ShiftSetup[]> => {
    const response = await api.get('/api/shift-setups', { params });
    return response.data;
  },

  // Get a single shift setup
  getShiftSetup: async (id: string): Promise<ShiftSetup> => {
    const response = await api.get(`/api/shift-setups/${id}`);
    return response.data;
  },

  // Create a new shift setup
  createShiftSetup: async (data: Partial<ShiftSetup>): Promise<ShiftSetup> => {
    const response = await api.post('/api/shift-setups', data);
    return response.data;
  },

  // Update a shift setup
  updateShiftSetup: async (id: string, data: Partial<ShiftSetup>): Promise<ShiftSetup> => {
    const response = await api.put(`/api/shift-setups/${id}`, data);
    return response.data;
  },

  // Delete a shift setup
  deleteShiftSetup: async (id: string): Promise<void> => {
    await api.delete(`/api/shift-setups/${id}`);
  },

  // Copy a shift setup
  copyShiftSetup: async (id: string, data: {
    name?: string;
    weekStartDate?: string;
    weekEndDate?: string;
    isTemplate?: boolean;
  }): Promise<ShiftSetup> => {
    const response = await api.post(`/api/shift-setups/${id}/copy`, data);
    return response.data;
  },

  // Get all templates
  getTemplates: async (params?: { status?: string }): Promise<ShiftSetup[]> => {
    const response = await api.get('/api/shift-setups/templates', { params });
    return response.data;
  },

  // Save a shift setup as a template
  saveAsTemplate: async (data: { setupId: string; name?: string }): Promise<ShiftSetup> => {
    const response = await api.post('/api/shift-setups/templates', data);
    return response.data;
  },

  // Create a setup for the upcoming week
  createUpcomingWeekSetup: async (templateId?: string): Promise<ShiftSetup> => {
    const response = await api.post('/api/shift-setups/upcoming-week', { templateId });
    return response.data;
  },

  // Upload employees from Excel file
  uploadSchedule: async (setupId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('setupId', setupId);

    const response = await api.post('/api/shift-setups/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get uploaded employees for a shift setup
  getUploadedEmployees: async (setupId: string): Promise<any[]> => {
    const response = await api.get(`/api/shift-setups/${setupId}/employees`);
    return response.data;
  },

  // Get all employees assigned to a shift setup
  getShiftEmployees: async (setupId: string): Promise<any[]> => {
    const response = await api.get(`/api/shift-setups/${setupId}/assigned`);
    return response.data;
  },

  // Assign an employee to a position
  assignEmployee: async (data: {
    setupId: string;
    dayIndex: number;
    blockId: string;
    positionId: string;
    employeeId?: string;
  }): Promise<Position> => {
    const response = await api.post('/api/shift-setups/assign', data);
    return response.data;
  }
};
