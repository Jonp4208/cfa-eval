import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  UserCheck,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Zap,
  Plus,
  PlayCircle,
  Eye,
  Settings,
  TrendingUp,
  Award,
  Calendar,
  ClipboardList,
  Lightbulb,
  Star,
  Heart,
  GraduationCap
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  hoverColor: string
  route: string
  badge?: string
  isNew?: boolean
  isRecommended?: boolean
}

interface QuickActionsProps {
  className?: string
  layout?: 'grid' | 'list'
  showRecommended?: boolean
}

export default function QuickActions({ 
  className = '', 
  layout = 'grid',
  showRecommended = true 
}: QuickActionsProps) {
  const navigate = useNavigate()

  const quickActions: QuickAction[] = [
    {
      id: 'assessment',
      title: 'Take Assessment',
      description: 'Evaluate your leadership skills and get personalized insights',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      route: '/leadership/assessments',
      badge: 'Popular',
      isRecommended: true
    },
    {
      id: '360-evaluation',
      title: '360° Evaluation',
      description: 'Create or participate in comprehensive leadership feedback',
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      route: '/leadership/360-evaluations',
      badge: 'Team'
    },
    {
      id: 'development-plans',
      title: 'Explore Plans',
      description: 'Browse and enroll in leadership development programs',
      icon: Target,
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700',
      route: '/leadership/developmental-plan',
      isRecommended: true
    },
    {
      id: 'playbooks',
      title: 'View Playbooks',
      description: 'Access leadership guides and best practices',
      icon: BookOpen,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'from-amber-600 to-amber-700',
      route: '/leadership/playbooks'
    },
    {
      id: 'training-programs',
      title: 'Training Programs',
      description: 'Structured learning paths for leadership development',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'from-indigo-600 to-indigo-700',
      route: '/leadership/training-programs',
      badge: 'Structured'
    },
    {
      id: 'team-surveys',
      title: 'Team Surveys',
      description: 'Gather feedback and insights from your team',
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'from-pink-600 to-pink-700',
      route: '/team-surveys/new',
      badge: 'Feedback'
    },
    {
      id: 'situational-leadership',
      title: 'Situational Leadership',
      description: 'Learn adaptive leadership styles for different situations',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      hoverColor: 'from-cyan-600 to-cyan-700',
      route: '/leadership/situational-leadership-training',
      isNew: true
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Track your progress and team development metrics',
      icon: BarChart3,
      color: 'from-violet-500 to-violet-600',
      hoverColor: 'from-violet-600 to-violet-700',
      route: '/leadership/analytics'
    }
  ]

  const recommendedActions = quickActions.filter(action => action.isRecommended)
  const allActions = quickActions

  const handleActionClick = (route: string) => {
    navigate(route)
  }

  const ActionCard = ({ action }: { action: QuickAction }) => (
    <Button
      onClick={() => handleActionClick(action.route)}
      className={`h-auto p-4 bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
    >
      <div className="flex flex-col items-start w-full relative z-10">
        <div className="flex items-center justify-between w-full mb-2">
          <action.icon className="h-6 w-6" />
          <div className="flex gap-1">
            {action.badge && (
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                {action.badge}
              </Badge>
            )}
            {action.isNew && (
              <Badge variant="secondary" className="text-xs bg-yellow-400 text-yellow-900 border-yellow-500">
                New
              </Badge>
            )}
            {action.isRecommended && (
              <Star className="h-3 w-3 text-yellow-300 fill-current" />
            )}
          </div>
        </div>
        <div className="text-left">
          <div className="font-semibold mb-1">{action.title}</div>
          <div className="text-xs opacity-90 leading-relaxed">{action.description}</div>
        </div>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white/10 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
    </Button>
  )

  const ActionListItem = ({ action }: { action: QuickAction }) => (
    <div
      onClick={() => handleActionClick(action.route)}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className={`h-12 w-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
        <action.icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{action.title}</h3>
          {action.badge && (
            <Badge variant="outline" className="text-xs">
              {action.badge}
            </Badge>
          )}
          {action.isNew && (
            <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
              New
            </Badge>
          )}
          {action.isRecommended && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>
        <p className="text-sm text-gray-600">{action.description}</p>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
        <PlayCircle className="h-5 w-5" />
      </div>
    </div>
  )

  if (layout === 'list') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#E51636]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allActions.map((action) => (
            <ActionListItem key={action.id} action={action} />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showRecommended && recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[#E51636]" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#E51636]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compact quick actions for smaller spaces
export function CompactQuickActions({ maxActions = 4 }: { maxActions?: number }) {
  const navigate = useNavigate()
  
  const compactActions = [
    { title: 'Assessment', icon: Brain, route: '/leadership/assessments', color: 'bg-blue-500' },
    { title: '360° Review', icon: UserCheck, route: '/leadership/360-evaluations', color: 'bg-purple-500' },
    { title: 'Dev Plans', icon: Target, route: '/leadership/developmental-plan', color: 'bg-green-500' },
    { title: 'Playbooks', icon: BookOpen, route: '/leadership/playbooks', color: 'bg-amber-500' },
    { title: 'Training', icon: GraduationCap, route: '/leadership/training-programs', color: 'bg-indigo-500' },
    { title: 'Analytics', icon: BarChart3, route: '/leadership/analytics', color: 'bg-violet-500' }
  ].slice(0, maxActions)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {compactActions.map((action, index) => (
        <Button
          key={index}
          onClick={() => navigate(action.route)}
          variant="outline"
          className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all"
        >
          <div className={`h-8 w-8 ${action.color} rounded-lg flex items-center justify-center`}>
            <action.icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-medium">{action.title}</span>
        </Button>
      ))}
    </div>
  )
}

// Floating action button
export function FloatingQuickAction() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)

  const floatingActions = [
    { title: 'Assessment', icon: Brain, route: '/leadership/assessments', color: 'bg-blue-500' },
    { title: '360° Review', icon: UserCheck, route: '/leadership/360-evaluations', color: 'bg-purple-500' },
    { title: 'New Plan', icon: Plus, route: '/leadership/developmental-plan', color: 'bg-green-500' }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {floatingActions.map((action, index) => (
          <Button
            key={index}
            onClick={() => navigate(action.route)}
            className={`h-12 w-12 ${action.color} hover:shadow-lg rounded-full p-0 shadow-md`}
          >
            <action.icon className="h-5 w-5 text-white" />
          </Button>
        ))}
      </div>
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-[#E51636] hover:bg-[#E51636]/90 rounded-full p-0 shadow-lg mt-3"
      >
        <Zap className={`h-6 w-6 text-white transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  )
}
