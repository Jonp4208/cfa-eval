import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import {
  ArrowLeft,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  Clock,
  Mail,
  Target,
  Repeat,
  Save,
  CheckCircle,
  Eye,
  Bell,
  Sparkles
} from 'lucide-react';
import QuestionBuilder from '@/components/TeamSurveys/QuestionBuilder';
import { teamSurveysService } from '@/lib/services/teamSurveys';
import { toast } from 'sonner';

interface SurveyData {
  title: string;
  description: string;
  questions: any[];
  targetAudience: {
    departments: string[];
    positions: string[];
    experienceLevels: string[];
    employmentTypes: string[];
    includeAll: boolean;
    excludeRecentResponders: boolean;
    excludeRecentDays: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    frequency: string;
    autoActivate: boolean;
    isRecurring: boolean;
    recurringSettings: {
      dayOfQuarter: number;
      duration: number;
      autoClose: boolean;
    };
  };
  settings: {
    allowMultipleResponses: boolean;
    showProgressBar: boolean;
    requireAllQuestions: boolean;
    sendReminders: boolean;
    reminderDays: number[];
  };
  notifications: {
    emailTemplate: {
      subject: string;
      inviteMessage: string;
      reminderMessage: string;
    };
  };
}

const CreateAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [surveyData, setSurveyData] = useState<SurveyData>({
    title: '',
    description: '',
    questions: [],
    targetAudience: {
      departments: ['Front of House', 'Back of House', 'Management'],
      positions: [],
      experienceLevels: ['0-6 months', '6-12 months', '1-2 years', '2+ years'],
      employmentTypes: ['Full-time', 'Part-time'],
      includeAll: true,
      excludeRecentResponders: false,
      excludeRecentDays: 30
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'quarterly',
      autoActivate: false,
      isRecurring: false,
      recurringSettings: {
        dayOfQuarter: 1,
        duration: 14,
        autoClose: true
      }
    },
    settings: {
      allowMultipleResponses: false,
      showProgressBar: true,
      requireAllQuestions: true,
      sendReminders: true,
      reminderDays: [7, 3, 1]
    },
    notifications: {
      emailTemplate: {
        subject: 'Your Voice Matters - Team Experience Survey',
        inviteMessage: 'We value your feedback! Please take a few minutes to complete our anonymous team experience survey.',
        reminderMessage: 'This is a friendly reminder to complete the team experience survey. Your feedback is important to us!'
      }
    }
  });

  const createSurveyMutation = useMutation({
    mutationFn: teamSurveysService.createSurvey,
    onSuccess: () => {
      toast.success('Advanced survey created successfully!');
      queryClient.invalidateQueries({ queryKey: ['team-surveys'] });
      navigate('/team-surveys');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create survey');
    }
  });

  const handleSubmit = () => {
    if (!surveyData.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }

    if (surveyData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    createSurveyMutation.mutate(surveyData);
  };

  const updateSurveyData = (section: keyof SurveyData, data: any) => {
    setSurveyData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-gray-100 rounded-xl p-1">
            <TabsTrigger
              value="basic"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Questions</span>
              <span className="sm:hidden">Q's</span>
            </TabsTrigger>
            <TabsTrigger
              value="targeting"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Targeting</span>
              <span className="sm:hidden">Target</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
              <span className="sm:hidden">Time</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Email</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  Survey Information
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Configure the essential details of your advanced survey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Survey Title *
                  </Label>
                  <Input
                    id="title"
                    value={surveyData.title}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Q1 2025 Advanced Team Experience Survey"
                    className="h-12 text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={surveyData.description}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and goals of this survey..."
                    rows={4}
                    className="text-base border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="showProgress"
                        checked={surveyData.settings.showProgressBar}
                        onCheckedChange={(checked) =>
                          updateSurveyData('settings', { showProgressBar: checked })
                        }
                        className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636] mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="showProgress" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Show Progress Bar
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">Help respondents track their survey progress</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="requireAll"
                        checked={surveyData.settings.requireAllQuestions}
                        onCheckedChange={(checked) =>
                          updateSurveyData('settings', { requireAllQuestions: checked })
                        }
                        className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636] mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="requireAll" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Require All Questions
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">Make all questions mandatory for completion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="space-y-6">
          <QuestionBuilder
            questions={surveyData.questions}
            onChange={(questions) => setSurveyData(prev => ({ ...prev, questions }))}
          />
        </TabsContent>

          {/* Targeting */}
          <TabsContent value="targeting" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-xl flex items-center justify-center shadow-sm">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Target Audience
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Define precisely who should receive this survey invitation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="includeAll"
                      checked={surveyData.targetAudience.includeAll}
                      onCheckedChange={(checked) =>
                        updateSurveyData('targetAudience', { includeAll: checked })
                      }
                      className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636] mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="includeAll" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Include All Team Members
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Send to all active team members across all departments and positions for maximum coverage.
                      </p>
                    </div>
                  </div>
                </div>

                {!surveyData.targetAudience.includeAll && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-900 mb-3 block">Departments</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Front of House', 'Back of House', 'Management'].map(dept => (
                          <Badge
                            key={dept}
                            variant={surveyData.targetAudience.departments.includes(dept) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all duration-200 ${
                              surveyData.targetAudience.departments.includes(dept)
                                ? 'bg-[#E51636] hover:bg-[#D01530] text-white'
                                : 'hover:bg-[#E51636]/10 hover:border-[#E51636]'
                            }`}
                            onClick={() => updateSurveyData('targetAudience', {
                              departments: toggleArrayItem(surveyData.targetAudience.departments, dept)
                            })}
                          >
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-900 mb-3 block">Experience Levels</Label>
                      <div className="flex flex-wrap gap-2">
                        {['0-6 months', '6-12 months', '1-2 years', '2+ years'].map(level => (
                          <Badge
                            key={level}
                            variant={surveyData.targetAudience.experienceLevels.includes(level) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all duration-200 ${
                              surveyData.targetAudience.experienceLevels.includes(level)
                                ? 'bg-[#E51636] hover:bg-[#D01530] text-white'
                                : 'hover:bg-[#E51636]/10 hover:border-[#E51636]'
                            }`}
                            onClick={() => updateSurveyData('targetAudience', {
                              experienceLevels: toggleArrayItem(surveyData.targetAudience.experienceLevels, level)
                            })}
                          >
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-900 mb-3 block">Employment Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Full-time', 'Part-time'].map(type => (
                          <Badge
                            key={type}
                            variant={surveyData.targetAudience.employmentTypes.includes(type) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all duration-200 ${
                              surveyData.targetAudience.employmentTypes.includes(type)
                                ? 'bg-[#E51636] hover:bg-[#D01530] text-white'
                                : 'hover:bg-[#E51636]/10 hover:border-[#E51636]'
                            }`}
                            onClick={() => updateSurveyData('targetAudience', {
                              employmentTypes: toggleArrayItem(surveyData.targetAudience.employmentTypes, type)
                            })}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="excludeRecent"
                    checked={surveyData.targetAudience.excludeRecentResponders}
                    onCheckedChange={(checked) =>
                      updateSurveyData('targetAudience', { excludeRecentResponders: checked })
                    }
                  />
                  <Label htmlFor="excludeRecent">Exclude recent survey responders</Label>
                </div>

                {surveyData.targetAudience.excludeRecentResponders && (
                  <div className="ml-6">
                    <Label htmlFor="excludeDays">Exclude if responded within (days)</Label>
                    <Input
                      id="excludeDays"
                      type="number"
                      value={surveyData.targetAudience.excludeRecentDays}
                      onChange={(e) => updateSurveyData('targetAudience', {
                        excludeRecentDays: parseInt(e.target.value) || 30
                      })}
                      className="w-24 mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Schedule</CardTitle>
              <CardDescription>
                Configure when and how often this survey runs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={surveyData.schedule.startDate}
                    onChange={(e) => updateSurveyData('schedule', { startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={surveyData.schedule.endDate}
                    onChange={(e) => updateSurveyData('schedule', { endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={surveyData.schedule.frequency}
                  onValueChange={(value) => updateSurveyData('schedule', { frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannual">Bi-annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={surveyData.schedule.isRecurring}
                  onCheckedChange={(checked) =>
                    updateSurveyData('schedule', { isRecurring: checked })
                  }
                />
                <Label htmlFor="isRecurring">
                  <Repeat className="w-4 h-4 inline mr-1" />
                  Make this a recurring survey
                </Label>
              </div>

              {surveyData.schedule.isRecurring && (
                <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                  <div>
                    <Label htmlFor="duration">Survey Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={surveyData.schedule.recurringSettings.duration}
                      onChange={(e) => updateSurveyData('schedule', {
                        recurringSettings: {
                          ...surveyData.schedule.recurringSettings,
                          duration: parseInt(e.target.value) || 14
                        }
                      })}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoActivate"
                      checked={surveyData.schedule.autoActivate}
                      onCheckedChange={(checked) =>
                        updateSurveyData('schedule', { autoActivate: checked })
                      }
                    />
                    <Label htmlFor="autoActivate">Auto-activate recurring surveys</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoClose"
                      checked={surveyData.schedule.recurringSettings.autoClose}
                      onCheckedChange={(checked) =>
                        updateSurveyData('schedule', {
                          recurringSettings: {
                            ...surveyData.schedule.recurringSettings,
                            autoClose: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="autoClose">Auto-close when duration expires</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Customize email invitations and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendReminders"
                  checked={surveyData.settings.sendReminders}
                  onCheckedChange={(checked) =>
                    updateSurveyData('settings', { sendReminders: checked })
                  }
                />
                <Label htmlFor="sendReminders">Send email reminders</Label>
              </div>

              {surveyData.settings.sendReminders && (
                <div className="ml-6 space-y-4">
                  <div>
                    <Label>Send reminders (days before closing)</Label>
                    <div className="flex gap-2 mt-2">
                      {[7, 5, 3, 1].map(day => (
                        <Badge
                          key={day}
                          variant={surveyData.settings.reminderDays.includes(day) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => updateSurveyData('settings', {
                            reminderDays: toggleArrayItem(surveyData.settings.reminderDays, day)
                          })}
                        >
                          {day} day{day !== 1 ? 's' : ''}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emailSubject">Email Subject</Label>
                    <Input
                      id="emailSubject"
                      value={surveyData.notifications.emailTemplate.subject}
                      onChange={(e) => updateSurveyData('notifications', {
                        emailTemplate: {
                          ...surveyData.notifications.emailTemplate,
                          subject: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inviteMessage">Invitation Message</Label>
                    <Textarea
                      id="inviteMessage"
                      value={surveyData.notifications.emailTemplate.inviteMessage}
                      onChange={(e) => updateSurveyData('notifications', {
                        emailTemplate: {
                          ...surveyData.notifications.emailTemplate,
                          inviteMessage: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reminderMessage">Reminder Message</Label>
                    <Textarea
                      id="reminderMessage"
                      value={surveyData.notifications.emailTemplate.reminderMessage}
                      onChange={(e) => updateSurveyData('notifications', {
                        emailTemplate: {
                          ...surveyData.notifications.emailTemplate,
                          reminderMessage: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate('/team-surveys')}
            className="px-6 py-3 text-base font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSurveyMutation.isPending}
            className="px-8 py-3 text-base font-medium bg-gradient-to-r from-[#E51636] to-[#D01530] hover:from-[#D01530] hover:to-[#B91C3C] text-white shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {createSurveyMutation.isPending ? 'Creating Survey...' : 'Create Advanced Survey'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdvanced;
