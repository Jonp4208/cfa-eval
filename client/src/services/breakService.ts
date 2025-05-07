import api from './api';

// Define types
export type BreakStatus = 'active' | 'completed' | 'none';

export interface BreakUpdateRequest {
  setupId: string;
  employeeId: string;
  status: BreakStatus;
  duration?: number;
}

export interface BreakUpdateResponse {
  message: string;
  employee: {
    id: string;
    name: string;
    hadBreak: boolean;
    breakDate: string;
    breaks: Array<{
      startTime: string;
      endTime?: string;
      duration: number;
      status: BreakStatus;
      breakDate: string;
    }>;
  };
}

// Break service functions
const breakService = {
  // Update employee break status
  updateBreakStatus: async (data: BreakUpdateRequest): Promise<BreakUpdateResponse> => {
    try {
      const response = await api.post('/api/breaks/update-status', data);
      return response.data;
    } catch (error) {
      console.error('Error updating break status:', error);
      throw error;
    }
  },

  // Start a break
  startBreak: async (setupId: string, employeeId: string, duration: number): Promise<BreakUpdateResponse> => {
    return breakService.updateBreakStatus({
      setupId,
      employeeId,
      status: 'active',
      duration
    });
  },

  // End a break
  endBreak: async (setupId: string, employeeId: string): Promise<BreakUpdateResponse> => {
    return breakService.updateBreakStatus({
      setupId,
      employeeId,
      status: 'completed'
    });
  }
};

export default breakService;
