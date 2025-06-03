'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, startOfMonth, endOfMonth, subMonths, subDays, parseISO, getDay, isSameDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import useWasteStore from '@/stores/useWasteStore'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ArrowDown, ArrowUp, DollarSign, Package2, Clock, TrendingUp } from 'lucide-react'

const MEAL_PERIODS = {
  BREAKFAST: [4, 5, 6, 7, 8, 9, 10], // 4 AM to 10:59 AM
  LUNCH: [11, 12, 13, 14, 15], // 11 AM to 3:59 PM
  DINNER: [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3] // 4 PM to 3:59 AM
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const COLORS = ['#E51636', '#27251F', '#FDB022', '#16A34A', '#2563EB', '#9333EA']

function getMealPeriod(date: Date) {
  const hour = date.getHours()
  if (MEAL_PERIODS.BREAKFAST.includes(hour)) return 'Breakfast'
  if (MEAL_PERIODS.LUNCH.includes(hour)) return 'Lunch'
  return 'Dinner'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export default function WasteAnalytics() {
  const [timeRange, setTimeRange] = useState('last30')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { entries, fetchWasteEntries, metrics, fetchWasteMetrics } = useWasteStore()

  useEffect(() => {
    let startDate: Date
    let endDate: Date

    // If a specific date is selected, use that date
    if (selectedDate && timeRange === 'specificDate') {
      startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Get current date and set to start of day to ensure consistent date handling
      const now = new Date()
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      // Calculate start date based on time range
      switch (timeRange) {
        case 'today':
          // Today only
          startDate = new Date(endDate)
          break
        case 'yesterday':
          // Yesterday only
          const yesterday = new Date(now)
          yesterday.setDate(now.getDate() - 1)
          startDate = new Date(yesterday)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(yesterday)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'last30':
          // Go back 30 days from current date
          startDate = new Date(endDate)
          startDate.setDate(endDate.getDate() - 30)
          break
        case 'last90':
          // Go back 90 days from current date
          startDate = new Date(endDate)
          startDate.setDate(endDate.getDate() - 90)
          break
        case 'lastMonth':
          // Get first day of previous month
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
          // Set end date to last day of previous month
          endDate.setDate(0) // This sets to last day of previous month
          break
        default:
          // Default to last 30 days
          startDate = new Date(endDate)
          startDate.setDate(endDate.getDate() - 30)
      }

      // Set start date to beginning of day
      startDate.setHours(0, 0, 0, 0)
    }

    // Format dates for API
    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

    console.log('Fetching waste data:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      timeRange,
      selectedDate
    })

    // Fetch data
    fetchWasteEntries({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    })

    fetchWasteMetrics({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    })
  }, [timeRange, selectedDate, fetchWasteEntries, fetchWasteMetrics])

  const {
    dailyChartData,
    dayOfWeekChartData,
    hourOfDayChartData,
    mealPeriodChartData,
    topWastedItems,
    summaryMetrics
  } = useMemo(() => {
    // Process data for daily chart
    const dailyData = entries.reduce((acc, entry) => {
      const date = format(parseISO(entry.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, totalCost: 0, count: 0 }
      }
      acc[date].totalCost += entry.cost
      acc[date].count += 1
      return acc
    }, {} as Record<string, { date: string; totalCost: number; count: number }>)

    const dailyChartData = Object.values(dailyData).sort((a, b) =>
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    )

    // Process data for day of week analysis
    const dayOfWeekData = entries.reduce((acc, entry) => {
      const dayOfWeek = DAYS_OF_WEEK[getDay(parseISO(entry.date))]
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { day: dayOfWeek, totalCost: 0, count: 0 }
      }
      acc[dayOfWeek].totalCost += entry.cost
      acc[dayOfWeek].count += 1
      return acc
    }, {} as Record<string, { day: string; totalCost: number; count: number }>)

    const dayOfWeekChartData = DAYS_OF_WEEK.map(day => ({
      day,
      ...dayOfWeekData[day] || { totalCost: 0, count: 0 }
    }))

    // Process data for meal period analysis
    const mealPeriodData = entries.reduce((acc, entry) => {
      const mealPeriod = getMealPeriod(parseISO(entry.date))
      if (!acc[mealPeriod]) {
        acc[mealPeriod] = { period: mealPeriod, totalCost: 0, count: 0 }
      }
      acc[mealPeriod].totalCost += entry.cost
      acc[mealPeriod].count += 1
      return acc
    }, {} as Record<string, { period: string; totalCost: number; count: number }>)

    const mealPeriodChartData = ['Breakfast', 'Lunch', 'Dinner'].map(period => ({
      period,
      ...mealPeriodData[period] || { totalCost: 0, count: 0 }
    }))

    // Process data for hour of day analysis
    const hourOfDayData = entries.reduce((acc, entry) => {
      const entryDate = parseISO(entry.date)
      const hour = entryDate.getHours()
      const hourLabel = format(entryDate, 'h a') // Format as "1 AM", "2 PM", etc.

      if (!acc[hour]) {
        acc[hour] = { hour, hourLabel, totalCost: 0, count: 0 }
      }
      acc[hour].totalCost += entry.cost
      acc[hour].count += 1
      return acc
    }, {} as Record<number, { hour: number; hourLabel: string; totalCost: number; count: number }>)

    // Create array with all 24 hours, sorted by hour
    const hourOfDayChartData = Array.from({ length: 24 }, (_, i) => {
      const date = new Date()
      date.setHours(i, 0, 0, 0)
      const hourLabel = format(date, 'h a')
      return hourOfDayData[i] || { hour: i, hourLabel, totalCost: 0, count: 0 }
    })

    // Calculate top wasted items
    const itemData = entries.reduce((acc, entry) => {
      if (!acc[entry.itemName]) {
        acc[entry.itemName] = { name: entry.itemName, totalCost: 0, count: 0 }
      }
      acc[entry.itemName].totalCost += entry.cost
      acc[entry.itemName].count += 1
      return acc
    }, {} as Record<string, { name: string; totalCost: number; count: number }>)

    const topWastedItems = Object.values(itemData)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)

    // Calculate summary metrics
    const today = new Date()
    const todayEntries = entries.filter(entry =>
      isSameDay(parseISO(entry.date), today)
    )
    const yesterdayEntries = entries.filter(entry =>
      isSameDay(parseISO(entry.date), subDays(today, 1))
    )

    const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.cost, 0)
    const yesterdayTotal = yesterdayEntries.reduce((sum, entry) => sum + entry.cost, 0)
    const totalItems = entries.length
    const avgCostPerItem = totalItems > 0
      ? entries.reduce((sum, entry) => sum + entry.cost, 0) / totalItems
      : 0

    const summaryMetrics = {
      todayTotal,
      yesterdayTotal,
      totalItems,
      avgCostPerItem,
      trend: calculateTrend(todayTotal, yesterdayTotal)
    }

    return {
      dailyChartData,
      dayOfWeekChartData,
      hourOfDayChartData,
      mealPeriodChartData,
      topWastedItems,
      summaryMetrics
    }
  }, [entries])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-red-50 via-red-100/80 to-pink-100/60 rounded-[20px] hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group border border-red-200/50 relative backdrop-blur-sm hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10 opacity-40"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500/30 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-red-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/70 font-medium line-clamp-1">Today's Waste</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#27251F] group-hover:text-red-700 transition-colors duration-300">{formatCurrency(summaryMetrics.todayTotal)}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {summaryMetrics.trend > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        <span className="text-[10px] sm:text-xs text-red-600 font-medium">+{Math.abs(Math.round(summaryMetrics.trend))}%</span>
                      </>
                    ) : summaryMetrics.trend < 0 ? (
                      <>
                        <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-[10px] sm:text-xs text-green-600 font-medium">-{Math.abs(Math.round(summaryMetrics.trend))}%</span>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-[#27251F]/60 font-medium">No change</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 via-orange-100/80 to-amber-100/60 rounded-[20px] hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group border border-orange-200/50 relative backdrop-blur-sm hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-40"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500/30 to-amber-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/70 font-medium line-clamp-1">Total Items</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#27251F] group-hover:text-orange-700 transition-colors duration-300">{summaryMetrics.totalItems}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-1 font-medium">Wasted items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 via-blue-100/80 to-sky-100/60 rounded-[20px] hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group border border-blue-200/50 relative backdrop-blur-sm hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-sky-500/10 opacity-40"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/30 to-sky-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/70 font-medium line-clamp-1">Yesterday</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#27251F] group-hover:text-blue-700 transition-colors duration-300">{formatCurrency(summaryMetrics.yesterdayTotal)}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-1 font-medium">Total waste</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 via-green-100/80 to-emerald-100/60 rounded-[20px] hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group border border-green-200/50 relative backdrop-blur-sm hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-40"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/70 font-medium line-clamp-1">Average Cost</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#27251F] group-hover:text-green-700 transition-colors duration-300">{formatCurrency(summaryMetrics.avgCostPerItem)}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-1 font-medium">Per item</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-[24px] p-4 sm:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-40"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-3 overflow-x-auto hide-scrollbar flex-grow relative">
            <TabsList className="w-full grid grid-cols-5 gap-2 sm:gap-3 bg-transparent min-w-[600px] h-auto p-0">
            <TabsTrigger
              value="overview"
              className="py-2 sm:py-3 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-semibold text-center flex items-center justify-center data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/10 data-[state=active]:to-amber-500/5 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-300/50 text-[#27251F]/60 hover:bg-white/80 hover:text-[#27251F] transition-all duration-300 relative shadow-sm data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="dayOfWeek"
              className="py-2 sm:py-3 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-semibold text-center flex items-center justify-center data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/10 data-[state=active]:to-amber-500/5 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-300/50 text-[#27251F]/60 hover:bg-white/80 hover:text-[#27251F] transition-all duration-300 relative shadow-sm data-[state=active]:shadow-md"
            >
              By Day
            </TabsTrigger>
            <TabsTrigger
              value="mealPeriod"
              className="py-2 sm:py-3 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-semibold text-center flex items-center justify-center data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/10 data-[state=active]:to-amber-500/5 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-300/50 text-[#27251F]/60 hover:bg-white/80 hover:text-[#27251F] transition-all duration-300 relative shadow-sm data-[state=active]:shadow-md"
            >
              By Meal
            </TabsTrigger>
            <TabsTrigger
              value="hourOfDay"
              className="py-2 sm:py-3 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-semibold text-center flex items-center justify-center data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/10 data-[state=active]:to-amber-500/5 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-300/50 text-[#27251F]/60 hover:bg-white/80 hover:text-[#27251F] transition-all duration-300 relative shadow-sm data-[state=active]:shadow-md"
            >
              By Hour
            </TabsTrigger>
            <TabsTrigger
              value="topItems"
              className="py-2 sm:py-3 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-semibold text-center flex items-center justify-center data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/10 data-[state=active]:to-amber-500/5 data-[state=active]:text-orange-700 data-[state=active]:border data-[state=active]:border-orange-300/50 text-[#27251F]/60 hover:bg-white/80 hover:text-[#27251F] transition-all duration-300 relative shadow-sm data-[state=active]:shadow-md"
            >
              Top Items
            </TabsTrigger>
          </TabsList>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
            <Select value={timeRange} onValueChange={(value) => {
              setTimeRange(value)
              if (value !== 'specificDate') {
                setSelectedDate(undefined)
              }
            }}>
              <SelectTrigger className="w-full md:w-[160px] h-10 sm:h-[44px] bg-white/90 backdrop-blur-sm border-2 border-orange-200/50 rounded-[32px] px-4 sm:px-5 text-xs sm:text-[14px] font-semibold text-[#27251F] hover:border-orange-300/70 hover:bg-white focus:border-orange-500/50 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-orange-200/50 rounded-2xl shadow-xl min-w-[160px]">
                <SelectItem value="today" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Today</SelectItem>
                <SelectItem value="yesterday" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Yesterday</SelectItem>
                <SelectItem value="last30" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Last 30 Days</SelectItem>
                <SelectItem value="last90" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Last 90 Days</SelectItem>
                <SelectItem value="lastMonth" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Last Month</SelectItem>
                <SelectItem value="specificDate" className="text-xs sm:text-[14px] font-semibold text-[#27251F] focus:bg-orange-500/10 focus:text-orange-700 rounded-lg m-1">Specific Date</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === 'specificDate' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[200px] h-10 sm:h-[44px] bg-white/90 backdrop-blur-sm border-2 border-orange-200/50 rounded-[32px] px-4 sm:px-5 text-xs sm:text-[14px] font-semibold text-[#27251F] hover:border-orange-300/70 hover:bg-white focus:border-orange-500/50 focus:ring-0 transition-all duration-300 justify-start text-left shadow-sm hover:shadow-md",
                      !selectedDate && "text-[#27251F]/60"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-orange-600" />
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-2 border-orange-200/50 rounded-2xl shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      if (date) {
                        setTimeRange('specificDate')
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-sky-50/20 rounded-[24px] hover:shadow-xl transition-all duration-500 border border-blue-200/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-sky-500/5 opacity-40"></div>
              <CardHeader className="p-4 sm:p-6 pb-2 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-sky-500/10 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-blue-700" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-[#27251F] group-hover:text-blue-700 transition-colors duration-300">Daily Waste Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 relative">
                <div className="h-[200px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                        tick={{ fontSize: 12 }}
                        stroke="#27251F"
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fontSize: 12 }}
                        stroke="#27251F"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`$${value}`, 'Total Cost']}
                        labelFormatter={(date) => format(parseISO(date as string), 'MMM d, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalCost"
                        stroke="#E51636"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#E51636' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 rounded-[24px] hover:shadow-xl transition-all duration-500 border border-purple-200/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-40"></div>
              <CardHeader className="p-4 sm:p-6 pb-2 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-violet-500/10 rounded-xl">
                    <Package2 className="h-5 w-5 text-purple-700" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-[#27251F] group-hover:text-purple-700 transition-colors duration-300">Top Wasted Items</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 relative">
                <div className="space-y-4">
                  {topWastedItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-[#27251F] line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">{item.name}</p>
                          <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">{item.count} items wasted</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-[#27251F] group-hover:text-purple-700 transition-colors duration-300">{formatCurrency(item.totalCost)}</p>
                        <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">
                          {Math.round((item.totalCost / entries.reduce((sum, entry) => sum + entry.cost, 0)) * 100)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dayOfWeek">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <CardHeader className="p-3 sm:p-6 pb-0">
              <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Waste by Day of Week</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      stroke="#27251F"
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 12 }}
                      stroke="#27251F"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`$${value}`, 'Total Cost']}
                    />
                    <Bar dataKey="totalCost" fill="#E51636" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 mt-4">
                {dayOfWeekChartData.map((data) => (
                  <div key={data.day} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-[#27251F]">{data.day}</p>
                    <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-0.5">{data.count} items</p>
                    <p className="text-xs sm:text-sm font-medium text-[#27251F] mt-1">{formatCurrency(data.totalCost)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mealPeriod">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-3 sm:p-6 pb-0">
                <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Waste by Meal Period</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="h-[200px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealPeriodChartData}
                        dataKey="totalCost"
                        nameKey="period"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {mealPeriodChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`$${value}`, 'Total Cost']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconSize={8}
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-xs sm:text-sm text-[#27251F]">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-3 sm:p-6 pb-0">
                <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Meal Period Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3">
                  {mealPeriodChartData.map((data, index) => (
                    <div key={data.period} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#27251F]">{data.period}</p>
                          <p className="text-[10px] sm:text-xs text-[#27251F]/60">{data.count} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium text-[#27251F]">{formatCurrency(data.totalCost)}</p>
                        <p className="text-[10px] sm:text-xs text-[#27251F]/60">
                          {Math.round((data.totalCost / entries.reduce((sum, entry) => sum + entry.cost, 0)) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourOfDay">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <CardHeader className="p-3 sm:p-6 pb-0">
              <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Waste by Hour of Day</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourOfDayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="hourLabel"
                      tick={{ fontSize: 12 }}
                      stroke="#27251F"
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 12 }}
                      stroke="#27251F"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`$${value}`, 'Total Cost']}
                    />
                    <Bar dataKey="totalCost" fill="#E51636" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4">
                {hourOfDayChartData
                  .filter(data => data.count > 0) // Only show hours with waste
                  .sort((a, b) => b.totalCost - a.totalCost) // Sort by highest cost first
                  .slice(0, 12) // Show top 12 hours
                  .map((data) => (
                    <div key={data.hour} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-[#27251F]">{data.hourLabel}</p>
                      <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-0.5">{data.count} items</p>
                      <p className="text-xs sm:text-sm font-medium text-[#27251F] mt-1">{formatCurrency(data.totalCost)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topItems">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <CardHeader className="p-3 sm:p-6 pb-0">
              <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Top Wasted Items</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topWastedItems.map((item, index) => (
                  <div key={item.name} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <p className="text-xs sm:text-sm font-medium text-[#27251F] line-clamp-1">{item.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#27251F]/60">Total Cost</p>
                        <p className="text-sm sm:text-base font-medium text-[#27251F]">{formatCurrency(item.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#27251F]/60">Items Wasted</p>
                        <p className="text-sm sm:text-base font-medium text-[#27251F]">{item.count} items</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#27251F]/60">Average Cost</p>
                        <p className="text-sm sm:text-base font-medium text-[#27251F]">{formatCurrency(item.totalCost / item.count)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .recharts-text {
          fill: #27251F;
          font-size: 12px;
        }
        .recharts-legend-item-text {
          color: #27251F !important;
        }
        .recharts-cartesian-axis-line {
          stroke: #E5E7EB;
        }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: #E5E7EB;
        }
        .recharts-tooltip-wrapper {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}