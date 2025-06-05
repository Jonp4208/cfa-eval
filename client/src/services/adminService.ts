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
      fohTasks: boolean;
      setups: boolean;
      kitchen: boolean;
      documentation: boolean;
      training: boolean;
      evaluations: boolean;
      leadership: boolean;
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
  adminEmail: string;
  adminName: string;
}

export interface UpdateStoreData {
  storeNumber?: string;
  name?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  createdAt?: string;
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

export interface SubscriptionFeatures {
  fohTasks: boolean;
  setups: boolean;
  kitchen: boolean;
  documentation: boolean;
  training: boolean;
  evaluations: boolean;
  leadership: boolean;
  leadershipPlans: boolean;
  [key: string]: boolean;
}

export interface PendingChanges {
  hasChanges: boolean;
  features: SubscriptionFeatures;
  effectiveDate: string;
  submittedAt: string;
}

export interface SubscriptionPricing {
  sectionPrice: number;
  maxPrice: number;
}

export interface StoreSubscription {
  _id: string;
  store: string;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
  features: SubscriptionFeatures;
  pricing: SubscriptionPricing;
  pendingChanges?: PendingChanges;
  currentPeriod?: {
    startDate: string;
    endDate: string;
  };
  calculatedCost?: number;
  pendingCost?: number;
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
   * Update store details
   */
  updateStore: async (storeId: string, storeData: UpdateStoreData) => {
    const response = await api.put(`/api/admin/stores/${storeId}`, storeData);
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
  },

  /**
   * Update user email
   */
  updateUserEmail: async (storeId: string, userId: string, email: string) => {
    const response = await api.put(`/api/admin/stores/${storeId}/users/${userId}/email`, { email });
    return response.data;
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (storeId: string, userId: string) => {
    const response = await api.post(`/api/admin/stores/${storeId}/users/${userId}/reset-password`);
    return response.data;
  },

  /**
   * Update store subscription status (active/expired/trial/none)
   */
  updateStoreSubscriptionStatus: async (storeId: string, subscriptionStatus: 'active' | 'expired' | 'trial' | 'none') => {
    const response = await api.put('/api/admin/stores/subscription-status', { storeId, subscriptionStatus })
    return response.data
  },

  /**
   * Get store subscription details
   */
  getStoreSubscription: async (storeId: string): Promise<{
    store: { _id: string; storeNumber: string; name: string };
    subscription: StoreSubscription;
    calculatedCost: number;
    pendingCost?: number;
  }> => {
    const response = await api.get(`/api/admin/stores/${storeId}/subscription`);
    return response.data;
  },

  /**
   * Update store subscription features
   */
  updateStoreSubscriptionFeatures: async (
    storeId: string,
    features: SubscriptionFeatures,
    applyImmediately: boolean = false
  ): Promise<StoreSubscription> => {
    const response = await api.put(`/api/admin/stores/${storeId}/subscription/features`, {
      features,
      applyImmediately
    });
    return response.data;
  }
};

export default adminService;
