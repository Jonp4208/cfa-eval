import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { History, Plus, ClipboardList, Sparkles, Award, Star, Users, TrendingUp, Clock, Sun, Moon, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { TaskList } from './TaskList'
import { CreateTaskDialog } from './CreateTaskDialog'
import { useToast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import axios from 'axios'
import api from '@/lib/axios'
import { getTodayDateString, isNewDay } from '@/lib/utils/date-utils'
import PageHeader, { headerButtonClass } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

type ShiftType = 'opening' | 'transition' | 'closing'

interface Task {
  _id: string
  name: string
  shiftType: ShiftType
  isActive: boolean
  completed?: boolean
  completedBy?: string
  completedAt?: string
}

export default function FOHPage() {
  const [activeTab, setActiveTab] = useState<ShiftType>('opening')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Get today's date in YYYY-MM-DD format using our utility function
  const today = getTodayDateString()

  // Check if the checklist should be reset (new day)
  useEffect(() => {
    const checkForReset = () => {
      try {
        // Get the last saved date from localStorage
        const lastSavedDate = localStorage.getItem('foh-checklist-last-saved')

        // If it's a new day (past midnight), we should reset the checklist
        if (isNewDay(lastSavedDate)) {
          // Update localStorage with today's date BEFORE invalidating queries
          localStorage.setItem('foh-checklist-last-saved', today)

          // Force a refresh of the data
          queryClient.invalidateQueries({ queryKey: ['foh-tasks'] })

          // Show a toast notification
          toast({
            title: 'Checklist Reset',
            description: 'The FOH checklist has been reset for a new day.',
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
    // Initial load happens via the useQuery below

    // Set up polling every 60 seconds for real-time updates
    // Using a longer interval to reduce token expiration issues
    const interval = setInterval(() => {
      // Check if we have a valid token before making the request
      const token = localStorage.getItem('token')
      if (token) {
        queryClient.invalidateQueries({ queryKey: ['foh-tasks'] })
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['foh-tasks', today],
    queryFn: async () => {
      try {
        // Get the last saved date from localStorage
        const lastSavedDate = localStorage.getItem('foh-checklist-last-saved')

        // If it's a new day or we don't have a saved date, update it
        if (isNewDay(lastSavedDate)) {
          localStorage.setItem('foh-checklist-last-saved', today)
        }

        // Use the configured API instance
        const response = await api.get('/api/foh/tasks', {
          params: { date: today }
        })
        return response.data as Task[]
      } catch (error) {
        throw error
      }
    },
    refetchOnWindowFocus: true
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      try {
        // Use the configured API instance
        const response = await api.delete(`/api/foh/tasks/${taskId}`)
        return response.data
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate the tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['foh-tasks', today] })
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete the task. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // First, check if we need to reset the checklist (new day)
      const lastSavedDate = localStorage.getItem('foh-checklist-last-saved')
      if (isNewDay(lastSavedDate)) {
        // It's a new day, we should reset before proceeding
        // Update localStorage with today's date BEFORE proceeding
        localStorage.setItem('foh-checklist-last-saved', today)

        // Throw an error to trigger the onError handler
        throw new Error('CHECKLIST_RESET_NEEDED')
      }

      // Find the task in the current list
      const task = tasks.find(t => t._id === taskId)

      // If task is already completed, we're uncompleting it
      if (task?.completed) {
        try {
          // Call the uncomplete endpoint using the configured API instance
          const response = await api.post(`/api/foh/tasks/${taskId}/uncomplete`, {
            date: today // Send the current date in New York timezone
          })

          return { ...response.data, uncompleted: true, taskId }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to uncomplete the task. Please try again.',
            variant: 'destructive'
          })
          throw error
        }
      }

      try {
        // Use the configured API instance
        const response = await api.post(`/api/foh/tasks/${taskId}/complete`, {
          date: today // Send the current date in New York timezone
        })
        return { ...response.data, taskId }
      } catch (error) {
        throw error
      }
    },
    onMutate: async (taskId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['foh-tasks', today] })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['foh-tasks', today])

      // Optimistically update to the new value
      queryClient.setQueryData(['foh-tasks', today], (old: any) => {
        if (!old) return old

        return old.map((task: any) =>
          task._id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      })

      // Return a context object with the snapshotted value
      return { previousTasks }
    },
    onSuccess: (data) => {
      // Show different toast messages based on whether the task was completed or uncompleted
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
    },
    onError: (error, taskId, context) => {
      // If we have a context, rollback the optimistic update
      if (context?.previousTasks) {
        queryClient.setQueryData(['foh-tasks', today], context.previousTasks)
      }

      // Check if this is our special reset error
      if (error instanceof Error && error.message === 'CHECKLIST_RESET_NEEDED') {
        // Show a toast notification about the reset
        toast({
          title: 'Checklist Reset',
          description: 'The FOH checklist has been reset for a new day. Please try again.',
        })

        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['foh-tasks'] })
        return
      }

      // Regular error handling
      toast({
        title: 'Error',
        description: 'Failed to update the task status. Please try again.',
        variant: 'destructive'
      })
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['foh-tasks', today] })
    }
  })

  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(task => task.shiftType === activeTab && task.isActive)
    : []

  // Calculate statistics
  const totalTasks = Array.isArray(tasks) ? tasks.filter(task => task.isActive).length : 0
  const completedTasks = Array.isArray(tasks) ? tasks.filter(task => task.isActive && task.completed).length : 0
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Count tasks by shift type
  const openingTasks = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'opening' && task.isActive).length : 0
  const openingCompleted = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'opening' && task.isActive && task.completed).length : 0

  const transitionTasks = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'transition' && task.isActive).length : 0
  const transitionCompleted = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'transition' && task.isActive && task.completed).length : 0

  const closingTasks = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'closing' && task.isActive).length : 0
  const closingCompleted = Array.isArray(tasks) ? tasks.filter(task => task.shiftType === 'closing' && task.isActive && task.completed).length : 0

  // Get current time for dynamic greetings
  const currentHour = new Date().getHours()
  const getShiftGreeting = () => {
    if (completionPercentage === 100) {
      return activeTab === 'opening' ? 'Opening Complete! 🎉' :
             activeTab === 'transition' ? 'Transition Complete! 🎉' :
             'Closing Complete! 🎉'
    }
    if (activeTab === 'opening') return currentHour < 12 ? 'Good Morning, Team!' : 'Ready to Serve!'
    if (activeTab === 'transition') return 'Smooth Transitions!'
    return currentHour >= 18 ? 'Good Evening!' : 'Closing Strong!'
  }

  const getShiftEmoji = () => {
    if (completionPercentage === 100) return '🏆'
    if (activeTab === 'opening') return '🌅'
    if (activeTab === 'transition') return '🔄'
    return '🌙'
  }

  const getMotivationalMessage = () => {
    if (completionPercentage === 100) return "Exceptional service! Your dedication to excellence shows in every detail."
    if (completionPercentage >= 80) return "Outstanding progress! You're creating amazing guest experiences."
    if (completionPercentage >= 50) return "Great momentum! Keep delivering that signature hospitality."
    if (completionPercentage >= 25) return "Strong start! Every task brings us closer to excellence."
    return "Ready to create memorable experiences? Let's make today amazing!"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="FOH Tasks"
          subtitle="Front of House Daily Checklist"
          icon={<ClipboardList className="h-5 w-5" />}
          actions={
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={() => navigate('/foh/history')}
                className={headerButtonClass}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className={headerButtonClass}
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Button>
            </div>
          }
        />

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
                <Users className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className={cn(
                "text-3xl sm:text-4xl font-bold bg-clip-text text-transparent transition-all duration-500",
                completionPercentage === 100
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : "bg-gradient-to-r from-[#E51636] to-[#B91C3C]"
              )}>
                FOH Excellence
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
                      {completionPercentage === 100 ? 'Service Excellence!' : 'Keep Serving!'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {completedTasks} of {totalTasks} tasks completed
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className={cn(
                        "rounded-2xl p-3 text-center transition-all duration-500",
                        completionPercentage === 100
                          ? "bg-emerald-100/60 border border-emerald-200"
                          : "bg-white/60"
                      )}>
                        <div className={cn(
                          "text-lg font-bold transition-colors duration-500",
                          completionPercentage === 100 ? "text-emerald-600" : "text-blue-600"
                        )}>
                          {openingCompleted}/{openingTasks}
                        </div>
                        <div className="text-xs text-gray-600">Opening</div>
                      </div>
                      <div className={cn(
                        "rounded-2xl p-3 text-center transition-all duration-500",
                        completionPercentage === 100
                          ? "bg-emerald-100/60 border border-emerald-200"
                          : "bg-white/60"
                      )}>
                        <div className={cn(
                          "text-lg font-bold transition-colors duration-500",
                          completionPercentage === 100 ? "text-emerald-600" : "text-yellow-600"
                        )}>
                          {transitionCompleted}/{transitionTasks}
                        </div>
                        <div className="text-xs text-gray-600">Transition</div>
                      </div>
                      <div className={cn(
                        "rounded-2xl p-3 text-center transition-all duration-500",
                        completionPercentage === 100
                          ? "bg-emerald-100/60 border border-emerald-200"
                          : "bg-white/60"
                      )}>
                        <div className={cn(
                          "text-lg font-bold transition-colors duration-500",
                          completionPercentage === 100 ? "text-emerald-600" : "text-purple-600"
                        )}>
                          {closingCompleted}/{closingTasks}
                        </div>
                        <div className="text-xs text-gray-600">Closing</div>
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
                  Track your team's service excellence over time
                </p>
                <Button
                  onClick={() => navigate('/foh/history')}
                  className="w-full bg-white/20 hover:bg-white/30 border-0 rounded-xl transition-all duration-200"
                >
                  Open History
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl shadow-xl border-0 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Plus className="h-6 w-6" />
                  <h3 className="font-semibold">Add Task</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Create new tasks to enhance service
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full bg-white/20 hover:bg-white/30 border-0 rounded-xl transition-all duration-200"
                >
                  Create Task
                </Button>
              </div>
            </Card>
          </div>
        </div>

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
                    <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {openingCompleted}/{openingTasks}
                    </span>
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
                    <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {transitionCompleted}/{transitionTasks}
                    </span>
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
                    <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {closingCompleted}/{closingTasks}
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>
              <div className="mt-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#E51636] to-[#B91C3C] animate-pulse"></div>
                        <TrendingUp className="h-8 w-8 text-white animate-bounce absolute inset-0 m-auto" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading your tasks</h3>
                        <p className="text-gray-600">Preparing your {activeTab} checklist...</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="opening">
                      <TaskList
                        tasks={filteredTasks}
                        onComplete={completeTaskMutation.mutate}
                        onDelete={deleteTaskMutation.mutate}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    <TabsContent value="transition">
                      <TaskList
                        tasks={filteredTasks}
                        onComplete={completeTaskMutation.mutate}
                        onDelete={deleteTaskMutation.mutate}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    <TabsContent value="closing">
                      <TaskList
                        tasks={filteredTasks}
                        onComplete={completeTaskMutation.mutate}
                        onDelete={deleteTaskMutation.mutate}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </Card>

        <CreateTaskDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          shiftType={activeTab}
        />
      </div>
    </div>
  );
}