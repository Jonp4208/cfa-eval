import api from '@/lib/axios';

export interface Store {
  _id: string;
  storeNumber: string;
  name: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
  createdAt: string;
  userCount?: number;
  status?: 'active' | 'inactive';
  subscription?: {
    status: 'active' | 'expired' | 'trial' | 'none';
    features: {
      leadershipPlans: boolean;
      [key: string]: boolean;
    };
  };
}

export interface StoreUser {
  _id: string;
  name: string;
  email: string;
  position: string;
  departments: string[];
  isAdmin: boolean;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface StoreUsersResponse {
  store: {
    _id: string;
    storeNumber: string;
    name: string;
  };
  admins: StoreUser[];
  users: StoreUser[];
  totalUsers: number;
}

export interface NewStoreData {
  storeNumber: string;
  name: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

export interface NewUserData {
  name: string;
  email: string;
  position: string;
  departments: string[];
  isAdmin?: boolean;
  generatePassword?: boolean;
  password?: string;
}

const adminService = {
  /**
   * Get all stores in the system
   */
  getAllStores: async (): Promise<Store[]> => {
    const response = await api.get('/api/admin/stores');
    return response.data.stores;
  },

  /**
   * Add a new store to the system
   */
  addStore: async (storeData: NewStoreData) => {
    const response = await api.post('/api/admin/stores', storeData);
    return response.data;
  },

  /**
   * Update store status (active/inactive)
   */
  updateStoreStatus: async (storeId: string, status: 'active' | 'inactive') => {
    const response = await api.put('/api/admin/stores/status', { storeId, status });
    return response.data;
  },

  /**
   * Get store users and admins
   */
  getStoreUsers: async (storeId: string): Promise<StoreUsersResponse> => {
    const response = await api.get(`/api/admin/stores/${storeId}/users`);
    return response.data;
  },

  /**
   * Add a user to a store
   */
  addStoreUser: async (storeId: string, userData: NewUserData) => {
    const response = await api.post(`/api/admin/stores/${storeId}/users`, userData);
    return response.data;
  }
};

export default adminService;
