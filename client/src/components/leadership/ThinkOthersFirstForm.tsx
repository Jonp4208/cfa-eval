import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ThinkOthersFirstFormProps {
  value: string
  onChange: (value: string) => void
}

const ThinkOthersFirstForm: React.FC<ThinkOthersFirstFormProps> = ({ value, onChange }) => {
  const [keyConcepts, setKeyConcepts] = useState<string>('')
  const [selflessExamples, setSelflessExamples] = useState<string>('')
  const [practicalWays, setPracticalWays] = useState<string>('')
  const [implementation, setImplementation] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setKeyConcepts(parsedValue.keyConcepts || '')
        setSelflessExamples(parsedValue.selflessExamples || '')
        setPracticalWays(parsedValue.practicalWays || '')
        setImplementation(parsedValue.implementation || '')
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
      selflessExamples,
      practicalWays,
      implementation
    })
    onChange(formData)
  }, [keyConcepts, selflessExamples, practicalWays, implementation, onChange])

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
              <p><strong>Example:</strong> The key concept of "Think Others First" is prioritizing the needs of team members before your own. This includes actively listening to their concerns, recognizing their contributions, and creating opportunities for their growth and development. The reading emphasizes that selfless leadership builds trust and inspires loyalty.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="key-concepts"
          placeholder="What are the key concepts about thinking of others first from the reading?"
          value={keyConcepts}
          onChange={(e) => setKeyConcepts(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="selfless-examples" className="text-xs font-medium">Selfless Leadership Examples</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> 1. Taking over a difficult task for a team member who is struggling<br/>
              2. Staying late to help close when we're short-staffed, even when it's not my shift<br/>
              3. Offering to train new team members during busy periods to ensure they feel supported<br/>
              4. Recognizing team members' accomplishments in front of others</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="selfless-examples"
          placeholder="Identify specific examples of how you can demonstrate selfless leadership in your restaurant..."
          value={selflessExamples}
          onChange={(e) => setSelflessExamples(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="practical-ways" className="text-xs font-medium">Practical Applications</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I can put team members' needs first by:<br/>
              - Adjusting schedules to accommodate important personal events<br/>
              - Creating a suggestion box and implementing team ideas<br/>
              - Checking in with team members who seem stressed and offering support<br/>
              - Providing growth opportunities based on individual career goals</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="practical-ways"
          placeholder="How can you put team members' needs before your own in practical ways?"
          value={practicalWays}
          onChange={(e) => setPracticalWays(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="implementation" className="text-xs font-medium">Implementation Plan</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> This week I will:<br/>
              1. Monday: Start a daily practice of asking each team member "How can I help you succeed today?"<br/>
              2. Wednesday: Schedule one-on-one meetings with two team members to understand their career goals<br/>
              3. Friday: Recognize at least three team members for specific contributions during our team huddle<br/>
              4. Weekend: Create a rotation system where I help different stations during peak periods</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="implementation"
          placeholder="What specific actions will you take in the next week to think of others first?"
          value={implementation}
          onChange={(e) => setImplementation(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default ThinkOthersFirstForm
