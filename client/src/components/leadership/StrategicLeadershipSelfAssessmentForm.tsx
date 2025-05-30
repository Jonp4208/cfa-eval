import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Brain, 
  Eye, 
  Target, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight
} from 'lucide-react'

interface StrategicLeadershipSelfAssessmentFormProps {
  value: string
  onChange: (value: string) => void
}

interface AssessmentArea {
  area: string
  icon: React.ElementType
  color: string
  rating: number
  strengths: string
  developmentNeeds: string
}

const StrategicLeadershipSelfAssessmentForm: React.FC<StrategicLeadershipSelfAssessmentFormProps> = ({ value, onChange }) => {
  const [assessmentAreas, setAssessmentAreas] = useState<AssessmentArea[]>([
    {
      area: 'Strategic Thinking',
      icon: Brain,
      color: 'blue',
      rating: 3,
      strengths: '',
      developmentNeeds: ''
    },
    {
      area: 'Vision Communication',
      icon: Eye,
      color: 'purple',
      rating: 3,
      strengths: '',
      developmentNeeds: ''
    },
    {
      area: 'Decision Making',
      icon: Target,
      color: 'green',
      rating: 3,
      strengths: '',
      developmentNeeds: ''
    },
    {
      area: 'Change Leadership',
      icon: TrendingUp,
      color: 'orange',
      rating: 3,
      strengths: '',
      developmentNeeds: ''
    },
    {
      area: 'Long-term Planning',
      icon: Users,
      color: 'indigo',
      rating: 3,
      strengths: '',
      developmentNeeds: ''
    }
  ])
  
  const [overallReflection, setOverallReflection] = useState<string>('')
  const [developmentPriorities, setDevelopmentPriorities] = useState<string>('')
  const [actionPlan, setActionPlan] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        if (parsedValue.assessmentAreas) {
          setAssessmentAreas(parsedValue.assessmentAreas)
        }
        setOverallReflection(parsedValue.overallReflection || '')
        setDevelopmentPriorities(parsedValue.developmentPriorities || '')
        setActionPlan(parsedValue.actionPlan || '')
      } catch (e) {
        // If parsing fails, keep default state
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      assessmentAreas,
      overallReflection,
      developmentPriorities,
      actionPlan
    })
    onChange(formData)
  }, [assessmentAreas, overallReflection, developmentPriorities, actionPlan, onChange])

  const updateAssessmentArea = (index: number, field: keyof AssessmentArea, value: any) => {
    const updatedAreas = [...assessmentAreas]
    updatedAreas[index] = { ...updatedAreas[index], [field]: value }
    setAssessmentAreas(updatedAreas)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getRatingLabel = (rating: number) => {
    if (rating <= 1) return 'Beginner'
    if (rating <= 2) return 'Developing'
    if (rating <= 3) return 'Competent'
    if (rating <= 4) return 'Proficient'
    return 'Expert'
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600'
    if (rating <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getAverageRating = () => {
    const total = assessmentAreas.reduce((sum, area) => sum + area.rating, 0)
    return (total / assessmentAreas.length).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5" />
          <p className="font-medium">Strategic Leadership Self-Assessment</p>
        </div>
        <p>Evaluate your strategic leadership capabilities across five key areas. Be honest in your self-assessment to identify your strengths and development opportunities.</p>
      </div>

      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Assessment Overview</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Overall: {getAverageRating()}/5.0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessmentAreas.map((area, index) => {
              const IconComponent = area.icon
              return (
                <div key={index} className={`p-3 rounded-lg border ${getColorClasses(area.color)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm">{area.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{area.rating}</span>
                    <span className={`text-xs font-medium ${getRatingColor(area.rating)}`}>
                      {getRatingLabel(area.rating)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Assessment</h3>
        {assessmentAreas.map((area, index) => {
          const IconComponent = area.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 text-${area.color}-500`} />
                  {area.area}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Current Capability Level</Label>
                    <Badge variant="outline" className={getRatingColor(area.rating)}>
                      {area.rating}/5 - {getRatingLabel(area.rating)}
                    </Badge>
                  </div>
                  <Slider
                    value={[area.rating]}
                    onValueChange={(value) => updateAssessmentArea(index, 'rating', value[0])}
                    max={5}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 - Beginner</span>
                    <span>3 - Competent</span>
                    <span>5 - Expert</span>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <Label htmlFor={`strengths-${index}`} className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500" />
                    Current Strengths in {area.area}
                  </Label>
                  <Textarea
                    id={`strengths-${index}`}
                    placeholder={`What are you already doing well in ${area.area.toLowerCase()}? What specific skills or experiences demonstrate your capability?`}
                    value={area.strengths}
                    onChange={(e) => updateAssessmentArea(index, 'strengths', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                {/* Development Needs */}
                <div className="space-y-2">
                  <Label htmlFor={`development-${index}`} className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Development Opportunities in {area.area}
                  </Label>
                  <Textarea
                    id={`development-${index}`}
                    placeholder={`Where do you need to grow in ${area.area.toLowerCase()}? What specific skills or knowledge would help you improve?`}
                    value={area.developmentNeeds}
                    onChange={(e) => updateAssessmentArea(index, 'developmentNeeds', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Overall Strategic Leadership Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overall-reflection" className="text-sm font-medium">
              Overall Assessment Summary
            </Label>
            <Textarea
              id="overall-reflection"
              placeholder="Reflect on your overall strategic leadership capabilities. What patterns do you notice? How do these areas work together? What insights have you gained about yourself as a strategic leader?"
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="development-priorities" className="text-sm font-medium">
              Top 3 Strategic Leadership Development Priorities
            </Label>
            <Textarea
              id="development-priorities"
              placeholder="Based on your assessment, what are your top 3 strategic leadership development priorities for the next 6 months? List them in order of importance and explain why each is critical for your growth."
              value={developmentPriorities}
              onChange={(e) => setDevelopmentPriorities(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-plan" className="text-sm font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-500" />
              6-Month Development Action Plan
            </Label>
            <Textarea
              id="action-plan"
              placeholder="Create a specific action plan for developing your strategic leadership skills over the next 6 months. Include specific actions, resources you'll use, milestones, and how you'll measure progress."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicLeadershipSelfAssessmentForm
