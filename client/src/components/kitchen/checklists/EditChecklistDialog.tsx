import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, X, CheckCircle2 } from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
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
      setEditItems([...items])
    }
  }, [open, items])

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return

    const newItem = {
      id: `${type.charAt(0)}${Date.now()}`,
      label: newItemLabel.trim(),
      isCompleted: false,
      type,
      order: editItems.length
    }

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
      setSaving(true)
      const updatedItems = await kitchenService.updateShiftChecklistItems(type, editItems)
      
      toast({
        title: 'Checklist updated',
        description: 'The checklist items have been updated successfully.'
      })
      
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating checklist items:', error)
      toast({
        title: 'Error',
        description: 'Failed to update checklist items. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 rounded-xl shadow-xl border-0 overflow-hidden">
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

        <div className="p-4 sm:p-6 space-y-4">
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
            <ScrollArea className="h-[250px] sm:h-[300px]">
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

        <DialogFooter className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10 rounded-lg border-gray-300 text-[#27251F]/80 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
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
