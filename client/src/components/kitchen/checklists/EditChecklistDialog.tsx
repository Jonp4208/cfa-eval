import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, X, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'

interface EditChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'opening' | 'transition' | 'closing'
  items: any[]
  onSave: () => void
}

export function EditChecklistDialog({ open, onOpenChange, type, items, onSave }: EditChecklistDialogProps) {
  const { toast } = useToast()
  const [editItems, setEditItems] = useState<any[]>([])
  const [newItemLabel, setNewItemLabel] = useState('')
  const [saving, setSaving] = useState(false)

  // Initialize edit items when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Dialog opened, initializing items:', items)
      // Make sure we're working with a fresh copy of the items
      // and that each item has the required properties
      const formattedItems = items.map(item => ({
        id: item.id || item._id, // Handle both formats
        label: item.label || item.name, // Handle both formats
        isRequired: item.isRequired || false,
        isCompleted: item.isCompleted || false,
        type: item.type || item.shiftType || type, // Handle both formats
        order: item.order || 0
      }))
      console.log('Formatted items for editing:', formattedItems)
      setEditItems(formattedItems)
    }
  }, [open, items, type])

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return

    // Create a new item with a temporary ID that's clearly not a MongoDB ID
    const newItem = {
      id: `temp_${Date.now()}`,
      label: newItemLabel.trim(),
      isCompleted: false,
      isRequired: false,
      type,
      order: editItems.length,
      isNew: true // Flag to identify new items
    }

    console.log('Adding new item:', newItem)
    setEditItems([...editItems, newItem])
    setNewItemLabel('')
  }

  const handleRemoveItem = (id: string) => {
    setEditItems(editItems.filter(item => item.id !== id))
  }

  const handleUpdateItemLabel = (id: string, newLabel: string) => {
    setEditItems(editItems.map(item =>
      item.id === id ? { ...item, label: newLabel } : item
    ))
  }

  const handleSaveEdit = async () => {
    try {
      console.log('Saving checklist items:', editItems)
      setSaving(true)

      // Separate existing items from newly added items
      const existingItems = editItems.filter(item => typeof item.id === 'string' && item.id.length === 24)
      const newItems = editItems.filter(item => typeof item.id !== 'string' || item.id.length !== 24)

      console.log('Existing items:', existingItems.length)
      console.log('New items:', newItems.length)
      console.log('Total items:', editItems.length)

      // Let's try a different approach - only include the original items
      // and any new items that have been added
      const originalItemIds = new Set(items.map(item => item.id || item._id))
      console.log('Original item IDs:', originalItemIds)

      // Filter out any items that have temporary IDs (new items)
      const tempItems = editItems.filter(item =>
        typeof item.id === 'string' && item.id.startsWith('temp_')
      )

      // Get the original items that haven't been deleted
      const remainingOriginalItems = editItems.filter(item =>
        originalItemIds.has(item.id) || originalItemIds.has(item._id)
      )

      console.log('Temp items:', tempItems.length)
      console.log('Remaining original items:', remainingOriginalItems.length)

      // Create an array that matches the server's expected structure
      // For existing items, include their _id
      const itemsToSave = [
        ...remainingOriginalItems.map((item, index) => {
          const itemData = {
            label: item.label,
            isRequired: item.isRequired || false,
            type: type,
            order: index,
            isActive: true
          }

          // Include the _id for existing items so the server can update them
          if (item.id && item.id.length === 24 && !item.id.startsWith('temp_')) {
            itemData._id = item.id
          }

          return itemData
        }),
        ...tempItems.map((item, index) => ({
          label: item.label,
          isRequired: false, // New items are never required
          type: type,
          order: remainingOriginalItems.length + index,
          isActive: true
        }))
      ]

      console.log('Sending formatted items to API:', itemsToSave)

      // Use direct axios call with the correct base URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      // Log the exact payload we're sending
      console.log('PUT request payload:', { items: itemsToSave })

      const response = await axios.put(
        `${API_URL}/api/kitchen/checklists/shift/${type}`,
        { items: itemsToSave },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const updatedItems = response.data
      console.log('Checklist items updated successfully:', updatedItems)

      // Force a delay to ensure the server has time to process the update
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: 'Checklist updated',
        description: 'The checklist items have been updated successfully.'
      })

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating checklist items:', error)

      // Get more detailed error information if available
      let errorMessage = 'Failed to update checklist items. Please try again.'
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data)
        errorMessage = error.response.data.message || errorMessage
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        console.log('Dialog open state changing to:', newOpen)
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 rounded-xl shadow-xl border-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-[#E51636]/5 p-4 sm:p-6 border-b border-[#E51636]/10">
          <DialogHeader>
            <DialogTitle className="capitalize text-lg sm:text-xl font-semibold text-[#27251F]">
              Edit {type} Checklist
            </DialogTitle>
            <DialogDescription className="text-sm text-[#27251F]/70 mt-1.5">
              Add, remove, or modify checklist items. Required items cannot be removed.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add new item..."
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1 h-11 sm:h-10 rounded-lg border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/10"
            />
            <Button
              onClick={handleAddItem}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white h-11 sm:h-10 px-3 rounded-lg transition-all duration-200 shadow-md shadow-[#E51636]/10 hover:shadow-[#E51636]/20 active:translate-y-0.5"
              size="sm"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
            <h3 className="text-sm font-medium text-[#27251F]/70 mb-3">Current Items</h3>
            <ScrollArea className="h-[200px] sm:h-[250px] max-h-[40vh]">
              <div className="space-y-2 pr-4">
                {editItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      item.isRequired
                        ? "flex items-center gap-2 p-3 rounded-lg border bg-red-50/80 border-red-200/70"
                        : "flex items-center gap-2 p-3 rounded-lg border bg-white border-gray-200 hover:border-gray-300"
                    }
                    style={{
                      animationDelay: `${index * 30}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Input
                      value={item.label}
                      onChange={(e) => handleUpdateItemLabel(item.id, e.target.value)}
                      className={
                        item.isRequired
                          ? "flex-1 h-10 border-0 focus:ring-0 bg-transparent text-red-700 font-medium"
                          : "flex-1 h-10 border-0 focus:ring-0 bg-transparent"
                      }
                      disabled={item.isRequired}
                      placeholder="Task description"
                    />
                    {item.isRequired ? (
                      <Badge className="bg-red-100 text-red-600 border-0 text-xs px-2">Required</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 p-0 rounded-md"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {editItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <div className="bg-gray-100 p-3 rounded-full mb-3">
                    <CheckCircle2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">No items in this checklist</p>
                  <p className="text-xs text-gray-400">Add items using the field above</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 gap-2 sm:gap-0 sticky bottom-0 z-10">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Cancel button clicked')
              onOpenChange(false)
            }}
            disabled={saving}
            className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10 rounded-lg border-gray-300 text-[#27251F]/80 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Save Changes button clicked')
              handleSaveEdit()
            }}
            disabled={saving}
            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white w-full sm:w-auto order-1 sm:order-2 h-11 sm:h-10 rounded-lg transition-all duration-200 shadow-md shadow-[#E51636]/10 hover:shadow-[#E51636]/20 active:translate-y-0.5"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
