import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  task?: {
    id: string
    name: string
    area: string
    frequency: string
    description: string
    requiredSupplies: string[]
    estimatedDuration: number
    isCritical: boolean
  }
}

export default function TaskDialog({ open, onOpenChange, onSubmit, task }: TaskDialogProps) {
  const [formData, setFormData] = React.useState({
    name: task?.name || '',
    area: task?.area || '',
    frequency: task?.frequency || '',
    description: task?.description || '',
    requiredSupplies: task?.requiredSupplies?.join(', ') || '',
    estimatedDuration: task?.estimatedDuration || 0,
    isCritical: task?.isCritical || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      requiredSupplies: formData.requiredSupplies.split(',').map(s => s.trim()).filter(Boolean)
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] h-[90vh] flex flex-col overflow-hidden p-0 border-none shadow-lg bg-white rounded-lg">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-[#27251F]">
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-medium">Task Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter task name"
                    className="h-9 rounded-[20px] border border-gray-100 shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="area" className="font-medium">Area</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                      required
                    >
                      <SelectTrigger id="area" className="h-9 rounded-[20px] border border-gray-100 shadow-sm">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen_equipment">Kitchen Equipment</SelectItem>
                        <SelectItem value="food_prep">Food Prep</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="floors">Floors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="frequency" className="font-medium">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                      required
                    >
                      <SelectTrigger id="frequency" className="h-9 rounded-[20px] border border-gray-100 shadow-sm">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    className="h-24 resize-none rounded-[20px] border border-gray-100 shadow-sm"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supplies" className="font-medium">Required Supplies</Label>
                  <Textarea
                    id="supplies"
                    value={formData.requiredSupplies}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredSupplies: e.target.value }))}
                    placeholder="Enter supplies (comma-separated)"
                    className="h-20 resize-none rounded-[20px] border border-gray-100 shadow-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="duration" className="font-medium">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                    className="h-9 rounded-[20px] border border-gray-100 shadow-sm"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="critical" className="font-medium">Critical Task</Label>
                  <Switch
                    id="critical"
                    checked={formData.isCritical}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCritical: checked }))}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-gray-100">
            <div className="flex space-x-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-[#27251F]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white"
              >
                {task ? 'Save Changes' : 'Add Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 