import * as React from 'react'
import { Input } from './input'

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (isValidTime(newValue)) {
      onChange(newValue)
    }
  }

  const isValidTime = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      className="w-full"
    />
  )
} 