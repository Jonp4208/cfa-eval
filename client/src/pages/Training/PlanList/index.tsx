import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Eye, UserPlus, ClipboardList, Users, ClipboardCheck, CheckCircle2, Clock, TrendingUp, Target, Award, Calendar as CalendarIcon, BarChart2, BookOpen, GraduationCap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CreatePlanForm from '../Progress/components/CreatePlanForm'
import { toast } from '@/components/ui/use-toast'
import api from '@/lib/axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import PageHeader from '@/components/PageHeader'

interface TrainingPlan {
  _id: string
  name: string
  department: string
  position: string
  type: string
  days: {
    dayNumber: number
    tasks: {
      name: string
      description: string
      duration: number
      pathwayUrl?: string
      competencyChecklist?: string[]
    }[]
  }[]
  createdAt: string
  // Additional fields for team member assigned plans
  progressId?: string
  status?: string
  startDate?: string
  completedAt?: string
}

interface User {
  _id: string
  name: string
  email: string
  position: string
  department: string
}

export default function TrainingPlanList() {
  const navigate = useNavigate()
  const { user } = useAuth() // Get the current user from auth context
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([])
  const [assignedPlans, setAssignedPlans] = useState<TrainingPlan[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Check if user is a manager/leader/trainer or team member
  const isManager = ['Director', 'Leader', 'Trainer'].includes(user?.position || '')

  const handleCreatePlan = async (plan: any) => {
    try {
      await api.post('/api/training/plans', plan)
      toast({
        title: 'Success',
        description: 'Training plan created successfully',
      })
      setIsCreateDialogOpen(false)
      fetchTrainingPlans() // Refresh the list after creating
    } catch (error) {
      console.error('Failed to create training plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to create training plan',
        variant: 'destructive',
      })
    }
  }

  const handleViewDetails = (planId: string) => {
    navigate(`/training/plans/${planId}`)
  }

  const fetchTrainingPlans = async () => {
    try {
      setLoading(true)

      // Fetch all training plans (for managers)
      const response = await api.get('/api/training/plans')
      setTrainingPlans(response.data)

      // For team members, also fetch their assigned training plans
      if (!isManager) {
        const assignedResponse = await api.get('/api/training/user/assigned')
        console.log('Assigned plans response:', assignedResponse.data)

        // Transform the data to include both plans and progress
        const assignedPlansData = assignedResponse.data.map((progressItem: any) => {
          // Process this trainee progress item
          return {
            _id: progressItem.trainingPlan?._id || '',
            name: progressItem.trainingPlan?.name || 'Unknown Plan',
            description: progressItem.trainingPlan?.description || '',
            type: progressItem.trainingPlan?.type || 'Standard',
            department: progressItem.trainingPlan?.department || '',
            position: progressItem.trainingPlan?.position || '',
            days: progressItem.trainingPlan?.days || [],
            progress: progressItem.progress || 0,
            status: progressItem.status || 'not_started',
            startDate: progressItem.startDate || '',
            progressId: progressItem._id // Store the progress ID for navigation
          }
        })

        console.log('Transformed assigned plans:', assignedPlansData)
        setAssignedPlans(assignedPlansData)
      }
    } catch (error) {
      console.error('Failed to fetch training plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load training plans',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users', {
        params: {
          forTaskAssignment: true
        }
      })

      if (!response.data || !response.data.users) {
        console.error('Invalid response structure:', response.data)
        setUsers([])
        return
      }

      const transformedUsers = response.data.users
        .filter((user: any) => user.status !== 'inactive')
        .map((user: any) => ({
          _id: user._id,
          name: user.name || 'Unknown Name',
          email: user.email || '',
          position: user.position || '',
          department: user.departments?.[0] || ''
        }))

      setUsers(transformedUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
      setUsers([])
    }
  }

  const handleAssign = async () => {
    if (!selectedPlan || !selectedUser || !startDate) {
      toast({
        title: 'Error',
        description: 'Please select an employee, training plan, and start date',
        variant: 'destructive',
      })
      return
    }

    try {
      await api.post('/api/training/plans/assign', {
        employeeId: selectedUser,
        planId: selectedPlan._id,
        startDate: startDate.toISOString(),
      })

      toast({
        title: 'Success',
        description: 'Training plan assigned successfully',
      })
      setIsAssignDialogOpen(false)
      setSelectedPlan(null)
      setSelectedUser('')
      setStartDate(new Date())

      // Navigate to the training progress page
      navigate('/training/progress')
    } catch (error) {
      console.error('Failed to assign training plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign training plan',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchTrainingPlans()
    fetchUsers()
  }, [])

  // For team members, only show their assigned plans
  // For managers, show all plans
  const plansToDisplay = isManager ? trainingPlans : assignedPlans

  // Calculate stats for the info cards
  console.log('Plans to display:', plansToDisplay.map(plan => ({
    name: plan.name,
    status: plan.status,
    startDate: plan.startDate
  })));

  const activePlansCount = isManager
    ? trainingPlans.filter(plan => plan.status !== 'completed').length // For managers, all non-completed plans are active
    : plansToDisplay.filter(plan => {
        const isActive = plan.status === 'in_progress' ||
                        plan.status === 'IN_PROGRESS' ||
                        (!plan.status && plan.startDate); // Count plans with start date but no explicit status as active
        console.log(`Plan ${plan.name} active status: ${isActive}, status: ${plan.status}`);
        return isActive;
      }).length

  // Calculate completed plans count
  const completedPlansCount = plansToDisplay.filter(plan =>
    plan.status === 'completed' || plan.status === 'COMPLETED'
  ).length

  // Calculate average training duration in days
  const calculateAverageDuration = () => {
    if (!plansToDisplay.length) return '0'

    let totalMinutes = 0
    let planCount = 0

    plansToDisplay.forEach(plan => {
      if (plan.days && Array.isArray(plan.days)) {
        planCount++
        plan.days.forEach(day => {
          if (day?.tasks && Array.isArray(day.tasks)) {
            day.tasks.forEach(task => {
              totalMinutes += task?.duration || 0
            })
          }
        })
      }
    })

    if (planCount === 0) return '0'
    const avgMinutes = totalMinutes / planCount
    const avgDays = Math.ceil(avgMinutes / (8 * 60)) // Assuming 8 hours per day

    return avgDays.toString()
  }

  const filteredPlans = plansToDisplay.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.department && plan.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (plan.position && plan.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (plan.type && plan.type.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const calculateDuration = (days: TrainingPlan['days']) => {
    if (!days || !Array.isArray(days)) return '0d'

    const totalMinutes = days.reduce((acc, day) => {
      if (!day?.tasks || !Array.isArray(day.tasks)) return acc
      const dayMinutes = day.tasks.reduce((sum, task) => sum + (task?.duration || 0), 0)
      return acc + dayMinutes
    }, 0)

    const weeks = Math.floor(totalMinutes / (5 * 8 * 60)) // Assuming 8 hours per day, 5 days per week
    const remainingDays = Math.ceil((totalMinutes % (5 * 8 * 60)) / (8 * 60))

    if (weeks > 0) {
      return `${weeks}w ${remainingDays}d`
    }
    return `${remainingDays}d`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Active Plans Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E51636] to-[#DD1A21] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Active Plans</p>
                <h3 className="text-4xl font-bold text-white">{activePlansCount}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Currently active</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Total Plans Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#004F71] to-[#0066A1] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Total Plans</p>
                <h3 className="text-4xl font-bold text-white">{plansToDisplay.length}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Available plans</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Completed Plans Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Completed Plans</p>
                <h3 className="text-4xl font-bold text-white">{completedPlansCount}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Fully completed</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Average Duration Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FDB022] to-[#F39C12] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Avg. Duration</p>
                <h3 className="text-4xl font-bold text-white">{calculateAverageDuration()}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">Days to complete</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </div>

      {/* Enhanced Search and Create Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 rounded-xl"
          />
        </div>
        {/* Only show Create Plan button for managers */}
        {isManager && (
          <Button
            className="gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto px-8"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        )}
      </div>

      {/* Enhanced Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan._id} className="bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Plan Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#E51636] to-[#DD1A21] rounded-2xl flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#27251F] group-hover:text-[#E51636] transition-colors duration-200">{plan.name}</h3>
                        <p className="text-[#27251F]/60 text-sm">{plan.type}</p>
                      </div>
                    </div>

                    {/* Show status for team members */}
                    {!isManager && plan.status && (
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                        plan.status === 'completed' || plan.status === 'COMPLETED'
                          ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' :
                        plan.status === 'in_progress' || plan.status === 'IN_PROGRESS'
                          ? 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20' :
                        'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20'
                      }`}>
                        {plan.status === 'completed' || plan.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {plan.status === 'in_progress' || plan.status === 'IN_PROGRESS' && <Clock className="h-3 w-3 mr-1" />}
                        {plan.status === 'completed' || plan.status === 'COMPLETED' ? 'Completed' :
                         plan.status === 'in_progress' || plan.status === 'IN_PROGRESS' ? 'In Progress' :
                         'Not Started'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium bg-[#004F71]/10 text-[#004F71] px-3 py-1 rounded-full border border-[#004F71]/20">
                      {plan.days && plan.days.length > 0 ? calculateDuration(plan.days) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Enhanced Department and Position for managers */}
                {isManager ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Department</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-[#E51636] rounded-full"></div>
                        <p className="font-medium text-[#27251F]">{plan.department || 'All Departments'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Position</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-[#004F71] rounded-full"></div>
                        <p className="font-medium text-[#27251F]">{plan.position || 'All Positions'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Start Date</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-[#FDB022]" />
                        <p className="font-medium text-[#27251F]">
                          {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not Set'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">
                        {plan.status === 'completed' || plan.status === 'COMPLETED' ? 'Completed On' : 'Status'}
                      </p>
                      <div className="flex items-center gap-2">
                        {plan.status === 'completed' || plan.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                        ) : plan.status === 'in_progress' || plan.status === 'IN_PROGRESS' ? (
                          <Clock className="h-4 w-4 text-[#004F71]" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-[#FDB022]" />
                        )}
                        <p className="font-medium text-[#27251F]">
                          {plan.completedAt ?
                            new Date(plan.completedAt).toLocaleDateString() :
                            plan.status === 'in_progress' || plan.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // For team members, navigate to progress details
                      // For managers, navigate to plan details
                      if (!isManager && plan.progressId) {
                        navigate(`/training/progress/${plan.progressId}`)
                      } else {
                        handleViewDetails(plan._id)
                      }
                    }}
                    className="flex-1 gap-2 border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/5 hover:border-[#E51636] rounded-xl transition-all duration-200 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    {!isManager ? 'View Progress' : 'View Details'}
                  </Button>

                  {/* Only show Assign button for managers */}
                  {isManager && (
                    <Button
                      onClick={() => {
                        setSelectedPlan(plan)
                        setIsAssignDialogOpen(true)
                      }}
                      className="flex-1 gap-2 bg-gradient-to-r from-[#004F71] to-[#0066A1] hover:from-[#0066A1] hover:to-[#004F71] text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card className="bg-white rounded-[20px] border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 bg-gradient-to-br from-[#E51636]/10 to-[#DD1A21]/10 rounded-3xl flex items-center justify-center">
                <ClipboardList className="h-10 w-10 text-[#E51636]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#27251F]">No Training Plans Found</h3>
                <p className="text-[#27251F]/60 max-w-md">There are no training plans matching your search criteria. Try adjusting your search or create a new plan.</p>
              </div>
              {isManager && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-none shadow-lg rounded-[20px]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Create Training Plan</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <CreatePlanForm onSubmit={handleCreatePlan} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md bg-white border-none shadow-lg rounded-[20px]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Assign Training Plan</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} - {user.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal rounded-[20px] border-gray-200',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleAssign}
                className="w-full gap-2 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
              >
                <UserPlus className="h-4 h-4" />
                Assign Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}