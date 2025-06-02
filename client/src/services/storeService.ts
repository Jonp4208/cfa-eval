import api from '@/lib/axios';

export interface StoreBasic {
  _id: string;
  storeNumber: string;
  name: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
}

const storeService = {
  /**
   * Get all stores (for admin users only)
   */
  getAllStores: async (): Promise<StoreBasic[]> => {
    const response = await api.get('/api/admin/stores');
    return response.data.stores;
  },

  /**
   * Get current store information
   */
  getCurrentStore: async (): Promise<StoreBasic> => {
    const response = await api.get('/api/stores/current');
    return response.data;
  },

  /**
   * Update current store information
   */
  updateCurrentStore: async (storeData: Partial<StoreBasic>): Promise<StoreBasic> => {
    const response = await api.patch('/api/stores/current', storeData);
    return response.data;
  }
};

export default storeService;
