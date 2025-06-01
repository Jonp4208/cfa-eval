import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Pause, Shield, TrendingUp } from 'lucide-react'

interface EmotionalRegulationTechniquesFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmotionalRegulationTechniquesForm({ value, onChange }: EmotionalRegulationTechniquesFormProps) {
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
      {/* Regulation Techniques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Emotional Regulation Strategies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="regulationTechniques" className="text-sm font-medium">
            What emotional regulation techniques did you learn and how will you apply them in restaurant situations?
          </Label>
          <Textarea
            id="regulationTechniques"
            placeholder="Example: 1. PAUSE & BREATHE - When I feel anger or frustration rising, take 3 deep breaths before responding. Use this when customers complain or team members make mistakes. 2. COGNITIVE REFRAMING - Change my internal narrative. Instead of 'This customer is being unreasonable,' think 'This customer is having a bad day and needs help.' 3. EMOTIONAL LABELING - Name what I'm feeling: 'I'm feeling overwhelmed right now.' This helps me gain control over the emotion. 4. PHYSICAL TECHNIQUES - Step away briefly, stretch, or do shoulder rolls to release physical tension during stressful moments. 5. PERSPECTIVE-TAKING - Ask 'Will this matter in a week?' to put minor frustrations in context. 6. POSITIVE SELF-TALK - Replace 'I can't handle this' with 'I've handled challenges before and I can handle this too.'"
            value={formData.regulationTechniques || ''}
            onChange={(e) => updateField('regulationTechniques', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Trigger Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Managing Emotional Triggers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="triggerManagement" className="text-sm font-medium">
            How will you manage your specific emotional triggers in the restaurant environment?
          </Label>
          <Textarea
            id="triggerManagement"
            placeholder="Example: MY TRIGGERS & MANAGEMENT STRATEGIES: 1. CUSTOMER COMPLAINTS - Trigger: Feel defensive and want to justify. Strategy: Remind myself 'Their complaint isn't about me personally' and focus on solving their problem. 2. TEAM MEMBER MISTAKES - Trigger: Frustration and impatience. Strategy: Pause and ask 'Is this a training opportunity?' before reacting. 3. EQUIPMENT FAILURES - Trigger: Panic and stress. Strategy: Take 3 breaths and think 'What's the workaround?' instead of focusing on the problem. 4. BUSY PERIODS - Trigger: Feeling overwhelmed. Strategy: Break tasks into smaller steps and remind myself 'One thing at a time.' 5. CRITICISM FROM SUPERIORS - Trigger: Defensiveness. Strategy: Listen for the learning opportunity and ask clarifying questions instead of defending immediately..."
            value={formData.triggerManagement || ''}
            onChange={(e) => updateField('triggerManagement', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Stress Response Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">High-Stress Situation Protocol</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="stressProtocol" className="text-sm font-medium">
            Create a specific protocol for managing your emotions during high-stress restaurant situations
          </Label>
          <Textarea
            id="stressProtocol"
            placeholder="Example: IMMEDIATE RESPONSE (First 30 seconds): 1. Notice the stress signal (tight chest, clenched jaw, racing thoughts). 2. Take 3 deep breaths - in for 4 counts, hold for 4, out for 6. 3. Remind myself: 'I can handle this situation.' SHORT-TERM MANAGEMENT (Next 5 minutes): 1. Assess the situation objectively: 'What actually needs to be done right now?' 2. Prioritize tasks: 'What's most urgent vs. what feels urgent?' 3. Delegate if possible: 'Who can help with this?' 4. Communicate calmly with team: 'Here's what we need to focus on.' RECOVERY PHASE (After situation): 1. Take 2 minutes to decompress - step outside or to office. 2. Reflect: 'What went well? What could I handle better next time?' 3. Check in with team: 'How is everyone doing after that rush?' 4. Practice self-compassion: 'That was challenging and I did my best.'"
            value={formData.stressProtocol || ''}
            onChange={(e) => updateField('stressProtocol', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Practice Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Regulation Practice & Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="practiceResults" className="text-sm font-medium">
            Describe situations where you practiced emotional regulation and the outcomes
          </Label>
          <Textarea
            id="practiceResults"
            placeholder="Example: SITUATION 1: Angry customer yelling about wrong order during lunch rush. OLD RESPONSE: Would have felt defensive and rushed to fix it while feeling stressed. NEW RESPONSE: Took 3 breaths, reminded myself 'This isn't personal,' listened to their concern, apologized sincerely, and fixed the order calmly. OUTCOME: Customer calmed down and thanked me for handling it well. SITUATION 2: Team member called out last minute on busy Saturday. OLD RESPONSE: Would have felt frustrated and complained to other team members. NEW RESPONSE: Noticed my frustration, took a moment to reframe: 'Emergencies happen, how can we adapt?' OUTCOME: Stayed positive, team rallied together, and we had a successful shift despite being short-staffed. LEARNING: When I manage my emotions better, it positively affects everyone around me. The team stays calmer and customers have better experiences."
            value={formData.practiceResults || ''}
            onChange={(e) => updateField('practiceResults', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
