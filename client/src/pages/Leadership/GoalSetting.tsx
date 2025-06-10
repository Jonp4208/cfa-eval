import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Target,
  Plus,
  Trash2,
  Save,
  Calendar,
  Flag,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Users,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface Goal {
  id?: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  targetDate: Date | null
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  milestones: string[]
  metrics: string
}

export default function GoalSetting() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const [newGoal, setNewGoal] = useState<Goal>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    targetDate: null,
    status: 'not_started',
    progress: 0,
    milestones: [''],
    metrics: ''
  })

  const goalCategories = [
    { value: 'leadership', label: 'Leadership Development', icon: Users },
    { value: 'operational', label: 'Operational Excellence', icon: BarChart3 },
    { value: 'team', label: 'Team Building', icon: Users },
    { value: 'personal', label: 'Personal Growth', icon: TrendingUp },
    { value: 'customer', label: 'Customer Experience', icon: Star },
    { value: 'financial', label: 'Financial Performance', icon: Target }
  ]

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

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/leadership/goals')
      setGoals(response.data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveGoal = async (goalData: Goal) => {
    try {
      setSaving(true)
      if (goalData.id) {
        // Update existing goal
        await api.put(`/leadership/goals/${goalData.id}`, goalData)
        setGoals(goals.map(g => g.id === goalData.id ? goalData : g))
        toast({
          title: 'Goal Updated',
          description: 'Your goal has been updated successfully.',
        })
      } else {
        // Create new goal
        const response = await api.post('/leadership/goals', goalData)
        setGoals([...goals, response.data])
        toast({
          title: 'Goal Created',
          description: 'Your new goal has been created successfully.',
        })
      }
      
      setShowNewGoalForm(false)
      setEditingGoal(null)
      resetNewGoal()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to save goal. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      await api.delete(`/leadership/goals/${goalId}`)
      setGoals(goals.filter(g => g.id !== goalId))
      toast({
        title: 'Goal Deleted',
        description: 'The goal has been deleted successfully.',
      })
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const resetNewGoal = () => {
    setNewGoal({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      targetDate: null,
      status: 'not_started',
      progress: 0,
      milestones: [''],
      metrics: ''
    })
  }

  const addMilestone = (goalData: Goal, setGoalData: (goal: Goal) => void) => {
    setGoalData({
      ...goalData,
      milestones: [...goalData.milestones, '']
    })
  }

  const updateMilestone = (goalData: Goal, setGoalData: (goal: Goal) => void, index: number, value: string) => {
    const updatedMilestones = [...goalData.milestones]
    updatedMilestones[index] = value
    setGoalData({
      ...goalData,
      milestones: updatedMilestones
    })
  }

  const removeMilestone = (goalData: Goal, setGoalData: (goal: Goal) => void, index: number) => {
    setGoalData({
      ...goalData,
      milestones: goalData.milestones.filter((_, i) => i !== index)
    })
  }

  const GoalForm = ({ 
    goalData, 
    setGoalData, 
    onSave, 
    onCancel 
  }: { 
    goalData: Goal
    setGoalData: (goal: Goal) => void
    onSave: () => void
    onCancel: () => void
  }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[#E51636]" />
          {goalData.id ? 'Edit Goal' : 'Create New Goal'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={goalData.title}
              onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
              placeholder="Enter goal title"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={goalData.category} onValueChange={(value) => setGoalData({ ...goalData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {goalCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={goalData.description}
            onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
            placeholder="Describe your goal in detail"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={goalData.priority} onValueChange={(value: any) => setGoalData({ ...goalData, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={goalData.status} onValueChange={(value: any) => setGoalData({ ...goalData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="targetDate">Target Date</Label>
            <DatePicker
              date={goalData.targetDate}
              onDateChange={(date) => setGoalData({ ...goalData, targetDate: date })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="metrics">Success Metrics</Label>
          <Textarea
            id="metrics"
            value={goalData.metrics}
            onChange={(e) => setGoalData({ ...goalData, metrics: e.target.value })}
            placeholder="How will you measure success?"
            rows={2}
          />
        </div>

        <div>
          <Label>Milestones</Label>
          <div className="space-y-2">
            {goalData.milestones.map((milestone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={milestone}
                  onChange={(e) => updateMilestone(goalData, setGoalData, index, e.target.value)}
                  placeholder={`Milestone ${index + 1}`}
                />
                {goalData.milestones.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMilestone(goalData, setGoalData, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMilestone(goalData, setGoalData)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={!goalData.title || !goalData.category || saving}
            className="bg-[#E51636] hover:bg-[#E51636]/90"
          >
            {saving ? 'Saving...' : 'Save Goal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goal Setting</h1>
          <p className="text-gray-600">Set and track your leadership development goals</p>
        </div>
        <Button
          onClick={() => setShowNewGoalForm(true)}
          className="bg-[#E51636] hover:bg-[#E51636]/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* New Goal Form */}
      {showNewGoalForm && (
        <GoalForm
          goalData={newGoal}
          setGoalData={setNewGoal}
          onSave={() => saveGoal(newGoal)}
          onCancel={() => {
            setShowNewGoalForm(false)
            resetNewGoal()
          }}
        />
      )}

      {/* Edit Goal Form */}
      {editingGoal && (
        <GoalForm
          goalData={editingGoal}
          setGoalData={setEditingGoal}
          onSave={() => saveGoal(editingGoal)}
          onCancel={() => setEditingGoal(null)}
        />
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Goals Set</h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first leadership development goal
            </p>
            <Button
              onClick={() => setShowNewGoalForm(true)}
              className="bg-[#E51636] hover:bg-[#E51636]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{goal.title}</CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge className={priorityColors[goal.priority]}>
                        {goal.priority}
                      </Badge>
                      <Badge className={statusColors[goal.status]}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingGoal(goal)}
                  >
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{goal.description}</p>
                
                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}

                {goal.milestones.length > 0 && goal.milestones[0] && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Milestones:</h4>
                    <ul className="space-y-1">
                      {goal.milestones.filter(m => m.trim()).map((milestone, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/leadership/goals/${goal.id}`)}
                    className="flex items-center gap-2"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goal.id && deleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
