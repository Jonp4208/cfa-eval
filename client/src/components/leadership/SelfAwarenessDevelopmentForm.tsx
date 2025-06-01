import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Eye, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react'

interface SelfAwarenessDevelopmentFormProps {
  value: string
  onChange: (value: string) => void
}

export default function SelfAwarenessDevelopmentForm({ value, onChange }: SelfAwarenessDevelopmentFormProps) {
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
      {/* Emotional Triggers Identification */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Identifying Your Emotional Triggers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="emotionalTriggers" className="text-sm font-medium">
            Identify your top 5 emotional triggers in the restaurant environment and how they typically affect you
          </Label>
          <Textarea
            id="emotionalTriggers"
            placeholder="Example: 1. Customer Complaints - When guests are upset about wait times or food quality, I feel defensive and want to justify our actions instead of listening. This makes me tense and less empathetic. 2. Team Member Tardiness - When team members arrive late during busy periods, I feel frustrated and sometimes snap at them, which damages our relationship. 3. Equipment Failures - When our fryer or POS system breaks down during rush, I feel overwhelmed and panic, which spreads stress to my team. 4. Understaffing - When we're short-staffed and I have to cover multiple roles, I feel resentful and exhausted, affecting my patience with everyone. 5. Corporate Pressure - When district managers visit or we're behind on sales goals, I feel anxious and become micromanaging, which stresses my team..."
            value={formData.emotionalTriggers || ''}
            onChange={(e) => updateField('emotionalTriggers', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Strengths and Blind Spots */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Leadership Strengths & Blind Spots</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="strengthsBlindSpots" className="text-sm font-medium">
            Reflect on your emotional strengths as a leader and identify potential blind spots
          </Label>
          <Textarea
            id="strengthsBlindSpots"
            placeholder="Example: STRENGTHS: 1. I'm naturally empathetic and can sense when team members are struggling personally or professionally. 2. I stay calm under pressure during most situations and help others feel secure. 3. I'm good at celebrating team wins and making people feel appreciated. 4. I can read customer emotions well and adjust my approach accordingly. BLIND SPOTS: 1. I sometimes avoid difficult conversations because I don't want to hurt feelings, which can let problems fester. 2. I may be too trusting and not notice when team members are taking advantage of my kindness. 3. I struggle to show vulnerability and ask for help when I'm overwhelmed. 4. I sometimes assume others understand my expectations without clearly communicating them..."
            value={formData.strengthsBlindSpots || ''}
            onChange={(e) => updateField('strengthsBlindSpots', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Values and Motivations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Core Values & Motivations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="valuesMotivations" className="text-sm font-medium">
            What are your core values as a leader and what truly motivates you in your restaurant role?
          </Label>
          <Textarea
            id="valuesMotivations"
            placeholder="Example: CORE VALUES: 1. Respect for People - I believe every team member and guest deserves to be treated with dignity and kindness. 2. Excellence in Service - I'm committed to providing exceptional experiences that exceed expectations. 3. Team Development - I value helping others grow and reach their potential. 4. Integrity - I believe in doing the right thing even when no one is watching. MOTIVATIONS: 1. Seeing team members succeed and advance in their careers brings me joy. 2. Creating positive experiences for guests and knowing we made their day better. 3. Building a workplace culture where people want to come to work. 4. Achieving goals as a team and celebrating our collective success. 5. Making a positive impact in our community through great service and employment opportunities..."
            value={formData.valuesMotivations || ''}
            onChange={(e) => updateField('valuesMotivations', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Self-Awareness Action Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Self-Awareness Development Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="developmentPlan" className="text-sm font-medium">
            Create a specific plan to increase your self-awareness over the next 30 days
          </Label>
          <Textarea
            id="developmentPlan"
            placeholder="Example: Week 1: Daily Emotion Journaling - At the end of each shift, spend 5 minutes writing about my emotional experiences, what triggered strong reactions, and how I handled them. Week 2: Trigger Response Practice - When I notice a trigger situation arising, pause for 3 seconds before responding and ask myself 'What am I feeling right now and why?' Week 3: Feedback Collection - Ask 3 trusted team members for honest feedback about my leadership style and emotional responses. Week 4: Values Alignment Check - Each day, reflect on whether my actions aligned with my stated values and identify any gaps. Throughout: Practice mindfulness during busy periods by taking conscious breaths and checking in with my emotional state every hour..."
            value={formData.developmentPlan || ''}
            onChange={(e) => updateField('developmentPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
