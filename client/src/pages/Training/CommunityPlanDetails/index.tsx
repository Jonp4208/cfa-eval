import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Download, 
  Heart, 
  Star, 
  Clock, 
  Users, 
  Building2, 
  GraduationCap,
  CheckCircle2,
  Calendar,
  MapPin
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'


interface CommunityPlan {
  _id: string
  name: string
  description: string
  department: string
  position: string
  type: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  rating: number
  downloads: number
  likes: number
  isLiked: boolean
  tags: string[]
  store: {
    name: string
    location: string
    id: string
  }
  author: {
    name: string
    position: string
  }
  createdAt: string
  days: any[]
  isShared: boolean
}

export default function CommunityPlanDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<CommunityPlan | null>(null)

  useEffect(() => {
    if (id) {
      fetchPlanDetails()
    }
  }, [id])

  const fetchPlanDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/training/community-plans/${id}`)
      setPlan(response.data)
    } catch (error) {
      console.error('Failed to fetch plan details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load plan details',
        variant: 'destructive',
      })
      navigate('/training/community-plans')
    } finally {
      setLoading(false)
    }
  }

  const handleLikePlan = async () => {
    if (!plan) return
    
    try {
      await api.post(`/api/training/community-plans/${plan._id}/like`)
      setPlan(prev => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      } : null)
    } catch (error) {
      console.error('Failed to like plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to like plan',
        variant: 'destructive',
      })
    }
  }

  const handleAddToStore = async () => {
    if (!plan) return

    try {
      const response = await api.post(`/api/training/community-plans/${plan._id}/add-to-store`)
      setPlan(prev => prev ? {
        ...prev,
        downloads: response.data.downloadCount
      } : null)
      toast({
        title: 'Success',
        description: `"${plan.name}" has been added to your training plans`,
      })
    } catch (error: any) {
      console.error('Failed to add plan to store:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add plan to your store',
        variant: 'destructive',
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
      case 'Intermediate':
        return 'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20'
      case 'Advanced':
        return 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
      default:
        return 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Plan not found</h2>
        <p className="text-gray-600 mt-2">The requested training plan could not be found.</p>
        <Button 
          onClick={() => navigate('/training/community-plans')}
          className="mt-4"
        >
          Back to Community Plans
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simple Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/training/community-plans')}
          className="gap-2 text-[#27251F]/60 hover:text-[#27251F] hover:bg-gray-100 rounded-xl px-3 py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community Plans
        </Button>
      </div>

      {/* Plan Overview Card */}
      <Card className="bg-white rounded-[20px] border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-[#E51636] to-[#DD1A21] rounded-3xl flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#27251F] mb-2">{plan.name}</h1>
                  <p className="text-[#27251F]/70 text-lg leading-relaxed">{plan.description}</p>
                </div>
              </div>

              {/* Plan Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Department</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#E51636] rounded-full"></div>
                    <p className="font-medium text-[#27251F]">{plan.department}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Position</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#004F71] rounded-full"></div>
                    <p className="font-medium text-[#27251F]">{plan.position}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#FDB022]" />
                    <p className="font-medium text-[#27251F]">{plan.duration}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Difficulty</p>
                  <Badge className={`${getDifficultyColor(plan.difficulty)} border text-xs w-fit`}>
                    {plan.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="space-y-6">
              {/* Store Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#004F71]" />
                    <p className="font-semibold text-[#27251F]">Shared by</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#27251F]">{plan.store.name}</p>
                    <p className="text-sm text-[#27251F]/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {plan.store.location}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-[#27251F]/60">Created by</p>
                    <p className="font-medium text-[#27251F]">{plan.author.name}</p>
                    <p className="text-sm text-[#27251F]/60">{plan.author.position}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-[#FDB022] fill-current" />
                    <span className="font-bold text-[#27251F]">{plan.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-[#27251F]/60">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Download className="h-4 w-4 text-[#004F71]" />
                    <span className="font-bold text-[#27251F]">{plan.downloads}</span>
                  </div>
                  <p className="text-xs text-[#27251F]/60">Downloads</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className={`h-4 w-4 ${plan.isLiked ? 'text-[#E51636] fill-current' : 'text-[#27251F]/40'}`} />
                    <span className="font-bold text-[#27251F]">{plan.likes}</span>
                  </div>
                  <p className="text-xs text-[#27251F]/60">Likes</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToStore}
                  className="w-full gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  <Download className="h-4 w-4" />
                  Add to My Store
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLikePlan}
                  className={`w-full gap-2 rounded-xl transition-all duration-200 font-medium ${
                    plan.isLiked 
                      ? 'border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/5' 
                      : 'border-gray-200 text-[#27251F]/60 hover:border-[#E51636]/20 hover:text-[#E51636]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${plan.isLiked ? 'fill-current' : ''}`} />
                  {plan.isLiked ? 'Liked' : 'Like Plan'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Content */}
      <Card className="bg-white rounded-[20px] border-0 shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#27251F]">Training Plan Details</h2>
          <p className="text-[#27251F]/60">Complete breakdown of the training program</p>
        </CardHeader>
        <CardContent className="p-6">
          {plan.days && plan.days.length > 0 ? (
            <div className="space-y-6">
              {plan.days.map((day, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-[#E51636] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-[#27251F]">Day {index + 1}</h3>
                  </div>
                  {day.tasks && day.tasks.length > 0 && (
                    <div className="space-y-3">
                      {day.tasks.map((task: any, taskIndex: number) => (
                        <div key={taskIndex} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-[#27251F]">{task.name}</p>
                                {task.description && (
                                  <p className="text-sm text-[#27251F]/60 mt-1">{task.description}</p>
                                )}
                                {task.pathwayUrl && (
                                  <a
                                    href={task.pathwayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#E51636] hover:underline mt-1 inline-block"
                                  >
                                    📚 Pathway Link
                                  </a>
                                )}
                                {task.competencyChecklist && task.competencyChecklist.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-[#27251F]/60 font-medium mb-1">Competency Checklist:</p>
                                    <ul className="text-xs text-[#27251F]/70 space-y-0.5">
                                      {task.competencyChecklist.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-1">
                                          <span className="text-[#E51636] mt-0.5">•</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {task.duration && (
                                <div className="flex items-center gap-1 text-xs text-[#27251F]/60 bg-white px-2 py-1 rounded-md flex-shrink-0">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.duration} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-[#27251F]/60 font-medium">No detailed plan content available for preview</p>
              <p className="text-sm text-[#27251F]/40 mt-1">Add this plan to your store to see the full training details and start using it with your team.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
