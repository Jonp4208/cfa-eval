import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Video,
  BookOpen,
  PenTool,
  Brain,
  ClipboardList,
  ClipboardCheck,
  Loader2,
  ExternalLink,
  FileCheck,
  FileText,
  Users,
  X,
  MessageSquare,
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  Heart,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import api from '@/lib/axios'

// Import custom form components for each task type
import CharacterCapacityForm from '@/components/leadership/CharacterCapacityForm'
import ServantLeadershipVideoForm from '@/components/leadership/ServantLeadershipVideoForm'
import HeartLeadershipReadingForm from '@/components/leadership/HeartLeadershipReadingForm'
import SelflessLeadershipForm from '@/components/leadership/SelflessLeadershipForm'
import CourageResponseForm from '@/components/leadership/CourageResponseForm'
import LeadershipCharacterPlanForm from '@/components/leadership/LeadershipCharacterPlanForm'
import LeadershipValuesForm from '@/components/leadership/LeadershipValuesForm'
import VulnerabilityLeadershipForm from '@/components/leadership/VulnerabilityLeadershipForm'
// Innovation & Change Champion forms
import LeadingChangeVideoForm from '@/components/leadership/LeadingChangeVideoForm'
import CreativeConfidenceBookForm from '@/components/leadership/CreativeConfidenceBookForm'
import DesignThinkingVideoForm from '@/components/leadership/DesignThinkingVideoForm'
import InnovationAuditForm from '@/components/leadership/InnovationAuditForm'
import InnovationWorkshopForm from '@/components/leadership/InnovationWorkshopForm'
import ChangeManagementStrategiesForm from '@/components/leadership/ChangeManagementStrategiesForm'
import ChangeImplementationPlanForm from '@/components/leadership/ChangeImplementationPlanForm'
import ContinuousImprovementSystemForm from '@/components/leadership/ContinuousImprovementSystemForm'
import InnovationLeadershipPhilosophyForm from '@/components/leadership/InnovationLeadershipPhilosophyForm'
import LeadershipLegacyForm from '@/components/leadership/LeadershipLegacyForm'
import ActiveListeningForm from '@/components/leadership/ActiveListeningForm'
import ThinkOthersFirstForm from '@/components/leadership/ThinkOthersFirstForm'
import ExpectBestForm from '@/components/leadership/ExpectBestForm'
import HigherExpectationsForm from '@/components/leadership/HigherExpectationsForm'
import CourageousConversationForm from '@/components/leadership/CourageousConversationForm'
import LeadershipSelfAssessmentForm from '@/components/leadership/LeadershipSelfAssessmentForm'
import ServantLeadershipActionForm from '@/components/leadership/ServantLeadershipActionForm'
import SBIFeedbackForm from '@/components/leadership/SBIFeedbackForm'
import GROWCoachingForm from '@/components/leadership/GROWCoachingForm'
import DevelopmentPlanForm from '@/components/leadership/DevelopmentPlanForm'
import DevelopmentPlanPDFDownload from '@/components/leadership/DevelopmentPlanPDFDownload'
import TrainingEffectivenessAuditForm from '@/components/leadership/TrainingEffectivenessAuditForm'
import SkillBuildingWorkshopForm from '@/components/leadership/SkillBuildingWorkshopForm'
import TeamDevelopmentPhilosophyForm from '@/components/leadership/TeamDevelopmentPhilosophyForm'
import RestaurantStrategyDiagnosisForm from '@/components/leadership/RestaurantStrategyDiagnosisForm'
import RestaurantSWOTAnalysisForm from '@/components/leadership/RestaurantSWOTAnalysisForm'
import StrategicDecisionFrameworkForm from '@/components/leadership/StrategicDecisionFrameworkForm'
import CompetitiveAnalysisForm from '@/components/leadership/CompetitiveAnalysisForm'
import StrategicLeadershipSelfAssessmentForm from '@/components/leadership/StrategicLeadershipSelfAssessmentForm'
import StrategicCommunicationPracticeForm from '@/components/leadership/StrategicCommunicationPracticeForm'
import StrategicLeadershipPhilosophyForm from '@/components/leadership/StrategicLeadershipPhilosophyForm'
import StrategicChangeInitiativePlanForm from '@/components/leadership/StrategicChangeInitiativePlanForm'
import NinetyDayStrategicPlanForm from '@/components/leadership/NinetyDayStrategicPlanForm'
import LongTermPlanningForm from '@/components/leadership/LongTermPlanningForm'
import RestaurantWhyStatementForm from '@/components/leadership/RestaurantWhyStatementForm'
import FeedbackDeliveryPracticeForm from '@/components/leadership/FeedbackDeliveryPracticeForm'
import BodyLanguageAwarenessForm from '@/components/leadership/BodyLanguageAwarenessForm'
import InfluenceWithoutAuthorityForm from '@/components/leadership/InfluenceWithoutAuthorityForm'
import InfluencePracticeProjectForm from '@/components/leadership/InfluencePracticeProjectForm'
import DifficultConversationsFrameworkForm from '@/components/leadership/DifficultConversationsFrameworkForm'
import DifficultConversationPracticeForm from '@/components/leadership/DifficultConversationPracticeForm'
import WrittenCommunicationExcellenceForm from '@/components/leadership/WrittenCommunicationExcellenceForm'
import CommunicationSystemImprovementForm from '@/components/leadership/CommunicationSystemImprovementForm'
import CommunicationLeadershipPhilosophyForm from '@/components/leadership/CommunicationLeadershipPhilosophyForm'

// Operational Excellence Forms
import OperationalExcellenceVideoForm from '@/components/leadership/OperationalExcellenceVideoForm'
import LeanPrinciplesReadingForm from '@/components/leadership/LeanPrinciplesReadingForm'
import ProcessMappingExerciseForm from '@/components/leadership/ProcessMappingExerciseForm'
import QualityStandardsForm from '@/components/leadership/QualityStandardsForm'
import KPIDashboardForm from '@/components/leadership/KPIDashboardForm'
import ContinuousImprovementForm from '@/components/leadership/ContinuousImprovementForm'
import OperationalExcellencePhilosophyForm from '@/components/leadership/OperationalExcellencePhilosophyForm'

// Customer Experience Forms
import CustomerExperienceExcellenceForm from '@/components/leadership/CustomerExperienceExcellenceForm'
import ServiceRecoveryStrategiesForm from '@/components/leadership/ServiceRecoveryStrategiesForm'
import HospitalityCultureForm from '@/components/leadership/HospitalityCultureForm'
import CustomerExperiencePhilosophyForm from '@/components/leadership/CustomerExperiencePhilosophyForm'
import CustomerJourneyMappingForm from '@/components/leadership/CustomerJourneyMappingForm'
import RitzCarltonServiceCultureForm from '@/components/leadership/RitzCarltonServiceCultureForm'
import ServiceStandardsDevelopmentForm from '@/components/leadership/ServiceStandardsDevelopmentForm'
import CustomerFeedbackMeasurementForm from '@/components/leadership/CustomerFeedbackMeasurementForm'
import CustomerFeedbackSystemForm from '@/components/leadership/CustomerFeedbackSystemForm'
import ServiceRecoveryTrainingForm from '@/components/leadership/ServiceRecoveryTrainingForm'

interface Task {
  id: string
  type: 'video' | 'reading' | 'activity' | 'reflection' | 'assessment' | 'task'
  title: string
  description: string
  resourceUrl?: string
  estimatedTime?: string
  completed: boolean
  completedAt?: string
  notes?: string
  evidence?: string
}

// Component to render the enhanced Talent Assessment description
const TalentAssessmentDescription = ({ description, completed }: { description: string, completed: boolean }) => {
  const formatDescription = (text: string) => {
    // Split by double newlines to get sections
    const sections = text.split('\n\n')

    return sections.map((section, index) => {
      // Handle bold headers like **QUADRANT EXAMPLES & DEVELOPMENT ACTIONS:**
      if (section.includes('**') && section.includes(':**')) {
        const boldText = section.replace(/\*\*(.*?)\*\*/g, '$1')
        return (
          <div key={index} className="mb-4">
            <h4 className="font-bold text-gray-800 text-lg mb-2">{boldText}</h4>
          </div>
        )
      }

      // Handle quadrant sections like **1. HIGH PERFORMANCE/HIGH POTENTIAL (Stars)**
      if (section.startsWith('**') && section.includes('**')) {
        const lines = section.split('\n')
        const header = lines[0].replace(/\*\*(.*?)\*\*/g, '$1')
        const content = lines.slice(1).join('\n')

        return (
          <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h5 className="font-bold text-blue-800 mb-3">{header}</h5>
            <div className="space-y-2">
              {content.split('\n').map((line, lineIndex) => {
                if (line.startsWith('Example:')) {
                  return (
                    <p key={lineIndex} className="text-gray-700 italic">
                      <span className="font-medium">Example:</span> {line.replace('Example:', '').trim()}
                    </p>
                  )
                } else if (line.startsWith('• Development Actions:')) {
                  return (
                    <div key={lineIndex} className="mt-2">
                      <p className="font-medium text-gray-800 mb-1">Development Actions:</p>
                      <p className="text-gray-700 ml-4">{line.replace('• Development Actions:', '').trim()}</p>
                    </div>
                  )
                } else if (line.trim()) {
                  return <p key={lineIndex} className="text-gray-700">{line}</p>
                }
                return null
              })}
            </div>
          </div>
        )
      }

      // Handle regular paragraphs
      if (section.trim()) {
        return (
          <p key={index} className={`text-gray-600 ${completed ? 'text-gray-400' : ''} mb-3`}>
            {section}
          </p>
        )
      }

      return null
    }).filter(Boolean)
  }

  return (
    <div className="space-y-2">
      {formatDescription(description)}
    </div>
  )
}

export default function PlanTasks() {
  const navigate = useNavigate()
  const location = useLocation()
  const { planId } = useParams<{ planId: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [planTitle, setPlanTitle] = useState('')
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completionDialog, setCompletionDialog] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionEvidence, setCompletionEvidence] = useState('')

  const [unenrollDialog, setUnenrollDialog] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [talentExamplesDialog, setTalentExamplesDialog] = useState(false)
  const [growExamplesDialog, setGrowExamplesDialog] = useState(false)
  const [developmentPlanExamplesDialog, setDevelopmentPlanExamplesDialog] = useState(false)

  // Debounced auto-save refs
  const autoSaveTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Track which interactive forms are open
  const [openForms, setOpenForms] = useState<{ [key: string]: boolean }>({})

  // Toggle form visibility
  const toggleForm = (taskId: string) => {
    setOpenForms(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(async (taskId: string, evidence: string) => {
    // Clear existing timeout for this task
    if (autoSaveTimeouts.current[taskId]) {
      clearTimeout(autoSaveTimeouts.current[taskId])
    }

    // Only auto-save if there's meaningful content
    let hasContent = false
    if (evidence && evidence.trim() && evidence !== '{}') {
      try {
        const parsed = JSON.parse(evidence)
        // Check if any field has actual content
        hasContent = Object.values(parsed).some(value =>
          typeof value === 'string' && value.trim().length > 0
        )
      } catch (e) {
        // If not JSON, check if there's any content
        hasContent = evidence.trim().length > 0
      }
    }

    if (!hasContent) {
      return
    }

    // Set new timeout
    autoSaveTimeouts.current[taskId] = setTimeout(async () => {
      try {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        await api.patch(`/api/leadership/my-plans/${planId}/tasks/${taskId}`, {
          completed: false,
          notes: task.notes || '',
          evidence: evidence
        })

        // Update local state
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === taskId
            ? { ...t, evidence: evidence }
            : t
        ))

        console.log('Auto-saved evidence for task:', taskId)
      } catch (error) {
        console.error('Error auto-saving evidence:', error)
      }
    }, 1000) // Wait 1 second after user stops typing
  }, [tasks, planId])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(autoSaveTimeouts.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])

  useEffect(() => {
    if (planId) {
      fetchTasks()
    } else {
      // Extract planId from query parameters if not in URL path
      const queryParams = new URLSearchParams(location.search)
      const queryPlanId = queryParams.get('planId')
      if (queryPlanId) {
        navigate(`/leadership/plans/${queryPlanId}/tasks`)
      } else {
        navigate('/leadership/my-plans')
      }
    }
  }, [planId, location.search])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      // Set plan title using fallback since there's no individual plan endpoint
      setFallbackTitle()

      // Get tasks
      const response = await api.get(`/api/leadership/my-plans/${planId}/tasks`)

      // Debug logging to see what we get from server
      console.log('Fetched tasks from server:', response.data.tasks)

      // Sort tasks by ID to ensure correct order
      const sortedTasks = [...(response.data.tasks || [])].sort((a, b) => {
        // Extract numeric part from ID for proper sorting
        const aMatch = a.id.match(/-(\d+)([a-z]*)/);
        const bMatch = b.id.match(/-(\d+)([a-z]*)/);

        if (aMatch && bMatch) {
          // Compare numeric parts first
          const aNum = parseInt(aMatch[1]);
          const bNum = parseInt(bMatch[1]);

          if (aNum !== bNum) {
            return aNum - bNum;
          }

          // If numeric parts are equal, compare alphabetic suffixes
          const aSuffix = aMatch[2] || '';
          const bSuffix = bMatch[2] || '';

          if (aSuffix && bSuffix) {
            return aSuffix.localeCompare(bSuffix);
          }

          // Tasks with suffixes come after tasks without suffixes
          return aSuffix ? 1 : bSuffix ? -1 : 0;
        }

        // Fallback to string comparison if pattern doesn't match
        return a.id.localeCompare(b.id);
      });

      setTasks(sortedTasks)
      setProgress(response.data.progress || 0)
      setStatus(response.data.status || '')
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }



  const openCompletionDialog = (task: Task) => {
    setSelectedTask(task)
    setCompletionNotes(task.notes || '')
    setCompletionEvidence(task.evidence || '')
    setCompletionDialog(true)
  }

  const closeCompletionDialog = () => {
    setCompletionDialog(false)
    setSelectedTask(null)
    setCompletionNotes('')
    setCompletionEvidence('')
  }

  const setFallbackTitle = () => {
    // Fallback titles based on plan ID
    const fallbackTitles = {
      'heart-of-leadership': 'The Heart of Leadership',
      'restaurant-culture-builder': 'Restaurant Culture Builder',
      'team-development': 'Team Development Expert',
      'operational-excellence': 'Operational Excellence',
      'guest-experience-mastery': 'Guest Experience Mastery',
      'strategic-leadership': 'Strategic Leadership Mastery',
      'innovation-change': 'Innovation & Change Champion',
      'customer-experience': 'Customer Experience Leader'
    }
    setPlanTitle(fallbackTitles[planId as keyof typeof fallbackTitles] || 'Leadership Plan')
  }

  const openUnenrollDialog = () => {
    setUnenrollDialog(true)
  }

  const closeUnenrollDialog = () => {
    setUnenrollDialog(false)
  }

  const handleUnenroll = async () => {
    try {
      setUnenrolling(true)
      await api.delete(`/api/leadership/my-plans/${planId}`)
      toast({
        title: 'Success',
        description: 'You have been unenrolled from this plan.',
        variant: 'default'
      })
      navigate('/leadership/my-plans')
    } catch (error) {
      console.error('Error unenrolling from plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to unenroll from plan. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUnenrolling(false)
      closeUnenrollDialog()
    }
  }

  const handleTaskCompletion = async () => {
    if (!selectedTask) return

    // For "The Art of Feedback" task, we save progress but don't mark as completed unless they have substantial content
    const isFeedbackTask = selectedTask.title === 'The Art of Feedback'

    // Validate that evidence is provided for tasks that require it (except feedback task)
    const requiresEvidence = !isFeedbackTask && ['reading', 'video', 'reflection', 'assessment'].includes(selectedTask.type)
    if (requiresEvidence && !completionEvidence.trim()) {
      toast({
        title: 'Evidence Required',
        description: `Please provide evidence of completion for this ${selectedTask.type} task.`,
        variant: 'destructive'
      })
      return
    }

    // For feedback task, check if they have at least one complete example
    let shouldMarkComplete = !isFeedbackTask
    if (isFeedbackTask && completionEvidence.trim()) {
      try {
        const parsed = JSON.parse(completionEvidence)
        // Mark complete if they have at least one complete SBI example
        const hasCompleteExample = (parsed.situation1 && parsed.behavior1 && parsed.impact1) ||
                                  (parsed.situation2 && parsed.behavior2 && parsed.impact2) ||
                                  (parsed.situation3 && parsed.behavior3 && parsed.impact3)
        shouldMarkComplete = hasCompleteExample
      } catch (e) {
        // If parsing fails, don't mark as complete
        shouldMarkComplete = false
      }
    }

    try {
      setUpdatingTask(selectedTask.id)

      // Debug logging
      console.log('Sending task update:', {
        completed: shouldMarkComplete,
        notes: completionNotes,
        evidence: completionEvidence,
        shouldMarkComplete,
        completionNotes,
        completionEvidence
      })

      // Ensure we're sending the correct data types
      const requestBody = {
        completed: Boolean(shouldMarkComplete),
        notes: String(completionNotes || ''),
        evidence: String(completionEvidence || '')
      }

      console.log('Final request body:', requestBody)

      await api.patch(`/api/leadership/my-plans/${planId}/tasks/${selectedTask.id}`, requestBody)

      // Update local state
      setTasks(tasks.map(task =>
        task.id === selectedTask.id
          ? {
              ...task,
              completed: shouldMarkComplete,
              completedAt: shouldMarkComplete ? new Date().toISOString() : task.completedAt,
              notes: completionNotes,
              evidence: completionEvidence
            }
          : task
      ))

      // Fetch updated progress
      const response = await api.get(`/api/leadership/my-plans/${planId}/tasks`)
      setProgress(response.data.progress || 0)
      setStatus(response.data.status || '')

      toast({
        title: isFeedbackTask ? 'Progress Saved' : 'Task Completed',
        description: isFeedbackTask ?
          (shouldMarkComplete ? 'Great job! Your feedback examples have been saved and the task is marked complete.' : 'Your progress has been saved. You can come back to add more examples later.') :
          'Great job! You\'ve completed this task.',
      })

      closeCompletionDialog()
    } catch (error) {
      console.error('Error completing task:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save progress. Please try again.'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setUpdatingTask(null)
    }
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    // Find the task to check its current state
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // If task is already completed, prevent unchecking
    if (task.completed && !completed) {
      toast({
        title: 'Task Already Completed',
        description: 'Completed tasks cannot be unchecked. Use the edit buttons to modify your work.',
        variant: 'default'
      })
      return
    }

    // If marking as complete, open the completion dialog
    if (completed) {
      openCompletionDialog(task)
      return
    }

    // This code should never be reached now, but keeping for safety
    console.warn('Unexpected task toggle state:', { taskId, completed, taskCompleted: task.completed })
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />
      case 'reading':
        return <BookOpen className="h-5 w-5 text-purple-500" />
      case 'activity':
        return <PenTool className="h-5 w-5 text-orange-500" />
      case 'reflection':
        return <Brain className="h-5 w-5 text-green-500" />
      case 'assessment':
        return <ClipboardList className="h-5 w-5 text-amber-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800'
      case 'reading':
        return 'bg-purple-100 text-purple-800'
      case 'activity':
        return 'bg-orange-100 text-orange-800'
      case 'reflection':
        return 'bg-green-100 text-green-800'
      case 'assessment':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEvidencePlaceholder = (taskType: string, taskTitle?: string) => {
    // Task-specific placeholders based on title
    if (taskTitle) {
      switch (taskTitle) {
        case 'Character vs. Capacity Reflection':
          return 'Complete the form to reflect on your leadership character traits and capacity/skills...'

        case 'Introduction to Servant Leadership':
          return 'Complete the form to document the key principles of servant leadership and how you will apply them...'

        case 'The Heart of Leadership: Introduction & Chapter 1':
          return 'Complete the form to reflect on the difference between capacity and character in leadership...'

        case 'Selfless Leadership in Action':
          return 'Document the three specific actions you took and the results of these actions...'

        case 'The Heart of Leadership: Respond with Courage':
          return 'Identify a situation requiring courage and the specific actions you will take...'

        case '30-Day Leadership Character Plan':
          return 'Create a detailed plan for developing each of the five leadership character traits...'

        case 'Leadership Values Exercise':
          return 'Identify your top 5 leadership values and specific actions for each...'

        case 'The Power of Vulnerability in Leadership':
          return 'Reflect on how vulnerability can strengthen your leadership and ways to be more authentic...'

        case 'Leadership Legacy Statement':
          return 'Describe the impact you want to have as a leader and how you want to be remembered...'

        case 'Active Listening Practice':
          return 'Document your active listening practice and the insights you gained from these conversations...'

        case 'The Heart of Leadership: Think Others First':
          return 'Identify specific examples of selfless leadership and how you can put team members\'s needs before your own...'

        case 'The Heart of Leadership: Expect the Best':
          return 'Reflect on how your expectations affect team performance and identify a team member who would benefit from higher expectations...'

        case 'Setting Higher Expectations':
          return 'Create a development plan with specific goals, support, and communication strategies...'

        case 'Courageous Conversation Plan':
          return 'Outline what you will say in a courageous conversation, anticipate responses, and set a deadline...'

        case 'Leadership Self-Assessment':
          return 'Identify your leadership character strengths, areas for growth, and one specific trait to develop...'

        case 'Servant Leadership in Action':
          return 'Document an operational challenge, team input, implementation plan, and results...'

        case 'The Art of Feedback':
          return 'Complete the form to practice the SBI feedback model with 3 real examples from your restaurant...'
      }
    }

    // Default placeholders based on task type
    switch (taskType) {
      case 'video':
        return 'Summarize the key points from the video and how you will apply them in your leadership role...'
      case 'reading':
        return 'Summarize the main concepts from the reading and how they relate to your leadership development...'
      case 'activity':
        return 'Describe what you did to complete this activity and what you learned from it...'
      case 'reflection':
        return 'Share your reflections and insights from completing this task...'
      case 'assessment':
        return 'Describe your assessment results and what insights you gained about yourself...'
      default:
        return 'Provide evidence that you have completed this task...'
    }
  }

  const getCompletionTitle = (taskType: string, taskTitle?: string) => {
    // Task-specific titles based on title
    if (taskTitle) {
      switch (taskTitle) {
        case 'Character vs. Capacity Reflection':
          return 'Character & Capacity Analysis'

        case 'Introduction to Servant Leadership':
          return 'Servant Leadership Principles'

        case 'The Heart of Leadership: Introduction & Chapter 1':
          return 'Leadership Character Insights'

        case 'Selfless Leadership in Action':
          return 'Selfless Actions Documentation'

        case 'The Heart of Leadership: Respond with Courage':
          return 'Courageous Leadership Plan'

        case '30-Day Leadership Character Plan':
          return 'Character Development Plan'

        case 'Leadership Values Exercise':
          return 'Core Leadership Values'

        case 'The Power of Vulnerability in Leadership':
          return 'Vulnerability & Authenticity'

        case 'Leadership Legacy Statement':
          return 'Leadership Legacy Vision'

        case 'Active Listening Practice':
          return 'Active Listening Results'

        case 'The Heart of Leadership: Think Others First':
          return 'Selfless Leadership Plan'

        case 'The Heart of Leadership: Expect the Best':
          return 'Expectations Analysis'

        case 'Setting Higher Expectations':
          return 'Team Member Development Plan'

        case 'Courageous Conversation Plan':
          return 'Courageous Conversation Strategy'

        case 'Leadership Self-Assessment':
          return 'Character Assessment Results'

        case 'Servant Leadership in Action':
          return 'Collaborative Problem Solving'

        case 'The Art of Feedback':
          return 'SBI Feedback Examples'

        case 'GROW Coaching Conversation':
          return 'GROW Coaching Session Documentation'

        case 'Development Plan Creation':
          return '90-Day Development Plan'

        case 'Training Effectiveness Audit':
          return 'Training Effectiveness Audit Report'

        case 'Skill-Building Workshop':
          return 'Skill-Building Workshop Documentation'

        case 'Team Development Philosophy':
          return 'Team Development Philosophy Statement'
      }
    }

    // Default titles based on task type
    switch (taskType) {
      case 'video':
        return 'Video Summary'
      case 'reading':
        return 'Reading Summary'
      case 'activity':
        return 'Activity Completion'
      case 'reflection':
        return 'Reflection'
      case 'assessment':
        return 'Assessment Results'
      default:
        return 'Evidence of Completion'
    }
  }

  const getCompletionPrompt = (taskType: string, taskTitle?: string) => {
    // Task-specific prompts based on title
    if (taskTitle) {
      switch (taskTitle) {
        case 'Character vs. Capacity Reflection':
          return 'Based on your reading, identify leadership character traits and capacity/skills. Reflect on which you possess and which you need to develop.'

        case 'Introduction to Servant Leadership':
          return 'Document the key principles of servant leadership from the video and how you will apply them in your restaurant setting.'

        case 'The Heart of Leadership: Introduction & Chapter 1':
          return 'Reflect on the difference between capacity and character in leadership. What does it mean that people follow others because of who they are?'

        case 'Selfless Leadership in Action':
          return 'Document the three specific actions you took that put your team members\'s needs before your own, and the results of these actions.'

        case 'The Heart of Leadership: Respond with Courage':
          return 'Identify a situation in your restaurant that requires a courageous response from you as a leader. What specific actions will you take?'

        case '30-Day Leadership Character Plan':
          return 'Create a detailed plan with specific actions for developing each of the five leadership character traits from the book.'

        case 'Leadership Values Exercise':
          return 'Identify your top 5 leadership values and how each influences your leadership approach. Include specific actions for your next shift.'

        case 'The Power of Vulnerability in Leadership':
          return 'Reflect on how showing appropriate vulnerability can strengthen your leadership. Identify ways to be more authentic with your team.'

        case 'Leadership Legacy Statement':
          return 'Write a statement describing the impact you want to have as a leader. What do you want team members to say about your leadership?'

        case 'Active Listening Practice':
          return 'Document your practice of active listening techniques with team members and the insights you gained from these conversations.'

        case 'The Heart of Leadership: Think Others First':
          return 'Identify specific examples of how you can demonstrate selfless leadership in your restaurant. How can you put team members\'s needs before your own in practical ways?'

        case 'The Heart of Leadership: Expect the Best':
          return 'Reflect on how your expectations of your team affect their performance. Identify one team member who might benefit from you having higher expectations of them.'

        case 'Setting Higher Expectations':
          return 'Create a development plan for the team member you identified who would benefit from higher expectations. Include specific goals, support, and communication plan.'

        case 'Courageous Conversation Plan':
          return 'Prepare for a courageous conversation you need to have with a team member or about a challenging situation. Outline what you will say and set a deadline.'

        case 'Leadership Self-Assessment':
          return 'Complete the leadership self-assessment to identify your strengths and areas for growth. Focus on the "character" section and identify one trait to develop.'

        case 'Servant Leadership in Action':
          return 'Identify an operational challenge, gather input from team members closest to the issue, implement their ideas, and document the results.'

        case 'The Art of Feedback':
          return 'Read the article on the SBI feedback model, then practice by writing 3 specific examples of feedback you need to deliver to team members using the Situation-Behavior-Impact format.'

        case 'GROW Coaching Conversation':
          return 'Conduct a coaching conversation with a team member using the GROW model. Document each stage of the conversation and reflect on your coaching effectiveness.'

        case 'Development Plan Creation':
          return 'Create a comprehensive 90-day development plan for a high-potential team member. Include specific skills, resources, experiences, timeline, and check-in points. Share the plan with the team member and refine it based on their input.'

        case 'Training Effectiveness Audit':
          return 'Observe 3 different team members who were recently trained on a procedure. Note variations in execution and identify potential gaps in the training approach. Create a plan to address these gaps and standardize training outcomes.'

        case 'Skill-Building Workshop':
          return 'Design and deliver a 15-minute skill-building session for your team on a topic where performance could be improved. Use the "Tell, Show, Do, Review" training method and document the outcomes.'

        case 'Team Development Philosophy':
          return 'Write a comprehensive statement describing your philosophy on team development. Include your beliefs about how people learn and grow, your role as a developer of others, and the connection between team development and business results.'

        case 'Strategic Decision Framework':
          return 'Apply a structured decision-making framework to a significant restaurant decision. Work through each step: define the decision, gather information, identify alternatives, evaluate pros/cons, make the decision, and plan implementation.'

        case 'Competitive Landscape Mapping':
          return 'Complete a comprehensive competitive analysis of your 5 most direct competitors. Analyze their menu offerings, pricing, service style, target customers, strengths, and weaknesses. Identify market gaps and strategic opportunities for your restaurant.'

        case 'Strategic Leadership Self-Assessment':
          return 'Evaluate your strategic leadership capabilities across five key areas: strategic thinking, vision communication, decision making, change leadership, and long-term planning. Create a development action plan based on your assessment.'

        case 'Strategic Communication Practice':
          return 'Practice communicating a strategic initiative from your 90-day plan to team members. Prepare a 5-minute presentation, deliver it to at least 3 team members, gather feedback, and reflect on your communication effectiveness.'

        case 'Strategic Leadership Philosophy':
          return 'Develop your personal strategic leadership philosophy statement. This comprehensive document will serve as your guiding framework for making strategic decisions and leading with long-term vision in your restaurant.'

        case 'Strategic Change Initiative Plan':
          return 'Create a comprehensive change management plan using Kotter\'s 8-step process. Identify a strategic change for your restaurant and plan how to communicate, implement, and sustain the change while addressing potential resistance.'

        case '90-Day Strategic Plan':
          return 'Create a comprehensive 90-day strategic plan with 3-5 strategic objectives. For each objective, define specific outcomes, key milestones, resources needed, potential obstacles, and success metrics. Include both team development and operational improvement goals.'

        case 'Long-term Planning and Goal Setting':
          return 'Apply the concepts from your reading to create a comprehensive long-term strategic plan. Set strategic goals that differ from operational goals and build accountability systems for strategic initiatives.'

        case 'Develop Your Restaurant\'s Why':
          return 'Create a clear "Why" statement for your restaurant that goes beyond making money. Define the purpose that drives your team and the impact you want to have on guests and the community. Test this with 2-3 team members to ensure it resonates.'
      }
    }

    // Default prompts based on task type
    switch (taskType) {
      case 'video':
        return 'What were the key points from this video? How will you apply these concepts in your leadership role?'
      case 'reading':
        return 'What were the main ideas from this reading? How do they relate to your leadership development?'
      case 'activity':
        return 'Describe how you completed this activity. What did you learn from the experience?'
      case 'reflection':
        return 'Share your thoughts and insights from this reflection exercise.'
      case 'assessment':
        return 'What did you learn about yourself from this assessment? How will you use these insights?'
      default:
        return 'Please provide evidence that you have completed this task.'
    }
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Compact Plan Header & Progress */}
      <Card className="bg-white shadow-md border-0 overflow-hidden">
        {/* Plan Title Section */}
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-gradient-to-br from-[#E51636] to-[#c41230] p-2 rounded-lg shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{planTitle}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-6 bg-gradient-to-r from-[#E51636] to-[#c41230] rounded-full"></div>
                  <p className="text-[#E51636] text-xs font-semibold uppercase tracking-wide">Leadership Development Plan</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/leadership/my-plans')}
              className="flex items-center gap-2 w-full sm:w-auto h-9 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Plans
            </Button>
          </div>
        </div>

        {/* Compact Progress Section */}
        <div className="p-4">
          <div className="space-y-3">
            {/* Progress Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-1.5 rounded border border-blue-100">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === 'completed'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : status === 'in-progress'
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : status === 'in-progress' ? (
                  <Clock className="h-4 w-4 text-blue-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-500" />
                )}
                <span>{status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}</span>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                <span className="text-lg font-bold bg-gradient-to-r from-[#E51636] to-[#c41230] bg-clip-text text-transparent">
                  {progress}%
                </span>
              </div>

              <div className="relative">
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E51636] to-[#c41230] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {progress > 0 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-[#E51636] rounded-full shadow transition-all duration-500 ease-out"
                    style={{ left: `calc(${progress}% - 4px)` }}
                  ></div>
                )}
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Compact Action Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={openUnenrollDialog}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 text-xs h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Unenroll from Plan
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-[#E51636] animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="bg-white p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">No Tasks Available</h2>
            <p className="text-gray-500 max-w-md">
              There are no tasks available for this development plan yet. Please check back later or contact your manager.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-white p-6 hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                {/* Mobile-optimized task card layout */}
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Task header with checkbox and title - stacked on mobile */}
                  <div className="flex items-center w-full sm:w-auto gap-3 mb-2 sm:mb-0">
                    <div className="relative">
                      {updatingTask === task.id ? (
                        <div className="h-7 w-7 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-[#E51636]" />
                        </div>
                      ) : (
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                          disabled={task.completed}
                          className={`h-7 w-7 rounded-md border-2 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2 ${
                            task.completed
                              ? 'border-green-300 bg-green-50 cursor-not-allowed'
                              : 'border-gray-300'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTaskIcon(task.type)}
                        <h3 className={`text-lg font-semibold ${task.completed ? 'text-gray-500' : 'text-[#27251F]'}`}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskTypeColor(task.type)}`}>
                          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {task.completed ? 'Completed ✓' : 'Tap to complete'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task content - full width on all devices */}
                  <div className="w-full space-y-3 pl-0 sm:pl-10">
                    {task.title === 'Talent Assessment' ? (
                      <TalentAssessmentDescription
                        description={task.description}
                        completed={task.completed}
                      />
                    ) : (
                      <p className={`text-gray-600 ${task.completed ? 'text-gray-400' : ''} whitespace-pre-wrap`}>
                        {task.description}
                      </p>
                    )}



                    {/* Interactive Forms for Strategic Leadership Tasks */}
                    {!task.completed && task.title === 'Restaurant Strategy Diagnosis' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 h-12"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Complete Strategic Diagnosis
                          </Button>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Complete Your Strategic Diagnosis</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <RestaurantStrategyDiagnosisForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                // Update local state immediately for responsive UI
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id
                                    ? { ...t, evidence: value }
                                    : t
                                ))
                                // Debounced auto-save
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Task
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Restaurant SWOT Analysis' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 h-12"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Complete SWOT Analysis
                          </Button>
                        ) : (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Complete Your SWOT Analysis</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <RestaurantSWOTAnalysisForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                // Update local state immediately for responsive UI
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id
                                    ? { ...t, evidence: value }
                                    : t
                                ))
                                // Debounced auto-save
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Task
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Strategic Decision Framework' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-12"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Apply Decision Framework
                          </Button>
                        ) : (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-800">Strategic Decision Framework</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <StrategicDecisionFrameworkForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                // Update local state immediately for responsive UI
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id
                                    ? { ...t, evidence: value }
                                    : t
                                ))
                                // Debounced auto-save
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-indigo-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Framework
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Competitive Landscape Mapping' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 h-12"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Complete Competitive Analysis
                          </Button>
                        ) : (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-800">Competitive Landscape Analysis</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CompetitiveAnalysisForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                // Update local state immediately for responsive UI
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id
                                    ? { ...t, evidence: value }
                                    : t
                                ))
                                // Debounced auto-save
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-orange-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Analysis
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Strategic Leadership Self-Assessment' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-green-600 border-green-200 hover:bg-green-50 h-12"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Complete Self-Assessment
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Strategic Leadership Self-Assessment</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <StrategicLeadershipSelfAssessmentForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Assessment
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Strategic Communication Practice' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 h-12"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Practice Strategic Communication
                          </Button>
                        ) : (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Strategic Communication Practice</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <StrategicCommunicationPracticeForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Practice
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Strategic Leadership Philosophy' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 h-12"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Write Leadership Philosophy
                          </Button>
                        ) : (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">Strategic Leadership Philosophy</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <StrategicLeadershipPhilosophyForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-red-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Philosophy
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Strategic Change Initiative Plan' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 h-12"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Create Change Plan
                          </Button>
                        ) : (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-800">Strategic Change Initiative Plan</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <StrategicChangeInitiativePlanForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-orange-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Change Plan
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === '90-Day Strategic Plan' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 h-12"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Create 90-Day Plan
                          </Button>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">90-Day Strategic Plan</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <NinetyDayStrategicPlanForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Strategic Plan
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Long-term Planning and Goal Setting' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-green-600 border-green-200 hover:bg-green-50 h-12"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Apply Long-term Planning
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Long-term Planning and Goal Setting</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <LongTermPlanningForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Long-term Plan
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Develop Your Restaurant\'s Why' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 h-12"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Create Why Statement
                          </Button>
                        ) : (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Develop Your Restaurant's Why</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <RestaurantWhyStatementForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Why Statement
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Feedback Delivery Practice' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 h-12"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Complete Feedback Practice
                          </Button>
                        ) : (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-800">Feedback Delivery Practice</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <FeedbackDeliveryPracticeForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-orange-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Feedback Practice
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Body Language Awareness' && openForms[task.id] && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Body Language Awareness</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <BodyLanguageAwarenessForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Body Language Practice
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Influence Without Authority' && openForms[task.id] && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Influence Without Authority</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <InfluenceWithoutAuthorityForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Influence Practice
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Influence Practice Project' && openForms[task.id] && (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-800">Influence Practice Project</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <InfluencePracticeProjectForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-indigo-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Influence Project
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Difficult Conversations Framework' && openForms[task.id] && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">Difficult Conversations Framework</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <DifficultConversationsFrameworkForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-red-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Framework Development
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Difficult Conversation Practice' && openForms[task.id] && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Difficult Conversation Practice</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <DifficultConversationPracticeForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Conversation Practice
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Written Communication Excellence' && openForms[task.id] && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <PenTool className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Written Communication Excellence</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <WrittenCommunicationExcellenceForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Writing Excellence
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Communication System Improvement' && openForms[task.id] && (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-800">Communication System Improvement</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CommunicationSystemImprovementForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-indigo-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete System Improvement
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {!task.completed && task.title === 'Communication Leadership Philosophy' && openForms[task.id] && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Communication Leadership Philosophy</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CommunicationLeadershipPhilosophyForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Leadership Philosophy
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                    )}

                    {/* Operational Excellence Forms */}
                    {!task.completed && task.title === 'Introduction to Operational Excellence' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Complete Video Reflection
                          </Button>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Video className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Video Learning Reflection</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <OperationalExcellenceVideoForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                              videoTitle="Introduction to Operational Excellence"
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Reflection
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Quality Management Systems' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Complete Video Reflection
                          </Button>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Video className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Video Learning Reflection</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <OperationalExcellenceVideoForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                              videoTitle="Quality Management Systems"
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Reflection
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Lean Principles for Restaurants' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Complete Reading Reflection
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Reading Reflection</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <LeanPrinciplesReadingForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Reflection
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Performance Metrics and KPIs' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Complete Reading Reflection
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Reading Reflection</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <LeanPrinciplesReadingForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Reflection
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Process Mapping Exercise' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            Complete Process Mapping
                          </Button>
                        ) : (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <PenTool className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-800">Process Mapping Exercise</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <ProcessMappingExerciseForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Exercise
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Quality Standards Development' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Develop Quality Standards
                          </Button>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-800">Quality Standards Development</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <QualityStandardsForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Standards
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'KPI Dashboard Creation' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Create KPI Dashboard
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">KPI Dashboard Creation</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <KPIDashboardForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Dashboard
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Continuous Improvement Project' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-10 sm:h-9"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Complete PDCA Project
                          </Button>
                        ) : (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-800">Continuous Improvement Project</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <ContinuousImprovementForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-indigo-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Project
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!task.completed && task.title === 'Operational Excellence Philosophy' && (
                      <div className="mt-4">
                        {!openForms[task.id] ? (
                          <Button
                            onClick={() => toggleForm(task.id)}
                            variant="outline"
                            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 h-10 sm:h-9"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Write Philosophy Statement
                          </Button>
                        ) : (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">Operational Excellence Philosophy</h4>
                              </div>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <OperationalExcellencePhilosophyForm
                              value={task.evidence || ''}
                              onChange={(value) => {
                                setTasks(prevTasks => prevTasks.map(t =>
                                  t.id === task.id ? { ...t, evidence: value } : t
                                ))
                                debouncedAutoSave(task.id, value);
                              }}
                            />
                            <div className="mt-3 pt-3 border-t border-red-200 flex gap-2">
                              <Button
                                onClick={() => {
                                  if (task.evidence && task.evidence.trim()) {
                                    handleTaskToggle(task.id, true);
                                  }
                                }}
                                disabled={!task.evidence || !task.evidence.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Philosophy
                              </Button>
                              <Button
                                onClick={() => toggleForm(task.id)}
                                variant="outline"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                Save & Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {task.estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{task.estimatedTime}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Completed {formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>

                    {task.evidence && task.completed && (
                      <div className={`mt-2 p-3 rounded-md ${getTaskTypeColor(task.type).replace('text-', 'bg-').replace('800', '50')}`}>
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                          <FileCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>{getCompletionTitle(task.type, task.title)}</span>
                        </div>
                        {task.title === 'The Art of Feedback' ? (
                          <div className="space-y-3">
                            {(() => {
                              try {
                                const parsed = JSON.parse(task.evidence)
                                return (
                                  <>
                                    {parsed.keyInsights && (
                                      <div>
                                        <h5 className="text-xs font-medium text-gray-700 mb-1">Key Insights</h5>
                                        <p className="text-sm text-gray-600">{parsed.keyInsights}</p>
                                      </div>
                                    )}

                                    {/* Example 1 */}
                                    {(parsed.situation1 || parsed.behavior1 || parsed.impact1) && (
                                      <div className="border-l-4 border-l-blue-500 pl-3">
                                        <h5 className="text-xs font-medium text-gray-700 mb-2">Example 1</h5>
                                        {parsed.situation1 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Situation:</span>
                                            <p className="text-sm text-gray-600">{parsed.situation1}</p>
                                          </div>
                                        )}
                                        {parsed.behavior1 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Behavior:</span>
                                            <p className="text-sm text-gray-600">{parsed.behavior1}</p>
                                          </div>
                                        )}
                                        {parsed.impact1 && (
                                          <div>
                                            <span className="text-xs font-medium text-gray-600">Impact:</span>
                                            <p className="text-sm text-gray-600">{parsed.impact1}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Example 2 */}
                                    {(parsed.situation2 || parsed.behavior2 || parsed.impact2) && (
                                      <div className="border-l-4 border-l-green-500 pl-3">
                                        <h5 className="text-xs font-medium text-gray-700 mb-2">Example 2</h5>
                                        {parsed.situation2 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Situation:</span>
                                            <p className="text-sm text-gray-600">{parsed.situation2}</p>
                                          </div>
                                        )}
                                        {parsed.behavior2 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Behavior:</span>
                                            <p className="text-sm text-gray-600">{parsed.behavior2}</p>
                                          </div>
                                        )}
                                        {parsed.impact2 && (
                                          <div>
                                            <span className="text-xs font-medium text-gray-600">Impact:</span>
                                            <p className="text-sm text-gray-600">{parsed.impact2}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Example 3 */}
                                    {(parsed.situation3 || parsed.behavior3 || parsed.impact3) && (
                                      <div className="border-l-4 border-l-purple-500 pl-3">
                                        <h5 className="text-xs font-medium text-gray-700 mb-2">Example 3</h5>
                                        {parsed.situation3 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Situation:</span>
                                            <p className="text-sm text-gray-600">{parsed.situation3}</p>
                                          </div>
                                        )}
                                        {parsed.behavior3 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-600">Behavior:</span>
                                            <p className="text-sm text-gray-600">{parsed.behavior3}</p>
                                          </div>
                                        )}
                                        {parsed.impact3 && (
                                          <div>
                                            <span className="text-xs font-medium text-gray-600">Impact:</span>
                                            <p className="text-sm text-gray-600">{parsed.impact3}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )
                              } catch (e) {
                                // Fallback for non-JSON evidence
                                return <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.evidence}</p>
                              }
                            })()}
                          </div>
                        ) : task.title === 'Development Plan Creation' ? (
                          <div className="text-sm text-gray-600">
                            <p>Development plan completed. Use the buttons above to view, edit, or download the plan.</p>
                          </div>
                        ) : task.title === 'GROW Coaching Conversation' ? (
                          <div className="text-sm text-gray-600">
                            <p>GROW coaching conversation documented. Use the buttons above to view or edit the session details.</p>
                          </div>
                        ) : task.title === 'Training Effectiveness Audit' ? (
                          <div className="text-sm text-gray-600">
                            <p>Training effectiveness audit completed. Use the buttons above to view or edit the audit report.</p>
                          </div>
                        ) : task.title === 'Skill-Building Workshop' ? (
                          <div className="text-sm text-gray-600">
                            <p>Skill-building workshop documented. Use the buttons above to view or edit the workshop details.</p>
                          </div>
                        ) : task.title === 'Team Development Philosophy' ? (
                          <div className="text-sm text-gray-600">
                            <p>Team development philosophy completed. Use the buttons above to view or edit your philosophy statement.</p>
                          </div>
                        ) : task.title === 'Restaurant Strategy Diagnosis' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic diagnosis completed. Use the buttons above to view or edit your analysis.</p>
                          </div>
                        ) : task.title === 'Restaurant SWOT Analysis' ? (
                          <div className="text-sm text-gray-600">
                            <p>SWOT analysis completed. Use the buttons above to view or edit your analysis.</p>
                          </div>
                        ) : task.title === 'Strategic Decision Framework' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic decision framework completed. Use the buttons above to view or edit your decision analysis.</p>
                          </div>
                        ) : task.title === 'Competitive Landscape Mapping' ? (
                          <div className="text-sm text-gray-600">
                            <p>Competitive analysis completed. Use the buttons above to view or edit your competitive landscape analysis.</p>
                          </div>
                        ) : task.title === 'Strategic Leadership Self-Assessment' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic leadership self-assessment completed. Use the buttons above to view or edit your assessment and development plan.</p>
                          </div>
                        ) : task.title === 'Strategic Communication Practice' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic communication practice completed. Use the buttons above to view or edit your presentation and feedback.</p>
                          </div>
                        ) : task.title === 'Strategic Leadership Philosophy' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic leadership philosophy completed. Use the buttons above to view or edit your philosophy statement.</p>
                          </div>
                        ) : task.title === 'Strategic Change Initiative Plan' ? (
                          <div className="text-sm text-gray-600">
                            <p>Strategic change initiative plan completed. Use the buttons above to view or edit your change management plan.</p>
                          </div>
                        ) : task.title === '90-Day Strategic Plan' ? (
                          <div className="text-sm text-gray-600">
                            <p>90-day strategic plan completed. Use the buttons above to view or edit your strategic objectives and implementation plan.</p>
                          </div>
                        ) : task.title === 'Long-term Planning and Goal Setting' ? (
                          <div className="text-sm text-gray-600">
                            <p>Long-term planning and goal setting completed. Use the buttons above to view or edit your strategic goals and accountability system.</p>
                          </div>
                        ) : task.title === 'Develop Your Restaurant\'s Why' ? (
                          <div className="text-sm text-gray-600">
                            <p>Restaurant Why statement completed. Use the buttons above to view or edit your purpose statement and team feedback.</p>
                          </div>
                        ) : task.title === 'Feedback Delivery Practice' ? (
                          <div className="text-sm text-gray-600">
                            <p>Feedback delivery practice completed. You've documented three SBI feedback sessions and reflected on your communication approach. Use the buttons above to view or edit your feedback practice documentation.</p>
                          </div>
                        ) : task.title === 'Body Language Awareness' ? (
                          <div className="text-sm text-gray-600">
                            <p>Body language awareness practice completed. You've documented observations and developed your non-verbal communication reading skills. Use the buttons above to view or edit your practice documentation.</p>
                          </div>
                        ) : task.title === 'Influence Without Authority' ? (
                          <div className="text-sm text-gray-600">
                            <p>Influence without authority practice completed. You've documented scenarios and developed strategies for influencing others effectively. Use the buttons above to view or edit your influence documentation.</p>
                          </div>
                        ) : task.title === 'Influence Practice Project' ? (
                          <div className="text-sm text-gray-600">
                            <p>Influence practice project completed. You've planned and executed a comprehensive influence project with measurable results. Use the buttons above to view or edit your project documentation.</p>
                          </div>
                        ) : task.title === 'Difficult Conversations Framework' ? (
                          <div className="text-sm text-gray-600">
                            <p>Difficult conversations framework completed. You've developed structured approaches for handling challenging workplace conversations. Use the buttons above to view or edit your framework documentation.</p>
                          </div>
                        ) : task.title === 'Difficult Conversation Practice' ? (
                          <div className="text-sm text-gray-600">
                            <p>Difficult conversation practice completed. You've documented real conversations and refined your approach to challenging discussions. Use the buttons above to view or edit your practice documentation.</p>
                          </div>
                        ) : task.title === 'Written Communication Excellence' ? (
                          <div className="text-sm text-gray-600">
                            <p>Written communication excellence completed. You've analyzed and improved various types of workplace writing with professional standards. Use the buttons above to view or edit your communication samples.</p>
                          </div>
                        ) : task.title === 'Communication System Improvement' ? (
                          <div className="text-sm text-gray-600">
                            <p>Communication system improvement completed. You've assessed and implemented improvements to your restaurant's communication processes. Use the buttons above to view or edit your system analysis.</p>
                          </div>
                        ) : task.title === 'Communication Leadership Philosophy' ? (
                          <div className="text-sm text-gray-600">
                            <p>Communication leadership philosophy completed. You've developed your personal approach to leading through effective communication. Use the buttons above to view or edit your philosophy statement.</p>
                          </div>
                        ) : task.title === 'Introduction to Operational Excellence' ? (
                          <div className="text-sm text-gray-600">
                            <p>Operational excellence video reflection completed. You've analyzed key concepts and developed insights for implementing operational excellence in your restaurant. Use the buttons above to view or edit your reflection.</p>
                          </div>
                        ) : task.title === 'Quality Management Systems' ? (
                          <div className="text-sm text-gray-600">
                            <p>Quality management systems video reflection completed. You've explored quality frameworks and their application to restaurant operations. Use the buttons above to view or edit your reflection.</p>
                          </div>
                        ) : task.title === 'Lean Principles for Restaurants' ? (
                          <div className="text-sm text-gray-600">
                            <p>Lean principles reading reflection completed. You've studied waste elimination and efficiency principles with specific restaurant applications. Use the buttons above to view or edit your reflection.</p>
                          </div>
                        ) : task.title === 'Performance Metrics and KPIs' ? (
                          <div className="text-sm text-gray-600">
                            <p>Performance metrics and KPIs reading reflection completed. You've learned about measuring operational performance and tracking key indicators. Use the buttons above to view or edit your reflection.</p>
                          </div>
                        ) : task.title === 'Process Mapping Exercise' ? (
                          <div className="text-sm text-gray-600">
                            <p>Process mapping exercise completed. You've documented and analyzed key restaurant processes to identify improvement opportunities. Use the buttons above to view or edit your process maps.</p>
                          </div>
                        ) : task.title === 'Quality Standards Development' ? (
                          <div className="text-sm text-gray-600">
                            <p>Quality standards development completed. You've created comprehensive quality standards and procedures for your restaurant operations. Use the buttons above to view or edit your standards.</p>
                          </div>
                        ) : task.title === 'KPI Dashboard Creation' ? (
                          <div className="text-sm text-gray-600">
                            <p>KPI dashboard creation completed. You've designed a comprehensive performance tracking system with key metrics and monitoring processes. Use the buttons above to view or edit your dashboard.</p>
                          </div>
                        ) : task.title === 'Continuous Improvement Project' ? (
                          <div className="text-sm text-gray-600">
                            <p>Continuous improvement project completed. You've executed a complete PDCA cycle project with measurable results and lessons learned. Use the buttons above to view or edit your project documentation.</p>
                          </div>
                        ) : task.title === 'Operational Excellence Philosophy' ? (
                          <div className="text-sm text-gray-600">
                            <p>Operational excellence philosophy completed. You've developed your comprehensive approach to driving efficiency, quality, and continuous improvement. Use the buttons above to view or edit your philosophy statement.</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.evidence}</p>
                        )}
                      </div>
                    )}

                    {task.notes && task.completed && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                          <PenTool className="h-4 w-4 flex-shrink-0 text-blue-600" />
                          <span>Notes</span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.notes}</p>
                      </div>
                    )}



                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      {task.title === 'Team Experience Survey' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/5 h-10 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/team-surveys/new');
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Create Survey
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/team-surveys');
                            }}
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            View Surveys
                          </Button>
                        </>
                      ) : (
                        <>
                          {task.resourceUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(task.resourceUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Resource
                            </Button>
                          )}

                          {/* Communication Leadership Task Buttons */}
                          {!task.completed && task.title === 'Body Language Awareness' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Complete Body Language Practice
                            </Button>
                          )}

                          {!task.completed && task.title === 'Influence Without Authority' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Complete Influence Practice
                            </Button>
                          )}

                          {!task.completed && task.title === 'Influence Practice Project' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-10 sm:h-9"
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Complete Influence Project
                            </Button>
                          )}

                          {!task.completed && task.title === 'Difficult Conversations Framework' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 h-10 sm:h-9"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Complete Framework Development
                            </Button>
                          )}

                          {!task.completed && task.title === 'Difficult Conversation Practice' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Complete Conversation Practice
                            </Button>
                          )}

                          {!task.completed && task.title === 'Written Communication Excellence' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Complete Writing Excellence
                            </Button>
                          )}

                          {!task.completed && task.title === 'Communication System Improvement' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-10 sm:h-9"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Complete System Improvement
                            </Button>
                          )}

                          {!task.completed && task.title === 'Communication Leadership Philosophy' && (
                            <Button
                              onClick={() => toggleForm(task.id)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Complete Leadership Philosophy
                            </Button>
                          )}

                          {/* Generic completion buttons for tasks with custom forms */}
                          {[
                            'Character vs. Capacity Reflection',
                            'Introduction to Servant Leadership',
                            'The Heart of Leadership: Introduction & Chapter 1',
                            'The Heart of Leadership: Respond with Courage',
                            'The Heart of Leadership: Final Chapters & Application',
                            'The Heart of Leadership: Think Others First',
                            'The Heart of Leadership: Expect the Best',
                            'Selfless Leadership in Action',
                            '30-Day Leadership Character Plan',
                            'Leadership Values Exercise',
                            'The Power of Vulnerability in Leadership',
                            'Leadership Legacy Statement',
                            'Active Listening Practice',
                            'Setting Higher Expectations',
                            'Courageous Conversation Plan',
                            'Leadership Self-Assessment',
                            'Servant Leadership in Action'
                          ].includes(task.title) && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Task
                            </Button>
                          )}

                          {/* Generic view/edit buttons for completed tasks with custom forms */}
                          {[
                            'Character vs. Capacity Reflection',
                            'Introduction to Servant Leadership',
                            'The Heart of Leadership: Introduction & Chapter 1',
                            'The Heart of Leadership: Respond with Courage',
                            'The Heart of Leadership: Final Chapters & Application',
                            'The Heart of Leadership: Think Others First',
                            'The Heart of Leadership: Expect the Best',
                            'Selfless Leadership in Action',
                            '30-Day Leadership Character Plan',
                            'Leadership Values Exercise',
                            'The Power of Vulnerability in Leadership',
                            'Leadership Legacy Statement',
                            'Active Listening Practice',
                            'Setting Higher Expectations',
                            'Courageous Conversation Plan',
                            'Leadership Self-Assessment',
                            'Servant Leadership in Action'
                          ].includes(task.title) && task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Edit
                            </Button>
                          )}

                          {/* Completion buttons for tasks without specific custom forms but need completion */}
                          {![
                            'Character vs. Capacity Reflection',
                            'Introduction to Servant Leadership',
                            'The Heart of Leadership: Introduction & Chapter 1',
                            'The Heart of Leadership: Respond with Courage',
                            'The Heart of Leadership: Final Chapters & Application',
                            'The Heart of Leadership: Think Others First',
                            'The Heart of Leadership: Expect the Best',
                            'Selfless Leadership in Action',
                            '30-Day Leadership Character Plan',
                            'Leadership Values Exercise',
                            'The Power of Vulnerability in Leadership',
                            'Leadership Legacy Statement',
                            'Active Listening Practice',
                            'Setting Higher Expectations',
                            'Courageous Conversation Plan',
                            'Leadership Self-Assessment',
                            'Servant Leadership in Action',
                            'The Art of Feedback',
                            'GROW Coaching Conversation',
                            'Development Plan Creation',
                            'Training Effectiveness Audit',
                            'Skill-Building Workshop',
                            'Team Development Philosophy',
                            'Restaurant Strategy Diagnosis',
                            'Restaurant SWOT Analysis',
                            'Strategic Decision Framework',
                            'Competitive Landscape Mapping',
                            'Strategic Leadership Self-Assessment',
                            'Strategic Communication Practice',
                            'Strategic Leadership Philosophy',
                            'Strategic Change Initiative Plan',
                            '90-Day Strategic Plan',
                            'Long-term Planning and Goal Setting',
                            'Develop Your Restaurant\'s Why',
                            'Feedback Delivery Practice',
                            'Body Language Awareness',
                            'Influence Without Authority',
                            'Influence Practice Project',
                            'Difficult Conversations Framework',
                            'Difficult Conversation Practice',
                            'Written Communication Excellence',
                            'Communication System Improvement',
                            'Communication Leadership Philosophy',
                            'Team Experience Survey',
                            'Culture Leadership Plan',
                            'Team Values Workshop',
                            'Talent Assessment',
                            'Introduction to Operational Excellence',
                            'Lean Principles for Restaurants',
                            'Process Mapping Exercise',
                            'Quality Management Systems',
                            'Quality Standards Development',
                            'Performance Metrics and KPIs',
                            'KPI Dashboard Creation',
                            'Continuous Improvement Project',
                            'Operational Excellence Philosophy'
                          ].includes(task.title) && !task.completed && ['reading', 'video', 'reflection', 'assessment', 'activity', 'task'].includes(task.type) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Task
                            </Button>
                          )}

                          {/* View/Edit buttons for completed tasks without specific custom forms */}
                          {![
                            'Character vs. Capacity Reflection',
                            'Introduction to Servant Leadership',
                            'The Heart of Leadership: Introduction & Chapter 1',
                            'The Heart of Leadership: Respond with Courage',
                            'The Heart of Leadership: Final Chapters & Application',
                            'The Heart of Leadership: Think Others First',
                            'The Heart of Leadership: Expect the Best',
                            'Selfless Leadership in Action',
                            '30-Day Leadership Character Plan',
                            'Leadership Values Exercise',
                            'The Power of Vulnerability in Leadership',
                            'Leadership Legacy Statement',
                            'Active Listening Practice',
                            'Setting Higher Expectations',
                            'Courageous Conversation Plan',
                            'Leadership Self-Assessment',
                            'Servant Leadership in Action',
                            'The Art of Feedback',
                            'GROW Coaching Conversation',
                            'Development Plan Creation',
                            'Training Effectiveness Audit',
                            'Skill-Building Workshop',
                            'Team Development Philosophy',
                            'Restaurant Strategy Diagnosis',
                            'Restaurant SWOT Analysis',
                            'Strategic Decision Framework',
                            'Competitive Landscape Mapping',
                            'Strategic Leadership Self-Assessment',
                            'Strategic Communication Practice',
                            'Strategic Leadership Philosophy',
                            'Strategic Change Initiative Plan',
                            '90-Day Strategic Plan',
                            'Long-term Planning and Goal Setting',
                            'Develop Your Restaurant\'s Why',
                            'Feedback Delivery Practice',
                            'Body Language Awareness',
                            'Influence Without Authority',
                            'Influence Practice Project',
                            'Difficult Conversations Framework',
                            'Difficult Conversation Practice',
                            'Written Communication Excellence',
                            'Communication System Improvement',
                            'Communication Leadership Philosophy',
                            'Team Experience Survey',
                            'Culture Leadership Plan',
                            'Team Values Workshop',
                            'Talent Assessment',
                            'Introduction to Operational Excellence',
                            'Lean Principles for Restaurants',
                            'Process Mapping Exercise',
                            'Quality Management Systems',
                            'Quality Standards Development',
                            'Performance Metrics and KPIs',
                            'KPI Dashboard Creation',
                            'Continuous Improvement Project',
                            'Operational Excellence Philosophy'
                          ].includes(task.title) && task.completed && ['reading', 'video', 'reflection', 'assessment', 'activity', 'task'].includes(task.type) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Edit
                            </Button>
                          )}

                          {task.title === 'The Art of Feedback' && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Complete Task
                            </Button>
                          )}
                          {task.title === 'The Art of Feedback' && task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Edit Examples
                            </Button>
                          )}
                          {task.title === 'GROW Coaching Conversation' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGrowExamplesDialog(true);
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Example
                            </Button>
                          )}
                          {task.title === 'GROW Coaching Conversation' && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Complete Coaching Session
                            </Button>
                          )}
                          {task.title === 'GROW Coaching Conversation' && task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View/Edit Session
                            </Button>
                          )}

                          {/* Communication Style Assessment */}
                          {task.title === 'Communication Style Assessment' && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-orange-600 border-orange-200 hover:bg-orange-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/leadership/assessments');
                              }}
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              Take Assessment
                            </Button>
                          )}
                          {task.title === 'Communication Style Assessment' && task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-orange-600 border-orange-200 hover:bg-orange-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/leadership/assessments');
                              }}
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              View Results
                            </Button>
                          )}
                          {task.title === 'Development Plan Creation' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDevelopmentPlanExamplesDialog(true);
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Example
                            </Button>
                          )}
                          {task.title === 'Development Plan Creation' && !task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Create Development Plan
                            </Button>
                          )}
                          {task.title === 'Development Plan Creation' && task.completed && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCompletionDialog(task);
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                View/Edit Plan
                              </Button>
                              {task.evidence && (() => {
                                try {
                                  const parsedData = JSON.parse(task.evidence)
                                  return (
                                    <DevelopmentPlanPDFDownload
                                      data={parsedData}
                                      className="w-full sm:w-auto h-10 sm:h-9"
                                      variant="outline"
                                      size="sm"
                                    />
                                  )
                                } catch (e) {
                                  return null
                                }
                              })()}
                            </>
                          )}
                        </>
                      )}
                      {task.title === 'Culture Leadership Plan' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('/templates/90-day-culture-leadership-plan-example.html', '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Example
                          </Button>
                          {!task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Task
                            </Button>
                          )}
                          {task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Edit Plan
                            </Button>
                          )}
                        </>
                      )}
                      {task.title === 'Team Values Workshop' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('/templates/team-values-workshop-example.html', '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Example
                          </Button>
                          {!task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Task
                            </Button>
                          )}
                          {task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Edit Workshop
                            </Button>
                          )}
                        </>
                      )}
                      {task.title === 'Talent Assessment' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTalentExamplesDialog(true);
                            }}
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            View Examples
                          </Button>
                          {!task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Assessment
                            </Button>
                          )}
                          {task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCompletionDialog(task);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Edit Assessment
                            </Button>
                          )}
                        </>
                      )}
                      {/* Training Effectiveness Audit */}
                      {task.title === 'Training Effectiveness Audit' && !task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Complete Audit
                        </Button>
                      )}
                      {task.title === 'Training Effectiveness Audit' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          View/Edit Audit
                        </Button>
                      )}
                      {/* Skill-Building Workshop */}
                      {task.title === 'Skill-Building Workshop' && !task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Document Workshop
                        </Button>
                      )}
                      {task.title === 'Skill-Building Workshop' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View/Edit Workshop
                        </Button>
                      )}
                      {/* Team Development Philosophy */}
                      {task.title === 'Team Development Philosophy' && !task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Write Philosophy
                        </Button>
                      )}
                      {task.title === 'Team Development Philosophy' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View/Edit Philosophy
                        </Button>
                      )}
                      {/* Restaurant Strategy Diagnosis */}
                      {task.title === 'Restaurant Strategy Diagnosis' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View/Edit Diagnosis
                        </Button>
                      )}
                      {/* Restaurant SWOT Analysis */}
                      {task.title === 'Restaurant SWOT Analysis' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View/Edit SWOT
                        </Button>
                      )}
                      {/* Strategic Decision Framework */}
                      {task.title === 'Strategic Decision Framework' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View/Edit Framework
                        </Button>
                      )}
                      {/* Competitive Landscape Mapping */}
                      {task.title === 'Competitive Landscape Mapping' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-orange-600 border-orange-200 hover:bg-orange-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View/Edit Analysis
                        </Button>
                      )}
                      {/* Strategic Leadership Self-Assessment */}
                      {task.title === 'Strategic Leadership Self-Assessment' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View/Edit Assessment
                        </Button>
                      )}
                      {/* Strategic Communication Practice */}
                      {task.title === 'Strategic Communication Practice' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View/Edit Practice
                        </Button>
                      )}
                      {/* Strategic Leadership Philosophy */}
                      {task.title === 'Strategic Leadership Philosophy' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View/Edit Philosophy
                        </Button>
                      )}
                      {/* Strategic Change Initiative Plan */}
                      {task.title === 'Strategic Change Initiative Plan' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-orange-600 border-orange-200 hover:bg-orange-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View/Edit Change Plan
                        </Button>
                      )}
                      {/* 90-Day Strategic Plan */}
                      {task.title === '90-Day Strategic Plan' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          View/Edit Strategic Plan
                        </Button>
                      )}
                      {/* Long-term Planning and Goal Setting */}
                      {task.title === 'Long-term Planning and Goal Setting' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View/Edit Long-term Plan
                        </Button>
                      )}
                      {/* Develop Your Restaurant's Why */}
                      {task.title === 'Develop Your Restaurant\'s Why' && task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 h-10 sm:h-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompletionDialog(task);
                          }}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          View/Edit Why Statement
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Completion Dialog - Mobile Optimized */}
      <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-base sm:text-lg">
              <div className="flex items-center gap-2">
                {selectedTask && getTaskIcon(selectedTask.type)}
                <span className="line-clamp-2">{selectedTask?.title === 'The Art of Feedback' ? 'SBI Feedback Practice' : `Complete: ${selectedTask?.title}`}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-2">
              {selectedTask?.title === 'The Art of Feedback' ?
                'Practice the SBI feedback model with real examples from your restaurant. You can save your progress and come back to add more examples later.' :
                selectedTask && getCompletionPrompt(selectedTask.type, selectedTask.title)
              }
              {selectedTask && selectedTask.title !== 'The Art of Feedback' && ['reading', 'video', 'reflection', 'assessment'].includes(selectedTask.type) && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs font-medium">Evidence of completion is required for this task</span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{selectedTask && getCompletionTitle(selectedTask.type, selectedTask.title)}</h4>

              {/* Render the appropriate form based on task title */}
              {selectedTask && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {/* Character & Capacity */}
                  {selectedTask.title === "Character vs. Capacity Reflection" && (
                    <CharacterCapacityForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Servant Leadership */}
                  {selectedTask.title === "Introduction to Servant Leadership" && (
                    <ServantLeadershipVideoForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Heart of Leadership Reading */}
                  {(selectedTask.title === "The Heart of Leadership: Introduction & Chapter 1" ||
                   selectedTask.title === "The Heart of Leadership: Respond with Courage" ||
                   selectedTask.title === "The Heart of Leadership: Final Chapters & Application") && (
                    <HeartLeadershipReadingForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Selfless Leadership */}
                  {selectedTask.title === "Selfless Leadership in Action" && (
                    <SelflessLeadershipForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Character Plan */}
                  {selectedTask.title === "30-Day Leadership Character Plan" && (
                    <LeadershipCharacterPlanForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Values Exercise */}
                  {selectedTask.title === "Leadership Values Exercise" && (
                    <LeadershipValuesForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Vulnerability */}
                  {selectedTask.title === "The Power of Vulnerability in Leadership" && (
                    <VulnerabilityLeadershipForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Legacy Statement */}
                  {selectedTask.title === "Leadership Legacy Statement" && (
                    <LeadershipLegacyForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Active Listening */}
                  {selectedTask.title === "Active Listening Practice" && (
                    <ActiveListeningForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Think Others First */}
                  {selectedTask.title === "The Heart of Leadership: Think Others First" && (
                    <ThinkOthersFirstForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Expect the Best */}
                  {selectedTask.title === "The Heart of Leadership: Expect the Best" && (
                    <ExpectBestForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Higher Expectations */}
                  {selectedTask.title === "Setting Higher Expectations" && (
                    <HigherExpectationsForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Courageous Conversation */}
                  {selectedTask.title === "Courageous Conversation Plan" && (
                    <CourageousConversationForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Self-Assessment */}
                  {selectedTask.title === "Leadership Self-Assessment" && (
                    <LeadershipSelfAssessmentForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Servant Leadership Action */}
                  {selectedTask.title === "Servant Leadership in Action" && (
                    <ServantLeadershipActionForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* SBI Feedback */}
                  {selectedTask.title === "The Art of Feedback" && (
                    <SBIFeedbackForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* GROW Coaching Conversation */}
                  {selectedTask.title === "GROW Coaching Conversation" && (
                    <GROWCoachingForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Development Plan Creation */}
                  {selectedTask.title === "Development Plan Creation" && (
                    <DevelopmentPlanForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Training Effectiveness Audit */}
                  {selectedTask.title === "Training Effectiveness Audit" && (
                    <TrainingEffectivenessAuditForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Skill-Building Workshop */}
                  {selectedTask.title === "Skill-Building Workshop" && (
                    <SkillBuildingWorkshopForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Restaurant Strategy Diagnosis */}
                  {selectedTask.title === "Restaurant Strategy Diagnosis" && (
                    <RestaurantStrategyDiagnosisForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Restaurant SWOT Analysis */}
                  {selectedTask.title === "Restaurant SWOT Analysis" && (
                    <RestaurantSWOTAnalysisForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Team Development Philosophy */}
                  {selectedTask.title === "Team Development Philosophy" && (
                    <TeamDevelopmentPhilosophyForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Strategic Decision Framework */}
                  {selectedTask.title === "Strategic Decision Framework" && (
                    <StrategicDecisionFrameworkForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Competitive Landscape Mapping */}
                  {selectedTask.title === "Competitive Landscape Mapping" && (
                    <CompetitiveAnalysisForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Strategic Leadership Self-Assessment */}
                  {selectedTask.title === "Strategic Leadership Self-Assessment" && (
                    <StrategicLeadershipSelfAssessmentForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Strategic Communication Practice */}
                  {selectedTask.title === "Strategic Communication Practice" && (
                    <StrategicCommunicationPracticeForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Strategic Leadership Philosophy */}
                  {selectedTask.title === "Strategic Leadership Philosophy" && (
                    <StrategicLeadershipPhilosophyForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Strategic Change Initiative Plan */}
                  {selectedTask.title === "Strategic Change Initiative Plan" && (
                    <StrategicChangeInitiativePlanForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* 90-Day Strategic Plan */}
                  {selectedTask.title === "90-Day Strategic Plan" && (
                    <NinetyDayStrategicPlanForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Long-term Planning and Goal Setting */}
                  {selectedTask.title === "Long-term Planning and Goal Setting" && (
                    <LongTermPlanningForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Develop Your Restaurant's Why */}
                  {selectedTask.title === "Develop Your Restaurant's Why" && (
                    <RestaurantWhyStatementForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Feedback Delivery Practice */}
                  {selectedTask.title === "Feedback Delivery Practice" && (
                    <FeedbackDeliveryPracticeForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Innovation & Change Champion Forms */}
                  {selectedTask.title === "Leading Change in Organizations" && (
                    <LeadingChangeVideoForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Innovation Mindset Development" && (
                    <CreativeConfidenceBookForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Creative Problem Solving Techniques" && (
                    <DesignThinkingVideoForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Innovation Audit" && (
                    <InnovationAuditForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Innovation Workshop" && (
                    <InnovationWorkshopForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Change Management Strategies" && (
                    <ChangeManagementStrategiesForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Change Implementation Plan" && (
                    <ChangeImplementationPlanForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Continuous Improvement System" && (
                    <ContinuousImprovementSystemForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Innovation Leadership Philosophy" && (
                    <InnovationLeadershipPhilosophyForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Customer Experience Forms */}
                  {selectedTask.title === "Customer Experience Excellence" && (
                    <CustomerExperienceExcellenceForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Service Recovery Strategies" && (
                    <ServiceRecoveryStrategiesForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Building a Hospitality Culture" && (
                    <HospitalityCultureForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Customer Experience Philosophy" && (
                    <CustomerExperiencePhilosophyForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Customer Journey Mapping" && (
                    <CustomerJourneyMappingForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Creating Ritz-Carlton Service Culture" && (
                    <RitzCarltonServiceCultureForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Service Standards Development" && (
                    <ServiceStandardsDevelopmentForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Customer Feedback and Measurement" && (
                    <CustomerFeedbackMeasurementForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Customer Feedback System" && (
                    <CustomerFeedbackSystemForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {selectedTask.title === "Service Recovery Training" && (
                    <ServiceRecoveryTrainingForm
                      value={completionEvidence}
                      onChange={setCompletionEvidence}
                    />
                  )}

                  {/* Default textarea for tasks without a custom form */}
                  {![
                    "Character vs. Capacity Reflection",
                    "Introduction to Servant Leadership",
                    "The Heart of Leadership: Introduction & Chapter 1",
                    "The Heart of Leadership: Respond with Courage",
                    "The Heart of Leadership: Final Chapters & Application",
                    "The Heart of Leadership: Think Others First",
                    "The Heart of Leadership: Expect the Best",
                    "Selfless Leadership in Action",
                    "30-Day Leadership Character Plan",
                    "Leadership Values Exercise",
                    "The Power of Vulnerability in Leadership",
                    "Leadership Legacy Statement",
                    "Active Listening Practice",
                    "Setting Higher Expectations",
                    "Courageous Conversation Plan",
                    "Leadership Self-Assessment",
                    "Servant Leadership in Action",
                    "The Art of Feedback",
                    "GROW Coaching Conversation",
                    "Development Plan Creation",
                    "Training Effectiveness Audit",
                    "Skill-Building Workshop",
                    "Team Development Philosophy",
                    "Restaurant Strategy Diagnosis",
                    "Restaurant SWOT Analysis",
                    "Strategic Decision Framework",
                    "Competitive Landscape Mapping",
                    "Strategic Leadership Self-Assessment",
                    "Strategic Communication Practice",
                    "Strategic Leadership Philosophy",
                    "Strategic Change Initiative Plan",
                    "90-Day Strategic Plan",
                    "Long-term Planning and Goal Setting",
                    "Develop Your Restaurant's Why",
                    "Feedback Delivery Practice",
                    "Leading Change in Organizations",
                    "Innovation Mindset Development",
                    "Creative Problem Solving Techniques",
                    "Innovation Audit",
                    "Innovation Workshop",
                    "Change Management Strategies",
                    "Change Implementation Plan",
                    "Continuous Improvement System",
                    "Innovation Leadership Philosophy",
                    "Customer Experience Excellence",
                    "Service Recovery Strategies",
                    "Building a Hospitality Culture",
                    "Customer Experience Philosophy",
                    "Customer Journey Mapping",
                    "Creating Ritz-Carlton Service Culture",
                    "Service Standards Development",
                    "Customer Feedback and Measurement",
                    "Customer Feedback System",
                    "Service Recovery Training"
                  ].includes(selectedTask.title) && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium">
                        {selectedTask.type.charAt(0).toUpperCase() + selectedTask.type.slice(1)} Summary
                      </div>
                      <Textarea
                        id="task-evidence"
                        placeholder={getEvidencePlaceholder(selectedTask?.type || '', selectedTask?.title)}
                        value={completionEvidence}
                        onChange={(e) => setCompletionEvidence(e.target.value)}
                        className="min-h-[120px] text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-medium">Additional Notes (Optional)</h4>
              <Textarea
                placeholder="Add any additional notes or reflections..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={closeCompletionDialog}
              className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleTaskCompletion}
              disabled={
                updatingTask === selectedTask?.id ||
                (selectedTask && selectedTask.title !== 'The Art of Feedback' && ['reading', 'video', 'reflection', 'assessment'].includes(selectedTask.type) && !completionEvidence.trim())
              }
              className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700 h-11 sm:h-10"
            >
              {updatingTask === selectedTask?.id ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : selectedTask?.title === 'The Art of Feedback' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Save Progress
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog - Mobile Optimized */}
      <Dialog open={unenrollDialog} onOpenChange={setUnenrollDialog}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg text-red-600">Unenroll from Plan</DialogTitle>
            <DialogDescription className="text-sm mt-2">
              Are you sure you want to unenroll from this development plan? All your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={closeUnenrollDialog}
              className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUnenroll}
              disabled={unenrolling}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white h-11 sm:h-10"
            >
              {unenrolling ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Unenrolling...
                </>
              ) : (
                <>
                  <X className="h-5 w-5 mr-2" />
                  Unenroll
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Talent Assessment Examples Dialog */}
      <Dialog open={talentExamplesDialog} onOpenChange={setTalentExamplesDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold text-[#E51636]">
              Talent Assessment Examples
            </DialogTitle>
            <DialogDescription className="text-sm mt-2">
              Use these examples to help you assess and categorize your team members into the four talent quadrants.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* High Performance / High Potential */}
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 mb-3">HIGH PERFORMANCE / HIGH POTENTIAL</h3>
              <p className="text-sm font-medium text-blue-700 mb-2">Stars - Your Future Leaders</p>
              <div className="bg-white p-3 rounded border-l-2 border-blue-300 mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Example:</span> Sarah consistently exceeds guest service standards, shows leadership during rush periods, asks thoughtful questions about operations, and other team members naturally look to her for guidance.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 text-sm">Development Actions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Cross-train in multiple positions</li>
                  <li>• Assign mentoring responsibilities</li>
                  <li>• Include in leadership meetings</li>
                  <li>• Provide stretch assignments like leading team huddles</li>
                  <li>• Consider for promotion track</li>
                </ul>
              </div>
            </div>

            {/* High Performance / Lower Potential */}
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 mb-3">HIGH PERFORMANCE / LOWER POTENTIAL</h3>
              <p className="text-sm font-medium text-green-700 mb-2">Solid Performers - Your Reliable Foundation</p>
              <div className="bg-white p-3 rounded border-l-2 border-green-300 mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Example:</span> Mike is a reliable team member who consistently meets all standards, shows up on time, follows procedures perfectly, but prefers routine tasks and doesn't seek additional responsibilities.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2 text-sm">Development Actions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Recognize and reward consistency</li>
                  <li>• Use as trainer for new hires</li>
                  <li>• Provide opportunities to specialize in strength areas</li>
                  <li>• Focus on job enrichment rather than advancement</li>
                </ul>
              </div>
            </div>

            {/* Lower Performance / High Potential */}
            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-amber-800 mb-3">LOWER PERFORMANCE / HIGH POTENTIAL</h3>
              <p className="text-sm font-medium text-amber-700 mb-2">Diamonds in the Rough - Your Investment Opportunities</p>
              <div className="bg-white p-3 rounded border-l-2 border-amber-300 mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Example:</span> Jessica is a new team member who sometimes struggles with speed during rush but shows great attitude, asks lots of questions, volunteers for extra tasks, and demonstrates strong problem-solving when given time.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 mb-2 text-sm">Development Actions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Provide intensive coaching and mentoring</li>
                  <li>• Pair with high performers</li>
                  <li>• Set clear short-term goals</li>
                  <li>• Give frequent feedback</li>
                  <li>• Invest in additional training</li>
                  <li>• Be patient with development timeline</li>
                </ul>
              </div>
            </div>

            {/* Lower Performance / Lower Potential */}
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <h3 className="font-bold text-red-800 mb-3">LOWER PERFORMANCE / LOWER POTENTIAL</h3>
              <p className="text-sm font-medium text-red-700 mb-2">Needs Basic Development - Your Coaching Focus</p>
              <div className="bg-white p-3 rounded border-l-2 border-red-300 mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Example:</span> Alex struggles to meet basic job requirements, frequently late, needs constant reminders about procedures, shows little initiative or interest in improvement.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-red-800 mb-2 text-sm">Development Actions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Provide clear expectations and consequences</li>
                  <li>• Implement performance improvement plan</li>
                  <li>• Consider role fit assessment</li>
                  <li>• Provide basic skills training</li>
                  <li>• Set minimum performance standards with timeline</li>
                </ul>
              </div>
            </div>
          </div>



          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => setTalentExamplesDialog(false)}
              className="w-full bg-[#E51636] hover:bg-[#c41230] text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GROW Coaching Examples Dialog */}
      <Dialog open={growExamplesDialog} onOpenChange={setGrowExamplesDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold text-[#E51636]">
              GROW Coaching Conversation Example
            </DialogTitle>
            <DialogDescription className="text-sm mt-2">
              This example shows how to conduct a complete GROW coaching conversation with a team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Conversation Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Conversation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Team Member:</span>
                  <p className="text-gray-800">Sarah Johnson</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date:</span>
                  <p className="text-gray-800">March 15, 2024</p>
                </div>
              </div>
            </div>

            {/* GROW Model Sections */}
            <div className="space-y-4">
              {/* Goal */}
              <div className="border-l-4 border-l-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-blue-800 mb-2">GOAL - What does the team member want to achieve?</h3>
                <p className="text-sm text-gray-700">
                  "I want to become more confident when handling difficult guest complaints. My goal is to be able to resolve most guest issues without needing to call a manager, and to feel more comfortable during these interactions within the next month."
                </p>
              </div>

              {/* Reality */}
              <div className="border-l-4 border-l-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-green-800 mb-2">REALITY - What is the current situation?</h3>
                <p className="text-sm text-gray-700">
                  "Currently, when a guest complains, I feel anxious and immediately call for a manager. I've handled about 3 guest complaints in the past month, and each time I felt overwhelmed. I know the basic service recovery steps, but I get nervous about making decisions on my own, especially when it involves comping items or offering solutions. I'm worried about making the wrong decision and making the situation worse."
                </p>
              </div>

              {/* Options */}
              <div className="border-l-4 border-l-amber-500 pl-4 bg-amber-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-amber-800 mb-2">OPTIONS - What are the possible solutions or approaches?</h3>
                <p className="text-sm text-gray-700">
                  "We discussed several options: 1) Role-playing different complaint scenarios during slower periods, 2) Shadowing experienced team members when they handle complaints, 3) Creating a quick reference guide with common solutions and my authority limits, 4) Starting with smaller complaints and gradually working up to more complex issues, 5) Having a manager nearby for support initially but trying to handle it first, 6) Practicing the LAST method (Listen, Apologize, Solve, Thank) until it becomes natural."
                </p>
              </div>

              {/* Will/Way Forward */}
              <div className="border-l-4 border-l-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-purple-800 mb-2">WILL/WAY FORWARD - What specific actions will be taken?</h3>
                <p className="text-sm text-gray-700">
                  "Sarah committed to: 1) Practice role-playing with me for 15 minutes twice this week using different complaint scenarios, 2) Create her own quick reference card with common solutions and her authority limits ($25 comp limit), 3) Shadow Jessica (our most experienced team member) during her next two shifts to observe how she handles complaints, 4) Handle the next minor complaint independently while I observe from nearby, 5) Check in with me after each complaint she handles to discuss what went well and what could be improved. We scheduled our follow-up meeting for March 29th to review her progress and adjust the plan if needed."
                </p>
              </div>
            </div>

            {/* Reflection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Coaching Reflection</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">What went well in this coaching conversation?</h4>
                  <p className="text-sm text-gray-600">
                    Sarah was very open about her anxiety and specific concerns. She came up with most of the solutions herself when I asked the right questions. The GROW structure helped keep the conversation focused and productive. She seemed genuinely excited about the action plan by the end of our conversation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">What would you do differently next time?</h4>
                  <p className="text-sm text-gray-600">
                    I could have spent more time in the Reality phase to really understand her specific fears. I also realized I should have asked about her past successes with difficult situations to build her confidence. Next time, I'll make sure to celebrate small wins more and ask more open-ended questions in the Options phase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => setGrowExamplesDialog(false)}
              className="w-full bg-[#E51636] hover:bg-[#c41230] text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Development Plan Examples Dialog */}
      <Dialog open={developmentPlanExamplesDialog} onOpenChange={setDevelopmentPlanExamplesDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold text-[#E51636]">
              90-Day Development Plan Example
            </DialogTitle>
            <DialogDescription className="text-sm mt-2">
              This example shows how to create a comprehensive development plan for a high-potential team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Team Member Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Team Member Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Team Member:</span>
                  <p className="text-gray-800">Alex Rodriguez</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Position:</span>
                  <p className="text-gray-800">Team Member</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Plan Created:</span>
                  <p className="text-gray-800">March 1, 2024</p>
                </div>
              </div>
            </div>

            {/* Skills Development */}
            <div className="space-y-4">
              <div className="border-l-4 border-l-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-blue-800 mb-2">Skills to Develop</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Guest Service Recovery:</strong> Handle complaints confidently and turn negative experiences into positive ones</p>
                  <p>• <strong>Training & Mentoring:</strong> Effectively train new team members and provide ongoing support</p>
                  <p>• <strong>Shift Leadership:</strong> Lead team during busy periods and make operational decisions</p>
                  <p>• <strong>Inventory Management:</strong> Understand food costs, waste reduction, and ordering processes</p>
                  <p>• <strong>Conflict Resolution:</strong> Address team member disagreements professionally and fairly</p>
                </div>
              </div>

              <div className="border-l-4 border-l-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-green-800 mb-2">Learning Resources</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Chick-fil-A Pathway:</strong> Leadership modules and Guest Experience training</p>
                  <p>• <strong>Book:</strong> "The One Minute Manager" by Ken Blanchard (available at local library)</p>
                  <p>• <strong>Online:</strong> Harvard Business Review articles on conflict resolution</p>
                  <p>• <strong>Internal:</strong> Training videos on service recovery and food safety</p>
                  <p>• <strong>Mentoring:</strong> Weekly sessions with Jessica (experienced shift leader)</p>
                </div>
              </div>

              <div className="border-l-4 border-l-amber-500 pl-4 bg-amber-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-amber-800 mb-2">On-the-Job Experiences</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Team Huddles:</strong> Lead pre-shift huddles twice per week</p>
                  <p>• <strong>Training Responsibility:</strong> Train 2 new hires on register operations</p>
                  <p>• <strong>Guest Recovery:</strong> Handle complaints independently (with manager nearby initially)</p>
                  <p>• <strong>Inventory Tasks:</strong> Assist with weekly inventory counts and waste tracking</p>
                  <p>• <strong>Leadership Shadowing:</strong> Shadow different shift leaders to observe various styles</p>
                  <p>• <strong>Improvement Project:</strong> Lead initiative to reduce average order time by 30 seconds</p>
                </div>
              </div>
            </div>

            {/* 90-Day Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-l-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-purple-800 mb-2">30-Day Goals</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Complete guest service recovery training</p>
                  <p>• Handle 5 guest complaints with minimal intervention</p>
                  <p>• Lead 8 team huddles confidently</p>
                  <p>• Begin training first new hire on register</p>
                  <p>• Shadow 3 different shift leaders</p>
                </div>
              </div>

              <div className="border-l-4 border-l-indigo-500 pl-4 bg-indigo-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-indigo-800 mb-2">60-Day Goals</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Train 2 new hires completely through certification</p>
                  <p>• Handle all guest complaints independently</p>
                  <p>• Lead team improvement initiative</p>
                  <p>• Complete conflict resolution training</p>
                  <p>• Assist with inventory management weekly</p>
                </div>
              </div>

              <div className="border-l-4 border-l-pink-500 pl-4 bg-pink-50 p-4 rounded-r-lg">
                <h3 className="font-bold text-pink-800 mb-2">90-Day Goals</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Ready for promotion to Shift Leader</p>
                  <p>• Mentor other team members effectively</p>
                  <p>• Lead shifts independently during breaks</p>
                  <p>• Complete leadership assessment</p>
                  <p>• Develop next-level development plan</p>
                </div>
              </div>
            </div>

            {/* Check-ins & Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Check-in Schedule</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Weekly:</strong> 15-minute one-on-ones every Tuesday at 2 PM</p>
                  <p>• <strong>Bi-weekly:</strong> Progress reviews with goal assessment</p>
                  <p>• <strong>Monthly:</strong> Formal evaluation with written feedback</p>
                  <p>• <strong>Daily:</strong> Informal check-ins during shifts for coaching</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Support & Resources</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Access to Pathway modules during slower periods</p>
                  <p>• Pairing with Jessica as mentor</p>
                  <p>• Manager backup for guest complaints initially</p>
                  <p>• Budget approval for leadership book</p>
                  <p>• Flexible scheduling for training sessions</p>
                </div>
              </div>
            </div>

            {/* Team Member Input */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Team Member Input & Refinements</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Alex's Feedback on the Plan:</h4>
                  <p className="text-sm text-gray-600">
                    "I'm excited about the opportunity to grow into leadership! I'm a bit nervous about handling guest complaints, but I appreciate that you'll be nearby initially. I'd like to focus extra time on the conflict resolution training since I've seen some team disagreements that I wasn't sure how to handle. Could we also include some time shadowing during weekend rushes to see how leaders handle high-pressure situations?"
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Plan Refinements Based on Input:</h4>
                  <p className="text-sm text-gray-600">
                    "Based on Alex's feedback, I added extra conflict resolution resources and scheduled shadowing time specifically during weekend rush periods. I also moved the conflict resolution training earlier in the timeline (30-day goals) since this was a priority concern. We agreed to start with smaller guest issues and gradually work up to more complex complaints to build confidence."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => setDevelopmentPlanExamplesDialog(false)}
              className="w-full bg-[#E51636] hover:bg-[#c41230] text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
