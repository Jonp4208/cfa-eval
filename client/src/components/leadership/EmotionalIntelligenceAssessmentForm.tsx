import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BarChart3, Target, TrendingUp, CheckCircle } from 'lucide-react'

interface EmotionalIntelligenceAssessmentFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmotionalIntelligenceAssessmentForm({ value, onChange }: EmotionalIntelligenceAssessmentFormProps) {
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
      {/* Assessment Results Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">EQ Assessment Results Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="assessmentResults" className="text-sm font-medium">
            Summarize your EQ assessment results across the four domains (rate each 1-10 and explain)
          </Label>
          <Textarea
            id="assessmentResults"
            placeholder="Example: SELF-AWARENESS (7/10) - I'm generally good at recognizing my emotions as they happen, especially stress and frustration. However, I sometimes don't notice subtle mood changes that affect my interactions. SELF-MANAGEMENT (6/10) - I can control my emotions most of the time, but during extremely busy periods or when dealing with difficult customers, I sometimes react too quickly. Need to work on pause-and-breathe techniques. SOCIAL AWARENESS (8/10) - This is my strongest area. I'm good at reading team members' emotions and noticing when guests are upset or happy. I pick up on non-verbal cues well. RELATIONSHIP MANAGEMENT (7/10) - I build good relationships with most people, but I struggle with difficult conversations and sometimes avoid conflict instead of addressing it constructively..."
            value={formData.assessmentResults || ''}
            onChange={(e) => updateField('assessmentResults', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Strongest Areas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">EQ Strengths in Restaurant Leadership</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="eqStrengths" className="text-sm font-medium">
            What are your strongest EQ areas and how do they help you as a restaurant leader?
          </Label>
          <Textarea
            id="eqStrengths"
            placeholder="Example: 1. Empathy with Team Members - I can sense when someone is having a bad day or struggling with personal issues. This helps me adjust my expectations and provide support when needed. For example, when I noticed Sarah seemed distracted, I discovered she was worried about her sick child and arranged for her to leave early. 2. Reading Customer Emotions - I'm good at recognizing when guests are frustrated, excited, or celebrating something special. This allows me to adjust my service approach - being extra patient with upset customers or celebrating with happy ones. 3. Emotional Contagion Awareness - I understand how my mood affects the team, so I work hard to maintain positive energy even when I'm stressed. When I stay upbeat during busy periods, the whole team performs better..."
            value={formData.eqStrengths || ''}
            onChange={(e) => updateField('eqStrengths', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Development Areas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">EQ Development Priorities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="developmentAreas" className="text-sm font-medium">
            What are your weakest EQ areas and how do they impact your restaurant leadership?
          </Label>
          <Textarea
            id="developmentAreas"
            placeholder="Example: 1. Emotional Self-Control Under Pressure - During extremely busy periods or when multiple things go wrong, I sometimes become visibly stressed and short with team members. This creates tension and makes everyone more anxious. I need to develop better stress management techniques. 2. Difficult Conversations - I tend to avoid confronting team members about performance issues because I don't want to hurt their feelings. This allows problems to continue and sometimes makes situations worse. I need to learn how to have caring but direct conversations. 3. Managing My Perfectionism - When things aren't done exactly as I want, I can become frustrated and take over tasks instead of coaching team members. This prevents their growth and creates dependency on me..."
            value={formData.developmentAreas || ''}
            onChange={(e) => updateField('developmentAreas', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* 90-Day Development Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">90-Day EQ Development Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="developmentPlan" className="text-sm font-medium">
            Create a specific 90-day plan to improve your weakest EQ areas
          </Label>
          <Textarea
            id="developmentPlan"
            placeholder="Example: Days 1-30: STRESS MANAGEMENT FOCUS - Practice 3-breath technique before responding to stressful situations. Set phone reminders to check emotional state every 2 hours. End each shift with 5-minute reflection on emotional challenges. Days 31-60: DIFFICULT CONVERSATIONS - Schedule one coaching conversation per week with team members who need feedback. Practice using 'SBI' model (Situation-Behavior-Impact) for giving feedback. Role-play difficult scenarios with assistant manager. Days 61-90: PATIENCE & COACHING - When I notice myself wanting to take over a task, pause and ask 'How can I help this person learn?' Give team members 3 attempts before stepping in. Celebrate improvement efforts, not just perfect results. Throughout: Daily emotional check-ins with myself and key team members, weekly EQ goal review..."
            value={formData.developmentPlan || ''}
            onChange={(e) => updateField('developmentPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
