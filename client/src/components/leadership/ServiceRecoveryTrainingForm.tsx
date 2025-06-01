import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Users, PlayCircle, CheckCircle, TrendingUp } from 'lucide-react'

interface ServiceRecoveryTrainingFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ServiceRecoveryTrainingForm({ value, onChange }: ServiceRecoveryTrainingFormProps) {
  const parseValue = (val: string) => {
    try {
      return JSON.parse(val || '{}')
    } catch {
      return {}
    }
  }

  const formData = parseValue(value)

  const updateField = (field: string, fieldValue: string) => {
    const updated = { ...formData, [field]: fieldValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-4">
      {/* Training Session Design */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Training Session Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="trainingStructure" className="text-sm font-medium">
            Describe how you structured your service recovery training session with your team
          </Label>
          <Textarea
            id="trainingStructure"
            placeholder="Example: 1. Opening (10 min) - Explained importance of service recovery: 'A customer who has a problem resolved well becomes more loyal than one who never had a problem.' Shared statistics about customer retention. 2. LAST Method Review (15 min) - Detailed explanation of Listen, Apologize, Solve, Thank with specific examples from our restaurant. 3. Role-Playing Scenarios (20 min) - Practiced 5 common situations: wrong order, long wait, cold food, rude service, cleanliness issues. Each team member practiced both customer and team member roles. 4. Empowerment Guidelines (10 min) - Clarified what team members can do without manager approval: comp items up to $15, offer free desserts/drinks, provide gift cards. 5. Q&A and Commitment (5 min) - Addressed questions, had each team member commit to one service recovery improvement..."
            value={formData.trainingStructure || ''}
            onChange={(e) => updateField('trainingStructure', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Role-Playing Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Practice Scenarios & Outcomes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="rolePlayingScenarios" className="text-sm font-medium">
            Detail the specific scenarios you practiced and how your team performed
          </Label>
          <Textarea
            id="rolePlayingScenarios"
            placeholder="Example: 1. Wrong Order Scenario - Customer ordered spicy chicken sandwich, received regular. Team member (Jessica) listened carefully, apologized sincerely, immediately began preparing correct order, offered free cookie for inconvenience. Result: Customer appreciated quick resolution. 2. Long Wait Scenario - Customer waited 8 minutes for simple order. Team member (Mike) acknowledged wait, apologized, explained kitchen was remaking fries for freshness, offered free drink. Result: Customer understood and appreciated transparency. 3. Cold Food Scenario - Customer's chicken was lukewarm. Team member (Sarah) apologized, took food back immediately, had kitchen prepare fresh order, offered dessert on the house. Result: Customer was impressed by immediate action. Areas for improvement: Need to work on more natural apology language, some team members still hesitant to offer compensation..."
            value={formData.rolePlayingScenarios || ''}
            onChange={(e) => updateField('rolePlayingScenarios', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Feedback & Learning */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Team Insights & Feedback</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamFeedback" className="text-sm font-medium">
            What insights and feedback did your team share during the training?
          </Label>
          <Textarea
            id="teamFeedback"
            placeholder="Example: 1. Confidence Building - Several team members said they felt more confident handling complaints after practicing scenarios. Jessica mentioned she used to call a manager immediately but now feels equipped to handle most issues herself. 2. Empowerment Appreciation - Team was excited about authority to comp items and offer free items. Mike said it would help him resolve issues faster without making customers wait. 3. Real Situation Sharing - Team members shared actual customer complaints they've experienced: mobile order mix-ups, sauce packet requests, dietary restriction concerns. We used these as additional practice scenarios. 4. Concerns Raised - Some team members worried about being taken advantage of by customers. We discussed how to balance generosity with good judgment. 5. Suggestions - Team suggested creating quick reference cards with service recovery steps and empowerment guidelines..."
            value={formData.teamFeedback || ''}
            onChange={(e) => updateField('teamFeedback', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation & Follow-up */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Implementation Plan & Follow-up</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            How will you reinforce this training and track service recovery success?
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Example: 1. Daily Reinforcement - Include service recovery tip in each shift huddle, share any customer complaints from previous day and discuss how they were handled. 2. Reference Materials - Created laminated cards with LAST method steps and empowerment guidelines for each team member, posted service recovery flowchart in break room. 3. Recognition Program - Celebrate team members who successfully handle service recovery situations, share positive outcomes in team meetings, include service recovery success in performance reviews. 4. Monthly Practice - Schedule 15-minute service recovery practice session monthly, introduce new scenarios based on actual situations, refresh skills and confidence. 5. Tracking System - Log all service recovery situations with outcome, track customer satisfaction after resolution, measure improvement in online reviews and feedback scores..."
            value={formData.implementationPlan || ''}
            onChange={(e) => updateField('implementationPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
