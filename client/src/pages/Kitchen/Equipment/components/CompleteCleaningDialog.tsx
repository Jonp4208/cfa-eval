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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { CleaningSchedule, CleaningCompletionItem } from '@/services/kitchenService'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface CompleteCleaningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (notes: string, completedItems: CleaningCompletionItem[], isEarlyCompletion: boolean) => void
  schedule: CleaningSchedule
}

export default function CompleteCleaningDialog({
  open,
  onOpenChange,
  onComplete,
  schedule
}: CompleteCleaningDialogProps) {
  const [notes, setNotes] = useState('')
  const [completedItems, setCompletedItems] = useState<CleaningCompletionItem[]>([])
  const [isEarlyCompletion, setIsEarlyCompletion] = useState(false)

  useEffect(() => {
    if (open && schedule.checklist) {
      // Initialize completed items from the checklist
      setCompletedItems(
        schedule.checklist.map(item => ({
          name: item.name,
          isCompleted: false
        }))
      )
    } else {
      setCompletedItems([])
    }
    setNotes('')
    setIsEarlyCompletion(false)
  }, [open, schedule])

  const handleToggleItem = (index: number, checked: boolean) => {
    setCompletedItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], isCompleted: checked }
      return updated
    })
  }

  const handleComplete = () => {
    onComplete(notes, completedItems, isEarlyCompletion)
    setNotes('')
    setCompletedItems([])
    setIsEarlyCompletion(false)
    onOpenChange(false)
  }

  // Check if all required items are completed
  const canComplete = () => {
    if (!schedule.checklist || schedule.checklist.length === 0) return true

    // Check if all required items are completed
    return !schedule.checklist.some((item, index) =>
      item.isRequired && !completedItems[index]?.isCompleted
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Complete Cleaning Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-base font-medium">{schedule.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              Frequency: {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
            </p>
            {schedule.description && (
              <p className="text-sm mt-2 bg-gray-50 p-3 rounded-md">{schedule.description}</p>
            )}
          </div>

          {/* Checklist Items */}
          {schedule.checklist && schedule.checklist.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base">Checklist Items</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {schedule.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded touch-manipulation">
                    <Checkbox
                      id={`item-${index}`}
                      checked={completedItems[index]?.isCompleted || false}
                      onCheckedChange={(checked) => handleToggleItem(index, checked === true)}
                      className="h-5 w-5"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Label
                        htmlFor={`item-${index}`}
                        className="cursor-pointer flex flex-wrap items-center gap-2 text-base"
                      >
                        {item.isRequired && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Required
                          </span>
                        )}
                        <span className={completedItems[index]?.isCompleted ? 'line-through text-gray-500' : ''}>
                          {item.name}
                        </span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any notes about this cleaning task..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Early Completion Option */}
          <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <Checkbox
              id="early-completion"
              checked={isEarlyCompletion}
              onCheckedChange={(checked) => setIsEarlyCompletion(checked === true)}
              className="h-5 w-5 border-blue-300 data-[state=checked]:bg-blue-500"
            />
            <div className="flex-1">
              <Label
                htmlFor="early-completion"
                className="cursor-pointer text-sm font-medium text-blue-700"
              >
                Complete this task early
              </Label>
              <p className="text-xs text-blue-600 mt-1">
                This will mark the task as completed now, but will reset the schedule based on today's date.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 sm:h-10 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base sm:text-sm touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            className="w-full sm:w-auto h-11 sm:h-10 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500 text-base sm:text-sm touch-manipulation"
          >
            {!canComplete() ? 'Complete Required Items' : 'Mark as Completed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
