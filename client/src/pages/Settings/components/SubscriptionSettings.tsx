import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Clock, Save, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SubscriptionSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const { showNotification } = useNotification();
  const {
    features,
    subscriptionStatus,
    trialInfo,
    currentPeriod,
    pendingChanges,
    calculatedCost,
    pendingCost,
    pricing,
    loading,
    toggleFeature,
    submitChanges,
    startTrial,
    refreshSubscription,
    hasPendingChanges
  } = useSubscription();

  const [refreshing, setRefreshing] = useState(false);
  const [highlightedFeature, setHighlightedFeature] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Define the subscription sections
  const subscriptionSections = [
    { key: 'fohTasks', label: 'FOH Tasks', description: 'Front of house task management and checklists' },
    { key: 'setups', label: 'Setup Sheet', description: 'Setup sheet templates and management' },
    { key: 'kitchen', label: 'Kitchen', description: 'Kitchen management, waste tracking, and checklists' },
    { key: 'documentation', label: 'Documentation', description: 'Employee documentation and records' },
    { key: 'training', label: 'Training', description: 'Employee training plans and progress tracking' },
    { key: 'evaluations', label: 'Evaluations', description: 'Employee evaluations and performance reviews' },
    { key: 'leadership', label: 'Leadership', description: 'Leadership development plans and tracking' }
  ];

  // Check if we were redirected here with a required feature
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const requiredFeature = queryParams.get('requiredFeature');
    if (requiredFeature && subscriptionStatus !== 'active') {
      setHighlightedFeature(requiredFeature);

      // Get the section name from the subscription sections
      const sectionName = subscriptionSections.find(s => s.key === requiredFeature)?.label || requiredFeature;

      // Only show notification if subscription is not active
      if (subscriptionStatus !== 'active') {
        showNotification(
          'info',
          'Subscription Required',
          `The ${sectionName} feature requires a subscription. Please enable it to continue.`
        );
      }

      // Auto-enable the feature if we're in trial mode
      if (subscriptionStatus === 'trial') {
        toggleFeature(requiredFeature as any, true);
      }
    }
  }, [location.search, subscriptionStatus, toggleFeature, showNotification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    await toggleFeature(feature as any, enabled);
  };

  const handleStartTrial = async () => {
    await startTrial();
  };

  const handleSubmitChanges = async () => {
    try {
      console.log('Starting subscription changes submission...');
      setSubmitting(true);
      const result = await submitChanges();
      console.log('Subscription changes submission result:', result);
      setSubmitting(false);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error in handleSubmitChanges:', error);
      setSubmitting(false);
      showNotification(
        'error',
        'Error',
        'Failed to submit subscription changes. Please try again.'
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrialDaysRemaining = () => {
    if (!trialInfo?.trialEndDate) return 0;

    const endDate = new Date(trialInfo.trialEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getSubscriptionStatusText = () => {
    switch (subscriptionStatus) {
      case 'active':
        return 'Active Subscription';
      case 'trial':
        return `Free Trial (${getTrialDaysRemaining()} days remaining)`;
      case 'expired':
        return 'Expired Subscription';
      default:
        return 'No Subscription';
    }
  };

  const getSubscriptionStatusIcon = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trial':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };



  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and enabled features
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSubscriptionStatusIcon()}
                <span className="font-medium">{getSubscriptionStatusText()}</span>
              </div>
              {subscriptionStatus === 'none' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartTrial}
                  disabled={loading}
                >
                  Start 14-Day Free Trial
                </Button>
              )}
            </div>

            {currentPeriod && (
              <div className="text-sm text-gray-500">
                <p>Current period: {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}</p>
              </div>
            )}

            {pendingChanges && pendingChanges.hasChanges && (
              <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-md">
                <div className="flex items-center text-amber-700 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Pending Changes</span>
                </div>
                <p className="text-sm text-amber-700">
                  You have subscription changes that will take effect on {formatDate(pendingChanges.effectiveDate)}.
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md mt-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Current Monthly Cost</h3>
                  <p className="text-sm text-gray-500">Based on enabled sections</p>
                </div>
                <div className="text-xl font-bold">{formatCurrency(calculatedCost)}</div>
              </div>

              {pendingCost !== null && pendingCost !== calculatedCost && (
                <div className="flex justify-between items-center mt-2 text-amber-700">
                  <div>
                    <h3 className="font-medium">Future Monthly Cost</h3>
                    <p className="text-sm">Effective {formatDate(pendingChanges?.effectiveDate || '')}</p>
                  </div>
                  <div className="text-lg font-bold">{formatCurrency(pendingCost)}</div>
                </div>
              )}

              <div className="mt-2 text-sm text-gray-500">
                <p>Each section: {formatCurrency(pricing?.sectionPrice || 50)} | Maximum: {formatCurrency(pricing?.maxPrice || 200)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Sections</CardTitle>
          <CardDescription>
            Enable or disable sections based on your needs. You will only be charged for enabled sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptionSections.map((section) => (
              <div
                key={section.key}
                className={`flex justify-between items-center p-3 bg-white border rounded-md ${
                  highlightedFeature === section.key ? 'border-[#E51636] border-2 bg-red-50' : ''
                }`}
              >
                <div>
                  <p className="font-medium">{section.label}</p>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <div className="flex items-center">
                  <Switch
                    id={`toggle-${section.key}`}
                    checked={features[section.key as keyof typeof features] || false}
                    onCheckedChange={(checked) => handleToggleFeature(section.key, checked)}
                    disabled={loading}
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                  <Label htmlFor={`toggle-${section.key}`} className="ml-2">
                    {features[section.key as keyof typeof features] ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-sm text-gray-500">
            Disabled sections will be hidden from the navigation menu.
          </p>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium">
                Total: {formatCurrency(calculatedCost)}/month
              </span>
            </div>
            {subscriptionStatus === 'active' && !hasPendingChanges() && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={loading}
                className="whitespace-nowrap"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Changes
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Changes</DialogTitle>
            <DialogDescription>
              Your subscription changes will take effect at the end of your current billing period.
              {currentPeriod && (
                <span className="block mt-2 font-medium">
                  Effective date: {formatDate(currentPeriod.endDate)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h3 className="font-medium mb-2">Changes Summary:</h3>
            <ul className="space-y-1 text-sm">
              {subscriptionSections.map(section => {
                const currentValue = features[section.key as keyof typeof features] || false;
                const originalValue = pendingChanges?.features?.[section.key as keyof typeof features];

                // Only show if there's a change from the original state
                if (originalValue !== undefined && currentValue !== originalValue) {
                  return (
                    <li key={section.key} className="flex items-center">
                      <span className={currentValue ? 'text-green-600' : 'text-red-600'}>
                        {section.label}: {currentValue ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                  );
                }
                return null;
              }).filter(Boolean)}
            </ul>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">New Monthly Cost:</span>
                <span className="font-bold">{formatCurrency(calculatedCost)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitChanges}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionSettings;
