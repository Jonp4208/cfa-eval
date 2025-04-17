import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface CharacterCapacityFormProps {
  value: string
  onChange: (value: string) => void
}

const CharacterCapacityForm: React.FC<CharacterCapacityFormProps> = ({ value, onChange }) => {
  const [characterTraits, setCharacterTraits] = useState<string>('')
  const [capacitySkills, setCapacitySkills] = useState<string>('')
  const [focusTrait, setFocusTrait] = useState<string>('')
  const [developmentPlan, setDevelopmentPlan] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setCharacterTraits(parsedValue.characterTraits || '')
        setCapacitySkills(parsedValue.capacitySkills || '')
        setFocusTrait(parsedValue.focusTrait || '')
        setDevelopmentPlan(parsedValue.developmentPlan || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setCharacterTraits(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      characterTraits,
      capacitySkills,
      focusTrait,
      developmentPlan
    })
    onChange(formData)
  }, [characterTraits, capacitySkills, focusTrait, developmentPlan, onChange])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label htmlFor="character-traits" className="text-xs font-medium">Leadership Character Traits</Label>
          <Textarea
            id="character-traits"
            placeholder="List the leadership character traits you identified..."
            value={characterTraits}
            onChange={(e) => setCharacterTraits(e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="capacity-skills" className="text-xs font-medium">Leadership Capacity/Skills</Label>
          <Textarea
            id="capacity-skills"
            placeholder="List the leadership capacity/skills you identified..."
            value={capacitySkills}
            onChange={(e) => setCapacitySkills(e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="focus-trait" className="text-xs font-medium">Character Trait to Develop</Label>
        <Input
          id="focus-trait"
          placeholder="Which character trait will you focus on developing?"
          value={focusTrait}
          onChange={(e) => setFocusTrait(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="development-plan" className="text-xs font-medium">Development Plan</Label>
        <Textarea
          id="development-plan"
          placeholder="How will you develop this character trait in the next week?"
          value={developmentPlan}
          onChange={(e) => setDevelopmentPlan(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
    </div>
  )
}

export default CharacterCapacityForm
