import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Search,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  BarChart2,
  BookOpen,
  BrainCircuit,
  Presentation,
  Puzzle,
  Building2,
  LucideIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHeader from '@/components/PageHeader'
import { Progress } from '@/components/ui/progress'

type Status = 'in-progress' | 'completed' | 'needs-review'
type Timeframe = 'short-term' | 'long-term'
type Priority = 'high' | 'medium' | 'low'
type ActivityType = 'training' | 'assignment' | 'mentoring' | 'development'

interface Activity {
  title: string
  type: ActivityType
  completed: boolean
}

interface FocusArea {
  area: string
  progress: number
}

interface DevelopmentPlan {
  id: number
  title: string
  description: string
  status: Status
  timeframe: Timeframe
  dueDate: string
  progress: number
  assignee: string
  priority: Priority
  focusAreas: FocusArea[]
  activities: Activity[]
}

interface QuickMetricCardProps {
  title: string
  icon: LucideIcon
  stats: Array<{ label: string; value: string | number }>
  path: string
}

const QuickMetricCard = React.memo(({ title, icon: Icon, stats, path }: QuickMetricCardProps) => {
  const navigate = useNavigate()
  return (
    <Card 
      className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(path)}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#27251F]">{title}</h3>
          </div>
          <ArrowRight className="h-5 w-5 text-[#27251F]/60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-[#27251F]/60">{stat.label}</p>
              <p className="text-xl font-semibold text-[#27251F]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
})

QuickMetricCard.displayName = 'QuickMetricCard'

export default function Goals() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [metrics, setMetrics] = useState({
    overview: {
      totalPlans: 0,
      inProgress: 0,
      completed: 0,
      needsReview: 0
    },
    development: {
      skillsProgress: 0,
      projectsInvolved: 0
    },
    assessment: {
      completedAssessments: 0,
      averageScore: 0,
      areasIdentified: 0
    }
  })
  const [plans, setPlans] = useState<DevelopmentPlan[]>([])

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API calls
        const mockData = {
          metrics: {
            overview: {
              totalPlans: 15,
              inProgress: 8,
              completed: 4,
              needsReview: 3
            },
            development: {
              skillsProgress: 75,
              projectsInvolved: 5
            },
            assessment: {
              completedAssessments: 8,
              averageScore: 4.2,
              areasIdentified: 6
            }
          },
          plans: [
            {
              id: 1,
              title: 'Strategic Leadership Development',
              description: 'Develop strategic thinking and decision-making capabilities for senior leadership role',
              status: 'in-progress' as Status,
              timeframe: 'long-term' as Timeframe,
              dueDate: '2025-12-31',
              progress: 45,
              assignee: 'John Smith',
              priority: 'high' as Priority,
              focusAreas: [
                { area: 'Strategic Thinking', progress: 60 },
                { area: 'Business Acumen', progress: 45 },
                { area: 'Change Management', progress: 30 }
              ],
              activities: [
                { title: 'Executive Leadership Program', type: 'training' as ActivityType, completed: true },
                { title: 'Cross-functional Project Lead', type: 'assignment' as ActivityType, completed: false },
                { title: 'Mentorship with VP', type: 'mentoring' as ActivityType, completed: true },
                { title: 'Industry Conference Speaking', type: 'development' as ActivityType, completed: false }
              ]
            },
            {
              id: 2,
              title: 'Team Leadership Enhancement',
              description: 'Strengthen team building and emotional intelligence capabilities',
              status: 'in-progress' as Status,
              timeframe: 'short-term' as Timeframe,
              dueDate: '2024-06-30',
              progress: 75,
              assignee: 'Sarah Johnson',
              priority: 'high' as Priority,
              focusAreas: [
                { area: 'Team Building', progress: 80 },
                { area: 'Emotional Intelligence', progress: 70 },
                { area: 'Communication', progress: 75 }
              ],
              activities: [
                { title: 'Leadership Communication Workshop', type: 'training' as ActivityType, completed: true },
                { title: 'Team Building Initiative', type: 'assignment' as ActivityType, completed: true },
                { title: 'Peer Mentoring Program', type: 'mentoring' as ActivityType, completed: false },
                { title: 'Conflict Resolution Training', type: 'development' as ActivityType, completed: true }
              ]
            },
            {
              id: 3,
              title: 'Business Leadership Foundations',
              description: 'Develop core business acumen and decision-making framework',
              status: 'completed' as Status,
              timeframe: 'short-term' as Timeframe,
              dueDate: '2024-03-31',
              progress: 100,
              assignee: 'Michael Chen',
              priority: 'medium' as Priority,
              focusAreas: [
                { area: 'Financial Acumen', progress: 100 },
                { area: 'Strategic Planning', progress: 100 },
                { area: 'Market Analysis', progress: 95 }
              ],
              activities: [
                { title: 'Business Strategy Course', type: 'training' as ActivityType, completed: true },
                { title: 'Financial Analysis Project', type: 'assignment' as ActivityType, completed: true },
                { title: 'Executive Shadowing', type: 'mentoring' as ActivityType, completed: true },
                { title: 'Industry Analysis Presentation', type: 'development' as ActivityType, completed: true }
              ]
            }
          ] as DevelopmentPlan[]
        }
        
        setMetrics(mockData.metrics)
        setPlans(mockData.plans)
      } catch (error) {
        console.error('Error fetching data:', error)
        // TODO: Implement proper error handling
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Memoize status badge generator
  const getStatusBadge = useCallback((status: Status) => {
    const statusConfig = {
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-600' },
      'completed': { label: 'Completed', className: 'bg-green-100 text-green-600' },
      'needs-review': { label: 'Needs Review', className: 'bg-orange-100 text-orange-600' }
    }
    const config = statusConfig[status]
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    )
  }, [])

  // Memoize timeframe badge generator
  const getTimeframeBadge = useCallback((timeframe: Timeframe) => {
    const timeframeConfig = {
      'short-term': { label: '6-12 Months', className: 'bg-purple-100 text-purple-600' },
      'long-term': { label: '2-5 Years', className: 'bg-indigo-100 text-indigo-600' }
    }
    const config = timeframeConfig[timeframe]
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    )
  }, [])

  // Memoize priority badge generator
  const getPriorityBadge = useCallback((priority: Priority) => {
    const priorityConfig = {
      'high': { className: 'bg-red-100 text-red-600' },
      'medium': { className: 'bg-yellow-100 text-yellow-600' },
      'low': { className: 'bg-green-100 text-green-600' }
    }
    return (
      <Badge className={priorityConfig[priority].className} variant="outline">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }, [])

  // Memoize activity icon generator
  const getActivityIcon = useCallback((type: ActivityType) => {
    const icons: Record<ActivityType, LucideIcon> = {
      'training': BookOpen,
      'assignment': Puzzle,
      'mentoring': Users,
      'development': BrainCircuit
    }
    const Icon = icons[type] || Target
    return <Icon className="h-4 w-4" />
  }, [])

  // Memoize filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [plans, searchQuery, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickMetricCard
          title="Development Overview"
          icon={Target}
          path="/leadership/goals/overview"
          stats={[
            { label: 'Total Plans', value: metrics.overview.totalPlans },
            { label: 'In Progress', value: metrics.overview.inProgress },
            { label: 'Completed', value: metrics.overview.completed },
            { label: 'Needs Review', value: metrics.overview.needsReview }
          ]}
        />
        <QuickMetricCard
          title="Development Activities"
          icon={BrainCircuit}
          path="/leadership/goals/activities"
          stats={[
            { label: 'Skills Progress', value: `${metrics.development.skillsProgress}%` },
            { label: 'Projects Involved', value: metrics.development.projectsInvolved }
          ]}
        />
        <QuickMetricCard
          title="Skills Assessment"
          icon={Presentation}
          path="/leadership/goals/assessment"
          stats={[
            { label: 'Completed Assessments', value: metrics.assessment.completedAssessments },
            { label: 'Average Score', value: `${metrics.assessment.averageScore}/5` },
            { label: 'Areas Identified', value: metrics.assessment.areasIdentified }
          ]}
        />
      </div>

      {/* Development Plans List */}
      <Card className="bg-white rounded-[20px] p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search development plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl border-gray-200"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="needs-review">Needs Review</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => navigate('/leadership/developmental-plans/new')}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Development Plan
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer rounded-[20px] border border-gray-100"
              onClick={() => navigate(`/leadership/goals/${plan.id}`)}
            >
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#27251F]">{plan.title}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(plan.status)}
                        {getTimeframeBadge(plan.timeframe)}
                        {getPriorityBadge(plan.priority)}
                      </div>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due {new Date(plan.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {plan.assignee}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  {/* Focus Areas */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Focus Areas</h4>
                    <div className="space-y-3">
                      {plan.focusAreas.map((area, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{area.area}</span>
                            <span className="font-medium">{area.progress}%</span>
                          </div>
                          <Progress value={area.progress} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Development Activities */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Development Activities</h4>
                    <div className="space-y-2">
                      {plan.activities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {activity.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <span className={activity.completed ? 'text-gray-600' : 'text-gray-900'}>
                              {activity.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
} 