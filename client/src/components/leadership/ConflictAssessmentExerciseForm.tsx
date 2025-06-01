import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Users, Target, TrendingUp } from 'lucide-react'

interface ConflictAssessmentExerciseFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ConflictAssessmentExerciseForm({ value, onChange }: ConflictAssessmentExerciseFormProps) {
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
      {/* Current Conflicts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Current Restaurant Conflicts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="currentConflicts" className="text-sm font-medium">
            Identify 3 current or recent conflicts in your restaurant and describe each situation
          </Label>
          <Textarea
            id="currentConflicts"
            placeholder="Example: CONFLICT 1: Kitchen vs. Front-of-House Communication - Kitchen staff frustrated that servers don't communicate order modifications clearly, leading to remade food and delays. Servers feel kitchen staff are dismissive when they ask questions. CONFLICT 2: Scheduling Disputes - Two team members (Alex and Jordan) arguing over weekend shifts. Alex feels Jordan gets preferential treatment, Jordan thinks Alex doesn't understand their availability constraints. CONFLICT 3: Performance Standards - High-performing team member (Sarah) openly frustrated with newer employee (Mike) who works slower during rush periods. Sarah makes comments that make Mike feel unwelcome and stressed..."
            value={formData.currentConflicts || ''}
            onChange={(e) => updateField('currentConflicts', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Root Cause Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Root Cause Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="rootCauses" className="text-sm font-medium">
            For each conflict, identify the root causes (not just symptoms) using the 5 Whys technique
          </Label>
          <Textarea
            id="rootCauses"
            placeholder="Example: CONFLICT 1 ROOT CAUSES: Why are kitchen and servers not communicating well? Because there's no standard process for communicating modifications. Why is there no standard process? Because we never established one during training. Why wasn't it established? Because we assumed everyone would figure it out naturally. Why did we assume that? Because we didn't anticipate how busy periods would stress communication. Why didn't we anticipate this? Because we didn't plan for communication breakdowns under pressure. ROOT CAUSE: Lack of structured communication protocols and training. CONFLICT 2 ROOT CAUSES: Why are team members fighting over shifts? Because scheduling feels unfair. Why does it feel unfair? Because criteria for shift assignments aren't clear. Why aren't criteria clear? Because I make decisions case-by-case without explaining reasoning. ROOT CAUSE: Lack of transparent scheduling policies..."
            value={formData.rootCauses || ''}
            onChange={(e) => updateField('rootCauses', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Stakeholder Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Stakeholder Impact Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="stakeholderAnalysis" className="text-sm font-medium">
            Who is affected by each conflict and how? Include direct parties, team members, and customers
          </Label>
          <Textarea
            id="stakeholderAnalysis"
            placeholder="Example: CONFLICT 1 STAKEHOLDERS: Direct Parties - Kitchen staff feel disrespected and frustrated, servers feel intimidated and unsupported. Other Team Members - Other servers avoid asking kitchen questions, creating more mistakes. Customers - Experience longer wait times and occasional wrong orders. Management - Spend time mediating instead of leading, restaurant efficiency suffers. CONFLICT 2 STAKEHOLDERS: Direct Parties - Alex feels treated unfairly, Jordan feels attacked. Other Team Members - Worry about their own scheduling fairness, some take sides. Customers - May experience inconsistent service if preferred team members aren't scheduled. Management - Time spent on scheduling disputes, team morale affected. CONFLICT 3 STAKEHOLDERS: Direct Parties - Sarah becomes negative influence, Mike loses confidence. Other Team Members - Uncomfortable witnessing tension, may avoid helping Mike. Customers - Slower service during busy periods, negative energy affects atmosphere..."
            value={formData.stakeholderAnalysis || ''}
            onChange={(e) => updateField('stakeholderAnalysis', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Resolution Strategies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Resolution Strategy Development</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="resolutionStrategies" className="text-sm font-medium">
            Develop specific resolution strategies for each conflict, including immediate actions and long-term prevention
          </Label>
          <Textarea
            id="resolutionStrategies"
            placeholder="Example: CONFLICT 1 RESOLUTION: Immediate - Meet with kitchen and server leads separately, then together to establish communication protocol. Create simple modification communication system (written tickets with clear symbols). Long-term - Include communication training in onboarding, weekly check-ins between kitchen and front-of-house leads. CONFLICT 2 RESOLUTION: Immediate - Meet with Alex and Jordan individually to understand their perspectives, then create transparent scheduling criteria document. Long-term - Implement fair scheduling rotation system, post criteria publicly, allow input on scheduling preferences. CONFLICT 3 RESOLUTION: Immediate - Address Sarah's behavior privately, provide Mike with additional support and training. Long-term - Create mentorship program pairing experienced with new team members, establish performance coaching rather than peer criticism..."
            value={formData.resolutionStrategies || ''}
            onChange={(e) => updateField('resolutionStrategies', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
