import api from './api';
import { TimeBlock } from '@/types/shifts';

export const timeBlockService = {
  // Get all time blocks for a day
  getTimeBlocks: async (params: {
    setupId: string;
    dayIndex: number;
  }): Promise<TimeBlock[]> => {
    const response = await api.get('/api/time-blocks', { params });
    return response.data;
  },

  // Create a new time block
  createTimeBlock: async (data: {
    setupId: string;
    dayIndex: number;
    startTime: string;
    endTime: string;
  }): Promise<TimeBlock> => {
    const response = await api.post('/api/time-blocks', data);
    return response.data;
  },

  // Update a time block
  updateTimeBlock: async (
    setupId: string,
    dayIndex: number,
    blockId: string,
    data: Partial<TimeBlock>
  ): Promise<TimeBlock> => {
    const response = await api.put(
      `/api/time-blocks/${setupId}/${dayIndex}/${blockId}`,
      data
    );
    return response.data;
  },

  // Delete a time block
  deleteTimeBlock: async (
    setupId: string,
    dayIndex: number,
    blockId: string
  ): Promise<any> => {
    const response = await api.delete(
      `/api/time-blocks/${setupId}/${dayIndex}/${blockId}`
    );
    return response.data;
  }
};
