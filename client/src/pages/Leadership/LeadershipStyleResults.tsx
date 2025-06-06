import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  Target,
  Users,
  TrendingUp,
  BookOpen,
  Star,
  Award,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Share2,
  Download
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'
import { format } from 'date-fns'

interface LeadershipStyleResult {
  _id: string
  template: {
    title: string
    description: string
  }
  scores: Record<string, number>
  overallScore: number
  completedAt: string
  primaryStyle: string
  secondaryStyle: string
  styleProfile: {
    dominant: number
    influential: number
    steady: number
    conscientious: number
    situationalAdaptation: number
    teamDynamicsUnderstanding: number
  }
  strengths: string[]
  developmentAreas: string[]
  recommendations: string[]
  adaptationStrategies: {
    leadingDominant: string[]
    leadingInfluential: string[]
    leadingSteady: string[]
    leadingConscientious: string[]
  }
}

const STYLE_COLORS = {
  'Dominant Leadership': 'bg-red-50 text-red-700 border-red-200',
  'Influential Leadership': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Steady Leadership': 'bg-green-50 text-green-700 border-green-200',
  'Conscientious Leadership': 'bg-blue-50 text-blue-700 border-blue-200'
}

const STYLE_DESCRIPTIONS = {
  'Dominant Leadership': 'Results-focused, direct, and decisive. You drive for achievement and take charge in challenging situations.',
  'Influential Leadership': 'People-focused, enthusiastic, and inspiring. You motivate through relationships and positive energy.',
  'Steady Leadership': 'Supportive, patient, and team-oriented. You create stability and foster collaboration.',
  'Conscientious Leadership': 'Process-focused, analytical, and quality-driven. You ensure accuracy and systematic approaches.'
}

export default function LeadershipStyleResults() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [result, setResult] = useState<LeadershipStyleResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [assessmentId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/leadership/assessments/${assessmentId}/results`)
      const assessmentResult = response.data
      
      // Process the results to determine leadership style
      const processedResult = processLeadershipStyleResults(assessmentResult)
      setResult(processedResult)
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

  const processLeadershipStyleResults = (rawResult: any): LeadershipStyleResult => {
    const scores = rawResult.scores || {}
    
    // Calculate style scores
    const styleProfile = {
      dominant: scores['Dominant Leadership'] || 0,
      influential: scores['Influential Leadership'] || 0,
      steady: scores['Steady Leadership'] || 0,
      conscientious: scores['Conscientious Leadership'] || 0,
      situationalAdaptation: scores['Situational Adaptation'] || 0,
      teamDynamicsUnderstanding: scores['Team Dynamics Understanding'] || 0
    }

    // Determine primary and secondary styles
    const styleScores = [
      { style: 'Dominant Leadership', score: styleProfile.dominant },
      { style: 'Influential Leadership', score: styleProfile.influential },
      { style: 'Steady Leadership', score: styleProfile.steady },
      { style: 'Conscientious Leadership', score: styleProfile.conscientious }
    ].sort((a, b) => b.score - a.score)

    const primaryStyle = styleScores[0].style
    const secondaryStyle = styleScores[1].style

    // Generate adaptation strategies
    const adaptationStrategies = {
      leadingDominant: [
        'Be direct and results-focused in communication',
        'Provide clear expectations and deadlines',
        'Give them autonomy to achieve goals their way',
        'Focus on bottom-line impact and efficiency'
      ],
      leadingInfluential: [
        'Use enthusiastic and positive communication',
        'Provide recognition and public acknowledgment',
        'Allow time for relationship building and discussion',
        'Focus on the people impact of decisions'
      ],
      leadingSteady: [
        'Provide stability and consistent support',
        'Allow time for processing changes',
        'Focus on team harmony and collaboration',
        'Give personal attention and encouragement'
      ],
      leadingConscientious: [
        'Provide detailed information and data',
        'Allow time for thorough analysis',
        'Focus on quality and accuracy standards',
        'Respect their need for systematic approaches'
      ]
    }

    return {
      ...rawResult,
      primaryStyle,
      secondaryStyle,
      styleProfile,
      adaptationStrategies
    }
  }

  const getStyleColor = (style: string) => {
    return STYLE_COLORS[style as keyof typeof STYLE_COLORS] || 'bg-gray-50 text-gray-700 border-gray-200'
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
              Leadership Style Results
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

      {/* Primary & Secondary Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Style */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#27251F]">Primary Leadership Style</CardTitle>
                <p className="text-[#27251F]/60 text-sm">Your dominant approach</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={`p-4 rounded-lg border ${getStyleColor(result.primaryStyle)}`}>
              <h3 className="font-semibold text-lg mb-2">{result.primaryStyle}</h3>
              <p className="text-sm mb-3">{STYLE_DESCRIPTIONS[result.primaryStyle as keyof typeof STYLE_DESCRIPTIONS]}</p>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{result.styleProfile[result.primaryStyle.toLowerCase().replace(' leadership', '') as keyof typeof result.styleProfile]?.toFixed(1)}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Style */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#27251F]">Secondary Leadership Style</CardTitle>
                <p className="text-[#27251F]/60 text-sm">Your supporting approach</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={`p-4 rounded-lg border ${getStyleColor(result.secondaryStyle)}`}>
              <h3 className="font-semibold text-lg mb-2">{result.secondaryStyle}</h3>
              <p className="text-sm mb-3">{STYLE_DESCRIPTIONS[result.secondaryStyle as keyof typeof STYLE_DESCRIPTIONS]}</p>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{result.styleProfile[result.secondaryStyle.toLowerCase().replace(' leadership', '') as keyof typeof result.styleProfile]?.toFixed(1)}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Style Profile Chart */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-[#27251F]">Complete Style Profile</CardTitle>
          <p className="text-[#27251F]/60">Your scores across all leadership styles</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {Object.entries(result.styleProfile).map(([style, score]) => {
              const styleName = style.charAt(0).toUpperCase() + style.slice(1).replace(/([A-Z])/g, ' $1')
              const isMainStyle = styleName.includes('Leadership')

              if (!isMainStyle) return null

              return (
                <div key={style} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#27251F]">{styleName}</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(score)}
                      <span className="font-semibold">{score.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <Progress value={(score / 5) * 100} className="h-3" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Adaptation Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg text-[#27251F]">Situational Adaptation</CardTitle>
            </div>
            <p className="text-[#27251F]/60 text-sm">Your ability to adapt leadership style</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={`p-4 rounded-lg border ${getScoreColor(result.styleProfile.situationalAdaptation)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Adaptation Score</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{result.styleProfile.situationalAdaptation.toFixed(1)}/5</span>
                </div>
              </div>
              <Progress value={(result.styleProfile.situationalAdaptation / 5) * 100} className="h-2 mb-2" />
              <p className="text-xs opacity-80">
                {result.styleProfile.situationalAdaptation >= 4 ? 'Excellent adaptability' :
                 result.styleProfile.situationalAdaptation >= 3 ? 'Good adaptability' :
                 result.styleProfile.situationalAdaptation >= 2 ? 'Developing adaptability' : 'Needs focus on adaptability'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg text-[#27251F]">Team Dynamics</CardTitle>
            </div>
            <p className="text-[#27251F]/60 text-sm">Understanding different personality types</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={`p-4 rounded-lg border ${getScoreColor(result.styleProfile.teamDynamicsUnderstanding)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Understanding Score</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{result.styleProfile.teamDynamicsUnderstanding.toFixed(1)}/5</span>
                </div>
              </div>
              <Progress value={(result.styleProfile.teamDynamicsUnderstanding / 5) * 100} className="h-2 mb-2" />
              <p className="text-xs opacity-80">
                {result.styleProfile.teamDynamicsUnderstanding >= 4 ? 'Expert understanding' :
                 result.styleProfile.teamDynamicsUnderstanding >= 3 ? 'Good understanding' :
                 result.styleProfile.teamDynamicsUnderstanding >= 2 ? 'Basic understanding' : 'Needs development'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adaptation Strategies */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-[#27251F]">Leadership Adaptation Strategies</CardTitle>
          <p className="text-[#27251F]/60">How to effectively lead different personality types</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(result.adaptationStrategies).map(([type, strategies]) => {
              const typeName = type.replace('leading', 'Leading ').replace(/([A-Z])/g, ' $1').trim()
              const styleColor = getStyleColor(typeName.replace('Leading ', '') + ' Leadership')

              return (
                <div key={type} className={`p-4 rounded-lg border ${styleColor}`}>
                  <h4 className="font-semibold mb-3">{typeName} Team Members</h4>
                  <ul className="space-y-2">
                    {strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-60" />
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Development Plan */}
      <Card className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-[20px] border border-[#E51636]/20">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#E51636] text-white rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#27251F] flex items-center gap-2">
                Recommended Development Plan
                <Badge variant="secondary" className="bg-[#E51636] text-white text-xs">
                  Personalized
                </Badge>
              </CardTitle>
              <p className="text-[#27251F]/70 text-sm mt-1">
                Based on your leadership style assessment results
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-[#E51636]/10">
              <h4 className="font-semibold text-[#27251F] text-lg mb-2">Situational Leadership Mastery</h4>
              <p className="text-[#27251F]/70 text-sm mb-3">
                Perfect for your leadership style profile. Learn to adapt your natural {result.primaryStyle.toLowerCase()} approach
                to different situations and team members for maximum effectiveness.
              </p>

              <div className="space-y-2 mb-4">
                <h5 className="font-medium text-[#27251F] text-sm">Key Development Areas:</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs border-[#E51636]/30 text-[#E51636]">
                    Situational Assessment
                  </Badge>
                  <Badge variant="outline" className="text-xs border-[#E51636]/30 text-[#E51636]">
                    Style Flexibility
                  </Badge>
                  <Badge variant="outline" className="text-xs border-[#E51636]/30 text-[#E51636]">
                    Communication Adaptation
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-[#E51636]">4</div>
                  <div className="text-xs text-[#27251F]/60">Skill Areas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-[#E51636]">12</div>
                  <div className="text-xs text-[#27251F]/60">Week Program</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/leadership/developmental-plan?recommended=situational-leadership')}
                className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12 text-sm font-semibold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Situational Leadership Plan
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

      {/* Actions */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/leadership/assessments')}
              className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/leadership/developmental-plan?recommended=situational-leadership')}
              className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <Target className="w-4 h-4 mr-2" />
              Start Development Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
