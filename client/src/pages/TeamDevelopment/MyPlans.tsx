import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Clock, CheckCircle, PlayCircle, Calendar, Star, Trophy, Target, Zap, Users, TrendingUp, Award, Sparkles, ChevronRight, User, GraduationCap, Rocket, Heart, Brain, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

interface TeamMemberPlan {
  id: string
  title: string
  description: string
  estimatedWeeks: number
  book: {
    title: string
    author: string
    description: string
  }
  chickFilAFocus: string
}

interface TeamMemberProgress {
  _id: string
  planId: string
  status: 'enrolled' | 'in-progress' | 'completed' | 'paused'
  progress: number
  enrolledAt: string
  startedAt?: string
  completedAt?: string
  assignedBy: {
    name: string
    position: string
  }
  learningTasks: Array<{
    id: string
    title: string
    completed: boolean
    type: string
  }>
}

const MyPlans: React.FC = () => {
  const [enrollments, setEnrollments] = useState<TeamMemberProgress[]>([])
  const [availablePlans, setAvailablePlans] = useState<TeamMemberPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyPlans()
    fetchAvailablePlans()
  }, [])

  const fetchMyPlans = async () => {
    try {
      const response = await api.get('/team-member-development/my-plans')
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error fetching my plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your development plans.',
        variant: 'destructive'
      })
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      const response = await api.get('/team-member-development/plans')
      setAvailablePlans(response.data)
    } catch (error) {
      console.error('Error fetching available plans:', error)
    } finally {
      setLoading(false)
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
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in-progress':
        return <PlayCircle className="h-4 w-4" />
      case 'enrolled':
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPlanDetails = (planId: string) => {
    return availablePlans.find(plan => plan.id === planId)
  }

  const handleStartPlan = (enrollment: TeamMemberProgress) => {
    navigate(`/team-development/plans/${enrollment.planId}/tasks`)
  }

  const handleEnrollInPlan = async (planId: string) => {
    try {
      await api.post(`/team-member-development/plans/${planId}/enroll/${user?._id}`)

      toast({
        title: 'Success',
        description: 'Successfully enrolled in development plan!',
      })

      fetchMyPlans() // Refresh data
    } catch (error: any) {
      console.error('Error enrolling in plan:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to enroll in plan.',
        variant: 'destructive'
      })
    }
  }

  const getAvailablePlans = () => {
    const enrolledPlanIds = enrollments.map(e => e.planId)
    return availablePlans.filter(plan => !enrolledPlanIds.includes(plan.id))
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'growth-mindset-champion':
        return <Brain className="h-6 w-6" />
      case 'second-mile-service':
        return <Heart className="h-6 w-6" />
      case 'team-unity-builder':
        return <Users className="h-6 w-6" />
      case 'ownership-initiative':
        return <Shield className="h-6 w-6" />
      case 'continuous-improvement':
        return <TrendingUp className="h-6 w-6" />
      case 'positive-energy-creator':
        return <Zap className="h-6 w-6" />
      default:
        return <Target className="h-6 w-6" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const availableForEnrollment = getAvailablePlans()

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              My Development Journey
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Unlock your potential and grow your leadership skills at Chick-fil-A through personalized development plans
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-300" />
                <span>{enrollments.length} Plans Enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-300" />
                <span>{availablePlans.length} Plans Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-300" />
                <span>Unlimited Growth</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* My Enrolled Plans */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Active Plans</h2>
              <p className="text-gray-600">Continue your development journey</p>
            </div>
          </div>

          {enrollments.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20"></div>
                  </div>
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit mx-auto mb-6">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Your Journey?</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                      Choose from our carefully crafted development plans below and begin transforming your leadership potential!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                      <Sparkles className="h-4 w-4" />
                      <span>Scroll down to explore available plans</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {enrollments.map((enrollment) => {
              const planDetails = getPlanDetails(enrollment.planId)
              const completedTasks = enrollment.learningTasks.filter(task => task.completed).length
              const totalTasks = enrollment.learningTasks.length

              return (
                <Card key={enrollment._id} className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden flex flex-col h-full">
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${getPlanGradient(enrollment.planId)}`}></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-r ${getPlanGradient(enrollment.planId)} rounded-xl text-white shadow-lg`}>
                        {getPlanIcon(enrollment.planId)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                            {planDetails?.title || enrollment.planId}
                          </CardTitle>
                          <Badge className={`shrink-0 ${getStatusColor(enrollment.status)} border-0 shadow-sm`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(enrollment.status)}
                              <span className="capitalize">{enrollment.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                        </div>
                        <CardDescription className="mt-2 text-gray-600 line-clamp-2">
                          {planDetails?.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-2 flex-1 flex flex-col">
                    <div className="flex-1 space-y-6">
                      {/* Progress Section */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-gray-900">Progress</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{enrollment.progress}%</span>
                            <div className="text-xs text-gray-500">
                              {completedTasks}/{totalTasks}
                            </div>
                          </div>
                        </div>
                        <Progress value={enrollment.progress} className="h-3 bg-gray-200" />
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {completedTasks} of {totalTasks} learning tasks completed
                        </p>
                      </div>

                      {/* Book Info */}
                      {planDetails?.book && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900 mb-1">
                                {planDetails.book.title}
                              </p>
                              <p className="text-sm text-blue-700">
                                by {planDetails.book.author}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chick-fil-A Focus */}
                      {planDetails?.chickFilAFocus && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Heart className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-red-900 mb-1">Chick-fil-A Focus</p>
                              <p className="text-sm text-red-800">{planDetails.chickFilAFocus}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assigned By */}
                      {enrollment.assignedBy && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                          <User className="h-4 w-4" />
                          <span>Assigned by {enrollment.assignedBy.name} ({enrollment.assignedBy.position})</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button - Always at bottom */}
                    <div className="mt-auto pt-4">
                      <Button
                        onClick={() => handleStartPlan(enrollment)}
                        className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${getPlanGradient(enrollment.planId)} hover:scale-105 border-0`}
                      >
                        <div className="flex items-center gap-2">
                          {enrollment.status === 'completed' ? (
                            <>
                              <Award className="h-5 w-5" />
                              Review Plan
                            </>
                          ) : enrollment.status === 'in-progress' ? (
                            <>
                              <PlayCircle className="h-5 w-5" />
                              Continue Journey
                            </>
                          ) : (
                            <>
                              <Rocket className="h-5 w-5" />
                              Start Journey
                            </>
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Available Plans for Enrollment */}
      {availableForEnrollment.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Discover New Plans</h2>
              <p className="text-gray-600">Expand your leadership journey with these amazing development opportunities</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {availableForEnrollment.map((plan) => (
              <Card key={plan.id} className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative flex flex-col h-full">
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${getPlanGradient(plan.id)}`}></div>

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 bg-gradient-to-r ${getPlanGradient(plan.id)} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-gray-900 leading-tight mb-2">
                        {plan.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-3">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-2 flex-1 flex flex-col">
                  <div className="flex-1 space-y-6">
                    {/* Duration Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{plan.estimatedWeeks} weeks</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Star className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    </div>

                    {/* Book Info */}
                    {plan.book && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900 mb-1">
                              {plan.book.title}
                            </p>
                            <p className="text-sm text-blue-700">
                              by {plan.book.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chick-fil-A Focus */}
                    {plan.chickFilAFocus && (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-500 rounded-lg">
                            <Heart className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-red-900 mb-1">Chick-fil-A Focus</p>
                            <p className="text-sm text-red-800">{plan.chickFilAFocus}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enroll Button - Always at bottom */}
                  <div className="mt-auto pt-4">
                    <Button
                      onClick={() => handleEnrollInPlan(plan.id)}
                      className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${getPlanGradient(plan.id)} hover:scale-105 border-0 group-hover:animate-pulse`}
                    >
                      <div className="flex items-center gap-2">
                        <Rocket className="h-5 w-5" />
                        Start This Journey
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="text-center py-16">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Growth Journey Awaits</h3>
            <p className="text-gray-600 mb-6">
              Every great leader started with a single step. Choose a development plan today and unlock your potential at Chick-fil-A.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Build Leadership Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Serve with Excellence</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span>Achieve Your Goals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default MyPlans
