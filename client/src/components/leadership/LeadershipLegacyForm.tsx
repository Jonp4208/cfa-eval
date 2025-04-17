import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface LeadershipLegacyFormProps {
  value: string
  onChange: (value: string) => void
}

const LeadershipLegacyForm: React.FC<LeadershipLegacyFormProps> = ({ value, onChange }) => {
  const [legacyVision, setLegacyVision] = useState<string>('')
  const [teamPerception, setTeamPerception] = useState<string>('')
  const [keyBehaviors, setKeyBehaviors] = useState<string>('')
  const [developmentAreas, setDevelopmentAreas] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setLegacyVision(parsedValue.legacyVision || '')
        setTeamPerception(parsedValue.teamPerception || '')
        setKeyBehaviors(parsedValue.keyBehaviors || '')
        setDevelopmentAreas(parsedValue.developmentAreas || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setLegacyVision(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      legacyVision,
      teamPerception,
      keyBehaviors,
      developmentAreas
    })
    onChange(formData)
  }, [legacyVision, teamPerception, keyBehaviors, developmentAreas, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="legacy-vision" className="text-xs font-medium">Your Leadership Legacy Vision</Label>
        <Textarea
          id="legacy-vision"
          placeholder="Describe the impact you want to have as a leader..."
          value={legacyVision}
          onChange={(e) => setLegacyVision(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="team-perception" className="text-xs font-medium">Team Member Perception</Label>
        <Textarea
          id="team-perception"
          placeholder="What do you want team members to say about your leadership when you're not in the room?"
          value={teamPerception}
          onChange={(e) => setTeamPerception(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="key-behaviors" className="text-xs font-medium">Key Leadership Behaviors</Label>
        <Textarea
          id="key-behaviors"
          placeholder="What specific behaviors will help you create this legacy?"
          value={keyBehaviors}
          onChange={(e) => setKeyBehaviors(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="development-areas" className="text-xs font-medium">Areas for Development</Label>
        <Textarea
          id="development-areas"
          placeholder="What areas do you need to develop to achieve your leadership legacy?"
          value={developmentAreas}
          onChange={(e) => setDevelopmentAreas(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
    </div>
  )
}

export default LeadershipLegacyForm
