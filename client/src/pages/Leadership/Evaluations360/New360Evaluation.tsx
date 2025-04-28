import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface User {
  _id: string;
  name: string;
  position: string;
  email: string;
}

interface Template {
  _id: string;
  name: string;
  description: string;
}

export default function New360Evaluation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14)) // Default to 2 weeks from now
  );

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      return response.data;
    }
  });

  // Ensure users is an array and filter for leaders only
  const allUsers = Array.isArray(usersData) ? usersData :
                  (usersData && usersData.users ? usersData.users : []);

  // Filter to only include leaders and directors
  const users = allUsers.filter((user: User) =>
    user.position === 'Leader' || user.position === 'Director'
  );

  // Fetch templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await api.get('/api/templates');
      return response.data;
    }
  });

  // Ensure templates is an array
  const allTemplates = Array.isArray(templatesData) ? templatesData :
                      (templatesData && templatesData.templates ? templatesData.templates : []);

  // Filter to only include the Leadership 360 Evaluation template
  const templates = allTemplates.filter((template: Template) =>
    template.name === 'Leadership 360 Evaluation'
  );

  // Set the template when it's loaded
  useEffect(() => {
    if (templates && templates.length > 0) {
      // Log the template object to see its structure
      console.log('Template object:', templates[0]);

      // Get the template ID - it could be _id or id depending on the API response
      const templateId = templates[0]._id || templates[0].id;

      if (templateId) {
        console.log('Setting template ID:', templateId);
        setSelectedTemplate(templateId);
      } else {
        console.error('Could not find template ID in template object:', templates[0]);
      }
    }
  }, [templates]);

  // Log when selectedTemplate changes
  useEffect(() => {
    console.log('Selected template ID updated:', selectedTemplate);
  }, [selectedTemplate]);

  // Create 360 evaluation mutation
  const createEvaluation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/leadership/360-evaluations', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "360° evaluation created successfully",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluations'] });

      // Navigate to add evaluators page
      navigate(`/leadership/360-evaluations/${data.evaluation._id}/evaluators`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create evaluation",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // IMPORTANT: Always use the template from the templates array if available
    // This ensures we have a valid template ID even if the state hasn't been updated
    let templateId = selectedTemplate;

    // If we have templates, try to get the ID from the first template
    if (templates.length > 0) {
      // It could be _id or id depending on the API response
      templateId = templates[0]._id || templates[0].id || selectedTemplate;
    }

    // Log the values for debugging
    console.log("Submitting 360 evaluation with values:", {
      selectedSubject,
      templateId,
      startDate,
      dueDate,
      templates
    });

    if (!selectedSubject || !templateId || !startDate || !dueDate) {
      console.error("Validation failed:", {
        hasSubject: !!selectedSubject,
        hasTemplate: !!templateId,
        hasStartDate: !!startDate,
        hasDueDate: !!dueDate
      });

      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the data object with the template ID from the templates array
      const data = {
        subjectId: selectedSubject,
        templateId: templateId, // This is the key field that was missing
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };

      console.log("Sending data to API:", data);

      createEvaluation.mutate(data, {
        onError: (error) => {
          console.error("API error:", error);
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to create evaluation. See console for details.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1: return !selectedSubject;
      case 2: return templates.length === 0; // Only disable if no templates are found
      case 3: return !startDate || !dueDate;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Select Leader</h3>
              <p className="text-sm text-muted-foreground">
                Choose the leader who will receive the 360° leadership evaluation
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="subject">Leader</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a leader" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    users?.map((user: User) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} - {user.position}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Leadership 360 Template</h3>
              <p className="text-sm text-muted-foreground">
                The Leadership 360 Evaluation template is specifically designed for leadership assessments
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="template">Evaluation Template</Label>
              {isLoadingTemplates ? (
                <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                  <span className="text-gray-500">Loading template...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="flex items-center h-10 px-3 border rounded-md bg-red-50 text-red-600">
                  <span>Leadership 360 Evaluation template not found</span>
                </div>
              ) : (
                <div className="flex items-center justify-between h-10 px-3 border rounded-md bg-gray-50">
                  <span>Leadership 360 Evaluation</span>
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
              {/* Set the template ID directly when templates are loaded */}
              {templates.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  <div>Template ID: {templates[0]._id || templates[0].id || 'Not found'}</div>
                  <div>Selected Template ID: {selectedTemplate || 'Not set'}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const templateId = templates[0]._id || templates[0].id;
                      if (templateId) {
                        setSelectedTemplate(templateId);
                      } else {
                        console.error('Could not find template ID in template object:', templates[0]);
                      }
                      console.log('Manually set template ID to:', templates[0]._id);
                    }}
                  >
                    Set Template ID
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Schedule Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                Set the start and due dates for the 360° leadership evaluation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!startDate ? 'text-muted-foreground' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2 border-b">
                      <div className="flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            setStartDate(today);
                            // If due date is not set or is before start date, set it to 30 days later
                            if (!dueDate || dueDate < today) {
                              const thirtyDaysLater = new Date();
                              thirtyDaysLater.setDate(today.getDate() + 30);
                              setDueDate(thirtyDaysLater);
                            }
                          }}
                        >
                          Today
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setStartDate(tomorrow);
                            // If due date is not set or is before start date, set it to 30 days later
                            if (!dueDate || dueDate < tomorrow) {
                              const thirtyDaysLater = new Date();
                              thirtyDaysLater.setDate(tomorrow.getDate() + 30);
                              setDueDate(thirtyDaysLater);
                            }
                          }}
                        >
                          Tomorrow
                        </Button>
                      </div>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        // If due date is not set or is before start date, set it to 30 days later
                        if (!dueDate || (date && dueDate < date)) {
                          const thirtyDaysLater = new Date(date);
                          thirtyDaysLater.setDate(date.getDate() + 30);
                          setDueDate(thirtyDaysLater);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!dueDate ? 'text-muted-foreground' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2 border-b">
                      <div className="flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (startDate) {
                              const twoWeeksLater = new Date(startDate);
                              twoWeeksLater.setDate(startDate.getDate() + 14);
                              setDueDate(twoWeeksLater);
                            }
                          }}
                          disabled={!startDate}
                        >
                          +2 Weeks
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (startDate) {
                              const thirtyDaysLater = new Date(startDate);
                              thirtyDaysLater.setDate(startDate.getDate() + 30);
                              setDueDate(thirtyDaysLater);
                            }
                          }}
                          disabled={!startDate}
                        >
                          +30 Days
                        </Button>
                      </div>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
                {startDate && dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Evaluation period: {format(startDate, 'MMM d')} - {format(dueDate, 'MMM d, yyyy')}
                    ({differenceInDays(dueDate, startDate)} days)
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/leadership/360-evaluations')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">New 360° Leadership Evaluation</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create 360° Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-[#E51636] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2">Leader</span>
              </div>
              <div className="flex-1 flex items-center">
                <div className={`h-1 w-full ${currentStep >= 2 ? 'bg-[#E51636]' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-[#E51636] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2">Template</span>
              </div>
              <div className="flex-1 flex items-center">
                <div className={`h-1 w-full ${currentStep >= 3 ? 'bg-[#E51636]' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-[#E51636] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2">Schedule</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled() || createEvaluation.isPending}
              className="bg-[#E51636] hover:bg-[#C41230] text-white"
            >
              {createEvaluation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </div>
              ) : currentStep === 3 ? (
                <>
                  Create Evaluation
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
