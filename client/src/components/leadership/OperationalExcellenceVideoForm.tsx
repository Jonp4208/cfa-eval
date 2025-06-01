import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  CheckCircle, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

interface OperationalExcellenceVideoFormProps {
  value: string
  onChange: (value: string) => void
  videoTitle?: string
}

interface VideoReflection {
  keyPrinciples: string
  restaurantApplications: string
  currentChallenges: string
  implementationPlan: string
  successMetrics: string
}

const OperationalExcellenceVideoForm: React.FC<OperationalExcellenceVideoFormProps> = ({ 
  value, 
  onChange,
  videoTitle = "Operational Excellence Video"
}) => {
  const [reflection, setReflection] = useState<VideoReflection>({
    keyPrinciples: '',
    restaurantApplications: '',
    currentChallenges: '',
    implementationPlan: '',
    successMetrics: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setReflection(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setReflection(prev => ({ ...prev, keyPrinciples: value }))
      }
    }
  }, [value])

  // Update parent component when reflection changes
  useEffect(() => {
    onChange(JSON.stringify(reflection))
  }, [reflection, onChange])

  const updateReflection = (field: keyof VideoReflection, newValue: string) => {
    setReflection(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(reflection)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-blue-800">{videoTitle} - Reflection</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Video Learning
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Principles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Key Principles Learned</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyPrinciples" className="text-sm font-medium">
            What are the main operational excellence principles you learned from this video?
          </Label>
          <Textarea
            id="keyPrinciples"
            placeholder="List and explain the key principles of operational excellence discussed in the video..."
            value={reflection.keyPrinciples}
            onChange={(e) => updateReflection('keyPrinciples', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Restaurant Applications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Restaurant Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="restaurantApplications" className="text-sm font-medium">
            How can you apply these principles specifically in your restaurant operations?
          </Label>
          <Textarea
            id="restaurantApplications"
            placeholder="Describe specific ways you can implement these operational excellence principles in your restaurant..."
            value={reflection.restaurantApplications}
            onChange={(e) => updateReflection('restaurantApplications', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Current Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Current Operational Challenges</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="currentChallenges" className="text-sm font-medium">
            What operational challenges in your restaurant could benefit from these principles?
          </Label>
          <Textarea
            id="currentChallenges"
            placeholder="Identify specific operational challenges you face that could be improved using these principles..."
            value={reflection.currentChallenges}
            onChange={(e) => updateReflection('currentChallenges', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a specific plan for implementing one principle in the next 30 days
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Outline your step-by-step plan to implement one operational excellence principle in your restaurant within the next 30 days..."
            value={reflection.implementationPlan}
            onChange={(e) => updateReflection('implementationPlan', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Success Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="successMetrics" className="text-sm font-medium">
            How will you measure the success of your implementation?
          </Label>
          <Textarea
            id="successMetrics"
            placeholder="Define specific, measurable metrics to track the success of your operational excellence improvements..."
            value={reflection.successMetrics}
            onChange={(e) => updateReflection('successMetrics', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default OperationalExcellenceVideoForm
