import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Lightbulb,
  Users,
  Target,
  Brain,
  Zap,
  CheckCircle
} from 'lucide-react'

interface CreativeConfidenceBookFormProps {
  value: string
  onChange: (value: string) => void
}

interface BookReflection {
  creativeBlocks: string
  confidenceBuilders: string
  teamApplication: string
  personalChallenge: string
  restaurantInnovation: string
  actionSteps: string
  mainInsight: string
}

const CreativeConfidenceBookForm: React.FC<CreativeConfidenceBookFormProps> = ({ value, onChange }) => {
  const [reflection, setReflection] = useState<BookReflection>({
    creativeBlocks: '',
    confidenceBuilders: '',
    teamApplication: '',
    personalChallenge: '',
    restaurantInnovation: '',
    actionSteps: '',
    mainInsight: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setReflection(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setReflection(prev => ({ ...prev, creativeBlocks: value }))
      }
    }
  }, [value])

  // Update parent component when reflection changes
  useEffect(() => {
    onChange(JSON.stringify(reflection))
  }, [reflection, onChange])

  const updateField = (field: keyof BookReflection, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            Creative Confidence Reading Reflection (Chapters 1-2)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creative-blocks" className="text-xs font-medium flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Creative Blocks Identified
            </Label>
            <Textarea
              id="creative-blocks"
              placeholder="Example: Fear of judgment, perfectionism, comparing to others, thinking 'I'm not creative.' I recognize perfectionism in myself - I often don't share ideas until they're fully formed..."
              value={reflection.creativeBlocks}
              onChange={(e) => updateField('creativeBlocks', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence-builders" className="text-xs font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Confidence Building Techniques
            </Label>
            <Textarea
              id="confidence-builders"
              placeholder="Example: Start small with low-risk experiments, celebrate attempts not just successes, practice 'yes, and...' thinking, create safe spaces for idea sharing, reframe failures as learning..."
              value={reflection.confidenceBuilders}
              onChange={(e) => updateField('confidenceBuilders', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-application" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Helping Your Team Develop Creative Confidence
            </Label>
            <Textarea
              id="team-application"
              placeholder="Example: Start 'Idea Friday' where team members share one small improvement idea, create suggestion box with weekly recognition, ask 'What if...' questions during team meetings, celebrate creative attempts even if they don't work..."
              value={reflection.teamApplication}
              onChange={(e) => updateField('teamApplication', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-challenge" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Personal Creative Challenge
            </Label>
            <Input
              id="personal-challenge"
              placeholder="Example: Try a new approach to scheduling that I've been hesitant about, or ask team for ideas on reducing food waste"
              value={reflection.personalChallenge}
              onChange={(e) => updateField('personalChallenge', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant-innovation" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Restaurant Innovation Opportunity
            </Label>
            <Textarea
              id="restaurant-innovation"
              placeholder="Example: Customer ordering experience - could we create a more personalized way to take orders? Or kitchen workflow - what if we rearranged stations to reduce steps and improve efficiency?"
              value={reflection.restaurantInnovation}
              onChange={(e) => updateField('restaurantInnovation', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-steps" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Next Action Steps
            </Label>
            <Textarea
              id="action-steps"
              placeholder="Example: 1. Start weekly 'What if...' questions in team meetings, 2. Create safe space for sharing half-formed ideas, 3. Celebrate one creative attempt each week regardless of outcome"
              value={reflection.actionSteps}
              onChange={(e) => updateField('actionSteps', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-insight" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Key Insight
            </Label>
            <Input
              id="main-insight"
              placeholder="Example: Everyone is creative, but fear kills creativity faster than lack of talent"
              value={reflection.mainInsight}
              onChange={(e) => updateField('mainInsight', e.target.value)}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreativeConfidenceBookForm
