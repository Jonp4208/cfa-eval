import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LeadershipSelfAssessmentFormProps {
  value: string
  onChange: (value: string) => void
}

const LeadershipSelfAssessmentForm: React.FC<LeadershipSelfAssessmentFormProps> = ({ value, onChange }) => {
  const [characterStrengths, setCharacterStrengths] = useState<string>('')
  const [characterWeaknesses, setCharacterWeaknesses] = useState<string>('')
  const [traitToImprove, setTraitToImprove] = useState<string>('')
  const [improvementPlan, setImprovementPlan] = useState<string>('')
  const [successMeasures, setSuccessMeasures] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setCharacterStrengths(parsedValue.characterStrengths || '')
        setCharacterWeaknesses(parsedValue.characterWeaknesses || '')
        setTraitToImprove(parsedValue.traitToImprove || '')
        setImprovementPlan(parsedValue.improvementPlan || '')
        setSuccessMeasures(parsedValue.successMeasures || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setCharacterStrengths(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      characterStrengths,
      characterWeaknesses,
      traitToImprove,
      improvementPlan,
      successMeasures
    })
    onChange(formData)
  }, [characterStrengths, characterWeaknesses, traitToImprove, improvementPlan, successMeasures, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="character-strengths" className="text-xs font-medium">Character Strengths</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> My leadership character strengths include:<br/>
              1. Humility - I'm willing to admit mistakes and learn from others<br/>
              2. Integrity - I consistently follow through on commitments and am honest in all interactions<br/>
              3. Empathy - I genuinely care about my team members' well-being and try to understand their perspectives<br/>
              4. Optimism - I maintain a positive outlook even during challenges and help others see possibilities</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="character-strengths"
          placeholder="What are your top leadership character strengths?"
          value={characterStrengths}
          onChange={(e) => setCharacterStrengths(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="character-weaknesses" className="text-xs font-medium">Areas for Growth</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Areas where I need to grow include:<br/>
              1. Courage - I sometimes avoid difficult conversations to maintain harmony<br/>
              2. Patience - I can become frustrated when team members don't learn as quickly as I expect<br/>
              3. Long-term thinking - I tend to focus on immediate results rather than long-term development<br/>
              4. Consistency - My leadership approach sometimes varies based on my mood or stress level</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="character-weaknesses"
          placeholder="What leadership character traits do you need to develop further?"
          value={characterWeaknesses}
          onChange={(e) => setCharacterWeaknesses(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="trait-to-improve" className="text-xs font-medium">Focus Trait</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Courage - specifically having difficult conversations when needed</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Input
          id="trait-to-improve"
          placeholder="Which specific character trait will you focus on developing?"
          value={traitToImprove}
          onChange={(e) => setTraitToImprove(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="improvement-plan" className="text-xs font-medium">Improvement Plan</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> To develop courage in having difficult conversations, I will:<br/>
              1. Read "Crucial Conversations" and complete the workbook exercises<br/>
              2. Practice the COIN feedback model (Context, Observation, Impact, Next steps) with my mentor<br/>
              3. Identify one difficult conversation I've been avoiding and schedule it within the next week<br/>
              4. Ask my director to observe one feedback conversation and provide coaching<br/>
              5. Keep a journal of difficult conversations, noting what went well and what I could improve</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="improvement-plan"
          placeholder="What specific actions will you take to develop this trait?"
          value={improvementPlan}
          onChange={(e) => setImprovementPlan(e.target.value)}
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
              <p><strong>Example:</strong> I will know I've successfully developed more courage when:<br/>
              1. I can address performance issues within 48 hours of observing them<br/>
              2. Team members report in surveys that I provide clear, timely feedback<br/>
              3. I no longer feel physical anxiety before difficult conversations<br/>
              4. I can maintain composure and focus on facts during emotional discussions<br/>
              5. My director observes and confirms improvement in my feedback delivery</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="success-measures"
          placeholder="How will you know you've successfully developed this trait?"
          value={successMeasures}
          onChange={(e) => setSuccessMeasures(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default LeadershipSelfAssessmentForm
