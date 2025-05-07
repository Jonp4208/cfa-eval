// File: src/lib/services/userPreferences.ts
import api from '../axios';

export interface MobileNavigationItem {
  key: string;
  show: boolean;
}

export interface UIPreferences {
  mobileNavigation: {
    items: MobileNavigationItem[];
    maxItems: number;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    evaluationScheduled: boolean;
    evaluationCompleted: boolean;
    evaluationReminder: boolean;
  };
  inApp: {
    enabled: boolean;
    evaluationScheduled: boolean;
    evaluationCompleted: boolean;
    evaluationReminder: boolean;
  };
}

export interface UserPreferences {
  _id?: string;
  user: string;
  uiPreferences?: UIPreferences;
  notificationPreferences?: NotificationPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export const userPreferencesService = {
  getUserPreferences: async (): Promise<UserPreferences> => {
    try {
      const response = await api.get('/api/user-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  },

  updateUserPreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      const response = await api.patch('/api/user-preferences', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  resetUserPreferences: async (): Promise<UserPreferences> => {
    try {
      const response = await api.post('/api/user-preferences/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      throw error;
    }
  },

  // Helper method to update mobile navigation preferences
  updateMobileNavigation: async (items: MobileNavigationItem[]): Promise<UserPreferences> => {
    try {
      return await userPreferencesService.updateUserPreferences({
        uiPreferences: {
          mobileNavigation: {
            items,
            maxItems: 5
          }
        }
      });
    } catch (error) {
      console.error('Error updating mobile navigation preferences:', error);
      throw error;
    }
  }
};
