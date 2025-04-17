import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ServantLeadershipVideoFormProps {
  value: string
  onChange: (value: string) => void
}

const ServantLeadershipVideoForm: React.FC<ServantLeadershipVideoFormProps> = ({ value, onChange }) => {
  const [keyPrinciples, setKeyPrinciples] = useState<string>('')
  const [applicationIdeas, setApplicationIdeas] = useState<string>('')
  const [mainTakeaway, setMainTakeaway] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setKeyPrinciples(parsedValue.keyPrinciples || '')
        setApplicationIdeas(parsedValue.applicationIdeas || '')
        setMainTakeaway(parsedValue.mainTakeaway || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setKeyPrinciples(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      keyPrinciples,
      applicationIdeas,
      mainTakeaway
    })
    onChange(formData)
  }, [keyPrinciples, applicationIdeas, mainTakeaway, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="key-principles" className="text-xs font-medium">Key Principles of Servant Leadership</Label>
        <Textarea
          id="key-principles"
          placeholder="List the core principles of servant leadership from the video..."
          value={keyPrinciples}
          onChange={(e) => setKeyPrinciples(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="application-ideas" className="text-xs font-medium">Application in Restaurant Setting</Label>
        <Textarea
          id="application-ideas"
          placeholder="How will you apply these principles in your daily interactions with team members?"
          value={applicationIdeas}
          onChange={(e) => setApplicationIdeas(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="main-takeaway" className="text-xs font-medium">Main Takeaway</Label>
        <Input
          id="main-takeaway"
          placeholder="What is your single most important takeaway from this video?"
          value={mainTakeaway}
          onChange={(e) => setMainTakeaway(e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  )
}

export default ServantLeadershipVideoForm
