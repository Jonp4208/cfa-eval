import api from '@/lib/axios';

interface SwitchStoreResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    position: string;
    role: string;
    store: {
      _id: string;
      name: string;
      storeNumber: string;
    };
    status: string;
    departments: string[];
  };
}

const userStoreService = {
  /**
   * Switch the current user's store
   * Only available for Jonathon Pope's account
   */
  switchStore: async (storeId: string): Promise<SwitchStoreResponse> => {
    const response = await api.post('/api/user-store/switch', { storeId });
    return response.data;
  }
};

export default userStoreService;
