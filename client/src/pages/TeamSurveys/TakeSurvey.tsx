import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { teamSurveysService, SurveyQuestion, SurveyResponse } from '@/lib/services/teamSurveys';

interface SurveyState {
  currentStep: number;
  demographics: Partial<SurveyResponse['demographics']>;
  responses: { [questionId: string]: any };
  isCompleted: boolean;
  lastSaved: Date | null;
}

function TakeSurvey() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [surveyState, setSurveyState] = useState<SurveyState>({
    currentStep: 0, // 0 = demographics, 1+ = questions
    demographics: {},
    responses: {},
    isCompleted: false,
    lastSaved: null
  });

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Fetch survey data
  const { data: surveyData, isLoading, error } = useQuery({
    queryKey: ['survey', token],
    queryFn: () => teamSurveysService.getSurveyByToken(token!),
    enabled: !!token,
    retry: 1
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: (data: any) => teamSurveysService.updateSurveyResponse(token!, data),
    onSuccess: () => {
      setSurveyState(prev => ({ ...prev, lastSaved: new Date() }));
    }
  });

  // Submit survey mutation
  const submitMutation = useMutation({
    mutationFn: (data: any) => teamSurveysService.submitSurveyResponse(token!, data),
    onSuccess: () => {
      setSurveyState(prev => ({ ...prev, isCompleted: true }));
    }
  });

  // Load existing response if available, or auto-fill demographics
  useEffect(() => {
    if (surveyData) {
      const responseMap: { [key: string]: any } = {};
      let demographics = {};
      let currentStep = 0;
      let isCompleted = false;

      if (surveyData.existingResponse) {
        // Load existing response
        const existing = surveyData.existingResponse;
        existing.responses?.forEach(r => {
          responseMap[r.questionId] = r.answer;
        });
        demographics = existing.demographics || {};
        isCompleted = existing.status === 'completed';
        currentStep = existing.demographics ? 1 : 0;
      } else if (surveyData.suggestedDemographics) {
        // Auto-fill demographics from user profile
        demographics = surveyData.suggestedDemographics;
        currentStep = 0; // Still show demographics step for confirmation
      }

      setSurveyState(prev => ({
        ...prev,
        demographics,
        responses: responseMap,
        isCompleted,
        currentStep
      }));
    }
  }, [surveyData]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !surveyData || surveyState.isCompleted) return;

    const timeoutId = setTimeout(() => {
      const hasData = Object.keys(surveyState.demographics).length > 0 ||
                     Object.keys(surveyState.responses).length > 0;

      if (hasData) {
        autoSaveMutation.mutate({
          demographics: surveyState.demographics,
          responses: Object.entries(surveyState.responses).map(([questionId, answer]) => {
            const question = surveyData.survey.questions.find(q => q.id === questionId);
            return {
              questionId,
              questionText: question?.text || '',
              questionType: question?.type || 'text',
              answer
            };
          }),
          deviceInfo: teamSurveysService.getDeviceInfo()
        });
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [surveyState.demographics, surveyState.responses, autoSaveEnabled, surveyData, autoSaveMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51636] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Survey Not Available</CardTitle>
            <CardDescription>
              This survey link is invalid, expired, or has already been completed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (surveyState.isCompleted) {
    return <ThankYouPage />;
  }

  const totalSteps = surveyData.survey.questions.length + 1; // +1 for demographics
  const progress = (surveyState.currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-[#E51636]" />
              <div>
                <h1 className="font-semibold text-gray-900">{surveyData.survey.title}</h1>
                <p className="text-sm text-gray-500">Anonymous Survey</p>
              </div>
            </div>

            {surveyState.lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Save className="h-4 w-4" />
                <span>Saved {surveyState.lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {surveyData.survey.settings.showProgressBar && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {surveyState.currentStep === 0 ? (
            <DemographicsStep
              demographics={surveyState.demographics}
              onUpdate={(demographics) => setSurveyState(prev => ({ ...prev, demographics }))}
              onNext={() => setSurveyState(prev => ({ ...prev, currentStep: 1 }))}
            />
          ) : (
            <QuestionStep
              question={surveyData.survey.questions[surveyState.currentStep - 1]}
              answer={surveyState.responses[surveyData.survey.questions[surveyState.currentStep - 1]?.id]}
              onAnswer={(answer) => {
                const questionId = surveyData.survey.questions[surveyState.currentStep - 1].id;
                setSurveyState(prev => ({
                  ...prev,
                  responses: { ...prev.responses, [questionId]: answer }
                }));
              }}
              onPrevious={() => setSurveyState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }))}
              onNext={() => {
                if (surveyState.currentStep < surveyData.survey.questions.length) {
                  setSurveyState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
                } else {
                  // Submit survey
                  submitMutation.mutate({
                    demographics: surveyState.demographics,
                    responses: Object.entries(surveyState.responses).map(([questionId, answer]) => {
                      const question = surveyData.survey.questions.find(q => q.id === questionId);
                      return {
                        questionId,
                        questionText: question?.text || '',
                        questionType: question?.type || 'text',
                        answer
                      };
                    }),
                    deviceInfo: teamSurveysService.getDeviceInfo()
                  });
                }
              }}
              isFirst={surveyState.currentStep === 1}
              isLast={surveyState.currentStep === surveyData.survey.questions.length}
              isSubmitting={submitMutation.isPending}
              currentStep={surveyState.currentStep}
              totalSteps={totalSteps}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Demographics Step Component
interface DemographicsStepProps {
  demographics: Partial<SurveyResponse['demographics']>;
  onUpdate: (demographics: Partial<SurveyResponse['demographics']>) => void;
  onNext: () => void;
}

function DemographicsStep({ demographics, onUpdate, onNext }: DemographicsStepProps) {
  const isComplete = demographics.department && demographics.position &&
                    demographics.experienceLevel && demographics.employmentType;

  const handleUpdate = (field: string, value: string) => {
    onUpdate({ ...demographics, [field]: value });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <User className="mx-auto h-12 w-12 text-[#E51636] mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">About You</h2>
          <p className="text-gray-600">
            We've pre-filled this information based on your profile. Please review and update if needed.
            This information is completely anonymous and will only be used for analytics.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="department" className="text-base font-medium flex items-center gap-2">
              Which department do you primarily work in? *
              {demographics.department && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pre-filled</span>
              )}
            </Label>
            <Select value={demographics.department || ''} onValueChange={(value) => handleUpdate('department', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Front of House">Front of House</SelectItem>
                <SelectItem value="Back of House">Back of House (Kitchen)</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position" className="text-base font-medium flex items-center gap-2">
              What is your current position? *
              {demographics.position && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pre-filled</span>
              )}
            </Label>
            <Input
              id="position"
              value={demographics.position || ''}
              onChange={(e) => handleUpdate('position', e.target.value)}
              placeholder="e.g., Team Member, Shift Leader, Manager"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="experience" className="text-base font-medium flex items-center gap-2">
              How long have you been working at Chick-fil-A? *
              {demographics.experienceLevel && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pre-filled</span>
              )}
            </Label>
            <Select value={demographics.experienceLevel || ''} onValueChange={(value) => handleUpdate('experienceLevel', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-6 months">0-6 months</SelectItem>
                <SelectItem value="6-12 months">6-12 months</SelectItem>
                <SelectItem value="1-2 years">1-2 years</SelectItem>
                <SelectItem value="2+ years">2+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="employment" className="text-base font-medium flex items-center gap-2">
              What is your employment status? *
              {demographics.employmentType && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Pre-filled</span>
              )}
            </Label>
            <Select value={demographics.employmentType || ''} onValueChange={(value) => handleUpdate('employmentType', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={onNext}
            disabled={!isComplete}
            className="bg-[#E51636] hover:bg-[#E51636]/90 px-8"
          >
            Start Survey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Question Step Component
interface QuestionStepProps {
  question: SurveyQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
}

function QuestionStep({
  question,
  answer,
  onAnswer,
  onPrevious,
  onNext,
  isFirst,
  isLast,
  isSubmitting,
  currentStep,
  totalSteps
}: QuestionStepProps) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>{question.ratingScale?.min || 1} - Strongly Disagree</span>
              <span>{question.ratingScale?.max || 10} - Strongly Agree</span>
            </div>

            {/* Mobile-optimized rating buttons */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
              {Array.from({ length: (question.ratingScale?.max || 10) - (question.ratingScale?.min || 1) + 1 }, (_, i) => {
                const value = (question.ratingScale?.min || 1) + i;
                const isSelected = answer === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onAnswer(value)}
                    className={`
                      flex flex-col items-center justify-center p-3 md:p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-[#E51636] bg-[#E51636] text-white shadow-lg scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#E51636] hover:bg-[#E51636]/5'
                      }
                      touch-manipulation min-h-[60px] md:min-h-[70px]
                    `}
                  >
                    <span className="text-lg md:text-xl font-semibold">{value}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected value indicator */}
            {answer && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E51636] text-white">
                  Selected: {answer}
                </span>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              value={answer || ''}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="Please share your thoughts..."
              rows={6}
              className="resize-none text-base md:text-sm min-h-[120px] p-4"
            />
            <div className="text-right text-sm text-gray-500">
              {answer?.length || 0} characters
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isSelected = answer === option;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAnswer(option)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-[#E51636] bg-[#E51636]/5 text-[#E51636]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#E51636]/50'
                    }
                    touch-manipulation
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-[#E51636] bg-[#E51636]' : 'border-gray-300'}
                    `}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return (
          <Input
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your answer..."
          />
        );
    }
  };

  const isAnswered = answer !== undefined && answer !== null && answer !== '';

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Question Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentStep} of {totalSteps - 1}
            </span>
            {question.required && (
              <span className="text-sm text-red-500">* Required</span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Question Input */}
        <div className="mb-8">
          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirst}
            className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
            {question.required && !isAnswered && (
              <span className="text-sm text-gray-500 text-center">
                Please answer to continue
              </span>
            )}

            <Button
              onClick={onNext}
              disabled={(question.required && !isAnswered) || isSubmitting}
              className="bg-[#E51636] hover:bg-[#E51636]/90 flex items-center gap-2 px-6 w-full sm:w-auto min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : isLast ? (
                <>
                  Submit Survey
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thank You Page Component with Auto-Redirect
const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Try to close the window first (if opened in popup)
          if (window.opener) {
            window.close();
          } else {
            // If not a popup, redirect to home page
            navigate('/');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            Your anonymous feedback has been submitted successfully. Your responses will help improve the team experience at Chick-fil-A.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            {countdown > 0 ? (
              <>Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...</>
            ) : (
              'Redirecting...'
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                navigate('/');
              }
            }}
            className="mt-2"
          >
            Close Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeSurvey;