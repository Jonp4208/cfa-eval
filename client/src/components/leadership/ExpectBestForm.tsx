import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpectBestFormProps {
  value: string
  onChange: (value: string) => void
}

const ExpectBestForm: React.FC<ExpectBestFormProps> = ({ value, onChange }) => {
  const [keyConcepts, setKeyConcepts] = useState<string>('')
  const [expectationsEffect, setExpectationsEffect] = useState<string>('')
  const [teamMember, setTeamMember] = useState<string>('')
  const [higherExpectations, setHigherExpectations] = useState<string>('')
  const [supportPlan, setSupportPlan] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setKeyConcepts(parsedValue.keyConcepts || '')
        setExpectationsEffect(parsedValue.expectationsEffect || '')
        setTeamMember(parsedValue.teamMember || '')
        setHigherExpectations(parsedValue.higherExpectations || '')
        setSupportPlan(parsedValue.supportPlan || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setKeyConcepts(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      keyConcepts,
      expectationsEffect,
      teamMember,
      higherExpectations,
      supportPlan
    })
    onChange(formData)
  }, [keyConcepts, expectationsEffect, teamMember, higherExpectations, supportPlan, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="key-concepts" className="text-xs font-medium">Key Concepts</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> The key concept of "Expect the Best" is that people tend to rise or fall to the level of expectations set for them. When leaders communicate high expectations clearly and consistently, team members are more likely to achieve them. The reading emphasizes that expecting the best is not just about setting standards but truly believing in people's potential to achieve excellence.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="key-concepts"
          placeholder="What are the key concepts about expecting the best from the reading?"
          value={keyConcepts}
          onChange={(e) => setKeyConcepts(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="expectations-effect" className="text-xs font-medium">Effect of Expectations</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> When I expect excellence from my team, I communicate more clearly, provide better resources, and offer more meaningful feedback. Team members sense my confidence in them and become more motivated to meet those expectations. I've noticed that when I've had lower expectations for certain team members, I've given them less challenging assignments and less feedback, which has limited their growth. My expectations directly influence how much people develop and achieve.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="expectations-effect"
          placeholder="How do your expectations of your team affect their performance?"
          value={expectationsEffect}
          onChange={(e) => setExpectationsEffect(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="team-member" className="text-xs font-medium">Team Member Identification</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Michael Johnson - He has been with us for 6 months and shows potential, but I haven't challenged him with leadership opportunities because I assumed he wasn't ready.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Input
          id="team-member"
          placeholder="Which team member would benefit from higher expectations?"
          value={teamMember}
          onChange={(e) => setTeamMember(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="higher-expectations" className="text-xs font-medium">Higher Expectations</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> For Michael, I expect that he can:<br/>
              1. Lead the pre-shift team huddle twice per week<br/>
              2. Train two new team members on register operations this month<br/>
              3. Take responsibility for closing procedures on Fridays<br/>
              4. Contribute at least one improvement idea at our monthly team meeting<br/>
              5. Maintain perfect attendance and punctuality for the next 30 days</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="higher-expectations"
          placeholder="What specific higher expectations do you have for this team member?"
          value={higherExpectations}
          onChange={(e) => setHigherExpectations(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="support-plan" className="text-xs font-medium">Support Plan</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> To support Michael in meeting these expectations, I will:<br/>
              1. Model effective huddle leadership for him this week<br/>
              2. Provide a training checklist and observe his first training session to give feedback<br/>
              3. Create a closing procedure checklist and review it with him before his first closing shift<br/>
              4. Schedule a weekly 15-minute check-in to discuss his progress and address any challenges<br/>
              5. Recognize his achievements in front of the team to build his confidence</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="support-plan"
          placeholder="How will you support this team member in meeting these higher expectations?"
          value={supportPlan}
          onChange={(e) => setSupportPlan(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default ExpectBestForm
