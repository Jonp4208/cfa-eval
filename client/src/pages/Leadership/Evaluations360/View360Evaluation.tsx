import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Clock,
  Edit,
  UserPlus,
  Trash2,
  Eye,
  Info,
  Save,
  ThumbsUp,
  ArrowUpCircle,
  Target,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Evaluation360 {
  _id: string;
  subject: {
    _id: string;
    name: string;
    position: string;
  };
  initiator: {
    _id: string;
    name: string;
    position: string;
  };
  template: {
    _id: string;
    name: string;
    sections: Array<{
      title: string;
      description?: string;
      criteria: Array<{
        _id: string;
        title: string;
        description: string;
        gradingScale: string;
        required?: boolean;
      }>;
    }>;
  };
  status: 'pending_evaluators' | 'in_progress' | 'completed' | 'reviewed';
  startDate: string;
  dueDate: string;
  completedDate?: string;
  reviewedDate?: string;
  evaluations: Array<{
    _id: string;
    evaluator: {
      _id: string;
      name: string;
      position: string;
    };
    relationship: 'manager' | 'peer' | 'direct_report' | 'self';
    responses: Map<string, any>;
    overallComments?: string;
    submittedAt?: string;
    isComplete: boolean;
  }>;
}

interface EvaluationSummary {
  overallRating: number;
  categoryRatings: Record<string, { sum: number; count: number; average: number }>;
  relationshipRatings: {
    manager: { count: number; sum: number; average: number };
    peer: { count: number; sum: number; average: number };
    direct_report: { count: number; sum: number; average: number };
    self: { count: number; sum: number; average: number };
  };
  strengths: Array<{ relationship: string; text: string }>;
  improvements: Array<{ relationship: string; text: string }>;
  examples: Array<{ relationship: string; text: string }>;
  goals?: Array<{ relationship: string; text: string }>;
  comments: Array<{ relationship: string; comment: string }>;
  developmentRecommendations?: Array<{
    area: string;
    priority: 'high' | 'medium' | 'low';
    type: 'development' | 'leverage' | 'foundational';
    rating: number;
    suggestion: string;
    resources: string[];
  }>;
}

// Helper function to get rating descriptions
const getRatingDescription = (rating: number) => {
  const descriptions = {
    1: {
      label: 'Needs Development',
      description: 'Rarely demonstrates this behavior; requires significant improvement and support'
    },
    2: {
      label: 'Developing',
      description: 'Sometimes demonstrates this behavior; shows potential for growth with guidance'
    },
    3: {
      label: 'Proficient',
      description: 'Consistently demonstrates this behavior; meets expectations and standards'
    },
    4: {
      label: 'Advanced',
      description: 'Frequently exceeds expectations; serves as a strong role model for others'
    },
    5: {
      label: 'Expert',
      description: 'Consistently exceptional; teaches and develops others in this competency area'
    }
  };
  return descriptions[rating as keyof typeof descriptions];
};

export default function View360Evaluation() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [overallComments, setOverallComments] = useState('');

  // Fetch evaluation
  const { data: evaluation, isLoading: isLoadingEvaluation } = useQuery({
    queryKey: ['leadership360Evaluation', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/api/leadership/360-evaluations/${evaluationId}`);
      return response.data;
    }
  });

  // Fetch evaluation summary (only if completed)
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['leadership360Summary', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/api/leadership/360-evaluations/${evaluationId}/summary`);
      return response.data;
    },
    enabled: !!evaluation && ['completed', 'reviewed'].includes(evaluation.status)
  });

  // Submit evaluation response mutation
  const submitEvaluation = useMutation({
    mutationFn: async (data: { responses: Record<string, any>; overallComments: string }) => {
      const response = await api.post(`/api/leadership/360-evaluations/${evaluationId}/submit`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluation', evaluationId] });

      setActiveTab('overview');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit evaluation",
        variant: "destructive",
      });
    }
  });

  // Mark as reviewed mutation
  const markAsReviewed = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/leadership/360-evaluations/${evaluationId}/review`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation marked as reviewed",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluation', evaluationId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark as reviewed",
        variant: "destructive",
      });
    }
  });

  // Delete evaluation mutation
  const deleteEvaluation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/api/leadership/360-evaluations/${evaluationId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluations'] });

      // Navigate back to evaluation list
      navigate('/leadership/360-evaluations');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete evaluation",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    // Validate responses
    const requiredQuestions = evaluation?.template?.sections?.flatMap(section =>
      section.criteria && Array.isArray(section.criteria)
        ? section.criteria.filter(q => q.required).map(q => q._id)
        : []
    ) || [];

    const missingRequired = requiredQuestions.filter(id => !responses[id]);

    // Check if required text fields are completed
    const missingTextFields = [];
    if (!responses.strengths || responses.strengths.trim() === '') {
      missingTextFields.push(isSelfEvaluation ? 'Your leadership strengths' : 'Leader\'s strengths');
    }
    if (!responses.improvements || responses.improvements.trim() === '') {
      missingTextFields.push(isSelfEvaluation ? 'Areas for development' : 'Areas for improvement');
    }

    // Additional required fields for self-evaluation
    if (isSelfEvaluation) {
      if (!responses.examples || responses.examples.trim() === '') {
        missingTextFields.push('Leadership challenge example');
      }
      if (!responses.goals || responses.goals.trim() === '') {
        missingTextFields.push('Leadership development goals');
      }
    }

    // Show appropriate error message
    if (missingRequired.length > 0 || missingTextFields.length > 0) {
      let errorMessage = '';

      if (missingRequired.length > 0) {
        errorMessage += `Please complete all required ratings (${missingRequired.length} remaining). `;
      }

      if (missingTextFields.length > 0) {
        errorMessage += `Please complete the following required text fields: ${missingTextFields.join(', ')}.`;
      }

      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Create a combined response object with both ratings and text feedback
    const combinedResponses = {
      ...responses,
      textFeedback: {
        strengths: responses.strengths || '',
        improvements: responses.improvements || '',
        examples: responses.examples || '',
        ...(isSelfEvaluation && { goals: responses.goals || '' }),
        isSelfEvaluation: isSelfEvaluation
      }
    };

    submitEvaluation.mutate({
      responses: combinedResponses,
      overallComments
    });
  };

  const handleDelete = () => {
    deleteEvaluation.mutate();
    setShowDeleteDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_evaluators':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Evaluators</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_evaluators':
        return <Users className="h-5 w-5 text-amber-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'reviewed':
        return <BarChart2 className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case 'manager':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Manager</Badge>;
      case 'peer':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Peer</Badge>;
      case 'direct_report':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Direct Report</Badge>;
      case 'self':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Self</Badge>;
      default:
        return <Badge variant="outline">{relationship}</Badge>;
    }
  };

  const getCompletionRate = (evaluation: Evaluation360) => {
    if (evaluation.evaluations.length === 0) return 0;
    const completedCount = evaluation.evaluations.filter(e => e.isComplete).length;
    return Math.round((completedCount / evaluation.evaluations.length) * 100);
  };

  // Check if the current user is an evaluator who hasn't completed their evaluation
  const userEvaluation = evaluation?.evaluations.find(e =>
    e.evaluator._id === user?._id && !e.isComplete
  );

  // Check if this is a self-evaluation
  const isSelfEvaluation = userEvaluation?.relationship === 'self';

  // Check if the current user is the subject
  const isSubject = evaluation?.subject._id === user?._id;

  // Check if the current user is the initiator
  const isInitiator = evaluation?.initiator._id === user?._id;

  // Check if the current user is a manager or director
  const isManagerOrDirector = user?.position === 'Leader' || user?.position === 'Director';

  // Check if the evaluation can be marked as reviewed
  const canMarkAsReviewed = isSubject && evaluation?.status === 'completed';

  // Check if the evaluation can be deleted
  const canDelete = isInitiator || (isManagerOrDirector && user?.position === 'Director');

  if (isLoadingEvaluation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>Evaluation not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/leadership/360-evaluations')}
          className="mt-4"
        >
          Back to Evaluations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3 md:px-6 pb-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/leadership/360-evaluations')}
            className="mr-2 p-2 h-auto"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Back</span>
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">360° Leadership Evaluation</h2>
        </div>
        <div className="flex gap-2 mt-1 sm:mt-0">
          {evaluation.status === 'pending_evaluators' && isInitiator && (
            <Button
              onClick={() => navigate(`/leadership/360-evaluations/${evaluationId}/evaluators`)}
              className="bg-[#E51636] hover:bg-[#C41230] text-white text-sm h-9"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Evaluators</span>
              <span className="xs:hidden">Add</span>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 text-sm h-9"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(evaluation.status)}
              <CardTitle className="text-lg sm:text-xl">
                Evaluation for {evaluation.subject.name}
              </CardTitle>
            </div>
            <div className="ml-0 sm:ml-auto">
              {getStatusBadge(evaluation.status)}
            </div>
          </div>
          <CardDescription className="mt-1">
            {evaluation.template.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Initiated By</p>
              <p className="font-medium text-sm sm:text-base truncate">{evaluation.initiator.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium text-sm sm:text-base">
                {format(new Date(evaluation.dueDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 mt-1 sm:mt-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Completion</p>
              <div className="flex items-center gap-2">
                <Progress value={getCompletionRate(evaluation)} className="h-2 flex-1" />
                <span className="text-sm font-medium">
                  {getCompletionRate(evaluation)}%
                </span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full justify-start sm:justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
              {userEvaluation && (
                <TabsTrigger value="provide-feedback" className="flex-1 sm:flex-none">
                  <span className="hidden xs:inline">Provide Feedback</span>
                  <span className="xs:hidden">Feedback</span>
                </TabsTrigger>
              )}
              {['completed', 'reviewed'].includes(evaluation.status) && (
                <TabsTrigger value="results" className="flex-1 sm:flex-none">Results</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="border rounded-md">
                <div className="p-3 sm:p-4 bg-gray-50 border-b">
                  <h4 className="font-medium text-sm sm:text-base">Evaluators ({evaluation.evaluations.length})</h4>
                </div>
                {evaluation.evaluations.length === 0 ? (
                  <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                    No evaluators added yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {evaluation.evaluations && evaluation.evaluations.length > 0 ? (
                      evaluation.evaluations.map((evaluator) => {
                        // Only show names for pending evaluations or if the current user is the initiator
                        const showName = !evaluator.isComplete || isInitiator || user?.position === 'Director';

                        return (
                          <div key={evaluator._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-1.5" />
                                {showName ? (
                                  <span className="text-sm sm:text-base">{evaluator.evaluator?.name || 'Unknown'}</span>
                                ) : (
                                  <span className="flex items-center">
                                    <Shield className="h-3 w-3 mr-1 text-green-600" />
                                    <span className="text-muted-foreground text-sm">Anonymous</span>
                                  </span>
                                )}
                              </div>
                              <div className="ml-0 sm:ml-1">
                                {getRelationshipBadge(evaluator.relationship)}
                              </div>
                            </div>
                            <div>
                              {evaluator.isComplete ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                        No evaluators found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {canMarkAsReviewed && (
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => markAsReviewed.mutate()}
                    disabled={markAsReviewed.isPending}
                    className="bg-[#E51636] hover:bg-[#C41230] text-white"
                  >
                    {markAsReviewed.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        Mark as Reviewed
                        <CheckCircle2 className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            {userEvaluation && (
              <TabsContent value="provide-feedback" className="space-y-6">
                <div className="border rounded-md p-4">
                  {!isSelfEvaluation && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex items-start">
                      <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Your Feedback is Anonymous</h4>
                        <p className="text-xs text-green-700 mt-1">
                          Your identity will not be revealed to {evaluation.subject.name}. Only your relationship
                          (peer, manager, etc.) will be shown. This ensures honest, constructive feedback.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Provide Your Feedback</h3>

                    {/* Instructions card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        {isSelfEvaluation ? 'Instructions for Self-Assessment' : 'Instructions for Providing Feedback'}
                      </h4>
                      {isSelfEvaluation ? (
                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                          <li>Rate yourself honestly on each leadership criterion</li>
                          <li>Reflect on your leadership journey and growth areas</li>
                          <li>Consider specific situations that demonstrate your leadership approach</li>
                          <li>Your self-assessment will be compared with feedback from others</li>
                          <li>This is an opportunity for personal growth and development</li>
                          <li>You can save your progress and return later to complete the evaluation</li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                          <li>Rate each criterion based on your observations of {evaluation.subject.name}'s leadership</li>
                          <li>Be honest and objective in your assessment</li>
                          <li>Consider specific examples when making your ratings</li>
                          <li><strong>Your feedback is completely anonymous</strong> - the leader will not know who provided which feedback</li>
                          <li>Responses are aggregated and individual ratings cannot be traced back to you</li>
                          <li>Only your relationship to the leader (peer, manager, etc.) will be shown</li>
                          <li>You can save your progress and return later to complete the evaluation</li>
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Progress
                        value={Object.keys(responses).length /
                          (evaluation.template?.sections?.reduce((acc, section) =>
                            acc + (section.criteria?.length || 0), 0) || 1) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm font-medium">
                        {Object.keys(responses).length} /
                        {evaluation.template?.sections?.reduce((acc, section) =>
                          acc + (section.criteria?.length || 0), 0) || 0} completed
                      </span>
                    </div>

                    {/* Quick navigation to sections */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Jump to section:</p>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.template?.sections && evaluation.template.sections.map((section, index) => (
                          <Button
                            key={section.title}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const element = document.getElementById(`section-${index}`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="text-xs"
                          >
                            {section.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {evaluation.template?.sections && evaluation.template.sections.map((section, index) => (
                    <div id={`section-${index}`} key={section.title} className="mb-6">
                      <h4 className="font-medium text-lg mb-2">{section.title}</h4>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                      )}

                      <div className="space-y-6">
                        {section.criteria && Array.isArray(section.criteria) && section.criteria.map((criterion) => (
                          <div key={criterion._id} className="border-b pb-4">
                            <Label className="mb-2 block">
                              {criterion.title}
                              {criterion.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <p className="text-sm text-muted-foreground mb-2">{criterion.description}</p>

                            {/* Always use rating for criteria */}
                            <TooltipProvider>
                              <RadioGroup
                                  value={responses[criterion._id]?.toString() || ''}
                                  onValueChange={(value) =>
                                    setResponses({...responses, [criterion._id]: parseInt(value)})
                                  }
                                  className="flex flex-wrap gap-2 md:space-x-2"
                                >
                                  {[1, 2, 3, 4, 5].map((rating) => {
                                    const ratingInfo = getRatingDescription(rating);
                                    return (
                                      <Tooltip key={rating}>
                                        <TooltipTrigger asChild>
                                          <div className="flex flex-col items-center">
                                            <RadioGroupItem
                                              value={rating.toString()}
                                              id={`${criterion._id}-${rating}`}
                                              className="peer sr-only"
                                            />
                                            <Label
                                              htmlFor={`${criterion._id}-${rating}`}
                                              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 peer-data-[state=checked]:bg-[#E51636] peer-data-[state=checked]:text-white cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                              {rating}
                                            </Label>
                                            <span className="text-xs mt-1 text-center max-w-[60px]">
                                              {ratingInfo.label}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <div className="text-center">
                                            <div className="font-medium">{rating} - {ratingInfo.label}</div>
                                            <div className="text-sm mt-1">{ratingInfo.description}</div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </RadioGroup>
                              </TooltipProvider>
                            {/* We're only using ratings for criteria, no text fields needed */}

                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Text-based feedback questions */}
                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-medium text-lg mb-4">Qualitative Feedback</h4>

                    <div className="space-y-6">
                      {isSelfEvaluation ? (
                        /* Self-evaluation questions */
                        <>
                          <div>
                            <Label htmlFor="strengths" className="mb-2 block">
                              What do you consider to be your greatest strengths as a leader?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="strengths"
                              value={responses.strengths || ''}
                              onChange={(e) => setResponses({...responses, strengths: e.target.value})}
                              placeholder="Reflect on your leadership strengths, skills, or qualities that you believe make you effective..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="improvements" className="mb-2 block">
                              What areas would you like to develop or improve in your leadership?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="improvements"
                              value={responses.improvements || ''}
                              onChange={(e) => setResponses({...responses, improvements: e.target.value})}
                              placeholder="Identify specific areas where you'd like to grow or develop as a leader..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="examples" className="mb-2 block">
                              Can you describe a recent leadership challenge and how you addressed it?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="examples"
                              value={responses.examples || ''}
                              onChange={(e) => setResponses({...responses, examples: e.target.value})}
                              placeholder="Share a specific situation that challenged your leadership abilities and how you responded..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="goals" className="mb-2 block">
                              What are your leadership development goals for the next 6-12 months?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="goals"
                              value={responses.goals || ''}
                              onChange={(e) => setResponses({...responses, goals: e.target.value})}
                              placeholder="Outline specific leadership goals you'd like to achieve in the coming months..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="overallComments" className="mb-2 block">
                              Additional Reflections
                              <span className="text-muted-foreground ml-2 text-sm">(Optional)</span>
                            </Label>
                            <Textarea
                              id="overallComments"
                              value={overallComments}
                              onChange={(e) => setOverallComments(e.target.value)}
                              placeholder="Share any additional thoughts on your leadership journey..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </>
                      ) : (
                        /* Peer/Manager evaluation questions */
                        <>
                          <div>
                            <Label htmlFor="strengths" className="mb-2 block">
                              What are this leader's greatest strengths?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="strengths"
                              value={responses.strengths || ''}
                              onChange={(e) => setResponses({...responses, strengths: e.target.value})}
                              placeholder="Describe specific strengths, skills, or qualities that make this leader effective..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="improvements" className="mb-2 block">
                              What are areas where this leader could improve?
                              <span className="text-muted-foreground ml-2 text-sm">(Required)</span>
                            </Label>
                            <Textarea
                              id="improvements"
                              value={responses.improvements || ''}
                              onChange={(e) => setResponses({...responses, improvements: e.target.value})}
                              placeholder="Suggest specific areas for growth or development..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="examples" className="mb-2 block">
                              Can you provide specific examples of effective leadership?
                              <span className="text-muted-foreground ml-2 text-sm">(Optional)</span>
                            </Label>
                            <Textarea
                              id="examples"
                              value={responses.examples || ''}
                              onChange={(e) => setResponses({...responses, examples: e.target.value})}
                              placeholder="Share specific situations or examples that demonstrate this person's leadership abilities..."
                              className="min-h-[100px]"
                            />
                          </div>

                          <div>
                            <Label htmlFor="overallComments" className="mb-2 block">
                              Additional Comments
                              <span className="text-muted-foreground ml-2 text-sm">(Optional)</span>
                            </Label>
                            <Textarea
                              id="overallComments"
                              value={overallComments}
                              onChange={(e) => setOverallComments(e.target.value)}
                              placeholder="Enter any additional comments or feedback..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Save progress without submitting
                        if (Object.keys(responses).length > 0) {
                          toast({
                            title: "Progress Saved",
                            description: "Your evaluation progress has been saved. You can return later to complete it.",
                          });
                        } else {
                          toast({
                            title: "Nothing to Save",
                            description: "Please provide at least one rating before saving progress.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={submitEvaluation.isPending || Object.keys(responses).length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Progress
                    </Button>

                    <Button
                      onClick={() => {
                        // Check if all required criteria have been rated
                        const requiredCriteria = evaluation?.template?.sections?.flatMap(section =>
                          section.criteria && Array.isArray(section.criteria)
                            ? section.criteria.filter(c => c.required).map(c => c._id)
                            : []
                        ) || [];

                        const missingRequired = requiredCriteria.filter(id => !responses[id]);

                        // Check if required text fields are completed
                        const missingTextFields = [];
                        if (!responses.strengths || responses.strengths.trim() === '') {
                          missingTextFields.push('Leader\'s strengths');
                        }
                        if (!responses.improvements || responses.improvements.trim() === '') {
                          missingTextFields.push('Areas for improvement');
                        }

                        // Show appropriate error message
                        if (missingRequired.length > 0 || missingTextFields.length > 0) {
                          let errorMessage = '';

                          if (missingRequired.length > 0) {
                            errorMessage += `Please complete all required ratings (${missingRequired.length} remaining). `;
                          }

                          if (missingTextFields.length > 0) {
                            errorMessage += `Please complete the following required text fields: ${missingTextFields.join(', ')}.`;
                          }

                          toast({
                            title: "Missing Required Fields",
                            description: errorMessage,
                            variant: "destructive",
                          });
                          return;
                        }

                        setShowSubmitDialog(true);
                      }}
                      disabled={submitEvaluation.isPending}
                      className="bg-[#E51636] hover:bg-[#C41230] text-white"
                    >
                      {submitEvaluation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        <>
                          Submit Evaluation
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}

            {['completed', 'reviewed'].includes(evaluation.status) && (
              <TabsContent value="results" className="space-y-6">
                {isLoadingSummary ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
                  </div>
                ) : !summary ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p>Summary data not available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Anonymity notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Anonymous Feedback</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          This feedback summary is compiled from anonymous evaluations. Individual responses cannot be
                          traced back to specific evaluators. Only the relationship type (peer, manager, direct report)
                          is shown to provide context.
                        </p>
                      </div>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Overall Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center">
                          <div className="relative w-40 h-40">
                            {/* Rating circle */}
                            <div className="absolute inset-0 w-40 h-40 rounded-full bg-[#E51636] flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                              {parseFloat(summary.overallRating).toFixed(1)}
                            </div>

                            {/* Rating label */}
                            <div className="absolute bottom-0 left-0 right-0 text-center -mb-6">
                              <span className="inline-block bg-white px-3 py-1 rounded-full text-sm font-medium shadow">
                                {parseFloat(summary.overallRating) <= 1.5 ? 'Needs Development' :
                                 parseFloat(summary.overallRating) <= 2.5 ? 'Developing' :
                                 parseFloat(summary.overallRating) <= 3.5 ? 'Proficient' :
                                 parseFloat(summary.overallRating) <= 4.5 ? 'Advanced' : 'Expert'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">By Relationship</h4>
                            <div className="space-y-2">
                              {Object.entries(summary.relationshipRatings).map(([relationship, data]) => (
                                data.count > 0 && (
                                  <div key={relationship} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getRelationshipBadge(relationship)}
                                      <span className="text-sm">{data.count} evaluator(s)</span>
                                    </div>
                                    <span className="font-medium">{parseFloat(data.average).toFixed(1)}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">By Category</h4>
                            <div className="space-y-2">
                              {Object.entries(summary.categoryRatings).map(([category, data]) => (
                                <div key={category} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{category}</span>
                                    <span className="font-medium">{parseFloat(data.average).toFixed(1)}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                      className="bg-[#E51636] h-2.5 rounded-full"
                                      style={{ width: `${Math.min(parseFloat(data.average) / 5 * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Development Recommendations */}
                    {summary.developmentRecommendations && summary.developmentRecommendations.length > 0 && (
                      <Card>
                        <CardHeader className="bg-blue-50">
                          <CardTitle className="flex items-center text-blue-700">
                            <Target className="h-5 w-5 mr-2" />
                            Development Recommendations
                          </CardTitle>
                          <CardDescription>
                            Personalized recommendations based on your 360° feedback patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {summary.developmentRecommendations.map((recommendation, index) => (
                              <div key={index} className={`border rounded-lg p-4 ${
                                recommendation.priority === 'high' ? 'border-red-200 bg-red-50' :
                                recommendation.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                                'border-green-200 bg-green-50'
                              }`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{recommendation.area}</h4>
                                    <Badge variant="outline" className={
                                      recommendation.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' :
                                      recommendation.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                      'bg-green-100 text-green-700 border-green-300'
                                    }>
                                      {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Rating: {typeof recommendation.rating === 'number' ? recommendation.rating.toFixed(1) : recommendation.rating}/5.0
                                  </div>
                                </div>
                                <p className="text-sm mb-3">{recommendation.suggestion}</p>
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Recommended Resources:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {recommendation.resources.map((resource, resourceIndex) => (
                                      <Badge key={resourceIndex} variant="secondary" className="text-xs">
                                        {resource}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Development Plan Generation */}
                    {isSubject && (
                      <Card>
                        <CardHeader className="bg-purple-50">
                          <CardTitle className="flex items-center text-purple-700">
                            <Target className="h-5 w-5 mr-2" />
                            Automatic Development Plan
                          </CardTitle>
                          <CardDescription>
                            Generate a personalized development plan based on your 360° feedback
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                              Create a comprehensive development plan with SMART goals, action items, and timelines based on your evaluation results.
                            </p>
                            <Button
                              onClick={() => {
                                // Navigate to development plan page
                                navigate(`/leadership/360-evaluations/${evaluationId}/development-plan`);
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Generate Development Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}



                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="bg-green-50">
                          <CardTitle className="flex items-center text-green-700">
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {summary.strengths && summary.strengths.length > 0 ? (
                              summary.strengths.map((strength, index) => (
                                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getRelationshipBadge(strength.relationship)}
                                  </div>
                                  <p className="text-sm">{strength.text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted-foreground">No strengths provided</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="bg-amber-50">
                          <CardTitle className="flex items-center text-amber-700">
                            <ArrowUpCircle className="h-5 w-5 mr-2" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {summary.improvements && summary.improvements.length > 0 ? (
                              summary.improvements.map((improvement, index) => (
                                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getRelationshipBadge(improvement.relationship)}
                                  </div>
                                  <p className="text-sm">{improvement.text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted-foreground">No improvement suggestions provided</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Examples, Goals, and General Comments */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Feedback Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Specific Examples */}
                          <div>
                            <h4 className="font-medium mb-3">Specific Leadership Examples</h4>
                            <div className="space-y-4">
                              {summary.examples && summary.examples.length > 0 ? (
                                summary.examples.map((example, index) => (
                                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getRelationshipBadge(example.relationship)}
                                    </div>
                                    <p className="text-sm">{example.text}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-muted-foreground">No specific examples provided</p>
                              )}
                            </div>
                          </div>

                          {/* Development Goals (from self-evaluation) */}
                          {summary.goals && summary.goals.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center">
                                <Target className="h-5 w-5 mr-2 text-blue-600" />
                                Leadership Development Goals
                              </h4>
                              <div className="space-y-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                                {summary.goals.map((goal, index) => (
                                  <div key={index} className="border-b border-blue-200 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Self Assessment</Badge>
                                    </div>
                                    <p className="text-sm">{goal.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* General Comments */}
                          <div>
                            <h4 className="font-medium mb-3">General Comments</h4>
                            <div className="space-y-4">
                              {summary.comments.length === 0 ? (
                                <p className="text-center text-muted-foreground">No general comments provided</p>
                              ) : (
                                summary.comments.map((comment, index) => (
                                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getRelationshipBadge(comment.relationship)}
                                    </div>
                                    <p className="text-sm">{comment.comment}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete 360° Evaluation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this evaluation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEvaluation.isPending}
            >
              {deleteEvaluation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit 360° Evaluation</DialogTitle>
            <DialogDescription>
              Are you ready to submit your evaluation for {evaluation?.subject.name}?
              Once submitted, you won't be able to make changes.
              {!isSelfEvaluation && (
                <div className="mt-2 flex items-center text-green-700 text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Your feedback will remain anonymous. Only your relationship to the leader will be shown.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              <p className="flex items-center font-medium mb-1">
                <AlertCircle className="h-4 w-4 mr-2" />
                Please confirm your submission
              </p>
              <p className="mb-2">
                You've completed {Object.keys(responses).length} of {evaluation?.template?.sections?.reduce((acc, section) =>
                  acc + (section.criteria?.length || 0), 0) || 0} criteria ratings.
              </p>
              <p>
                You've also provided {responses.strengths ? '✓' : '✗'} strengths feedback,
                {responses.improvements ? '✓' : '✗'} improvement suggestions, and
                {responses.examples ? '✓' : '✗'} specific examples.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Review Again
            </Button>
            <Button
              onClick={() => {
                handleSubmit();
                setShowSubmitDialog(false);
              }}
              disabled={submitEvaluation.isPending}
              className="bg-[#E51636] hover:bg-[#C41230] text-white"
            >
              {submitEvaluation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </div>
              ) : (
                <>
                  Confirm Submission
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
