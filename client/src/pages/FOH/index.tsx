import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { History, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { TaskList } from './TaskList'
import { CreateTaskDialog } from './CreateTaskDialog'
import { useToast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import axios from 'axios'
import api from '@/lib/axios'
import { getTodayDateString, isNewDay } from '@/lib/utils/date-utils'

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
          console.log('New day detected, resetting FOH checklist')

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
        console.error('Error checking for FOH checklist reset:', error)
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
        console.log('Polling for FOH tasks updates')
        queryClient.invalidateQueries({ queryKey: ['foh-tasks'] })
      } else {
        console.log('Skipping FOH tasks poll - no valid token')
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [queryClient])

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['foh-tasks', today],
    queryFn: async () => {
      console.log('Fetching FOH tasks for date:', today)
      try {
        // Get the last saved date from localStorage
        const lastSavedDate = localStorage.getItem('foh-checklist-last-saved')

        // If it's a new day or we don't have a saved date, update it
        if (isNewDay(lastSavedDate)) {
          console.log('New day detected during fetch, updating last saved date')
          localStorage.setItem('foh-checklist-last-saved', today)
        }

        // Use the configured API instance
        const response = await api.get('/api/foh/tasks', {
          params: { date: today }
        })
        console.log('FOH tasks response:', response)
        return response.data as Task[]
      } catch (error) {
        console.error('Error fetching FOH tasks:', error)
        throw error
      }
    },
    refetchOnWindowFocus: true
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('Deleting FOH task:', taskId)
      try {
        // Use the configured API instance
        const response = await api.delete(`/api/foh/tasks/${taskId}`)
        console.log('Task deletion response:', response)
        return response.data
      } catch (error) {
        console.error('Error deleting FOH task:', error)
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
      console.error('Error deleting task:', error)
    }
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // First, check if we need to reset the checklist (new day)
      const lastSavedDate = localStorage.getItem('foh-checklist-last-saved')
      if (isNewDay(lastSavedDate)) {
        // It's a new day, we should reset before proceeding
        console.log('New day detected during task completion, resetting checklist')

        // Update localStorage with today's date BEFORE proceeding
        localStorage.setItem('foh-checklist-last-saved', today)

        // Throw an error to trigger the onError handler
        throw new Error('CHECKLIST_RESET_NEEDED')
      }

      // Find the task in the current list
      const task = tasks.find(t => t._id === taskId)

      // If task is already completed, we're uncompleting it
      if (task?.completed) {
        console.log('Uncompleting FOH task:', taskId)

        try {
          // Call the uncomplete endpoint using the configured API instance
          const response = await api.post(`/api/foh/tasks/${taskId}/uncomplete`, {
            date: today // Send the current date in New York timezone
          })

          console.log('Task uncompletion response:', response)
          return { ...response.data, uncompleted: true }
        } catch (error) {
          console.error('Error uncompleting FOH task:', error)
          toast({
            title: 'Error',
            description: 'Failed to uncomplete the task. Please try again.',
            variant: 'destructive'
          })
          throw error
        }
      }

      console.log('Completing FOH task:', taskId)
      try {
        // Use the configured API instance
        const response = await api.post(`/api/foh/tasks/${taskId}/complete`, {
          date: today // Send the current date in New York timezone
        })
        console.log('Task completion response:', response)
        return response.data
      } catch (error) {
        console.error('Error completing FOH task:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate the tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['foh-tasks', today] })

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
    onError: (error) => {
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
      console.error('Error updating task status:', error)
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

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Enhanced header with gradient */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FOH Tasks</h1>
              <p className="text-white/90 text-sm md:text-base">Front of House Daily Checklist</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="bg-white/15 hover:bg-white/25 text-white"
                onClick={() => navigate('/foh/history')}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button
                className="bg-white text-[#E51636] hover:bg-white/90"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total Completion */}
          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm font-medium">Total Completion</p>
                  <h3 className="text-xl font-bold mt-1 text-[#27251F]">{completionPercentage}%</h3>
                  <p className="text-xs text-[#27251F]/60 mt-1">{completedTasks} of {totalTasks} tasks</p>
                </div>
                <div className="h-10 w-10 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-[#E51636]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#E51636] h-2 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Opening Tasks */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className={`bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all cursor-pointer ${activeTab === 'opening' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setActiveTab('opening')}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#27251F]/60 text-sm font-medium">Opening</p>
                        <h3 className="text-xl font-bold mt-1 text-[#27251F]">
                          {openingCompleted}/{openingTasks}
                        </h3>
                        <p className="text-xs text-[#27251F]/60 mt-1">
                          {openingTasks > 0 ? Math.round((openingCompleted / openingTasks) * 100) : 0}% complete
                        </p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === 'opening' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to view Opening tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Transition Tasks */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className={`bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all cursor-pointer ${activeTab === 'transition' ? 'ring-2 ring-yellow-500' : ''}`}
                  onClick={() => setActiveTab('transition')}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#27251F]/60 text-sm font-medium">Transition</p>
                        <h3 className="text-xl font-bold mt-1 text-[#27251F]">
                          {transitionCompleted}/{transitionTasks}
                        </h3>
                        <p className="text-xs text-[#27251F]/60 mt-1">
                          {transitionTasks > 0 ? Math.round((transitionCompleted / transitionTasks) * 100) : 0}% complete
                        </p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === 'transition' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to view Transition tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Closing Tasks */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className={`bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all cursor-pointer ${activeTab === 'closing' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setActiveTab('closing')}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#27251F]/60 text-sm font-medium">Closing</p>
                        <h3 className="text-xl font-bold mt-1 text-[#27251F]">
                          {closingCompleted}/{closingTasks}
                        </h3>
                        <p className="text-xs text-[#27251F]/60 mt-1">
                          {closingTasks > 0 ? Math.round((closingCompleted / closingTasks) * 100) : 0}% complete
                        </p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === 'closing' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to view Closing tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Task Tabs */}
        <Card className="bg-white rounded-[16px] shadow-sm overflow-hidden">
        <div className="p-3 md:p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShiftType)}>
            {/* Mobile optimized tabs - visible only on small screens */}
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-0.5 rounded-xl md:hidden">
              <TabsTrigger
                value="opening"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm px-1 py-1.5"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs">Opening</span>
                  </div>
                  <span className="text-xs bg-gray-200 px-1 py-0.5 rounded-full mt-1">{openingCompleted}/{openingTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transition"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm px-1 py-1.5"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs">Transition</span>
                  </div>
                  <span className="text-xs bg-gray-200 px-1 py-0.5 rounded-full mt-1">{transitionCompleted}/{transitionTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm px-1 py-1.5"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-1"></div>
                    <span className="text-xs">Closing</span>
                  </div>
                  <span className="text-xs bg-gray-200 px-1 py-0.5 rounded-full mt-1">{closingCompleted}/{closingTasks}</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Desktop tabs - hidden on mobile screens */}
            <TabsList className="hidden md:grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="opening"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Opening</span>
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{openingCompleted}/{openingTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transition"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Transition</span>
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{transitionCompleted}/{transitionTasks}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="closing"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#E51636] data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Closing</span>
                  <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{closingCompleted}/{closingTasks}</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
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