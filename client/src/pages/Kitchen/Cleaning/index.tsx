import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Plus,
  Edit,
  History,
  Droplets,
  Utensils,
  FlameKindling,
  Refrigerator,
  Footprints,
  CheckCircle
} from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
import { useSnackbar } from 'notistack'
import TaskDialog from './components/TaskDialog'
import TaskHistory from './components/TaskHistory'
import CompleteTaskDialog from './components/CompleteTaskDialog'
import { CleaningTask, CleaningTaskCompletion } from '@/types/task'

// Define cleaning task frequencies
type TaskFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly'

// Area icons mapping
const AREA_ICONS: Record<string, React.ReactNode> = {
  kitchen_equipment: <FlameKindling className="h-5 w-5" />,
  food_prep: <Utensils className="h-5 w-5" />,
  storage: <Refrigerator className="h-5 w-5" />,
  floors: <Footprints className="h-5 w-5" />
}

export default function CleaningSchedule() {
  const { enqueueSnackbar } = useSnackbar()
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedFrequency, setSelectedFrequency] = useState<TaskFrequency>('daily')
  const [view, setView] = useState<'active' | 'upcoming' | 'completed'>('active')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null)
  const [taskHistory, setTaskHistory] = useState<CleaningTaskCompletion[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await kitchenService.getAllCleaningTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading cleaning tasks:', error)
      enqueueSnackbar('Failed to load cleaning tasks', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (data: any) => {
    try {
      const newTask = await kitchenService.createCleaningTask(data)
      setTasks(prev => [...prev, newTask])
      enqueueSnackbar('Task added successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error adding task:', error)
      enqueueSnackbar('Failed to add task', { variant: 'error' })
    }
  }

  const handleEditTask = async (data: any) => {
    try {
      if (!selectedTask) return
      const updatedTask = await kitchenService.updateCleaningTask(selectedTask.id, data)
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ))
      enqueueSnackbar('Task updated successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error updating task:', error)
      enqueueSnackbar('Failed to update task', { variant: 'error' })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        enqueueSnackbar('Invalid task ID', { variant: 'error' })
        return
      }

      // Ask for confirmation before deleting
      if (!window.confirm('Are you sure you want to delete this task?')) {
        return
      }

      await kitchenService.deleteCleaningTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      enqueueSnackbar('Task deleted successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error deleting task:', error)
      enqueueSnackbar('Failed to delete task', { variant: 'error' })
    }
  }

  const handleViewHistory = async (task: CleaningTask) => {
    try {
      setSelectedTask(task)
      const history = await kitchenService.getCleaningTaskCompletions(task.id)
      setTaskHistory(history)
      setHistoryDialogOpen(true)
    } catch (error) {
      console.error('Error loading task history:', error)
      enqueueSnackbar('Failed to load task history', { variant: 'error' })
    }
  }

  const handleCompleteTask = async (data: any) => {
    try {
      if (!selectedTask?._id && !selectedTask?.id) {
        console.error('No task ID available:', selectedTask)
        enqueueSnackbar('No task selected', { variant: 'error' })
        setCompleteDialogOpen(false)
        return
      }

      const taskId = selectedTask._id || selectedTask.id
      console.log('Starting task completion:', {
        taskId,
        taskName: selectedTask.name,
        formData: data
      })
      
      const completion = await kitchenService.completeCleaningTask(taskId, {
        notes: data.notes,
        status: 'completed',
        suppliesVerified: data.suppliesVerified,
        stepsVerified: data.stepsVerified
      })

      console.log('Task completion response:', completion)

      // Update the task's lastCompleted and nextDue dates
      const updatedTask = {
        ...selectedTask,
        lastCompleted: completion.completedAt,
        nextDue: calculateNextDue(completion.completedAt, selectedTask.frequency)
      }

      console.log('Updating task with new dates:', {
        lastCompleted: completion.completedAt,
        nextDue: updatedTask.nextDue
      })

      setTasks(prev => prev.map(task => 
        (task._id === selectedTask._id || task.id === selectedTask.id) ? updatedTask : task
      ))

      // Add to task history
      setTaskHistory(prev => [completion, ...prev])

      enqueueSnackbar('Task marked as complete', { variant: 'success' })
      setCompleteDialogOpen(false)
    } catch (error: any) {
      console.error('Error completing task:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
      enqueueSnackbar('Failed to complete task', { variant: 'error' })
    }
  }

  const calculateNextDue = (completedAt: string, frequency: string): string => {
    const nextDue = new Date(completedAt)
    
    switch (frequency) {
      case 'hourly':
        nextDue.setHours(nextDue.getHours() + 1)
        break
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1)
        break
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7)
        break
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1)
        break
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3)
        break
    }

    return nextDue.toISOString()
  }

  const getCompletionRate = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.lastCompleted).length
    return totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const getOverdueTasks = () => {
    return tasks.filter(task => {
      if (!task.nextDue) return false
      return new Date(task.nextDue) < new Date()
    }).length
  }

  const getCriticalTasks = () => {
    return tasks.filter(task => task.isCritical).length
  }

  return (
    <div className="space-y-4 px-4 md:px-6 pb-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div key="completion-rate-card">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium text-sm md:text-base">Completion Rate</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getCompletionRate()}%</h3>
                  <p className="text-[#27251F]/60 mt-1 text-sm">Today's Progress</p>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 strokeWidth={2} size={24} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div key="overdue-tasks-card">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium text-sm md:text-base">Overdue Tasks</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getOverdueTasks()}</h3>
                  <p className="text-[#27251F]/60 mt-1 text-sm">Require Attention</p>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle strokeWidth={2} size={24} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div key="critical-tasks-card">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 sm:col-span-2 md:col-span-1">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium text-sm md:text-base">Critical Tasks</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getCriticalTasks()}</h3>
                  <p className="text-[#27251F]/60 mt-1 text-sm">High Priority</p>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <Clock strokeWidth={2} size={24} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Task Management Section */}
      <div className="grid grid-cols-1 gap-4">
        <div key="task-management-card">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-4 md:p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#27251F]">Cleaning Tasks</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#E51636] border-[#E51636] hover:bg-[#E51636] hover:text-white"
                    onClick={() => {
                      setSelectedTask(null)
                      setTaskDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>

                {/* Area Filter */}
                <ScrollArea className="w-full">
                  <div className="flex space-x-2 pb-4">
                    <Button
                      key="all-areas"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedArea('all')}
                      className={`relative font-medium ${
                        selectedArea === 'all' 
                          ? 'text-[#E51636]' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      All Areas
                      {selectedArea === 'all' && (
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#E51636] rounded-full" />
                      )}
                    </Button>
                    {Object.entries(AREA_ICONS).map(([area, icon]) => (
                      <Button
                        key={`area-filter-${area}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArea(area)}
                        className={`relative font-medium whitespace-nowrap ${
                          selectedArea === area 
                            ? 'text-[#E51636]' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center">
                          {icon}
                          <span className="ml-2 capitalize">{area.replace('_', ' ')}</span>
                        </div>
                        {selectedArea === area && (
                          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#E51636] rounded-full" />
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Frequency Filter */}
                <ScrollArea className="w-full">
                  <div className="flex space-x-2 pb-4">
                    {['daily', 'weekly', 'monthly', 'quarterly'].map((freq) => (
                      <Button
                        key={`freq-filter-${freq}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFrequency(freq as TaskFrequency)}
                        className={`relative font-medium whitespace-nowrap ${
                          selectedFrequency === freq 
                            ? 'text-[#E51636]' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <span className="capitalize">{freq}</span>
                        {selectedFrequency === freq && (
                          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#E51636] rounded-full" />
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Task List */}
                <ScrollArea className="h-[600px] w-full">
                  <div className="space-y-2">
                    {tasks
                      .filter(task => {
                        console.log('Filtering task:', task)
                        const isCorrectArea = selectedArea === 'all' || task.area === selectedArea
                        const isCorrectFrequency = task.frequency === selectedFrequency || 
                          (selectedFrequency === 'daily' && task.frequency === 'hourly')
                        return isCorrectArea && isCorrectFrequency
                      })
                      .map(task => {
                        console.log('Mapping task:', { id: task.id, name: task.name })
                        if (!task?.id) {
                          console.warn('Task missing ID:', task)
                          return null
                        }

                        const isCompletedToday = task.lastCompleted && 
                          new Date(task.lastCompleted) > new Date(Date.now() - 24 * 60 * 60 * 1000)

                        return (
                          <Card 
                            key={`task-${task.id}`} 
                            className={`p-4 hover:shadow-md transition-all ${
                              isCompletedToday ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{task.name}</h3>
                                  {task.isCritical && (
                                    <Badge key={`${task.id}-critical`} variant="destructive" className="text-xs">Critical</Badge>
                                  )}
                                  {isCompletedToday && (
                                    <Badge key={`${task.id}-completed`} variant="secondary" className="text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed Today
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{task.description}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>{task.estimatedDuration} mins</span>
                                  <span>•</span>
                                  <span className="capitalize">{task.frequency}</span>
                                  {task.nextDue && (
                                    <>
                                      <span>•</span>
                                      <span>Next due: {new Date(task.nextDue).toLocaleDateString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  key={`${task.id}-complete`}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => {
                                    if (!task?.id) {
                                      enqueueSnackbar('Invalid task selected', { variant: 'error' })
                                      return
                                    }
                                    setSelectedTask(task)
                                    setCompleteDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                                <Button 
                                  key={`${task.id}-edit`}
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTask(task)
                                    setTaskDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  key={`${task.id}-history`}
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewHistory(task)}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button 
                                  key={`${task.id}-delete`}
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => {
                                    if (!task?.id) {
                                      enqueueSnackbar('Invalid task selected', { variant: 'error' })
                                      return
                                    }
                                    handleDeleteTask(task.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={selectedTask ? handleEditTask : handleAddTask}
        task={selectedTask || undefined}
      />

      {/* History Dialog */}
      {selectedTask && (
        <TaskHistory
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          taskName={selectedTask.name}
          completions={taskHistory}
        />
      )}

      {/* Complete Task Dialog */}
      {selectedTask && (
        <CompleteTaskDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          onSubmit={handleCompleteTask}
          task={selectedTask}
        />
      )}
    </div>
  )
} 