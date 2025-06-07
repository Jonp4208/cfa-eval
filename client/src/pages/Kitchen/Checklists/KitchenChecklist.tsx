import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Loader2, Sun, Moon, ArrowLeftRight, Pencil, History, Clock, Users, TrendingUp, Sparkles, Star, Award } from 'lucide-react'
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
        // Silent error handling for reset check
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
        queryClient.invalidateQueries({ queryKey: ['kitchen-tasks', today] })
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient, today])

  // Fetch tasks for the active tab
  const { data: tasks = [] as Task[], isLoading } = useQuery<Task[]>({
    queryKey: ['kitchen-tasks', activeTab, today],
    queryFn: async () => {
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
          throw error
        }
      }

      // If the task is not completed, complete it

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
    }
  })

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    completeTaskMutation.mutate(taskId)
  }

  // Handle edit checklist
  const handleEditChecklist = () => {
    setIsEditDialogOpen(true)
  }

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task: Task) => task.isCompleted).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const requiredTasks = tasks.filter((task: Task) => task.isRequired).length
  const completedRequiredTasks = tasks.filter((task: Task) => task.isRequired && task.isCompleted).length

  // Check if all required tasks are completed
  const hasIncompleteRequired = tasks.some((task: Task) => task.isRequired && !task.isCompleted)

  // Get current time for dynamic greetings
  const currentHour = new Date().getHours()
  const getShiftGreeting = () => {
    if (completionPercentage === 100) {
      return activeTab === 'opening' ? 'Opening Complete! 🎉' :
             activeTab === 'transition' ? 'Transition Complete! 🎉' :
             'Closing Complete! 🎉'
    }
    if (activeTab === 'opening') return currentHour < 12 ? 'Good Morning!' : 'Ready to Open!'
    if (activeTab === 'transition') return 'Transition Time!'
    return currentHour >= 18 ? 'Good Evening!' : 'Closing Time!'
  }

  const getShiftEmoji = () => {
    if (completionPercentage === 100) return '🏆'
    if (activeTab === 'opening') return '🌅'
    if (activeTab === 'transition') return '🔄'
    return '🌙'
  }

  const getMotivationalMessage = () => {
    if (completionPercentage === 100) return "Outstanding work! Your attention to detail makes all the difference."
    if (completionPercentage >= 80) return "Almost there! You're doing great."
    if (completionPercentage >= 50) return "Great progress! Keep up the momentum."
    if (completionPercentage >= 25) return "You're off to a good start!"
    return "Ready to tackle today's tasks? Let's make it happen!"
  }

  // Circular progress component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-out",
              percentage === 100 ? "text-emerald-500" : "text-[#E51636]"
            )}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold transition-colors duration-500",
              percentage === 100 ? "text-emerald-600" : "text-[#E51636]"
            )}>
              {percentage}%
            </div>
            {percentage === 100 && (
              <div className="flex justify-center mt-1">
                <Award className="h-4 w-4 text-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 max-w-none mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
              completionPercentage === 100
                ? "bg-gradient-to-br from-emerald-400 to-green-500 animate-float"
                : "bg-gradient-to-br from-[#E51636] to-[#B91C3C]"
            )}>
              {completionPercentage === 100 ? (
                <Award className="h-6 w-6 text-white" />
              ) : (
                <Sparkles className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className={cn(
                "text-3xl sm:text-4xl font-bold bg-clip-text text-transparent transition-all duration-500",
                completionPercentage === 100
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : "bg-gradient-to-r from-[#E51636] to-[#B91C3C]"
              )}>
                Kitchen Operations
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                {getShiftEmoji()} {getShiftGreeting()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Progress Card */}
          <div className="lg:col-span-2">
            <Card className={cn(
              "bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-0 overflow-hidden relative transition-all duration-500",
              completionPercentage === 100 && "animate-glow"
            )}>
              {/* Celebration overlay */}
              {completionPercentage === 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 animate-pulse" />
              )}

              <div className={cn(
                "p-6 sm:p-8 transition-all duration-500",
                completionPercentage === 100
                  ? "bg-gradient-to-r from-emerald-50/50 to-green-50/50"
                  : "bg-gradient-to-r from-[#E51636]/5 to-[#B91C3C]/5"
              )}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <CircularProgress percentage={completionPercentage} />
                    {completionPercentage === 100 && (
                      <div className="absolute -top-2 -right-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className={cn(
                      "text-2xl font-bold mb-2 transition-colors duration-500",
                      completionPercentage === 100 ? "text-emerald-700" : "text-gray-900"
                    )}>
                      {completionPercentage === 100 ? 'Outstanding Work!' : 'Keep Going!'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {completedTasks} of {totalTasks} tasks completed
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn(
                        "rounded-2xl p-4 text-center transition-all duration-500",
                        completionPercentage === 100
                          ? "bg-emerald-100/60 border border-emerald-200"
                          : "bg-white/60"
                      )}>
                        <div className={cn(
                          "text-2xl font-bold transition-colors duration-500",
                          completionPercentage === 100 ? "text-emerald-600" : "text-[#E51636]"
                        )}>
                          {completedRequiredTasks}
                        </div>
                        <div className="text-sm text-gray-600">Required Done</div>
                      </div>
                      <div className={cn(
                        "rounded-2xl p-4 text-center transition-all duration-500",
                        completionPercentage === 100
                          ? "bg-emerald-100/60 border border-emerald-200"
                          : "bg-white/60"
                      )}>
                        <div className={cn(
                          "text-2xl font-bold transition-colors duration-500",
                          completionPercentage === 100 ? "text-emerald-600" : "text-blue-600"
                        )}>
                          {totalTasks - completedTasks}
                        </div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl shadow-xl border-0 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <History className="h-6 w-6" />
                  <h3 className="font-semibold">View History</h3>
                </div>
                <p className="text-blue-100 text-sm mb-4">
                  Track your team's performance over time
                </p>
                <Button
                  onClick={() => navigate('/kitchen/checklists/history')}
                  className="w-full bg-white/20 hover:bg-white/30 border-0 rounded-xl transition-all duration-200"
                >
                  Open History
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl shadow-xl border-0 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pencil className="h-6 w-6" />
                  <h3 className="font-semibold">Customize</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Tailor your checklist to your needs
                </p>
                <Button
                  onClick={handleEditChecklist}
                  className="w-full bg-white/20 hover:bg-white/30 border-0 rounded-xl transition-all duration-200"
                >
                  Edit List
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Required Tasks Warning */}
        {hasIncompleteRequired && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0 rounded-3xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Required Tasks Pending
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {requiredTasks - completedRequiredTasks} required tasks need your attention before this shift is complete.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${(completedRequiredTasks / requiredTasks) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-amber-800">
                      {completedRequiredTasks}/{requiredTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Shift Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShiftType)}>
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-50 p-2 rounded-2xl shadow-inner">
                <TabsTrigger
                  value="opening"
                  className={cn(
                    "rounded-xl transition-all duration-300 font-medium",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500",
                    "data-[state=active]:text-white data-[state=active]:shadow-lg",
                    "hover:bg-white/50"
                  )}
                >
                  <div className="flex items-center gap-2 py-2">
                    <Sun className="h-5 w-5" />
                    <span className="hidden sm:inline">Opening</span>
                    <span className="sm:hidden">Open</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="transition"
                  className={cn(
                    "rounded-xl transition-all duration-300 font-medium",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500",
                    "data-[state=active]:text-white data-[state=active]:shadow-lg",
                    "hover:bg-white/50"
                  )}
                >
                  <div className="flex items-center gap-2 py-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    <span className="hidden sm:inline">Transition</span>
                    <span className="sm:hidden">Trans</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="closing"
                  className={cn(
                    "rounded-xl transition-all duration-300 font-medium",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-purple-500",
                    "data-[state=active]:text-white data-[state=active]:shadow-lg",
                    "hover:bg-white/50"
                  )}
                >
                  <div className="flex items-center gap-2 py-2">
                    <Moon className="h-5 w-5" />
                    <span className="hidden sm:inline">Closing</span>
                    <span className="sm:hidden">Close</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#E51636] to-[#B91C3C] animate-pulse"></div>
                        <Loader2 className="h-8 w-8 text-white animate-spin absolute inset-0 m-auto" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading your checklist</h3>
                        <p className="text-gray-600">Preparing your {activeTab} tasks...</p>
                      </div>
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
          onOpenChange={setIsEditDialogOpen}
          type={activeTab}
          items={tasks || []}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['kitchen-checklist'] })
            queryClient.invalidateQueries({ queryKey: ['kitchen-tasks', activeTab, today] })
          }}
        />
      </div>
    </div>
  )
}
