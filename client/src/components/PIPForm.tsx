import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CalendarIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  FileText,
  Video,
  GraduationCap,
  Calendar,
  Lightbulb,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PIPGoal, PIPResource, PIPCheckIn } from '@/services/documentationService';

interface PIPFormProps {
  onSubmit: (pipData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PIPForm({ onSubmit, onCancel, isLoading }: PIPFormProps) {
  const [goals, setGoals] = useState<PIPGoal[]>([
    { description: '', targetDate: '', completed: false }
  ]);
  const [timeline, setTimeline] = useState<number>(90);
  const [checkInDates, setCheckInDates] = useState<Date[]>([]);
  const [resources, setResources] = useState<PIPResource[]>([
    { title: '', type: 'training', completed: false }
  ]);
  const [successCriteria, setSuccessCriteria] = useState('');
  const [consequences, setConsequences] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completionProgress, setCompletionProgress] = useState(0);

  // Calculate completion progress
  useEffect(() => {
    let progress = 0;
    if (timeline > 0) progress += 20;
    if (goals.some(g => g.description.trim())) progress += 30;
    if (resources.some(r => r.title.trim())) progress += 20;
    if (successCriteria.trim()) progress += 15;
    if (consequences.trim()) progress += 15;
    setCompletionProgress(progress);
  }, [timeline, goals, resources, successCriteria, consequences]);

  const addGoal = () => {
    setGoals([...goals, { description: '', targetDate: '', completed: false }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: keyof PIPGoal, value: any) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setGoals(updatedGoals);
  };

  const addResource = () => {
    setResources([...resources, { title: '', type: 'training', completed: false }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof PIPResource, value: any) => {
    const updatedResources = [...resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setResources(updatedResources);
  };

  // Helper function to get resource type icon and color
  const getResourceTypeInfo = (type: string) => {
    switch (type) {
      case 'training':
        return { icon: GraduationCap, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
      case 'document':
        return { icon: FileText, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' };
      case 'video':
        return { icon: Video, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' };
      case 'meeting':
        return { icon: Users, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
      default:
        return { icon: BookOpen, color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
    }
  };

  // Helper function to get timeline description
  const getTimelineDescription = (days: number) => {
    switch (days) {
      case 30:
        return { title: 'Intensive Plan', description: 'Weekly check-ins for rapid improvement', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 60:
        return { title: 'Focused Plan', description: 'Bi-weekly check-ins for steady progress', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 90:
        return { title: 'Comprehensive Plan', description: 'Monthly check-ins for thorough development', color: 'text-green-600', bgColor: 'bg-green-50' };
      default:
        return { title: 'Custom Plan', description: 'Tailored timeline for specific needs', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
  };

  const generateCheckInDates = (timelineDays: number) => {
    const dates = [];
    const startDate = new Date();

    // Generate check-in dates based on timeline
    if (timelineDays === 30) {
      // Weekly check-ins for 30-day plan
      for (let i = 1; i <= 4; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 7));
        dates.push(date);
      }
    } else if (timelineDays === 60) {
      // Bi-weekly check-ins for 60-day plan
      for (let i = 1; i <= 4; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 14));
        dates.push(date);
      }
    } else if (timelineDays === 90) {
      // Monthly check-ins for 90-day plan
      for (let i = 1; i <= 3; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        dates.push(date);
      }
    }

    setCheckInDates(dates);
  };

  const handleTimelineChange = (value: string) => {
    const days = parseInt(value);
    setTimeline(days);
    generateCheckInDates(days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pipData = {
      goals: goals.filter(goal => goal.description.trim() !== ''),
      timeline,
      checkInDates: checkInDates.map(date => ({
        date: date.toISOString(),
        completed: false
      })),
      resources: resources.filter(resource => resource.title.trim() !== ''),
      successCriteria,
      consequences,
      finalOutcome: 'pending'
    };
    
    onSubmit(pipData);
  };

  const timelineInfo = getTimelineDescription(timeline);

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Performance Improvement Plan</h2>
              <p className="text-white/90">Building a path to success together</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">Completion Progress</div>
            <div className="text-2xl font-bold">{completionProgress}%</div>
          </div>
        </div>
        <Progress value={completionProgress} className="h-2 bg-white/20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Timeline Selection */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#E51636] text-white p-2 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Step 1: Timeline & Schedule</CardTitle>
                <p className="text-gray-600 text-sm mt-1">Define the improvement timeline and check-in frequency</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[30, 60, 90].map((days) => {
                const info = getTimelineDescription(days);
                const isSelected = timeline === days;
                return (
                  <div
                    key={days}
                    onClick={() => handleTimelineChange(days.toString())}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected
                        ? "border-[#E51636] bg-red-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold mb-1",
                        isSelected ? "text-[#E51636]" : "text-gray-700"
                      )}>
                        {days} Days
                      </div>
                      <div className={cn(
                        "text-sm font-medium mb-2",
                        isSelected ? info.color : "text-gray-600"
                      )}>
                        {info.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {info.description}
                      </div>
                      {isSelected && (
                        <div className="mt-3">
                          <Badge className="bg-[#E51636] text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {checkInDates.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Label className="text-blue-900 font-medium">Scheduled Check-in Dates</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {checkInDates.map((date, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-sm font-medium text-blue-900">
                        Check-in {index + 1}
                      </div>
                      <div className="text-sm text-blue-700">
                        {format(date, 'PPP')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Performance Goals */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#E51636] text-white p-2 rounded-xl">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Step 2: Performance Goals</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Define specific, measurable objectives for improvement</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={addGoal}
                className="bg-[#E51636] hover:bg-[#DD0031] text-white shadow-lg"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {goals.map((goal, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white p-2 rounded-lg">
                          <Star className="h-4 w-4" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold text-gray-900">Goal {index + 1}</Label>
                          <p className="text-sm text-gray-500">Define a specific performance objective</p>
                        </div>
                      </div>
                      {goals.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeGoal(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Goal Description
                        </Label>
                        <Textarea
                          placeholder="Example: Improve customer service scores by 15% through enhanced communication skills and faster response times..."
                          value={goal.description}
                          onChange={(e) => updateGoal(index, 'description', e.target.value)}
                          className="min-h-[100px] border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Target Completion Date
                          </Label>
                          <Input
                            type="date"
                            value={goal.targetDate}
                            onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                            className="border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Success Tip</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              Make goals SMART: Specific, Measurable, Achievable, Relevant, Time-bound
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {goals.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No goals added yet</p>
                  <Button
                    type="button"
                    onClick={addGoal}
                    className="bg-[#E51636] hover:bg-[#DD0031] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Resources & Support */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#E51636] text-white p-2 rounded-xl">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Step 3: Resources & Support</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Provide tools and materials to ensure success</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={addResource}
                className="bg-[#E51636] hover:bg-[#DD0031] text-white shadow-lg"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resources.map((resource, index) => {
                const typeInfo = getResourceTypeInfo(resource.type);
                const IconComponent = typeInfo.icon;

                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", typeInfo.bgColor)}>
                            <IconComponent className={cn("h-5 w-5", typeInfo.textColor)} />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold text-gray-900">Resource {index + 1}</Label>
                            <p className="text-sm text-gray-500">Support material for development</p>
                          </div>
                        </div>
                        {resources.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeResource(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Resource Title
                          </Label>
                          <Input
                            placeholder="Example: Customer Service Excellence Training Module"
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            className="border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Resource Type
                            </Label>
                            <Select
                              value={resource.type}
                              onValueChange={(value) => updateResource(index, 'type', value)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="training">
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-blue-500" />
                                    Training Program
                                  </div>
                                </SelectItem>
                                <SelectItem value="document">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-green-500" />
                                    Document/Guide
                                  </div>
                                </SelectItem>
                                <SelectItem value="video">
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-purple-500" />
                                    Video Content
                                  </div>
                                </SelectItem>
                                <SelectItem value="meeting">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    Meeting/Session
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Resource Link (Optional)
                            </Label>
                            <Input
                              placeholder="https://training.example.com"
                              value={resource.url || ''}
                              onChange={(e) => updateResource(index, 'url', e.target.value)}
                              className="border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]"
                            />
                          </div>
                        </div>

                        <div className={cn("rounded-lg p-3 border", typeInfo.bgColor, "border-gray-200")}>
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className={cn("h-4 w-4", typeInfo.textColor)} />
                            <span className={cn("text-sm font-medium", typeInfo.textColor)}>
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Resource
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {resource.type === 'training' && "Structured learning program to build specific skills"}
                            {resource.type === 'document' && "Written materials, guides, or reference documents"}
                            {resource.type === 'video' && "Video tutorials, demonstrations, or educational content"}
                            {resource.type === 'meeting' && "One-on-one sessions, workshops, or group meetings"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {resources.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No resources added yet</p>
                  <Button
                    type="button"
                    onClick={addResource}
                    className="bg-[#E51636] hover:bg-[#DD0031] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Resource
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Success Criteria & Consequences */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#E51636] text-white p-2 rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Step 4: Success Criteria & Expectations</CardTitle>
                <p className="text-gray-600 text-sm mt-1">Define clear expectations and outcomes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Criteria */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold text-green-900">Success Criteria</Label>
                    <p className="text-sm text-green-700">What does success look like?</p>
                  </div>
                </div>
                <Textarea
                  id="successCriteria"
                  placeholder="Example: Employee consistently achieves customer satisfaction scores above 4.5/5, demonstrates improved communication skills in team interactions, and completes all assigned training modules with passing grades..."
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  className="min-h-[120px] border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
                  required
                />
                <div className="mt-3 bg-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Success Tips</span>
                  </div>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Be specific and measurable</li>
                    <li>• Include both behavioral and performance metrics</li>
                    <li>• Set realistic but challenging expectations</li>
                  </ul>
                </div>
              </div>

              {/* Consequences */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 text-white p-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold text-orange-900">Consequences</Label>
                    <p className="text-sm text-orange-700">What happens if goals aren't met?</p>
                  </div>
                </div>
                <Textarea
                  id="consequences"
                  placeholder="Example: Failure to meet the outlined goals and demonstrate sustained improvement may result in further disciplinary action, including potential termination of employment. However, we are committed to providing support and will work together to ensure success..."
                  value={consequences}
                  onChange={(e) => setConsequences(e.target.value)}
                  className="min-h-[120px] border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  required
                />
                <div className="mt-3 bg-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Important Notes</span>
                  </div>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Be clear but supportive in tone</li>
                    <li>• Focus on improvement opportunities</li>
                    <li>• Include escalation procedures if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Create PIP?</h3>
                <p className="text-sm text-gray-600">Review all sections before submitting</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || completionProgress < 100}
                className="bg-gradient-to-r from-[#E51636] to-[#DD0031] hover:from-[#DD0031] hover:to-[#C41E3A] text-white shadow-lg min-w-[200px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating PIP...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Create Performance Improvement Plan
                  </div>
                )}
              </Button>
            </div>
          </div>

          {completionProgress < 100 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Please complete all sections ({completionProgress}% complete)
                </span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
