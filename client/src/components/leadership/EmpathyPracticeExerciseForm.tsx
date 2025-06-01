import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Users, Eye, Target } from 'lucide-react'

interface EmpathyPracticeExerciseFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmpathyPracticeExerciseForm({ value, onChange }: EmpathyPracticeExerciseFormProps) {
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
      {/* Team Member Empathy Practice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Team Member Empathy Exercises</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEmpathy" className="text-sm font-medium">
            Describe empathy exercises you practiced with different team members and what you learned
          </Label>
          <Textarea
            id="teamEmpathy"
            placeholder="Example: EXERCISE 1: Perspective-Taking with Struggling Employee - I spent time with Maria who's been making mistakes. Instead of focusing on performance, I asked about her experience. Learned she's overwhelmed by new POS system and afraid to ask questions. I felt her frustration and fear of looking incompetent. EXERCISE 2: Understanding High Performer's Frustration - Talked with David who seemed irritated lately. Discovered he's frustrated carrying extra load when others call out. I felt his sense of unfairness and being taken advantage of. EXERCISE 3: New Employee Anxiety - Observed Jessica's body language during training. Noticed she seemed nervous and hesitant. Asked about her experience and learned she's worried about keeping up during rush. I remembered my own first-job anxiety. INSIGHTS: Each person has valid reasons for their behavior. Taking time to understand their perspective changes how I respond to them..."
            value={formData.teamEmpathy || ''}
            onChange={(e) => updateField('teamEmpathy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Customer Empathy Practice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Customer Empathy Development</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="customerEmpathy" className="text-sm font-medium">
            How did you practice empathy with different types of customers and what did you discover?
          </Label>
          <Textarea
            id="customerEmpathy"
            placeholder="Example: FRUSTRATED CUSTOMER - Guest upset about 10-minute wait during lunch rush. Instead of defending our speed, I imagined being on limited lunch break, worried about getting back to work late. I felt their time pressure and stress. Response: Apologized for the wait, offered to expedite their order, gave them a drink while waiting. CELEBRATING CUSTOMER - Family with young child having birthday. I noticed their excitement and joy, remembered how special restaurant birthdays felt as a kid. Response: Brought special dessert with candle, had team sing happy birthday. TIRED PARENT - Single mom with three kids looking overwhelmed. I imagined juggling multiple children while trying to order food. Felt her exhaustion and need for patience. Response: Helped carry their tray, offered high chair, checked if they needed anything else. LEARNING: When I truly imagine their situation, my responses become more caring and appropriate..."
            value={formData.customerEmpathy || ''}
            onChange={(e) => updateField('customerEmpathy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Empathy Barriers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Overcoming Empathy Challenges</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="empathyBarriers" className="text-sm font-medium">
            What barriers prevent you from being empathetic and how are you working to overcome them?
          </Label>
          <Textarea
            id="empathyBarriers"
            placeholder="Example: BARRIERS I IDENTIFIED: 1. Time Pressure - During busy periods, I focus on speed over connection and miss emotional cues. 2. Judgment - When someone complains about something that seems minor to me, I dismiss their feelings. 3. Personal Stress - When I'm having a bad day, I have less emotional energy for others. 4. Assumptions - I assume I know why someone is acting a certain way without asking. STRATEGIES TO OVERCOME: 1. Pause Practice - Take 2 seconds to read the person's emotional state before responding, even when busy. 2. Curiosity Over Judgment - Ask myself 'What might be going on for them?' instead of 'Why are they overreacting?' 3. Self-Care - Manage my own stress better so I have emotional capacity for others. 4. Check Assumptions - Ask questions like 'How are you feeling about this?' rather than assuming..."
            value={formData.empathyBarriers || ''}
            onChange={(e) => updateField('empathyBarriers', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Daily Empathy Practice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Daily Empathy Practice Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="dailyPractice" className="text-sm font-medium">
            How will you continue practicing and developing empathy in your daily restaurant leadership?
          </Label>
          <Textarea
            id="dailyPractice"
            placeholder="Example: MORNING ROUTINE: Start each shift by observing team members' energy and mood. Ask 'How's everyone doing today?' and really listen to answers. DURING INTERACTIONS: 1. Before responding to complaints or concerns, pause and ask 'What might they be feeling right now?' 2. Practice perspective-taking: 'If I were in their situation, what would I need?' 3. Use empathetic language: 'That sounds frustrating' or 'I can see why you'd feel that way.' EVENING REFLECTION: End each shift by thinking about one empathetic interaction I had and one I could have handled better. WEEKLY GOALS: 1. Have at least 3 conversations where I focus more on understanding than solving. 2. Practice empathy with one difficult person each week. 3. Ask team members how they're feeling, not just how work is going. MEASUREMENT: Track how often conflicts are resolved positively and whether team members come to me with personal concerns..."
            value={formData.dailyPractice || ''}
            onChange={(e) => updateField('dailyPractice', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
