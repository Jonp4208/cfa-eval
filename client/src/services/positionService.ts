import api from './api';
import { Position } from '@/types/shifts';

export const positionService = {
  // Get all positions for a time block
  getPositions: async (params: {
    setupId: string;
    dayIndex: number;
    blockId: string;
  }): Promise<Position[]> => {
    const response = await api.get('/api/positions', { params });
    return response.data;
  },

  // Create a new position
  createPosition: async (data: {
    setupId: string;
    dayIndex: number;
    blockId: string;
    name: string;
    department: string;
  }): Promise<Position> => {
    const response = await api.post('/api/positions', data);
    return response.data;
  },

  // Update a position
  updatePosition: async (
    setupId: string,
    dayIndex: number,
    blockId: string,
    positionId: string,
    data: Partial<Position>
  ): Promise<Position> => {
    const response = await api.put(
      `/api/positions/${setupId}/${dayIndex}/${blockId}/${positionId}`,
      data
    );
    return response.data;
  },

  // Delete a position
  deletePosition: async (
    setupId: string,
    dayIndex: number,
    blockId: string,
    positionId: string
  ): Promise<any> => {
    const response = await api.delete(
      `/api/positions/${setupId}/${dayIndex}/${blockId}/${positionId}`
    );
    return response.data;
  }
};
