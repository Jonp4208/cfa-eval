import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, parseISO, startOfDay, endOfDay } from 'date-fns'
import { Card } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, CheckCircle, Clock, User, ChevronDown, ChevronUp, ListChecks, ClipboardCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { kitchenService } from '@/services/kitchenService'
import PageHeader, { headerButtonClass } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

interface Task {
  _id: string
  name: string
  shiftType: 'opening' | 'transition' | 'closing'
  createdAt: string
  updatedAt: string
}

interface TaskCompletion {
  id: string
  type: 'opening' | 'transition' | 'closing'
  items: {
    id: string
    label: string
    isRequired: boolean
    isCompleted: boolean
  }[]
  completedBy: {
    id: string
    name: string
  }
  notes?: string
  completedAt: string
}

interface CombinedTask {
  _id: string
  name: string
  shiftType: 'opening' | 'transition' | 'closing'
  isCompleted: boolean
  completedBy?: {
    _id: string
    name: string
  }
  completedAt?: string
  nyDateString: string
}

export default function KitchenChecklistHistory() {
  const navigate = useNavigate()
  // Use a very wide date range to capture all completions
  const [dateRange, setDateRange] = useState({
    from: new Date('2023-01-01'), // Use a very early date to capture all history
    to: new Date('2026-12-31')    // Use a future date to capture all completions
  })

  console.log('Date range:', {
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    currentYear: new Date().getFullYear()
  })

  // Default to 'all' tab, but allow filtering by shift type
  const [activeShift, setActiveShift] = useState('all')

  // Track expanded dates
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a date
  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  // Fetch all tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['kitchen-all-tasks'],
    queryFn: async () => {
      // Fetch all three types of tasks and combine them
      try {
        const [opening, transition, closing] = await Promise.all([
          kitchenService.getShiftChecklistItems('opening'),
          kitchenService.getShiftChecklistItems('transition'),
          kitchenService.getShiftChecklistItems('closing')
        ])

        const allTasks = [...opening, ...transition, ...closing]
        console.log('Fetched tasks:', {
          opening: opening.length,
          transition: transition.length,
          closing: closing.length,
          total: allTasks.length
        })

        if (allTasks.length > 0) {
          console.log('Sample task:', allTasks[0])
        }

        return allTasks
      } catch (error) {
        console.error('Error fetching tasks:', error)
        return []
      }
    }
  })

  // Fetch completions for the date range
  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<TaskCompletion[]>({
    queryKey: ['kitchen-completions', dateRange],
    queryFn: async () => {
      const params = {
        startDate: startOfDay(dateRange.from).toISOString(),
        endDate: endOfDay(dateRange.to).toISOString()
      }

      console.log('Fetching completions with date range:', params)

      try {
        // Get completions for all types
        const [opening, transition, closing] = await Promise.all([
          kitchenService.getShiftChecklistCompletions('opening', params),
          kitchenService.getShiftChecklistCompletions('transition', params),
          kitchenService.getShiftChecklistCompletions('closing', params)
        ])

        console.log('Completions fetched:', {
          opening: opening.length,
          transition: transition.length,
          closing: closing.length
        })

        const allCompletions = [...opening, ...transition, ...closing]
        console.log('Total completions:', allCompletions.length)

        return allCompletions
      } catch (error) {
        console.error('Error fetching completions:', error)
        return []
      }
    },
    enabled: !isLoadingTasks
  })

  // Process data to combine tasks and completions
  const combinedTasksData = useMemo(() => {
    if (isLoadingTasks || isLoadingCompletions) return {}

    console.log('Processing data - tasks:', tasks.length, 'completions:', completions.length)

    const result: Record<string, CombinedTask[]> = {}
    const taskMap = new Map<string, Task>()

    // Create a map of tasks by ID for quick lookup
    tasks.forEach(task => {
      if (!task._id) {
        console.log('Task missing _id:', task)
        return
      }
      taskMap.set(task._id, task)
    })

    console.log('Task map created with', taskMap.size, 'tasks')

    // Log the first few keys in the map
    const mapKeys = Array.from(taskMap.keys()).slice(0, 5)
    console.log('Sample task map keys:', mapKeys)

    if (mapKeys.length > 0) {
      console.log('Sample task from map:', taskMap.get(mapKeys[0]))
    }

    // Group completions by date
    // Log the structure of a sample completion's items
    if (completions.length > 0 && completions[0].items && completions[0].items.length > 0) {
      console.log('Sample completion item:', completions[0].items[0])
      console.log('Sample completion:', completions[0])
    }

    completions.forEach(completion => {
      // Validate the date before processing
      if (!completion.completedAt) {
        console.log('Skipping completion with no completedAt:', completion)
        return
      }

      try {
        const date = new Date(completion.completedAt)

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.log('Skipping completion with invalid date:', completion.completedAt)
          return
        }

        const dateString = format(date, 'yyyy-MM-dd')
        console.log('Processing completion for date:', dateString, 'type:', completion.type)

        // Skip Sundays (day 0) as Chick-fil-A is closed
        if (date.getDay() === 0) {
          console.log('Skipping Sunday completion')
          return
        }

        if (!result[dateString]) {
          result[dateString] = []
          console.log('Created new entry for date:', dateString)
        }

        // Add completed tasks
        completion.items.forEach(item => {
        // In the new format, item already has an id property
        const itemId = item.id
        console.log('Processing item with ID:', itemId, 'Label:', item.label)

        const task = taskMap.get(itemId)
        const shiftType = task ? task.shiftType : (completion.type || 'unknown');

        // Filter by shift type if not 'all'
        if (activeShift === 'all' || shiftType === activeShift) {
          if (task) {
            result[dateString].push({
              _id: itemId,
              name: task.name,
              shiftType: task.shiftType,
              isCompleted: item.isCompleted,
              completedBy: completion.completedBy,
              completedAt: completion.completedAt,
              nyDateString: dateString
            });
          } else {
            // If task not found in map, use the label from the item
            // This ensures we show completions even if the task definition has changed
            console.log('Task not found in map for item:', itemId);

            result[dateString].push({
              _id: itemId,
              name: item.label || 'Unknown Task',
              shiftType: completion.type || 'unknown',
              isCompleted: item.isCompleted,
              completedBy: completion.completedBy,
              completedAt: completion.completedAt,
              nyDateString: dateString
            });
          }
        }
      })
      } catch (error) {
        console.error('Error processing completion date:', error)
      }
    })

    // Sort dates in descending order
    console.log('Final result object:', result)
    console.log('Number of dates with data:', Object.keys(result).length)

    // Log a sample of the data for the first date if available
    const firstDate = Object.keys(result)[0]
    if (firstDate) {
      console.log('Sample data for date', firstDate, ':', result[firstDate].slice(0, 3))
    }

    return result
  }, [tasks, completions, activeShift])

  // Calculate stats for each date
  const dateStats = useMemo(() => {
    const stats: Record<string, { completed: number, uncompleted: number }> = {}

    Object.entries(combinedTasksData).forEach(([date, tasks]) => {
      stats[date] = {
        completed: tasks.filter(t => t.isCompleted).length,
        uncompleted: tasks.filter(t => !t.isCompleted).length
      }
    })

    return stats
  }, [combinedTasksData])

  // Get sorted dates
  const sortedDates = useMemo(() => {
    console.log('Combined tasks data keys:', Object.keys(combinedTasksData))

    const sorted = Object.keys(combinedTasksData).sort((a, b) => {
      try {
        const dateA = new Date(a)
        const dateB = new Date(b)

        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0
        }

        return dateB.getTime() - dateA.getTime()
      } catch (error) {
        console.error('Error sorting dates:', error)
        return 0
      }
    })

    console.log('Sorted dates:', sorted)
    return sorted
  }, [combinedTasksData])

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Date Range Picker */}
        <Card className="p-4 bg-white rounded-[16px] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium">Filter by date range</h2>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </Card>

        {/* Shift Type Filter */}
        <div className="mb-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full md:w-[400px] mb-4">
              <TabsTrigger value="all" onClick={() => setActiveShift('all')}>All</TabsTrigger>
              <TabsTrigger value="opening" onClick={() => setActiveShift('opening')}>Opening</TabsTrigger>
              <TabsTrigger value="transition" onClick={() => setActiveShift('transition')}>Transition</TabsTrigger>
              <TabsTrigger value="closing" onClick={() => setActiveShift('closing')}>Closing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoadingCompletions || isLoadingTasks ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-[20px]" />
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-1">No completions found</h3>
                  <p>Try selecting a different date range</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const stats = dateStats[date];
              const isExpanded = !!expandedDates[date];
              const tasks = combinedTasksData[date];

              return (
                <Collapsible
                  key={date}
                  open={isExpanded}
                  onOpenChange={() => toggleDateExpanded(date)}
                  className="rounded-xl shadow-sm overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col space-y-3">
                        {/* Header with date and expand/collapse icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#E51636]" />
                            <h3 className="text-lg font-semibold">
                              {(() => {
                                try {
                                  const dateObj = new Date(date)
                                  if (isNaN(dateObj.getTime())) {
                                    return date
                                  }
                                  return `${format(dateObj, 'EEEE')} - ${date}`
                                } catch (error) {
                                  return date
                                }
                              })()}
                            </h3>
                          </div>
                          <div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {/* Completion stats */}
                        <p className="text-sm text-muted-foreground">
                          {stats.completed} completed / {stats.uncompleted + stats.completed} total
                        </p>

                        {/* Progress bars */}
                        <div className="space-y-2">
                          {/* Overall completion */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Completed</span>
                              <span>{stats.completed}/{stats.completed + stats.uncompleted}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{ width: `${stats.completed / (stats.completed + stats.uncompleted) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Shift-specific stats - we'll calculate these from the tasks */}
                          {(() => {
                            // Count by shift type
                            const openingTasks = tasks.filter(t => t.shiftType === 'opening');
                            const transitionTasks = tasks.filter(t => t.shiftType === 'transition');
                            const closingTasks = tasks.filter(t => t.shiftType === 'closing');

                            const openingCompleted = openingTasks.filter(t => t.isCompleted).length;
                            const transitionCompleted = transitionTasks.filter(t => t.isCompleted).length;
                            const closingCompleted = closingTasks.filter(t => t.isCompleted).length;

                            return (
                              <>
                                {/* Opening */}
                                {openingTasks.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Opening</span>
                                      <span className="text-blue-600">{openingCompleted}/{openingTasks.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${openingCompleted / openingTasks.length * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                {/* Transition */}
                                {transitionTasks.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Transition</span>
                                      <span className="text-purple-600">{transitionCompleted}/{transitionTasks.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div
                                        className="bg-purple-500 h-2.5 rounded-full"
                                        style={{ width: `${transitionCompleted / transitionTasks.length * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                {/* Closing */}
                                {closingTasks.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Closing</span>
                                      <span className="text-orange-600">{closingCompleted}/{closingTasks.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                      <div
                                        className="bg-orange-500 h-2.5 rounded-full"
                                        style={{ width: `${closingCompleted / closingTasks.length * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                          {tasks.map((task) => (
                            <div
                              key={`${task._id}-${task.completedAt || 'incomplete'}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  task.isCompleted ? "bg-green-100" : "bg-amber-100"
                                )}>
                                  {task.isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-amber-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#27251F]">{task.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={cn(
                                      "text-xs",
                                      task.shiftType === 'opening' && "bg-blue-50 text-blue-700 border-blue-200",
                                      task.shiftType === 'transition' && "bg-purple-50 text-purple-700 border-purple-200",
                                      task.shiftType === 'closing' && "bg-orange-50 text-orange-700 border-orange-200"
                                    )}>
                                      {task.shiftType}
                                    </Badge>
                                    {task.completedBy && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>{task.completedBy.name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {task.completedAt && (
                                <div className="text-xs text-muted-foreground">
                                  {(() => {
                                    try {
                                      const completedDate = new Date(task.completedAt)
                                      if (isNaN(completedDate.getTime())) {
                                        return ''
                                      }
                                      return format(completedDate, 'h:mm a')
                                    } catch (error) {
                                      return ''
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
