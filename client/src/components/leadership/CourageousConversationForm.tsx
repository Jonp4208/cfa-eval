import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CourageousConversationFormProps {
  value: string
  onChange: (value: string) => void
}

const CourageousConversationForm: React.FC<CourageousConversationFormProps> = ({ value, onChange }) => {
  const [conversationContext, setConversationContext] = useState<string>('')
  const [mainMessage, setMainMessage] = useState<string>('')
  const [anticipatedResponses, setAnticipatedResponses] = useState<string>('')
  const [potentialObstacles, setPotentialObstacles] = useState<string>('')
  const [deadline, setDeadline] = useState<string>('')
  const [desiredOutcome, setDesiredOutcome] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setConversationContext(parsedValue.conversationContext || '')
        setMainMessage(parsedValue.mainMessage || '')
        setAnticipatedResponses(parsedValue.anticipatedResponses || '')
        setPotentialObstacles(parsedValue.potentialObstacles || '')
        setDeadline(parsedValue.deadline || '')
        setDesiredOutcome(parsedValue.desiredOutcome || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setConversationContext(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      conversationContext,
      mainMessage,
      anticipatedResponses,
      potentialObstacles,
      deadline,
      desiredOutcome
    })
    onChange(formData)
  }, [conversationContext, mainMessage, anticipatedResponses, potentialObstacles, deadline, desiredOutcome, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="conversation-context" className="text-xs font-medium">Conversation Context</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> One of our shift leaders, David, has been consistently late for his shifts over the past two weeks (5-15 minutes late on 4 occasions). This has caused stress for the opening team and affected our ability to properly prepare for the breakfast rush. I've made casual comments about the importance of punctuality, but haven't directly addressed the issue with him. David is otherwise a strong performer who has been with us for over a year.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="conversation-context"
          placeholder="Describe the situation that requires a courageous conversation..."
          value={conversationContext}
          onChange={(e) => setConversationContext(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="main-message" className="text-xs font-medium">Main Message</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I need to communicate that punctuality is a critical expectation for shift leaders, as it directly impacts team morale and operational readiness. I want David to understand that his tardiness has real consequences for the team and our guests. I also need to clearly state that consistent punctuality is a non-negotiable requirement for his position, and that I need his commitment to arrive 10 minutes before his scheduled shifts moving forward.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="main-message"
          placeholder="What is the main message you need to communicate?"
          value={mainMessage}
          onChange={(e) => setMainMessage(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="anticipated-responses" className="text-xs font-medium">Anticipated Responses</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> I anticipate David might:<br/>
              1. Become defensive and make excuses about traffic or personal issues<br/>
              2. Downplay the impact of his tardiness on the team<br/>
              3. Promise to improve without acknowledging the seriousness<br/>
              4. Feel embarrassed and apologetic<br/>
              5. Mention that other team members are sometimes late too</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="anticipated-responses"
          placeholder="What responses do you anticipate from the other person?"
          value={anticipatedResponses}
          onChange={(e) => setAnticipatedResponses(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="potential-obstacles" className="text-xs font-medium">Potential Obstacles</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> Potential obstacles include:<br/>
              1. My discomfort with confrontation might cause me to soften the message too much<br/>
              2. If David becomes emotional or defensive, I might struggle to keep the conversation on track<br/>
              3. The busy restaurant environment might make it difficult to find a private moment for this conversation<br/>
              4. I might be tempted to accept excuses rather than holding firm on expectations<br/>
              5. David might have legitimate personal issues causing his tardiness that I'm not aware of</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="potential-obstacles"
          placeholder="What obstacles might prevent this conversation from being successful?"
          value={potentialObstacles}
          onChange={(e) => setPotentialObstacles(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="deadline" className="text-xs font-medium">Conversation Deadline</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> 05/15/2023 - I will have this conversation before the end of David's shift tomorrow.</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Input
          id="deadline"
          placeholder="By when will you have this conversation? (e.g., MM/DD/YYYY)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="desired-outcome" className="text-xs font-medium">Desired Outcome</Label>
          <Collapsible className="w-full max-w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <span>View Example</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
              <p><strong>Example:</strong> The ideal outcome is that David:<br/>
              1. Acknowledges the impact his tardiness has had on the team<br/>
              2. Commits to arriving 10 minutes before his scheduled shifts<br/>
              3. Understands that continued tardiness will result in formal disciplinary action<br/>
              4. Feels that I support his success while maintaining clear expectations<br/>
              5. Demonstrates consistent punctuality moving forward</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <Textarea
          id="desired-outcome"
          placeholder="What is the ideal outcome you hope to achieve from this conversation?"
          value={desiredOutcome}
          onChange={(e) => setDesiredOutcome(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default CourageousConversationForm
