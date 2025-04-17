import api from '@/lib/axios';
import { ShiftSetup } from '@/types/shifts';

export const shiftsService = {
  // Get all shift setups
  getShiftSetups: async (): Promise<ShiftSetup[]> => {
    const response = await api.get('/api/shifts');
    return response.data;
  },

  // Get a specific shift setup
  getShiftSetup: async (id: string): Promise<ShiftSetup> => {
    const response = await api.get(`/api/shifts/${id}`);
    return response.data;
  },

  // Submit feedback for a shift setup
  submitFeedback: async (setupId: string, rating: number, feedback: string): Promise<ShiftSetup> => {
    const response = await api.post(`/api/shifts/${setupId}/feedback`, {
      rating,
      feedback
    });
    return response.data;
  },

  // Get feedback for a shift setup
  getFeedback: async (setupId: string): Promise<any[]> => {
    const response = await api.get(`/api/shifts/${setupId}/feedback`);
    return response.data;
  }
};
