import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Clock, Heart, Target } from 'lucide-react'

interface StressManagementPlanFormProps {
  value: string
  onChange: (value: string) => void
}

export default function StressManagementPlanForm({ value, onChange }: StressManagementPlanFormProps) {
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
      {/* Stress Triggers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Personal Stress Triggers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="stressTriggers" className="text-sm font-medium">
            Identify your top 5 stress triggers in the restaurant environment and their warning signs
          </Label>
          <Textarea
            id="stressTriggers"
            placeholder="Example: 1. RUSH PERIOD OVERWHELM - Trigger: Multiple orders backing up, long customer lines. Warning Signs: Tight chest, racing thoughts, speaking faster, feeling like I can't catch up. 2. EQUIPMENT FAILURES - Trigger: POS system crashes or fryer breaks during busy time. Warning Signs: Immediate panic, sweating, wanting to blame someone. 3. CUSTOMER COMPLAINTS - Trigger: Angry customers demanding immediate resolution. Warning Signs: Defensive thoughts, clenched jaw, wanting to justify instead of listen. 4. TEAM MEMBER CONFLICTS - Trigger: Arguments between staff during shift. Warning Signs: Frustration, feeling pulled in multiple directions, avoiding the situation. 5. CORPORATE PRESSURE - Trigger: District manager visits or sales targets not met. Warning Signs: Anxiety, overthinking, micromanaging team members..."
            value={formData.stressTriggers || ''}
            onChange={(e) => updateField('stressTriggers', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Immediate Response Techniques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Immediate Stress Response Techniques</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="immediateResponse" className="text-sm font-medium">
            What specific techniques will you use in the moment when stress hits during restaurant operations?
          </Label>
          <Textarea
            id="immediateResponse"
            placeholder="Example: 1. 4-7-8 BREATHING - When I notice stress rising, breathe in for 4 counts, hold for 7, exhale for 8. Can do this while walking or even while talking to customers. 2. GROUNDING TECHNIQUE - Name 5 things I can see, 4 I can hear, 3 I can touch, 2 I can smell, 1 I can taste. Brings me back to present moment. 3. PAUSE PHRASE - Tell myself 'This is temporary, I can handle this' before reacting to stressful situations. 4. PHYSICAL RESET - Step outside for 30 seconds, do shoulder rolls, or splash cold water on face if possible. 5. PRIORITY REFOCUS - Ask 'What's the most important thing right now?' to cut through overwhelming thoughts. 6. TEAM DELEGATION - Instead of trying to handle everything, immediately identify what I can delegate to capable team members..."
            value={formData.immediateResponse || ''}
            onChange={(e) => updateField('immediateResponse', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Daily Stress Prevention */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Daily Stress Prevention Strategies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="dailyPrevention" className="text-sm font-medium">
            What daily practices will you implement to build stress resilience and prevent burnout?
          </Label>
          <Textarea
            id="dailyPrevention"
            placeholder="Example: MORNING PREPARATION: 1. Arrive 15 minutes early to mentally prepare and review the day's priorities calmly. 2. Do 5 minutes of deep breathing or meditation before shift starts. 3. Set positive intention for the day: 'I will stay calm and support my team.' DURING SHIFT: 1. Take micro-breaks every 2 hours - even 60 seconds of conscious breathing. 2. Practice gratitude by noting 3 positive things happening during the shift. 3. Stay hydrated and eat regularly to maintain physical energy. 4. Use positive self-talk: 'I've handled busy periods before, I can handle this.' AFTER SHIFT: 1. Spend 5 minutes reflecting on what went well and what I learned. 2. Do a physical activity to release tension (walk, stretch, exercise). 3. Avoid taking work stress home by creating a mental 'end of workday' ritual. 4. Get adequate sleep to restore emotional resilience for next day..."
            value={formData.dailyPrevention || ''}
            onChange={(e) => updateField('dailyPrevention', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Stress Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Supporting Team Stress Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamStressSupport" className="text-sm font-medium">
            How will you help your team manage stress and create a calmer work environment?
          </Label>
          <Textarea
            id="teamStressSupport"
            placeholder="Example: STRESS AWARENESS: 1. Teach team members to recognize their own stress signals and normalize talking about stress. 2. Share simple breathing techniques during team meetings. 3. Create signals for when someone needs a quick break or support. ENVIRONMENTAL CHANGES: 1. Play calming music during slower periods to maintain positive atmosphere. 2. Ensure adequate staffing to prevent overwhelming individual team members. 3. Create 'reset moments' during busy periods - 30-second team breathing exercises. SUPPORT SYSTEMS: 1. Implement buddy system where team members check on each other during stressful times. 2. Encourage team members to ask for help before becoming overwhelmed. 3. Recognize and celebrate how team members handle stress well. 4. Address stress-causing operational issues (broken equipment, unclear procedures) quickly. 5. Model calm behavior during crises to help team stay centered..."
            value={formData.teamStressSupport || ''}
            onChange={(e) => updateField('teamStressSupport', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
