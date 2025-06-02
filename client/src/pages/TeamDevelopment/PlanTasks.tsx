import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock, ExternalLink, Trophy, Target, Brain, Heart, Users, Shield, TrendingUp, Zap, GraduationCap, Rocket, Star, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import GrowthMindsetVideoForm from '@/components/teamDevelopment/GrowthMindsetVideoForm'
import ServiceExcellenceActivityForm from '@/components/teamDevelopment/ServiceExcellenceActivityForm'
import TeamDevelopmentReflectionForm from '@/components/teamDevelopment/TeamDevelopmentReflectionForm'
import { api } from '@/lib/api'

interface LearningTask {
  id: string
  type: 'video' | 'reading' | 'activity' | 'reflection' | 'assessment' | 'task'
  title: string
  description: string
  resourceUrl?: string
  estimatedTime: string
  completed: boolean
  completedAt?: string
  notes?: string
  evidence?: string
  chickFilAExample?: string
}

interface PlanData {
  planId: string
  enrollment: {
    _id: string
    status: string
    progress: number
    enrolledAt: string
    startedAt?: string
    completedAt?: string
  }
  tasks: LearningTask[]
}

const PlanTasks: React.FC = () => {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const [planData, setPlanData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<LearningTask | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionEvidence, setCompletionEvidence] = useState('')
  const [completing, setCompleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (planId) {
      fetchPlanTasks()
    }
  }, [planId])

  const fetchPlanTasks = async () => {
    try {
      const response = await api.get(`/team-member-development/plans/${planId}/tasks`)
      setPlanData(response.data)
    } catch (error) {
      console.error('Error fetching plan tasks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load plan tasks.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task: LearningTask) => {
    setSelectedTask(task)
    setCompletionNotes(task.notes || '')
    setCompletionEvidence(task.evidence || '')
    setCompletionDialogOpen(true)
  }

  const getCustomForm = () => {
    if (!selectedTask) return null

    // Growth Mindset video tasks
    if (selectedTask.type === 'video' && selectedTask.id.startsWith('gmc-')) {
      return (
        <GrowthMindsetVideoForm
          open={completionDialogOpen}
          onOpenChange={setCompletionDialogOpen}
          onComplete={handleCompleteTask}
          task={selectedTask}
          isCompleted={selectedTask.completed}
          existingEvidence={selectedTask.evidence}
          existingNotes={selectedTask.notes}
        />
      )
    }

    // Service Excellence activity tasks
    if (selectedTask.type === 'activity' && selectedTask.id.startsWith('sms-')) {
      return (
        <ServiceExcellenceActivityForm
          open={completionDialogOpen}
          onOpenChange={setCompletionDialogOpen}
          onComplete={handleCompleteTask}
          task={selectedTask}
          isCompleted={selectedTask.completed}
          existingEvidence={selectedTask.evidence}
          existingNotes={selectedTask.notes}
        />
      )
    }

    // Reflection tasks for all plans
    if (selectedTask.type === 'reflection') {
      return (
        <TeamDevelopmentReflectionForm
          open={completionDialogOpen}
          onOpenChange={setCompletionDialogOpen}
          onComplete={handleCompleteTask}
          task={selectedTask}
          isCompleted={selectedTask.completed}
          existingEvidence={selectedTask.evidence}
          existingNotes={selectedTask.notes}
        />
      )
    }

    // Default form for other tasks
    return null
  }

  const handleCompleteTask = async (evidence: string, notes: string) => {
    if (!selectedTask || !evidence.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide evidence of completion.',
        variant: 'destructive'
      })
      return
    }

    setCompleting(true)
    try {
      await api.post(`/team-member-development/plans/${planId}/tasks/${selectedTask.id}/complete`, {
        evidence,
        notes
      })

      toast({
        title: 'Success',
        description: 'Task completed successfully!',
      })

      setCompletionDialogOpen(false)
      setSelectedTask(null)
      setCompletionNotes('')
      setCompletionEvidence('')
      fetchPlanTasks() // Refresh data
    } catch (error: any) {
      console.error('Error completing task:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete task.',
        variant: 'destructive'
      })
    } finally {
      setCompleting(false)
    }
  }

  const handleGenericCompleteTask = async () => {
    if (!selectedTask || !completionEvidence.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide evidence of completion.',
        variant: 'destructive'
      })
      return
    }

    await handleCompleteTask(completionEvidence, completionNotes)
  }

  const getTaskIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }

    switch (type) {
      case 'video':
        return <Play className="h-5 w-5 text-blue-600" />
      case 'reading':
        return <BookOpen className="h-5 w-5 text-purple-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800'
      case 'reading':
        return 'bg-purple-100 text-purple-800'
      case 'reflection':
        return 'bg-green-100 text-green-800'
      case 'activity':
        return 'bg-orange-100 text-orange-800'
      case 'assessment':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'growth-mindset-champion':
        return <Brain className="h-8 w-8" />
      case 'second-mile-service':
        return <Heart className="h-8 w-8" />
      case 'team-unity-builder':
        return <Users className="h-8 w-8" />
      case 'ownership-initiative':
        return <Shield className="h-8 w-8" />
      case 'continuous-improvement':
        return <TrendingUp className="h-8 w-8" />
      case 'positive-energy-creator':
        return <Zap className="h-8 w-8" />
      default:
        return <Target className="h-8 w-8" />
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

  const getPlanTitle = (planId: string) => {
    return planId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!planData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Plan not found or you don't have access to it.</p>
        <Button onClick={() => navigate('/team-development/my-plans')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Plans
        </Button>
      </div>
    )
  }

  const completedTasks = planData.tasks.filter(task => task.completed).length
  const totalTasks = planData.tasks.length

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${getPlanGradient(planData.planId)} text-white`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/team-development/my-plans')}
              className="mb-6 text-white hover:bg-white/20 border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Plans
            </Button>

            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                {getPlanIcon(planData.planId)}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  {getPlanTitle(planData.planId)}
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  Complete the learning tasks below to progress through your development journey
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-300" />
                    <span>{completedTasks} of {totalTasks} Tasks Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-300" />
                    <span>{planData.enrollment.progress}% Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-300" />
                    <span className="capitalize">{planData.enrollment.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* Progress Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${getPlanGradient(planData.planId)}`}></div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-gradient-to-r ${getPlanGradient(planData.planId)} rounded-xl text-white shadow-lg`}>
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Your Progress</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your development journey completion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Learning Progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">{planData.enrollment.progress}%</span>
                  <Badge className={`${planData.enrollment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} border-0 shadow-sm`}>
                    <div className="flex items-center gap-1">
                      {planData.enrollment.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span className="capitalize">{planData.enrollment.status.replace('-', ' ')}</span>
                    </div>
                  </Badge>
                </div>
              </div>
              <Progress value={planData.enrollment.progress} className="h-4 bg-gray-200" />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {completedTasks} of {totalTasks} learning tasks completed
                </p>
                <div className="text-sm text-gray-500">
                  {totalTasks - completedTasks} remaining
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Tasks */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 bg-gradient-to-r ${getPlanGradient(planData.planId)} rounded-lg`}>
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Learning Tasks</h2>
              <p className="text-gray-600">Complete each task to advance your development</p>
            </div>
          </div>

          <div className="grid gap-6">
            {planData.tasks.map((task, index) => (
              <Card
                key={task.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg overflow-hidden ${
                  task.completed
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30'
                }`}
                onClick={() => handleTaskClick(task)}
              >
                {/* Task Number & Status Header */}
                <div className={`h-2 bg-gradient-to-r ${task.completed ? 'from-green-500 to-emerald-500' : getPlanGradient(planData.planId)}`}></div>

                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Task Number Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                      task.completed
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : `bg-gradient-to-r ${getPlanGradient(planData.planId)}`
                    }`}>
                      {task.completed ? <CheckCircle className="h-6 w-6" /> : index + 1}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                            {task.completed && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>

                          {task.chickFilAExample && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100 mb-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-500 rounded-lg">
                                  <Heart className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-red-900 mb-1">Chick-fil-A Example</p>
                                  <p className="text-sm text-red-800">{task.chickFilAExample}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Task Meta Info */}
                        <div className="flex flex-col items-end gap-3">
                          <Badge className={`${getTaskTypeColor(task.type)} border-0 shadow-sm`}>
                            <div className="flex items-center gap-1">
                              {getTaskIcon(task.type, false)}
                              <span className="capitalize">{task.type}</span>
                            </div>
                          </Badge>

                          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>{task.estimatedTime}</span>
                          </div>

                          {task.resourceUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(task.resourceUrl, '_blank')
                              }}
                              className="shadow-sm hover:shadow-md transition-shadow"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Resource
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                          className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                            task.completed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                              : `bg-gradient-to-r ${getPlanGradient(planData.planId)}`
                          } hover:scale-105 border-0`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskClick(task)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {task.completed ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                View Details
                              </>
                            ) : (
                              <>
                                <Play className="h-5 w-5" />
                                Start Task
                              </>
                            )}
                            <Sparkles className="h-4 w-4" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Task Completion Forms */}
      {getCustomForm()}

      {/* Generic Task Completion Dialog */}
      {selectedTask && !getCustomForm() && (
        <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTask?.completed ? 'Task Details' : 'Complete Task'}
              </DialogTitle>
              <DialogDescription>
                {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedTask.chickFilAExample && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-800">
                    <span className="font-medium">Chick-fil-A Example:</span> {selectedTask.chickFilAExample}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="evidence">Evidence of Completion *</Label>
                <Textarea
                  id="evidence"
                  placeholder="Describe what you learned, how you applied it, or provide specific examples..."
                  value={completionEvidence}
                  onChange={(e) => setCompletionEvidence(e.target.value)}
                  className="min-h-[100px]"
                  disabled={selectedTask.completed}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional thoughts, questions, or reflections..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  disabled={selectedTask.completed}
                />
              </div>

              {!selectedTask.completed && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCompletionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenericCompleteTask}
                    disabled={completing || !completionEvidence.trim()}
                  >
                    {completing ? 'Completing...' : 'Complete Task'}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default PlanTasks
