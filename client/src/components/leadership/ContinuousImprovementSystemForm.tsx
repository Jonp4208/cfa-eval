import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react'

interface ContinuousImprovementSystemFormProps {
  value: string
  onChange: (value: string) => void
}

interface ImprovementSystem {
  systemDescription: string
  improvementAreas: string
  dataCollection: string
  reviewFrequency: string
  teamInvolvement: string
  ideaSubmissionProcess: string
  implementationProcess: string
  successMetrics: string
  communicationPlan: string
  nextSteps: string
}

const ContinuousImprovementSystemForm: React.FC<ContinuousImprovementSystemFormProps> = ({ value, onChange }) => {
  const [system, setSystem] = useState<ImprovementSystem>({
    systemDescription: '',
    improvementAreas: '',
    dataCollection: '',
    reviewFrequency: '',
    teamInvolvement: '',
    ideaSubmissionProcess: '',
    implementationProcess: '',
    successMetrics: '',
    communicationPlan: '',
    nextSteps: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setSystem(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setSystem(prev => ({ ...prev, systemDescription: value }))
      }
    }
  }, [value])

  // Update parent component when system changes
  useEffect(() => {
    onChange(JSON.stringify(system))
  }, [system, onChange])

  const updateField = (field: keyof ImprovementSystem, value: string) => {
    setSystem(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-600" />
            Continuous Improvement System Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system-description" className="text-xs font-medium flex items-center gap-1">
              <Settings className="h-3 w-3" />
              System Overview
            </Label>
            <Textarea
              id="system-description"
              placeholder="Example: A weekly cycle where we identify small improvements, test them quickly, and implement what works. Philosophy: Every team member can contribute ideas, small changes add up to big results, and we learn from both successes and failures."
              value={system.systemDescription}
              onChange={(e) => updateField('systemDescription', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement-areas" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Focus Areas for Improvement
            </Label>
            <Textarea
              id="improvement-areas"
              placeholder="Example: Customer service speed, food quality consistency, team member efficiency, waste reduction, cleanliness standards, order accuracy, team communication, training effectiveness"
              value={system.improvementAreas}
              onChange={(e) => updateField('improvementAreas', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-collection" className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Data Collection Methods
            </Label>
            <Textarea
              id="data-collection"
              placeholder="Example: Daily service time tracking, weekly customer feedback review, monthly waste reports, team member suggestion forms, mystery shopper scores, weekly team check-ins, order accuracy percentages"
              value={system.dataCollection}
              onChange={(e) => updateField('dataCollection', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-frequency" className="text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Review Schedule
            </Label>
            <Input
              id="review-frequency"
              placeholder="How often will you review performance and identify improvements? (daily, weekly, monthly)"
              value={system.reviewFrequency}
              onChange={(e) => updateField('reviewFrequency', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-involvement" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Team Involvement Strategy
            </Label>
            <Textarea
              id="team-involvement"
              placeholder="How will you involve your team in the continuous improvement process? What roles will they play?"
              value={system.teamInvolvement}
              onChange={(e) => updateField('teamInvolvement', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-submission-process" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Idea Submission Process
            </Label>
            <Textarea
              id="idea-submission-process"
              placeholder="How can team members submit improvement ideas? What's the process for collecting and evaluating suggestions?"
              value={system.ideaSubmissionProcess}
              onChange={(e) => updateField('ideaSubmissionProcess', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-process" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Implementation Process
            </Label>
            <Textarea
              id="implementation-process"
              placeholder="What's your process for testing and implementing improvements? How will you pilot changes?"
              value={system.implementationProcess}
              onChange={(e) => updateField('implementationProcess', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-metrics" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Success Metrics
            </Label>
            <Textarea
              id="success-metrics"
              placeholder="How will you measure the success of your continuous improvement system? What KPIs will you track?"
              value={system.successMetrics}
              onChange={(e) => updateField('successMetrics', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-plan" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Communication Plan
            </Label>
            <Textarea
              id="communication-plan"
              placeholder="How will you communicate improvements and celebrate successes with your team?"
              value={system.communicationPlan}
              onChange={(e) => updateField('communicationPlan', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-steps" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Implementation Next Steps
            </Label>
            <Textarea
              id="next-steps"
              placeholder="What are your immediate next steps to launch this continuous improvement system?"
              value={system.nextSteps}
              onChange={(e) => updateField('nextSteps', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContinuousImprovementSystemForm
