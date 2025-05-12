import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, X, Circle, LinkIcon, CheckSquare, Users } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface Module {
  _id: string
  name: string
  description?: string
  position?: string
}

interface ModuleProgress {
  moduleId: string
  completed: boolean
  completionPercentage: number
  completedBy?: {
    _id: string
    name: string
    position: string
  }
  completedAt?: string
  notes?: string
}

interface CompetencyProgress {
  itemId: string
  completed: boolean
  completedBy?: {
    _id: string
    name: string
    position: string
  }
  completedAt?: string
}

interface TrainingDetails {
  _id: string
  trainee: {
    _id: string
    name: string
    position: string
    department: string
  }
  trainingPlan: {
    _id: string
    name: string
    description?: string
    type: string
    modules: Module[]
    usePhaseTerminology?: boolean
    days: {
      dayNumber: number
      tasks: {
        _id: string
        name: string
        description?: string
        progress: {
          completed: boolean
          completedBy?: {
            _id: string
            name: string
            position: string
          }
          completedAt?: string
        }
        urls?: string[]
        checklist?: string[]
        duration?: number
        pathwayUrl?: string
        competencyChecklist?: string[]
        competencyProgress?: CompetencyProgress[]
      }[]
    }[]
  }
  startDate: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  moduleProgress: ModuleProgress[]
}

export default function TrainingDetails() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [trainingDetails, setTrainingDetails] = useState<TrainingDetails | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<{
    id: string
    name: string
    completed: boolean
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Check if user is a manager/leader or team member
  const isManager = user?.position === 'Leader' || user?.position === 'Director'

  useEffect(() => {
    fetchTrainingDetails()
  }, [id])

  const handleModuleClick = (task: any) => {
    setSelectedModule({
      id: task._id,
      name: task.name,
      completed: task.progress?.completed || false
    })
    setNotes('')
    setIsUpdateDialogOpen(true)
  }

  const fetchTrainingDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/training/progress/${id}`)

      setTrainingDetails({
        ...response.data,
        trainee: response.data.trainee || {
          name: 'Unknown Trainee',
          position: 'Unknown Position'
        },
        trainingPlan: response.data.trainingPlan || {
          name: 'Unknown Plan',
          days: []
        }
      })
    } catch (error) {
      console.error('Failed to fetch training details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load training details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const canUpdateProgress = user?.position && ['Director', 'Leader', 'Trainer'].includes(user.position)

  const handleUpdateProgress = async () => {
    if (!selectedModule) return

    try {
      setIsUpdating(true)
      console.log('Updating module progress:', {
        progressId: id,
        moduleId: selectedModule.id,
        completed: !selectedModule.completed,
        notes: notes.trim()
      })

      // Update local state first
      setTrainingDetails(prev => {
        if (!prev) return prev

        const updatedDetails: TrainingDetails = {
          ...prev,
          trainingPlan: {
            ...prev.trainingPlan,
            days: prev.trainingPlan.days.map(day => ({
              ...day,
              tasks: day.tasks.map(task => {
                if (task._id !== selectedModule.id) return task

                return {
                  ...task,
                  progress: {
                    completed: !selectedModule.completed,
                    completedBy: !selectedModule.completed ? {
                      _id: user?._id || '',
                      name: user?.name || '',
                      position: user?.position || ''
                    } : undefined,
                    completedAt: !selectedModule.completed ? new Date().toISOString() : undefined,
                    notes: notes.trim()
                  }
                }
              })
            }))
          }
        }

        return updatedDetails
      })

      // Make API call in background
      await api.patch(`/api/training/progress/${id}/modules/${selectedModule.id}`, {
        completed: !selectedModule.completed,
        notes: notes.trim()
      })

      setIsUpdateDialogOpen(false)
      setSelectedModule(null)
      setNotes('')

      toast({
        title: 'Success',
        description: `Module marked as ${!selectedModule.completed ? 'completed' : 'incomplete'}`,
      })
    } catch (error) {
      console.error('Failed to update module progress:', error)

      // Revert local state on error
      await fetchTrainingDetails()

      toast({
        title: 'Error',
        description: 'Failed to update module progress. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompetencyCheck = async (taskId: string, itemId: string, isCompleted: boolean) => {
    try {
      setIsUpdating(true)

      // Update local state first
      setTrainingDetails(prev => {
        if (!prev) return prev

        const updatedDetails: TrainingDetails = {
          ...prev,
          trainingPlan: {
            ...prev.trainingPlan,
            days: prev.trainingPlan.days.map(day => ({
              ...day,
              tasks: day.tasks.map(task => {
                if (task._id !== taskId) return task

                const existingProgress = task.competencyProgress?.filter(cp => cp.itemId !== itemId) || []
                const newProgress: CompetencyProgress = {
                  itemId,
                  completed: isCompleted,
                  completedBy: isCompleted ? {
                    _id: user?._id || '',
                    name: user?.name || '',
                    position: user?.position || ''
                  } : undefined,
                  completedAt: isCompleted ? new Date().toISOString() : undefined
                }

                return {
                  ...task,
                  competencyProgress: [...existingProgress, newProgress]
                }
              })
            }))
          }
        }

        return updatedDetails
      })

      // Make API call in background
      await api.patch(`/api/training/progress/${id}/tasks/${taskId}/competency/${itemId}`, {
        completed: isCompleted
      })

      toast({
        title: 'Success',
        description: `Competency item ${isCompleted ? 'completed' : 'uncompleted'}`,
      })
    } catch (error) {
      console.error('Failed to update competency status:', error)

      // Revert local state on error
      await fetchTrainingDetails()

      toast({
        title: 'Error',
        description: 'Failed to update competency status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!trainingDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-[#E51636]" />
        <div className="text-lg font-semibold">Training details not found</div>
        <Button onClick={() => navigate(isManager ? '/training/progress' : '/training/plans')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isManager ? t('training.backToProgress', 'Back to Progress') : t('training.backToPlans', 'Back to My Training')}
        </Button>
      </div>
    )
  }

  const completedModules = trainingDetails.moduleProgress.filter(m => m.completed).length
  const totalModules = trainingDetails.trainingPlan.days.reduce((total, day) => total + day.tasks.length, 0)
  const progressPercentage = Math.round((completedModules / totalModules) * 100)

  return (
    <div className="p-1 sm:p-2 md:p-4 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(isManager ? '/training/progress' : '/training/plans')}
            className="gap-2 text-[#27251F] hover:text-[#27251F]/90 hover:bg-[#27251F]/10"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back', 'Back')}
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#27251F] line-clamp-2">
              {trainingDetails.trainingPlan.name}
            </h1>
            <p className="text-sm text-[#27251F]/60">
              Assigned to {trainingDetails.trainee.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[#27251F]/60 flex-shrink-0" />
          <span className="text-[#27251F]/60">
            Started {new Date(trainingDetails.startDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-4 w-full">
        <CardContent className="p-3 md:p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#27251F]">Progress Overview</h2>
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                trainingDetails.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : trainingDetails.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {trainingDetails.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <span className="text-sm font-medium min-w-[3rem] text-right">{progressPercentage}%</span>
            </div>
            <div className="text-sm text-[#27251F]/60">
              {completedModules} of {totalModules} tasks completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-3 w-full">
        {trainingDetails.trainingPlan.days.map((day, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base md:text-lg font-semibold text-[#27251F]">
                {trainingDetails.trainingPlan.usePhaseTerminology ? 'Phase' : 'Day'} {day.dayNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-0 space-y-3">
              {day.tasks.map((task) => (
                <div key={task._id} className="border border-[#27251F]/10 rounded-lg p-2 sm:p-3 space-y-3 w-full">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 w-full">
                      <h3 className="font-medium text-[#27251F] break-words">{task.name}</h3>
                      {task.description && (
                        <p className="text-sm text-[#27251F]/60 break-words whitespace-pre-wrap">{task.description}</p>
                      )}
                      {task.duration && (
                        <p className="text-sm text-[#27251F]/60 flex items-center gap-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          Duration: {task.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pathway URL */}
                  {task.pathwayUrl && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#27251F]">Pathway Resource</h4>
                      <a
                        href={task.pathwayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#E51636] hover:text-[#E51636]/90 flex items-center gap-1 break-words"
                      >
                        <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        Access Pathway Training
                      </a>
                    </div>
                  )}

                  {/* Additional URLs Section */}
                  {task.urls && task.urls.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#27251F]">Additional Resources</h4>
                      <div className="space-y-1">
                        {task.urls.map((url, urlIndex) => (
                          <a
                            key={urlIndex}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#E51636] hover:text-[#E51636]/90 flex items-center gap-1 break-words"
                          >
                            <LinkIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-2">{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competency Checklist Section */}
                  {task.competencyChecklist && task.competencyChecklist.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold mb-2 text-[#27251F]">Competency Checklist</h4>
                      <div className="space-y-2">
                        {task.competencyChecklist.map((item, itemIndex) => {
                          const itemId = `${task._id}-${itemIndex}`
                          const progress = task.competencyProgress?.find(cp => cp.itemId === itemId)

                          return (
                            <div
                              key={itemId}
                              className="flex items-start gap-2 min-w-0 w-full"
                            >
                              <div
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (canUpdateProgress && !isUpdating) {
                                    const newState = !progress?.completed
                                    void handleCompetencyCheck(task._id, itemId, newState)
                                  }
                                }}
                                className="mt-0.5 flex-shrink-0 cursor-pointer"
                                aria-disabled={!canUpdateProgress || isUpdating}
                              >
                                <Checkbox
                                  checked={progress?.completed || false}
                                  disabled={!canUpdateProgress || isUpdating}
                                  aria-label={`Mark ${item} as ${progress?.completed ? 'incomplete' : 'complete'}`}
                                />
                              </div>
                              <div className="flex-1 space-y-1 min-w-0 w-full">
                                <span className="text-sm leading-tight text-[#27251F] break-words">
                                  {item}
                                </span>
                                {progress?.completedBy && (
                                  <div className="text-xs text-[#27251F]/60 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      Completed by {progress.completedBy.name} on {new Date(progress.completedAt!).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* General Checklist Section */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#27251F]">Additional Checklist</h4>
                      <div className="space-y-1">
                        {task.checklist.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-2 w-full">
                            <div className="mt-0.5">
                              <CheckSquare className="w-4 h-4 text-[#27251F]/60 flex-shrink-0" />
                            </div>
                            <span className="text-sm text-[#27251F]/80 flex-1 break-words">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion Details and Action */}
                  {(task.progress?.completed || canUpdateProgress) && (
                    <div className="mt-4 pt-3 border-t border-[#27251F]/10">
                      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-3">
                        {task.progress?.completed && task.progress?.completedBy && (
                          <div className="text-xs md:text-sm text-[#27251F]/60 flex items-center gap-1 flex-wrap">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed by {task.progress.completedBy.name}</span>
                            {task.progress.completedAt && (
                              <span className="whitespace-nowrap"> on {new Date(task.progress.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        {canUpdateProgress && (
                          <Button
                            variant={task.progress?.completed ? "outline" : "default"}
                            className={`w-full md:w-auto whitespace-nowrap ${
                              task.progress?.completed
                                ? "bg-green-100 hover:bg-green-200 border-green-200 text-green-800"
                                : "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                            }`}
                            onClick={() => handleModuleClick(task)}
                          >
                            {task.progress?.completed ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 mr-2" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="w-[98%] max-w-[425px] p-3 sm:p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-[#27251F] text-center">
              {selectedModule?.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <h4 className="font-medium text-[#27251F] break-words">{selectedModule?.name}</h4>
              <Textarea
                placeholder="Add notes about completion or reason for incompletion..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false)
                setSelectedModule(null)
                setNotes('')
              }}
              disabled={isUpdating}
              className="flex-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateProgress}
              disabled={isUpdating}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90 flex-1 w-full sm:w-auto"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Updating...
                </div>
              ) : selectedModule?.completed ? (
                'Mark as Incomplete'
              ) : (
                'Mark as Complete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}