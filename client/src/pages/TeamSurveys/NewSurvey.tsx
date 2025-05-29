import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  Clock,
  Bell,
  CheckCircle,
  Eye,
  Target,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotification } from '@/contexts/NotificationContext';
import { teamSurveysService } from '@/lib/services/teamSurveys';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';

export default function NewTeamSurvey() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: 'Quarterly Team Experience Survey',
    description: 'Anonymous survey to gather feedback on team member experience and satisfaction',
    useDefaultQuestions: true,
    targetAudience: {
      includeAll: true,
      departments: ['Front of House', 'Back of House', 'Management'],
      positions: []
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      frequency: 'quarterly' as const
    },
    settings: {
      allowMultipleResponses: false,
      showProgressBar: true,
      requireAllQuestions: true,
      sendReminders: true,
      reminderDays: [7, 3, 1]
    }
  });

  const createSurveyMutation = useMutation({
    mutationFn: teamSurveysService.createSurvey,
    onSuccess: (data) => {
      showNotification('Survey created successfully!', 'success');
      navigate(`/team-surveys/${data.survey._id}/edit`);
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Failed to create survey', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const surveyData = {
      ...formData,
      questions: formData.useDefaultQuestions ? undefined : [] // Use default questions or empty array
    };

    createSurveyMutation.mutate(surveyData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <form id="survey-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Basic Information
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Configure the essential details of your survey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Survey Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Q1 2025 Team Experience Survey"
                  required
                  className="h-12 text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and goals of this survey..."
                  rows={4}
                  className="text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 resize-none"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Switch
                      id="useDefaultQuestions"
                      checked={formData.useDefaultQuestions}
                      onCheckedChange={(checked) => handleInputChange('useDefaultQuestions', checked)}
                      className="data-[state=checked]:bg-[#E51636]"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="useDefaultQuestions" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Use Default Team Experience Questions
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Includes 22 professionally crafted questions covering job satisfaction, leadership effectiveness,
                      workplace culture, and improvement suggestions. Perfect for comprehensive team feedback.
                    </p>
                    {formData.useDefaultQuestions && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Default questions will be automatically included
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Target Audience
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Define who will receive this survey invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Switch
                      id="includeAll"
                      checked={formData.targetAudience.includeAll}
                      onCheckedChange={(checked) => handleNestedChange('targetAudience', 'includeAll', checked)}
                      className="data-[state=checked]:bg-[#E51636]"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="includeAll" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Send to All Team Members
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Include all active team members across all departments and positions for maximum feedback coverage.
                    </p>
                    {formData.targetAudience.includeAll && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                        <Users className="w-4 h-4" />
                        Survey will be sent to all team members
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!formData.targetAudience.includeAll && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900">Advanced Targeting</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Selective targeting by departments, positions, and experience levels is coming soon!
                        For now, surveys will be sent to all team members.
                      </p>
                      <div className="mt-2 text-xs text-amber-600">
                        Available departments: Front of House, Back of House, Management
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Schedule
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Define when the survey will be active and available to team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.schedule.startDate}
                    onChange={(e) => handleNestedChange('schedule', 'startDate', e.target.value)}
                    required
                    className="h-12 text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20"
                  />
                  <p className="text-xs text-gray-500">When team members can start taking the survey</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.schedule.endDate}
                    onChange={(e) => handleNestedChange('schedule', 'endDate', e.target.value)}
                    required
                    className="h-12 text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20"
                  />
                  <p className="text-xs text-gray-500">When the survey will automatically close</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
                  Survey Frequency
                </Label>
                <Select
                  value={formData.schedule.frequency}
                  onValueChange={(value) => handleNestedChange('schedule', 'frequency', value)}
                >
                  <SelectTrigger className="h-12 text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time Survey</SelectItem>
                    <SelectItem value="quarterly">Quarterly (Recommended)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.schedule.frequency === 'quarterly' && 'Perfect for comprehensive team feedback every 3 months'}
                  {formData.schedule.frequency === 'monthly' && 'Regular monthly check-ins with your team'}
                  {formData.schedule.frequency === 'one-time' && 'Single survey for specific feedback or events'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Survey Settings */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Survey Settings
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Configure how the survey behaves and appears to respondents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <Label htmlFor="showProgressBar" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Show Progress Bar
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">Help respondents see their progress through the survey</p>
                  </div>
                  <Switch
                    id="showProgressBar"
                    checked={formData.settings.showProgressBar}
                    onCheckedChange={(checked) => handleNestedChange('settings', 'showProgressBar', checked)}
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                      <Label htmlFor="requireAllQuestions" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Require All Questions
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">Make all questions mandatory for complete responses</p>
                  </div>
                  <Switch
                    id="requireAllQuestions"
                    checked={formData.settings.requireAllQuestions}
                    onCheckedChange={(checked) => handleNestedChange('settings', 'requireAllQuestions', checked)}
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <Label htmlFor="sendReminders" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Send Reminders
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">Automatically remind team members to complete the survey</p>
                    {formData.settings.sendReminders && (
                      <p className="text-xs text-blue-600 mt-1">Reminders will be sent 7, 3, and 1 days before closing</p>
                    )}
                  </div>
                  <Switch
                    id="sendReminders"
                    checked={formData.settings.sendReminders}
                    onCheckedChange={(checked) => handleNestedChange('settings', 'sendReminders', checked)}
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/team-surveys')}
              className="px-6 py-3 text-base font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={createSurveyMutation.isPending}
              className="px-8 py-3 text-base font-medium bg-gradient-to-r from-[#E51636] to-[#D01530] hover:from-[#D01530] hover:to-[#B91C3C] text-white shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {createSurveyMutation.isPending ? 'Creating Survey...' : 'Create Survey'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
