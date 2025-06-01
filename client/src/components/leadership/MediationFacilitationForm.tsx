import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Scale, Users, Target, CheckCircle } from 'lucide-react'

interface MediationFacilitationFormProps {
  value: string
  onChange: (value: string) => void
}

export default function MediationFacilitationForm({ value, onChange }: MediationFacilitationFormProps) {
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
      {/* 5-Step Conflict Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">5-Step Conflict Management Process</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="fiveStepProcess" className="text-sm font-medium">
            Explain the 5-step process you learned and how you'll apply it in restaurant conflicts
          </Label>
          <Textarea
            id="fiveStepProcess"
            placeholder="Example: STEP 1: SEPARATE & COOL DOWN - When I notice heated conflict, I separate the parties immediately. 'Let's take a 10-minute break and then talk through this.' STEP 2: LISTEN TO EACH SIDE - Meet with each person individually to understand their perspective without the other person present. Use active listening techniques. STEP 3: IDENTIFY COMMON GROUND - Find shared goals like 'We both want to provide great customer service' or 'We both want fair treatment.' STEP 4: BRAINSTORM SOLUTIONS TOGETHER - Bring parties together and ask 'What are some ways we could resolve this?' Let them generate ideas before offering my own. STEP 5: AGREE ON ACTION PLAN - Get specific commitments: 'So John will communicate order changes within 30 seconds, and Sarah will confirm receipt. We'll check back in one week.' Document the agreement and follow up..."
            value={formData.fiveStepProcess || ''}
            onChange={(e) => updateField('fiveStepProcess', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Staying Neutral */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Maintaining Neutrality as Mediator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="neutrality" className="text-sm font-medium">
            How do you maintain neutrality when mediating conflicts between team members?
          </Label>
          <Textarea
            id="neutrality"
            placeholder="Example: CHALLENGES TO NEUTRALITY: 1. When I have a personal relationship with one party. 2. When I witnessed the incident and have my own opinion. 3. When one person is clearly a better performer. STRATEGIES FOR NEUTRALITY: 1. LANGUAGE CHOICES - Use 'I hear you saying...' instead of 'You're right.' Avoid taking sides with phrases like 'I understand both perspectives.' 2. EQUAL TIME - Give each person the same amount of speaking time and attention. 3. FOCUS ON BEHAVIOR - Address specific actions and their impact, not character judgments. 4. ASK QUESTIONS - 'What would help resolve this?' rather than giving my solution. 5. ACKNOWLEDGE BOTH SIDES - 'I can see why you'd feel that way' to both parties. 6. WHEN I CAN'T BE NEUTRAL - If I'm too involved, ask assistant manager to mediate or bring in district manager..."
            value={formData.neutrality || ''}
            onChange={(e) => updateField('neutrality', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Guiding to Solutions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Facilitating Self-Generated Solutions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="facilitatingSolutions" className="text-sm font-medium">
            How do you guide conflicting parties to find their own solutions rather than imposing your ideas?
          </Label>
          <Textarea
            id="facilitatingSolutions"
            placeholder="Example: QUESTIONING TECHNIQUES: 1. 'What would need to happen for this to work better?' 2. 'If you were in their shoes, what would you want?' 3. 'What are some options we haven't considered?' 4. 'What would a win-win solution look like?' BUILDING ON THEIR IDEAS: 1. 'That's an interesting idea, tell me more about how that would work.' 2. 'What would need to be in place for that solution to succeed?' 3. 'How could we modify that idea to address both concerns?' AVOIDING MY SOLUTIONS: 1. Resist the urge to jump in with 'Here's what you should do.' 2. If they're stuck, offer multiple options: 'Some teams have tried A, B, or C. What appeals to you?' 3. Let them choose between alternatives rather than giving one answer. OWNERSHIP: When they generate the solution, they're more committed to making it work..."
            value={formData.facilitatingSolutions || ''}
            onChange={(e) => updateField('facilitatingSolutions', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Mediation Practice Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Mediation Practice & Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="mediationPractice" className="text-sm font-medium">
            Describe a conflict you mediated using these techniques and the outcome
          </Label>
          <Textarea
            id="mediationPractice"
            placeholder="Example: SITUATION: Two team members (Alex and Jordan) arguing about closing duties - each thought the other wasn't doing their fair share. MEDIATION PROCESS: 1. Separated them during the conflict and scheduled individual meetings. 2. Listened to each perspective separately - Alex felt Jordan left early tasks for him, Jordan felt Alex was nitpicking. 3. Found common ground - both wanted to get home at reasonable time and have clean restaurant. 4. Brought them together and asked 'What would make closing duties feel fair to both of you?' 5. They generated solution: create detailed closing checklist with time estimates, rotate who does which tasks weekly. OUTCOME: Conflict resolved, they now work well together. They felt ownership of the solution because they created it. LESSONS LEARNED: Staying neutral was hard because I initially agreed with Alex, but letting them solve it themselves worked better than my imposed solution..."
            value={formData.mediationPractice || ''}
            onChange={(e) => updateField('mediationPractice', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
