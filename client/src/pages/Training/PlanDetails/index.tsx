import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Users, Calendar, Edit2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import CreatePlanForm from '../Progress/components/CreatePlanForm'
import api from '@/lib/axios'

interface Task {
  name: string
  description: string
  duration: number
  pathwayUrl?: string
  competencyChecklist?: string[]
}

interface Day {
  dayNumber: number
  tasks: Task[]
}

interface TrainingPlan {
  _id: string
  name: string
  description: string
  department: string
  position: string
  type: string
  days: Day[]
  createdAt: string
  selfPaced: boolean
  createdBy: {
    firstName: string
    lastName: string
  }
}

export default function PlanDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchPlanDetails()
  }, [id])

  const fetchPlanDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/training/plans/${id}`)
      setPlan(response.data)
    } catch (error) {
      console.error('Failed to fetch plan details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load plan details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditPlan = async (updatedPlan: NewTrainingPlan) => {
    try {
      await api.put(`/api/training/plans/${id}`, updatedPlan)
      toast({
        title: 'Success',
        description: 'Training plan updated successfully',
      })
      setIsEditDialogOpen(false)
      fetchPlanDetails() // Refresh the plan details
    } catch (error) {
      console.error('Failed to update training plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to update training plan',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePlan = async () => {
    try {
      await api.delete(`/api/training/plans/${id}`)
      toast({
        title: 'Success',
        description: 'Training plan deleted successfully',
      })
      navigate('/training/plans')
    } catch (error) {
      console.error('Failed to delete training plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete training plan',
        variant: 'destructive',
      })
    }
  }

  const calculateTotalDuration = (days: Day[]) => {
    const totalMinutes = days.reduce((acc, day) => {
      const dayMinutes = day.tasks.reduce((sum, task) => sum + task.duration, 0)
      return acc + dayMinutes
    }, 0)
    
    const weeks = Math.floor(totalMinutes / (5 * 8 * 60)) // Assuming 8 hours per day, 5 days per week
    const remainingDays = Math.ceil((totalMinutes % (5 * 8 * 60)) / (8 * 60))
    
    if (weeks > 0) {
      return `${weeks} weeks ${remainingDays} days`
    }
    return `${remainingDays} days`
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
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          Training plan not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/training/plans')}
            className="gap-2 hover:bg-gray-100 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Button>
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            className="gap-2 bg-[#E51636] text-white hover:bg-[#E51636]/90 w-full sm:w-auto"
          >
            <Edit2 className="h-4 w-4" />
            Edit Plan
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2 border-[#E51636] text-[#E51636] hover:bg-[#E51636]/10 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Plan
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Title and Description */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-[#27251F] break-words">{plan.name}</h1>
                  {plan.description && (
                    <p className="text-[#27251F]/60 text-base break-words">{plan.description}</p>
                  )}
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <div className="text-[#E51636]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#27251F]/60">Position</p>
                      <p className="font-medium text-[#27251F]">{plan.position}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <div className="text-[#E51636]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#27251F]/60">Duration</p>
                      <p className="font-medium text-[#27251F]">{calculateTotalDuration(plan.days)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                    <div className="text-[#E51636]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#27251F]/60">Type</p>
                      <p className="font-medium text-[#27251F]">{plan.type}</p>
                    </div>
                  </div>
                </div>

                {/* Days Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-[#27251F]">Training Schedule</h2>
                  {plan.days.map((day) => (
                    <Card key={day.dayNumber} className="border border-[#27251F]/10">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium mb-4 text-[#27251F]">Day {day.dayNumber}</h3>
                        <div className="space-y-4">
                          {day.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="p-4 border rounded-lg border-[#27251F]/10">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1 min-w-0">
                                  <h4 className="font-medium text-[#27251F] break-words">{task.name}</h4>
                                  {task.description && (
                                    <p className="text-sm text-[#27251F]/60 break-words">{task.description}</p>
                                  )}
                                </div>
                                <span className="text-sm text-[#27251F]/60 whitespace-nowrap">{task.duration} minutes</span>
                              </div>
                              {task.pathwayUrl && (
                                <div className="mt-3 text-sm">
                                  <span className="text-[#27251F]/60">Pathway: </span>
                                  <a 
                                    href={task.pathwayUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#E51636] hover:text-[#E51636]/90 break-words"
                                  >
                                    {task.pathwayUrl}
                                  </a>
                                </div>
                              )}
                              {task.competencyChecklist && task.competencyChecklist.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-2 text-[#27251F]">Competency Checklist:</h5>
                                  <ul className="list-disc list-inside text-sm text-[#27251F]/60 space-y-1">
                                    {task.competencyChecklist.map((item, index) => (
                                      <li key={index} className="break-words">{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Training Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this training plan? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePlan}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Training Plan</DialogTitle>
            </DialogHeader>
            <CreatePlanForm 
              onSubmit={handleEditPlan}
              initialData={{
                name: plan.name,
                description: plan.description,
                department: plan.department,
                position: plan.position,
                type: plan.type as 'New Hire' | 'Regular',
                days: plan.days,
                selfPaced: plan.selfPaced
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 