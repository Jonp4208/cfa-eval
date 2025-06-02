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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Define the subscription sections with enhanced information and custom pricing
  const subscriptionSections = [
    {
      key: 'fohTasks',
      label: 'FOH Tasks',
      description: 'Front of house task management and checklists',
      icon: '🏪',
      price: 20,
      features: ['Daily task checklists', 'Task assignment', 'Progress tracking', 'Team accountability']
    },
    {
      key: 'setups',
      label: 'Setup Sheet',
      description: 'Setup sheet templates and management',
      icon: '📋',
      price: 0,
      features: ['Custom templates', 'Setup scheduling', 'Team assignments', 'Progress monitoring']
    },
    {
      key: 'kitchen',
      label: 'Kitchen',
      description: 'Kitchen management, waste tracking, and checklists',
      icon: '👨‍🍳',
      price: 50,
      features: ['Waste tracking', 'Food safety checklists', 'Equipment monitoring', 'Analytics dashboard']
    },
    {
      key: 'documentation',
      label: 'Documentation',
      description: 'Employee documentation and records',
      icon: '📄',
      price: 50,
      features: ['Employee records', 'Document storage', 'Compliance tracking', 'Digital signatures']
    },
    {
      key: 'training',
      label: 'Training',
      description: 'Employee training plans and progress tracking',
      icon: '🎓',
      price: 50,
      features: ['Training modules', 'Progress tracking', 'Certification management', 'Skills assessment']
    },
    {
      key: 'evaluations',
      label: 'Evaluations',
      description: 'Employee evaluations and performance reviews',
      icon: '⭐',
      price: 100,
      features: ['Performance reviews', '360 feedback', 'Goal setting', 'Development plans']
    },
    {
      key: 'leadership',
      label: 'Leadership Development',
      description: 'Leadership development plans and tracking',
      icon: '👑',
      price: 100,
      features: ['Leadership assessments', 'Development plans', 'Mentoring tools', 'Growth tracking']
    }
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

  // Calculate total cost based on enabled features and their individual pricing
  const calculateTotalCost = () => {
    return subscriptionSections.reduce((total, section) => {
      const isEnabled = features[section.key as keyof typeof features] || false;
      return total + (isEnabled ? section.price : 0);
    }, 0);
  };

  const rawMonthlyTotalCost = calculateTotalCost();
  const maxMonthlyPrice = 200;
  const yearlyDiscount = 0.15; // 15% discount for yearly billing

  // Calculate costs based on billing cycle
  const monthlyTotalCost = Math.min(rawMonthlyTotalCost, maxMonthlyPrice);
  const yearlyTotalCost = Math.min(rawMonthlyTotalCost * 12 * (1 - yearlyDiscount), maxMonthlyPrice * 12 * (1 - yearlyDiscount));

  const totalCost = billingCycle === 'monthly' ? monthlyTotalCost : yearlyTotalCost;
  const isAtMaxPrice = rawMonthlyTotalCost >= maxMonthlyPrice;

  // Get all features that would be included at max price
  const getAllFeaturesValue = () => {
    return subscriptionSections.reduce((total, section) => total + section.price, 0);
  };

  // Calculate yearly savings
  const yearlyFullPrice = rawMonthlyTotalCost * 12;
  const yearlyDiscountedPrice = yearlyFullPrice * (1 - yearlyDiscount);
  const yearlySavings = yearlyFullPrice - yearlyDiscountedPrice;



  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#E51636] to-[#C41230] rounded-2xl mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the features your store needs. Pay only for what you use with our flexible pricing model.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <div className="bg-white rounded-2xl p-2 shadow-lg border">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#E51636] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-[#E51636] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getSubscriptionStatusIcon()}
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{getSubscriptionStatusText()}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {currentPeriod && `Current period: ${formatDate(currentPeriod.startDate)} - ${formatDate(currentPeriod.endDate)}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {subscriptionStatus === 'none' && (
                <Button
                  className="bg-[#E51636] hover:bg-[#C41230] text-white px-6 py-3 rounded-xl font-semibold"
                  onClick={handleStartTrial}
                  disabled={loading}
                >
                  Start 14-Day Free Trial
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="rounded-xl"
              >
                {refreshing || loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingChanges && pendingChanges.hasChanges && (
            <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center text-amber-700 mb-2">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-semibold">Pending Changes</span>
              </div>
              <p className="text-sm text-amber-700">
                Your subscription changes will take effect on {formatDate(pendingChanges.effectiveDate)}.
              </p>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Cost Summary</h3>
                <p className="text-gray-600">
                  {isAtMaxPrice
                    ? "🎉 Maximum price reached - All features included!"
                    : "Based on your selected features"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#E51636]">{formatCurrency(totalCost)}</div>
                <div className="text-sm text-gray-500">
                  {billingCycle === 'monthly' ? 'per month' : 'per year'}
                </div>
                {billingCycle === 'yearly' && yearlySavings > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Save {formatCurrency(yearlySavings)} annually!
                  </div>
                )}
                {isAtMaxPrice && rawMonthlyTotalCost > maxMonthlyPrice && (
                  <div className="text-xs text-green-600 font-medium">
                    Save {formatCurrency(rawMonthlyTotalCost - maxMonthlyPrice)}/month!
                  </div>
                )}
              </div>
            </div>

            {isAtMaxPrice && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">All Features Unlocked!</span>
                </div>
                <p className="text-sm text-green-700">
                  You've reached our maximum {billingCycle} price of {formatCurrency(billingCycle === 'monthly' ? maxMonthlyPrice : maxMonthlyPrice * 12 * (1 - yearlyDiscount))}.
                  All current and future features are now included at no additional cost!
                </p>
              </div>
            )}

            {pendingCost !== null && pendingCost !== totalCost && (
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <h4 className="font-semibold text-amber-800">Future Monthly Cost</h4>
                  <p className="text-sm text-amber-700">Effective {formatDate(pendingChanges?.effectiveDate || '')}</p>
                </div>
                <div className="text-2xl font-bold text-amber-800">{formatCurrency(pendingCost)}</div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {isAtMaxPrice
                    ? "All features included"
                    : "Custom pricing per feature"
                  }
                </span>
                <span>
                  {isAtMaxPrice
                    ? `${subscriptionSections.length}/${subscriptionSections.length} features`
                    : `${subscriptionSections.filter(s => features[s.key as keyof typeof features]).length}/${subscriptionSections.length} features enabled`
                  }
                </span>
              </div>
              {!isAtMaxPrice && (
                <div className="mt-2 text-xs text-gray-500">
                  💡 Tip: Enable features worth {formatCurrency(maxMonthlyPrice)} or more to unlock everything for just {formatCurrency(billingCycle === 'monthly' ? maxMonthlyPrice : maxMonthlyPrice * 12 * (1 - yearlyDiscount))}/{billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Features</h2>
          <p className="text-gray-600">Select the features that best fit your store's needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Everything Plan Card - Show when close to max price */}
          {!isAtMaxPrice && rawMonthlyTotalCost >= 150 && (
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 ring-2 ring-purple-300 shadow-xl">
              <div className="absolute top-4 right-4">
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  RECOMMENDED
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">🌟</div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                      Everything Plan
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      Get all features now and future ones at our maximum price
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Includes ALL features:</h4>
                  <ul className="space-y-1">
                    {subscriptionSections.map((section, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {section.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(billingCycle === 'monthly' ? maxMonthlyPrice : maxMonthlyPrice * 12 * (1 - yearlyDiscount))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {billingCycle === 'monthly' ? 'per month' : 'per year'}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        {billingCycle === 'monthly'
                          ? `Save ${formatCurrency(getAllFeaturesValue() - maxMonthlyPrice)}!`
                          : `Save ${formatCurrency((getAllFeaturesValue() * 12) - (maxMonthlyPrice * 12 * (1 - yearlyDiscount)))}!`
                        }
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        // Enable all features
                        subscriptionSections.forEach(section => {
                          if (!features[section.key as keyof typeof features]) {
                            handleToggleFeature(section.key, true);
                          }
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Enable All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {subscriptionSections.map((section) => {
            const isEnabled = features[section.key as keyof typeof features] || false;
            const isHighlighted = highlightedFeature === section.key;
            const isIncludedInMaxPlan = isAtMaxPrice;

            return (
              <Card
                key={section.key}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isHighlighted ? 'ring-2 ring-[#E51636] shadow-lg' : ''
                } ${
                  isEnabled || isIncludedInMaxPlan
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Feature Status Badge */}
                <div className="absolute top-4 right-4">
                  {isEnabled || isIncludedInMaxPlan ? (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {isIncludedInMaxPlan && !isEnabled ? 'INCLUDED' : 'ACTIVE'}
                    </div>
                  ) : (
                    <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      INACTIVE
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{section.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                        {section.label}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Includes:</h4>
                    <ul className="space-y-1">
                      {section.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        {isIncludedInMaxPlan && !isEnabled ? (
                          <div>
                            <div className="text-2xl font-bold text-green-600">INCLUDED</div>
                            <div className="text-sm text-gray-500">in max plan</div>
                          </div>
                        ) : section.price === 0 ? (
                          <div>
                            <div className="text-2xl font-bold text-green-600">FREE</div>
                            <div className="text-sm text-gray-500">included</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-2xl font-bold text-[#E51636]">
                              {formatCurrency(billingCycle === 'monthly' ? section.price : section.price * 12 * (1 - yearlyDiscount))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {billingCycle === 'monthly' ? 'per month' : 'per year'}
                            </div>
                            {billingCycle === 'yearly' && section.price > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                Save {formatCurrency(section.price * 12 * yearlyDiscount)}!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Label htmlFor={`toggle-${section.key}`} className="text-sm font-medium">
                          {isEnabled || isIncludedInMaxPlan ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`toggle-${section.key}`}
                          checked={isEnabled || isIncludedInMaxPlan}
                          onCheckedChange={(checked) => handleToggleFeature(section.key, checked)}
                          disabled={loading || isIncludedInMaxPlan}
                          className="data-[state=checked]:bg-[#E51636]"
                        />
                      </div>
                    </div>
                    {isIncludedInMaxPlan && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✨ Automatically included in your {formatCurrency(billingCycle === 'monthly' ? maxMonthlyPrice : maxMonthlyPrice * 12 * (1 - yearlyDiscount))}/{billingCycle === 'monthly' ? 'month' : 'year'} plan
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Bar */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600 mb-1">
                  Disabled features will be hidden from your navigation menu
                </p>
                <div className="flex items-center justify-center sm:justify-start">
                  <CreditCard className="h-5 w-5 mr-2 text-[#E51636]" />
                  <span className="text-lg font-bold text-gray-900">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Total: {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              {subscriptionStatus === 'active' && !hasPendingChanges() && (
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={loading}
                  className="bg-[#E51636] hover:bg-[#C41230] text-white px-8 py-3 rounded-xl font-semibold"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#E51636] rounded-full flex items-center justify-center mb-4">
              <Save className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">Confirm Subscription Changes</DialogTitle>
            <DialogDescription className="text-gray-600">
              Your subscription changes will take effect at the end of your current billing period.
              {currentPeriod && (
                <span className="block mt-2 font-semibold text-gray-900">
                  Effective date: {formatDate(currentPeriod.endDate)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Changes Summary:</h3>
              <div className="space-y-2">
                {subscriptionSections.map(section => {
                  const currentValue = features[section.key as keyof typeof features] || false;
                  const originalValue = pendingChanges?.features?.[section.key as keyof typeof features];

                  // Only show if there's a change from the original state
                  if (originalValue !== undefined && currentValue !== originalValue) {
                    return (
                      <div key={section.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{section.icon}</span>
                          <span className="font-medium">{section.label}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          currentValue
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentValue ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#E51636] to-[#C41230] p-4 rounded-xl text-white">
              <div className="flex justify-between items-center">
                <span className="font-semibold">New Monthly Cost:</span>
                <span className="text-2xl font-bold">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitChanges}
              disabled={submitting}
              className="flex-1 bg-[#E51636] hover:bg-[#C41230]"
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
