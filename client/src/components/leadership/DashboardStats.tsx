import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Star,
  Award,
  Brain,
  Zap,
  Trophy,
  BookOpen,
  Activity
} from 'lucide-react'

interface StatsData {
  plans: {
    enrolled: number
    completed: number
    inProgress: number
    overallProgress: number
  }
  tasks: {
    total: number
    completed: number
    pending: number
    completionRate: number
  }
  team: {
    totalMembers: number
    inDevelopment: number
    completedPlans: number
    averageProgress: number
  }
  analytics: {
    weeklyProgress: number
    monthlyGoals: number
    skillsImproved: number
    hoursLearning: number
  }
}

interface DashboardStatsProps {
  data: StatsData
  className?: string
}

export default function DashboardStats({ data, className = '' }: DashboardStatsProps) {
  // Ensure we have safe default values
  const safeData = {
    plans: data?.plans || { enrolled: 0, completed: 0, inProgress: 0, overallProgress: 0 },
    tasks: data?.tasks || { total: 0, completed: 0, pending: 0, completionRate: 0 },
    team: data?.team || { totalMembers: 0, inDevelopment: 0, completedPlans: 0, averageProgress: 0 },
    analytics: data?.analytics || { weeklyProgress: 0, monthlyGoals: 0, skillsImproved: 0, hoursLearning: 0 }
  }

  const statCards = [
    {
      title: 'Active Plans',
      value: safeData.plans.inProgress,
      subtitle: `of ${safeData.plans.enrolled} enrolled`,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      progress: safeData.plans.overallProgress
    },
    {
      title: 'Completed Tasks',
      value: safeData.tasks.completed,
      subtitle: `${safeData.tasks.completionRate}% completion rate`,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      progress: safeData.tasks.completionRate
    },
    {
      title: 'Team Development',
      value: safeData.team.inDevelopment,
      subtitle: 'members in development',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      progress: safeData.team.averageProgress
    },
    {
      title: 'Learning Hours',
      value: safeData.analytics.hoursLearning,
      subtitle: 'this month',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      progress: Math.min((safeData.analytics.hoursLearning / 40) * 100, 100) // Assuming 40 hours target
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((stat, index) => (
        <Card 
          key={index}
          className={`bg-gradient-to-br ${stat.bgColor} border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`${stat.textColor} text-sm font-medium mb-1`}>
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className={`${stat.textColor} text-xs`}>
                  {stat.subtitle}
                </p>
              </div>
              <div className={`h-12 w-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Progress</span>
                <span className={`text-xs font-semibold ${stat.textColor}`}>
                  {stat.progress}%
                </span>
              </div>
              <Progress 
                value={stat.progress} 
                className="h-2 bg-white/50" 
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Additional mini stats component for smaller displays
export function MiniStats({ data }: { data: StatsData }) {
  const safeData = {
    plans: data?.plans || { enrolled: 0, completed: 0, inProgress: 0, overallProgress: 0 },
    tasks: data?.tasks || { total: 0, completed: 0, pending: 0, completionRate: 0 },
    team: data?.team || { totalMembers: 0, inDevelopment: 0, completedPlans: 0, averageProgress: 0 },
    analytics: data?.analytics || { weeklyProgress: 0, monthlyGoals: 0, skillsImproved: 0, hoursLearning: 0 }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white rounded-lg p-3 text-center border">
        <div className="text-lg font-bold text-blue-600">{safeData.plans.inProgress}</div>
        <div className="text-xs text-gray-500">Active Plans</div>
      </div>
      <div className="bg-white rounded-lg p-3 text-center border">
        <div className="text-lg font-bold text-green-600">{safeData.tasks.completed}</div>
        <div className="text-xs text-gray-500">Tasks Done</div>
      </div>
      <div className="bg-white rounded-lg p-3 text-center border">
        <div className="text-lg font-bold text-purple-600">{safeData.team.inDevelopment}</div>
        <div className="text-xs text-gray-500">Team Dev</div>
      </div>
      <div className="bg-white rounded-lg p-3 text-center border">
        <div className="text-lg font-bold text-amber-600">{safeData.analytics.hoursLearning}</div>
        <div className="text-xs text-gray-500">Hours</div>
      </div>
    </div>
  )
}

// Animated counter component
export function AnimatedStat({ 
  value, 
  label, 
  icon: Icon, 
  color = 'text-blue-600',
  delay = 0 
}: {
  value: number
  label: string
  icon: any
  color?: string
  delay?: number
}) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const increment = value / 20
      let current = 0
      const counter = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, 50)
      return () => clearInterval(counter)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {displayValue}
      </div>
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
    </div>
  )
}

// Progress ring component
export function ProgressRing({ 
  progress, 
  size = 80, 
  strokeWidth = 8,
  color = '#E51636'
}: {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{progress}%</span>
      </div>
    </div>
  )
}
