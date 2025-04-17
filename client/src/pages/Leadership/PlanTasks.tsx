import React, { useState, useEffect } from 'react'
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
  Loader2,
  ExternalLink,
  FileCheck,
  X
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
import LeadershipLegacyForm from '@/components/leadership/LeadershipLegacyForm'
import ActiveListeningForm from '@/components/leadership/ActiveListeningForm'
import ThinkOthersFirstForm from '@/components/leadership/ThinkOthersFirstForm'
import ExpectBestForm from '@/components/leadership/ExpectBestForm'
import HigherExpectationsForm from '@/components/leadership/HigherExpectationsForm'
import CourageousConversationForm from '@/components/leadership/CourageousConversationForm'
import LeadershipSelfAssessmentForm from '@/components/leadership/LeadershipSelfAssessmentForm'
import ServantLeadershipActionForm from '@/components/leadership/ServantLeadershipActionForm'

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
  const [updatingTasks, setUpdatingTasks] = useState(false)
  const [unenrollDialog, setUnenrollDialog] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)

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
      // Get plan details including title
      try {
        const planResponse = await api.get(`/api/leadership/my-plans/${planId}`)
        if (planResponse.data && planResponse.data.title) {
          setPlanTitle(planResponse.data.title)
        } else {
          setFallbackTitle()
        }
      } catch (error) {
        console.error('Error fetching plan details:', error)
        setFallbackTitle()
      }

      // Get tasks
      const response = await api.get(`/api/leadership/my-plans/${planId}/tasks`)

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

  const updateTasks = async () => {
    try {
      setUpdatingTasks(true)
      await api.post(`/api/leadership/my-plans/${planId}/update-tasks`)
      toast({
        title: 'Tasks Updated',
        description: 'Your tasks have been updated successfully.',
      })
      // Fetch the updated tasks
      await fetchTasks()
    } catch (error) {
      console.error('Error updating tasks:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tasks. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingTasks(false)
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
      'guest-experience-mastery': 'Guest Experience Mastery'
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

    try {
      setUpdatingTask(selectedTask.id)
      await api.patch(`/api/leadership/my-plans/${planId}/tasks/${selectedTask.id}`, {
        completed: true,
        notes: completionNotes,
        evidence: completionEvidence
      })

      // Update local state
      setTasks(tasks.map(task =>
        task.id === selectedTask.id
          ? {
              ...task,
              completed: true,
              completedAt: new Date().toISOString(),
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
        title: 'Task Completed',
        description: 'Great job! You\'ve completed this task.',
      })

      closeCompletionDialog()
    } catch (error) {
      console.error('Error completing task:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingTask(null)
    }
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    // If marking as complete, open the completion dialog
    if (completed) {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        openCompletionDialog(task)
      }
      return
    }

    // If marking as incomplete, proceed as before
    try {
      setUpdatingTask(taskId)
      await api.patch(`/api/leadership/my-plans/${planId}/tasks/${taskId}`, {
        completed: false,
        notes: '',
        evidence: ''
      })

      // Update local state
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: false, completedAt: undefined, notes: '', evidence: '' }
          : task
      ))

      // Fetch updated progress
      const response = await api.get(`/api/leadership/my-plans/${planId}/tasks`)
      setProgress(response.data.progress || 0)
      setStatus(response.data.status || '')

      toast({
        title: 'Task Marked as Incomplete',
        description: 'Task has been marked as incomplete.',
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingTask(null)
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#27251F]">{planTitle}</h1>
          <p className="text-sm sm:text-base text-gray-500">Complete these tasks to progress through your development plan</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/leadership/my-plans')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 sm:h-9"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Plans
        </Button>
      </div>

      <Card className="bg-white p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <h2 className="text-lg font-semibold">Your Progress</h2>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md sm:bg-transparent sm:p-0">
              {status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-medium text-sm sm:text-base">
                {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 sm:h-2" />
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={openUnenrollDialog}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Unenroll from Plan
            </Button>
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
                          className="h-7 w-7 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
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
                          {task.completed ? 'Completed' : 'Tap to complete'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task content - full width on all devices */}
                  <div className="w-full space-y-3 pl-0 sm:pl-10">
                    <p className={`text-gray-600 ${task.completed ? 'text-gray-400' : ''}`}>
                      {task.description}
                    </p>

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
                          <span>{getCompletionTitle(task.type)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{task.evidence}</p>
                      </div>
                    )}

                    {task.notes && task.completed && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                          <PenTool className="h-4 w-4 flex-shrink-0 text-blue-600" />
                          <span>Notes</span>
                        </div>
                        <p className="text-sm text-gray-600">{task.notes}</p>
                      </div>
                    )}

                    {task.resourceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto mt-2 text-blue-600 border-blue-200 hover:bg-blue-50 h-10 sm:h-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(task.resourceUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Resource
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Completion Dialog - Mobile Optimized */}
      <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-base sm:text-lg">
              <div className="flex items-center gap-2">
                {selectedTask && getTaskIcon(selectedTask.type)}
                <span className="line-clamp-2">Complete: {selectedTask?.title}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-2">
              {selectedTask && getCompletionPrompt(selectedTask.type, selectedTask.title)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
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
                    "Servant Leadership in Action"
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
              disabled={!completionEvidence.trim() || updatingTask === selectedTask?.id}
              className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700 h-11 sm:h-10"
            >
              {updatingTask === selectedTask?.id ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
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
    </div>
  )
}
