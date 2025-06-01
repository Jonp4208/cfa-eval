import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Lightbulb, 
  Users, 
  Target, 
  TrendingUp,
  Heart,
  CheckCircle,
  Star
} from 'lucide-react'

interface InnovationLeadershipPhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

interface LeadershipPhilosophy {
  creativityBeliefs: string
  riskTakingApproach: string
  continuousImprovement: string
  teamInnovation: string
  failureHandling: string
  innovationVision: string
  personalCommitment: string
}

const InnovationLeadershipPhilosophyForm: React.FC<InnovationLeadershipPhilosophyFormProps> = ({ value, onChange }) => {
  const [philosophy, setPhilosophy] = useState<LeadershipPhilosophy>({
    creativityBeliefs: '',
    riskTakingApproach: '',
    continuousImprovement: '',
    teamInnovation: '',
    failureHandling: '',
    innovationVision: '',
    personalCommitment: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setPhilosophy(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setPhilosophy(prev => ({ ...prev, creativityBeliefs: value }))
      }
    }
  }, [value])

  // Update parent component when philosophy changes
  useEffect(() => {
    onChange(JSON.stringify(philosophy))
  }, [philosophy, onChange])

  const updateField = (field: keyof LeadershipPhilosophy, value: string) => {
    setPhilosophy(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            Innovation Leadership Philosophy Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creativity-beliefs" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Your Beliefs About Creativity
            </Label>
            <Textarea
              id="creativity-beliefs"
              placeholder="What do you believe about creativity in the workplace? Is everyone creative? How do you foster it?"
              value={philosophy.creativityBeliefs}
              onChange={(e) => updateField('creativityBeliefs', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-taking-approach" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Approach to Risk-Taking
            </Label>
            <Textarea
              id="risk-taking-approach"
              placeholder="How do you balance innovation with operational stability? What's your philosophy on taking calculated risks?"
              value={philosophy.riskTakingApproach}
              onChange={(e) => updateField('riskTakingApproach', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="continuous-improvement" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Continuous Improvement Philosophy
            </Label>
            <Textarea
              id="continuous-improvement"
              placeholder="What's your approach to continuous improvement? How do you encourage ongoing innovation?"
              value={philosophy.continuousImprovement}
              onChange={(e) => updateField('continuousImprovement', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-innovation" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Empowering Team Innovation
            </Label>
            <Textarea
              id="team-innovation"
              placeholder="How do you empower your team to be innovative? What environment do you create for creative thinking?"
              value={philosophy.teamInnovation}
              onChange={(e) => updateField('teamInnovation', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="failure-handling" className="text-xs font-medium flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Learning from Failure
            </Label>
            <Textarea
              id="failure-handling"
              placeholder="How do you handle failures and setbacks in innovation? What's your philosophy on learning from mistakes?"
              value={philosophy.failureHandling}
              onChange={(e) => updateField('failureHandling', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="innovation-vision" className="text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3" />
              Innovation Vision for Your Restaurant
            </Label>
            <Textarea
              id="innovation-vision"
              placeholder="What's your vision for innovation in your restaurant? Where do you want to be in 1-2 years?"
              value={philosophy.innovationVision}
              onChange={(e) => updateField('innovationVision', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-commitment" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Personal Commitment
            </Label>
            <Textarea
              id="personal-commitment"
              placeholder="What personal commitments are you making to become a better innovation leader?"
              value={philosophy.personalCommitment}
              onChange={(e) => updateField('personalCommitment', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InnovationLeadershipPhilosophyForm
