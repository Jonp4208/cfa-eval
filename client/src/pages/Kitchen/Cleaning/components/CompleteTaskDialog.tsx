import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CompleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  task: {
    id: string
    name: string
    requiredSupplies: string[]
    description: string
  }
}

export default function CompleteTaskDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  task 
}: CompleteTaskDialogProps) {
  const [formData, setFormData] = React.useState({
    notes: '',
    suppliesVerified: false,
    stepsVerified: false
  })

  // Reset form data when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        notes: '',
        suppliesVerified: false,
        stepsVerified: false
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('CompleteTaskDialog - Starting submission:', {
      taskId: task?.id,
      formData
    })

    if (!task?.id) {
      console.error('CompleteTaskDialog - No task ID provided')
      onOpenChange(false)
      return
    }

    if (!formData.suppliesVerified || !formData.stepsVerified) {
      console.warn('CompleteTaskDialog - Verifications not complete:', formData)
      return // Don't allow submission unless verifications are checked
    }

    try {
      await onSubmit({
        notes: formData.notes,
        status: 'completed',
        suppliesVerified: formData.suppliesVerified,
        stepsVerified: formData.stepsVerified
      })
      console.log('CompleteTaskDialog - Submission successful')
    } catch (error: any) {
      console.error('CompleteTaskDialog - Error submitting:', error)
      if (error.response) {
        console.error('CompleteTaskDialog - Error response:', error.response.data)
      }
    }
  }

  // Don't render if no task is provided
  if (!task?.id) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Task - {task.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Task Description */}
            <div className="space-y-2">
              <Label>Task Description</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {task.description}
              </div>
            </div>

            {/* Required Supplies Checklist */}
            <div className="space-y-2">
              <Label>Required Supplies</Label>
              <ScrollArea className="h-24 w-full rounded border p-2">
                <div className="space-y-2">
                  {task.requiredSupplies.map((supply, index) => (
                    <div key={`supply-${task.id}-${index}`} className="flex items-center">
                      <Checkbox id={`supply-${task.id}-${index}`} />
                      <label
                        htmlFor={`supply-${task.id}-${index}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {supply}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Verification Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supplies-verified"
                  checked={formData.suppliesVerified}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, suppliesVerified: checked as boolean }))
                  }
                />
                <label
                  htmlFor="supplies-verified"
                  className="text-sm font-medium leading-none"
                >
                  I verify that I have all required supplies and PPE
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="steps-verified"
                  checked={formData.stepsVerified}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, stepsVerified: checked as boolean }))
                  }
                />
                <label
                  htmlFor="steps-verified"
                  className="text-sm font-medium leading-none"
                >
                  I verify that I have completed all required steps
                </label>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about the completion of this task..."
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.suppliesVerified || !formData.stepsVerified}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              Mark Complete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 