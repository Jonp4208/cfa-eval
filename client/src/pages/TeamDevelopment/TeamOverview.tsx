import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Users, BookOpen, TrendingUp, Award, Plus, Eye, Target, Brain, Heart, Shield, Zap, GraduationCap, Rocket, Star, Sparkles, Trophy, BarChart3, PieChart, Activity, Calendar, Clock, CheckCircle, ArrowUp, ArrowDown, Minus, Search, CheckSquare, PlayCircle, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

interface TeamMember {
  _id: string
  name: string
  email: string
  position: string
  startDate: string
}

interface TeamMemberProgress {
  teamMember: TeamMember
  enrollments: Array<{
    _id: string
    planId: string
    status: string
    progress: number
    enrolledAt: string
    completedAt?: string
  }>
  totalPlans: number
  completedPlans: number
  inProgressPlans: number
}

interface TeamOverviewData {
  teamMembers: TeamMemberProgress[]
  summary: {
    totalTeamMembers: number
    enrolledMembers: number
    totalEnrollments: number
    completedPlans: number
  }
}

interface AvailablePlan {
  id: string
  title: string
  description: string
  estimatedWeeks: number
  book?: {
    title: string
    author: string
    description: string
  }
  chickFilAFocus?: string
}

interface PlanTask {
  id: string
  type: 'video' | 'reading' | 'activity' | 'reflection' | 'assessment' | 'task'
  title: string
  description: string
  resourceUrl?: string
  estimatedTime: string
  chickFilAExample?: string
}

const TeamOverview: React.FC = () => {
  const [overviewData, setOverviewData] = useState<TeamOverviewData | null>(null)
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [enrolling, setEnrolling] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false)
  const [progressSearchTerm, setProgressSearchTerm] = useState('')
  const [analyticsSearchTerm, setAnalyticsSearchTerm] = useState('')
  const [planDetailsDialogOpen, setPlanDetailsDialogOpen] = useState(false)
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<string>('')
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([])
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeamOverview()
    fetchAvailablePlans()
  }, [])

  const fetchTeamOverview = async () => {
    try {
      const response = await api.get('/team-member-development/team-overview')
      setOverviewData(response.data)
    } catch (error) {
      console.error('Error fetching team overview:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team development overview.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      const response = await api.get('/team-member-development/plans')
      setAvailablePlans(response.data)
    } catch (error) {
      console.error('Error fetching available plans:', error)
    }
  }

  const fetchPlanDetails = async (planId: string) => {
    setLoadingPlanDetails(true)
    try {
      const response = await api.get(`/team-member-development/plans/${planId}/details`)
      setPlanTasks(response.data.tasks || [])
    } catch (error) {
      console.error('Error fetching plan details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load plan details.',
        variant: 'destructive'
      })
    } finally {
      setLoadingPlanDetails(false)
    }
  }

  const handleViewPlanDetails = (planId: string) => {
    setSelectedPlanForDetails(planId)
    setPlanDetailsDialogOpen(true)
    fetchPlanDetails(planId)
  }

  const handleEnrollTeamMember = async () => {
    if (!selectedTeamMember || !selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please select both a team member and a plan.',
        variant: 'destructive'
      })
      return
    }

    setEnrolling(true)
    try {
      await api.post(`/team-member-development/plans/${selectedPlan}/enroll/${selectedTeamMember}`)

      toast({
        title: 'Success',
        description: 'Team member enrolled in development plan successfully.',
      })

      setEnrollDialogOpen(false)
      setSelectedTeamMember('')
      setSelectedPlan('')
      fetchTeamOverview() // Refresh data
    } catch (error: any) {
      console.error('Error enrolling team member:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to enroll team member.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'enrolled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanTitle = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId)
    return plan?.title || planId
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'growth-mindset-champion':
        return <Brain className="h-5 w-5" />
      case 'second-mile-service':
        return <Heart className="h-5 w-5" />
      case 'team-unity-builder':
        return <Users className="h-5 w-5" />
      case 'ownership-initiative':
        return <Shield className="h-5 w-5" />
      case 'continuous-improvement':
        return <TrendingUp className="h-5 w-5" />
      case 'positive-energy-creator':
        return <Zap className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'growth-mindset-champion':
        return 'from-purple-500 to-pink-500'
      case 'second-mile-service':
        return 'from-red-500 to-orange-500'
      case 'team-unity-builder':
        return 'from-blue-500 to-cyan-500'
      case 'ownership-initiative':
        return 'from-green-500 to-emerald-500'
      case 'continuous-improvement':
        return 'from-indigo-500 to-purple-500'
      case 'positive-energy-creator':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />
      case 'reading':
        return <BookOpen className="h-4 w-4" />
      case 'activity':
        return <Activity className="h-4 w-4" />
      case 'reflection':
        return <Brain className="h-4 w-4" />
      case 'assessment':
        return <CheckSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Calculate plan distribution - show ALL available plans
  const getPlanDistribution = () => {
    const planCounts: { [key: string]: number } = {}

    // Count enrollments for each plan
    overviewData?.teamMembers.forEach(member => {
      member.enrollments.forEach(enrollment => {
        planCounts[enrollment.planId] = (planCounts[enrollment.planId] || 0) + 1
      })
    })

    // Include ALL available plans, even those with 0 enrollments
    return availablePlans.map(plan => ({
      planId: plan.id,
      title: plan.title,
      count: planCounts[plan.id] || 0,
      icon: getPlanIcon(plan.id),
      gradient: getPlanGradient(plan.id)
    })).sort((a, b) => b.count - a.count)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load team development data.</p>
      </div>
    )
  }

  const planDistribution = getPlanDistribution()
  const completionRate = overviewData.summary.totalEnrollments > 0
    ? Math.round((overviewData.summary.completedPlans / overviewData.summary.totalEnrollments) * 100)
    : 0
  const enrollmentRate = Math.round((overviewData.summary.enrolledMembers / overviewData.summary.totalTeamMembers) * 100)

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BarChart3 className="h-12 w-12" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Team Development Analytics
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  Track your team's growth journey and development progress across all leadership plans
                </p>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{overviewData.summary.totalTeamMembers}</div>
                <div className="text-white/80 text-sm">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{enrollmentRate}%</div>
                <div className="text-white/80 text-sm">Enrollment Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{overviewData.summary.totalEnrollments}</div>
                <div className="text-white/80 text-sm">Active Plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{completionRate}%</div>
                <div className="text-white/80 text-sm">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{overviewData.summary.enrolledMembers}</div>
                  <div className="text-sm text-gray-600">Enrolled Members</div>
                  <div className="text-xs text-blue-600 font-medium">
                    {enrollmentRate}% of team engaged
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white shadow-lg">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{overviewData.summary.completedPlans}</div>
                  <div className="text-sm text-gray-600">Completed Plans</div>
                  <div className="text-xs text-green-600 font-medium">
                    {completionRate}% success rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{overviewData.summary.totalEnrollments}</div>
                  <div className="text-sm text-gray-600">Active Plans</div>
                  <div className="text-xs text-purple-600 font-medium">
                    Currently in progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white shadow-lg">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{availablePlans.length}</div>
                  <div className="text-sm text-gray-600">Available Plans</div>
                  <div className="text-xs text-orange-600 font-medium">
                    Ready for enrollment
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution Analytics */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Development Plans Overview</h2>
              <p className="text-gray-600">Explore all available development plans and their current usage</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {planDistribution.map((plan, index) => (
              <Card key={plan.planId} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                plan.count === 0 ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'
              }`}>
                <div className={`h-2 bg-gradient-to-r ${plan.gradient}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${plan.gradient} rounded-xl text-white shadow-lg`}>
                      {plan.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{plan.title}</h3>
                      <div className="flex items-center gap-2">
                        {plan.count > 0 ? (
                          <Badge className="bg-gray-100 text-gray-800 border-0">
                            #{planDistribution.filter(p => p.count > plan.count).length + 1} Most Popular
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 border-0">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Enrollments</span>
                      <span className="text-2xl font-bold text-gray-900">{plan.count}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${plan.gradient}`}
                        style={{
                          width: `${planDistribution.length > 0 && Math.max(...planDistribution.map(p => p.count)) > 0
                            ? Math.min((plan.count / Math.max(...planDistribution.map(p => p.count))) * 100, 100)
                            : 0}%`
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      {overviewData.summary.totalEnrollments > 0
                        ? Math.round((plan.count / overviewData.summary.totalEnrollments) * 100)
                        : 0}% of all enrollments
                    </div>

                    <Button
                      onClick={() => handleViewPlanDetails(plan.planId)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Plan Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600">Manage your team's development journey</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Enroll Team Member Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden group cursor-pointer">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <CardContent className="p-6 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Enroll Team Member</h3>
                        <p className="text-sm text-gray-600">Assign development plans to your team</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Enrollment
                    </Button>
                  </CardContent>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enroll Team Member in Development Plan</DialogTitle>
                    <DialogDescription>
                      Select a team member and development plan to get started.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Team Member</label>
                      <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {overviewData.teamMembers.map((member) => (
                            <SelectItem key={member.teamMember._id} value={member.teamMember._id}>
                              {member.teamMember.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Development Plan</label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a development plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.title} ({plan.estimatedWeeks} weeks)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleEnrollTeamMember}
                      disabled={enrolling || !selectedTeamMember || !selectedPlan}
                      className="w-full"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Team Member'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            {/* View Team Progress Card */}
            <Dialog
              open={progressDialogOpen}
              onOpenChange={(open) => {
                setProgressDialogOpen(open)
                if (!open) setProgressSearchTerm('')
              }}
            >
              <DialogTrigger asChild>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden group cursor-pointer">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Eye className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">View Team Progress</h3>
                        <p className="text-sm text-gray-600">Detailed progress tracking</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Team Development Progress
                  </DialogTitle>
                  <DialogDescription>
                    Detailed view of each team member's development journey and progress
                  </DialogDescription>
                </DialogHeader>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search team members by name or email..."
                    value={progressSearchTerm}
                    onChange={(e) => setProgressSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-6">
                  {(() => {
                    const enrolledMembers = overviewData?.teamMembers.filter(member => member.enrollments.length > 0) || []
                    const filteredMembers = enrolledMembers.filter(member =>
                      member.teamMember.name.toLowerCase().includes(progressSearchTerm.toLowerCase()) ||
                      member.teamMember.email.toLowerCase().includes(progressSearchTerm.toLowerCase())
                    )

                    if (enrolledMembers.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                            <Users className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Enrolled Yet</h3>
                          <p className="text-gray-600 mb-4">
                            Start by enrolling team members in development plans to see their progress here.
                          </p>
                          <Button
                            onClick={() => {
                              setProgressDialogOpen(false)
                              setEnrollDialogOpen(true)
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Enroll Team Member
                          </Button>
                        </div>
                      )
                    }

                    if (filteredMembers.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                            <Search className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                          <p className="text-gray-600 mb-4">
                            No team members match your search criteria. Try adjusting your search terms.
                          </p>
                          <Button
                            onClick={() => setProgressSearchTerm('')}
                            variant="outline"
                          >
                            Clear Search
                          </Button>
                        </div>
                      )
                    }

                    return filteredMembers.map((member) => (
                      <Card key={member.teamMember._id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{member.teamMember.name}</CardTitle>
                              <CardDescription>{member.teamMember.email}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {member.totalPlans} Plans
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                {member.completedPlans} Completed
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {member.enrollments.map((enrollment) => (
                              <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 bg-gradient-to-r ${getPlanGradient(enrollment.planId)} rounded-lg text-white`}>
                                    {getPlanIcon(enrollment.planId)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{getPlanTitle(enrollment.planId)}</p>
                                    <p className="text-sm text-gray-600">
                                      {enrollment.learningTasks.filter(t => t.completed).length} of {enrollment.learningTasks.length} tasks completed
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{enrollment.progress}%</div>
                                    <Badge className={`text-xs ${getStatusColor(enrollment.status)}`}>
                                      {enrollment.status}
                                    </Badge>
                                  </div>
                                  <div className="w-20">
                                    <Progress value={enrollment.progress} className="h-2" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  })()}
                </div>
              </DialogContent>
            </Dialog>

            {/* Analytics Card */}
            <Dialog
              open={analyticsDialogOpen}
              onOpenChange={(open) => {
                setAnalyticsDialogOpen(open)
                if (!open) setAnalyticsSearchTerm('')
              }}
            >
              <DialogTrigger asChild>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden group cursor-pointer">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Advanced Analytics</h3>
                        <p className="text-sm text-gray-600">Deep insights and reports</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Advanced Team Development Analytics
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive insights and metrics for your team's development journey
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                  {/* Key Performance Indicators */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Key Performance Indicators
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{enrollmentRate}%</div>
                        <div className="text-sm text-gray-600">Team Engagement</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {enrollmentRate >= 80 ? '🟢 Excellent' : enrollmentRate >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                        </div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {completionRate >= 70 ? '🟢 Excellent' : completionRate >= 50 ? '🟡 Good' : '🔴 Needs Improvement'}
                        </div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {overviewData?.summary.totalEnrollments ? Math.round(overviewData.summary.totalEnrollments / overviewData.summary.enrolledMembers * 10) / 10 : 0}
                        </div>
                        <div className="text-sm text-gray-600">Avg Plans/Member</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Plans per enrolled member
                        </div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {planDistribution.length > 0 ? planDistribution[0].count : 0}
                        </div>
                        <div className="text-sm text-gray-600">Most Popular Plan</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {planDistribution.length > 0 ? planDistribution[0].title.split(' ').slice(0, 2).join(' ') : 'None'}
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Plan Performance Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Plan Performance Analysis
                    </h3>
                    <div className="grid gap-4">
                      {planDistribution.map((plan, index) => {
                        const completedCount = overviewData?.teamMembers.reduce((acc, member) => {
                          return acc + member.enrollments.filter(e => e.planId === plan.planId && e.status === 'completed').length
                        }, 0) || 0
                        const planCompletionRate = plan.count > 0 ? Math.round((completedCount / plan.count) * 100) : 0

                        return (
                          <Card key={plan.planId} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 bg-gradient-to-r ${plan.gradient} rounded-lg text-white`}>
                                  {plan.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{plan.title}</h4>
                                  <p className="text-sm text-gray-600">#{index + 1} Most Popular</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{planCompletionRate}%</div>
                                <div className="text-sm text-gray-600">Completion Rate</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                              <div>
                                <div className="font-semibold text-blue-600">{plan.count}</div>
                                <div className="text-gray-600">Enrolled</div>
                              </div>
                              <div>
                                <div className="font-semibold text-yellow-600">
                                  {plan.count - completedCount}
                                </div>
                                <div className="text-gray-600">In Progress</div>
                              </div>
                              <div>
                                <div className="font-semibold text-green-600">{completedCount}</div>
                                <div className="text-gray-600">Completed</div>
                              </div>
                            </div>
                            <Progress value={planCompletionRate} className="mt-3 h-2" />
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Team Member Performance Rankings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Team Member Performance Rankings
                      </h3>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search rankings..."
                          value={analyticsSearchTerm}
                          onChange={(e) => setAnalyticsSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const enrolledMembers = overviewData?.teamMembers.filter(member => member.enrollments.length > 0) || []
                        const filteredMembers = enrolledMembers.filter(member =>
                          member.teamMember.name.toLowerCase().includes(analyticsSearchTerm.toLowerCase()) ||
                          member.teamMember.email.toLowerCase().includes(analyticsSearchTerm.toLowerCase())
                        )

                        if (enrolledMembers.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                <Award className="h-12 w-12 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data Yet</h3>
                              <p className="text-gray-600">
                                Team member rankings will appear here once development plans are assigned and progress is made.
                              </p>
                            </div>
                          )
                        }

                        if (filteredMembers.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                <Search className="h-12 w-12 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                              <p className="text-gray-600 mb-4">
                                No team members match your search criteria in the rankings.
                              </p>
                              <Button
                                onClick={() => setAnalyticsSearchTerm('')}
                                variant="outline"
                              >
                                Clear Search
                              </Button>
                            </div>
                          )
                        }

                        return filteredMembers
                          .sort((a, b) => {
                            const aAvgProgress = a.enrollments.length > 0
                              ? a.enrollments.reduce((sum, e) => sum + e.progress, 0) / a.enrollments.length
                              : 0
                            const bAvgProgress = b.enrollments.length > 0
                              ? b.enrollments.reduce((sum, e) => sum + e.progress, 0) / b.enrollments.length
                              : 0
                            return bAvgProgress - aAvgProgress
                          })
                          .slice(0, 10)
                          .map((member, index) => {
                            const avgProgress = member.enrollments.length > 0
                              ? Math.round(member.enrollments.reduce((sum, e) => sum + e.progress, 0) / member.enrollments.length)
                              : 0

                            return (
                              <Card key={member.teamMember._id} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                      index === 0 ? 'bg-yellow-500' :
                                      index === 1 ? 'bg-gray-400' :
                                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-semibold">{member.teamMember.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {member.totalPlans} plans • {member.completedPlans} completed
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-lg font-bold">{avgProgress}%</div>
                                      <div className="text-sm text-gray-600">Avg Progress</div>
                                    </div>
                                    <div className="w-20">
                                      <Progress value={avgProgress} className="h-2" />
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )
                          })
                      })()}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Plan Details Dialog */}
      <Dialog open={planDetailsDialogOpen} onOpenChange={setPlanDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedPlanForDetails && getPlanTitle(selectedPlanForDetails)} - Plan Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive overview of this development plan including tasks, objectives, and learning materials
            </DialogDescription>
          </DialogHeader>

          {loadingPlanDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Overview */}
              {selectedPlanForDetails && (() => {
                const planDetails = availablePlans.find(p => p.id === selectedPlanForDetails)
                if (!planDetails) return null

                return (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${getPlanGradient(selectedPlanForDetails)} rounded-xl text-white shadow-lg`}>
                          {getPlanIcon(selectedPlanForDetails)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{planDetails.title}</h3>
                          <p className="text-gray-600 mb-3">{planDetails.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge className="bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              {planDetails.estimatedWeeks} weeks
                            </Badge>
                            {planDetails.chickFilAFocus && (
                              <Badge className="bg-red-100 text-red-800">
                                <Target className="h-3 w-3 mr-1" />
                                Chick-fil-A Focus
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {planDetails.chickFilAFocus && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Chick-fil-A Application
                          </h4>
                          <p className="text-red-800 text-sm">{planDetails.chickFilAFocus}</p>
                        </div>
                      )}

                      {planDetails.book && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Recommended Reading
                          </h4>
                          <div className="text-blue-800">
                            <p className="font-medium">{planDetails.book.title}</p>
                            <p className="text-sm">by {planDetails.book.author}</p>
                            <p className="text-sm mt-2">{planDetails.book.description}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Learning Tasks */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  Learning Tasks & Activities
                </h3>

                {planTasks.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-8 text-center">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Available</h4>
                      <p className="text-gray-600">
                        This plan doesn't have detailed tasks configured yet, or they couldn't be loaded.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {planTasks.map((task, index) => (
                      <Card key={task.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 text-gray-600">
                                  {getTaskTypeIcon(task.type)}
                                  <span className="text-sm font-medium capitalize">{task.type}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimatedTime}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                              <p className="text-gray-600 text-sm mb-3">{task.description}</p>

                              {task.resourceUrl && (
                                <div className="mb-3">
                                  <a
                                    href={task.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                    View Resource
                                  </a>
                                </div>
                              )}

                              {task.chickFilAExample && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <h5 className="font-medium text-red-900 text-sm mb-1 flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Chick-fil-A Application
                                  </h5>
                                  <p className="text-red-800 text-sm">{task.chickFilAExample}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TeamOverview
