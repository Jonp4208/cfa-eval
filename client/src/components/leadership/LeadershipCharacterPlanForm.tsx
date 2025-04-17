import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LeadershipCharacterPlanFormProps {
  value: string
  onChange: (value: string) => void
}

const LeadershipCharacterPlanForm: React.FC<LeadershipCharacterPlanFormProps> = ({ value, onChange }) => {
  const [thinkOthersFirst, setThinkOthersFirst] = useState<string>('')
  const [expectBest, setExpectBest] = useState<string>('')
  const [respondCourage, setRespondCourage] = useState<string>('')
  const [thinkLongTerm, setThinkLongTerm] = useState<string>('')
  const [displayHumility, setDisplayHumility] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setThinkOthersFirst(parsedValue.thinkOthersFirst || '')
        setExpectBest(parsedValue.expectBest || '')
        setRespondCourage(parsedValue.respondCourage || '')
        setThinkLongTerm(parsedValue.thinkLongTerm || '')
        setDisplayHumility(parsedValue.displayHumility || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setThinkOthersFirst(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      thinkOthersFirst,
      expectBest,
      respondCourage,
      thinkLongTerm,
      displayHumility
    })
    onChange(formData)
  }, [thinkOthersFirst, expectBest, respondCourage, thinkLongTerm, displayHumility, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="think-others-first" className="text-xs font-medium">Think Others First</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will start each shift by asking team members what they need help with. I'll create a weekly recognition program to highlight team members' contributions. I'll implement a system where I rotate helping different stations during peak periods to support the team where needed most.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="think-others-first"
          placeholder="What specific actions will you take to put others first?"
          value={thinkOthersFirst}
          onChange={(e) => setThinkOthersFirst(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="expect-best" className="text-xs font-medium">Expect the Best</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will set clear, measurable standards for each position and communicate them consistently. I'll provide specific, positive feedback when I see team members meeting or exceeding standards. I'll create opportunities for team members to take on additional responsibilities that stretch their abilities. I'll model excellence by holding myself to the highest standards in all my work.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="expect-best"
          placeholder="How will you demonstrate high expectations for yourself and your team?"
          value={expectBest}
          onChange={(e) => setExpectBest(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="respond-courage" className="text-xs font-medium">Respond with Courage</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will have direct conversations with team members when performance issues arise rather than avoiding them. I'll take responsibility for mistakes and communicate them transparently to my team and leadership. I'll make difficult decisions based on what's right, not what's easy. I'll speak up when I see behaviors that don't align with our values, even when it's uncomfortable.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="respond-courage"
          placeholder="What courageous actions will you take in difficult situations?"
          value={respondCourage}
          onChange={(e) => setRespondCourage(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="think-long-term" className="text-xs font-medium">Think Long-term</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will create development plans for each team member that extend beyond their current role. I'll implement cross-training to build bench strength for future leadership needs. I'll make decisions based on long-term restaurant success rather than short-term convenience. I'll establish quarterly goals that align with our annual objectives and review progress regularly.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="think-long-term"
          placeholder="How will you incorporate long-term thinking in your leadership?"
          value={thinkLongTerm}
          onChange={(e) => setThinkLongTerm(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="display-humility" className="text-xs font-medium">Display Humility</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I will regularly ask for feedback from my team on how I can improve as a leader. I'll openly acknowledge when I don't have all the answers and seek input from others. I'll give credit to team members for their ideas and contributions. I'll be willing to perform any task I ask of my team members, including cleaning bathrooms or taking out trash when needed.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="display-humility"
          placeholder="How will you demonstrate humility in your leadership role?"
          value={displayHumility}
          onChange={(e) => setDisplayHumility(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default LeadershipCharacterPlanForm
