import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface LeadershipValuesFormProps {
  value: string
  onChange: (value: string) => void
}

const LeadershipValuesForm: React.FC<LeadershipValuesFormProps> = ({ value, onChange }) => {
  const [value1, setValue1] = useState<string>('')
  const [statement1, setStatement1] = useState<string>('')
  const [action1, setAction1] = useState<string>('')
  
  const [value2, setValue2] = useState<string>('')
  const [statement2, setStatement2] = useState<string>('')
  const [action2, setAction2] = useState<string>('')
  
  const [value3, setValue3] = useState<string>('')
  const [statement3, setStatement3] = useState<string>('')
  const [action3, setAction3] = useState<string>('')
  
  const [value4, setValue4] = useState<string>('')
  const [statement4, setStatement4] = useState<string>('')
  const [action4, setAction4] = useState<string>('')
  
  const [value5, setValue5] = useState<string>('')
  const [statement5, setStatement5] = useState<string>('')
  const [action5, setAction5] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setValue1(parsedValue.value1 || '')
        setStatement1(parsedValue.statement1 || '')
        setAction1(parsedValue.action1 || '')
        
        setValue2(parsedValue.value2 || '')
        setStatement2(parsedValue.statement2 || '')
        setAction2(parsedValue.action2 || '')
        
        setValue3(parsedValue.value3 || '')
        setStatement3(parsedValue.statement3 || '')
        setAction3(parsedValue.action3 || '')
        
        setValue4(parsedValue.value4 || '')
        setStatement4(parsedValue.statement4 || '')
        setAction4(parsedValue.action4 || '')
        
        setValue5(parsedValue.value5 || '')
        setStatement5(parsedValue.statement5 || '')
        setAction5(parsedValue.action5 || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setValue1(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      value1, statement1, action1,
      value2, statement2, action2,
      value3, statement3, action3,
      value4, statement4, action4,
      value5, statement5, action5
    })
    onChange(formData)
  }, [
    value1, statement1, action1,
    value2, statement2, action2,
    value3, statement3, action3,
    value4, statement4, action4,
    value5, statement5, action5,
    onChange
  ])

  const renderValueSection = (
    valueNum: string, 
    valueState: string, 
    setValueState: (value: string) => void,
    statementState: string,
    setStatementState: (value: string) => void,
    actionState: string,
    setActionState: (value: string) => void
  ) => (
    <div className="space-y-2 border-b pb-2 last:border-b-0">
      <div className="space-y-1">
        <Label htmlFor={`value-${valueNum}`} className="text-xs font-medium">Leadership Value {valueNum}</Label>
        <Input
          id={`value-${valueNum}`}
          placeholder={`Enter leadership value ${valueNum} (e.g., integrity, service)`}
          value={valueState}
          onChange={(e) => setValueState(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`statement-${valueNum}`} className="text-xs font-medium">Value Statement</Label>
        <Textarea
          id={`statement-${valueNum}`}
          placeholder="How does this value influence your leadership approach?"
          value={statementState}
          onChange={(e) => setStatementState(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`action-${valueNum}`} className="text-xs font-medium">Specific Action</Label>
        <Input
          id={`action-${valueNum}`}
          placeholder="What specific action will you implement in your next shift?"
          value={actionState}
          onChange={(e) => setActionState(e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {renderValueSection('1', value1, setValue1, statement1, setStatement1, action1, setAction1)}
      {renderValueSection('2', value2, setValue2, statement2, setStatement2, action2, setAction2)}
      {renderValueSection('3', value3, setValue3, statement3, setStatement3, action3, setAction3)}
      {renderValueSection('4', value4, setValue4, statement4, setStatement4, action4, setAction4)}
      {renderValueSection('5', value5, setValue5, statement5, setStatement5, action5, setAction5)}
    </div>
  )
}

export default LeadershipValuesForm
