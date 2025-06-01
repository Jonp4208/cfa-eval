import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  CheckCircle,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'

interface LeadingChangeVideoFormProps {
  value: string
  onChange: (value: string) => void
}

interface ChangeReflection {
  kotterSteps: string
  urgencyExample: string
  coalitionMembers: string
  visionStatement: string
  communicationPlan: string
  sustainabilityStrategy: string
  mainTakeaway: string
}

const LeadingChangeVideoForm: React.FC<LeadingChangeVideoFormProps> = ({ value, onChange }) => {
  const [reflection, setReflection] = useState<ChangeReflection>({
    kotterSteps: '',
    urgencyExample: '',
    coalitionMembers: '',
    visionStatement: '',
    communicationPlan: '',
    sustainabilityStrategy: '',
    mainTakeaway: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setReflection(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setReflection(prev => ({ ...prev, kotterSteps: value }))
      }
    }
  }, [value])

  // Update parent component when reflection changes
  useEffect(() => {
    onChange(JSON.stringify(reflection))
  }, [reflection, onChange])

  const updateField = (field: keyof ChangeReflection, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-600" />
            John Kotter's 8-Step Change Process Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kotter-steps" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Kotter's 8 Steps Summary
            </Label>
            <Textarea
              id="kotter-steps"
              placeholder="Example: 1. Create urgency around customer wait times, 2. Build coalition with shift leaders, 3. Develop vision for faster service, 4. Communicate the vision in team meetings..."
              value={reflection.kotterSteps}
              onChange={(e) => updateField('kotterSteps', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency-example" className="text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Creating Urgency in Your Restaurant
            </Label>
            <Textarea
              id="urgency-example"
              placeholder="Example: Our drive-thru times are 20% slower than target, causing customer complaints and lost sales during peak hours. I need to create urgency by sharing customer feedback and showing the revenue impact..."
              value={reflection.urgencyExample}
              onChange={(e) => updateField('urgencyExample', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coalition-members" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Building Your Change Coalition
            </Label>
            <Input
              id="coalition-members"
              placeholder="Example: Sarah (Assistant Manager), Mike (Kitchen Lead), Jessica (Front Counter Lead), Tom (Drive-thru Expert)"
              value={reflection.coalitionMembers}
              onChange={(e) => updateField('coalitionMembers', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision-statement" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Change Vision Statement
            </Label>
            <Textarea
              id="vision-statement"
              placeholder="Example: By Q2, we will be the fastest drive-thru in our market, delivering hot, accurate orders in under 90 seconds while maintaining our reputation for exceptional hospitality..."
              value={reflection.visionStatement}
              onChange={(e) => updateField('visionStatement', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-plan" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Communication Strategy
            </Label>
            <Textarea
              id="communication-plan"
              placeholder="Example: Daily huddles for 2 weeks, weekly team meetings with progress updates, visual scoreboard in break room, individual check-ins with key team members..."
              value={reflection.communicationPlan}
              onChange={(e) => updateField('communicationPlan', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sustainability-strategy" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Sustaining Change
            </Label>
            <Textarea
              id="sustainability-strategy"
              placeholder="Example: Update training materials, create new hire orientation checklist, establish monthly speed competitions, recognize top performers, make it part of performance reviews..."
              value={reflection.sustainabilityStrategy}
              onChange={(e) => updateField('sustainabilityStrategy', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-takeaway" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Key Takeaway
            </Label>
            <Input
              id="main-takeaway"
              placeholder="Example: Change fails without urgency - I need to help my team feel the need for change, not just understand it"
              value={reflection.mainTakeaway}
              onChange={(e) => updateField('mainTakeaway', e.target.value)}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LeadingChangeVideoForm
