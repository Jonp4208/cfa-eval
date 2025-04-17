'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Filter, Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { TeamGoalCard } from './TeamGoalCard'
import { CreateGoalDialog } from './CreateGoalDialog'
import { getGoals } from '../../services/goalService'
import { Goal } from '../../types/goals'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

export function TeamGoalsView() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [metrics, setMetrics] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    notStarted: 0,
    frontCounter: 0,
    driveThru: 0,
    kitchen: 0
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setIsLoading(true)
      const data = await getGoals()
      const goalsData = Array.isArray(data) ? data : []
      setGoals(goalsData)

      // Calculate metrics
      const total = goalsData.length
      const inProgress = goalsData.filter(goal => goal.status === 'in-progress').length
      const completed = goalsData.filter(goal => goal.status === 'completed').length
      const overdue = goalsData.filter(goal => goal.status === 'overdue').length
      const notStarted = goalsData.filter(goal => goal.status === 'not-started').length
      const frontCounter = goalsData.filter(goal => goal.businessArea === 'Front Counter').length
      const driveThru = goalsData.filter(goal => goal.businessArea === 'Drive Thru').length
      const kitchen = goalsData.filter(goal => goal.businessArea === 'Kitchen').length

      setMetrics({
        total,
        inProgress,
        completed,
        overdue,
        notStarted,
        frontCounter,
        driveThru,
        kitchen
      })
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch goals',
        variant: 'destructive',
      })
      setGoals([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGoals = goals.filter(goal => {
    // Filter by business area
    if (selectedArea !== 'all' && goal.businessArea !== selectedArea) {
      return false
    }

    // Filter by status
    if (selectedStatus === 'all') {
      return true
    } else if (selectedStatus === 'active') {
      return goal.status === 'in-progress' || goal.status === 'not-started'
    } else if (selectedStatus === 'completed') {
      return goal.status === 'completed'
    } else if (selectedStatus === 'overdue') {
      return goal.status === 'overdue'
    } else {
      return goal.status === selectedStatus
    }
  })

  const handleGoalCreated = (newGoal: Goal) => {
    setGoals(prevGoals => [newGoal, ...prevGoals])
    setIsCreateDialogOpen(false)
    toast({
      title: 'Success',
      description: 'Goal created successfully',
    })
  }

  const calculateCompletionRate = () => {
    if (metrics.total === 0) return 0
    return Math.round((metrics.completed / metrics.total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-[#27251F]/60">Total Goals</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#27251F]">{metrics.total}</p>
              </div>
              <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 bg-[#E51636]/10 text-[#E51636] rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-[#27251F]/60">In Progress</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#004F71]">{metrics.inProgress}</p>
              </div>
              <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 bg-[#004F71]/10 text-[#004F71] rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-[#27251F]/60">Completed</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#DD1A21]">{metrics.completed}</p>
              </div>
              <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 bg-[#DD1A21]/10 text-[#DD1A21] rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs xs:text-sm font-medium text-[#27251F]/60">Completion Rate</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#27251F]">{calculateCompletionRate()}%</p>
              </div>
              <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 bg-[#58595B]/10 text-[#58595B] rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Area Distribution */}
      <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-3 xs:p-4 sm:p-6 pb-2">
          <CardTitle className="text-lg font-semibold text-[#27251F]">Goals by Business Area</CardTitle>
          <CardDescription className="text-[#27251F]/60">Distribution of goals across different areas</CardDescription>
        </CardHeader>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#27251F]">Front Counter</span>
                <span className="text-[#E51636]">{metrics.frontCounter} goals</span>
              </div>
              <Progress value={(metrics.frontCounter / Math.max(metrics.total, 1)) * 100} className="h-2 [&>div]:bg-[#E51636] bg-[#E51636]/10" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#27251F]">Drive Thru</span>
                <span className="text-[#004F71]">{metrics.driveThru} goals</span>
              </div>
              <Progress value={(metrics.driveThru / Math.max(metrics.total, 1)) * 100} className="h-2 [&>div]:bg-[#004F71] bg-[#004F71]/10" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#27251F]">Kitchen</span>
                <span className="text-[#DD1A21]">{metrics.kitchen} goals</span>
              </div>
              <Progress value={(metrics.kitchen / Math.max(metrics.total, 1)) * 100} className="h-2 [&>div]:bg-[#DD1A21] bg-[#DD1A21]/10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtering and Goals List */}
      <Card className="bg-white rounded-[20px] border-none shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-3 xs:p-4 sm:p-6 pb-2">
          <CardTitle className="text-lg font-semibold text-[#27251F]">Goal Management</CardTitle>
          <CardDescription className="text-[#27251F]/60">Create, track, and manage your store's operational goals</CardDescription>
        </CardHeader>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6">
              <TabsList className="bg-[#F8F8F8] rounded-full border border-[#E51636]/10 p-1 w-full sm:w-auto overflow-x-auto">
                <TabsTrigger
                  value="all"
                  className="rounded-full data-[state=active]:bg-[#E51636] data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setSelectedStatus('all')}
                >
                  All Goals
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="rounded-full data-[state=active]:bg-[#E51636] data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setSelectedStatus('active')}
                >
                  Active Goals
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="rounded-full data-[state=active]:bg-[#E51636] data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setSelectedStatus('completed')}
                >
                  Completed
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#E51636] text-white hover:bg-[#E51636]/90 font-semibold px-4 sm:px-6 w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Goal
              </Button>
            </div>

            <div className="flex items-center mb-6">
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-full sm:w-[180px] border-[#E51636]/20 focus:ring-[#E51636]">
                  <Filter className="mr-2 h-4 w-4 text-[#E51636]" />
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="Front Counter">Front Counter</SelectItem>
                  <SelectItem value="Drive Thru">Drive Thru</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-3 flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
                </div>
              ) : goals.length === 0 ? (
                <Card className="p-6 col-span-3 border border-dashed border-gray-200">
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-500 mb-2">No goals found</p>
                    <p className="text-gray-400 mb-6">Get started by creating your first goal</p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-[#E51636] text-white hover:bg-[#E51636]/90 font-semibold px-6"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add New Goal
                    </Button>
                  </div>
                </Card>
              ) : filteredGoals.length === 0 ? (
                <Card className="p-6 col-span-3 border border-dashed border-gray-200">
                  <p className="text-center text-gray-500 py-8">No goals match your current filters.</p>
                </Card>
              ) : (
                filteredGoals.map((goal) => (
                  <TeamGoalCard
                    key={goal._id}
                    goal={goal}
                    onUpdate={fetchGoals}
                  />
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <CreateGoalDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGoalCreated={handleGoalCreated}
      />
    </div>
  )
}