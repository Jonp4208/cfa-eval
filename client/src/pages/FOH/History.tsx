import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, CheckCircle, Clock, User, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { formatUTCTimeDirectly } from '@/lib/utils/date-utils'
import { cn } from '@/lib/utils'
import axios from 'axios'

// Define interfaces for type safety
interface Task {
  _id: string;
  name: string;
  shiftType: 'opening' | 'transition' | 'closing';
  isActive: boolean;
}

interface TaskCompletion {
  _id: string;
  task: {
    _id: string;
    name: string;
    shiftType: 'opening' | 'transition' | 'closing';
  };
  completedBy: {
    _id: string;
    name: string;
  };
  date: string;
  nyDateString: string;
  nyTimeString: string;
}

// Combined task type that includes completion status
interface HistoryTask {
  _id: string;
  name: string;
  shiftType: 'opening' | 'transition' | 'closing';
  isCompleted: boolean;
  completedBy?: {
    _id: string;
    name: string;
  };
  date?: string;
  nyDateString: string;
  nyTimeString?: string;
}

interface GroupedTasks {
  [date: string]: HistoryTask[];
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  completionsByShift: {
    opening: number;
    transition: number;
    closing: number;
  };
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date()
  })

  // Default to 'all' tab, but allow filtering by shift type
  const [activeShift, setActiveShift] = useState('all')

  // Fetch all tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['foh-all-tasks'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/foh/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  // Fetch completions for the date range
  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<TaskCompletion[]>({
    queryKey: ['foh-completions', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/foh/completions', {
        params: {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  // Calculate our own stats based on the combined task data
  const calculatedStats = useMemo(() => {
    // Filter out completions from Sundays
    const filteredCompletions = completions.filter(completion => {
      const date = completion.nyDateString || '';
      const dayOfWeek = new Date(date).getDay();
      return dayOfWeek !== 0; // Skip Sundays
    });

    // Count unique tasks that have been completed
    const uniqueCompletedTaskIds = new Set(filteredCompletions.map(c => c.task._id));

    // Count tasks by shift type
    const openingCompletions = filteredCompletions.filter(c => c.task.shiftType === 'opening');
    const transitionCompletions = filteredCompletions.filter(c => c.task.shiftType === 'transition');
    const closingCompletions = filteredCompletions.filter(c => c.task.shiftType === 'closing');

    // Filter out tasks that are inactive or fall on Sundays
    const activeTasks = tasks.filter(task => task.isActive);

    return {
      totalTasks: activeTasks.length,
      completedTasks: uniqueCompletedTaskIds.size,
      completionRate: activeTasks.length > 0 ? (uniqueCompletedTaskIds.size / activeTasks.length) * 100 : 0,
      completionsByShift: {
        opening: openingCompletions.length,
        transition: transitionCompletions.length,
        closing: closingCompletions.length
      }
    };
  }, [tasks, completions]);

  // Track which dates are expanded
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a date
  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  // Combine tasks and completions to show both completed and uncompleted tasks
  const combinedTasksData = useMemo(() => {
    if (!tasks.length && !completions.length) return {};

    // Create a map of task IDs to task objects
    const taskMap = new Map(tasks.map(task => [task._id, task]));

    // Create a map of completed task IDs to completion objects for each date
    const completionsByDate = new Map<string, Map<string, TaskCompletion>>();

    // Process all completions, excluding Sundays
    completions.forEach(completion => {
      const date = completion.nyDateString || 'Unknown';

      // Skip Sundays (0 = Sunday in JavaScript's getDay())
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0) return; // Skip Sundays

      if (!completionsByDate.has(date)) {
        completionsByDate.set(date, new Map());
      }
      completionsByDate.get(date)?.set(completion.task._id, completion);
    });

    // Create combined tasks for each date
    const result: GroupedTasks = {};

    // First, add all dates from completions (excluding Sundays)
    completions.forEach(completion => {
      const date = completion.nyDateString || 'Unknown';

      // Skip Sundays
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0) return; // Skip Sundays

      if (!result[date]) {
        result[date] = [];
      }
    });

    // For each date with completions, create combined tasks
    for (const [date, completionsMap] of completionsByDate.entries()) {
      // Skip Sundays
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0) continue; // Skip Sundays

      // For each task that has a completion on this date
      for (const [taskId, completion] of completionsMap.entries()) {
        // Create a completed task entry
        result[date].push({
          _id: taskId,
          name: completion.task.name,
          shiftType: completion.task.shiftType,
          isCompleted: true,
          completedBy: completion.completedBy,
          date: completion.date,
          nyDateString: date,
          nyTimeString: completion.nyTimeString
        });

        // Remove this task from the taskMap so we don't add it again as uncompleted
        taskMap.delete(taskId);
      }

      // For each remaining task (not completed on this date)
      // We'll add uncompleted tasks for the most recent date only
      if (date === completions.filter(c => {
        const dayOfWeek = new Date(c.nyDateString || '').getDay();
        return dayOfWeek !== 0; // Exclude Sundays
      })[0]?.nyDateString) {
        for (const [taskId, task] of taskMap.entries()) {
          // Filter by shift type if not 'all'
          if (activeShift === 'all' || task.shiftType === activeShift) {
            result[date].push({
              _id: taskId,
              name: task.name,
              shiftType: task.shiftType,
              isCompleted: false,
              nyDateString: date
            });
          }
        }
      }
    }

    // Filter by shift type if not 'all'
    if (activeShift !== 'all') {
      for (const date in result) {
        result[date] = result[date].filter(task => task.shiftType === activeShift);
      }
    }

    return result;
  }, [tasks, completions, activeShift]);

  // Get sorted dates (newest first)
  const sortedDates = useMemo(() => {
    return Object.keys(combinedTasksData).sort((a, b) => {
      // Sort in reverse chronological order
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [combinedTasksData]);

  // Calculate statistics for each date
  const dateStats = useMemo(() => {
    const stats: Record<string, {
      opening: { total: number; completed: number };
      transition: { total: number; completed: number };
      closing: { total: number; completed: number };
      total: number;
      completed: number;
      uncompleted: number;
    }> = {};

    sortedDates.forEach(date => {
      const tasks = combinedTasksData[date];

      // Get all tasks by shift type
      const openingTasks = tasks.filter(t => t.shiftType === 'opening');
      const transitionTasks = tasks.filter(t => t.shiftType === 'transition');
      const closingTasks = tasks.filter(t => t.shiftType === 'closing');

      // Count completed tasks by shift type
      const openingCompleted = openingTasks.filter(t => t.isCompleted).length;
      const transitionCompleted = transitionTasks.filter(t => t.isCompleted).length;
      const closingCompleted = closingTasks.filter(t => t.isCompleted).length;

      // Total counts
      const completed = tasks.filter(t => t.isCompleted).length;
      const uncompleted = tasks.filter(t => !t.isCompleted).length;

      stats[date] = {
        opening: {
          total: openingTasks.length,
          completed: openingCompleted
        },
        transition: {
          total: transitionTasks.length,
          completed: transitionCompleted
        },
        closing: {
          total: closingTasks.length,
          completed: closingCompleted
        },
        total: tasks.length,
        completed,
        uncompleted
      };
    });

    return stats;
  }, [combinedTasksData, sortedDates]);

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Enhanced header with gradient */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FOH Task History</h1>
              <p className="text-white/90 text-sm md:text-base">View completed tasks by date</p>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => navigate('/foh')}
                className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tasks</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm font-medium">Completion Rate</p>
                  <h3 className="text-xl font-bold mt-1 text-[#E51636]">
                    {isLoadingTasks || isLoadingCompletions ? <Skeleton className="h-8 w-16" /> : calculatedStats.completionRate.toFixed(1)}%
                  </h3>
                </div>
                <div className="h-10 w-10 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-[#E51636]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm font-medium">Total Tasks</p>
                  <h3 className="text-xl font-bold mt-1 text-[#27251F]">
                    {isLoadingTasks || isLoadingCompletions ? <Skeleton className="h-8 w-16" /> : `${calculatedStats.completedTasks} / ${calculatedStats.totalTasks}`}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm font-medium">Opening Tasks</p>
                  <h3 className="text-xl font-bold mt-1 text-blue-600">
                    {isLoadingTasks || isLoadingCompletions ? <Skeleton className="h-8 w-16" /> : calculatedStats.completionsByShift.opening}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm font-medium">Closing Tasks</p>
                  <h3 className="text-xl font-bold mt-1 text-purple-600">
                    {isLoadingTasks || isLoadingCompletions ? <Skeleton className="h-8 w-16" /> : calculatedStats.completionsByShift.closing}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all border border-gray-200 mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[#27251F]">Select Date Range</h3>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                disabled={(date) => {
                  // Disable Sundays (0 = Sunday in JavaScript's getDay())
                  return date.getDay() === 0;
                }}
              />
            </div>
          </div>
        </Card>

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
        ) : Object.keys(combinedTasksData).length === 0 ? (
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

              // Determine progress percentages
              const openingPercent = stats.opening.total > 0 ? (stats.opening.completed / stats.opening.total) * 100 : 0;
              const transitionPercent = stats.transition.total > 0 ? (stats.transition.completed / stats.transition.total) * 100 : 0;
              const closingPercent = stats.closing.total > 0 ? (stats.closing.completed / stats.closing.total) * 100 : 0;
              const completedPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <Collapsible
                  key={date}
                  open={isExpanded}
                  onOpenChange={() => toggleDateExpanded(date)}
                  className="rounded-xl shadow-sm overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-[#E51636]" />
                          <div>
                            <h3 className="text-lg font-semibold">
                              {format(new Date(date), 'EEEE')} - {date}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {stats.completed} completed / {stats.uncompleted} uncompleted
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Opening: {stats.opening.completed}/{stats.opening.total}
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Transition: {stats.transition.completed}/{stats.transition.total}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Closing: {stats.closing.completed}/{stats.closing.total}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-green-700">Completed</div>
                          <Progress value={completedPercent} className="h-2 bg-green-100" indicatorClassName="bg-green-600" />
                          <div className="w-16 text-xs text-muted-foreground">{stats.completed}/{stats.total}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-blue-700">Opening</div>
                          <Progress value={openingPercent} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                          <div className="w-16 text-xs text-muted-foreground">{stats.opening.completed}/{stats.opening.total}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-amber-700">Transition</div>
                          <Progress value={transitionPercent} className="h-2 bg-amber-100" indicatorClassName="bg-amber-600" />
                          <div className="w-16 text-xs text-muted-foreground">{stats.transition.completed}/{stats.transition.total}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-purple-700">Closing</div>
                          <Progress value={closingPercent} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
                          <div className="w-16 text-xs text-muted-foreground">{stats.closing.completed}/{stats.closing.total}</div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <h4 className="text-sm font-medium mb-3">All Tasks</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {combinedTasksData[date].map((task) => {
                          // Determine badge color based on shift type
                          let badgeClass = "";
                          switch(task.shiftType) {
                            case 'opening':
                              badgeClass = "bg-blue-50 text-blue-700";
                              break;
                            case 'transition':
                              badgeClass = "bg-amber-50 text-amber-700";
                              break;
                            case 'closing':
                              badgeClass = "bg-purple-50 text-purple-700";
                              break;
                            default:
                              badgeClass = "bg-gray-50 text-gray-700";
                          }

                          return (
                            <div
                              key={task._id}
                              className={cn(
                                'bg-white rounded-xl border transition-all duration-200 hover:shadow-md',
                                task.isCompleted ? (
                                  badgeClass === "bg-blue-50 text-blue-700" ? 'border-blue-200' :
                                  badgeClass === "bg-amber-50 text-amber-700" ? 'border-amber-200' :
                                  badgeClass === "bg-purple-50 text-purple-700" ? 'border-purple-200' : 'border-green-200'
                                ) : 'border-gray-200'
                              )}
                            >
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="pt-0.5">
                                      {task.isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      ) : (
                                        <div className="h-5 w-5 rounded-md border-2 border-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex flex-col">
                                        <div className={cn(
                                          "text-sm font-medium",
                                          task.isCompleted ? "text-green-700 line-through decoration-green-500/50" : "text-gray-900"
                                        )}>
                                          {task.name || 'Unknown Task'}
                                        </div>
                                        {task.isCompleted && task.completedBy && (
                                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>
                                              Completed by <span className="font-medium text-gray-700">{task.completedBy?.name || 'Unknown User'}</span> at {formatUTCTimeDirectly(task.date || '') || task.nyTimeString || 'Unknown Time'}
                                            </span>
                                          </div>
                                        )}
                                        {!task.isCompleted && (
                                          <div className="mt-1.5 text-xs text-gray-500">
                                            Not completed
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className={badgeClass}>
                                    {task.shiftType || 'unknown'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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