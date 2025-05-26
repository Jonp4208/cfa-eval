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
  Lightbulb
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

export default function AssessmentResults() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [assessmentId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/leadership/assessments/${assessmentId}/results`)
      setResult(response.data)
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
              {result.template.title} • Completed {format(new Date(result.completedAt), 'MMM d, yyyy')}
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
              <div className="text-3xl font-bold text-[#27251F]">{result.overallScore.toFixed(1)}/5</div>
              <div className="text-sm text-[#27251F]/60">{getPerformanceLevel(result.overallScore)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={(result.overallScore / 5) * 100} className="h-3" />
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
            {Object.entries(result.scores).map(([area, score]) => (
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
              {result.strengths.length > 0 ? (
                result.strengths.map((strength, index) => (
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
              {result.developmentAreas.length > 0 ? (
                result.developmentAreas.map((area, index) => (
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

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
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
              {result.recommendations.map((recommendation, index) => (
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
            <Button
              variant="outline"
              onClick={() => navigate('/leadership/developmental-plan')}
              className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Development Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
