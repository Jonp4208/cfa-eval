import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Award,
  Brain,
  BarChart3,
  Calendar,
  ArrowRight,
  Plus,
  PlayCircle,
  FileText,
  MessageSquare,
  Lightbulb,
  Zap,
  Trophy,
  Activity,
  Eye,
  ChevronRight,
  GraduationCap,
  Heart,
  UserCheck,
  ClipboardList,
  Sparkles,
  Flame,
  Rocket,
  Crown,
  Diamond,
  Compass,
  Shield,
  Mountain,
  Sunrise
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface DashboardStats {
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
  recentActivity: Array<{
    id: string
    type: string
    title: string
    description: string
    timestamp: string
    status: string
  }>
  upcomingTasks: Array<{
    id: string
    title: string
    type: string
    dueDate: string
    priority: string
    planTitle: string
  }>
  competencies: Array<{
    name: string
    level: number
    target: number
    progress: number
  }>
  team: {
    totalMembers: number
    inDevelopment: number
    completedPlans: number
    averageProgress: number
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    earnedAt: string
    type: string
  }>
  analytics: {
    weeklyProgress: number
    monthlyGoals: number
    skillsImproved: number
    hoursLearning: number
  }
}

export default function LeadershipDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['leadershipDashboard'],
    queryFn: async () => {
      const response = await api.get('/leadership/dashboard')
      return response.data as DashboardStats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch user's enrolled plans
  const { data: myPlans } = useQuery({
    queryKey: ['myLeadershipPlans'],
    queryFn: async () => {
      const response = await api.get('/api/leadership/my-plans')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load dashboard data</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Ensure we have safe default values
  const defaultStats = {
    plans: { enrolled: 0, completed: 0, inProgress: 0, overallProgress: 0 },
    tasks: { total: 0, completed: 0, pending: 0, completionRate: 0 },
    recentActivity: [],
    upcomingTasks: [],
    competencies: [],
    team: { totalMembers: 0, inDevelopment: 0, completedPlans: 0, averageProgress: 0 },
    achievements: [],
    analytics: { weeklyProgress: 0, monthlyGoals: 0, skillsImproved: 0, hoursLearning: 0 }
  }

  const stats = dashboardData ? {
    plans: dashboardData.plans || defaultStats.plans,
    tasks: dashboardData.tasks || defaultStats.tasks,
    recentActivity: dashboardData.recentActivity || defaultStats.recentActivity,
    upcomingTasks: dashboardData.upcomingTasks || defaultStats.upcomingTasks,
    competencies: dashboardData.competencies || defaultStats.competencies,
    team: dashboardData.team || defaultStats.team,
    achievements: dashboardData.achievements || defaultStats.achievements,
    analytics: dashboardData.analytics || defaultStats.analytics
  } : defaultStats

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E51636] via-purple-600 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <Crown className="h-5 w-5 text-yellow-300" />
                <span className="text-white font-medium">Leadership Excellence Dashboard</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome back,
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {user?.name}! 🚀
                </span>
              </h1>

              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Your leadership journey continues. Every step forward shapes the leader you're becoming.
              </p>

              {/* Progress Ring */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats?.plans?.overallProgress || 0) / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{stats?.plans?.overallProgress || 0}%</div>
                      <div className="text-sm text-white/80">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate('/leadership/assessments')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Take Assessment
                </Button>
                <Button
                  onClick={() => navigate('/leadership/developmental-plan')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Explore Plans
                </Button>
                <Button
                  onClick={() => navigate('/leadership/360-evaluations')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Users className="h-5 w-5 mr-2" />
                  360° Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Star className="h-16 w-16 text-yellow-300 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <Trophy className="h-12 w-12 text-yellow-300 animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20">
          <Target className="h-14 w-14 text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Active Plans Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {stats?.plans?.inProgress || 0}
                  </div>
                  <div className="text-sm text-gray-500">Active Plans</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-blue-600">{stats?.plans?.overallProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats?.plans?.overallProgress || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">
                    {stats?.tasks?.completed || 0}
                  </div>
                  <div className="text-sm text-gray-500">Tasks Done</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{stats?.tasks?.completionRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats?.tasks?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Development Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {stats?.team?.inDevelopment || 0}
                  </div>
                  <div className="text-sm text-gray-500">Team Members</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Progress</span>
                  <span className="font-semibold text-purple-600">{stats?.team?.averageProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats?.team?.averageProgress || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Hours Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-800 bg-clip-text text-transparent">
                    {stats?.analytics?.hoursLearning || 0}
                  </div>
                  <div className="text-sm text-gray-500">Hours This Month</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Goal Progress</span>
                  <span className="font-semibold text-amber-600">{Math.min((stats?.analytics?.hoursLearning || 0) / 40 * 100, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((stats?.analytics?.hoursLearning || 0) / 40 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Leadership Journey Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Development Plans */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <Mountain className="h-8 w-8" />
                      My Leadership Journey
                    </CardTitle>
                    <p className="text-indigo-100 mt-2">Your path to leadership excellence</p>
                  </div>
                  <Button
                    onClick={() => navigate('/leadership/my-plans')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {myPlans && myPlans.length > 0 ? (
                  <div className="space-y-6">
                    {myPlans.slice(0, 3).map((plan: any, index: number) => (
                      <div
                        key={plan.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/leadership/plans/${plan.id}/tasks`)}
                      >
                        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg">
                          <div className="relative">
                            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {plan.id === 'heart-of-leadership' ?
                                <Heart className="h-8 w-8 text-white" /> :
                                <Target className="h-8 w-8 text-white" />
                              }
                            </div>
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                              {plan.title}
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={`${
                                plan.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                plan.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {plan.status === 'completed' ? '✅ Completed' :
                                 plan.status === 'in-progress' ? '📚 In Progress' :
                                 '📝 Enrolled'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {plan.progress}% complete
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-indigo-600">{plan.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${plan.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="h-32 w-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
                        <Compass className="h-16 w-16 text-indigo-400" />
                      </div>
                      <div className="absolute -top-2 -right-8 h-8 w-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">Begin Your Leadership Adventure</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Every great leader started with a single step. Choose your first development plan and begin transforming your leadership potential.
                    </p>
                    <Button
                      onClick={() => navigate('/leadership/developmental-plan')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      Start Your Journey
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={() => navigate('/leadership/assessments')}
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Take Assessment</div>
                    <div className="text-xs opacity-90">Discover your leadership style</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/leadership/360-evaluations')}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <UserCheck className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">360° Evaluation</div>
                    <div className="text-xs opacity-90">Get comprehensive feedback</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/leadership/playbooks')}
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Leadership Playbooks</div>
                    <div className="text-xs opacity-90">Access proven strategies</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/leadership/goal-setting')}
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Target className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Set Goals</div>
                    <div className="text-xs opacity-90">Define your objectives</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats?.recentActivity?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.slice(0, 4).map((activity, index) => (
                      <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-pink-50 hover:to-rose-50 transition-all duration-300">
                        <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          {activity.type === 'task_completed' && <CheckCircle className="h-5 w-5 text-white" />}
                          {activity.type === 'plan_enrolled' && <Target className="h-5 w-5 text-white" />}
                          {activity.type === 'assessment_taken' && <Brain className="h-5 w-5 text-white" />}
                          {activity.type === 'skill_improved' && <TrendingUp className="h-5 w-5 text-white" />}
                          {!['task_completed', 'plan_enrolled', 'assessment_taken', 'skill_improved'].includes(activity.type) && <Activity className="h-5 w-5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Sunrise className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Your Journey Begins</h3>
                    <p className="text-sm text-gray-500">
                      Start taking actions to see your progress here!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements & Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Trophy className="h-8 w-8" />
                Achievements & Milestones
              </CardTitle>
              <p className="text-yellow-100 mt-2">Celebrating your leadership wins</p>
            </CardHeader>
            <CardContent className="p-8">
              {stats?.achievements?.length > 0 ? (
                <div className="space-y-6">
                  {stats.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={achievement.id || index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                      <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Trophy className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            {achievement.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mb-8">
                    <div className="h-24 w-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
                      <Crown className="h-12 w-12 text-yellow-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3">Your First Achievement Awaits</h3>
                  <p className="text-gray-500 mb-6">
                    Complete tasks and reach milestones to unlock achievements and showcase your leadership growth.
                  </p>
                  <Button
                    onClick={() => navigate('/leadership/assessments')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Start Earning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leadership Insights */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8" />
                Leadership Insights
              </CardTitle>
              <p className="text-indigo-100 mt-2">Personalized recommendations for growth</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Insight Cards */}
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                     onClick={() => navigate('/leadership/situational-leadership-assessment')}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Compass className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-1">Discover Your Leadership Style</h3>
                      <p className="text-sm text-blue-700">Take the Situational Leadership Assessment to understand your natural leadership approach.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                     onClick={() => navigate('/leadership/developmental-plan')}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-1">Build Character-Based Leadership</h3>
                      <p className="text-sm text-green-700">Start with "The Heart of Leadership" to develop authentic leadership from the inside out.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-green-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                     onClick={() => navigate('/leadership/360-evaluations/new')}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 mb-1">Gather Team Feedback</h3>
                      <p className="text-sm text-purple-700">Create a 360° evaluation to get comprehensive feedback from your team and peers.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Analytics Summary */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">This Month's Progress</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats?.analytics?.weeklyProgress || 0}%</div>
                    <div className="text-xs text-blue-600">Weekly Growth</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{stats?.analytics?.skillsImproved || 0}</div>
                    <div className="text-xs text-green-600">Skills Improved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
