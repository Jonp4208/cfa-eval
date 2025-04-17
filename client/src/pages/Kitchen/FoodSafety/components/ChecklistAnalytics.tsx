import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  ThermometerSun,
  ThermometerSnowflake
} from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
import { FoodSafetyChecklist, FoodSafetyChecklistCompletion } from '@/types/kitchen'
import { cn } from "@/lib/utils"

interface AnalyticsData {
  completionRate: number
  averageScore: number
  totalCompletions: number
  criticalFailures: number
  commonIssues: Array<{
    itemName: string
    failureCount: number
    isCritical: boolean
  }>
  temperatureIssues: Array<{
    itemName: string
    averageTemp: number
    minTemp: number
    maxTemp: number
    failureCount: number
  }>
  topPerformers: Array<{
    name: string
    completions: number
    averageScore: number
  }>
  completionsByDay: Record<string, number>
  scoreHistory: Array<{
    date: string
    score: number
  }>
}

export default function ChecklistAnalytics() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<FoodSafetyChecklist | null>(null)
  const [completions, setCompletions] = useState<FoodSafetyChecklistCompletion[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (checklist && completions.length > 0) {
      calculateAnalytics()
    }
  }, [checklist, completions, dateRange])

  const loadData = async () => {
    try {
      if (!id) return
      const [checklistData, completionsData] = await Promise.all([
        kitchenService.getChecklist(id),
        kitchenService.getChecklistCompletions(id)
      ])
      setChecklist(checklistData)
      setCompletions(completionsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading checklist data:', error)
      enqueueSnackbar('Failed to load checklist data', { variant: 'error' })
      navigate('/kitchen/food-safety')
    }
  }

  const calculateAnalytics = () => {
    if (!checklist || completions.length === 0) return

    const now = new Date()
    const filteredCompletions = completions.filter(completion => {
      const completionDate = new Date(completion.completedAt)
      const diffTime = Math.abs(now.getTime() - completionDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return (
        dateRange === 'week' ? diffDays <= 7 :
        dateRange === 'month' ? diffDays <= 30 :
        diffDays <= 365
      )
    })

    if (filteredCompletions.length === 0) {
      setAnalytics(null)
      return
    }

    // Calculate completion rate
    const expectedCompletions = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365
    const completionRate = (filteredCompletions.length / expectedCompletions) * 100

    // Calculate average score
    const averageScore = filteredCompletions.reduce((acc, curr) => acc + curr.score, 0) / filteredCompletions.length

    // Count critical failures
    const criticalFailures = filteredCompletions.filter(completion =>
      completion.items.some(item => {
        const checklistItem = checklist.items.find(i => i._id === item.item)
        return checklistItem?.isCritical && item.status === 'fail'
      })
    ).length

    // Analyze common issues
    const issuesMap = new Map<string, { count: number; isCritical: boolean }>()
    filteredCompletions.forEach(completion => {
      completion.items.forEach(item => {
        if (item.status === 'fail') {
          const checklistItem = checklist.items.find(i => i._id === item.item)
          if (checklistItem) {
            const key = checklistItem.name
            const current = issuesMap.get(key) || { count: 0, isCritical: checklistItem.isCritical }
            issuesMap.set(key, { ...current, count: current.count + 1 })
          }
        }
      })
    })

    // Analyze temperature issues
    const tempIssuesMap = new Map<string, {
      temps: number[]
      minTemp: number
      maxTemp: number
      failures: number
    }>()
    filteredCompletions.forEach(completion => {
      completion.items.forEach(item => {
        const checklistItem = checklist.items.find(i => i._id === item.item)
        if (checklistItem?.type === 'temperature') {
          const key = checklistItem.name
          const current = tempIssuesMap.get(key) || {
            temps: [],
            minTemp: checklistItem.validation.minTemp,
            maxTemp: checklistItem.validation.maxTemp,
            failures: 0
          }
          if (typeof item.value === 'number') {
            current.temps.push(item.value)
          }
          if (item.status === 'fail') {
            current.failures++
          }
          tempIssuesMap.set(key, current)
        }
      })
    })

    // Calculate top performers
    const performersMap = new Map<string, { completions: number; totalScore: number }>()
    filteredCompletions.forEach(completion => {
      const name = typeof completion.completedBy === 'string'
        ? completion.completedBy
        : completion.completedBy.name
      const current = performersMap.get(name) || { completions: 0, totalScore: 0 }
      performersMap.set(name, {
        completions: current.completions + 1,
        totalScore: current.totalScore + completion.score
      })
    })

    // Calculate completions by day
    const completionsByDay: Record<string, number> = {}
    filteredCompletions.forEach(completion => {
      const day = new Date(completion.completedAt).toLocaleDateString('en-US', { weekday: 'long' })
      completionsByDay[day] = (completionsByDay[day] || 0) + 1
    })

    // Calculate score history
    const scoreHistory = filteredCompletions
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .map(completion => ({
        date: completion.completedAt,
        score: completion.score
      }))

    setAnalytics({
      completionRate,
      averageScore,
      totalCompletions: filteredCompletions.length,
      criticalFailures,
      commonIssues: Array.from(issuesMap.entries())
        .map(([name, data]) => ({
          itemName: name,
          failureCount: data.count,
          isCritical: data.isCritical
        }))
        .sort((a, b) => b.failureCount - a.failureCount)
        .slice(0, 5),
      temperatureIssues: Array.from(tempIssuesMap.entries())
        .map(([name, data]) => ({
          itemName: name,
          averageTemp: data.temps.reduce((a, b) => a + b, 0) / data.temps.length,
          minTemp: data.minTemp,
          maxTemp: data.maxTemp,
          failureCount: data.failures
        }))
        .sort((a, b) => b.failureCount - a.failureCount),
      topPerformers: Array.from(performersMap.entries())
        .map(([name, data]) => ({
          name,
          completions: data.completions,
          averageScore: data.totalScore / data.completions
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5),
      completionsByDay,
      scoreHistory
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!checklist || !analytics) return null

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/kitchen/food-safety')}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#27251F]">{checklist.name}</h1>
          <p className="text-[#27251F]/60 mt-1">Analytics & Insights</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map(range => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            onClick={() => setDateRange(range)}
            className={cn(
              "rounded-full capitalize",
              dateRange === range
                ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                : "hover:bg-[#E51636]/10 hover:text-[#E51636]"
            )}
          >
            Last {range}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Completion Rate</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                  {Math.round(analytics.completionRate)}%
                </h3>
                <p className="text-[#27251F]/60 text-sm mt-1">
                  {analytics.totalCompletions} completions
                </p>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 text-[#E51636] rounded-2xl flex items-center justify-center">
                <Clock strokeWidth={2} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Average Score</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                  {Math.round(analytics.averageScore)}%
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  {analytics.averageScore >= checklist.passingScore ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <p className={cn(
                    "text-sm",
                    analytics.averageScore >= checklist.passingScore
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                    vs {checklist.passingScore}% required
                  </p>
                </div>
              </div>
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center",
                analytics.averageScore >= checklist.passingScore
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              )}>
                {analytics.averageScore >= checklist.passingScore ? (
                  <CheckCircle2 strokeWidth={2} size={24} />
                ) : (
                  <XCircle strokeWidth={2} size={24} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Critical Failures</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                  {analytics.criticalFailures}
                </h3>
                <p className="text-[#27251F]/60 text-sm mt-1">
                  Need immediate attention
                </p>
              </div>
              <div className="h-14 w-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle strokeWidth={2} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Most Active Day</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                  {Object.entries(analytics.completionsByDay)
                    .sort((a, b) => b[1] - a[1])[0]?.[0]?.slice(0, 3) || 'N/A'}
                </h3>
                <p className="text-[#27251F]/60 text-sm mt-1">
                  {Math.max(...Object.values(analytics.completionsByDay))} completions
                </p>
              </div>
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Calendar strokeWidth={2} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Issues */}
      {analytics.commonIssues.length > 0 && (
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#27251F]">
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg",
                    issue.isCritical ? "bg-red-50" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[#27251F]">{issue.itemName}</h4>
                        {issue.isCritical && (
                          <Badge className="bg-red-100 text-red-600">Critical</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#27251F]/60">
                        Failed {issue.failureCount} time{issue.failureCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-[#27251F]">
                        {Math.round((issue.failureCount / analytics.totalCompletions) * 100)}%
                      </div>
                      <div className="text-sm text-[#27251F]/60">failure rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Temperature Issues */}
      {analytics.temperatureIssues.length > 0 && (
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#27251F]">
              Temperature Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.temperatureIssues.map((issue, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-[#27251F]">{issue.itemName}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <ThermometerSun className="h-4 w-4 text-red-600" />
                        <span className="text-[#27251F]/60">Max: {issue.maxTemp}°F</span>
                        <ThermometerSnowflake className="h-4 w-4 text-blue-600 ml-2" />
                        <span className="text-[#27251F]/60">Min: {issue.minTemp}°F</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-[#27251F]">
                        {Math.round(issue.averageTemp)}°F
                      </div>
                      <div className="text-sm text-[#27251F]/60">average temp</div>
                    </div>
                  </div>
                  {issue.failureCount > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      {issue.failureCount} temperature violation{issue.failureCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {analytics.topPerformers.length > 0 && (
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#27251F]">
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformers.map((performer, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#E51636]" />
                        <h4 className="font-medium text-[#27251F]">{performer.name}</h4>
                      </div>
                      <p className="text-sm text-[#27251F]/60">
                        {performer.completions} completion{performer.completions !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-[#27251F]">
                        {Math.round(performer.averageScore)}%
                      </div>
                      <div className="text-sm text-[#27251F]/60">average score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}