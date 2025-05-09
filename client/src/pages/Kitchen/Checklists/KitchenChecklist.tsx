import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Loader2, Sun, Moon, ArrowLeftRight, Pencil, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KitchenTaskList } from '@/components/kitchen/checklists/KitchenTaskList'
import { EditChecklistDialog } from '@/components/kitchen/checklists/EditChecklistDialog'
import { getTodayDateString, isNewDay } from '@/lib/utils/date-utils'

type ShiftType = 'opening' | 'transition' | 'closing'

// Define the task interface for type safety
interface Task {
  id: string
  label: string
  isRequired?: boolean
  isCompleted: boolean
  type: ShiftType
  order?: number
  completedBy?: {
    id: string
    name: string
  }
  completedAt?: string
}

export function KitchenChecklist() {
  const [activeTab, setActiveTab] = useState<ShiftType>('opening')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Get today's date in YYYY-MM-DD format using our utility function
  const today = getTodayDateString()

  // Check if the checklist should be reset (new day)
  useEffect(() => {
    const checkForReset = () => {
      try {
        // Get the last saved date from localStorage
        const lastSavedDate = localStorage.getItem('kitchen-checklist-last-saved')

        // If it's a new day (past midnight), we should reset the checklist
        if (isNewDay(lastSavedDate)) {
          console.log('New day detected, resetting kitchen checklist')

          // Force a refresh of the data
          queryClient.invalidateQueries({ queryKey: ['kitchen-tasks'] })

          // Update localStorage with today's date
          localStorage.setItem('kitchen-checklist-last-saved', today)

          // Show a toast notification
          toast({
            title: 'Checklist Reset',
            description: 'The checklist has been reset for a new day.',
          })
        }
      } catch (error) {
        console.error('Error checking for checklist reset:', error)
      }
    }

    // Check for reset when component mounts
    checkForReset()

    // Also set up an interval to check for reset (in case the app is left open overnight)
    const resetCheckInterval = setInterval(checkForReset, 60000) // Check every minute

    return () => clearInterval(resetCheckInterval)
  }, [queryClient, today, toast])

  // Set up polling for real-time updates
  useEffect(() => {
    // Set up polling every 60 seconds for real-time updates
    const interval = setInterval(() => {
      // Check if we have a valid token before making the request
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Polling for kitchen checklist updates')
        queryClient.invalidateQueries({ queryKey: ['kitchen-tasks', today] })
      } else {
        console.log('Skipping kitchen checklist poll - no valid token')
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient, today])

  // Fetch tasks for the active tab
  const { data: tasks = [] as Task[], isLoading } = useQuery<Task[]>({
    queryKey: ['kitchen-tasks', activeTab, today],
    queryFn: async () => {
      console.log(`Fetching ${activeTab} kitchen tasks`)
      try {
        // Get the checklist items
        const response = await axios.get(`/api/kitchen/checklists/shift/${activeTab}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        const baseItems = response.data

        // Get the completions for today
        const completionsResponse = await axios.get(`/api/kitchen/checklists/shift/${activeTab}/completions`, {
          params: { startDate: today },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        const completions = completionsResponse.data

        // If we have completions, mark items as completed
        if (completions && completions.length > 0) {
          const latestCompletion = completions[0]

          // Create a map of completed items
          const completedItemsMap: Record<string, boolean> = {}
          latestCompletion.items.forEach((item: { id: string, isCompleted: boolean }) => {
            completedItemsMap[item.id] = item.isCompleted
          })

          // Update the items with completion status
          return baseItems.map((item: any) => ({
            ...item,
            isCompleted: completedItemsMap[item.id] === true,
            completedBy: completedItemsMap[item.id] ? latestCompletion.completedBy : undefined,
            completedAt: completedItemsMap[item.id] ? latestCompletion.completedAt : undefined
          }))
        }

        return baseItems
      } catch (error) {
        console.error(`Error fetching ${activeTab} kitchen tasks:`, error)
        throw error
      }
    },
    refetchOnWindowFocus: true
  })

  // Mutation for completing/uncompleting a task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // First, check if we need to reset the checklist (new day)
      const lastSavedDate = localStorage.getItem('kitchen-checklist-last-saved')
      if (isNewDay(lastSavedDate)) {
        // It's a new day, we should reset before proceeding
        console.log('New day detected during task completion, resetting checklist')

        // Update localStorage with today's date
        localStorage.setItem('kitchen-checklist-last-saved', today)

        // Throw an error to trigger the onError handler
        throw new Error('CHECKLIST_RESET_NEEDED')
      }

      // Find the task in the current list
      const task = tasks.find((t: Task) => t.id === taskId)

      if (!task) {
        throw new Error('Task not found')
      }

      // If the task is already completed, uncomplete it
      if (task.isCompleted) {
        console.log('Uncompleting kitchen task:', taskId)

        // Create a simple payload with just the one item being toggled
        const payload = {
          items: tasks.map((item: Task) => ({
            id: item.id,
            isCompleted: item.id === taskId ? false : item.isCompleted
          })),
          forcePartialSave: true
        }

        try {
          const response = await axios.post(`/api/kitchen/checklists/shift/${activeTab}/complete`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })

          return { ...response.data, uncompleted: true }
        } catch (error) {
          console.error('Error uncompleting kitchen task:', error)
          throw error
        }
      }

      // If the task is not completed, complete it
      console.log('Completing kitchen task:', taskId)

      // Create a simple payload with just the one item being toggled
      const payload = {
        items: tasks.map((item: Task) => ({
          id: item.id,
          isCompleted: item.id === taskId ? true : item.isCompleted
        })),
        forcePartialSave: true
      }

      try {
        const response = await axios.post(`/api/kitchen/checklists/shift/${activeTab}/complete`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        return response.data
      } catch (error) {
        console.error('Error completing kitchen task:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Show success toast
      if (data?.uncompleted) {
        toast({
          title: 'Task uncompleted',
          description: 'The task has been marked as not completed.'
        })
      } else {
        toast({
          title: 'Task completed',
          description: 'The task has been marked as completed.'
        })
      }

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['kitchen-tasks', activeTab, today]
      })
    },
    onError: (error) => {
      // Check if this is our special reset error
      if (error instanceof Error && error.message === 'CHECKLIST_RESET_NEEDED') {
        // Show a toast notification about the reset
        toast({
          title: 'Checklist Reset',
          description: 'The checklist has been reset for a new day.',
        })

        // Force a refresh of the data
        queryClient.invalidateQueries({ queryKey: ['kitchen-tasks'] })
        return
      }

      // Handle other errors
      toast({
        title: 'Error',
        description: 'Failed to update the task status. Please try again.',
        variant: 'destructive'
      })
      console.error('Error updating task status:', error)
    }
  })

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    completeTaskMutation.mutate(taskId)
  }

  // Handle edit checklist
  const handleEditChecklist = () => {
    console.log('Opening edit dialog')
    setIsEditDialogOpen(true)
  }

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task: Task) => task.isCompleted).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Check if all required tasks are completed
  const hasIncompleteRequired = tasks.some((task: Task) => task.isRequired && !task.isCompleted)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Section - Mobile optimized */}
      <Card className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
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
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/kitchen/checklists/history')}
              className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/5 w-full sm:w-auto h-9 rounded-lg transition-all duration-200 touch-manipulation active-scale"
            >
              <History className="h-4 w-4" />
              <span>History</span>
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
              className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/5 w-full sm:w-auto h-9 rounded-lg transition-all duration-200 touch-manipulation active-scale"
            >
              <Pencil className="h-4 w-4" />
              <span>Customize List</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Required Tasks Warning - Mobile optimized */}
      {hasIncompleteRequired && (
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50/80 text-amber-700 rounded-xl border border-amber-200/70">
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

      {/* Task Tabs - Mobile optimized */}
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShiftType)}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="opening"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm touch-manipulation active-scale"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Sun className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Opening</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transition"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm touch-manipulation active-scale"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Transition</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm touch-manipulation active-scale"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Moon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Closing</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-3 sm:mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-10">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-[#E51636]" />
                    <span className="text-sm font-medium text-[#27251F]/70">Loading checklist...</span>
                  </div>
                </div>
              ) : (
                <KitchenTaskList
                  tasks={tasks}
                  onComplete={handleTaskComplete}
                  isLoading={isLoading}
                />
              )}
            </div>
          </Tabs>
        </div>
      </Card>

      {/* Edit Dialog */}
      <EditChecklistDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          console.log('Setting edit dialog open state to:', open)
          setIsEditDialogOpen(open)
        }}
        type={activeTab}
        items={tasks || []}
        onSave={() => {
          console.log('Dialog save callback triggered')
          queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
          queryClient.invalidateQueries({ queryKey: ['kitchen-tasks', activeTab, today] })
        }}
      />
    </div>
  )
}
