import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatePlanFormProps {
  onSubmit: (plan: NewTrainingPlan) => Promise<void>
  initialData?: NewTrainingPlan
}

interface NewTrainingPlan {
  name: string
  description: string
  department: string
  position: string
  type: 'New Hire' | 'Regular'
  selfPaced: boolean
  days: {
    dayNumber: number
    tasks: {
      name: string
      description: string
      duration: number
      pathwayUrl?: string
      competencyChecklist?: string[]
    }[]
  }[]
}

type Task = {
  name: string
  description: string
  duration: number
  pathwayUrl: string
  competencyChecklist: string[]
}

const initialDay = {
  dayNumber: 1,
  tasks: [{
    name: '',
    description: '',
    duration: 30,
    pathwayUrl: '',
    competencyChecklist: []
  }]
}

export default function CreatePlanForm({ onSubmit, initialData }: CreatePlanFormProps) {
  const [formData, setFormData] = useState<NewTrainingPlan>(
    initialData || {
      name: '',
      description: '',
      department: '',
      position: '',
      type: 'Regular',
      selfPaced: false,
      days: [{ ...initialDay }]
    }
  )

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, {
        dayNumber: prev.days.length + 1,
        tasks: [{
          name: '',
          description: '',
          duration: 30,
          pathwayUrl: '',
          competencyChecklist: []
        }]
      }]
    }))
  }

  const removeDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, index) => index !== dayIndex)
        .map((day, index) => ({ ...day, dayNumber: index + 1 }))
    }))
  }

  const addTask = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            tasks: [...day.tasks, {
              name: '',
              description: '',
              duration: 30,
              pathwayUrl: '',
              competencyChecklist: []
            }]
          }
        }
        return day
      })
    }))
  }

  const removeTask = (dayIndex: number, taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            tasks: day.tasks.filter((_, tIndex) => tIndex !== taskIndex)
          }
        }
        return day
      })
    }))
  }

  const updateTask = (dayIndex: number, taskIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            tasks: day.tasks.map((task, tIndex) => {
              if (tIndex === taskIndex) {
                return { ...task, [field]: value }
              }
              return task
            })
          }
        }
        return day
      })
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Plan Type</Label>
          <Select
            value={formData.type}
            onValueChange={value => setFormData(prev => ({ ...prev, type: value as 'New Hire' | 'Regular' }))}
          >
            <SelectTrigger className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="New Hire">New Hire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="selfPaced"
          checked={formData.selfPaced}
          onCheckedChange={(checked) => {
            setFormData(prev => ({ ...prev, selfPaced: checked as boolean }))
          }}
        />
        <Label htmlFor="selfPaced" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Allow trainees to complete tasks on their own (self-paced)
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[100px] rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={value => setFormData(prev => ({ ...prev, department: value }))}
          >
            <SelectTrigger className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOH">Front of House</SelectItem>
              <SelectItem value="BOH">Back of House</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Select
            value={formData.position}
            onValueChange={value => setFormData(prev => ({ ...prev, position: value }))}
          >
            <SelectTrigger className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Team Member">Team Member</SelectItem>
              <SelectItem value="Team Leader">Team Leader</SelectItem>
              <SelectItem value="Shift Leader">Shift Leader</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Training Schedule</h3>
          <Button 
            type="button" 
            onClick={addDay}
            className="gap-2 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
          >
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        {formData.days.map((day, dayIndex) => (
          <Card key={dayIndex} className="relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium">Day {day.dayNumber}</h4>
                {dayIndex > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDay(dayIndex)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {day.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="grid gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Task Name</Label>
                        <Input
                          value={task.name}
                          onChange={e => updateTask(dayIndex, taskIndex, 'name', e.target.value)}
                          required
                          className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={task.duration}
                          onChange={e => updateTask(dayIndex, taskIndex, 'duration', parseInt(e.target.value) || 0)}
                          min={1}
                          className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={task.description}
                        onChange={e => updateTask(dayIndex, taskIndex, 'description', e.target.value)}
                        className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Pathway URL</Label>
                      <Input
                        value={task.pathwayUrl}
                        onChange={e => updateTask(dayIndex, taskIndex, 'pathwayUrl', e.target.value)}
                        placeholder="https://pathway.chick-fil-a.com/..."
                        className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Competency Checklist</Label>
                        <Button
                          type="button"
                          onClick={() => {
                            const currentChecklist = task.competencyChecklist || []
                            updateTask(dayIndex, taskIndex, 'competencyChecklist', [...currentChecklist, ''])
                          }}
                          className="gap-2 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                      {task.competencyChecklist && task.competencyChecklist.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={e => {
                              const newChecklist = [...(task.competencyChecklist || [])]
                              newChecklist[itemIndex] = e.target.value
                              updateTask(dayIndex, taskIndex, 'competencyChecklist', newChecklist)
                            }}
                            placeholder="Enter checklist item..."
                            className="flex-1 rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newChecklist = (task.competencyChecklist || []).filter((_, i) => i !== itemIndex)
                              updateTask(dayIndex, taskIndex, 'competencyChecklist', newChecklist)
                            }}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {taskIndex > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(dayIndex, taskIndex)}
                        className="justify-self-end text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() => addTask(dayIndex)}
                  className="w-full gap-2 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
        >
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
} 