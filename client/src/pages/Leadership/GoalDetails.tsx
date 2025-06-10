import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  ArrowLeft,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  Edit,
  Save,
  Plus,
  Trash2,
  Flag,
  BarChart3,
  Users,
  MessageSquare,
  FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  targetDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  milestones: string[]
  metrics: string
  createdAt: string
  updatedAt: string
  notes?: string[]
  activities?: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editingProgress, setEditingProgress] = useState(false)
  const [newProgress, setNewProgress] = useState(0)

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    on_hold: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const categoryIcons = {
    leadership: Users,
    operational: BarChart3,
    team: Users,
    personal: TrendingUp,
    customer: Star,
    financial: Target
  }

  useEffect(() => {
    if (id) {
      fetchGoal()
    }
  }, [id])

  const fetchGoal = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/leadership/goals/${id}`)
      setGoal(response.data)
      setNewProgress(response.data.progress)
    } catch (error) {
      console.error('Error fetching goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goal details. Please try again.',
        variant: 'destructive'
      })
      navigate('/leadership/goals')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async () => {
    if (!goal) return
    
    try {
      setSaving(true)
      await api.patch(`/leadership/goals/${goal.id}/progress`, { 
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
      })
      
      setGoal({
        ...goal,
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
      })
      
      setEditingProgress(false)
      toast({
        title: 'Progress Updated',
        description: 'Goal progress has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const addNote = async () => {
    if (!goal || !newNote.trim()) return
    
    try {
      setSaving(true)
      await api.post(`/leadership/goals/${goal.id}/notes`, { note: newNote })
      
      setGoal({
        ...goal,
        notes: [...(goal.notes || []), newNote]
      })
      
      setNewNote('')
      toast({
        title: 'Note Added',
        description: 'Your note has been added successfully.',
      })
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: 'Error',
        description: 'Failed to add note. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date() && new Date(targetDate).getTime() !== 0
  }

  const getDaysUntilTarget = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Goal Not Found</h3>
        <p className="text-gray-500 mb-4">The goal you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/leadership/goals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[goal.category as keyof typeof categoryIcons] || Target
  const isGoalOverdue = isOverdue(goal.targetDate)
  const daysUntilTarget = getDaysUntilTarget(goal.targetDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/leadership/goals')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Button>
        <Button
          onClick={() => navigate('/leadership/goal-setting')}
          className="bg-[#E51636] hover:bg-[#E51636]/90 flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Goal
        </Button>
      </div>

      {/* Goal Overview */}
      <Card className="bg-gradient-to-r from-[#E51636] to-[#B91C3C] text-white">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                <CategoryIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
                <p className="text-white/90 text-lg mb-4">{goal.description}</p>
                <div className="flex gap-2">
                  <Badge className={`${priorityColors[goal.priority]} text-gray-800`}>
                    {goal.priority} priority
                  </Badge>
                  <Badge className={`${statusColors[goal.status]} text-gray-800`}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                  {isGoalOverdue && (
                    <Badge className="bg-red-200 text-red-800 border-red-300">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">{goal.progress}%</div>
              <div className="text-white/80">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#E51636]" />
              Progress Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Overall Progress</span>
                <div className="flex items-center gap-2">
                  {editingProgress ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newProgress}
                        onChange={(e) => setNewProgress(Number(e.target.value))}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                      <span>%</span>
                      <Button size="sm" onClick={updateProgress} disabled={saving}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProgress(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-[#E51636]">{goal.progress}%</span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProgress(true)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Progress value={goal.progress} className="h-4" />
            </div>

            {/* Milestones */}
            {goal.milestones.length > 0 && goal.milestones[0] && (
              <div>
                <h3 className="font-semibold mb-3">Milestones</h3>
                <div className="space-y-2">
                  {goal.milestones.filter(m => m.trim()).map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#E51636]" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {daysUntilTarget > 0 ? daysUntilTarget : 'Overdue'}
              </div>
              <div className="text-sm text-blue-600">
                {daysUntilTarget > 0 ? 'Days remaining' : 'Days overdue'}
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{formatDate(goal.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Date:</span>
                <span className={isGoalOverdue ? 'text-red-600 font-medium' : ''}>
                  {formatDate(goal.targetDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDate(goal.updatedAt)}</span>
              </div>
            </div>

            {goal.metrics && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Success Metrics</h4>
                <p className="text-sm text-gray-600">{goal.metrics}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes and Activities */}
      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Goal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about your progress, challenges, or insights..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={addNote}
                  disabled={!newNote.trim() || saving}
                  className="bg-[#E51636] hover:bg-[#E51636]/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {goal.notes && goal.notes.length > 0 ? (
                <div className="space-y-3">
                  {goal.notes.map((note, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{note}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Added on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notes yet</p>
                  <p className="text-sm">Add notes to track your progress and insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No activities yet</p>
                <p className="text-sm">Activities will appear here as you work on your goal</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
