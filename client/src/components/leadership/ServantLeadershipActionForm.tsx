import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ServantLeadershipActionFormProps {
  value: string
  onChange: (value: string) => void
}

const ServantLeadershipActionForm: React.FC<ServantLeadershipActionFormProps> = ({ value, onChange }) => {
  const [operationalChallenge, setOperationalChallenge] = useState<string>('')
  const [teamInput, setTeamInput] = useState<string>('')
  const [implementationPlan, setImplementationPlan] = useState<string>('')
  const [results, setResults] = useState<string>('')
  const [approachComparison, setApproachComparison] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setOperationalChallenge(parsedValue.operationalChallenge || '')
        setTeamInput(parsedValue.teamInput || '')
        setImplementationPlan(parsedValue.implementationPlan || '')
        setResults(parsedValue.results || '')
        setApproachComparison(parsedValue.approachComparison || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setOperationalChallenge(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      operationalChallenge,
      teamInput,
      implementationPlan,
      results,
      approachComparison
    })
    onChange(formData)
  }, [operationalChallenge, teamInput, implementationPlan, results, approachComparison, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="operational-challenge" className="text-xs font-medium">Operational Challenge</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Our drive-thru order accuracy has been declining over the past month, with customer complaints increasing by 15%. This has led to more remakes, slower service times, and decreased customer satisfaction. The issue seems most prevalent during peak lunch hours when the team is under the most pressure.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="operational-challenge"
          placeholder="Describe one operational challenge your team is facing..."
          value={operationalChallenge}
          onChange={(e) => setOperationalChallenge(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="team-input" className="text-xs font-medium">Team Member Input</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I held a 30-minute focus group with our five most experienced drive-thru team members. They identified several issues:<br/>
              1. The headset audio quality makes it difficult to hear customers clearly<br/>
              2. The order confirmation screen is positioned where it's hard to see while taking orders<br/>
              3. During peak times, there's pressure to rush through order confirmation<br/>
              4. New team members aren't getting enough practice time on headsets before peak periods<br/>
              5. The menu board layout confuses customers, leading to last-minute changes</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="team-input"
          placeholder="What input did you gather from team members who are closest to the issue?"
          value={teamInput}
          onChange={(e) => setTeamInput(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="implementation-plan" className="text-xs font-medium">Implementation Plan</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Based on the team's input, we implemented the following changes:<br/>
              1. Ordered new headsets with better audio quality and noise cancellation<br/>
              2. Repositioned the order confirmation screen for better visibility<br/>
              3. Created a "three-point confirmation" process where team members repeat back the order, confirm the price, and ask if anything else is needed<br/>
              4. Established a training program where new team members practice on headsets during slower periods with a mentor<br/>
              5. Added visual cues on the menu board to help customers navigate options more clearly</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="implementation-plan"
          placeholder="How did you implement their ideas to address the challenge?"
          value={implementationPlan}
          onChange={(e) => setImplementationPlan(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="results" className="text-xs font-medium">Results</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> After implementing these changes for three weeks:<br/>
              1. Order accuracy improved by 22%<br/>
              2. Customer complaints decreased by 30%<br/>
              3. Team member confidence in taking orders increased (based on survey responses)<br/>
              4. New team members reported feeling better prepared to handle drive-thru responsibilities<br/>
              5. Despite the additional confirmation step, our average service time remained consistent because we had fewer remakes</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="results"
          placeholder="What were the results of implementing these ideas?"
          value={results}
          onChange={(e) => setResults(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="approach-comparison" className="text-xs font-medium">Approach Comparison</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> In a top-down approach, I might have:<br/>
              1. Assumed I knew the cause of the problem without consulting the team<br/>
              2. Implemented stricter policies or disciplinary measures for errors<br/>
              3. Added more management oversight during peak periods<br/>
              4. Created a solution based solely on metrics without understanding the operational realities<br/>
              <br/>
              The servant leadership approach was more effective because:<br/>
              1. It identified root causes I wouldn't have recognized from my position<br/>
              2. Team members were more invested in solutions they helped create<br/>
              3. It built trust and improved morale as team members saw their ideas implemented<br/>
              4. The solutions were more practical and addressed the real operational challenges<br/>
              5. It empowered team members to take ownership of quality improvement</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="approach-comparison"
          placeholder="How did this servant leadership approach differ from a top-down approach?"
          value={approachComparison}
          onChange={(e) => setApproachComparison(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default ServantLeadershipActionForm
