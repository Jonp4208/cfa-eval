import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  Award,
  TrendingUp,
  Target,
  Star,
  Download,
  Share2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Heart,
  Users,
  MessageSquare,
  Settings,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'
import { format } from 'date-fns'

interface AssessmentResult {
  _id: string
  template: {
    title: string
    description: string
    areas: { name: string; description: string; weight: number }[]
  }
  scores: Record<string, number>
  overallScore: number
  completedAt: string
  developmentAreas: string[]
  strengths: string[]
  recommendations: string[]
  status: string
}

interface DevelopmentPlan {
  id: string
  title: string
  description: string
  icon: any
  skills: Array<{
    area: string
    currentLevel: number
    targetLevel: number
    developmentPlan: {
      actions: string[]
      resources: string[]
      timeline: string
    }
  }>
  activities: Array<{
    title: string
    type: 'training' | 'mentoring' | 'assignment' | 'development'
    description: string
    timeline: string
    status: 'not-started' | 'in-progress' | 'completed'
  }>
}

// Available development plans
const LEADERSHIP_PLANS: DevelopmentPlan[] = [
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
      }
    ],
    activities: [
      {
        title: 'Character Self-Assessment',
        type: 'development',
        description: 'Complete a brief assessment of your leadership character traits and identify one area to improve.',
        timeline: '1 week',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'restaurant-culture-builder',
    title: 'Restaurant Culture Builder',
    description: 'Learn to intentionally shape your restaurant\'s culture to create an environment where team members are engaged, guests receive exceptional service, and business results follow.',
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
            'The Culture Map by Erin Meyer',
            'Visual standards template',
            'Pre-shift meeting checklist'
          ],
          timeline: '3-weeks'
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
      }
    ]
  },
  {
    id: 'team-development',
    title: 'Team Development Expert',
    description: 'Master the skills of coaching, feedback, and talent development to build a high-performing restaurant team.',
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
            'The Coaching Habit by Michael Bungay Stanier',
            'Coaching conversation template',
            'Active listening skills guide'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Coaching Skills Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your current coaching abilities.',
        timeline: '1 week',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'strategic-leadership',
    title: 'Strategic Leadership Mastery',
    description: 'Develop strategic thinking, vision-setting, and decision-making capabilities to drive organizational success.',
    icon: Target,
    skills: [
      {
        area: 'Strategic Thinking',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Analyze industry trends and their impact on your restaurant',
            'Practice the "5 Whys" technique for root cause analysis',
            'Create monthly strategic reviews with your team'
          ],
          resources: [
            'Good Strategy Bad Strategy by Richard Rumelt',
            'Industry analysis template',
            'Strategic review framework'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Strategic Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your strategic leadership capabilities.',
        timeline: '1 week',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'communication-influence',
    title: 'Communication & Influence Excellence',
    description: 'Master the art of clear communication and positive influence to inspire teams and drive results.',
    icon: MessageSquare,
    skills: [
      {
        area: 'Clear Communication',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Practice the "Tell-Show-Check" communication method',
            'Use active listening techniques in all conversations',
            'Provide specific, actionable feedback daily'
          ],
          resources: [
            'Crucial Conversations by Kerry Patterson',
            'Active listening checklist',
            'Communication templates'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Communication Style Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your communication style and its impact.',
        timeline: '1 week',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'operational-excellence',
    title: 'Operational Excellence Leader',
    description: 'Drive efficiency, quality, and continuous improvement in restaurant operations.',
    icon: Settings,
    skills: [
      {
        area: 'Process Improvement',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Map current processes and identify bottlenecks',
            'Implement small improvements weekly',
            'Track and measure process efficiency metrics'
          ],
          resources: [
            'The Lean Startup by Eric Ries',
            'Process mapping template',
            'Efficiency tracking tools'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Process Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your operational processes.',
        timeline: '1 week',
        status: 'not-started'
      }
    ]
  }
]

// Recommendation engine to suggest development plans based on assessment results
const getRecommendedPlan = (result: AssessmentResult): DevelopmentPlan | null => {
  if (!result) return null

  const { scores = {}, developmentAreas = [], overallScore = 0 } = result

  // Priority mapping based on development areas and low scores
  const areaToPlans: Record<string, string[]> = {
    // Core Leadership Areas
    'Decision Making': ['strategic-leadership', 'heart-of-leadership'],
    'Communication': ['communication-influence', 'team-development'],
    'Team Development': ['team-development', 'restaurant-culture-builder'],
    'Team Building': ['team-development', 'restaurant-culture-builder'],
    'Delegation': ['team-development', 'strategic-leadership'],
    'Conflict Resolution': ['communication-influence', 'team-development'],
    'Vision & Direction': ['strategic-leadership', 'heart-of-leadership'],
    'Vision Setting': ['strategic-leadership', 'heart-of-leadership'],

    // Emotional Intelligence Areas
    'Self-Awareness': ['heart-of-leadership', 'communication-influence'],
    'Self-Regulation': ['heart-of-leadership', 'communication-influence'],
    'Empathy': ['heart-of-leadership', 'team-development'],
    'Social Skills': ['communication-influence', 'team-development'],

    // Strategic & Innovation Areas
    'Strategic Planning': ['strategic-leadership', 'operational-excellence'],
    'Innovation': ['strategic-leadership', 'operational-excellence'],
    'Change Management': ['strategic-leadership', 'communication-influence'],
    'Process Improvement': ['operational-excellence', 'strategic-leadership'],
    'Systems Thinking': ['strategic-leadership', 'operational-excellence'],

    // Coaching & Performance Areas
    'Coaching Skills': ['team-development', 'heart-of-leadership'],
    'Performance Management': ['team-development', 'operational-excellence'],
    'Feedback Delivery': ['communication-influence', 'team-development'],
    'Goal Setting': ['team-development', 'strategic-leadership'],

    // Service & Culture Areas
    'Service Standards': ['operational-excellence', 'restaurant-culture-builder'],
    'Customer Recovery': ['communication-influence', 'operational-excellence'],
    'Team Training': ['team-development', 'operational-excellence'],
    'Leading by Example': ['heart-of-leadership', 'restaurant-culture-builder'],
    'Service Culture': ['restaurant-culture-builder', 'heart-of-leadership'],

    // Servant Leadership Areas
    'Empowerment': ['team-development', 'heart-of-leadership'],
    'Service Orientation': ['heart-of-leadership', 'restaurant-culture-builder'],
    'Vision Sharing': ['strategic-leadership', 'communication-influence'],
    'Stewardship': ['heart-of-leadership', 'team-development'],

    // General Areas
    'Coaching': ['team-development', 'heart-of-leadership'],
    'Culture Building': ['restaurant-culture-builder', 'heart-of-leadership'],
    'Strategic Thinking': ['strategic-leadership', 'operational-excellence'],
    'Influence': ['communication-influence', 'heart-of-leadership'],
    'Character': ['heart-of-leadership', 'restaurant-culture-builder'],
    'Emotional Intelligence': ['heart-of-leadership', 'communication-influence']
  }

  // Find the lowest scoring areas
  const lowScoreAreas = Object.entries(scores)
    .filter(([_, score]) => score < 3.5)
    .sort((a, b) => a[1] - b[1])
    .map(([area, _]) => area)

  // Combine development areas and low score areas
  const allDevelopmentAreas = [...new Set([...developmentAreas, ...lowScoreAreas])]

  // Score each plan based on relevance
  const planScores: Record<string, number> = {}

  allDevelopmentAreas.forEach((area, index) => {
    const relevantPlans = areaToPlans[area] || []
    relevantPlans.forEach((planId, planIndex) => {
      if (!planScores[planId]) planScores[planId] = 0
      // Higher weight for primary development areas and higher priority plans
      const weight = (allDevelopmentAreas.length - index) * (relevantPlans.length - planIndex)
      planScores[planId] += weight
    })
  })

  // Special logic based on overall score
  if (overallScore < 2.5) {
    // Very low scores - recommend foundational leadership
    planScores['heart-of-leadership'] = (planScores['heart-of-leadership'] || 0) + 10
  } else if (overallScore < 3.5) {
    // Moderate scores - recommend practical skills
    planScores['team-development'] = (planScores['team-development'] || 0) + 5
    planScores['communication-influence'] = (planScores['communication-influence'] || 0) + 5
  } else if (overallScore >= 4) {
    // High scores - recommend advanced skills
    planScores['strategic-leadership'] = (planScores['strategic-leadership'] || 0) + 5
    planScores['operational-excellence'] = (planScores['operational-excellence'] || 0) + 5
  }

  // Find the highest scoring plan
  const recommendedPlanId = Object.entries(planScores)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  if (!recommendedPlanId) {
    // Default recommendation if no specific match
    return LEADERSHIP_PLANS.find(plan => plan.id === 'heart-of-leadership') || null
  }

  return LEADERSHIP_PLANS.find(plan => plan.id === recommendedPlanId) || null
}

export default function AssessmentResults() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedPlan, setRecommendedPlan] = useState<DevelopmentPlan | null>(null)

  useEffect(() => {
    fetchResults()
  }, [assessmentId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/leadership/assessments/${assessmentId}/results`)
      const assessmentResult = response.data
      setResult(assessmentResult)

      // Get recommended plan based on results
      const recommended = getRecommendedPlan(assessmentResult)
      setRecommendedPlan(recommended)
    } catch (error) {
      console.error('Error fetching results:', error)
      toast({
        title: 'Error',
        description: 'Failed to load assessment results. Please try again.',
        variant: 'destructive'
      })
      navigate('/leadership/assessments')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 3) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (score >= 3) return <TrendingUp className="w-4 h-4 text-blue-600" />
    if (score >= 2) return <Target className="w-4 h-4 text-yellow-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 4.5) return 'Excellent'
    if (score >= 4) return 'Strong'
    if (score >= 3) return 'Good'
    if (score >= 2) return 'Developing'
    return 'Needs Focus'
  }

  if (loading || !result) {
    return (
      <div className="space-y-6 px-4 md:px-6 pb-6">
        <div className="bg-white rounded-[20px] p-6 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/leadership/assessments')}
            className="p-2 hover:bg-[#E51636]/5 hover:text-[#E51636]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">
              Assessment Results
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              {result.template?.title || 'Assessment'} • Completed {format(new Date(result.completedAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#27251F]">Overall Score</h3>
                <p className="text-[#27251F]/60">Your leadership assessment performance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#27251F]">{(result.overallScore || 0).toFixed(1)}/5</div>
              <div className="text-sm text-[#27251F]/60">{getPerformanceLevel(result.overallScore || 0)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={((result.overallScore || 0) / 5) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Area Scores */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-[#27251F]">Area Breakdown</CardTitle>
          <p className="text-[#27251F]/60">Your performance across different leadership areas</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.scores || {}).map(([area, score]) => (
              <div key={area} className={`p-4 rounded-lg border ${getScoreColor(score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score)}
                    <h4 className="font-medium">{area}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{score.toFixed(1)}</span>
                  </div>
                </div>
                <Progress value={(score / 5) * 100} className="h-2" />
                <p className="text-xs mt-2 opacity-80">{getPerformanceLevel(score)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Development Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg text-[#27251F]">Strengths</CardTitle>
            </div>
            <p className="text-[#27251F]/60 text-sm">Areas where you excel</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-2">
              {(result.strengths || []).length > 0 ? (
                (result.strengths || []).map((strength, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">{strength}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#27251F]/60 italic">Complete more assessments to identify strengths</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Development Areas */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg text-[#27251F]">Development Areas</CardTitle>
            </div>
            <p className="text-[#27251F]/60 text-sm">Areas for growth and improvement</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-2">
              {(result.developmentAreas || []).length > 0 ? (
                (result.developmentAreas || []).map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <Target className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm text-orange-800">{area}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#27251F]/60 italic">Great job! No major development areas identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Development Plan */}
      {recommendedPlan && (
        <Card className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-[20px] border border-[#E51636]/20">
          <CardHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#E51636] text-white rounded-xl flex items-center justify-center">
                <recommendedPlan.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#27251F] flex items-center gap-2">
                  Recommended Development Plan
                  <Badge variant="secondary" className="bg-[#E51636] text-white text-xs">
                    Personalized
                  </Badge>
                </CardTitle>
                <p className="text-[#27251F]/70 text-sm mt-1">
                  Based on your assessment results, we recommend this development plan
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {/* Plan Overview */}
              <div className="bg-white rounded-lg p-4 border border-[#E51636]/10">
                <h4 className="font-semibold text-[#27251F] text-lg mb-2">{recommendedPlan.title}</h4>
                <p className="text-[#27251F]/70 text-sm mb-3">{recommendedPlan.description}</p>

                {/* Key Skills Preview */}
                <div className="space-y-2">
                  <h5 className="font-medium text-[#27251F] text-sm">Key Development Areas:</h5>
                  <div className="flex flex-wrap gap-2">
                    {recommendedPlan.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-[#E51636]/30 text-[#E51636]">
                        {skill.area}
                      </Badge>
                    ))}
                    {recommendedPlan.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs border-[#E51636]/30 text-[#E51636]">
                        +{recommendedPlan.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[#E51636]">{recommendedPlan.skills.length}</div>
                    <div className="text-xs text-[#27251F]/60">Skill Areas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[#E51636]">{recommendedPlan.activities.length}</div>
                    <div className="text-xs text-[#27251F]/60">Activities</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(`/leadership/developmental-plan?recommended=${recommendedPlan.id}`)}
                  className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12 text-sm font-semibold"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start This Development Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/leadership/developmental-plan')}
                  className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10 h-12 text-sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Browse All Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {(result.recommendations || []).length > 0 && (
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg text-[#27251F]">Recommendations</CardTitle>
            </div>
            <p className="text-[#27251F]/60 text-sm">Personalized suggestions for your development</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {(result.recommendations || []).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/leadership/assessments')}
              className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
            {recommendedPlan ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/leadership/developmental-plan?recommended=${recommendedPlan.id}`)}
                className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Recommended Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/leadership/developmental-plan')}
                className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <Target className="w-4 h-4 mr-2" />
                Browse Development Plans
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
