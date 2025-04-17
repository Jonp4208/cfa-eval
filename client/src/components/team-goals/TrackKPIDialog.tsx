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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Goal, KPI } from '@/types/goals'
import { updateGoal } from '@/services/goalService'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TrackKPIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal
  onUpdate: () => void
}

type Measurement = {
  value: number
  date: Date
  notes?: string
}

type KPIWithMeasurements = KPI & {
  measurements: Measurement[]
}

export function TrackKPIDialog({
  open,
  onOpenChange,
  goal,
  onUpdate
}: TrackKPIDialogProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [measurements, setMeasurements] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMeasurementChange = (index: number, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [index]: Number(value)
    }))
  }

  const handleNotesChange = (index: number, value: string) => {
    setNotes(prev => ({
      ...prev,
      [index]: value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('Submitting measurements:', measurements)
    setIsLoading(true)

    try {
      const updatedKPIs = goal.kpis.map((kpi, index) => {
        const existingMeasurements = kpi.measurements || []
        const newMeasurement = measurements[index] !== undefined ? {
          value: measurements[index],
          date: date.toISOString(), // Convert to ISO string for proper serialization
          notes: notes[index] || ''
        } : null

        return {
          ...kpi,
          measurements: newMeasurement
            ? [...existingMeasurements, newMeasurement]
            : existingMeasurements
        }
      })

      console.log('Sending updated KPIs to server:', updatedKPIs)

      const updatedGoal = await updateGoal(goal._id, {
        ...goal,
        kpis: updatedKPIs
      })

      console.log('Server response:', updatedGoal)

      onUpdate()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Measurements updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update measurements',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[95vh] p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-[#E51636]/10">
            <DialogTitle className="text-[#E51636]">Track KPI Measurements</DialogTitle>
            <DialogDescription className="text-[#58595B]">
              Record measurements for {goal.name}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#58595B]">Measurement Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#E51636]/20 text-[#58595B] hover:bg-[#E51636]/10 hover:text-[#E51636]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                {goal.kpis.map((kpi, index) => (
                  <Card key={index} className="border-[#E51636]/10">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-[#E51636] mb-1">{kpi.name}</h4>
                            <div className="flex justify-between text-sm text-[#58595B]">
                              <div className="flex items-center gap-2">
                                <span>Target: {kpi.targetValue} {kpi.unit}</span>
                                <span className="text-xs text-gray-500">({kpi.measurementMethod})</span>
                              </div>
                              <span>Peak: {kpi.peak}</span>
                            </div>
                          </div>

                          {kpi.measurements && kpi.measurements.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-xs font-medium text-gray-500 mb-2">Previous Measurements</p>
                              <div className="space-y-1">
                                {kpi.measurements.slice(-2).reverse().map((measurement, i) => {
                                  const prevValue = i < kpi.measurements.length - 1 ? kpi.measurements[kpi.measurements.length - i - 2].value : null;
                                  const trend = prevValue !== null ? (measurement.value > prevValue ? 'up' : 'down') : null;

                                  return (
                                    <div key={i} className="flex justify-between items-center text-xs py-1">
                                      <span className="text-gray-600">{new Date(measurement.date).toLocaleDateString()}</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{measurement.value} {kpi.unit}</span>
                                        {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[#58595B] flex items-center gap-1">
                                New Measurement
                                <span className="text-xs text-gray-500">(in {kpi.unit})</span>
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`Enter ${kpi.name} measurement`}
                                value={measurements[index] || ''}
                                onChange={(e) => handleMeasurementChange(index, e.target.value)}
                                className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[#58595B]">Notes</Label>
                              <Input
                                placeholder="Add any notes"
                                value={notes[index] || ''}
                                onChange={(e) => handleNotesChange(index, e.target.value)}
                                className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E51636]/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#58595B]/20 text-[#58595B] hover:bg-[#58595B]/10 hover:text-[#58595B]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              {isLoading ? 'Saving...' : 'Save Measurements'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}