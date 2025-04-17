import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft,
  Clock,
  User,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Filter,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  X,
  ChevronRight,
  Search
} from 'lucide-react'
import { kitchenService, TemperatureLog } from '@/services/kitchenService'
import { FoodSafetyChecklist, CompletionStatus } from '@/types/kitchen'
import { cn } from "@/lib/utils"

interface CompletedBy {
  _id: string
  name: string
}

interface ReviewedBy {
  _id: string
  name: string
}

interface TemperatureLogWithUser {
  id: string
  location: string
  type: 'equipment' | 'product'
  value: number
  status: string
  timestamp: string
  notes?: string
  recordedBy: string | CompletedBy
}

interface FoodSafetyChecklistCompletion {
  _id: string
  checklist: string | FoodSafetyChecklist
  completedBy: string | CompletedBy
  completedAt: string
  items: any[]
  overallStatus: CompletionStatus
  score: number
  notes?: string
  reviewedBy?: string | ReviewedBy
  reviewedAt?: string
  reviewNotes?: string
}

export default function History() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('checklists')
  
  // Checklist History States
  const [checklistLoading, setChecklistLoading] = useState(true)
  const [completions, setCompletions] = useState<FoodSafetyChecklistCompletion[]>([])
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  })
  const [statusFilter, setStatusFilter] = useState<CompletionStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Temperature Log States
  const [tempLoading, setTempLoading] = useState(true)
  const [logs, setLogs] = useState<TemperatureLogWithUser[]>([])
  const [groupedLogs, setGroupedLogs] = useState<Record<string, TemperatureLogWithUser[]>>({})
  const [tempDateRange, setTempDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date()
  })
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Add new state for daily checklist history
  const [historyData, setHistoryData] = useState<{
    dateRange: { start: string; end: string }
    completions: any[]
    groupedByDate: Record<string, any[]>
  } | null>(null)

  // Add state for expanded days
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (activeTab === 'checklists') {
      loadChecklistData()
    } else {
      loadTemperatureData()
    }
  }, [activeTab, dateRange])

  const loadChecklistData = async () => {
    try {
      setChecklistLoading(true)
      
      // Use date-fns to handle date boundaries consistently
      const start = startOfDay(dateRange.start)
      const end = endOfDay(dateRange.end)
      
      console.log('Fetching with date range:', { 
        start: format(start, 'yyyy-MM-dd HH:mm:ss'),
        end: format(end, 'yyyy-MM-dd HH:mm:ss')
      })
      
      // Load both types of data in parallel
      const [completionsData, historyData] = await Promise.all([
        kitchenService.getChecklistCompletions('all'),
        kitchenService.getDailyChecklistHistory({
          startDate: start.toISOString(),
          endDate: end.toISOString()
        })
      ])
      
      console.log('Received history data:', historyData)
      
      setCompletions(completionsData as FoodSafetyChecklistCompletion[])
      setHistoryData(historyData)
    } catch (error) {
      console.error('Error loading data:', error)
      enqueueSnackbar('Failed to load history data', { variant: 'error' })
    } finally {
      setChecklistLoading(false)
    }
  }
  
  const loadTemperatureData = async () => {
    try {
      setTempLoading(true)
      
      const start = startOfDay(tempDateRange.start)
      const end = endOfDay(tempDateRange.end)
      
      const response = await kitchenService.getTemperatureLogs({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: selectedLocation && selectedLocation !== 'all' ? selectedLocation : undefined,
        type: selectedType && selectedType !== 'all' ? (selectedType as 'equipment' | 'product') : undefined
      })
      
      setLogs(response.logs)
      setGroupedLogs(response.groupedLogs)
    } catch (error) {
      console.error('Error loading temperature logs:', error)
      enqueueSnackbar('Failed to load temperature logs', { variant: 'error' })
    } finally {
      setTempLoading(false)
    }
  }
  
  // Checklist helpers
  const getChecklistStatusIcon = (status: CompletionStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  // Update the filtered completions to include both types of data
  const filteredCompletions = [
    ...completions.filter(completion => {
      const completionDate = new Date(completion.completedAt)
      const start = new Date(dateRange.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59, 999)
      
      const matchesDateRange = completionDate >= start && completionDate <= end
      const matchesStatus = statusFilter === 'all' || completion.overallStatus === statusFilter
      const matchesSearch = searchTerm === '' || 
        completion.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof completion.completedBy === 'object' && 
         (completion.completedBy as CompletedBy).name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesDateRange && matchesStatus && matchesSearch
    }),
    ...(historyData?.completions || []).filter(item => {
      const completionDate = new Date(item.completedAt)
      const start = new Date(dateRange.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59, 999)
      
      const matchesDateRange = completionDate >= start && completionDate <= end
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = searchTerm === '' || 
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.completedBy.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesDateRange && matchesStatus && matchesSearch
    })
  ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  // Update the stats calculation to include both types of data
  const stats = {
    averageScore: Math.round(
      filteredCompletions.reduce((acc, curr) => acc + (curr.score || 0), 0) / filteredCompletions.length || 0
    ),
    passRate: Math.round(
      (filteredCompletions.filter(c => (c.overallStatus || c.status) === 'pass').length / filteredCompletions.length) * 100 || 0
    ),
    criticalFailures: filteredCompletions.filter(c => (c.overallStatus || c.status) === 'fail').length,
    totalCompletions: filteredCompletions.length
  }
  
  // Temperature log helpers
  const getTemperatureStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getTemperatureStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <ThermometerSun className="h-4 w-4 text-green-600" />
      case 'warning':
        return <Thermometer className="h-4 w-4 text-yellow-600" />
      case 'fail':
        return <ThermometerSnowflake className="h-4 w-4 text-red-600" />
      default:
        return <Thermometer className="h-4 w-4 text-gray-600" />
    }
  }
  
  const filteredLogs = logs.filter(log => {
    if (selectedStatus && selectedStatus !== 'all' && log.status !== selectedStatus) return false
    return true
  })
  
  const handleApplyTempFilters = () => {
    loadTemperatureData()
  }
  
  const handleClearTempFilters = () => {
    setTempDateRange({
      start: subDays(new Date(), 7),
      end: new Date()
    })
    setSelectedLocation('all')
    setSelectedType('all')
    setSelectedStatus('all')
  }

  // Add helper to group completions by date
  const groupCompletionsByDate = (completions: any[]) => {
    const grouped: Record<string, any[]> = {}
    completions.forEach(completion => {
      const date = format(new Date(completion.completedAt), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(completion)
    })
    return grouped
  }

  // Add helper to get day summary
  const getDaySummary = (items: any[]) => {
    const total = items.length
    const passCount = items.filter(c => (c.overallStatus || c.status) === 'pass').length
    const warningCount = items.filter(c => (c.overallStatus || c.status) === 'warning').length
    const failCount = items.filter(c => (c.overallStatus || c.status) === 'fail').length
    
    return {
      total,
      passCount,
      warningCount,
      failCount
    }
  }

  // Add helper to group temperature logs by date
  const groupTemperatureLogsByDate = (logs: TemperatureLogWithUser[]) => {
    const grouped: Record<string, TemperatureLogWithUser[]> = {}
    logs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(log)
    })
    return grouped
  }

  // Add helper to get temperature logs summary for a day
  const getTemperatureDaySummary = (items: TemperatureLogWithUser[]) => {
    const total = items.length
    const passCount = items.filter(log => log.status === 'pass').length
    const warningCount = items.filter(log => log.status === 'warning').length
    const failCount = items.filter(log => log.status === 'fail').length
    
    return {
      total,
      passCount,
      warningCount,
      failCount
    }
  }

  if (activeTab === 'checklists' && checklistLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }
  
  if (activeTab === 'temperatures' && tempLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#27251F]">Food Safety History</h1>
          <p className="text-[#27251F]/60 text-sm sm:text-base mt-1">
            View and analyze all food safety data
          </p>
        </div>
        <Button
          onClick={() => navigate('/kitchen/food-safety')}
          variant="outline"
          className="w-full md:w-auto h-9 sm:h-10"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Food Safety
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="checklists">Checklist History</TabsTrigger>
          <TabsTrigger value="temperatures">Temperature Logs</TabsTrigger>
        </TabsList>
        
        {/* Checklist History Tab */}
        <TabsContent value="checklists" className="mt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <div className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Average Score</p>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.averageScore}%</h3>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">During selected period</p>
                  </div>
                  <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-[#E51636]/10 text-[#E51636] rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <div className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Pass Rate</p>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.passRate}%</h3>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Success rate</p>
                  </div>
                  <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-green-100 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <div className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Critical Failures</p>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.criticalFailures}</h3>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Need attention</p>
                  </div>
                  <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-red-100 text-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <div className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Total Checks</p>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.totalCompletions}</h3>
                    <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Completed checks</p>
                  </div>
                  <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-blue-100 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white rounded-[20px] mt-6 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label>Date Range</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      type="date"
                      value={format(dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        start: new Date(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-[#27251F]/60">to</span>
                    <Input
                      type="date"
                      value={format(dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        end: new Date(e.target.value)
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => setStatusFilter(value as CompletionStatus | 'all')}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-3">
                  <Label>Search</Label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search by notes or completed by..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completions List */}
          <Card className="bg-white rounded-[20px] mt-6 hover:shadow-xl transition-all duration-300">
            <div className="p-3 sm:p-6">
              <h2 className="text-xl font-semibold text-[#27251F] mb-4">Completion History</h2>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {filteredCompletions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-[#27251F]/60">No completions found</p>
                      <p className="text-sm text-[#27251F]/40">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupCompletionsByDate(filteredCompletions))
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([date, items]) => {
                        const isExpanded = expandedDays[date] || false
                        const summary = getDaySummary(items)
                        const isToday = format(new Date(), 'yyyy-MM-dd') === date

                        return (
                          <Card key={date} className="bg-white rounded-[20px] hover:shadow-sm transition-all duration-300">
                            <div 
                              className="p-4 cursor-pointer"
                              onClick={() => setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }))}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-[#27251F] flex items-center">
                                  {format(new Date(date), 'MMMM d, yyyy')}
                                  {isToday && (
                                    <Badge className="ml-2 bg-[#E51636] text-white">Today</Badge>
                                  )}
                                </h3>
                                <div className={cn(
                                  "transition-transform duration-300",
                                  isExpanded ? "rotate-90" : "rotate-0"
                                )}>
                                  <ChevronRight className="h-5 w-5 text-[#27251F]/60" />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.passCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.warningCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.failCount}</span>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-gray-200 p-4">
                                <div className="space-y-4">
                                  {items.map((completion) => {
                                    const isDaily = !completion.checklist
                                    const status = isDaily ? completion.status : completion.overallStatus
                                    const score = isDaily ? null : completion.score
                                    const name = isDaily ? completion.itemName : 
                                      (typeof completion.checklist === 'string' 
                                        ? completion.checklist 
                                        : (completion.checklist as FoodSafetyChecklist).name)
                                    const completedBy = isDaily ? completion.completedBy :
                                      (typeof completion.completedBy === 'string' 
                                        ? completion.completedBy 
                                        : completion.completedBy.name)

                                    return (
                                      <div
                                        key={completion._id}
                                        className="p-4 border rounded-xl hover:shadow-sm transition-shadow cursor-pointer bg-white"
                                        onClick={() => isDaily ? null : navigate(`/kitchen/food-safety/view/${completion._id}`)}
                                      >
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge 
                                                className={cn(
                                                  "capitalize",
                                                  status === 'pass'
                                                    ? "bg-green-100 text-green-600"
                                                    : status === 'warning'
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-red-100 text-red-600"
                                                )}
                                              >
                                                {status}
                                              </Badge>
                                              {score !== null && (
                                                <span className="text-sm text-[#27251F]/60">
                                                  Score: {score}%
                                                </span>
                                              )}
                                            </div>
                                            <h3 className="font-medium text-[#27251F] text-base">
                                              {name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-[#27251F]/60 mt-1">
                                              <Clock className="h-4 w-4" />
                                              {format(new Date(completion.completedAt), 'h:mm a')}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[#27251F]/60 mt-1">
                                              <User className="h-4 w-4" />
                                              Completed by: {completedBy}
                                            </div>
                                            {completion.notes && (
                                              <p className="mt-2 text-sm text-[#27251F]/80">
                                                {completion.notes}
                                              </p>
                                            )}
                                            {isDaily && completion.value !== undefined && (
                                              <div className="mt-2 flex items-center gap-2">
                                                <Thermometer className="h-4 w-4" />
                                                <span className="text-sm font-medium">{completion.value}°F</span>
                                              </div>
                                            )}
                                          </div>
                                          {!isDaily && (
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 shrink-0"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </Card>
                        )
                      })
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>
        
        {/* Temperature Logs Tab */}
        <TabsContent value="temperatures" className="mt-0">
          {/* Temperature Filters */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label>Date Range</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="tempStartDate"
                      type="date"
                      value={format(tempDateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setTempDateRange(prev => ({
                        ...prev,
                        start: new Date(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-[#27251F]/60">to</span>
                    <Input
                      id="tempEndDate"
                      type="date"
                      value={format(tempDateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setTempDateRange(prev => ({
                        ...prev,
                        end: new Date(e.target.value)
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleApplyTempFilters} className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={handleClearTempFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Logs List */}
          <Card className="bg-white rounded-[20px] mt-6 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Temperature Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {tempLoading ? (
                <div className="text-center py-8">Loading temperature logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Thermometer className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-[#27251F]/60">No temperature logs found</p>
                  <p className="text-sm text-[#27251F]/40">
                    Try adjusting your filters or date range
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {Object.entries(groupTemperatureLogsByDate(filteredLogs))
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([date, items]) => {
                        const isExpanded = expandedDays[`temp-${date}`] || false
                        const summary = getTemperatureDaySummary(items)
                        const isToday = format(new Date(), 'yyyy-MM-dd') === date

                        return (
                          <Card key={date} className="bg-white rounded-[20px] hover:shadow-sm transition-all duration-300">
                            <div 
                              className="p-4 cursor-pointer"
                              onClick={() => setExpandedDays(prev => ({ ...prev, [`temp-${date}`]: !prev[`temp-${date}`] }))}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-[#27251F] flex items-center">
                                  {format(new Date(date), 'MMMM d, yyyy')}
                                  {isToday && (
                                    <Badge className="ml-2 bg-[#E51636] text-white">Today</Badge>
                                  )}
                                </h3>
                                <div className={cn(
                                  "transition-transform duration-300",
                                  isExpanded ? "rotate-90" : "rotate-0"
                                )}>
                                  <ChevronRight className="h-5 w-5 text-[#27251F]/60" />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                    <ThermometerSun className="h-5 w-5 text-green-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.passCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                                    <Thermometer className="h-5 w-5 text-yellow-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.warningCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                                    <ThermometerSnowflake className="h-5 w-5 text-red-600" />
                                  </div>
                                  <span className="text-sm font-medium">{summary.failCount}</span>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-gray-200 p-4">
                                <div className="space-y-4">
                                  {items.map(log => {
                                    const locationName = log.location.split('_').map(word => 
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')
                                    
                                    return (
                                      <div key={log.id} className="p-4 border rounded-xl hover:shadow-sm transition-shadow bg-white">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            {getTemperatureStatusIcon(log.status)}
                                            <div>
                                              <h4 className="font-medium">{locationName}</h4>
                                              <p className="text-sm text-gray-500">
                                                {format(new Date(log.timestamp), 'h:mm a')}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="text-xl font-medium">{log.value}°F</div>
                                            <Badge className={getTemperatureStatusColor(log.status)}>
                                              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                            </Badge>
                                          </div>
                                        </div>
                                        {log.notes && (
                                          <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                            <span className="font-medium">Notes:</span> {log.notes}
                                          </div>
                                        )}
                                        <div className="mt-2 text-xs text-[#27251F]/60 flex items-center gap-2">
                                          <User className="h-4 w-4" />
                                          Recorded by: {typeof log.recordedBy === 'object' ? log.recordedBy.name : log.recordedBy}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 