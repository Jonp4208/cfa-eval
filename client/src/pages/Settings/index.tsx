// File: src/pages/Settings/index.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, FileText, Bell, BarChart, Save, RotateCcw, Scale, Mail, LayoutDashboard, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";
import ChangePasswordForm from './components/ChangePasswordForm';
import MobileNavigationSettings from './components/MobileNavigationSettings';
import SubscriptionSettings from './components/SubscriptionSettings';
import { settingsService } from '@/lib/services/settings';
import { userPreferencesService } from '@/lib/services/userPreferences';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
import GradingScales from './components/GradingScales';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  // Get the tab from URL query parameter
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  // State to track active tab for keyboard navigation
  const [activeTab, setActiveTab] = useState(
    tabParam && ['general', 'subscription', 'password', 'mobile-navigation', 'grading-scales'].includes(tabParam)
      ? tabParam
      : 'general'
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const { toast } = useToast();

  // State to track form changes
  const [formState, setFormState] = useState({
    storeName: '',
    storeNumber: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    visionStatement: '',
    missionStatement: ''
  });

  // Fetch settings and store info
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings
  });

  // Fetch user preferences
  const { data: userPreferences, isLoading: isUserPreferencesLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: userPreferencesService.getUserPreferences
  });

  // Create a mutation for updating user preferences
  const updateUserPreferencesMutation = useMutation({
    mutationFn: userPreferencesService.updateUserPreferences,
    onSuccess: (data) => {
      toast({
        title: "Settings saved",
        description: t('settings.settingsSaved'),
      });

      // Update the cache directly with the returned data
      queryClient.setQueryData(['userPreferences'], data);

      // Then invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: t('settings.errorSavingSettings'),
      });
      handleError(error, 'Error updating user preferences');
    }
  });

  // Define available tabs based on user role
  const availableTabs = [
    'general',
    ...(isAdmin ? ['subscription'] : []), // Only admins can see subscription tab
    'password',
    'mobile-navigation',
    ...(isAdmin ? ['grading-scales'] : [])
  ];

  // Handle keyboard navigation between tabs
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      // Alt + number keys for quick tab access
      const numKey = parseInt(e.key);
      if (!isNaN(numKey) && numKey > 0 && numKey <= availableTabs.length) {
        setActiveTab(availableTabs[numKey - 1]);
        e.preventDefault();
      }
    } else if (e.ctrlKey) {
      // Ctrl + arrow keys for tab navigation
      if (e.key === 'ArrowRight') {
        const currentIndex = availableTabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % availableTabs.length;
        setActiveTab(availableTabs[nextIndex]);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = availableTabs.indexOf(activeTab);
        const prevIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
        setActiveTab(availableTabs[prevIndex]);
        e.preventDefault();
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation as any);
    return () => {
      document.removeEventListener('keydown', handleKeyNavigation as any);
    };
  }, [activeTab, isAdmin]);

  // Update form state when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormState({
        storeName: settings.storeName || '',
        storeNumber: settings.storeNumber || '',
        storeAddress: settings.storeAddress || '',
        storePhone: settings.storePhone || '',
        storeEmail: settings.storeEmail || '',
        visionStatement: settings.visionStatement || '',
        missionStatement: settings.missionStatement || ''
      });
    }
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));

    // For toggle switches, update immediately
    if (typeof value === 'boolean') {
      updateSettingsMutation.mutate({
        [key]: value
      });
    }
  };

  // Update mutations
  const updateSettingsMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (data) => {
      // If this was an auto-schedule enable, show scheduling results
      if (data.schedulingResults) {
        toast({
          title: "Auto-scheduling enabled",
          description: `Auto-scheduling enabled successfully. ${data.schedulingResults.scheduled} employees scheduled for evaluation.`,
        });
      } else {
        toast({
          title: "Settings saved",
          description: t('settings.settingsSaved'),
        });
      }

      // Update the cache directly with the returned data
      queryClient.setQueryData(['settings'], data);

      // Then invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });

      // If store information was updated, also invalidate store-related caches
      const storeFields = ['storeName', 'storeAddress', 'storePhone', 'storeEmail'];
      const hasStoreUpdates = Object.keys(data).some(key => storeFields.includes(key));
      if (hasStoreUpdates) {
        queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stores-selector'] });
        queryClient.invalidateQueries({ queryKey: ['current-store'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t('settings.updateError');
      const issues = error.response?.data?.issues || [];

      // Update the settings with configuration issues
      if (error.response?.data?.configurationIssues) {
        queryClient.setQueryData(['settings'], (oldData: any) => ({
          ...oldData,
          evaluations: {
            ...oldData.evaluations,
            configurationIssues: error.response.data.configurationIssues
          }
        }));
      }

      console.error('Settings mutation error:', errorMessage, issues);

      let description = errorMessage;
      if (issues.length > 0) {
        description = `${errorMessage}: ${issues.join(', ')}`;
      }

      toast({
        variant: "destructive",
        title: "Error updating settings",
        description: description,
      });
    }
  });

  const updateStoreInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/api/settings/store', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Store information saved",
        description: t('settings.settingsSaved'),
      });

      // Invalidate all relevant caches to ensure store info updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores-selector'] });
      queryClient.invalidateQueries({ queryKey: ['current-store'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error saving store information",
        description: error.response?.data?.message || t('settings.updateError'),
      });
    }
  });

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/settings/reset');
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Settings reset",
        description: t('settings.resetSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error resetting settings",
        description: error.response?.data?.message || t('settings.updateError'),
      });
    }
  });

  const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Use the store update endpoint for store information
      if (isAdmin) {
        await updateStoreInfoMutation.mutateAsync({
          name: formState.storeName,
          // storeNumber is intentionally omitted to prevent changes
          storeAddress: formState.storeAddress,
          storePhone: formState.storePhone,
          storeEmail: formState.storeEmail
        });
      }
    } catch (error) {
      console.error('Failed to save store information:', error);
    }
  };



  // Handle language change
  const handleLanguageChange = (value: 'en' | 'es') => {
    setLanguage(value);
    // The language change is now handled by the TranslationContext's setLanguage function,
    // which updates both localStorage and the backend settings
  };

  if (isSettingsLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
          icon={<SettingsIcon className="h-5 w-5" />}
          actions={
            <Button
              className={headerButtonClass}
              onClick={() => navigate('/')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          }
        />



        {/* Settings Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white rounded-[20px] p-1 h-auto flex flex-wrap gap-2" role="tablist" aria-label="Settings Tabs">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
              role="tab"
              aria-selected={activeTab === 'general'}
              tabIndex={activeTab === 'general' ? 0 : -1}
              aria-controls="general-tab"
              title="General Settings (Alt+1)"
            >
              {t('settings.general')}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="subscription"
                className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
                role="tab"
                aria-selected={activeTab === 'subscription'}
                tabIndex={activeTab === 'subscription' ? 0 : -1}
                aria-controls="subscription-tab"
                title="Subscription Settings (Alt+2)"
              >
                Subscription
              </TabsTrigger>
            )}
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
              role="tab"
              aria-selected={activeTab === 'password'}
              tabIndex={activeTab === 'password' ? 0 : -1}
              aria-controls="password-tab"
              title="Password Settings (Alt+2)"
            >
              Password
            </TabsTrigger>
            <TabsTrigger
              value="mobile-navigation"
              className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
              role="tab"
              aria-selected={activeTab === 'mobile-navigation'}
              tabIndex={activeTab === 'mobile-navigation' ? 0 : -1}
              aria-controls="mobile-navigation-tab"
              title="Mobile Navigation Settings (Alt+3)"
            >
              Mobile Menu
            </TabsTrigger>

            {isAdmin && (
              <TabsTrigger
                value="grading-scales"
                className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
                role="tab"
                aria-selected={activeTab === 'grading-scales'}
                tabIndex={activeTab === 'grading-scales' ? 0 : -1}
                aria-controls="grading-scales-tab"
                title="Grading Scales Settings (Alt+4)"
              >
                {t('settings.gradingScales')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" id="general-tab" role="tabpanel" aria-labelledby="general-tab" tabIndex={0} className="space-y-6">
            {/* Appearance Settings */}
            <Card className="rounded-[20px] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-[#E51636]" />
                  {t('settings.appearance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('settings.language')}</h3>
                    <p className="text-sm text-gray-500">{t('settings.languageDescription')}</p>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('settings.language')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('settings.english')}</SelectItem>
                      <SelectItem value="es">{t('settings.spanish')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Store Information */}
            {isAdmin && (
              <form onSubmit={handleSaveGeneral}>
                <Card className="rounded-[20px] shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#E51636]" />
                      {t('settings.storeInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="storeName" className="text-sm font-medium">{t('settings.storeName')}</label>
                        <Input
                          id="storeName"
                          value={formState.storeName}
                          onChange={(e) => handleSettingChange('storeName', e.target.value)}
                          placeholder={t('settings.storeName')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="storeNumber" className="text-sm font-medium">{t('settings.storeNumber')}</label>
                        <Input
                          id="storeNumber"
                          value={formState.storeNumber}
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                          placeholder={t('settings.storeNumber')}
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('settings.storeNumberReadOnly', 'Store number cannot be changed')}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="storeAddress" className="text-sm font-medium">{t('settings.storeAddress')}</label>
                        <Input
                          id="storeAddress"
                          value={formState.storeAddress}
                          onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                          placeholder={t('settings.storeAddress')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="storePhone" className="text-sm font-medium">{t('settings.storePhone')}</label>
                        <Input
                          id="storePhone"
                          value={formState.storePhone}
                          onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                          placeholder={t('settings.storePhone')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="storeEmail" className="text-sm font-medium">{t('settings.storeEmail')}</label>
                        <Input
                          id="storeEmail"
                          value={formState.storeEmail}
                          onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                          placeholder={t('settings.storeEmail')}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resetSettingsMutation.mutate()}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {t('settings.resetToDefault')}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#E51636] hover:bg-[#C41230] flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {t('settings.saveChanges')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
          </TabsContent>

          <TabsContent value="password" id="password-tab" role="tabpanel" aria-labelledby="password-tab" tabIndex={0}>
            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="mobile-navigation" id="mobile-navigation-tab" role="tabpanel" aria-labelledby="mobile-navigation-tab" tabIndex={0}>
            {userPreferences && (
              <MobileNavigationSettings
                preferences={userPreferences?.uiPreferences}
                onUpdate={(data) => {
                  console.log('Settings page received update request:', data);
                  updateUserPreferencesMutation.mutate({
                    uiPreferences: data
                  });
                }}
                isUpdating={updateUserPreferencesMutation.isPending}
              />
            )}
            {isUserPreferencesLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            )}
          </TabsContent>



          {isAdmin && (
            <TabsContent value="subscription" id="subscription-tab" role="tabpanel" aria-labelledby="subscription-tab" tabIndex={0}>
              <SubscriptionSettings />
            </TabsContent>
          )}

          <TabsContent value="grading-scales" id="grading-scales-tab" role="tabpanel" aria-labelledby="grading-scales-tab" tabIndex={0}>
            <GradingScales />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;