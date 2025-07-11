import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { AlertCircle, ClipboardCheck, FileText, GraduationCap, Calendar, Settings, UserCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Evaluation {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
  };
  evaluator: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  template: {
    _id: string;
    name: string;
    description: string;
    sections: Array<{
      title: string;
      questions: Array<{
        id: string;
        text: string;
        type: 'rating' | 'text';
        required?: boolean;
      }>;
    }>;
  };
  status: 'pending_self_evaluation' | 'pending_manager_review' | 'in_review_session' | 'completed';
  scheduledDate: string;
  reviewSessionDate?: string;
  selfEvaluation?: Record<string, any>;
  managerEvaluation?: Record<string, any>;
  overallComments?: string;
  developmentPlan?: string;
  acknowledgement?: {
    acknowledged: boolean;
    date: string;
  };
}

interface Grade {
  value: number;
  label: string;
  description?: string;
  color: string;
}

interface GradingScale {
  _id: string;
  name: string;
  description?: string;
  grades: Grade[];
  isDefault: boolean;
}

interface Documentation {
  _id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  status: string;
  supervisor: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface TrainingProgress {
  _id: string;
  trainingPlan: {
    _id: string;
    name: string;
    type: string;
    department: string;
    position: string;
  };
  startDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
}

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text';
  required?: boolean;
  gradingScale?: GradingScale;
}

interface Section {
  title: string;
  description?: string;
  order?: number;
  questions: Question[];
}

export default function ViewEvaluation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [overallComments, setOverallComments] = useState('');
  const [reviewSessionDate, setReviewSessionDate] = useState<string>('');
  const [showScheduleReview, setShowScheduleReview] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState({ section: 0, question: 0 });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangeEvaluator, setShowChangeEvaluator] = useState(false);
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const queryClient = useQueryClient();

  // Initialize showScheduleReview based on URL parameter
  useEffect(() => {
    if (searchParams.get('showSchedule') === 'true') {
      setShowScheduleReview(true);
    }
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const getRatingText = (rating: string | number | undefined, gradingScale?: GradingScale): string => {
    if (!rating || !gradingScale) return '';

    // Convert to number if it's a numeric string
    const ratingNum = typeof rating === 'number' ? rating : Number(rating);
    if (!isNaN(ratingNum)) {
      const grade = gradingScale.grades.find(g => g.value === ratingNum);
      return grade ? grade.label : '';
    }

    // If the rating is a string starting with "- ", return the rest of the string
    if (typeof rating === 'string' && rating.startsWith('- ')) {
      return rating.substring(2);
    }

    // For string ratings, try to find matching grade by label
    if (typeof rating === 'string' && gradingScale) {
      const grade = gradingScale.grades.find(g => rating.includes(g.label));
      return grade ? grade.label : '';
    }

    return '';
  };

  const getRatingColor = (rating: number | string, gradingScale?: GradingScale): string => {
    if (!gradingScale) return '#000000';

    const ratingNum = Number(rating);
    const grade = gradingScale.grades.find(g => g.value === ratingNum);
    return grade ? grade.color : '#000000';
  };

  // Fetch evaluation data with grading scales
  const { data: evaluation, isLoading, refetch } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: async () => {
      const response = await api.get(`/api/evaluations/${id}`);
      return response.data.evaluation;
    }
  });

  // Fetch available evaluators (Directors and Leaders)
  const { data: availableEvaluators } = useQuery({
    queryKey: ['availableEvaluators'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      // Filter for users with Director or Leader positions
      return response.data.users.filter((user: any) =>
        ['Director', 'Leader'].includes(user.position)
      );
    },
    enabled: user?.position === 'Director' // Only fetch if current user is a Director
  });

  // Fetch employee documentation
  const { data: employeeDocumentation, isLoading: isLoadingDocumentation } = useQuery({
    queryKey: ['employeeDocumentation', evaluation?.employee?._id],
    queryFn: async () => {
      if (!evaluation?.employee?._id) return [];
      const response = await api.get(`/api/documentation/employee/${evaluation.employee._id}`);
      return response.data;
    },
    enabled: !!evaluation?.employee?._id && evaluation?.status === 'pending_manager_review'
  });

  // Fetch employee training progress
  const { data: employeeTraining, isLoading: isLoadingTraining } = useQuery({
    queryKey: ['employeeTraining', evaluation?.employee?._id],
    queryFn: async () => {
      if (!evaluation?.employee?._id) return [];
      const response = await api.get(`/api/training/employees/training-progress`);
      // Filter for the current employee
      return response.data.filter((progress: any) =>
        progress.trainee?._id === evaluation.employee._id
      );
    },
    enabled: !!evaluation?.employee?._id && evaluation?.status === 'pending_manager_review'
  });

  // Initialize answers when evaluation data is loaded
  useEffect(() => {
    if (evaluation) {
      console.log('Loading evaluation data:', {
        status: evaluation.status,
        selfEvaluation: !!evaluation.selfEvaluation,
        managerEvaluation: !!evaluation.managerEvaluation,
        draftEvaluation: !!evaluation.draftEvaluation,
        isEmployee: user?._id === evaluation.employee._id,
        isManager: user?._id === evaluation.evaluator._id
      });

      // If user is the employee and self-evaluation exists, load it
      if (user?._id === evaluation.employee._id && evaluation.selfEvaluation) {
        setAnswers(evaluation.selfEvaluation);
      }
      // If user is the manager, load the appropriate evaluation data
      else if (user?._id === evaluation.evaluator._id) {
        // First priority: Load draft evaluation if it exists (for in_review_session)
        if (evaluation.draftEvaluation && Object.keys(evaluation.draftEvaluation).length > 0) {
          console.log('Loading draft evaluation');
          setAnswers(evaluation.draftEvaluation);
          setOverallComments(evaluation.draftComments || '');
        }
        // Second priority: Load manager evaluation if it exists (for completed evaluations)
        else if (evaluation.managerEvaluation && Object.keys(evaluation.managerEvaluation).length > 0) {
          console.log('Loading manager evaluation');
          setAnswers(evaluation.managerEvaluation);
          setOverallComments(evaluation.overallComments || '');
        }
        // If we're in review session but no draft exists yet, initialize with empty answers
        else if (evaluation.status === 'in_review_session') {
          console.log('Initializing empty answers for in_review_session');
          setAnswers({});
          setOverallComments('');
        }
      }
    }
  }, [evaluation, user]);

  // Determine if the current user can edit this evaluation
  const isEmployee = user?._id === evaluation?.employee?._id;
  const isManager = user?._id === evaluation?.evaluator?._id;
  const canEdit = (isEmployee && evaluation?.status === 'pending_self_evaluation') ||
                 (isManager && evaluation?.status === 'in_review_session');

  // Calculate total questions and set initial question index when evaluation loads
  useEffect(() => {
    if (evaluation) {
      // Calculate total questions
      const total = evaluation.template.sections.reduce(
        (total: number, section: Section) => total + section.questions.length,
        0
      );
      setTotalQuestions(total);

      // Set initial question index to the first unanswered question
      const userCanEdit = (isEmployee && evaluation.status === 'pending_self_evaluation') ||
                         (isManager && evaluation.status === 'in_review_session');

      if (userCanEdit && Object.keys(answers).length > 0) {
        // Count total questions and answered questions
        let totalQuestionsCount = 0;
        let answeredQuestionsCount = 0;

        // Check each question to see if it's answered
        for (let s = 0; s < evaluation.template.sections.length; s++) {
          const section = evaluation.template.sections[s];
          for (let q = 0; q < section.questions.length; q++) {
            totalQuestionsCount++;
            const key = `${s}-${q}`;
            if (answers[key]) {
              answeredQuestionsCount++;
            }
          }
        }

        // If all questions are answered and we're in review session, show the summary
        if (answeredQuestionsCount === totalQuestionsCount &&
            isManager &&
            evaluation.status === 'in_review_session') {
          console.log('All questions answered, showing summary');
          setShowSummary(true);
          return;
        }

        // Otherwise, find the first unanswered question
        let foundUnanswered = false;

        for (let s = 0; s < evaluation.template.sections.length; s++) {
          const section = evaluation.template.sections[s];
          for (let q = 0; q < section.questions.length; q++) {
            const key = `${s}-${q}`;
            if (!answers[key]) {
              setCurrentQuestionIndex({ section: s, question: q });
              foundUnanswered = true;
              break;
            }
          }
          if (foundUnanswered) break;
        }

        // If all questions are answered but we're not showing summary, set to the last question
        if (!foundUnanswered) {
          // Find the last section and question
          const lastSectionIndex = evaluation.template.sections.length - 1;
          const lastQuestionIndex = evaluation.template.sections[lastSectionIndex].questions.length - 1;
          setCurrentQuestionIndex({ section: lastSectionIndex, question: lastQuestionIndex });
        }
      }
    }
  }, [evaluation, answers, isEmployee, isManager]);

  // Helper function to get next question indices
  const getNextQuestionIndices = (currentSection: number, currentQuestion: number) => {
    if (!evaluation) return null;

    // Start searching from the current position
    let section = currentSection;
    let question = currentQuestion + 1;

    // Search through all sections and questions
    while (section < evaluation.template.sections.length) {
      const currentSectionQuestions = evaluation.template.sections[section].questions;

      while (question < currentSectionQuestions.length) {
        // Check if this question is unanswered
        const key = `${section}-${question}`;
        if (!answers[key]) {
          return { section, question };
        }
        question++;
      }

      // Move to next section
      section++;
      question = 0;
    }

    // If we get here, check from the beginning up to current position
    section = 0;
    question = 0;

    while (section <= currentSection) {
      const currentSectionQuestions = evaluation.template.sections[section].questions;
      const maxQuestion = (section === currentSection) ? currentQuestion : currentSectionQuestions.length;

      while (question < maxQuestion) {
        // Check if this question is unanswered
        const key = `${section}-${question}`;
        if (!answers[key]) {
          return { section, question };
        }
        question++;
      }

      section++;
      question = 0;
    }

    // If no unanswered questions found, return null
    return null;
  };

  // Helper function to get previous question indices
  const getPreviousQuestionIndices = (currentSection: number, currentQuestion: number) => {
    if (!evaluation) return null;

    if (currentQuestion > 0) {
      return { section: currentSection, question: currentQuestion - 1 };
    }

    if (currentSection > 0) {
      const previousSection = evaluation.template.sections[currentSection - 1];
      return {
        section: currentSection - 1,
        question: previousSection.questions.length - 1
      };
    }

    return null;
  };

  // Calculate current question number (1-based)
  const getCurrentQuestionNumber = () => {
    if (!evaluation) return 1;

    let questionNumber = 1;
    for (let s = 0; s < currentQuestionIndex.section; s++) {
      questionNumber += evaluation.template.sections[s].questions.length;
    }
    return questionNumber + currentQuestionIndex.question;
  };

  // Validate answers
  const validateAnswers = (validateAll: boolean = false) => {
    const errors: string[] = [];
    evaluation?.template.sections.forEach((section: Section, sectionIndex: number) => {
      section.questions.forEach((question: Question, questionIndex: number) => {
        // If validateAll is false, only check the current question
        if (!validateAll && (sectionIndex !== currentQuestionIndex.section || questionIndex !== currentQuestionIndex.question)) {
          return;
        }
        const answer = answers[`${sectionIndex}-${questionIndex}`];
        if (question.required && (!answer || answer.trim() === '')) {
          errors.push(`${section.title} - ${question.text}`);
        }
      });
    });
    return errors;
  };

  // Submit self-evaluation mutation
  const submitSelfEvaluation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/evaluations/${id}/self-evaluation`, {
        evaluation: answers
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your self-evaluation has been submitted successfully.",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Schedule review session mutation
  const scheduleReviewSession = useMutation({
    mutationFn: async () => {
      return api.post(`/api/evaluations/${id}/schedule-review`, {
        reviewSessionDate
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review session scheduled successfully',
      });
      setShowScheduleReview(false);
      navigate('/evaluations');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to schedule review session',
        variant: 'destructive',
      });
    }
  });

  // Complete manager evaluation mutation
  const completeManagerEvaluation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/evaluations/${id}/complete`, {
        evaluation: answers,
        overallComments,
        developmentPlan: ''  // Adding this as it's expected by the server
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation completed successfully",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });

      // Navigate back to evaluations list
      navigate('/evaluations');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete evaluation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Acknowledge evaluation mutation
  const acknowledgeEvaluation = useMutation({
    mutationFn: async () => {
      return api.post(`/api/evaluations/${id}/acknowledge`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Evaluation acknowledged successfully',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to acknowledge evaluation',
        variant: 'destructive',
      });
    }
  });

  // Save draft mutation
  const saveDraft = useMutation({
    mutationFn: async () => {
      if (isEmployee) {
        const response = await api.post(`/api/evaluations/${id}/self-evaluation`, {
          selfEvaluation: answers,
          preventStatusChange: true
        });
        return response.data;
      } else {
        const response = await api.post(`/api/evaluations/${id}/save-draft`, {
          managerEvaluation: answers,
          overallComments
        });
        return response.data;
      }
    },
    onSuccess: (data) => {
      // Update the local cache with the saved draft data
      queryClient.setQueryData(['evaluation', id], (oldData: any) => {
        if (!oldData) return oldData;

        const userIsEmployee = user?._id === oldData.employee?._id;
        const userIsManager = user?._id === oldData.evaluator?._id;

        return {
          ...oldData,
          draftEvaluation: userIsManager ? answers : oldData.draftEvaluation,
          draftComments: userIsManager ? overallComments : oldData.draftComments,
          selfEvaluation: userIsEmployee ? answers : oldData.selfEvaluation
        };
      });

      // Create and show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center transform transition-all duration-300 translate-y-0';
      notification.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Draft saved successfully</span>
      `;
      document.body.appendChild(notification);

      // Add entrance animation
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      });

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);

      // Refetch the evaluation data to update the UI
      refetch();
    },
    onError: (error: any) => {
      // Create and show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center transform transition-all duration-300 translate-y-0';
      notification.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>${error.response?.data?.message || 'Failed to save draft'}</span>
      `;
      document.body.appendChild(notification);

      // Add entrance animation
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      });

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  });

  // Send unacknowledged notification mutation
  const sendUnacknowledgedNotification = useMutation({
    mutationFn: async () => {
      return api.post(`/api/evaluations/${id}/notify-unacknowledged`);
    },
    onSuccess: () => {
      // Create and show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center transform transition-all duration-300 translate-y-0';
      notification.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Acknowledgement reminder sent successfully</span>
      `;
      document.body.appendChild(notification);

      // Add entrance animation
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      });

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },
    onError: (error: any) => {
      // Create and show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center transform transition-all duration-300 translate-y-0';
      notification.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>${error.response?.data?.message || 'Failed to send notification'}</span>
      `;
      document.body.appendChild(notification);

      // Add entrance animation
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      });

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  });

  // Complete review mutation
  const completeReview = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/evaluations/${id}/complete`, {
        evaluation: answers,
        overallComments,
        developmentPlan: ''
      }, {
        timeout: 30000 // 30 second timeout
      });
      return response.data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['evaluation', id] });
      await queryClient.cancelQueries({ queryKey: ['evaluations'] });

      // Snapshot current state
      const previousEvaluation = queryClient.getQueryData(['evaluation', id]);

      // Return context with snapshotted value
      return { previousEvaluation };
    },
    onSuccess: (data) => {
      // Only update cache after successful server response
      queryClient.setQueryData(['evaluation', id], (old: any) => ({
        ...old,
        status: 'completed',
        managerEvaluation: answers,
        overallComments,
      }));

      toast({
        title: "Success",
        description: "Review has been completed successfully.",
      });

      // Navigate after a delay to allow toast to be seen
      setTimeout(() => {
        navigate('/evaluations');
      }, 1000);
    },
    onError: async (error, _, context: any) => {
      // First rollback the optimistic update
      if (context?.previousEvaluation) {
        await queryClient.setQueryData(['evaluation', id], context.previousEvaluation);
      }

      // Then show error toast
      console.error('Complete review error:', error);
      toast({
        title: "Error",
        description: "Failed to complete review. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    }
  });

  // Handle complete review
  const handleCompleteReview = () => {
    // Validate all required fields
    const errors = validateAnswers(true);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    completeReview.mutate();
  };

  const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [`${sectionIndex}-${questionIndex}`]: value
    }));
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!evaluation) return 0;
    const totalQuestions = evaluation.template.sections.reduce(
      (total: number, section: Section) => total + section.questions.length,
      0
    );
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Add helper function to calculate rating value
  const getRatingValue = (rating: string | number | undefined, gradingScale?: GradingScale): number => {
    if (!rating || !gradingScale) return 0;
    if (typeof rating === 'number') return rating;

    // If the rating is a numeric string, convert it to a number
    const numericValue = Number(rating);
    if (!isNaN(numericValue)) return numericValue;

    // If we have a grading scale, find the grade by label
    const grade = gradingScale.grades.find(g =>
      rating.includes(g.label) || rating.includes(`- ${g.label}`)
    );

    // Find the index of the grade in the sorted grades array (1-based)
    if (grade) {
      const sortedGrades = [...gradingScale.grades].sort((a, b) => a.value - b.value);
      return sortedGrades.findIndex(g => g.label === grade.label) + 1;
    }

    return 0;
  };

  // Add helper function to calculate total score
  const calculateTotalScore = (ratings: Record<string, any> | undefined | null): { score: number; total: number } => {
    if (!evaluation || !ratings) return { score: 0, total: 0 };

    let totalScore = 0;
    let totalPossible = 0;

    evaluation.template.sections.forEach((section: Section, sectionIndex: number) => {
      section.questions.forEach((question: Question, questionIndex: number) => {
        if (question.type === 'rating' && question.gradingScale) {
          const rating = ratings[`${sectionIndex}-${questionIndex}`];
          if (rating !== undefined && rating !== null) {
            // Get the total number of grades as the maximum possible value
            const maxValue = question.gradingScale.grades.length;
            totalScore += getRatingValue(rating, question.gradingScale);
            totalPossible += maxValue;
          }
        }
      });
    });

    return { score: totalScore, total: totalPossible };
  };

  // Add helper function to compare ratings
  const getComparisonStyle = (employeeRating: string | number | undefined, managerRating: string | number | undefined, gradingScale?: GradingScale): string => {
    if (!employeeRating || !managerRating || !gradingScale) return '';

    const employeeValue = getRatingValue(employeeRating, gradingScale);
    const managerValue = getRatingValue(managerRating, gradingScale);

    if (managerValue > employeeValue) return 'bg-green-50 border-green-200';
    if (managerValue < employeeValue) return 'bg-red-50 border-red-200';
    return 'bg-[#27251F]/5'; // Default background for matching ratings
  };

  // Add a new mutation for starting the review without scheduling
  const startReviewNow = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/evaluations/${id}/start-review`);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the local cache with the updated status
      queryClient.setQueryData(['evaluation', id], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          status: 'in_review_session',
          // Preserve any existing draft data
          draftEvaluation: oldData.draftEvaluation || {},
          draftComments: oldData.draftComments || ''
        };
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });

      // Update local state
      setShowScheduleReview(false);
      setIsEditing(true);

      toast({
        title: "Review Started",
        description: "You can now complete the evaluation for this employee.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start review. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update evaluator mutation (admin only)
  const updateEvaluator = useMutation({
    mutationFn: async (evaluatorId: string) => {
      const response = await api.patch(`/api/evaluations/${id}/evaluator`, {
        evaluatorId
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Evaluator updated successfully",
      });
      setShowChangeEvaluator(false);
      setSelectedEvaluatorId('');
      refetch(); // Refetch evaluation data to update UI
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update evaluator",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading evaluation...</div>;
  }

  if (!evaluation) {
    return <div className="text-center py-4">Evaluation not found</div>;
  }



  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={`Evaluation for ${evaluation?.employee?.name || 'Loading...'}`}
          subtitle={`Evaluator: ${evaluation?.evaluator?.name || 'Loading...'}`}
          showBackButton={true}
          icon={<ClipboardCheck className="h-5 w-5" />}
        />

        {/* Admin Controls */}
        {user?.position === 'Director' && evaluation?.status !== 'completed' && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangeEvaluator(true)}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Change Evaluator
            </Button>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-white rounded-[20px] shadow-md border-0">
          <CardContent className="p-8">
            {/* Status and Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#27251F]/60 mb-2">Employee</h3>
                  <p className="text-[#27251F] text-lg font-medium">
                    {evaluation?.employee?.name || 'Loading...'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#27251F]/60 mb-2">Position</h3>
                  <p className="text-[#27251F] text-lg font-medium">
                    {evaluation?.employee?.position || 'Team Member'}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#27251F]/60 mb-2">Status</h3>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    evaluation?.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : evaluation?.status === 'in_review_session'
                      ? 'bg-purple-100 text-purple-800'
                      : evaluation?.status === 'pending_manager_review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {evaluation?.status?.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase()) || 'Loading...'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#27251F]/60 mb-2">Employee Due Date</h3>
                  <p className="text-[#27251F] text-lg font-medium">
                    {evaluation?.scheduledDate ? new Date(evaluation.scheduledDate).toLocaleDateString() : 'Loading...'}
                  </p>
                </div>
                {evaluation?.reviewSessionDate && (
                  <div>
                    <h3 className="text-sm font-medium text-[#27251F]/60 mb-2">Review Session Date</h3>
                    <p className="text-[#27251F] text-lg font-medium">
                      {new Date(evaluation.reviewSessionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Grading Scale Legend */}
            <div className="mb-8 p-6 bg-[#27251F]/5 rounded-[20px]">
              <h3 className="text-lg font-medium text-[#27251F] mb-4">Grading Scale</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-red-50 text-red-800 rounded-xl">
                  <div className="text-lg font-medium">1 - Improvement Needed</div>
                  <div className="text-sm opacity-80">Low Hands / Low Heart</div>
                </div>
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl">
                  <div className="text-lg font-medium">2 - Performer</div>
                  <div className="text-sm opacity-80">High Hands / Low Heart</div>
                </div>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl">
                  <div className="text-lg font-medium">3 - Valued</div>
                  <div className="text-sm opacity-80">Low Hands / High Heart</div>
                </div>
                <div className="p-4 bg-green-50 text-green-800 rounded-xl">
                  <div className="text-lg font-medium">4 - Star</div>
                  <div className="text-sm opacity-80">High Hands / High Heart</div>
                </div>
              </div>
            </div>

            {/* Schedule Review Session Modal */}
            {showScheduleReview && (
              <Card className="mb-8 border border-[#E51636]/20 rounded-[20px]">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-xl text-[#27251F]">Schedule Review Session</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#27251F]/60 mb-2">
                        Select Date and Time for Review Session
                      </label>
                      <input
                        type="datetime-local"
                        value={reviewSessionDate}
                        onChange={(e) => setReviewSessionDate(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowScheduleReview(false)}
                        className="h-12 px-6 rounded-2xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => scheduleReviewSession.mutate()}
                        disabled={!reviewSessionDate || scheduleReviewSession.isPending}
                        className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                      >
                        {scheduleReviewSession.isPending ? 'Scheduling...' : 'Schedule Session'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Self Evaluation Form */}
            {isEmployee && evaluation.status === 'pending_self_evaluation' && (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-[#27251F]">Question {getCurrentQuestionNumber()} of {totalQuestions}</h3>
                    <span className="text-sm text-[#27251F]/60">{Math.round((getCurrentQuestionNumber() / totalQuestions) * 100)}%</span>
                  </div>
                  <Progress
                    value={(getCurrentQuestionNumber() / totalQuestions) * 100}
                    className="h-2 bg-[#27251F]/10 rounded-full [&>div]:bg-[#E51636] [&>div]:rounded-full"
                  />
                </div>

                {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="text-red-800 font-medium mb-2">Please complete all required questions before submitting</h4>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current Question Display */}
                <div className="space-y-6 mb-8">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    {/* Question */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#27251F] mb-4">
                        {evaluation.template.sections[currentQuestionIndex.section]
                          .questions[currentQuestionIndex.question].text}
                      </h3>
                    </div>

                    {/* Rating Input */}
                    <div>
                      <select
                        value={answers[`${currentQuestionIndex.section}-${currentQuestionIndex.question}`] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestionIndex.section, currentQuestionIndex.question, e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent bg-white"
                      >
                        <option value="">Select a rating</option>
                        {evaluation.template.sections[currentQuestionIndex.section]
                          .questions[currentQuestionIndex.question].gradingScale?.grades.map((grade: Grade) => (
                          <option key={grade.value} value={grade.value}>
                            {grade.value} - {grade.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const prev = getPreviousQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question);
                        if (prev) setCurrentQuestionIndex(prev);
                      }}
                      disabled={currentQuestionIndex.section === 0 && currentQuestionIndex.question === 0}
                      className="w-full md:w-auto h-12 px-6 rounded-2xl"
                    >
                      Previous Question
                    </Button>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => saveDraft.mutate()}
                        disabled={saveDraft.isPending}
                        className="w-full md:w-auto h-12 px-6 rounded-2xl"
                      >
                        {saveDraft.isPending ? 'Saving...' : 'Save Draft'}
                      </Button>

                      {getNextQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question) ? (
                        <Button
                          type="button"
                          onClick={() => {
                            const next = getNextQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question);
                            if (next) {
                              setValidationErrors([]);
                              setCurrentQuestionIndex(next);
                            }
                          }}
                          className="w-full md:w-auto bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                        >
                          Next Question
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            const errors = validateAnswers(true);
                            if (errors.length === 0) {
                              submitSelfEvaluation.mutate();
                            } else {
                              setValidationErrors(errors);
                            }
                          }}
                          className="w-full md:w-auto bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                        >
                          Submit Evaluation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Employee Documentation and Training Section */}
            {isManager && evaluation.status === 'pending_manager_review' && !showScheduleReview && (
              <>
                {/* Employee History Section */}
                <div className="mb-8 space-y-6">
                  <h3 className="text-xl font-medium text-[#27251F]">Employee History</h3>

                  {/* Documentation Section */}
                  <Card className="bg-white rounded-[20px] shadow-sm border border-gray-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <CardTitle className="text-lg text-[#27251F]">Recent Documentation</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDocumentation ? (
                        <div className="py-4 text-center text-[#27251F]/60">Loading documentation...</div>
                      ) : employeeDocumentation && employeeDocumentation.length > 0 ? (
                        <div className="space-y-3">
                          {employeeDocumentation.slice(0, 5).map((doc: Documentation) => (
                            <div key={doc._id} className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-[#27251F]">{doc.type}</div>
                                  <div className="text-sm text-[#27251F]/60 mt-1">{doc.description.substring(0, 100)}{doc.description.length > 100 ? '...' : ''}</div>
                                </div>
                                <div className="text-xs text-[#27251F]/60 whitespace-nowrap">
                                  {new Date(doc.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  doc.category === 'Disciplinary'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {doc.category}
                                </span>
                                <span className="text-xs text-[#27251F]/60">
                                  By: {doc.supervisor.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-[#27251F]/60">No recent documentation found</div>
                      )}

                      {employeeDocumentation && employeeDocumentation.length > 0 && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/documentation?employee=${evaluation.employee._id}`)}
                            className="text-sm"
                          >
                            View All Documentation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Training Section */}
                  <Card className="bg-white rounded-[20px] shadow-sm border border-gray-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle className="text-lg text-[#27251F]">Training Progress</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTraining ? (
                        <div className="py-4 text-center text-[#27251F]/60">Loading training data...</div>
                      ) : employeeTraining && employeeTraining.length > 0 ? (
                        <div className="space-y-3">
                          {employeeTraining.map((training: TrainingProgress) => (
                            <div key={training._id} className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-[#27251F]">{training.trainingPlan.name}</div>
                                  <div className="text-sm text-[#27251F]/60 mt-1">
                                    {training.trainingPlan.department} - {training.trainingPlan.position}
                                  </div>
                                </div>
                                <div className="text-xs text-[#27251F]/60 whitespace-nowrap flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(training.startDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-[#27251F]/60">Progress</span>
                                  <span className="text-xs font-medium">{training.progress}%</span>
                                </div>
                                <div className="w-full bg-[#27251F]/10 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      training.status === 'COMPLETED'
                                        ? 'bg-green-500'
                                        : training.status === 'ON_HOLD'
                                        ? 'bg-yellow-500'
                                        : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${training.progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-end mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    training.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : training.status === 'ON_HOLD'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {training.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-[#27251F]/60">No training data found</div>
                      )}

                      {employeeTraining && employeeTraining.length > 0 && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/training/progress?employee=${evaluation.employee._id}`)}
                            className="text-sm"
                          >
                            View All Training
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Action Required Card */}
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-100 rounded-[20px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-2 text-amber-800">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-center font-medium">
                        Action Required: Schedule or Complete Review
                      </p>
                    </div>
                    <p className="text-center text-amber-700">
                      You can either schedule a review session with the employee or complete the evaluation now.
                    </p>
                    <div className="flex gap-4 mt-2">
                      <Button
                        onClick={() => setShowScheduleReview(true)}
                        className="bg-[#E51636] hover:bg-[#E51636]/90 text-white rounded-xl"
                      >
                        Schedule Review Session
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => startReviewNow.mutate()}
                        disabled={startReviewNow.isPending}
                        className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/10 rounded-xl"
                      >
                        {startReviewNow.isPending ? 'Starting...' : 'Complete Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Current evaluation form */}
            {canEdit && isManager && evaluation.status === 'in_review_session' && (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    {calculateProgress() === 100 ? (
                      <h3 className="text-lg font-medium text-[#27251F]">All questions answered</h3>
                    ) : (
                      <h3 className="text-lg font-medium text-[#27251F]">Question {getCurrentQuestionNumber()} of {totalQuestions}</h3>
                    )}
                    <span className="text-sm text-[#27251F]/60">{calculateProgress()}%</span>
                  </div>
                  <Progress
                    value={calculateProgress()}
                    className="h-2 bg-[#27251F]/10 rounded-full [&>div]:bg-[#E51636] [&>div]:rounded-full"
                  />
                </div>

                {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="text-red-800 font-medium mb-2">Please complete all required questions before submitting</h4>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current Question Display - Hide when showing summary */}
                {!showSummary && (
                  <div className="space-y-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      {/* Question */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-[#27251F] mb-4">
                          {evaluation.template.sections[currentQuestionIndex.section]
                            .questions[currentQuestionIndex.question].text}
                        </h3>
                      </div>

                      {/* Employee's Rating */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getRatingColor(
                                evaluation.selfEvaluation?.[`${currentQuestionIndex.section}-${currentQuestionIndex.question}`],
                                evaluation.template.sections[currentQuestionIndex.section]
                                  .questions[currentQuestionIndex.question].gradingScale
                              )
                            }}
                          />
                          <span className="text-[#27251F] font-medium">
                            {getRatingText(
                              evaluation.selfEvaluation?.[`${currentQuestionIndex.section}-${currentQuestionIndex.question}`],
                              evaluation.template.sections[currentQuestionIndex.section]
                                .questions[currentQuestionIndex.question].gradingScale
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Manager's Input */}
                      <div>
                        <select
                          value={answers[`${currentQuestionIndex.section}-${currentQuestionIndex.question}`] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestionIndex.section, currentQuestionIndex.question, e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent bg-white"
                        >
                          <option value="">Select a rating</option>
                          {evaluation.template.sections[currentQuestionIndex.section]
                            .questions[currentQuestionIndex.question].gradingScale?.grades.map((grade: Grade) => (
                            <option key={grade.value} value={grade.value}>
                              {grade.value} - {grade.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Navigation and Finalize Buttons */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const prev = getPreviousQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question);
                          if (prev) setCurrentQuestionIndex(prev);
                        }}
                        disabled={currentQuestionIndex.section === 0 && currentQuestionIndex.question === 0}
                        className="w-full md:w-auto h-12 px-6 rounded-2xl"
                      >
                        Previous Question
                      </Button>

                      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => saveDraft.mutate()}
                          disabled={saveDraft.isPending}
                          className="w-full md:w-auto h-12 px-6 rounded-2xl"
                        >
                          {saveDraft.isPending ? 'Saving...' : 'Save Draft'}
                        </Button>

                        {getNextQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question) ? (
                          <Button
                            type="button"
                            onClick={() => {
                              // First save the current answer
                              saveDraft.mutate(undefined, {
                                onSuccess: () => {
                                  const next = getNextQuestionIndices(currentQuestionIndex.section, currentQuestionIndex.question);
                                  if (next) {
                                    setCurrentQuestionIndex(next);
                                  } else {
                                    // Check if all questions are answered
                                    let allAnswered = true;
                                    let totalQuestionsCount = 0;
                                    let answeredQuestionsCount = 0;

                                    for (let s = 0; s < evaluation.template.sections.length; s++) {
                                      const section = evaluation.template.sections[s];
                                      for (let q = 0; q < section.questions.length; q++) {
                                        totalQuestionsCount++;
                                        const key = `${s}-${q}`;
                                        if (answers[key]) {
                                          answeredQuestionsCount++;
                                        } else {
                                          allAnswered = false;
                                        }
                                      }
                                    }

                                    // If all questions are answered, show the summary
                                    if (allAnswered) {
                                      console.log('All questions answered, showing summary');
                                      setShowSummary(true);
                                      toast({
                                        title: "All questions completed",
                                        description: "Your review has been saved and is ready to discuss with the employee.",
                                      });
                                    } else {
                                      // Otherwise, find the first unanswered question
                                      for (let s = 0; s < evaluation.template.sections.length; s++) {
                                        const section = evaluation.template.sections[s];
                                        for (let q = 0; q < section.questions.length; q++) {
                                          const key = `${s}-${q}`;
                                          if (!answers[key]) {
                                            setCurrentQuestionIndex({ section: s, question: q });
                                            break;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              });
                            }}
                            disabled={saveDraft.isPending}
                            className="w-full md:w-auto bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                          >
                            {saveDraft.isPending ? 'Saving...' : 'Next Question'}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              // Save the draft first, then show summary
                              saveDraft.mutate(undefined, {
                                onSuccess: () => {
                                  setShowSummary(true);
                                  toast({
                                    title: "Review saved",
                                    description: "Your review has been saved and is ready to discuss with the employee.",
                                  });
                                }
                              });
                            }}
                            disabled={saveDraft.isPending}
                            className="w-full md:w-auto bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                          >
                            {saveDraft.isPending ? 'Saving...' : 'Finalize Review'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary View */}
                {showSummary && (
                  <>
                    <div className="mt-8 space-y-6">
                      {/* Overall Scores Card */}
                      <Card className="bg-white rounded-xl border border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-xl text-[#27251F]">Overall Ratings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Employee's Overall Score */}
                            <div>
                              <h4 className="text-sm font-medium text-[#27251F]/60 mb-2">Employee's Overall Rating</h4>
                              {(() => {
                                const { score, total } = calculateTotalScore(evaluation.selfEvaluation);
                                const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                                return (
                                  <div className="space-y-2">
                                    <div className="text-2xl font-bold text-[#27251F]">
                                      {score}/{total} <span className="text-lg font-normal text-[#27251F]/60">points</span>
                                    </div>
                                    <div className="w-full bg-[#27251F]/10 rounded-full h-2">
                                      <div
                                        className="bg-[#E51636] h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <div className="text-sm text-[#27251F]/60">{percentage}% Overall Rating</div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Manager's Overall Score */}
                            <div>
                              <h4 className="text-sm font-medium text-[#27251F]/60 mb-2">Manager's Overall Rating</h4>
                              {(() => {
                                const { score, total } = calculateTotalScore(answers);
                                const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                                return (
                                  <div className="space-y-2">
                                    <div className="text-2xl font-bold text-[#27251F]">
                                      {score}/{total} <span className="text-lg font-normal text-[#27251F]/60">points</span>
                                    </div>
                                    <div className="w-full bg-[#27251F]/10 rounded-full h-2">
                                      <div
                                        className="bg-[#E51636] h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <div className="text-sm text-[#27251F]/60">{percentage}% Overall Rating</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white rounded-xl border border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-xl text-[#27251F]">Review Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          {evaluation.template.sections.map((section: Section, sectionIndex: number) => (
                            <div key={sectionIndex} className="space-y-4">
                              <h3 className="font-medium text-lg text-[#27251F]">{section.title}</h3>
                              {section.questions.map((question: Question, questionIndex: number) => {
                                const employeeRating = evaluation.selfEvaluation?.[`${sectionIndex}-${questionIndex}`];
                                const managerRating = answers[`${sectionIndex}-${questionIndex}`];
                                const employeeColor = getRatingColor(employeeRating, question.gradingScale);
                                const managerColor = getRatingColor(managerRating, question.gradingScale);
                                const employeeValue = getRatingValue(employeeRating, question.gradingScale);
                                const managerValue = getRatingValue(managerRating, question.gradingScale);

                                let comparisonStyle = '';
                                if (managerValue > employeeValue) {
                                  comparisonStyle = 'bg-green-50 border-green-200';
                                } else if (managerValue < employeeValue) {
                                  comparisonStyle = 'bg-red-50 border-red-200';
                                } else {
                                  comparisonStyle = 'bg-[#27251F]/5';
                                }

                                return (
                                  <div key={questionIndex} className={`p-4 rounded-xl border ${comparisonStyle}`}>
                                    <p className="font-medium text-[#27251F] mb-3">{question.text}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Employee's Rating */}
                                      <div>
                                        <p className="text-sm font-medium text-[#27251F]/60 mb-2">Employee's Rating:</p>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: employeeColor }}
                                          />
                                          <span style={{ color: employeeColor }}>
                                            {getRatingText(employeeRating, question.gradingScale)}
                                          </span>
                                        </div>
                                      </div>
                                      {/* Manager's Rating */}
                                      <div>
                                        <p className="text-sm font-medium text-[#27251F]/60 mb-2">Manager's Rating:</p>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: managerColor }}
                                          />
                                          <span style={{ color: managerColor }}>
                                            {getRatingText(managerRating, question.gradingScale)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Overall Comments */}
                      <div>
                        <label className="block text-sm font-medium text-[#27251F]/60 mb-2">
                          Overall Comments
                        </label>
                        <textarea
                          value={overallComments}
                          onChange={(e) => setOverallComments(e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent"
                          rows={3}
                          placeholder="Enter any overall comments about the evaluation..."
                        />
                      </div>

                      {/* Complete Review Button */}
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Save the draft first, then go back to editing
                            saveDraft.mutate(undefined, {
                              onSuccess: () => {
                                // Find the last section and question
                                const lastSectionIndex = evaluation.template.sections.length - 1;
                                const lastQuestionIndex = evaluation.template.sections[lastSectionIndex].questions.length - 1;

                                // Set the current question to the last question
                                setCurrentQuestionIndex({ section: lastSectionIndex, question: lastQuestionIndex });

                                // Hide the summary view
                                setShowSummary(false);

                                toast({
                                  title: "Review saved",
                                  description: "Your changes have been saved. You can continue editing.",
                                });
                              }
                            });
                          }}
                          disabled={saveDraft.isPending}
                          className="h-12 px-6 rounded-2xl"
                        >
                          {saveDraft.isPending ? 'Saving...' : 'Continue Editing'}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => setShowConfirmSubmit(true)}
                          disabled={completeReview.isPending}
                          className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                        >
                          {completeReview.isPending ? 'Completing...' : 'Complete Evaluation'}
                        </Button>
                      </div>

                      {/* Confirmation Dialog */}
                      {showConfirmSubmit && (
                        <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Evaluation</DialogTitle>
                              <DialogDescription>
                                This will mark the evaluation as complete and send a notification to the employee to review and acknowledge it.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-sm text-[#27251F]/70">
                                After completing the evaluation:
                              </p>
                              <ul className="list-disc list-inside text-sm text-[#27251F]/70 mt-2 space-y-1">
                                <li>The employee will be able to view all ratings and comments</li>
                                <li>The employee will need to acknowledge the evaluation</li>
                                <li>You will not be able to make further changes</li>
                              </ul>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShowConfirmSubmit(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleCompleteReview}
                                disabled={completeReview.isPending}
                                className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
                              >
                                {completeReview.isPending ? 'Completing...' : 'Complete Evaluation'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Completed evaluation view */}
            {evaluation.status === 'completed' && (
              <div className="space-y-8">
                {/* Overall Ratings Card */}
                <Card className="bg-white rounded-[20px] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#27251F]">Overall Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Employee's Overall Score */}
                      <div>
                        <h4 className="text-sm font-medium text-[#27251F]/60 mb-2">Employee's Overall Rating</h4>
                        {(() => {
                          const { score, total } = calculateTotalScore(evaluation.selfEvaluation);
                          const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                          return (
                            <div className="space-y-2">
                              <div className="text-2xl font-bold text-[#27251F]">
                                {score}/{total} <span className="text-lg font-normal text-[#27251F]/60">points</span>
                              </div>
                              <div className="w-full bg-[#27251F]/10 rounded-full h-2">
                                <div
                                  className="bg-[#E51636] h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="text-sm text-[#27251F]/60">{percentage}% Overall Rating</div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Manager's Overall Score */}
                      <div>
                        <h4 className="text-sm font-medium text-[#27251F]/60 mb-2">Manager's Overall Rating</h4>
                        {(() => {
                          const { score, total } = calculateTotalScore(evaluation.managerEvaluation);
                          const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                          return (
                            <div className="space-y-2">
                              <div className="text-2xl font-bold text-[#27251F]">
                                {score}/{total} <span className="text-lg font-normal text-[#27251F]/60">points</span>
                              </div>
                              <div className="w-full bg-[#27251F]/10 rounded-full h-2">
                                <div
                                  className="bg-[#E51636] h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="text-sm text-[#27251F]/60">{percentage}% Overall Rating</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Side by side comparison */}
                {evaluation.template.sections.map((section: Section, sectionIndex: number) => (
                  <Card key={sectionIndex} className="bg-white rounded-[20px] shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#27251F]">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {section.questions.map((question: Question, questionIndex: number) => {
                          const employeeRating = evaluation.selfEvaluation?.[`${sectionIndex}-${questionIndex}`];
                          const managerRating = evaluation.managerEvaluation?.[`${sectionIndex}-${questionIndex}`];
                          const employeeColor = getRatingColor(employeeRating, question.gradingScale);
                          const managerColor = getRatingColor(managerRating, question.gradingScale);
                          const employeeValue = getRatingValue(employeeRating, question.gradingScale);
                          const managerValue = getRatingValue(managerRating, question.gradingScale);

                          let comparisonStyle = '';
                          if (managerValue > employeeValue) {
                            comparisonStyle = 'bg-green-50 border-green-200';
                          } else if (managerValue < employeeValue) {
                            comparisonStyle = 'bg-red-50 border-red-200';
                          } else {
                            comparisonStyle = 'bg-[#27251F]/5';
                          }

                          return (
                            <div key={questionIndex} className={`p-4 rounded-xl border ${comparisonStyle}`}>
                              <p className="font-medium text-[#27251F] mb-3">{question.text}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Employee's Rating */}
                                <div>
                                  <p className="text-sm font-medium text-[#27251F]/60 mb-2">Employee's Rating:</p>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: employeeColor }}
                                    />
                                    <span style={{ color: employeeColor }}>
                                      {getRatingText(employeeRating, question.gradingScale)}
                                    </span>
                                  </div>
                                </div>
                                {/* Manager's Rating */}
                                <div>
                                  <p className="text-sm font-medium text-[#27251F]/60 mb-2">Manager's Rating:</p>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: managerColor }}
                                    />
                                    <span style={{ color: managerColor }}>
                                      {getRatingText(managerRating, question.gradingScale)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Overall Comments and Development Plan */}
                <Card className="bg-white rounded-[20px] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#27251F]">Final Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {evaluation.overallComments && (
                      <div>
                        <h3 className="font-medium text-[#27251F] mb-3">Overall Comments</h3>
                        <div className="bg-[#E51636]/5 p-4 rounded-xl text-[#27251F]">
                          {evaluation.overallComments}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Acknowledgement section */}
                {isEmployee && !evaluation.acknowledgement?.acknowledged && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => acknowledgeEvaluation.mutate()}
                      disabled={acknowledgeEvaluation.isPending}
                      className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                    >
                      {acknowledgeEvaluation.isPending ? 'Acknowledging...' : 'Acknowledge Evaluation'}
                    </Button>
                  </div>
                )}

                {/* Show acknowledgement status */}
                {evaluation.acknowledgement?.acknowledged && (
                  <div className="text-sm text-[#27251F]/60 pt-4 border-t border-gray-200">
                    Acknowledged by {evaluation.employee.name} on{' '}
                    {new Date(evaluation.acknowledgement.date).toLocaleDateString()}
                  </div>
                )}

                {/* Add this inside the completed evaluation view, after the acknowledgement status display */}
                {evaluation.status === 'completed' && !evaluation.acknowledgement?.acknowledged && isManager && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => sendUnacknowledgedNotification.mutate()}
                      disabled={sendUnacknowledgedNotification.isPending}
                      className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl"
                    >
                      {sendUnacknowledgedNotification.isPending ? 'Sending...' : 'Send Acknowledgement Reminder'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Evaluator Dialog */}
        <Dialog open={showChangeEvaluator} onOpenChange={setShowChangeEvaluator}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Evaluator</DialogTitle>
              <DialogDescription>
                Select a new evaluator for this evaluation. Only Directors and Leaders can be evaluators.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Current Evaluator: {evaluation?.evaluator?.name}
                </label>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  New Evaluator
                </label>
                <Select value={selectedEvaluatorId} onValueChange={setSelectedEvaluatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new evaluator" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvaluators?.map((evaluator: any) => (
                      <SelectItem
                        key={evaluator._id}
                        value={evaluator._id}
                        disabled={evaluator._id === evaluation?.evaluator?._id}
                      >
                        {evaluator.name} - {evaluator.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangeEvaluator(false);
                  setSelectedEvaluatorId('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateEvaluator.mutate(selectedEvaluatorId)}
                disabled={!selectedEvaluatorId || updateEvaluator.isPending}
                className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
              >
                {updateEvaluator.isPending ? 'Updating...' : 'Update Evaluator'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}