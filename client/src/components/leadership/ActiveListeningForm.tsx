import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ActiveListeningFormProps {
  value: string
  onChange: (value: string) => void
}

const ActiveListeningForm: React.FC<ActiveListeningFormProps> = ({ value, onChange }) => {
  const [conversation1, setConversation1] = useState<string>('')
  const [insight1, setInsight1] = useState<string>('')
  
  const [conversation2, setConversation2] = useState<string>('')
  const [insight2, setInsight2] = useState<string>('')
  
  const [conversation3, setConversation3] = useState<string>('')
  const [insight3, setInsight3] = useState<string>('')
  
  const [challenges, setChallenges] = useState<string>('')
  const [improvements, setImprovements] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setConversation1(parsedValue.conversation1 || '')
        setInsight1(parsedValue.insight1 || '')
        
        setConversation2(parsedValue.conversation2 || '')
        setInsight2(parsedValue.insight2 || '')
        
        setConversation3(parsedValue.conversation3 || '')
        setInsight3(parsedValue.insight3 || '')
        
        setChallenges(parsedValue.challenges || '')
        setImprovements(parsedValue.improvements || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setConversation1(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      conversation1, insight1,
      conversation2, insight2,
      conversation3, insight3,
      challenges, improvements
    })
    onChange(formData)
  }, [
    conversation1, insight1,
    conversation2, insight2,
    conversation3, insight3,
    challenges, improvements,
    onChange
  ])

  return (
    <div className="space-y-3">
      <div className="space-y-2 border-b pb-2">
        <div className="space-y-1">
          <Label htmlFor="conversation-1" className="text-xs font-medium">Team Member Conversation 1</Label>
          <Input
            id="conversation-1"
            placeholder="Briefly describe the first conversation..."
            value={conversation1}
            onChange={(e) => setConversation1(e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="insight-1" className="text-xs font-medium">New Insight Gained</Label>
          <Textarea
            id="insight-1"
            placeholder="What new insight did you gain about this team member or their perspective?"
            value={insight1}
            onChange={(e) => setInsight1(e.target.value)}
            className="min-h-[60px] text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-2 border-b pb-2">
        <div className="space-y-1">
          <Label htmlFor="conversation-2" className="text-xs font-medium">Team Member Conversation 2</Label>
          <Input
            id="conversation-2"
            placeholder="Briefly describe the second conversation..."
            value={conversation2}
            onChange={(e) => setConversation2(e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="insight-2" className="text-xs font-medium">New Insight Gained</Label>
          <Textarea
            id="insight-2"
            placeholder="What new insight did you gain about this team member or their perspective?"
            value={insight2}
            onChange={(e) => setInsight2(e.target.value)}
            className="min-h-[60px] text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-2 border-b pb-2">
        <div className="space-y-1">
          <Label htmlFor="conversation-3" className="text-xs font-medium">Team Member Conversation 3</Label>
          <Input
            id="conversation-3"
            placeholder="Briefly describe the third conversation..."
            value={conversation3}
            onChange={(e) => setConversation3(e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="insight-3" className="text-xs font-medium">New Insight Gained</Label>
          <Textarea
            id="insight-3"
            placeholder="What new insight did you gain about this team member or their perspective?"
            value={insight3}
            onChange={(e) => setInsight3(e.target.value)}
            className="min-h-[60px] text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="challenges" className="text-xs font-medium">Challenges</Label>
        <Textarea
          id="challenges"
          placeholder="What challenges did you face in practicing active listening?"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="improvements" className="text-xs font-medium">Future Improvements</Label>
        <Textarea
          id="improvements"
          placeholder="How will you improve your active listening in future conversations?"
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  )
}

export default ActiveListeningForm
