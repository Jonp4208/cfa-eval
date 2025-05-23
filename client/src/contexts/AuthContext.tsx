import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User } from '@/types/user';
import { Store } from '@/types/store';
import userStoreService from '@/services/userStoreService';
import ExpiredSubscriptionOverlay from '@/components/ExpiredSubscriptionOverlay';

interface AuthContextType {
  user: User | null;
  store: Store | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchStore: (storeId: string) => Promise<void>;
  isLoading: boolean;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none' | null;
  dismissExpiredOverlay: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'trial' | 'none' | null>(null);
  const [showExpiredOverlay, setShowExpiredOverlay] = useState(false);

  // Function to dismiss the expired subscription overlay
  // This is kept for API compatibility but not used anymore
  const dismissExpiredOverlay = () => {
    // We no longer allow dismissing the overlay without requesting reactivation
    // setShowExpiredOverlay(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        try {
          const response = await api.get('/api/auth/profile');
          setUser(response.data.user);
          setStore(response.data.store);

          // Fetch subscription status
          try {
            const subscriptionResponse = await api.get('/api/subscriptions/status');
            setSubscriptionStatus(subscriptionResponse.data.subscriptionStatus);

            // Check if subscription is expired
            if (subscriptionResponse.data.subscriptionStatus === 'expired') {
              setShowExpiredOverlay(true);
            }
          } catch (subscriptionError) {
            console.error('Failed to fetch subscription status:', subscriptionError);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);

          // If we have a refresh token, try to refresh the access token
          if (refreshToken) {
            try {
              const refreshResponse = await api.post('/api/auth/refresh', { refreshToken });
              const newToken = refreshResponse.data.token;

              localStorage.setItem('token', newToken);
              setToken(newToken);

              // Try to fetch the profile again with the new token
              const profileResponse = await api.get('/api/auth/profile');
              setUser(profileResponse.data.user);
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              // If refresh fails, clear all tokens and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setToken(null);
              setUser(null);
              window.location.href = '/login';
            }
          } else {
            // No refresh token, clear access token and redirect to login
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            window.location.href = '/login';
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Clear any existing auth state before attempting login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);

    try {
      const response = await api.post('/api/auth/login', { email, password });

      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid login response from server');
      }

      const { token, refreshToken, user } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setToken(token);
      setUser(user);
      setStore(response.data.store);

      // Fetch subscription status after login
      try {
        const subscriptionResponse = await api.get('/api/subscriptions/status');
        setSubscriptionStatus(subscriptionResponse.data.subscriptionStatus);

        // Check if subscription is expired
        if (subscriptionResponse.data.subscriptionStatus === 'expired') {
          setShowExpiredOverlay(true);
        }
      } catch (subscriptionError) {
        console.error('Failed to fetch subscription status after login:', subscriptionError);
      }

      return response.data;
    } catch (error: any) {
      // Ensure auth state is cleared on login error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);

    // Redirect to login page after logout
    window.location.href = '/login';
  };

  // Switch store function - only for Jonathon Pope
  const switchStore = async (storeId: string) => {
    try {
      const response = await userStoreService.switchStore(storeId);

      // Update token and user in local storage and state
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      setToken(response.token);
      setUser(response.user);
      setStore(response.store);

      // Fetch subscription status after switching store
      try {
        const subscriptionResponse = await api.get('/api/subscriptions/status');
        setSubscriptionStatus(subscriptionResponse.data.subscriptionStatus);

        // Check if subscription is expired
        if (subscriptionResponse.data.subscriptionStatus === 'expired') {
          setShowExpiredOverlay(true);
        }
      } catch (subscriptionError) {
        console.error('Failed to fetch subscription status after switching store:', subscriptionError);
      }

      return response;
    } catch (error: any) {
      console.error('Failed to switch store:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        token,
        login,
        logout,
        switchStore,
        isLoading,
        subscriptionStatus,
        dismissExpiredOverlay
      }}
    >
      {children}
      {showExpiredOverlay && <ExpiredSubscriptionOverlay onClose={dismissExpiredOverlay} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};