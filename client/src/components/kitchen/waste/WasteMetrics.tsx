'use client'

import { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import useWasteStore from '@/stores/useWasteStore'
import { format } from 'date-fns'

interface WasteMetricsProps {
  dateRange: DateRange | undefined
}

const categoryColors = {
  food: '#ef4444',
  packaging: '#3b82f6',
  other: '#a855f7'
}

export default function WasteMetrics({ dateRange }: WasteMetricsProps) {
  const { metrics } = useWasteStore()

  if (!metrics || !dateRange?.from || !dateRange?.to) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          Select a date range to view waste metrics
        </p>
      </div>
    )
  }

  // Prepare data for the chart
  const allDates = new Set<string>()
  const categoryData: Record<string, Record<string, number>> = {}

  metrics.categoryBreakdown.forEach((category) => {
    categoryData[category._id] = {}
    category.dailyBreakdown.forEach((day) => {
      allDates.add(day.date)
      categoryData[category._id][day.date] = day.cost
    })
  })

  const chartData = Array.from(allDates)
    .sort()
    .map((date) => ({
      date: format(new Date(date), 'MMM d'),
      ...Object.keys(categoryData).reduce(
        (acc, category) => ({
          ...acc,
          [category]: categoryData[category][date] || 0
        }),
        {}
      )
    }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(metrics.dateRange.start), 'MMM d')} -{' '}
              {format(new Date(metrics.dateRange.end), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        {metrics.categoryBreakdown.map((category) => (
          <Card key={category._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {category._id} Waste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${category.totalCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((category.totalCost / metrics.totalCost) * 100).toFixed(1)}% of
                total waste
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Waste Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Legend />
                {metrics.categoryBreakdown.map((category) => (
                  <Bar
                    key={category._id}
                    dataKey={category._id}
                    name={category._id.charAt(0).toUpperCase() + category._id.slice(1)}
                    fill={categoryColors[category._id as keyof typeof categoryColors]}
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 