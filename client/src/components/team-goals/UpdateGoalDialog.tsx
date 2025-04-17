'use client'

import * as React from 'react'
import { useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Goal } from '@/types/goals'
import { updateGoal } from '@/services/goalService'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface UpdateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal
  onUpdate: () => void
}

export function UpdateGoalDialog({
  open,
  onOpenChange,
  goal,
  onUpdate
}: UpdateGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: goal.name,
    businessArea: goal.businessArea,
    goalPeriod: goal.goalPeriod,
    description: goal.description,
    kpis: goal.kpis
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAddKPI = () => {
    setFormData({
      ...formData,
      kpis: [...formData.kpis, { name: '', targetValue: 0, unit: '', peak: 'All Day' }]
    })
  }

  const handleRemoveKPI = (index: number) => {
    setFormData({
      ...formData,
      kpis: formData.kpis.filter((_, i) => i !== index)
    })
  }

  const handleKPIChange = (index: number, field: keyof typeof formData.kpis[0], value: string | number) => {
    const newKPIs = [...formData.kpis]
    newKPIs[index] = {
      ...newKPIs[index],
      [field]: field === 'targetValue' ? Number(value) : value
    }
    setFormData({ ...formData, kpis: newKPIs })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateGoal(goal._id, formData)
      onUpdate()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-[#E51636]/10">
            <DialogTitle className="text-[#E51636]">Update Team Goal</DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#58595B]">Goal Title</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                  placeholder="Enter goal title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessArea" className="text-[#58595B]">Business Area</Label>
                <Select
                  value={formData.businessArea}
                  onValueChange={(value) =>
                    setFormData({ ...formData, businessArea: value })
                  }
                  required
                >
                  <SelectTrigger id="businessArea" className="border-[#E51636]/20 focus:ring-[#E51636]">
                    <SelectValue placeholder="Select business area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front Counter">Front Counter</SelectItem>
                    <SelectItem value="Drive Thru">Drive Thru</SelectItem>
                    <SelectItem value="Kitchen">Kitchen</SelectItem>
                    <SelectItem value="Dining Room">Dining Room</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Food Safety">Food Safety</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Team Member Development">Team Member Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalPeriod" className="text-[#58595B]">Goal Period</Label>
                <Select
                  value={formData.goalPeriod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, goalPeriod: value })
                  }
                  required
                >
                  <SelectTrigger className="border-[#E51636]/20 focus:ring-[#E51636]">
                    <SelectValue placeholder="Select goal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#58595B]">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                  placeholder="Enter goal description"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[#58595B]">KPIs</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKPI}
                    className="border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/10 hover:text-[#E51636]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add KPI
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.kpis.map((kpi, index) => (
                    <Card key={index} className="border-[#E51636]/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[#58595B]">KPI Name</Label>
                                <Input
                                  value={kpi.name}
                                  onChange={(e) => handleKPIChange(index, 'name', e.target.value)}
                                  className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                                  placeholder="Enter KPI name"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[#58595B]">Target Value</Label>
                                <Input
                                  type="number"
                                  value={kpi.targetValue}
                                  onChange={(e) => handleKPIChange(index, 'targetValue', e.target.value)}
                                  className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                                  placeholder="Enter target value"
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[#58595B]">Unit</Label>
                                <Input
                                  value={kpi.unit}
                                  onChange={(e) => handleKPIChange(index, 'unit', e.target.value)}
                                  className="border-[#E51636]/20 focus-visible:ring-[#E51636]"
                                  placeholder="Enter unit (e.g., %, mins)"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[#58595B]">Peak Period</Label>
                                <Select
                                  value={kpi.peak}
                                  onValueChange={(value) => handleKPIChange(index, 'peak', value)}
                                  required
                                >
                                  <SelectTrigger className="border-[#E51636]/20 focus:ring-[#E51636]">
                                    <SelectValue placeholder="Select peak period" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                                    <SelectItem value="Lunch">Lunch</SelectItem>
                                    <SelectItem value="Dinner">Dinner</SelectItem>
                                    <SelectItem value="All Day">All Day</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-2 text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10"
                            onClick={() => handleRemoveKPI(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
              {isLoading ? 'Updating...' : 'Update Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 