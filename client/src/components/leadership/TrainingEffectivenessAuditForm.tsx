import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface TrainingEffectivenessAuditFormProps {
  value: string
  onChange: (value: string) => void
}

const TrainingEffectivenessAuditForm: React.FC<TrainingEffectivenessAuditFormProps> = ({ value, onChange }) => {
  const [auditDate, setAuditDate] = useState<string>('')
  const [procedureObserved, setProcedureObserved] = useState<string>('')
  
  // Team Member Observations
  const [teamMember1Name, setTeamMember1Name] = useState<string>('')
  const [teamMember1Observations, setTeamMember1Observations] = useState<string>('')
  const [teamMember2Name, setTeamMember2Name] = useState<string>('')
  const [teamMember2Observations, setTeamMember2Observations] = useState<string>('')
  const [teamMember3Name, setTeamMember3Name] = useState<string>('')
  const [teamMember3Observations, setTeamMember3Observations] = useState<string>('')
  
  // Analysis
  const [variationsIdentified, setVariationsIdentified] = useState<string>('')
  const [trainingGaps, setTrainingGaps] = useState<string>('')
  const [improvementPlan, setImprovementPlan] = useState<string>('')
  const [standardizationActions, setStandardizationActions] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setAuditDate(parsed.auditDate || '')
        setProcedureObserved(parsed.procedureObserved || '')
        setTeamMember1Name(parsed.teamMember1Name || '')
        setTeamMember1Observations(parsed.teamMember1Observations || '')
        setTeamMember2Name(parsed.teamMember2Name || '')
        setTeamMember2Observations(parsed.teamMember2Observations || '')
        setTeamMember3Name(parsed.teamMember3Name || '')
        setTeamMember3Observations(parsed.teamMember3Observations || '')
        setVariationsIdentified(parsed.variationsIdentified || '')
        setTrainingGaps(parsed.trainingGaps || '')
        setImprovementPlan(parsed.improvementPlan || '')
        setStandardizationActions(parsed.standardizationActions || '')
      } catch (e) {
        // If parsing fails, leave fields empty
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      auditDate,
      procedureObserved,
      teamMember1Name,
      teamMember1Observations,
      teamMember2Name,
      teamMember2Observations,
      teamMember3Name,
      teamMember3Observations,
      variationsIdentified,
      trainingGaps,
      improvementPlan,
      standardizationActions
    })
    onChange(formData)
  }, [auditDate, procedureObserved, teamMember1Name, teamMember1Observations, teamMember2Name, teamMember2Observations, teamMember3Name, teamMember3Observations, variationsIdentified, trainingGaps, improvementPlan, standardizationActions, onChange])

  return (
    <div className="space-y-4">
      {/* Audit Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Audit Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="audit-date" className="text-xs font-medium">Audit Date</Label>
              <Input
                id="audit-date"
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="procedure-observed" className="text-xs font-medium">Procedure/Task Observed</Label>
              <Input
                id="procedure-observed"
                placeholder="e.g., Register operations, Food prep, Guest service..."
                value={procedureObserved}
                onChange={(e) => setProcedureObserved(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Observations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Team Member Observations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Team Member 1 */}
          <div className="border-l-4 border-l-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="team-member-1-name" className="text-xs font-medium">Team Member 1 Name</Label>
                <Input
                  id="team-member-1-name"
                  placeholder="Enter team member's name..."
                  value={teamMember1Name}
                  onChange={(e) => setTeamMember1Name(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="team-member-1-observations" className="text-xs font-medium">Observations & Performance Notes</Label>
                  <Collapsible className="w-full max-w-full">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                        <span>View Example</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-blue-100 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                      <p><strong>Example:</strong> "Sarah follows most register procedures correctly but skips the suggestive selling step about 60% of the time. She greets guests warmly and processes orders accurately, but doesn't consistently ask about desserts or drinks. When she does ask, her approach feels scripted rather than natural. She completed register training 2 weeks ago."</p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <Textarea
                  id="team-member-1-observations"
                  placeholder="What did you observe? How well did they execute the procedure? What variations did you notice?"
                  value={teamMember1Observations}
                  onChange={(e) => setTeamMember1Observations(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="border-l-4 border-l-green-500 pl-4 bg-green-50 p-3 rounded-r-lg">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="team-member-2-name" className="text-xs font-medium">Team Member 2 Name</Label>
                <Input
                  id="team-member-2-name"
                  placeholder="Enter team member's name..."
                  value={teamMember2Name}
                  onChange={(e) => setTeamMember2Name(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="team-member-2-observations" className="text-xs font-medium">Observations & Performance Notes</Label>
                <Textarea
                  id="team-member-2-observations"
                  placeholder="What did you observe? How well did they execute the procedure? What variations did you notice?"
                  value={teamMember2Observations}
                  onChange={(e) => setTeamMember2Observations(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="border-l-4 border-l-purple-500 pl-4 bg-purple-50 p-3 rounded-r-lg">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="team-member-3-name" className="text-xs font-medium">Team Member 3 Name</Label>
                <Input
                  id="team-member-3-name"
                  placeholder="Enter team member's name..."
                  value={teamMember3Name}
                  onChange={(e) => setTeamMember3Name(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="team-member-3-observations" className="text-xs font-medium">Observations & Performance Notes</Label>
                <Textarea
                  id="team-member-3-observations"
                  placeholder="What did you observe? How well did they execute the procedure? What variations did you notice?"
                  value={teamMember3Observations}
                  onChange={(e) => setTeamMember3Observations(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis & Action Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Analysis & Action Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="variations-identified" className="text-xs font-medium">Variations in Execution Identified</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Inconsistent suggestive selling approach - some team members skip it entirely, others use scripted language, and one uses natural conversation. Different greeting styles ranging from enthusiastic to minimal. Varying levels of product knowledge when guests ask questions."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="variations-identified"
              placeholder="What differences did you notice between team members? What inconsistencies were observed?"
              value={variationsIdentified}
              onChange={(e) => setVariationsIdentified(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="training-gaps" className="text-xs font-medium">Training Gaps Identified</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Initial training focused on technical steps but didn't adequately cover the 'why' behind suggestive selling. No practice scenarios provided for natural conversation flow. Limited follow-up coaching after initial training. Need better examples of how to handle guest objections."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="training-gaps"
              placeholder="What gaps in the original training approach contributed to these variations?"
              value={trainingGaps}
              onChange={(e) => setTrainingGaps(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="improvement-plan" className="text-xs font-medium">Plan to Address Training Gaps</Label>
            <Textarea
              id="improvement-plan"
              placeholder="What specific actions will you take to improve the training approach?"
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="standardization-actions" className="text-xs font-medium">Actions to Standardize Training Outcomes</Label>
            <Textarea
              id="standardization-actions"
              placeholder="How will you ensure more consistent execution across all team members?"
              value={standardizationActions}
              onChange={(e) => setStandardizationActions(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TrainingEffectivenessAuditForm
