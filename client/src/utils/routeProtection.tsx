import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNotification } from '@/contexts/NotificationContext';
import Layout from '@/components/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: 'fohTasks' | 'setups' | 'kitchen' | 'documentation' | 'training' | 'evaluations' | 'leadership';
}

/**
 * A wrapper component that protects routes based on authentication and subscription status
 * @param children The component to render if the user is authenticated and has access
 * @param requiredFeature Optional feature that is required to access this route
 */
export function ProtectedRoute({ children, requiredFeature }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { isFeatureEnabled } = useSubscription();
  const { showNotification } = useNotification();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific feature is required, check if it's enabled
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    // Show a toast notification once
    const toastShown = sessionStorage.getItem(`feature_toast_${requiredFeature}`);
    if (!toastShown) {
      // Show a toast notification
      // Format the feature name to be more readable
      const featureNames = {
        'fohTasks': 'FOH Tasks',
        'setups': 'Setup Sheet',
        'kitchen': 'Kitchen',
        'documentation': 'Documentation',
        'training': 'Training',
        'evaluations': 'Evaluations',
        'leadership': 'Leadership'
      };

      const featureName = featureNames[requiredFeature] || requiredFeature;

      showNotification(
        'warning',
        'Feature Not Available',
        `The ${featureName} feature is not enabled in your subscription. You are being redirected to subscription settings.`
      );

      // Mark this toast as shown for this session
      sessionStorage.setItem(`feature_toast_${requiredFeature}`, 'true');
    }

    // Redirect to settings page with subscription tab active and feature highlighted
    return (
      <Navigate
        to={`/settings?tab=subscription&requiredFeature=${requiredFeature}`}
        replace
      />
    );
  }

  // User is authenticated and has access to the required feature
  return <Layout>{children}</Layout>;
}
