import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Target, Brain, CheckCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react'

interface StrategicDecisionFrameworkFormProps {
  value: string
  onChange: (value: string) => void
}

const StrategicDecisionFrameworkForm: React.FC<StrategicDecisionFrameworkFormProps> = ({ value, onChange }) => {
  const [decisionToMake, setDecisionToMake] = useState<string>('')
  const [informationGathered, setInformationGathered] = useState<string>('')
  const [alternatives, setAlternatives] = useState<string>('')
  const [prosAndCons, setProsAndCons] = useState<string>('')
  const [finalDecision, setFinalDecision] = useState<string>('')
  const [implementationPlan, setImplementationPlan] = useState<string>('')
  const [successMetrics, setSuccessMetrics] = useState<string>('')
  const [lessonsLearned, setLessonsLearned] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setDecisionToMake(parsedValue.decisionToMake || '')
        setInformationGathered(parsedValue.informationGathered || '')
        setAlternatives(parsedValue.alternatives || '')
        setProsAndCons(parsedValue.prosAndCons || '')
        setFinalDecision(parsedValue.finalDecision || '')
        setImplementationPlan(parsedValue.implementationPlan || '')
        setSuccessMetrics(parsedValue.successMetrics || '')
        setLessonsLearned(parsedValue.lessonsLearned || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setDecisionToMake(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      decisionToMake,
      informationGathered,
      alternatives,
      prosAndCons,
      finalDecision,
      implementationPlan,
      successMetrics,
      lessonsLearned
    })
    onChange(formData)
  }, [decisionToMake, informationGathered, alternatives, prosAndCons, finalDecision, implementationPlan, successMetrics, lessonsLearned, onChange])

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">Strategic Decision Framework</p>
        <p>Apply a structured approach to making important restaurant decisions. This framework ensures you consider all factors and make well-informed choices.</p>
      </div>

      {/* Step 1: Define the Decision */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Step 1: Define the Decision Clearly
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="decision-to-make" className="text-xs font-medium">What specific decision do you need to make?</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Examples</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Examples:</strong><br/>
                  • Should we hire 2 part-time or 1 full-time team member?<br/>
                  • Should we add a new menu item or remove an underperforming one?<br/>
                  • Should we change our operating hours during slow periods?<br/>
                  • Should we invest in new kitchen equipment or continue with current setup?<br/>
                  • Should we implement a new training program for team members?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="decision-to-make"
              placeholder="Clearly state the decision you need to make, including the context and why this decision is important..."
              value={decisionToMake}
              onChange={(e) => setDecisionToMake(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Gather Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-green-500" />
            Step 2: Gather Relevant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="information-gathered" className="text-xs font-medium">What information do you need to make this decision? What data have you collected?</Label>
            <Textarea
              id="information-gathered"
              placeholder="List the information you've gathered: financial data, team feedback, customer insights, operational metrics, industry trends, etc..."
              value={informationGathered}
              onChange={(e) => setInformationGathered(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Identify Alternatives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            Step 3: Identify Alternatives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="alternatives" className="text-xs font-medium">What are all the possible options you could choose from?</Label>
            <Textarea
              id="alternatives"
              placeholder="List at least 3 different alternatives:
Option A: [Describe first option]
Option B: [Describe second option]  
Option C: [Describe third option]
Option D: [Any additional options]"
              value={alternatives}
              onChange={(e) => setAlternatives(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Evaluate Pros and Cons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Step 4: Evaluate Pros and Cons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="pros-and-cons" className="text-xs font-medium">For each alternative, what are the advantages and disadvantages?</Label>
            <Textarea
              id="pros-and-cons"
              placeholder="For each option, list:
OPTION A:
Pros: [Benefits, advantages, positive outcomes]
Cons: [Risks, disadvantages, potential problems]
Cost/Impact: [Financial and operational impact]

OPTION B:
Pros: [Benefits, advantages, positive outcomes]
Cons: [Risks, disadvantages, potential problems]
Cost/Impact: [Financial and operational impact]"
              value={prosAndCons}
              onChange={(e) => setProsAndCons(e.target.value)}
              className="min-h-[150px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Make the Decision */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Step 5: Make the Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="final-decision" className="text-xs font-medium">What is your final decision and why did you choose this option?</Label>
            <Textarea
              id="final-decision"
              placeholder="State your decision clearly and explain your reasoning. What factors were most important in your choice?"
              value={finalDecision}
              onChange={(e) => setFinalDecision(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            Step 6: Plan Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="implementation-plan" className="text-xs font-medium">How will you implement this decision? What are the specific steps and timeline?</Label>
            <Textarea
              id="implementation-plan"
              placeholder="Create a step-by-step implementation plan:
1. [First action step - who, what, when]
2. [Second action step - who, what, when]
3. [Third action step - who, what, when]

Timeline: [When will this be fully implemented?]
Resources needed: [What resources, people, or budget is required?]"
              value={implementationPlan}
              onChange={(e) => setImplementationPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 7: Success Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Step 7: Define Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="success-metrics" className="text-xs font-medium">How will you measure if this decision was successful?</Label>
            <Textarea
              id="success-metrics"
              placeholder="Define specific, measurable outcomes:
• [Metric 1: e.g., Reduce turnover by 15% within 3 months]
• [Metric 2: e.g., Increase customer satisfaction scores by 10 points]
• [Metric 3: e.g., Improve efficiency by reducing task completion time by 20%]

Review date: [When will you evaluate the results?]"
              value={successMetrics}
              onChange={(e) => setSuccessMetrics(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 8: Lessons Learned (Optional) */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-700">Reflection: Lessons Learned (Complete after implementation)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="lessons-learned" className="text-xs font-medium">What did you learn from this decision-making process? What would you do differently next time?</Label>
            <Textarea
              id="lessons-learned"
              placeholder="Reflect on the decision-making process and outcomes:
• What worked well in your decision-making process?
• What challenges did you encounter?
• What would you do differently next time?
• How can you apply these lessons to future decisions?"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicDecisionFrameworkForm
