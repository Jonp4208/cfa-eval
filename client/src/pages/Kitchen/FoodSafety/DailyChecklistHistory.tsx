'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { format, subDays, parseISO, isValid, startOfDay, endOfDay } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
  Filter,
  CalendarDays,
  RefreshCw,
  Thermometer
} from 'lucide-react'
import { kitchenService, DailyChecklistHistoryItem } from '@/services/kitchenService'
import { cn } from '@/lib/utils'

export default function DailyChecklistHistory() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  
  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState<{
    dateRange: { start: string; end: string }
    completions: DailyChecklistHistoryItem[]
    groupedByDate: Record<string, DailyChecklistHistoryItem[]>
  } | null>(null)
  const [selectedCompletion, setSelectedCompletion] = useState<DailyChecklistHistoryItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Filters
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 7)), // Default to last 7 days
    end: endOfDay(new Date()) // Use endOfDay to include all of today's completions
  })
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [fromDateOpen, setFromDateOpen] = useState(false)
  const [toDateOpen, setToDateOpen] = useState(false)
  // Track expanded day cards
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  // Add state for active timeframe tabs
  const [activeTimeframeTabs, setActiveTimeframeTabs] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Fetching history with date range:', {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      })
      
      const data = await kitchenService.getDailyChecklistHistory({
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      })
      
      console.log('History data received:', data)
      
      // Check if we have data for today
      const today = format(new Date(), 'yyyy-MM-dd')
      const hasTodayData = data.groupedByDate && data.groupedByDate[today]
      console.log('Today is:', today)
      console.log('Has today data:', hasTodayData)
      if (hasTodayData) {
        console.log('Today\'s completions:', data.groupedByDate[today])
      } else {
        console.log('No completions found for today. All dates available:', Object.keys(data.groupedByDate || {}))
      }
      
      setHistoryData(data)
      
      // Auto-expand today's card if it exists
      if (hasTodayData) {
        setExpandedDays(prev => ({ ...prev, [today]: true }))
      }
    } catch (error) {
      console.error('Error loading history data:', error)
      enqueueSnackbar('Failed to load history data', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleViewCompletion = (completion: DailyChecklistHistoryItem) => {
    setSelectedCompletion(completion)
    setViewDialogOpen(true)
  }

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
    
    // Set default active tab to 'all' when expanding
    if (!expandedDays[date]) {
      setActiveTimeframeTabs(prev => ({
        ...prev,
        [date]: 'all'
      }))
    }
  }

  const getStatusIcon = (status: string) => {
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

  const getStatusIconSmall = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
      default:
        return null
    }
  }

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'morning':
        return 'Morning (5am-10am)'
      case 'lunch':
        return 'Lunch (10am-2pm)'
      case 'afternoon':
        return 'Afternoon (2pm-5pm)'
      case 'dinner':
        return 'Dinner (5pm-9pm)'
      case 'closing':
        return 'Closing (9pm-Close)'
      case '30min':
        return '30-Minute Checks'
      case 'hourly':
        return 'Hourly Checks'
      default:
        return timeframe
    }
  }

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
  }

  // Get unique categories from completions
  const getUniqueCategories = () => {
    if (!historyData?.completions) return []
    const categories = new Set(historyData.completions.map(item => item.category))
    return Array.from(categories)
  }

  // Get unique timeframes from completions
  const getUniqueTimeframes = () => {
    if (!historyData?.completions) return []
    const timeframes = new Set(historyData.completions.map(item => item.timeframe))
    return Array.from(timeframes)
  }

  // Filter completions based on selected filters
  const getFilteredCompletions = () => {
    if (!historyData?.groupedByDate) return {}
    
    const filteredData: Record<string, DailyChecklistHistoryItem[]> = {}
    
    // Sort dates to ensure today appears first
    const sortedDates = Object.keys(historyData.groupedByDate).sort((a, b) => {
      // Today should always be first
      const today = format(new Date(), 'yyyy-MM-dd')
      if (a === today) return -1
      if (b === today) return 1
      // Otherwise sort newest to oldest
      return new Date(b).getTime() - new Date(a).getTime()
    })
    
    sortedDates.forEach(date => {
      const completions = historyData.groupedByDate[date]
      const filtered = completions.filter(completion => {
        const matchesCategory = categoryFilter === 'all' || completion.category === categoryFilter
        const matchesTimeframe = timeframeFilter === 'all' || completion.timeframe === timeframeFilter
        const matchesSearch = searchTerm === '' || 
          completion.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          completion.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          completion.completedBy.toLowerCase().includes(searchTerm.toLowerCase())
        
        return matchesCategory && matchesTimeframe && matchesSearch
      })
      
      if (filtered.length > 0) {
        filteredData[date] = filtered
      }
    })
    
    return filteredData
  }

  // Get summary statistics for a day
  const getDaySummary = (completions: DailyChecklistHistoryItem[]) => {
    const total = completions.length
    const passCount = completions.filter(c => c.status === 'pass').length
    const warningCount = completions.filter(c => c.status === 'warning').length
    const failCount = completions.filter(c => c.status === 'fail').length
    
    // Get unique categories
    const categories = [...new Set(completions.map(c => c.category))]
    
    // Get unique timeframes
    const timeframes = [...new Set(completions.map(c => c.timeframe))]
    
    return {
      total,
      passCount,
      warningCount,
      failCount,
      categories,
      timeframes
    }
  }

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '';
    
    // Handle objects
    if (typeof value === 'object') {
      // Special case for temperature objects which might have a temp property
      if (value.temp !== undefined) {
        return `${value.temp}°F`;
      }
      return JSON.stringify(value);
    }
    
    // Handle numbers that might be temperatures
    if (typeof value === 'number') {
      // If the number is likely a temperature (between 0 and 212°F)
      if (value >= 0 && value <= 212) {
        return `${value}°F`;
      }
      return value.toString();
    }
    
    // Handle strings
    return value.toString();
  }

  const filteredCompletions = getFilteredCompletions()
  const uniqueCategories = getUniqueCategories()
  const uniqueTimeframes = getUniqueTimeframes()

  // Get filtered items based on active timeframe tab
  const getTimeframeFilteredItems = (items: DailyChecklistHistoryItem[], date: string) => {
    const activeTab = activeTimeframeTabs[date] || 'all'
    if (activeTab === 'all') return items
    
    return items.filter(item => item.timeframe === activeTab)
  }

  if (loading) {
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
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#27251F]">Daily Food Safety Checklist</h1>
          <p className="text-[#27251F]/60 text-sm sm:text-base mt-1">
            History & Analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            className="w-full md:w-auto h-9 sm:h-10"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/kitchen/food-safety')}
            variant="outline"
            className="w-full md:w-auto h-9 sm:h-10"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Food Safety
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 space-y-4 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2 text-[#27251F]">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#27251F]">Date Range</label>
            <div className="flex gap-2">
              <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.start, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, start: startOfDay(date) }))
                        setFromDateOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.end, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, end: endOfDay(date) }))
                        setToDateOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#27251F]">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Timeframe Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#27251F]">Timeframe</label>
            <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Timeframes</SelectItem>
                {uniqueTimeframes.map(timeframe => (
                  <SelectItem key={timeframe} value={timeframe}>
                    {getTimeframeLabel(timeframe)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#27251F]">Search</label>
            <div className="relative">
              <Input
                placeholder="Search by item, notes, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {Object.keys(filteredCompletions).length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <CalendarDays className="h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-[#27251F]">No results found</h3>
              <p className="text-[#27251F]/60">
                Try adjusting your filters or selecting a different date range.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredCompletions).map(([date, completions]) => {
              const isExpanded = expandedDays[date] || false
              const summary = getDaySummary(completions)
              const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy')
              const isToday = date === format(new Date(), 'yyyy-MM-dd')
              
              return (
                <Card 
                  key={date} 
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isToday && "border-[#E51636] border-2",
                    isExpanded && "shadow-lg"
                  )}
                >
                  {/* Card Header - Always visible */}
                  <div 
                    className={cn(
                      "p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-gray-50",
                      isToday && "bg-[#E51636]/5"
                    )}
                    onClick={() => toggleDayExpansion(date)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#27251F]">
                          {formattedDate}
                          {isToday && (
                            <Badge className="ml-2 bg-[#E51636] text-white">Today</Badge>
                          )}
                        </h3>
                        <div className={cn(
                          "transition-transform duration-300",
                          isExpanded ? "rotate-180" : "rotate-0"
                        )}>
                          <ChevronRight className="h-5 w-5 text-[#27251F]/60" />
                        </div>
                      </div>
                      <p className="text-[#27251F]/60 text-sm">
                        {summary.total} items completed across {summary.categories.length} {summary.categories.length === 1 ? 'category' : 'categories'}
                      </p>
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
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[#27251F]">Items</h3>
                          
                          {/* Timeframe Tabs */}
                          <div className="flex items-center space-x-1 overflow-x-auto mt-2 sm:mt-0 pb-1">
                            <button
                              onClick={() => setActiveTimeframeTabs(prev => ({ ...prev, [date]: 'all' }))}
                              className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap",
                                activeTimeframeTabs[date] === 'all' || !activeTimeframeTabs[date]
                                  ? "bg-[#E51636] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              All
                            </button>
                            {summary.timeframes.map(timeframe => (
                              <button
                                key={timeframe}
                                onClick={() => setActiveTimeframeTabs(prev => ({ ...prev, [date]: timeframe }))}
                                className={cn(
                                  "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap",
                                  activeTimeframeTabs[date] === timeframe
                                    ? "bg-[#E51636] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                              >
                                {timeframe === 'morning' ? 'Morning' :
                                 timeframe === 'lunch' ? 'Lunch' :
                                 timeframe === 'afternoon' ? 'Afternoon' :
                                 timeframe === 'dinner' ? 'Dinner' :
                                 timeframe === 'closing' ? 'Closing' :
                                 timeframe === '30min' ? '30-Min' :
                                 timeframe === 'hourly' ? 'Hourly' : 
                                 getTimeframeLabel(timeframe)}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Group by category */}
                        <div className="space-y-6">
                          {Object.entries(
                            getTimeframeFilteredItems(completions, date).reduce<Record<string, DailyChecklistHistoryItem[]>>((acc, item) => {
                              if (!acc[item.category]) {
                                acc[item.category] = []
                              }
                              acc[item.category].push(item)
                              return acc
                            }, {})
                          ).map(([category, items]) => (
                            <div key={category} className="space-y-3">
                              <h4 className="text-md font-semibold text-[#27251F] border-b pb-2">
                                {getCategoryLabel(category)}
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {items.map(item => (
                                  <div 
                                    key={item.id} 
                                    className={cn(
                                      "rounded-lg p-4 hover:bg-opacity-80 transition-colors border",
                                      item.status === 'pass' && "bg-green-50 border-green-100",
                                      item.status === 'warning' && "bg-yellow-50 border-yellow-100",
                                      item.status === 'fail' && "bg-red-50 border-red-100"
                                    )}
                                  >
                                    <div className="flex flex-col h-full">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 flex-1">
                                          {getStatusIconSmall(item.status)}
                                          <span className="font-medium text-[#27251F] line-clamp-2">{item.itemName}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-full"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleViewCompletion(item)
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="space-y-2 text-sm text-[#27251F]/70">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 flex-shrink-0" />
                                          <div className="flex items-center gap-1">
                                            <span>{format(parseISO(item.completedAt), 'h:mm a')}</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                                              {getTimeframeLabel(item.timeframe)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 flex-shrink-0" />
                                          <span>{item.completedBy}</span>
                                        </div>
                                        {item.value !== undefined && (
                                          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200">
                                            <Thermometer className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <div className={cn(
                                              "font-medium text-[#27251F] px-2 py-1 rounded",
                                              typeof item.value === 'number' && "bg-blue-50 text-blue-800"
                                            )}>
                                              {formatValue(item.value)}
                                            </div>
                                          </div>
                                        )}
                                        {item.notes && (
                                          <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{item.notes}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Checklist Item Details</DialogTitle>
          </DialogHeader>
          
          {selectedCompletion && (
            <div className="space-y-5">
              <div className={cn(
                "space-y-2 p-4 rounded-lg",
                selectedCompletion.status === 'pass' && "bg-green-50",
                selectedCompletion.status === 'warning' && "bg-yellow-50",
                selectedCompletion.status === 'fail' && "bg-red-50"
              )}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedCompletion.status)}
                  <h3 className="text-lg font-semibold">{selectedCompletion.itemName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedCompletion.status === 'pass' ? 'default' : selectedCompletion.status === 'warning' ? 'secondary' : 'destructive'} className={cn(
                    selectedCompletion.status === 'pass' && "bg-green-100 text-green-800 hover:bg-green-100",
                    selectedCompletion.status === 'warning' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    selectedCompletion.status === 'fail' && "bg-red-100 text-red-800 hover:bg-red-100"
                  )}>
                    {selectedCompletion.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {getCategoryLabel(selectedCompletion.category)} • {getTimeframeLabel(selectedCompletion.timeframe)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed By</p>
                  <p className="font-medium">{selectedCompletion.completedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed At</p>
                  <p className="font-medium">{format(parseISO(selectedCompletion.completedAt), 'PPp')}</p>
                </div>
                
                {selectedCompletion.value !== undefined && (
                  <div className="col-span-2 border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-500">Value</p>
                    <p className="font-medium">{formatValue(selectedCompletion.value)}</p>
                  </div>
                )}
                
                {selectedCompletion.notes && (
                  <div className="col-span-2 border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{selectedCompletion.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 