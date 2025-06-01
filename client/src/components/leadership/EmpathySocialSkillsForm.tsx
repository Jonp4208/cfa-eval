import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Users, Eye, Target } from 'lucide-react'

interface EmpathySocialSkillsFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmpathySocialSkillsForm({ value, onChange }: EmpathySocialSkillsFormProps) {
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
      {/* Key Insights from Video */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Daniel Goleman's Key Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyInsights" className="text-sm font-medium">
            What were the most important insights about empathy and social skills from Daniel Goleman's presentation?
          </Label>
          <Textarea
            id="keyInsights"
            placeholder="Example: 1. EMPATHY IS LEARNABLE - Goleman emphasized that empathy isn't just a natural trait but a skill that can be developed through practice and conscious effort. 2. SOCIAL AWARENESS DRIVES PERFORMANCE - Teams with leaders who can read emotions and social dynamics perform significantly better than those without. 3. EMOTIONAL CONTAGION - As a leader, my emotions spread to my team, so managing my own emotional state directly impacts team performance. 4. LISTENING FOR EMOTIONS - True empathy requires listening not just to words but to the emotions behind them. 5. RELATIONSHIP MANAGEMENT - Building strong relationships requires understanding what motivates each individual team member and adapting my approach accordingly..."
            value={formData.keyInsights || ''}
            onChange={(e) => updateField('keyInsights', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Social Awareness Development */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Developing Social Awareness in Restaurant</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="socialAwareness" className="text-sm font-medium">
            How will you apply Goleman's strategies to improve your social awareness with team members and customers?
          </Label>
          <Textarea
            id="socialAwareness"
            placeholder="Example: TEAM MEMBER SOCIAL AWARENESS: 1. Daily Emotional Check-ins - Start each shift by observing team members' energy levels and asking 'How's everyone feeling today?' 2. Non-verbal Cue Reading - Practice noticing body language, facial expressions, and tone of voice changes that indicate stress, frustration, or excitement. 3. Individual Motivation Mapping - Learn what motivates each team member (recognition, growth, flexibility, etc.) and adapt my leadership style accordingly. CUSTOMER SOCIAL AWARENESS: 1. Emotional State Recognition - Train myself to quickly assess if customers are rushed, celebrating, frustrated, or relaxed and adjust service approach. 2. Family Dynamics Observation - Notice family interactions to provide appropriate service (patient with children, celebratory for special occasions). 3. Cultural Sensitivity - Be aware of different communication styles and preferences among diverse customer base..."
            value={formData.socialAwareness || ''}
            onChange={(e) => updateField('socialAwareness', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Relationship Management Strategies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Relationship Management Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="relationshipManagement" className="text-sm font-medium">
            How will you use empathy and social skills to build stronger relationships with your team?
          </Label>
          <Textarea
            id="relationshipManagement"
            placeholder="Example: INDIVIDUAL RELATIONSHIP BUILDING: 1. Personal Connection - Learn about team members' goals, interests, and challenges outside work. Remember important events in their lives. 2. Adaptive Communication - Adjust my communication style based on each person's preferences (some need direct feedback, others need encouragement first). 3. Conflict Resolution - Use empathy to understand all perspectives before addressing team conflicts. TEAM RELATIONSHIP BUILDING: 1. Emotional Climate Management - Monitor and actively improve the emotional atmosphere during shifts. 2. Celebration and Recognition - Recognize achievements in ways that resonate with each individual (public praise for some, private recognition for others). 3. Support During Stress - Provide emotional support during busy periods, personal challenges, or difficult customer interactions. 4. Trust Building - Be vulnerable about my own challenges and mistakes to create psychological safety..."
            value={formData.relationshipManagement || ''}
            onChange={(e) => updateField('relationshipManagement', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">30-Day Empathy & Social Skills Practice Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a specific 30-day plan to practice and develop your empathy and social skills
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Example: WEEK 1: OBSERVATION FOCUS - Practice reading non-verbal cues without acting on them yet. Spend 5 minutes each shift consciously observing team member and customer emotions. End each day by noting what I observed. WEEK 2: EMPATHETIC LISTENING - Focus on listening for emotions behind words. Practice reflecting back what I hear: 'It sounds like you're feeling...' Ask follow-up questions to understand perspectives better. WEEK 3: ADAPTIVE RESPONSES - Begin adjusting my communication and leadership style based on what I've learned about each team member. Experiment with different approaches for different personalities. WEEK 4: RELATIONSHIP BUILDING - Implement specific relationship-building actions: personal check-ins, individualized recognition, conflict resolution using empathy. DAILY PRACTICES: Morning intention setting, midday emotional climate check, evening reflection on empathetic interactions..."
            value={formData.implementationPlan || ''}
            onChange={(e) => updateField('implementationPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
