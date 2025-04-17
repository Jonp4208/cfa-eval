import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SelflessLeadershipFormProps {
  value: string
  onChange: (value: string) => void
}

const SelflessLeadershipForm: React.FC<SelflessLeadershipFormProps> = ({ value, onChange }) => {
  const [action1, setAction1] = useState<string>('')
  const [action2, setAction2] = useState<string>('')
  const [action3, setAction3] = useState<string>('')
  const [results, setResults] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setAction1(parsedValue.action1 || '')
        setAction2(parsedValue.action2 || '')
        setAction3(parsedValue.action3 || '')
        setResults(parsedValue.results || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setAction1(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      action1,
      action2,
      action3,
      results
    })
    onChange(formData)
  }, [action1, action2, action3, results, onChange])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="action1" className="text-xs font-medium">Selfless Action 1</Label>
        <Input
          id="action1"
          placeholder="Describe the first selfless action you took..."
          value={action1}
          onChange={(e) => setAction1(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="action2" className="text-xs font-medium">Selfless Action 2</Label>
        <Input
          id="action2"
          placeholder="Describe the second selfless action you took..."
          value={action2}
          onChange={(e) => setAction2(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="action3" className="text-xs font-medium">Selfless Action 3</Label>
        <Input
          id="action3"
          placeholder="Describe the third selfless action you took..."
          value={action3}
          onChange={(e) => setAction3(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="results" className="text-xs font-medium">Results & Team Member Reactions</Label>
        <Textarea
          id="results"
          placeholder="What were the results of your actions? How did team members react?"
          value={results}
          onChange={(e) => setResults(e.target.value)}
          className="min-h-[80px] text-sm"
        />
      </div>
    </div>
  )
}

export default SelflessLeadershipForm
