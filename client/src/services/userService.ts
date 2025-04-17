import api from '@/lib/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  position: string;
  departments: string[];
  shift: string;
  role: string;
  status: string;
  startDate?: string;
}

export const userService = {
  // Get all users
  getAllUsers: async (forTaskAssignment?: boolean): Promise<User[]> => {
    try {
      const response = await api.get(`/api/users`, {
        params: { forTaskAssignment }
      });
      console.log('Raw API Response:', response);

      // Extract users array from response
      if (response.data && Array.isArray(response.data.users)) {
        return response.data.users;
      }

      console.error('Invalid response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  }
};

export default userService;