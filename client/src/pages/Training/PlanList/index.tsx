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
import { Plus, Search, Eye, UserPlus, ClipboardList, Users, ClipboardCheck } from 'lucide-react'
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
import { CalendarIcon } from 'lucide-react'
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

  // Check if user is a manager/leader or team member
  const isManager = user?.position === 'Leader' || user?.position === 'Director'

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
            progress: progressItem.progress || 0,
            status: progressItem.status || 'not_started',
            startDate: progressItem.startDate || '',
            progressId: progressItem._id // Store the progress ID for navigation
          }
        })

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
  const activePlansCount = isManager
    ? trainingPlans.filter(plan => plan.status !== 'completed').length // For managers, all non-completed plans are active
    : plansToDisplay.filter(plan =>
        plan.status === 'in_progress' ||
        (!plan.status && plan.startDate) // Count plans with start date but no explicit status as active
      ).length

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
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Plans Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Active Plans</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{activePlansCount}</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <ClipboardCheck className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Plans Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Total Plans</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{plansToDisplay.length}</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <Users className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        {/* Only show Create Plan button for managers */}
        {isManager && (
          <Button
            className="gap-2 rounded-full bg-[#E51636] text-white hover:bg-[#E51636]/90 w-full sm:w-auto px-8"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Plan Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{plan.type}</p>

                    {/* Show status for team members */}
                    {!isManager && plan.status && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status === 'completed' ? 'Completed' :
                         plan.status === 'in_progress' ? 'In Progress' :
                         'Not Started'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {plan.days && plan.days.length > 0 ? calculateDuration(plan.days) : 'N/A'}
                  </span>
                </div>

                {/* Department and Position for managers */}
                {isManager ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">{plan.department || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium text-gray-900">{plan.position || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        {plan.status === 'completed' ? 'Completed On' : 'Status'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {plan.completedAt ?
                          new Date(plan.completedAt).toLocaleDateString() :
                          plan.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // For team members, navigate to progress details
                      // For managers, navigate to plan details
                      if (!isManager && plan.progressId) {
                        navigate(`/training/progress/${plan.progressId}`)
                      } else {
                        handleViewDetails(plan._id)
                      }
                    }}
                    className="w-full justify-center rounded-full bg-[#FEE4E2] text-[#E51636] hover:bg-[#FEE4E2]/80 hover:text-[#E51636] gap-2 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    {!isManager ? 'View Progress' : 'View Details'}
                  </Button>

                  {/* Only show Assign button for managers */}
                  {isManager && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setIsAssignDialogOpen(true)
                      }}
                      className="w-full justify-center rounded-full bg-[#E51636] text-white hover:bg-[#E51636]/90 gap-2 font-medium"
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
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <ClipboardList className="h-12 w-12 text-gray-400" />
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">No Training Plans Found</h3>
                <p className="text-gray-600">There are no training plans matching your search criteria.</p>
              </div>
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