import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Pencil, Plus, X, CheckCircle2, AlertCircle, Loader2, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { kitchenService, ShiftChecklistItem, ShiftChecklistCompletion } from '@/services/kitchenService'
import { useSnackbar } from 'notistack'
import { format, formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { getTodayDateString, isNewDay } from '@/lib/utils/date-utils'

interface ShiftChecklistProps {
  type: string
  onSave?: (type: string, items: ShiftChecklistItem[]) => void
}

export function ShiftChecklist({ type, onSave }: ShiftChecklistProps) {
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editItems, setEditItems] = useState<ShiftChecklistItem[]>([])
  const [newItemLabel, setNewItemLabel] = useState('')
  const [items, setItems] = useState<ShiftChecklistItem[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [completionInfo, setCompletionInfo] = useState<{
    completedBy?: { id: string; name: string };
    completedAt?: string;
  } | null>(null)

  // Load completion information
  const loadCompletionInfo = async () => {
    try {
      // We'll reuse the completion data from loadItems to avoid extra API calls
      // This function is mainly kept for backward compatibility
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const completions = await kitchenService.getShiftChecklistCompletions(type, {
        startDate: today
      })

      if (completions && completions.length > 0) {
        // Get the most recent completion
        const latestCompletion = completions[0]
        setCompletionInfo({
          completedBy: latestCompletion.completedBy,
          completedAt: latestCompletion.completedAt
        })
      } else {
        // No completions found for today
        setCompletionInfo(null)
      }
    } catch (error) {
      console.error('Error loading completion info:', error)
    }
  }

  // Check if the checklist should be reset (new day)
  useEffect(() => {
    const checkForReset = async () => {
      try {
        // Get the last saved date from localStorage - use a single key for all shift types
        const lastSavedDate = localStorage.getItem('kitchen-checklist-last-saved')

        // Use the getTodayDateString utility to get today's date in NY timezone
        const today = getTodayDateString()

        // If it's a new day (past midnight in NY timezone), we should reset the checklist
        if (isNewDay(lastSavedDate)) {
          console.log(`New day detected, resetting ${type} kitchen checklist`)

          // Reset all items to uncompleted
          const resetItems = items.map(item => ({
            ...item,
            isCompleted: false
          }))
          setItems(resetItems)

          // Update localStorage with today's date
          localStorage.setItem('kitchen-checklist-last-saved', today)

          // Show a toast notification
          enqueueSnackbar(`The ${type} checklist has been reset for a new day.`, {
            variant: 'info'
          })
        }
      } catch (error) {
        console.error('Error checking for reset:', error)
      }
    }

    if (items.length > 0) {
      checkForReset()
    }

    // Also set up an interval to check for reset (in case the app is left open overnight)
    const resetCheckInterval = setInterval(checkForReset, 60000) // Check every minute

    return () => clearInterval(resetCheckInterval)
  }, [items, type, enqueueSnackbar])

  const loadItems = useCallback(async () => {
    try {
      if (loading) return // Prevent multiple simultaneous loads

      setLoading(true)

      // Get the checklist items from the server
      const data = await kitchenService.getShiftChecklistItems(type)

      // Get the latest completions for today
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const completions = await kitchenService.getShiftChecklistCompletions(type, {
        startDate: today
      })

      // If we have completions for today, use that data to mark items as completed
      if (completions && completions.length > 0) {
        // Get the most recent completion
        const latestCompletion = completions[0]

        // Create a map of completed items
        const completedItemsMap = {}
        latestCompletion.items.forEach(item => {
          completedItemsMap[item.id] = item.isCompleted
        })

        // Update the items with completion status
        const updatedItems = data.map(item => ({
          ...item,
          isCompleted: completedItemsMap[item.id] || false,
          completedBy: item.isCompleted ? latestCompletion.completedBy : undefined,
          completedAt: item.isCompleted ? latestCompletion.completedAt : undefined
        }))

        setItems(updatedItems)
        setLastSaved(new Date(latestCompletion.completedAt))
        console.log('Using server completion data')
      } else {
        // No completions for today, use the base items
        setItems(data)
      }
    } catch (error) {
      console.error('Error loading checklist items:', error)
      enqueueSnackbar('Failed to load checklist items', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [type, enqueueSnackbar, loading])

  // Load items when type changes
  useEffect(() => {
    loadItems()
    loadCompletionInfo()
  }, [type, loadItems])

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial load happens via the loadItems call above

    // Set up polling every 45 seconds for real-time updates
    // Using a longer interval to reduce token expiration issues
    const interval = setInterval(() => {
      // Check if we have a valid token before making the request
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Polling for kitchen checklist updates')
        // Only load items, not completion info on every poll to reduce API calls
        loadItems()

        // Only check completion info every 3rd poll (approximately every 2 minutes)
        // This reduces the number of API calls while still keeping data relatively fresh
        const pollCount = parseInt(localStorage.getItem('kitchen-poll-count') || '0')
        const newPollCount = (pollCount + 1) % 3
        localStorage.setItem('kitchen-poll-count', newPollCount.toString())

        if (newPollCount === 0) {
          console.log('Checking completion info (every 3rd poll)')
          loadCompletionInfo()
        }
      } else {
        console.log('Skipping kitchen checklist poll - no valid token')
      }
    }, 45000) // 45 seconds

    return () => clearInterval(interval)
  }, [loadItems, loadCompletionInfo])

  const handleItemToggle = async (id: string) => {
    try {
      // First, check if we need to reset the checklist (new day)
      const lastSavedDate = localStorage.getItem('kitchen-checklist-last-saved')
      if (isNewDay(lastSavedDate)) {
        // It's a new day, we should reset before proceeding
        console.log('New day detected during task toggle, resetting checklist')

        // Update localStorage with today's date
        localStorage.setItem('kitchen-checklist-last-saved', getTodayDateString())

        // Show a notification about the reset
        enqueueSnackbar(`The ${type} checklist has been reset for a new day.`, {
          variant: 'info'
        })

        // Reload items to get fresh state
        await loadItems()
        return
      }

      const now = new Date()
      const targetItem = items.find(item => item.id === id)

      if (!targetItem) return

      // Create updated items array with the toggled item
      const updatedItems = items.map(item =>
        item.id === id ? {
          ...item,
          isCompleted: !item.isCompleted,
          // Add or remove completion info based on the new state
          ...(item.isCompleted ?
            { completedBy: undefined, completedAt: undefined } :
            { completedBy: user ? { id: user.id, name: user.name } : undefined, completedAt: now.toISOString() })
        } : item
      )

      // Update local state immediately for responsive UI
      setItems(updatedItems)

      // Save to localStorage for persistence
      saveToLocalStorage(updatedItems)

      // Save directly to the server - no debouncing
      console.log('Saving checklist item to server')
      const response = await kitchenService.completeShiftChecklist(type, {
        items: updatedItems.map(item => ({
          id: item.id,
          isCompleted: item.isCompleted
        }))
      })

      // Update completion info if all items are completed
      const allCompleted = updatedItems.every(item => !item.isRequired || item.isCompleted)
      if (allCompleted && user) {
        setCompletionInfo({
          completedBy: { id: user.id, name: user.name },
          completedAt: now.toISOString()
        })
      }

      // Update last saved time
      setLastSaved(now)

      // No need to show a notification for individual item toggles
    } catch (error) {
      console.error('Error toggling checklist item:', error)
      enqueueSnackbar('Failed to update checklist item', { variant: 'error' })

      // Revert the local state change on error
      loadItems()
    }
  }

  // Save current state to localStorage
  const saveToLocalStorage = (updatedItems: ShiftChecklistItem[]) => {
    try {
      const now = new Date()

      // Save the state with type-specific key (for component-specific state)
      localStorage.setItem(`${type}-checklist-state`, JSON.stringify({
        items: updatedItems,
        savedAt: now.toISOString()
      }))

      // Use the shared key for tracking the last saved date (for reset logic)
      // Use getTodayDateString to ensure consistent format with FOH
      localStorage.setItem('kitchen-checklist-last-saved', getTodayDateString())

      setLastSaved(now)
    } catch (e) {
      console.error('Error saving to localStorage:', e)
    }
  }

  const handleSave = async () => {
    try {
      // First, check if we need to reset the checklist (new day)
      const lastSavedDate = localStorage.getItem('kitchen-checklist-last-saved')
      if (isNewDay(lastSavedDate)) {
        // It's a new day, we should reset before proceeding
        console.log('New day detected during save, resetting checklist')

        // Update localStorage with today's date
        localStorage.setItem('kitchen-checklist-last-saved', getTodayDateString())

        // Show a notification about the reset
        enqueueSnackbar(`The ${type} checklist has been reset for a new day.`, {
          variant: 'info'
        })

        // Reload items to get fresh state
        await loadItems()
        return
      }

      setSaving(true)

      // Save directly to server
      const response = await kitchenService.completeShiftChecklist(type, {
        items: items.map(item => ({
          id: item.id,
          isCompleted: item.isCompleted
        }))
      })

      if (onSave) {
        onSave(type, items)
      }

      // Update completion info
      if (response && user) {
        setCompletionInfo({
          completedBy: { id: user.id, name: user.name },
          completedAt: new Date().toISOString()
        })
      }

      // Update last saved time
      const now = new Date()
      setLastSaved(now)
      saveToLocalStorage(items)

      // Refresh the data to ensure we have the latest from the server
      await loadCompletionInfo()

      enqueueSnackbar('Checklist progress saved successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error saving checklist:', error)
      enqueueSnackbar('Failed to save checklist progress', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const getProgress = () => {
    if (!items.length) return 0
    const completed = items.filter(item => item.isCompleted).length
    return Math.round((completed / items.length) * 100)
  }

  const getRequiredProgress = () => {
    const requiredItems = items.filter(item => item.isRequired)
    if (!requiredItems.length) return 100
    const completedRequired = requiredItems.filter(item => item.isCompleted).length
    return Math.round((completedRequired / requiredItems.length) * 100)
  }

  const handleStartEdit = () => {
    setEditingType(type)
    setEditItems([...items])
  }

  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      const updatedItems = await kitchenService.updateShiftChecklistItems(type, editItems)
      setItems(updatedItems)
      setEditingType(null)
      setEditItems([])
      setNewItemLabel('')
      enqueueSnackbar('Checklist items updated successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error updating checklist items:', error)
      enqueueSnackbar('Failed to update checklist items', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return

    const newItem: ShiftChecklistItem = {
      id: `${type.charAt(0)}${Date.now()}`,
      label: newItemLabel.trim(),
      isCompleted: false,
      type: type as 'opening' | 'transition' | 'closing',
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

  const progress = getProgress()
  const requiredProgress = getRequiredProgress()
  const isComplete = progress === 100
  const hasIncompleteRequired = items.some(item => item.isRequired && !item.isCompleted)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#E51636]/20 border-t-[#E51636] animate-spin"></div>
          </div>
          <span className="text-sm font-medium text-[#27251F]/70">Loading checklist...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Progress Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#27251F]/70">Overall Completion</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{progress}%</span>
                  {progress === 100 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isComplete
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-[#E51636]/80 to-[#E51636]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                {requiredProgress < 100 && (
                  <p className="text-xs text-[#27251F]/60">
                    {requiredProgress}% of required tasks completed
                  </p>
                )}
                {lastSaved && (
                  <div className="flex items-center gap-1 text-xs text-[#27251F]/60">
                    <Clock className="h-3 w-3" />
                    <span>Last saved: {format(lastSaved, 'h:mm a')}</span>
                  </div>
                )}
              </div>

              {/* Completion Information */}
              {completionInfo && completionInfo.completedBy && completionInfo.completedAt && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#27251F]/70">
                      <User className="h-3 w-3" />
                      <span>Completed by: <span className="font-medium text-[#27251F]">{completionInfo.completedBy.name}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#27251F]/70">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(completionInfo.completedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/5 w-full sm:w-auto h-10 sm:h-9 rounded-lg transition-all duration-200 active:scale-95"
            >
              <Pencil className="h-4 w-4" />
              <span>Customize List</span>
            </Button>
          </div>
        </div>

        {/* Required Tasks Warning */}
        {hasIncompleteRequired && (
          <div className="flex items-start gap-3 p-4 bg-amber-50/80 text-amber-700 rounded-xl border border-amber-200/70 animate-pulse-subtle">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-sm sm:text-base">Required tasks incomplete</p>
              <p className="text-xs sm:text-sm mt-1 text-amber-600/90">
                Complete all required tasks before saving your checklist progress.
              </p>
            </div>
          </div>
        )}

        {/* Checklist Items */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <ScrollArea className="h-[calc(100vh-380px)] sm:h-[400px] md:h-[500px]">
            <div className="space-y-px">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <div className="bg-gray-100 p-3 rounded-full mb-3">
                    <CheckCircle2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">No items in this checklist</p>
                  <p className="text-xs text-gray-400">Click "Customize List" to add items</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 p-4 transition-all duration-300",
                      item.isCompleted && (
                        isComplete
                          ? "bg-gradient-to-r from-green-50 to-white border-l-4 border-green-400"
                          : "bg-gradient-to-r from-[#E51636]/5 to-white border-l-4 border-[#E51636]"
                      ),
                      !item.isCompleted && "hover:bg-gray-50/80 active:bg-gray-100/80 bg-white",
                      "relative group"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div
                      className="mt-0.5 cursor-pointer"
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.isCompleted}
                        onCheckedChange={() => handleItemToggle(item.id)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2 transition-all duration-300",
                          item.isCompleted && (
                            isComplete
                              ? "border-green-500 bg-green-500 text-white shadow-sm shadow-green-200"
                              : "border-[#E51636] bg-[#E51636] text-white shadow-sm shadow-red-100"
                          ),
                          !item.isCompleted && "border-gray-300 group-hover:border-gray-400"
                        )}
                      />
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <Label
                        htmlFor={item.id}
                        className={cn(
                          "block text-base cursor-pointer select-none transition-all duration-300",
                          item.isCompleted && (
                            isComplete
                              ? "line-through text-green-600/70"
                              : "line-through text-[#27251F]/50"
                          ),
                          !item.isCompleted && "text-[#27251F] group-hover:text-[#27251F]/90"
                        )}
                      >
                        {item.label}
                      </Label>
                      {item.isRequired && (
                        <Badge
                          variant="outline"
                          className="mt-2 px-2.5 py-0.5 text-xs bg-red-50 text-red-600 border-red-200 font-medium rounded-full"
                        >
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      <div className="flex items-center gap-1.5">
                        {item.isCompleted && (
                          <CheckCircle2
                            className={cn(
                              "h-5 w-5 flex-shrink-0 transition-all",
                              isComplete
                                ? "text-green-500"
                                : "text-[#E51636]"
                            )}
                          />
                        )}
                      </div>
                      {item.isCompleted && item.completedBy && item.completedAt && (
                        <div className="mt-1 flex flex-col items-end bg-gray-50 p-1.5 rounded-md">
                          <div className="flex items-center gap-1 text-xs text-[#27251F]/70">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium">{item.completedBy.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#27251F]/60 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{format(new Date(item.completedAt), 'h:mm a')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Add Quick Item */}
          {items.length > 0 && (
            <div className="p-3 bg-gray-50/80 border-t border-gray-100">
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 w-full p-2.5 rounded-lg border border-dashed border-gray-300 hover:border-[#E51636]/30 hover:bg-white justify-center text-sm text-[#27251F]/60 hover:text-[#E51636] transition-all duration-150"
              >
                <Plus className="h-4 w-4" />
                <span>Add another task</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={hasIncompleteRequired || saving}
            className={cn(
              "text-white transition-all duration-200 min-w-[140px] h-11 rounded-lg font-medium",
              isComplete
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:brightness-105 shadow-md shadow-green-200/50"
                : "bg-gradient-to-r from-[#E51636] to-[#C41230] hover:brightness-105 shadow-md shadow-[#E51636]/20",
              (hasIncompleteRequired || saving) && "opacity-50 cursor-not-allowed",
              "active:translate-y-0.5 active:shadow-sm"
            )}
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Saving...
              </>
            ) : isComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Completed!
              </>
            ) : (
              'Save Progress'
            )}
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
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
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        item.isRequired
                          ? "bg-red-50/80 border-red-200/70"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <Input
                        value={item.label}
                        onChange={(e) => handleUpdateItemLabel(item.id, e.target.value)}
                        className={cn(
                          "flex-1 h-10 border-0 focus:ring-0 bg-transparent",
                          item.isRequired && "text-red-700 font-medium"
                        )}
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
              onClick={() => setEditingType(null)}
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

      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}