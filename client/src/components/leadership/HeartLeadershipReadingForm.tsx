import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface HeartLeadershipReadingFormProps {
  value: string
  onChange: (value: string) => void
}

const HeartLeadershipReadingForm: React.FC<HeartLeadershipReadingFormProps> = ({ value, onChange }) => {
  const [characterVsCapacity, setCharacterVsCapacity] = useState<string>('')
  const [keyInsights, setKeyInsights] = useState<string>('')
  const [personalApplication, setPersonalApplication] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setCharacterVsCapacity(parsedValue.characterVsCapacity || '')
        setKeyInsights(parsedValue.keyInsights || '')
        setPersonalApplication(parsedValue.personalApplication || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setCharacterVsCapacity(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      characterVsCapacity,
      keyInsights,
      personalApplication
    })
    onChange(formData)
  }, [characterVsCapacity, keyInsights, personalApplication, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="character-vs-capacity" className="text-xs font-medium">Character vs. Capacity in Leadership</Label>
        <Textarea
          id="character-vs-capacity"
          placeholder="Explain the difference between character and capacity in leadership..."
          value={characterVsCapacity}
          onChange={(e) => setCharacterVsCapacity(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="key-insights" className="text-xs font-medium">Key Insights</Label>
        <Textarea
          id="key-insights"
          placeholder="What are the most important insights you gained from this reading?"
          value={keyInsights}
          onChange={(e) => setKeyInsights(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="personal-application" className="text-xs font-medium">Personal Application</Label>
        <Textarea
          id="personal-application"
          placeholder="How will you apply these concepts in your leadership role?"
          value={personalApplication}
          onChange={(e) => setPersonalApplication(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
    </div>
  )
}

export default HeartLeadershipReadingForm
