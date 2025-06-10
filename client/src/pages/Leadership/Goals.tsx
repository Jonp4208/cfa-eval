import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Search,
  BarChart3,
  Users,
  Flag,
  Eye
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  targetDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  milestones: string[]
  metrics: string
  createdAt: string
  updatedAt: string
}

export default function Goals() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    on_hold: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const categoryIcons = {
    leadership: Users,
    operational: BarChart3,
    team: Users,
    personal: TrendingUp,
    customer: Star,
    financial: Target
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/leadership/goals')
      setGoals(response.data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await api.patch(`/leadership/goals/${goalId}/progress`, { progress })
      setGoals(goals.map(g => 
        g.id === goalId 
          ? { ...g, progress, status: progress === 100 ? 'completed' : 'in_progress' }
          : g
      ))
      toast({
        title: 'Progress Updated',
        description: 'Goal progress has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getFilteredGoals = () => {
    switch (activeTab) {
      case 'active':
        return goals.filter(g => g.status === 'in_progress')
      case 'completed':
        return goals.filter(g => g.status === 'completed')
      case 'pending':
        return goals.filter(g => g.status === 'not_started')
      default:
        return goals
    }
  }

  const getGoalStats = () => {
    const total = goals.length
    const completed = goals.filter(g => g.status === 'completed').length
    const inProgress = goals.filter(g => g.status === 'in_progress').length
    const notStarted = goals.filter(g => g.status === 'not_started').length
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, notStarted, overallProgress }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date() && new Date(targetDate).getTime() !== 0
  }

  const stats = getGoalStats()
  const filteredGoals = getFilteredGoals()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600">Track your leadership development progress</p>
        </div>
        <Button
          onClick={() => navigate('/leadership/goal-setting')}
          className="bg-[#E51636] hover:bg-[#E51636]/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Goals</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-amber-900">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-purple-900">{stats.overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Goals ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.notStarted})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredGoals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {activeTab === 'all' ? 'No Goals Set' : `No ${activeTab} Goals`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all' 
                    ? 'Start by creating your first leadership development goal'
                    : `You don't have any ${activeTab} goals at the moment`
                  }
                </p>
                <Button
                  onClick={() => navigate('/leadership/goal-setting')}
                  className="bg-[#E51636] hover:bg-[#E51636]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGoals.map((goal) => {
                const CategoryIcon = categoryIcons[goal.category as keyof typeof categoryIcons] || Target
                const isGoalOverdue = isOverdue(goal.targetDate)
                
                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/20 text-[#E51636] rounded-lg flex items-center justify-center">
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge className={priorityColors[goal.priority]}>
                                {goal.priority}
                              </Badge>
                              <Badge className={statusColors[goal.status]}>
                                {goal.status.replace('_', ' ')}
                              </Badge>
                              {isGoalOverdue && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/leadership/goals/${goal.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-[#E51636]">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      {/* Target Date */}
                      {goal.targetDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>Target: {formatDate(goal.targetDate)}</span>
                          {isGoalOverdue && (
                            <Flag className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}

                      {/* Milestones Preview */}
                      {goal.milestones.length > 0 && goal.milestones[0] && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Next Milestone:</p>
                          <p className="text-sm text-gray-600">{goal.milestones[0]}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/leadership/goals/${goal.id}`)}
                          className="flex items-center gap-2"
                        >
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                        
                        {goal.status !== 'completed' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 25, 100))}
                              className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5"
                            >
                              +25%
                            </Button>
                            {goal.progress < 100 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGoalProgress(goal.id, 100)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
