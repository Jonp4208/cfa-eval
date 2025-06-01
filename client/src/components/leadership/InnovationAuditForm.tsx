import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardCheck,
  Lightbulb,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

interface InnovationAuditFormProps {
  value: string
  onChange: (value: string) => void
}

interface InnovationAudit {
  currentPractices: string
  innovationBarriers: string
  teamCreativity: string
  ideaGeneration: string
  implementationChallenges: string
  opportunities: string
  actionPriorities: string
}

const InnovationAuditForm: React.FC<InnovationAuditFormProps> = ({ value, onChange }) => {
  const [audit, setAudit] = useState<InnovationAudit>({
    currentPractices: '',
    innovationBarriers: '',
    teamCreativity: '',
    ideaGeneration: '',
    implementationChallenges: '',
    opportunities: '',
    actionPriorities: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setAudit(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setAudit(prev => ({ ...prev, currentPractices: value }))
      }
    }
  }, [value])

  // Update parent component when audit changes
  useEffect(() => {
    onChange(JSON.stringify(audit))
  }, [audit, onChange])

  const updateField = (field: keyof InnovationAudit, value: string) => {
    setAudit(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-orange-600" />
            Restaurant Innovation Culture Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-practices" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Current Creative Practices
            </Label>
            <Textarea
              id="current-practices"
              placeholder="Example: Weekly team meetings where we discuss challenges, suggestion box in break room, monthly 'improvement idea' contests, cross-training to expose team to different perspectives, informal brainstorming during slow periods"
              value={audit.currentPractices}
              onChange={(e) => updateField('currentPractices', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="innovation-barriers" className="text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Barriers to Innovation
            </Label>
            <Textarea
              id="innovation-barriers"
              placeholder="Example: Rush periods leave no time for thinking, fear of making mistakes during busy times, 'we've always done it this way' mindset, lack of budget for testing new ideas, team members afraid to speak up with suggestions"
              value={audit.innovationBarriers}
              onChange={(e) => updateField('innovationBarriers', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-creativity" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Team Creative Engagement
            </Label>
            <Textarea
              id="team-creativity"
              placeholder="Example: Sarah always suggests process improvements, Mike comes up with creative solutions to kitchen challenges, Jessica is great at finding ways to improve customer experience. About 30% of team actively shares ideas, others need more encouragement."
              value={audit.teamCreativity}
              onChange={(e) => updateField('teamCreativity', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-generation" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Idea Generation Process
            </Label>
            <Textarea
              id="idea-generation"
              placeholder="How are new ideas currently generated and evaluated in your restaurant?"
              value={audit.ideaGeneration}
              onChange={(e) => updateField('ideaGeneration', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-challenges" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Implementation Challenges
            </Label>
            <Textarea
              id="implementation-challenges"
              placeholder="What challenges do you face when trying to implement new ideas or changes?"
              value={audit.implementationChallenges}
              onChange={(e) => updateField('implementationChallenges', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunities" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Innovation Opportunities
            </Label>
            <Textarea
              id="opportunities"
              placeholder="What are the biggest opportunities to foster more innovative thinking in your restaurant?"
              value={audit.opportunities}
              onChange={(e) => updateField('opportunities', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-priorities" className="text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Top 3 Action Priorities
            </Label>
            <Textarea
              id="action-priorities"
              placeholder="Based on this audit, what are your top 3 priorities for improving innovation culture?"
              value={audit.actionPriorities}
              onChange={(e) => updateField('actionPriorities', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InnovationAuditForm
