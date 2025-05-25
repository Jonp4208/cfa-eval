import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Users,
  BookOpen,
  BrainCircuit,
  Puzzle,
  Heart,
  Lock,
  CheckCircle,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/axios'

interface SkillAssessment {
  area: string
  currentLevel: number
  targetLevel: number
  developmentPlan: {
    actions: string[]
    resources: string[]
    timeline: string
  }
}

interface DevelopmentActivity {
  title: string
  type: 'training' | 'mentoring' | 'assignment' | 'development'
  description: string
  timeline: string
  status: 'not-started' | 'in-progress' | 'completed'
}

const LEADERSHIP_PLANS = [
  {
    id: 'heart-of-leadership',
    title: 'The Heart of Leadership',
    description: 'Build a foundation of character-based leadership focused on serving others first. This plan develops the essential leadership traits that inspire team members to follow you because of who you are, not just your position.',
    icon: Heart,
    skills: [
      {
        area: 'Lead with Character',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Start each shift by helping a team member with their tasks',
            'Practice active listening during team conversations',
            'Acknowledge mistakes openly and take responsibility'
          ],
          resources: [
            'The Heart of Leadership by Mark Miller',
            '5-minute daily reflection journal'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Put Others First',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Hold weekly one-on-ones with team members',
            'Recognize team member contributions publicly',
            'Ask "How can I help you succeed today?" daily'
          ],
          resources: [
            'One-on-one meeting template',
            'Team recognition ideas'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Character Self-Assessment',
        type: 'development',
        description: 'Complete a brief assessment of your leadership character traits and identify one area to improve.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Team Feedback Session',
        type: 'development',
        description: 'Ask your team for honest feedback on how you can better serve them as a leader.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'restaurant-culture-builder',
    title: 'Restaurant Culture Builder',
    description: 'Learn to intentionally shape your restaurant\'s culture to create an environment where team members are engaged, guests receive exceptional service, and business results follow. This plan provides practical tools for building a thriving culture.',
    icon: Users,
    skills: [
      {
        area: 'Set Clear Expectations',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Create simple, visual standards for each station',
            'Conduct daily pre-shift meetings with clear goals',
            'Provide immediate, specific feedback'
          ],
          resources: [
            'Visual standards template',
            'Pre-shift meeting guide'
          ],
          timeline: '2-weeks'
        }
      },
      {
        area: 'Build Team Unity',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Implement team huddles during shifts',
            'Create cross-training opportunities',
            'Celebrate team wins consistently'
          ],
          resources: [
            'Team huddle format',
            'Cross-training schedule template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Culture Assessment',
        type: 'development',
        description: 'Survey your team to identify cultural strengths and opportunities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Team Values Workshop',
        type: 'training',
        description: 'Lead a brief session to define your team\'s core values and behaviors.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'team-development',
    title: 'Team Development Expert',
    description: 'Master the skills of coaching, feedback, and talent development to build a high-performing restaurant team. This plan equips you with practical tools to help each team member reach their full potential while driving operational excellence.',
    icon: Users,
    skills: [
      {
        area: 'Effective Coaching',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Use the "Tell-Show-Do-Review" method for skill training',
            'Provide specific, behavior-focused feedback',
            'Ask powerful questions that promote self-discovery'
          ],
          resources: [
            'Coaching conversation guide',
            'Feedback formula template'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Talent Development',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify high-potential team members',
            'Create personalized development plans',
            'Provide stretch assignments for growth'
          ],
          resources: [
            'Potential assessment guide',
            'Development plan template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Coaching Practice',
        type: 'development',
        description: 'Practice coaching conversations with a peer or mentor for feedback.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Team Member Development Plan',
        type: 'assignment',
        description: 'Create a development plan for one high-potential team member.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
  }
];

interface PlanStatus {
  enrolled: boolean
  status: string | null
  progress: number
  enrolledAt: string | null
  completedAt: string | null
}

interface Plan {
  id: string
  title: string
  description: string
  isFree: boolean
  enrolled?: boolean
  status?: string | null
  progress?: number
  enrolledAt?: string | null
  completedAt?: string | null
}

export default function DevelopmentalPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasActiveSubscription } = useSubscription()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [planStatuses, setPlanStatuses] = useState<Record<string, PlanStatus>>({})

  // Get planId from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const planId = queryParams.get('planId')
    if (planId) {
      setSelectedPlan(planId)
    }
  }, [location.search])

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leadership/plans')
      const data = response.data

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data)
        toast({
          title: 'Data Format Error',
          description: 'Received unexpected data format from server. Attempting to recover...',
          variant: 'destructive'
        })

        // Try to recover by using the hardcoded plans with no enrollment status
        const fallbackPlans = LEADERSHIP_PLANS.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          isFree: plan.id === 'heart-of-leadership',
          enrolled: false,
          status: null,
          progress: 0
        }))

        // Use the fallback plans
        console.log('Using fallback plans:', fallbackPlans)
        return processPlanData(fallbackPlans)
      }

      // Process the plan data
      processPlanData(data)
    } catch (error: any) {
      console.error('Error fetching plans:', error)

      // Check if the error response contains a plans array
      if (error.response?.data?.plans && Array.isArray(error.response.data.plans)) {
        console.log('Using fallback plans from error response')
        processPlanData(error.response.data.plans)
      } else {
        // Use hardcoded plans as a last resort
        console.log('Using hardcoded plans as fallback')
        const fallbackPlans = LEADERSHIP_PLANS.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          isFree: plan.id === 'heart-of-leadership',
          enrolled: false,
          status: null,
          progress: 0
        }))
        processPlanData(fallbackPlans)
      }

      toast({
        title: 'Error',
        description: 'Failed to load plans. Using fallback data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (planId: string) => {
    try {
      setEnrolling(planId)
      const response = await api.post(`/api/leadership/plans/${planId}/enroll`)

      // Update local state
      setPlanStatuses(prev => ({
        ...prev,
        [planId]: {
          enrolled: true,
          status: 'enrolled',
          progress: 0,
          enrolledAt: new Date().toISOString(),
          completedAt: null
        }
      }))

      toast({
        title: 'Enrolled Successfully',
        description: 'You have been enrolled in the development plan.',
      })

      // Navigate to the tasks page after successful enrollment
      navigate(`/leadership/plans/${planId}/tasks`)
    } catch (error: any) {
      console.error('Error enrolling in plan:', error)
      toast({
        title: 'Enrollment Failed',
        description: error.response?.data?.message || 'Failed to enroll in plan. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(null)
    }
  }

  const handlePlanSelection = (planId: string) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null)
    } else {
      setSelectedPlan(planId)
    }
  }

  // Function to process plan data and update state
  const processPlanData = (plans: Plan[]) => {
    try {
      // Create a map of plan statuses
      const statusMap: Record<string, PlanStatus> = {}

      // Safely process each plan
      plans.forEach((plan: Plan) => {
        if (plan && plan.id) {
          statusMap[plan.id] = {
            enrolled: plan.enrolled || false,
            status: plan.status || null,
            progress: plan.progress || 0,
            enrolledAt: plan.enrolledAt || null,
            completedAt: plan.completedAt || null
          }
        }
      })

      setPlanStatuses(statusMap)

      // Log success for debugging
      console.log('Successfully loaded plans:', Object.keys(statusMap).length)
      return statusMap
    } catch (error) {
      console.error('Error processing plan data:', error)
      return {}
    }
  }

  // Debug function to check API response directly
  const debugApiResponse = async () => {
    try {
      // First check the debug endpoint
      const debugResponse = await api.get('/api/leadership/debug-store-id')
      console.log('Debug API Response:', debugResponse.data)

      // Then check the plans endpoint directly
      const plansResponse = await api.get('/api/leadership/plans')
      console.log('Plans API Response:', plansResponse.data)
      console.log('Plans API Response type:', typeof plansResponse.data)
      console.log('Is array?', Array.isArray(plansResponse.data))

      toast({
        title: 'Debug Info',
        description: 'Check console for debug information',
      })

      // Try to refresh plans
      fetchPlans()
    } catch (error) {
      console.error('Debug API error:', error)
      toast({
        title: 'Debug Error',
        description: 'Failed to get debug info. Check console.',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-[#E51636] animate-spin" />
        </div>
      ) : (

      <div className="space-y-6">
        {LEADERSHIP_PLANS.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          const planStatus = planStatuses[plan.id] || { enrolled: false, status: null, progress: 0 }
          const isEnrolled = planStatus.enrolled
          const isPlanCompleted = planStatus.status === 'completed'

          return (
            <div key={plan.id} className="space-y-4">
              <Card
                className="bg-white p-6 hover:shadow-xl transition-all duration-300 relative cursor-pointer border-l-4 border-l-transparent hover:border-l-[#E51636]"
                onClick={() => planStatuses[plan.id]?.enrolled ? navigate(`/leadership/plans/${plan.id}/tasks`) : null}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/20 text-[#E51636] rounded-xl flex items-center justify-center shadow-sm">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-[#27251F]">{plan.title}</h3>
                          {plan.id === 'heart-of-leadership' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              🆓 Free Access
                            </Badge>
                          )}
                          {isEnrolled && (
                            <Badge variant="outline" className={`text-xs ${
                              isPlanCompleted
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {isPlanCompleted ? '✅ Completed' : '📚 Enrolled'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {plan.skills.length} skills
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {plan.activities.length} activities
                          </span>
                        </div>
                      </div>
                    </div>
                    {isEnrolled && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#E51636]">{planStatus.progress}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{plan.description}</p>

                  {isEnrolled && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className="text-sm font-bold text-[#E51636]">{planStatus.progress}%</span>
                        </div>
                        <Progress value={planStatus.progress} className="h-3 bg-gray-200" />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>📅 Enrolled: {formatDate(planStatus.enrolledAt)}</span>
                          {planStatus.completedAt && (
                            <span>🎉 Completed: {formatDate(planStatus.completedAt)}</span>
                          )}
                        </div>
                      </div>

                      {/* Skills Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plan.skills.slice(0, 2).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-800">{skill.area}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < skill.currentLevel ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-500">{plan.skills.length} Core Skills</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {isEnrolled ? (
                        <Button
                          variant="default"
                          className="w-full sm:w-auto bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leadership/plans/${plan.id}/tasks`);
                          }}
                        >
                          {isPlanCompleted ? '🎉 Review Plan' : '📚 Continue Learning'}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full sm:w-auto bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleEnroll(plan.id);
                          }}
                          disabled={
                            (plan.id !== 'heart-of-leadership' && !hasActiveSubscription) ||
                            enrolling === plan.id
                          }
                        >
                          {enrolling === plan.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            '🚀 Enroll Now'
                          )}
                          {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && (
                            <Lock className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handlePlanSelection(plan.id);
                        }}
                        disabled={plan.id !== 'heart-of-leadership' && !hasActiveSubscription && !isEnrolled}
                      >
                        <span className="mr-2">{isSelected ? 'Close Details' : 'View Details'}</span>
                        {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && !isEnrolled && (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {isSelected && (
                <div className="space-y-6 pl-4 border-l-2 border-[#E51636]">
                  <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-50">
                    <div className="space-y-6">
                      {/* Core Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Core Skills to Develop</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {plan.skills.map((skill, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-[#27251F]">{skill.area}</h4>
                                <span className="text-sm text-[#E51636]">Target Level: {skill.targetLevel}/5</span>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Development Actions:</h5>
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {skill.developmentPlan.actions.map((action, i) => (
                                      <li key={i} className="text-sm text-gray-600">{action}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Resources:</h5>
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {skill.developmentPlan.resources.map((resource, i) => (
                                      <li key={i} className="text-sm text-gray-600">{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-700">Timeline:</span>
                                  <span className="text-xs text-gray-600">{skill.developmentPlan.timeline}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Development Activities */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Development Activities</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {plan.activities.map((activity, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-6 w-6 bg-[#E51636]/10 text-[#E51636] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                  {activity.type === 'training' && <BookOpen className="h-4 w-4" />}
                                  {activity.type === 'mentoring' && <Users className="h-4 w-4" />}
                                  {activity.type === 'assignment' && <Puzzle className="h-4 w-4" />}
                                  {activity.type === 'development' && <BrainCircuit className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#27251F]">{activity.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-500">Timeline: {activity.timeline}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                      {activity.status === 'not-started' && 'Not Started'}
                                      {activity.status === 'in-progress' && 'In Progress'}
                                      {activity.status === 'completed' && 'Completed'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
