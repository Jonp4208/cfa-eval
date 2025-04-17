import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Pencil, RefreshCw, Loader2 } from 'lucide-react'
import { KitchenTaskList } from './KitchenTaskList'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { kitchenService } from '@/services/kitchenService'

type ShiftType = 'opening' | 'transition' | 'closing'

interface ShiftChecklistItem {
  id: string
  label: string
  isRequired?: boolean
  isCompleted: boolean
  type: ShiftType
  completedBy?: {
    id: string
    name: string
  }
  completedAt?: string
}

export function SimpleKitchenChecklist() {
  const [activeTab, setActiveTab] = useState<ShiftType>('opening')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // State to track if we need to force refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial load happens via the useQuery below

    // Set up polling every 60 seconds for real-time updates
    const interval = setInterval(() => {
      // Check if we have a valid token before making the request
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Polling for kitchen checklist updates')
        queryClient.invalidateQueries({ queryKey: ['kitchen-checklist-simple'] })
      } else {
        console.log('Skipping kitchen checklist poll - no valid token')
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient])

  // Fetch checklist items for the active tab
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['kitchen-checklist-simple', activeTab, today, refreshTrigger],
    queryFn: async () => {
      console.log(`Fetching ${activeTab} kitchen checklist items`)
      try {
        // Get the checklist items
        const baseItems = await kitchenService.getShiftChecklistItems(activeTab)

        // Get the completions for today
        const completions = await kitchenService.getShiftChecklistCompletions(activeTab, {
          startDate: today
        })

        // If we have completions, mark items as completed
        if (completions && completions.length > 0) {
          const latestCompletion = completions[0]

          // Create a map of completed items
          const completedItemsMap = {}
          latestCompletion.items.forEach(item => {
            completedItemsMap[item.id] = item.isCompleted
          })

          console.log('Latest completion:', latestCompletion)
          console.log('Completed items map:', completedItemsMap)

          // Update the items with completion status
          return baseItems.map(item => {
            const isItemCompleted = completedItemsMap[item.id]
            console.log(`Item ${item.id} (${item.label}) completed:`, isItemCompleted)
            return {
              ...item,
              isCompleted: isItemCompleted === true,
              completedBy: isItemCompleted ? latestCompletion.completedBy : undefined,
              completedAt: isItemCompleted ? latestCompletion.completedAt : undefined
            }
          })
        }

        return baseItems
      } catch (error) {
        console.error(`Error fetching ${activeTab} kitchen checklist:`, error)
        throw error
      }
    },
    refetchOnWindowFocus: true
  })

  // Mutation for completing/uncompleting a task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Find the task in the current list
      const task = items.find(t => t.id === taskId)

      if (!task) {
        throw new Error('Task not found')
      }

      console.log(`${task.isCompleted ? 'Uncompleting' : 'Completing'} kitchen task:`, taskId)

      // Update the local state optimistically
      const updatedTask = {
        ...task,
        isCompleted: !task.isCompleted
      }

      // Return the updated task
      return {
        taskId,
        isCompleted: updatedTask.isCompleted,
        task: updatedTask
      }
    },
    onSuccess: (data) => {
      // Show success toast
      toast({
        title: data.isCompleted ? 'Task completed' : 'Task uncompleted',
        description: data.isCompleted ? 'The task has been marked as completed.' : 'The task has been marked as not completed.'
      })

      // Update the local cache
      queryClient.setQueryData(['kitchen-checklist-simple', activeTab, today, refreshTrigger], (oldData: any) => {
        if (!oldData) return oldData

        // Update the item in the local cache
        return oldData.map(item => {
          if (item.id === data.taskId) {
            return {
              ...item,
              isCompleted: data.isCompleted,
              completedBy: data.isCompleted ? { id: user?.id, name: user?.name } : undefined,
              completedAt: data.isCompleted ? new Date().toISOString() : undefined
            }
          }
          return item
        })
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update the task status. Please try again.',
        variant: 'destructive'
      })
      console.error('Error updating task status:', error)
    }
  })

  // Mutation for saving all checklist items
  const saveChecklistMutation = useMutation({
    mutationFn: async () => {
      // Check if all required items are completed
      const requiredItems = items.filter(item => item.isRequired)
      const allRequiredCompleted = requiredItems.length === 0 ||
        requiredItems.every(item => item.isCompleted)

      if (!allRequiredCompleted) {
        throw new Error('All required items must be completed')
      }

      console.log('Saving entire checklist to server')

      // Just return the current items - we'll handle the UI update in onSuccess
      return { items, activeTab }
    },
    onSuccess: (data) => {
      // Show success toast
      toast({
        title: 'Checklist saved',
        description: 'The checklist has been saved successfully.'
      })

      // Update the local cache with the saved items
      queryClient.setQueryData(['kitchen-checklist-simple', data.activeTab, today, refreshTrigger], data.items)

      // Force a refresh to ensure we have the latest data
      setRefreshTrigger(prev => prev + 1)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save the checklist. Please try again.',
        variant: 'destructive'
      })
      console.error('Error saving checklist:', error)
    }
  })

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    completeTaskMutation.mutate(taskId)
  }

  // Handle save all
  const handleSaveAll = () => {
    saveChecklistMutation.mutate()
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Calculate statistics
  const totalTasks = items.length
  const completedTasks = items.filter(task => task.isCompleted).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Count tasks by shift type
  const openingTasks = items.filter(task => task.type === 'opening').length
  const openingCompleted = items.filter(task => task.type === 'opening' && task.isCompleted).length

  const transitionTasks = items.filter(task => task.type === 'transition').length
  const transitionCompleted = items.filter(task => task.type === 'transition' && task.isCompleted).length

  const closingTasks = items.filter(task => task.type === 'closing').length
  const closingCompleted = items.filter(task => task.type === 'closing' && task.isCompleted).length

  // Check if all required tasks are completed
  const hasIncompleteRequired = items.some(task => task.isRequired && !task.isCompleted)

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#27251F]/70">Overall Completion</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold">{completionPercentage}%</span>
                {completionPercentage === 100 && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  completionPercentage === 100
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-[#E51636]/80 to-[#E51636]"
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-[#27251F]/60">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 w-full sm:w-auto h-10 sm:h-9 rounded-lg transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Required Tasks Warning */}
      {hasIncompleteRequired && (
        <div className="flex items-start gap-3 p-4 bg-amber-50/80 text-amber-700 rounded-xl border border-amber-200/70">
          <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-sm sm:text-base">Required tasks incomplete</p>
            <p className="text-xs sm:text-sm mt-1 text-amber-600/90">
              Complete all required tasks before saving your checklist progress.
            </p>
          </div>
        </div>
      )}

      {/* Task Tabs */}
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShiftType)}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="opening"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Opening</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transition"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span>Transition</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span>Closing</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#E51636]" />
                    <span className="text-sm font-medium text-[#27251F]/70">Loading checklist...</span>
                  </div>
                </div>
              ) : (
                <KitchenTaskList
                  tasks={items}
                  onComplete={handleTaskComplete}
                  isLoading={isLoading}
                />
              )}
            </div>
          </Tabs>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSaveAll}
          disabled={hasIncompleteRequired || saveChecklistMutation.isPending}
          className={cn(
            "text-white transition-all duration-200 min-w-[140px] h-11 rounded-lg font-medium",
            completionPercentage === 100
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:brightness-105 shadow-md shadow-green-200/50"
              : "bg-gradient-to-r from-[#E51636] to-[#C41230] hover:brightness-105 shadow-md shadow-[#E51636]/20",
            (hasIncompleteRequired || saveChecklistMutation.isPending) && "opacity-50 cursor-not-allowed",
            "active:translate-y-0.5 active:shadow-sm"
          )}
        >
          {saveChecklistMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              Saving...
            </>
          ) : completionPercentage === 100 ? (
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
  )
}
