import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

interface ChangeImplementationPlanFormProps {
  value: string
  onChange: (value: string) => void
}

interface ImplementationPlan {
  changeDescription: string
  communicationStrategy: string
  timeline: string
  stakeholders: string
  successMetrics: string
  resistanceManagement: string
  contingencyPlans: string
}

const ChangeImplementationPlanForm: React.FC<ChangeImplementationPlanFormProps> = ({ value, onChange }) => {
  const [plan, setPlan] = useState<ImplementationPlan>({
    changeDescription: '',
    communicationStrategy: '',
    timeline: '',
    stakeholders: '',
    successMetrics: '',
    resistanceManagement: '',
    contingencyPlans: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setPlan(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setPlan(prev => ({ ...prev, changeDescription: value }))
      }
    }
  }, [value])

  // Update parent component when plan changes
  useEffect(() => {
    onChange(JSON.stringify(plan))
  }, [plan, onChange])

  const updateField = (field: keyof ImplementationPlan, value: string) => {
    setPlan(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Change Implementation Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-description" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Change/Innovation Description
            </Label>
            <Textarea
              id="change-description"
              placeholder="Describe the specific change or innovation you want to implement in your restaurant..."
              value={plan.changeDescription}
              onChange={(e) => updateField('changeDescription', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-strategy" className="text-xs font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Communication Strategy
            </Label>
            <Textarea
              id="communication-strategy"
              placeholder="How will you communicate this change? What messages, channels, and frequency?"
              value={plan.communicationStrategy}
              onChange={(e) => updateField('communicationStrategy', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Implementation Timeline
            </Label>
            <Textarea
              id="timeline"
              placeholder="Break down the implementation into phases with specific dates and milestones..."
              value={plan.timeline}
              onChange={(e) => updateField('timeline', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakeholders" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Key Stakeholders & Roles
            </Label>
            <Textarea
              id="stakeholders"
              placeholder="Who needs to be involved? What are their roles and responsibilities?"
              value={plan.stakeholders}
              onChange={(e) => updateField('stakeholders', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-metrics" className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Success Metrics
            </Label>
            <Textarea
              id="success-metrics"
              placeholder="How will you measure success? What specific metrics will you track?"
              value={plan.successMetrics}
              onChange={(e) => updateField('successMetrics', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resistance-management" className="text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Managing Resistance
            </Label>
            <Textarea
              id="resistance-management"
              placeholder="What resistance do you anticipate? How will you address concerns and objections?"
              value={plan.resistanceManagement}
              onChange={(e) => updateField('resistanceManagement', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contingency-plans" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Contingency Plans
            </Label>
            <Textarea
              id="contingency-plans"
              placeholder="What backup plans do you have if the implementation faces challenges?"
              value={plan.contingencyPlans}
              onChange={(e) => updateField('contingencyPlans', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangeImplementationPlanForm
