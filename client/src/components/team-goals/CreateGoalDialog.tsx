'use client'

import { useState } from 'react'
import { type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Goal, KPI, PeakPeriod, GoalPeriod } from '../../types/goals'
import { createGoal } from '../../services/goalService'
import { useToast } from '../ui/use-toast'
import { PlusCircle, X, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoalCreated: (goal: Goal) => void
}

type KPIFormData = {
  name: string
  targetValue: string
  currentValue: string
  unit: string
  measurementMethod: string
  peak: PeakPeriod | ''
}

type FormData = {
  name: string
  businessArea: Goal['businessArea'] | ''
  goalPeriod: GoalPeriod | ''
  description: string
  kpis: KPIFormData[]
}

const peakPeriods: PeakPeriod[] = ['Breakfast', 'Lunch', 'Dinner', 'All Day']
const goalPeriods: GoalPeriod[] = ['Monthly', 'Quarterly', 'Yearly']

export function CreateGoalDialog({
  open,
  onOpenChange,
  onGoalCreated
}: CreateGoalDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessArea: '',
    goalPeriod: '',
    description: '',
    kpis: [{ name: '', targetValue: '', currentValue: '', unit: '', measurementMethod: '', peak: '' }]
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('Form submission started')
    console.log('Form data:', formData)

    // Validation checks
    if (!formData.name.trim()) {
      console.log('Validation failed: Missing goal title')
      toast({
        title: 'Error',
        description: 'Please enter a goal title',
        variant: 'destructive',
      })
      return
    }

    if (!formData.businessArea) {
      console.log('Validation failed: Missing business area')
      toast({
        title: 'Error',
        description: 'Please select a business area',
        variant: 'destructive',
      })
      return
    }

    if (!formData.goalPeriod) {
      console.log('Validation failed: Missing goal period')
      toast({
        title: 'Error',
        description: 'Please select a goal period',
        variant: 'destructive',
      })
      return
    }

    if (!formData.description.trim()) {
      console.log('Validation failed: Missing description')
      toast({
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive',
      })
      return
    }

    if (formData.kpis.some(kpi => !kpi.name || !kpi.targetValue || !kpi.unit || !kpi.peak || !kpi.measurementMethod)) {
      console.log('Validation failed: Incomplete KPI data')
      console.log('KPIs:', formData.kpis)
      toast({
        title: 'Error',
        description: 'Please fill in all KPI fields',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    console.log('Starting API call')

    try {
      console.log('Preparing goal data')
      const goalData: Partial<Goal> = {
        name: formData.name.trim(),
        businessArea: formData.businessArea,
        goalPeriod: formData.goalPeriod as GoalPeriod,
        description: formData.description.trim(),
        kpis: formData.kpis.map(kpi => ({
          name: kpi.name.trim(),
          targetValue: parseFloat(kpi.targetValue),
          unit: kpi.unit.trim(),
          peak: kpi.peak as PeakPeriod,
          measurementMethod: kpi.measurementMethod.trim(),
          measurements: kpi.currentValue ? [
            {
              value: parseFloat(kpi.currentValue),
              date: new Date(),
              notes: 'Initial measurement'
            }
          ] : []
        }))
      }
      console.log('Submitting goal data:', goalData)

      const goal = await createGoal(goalData)
      console.log('Goal created successfully:', goal)

      onGoalCreated(goal)
      setFormData({
        name: '',
        businessArea: '',
        goalPeriod: '',
        description: '',
        kpis: [{ name: '', targetValue: '', currentValue: '', unit: '', measurementMethod: '', peak: '' }]
      })
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      })
    } catch (error: any) {
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        response: {
          status: error?.response?.status,
          data: error?.response?.data
        }
      })

      // Handle specific error cases
      if (error?.response?.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to create goals',
          variant: 'destructive',
        })
      } else if (error?.response?.status === 400) {
        toast({
          title: 'Validation Error',
          description: error.response.data?.message || 'Please check your input',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create goal. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
      console.log('Form submission completed')
    }
  }

  const addKPI = () => {
    setFormData({
      ...formData,
      kpis: [...formData.kpis, { name: '', targetValue: '', unit: '', peak: '' }]
    })
  }

  const removeKPI = (index: number) => {
    if (formData.kpis.length === 1) return
    setFormData({
      ...formData,
      kpis: formData.kpis.filter((_, i) => i !== index)
    })
  }

  const updateKPI = (index: number, field: keyof KPIFormData, value: string) => {
    setFormData({
      ...formData,
      kpis: formData.kpis.map((kpi, i) =>
        i === index ? { ...kpi, [field]: value } : kpi
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 md:p-6"
        aria-describedby="goal-form-description"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-[#E51636]">Create New Team Goal</DialogTitle>
            <DialogDescription id="goal-form-description">
              Create a new team goal with KPIs and track progress over time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Goal Title</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter goal title"
                required
                className="h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessArea" className="text-sm font-medium">Business Area</Label>
                <Select
                  value={formData.businessArea}
                  onValueChange={(value: Goal['businessArea']) => {
                    setFormData({ ...formData, businessArea: value })
                  }}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select business area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front Counter">Front Counter</SelectItem>
                    <SelectItem value="Drive Thru">Drive Thru</SelectItem>
                    <SelectItem value="Kitchen">Kitchen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalPeriod" className="text-sm font-medium">Goal Period</Label>
                <Select
                  value={formData.goalPeriod}
                  onValueChange={(value: GoalPeriod) => {
                    setFormData({ ...formData, goalPeriod: value })
                  }}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select goal period" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#E51636]">KPI Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKPI}
                  className="h-10 px-4 hover:bg-[#E51636] hover:text-white transition-colors"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add KPI
                </Button>
              </div>
              {formData.kpis.map((kpi, index) => (
                <div key={index} className="space-y-4 border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">KPI #{index + 1}</Label>
                    {formData.kpis.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeKPI(index)}
                        className="h-10 px-3 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`kpi-name-${index}`} className="text-sm font-medium">KPI Name</Label>
                      <Input
                        id={`kpi-name-${index}`}
                        value={kpi.name}
                        onChange={(e) => updateKPI(index, 'name', e.target.value)}
                        placeholder="e.g., Drive-thru Speed, Order Accuracy"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`kpi-target-${index}`} className="text-sm font-medium">Target Value</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The goal you want to achieve (e.g., 2 minutes, 98%)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id={`kpi-target-${index}`}
                          type="number"
                          step="0.01"
                          value={kpi.targetValue}
                          onChange={(e) => updateKPI(index, 'targetValue', e.target.value)}
                          placeholder="e.g., 2, 98, 15"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`kpi-current-${index}`} className="text-sm font-medium">Current Value</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The current measurement (leave blank if not yet measured)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id={`kpi-current-${index}`}
                          type="number"
                          step="0.01"
                          value={kpi.currentValue}
                          onChange={(e) => updateKPI(index, 'currentValue', e.target.value)}
                          placeholder="Leave blank if not measured yet"
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`kpi-unit-${index}`} className="text-sm font-medium">Unit of Measurement</Label>
                        <Input
                          id={`kpi-unit-${index}`}
                          value={kpi.unit}
                          onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                          placeholder="e.g., minutes, %, items"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`kpi-peak-${index}`} className="text-sm font-medium">Peak Period</Label>
                        <Select
                          value={kpi.peak}
                          onValueChange={(value) => updateKPI(index, 'peak', value)}
                          required
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select peak period" />
                          </SelectTrigger>
                          <SelectContent>
                            {peakPeriods.map((peak) => (
                              <SelectItem key={peak} value={peak}>
                                {peak}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`kpi-method-${index}`} className="text-sm font-medium">Measurement Method</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">How this KPI will be measured (e.g., POS data, manual timing, customer surveys)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id={`kpi-method-${index}`}
                        value={kpi.measurementMethod}
                        onChange={(e) => updateKPI(index, 'measurementMethod', e.target.value)}
                        placeholder="e.g., POS data, manual timing, customer surveys"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter goal description"
                required
                className="min-h-[100px] text-base"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-12 text-base bg-[#E51636] hover:bg-[#C41230] text-white"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}