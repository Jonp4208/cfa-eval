import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Users,
  BookOpen,
  BrainCircuit,
  Puzzle,
  Heart,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ClipboardList
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface EnrolledPlan {
  id: string
  title: string
  description: string
  status: 'enrolled' | 'in-progress' | 'completed' | 'abandoned'
  progress: number
  enrolledAt: string
  completedAt?: string
  enrollmentId: string
}

export default function MyPlans() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<EnrolledPlan[]>([])
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchMyPlans()
  }, [])

  const fetchMyPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leadership/my-plans')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching my plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your enrolled plans. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      setDeletingPlan(planId)
      await api.delete(`/api/leadership/my-plans/${planId}`)

      // Remove from local state
      setPlans(plans.filter(plan => plan.id !== planId))

      toast({
        title: 'Plan Deleted',
        description: 'The plan has been deleted. You can re-enroll from the Development Plans page.',
      })

      // Navigate to the development plans page
      navigate('/leadership/developmental-plan')
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete plan. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setDeletingPlan(null)
    }
  }

  const handleUpdateProgress = async (planId: string, newProgress: number, newStatus: string) => {
    try {
      setUpdatingPlan(planId)
      await api.patch(`/api/leadership/my-plans/${planId}/progress`, {
        progress: newProgress,
        status: newStatus
      })

      // Update local state
      setPlans(plans.map(plan =>
        plan.id === planId
          ? { ...plan, progress: newProgress, status: newStatus as any, completedAt: newStatus === 'completed' ? new Date().toISOString() : plan.completedAt }
          : plan
      ))

      toast({
        title: newStatus === 'completed' ? 'Plan Completed' : 'Progress Updated',
        description: newStatus === 'completed'
          ? 'Congratulations! You have completed this development plan.'
          : 'Your progress has been saved successfully.',
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingPlan(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'enrolled':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'enrolled':
        return 'Not Started'
      case 'abandoned':
        return 'Abandoned'
      default:
        return 'Unknown'
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'heart-of-leadership':
        return <Heart className="h-6 w-6" />
      case 'restaurant-culture-builder':
      case 'team-development':
        return <Users className="h-6 w-6" />
      default:
        return <GraduationCap className="h-6 w-6" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-[#E51636] animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="bg-white p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">No Plans Enrolled</h2>
            <p className="text-gray-500 max-w-md">
              You haven't enrolled in any leadership development plans yet. Explore available plans to start your leadership journey.
            </p>
            <Button
              onClick={() => navigate('/leadership/developmental-plan')}
              className="mt-2 bg-[#E51636] hover:bg-[#E51636]/90"
            >
              Explore Plans
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="bg-white p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/leadership/plans/${plan.id}/tasks`)}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                    {getPlanIcon(plan.id)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#27251F]">{plan.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Enrolled: {formatDate(plan.enrolledAt)}</span>
                      {plan.completedAt && (
                        <>
                          <span>•</span>
                          <span>Completed: {formatDate(plan.completedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600">{plan.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plan.status)}
                      <span className="text-sm font-medium">{getStatusText(plan.status)}</span>
                    </div>
                    <span className="text-sm font-medium">{plan.progress}% Complete</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {plan.status !== 'completed' && (
                      <>
                        {plan.status === 'enrolled' && (
                          <Button
                            variant="default"
                            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleUpdateProgress(plan.id, 10, 'in-progress');
                            }}
                            disabled={updatingPlan === plan.id}
                          >
                            {updatingPlan === plan.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Start Plan'
                            )}
                          </Button>
                        )}

                        {plan.status === 'in-progress' && (
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleUpdateProgress(plan.id, 100, 'completed');
                            }}
                            disabled={updatingPlan === plan.id}
                          >
                            {updatingPlan === plan.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Mark as Completed'
                            )}
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      variant="outline"
                      className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        navigate(`/leadership/developmental-plan?planId=${plan.id}`);
                      }}
                    >
                      View Plan Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
