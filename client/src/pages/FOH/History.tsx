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
import axios from 'axios'

// Define interfaces for type safety
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

interface GroupedCompletions {
  [date: string]: TaskCompletion[];
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

  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ['foh-stats', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/foh/stats', {
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

  // Track which dates are expanded
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a date
  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  // Group completions by date
  const groupedCompletions = useMemo(() => {
    if (!completions.length) return {};

    // Filter by shift type if not 'all'
    const filteredCompletions = activeShift === 'all'
      ? completions
      : completions.filter(c => c.task?.shiftType === activeShift);

    // Group by date
    return filteredCompletions.reduce((groups: GroupedCompletions, completion) => {
      const date = completion.nyDateString || 'Unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(completion);
      return groups;
    }, {});
  }, [completions, activeShift]);

  // Get sorted dates (newest first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedCompletions).sort((a, b) => {
      // Sort in reverse chronological order
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedCompletions]);

  // Calculate statistics for each date
  const dateStats = useMemo(() => {
    const stats: Record<string, {
      opening: number;
      transition: number;
      closing: number;
      total: number;
    }> = {};

    sortedDates.forEach(date => {
      const tasks = groupedCompletions[date];
      const opening = tasks.filter(t => t.task?.shiftType === 'opening').length;
      const transition = tasks.filter(t => t.task?.shiftType === 'transition').length;
      const closing = tasks.filter(t => t.task?.shiftType === 'closing').length;

      stats[date] = {
        opening,
        transition,
        closing,
        total: tasks.length
      };
    });

    return stats;
  }, [groupedCompletions, sortedDates]);

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

        <Card className="rounded-[20px] shadow-sm overflow-hidden">
          <CardHeader className="bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Select Date Range</CardTitle>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-[20px] shadow-sm overflow-hidden bg-white border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#E51636]"></div>
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              {isLoadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-[#E51636]">
                  {stats?.completionRate ? stats.completionRate.toFixed(1) : '0.0'}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[20px] shadow-sm overflow-hidden bg-white border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#E51636]"></div>
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              {isLoadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold">
                  {stats?.completedTasks || 0} / {stats?.totalTasks || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[20px] shadow-sm overflow-hidden bg-white border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                Opening Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              {isLoadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {stats?.completionsByShift?.opening || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[20px] shadow-sm overflow-hidden bg-white border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                Closing Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              {isLoadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {stats?.completionsByShift?.closing || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

        {isLoadingCompletions ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-[20px]" />
            ))}
          </div>
        ) : completions.length === 0 ? (
          <Card className="rounded-[20px] shadow-sm overflow-hidden">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-1">No completions found</h3>
                <p>Try selecting a different date range</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const stats = dateStats[date];
              const isExpanded = !!expandedDates[date];

              // Determine progress percentages
              const openingPercent = stats.total > 0 ? (stats.opening / stats.total) * 100 : 0;
              const transitionPercent = stats.total > 0 ? (stats.transition / stats.total) * 100 : 0;
              const closingPercent = stats.total > 0 ? (stats.closing / stats.total) * 100 : 0;

              return (
                <Collapsible
                  key={date}
                  open={isExpanded}
                  onOpenChange={() => toggleDateExpanded(date)}
                  className="rounded-[20px] shadow-sm overflow-hidden bg-white border"
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-[#E51636]" />
                          <div>
                            <h3 className="text-lg font-semibold">{date}</h3>
                            <p className="text-sm text-muted-foreground">{stats.total} tasks completed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Opening: {stats.opening}
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Transition: {stats.transition}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Closing: {stats.closing}
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
                          <div className="w-20 text-xs text-blue-700">Opening</div>
                          <Progress value={openingPercent} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                          <div className="w-10 text-xs text-muted-foreground">{stats.opening}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-amber-700">Transition</div>
                          <Progress value={transitionPercent} className="h-2 bg-amber-100" indicatorClassName="bg-amber-600" />
                          <div className="w-10 text-xs text-muted-foreground">{stats.transition}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-xs text-purple-700">Closing</div>
                          <Progress value={closingPercent} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
                          <div className="w-10 text-xs text-muted-foreground">{stats.closing}</div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <h4 className="text-sm font-medium mb-3">Completed Tasks</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {groupedCompletions[date].map((completion) => {
                          // Determine badge color based on shift type
                          let badgeClass = "";
                          switch(completion.task?.shiftType) {
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
                              key={completion._id}
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-all"
                            >
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                  <div>
                                    <div className="font-medium">{completion.task?.name || 'Unknown Task'}</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <User className="h-3.5 w-3.5 mr-1" />
                                        {completion.completedBy?.name || 'Unknown User'}
                                      </div>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        {formatUTCTimeDirectly(completion.date) || completion.nyTimeString || 'Unknown Time'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Badge className={`mt-2 md:mt-0 ${badgeClass}`}>
                                {completion.task?.shiftType || 'unknown'}
                              </Badge>
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