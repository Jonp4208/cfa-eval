import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

// Import types from types.ts
import { Position, TimeBlock } from './types'

interface AddPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPosition: (position: Omit<Position, 'id'>) => void
  timeBlock: TimeBlock
}

export function AddPositionDialog({
  open,
  onOpenChange,
  onAddPosition,
  timeBlock
}: AddPositionDialogProps) {
  const [positionName, setPositionName] = useState('')
  const [category, setCategory] = useState(timeBlock?.category || 'Front Counter')

  // Update category when timeBlock changes
  useEffect(() => {
    if (timeBlock?.category) {
      setCategory(timeBlock.category)
    }
  }, [timeBlock])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!positionName.trim()) return

    console.log('Adding position with name:', positionName);
    console.log('Selected category:', category);

    // Create the new position
    const newPosition: Omit<Position, 'id'> = {
      name: positionName.trim(),
      category: category,
      section: category === 'Kitchen' ? 'BOH' : 'FOH',
      blockStart: timeBlock.start,
      blockEnd: timeBlock.end
    }

    console.log('New position object:', newPosition);

    // Add the position
    onAddPosition(newPosition)
    console.log('Position added with blockStart:', timeBlock.start, 'and blockEnd:', timeBlock.end)

    // Reset form
    setPositionName('')
    setCategory('Front Counter')

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-500" />
            Add New Position
          </DialogTitle>
          <DialogDescription>
            Add a new position to the time block {timeBlock.start} - {timeBlock.end}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="positionName">Position Name</Label>
              <Input
                id="positionName"
                placeholder="e.g., Register 3, Bagger 2, etc."
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label>Position Category</Label>
              <RadioGroup
                value={category}
                onValueChange={setCategory}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Front Counter" id="front-counter" />
                  <Label htmlFor="front-counter" className="cursor-pointer">Front Counter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Drive Thru" id="drive-thru" />
                  <Label htmlFor="drive-thru" className="cursor-pointer">Drive Thru</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Kitchen" id="kitchen" />
                  <Label htmlFor="kitchen" className="cursor-pointer">Kitchen</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!positionName.trim()}
            >
              Add Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
