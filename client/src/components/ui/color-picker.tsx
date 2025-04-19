import * as React from 'react'
import { Input } from './input'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value}
        onChange={handleChange}
        className="w-12 h-8 p-1"
      />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        className="w-24"
      />
    </div>
  )
} 