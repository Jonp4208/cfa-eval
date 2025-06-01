import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Shield, MessageSquare, Users, CheckCircle } from 'lucide-react'

interface ConflictPreventionSystemFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ConflictPreventionSystemForm({ value, onChange }: ConflictPreventionSystemFormProps) {
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
      {/* Communication Protocols */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Clear Communication Protocols</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="communicationProtocols" className="text-sm font-medium">
            Design communication protocols to prevent misunderstandings and conflicts
          </Label>
          <Textarea
            id="communicationProtocols"
            placeholder="Example: DAILY COMMUNICATION STRUCTURE: 1. Shift Huddles - 5-minute team meetings at start of each shift to share priorities, special instructions, and address any concerns. 2. Kitchen-FOH Communication - Standardized system for order modifications using specific terminology and written tickets. 3. Feedback Protocol - 'SBI' method (Situation-Behavior-Impact) for giving constructive feedback instead of personal criticism. CONFLICT PREVENTION COMMUNICATION: 1. Open Door Policy - Team members can approach me with concerns before they become conflicts. 2. Weekly Check-ins - Brief one-on-one conversations with each team member to address issues early. 3. Anonymous Suggestion System - Way for team to raise concerns without fear of retaliation. 4. Clear Expectations - Written job descriptions and performance standards so everyone knows what's expected. 5. Regular Team Meetings - Monthly meetings to discuss operational improvements and address systemic issues..."
            value={formData.communicationProtocols || ''}
            onChange={(e) => updateField('communicationProtocols', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Early Warning System */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Early Intervention Strategies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="earlyIntervention" className="text-sm font-medium">
            How will you identify and address potential conflicts before they escalate?
          </Label>
          <Textarea
            id="earlyIntervention"
            placeholder="Example: EARLY WARNING SIGNS MONITORING: 1. Behavioral Changes - Watch for team members who stop talking to each other, avoid working together, or show changes in attitude. 2. Performance Indicators - Notice when teamwork decreases, mistakes increase, or customer service suffers. 3. Team Member Reports - Encourage team to bring concerns about interpersonal issues to my attention early. INTERVENTION STRATEGIES: 1. Immediate Response - Address tension as soon as I notice it, don't wait for it to escalate. 2. Private Conversations - Meet with involved parties separately first to understand perspectives. 3. Mediation Offer - Facilitate conversation between parties before positions harden. 4. Root Cause Focus - Address underlying issues (workload, unclear expectations, personality conflicts) rather than just symptoms. 5. Follow-up Plan - Check back within 48 hours to ensure intervention was effective. 6. Documentation - Keep notes on interventions to identify patterns and improve prevention strategies..."
            value={formData.earlyIntervention || ''}
            onChange={(e) => updateField('earlyIntervention', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Building & Culture */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Positive Culture Development</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="cultureDevelopment" className="text-sm font-medium">
            What specific strategies will you use to build a positive team culture that prevents conflicts?
          </Label>
          <Textarea
            id="cultureDevelopment"
            placeholder="Example: TEAM BUILDING INITIATIVES: 1. Monthly Team Activities - Fun activities outside work hours to build personal relationships (bowling, team dinners, volunteer projects). 2. Recognition Programs - Celebrate teamwork and collaboration, not just individual performance. 3. Shared Goals - Create team challenges that require cooperation (customer satisfaction targets, efficiency goals). CULTURAL VALUES: 1. Respect and Inclusion - Zero tolerance for disrespectful behavior, celebrate diversity, ensure everyone feels valued. 2. Open Communication - Encourage honest feedback, admit mistakes openly, ask for help when needed. 3. Mutual Support - 'We succeed together' mentality, help struggling team members rather than criticizing. 4. Continuous Learning - Frame mistakes as learning opportunities, encourage skill development. CONFLICT PREVENTION PRACTICES: 1. Fair Scheduling - Transparent scheduling process, rotate undesirable shifts, accommodate reasonable requests. 2. Clear Role Definitions - Prevent territorial disputes by clearly defining responsibilities. 3. Stress Management - Provide tools and support for managing busy period stress that often triggers conflicts..."
            value={formData.cultureDevelopment || ''}
            onChange={(e) => updateField('cultureDevelopment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* System Implementation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Prevention System Implementation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="systemImplementation" className="text-sm font-medium">
            Create a timeline and action plan for implementing your conflict prevention system
          </Label>
          <Textarea
            id="systemImplementation"
            placeholder="Example: WEEK 1-2: FOUNDATION SETUP - Introduce communication protocols to team, establish daily huddle routine, create feedback forms and suggestion system. WEEK 3-4: TRAINING IMPLEMENTATION - Train team on SBI feedback method, practice conflict resolution scenarios, establish weekly check-in schedule. MONTH 2: CULTURE BUILDING - Launch recognition program, plan first team building activity, implement fair scheduling system. MONTH 3: MONITORING & ADJUSTMENT - Assess effectiveness of prevention strategies, gather team feedback on system, make necessary adjustments. ONGOING PRACTICES: 1. Daily huddles with conflict prevention focus. 2. Weekly one-on-one check-ins with team members. 3. Monthly team meetings to address systemic issues. 4. Quarterly review of conflict prevention system effectiveness. MEASUREMENT: Track number of conflicts, resolution time, team satisfaction scores, turnover rates. Adjust strategies based on data and feedback..."
            value={formData.systemImplementation || ''}
            onChange={(e) => updateField('systemImplementation', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
