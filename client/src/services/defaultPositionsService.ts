import api from '@/lib/axios';
import { DefaultPositions } from '@/types/shifts';

export const defaultPositionsService = {
  // Get all default positions
  getDefaultPositions: async (): Promise<DefaultPositions[]> => {
    console.log('Fetching default positions...');
    try {
      const response = await api.get('/api/default-positions');
      console.log('Default positions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching default positions:', error);
      throw error;
    }
  },

  // Get default positions for a specific day and shift
  getDefaultPositionsByDayAndShift: async (day: number, shift: string): Promise<DefaultPositions> => {
    const response = await api.get(`/api/default-positions/${day}/${shift}`);
    return response.data;
  },

  // Create or update default positions
  createOrUpdateDefaultPositions: async (data: DefaultPositions): Promise<DefaultPositions> => {
    const response = await api.post('/api/default-positions', data);
    return response.data;
  },

  // Delete default positions
  deleteDefaultPositions: async (id: string): Promise<void> => {
    await api.delete(`/api/default-positions/${id}`);
  }
};
