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
import { Settings as SettingsIcon, Users, FileText, Bell, BarChart, Save, RotateCcw, ChevronLeft, Scale, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import UserAccessSettings from './components/UserAccessSettings';
import ChangePasswordForm from './components/ChangePasswordForm';
import { settingsService } from '@/lib/services/settings';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import { useNavigate } from 'react-router-dom';
import GradingScales from './components/GradingScales';

const SettingsPage = () => {
  // State to track active tab for keyboard navigation
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const isAdmin = user?.role === 'admin';

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

  // Define available tabs based on user role
  const availableTabs = [
    'general',
    'password',
    ...(isAdmin ? ['users', 'grading-scales'] : [])
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
        setSuccess(`Auto-scheduling enabled successfully. ${data.schedulingResults.scheduled} employees scheduled for evaluation.`);
      } else {
        setSuccess(t('settings.settingsSaved'));
      }
      setTimeout(() => setSuccess(''), 3000);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
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
      setError(errorMessage);
      if (issues.length > 0) {
        setError(`${errorMessage}:\n${issues.join('\n')}`);
      }
      setSuccess('');
    }
  });

  const updateStoreInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/api/settings/store', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(t('settings.settingsSaved'));
      setTimeout(() => setSuccess(''), 3000);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('settings.updateError'));
      setSuccess('');
    }
  });

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/settings/reset');
      return response.data;
    },
    onSuccess: () => {
      setSuccess(t('settings.resetSuccess'));
      setTimeout(() => setSuccess(''), 3000);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('settings.updateError'));
      setSuccess('');
    }
  });

  const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isAdmin) {
        await updateStoreInfoMutation.mutateAsync({
          name: formState.storeName,
          storeNumber: formState.storeNumber,
          storeAddress: formState.storeAddress,
          storePhone: formState.storePhone,
          storeEmail: formState.storeEmail
        });
      }

      await updateSettingsMutation.mutateAsync({
        storeName: formState.storeName,
        storeNumber: formState.storeNumber,
        storeAddress: formState.storeAddress,
        storePhone: formState.storePhone,
        storeEmail: formState.storeEmail
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <div className="min-h-screen bg-[#F4F4F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{t('settings.title')}</h1>
                <p className="text-white/80 mt-2">{t('settings.subtitle')}</p>
              </div>
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-0 h-12 px-6"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[20px] shadow-sm">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                {error.split('\n').map((line, index) => (
                  <p key={index} className={index === 0 ? 'font-medium text-base' : 'mt-1 text-sm'}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-[20px] shadow-sm">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
              </svg>
              <p>{success}</p>
            </div>
          </div>
        )}

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
            {isAdmin && (
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-[#E51636] data-[state=active]:text-white rounded-[14px] h-10 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
                role="tab"
                aria-selected={activeTab === 'users'}
                tabIndex={activeTab === 'users' ? 0 : -1}
                aria-controls="users-tab"
                title="User Access Settings (Alt+3)"
              >
                {t('settings.userAccess')}
              </TabsTrigger>
            )}
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
                          onChange={(e) => handleSettingChange('storeNumber', e.target.value)}
                          placeholder={t('settings.storeNumber')}
                        />
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

          <TabsContent value="users" id="users-tab" role="tabpanel" aria-labelledby="users-tab" tabIndex={0}>
            <UserAccessSettings
              settings={settings?.userAccess}
              onUpdate={(data) => updateSettingsMutation.mutate({ userAccess: data })}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="grading-scales" id="grading-scales-tab" role="tabpanel" aria-labelledby="grading-scales-tab" tabIndex={0}>
            <GradingScales />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;