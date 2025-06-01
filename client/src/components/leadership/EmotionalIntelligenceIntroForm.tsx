import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Heart, Users, Target } from 'lucide-react'

interface EmotionalIntelligenceIntroFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmotionalIntelligenceIntroForm({ value, onChange }: EmotionalIntelligenceIntroFormProps) {
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
      {/* Four Domains Understanding */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Four Domains of Emotional Intelligence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="fourDomains" className="text-sm font-medium">
            Explain the four domains of EQ from Daniel Goleman and how each applies to restaurant leadership
          </Label>
          <Textarea
            id="fourDomains"
            placeholder="Example: 1. Self-Awareness - Understanding my emotions and triggers as a restaurant leader. When I feel stressed during rush periods, I recognize it and take a deep breath before reacting. This helps me stay calm and make better decisions. 2. Self-Management - Controlling my emotional responses, especially during challenging situations like customer complaints or team conflicts. Instead of getting frustrated, I pause and respond thoughtfully. 3. Social Awareness - Reading the emotions of my team members and guests. I notice when a team member seems overwhelmed or when a guest appears dissatisfied, allowing me to address issues proactively. 4. Relationship Management - Using emotional insights to build stronger relationships with my team and create positive interactions with guests..."
            value={formData.fourDomains || ''}
            onChange={(e) => updateField('fourDomains', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Workplace Emotions Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Managing Emotions in Restaurant Environment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="emotionManagement" className="text-sm font-medium">
            How will you apply Daniel Goleman's insights to manage emotions in your restaurant's fast-paced environment?
          </Label>
          <Textarea
            id="emotionManagement"
            placeholder="Example: In our fast-paced restaurant environment, I'll implement several strategies: 1. Morning Emotional Check-ins - Start each shift by assessing my emotional state and that of my team. If someone seems stressed or upset, I'll address it before it affects performance. 2. Pressure Response Protocol - During busy periods, I'll use breathing techniques to stay calm and model emotional regulation for my team. 3. Conflict De-escalation - When tensions arise between team members or with difficult customers, I'll use empathy to understand all perspectives before responding. 4. Positive Emotional Contagion - Maintain an upbeat, positive attitude that spreads to the team, especially during challenging shifts. 5. End-of-Shift Reflection - Take time to process emotional events from the day and learn from them..."
            value={formData.emotionManagement || ''}
            onChange={(e) => updateField('emotionManagement', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team EQ Development */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Building Team Emotional Intelligence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEQDevelopment" className="text-sm font-medium">
            How will you help your team develop emotional intelligence skills for better customer service and teamwork?
          </Label>
          <Textarea
            id="teamEQDevelopment"
            placeholder="Example: I'll help my team develop EQ through: 1. Daily Emotional Awareness Training - During huddles, discuss how emotions affect customer interactions and teach team members to recognize their emotional states. 2. Customer Empathy Exercises - Role-play scenarios where team members practice reading customer emotions and responding appropriately. 3. Stress Management Techniques - Teach simple breathing exercises and stress-relief methods for busy periods. 4. Emotional Vocabulary Building - Help team members identify and name their emotions more precisely, leading to better self-awareness. 5. Peer Support System - Create buddy partnerships where team members check in on each other's emotional well-being during shifts. 6. Recognition of Emotional Intelligence - Celebrate team members who demonstrate high EQ in customer interactions or conflict resolution..."
            value={formData.teamEQDevelopment || ''}
            onChange={(e) => updateField('teamEQDevelopment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Personal EQ Goals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Personal EQ Development Goals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="personalGoals" className="text-sm font-medium">
            Based on the video, what are your top 3 emotional intelligence development goals as a restaurant leader?
          </Label>
          <Textarea
            id="personalGoals"
            placeholder="Example: 1. Improve Self-Regulation During Peak Hours - I want to better manage my stress and frustration during our busiest periods. I'll practice the pause-and-breathe technique before responding to challenges, and work on maintaining a calm demeanor that helps my team stay focused. 2. Enhance Empathy with Struggling Team Members - I want to get better at recognizing when team members are having personal difficulties and respond with compassion rather than just focusing on performance. I'll practice active listening and ask more supportive questions. 3. Develop Better Social Awareness with Guests - I want to improve my ability to read customer emotions and respond appropriately. This includes recognizing when guests are frustrated, celebrating with them during special occasions, and adjusting my communication style based on their emotional state..."
            value={formData.personalGoals || ''}
            onChange={(e) => updateField('personalGoals', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
