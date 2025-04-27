import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Pencil, RefreshCw } from 'lucide-react'
import { KitchenTaskList } from './KitchenTaskList'
import { kitchenService } from '@/services/kitchenService'
import { useAuth } from '@/hooks/useAuth'
import { EditChecklistDialog } from './EditChecklistDialog'

type ShiftType = 'opening' | 'transition' | 'closing'

interface ShiftChecklistProps {
  type?: ShiftType
}

export function KitchenChecklist({ type = 'opening' }: ShiftChecklistProps) {
  const [activeTab, setActiveTab] = useState<ShiftType>(type)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
        queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
      } else {
        console.log('Skipping kitchen checklist poll - no valid token')
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient])

  // Fetch checklist items for all types
  const { data: allItems = {}, isLoading } = useQuery({
    queryKey: ['kitchen-checklist', today, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching kitchen checklist items')
      try {
        // Fetch all three types of checklists
        const [opening, transition, closing] = await Promise.all([
          kitchenService.getShiftChecklistItems('opening'),
          kitchenService.getShiftChecklistItems('transition'),
          kitchenService.getShiftChecklistItems('closing')
        ])

        // Get the latest completions for today
        const [openingCompletions, transitionCompletions, closingCompletions] = await Promise.all([
          kitchenService.getShiftChecklistCompletions('opening', { startDate: today }),
          kitchenService.getShiftChecklistCompletions('transition', { startDate: today }),
          kitchenService.getShiftChecklistCompletions('closing', { startDate: today })
        ])

        // Process opening items
        const processedOpening = processItemsWithCompletions(opening, openingCompletions)

        // Process transition items
        const processedTransition = processItemsWithCompletions(transition, transitionCompletions)

        // Process closing items
        const processedClosing = processItemsWithCompletions(closing, closingCompletions)

        return {
          opening: processedOpening,
          transition: processedTransition,
          closing: processedClosing
        }
      } catch (error) {
        console.error('Error fetching kitchen checklist items:', error)
        throw error
      }
    },
    refetchOnWindowFocus: true
  })

  // Helper function to process items with completions
  const processItemsWithCompletions = (items, completions) => {
    if (!completions || completions.length === 0) {
      return items
    }

    // Get the most recent completion
    const latestCompletion = completions[0]

    // Create a map of completed items
    const completedItemsMap = {}
    latestCompletion.items.forEach(item => {
      completedItemsMap[item.id] = item.isCompleted
    })

    // Log the completion data for debugging
    console.log('Latest completion:', latestCompletion)
    console.log('Completed items map:', completedItemsMap)

    // Update the items with completion status
    return items.map(item => {
      const isItemCompleted = completedItemsMap[item.id]
      console.log(`Item ${item.id} (${item.label}) completed:`, isItemCompleted)
      return {
        ...item,
        isCompleted: isItemCompleted === true, // Ensure boolean value
        completedBy: isItemCompleted ? latestCompletion.completedBy : undefined,
        completedAt: isItemCompleted ? latestCompletion.completedAt : undefined
      }
    })
  }

  // Mutation for completing/uncompleting a task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Find the task in the current list
      const tasks = allItems[activeTab] || []
      const task = tasks.find(t => t.id === taskId)

      if (!task) {
        throw new Error('Task not found')
      }

      // Create updated items array with the toggled item
      const updatedItems = tasks.map(item =>
        item.id === taskId ? {
          ...item,
          isCompleted: !item.isCompleted,
          // Add or remove completion info based on the new state
          ...(item.isCompleted ?
            { completedBy: undefined, completedAt: undefined } :
            { completedBy: user ? { id: user.id, name: user.name } : undefined, completedAt: new Date().toISOString() })
        } : item
      )

      // Update the local cache immediately for a responsive UI
      // We'll only update the server when all required items are completed
      // or when the user explicitly clicks the save button

      // Check if all required items are completed
      const requiredItems = updatedItems.filter(item => item.isRequired)
      const allRequiredCompleted = requiredItems.length === 0 ||
        requiredItems.every(item => item.isCompleted)

      // Try to save to server with forcePartialSave flag
      try {
        console.log('Saving checklist item to server')

        // First, get all the current items to ensure we're sending a complete list
        const allCurrentItems = allItems[activeTab] || []

        // Create a map of the updated items
        const updatedItemsMap = {}
        updatedItems.forEach(item => {
          updatedItemsMap[item.id] = item.isCompleted
        })

        // Create a complete list of all items with their updated status
        const completeItemsList = allCurrentItems.map(item => ({
          id: item.id,
          isCompleted: updatedItemsMap[item.id] !== undefined ? updatedItemsMap[item.id] : item.isCompleted
        }))

        // Send the complete list to the server
        const response = await kitchenService.completeShiftChecklist(activeTab, {
          items: completeItemsList,
          forcePartialSave: !allRequiredCompleted // Force partial save if not all required items are completed
        })

        console.log('Server response after saving:', response)
        return { type: activeTab, updatedItems, response, savedToServer: true }
      } catch (error) {
        console.log('Error saving to server:', error)
        return { type: activeTab, updatedItems, savedToServer: false }
      }
    },
    onSuccess: (data) => {
      // Update the local cache
      queryClient.setQueryData(['kitchen-checklist', today, refreshTrigger], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          [data.type]: data.updatedItems
        }
      })

      // Show success toast
      const task = data.updatedItems.find(item => item.isCompleted !== allItems[activeTab]?.find(t => t.id === item.id)?.isCompleted)
      if (task) {
        toast({
          title: task.isCompleted ? 'Task completed' : 'Task uncompleted',
          description: task.isCompleted ? 'The task has been marked as completed.' : 'The task has been marked as not completed.'
        })
      }

      // If we successfully saved to the server, invalidate the query to refresh the data
      if (data.savedToServer) {
        queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
      }
    },
    onError: (error) => {
      console.error('Error toggling checklist item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update the task status. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Mutation for saving all checklist items
  const saveChecklistMutation = useMutation({
    mutationFn: async () => {
      const tasks = allItems[activeTab] || []

      // Check if all required items are completed
      const requiredItems = tasks.filter(item => item.isRequired)
      const allRequiredCompleted = requiredItems.length === 0 ||
        requiredItems.every(item => item.isCompleted)

      if (!allRequiredCompleted) {
        throw new Error('All required items must be completed')
      }

      // Save to server
      console.log('Saving entire checklist to server')

      // Make sure we're sending all items
      const allItems = tasks.map(item => ({
        id: item.id,
        isCompleted: item.isCompleted
      }))

      console.log('Sending all items to server:', allItems)

      const response = await kitchenService.completeShiftChecklist(activeTab, {
        items: allItems
      })

      return { type: activeTab, response }
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: 'Checklist saved',
        description: 'The checklist has been saved successfully.'
      })

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
    },
    onError: (error) => {
      console.error('Error saving checklist:', error)
      toast({
        title: 'Error',
        description: 'Failed to save the checklist. Please try again.',
        variant: 'destructive'
      })
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

  // Handle edit checklist
  const handleEditChecklist = () => {
    console.log('Opening edit dialog')
    setIsEditDialogOpen(true)
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Calculate statistics
  const tasks = allItems[activeTab] || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.isCompleted).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Count tasks by shift type
  const openingTasks = allItems.opening?.length || 0
  const openingCompleted = allItems.opening?.filter(task => task.isCompleted).length || 0

  const transitionTasks = allItems.transition?.length || 0
  const transitionCompleted = allItems.transition?.filter(task => task.isCompleted).length || 0

  const closingTasks = allItems.closing?.length || 0
  const closingCompleted = allItems.closing?.filter(task => task.isCompleted).length || 0

  // Check if all required tasks are completed
  const hasIncompleteRequired = tasks.some(task => task.isRequired && !task.isCompleted)

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
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Customize List button clicked')
                handleEditChecklist()
              }}
              className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/5 w-full sm:w-auto h-10 sm:h-9 rounded-lg transition-all duration-200"
            >
              <Pencil className="h-4 w-4" />
              <span>Customize List</span>
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
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{openingCompleted}/{openingTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transition"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span>Transition</span>
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{transitionCompleted}/{transitionTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span>Closing</span>
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{closingCompleted}/{closingTasks}</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="opening">
                <KitchenTaskList
                  tasks={allItems.opening || []}
                  onComplete={handleTaskComplete}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="transition">
                <KitchenTaskList
                  tasks={allItems.transition || []}
                  onComplete={handleTaskComplete}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="closing">
                <KitchenTaskList
                  tasks={allItems.closing || []}
                  onComplete={handleTaskComplete}
                  isLoading={isLoading}
                />
              </TabsContent>
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

      {/* Edit Dialog */}
      <EditChecklistDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          console.log('Setting edit dialog open state to:', open)
          setIsEditDialogOpen(open)
        }}
        type={activeTab}
        items={allItems[activeTab] || []}
        onSave={() => {
          console.log('Dialog save callback triggered')
          queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
        }}
      />
    </div>
  )
}

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
