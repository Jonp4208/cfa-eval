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
      const response = await api.get('/leadership/dashboard')

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
  const StatsGrid = ({ stats }: { stats: { label: string; value: string | number }[] }) => (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="space-y-1">
          <p className="text-sm text-[#27251F]/60">{stat.label}</p>
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
            <StatsGrid
              stats={[
                { label: 'Enrolled', value: stats.plans.enrolled },
                { label: 'In Progress', value: stats.plans.inProgress },
                { label: 'Completed', value: stats.plans.completed },
                { label: 'Overall Progress', value: `${stats.plans.overallProgress}%` }
              ]}
            />

            {stats.plans.enrolled > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-[#27251F]/60">Overall Progress</p>
                <Progress
                  value={stats.plans.overallProgress}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-[#E51636]"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/leadership/plans')
                }}
              >
                View All Plans <ArrowRight className="ml-2 h-4 w-4" />
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
            <StatsGrid
              stats={[
                { label: 'Total Tasks', value: stats.tasks.total },
                { label: 'Completed', value: stats.tasks.completed },
                { label: 'Pending', value: stats.tasks.pending },
                { label: 'Completion Rate', value: `${stats.tasks.completionRate}%` }
              ]}
            />

            {stats.tasks.total > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-[#27251F]/60">Task Completion</p>
                <Progress
                  value={stats.tasks.completionRate}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-[#E51636]"
                />
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