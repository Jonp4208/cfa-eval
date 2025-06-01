import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, Search, Users, CheckCircle } from 'lucide-react'

interface ProblemSolvingFrameworksFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ProblemSolvingFrameworksForm({ value, onChange }: ProblemSolvingFrameworksFormProps) {
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
      {/* 5 Whys Technique */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">5 Whys Technique Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="fiveWhys" className="text-sm font-medium">
            Apply the 5 Whys technique to a recurring problem in your restaurant
          </Label>
          <Textarea
            id="fiveWhys"
            placeholder="Example: PROBLEM: Customers frequently complain about long wait times. WHY 1: Why are wait times long? Because orders are taking longer to prepare than expected. WHY 2: Why are orders taking longer to prepare? Because kitchen staff seem overwhelmed during peak hours. WHY 3: Why are kitchen staff overwhelmed? Because we don't have enough prep work done before rush periods. WHY 4: Why isn't prep work completed? Because morning shift doesn't have clear prep priorities and runs out of time. WHY 5: Why don't they have clear prep priorities? Because we don't have a standardized prep checklist with time estimates. ROOT CAUSE: Lack of structured prep planning and prioritization system. SOLUTION: Create detailed prep checklist with time estimates and assign specific prep responsibilities to morning shift team members..."
            value={formData.fiveWhys || ''}
            onChange={(e) => updateField('fiveWhys', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Root Cause Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Root Cause Analysis Framework</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="rootCauseAnalysis" className="text-sm font-medium">
            Describe how you'll systematically identify root causes of restaurant problems
          </Label>
          <Textarea
            id="rootCauseAnalysis"
            placeholder="Example: MY ROOT CAUSE ANALYSIS PROCESS: 1. PROBLEM DEFINITION - Clearly define the problem with specific examples and data. 'Customer complaints about food quality increased 30% this month.' 2. DATA COLLECTION - Gather facts: when does it happen, who's involved, what are the patterns? Track complaint types, times, specific menu items. 3. BRAINSTORM POTENTIAL CAUSES - List all possible causes without judgment: training issues, equipment problems, ingredient quality, time pressure, communication gaps. 4. CATEGORIZE CAUSES - Group into categories: People (training, motivation), Process (procedures, communication), Equipment (maintenance, functionality), Environment (layout, stress). 5. INVESTIGATE EACH CATEGORY - Use 5 Whys for each potential cause to dig deeper. 6. VALIDATE ROOT CAUSES - Test theories by implementing small changes and measuring results. 7. PRIORITIZE SOLUTIONS - Focus on root causes that will have biggest impact..."
            value={formData.rootCauseAnalysis || ''}
            onChange={(e) => updateField('rootCauseAnalysis', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Collaborative Problem-Solving */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Collaborative Problem-Solving Methods</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="collaborativeMethods" className="text-sm font-medium">
            How will you involve your team in problem-solving to get better solutions and buy-in?
          </Label>
          <Textarea
            id="collaborativeMethods"
            placeholder="Example: TEAM PROBLEM-SOLVING APPROACH: 1. PROBLEM PRESENTATION - Present the problem objectively without suggesting solutions. 'We've had 15 customer complaints about wait times this week. What are your thoughts?' 2. PERSPECTIVE GATHERING - Ask each team member for their view of the problem. Front-of-house and kitchen staff often see different aspects. 3. BRAINSTORMING SESSIONS - Use structured brainstorming: no criticism during idea generation, build on others' ideas, encourage wild ideas initially. 4. SOLUTION EVALUATION - Have team evaluate ideas together using criteria like: feasibility, cost, time to implement, impact on customers. 5. PILOT TESTING - Implement solutions as trials with team feedback. 'Let's try this for one week and see how it works.' 6. OWNERSHIP ASSIGNMENT - Let team members volunteer for solution implementation rather than assigning. 7. FOLLOW-UP REVIEWS - Regular check-ins to assess progress and make adjustments based on team input..."
            value={formData.collaborativeMethods || ''}
            onChange={(e) => updateField('collaborativeMethods', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Problem-Solving Implementation Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationStrategy" className="text-sm font-medium">
            Create a plan for implementing structured problem-solving in your restaurant operations
          </Label>
          <Textarea
            id="implementationStrategy"
            placeholder="Example: WEEKLY PROBLEM-SOLVING ROUTINE: 1. Monday Morning - Review previous week's issues and identify top 3 problems to address. 2. Tuesday Team Meeting - Present one problem to team for collaborative solution development. 3. Wednesday Implementation - Begin pilot testing of agreed-upon solutions. 4. Friday Review - Assess progress on current solutions and gather feedback. TOOLS TO IMPLEMENT: 1. Problem Log - Simple form for team members to document recurring issues. 2. 5 Whys Worksheet - Template for root cause analysis that anyone can use. 3. Solution Tracking Board - Visual display of problems being worked on and progress. 4. Monthly Problem-Solving Workshop - Dedicated time for team to work on bigger challenges together. TRAINING PLAN: 1. Teach team members basic problem-solving techniques during team meetings. 2. Practice 5 Whys technique with simple examples. 3. Encourage team to bring problems forward rather than just complaining..."
            value={formData.implementationStrategy || ''}
            onChange={(e) => updateField('implementationStrategy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
