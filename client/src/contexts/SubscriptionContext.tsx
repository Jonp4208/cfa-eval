import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '@/lib/axios';
import { useAuth } from './AuthContext';

interface SubscriptionFeatures {
  leadershipPlans: boolean;
  [key: string]: boolean;
}

interface SubscriptionPeriod {
  startDate: string;
  endDate: string;
}

interface SubscriptionState {
  hasActiveSubscription: boolean;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
  features: SubscriptionFeatures;
  currentPeriod: SubscriptionPeriod | null;
  loading: boolean;
  error: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    hasActiveSubscription: false,
    subscriptionStatus: 'none',
    features: {
      leadershipPlans: false
    },
    currentPeriod: null,
    loading: true,
    error: null
  });

  const fetchSubscriptionStatus = async (forceRefresh = false) => {
    // Only check for user, since isAuthenticated might not be set yet
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Add a cache-busting parameter when force refreshing
      const url = forceRefresh
        ? `/api/leadership/subscription-status?t=${Date.now()}`
        : '/api/leadership/subscription-status';

      // Use the configured API client
      const response = await api.get(url);
      const data = response.data;

      // Use the actual data from the server
      setState({
        ...data,
        loading: false,
        error: null
      });

      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);

      // On error, set a default state but don't force active
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch subscription status'
      }));

      return null;
    }
  };

  useEffect(() => {
    // Force refresh on initial load
    fetchSubscriptionStatus(true);

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchSubscriptionStatus(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user]); // Only depend on user, not isAuthenticated

  const refreshSubscription = async () => {
    return await fetchSubscriptionStatus(true);
  };

  const value = {
    ...state,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
