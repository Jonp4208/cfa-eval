import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface CreateChecklistItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftType: 'opening' | 'transition' | 'closing'
}

export function CreateChecklistItemDialog({
  open,
  onOpenChange,
  shiftType
}: CreateChecklistItemDialogProps) {
  const [itemName, setItemName] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createItemMutation = useMutation({
    mutationFn: async (data: { name: string; shiftType: string }) => {
      console.log('Creating kitchen task with data:', data)
      try {
        // Use a simpler approach - create a single new item
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

        // Create a new item directly
        const newItem = {
          label: data.name,
          type: data.shiftType,
          isRequired: false,
          isActive: true
        }

        console.log('Creating new item:', newItem)

        // Use a POST request to create a single new item
        const response = await axios.post(
          `${API_URL}/api/kitchen/checklists/shift/${data.shiftType}/item`,
          newItem,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        console.log('Task creation response:', response)
        return response.data
      } catch (error) {
        console.error('Error in task creation request:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
      queryClient.invalidateQueries({ queryKey: ['kitchen-tasks'] })
      setItemName('')
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Task created successfully'
      })
    },
    onError: (error) => {
      console.error('Error creating kitchen task:', error)
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return

    createItemMutation.mutate({
      name: itemName.trim(),
      shiftType: shiftType
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Kitchen Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter task name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createItemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!itemName.trim() || createItemMutation.isPending}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              {createItemMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
