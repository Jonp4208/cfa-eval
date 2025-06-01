import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Ear, MessageCircle, CheckCircle, Users } from 'lucide-react'

interface ActiveListeningConflictFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ActiveListeningConflictForm({ value, onChange }: ActiveListeningConflictFormProps) {
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
      {/* Active Listening Techniques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Ear className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Active Listening Techniques for Conflict</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="listeningTechniques" className="text-sm font-medium">
            Describe the active listening techniques you learned and how you'll apply them during conflicts
          </Label>
          <Textarea
            id="listeningTechniques"
            placeholder="Example: 1. FULL ATTENTION - Put away phone, face the person directly, maintain appropriate eye contact. In our busy restaurant, I'll step away from the floor to give my full focus. 2. PARAPHRASING - 'What I hear you saying is...' to confirm understanding. Example: 'So you feel frustrated because you think the kitchen isn't communicating order changes clearly?' 3. EMOTIONAL LABELING - 'It sounds like you're feeling...' to acknowledge emotions. 'You seem really stressed about the scheduling situation.' 4. ASKING CLARIFYING QUESTIONS - 'Can you help me understand...' or 'What would that look like?' to get more details. 5. AVOIDING INTERRUPTIONS - Let them finish completely before responding, even if I disagree. 6. REFLECTING BACK - 'I can see why that would be frustrating' to show empathy..."
            value={formData.listeningTechniques || ''}
            onChange={(e) => updateField('listeningTechniques', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Barriers to Listening */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Overcoming Listening Barriers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="listeningBarriers" className="text-sm font-medium">
            What barriers prevent effective listening during conflicts and how will you overcome them?
          </Label>
          <Textarea
            id="listeningBarriers"
            placeholder="Example: BARRIERS I FACE: 1. Preparing My Response - While they're talking, I'm thinking about what to say next instead of truly listening. 2. Emotional Reactions - When someone criticizes my decisions, I get defensive and stop listening. 3. Time Pressure - During busy periods, I rush conversations and don't give people time to fully explain. 4. Assumptions - I think I know what they're going to say based on past conversations. SOLUTIONS: 1. Practice the 'Pause Rule' - Count to 3 after they finish before responding. 2. Use the 'Curious Mindset' - Ask myself 'What can I learn from this?' instead of 'How do I defend myself?' 3. Schedule Proper Time - Move conflict conversations to slower periods or break room. 4. Check My Assumptions - Ask 'Is this similar to last time or something new?'"
            value={formData.listeningBarriers || ''}
            onChange={(e) => updateField('listeningBarriers', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Practice Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Listening Practice in Real Situations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="practiceScenarios" className="text-sm font-medium">
            Describe how you practiced active listening in actual conflict situations
          </Label>
          <Textarea
            id="practiceScenarios"
            placeholder="Example: SCENARIO 1: Two team members arguing about cleaning responsibilities. I practiced: Listening to each person separately without interrupting, paraphrasing their concerns back to them, asking clarifying questions like 'What would fair distribution look like to you?' Result: Discovered the real issue was unclear expectations, not laziness. SCENARIO 2: Kitchen staff frustrated with front-of-house order changes. I practiced: Acknowledging their emotions ('I can see this is really frustrating'), asking for specific examples, reflecting back what I heard. Result: Identified need for better communication system during rush periods. SCENARIO 3: Team member upset about schedule changes. I practiced: Giving full attention despite being busy, asking open-ended questions, summarizing their concerns before offering solutions..."
            value={formData.practiceScenarios || ''}
            onChange={(e) => updateField('practiceScenarios', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Improvement Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Listening Skills Development Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvementPlan" className="text-sm font-medium">
            How will you continue developing your active listening skills in conflict situations?
          </Label>
          <Textarea
            id="improvementPlan"
            placeholder="Example: DAILY PRACTICE: 1. Start each shift by reminding myself to listen first, respond second. 2. Practice paraphrasing in non-conflict conversations to build the habit. 3. End each difficult conversation by asking 'Did I understand you correctly?' WEEKLY GOALS: 1. Have at least one conversation where I only ask questions and don't give advice. 2. Practice emotional labeling with team members during regular check-ins. 3. Ask for feedback: 'Did you feel heard in our conversation?' MONTHLY DEVELOPMENT: 1. Role-play conflict scenarios with assistant manager to practice listening skills. 2. Review challenging conversations and identify where I could have listened better. 3. Read one article or watch one video about listening skills. MEASUREMENT: Track how often conflicts are resolved in first conversation vs. needing multiple discussions..."
            value={formData.improvementPlan || ''}
            onChange={(e) => updateField('improvementPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
