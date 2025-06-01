import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Users, MessageSquare, Target } from 'lucide-react'

interface ConflictResolutionFundamentalsFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ConflictResolutionFundamentalsForm({ value, onChange }: ConflictResolutionFundamentalsFormProps) {
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
      {/* Conflict Types in Restaurant */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Common Restaurant Conflicts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="conflictTypes" className="text-sm font-medium">
            Identify the most common types of conflicts in your restaurant and their typical causes
          </Label>
          <Textarea
            id="conflictTypes"
            placeholder="Example: 1. SCHEDULING CONFLICTS - Team members arguing over shift assignments, time-off requests, or coverage responsibilities. Often caused by unclear policies or perceived unfairness. 2. PERFORMANCE DISPUTES - Conflicts between high and low performers, with productive team members frustrated by those who don't pull their weight. 3. CUSTOMER SERVICE DISAGREEMENTS - Team members having different approaches to handling difficult customers, leading to inconsistent service. 4. KITCHEN VS. FRONT-OF-HOUSE TENSIONS - Communication breakdowns between kitchen and service staff during busy periods, blame for order mistakes. 5. PERSONALITY CLASHES - Personal differences between team members affecting work relationships and team dynamics. 6. RESOURCE COMPETITION - Arguments over equipment, supplies, or preferred work stations..."
            value={formData.conflictTypes || ''}
            onChange={(e) => updateField('conflictTypes', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Early Warning Signs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Recognizing Conflict Early</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="warningSignsRecognition" className="text-sm font-medium">
            What are the early warning signs of conflict in your restaurant, and how do you recognize them?
          </Label>
          <Textarea
            id="warningSignsRecognition"
            placeholder="Example: 1. COMMUNICATION CHANGES - Team members stop talking to each other, use short/curt responses, or avoid working together. I notice when people who usually chat become silent around each other. 2. BODY LANGUAGE SHIFTS - Crossed arms, eye rolling, turning away when certain people speak, or tense facial expressions during interactions. 3. PERFORMANCE IMPACTS - Decreased teamwork, slower service, more mistakes when certain people work together, or reluctance to help each other. 4. GOSSIP INCREASE - More complaints about specific team members, side conversations, or people asking to not be scheduled with certain individuals. 5. CUSTOMER COMPLAINTS - Guests noticing tension between staff or inconsistent service when certain teams work together. 6. ATTENDANCE ISSUES - Team members calling out more frequently when scheduled with specific people..."
            value={formData.warningSignsRecognition || ''}
            onChange={(e) => updateField('warningSignsRecognition', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Intervention Strategies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">When and How to Intervene</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="interventionStrategies" className="text-sm font-medium">
            Describe your approach for deciding when to intervene in conflicts and your intervention strategies
          </Label>
          <Textarea
            id="interventionStrategies"
            placeholder="Example: WHEN TO INTERVENE: 1. Immediately - When conflict affects customer service, creates safety issues, or involves harassment/discrimination. 2. Within 24 hours - When team members stop communicating effectively or performance suffers. 3. Before next shift - When tension is visible but not yet impacting work quality. HOW TO INTERVENE: 1. PRIVATE CONVERSATIONS FIRST - Speak with each person individually to understand their perspective before bringing them together. 2. NEUTRAL LOCATION - Use office or break room, not the floor where others can overhear. 3. FOCUS ON BEHAVIOR - Address specific actions and their impact, not personality traits. 4. SEEK SOLUTIONS - Ask 'What would help resolve this?' rather than just identifying problems. 5. FOLLOW-UP - Check in within a week to ensure resolution is working..."
            value={formData.interventionStrategies || ''}
            onChange={(e) => updateField('interventionStrategies', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Prevention Strategies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Conflict Prevention Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="preventionStrategies" className="text-sm font-medium">
            What strategies will you implement to prevent conflicts before they start?
          </Label>
          <Textarea
            id="preventionStrategies"
            placeholder="Example: 1. CLEAR EXPECTATIONS - Create written job descriptions, service standards, and behavioral expectations so everyone knows what's expected. 2. FAIR SCHEDULING PRACTICES - Use transparent scheduling system, rotate undesirable shifts, and have clear time-off request procedures. 3. REGULAR CHECK-INS - Weekly one-on-ones with team members to address concerns before they become conflicts. 4. TEAM BUILDING ACTIVITIES - Monthly team meetings with fun activities to build relationships and improve communication. 5. COMMUNICATION TRAINING - Teach team members how to give and receive feedback constructively, and how to address concerns directly. 6. RECOGNITION PROGRAMS - Celebrate teamwork and collaboration to reinforce positive behaviors. 7. STRESS MANAGEMENT - Provide tools and support for managing busy period stress that often triggers conflicts..."
            value={formData.preventionStrategies || ''}
            onChange={(e) => updateField('preventionStrategies', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
