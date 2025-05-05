import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, Plus, Loader2, Trash2, Users, BarChart2, UserPlus, ClipboardCheck, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TraineeProgress {
  _id: string
  name: string
  position: string
  department: string
  trainee?: {
    _id: string
    name: string
    firstName?: string
    lastName?: string
    position: string
    department: string
  }
  currentPlan?: {
    _id: string
    name: string
    progress: number
  }
  status: 'not_started' | 'in_progress' | 'completed'
}

interface Employee {
  _id: string
  name: string
  position: string
  department: string
}

interface TrainingPlan {
  _id: string
  name: string
  type: string
  department: string
  position: string
}

interface AssignTrainingData {
  employeeId: string
  planId: string
  startDate: string
}

interface User {
  _id: string
  name: string
  email: string
  position: string
  department: string
}

interface ApiUser extends User {
  status: string
  departments?: string[]
}

interface AuthContextType {
  user: User | null
}

interface TrainingProgressResponse {
  _id: string
  name: string
  position: string
  department: string
  currentPlan?: {
    _id: string
    name: string
    progress: number
  }
  status: string
}

interface NewHire {
  _id: string
  name: string
  position: string
  department: string
  startDate: string
}

export default function TrainingProgress() {
  const navigate = useNavigate()
  const { user } = useAuth() as AuthContextType
  const [loading, setLoading] = useState(true)
  const [trainees, setTrainees] = useState<TraineeProgress[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTraineeId, setDeleteTraineeId] = useState<string | null>(null)
  const [availablePlans, setAvailablePlans] = useState<TrainingPlan[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [assignData, setAssignData] = useState<AssignTrainingData>({
    employeeId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0]
  })
  const [newHires, setNewHires] = useState<NewHire[]>([])

  useEffect(() => {
    fetchTrainees()
    fetchTrainingPlans()
    fetchNewHires()
  }, [])

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchEmployees()
      fetchTrainingPlans()
    }
  }, [isAssignDialogOpen])

  const fetchTrainees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/training/employees/training-progress')

      // Transform the data to include the progress ID
      const transformedData = response.data.map((trainee) => {
        // The server calculates and caps progress at 100%
        const progress = trainee.currentPlan?.progress || 0

        console.log(`Progress for ${trainee.name}: ${progress}% (from API)`)

        return {
          _id: trainee.currentPlan?._id || trainee._id,
          name: trainee.name || 'Unknown Name',
          position: trainee.position || 'Unknown Position',
          department: trainee.department || 'Unknown Department',
          currentPlan: trainee.currentPlan ? {
            _id: trainee.currentPlan._id,
            name: trainee.currentPlan.name,
            tasks: trainee.currentPlan.tasks || [],
            progress: progress
          } : undefined,
          progress: progress,
          status: trainee.status?.toLowerCase() || 'not_started'
        }
      })

      setTrainees(transformedData)
    } catch (error) {
      console.error('Failed to fetch trainees:', error)
      toast({
        title: 'Error',
        description: 'Failed to load training progress',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await api.get('/api/users');

      const employeeData = Array.isArray(response.data.users) ? response.data.users : [];

      // Filter out inactive employees and transform the data
      const activeEmployees = employeeData
        .filter((user: ApiUser) => user.status !== 'inactive')
        .map((user: ApiUser) => ({
          _id: user._id,
          name: user.name || 'Unknown Name',
          position: user.position || '',
          department: user.departments?.[0] || ''
        }));

      console.log(`Transformed ${activeEmployees.length} active employees`);
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
      setEmployees([]);
    }
  }

  const fetchTrainingPlans = async () => {
    try {
      const response = await api.get('/api/training/plans')
      setAvailablePlans(response.data)
    } catch (error) {
      console.error('Failed to fetch training plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load training plans',
        variant: 'destructive',
      })
    }
  }

  const fetchNewHires = async () => {
    try {
      const response = await api.get('/api/training/employees/new-hires')
      console.log('New hires response:', response.data)
      setNewHires(response.data)
    } catch (error) {
      console.error('Failed to fetch new hires:', error)
    }
  }

  const handleAssignTraining = async () => {
    if (!assignData.employeeId || !assignData.planId || !assignData.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    console.log('Assigning training with data:', assignData)

    try {
      setIsAssigning(true)
      const response = await api.post('/api/training/plans/assign', assignData)
      console.log('Assignment response:', response.data)

      toast({
        title: 'Success',
        description: 'Training plan assigned successfully',
      })

      setIsAssignDialogOpen(false)
      setAssignData({
        employeeId: '',
        planId: '',
        startDate: new Date().toISOString().split('T')[0]
      })

      // Refresh the trainees list
      await fetchTrainees()
    } catch (error) {
      console.error('Failed to assign training plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign training plan',
        variant: 'destructive',
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteTraining = async () => {
    if (!deleteTraineeId) return

    try {
      setIsDeleting(true)
      await api.delete(`/api/training/trainee-progress/${deleteTraineeId}`)

      toast({
        title: 'Success',
        description: 'Training progress deleted successfully',
      })

      // Remove the deleted trainee from the state
      setTrainees(prev => prev.filter(t => t._id !== deleteTraineeId))
    } catch (error) {
      console.error('Failed to delete training progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete training progress',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDeleteTraineeId(null)
    }
  }

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'active'
      ? trainee.status !== 'completed'
      : trainee.status === 'completed'
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'on_hold': 'On Hold',
      'not_started': 'Not Started'
    }
    return statusMap[status] || 'Unknown'
  }

  const getStatusStyles = (status: string) => {
    const styleMap: Record<string, string> = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-amber-100 text-amber-800',
      'not_started': 'bg-gray-100 text-gray-800'
    }
    return styleMap[status] || 'bg-gray-100 text-gray-800'
  }

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Format progress for display
  const formatProgress = (progress: number | undefined) => {
    if (progress === undefined) return '0%'

    // Cap at 100% for display
    const capped = Math.min(progress, 100)

    // Add tooltip for raw value if it exceeds 100%
    if (progress > 100) {
      return {
        display: `${capped}%`,
        tooltip: `Raw value: ${progress}%`
      }
    }

    return `${capped}%`
  }

  // Calculate completion rate
  const calculateCompletionRate = (trainee) => {
    if (!trainee.currentPlan) return 0
    return trainee.progress
  }

  // Calculate overall completion rate
  const calculateOverallCompletionRate = () => {
    const rates = trainees.map(calculateCompletionRate)
    const totalRates = rates.reduce((acc, rate) => acc + rate, 0)
    return rates.length > 0 ? Math.round(totalRates / rates.length) : 0
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
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Active Trainees Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Active Trainees</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">
                {trainees.filter(t => t.status === 'in_progress').length}
              </h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Currently in training</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>

        {/* Completion Rate Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Completion Rate</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">
                {calculateOverallCompletionRate()}%
              </h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Overall completion</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <BarChart2 className="h-4 w-4 md:h-6 md:w-6 text-[#16A34A]" />
            </div>
          </div>
        </Card>

        {/* New Hires Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">New Hires</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">
                {newHires.length}
              </h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Need training plans</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <UserPlus className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>

        {/* Active Plans Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Active Plans</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">
                {trainees.filter(t => t.currentPlan).length}
              </h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Currently in use</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Trainees Table Section */}
      <Card className="bg-white">
        <div className="flex flex-col gap-4 mb-6">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-2">
            {/* Search */}
            <div className="w-full sm:w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trainees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full bg-white border-none shadow-sm rounded-full"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-full flex p-1 shadow-sm border border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('active')}
                className={`rounded-full px-8 border ${
                  activeTab === 'active'
                    ? 'bg-[#FEE4E2] text-[#E51636] font-medium border-[#E51636]'
                    : 'text-gray-600 hover:text-[#E51636] hover:bg-gray-50 border-transparent'
                }`}
              >
                Active
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('completed')}
                className={`rounded-full px-8 border ${
                  activeTab === 'completed'
                    ? 'bg-[#FEE4E2] text-[#E51636] font-medium border-[#E51636]'
                    : 'text-gray-600 hover:text-[#E51636] hover:bg-gray-50 border-transparent'
                }`}
              >
                Completed
              </Button>
            </div>
            
            {/* Assign Training Button */}
            {(user?.position === 'Leader' || user?.position === 'Director') && (
              <Button
                onClick={() => setIsAssignDialogOpen(true)}
                className="bg-[#E51636] text-white hover:bg-[#E51636]/90 rounded-full gap-2 whitespace-nowrap px-6"
              >
                <Plus className="h-4 w-4" />
                Assign Training
              </Button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="text-gray-600 w-1/5">Trainee</TableHead>
                  <TableHead className="text-gray-600 w-1/6">Position</TableHead>
                  <TableHead className="text-gray-600 w-1/5">Current Plan</TableHead>
                  <TableHead className="text-gray-600 w-1/4">Progress</TableHead>
                  <TableHead className="text-gray-600 w-1/8">Status</TableHead>
                  <TableHead className="text-gray-600 w-1/8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => {
                  // Calculate the capped progress for display (0-100%)
                  const displayProgress = Math.min(trainee.progress || 0, 100)
                  const formattedProgress = formatProgress(trainee.progress)

                  return (
                    <TableRow key={trainee._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{trainee.name}</TableCell>
                      <TableCell>{trainee.position}</TableCell>
                      <TableCell>{trainee.currentPlan?.name || 'No Plan'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[300px] h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#E51636] rounded-full"
                              style={{ width: `${displayProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[45px]">
                            {formatProgress(trainee.progress)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(trainee.status)}`}>
                          {getStatusText(trainee.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (trainee._id) {
                                navigate(`/training/progress/${trainee._id}`)
                              }
                            }}
                            disabled={!trainee.currentPlan}
                            className={`rounded-full ${!trainee.currentPlan ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#FEE4E2] hover:text-[#E51636]'}`}
                          >
                            View Details
                          </Button>
                          {user?.position === 'Director' && trainee.currentPlan && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteTraineeId(trainee._id)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="rounded-full hover:bg-[#FEE4E2] hover:text-[#E51636]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Table */}
          <div className="md:hidden">
            {filteredTrainees.map((trainee) => {
              // Calculate the capped progress for display (0-100%)
              const displayProgress = Math.min(trainee.progress || 0, 100)

              return (
                <Card key={trainee._id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(trainee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{trainee.name}</CardTitle>
                          <CardDescription>{trainee.position}</CardDescription>
                        </div>
                      </div>
                      <Badge className={cn(getStatusStyles(trainee.status))}>
                        {getStatusText(trainee.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {trainee.currentPlan ? (
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{trainee.currentPlan.name}</div>
                        <div className="flex w-full items-center gap-2">
                          <Progress
                            value={displayProgress}
                            className="h-2"
                          />
                          <span
                            className="text-xs font-medium"
                            title={trainee.progress > 100 ? `Raw value: ${trainee.progress}%` : undefined}
                          >
                            {formatProgress(trainee.progress)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No active plan</span>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/training/progress/${trainee._id}`)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {filteredTrainees.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No trainees found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[20px] border-none shadow-lg p-4 md:p-6">
          <DialogHeader className="space-y-3 pb-4 md:pb-6">
            <DialogTitle className="text-xl font-semibold">Assign Training Plan</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select an employee and training plan to assign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee" className="font-medium text-gray-700">Employee</Label>
              <Select
                value={assignData.employeeId}
                onValueChange={(value) => setAssignData(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger className="rounded-[20px] border-gray-200 focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee._id}
                      value={employee._id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {employee.name}
                        <span className="ml-2 text-gray-500">
                          ({employee.position})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan" className="font-medium text-gray-700">Training Plan</Label>
              <Select
                value={assignData.planId}
                onValueChange={(value) => setAssignData(prev => ({ ...prev, planId: value }))}
              >
                <SelectTrigger className="rounded-[20px] border-gray-200 focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
                  <SelectValue placeholder="Select training plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - {plan.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="font-medium text-gray-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={assignData.startDate}
                onChange={(e) => setAssignData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-[20px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:border-gray-200"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={isAssigning}
              className="flex-1 rounded-[20px] border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTraining}
              disabled={isAssigning}
              className="flex-1 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[20px] border-none shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training progress? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel
              disabled={isDeleting}
              className="flex-1 rounded-[20px] border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTraining}
              disabled={isDeleting}
              className="flex-1 rounded-[20px] bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
