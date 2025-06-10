import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Target,
  Brain,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  FileText,
  Star,
  Clock,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: string
  metadata?: {
    planTitle?: string
    progress?: number
    skillName?: string
    achievementType?: string
  }
}

interface RecentActivityProps {
  activities: ActivityItem[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

export default function RecentActivity({
  activities = [],
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className = ''
}: RecentActivityProps) {
  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : []
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return CheckCircle
      case 'plan_enrolled':
        return Target
      case 'assessment_taken':
        return Brain
      case 'skill_improved':
        return TrendingUp
      case 'team_feedback':
        return Users
      case 'training_completed':
        return BookOpen
      case 'achievement_earned':
        return Award
      case 'evaluation_submitted':
        return MessageSquare
      case 'playbook_created':
        return FileText
      case 'competency_updated':
        return Star
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-500'
      case 'plan_enrolled':
        return 'bg-blue-500'
      case 'assessment_taken':
        return 'bg-purple-500'
      case 'skill_improved':
        return 'bg-indigo-500'
      case 'team_feedback':
        return 'bg-cyan-500'
      case 'training_completed':
        return 'bg-emerald-500'
      case 'achievement_earned':
        return 'bg-yellow-500'
      case 'evaluation_submitted':
        return 'bg-pink-500'
      case 'playbook_created':
        return 'bg-orange-500'
      case 'competency_updated':
        return 'bg-violet-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'reviewed':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Reviewed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return time.toLocaleDateString()
    }
  }

  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#E51636]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Recent Activity</h3>
            <p className="text-gray-500 mb-4">
              Start a development plan or complete tasks to see your progress here!
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E51636]" />
              <span className="text-sm text-[#E51636] font-medium">Your journey begins now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#E51636]" />
          Recent Activity
        </CardTitle>
        {showViewAll && activities.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className={`h-10 w-10 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          {activity.metadata.planTitle && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {activity.metadata.planTitle}
                            </span>
                          )}
                          {activity.metadata.progress !== undefined && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {activity.metadata.progress}% progress
                            </span>
                          )}
                          {activity.metadata.skillName && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {activity.metadata.skillName}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Showing {maxItems} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact activity item for smaller spaces
export function CompactActivity({ activity }: { activity: ActivityItem }) {
  const Icon = getActivityIcon(activity.type)
  const colorClass = getActivityColor(activity.type)
  
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`h-6 w-6 ${colorClass} rounded-full flex items-center justify-center`}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
      </div>
    </div>
  )
}

// Activity timeline component
export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type)
        const colorClass = getActivityColor(activity.type)
        
        return (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 ${colorClass} rounded-full flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              {index < activities.length - 1 && (
                <div className="w-px h-8 bg-gray-200 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'task_completed':
      return CheckCircle
    case 'plan_enrolled':
      return Target
    case 'assessment_taken':
      return Brain
    case 'skill_improved':
      return TrendingUp
    case 'team_feedback':
      return Users
    case 'training_completed':
      return BookOpen
    case 'achievement_earned':
      return Award
    case 'evaluation_submitted':
      return MessageSquare
    case 'playbook_created':
      return FileText
    case 'competency_updated':
      return Star
    default:
      return Activity
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'task_completed':
      return 'bg-green-500'
    case 'plan_enrolled':
      return 'bg-blue-500'
    case 'assessment_taken':
      return 'bg-purple-500'
    case 'skill_improved':
      return 'bg-indigo-500'
    case 'team_feedback':
      return 'bg-cyan-500'
    case 'training_completed':
      return 'bg-emerald-500'
    case 'achievement_earned':
      return 'bg-yellow-500'
    case 'evaluation_submitted':
      return 'bg-pink-500'
    case 'playbook_created':
      return 'bg-orange-500'
    case 'competency_updated':
      return 'bg-violet-500'
    default:
      return 'bg-gray-500'
  }
}

function formatTimeAgo(timestamp: string) {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return time.toLocaleDateString()
  }
}
