import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CleaningSchedule, CleaningChecklistItem } from '@/services/kitchenService'
import { Plus, Trash2 } from 'lucide-react'

interface CleaningScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (schedule: Omit<CleaningSchedule, 'completionHistory'>) => void
  onDelete?: (scheduleName: string) => void
  schedule?: CleaningSchedule
  title?: string
}

export default function CleaningScheduleDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  schedule,
  title = 'Add Cleaning Schedule'
}: CleaningScheduleDialogProps) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<CleaningSchedule['frequency']>('weekly')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<CleaningChecklistItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemRequired, setNewItemRequired] = useState(false)

  useEffect(() => {
    if (schedule) {
      setName(schedule.name)
      setFrequency(schedule.frequency)
      setDescription(schedule.description || '')
      setChecklist(schedule.checklist || [])
    } else {
      setName('')
      setFrequency('weekly')
      setDescription('')
      setChecklist([])
    }
    setNewItemName('')
    setNewItemRequired(false)
  }, [schedule, open])

  const handleAddChecklistItem = () => {
    if (!newItemName.trim()) return

    setChecklist(prev => [
      ...prev,
      { name: newItemName.trim(), isRequired: newItemRequired }
    ])

    setNewItemName('')
    setNewItemRequired(false)
  }

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      frequency,
      description: description.trim(),
      checklist
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cleaning Task Name</Label>
            <Input
              id="name"
              placeholder="e.g., Deep Clean Interior"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as CleaningSchedule['frequency'])}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="bimonthly">Every 2 Months</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter cleaning instructions or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Checklist Items</Label>
              <span className="text-xs text-gray-500">Mark required items</span>
            </div>

            {/* Add new checklist item */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter checklist item..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="required-item"
                    checked={newItemRequired}
                    onCheckedChange={(checked) => setNewItemRequired(checked === true)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="required-item" className="text-sm cursor-pointer">Required</Label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  disabled={!newItemName.trim()}
                  className="h-10 w-10 sm:h-9 sm:w-9 p-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 touch-manipulation"
                >
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Checklist items list */}
            {checklist.length > 0 && (
              <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded touch-manipulation">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${item.isRequired ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="truncate text-sm">{item.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChecklistItem(index)}
                      className="h-9 w-9 p-0 text-gray-500 hover:text-red-500 touch-manipulation"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          {schedule && onDelete && (
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the "${name}" cleaning schedule?`)) {
                  onDelete(name);
                  onOpenChange(false);
                }
              }}
              className="w-full sm:w-auto h-11 sm:h-10 bg-red-600 hover:bg-red-700 text-white text-base sm:text-sm touch-manipulation mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 sm:h-10 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base sm:text-sm touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full sm:w-auto h-11 sm:h-10 bg-[#E51636] hover:bg-[#D01530] text-white text-base sm:text-sm touch-manipulation"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
