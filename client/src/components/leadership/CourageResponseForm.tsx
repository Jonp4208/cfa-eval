import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CourageResponseFormProps {
  value: string
  onChange: (value: string) => void
}

const CourageResponseForm: React.FC<CourageResponseFormProps> = ({ value, onChange }) => {
  const [keyConcepts, setKeyConcepts] = useState<string>('')
  const [situation, setSituation] = useState<string>('')
  const [actions, setActions] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setKeyConcepts(parsedValue.keyConcepts || '')
        setSituation(parsedValue.situation || '')
        setActions(parsedValue.actions || '')
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
      situation,
      actions
    })
    onChange(formData)
  }, [keyConcepts, situation, actions, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="key-concepts" className="text-xs font-medium">Key Concepts on Courage</Label>
        <Textarea
          id="key-concepts"
          placeholder="What are the key concepts about courage from the reading?"
          value={keyConcepts}
          onChange={(e) => setKeyConcepts(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="situation" className="text-xs font-medium">Situation Requiring Courage</Label>
        <Textarea
          id="situation"
          placeholder="Describe a situation in your restaurant that requires a courageous response..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="actions" className="text-xs font-medium">Courageous Actions</Label>
        <Textarea
          id="actions"
          placeholder="What specific actions will you take to address this situation with courage?"
          value={actions}
          onChange={(e) => setActions(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
    </div>
  )
}

export default CourageResponseForm
