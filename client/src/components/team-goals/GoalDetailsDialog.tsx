'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const metricEntrySchema = z.object({
  date: z.string(),
  values: z.record(z.number())
})

interface GoalDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: {
    id: string
    title: string
    category: string
    description: string
    shift: string
    metrics: Array<{
      id: string
      label: string
      current: number
      target: number
      trend: number[]
    }>
    assignees: string[]
    dueDate: string
  }
}

export function GoalDetailsDialog({ open, onOpenChange, goal }: GoalDetailsDialogProps) {
  const [view, setView] = React.useState<'day' | 'month'>('day')
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])

  const form = useForm<z.infer<typeof metricEntrySchema>>({
    resolver: zodResolver(metricEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      values: Object.fromEntries(goal.metrics.map(m => [m.id, 0]))
    }
  })

  const onSubmit = (values: z.infer<typeof metricEntrySchema>) => {
    console.log(values)
    // TODO: Add metric entry to database
    form.reset()
  }

  // Mock data - replace with real data from database
  const chartData = [
    { date: '2024-03-01', value: 150 },
    { date: '2024-03-02', value: 180 },
    { date: '2024-03-03', value: 200 },
    { date: '2024-03-04', value: 190 },
    { date: '2024-03-05', value: 210 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] flex flex-col bg-white dark:bg-gray-950 shadow-xl">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-[#E51636]">
          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            {goal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Goal Info */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-[#002D72]/20 bg-[#002D72]/5">
                <h3 className="text-lg font-semibold text-[#002D72] mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[#002D72]/80">{goal.description}</p>
                  <div className="flex items-center gap-2 text-[#002D72]/60">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {format(new Date(goal.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#002D72]/60">
                    <Users className="h-4 w-4" />
                    <span>{goal.assignees.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-[#002D72]/20">
                <h3 className="text-lg font-semibold text-[#002D72] mb-4">Current Metrics</h3>
                <div className="space-y-3">
                  {goal.metrics.map((metric) => (
                    <div key={metric.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#002D72]/80">{metric.label}</span>
                        <span className="font-medium text-[#002D72]">
                          {metric.current} / {metric.target}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#002D72]/10">
                        <div
                          className="h-full rounded-full bg-[#E51636]"
                          style={{
                            width: `${Math.min(100, (metric.current / metric.target) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Data Entry and Charts */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="entry" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="entry">Add New Entry</TabsTrigger>
                  <TabsTrigger value="history">View History</TabsTrigger>
                </TabsList>

                <TabsContent value="entry" className="mt-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-[#002D72]">Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="date" 
                                  className="pl-10 border-[#002D72]/20 focus:ring-[#E51636]/20" 
                                  {...field} 
                                />
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-[#002D72]/60" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-[#E51636]" />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        {goal.metrics.map((metric) => (
                          <FormField
                            key={metric.id}
                            control={form.control}
                            name={`values.${metric.id}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-[#002D72]">
                                  {metric.label}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="Enter value"
                                    className="border-[#002D72]/20 focus:ring-[#E51636]/20"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage className="text-[#E51636]" />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                      >
                        Save Entry
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          className={cn(
                            'border-[#002D72]/20 text-[#002D72]',
                            view === 'day' && 'bg-[#002D72]/10'
                          )}
                          onClick={() => setView('day')}
                        >
                          Daily
                        </Button>
                        <Button
                          variant="outline"
                          className={cn(
                            'border-[#002D72]/20 text-[#002D72]',
                            view === 'month' && 'bg-[#002D72]/10'
                          )}
                          onClick={() => setView('month')}
                        >
                          Monthly
                        </Button>
                      </div>
                      <Input
                        type={view === 'day' ? 'date' : 'month'}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40 border-[#002D72]/20 focus:ring-[#E51636]/20"
                      />
                    </div>

                    <div className="h-[300px] border border-[#002D72]/20 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#002D72" opacity={0.1} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#002D72" 
                            opacity={0.6}
                            tickFormatter={(value) => format(new Date(value), 'MMM d')}
                          />
                          <YAxis stroke="#002D72" opacity={0.6} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#E51636" 
                            strokeWidth={2}
                            dot={{ fill: '#E51636' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 