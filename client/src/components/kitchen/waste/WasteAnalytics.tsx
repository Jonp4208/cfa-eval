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
import { format, startOfMonth, endOfMonth, subMonths, subDays, parseISO, getDay, isSameDay } from 'date-fns'
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
  const { entries, fetchWasteEntries, metrics, fetchWasteMetrics } = useWasteStore()

  useEffect(() => {
    // Get current date and set to start of day to ensure consistent date handling
    const now = new Date()
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    let startDate: Date

    // Calculate start date based on time range
    switch (timeRange) {
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

    // Format dates for API
    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

    console.log('Fetching waste data:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      timeRange
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
  }, [timeRange, fetchWasteEntries, fetchWasteMetrics])

  const {
    dailyChartData,
    dayOfWeekChartData,
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
      mealPeriodChartData,
      topWastedItems,
      summaryMetrics
    }
  }, [entries])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-[20px] p-3 sm:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300">
        <div className="text-center md:text-left w-full">
          <h2 className="text-xl sm:text-[28px] font-bold text-[#27251F]">Waste Analytics</h2>
          <p className="text-[#27251F]/60 text-sm sm:text-base mt-0.5 sm:mt-1">Track and analyze kitchen waste data</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full md:w-[140px] h-9 sm:h-[40px] bg-white border-2 border-gray-200 rounded-[32px] px-3 sm:px-4 text-xs sm:text-[14px] font-medium text-[#27251F] hover:border-gray-300 focus:border-[#E51636] focus:ring-0 transition-colors">
            <SelectValue placeholder="Last 30 Days" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg min-w-[140px]">
            <SelectItem value="last30" className="text-xs sm:text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last 30 Days</SelectItem>
            <SelectItem value="last90" className="text-xs sm:text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last 90 Days</SelectItem>
            <SelectItem value="lastMonth" className="text-xs sm:text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="p-1.5 sm:p-2 bg-[#E51636]/10 rounded-full">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-[#E51636]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Today's Waste</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 text-[#27251F]">{formatCurrency(summaryMetrics.todayTotal)}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {summaryMetrics.trend > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        <span className="text-[10px] sm:text-xs text-red-600">+{Math.abs(Math.round(summaryMetrics.trend))}%</span>
                      </>
                    ) : summaryMetrics.trend < 0 ? (
                      <>
                        <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-[10px] sm:text-xs text-green-600">-{Math.abs(Math.round(summaryMetrics.trend))}%</span>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-[#27251F]/60">No change</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-full">
                  <Package2 className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Total Items</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 text-[#27251F]">{summaryMetrics.totalItems}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-0.5">Wasted items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Yesterday</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 text-[#27251F]">{formatCurrency(summaryMetrics.yesterdayTotal)}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-0.5">Total waste</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Average Cost</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 text-[#27251F]">{formatCurrency(summaryMetrics.avgCostPerItem)}</h3>
                  <p className="text-[10px] sm:text-xs text-[#27251F]/60 mt-0.5">Per item</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-3 sm:space-y-4">
        <div className="bg-white rounded-[32px] p-1.5 hover:shadow-sm transition-all duration-300 overflow-x-auto hide-scrollbar">
          <TabsList className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 bg-transparent min-w-[500px]">
            <TabsTrigger
              value="overview"
              className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-medium text-center data-[state=active]:bg-[#E51636]/5 data-[state=active]:text-[#E51636] data-[state=active]:border data-[state=active]:border-[#E51636]/20 text-[#27251F]/60 hover:bg-gray-50 transition-all relative after:absolute after:inset-0 after:rounded-[24px] after:border after:border-transparent data-[state=active]:after:border-[#E51636]/20"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="dayOfWeek"
              className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-medium text-center data-[state=active]:bg-[#E51636]/5 data-[state=active]:text-[#E51636] data-[state=active]:border data-[state=active]:border-[#E51636]/20 text-[#27251F]/60 hover:bg-gray-50 transition-all relative after:absolute after:inset-0 after:rounded-[24px] after:border after:border-transparent data-[state=active]:after:border-[#E51636]/20"
            >
              By Day
            </TabsTrigger>
            <TabsTrigger
              value="mealPeriod"
              className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-medium text-center data-[state=active]:bg-[#E51636]/5 data-[state=active]:text-[#E51636] data-[state=active]:border data-[state=active]:border-[#E51636]/20 text-[#27251F]/60 hover:bg-gray-50 transition-all relative after:absolute after:inset-0 after:rounded-[24px] after:border after:border-transparent data-[state=active]:after:border-[#E51636]/20"
            >
              By Meal
            </TabsTrigger>
            <TabsTrigger
              value="topItems"
              className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-[24px] text-xs sm:text-sm font-medium text-center data-[state=active]:bg-[#E51636]/5 data-[state=active]:text-[#E51636] data-[state=active]:border data-[state=active]:border-[#E51636]/20 text-[#27251F]/60 hover:bg-gray-50 transition-all relative after:absolute after:inset-0 after:rounded-[24px] after:border after:border-transparent data-[state=active]:after:border-[#E51636]/20"
            >
              Top Items
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-3 sm:p-6 pb-0">
                <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Daily Waste Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
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

            <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-3 sm:p-6 pb-0">
                <CardTitle className="text-base sm:text-xl font-bold text-[#27251F]">Top Wasted Items</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3">
                  {topWastedItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#27251F] line-clamp-1">{item.name}</p>
                          <p className="text-[10px] sm:text-xs text-[#27251F]/60">{item.count} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium text-[#27251F]">{formatCurrency(item.totalCost)}</p>
                        <p className="text-[10px] sm:text-xs text-[#27251F]/60">
                          {Math.round((item.totalCost / entries.reduce((sum, entry) => sum + entry.cost, 0)) * 100)}%
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