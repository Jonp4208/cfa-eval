import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface HigherExpectationsFormProps {
  value: string
  onChange: (value: string) => void
}

const HigherExpectationsForm: React.FC<HigherExpectationsFormProps> = ({ value, onChange }) => {
  const [teamMember, setTeamMember] = useState<string>('')
  const [currentPerformance, setCurrentPerformance] = useState<string>('')
  const [specificGoals, setSpecificGoals] = useState<string>('')
  const [supportProvided, setSupportProvided] = useState<string>('')
  const [communicationPlan, setCommunicationPlan] = useState<string>('')
  const [successMeasures, setSuccessMeasures] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setTeamMember(parsedValue.teamMember || '')
        setCurrentPerformance(parsedValue.currentPerformance || '')
        setSpecificGoals(parsedValue.specificGoals || '')
        setSupportProvided(parsedValue.supportProvided || '')
        setCommunicationPlan(parsedValue.communicationPlan || '')
        setSuccessMeasures(parsedValue.successMeasures || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setTeamMember(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      teamMember,
      currentPerformance,
      specificGoals,
      supportProvided,
      communicationPlan,
      successMeasures
    })
    onChange(formData)
  }, [teamMember, currentPerformance, specificGoals, supportProvided, communicationPlan, successMeasures, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="team-member" className="text-xs font-medium">Team Member</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Sarah Williams - Front Counter Team Member</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Input
          id="team-member"
          placeholder="Name of the team member who would benefit from higher expectations"
          value={teamMember}
          onChange={(e) => setTeamMember(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="current-performance" className="text-xs font-medium">Current Performance</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Sarah consistently meets basic expectations for her role. She arrives on time, follows procedures, and is friendly with guests. However, she rarely takes initiative, seems hesitant to handle guest complaints, and hasn't shown interest in learning additional stations. She has been with us for 8 months but hasn't progressed beyond her initial responsibilities.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="current-performance"
          placeholder="Briefly describe the team member's current performance level..."
          value={currentPerformance}
          onChange={(e) => setCurrentPerformance(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="specific-goals" className="text-xs font-medium">Specific Goals</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Within the next 30 days, I expect Sarah to:<br/>
              1. Successfully resolve at least 3 guest complaints independently<br/>
              2. Learn and demonstrate proficiency at the drive-thru window position<br/>
              3. Train one new team member on front counter procedures<br/>
              4. Identify and implement one improvement to our front counter organization<br/>
              5. Volunteer to lead at least one pre-shift meeting</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="specific-goals"
          placeholder="What specific goals do you want this team member to achieve?"
          value={specificGoals}
          onChange={(e) => setSpecificGoals(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="support-provided" className="text-xs font-medium">Support You Will Provide</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> To support Sarah in meeting these expectations, I will:<br/>
              1. Provide a 2-hour training session on guest complaint resolution techniques<br/>
              2. Schedule her for 3 training shifts at drive-thru with our top performer<br/>
              3. Give her our training guide and observe her first training session<br/>
              4. Meet with her weekly for 15 minutes to discuss progress and challenges<br/>
              5. Provide immediate positive feedback when I see her taking initiative</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="support-provided"
          placeholder="What support will you provide to help them meet these expectations?"
          value={supportProvided}
          onChange={(e) => setSupportProvided(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="communication-plan" className="text-xs font-medium">Communication Plan</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will schedule a private 30-minute meeting with Sarah to discuss these expectations. I'll start by highlighting her strengths and expressing my confidence in her ability to grow. I'll frame these expectations as opportunities for her development rather than criticisms. I'll ask for her input on the goals and adjust them based on her feedback. We'll document the plan together, and I'll provide her with a written copy. I'll also schedule regular check-ins to discuss progress.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="communication-plan"
          placeholder="How will you communicate your expectations positively?"
          value={communicationPlan}
          onChange={(e) => setCommunicationPlan(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="success-measures" className="text-xs font-medium">Success Measures</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will measure Sarah's success by:<br/>
              1. Tracking the number and quality of guest complaints she resolves<br/>
              2. Observing her performance at the drive-thru window using our standard evaluation form<br/>
              3. Getting feedback from the team member she trains<br/>
              4. Documenting the implementation and impact of her front counter improvement<br/>
              5. Observing her leadership during the pre-shift meeting<br/>
              At our 30-day review, we'll discuss her progress on each goal and set new expectations for continued growth.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="success-measures"
          placeholder="How will you measure success in meeting these expectations?"
          value={successMeasures}
          onChange={(e) => setSuccessMeasures(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default HigherExpectationsForm
