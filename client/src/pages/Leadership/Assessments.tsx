import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  Brain,
  Target,
  Users,
  Heart,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
  Star,
  BookOpen,
  Zap,
  RefreshCw
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import api from '@/lib/axios'
import { format, formatDistanceToNow } from 'date-fns'

interface AssessmentTemplate {
  _id: string
  title: string
  description: string
  type: 'self_assessment' | '360_feedback' | 'skill_assessment' | 'character_assessment' | 'team_assessment'
  category: 'leadership' | 'character' | 'skills' | 'team' | 'communication' | 'strategy' | 'customer_service'
  timeEstimate: number
  areas: {
    name: string
    description: string
    weight: number
  }[]
  questions: any[]
  isActive: boolean
  createdAt: string
}

interface AssessmentResponse {
  _id: string
  template: AssessmentTemplate
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed'
  scores: Record<string, number>
  overallScore: number
  startedAt?: string
  completedAt?: string
  developmentAreas: string[]
  strengths: string[]
  recommendations: string[]
}

interface DashboardStats {
  totalAssessments: number
  completedAssessments: number
  averageScore: number
  recentActivity: AssessmentResponse[]
  upcomingAssessments: AssessmentTemplate[]
}

export default function Assessments() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [responses, setResponses] = useState<AssessmentResponse[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    recentActivity: [],
    upcomingAssessments: []
  })

  // Fetch assessment data
  const fetchAssessmentData = async () => {
    try {
      setLoading(true)

      // Test authentication first
      console.log('Testing authentication...')
      try {
        const authTest = await api.get('/api/auth/profile')
        console.log('Auth test successful:', authTest.status)
      } catch (authError: any) {
        console.error('Auth test failed:', authError.response?.status, authError.message)
        if (authError.response?.status === 401) {
          throw new Error('Authentication failed - please log in again')
        }
      }

      // Fetch templates and responses in parallel
      console.log('Fetching assessment data...')
      const [templatesRes, responsesRes] = await Promise.all([
        api.get('/api/leadership/assessment-templates'),
        api.get('/api/leadership/assessments')
      ])

      console.log('Templates response:', templatesRes)
      console.log('Responses response:', responsesRes)

      // Check if we got HTML instead of JSON (indicates auth/routing issue)
      if (typeof templatesRes.data === 'string' && templatesRes.data.includes('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON for templates - possible auth or routing issue')
        throw new Error('Authentication or routing issue - received HTML instead of JSON')
      }

      // Ensure we have arrays
      const templatesData = Array.isArray(templatesRes.data) ? templatesRes.data : []
      const responsesData = Array.isArray(responsesRes.data) ? responsesRes.data : []

      console.log('Templates received:', templatesData.length)
      console.log('Responses received:', responsesData.length)

      setTemplates(templatesData)
      setResponses(responsesData)

      // Calculate stats
      const completedResponses = responsesData.filter((r: AssessmentResponse) => r.status === 'completed')
      const averageScore = completedResponses.length > 0
        ? completedResponses.reduce((sum: number, r: AssessmentResponse) => sum + (r.overallScore || 0), 0) / completedResponses.length
        : 0

      setStats({
        totalAssessments: responsesData.length,
        completedAssessments: completedResponses.length,
        averageScore: Math.round(averageScore * 100) / 100,
        recentActivity: completedResponses.slice(0, 3),
        upcomingAssessments: templatesData.filter((t: AssessmentTemplate) =>
          !responsesData.some((r: AssessmentResponse) => r.template && r.template._id === t._id)
        ).slice(0, 3)
      })

    } catch (error: any) {
      console.error('Error fetching assessment data:', error)

      // Set empty arrays on error
      setTemplates([])
      setResponses([])
      setStats({
        totalAssessments: 0,
        completedAssessments: 0,
        averageScore: 0,
        recentActivity: [],
        upcomingAssessments: []
      })

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.error('Authentication error - token may be expired')
        toast({
          title: 'Authentication Error',
          description: 'Your session may have expired. Please refresh the page and try again.',
          variant: 'destructive'
        })
      } else if (error.message?.includes('HTML instead of JSON')) {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to the assessment service. Please refresh the page.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assessment data. Please try again.',
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssessmentData()
  }, [])

  // Start a new assessment
  const startAssessment = async (templateId: string) => {
    try {
      const response = await api.post(`/api/leadership/assessments/${templateId}/start`)
      const assessment = response.data

      toast({
        title: 'Assessment Started',
        description: 'You can now begin taking the assessment.',
      })

      navigate(`/leadership/assessments/${assessment._id}/take`)
    } catch (error) {
      console.error('Error starting assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to start assessment. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character_assessment':
        return <Heart className="w-4 h-4" />
      case 'self_assessment':
      case 'skill_assessment':
        return <Brain className="w-4 h-4" />
      case 'team_assessment':
        return <Users className="w-4 h-4" />
      case '360_feedback':
        return <Target className="w-4 h-4" />
      default:
        return <ClipboardList className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'character':
        return 'bg-red-50 text-[#E51636] border-red-100'
      case 'leadership':
        return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'customer_service':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100'
      case 'skills':
        return 'bg-green-50 text-green-600 border-green-100'
      case 'team':
        return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'communication':
        return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'strategy':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'reviewed':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'reviewed':
        return <Award className="w-4 h-4 text-purple-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 md:px-6 pb-6">
        {/* Dashboard Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white rounded-[20px]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white rounded-[20px]">
              <CardHeader className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Hero Section */}
      <div className="bg-white rounded-[24px] p-8 md:p-12 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#27251F]">
              Assessment Center
            </h1>
            <p className="text-lg md:text-xl text-[#27251F]/70 mb-6">
              Discover your leadership style, identify growth opportunities, and get personalized recommendations to become the leader your team needs.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 border border-blue-100">
                <Brain className="w-4 h-4" />
                <span>Self-Assessment</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-600 rounded-full px-4 py-2 border border-green-100">
                <Target className="w-4 h-4" />
                <span>Personalized Results</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 text-purple-600 rounded-full px-4 py-2 border border-purple-100">
                <TrendingUp className="w-4 h-4" />
                <span>Development Plans</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-blue-50 rounded-full blur-xl opacity-50"></div>
        <div className="absolute bottom-4 right-12 w-24 h-24 bg-purple-50 rounded-full blur-lg opacity-30"></div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Assessments */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assessments</p>
                <div className="text-2xl font-bold text-[#27251F]">{stats.totalAssessments}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <div className="text-2xl font-bold text-[#27251F]">{stats.completedAssessments}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <div className="text-2xl font-bold text-[#27251F]">{stats.averageScore.toFixed(1)}/5</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <div className="text-2xl font-bold text-[#27251F]">
                  {stats.totalAssessments > 0 ? Math.round((stats.completedAssessments / stats.totalAssessments) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Assessments */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#27251F]">Choose Your Assessment</h2>
          <p className="text-[#27251F]/60 mt-1">
            Select an assessment to discover your leadership strengths and development opportunities
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assessment Info
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Professional Leadership Assessments</DialogTitle>
              <DialogDescription>
                Our assessments are professionally designed based on proven leadership frameworks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Available Assessments</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span><strong>Leadership Style:</strong> Decision Making, Communication, Team Development, Conflict Resolution, Vision</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span><strong>Customer Service Leadership:</strong> Service Standards, Recovery, Training, Leading by Example, Culture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span><strong>Servant Leadership:</strong> Empowerment, Service, Vision, Stewardship</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">How It Works</h4>
                <ol className="space-y-1 text-sm text-green-800">
                  <li>1. Choose an assessment below</li>
                  <li>2. Answer 15-18 questions honestly (20-25 minutes)</li>
                  <li>3. Get detailed results with personalized recommendations</li>
                  <li>4. Create your leadership development action plan</li>
                </ol>
              </div>
              <div className="p-4 bg-[#E51636]/10 rounded-lg border border-[#E51636]/20">
                <h4 className="font-medium text-[#E51636] mb-2">What You'll Get</h4>
                <ul className="space-y-1 text-sm text-[#E51636]/80">
                  <li>• Leadership style identification</li>
                  <li>• Specific development recommendations</li>
                  <li>• Actionable improvement strategies</li>
                  <li>• Progress tracking over time</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(templates) && templates.length > 0 ? templates.map(template => {
              const existingResponse = Array.isArray(responses) ? responses.find(r => r.template && r.template._id === template._id) : null

              return (
                <Card key={template._id} className="bg-white rounded-[20px] border border-gray-100 hover:shadow-xl hover:border-[#E51636]/20 transition-all duration-300 group">
                  <CardHeader className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${getCategoryColor(template.category)} group-hover:scale-110 transition-transform duration-300`}>
                        {getTypeIcon(template.type)}
                      </div>
                      {existingResponse && (
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(existingResponse.status)} text-white text-xs px-3 py-1 rounded-full`}
                        >
                          {existingResponse.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-[#27251F] leading-tight mb-2 group-hover:text-[#E51636] transition-colors">
                        {template.title}
                      </CardTitle>
                      <Badge variant="secondary" className={`text-xs ${getCategoryColor(template.category)} border mb-3`}>
                        {template.category.replace('_', ' ')}
                      </Badge>
                      <CardDescription className="text-sm text-[#27251F]/70 line-clamp-3 leading-relaxed">
                        {template.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      {/* Assessment Info */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-[#27251F]/70">
                          <Clock className="w-4 h-4" />
                          <span>{template.timeEstimate} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#27251F]/70">
                          <BookOpen className="w-4 h-4" />
                          <span>{template.questions.length} questions</span>
                        </div>
                      </div>

                      {/* Score Display */}
                      {existingResponse?.overallScore && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Your Score</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= existingResponse.overallScore ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold text-green-800">{existingResponse.overallScore.toFixed(1)}/5</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className={`w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300 ${
                          existingResponse?.status === 'completed'
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                            : existingResponse?.status === 'in_progress'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-[#E51636] hover:bg-[#B91C3C] text-white shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                        onClick={() => {
                          if (existingResponse) {
                            if (existingResponse.status === 'completed') {
                              navigate(`/leadership/assessments/${existingResponse._id}/results`)
                            } else {
                              navigate(`/leadership/assessments/${existingResponse._id}/take`)
                            }
                          } else {
                            startAssessment(template._id)
                          }
                        }}
                      >
                        {existingResponse ? (
                          existingResponse.status === 'completed' ? (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              View Results & Recommendations
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Continue Assessment
                            </>
                          )
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Start Assessment
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-[#27251F] mb-2">No Assessments Available</h3>
                <p className="text-[#27251F]/60 mb-4">Assessment templates are being loaded or none are available yet.</p>
                <Button
                  variant="outline"
                  onClick={fetchAssessmentData}
                  className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
      </div>

      {/* Recent Activity */}
      {Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 && (
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-[#27251F]">Recent Activity</CardTitle>
            <CardDescription className="text-[#27251F]/60">
              Your latest assessment completions and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {stats.recentActivity.map(activity => (
                <div
                  key={activity._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/leadership/assessments/${activity._id}/results`)}
                >
                  <div className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#27251F]">{activity.template?.title || 'Assessment'}</p>
                    <p className="text-xs text-[#27251F]/60">
                      Completed {activity.completedAt ? formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true }) : 'recently'}
                      {activity.overallScore && ` • Score: ${activity.overallScore.toFixed(1)}/5`}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#27251F]/40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

}