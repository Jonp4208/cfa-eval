import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GraduationCap,
  Target,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Video,
  PenTool,
  Brain,
  FileCheck,
  Clock,
  Calendar
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'
import { useToast } from '@/components/ui/use-toast'

// Define types for our dashboard data
interface DashboardStats {
  plans: {
    enrolled: number;
    completed: number;
    inProgress: number;
    overallProgress: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  recentActivity: {
    planId: string;
    planTitle: string;
    taskId: string;
    taskTitle: string;
    taskType: string;
    completedAt: string;
  }[];
  upcomingTasks: {
    planId: string;
    planTitle: string;
    taskId: string;
    taskTitle: string;
    taskType: string;
    estimatedTime: string;
  }[];
}

export default function LeadershipDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    plans: {
      enrolled: 0,
      completed: 0,
      inProgress: 0,
      overallProgress: 0
    },
    tasks: {
      total: 0,
      completed: 0,
      pending: 0,
      completionRate: 0
    },
    recentActivity: [],
    upcomingTasks: []
  })

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leadership/dashboard')

      // Ensure the response has the expected structure
      const data = response.data || {}

      // Set stats with default values for any missing properties
      setStats({
        plans: {
          enrolled: data.plans?.enrolled || 0,
          completed: data.plans?.completed || 0,
          inProgress: data.plans?.inProgress || 0,
          overallProgress: data.plans?.overallProgress || 0
        },
        tasks: {
          total: data.tasks?.total || 0,
          completed: data.tasks?.completed || 0,
          pending: data.tasks?.pending || 0,
          completionRate: data.tasks?.completionRate || 0
        },
        recentActivity: data.recentActivity || [],
        upcomingTasks: data.upcomingTasks || []
      })
    } catch (error) {
      console.error('Error fetching leadership dashboard stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Helper function to get task icon based on task type
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'reading':
        return <BookOpen className="h-4 w-4" />
      case 'activity':
        return <PenTool className="h-4 w-4" />
      case 'reflection':
        return <Brain className="h-4 w-4" />
      case 'assessment':
        return <FileCheck className="h-4 w-4" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  // Dashboard card component
  const DashboardCard = ({
    title,
    icon: Icon,
    children,
    className,
    onClick
  }: {
    title: string
    icon: any
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }) => (
    <Card
      className={cn(
        "bg-white rounded-[20px] h-full",
        onClick && "hover:shadow-xl transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#27251F]">{title}</h3>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </Card>
  )

  // Stats grid component for the plans and tasks cards
  const StatsGrid = ({ stats }: { stats: { label: string; value: string | number; icon?: string }[] }) => (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center gap-2">
            {stat.icon && <span className="text-sm">{stat.icon}</span>}
            <p className="text-sm text-[#27251F]/60">{stat.label}</p>
          </div>
          <p className="text-xl font-semibold text-[#27251F]">{stat.value}</p>
        </div>
      ))}
    </div>
  )

  // Activity item component for recent activity and upcoming tasks
  const ActivityItem = ({
    icon: Icon,
    title,
    subtitle,
    timestamp,
    onClick
  }: {
    icon: React.ReactNode
    title: string
    subtitle: string
    timestamp: string
    onClick?: () => void
  }) => (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        onClick && "hover:bg-gray-50 cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="h-8 w-8 bg-[#E51636]/10 text-[#E51636] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        {Icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[#27251F] truncate">{title}</p>
        <p className="text-xs text-[#27251F]/60 truncate">{subtitle}</p>
        <p className="text-xs text-[#27251F]/40 mt-1">{timestamp}</p>
      </div>
    </div>
  )

  // Loading skeleton for the dashboard
  if (loading) {
    return (
      <div className="space-y-6 px-4 md:px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white rounded-[20px]">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Dashboard Grid - 2x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leadership Plans Card */}
        <DashboardCard
          title="Leadership Plans"
          icon={GraduationCap}
          onClick={() => navigate('/leadership/plans')}
        >
          <div className="space-y-4">
            {/* Circular Progress Indicator */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.plans.overallProgress / 100)}`}
                    className="text-[#E51636] transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#E51636]">{stats.plans.overallProgress}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            <StatsGrid
              stats={[
                { label: 'Enrolled', value: stats.plans.enrolled, icon: '📚' },
                { label: 'In Progress', value: stats.plans.inProgress, icon: '⏳' },
                { label: 'Completed', value: stats.plans.completed, icon: '✅' },
                { label: 'Available', value: 5 - stats.plans.enrolled, icon: '🎯' }
              ]}
            />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/leadership/developmental-plan')
                }}
              >
                Browse Plans
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/leadership/my-plans')
                }}
              >
                My Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Tasks Card */}
        <DashboardCard
          title="Learning Tasks"
          icon={ClipboardList}
        >
          <div className="space-y-4">
            {/* Task Progress Ring */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - stats.tasks.completionRate / 100)}`}
                    className="text-green-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.tasks.completionRate}%</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                </div>
              </div>
            </div>

            <StatsGrid
              stats={[
                { label: 'Total', value: stats.tasks.total, icon: '📋' },
                { label: 'Completed', value: stats.tasks.completed, icon: '✅' },
                { label: 'Pending', value: stats.tasks.pending, icon: '⏰' },
                { label: 'This Week', value: Math.min(stats.tasks.pending, 3), icon: '🎯' }
              ]}
            />

            {stats.tasks.pending > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">Next Up</span>
                </div>
                <p className="text-xs text-blue-600">
                  {stats.tasks.pending} tasks waiting for completion
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10"
                onClick={() => navigate('/leadership/my-plans')}
              >
                View My Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Recent Activity Card */}
        <DashboardCard
          title="Recent Activity"
          icon={Clock}
        >
          <div className="space-y-1 overflow-y-auto max-h-[300px]">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={getTaskIcon(activity.taskType)}
                  title={activity.taskTitle}
                  subtitle={`${activity.planTitle}`}
                  timestamp={`Completed ${formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}`}
                  onClick={() => navigate(`/leadership/plans/${activity.planId}/tasks`)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">Complete tasks to see them here</p>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Upcoming Tasks Card */}
        <DashboardCard
          title="Upcoming Tasks"
          icon={Calendar}
        >
          <div className="space-y-1 overflow-y-auto max-h-[300px]">
            {stats.upcomingTasks.length > 0 ? (
              stats.upcomingTasks.map((task, index) => (
                <ActivityItem
                  key={index}
                  icon={getTaskIcon(task.taskType)}
                  title={task.taskTitle}
                  subtitle={`${task.planTitle}`}
                  timestamp={`Est. time: ${task.estimatedTime || 'Not specified'}`}
                  onClick={() => navigate(`/leadership/plans/${task.planId}/tasks`)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No upcoming tasks</p>
                <p className="text-xs text-gray-400">Enroll in a plan to see tasks here</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/leadership/plans')}
                >
                  Browse Plans
                </Button>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}