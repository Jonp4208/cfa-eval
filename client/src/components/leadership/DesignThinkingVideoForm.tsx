import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Lightbulb, 
  Users, 
  Target, 
  Brain,
  Zap,
  CheckCircle,
  Layers
} from 'lucide-react'

interface DesignThinkingVideoFormProps {
  value: string
  onChange: (value: string) => void
}

interface DesignThinkingReflection {
  designThinkingSteps: string
  restaurantProblem: string
  brainstormingTechniques: string
  prototypingIdeas: string
  customerEmpathy: string
  implementationPlan: string
  mainTakeaway: string
}

const DesignThinkingVideoForm: React.FC<DesignThinkingVideoFormProps> = ({ value, onChange }) => {
  const [reflection, setReflection] = useState<DesignThinkingReflection>({
    designThinkingSteps: '',
    restaurantProblem: '',
    brainstormingTechniques: '',
    prototypingIdeas: '',
    customerEmpathy: '',
    implementationPlan: '',
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
        setReflection(prev => ({ ...prev, designThinkingSteps: value }))
      }
    }
  }, [value])

  // Update parent component when reflection changes
  useEffect(() => {
    onChange(JSON.stringify(reflection))
  }, [reflection, onChange])

  const updateField = (field: keyof DesignThinkingReflection, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4 text-green-600" />
            Tim Brown's Design Thinking Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="design-thinking-steps" className="text-xs font-medium flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Design Thinking Process
            </Label>
            <Textarea
              id="design-thinking-steps"
              placeholder="Summarize the design thinking process Tim Brown described..."
              value={reflection.designThinkingSteps}
              onChange={(e) => updateField('designThinkingSteps', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant-problem" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Restaurant Challenge to Solve
            </Label>
            <Textarea
              id="restaurant-problem"
              placeholder="Identify a specific operational challenge in your restaurant that could benefit from design thinking..."
              value={reflection.restaurantProblem}
              onChange={(e) => updateField('restaurantProblem', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brainstorming-techniques" className="text-xs font-medium flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Brainstorming Techniques
            </Label>
            <Textarea
              id="brainstorming-techniques"
              placeholder="What brainstorming techniques did you learn? How will you use them with your team?"
              value={reflection.brainstormingTechniques}
              onChange={(e) => updateField('brainstormingTechniques', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prototyping-ideas" className="text-xs font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Rapid Prototyping Application
            </Label>
            <Textarea
              id="prototyping-ideas"
              placeholder="How could you apply rapid prototyping concepts to test solutions in your restaurant?"
              value={reflection.prototypingIdeas}
              onChange={(e) => updateField('prototypingIdeas', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-empathy" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Customer Empathy Insights
            </Label>
            <Textarea
              id="customer-empathy"
              placeholder="How can you better understand your customers' needs and pain points?"
              value={reflection.customerEmpathy}
              onChange={(e) => updateField('customerEmpathy', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-plan" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Implementation Plan
            </Label>
            <Textarea
              id="implementation-plan"
              placeholder="What's your plan to implement design thinking in your restaurant operations?"
              value={reflection.implementationPlan}
              onChange={(e) => updateField('implementationPlan', e.target.value)}
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
              placeholder="What is your most important takeaway from this TED talk?"
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

export default DesignThinkingVideoForm
