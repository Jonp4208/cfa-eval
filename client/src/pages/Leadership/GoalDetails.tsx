import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Target,
  Clock,
  BookOpen,
  BrainCircuit,
  Presentation,
  Puzzle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import PageHeader from '@/components/PageHeader'

type Status = 'in-progress' | 'completed' | 'needs-review'
type Timeframe = 'short-term' | 'long-term'
type Priority = 'high' | 'medium' | 'low'
type ActivityType = 'training' | 'assignment' | 'mentoring' | 'development'

interface Activity {
  title: string
  type: ActivityType
  completed: boolean
}

interface FocusArea {
  area: string
  progress: number
}

interface Milestone {
  title: string
  completed: boolean
  dueDate: string
}

interface Comment {
  author: string
  date: string
  text: string
}

interface GoalMetrics {
  teamParticipation: number
  feedbackScore: number
  completionRate: number
}

interface DevelopmentPlan {
  id: number
  title: string
  description: string
  status: Status
  timeframe: Timeframe
  dueDate: string
  progress: number
  assignee: string
  priority: Priority
  focusAreas: FocusArea[]
  activities: Activity[]
  milestones: Milestone[]
  comments: Comment[]
  metrics: GoalMetrics
}

export default function GoalDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [goal, setGoal] = useState<DevelopmentPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGoalDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        // TODO: Replace with actual API call
        const mockGoal: DevelopmentPlan = {
          id: Number(id),
          title: 'Strategic Leadership Development',
          description: 'Develop strategic thinking and decision-making capabilities for senior leadership role',
          status: 'in-progress',
          timeframe: 'long-term',
          dueDate: '2025-12-31',
          progress: 45,
          assignee: 'John Smith',
          priority: 'high',
          focusAreas: [
            { area: 'Strategic Thinking', progress: 60 },
            { area: 'Business Acumen', progress: 45 },
            { area: 'Change Management', progress: 30 }
          ],
          activities: [
            { title: 'Executive Leadership Program', type: 'training', completed: true },
            { title: 'Cross-functional Project Lead', type: 'assignment', completed: false },
            { title: 'Mentorship with VP', type: 'mentoring', completed: true },
            { title: 'Industry Conference Speaking', type: 'development', completed: false }
          ],
          milestones: [
            { title: 'Initial Assessment', completed: true, dueDate: '2024-02-15' },
            { title: 'Development Plan Creation', completed: true, dueDate: '2024-03-01' },
            { title: 'First Quarter Review', completed: false, dueDate: '2024-03-31' },
            { title: 'Mid-year Assessment', completed: false, dueDate: '2024-06-30' }
          ],
          comments: [
            { author: 'Sarah Johnson', date: '2024-02-15', text: 'Initial assessment completed successfully. Strong potential in strategic thinking.' },
            { author: 'Michael Chen', date: '2024-03-01', text: 'Development plan looks comprehensive. Focus areas align well with organizational needs.' }
          ],
          metrics: {
            teamParticipation: 85,
            feedbackScore: 4.2,
            completionRate: 45
          }
        }

        setGoal(mockGoal)
      } catch (error) {
        console.error('Error fetching goal details:', error)
        setError('Failed to load goal details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGoalDetails()
    }
  }, [id])

  const getStatusBadge = (status: Status) => {
    const statusConfig = {
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-600' },
      'completed': { label: 'Completed', className: 'bg-green-100 text-green-600' },
      'needs-review': { label: 'Needs Review', className: 'bg-orange-100 text-orange-600' }
    }
    const config = statusConfig[status]
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: Priority) => {
    const priorityConfig = {
      'high': { className: 'bg-red-100 text-red-600' },
      'medium': { className: 'bg-yellow-100 text-yellow-600' },
      'low': { className: 'bg-green-100 text-green-600' }
    }
    return (
      <Badge className={priorityConfig[priority].className} variant="outline">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getActivityIcon = (type: ActivityType) => {
    const icons = {
      'training': BookOpen,
      'assignment': Puzzle,
      'mentoring': Users,
      'development': BrainCircuit
    }
    const Icon = icons[type]
    return <Icon className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-600">{error}</div>
        <Button onClick={() => navigate('/leadership/goals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-lg font-semibold">Goal not found</div>
        <Button onClick={() => navigate('/leadership/goals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] p-6 md:p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-[#E51636]/10 text-[#E51636] rounded-2xl flex items-center justify-center">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">Development Plan Details</h1>
            <p className="text-[#27251F]/60 mt-1">
              View and manage development plan progress
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/leadership/goals')}
              className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/leadership/goals/${id}/edit`)}
              className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Plan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Add confirmation dialog
                console.log('Delete goal')
              }}
              className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Overview */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#27251F]">{goal.title}</h3>
                    <div className="flex gap-2">
                      {getStatusBadge(goal.status)}
                      {getPriorityBadge(goal.priority)}
                    </div>
                  </div>
                  <p className="text-gray-600">{goal.description}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due {new Date(goal.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {goal.assignee}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              </div>
            </div>
          </Card>

          {/* Focus Areas */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Focus Areas</h3>
              <Badge variant="outline" className="bg-[#E51636]/10 text-[#E51636] font-medium">
                {goal.focusAreas.length} Areas
              </Badge>
            </div>
            <div className="space-y-3">
              {goal.focusAreas.map((area, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{area.area}</span>
                    <span className="font-medium">{area.progress}%</span>
                  </div>
                  <Progress value={area.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>

          {/* Milestones */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Milestones</h3>
              <Badge variant="outline" className="bg-[#E51636]/10 text-[#E51636] font-medium">
                {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} Completed
              </Badge>
            </div>
            <div className="space-y-3">
              {goal.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3">
                  {milestone.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <div className="flex items-center gap-2">
                    <span className={milestone.completed ? 'text-gray-600' : 'text-gray-900'}>
                      {milestone.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      - Due {new Date(milestone.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activities */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Development Activities</h3>
              <Badge variant="outline" className="bg-[#E51636]/10 text-[#E51636] font-medium">
                {goal.activities.filter(a => a.completed).length}/{goal.activities.length} Completed
              </Badge>
            </div>
            <div className="space-y-2">
              {goal.activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {activity.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <span className={activity.completed ? 'text-gray-600' : 'text-gray-900'}>
                      {activity.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Comments & Updates</h3>
              <Badge variant="outline" className="bg-[#E51636]/10 text-[#E51636] font-medium">
                {goal.comments.length} Comments
              </Badge>
            </div>
            <div className="space-y-4">
              {goal.comments.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-8 w-8 bg-[#E51636]/10 text-[#E51636] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#27251F]">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Goal Metrics</h3>
              <Badge variant="outline" className="bg-[#E51636]/10 text-[#E51636] font-medium">
                Overview
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Participation</span>
                  <span className="font-medium">{goal.metrics.teamParticipation}%</span>
                </div>
                <Progress value={goal.metrics.teamParticipation} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Feedback Score</span>
                  <span className="font-medium">{goal.metrics.feedbackScore}/5.0</span>
                </div>
                <Progress value={goal.metrics.feedbackScore * 20} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">{goal.metrics.completionRate}%</span>
                </div>
                <Progress value={goal.metrics.completionRate} className="h-1.5" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 