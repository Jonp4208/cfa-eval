import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Brain, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target
} from 'lucide-react'

interface ChangeManagementStrategiesFormProps {
  value: string
  onChange: (value: string) => void
}

interface ChangeStrategies {
  keyStrategies: string
  psychologyInsights: string
  communicationApproach: string
  resistanceFactors: string
  resistanceStrategies: string
  restaurantApplication: string
  currentChallenge: string
  actionPlan: string
  mainTakeaway: string
}

const ChangeManagementStrategiesForm: React.FC<ChangeManagementStrategiesFormProps> = ({ value, onChange }) => {
  const [strategies, setStrategies] = useState<ChangeStrategies>({
    keyStrategies: '',
    psychologyInsights: '',
    communicationApproach: '',
    resistanceFactors: '',
    resistanceStrategies: '',
    restaurantApplication: '',
    currentChallenge: '',
    actionPlan: '',
    mainTakeaway: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setStrategies(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setStrategies(prev => ({ ...prev, keyStrategies: value }))
      }
    }
  }, [value])

  // Update parent component when strategies changes
  useEffect(() => {
    onChange(JSON.stringify(strategies))
  }, [strategies, onChange])

  const updateField = (field: keyof ChangeStrategies, value: string) => {
    setStrategies(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Change Management Strategies Reading Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-strategies" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Key Change Management Strategies
            </Label>
            <Textarea
              id="key-strategies"
              placeholder="What are the main change management strategies discussed in the article?"
              value={strategies.keyStrategies}
              onChange={(e) => updateField('keyStrategies', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychology-insights" className="text-xs font-medium flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Psychology of Change Insights
            </Label>
            <Textarea
              id="psychology-insights"
              placeholder="What did you learn about the psychological aspects of change? How do people typically react to change?"
              value={strategies.psychologyInsights}
              onChange={(e) => updateField('psychologyInsights', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-approach" className="text-xs font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Communication Strategies
            </Label>
            <Textarea
              id="communication-approach"
              placeholder="What communication strategies are most effective during change? How should leaders communicate change?"
              value={strategies.communicationApproach}
              onChange={(e) => updateField('communicationApproach', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resistance-factors" className="text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Common Resistance Factors
            </Label>
            <Textarea
              id="resistance-factors"
              placeholder="What are the common reasons people resist change? Which ones do you see in your restaurant?"
              value={strategies.resistanceFactors}
              onChange={(e) => updateField('resistanceFactors', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resistance-strategies" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Addressing Resistance
            </Label>
            <Textarea
              id="resistance-strategies"
              placeholder="What strategies can leaders use to address resistance and help people embrace change?"
              value={strategies.resistanceStrategies}
              onChange={(e) => updateField('resistanceStrategies', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant-application" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Restaurant Application
            </Label>
            <Textarea
              id="restaurant-application"
              placeholder="How can you apply these change management strategies in your restaurant environment?"
              value={strategies.restaurantApplication}
              onChange={(e) => updateField('restaurantApplication', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-challenge" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Current Change Challenge
            </Label>
            <Textarea
              id="current-challenge"
              placeholder="Describe a current change challenge in your restaurant and how you'll apply these strategies..."
              value={strategies.currentChallenge}
              onChange={(e) => updateField('currentChallenge', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-plan" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Action Plan
            </Label>
            <Textarea
              id="action-plan"
              placeholder="What specific actions will you take this week to improve your change management approach?"
              value={strategies.actionPlan}
              onChange={(e) => updateField('actionPlan', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-takeaway" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Key Takeaway
            </Label>
            <Input
              id="main-takeaway"
              placeholder="What is your most important takeaway from this reading?"
              value={strategies.mainTakeaway}
              onChange={(e) => updateField('mainTakeaway', e.target.value)}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangeManagementStrategiesForm
