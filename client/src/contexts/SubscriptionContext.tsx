import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface SubscriptionFeatures {
  // The 7 subscription sections
  fohTasks: boolean;
  setups: boolean;
  kitchen: boolean;
  documentation: boolean;
  training: boolean;
  evaluations: boolean;
  leadership: boolean;
  // Legacy feature - keeping for backward compatibility
  leadershipPlans: boolean;
  [key: string]: boolean;
}

interface SubscriptionPricing {
  sectionPrice: number;
  maxPrice: number;
}

interface SubscriptionTrialInfo {
  isInTrial: boolean;
  trialStartDate: string;
  trialEndDate: string;
}

interface SubscriptionPeriod {
  startDate: string;
  endDate: string;
}

interface PendingChanges {
  hasChanges: boolean;
  features: SubscriptionFeatures;
  effectiveDate: string;
  submittedAt: string;
}

interface SubscriptionState {
  hasActiveSubscription: boolean;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
  features: SubscriptionFeatures;
  pricing: SubscriptionPricing;
  trialInfo: SubscriptionTrialInfo | null;
  currentPeriod: SubscriptionPeriod | null;
  pendingChanges: PendingChanges | null;
  calculatedCost: number;
  pendingCost: number | null;
  loading: boolean;
  error: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  refreshSubscription: () => Promise<void>;
  toggleFeature: (feature: keyof SubscriptionFeatures, enabled: boolean) => Promise<void>;
  submitChanges: () => Promise<void>;
  startTrial: () => Promise<void>;
  isFeatureEnabled: (feature: keyof SubscriptionFeatures) => boolean;
  hasPendingChanges: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [state, setState] = useState<SubscriptionState>({
    hasActiveSubscription: true, // Default to active
    subscriptionStatus: 'active', // Default to active
    features: {
      fohTasks: true, // All features enabled by default
      setups: true,
      kitchen: true,
      documentation: true,
      training: true,
      evaluations: true,
      leadership: true,
      leadershipPlans: true
    },
    pricing: {
      sectionPrice: 50,
      maxPrice: 200
    },
    trialInfo: null,
    currentPeriod: null,
    pendingChanges: null,
    calculatedCost: 200, // Default to max cost since all features are enabled
    pendingCost: null,
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
        ? `/api/subscriptions/status?t=${Date.now()}`
        : '/api/subscriptions/status';

      // Use the configured API client
      const response = await api.get(url);
      const data = response.data;

      // Determine if subscription is active based on status
      const hasActiveSubscription =
        data.subscriptionStatus === 'active' ||
        data.subscriptionStatus === 'trial';

      // Use the actual data from the server
      setState({
        ...data,
        hasActiveSubscription,
        loading: false,
        error: null
      });

      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);

      // On error, set a default state with all features enabled
      setState({
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        features: {
          fohTasks: true,
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        },
        pricing: {
          sectionPrice: 50,
          maxPrice: 200
        },
        trialInfo: null,
        currentPeriod: null,
        pendingChanges: null,
        calculatedCost: 200,
        pendingCost: null,
        loading: false,
        error: null // Don't show error to prevent UI disruption
      });

      return null;
    }
  };

  // Toggle a subscription feature
  const toggleFeature = async (feature: keyof SubscriptionFeatures, enabled: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await api.put('/api/subscriptions/features', {
        features: {
          [feature]: enabled
        }
      });

      const data = response.data;

      // Determine if subscription is active based on status
      const hasActiveSubscription =
        data.subscriptionStatus === 'active' ||
        data.subscriptionStatus === 'trial';

      // Note: If subscription is expired, features will still be visible but disabled via isFeatureEnabled

      setState({
        ...data,
        hasActiveSubscription,
        loading: false,
        error: null
      });

      showNotification(
        'success',
        'Subscription Updated',
        `${feature} has been ${enabled ? 'enabled' : 'disabled'}.`
      );

      return data;
    } catch (error) {
      console.error('Error updating subscription feature:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update subscription feature'
      }));

      showNotification(
        'error',
        'Error',
        'Failed to update subscription feature.'
      );

      return null;
    }
  };

  // Start a free trial
  const startTrial = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await api.post('/api/subscriptions/start-trial');
      const data = response.data;

      // Determine if subscription is active based on status
      const hasActiveSubscription =
        data.subscriptionStatus === 'active' ||
        data.subscriptionStatus === 'trial';

      // Note: If subscription is expired, features will still be visible but disabled via isFeatureEnabled

      setState({
        ...data,
        hasActiveSubscription,
        loading: false,
        error: null
      });

      showNotification(
        'success',
        'Trial Started',
        'Your 14-day free trial has started. Enjoy full access to all features!'
      );

      return data;
    } catch (error) {
      console.error('Error starting trial:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to start trial'
      }));

      showNotification(
        'error',
        'Error',
        'Failed to start free trial.'
      );

      return null;
    }
  };

  // Submit subscription changes to take effect at next billing date
  const submitChanges = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      console.log('Submitting subscription changes:', state.features);
      const response = await api.post('/api/subscriptions/submit-changes', {
        features: state.features
      });

      const data = response.data;

      // Determine if subscription is active based on status
      const hasActiveSubscription =
        data.subscriptionStatus === 'active' ||
        data.subscriptionStatus === 'trial';

      // Note: If subscription is expired, features will still be visible but disabled via isFeatureEnabled

      setState({
        ...data,
        hasActiveSubscription,
        loading: false,
        error: null
      });

      // Format the effective date for display
      const effectiveDate = data.pendingChanges?.effectiveDate
        ? new Date(data.pendingChanges.effectiveDate).toLocaleDateString()
        : 'next billing date';

      showNotification(
        'success',
        'Subscription Changes Submitted',
        `Your subscription changes will take effect on ${effectiveDate}.`
      );

      return data;
    } catch (error) {
      console.error('Error submitting subscription changes:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to submit subscription changes'
      }));

      showNotification(
        'error',
        'Error',
        'Failed to submit subscription changes.'
      );

      return null;
    }
  };

  // Check if a feature is enabled
  const isFeatureEnabled = (feature: keyof SubscriptionFeatures): boolean => {
    // If subscription is expired or none, all features are disabled
    if (state.subscriptionStatus === 'expired' || state.subscriptionStatus === 'none') {
      return false;
    }

    // If in trial or active subscription, check if the feature is enabled
    if (state.hasActiveSubscription) {
      return state.features[feature] === true;
    }

    // If not active, feature is disabled
    return false;
  };

  // Check if there are pending changes
  const hasPendingChanges = (): boolean => {
    return state.pendingChanges?.hasChanges === true;
  };

  useEffect(() => {
    // Force refresh on initial load
    fetchSubscriptionStatus(true);

    // Set up a refresh interval (every 5 minutes instead of 30 seconds)
    const intervalId = setInterval(() => {
      fetchSubscriptionStatus(true);
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [user]); // Only depend on user, not isAuthenticated

  const refreshSubscription = async () => {
    return await fetchSubscriptionStatus(true);
  };

  const value = {
    ...state,
    refreshSubscription,
    toggleFeature,
    submitChanges,
    startTrial,
    isFeatureEnabled,
    hasPendingChanges
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
