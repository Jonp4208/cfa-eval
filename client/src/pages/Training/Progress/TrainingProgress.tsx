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
import { Search, Filter, Plus, Loader2, Trash2, Users, BarChart2, UserPlus, ClipboardCheck, MoreHorizontal, TrendingUp, Target, Award, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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
    startDate?: string
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
    startDate?: string
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

        return {
          _id: trainee.currentPlan?._id || trainee._id,
          name: trainee.name || 'Unknown Name',
          position: trainee.position || 'Unknown Position',
          department: trainee.department || 'Unknown Department',
          currentPlan: trainee.currentPlan ? {
            _id: trainee.currentPlan._id,
            name: trainee.currentPlan.name,
            tasks: trainee.currentPlan.tasks || [],
            progress: progress,
            startDate: trainee.currentPlan.startDate
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

    try {
      setIsAssigning(true)
      const response = await api.post('/api/training/plans/assign', assignData)

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

  const allFilteredTrainees = trainees
    .filter(trainee => {
      const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.position.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'active'
        ? trainee.status !== 'completed'
        : trainee.status === 'completed'
      return matchesSearch && matchesTab
    })
    .sort((a, b) => {
      // Sort by assigned date (newest first)
      const dateA = a.currentPlan?.startDate ? new Date(a.currentPlan.startDate).getTime() : 0
      const dateB = b.currentPlan?.startDate ? new Date(b.currentPlan.startDate).getTime() : 0
      return dateB - dateA // Descending order (newest first)
    })

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredTrainees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const filteredTrainees = allFilteredTrainees.slice(startIndex, endIndex)

  // Reset to page 1 when search or tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
      case 'in_progress':
        return 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20'
      default:
        return 'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20'
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
      'in_progress': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      'completed': 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
      'on_hold': 'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20',
      'not_started': 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
    }
    return styleMap[status] || 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
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
      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Active Trainees Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E51636] to-[#DD1A21] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Active Trainees</p>
                <h3 className="text-4xl font-bold text-white">{trainees.filter(t => t.status === 'in_progress').length}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Currently in training</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Completion Rate Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#004F71] to-[#0066A1] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Completion Rate</p>
                <h3 className="text-4xl font-bold text-white">{calculateOverallCompletionRate()}%</h3>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${calculateOverallCompletionRate()}%` }}
                  />
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* New Hires Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FDB022] to-[#F39C12] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">New Hires</p>
                <h3 className="text-4xl font-bold text-white">{newHires.length}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Need training plans</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Active Plans Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Active Plans</p>
                <h3 className="text-4xl font-bold text-white">{trainees.filter(t => t.currentPlan).length}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Currently in use</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </div>

      {/* Department Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Breakdown */}
        <Card className="lg:col-span-2 bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#27251F]">Department Progress</h3>
                <p className="text-[#27251F]/60 text-sm mt-1">Training completion by department</p>
              </div>
              <div className="h-12 w-12 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-[#E51636]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Front of House */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#27251F]">Front of House</span>
                <span className="text-sm text-[#27251F]/60">
                  {Math.round((trainees.filter(t => t.department === 'Front of House' && t.status === 'completed').length / Math.max(trainees.filter(t => t.department === 'Front of House').length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E51636] to-[#DD1A21] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round((trainees.filter(t => t.department === 'Front of House' && t.status === 'completed').length / Math.max(trainees.filter(t => t.department === 'Front of House').length, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Back of House */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#27251F]">Back of House</span>
                <span className="text-sm text-[#27251F]/60">
                  {Math.round((trainees.filter(t => t.department === 'Back of House' && t.status === 'completed').length / Math.max(trainees.filter(t => t.department === 'Back of House').length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#004F71] to-[#0066A1] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round((trainees.filter(t => t.department === 'Back of House' && t.status === 'completed').length / Math.max(trainees.filter(t => t.department === 'Back of House').length, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#27251F]">Management</span>
                <span className="text-sm text-[#27251F]/60">
                  {Math.round((trainees.filter(t => (t.position === 'Leader' || t.position === 'Director') && t.status === 'completed').length / Math.max(trainees.filter(t => t.position === 'Leader' || t.position === 'Director').length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round((trainees.filter(t => (t.position === 'Leader' || t.position === 'Director') && t.status === 'completed').length / Math.max(trainees.filter(t => t.position === 'Leader' || t.position === 'Director').length, 1)) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#FDB022]/10 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#FDB022]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#27251F]">Recent Activity</h3>
                <p className="text-[#27251F]/60 text-sm">Latest training updates</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainees.slice(0, 3).map((trainee, index) => (
              <div key={trainee._id} className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  trainee.status === 'completed'
                    ? 'bg-[#16A34A]/10'
                    : trainee.status === 'in_progress'
                    ? 'bg-[#004F71]/10'
                    : 'bg-[#E51636]/10'
                }`}>
                  {trainee.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
                  {trainee.status === 'in_progress' && <Clock className="h-4 w-4 text-[#004F71]" />}
                  {trainee.status === 'not_started' && <UserPlus className="h-4 w-4 text-[#E51636]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#27251F]">{trainee.name}</p>
                  <p className="text-xs text-[#27251F]/60">
                    {trainee.status === 'completed' ? 'Completed' : trainee.status === 'in_progress' ? 'In Progress' : 'Started'} {trainee.currentPlan?.name || 'Training'}
                  </p>
                  <p className="text-xs text-[#27251F]/40">
                    {trainee.currentPlan?.startDate ? new Date(trainee.currentPlan.startDate).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            ))}
            {trainees.length === 0 && (
              <div className="text-center text-[#27251F]/60 text-sm py-4">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter, and Assign Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="w-full sm:w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
              <Input
                placeholder="Search trainees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 rounded-xl"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl flex p-1 shadow-lg border border-gray-100 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('active')}
              className={`rounded-xl px-4 sm:px-8 border flex-1 sm:flex-initial transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-[#E51636] to-[#DD1A21] text-white font-medium border-transparent shadow-md'
                  : 'text-[#27251F]/60 hover:text-[#E51636] hover:bg-[#E51636]/5 border-transparent'
              }`}
            >
              Active
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('completed')}
              className={`rounded-xl px-4 sm:px-8 border flex-1 sm:flex-initial transition-all duration-200 ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-medium border-transparent shadow-md'
                  : 'text-[#27251F]/60 hover:text-[#16A34A] hover:bg-[#16A34A]/5 border-transparent'
              }`}
            >
              Completed
            </Button>
          </div>

          {/* Assign Training Button */}
          {(user?.position === 'Leader' || user?.position === 'Director') && (
            <Button
              onClick={() => setIsAssignDialogOpen(true)}
              className="bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 gap-2 whitespace-nowrap px-6 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Assign Training
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Desktop Table */}
      <Card className="hidden md:block bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#27251F]">Training Progress</h3>
              <p className="text-[#27251F]/60 text-sm mt-1">Detailed view of all trainees</p>
            </div>
            <div className="h-12 w-12 bg-[#004F71]/10 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-[#004F71]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-xl border border-gray-100 mx-6 mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 border-gray-100">
                  <TableHead className="font-semibold text-[#27251F] py-4">Trainee</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Position</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Current Plan</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Assigned Date</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Progress</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => {
                  // Calculate the capped progress for display (0-100%)
                  const displayProgress = Math.min(trainee.progress || 0, 100)
                  const formattedProgress = formatProgress(trainee.progress)

                  return (
                    <TableRow key={trainee._id} className="hover:bg-gray-50/50 transition-colors duration-200 border-gray-100">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#DD1A21] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(trainee.name)}
                          </div>
                          <div>
                            <p className="font-medium text-[#27251F]">{trainee.name}</p>
                            <p className="text-sm text-[#27251F]/60">{trainee.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#004F71]/10 text-[#004F71] border border-[#004F71]/20">
                          {trainee.position}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-[#27251F]/40" />
                          <span className="font-medium text-[#27251F]">
                            {trainee.currentPlan?.name || 'No Plan Assigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#27251F]/40" />
                          <span className="text-[#27251F]">
                            {trainee.currentPlan?.startDate ? (
                              new Date(trainee.currentPlan.startDate).toLocaleDateString()
                            ) : (
                              '-'
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#27251F]">
                              {formatProgress(trainee.progress)}
                            </span>
                            <span className="text-xs text-[#27251F]/60">
                              {displayProgress >= 100 ? 'Complete' : 'In Progress'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                displayProgress >= 100
                                  ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D]'
                                  : displayProgress >= 50
                                  ? 'bg-gradient-to-r from-[#004F71] to-[#0066A1]'
                                  : 'bg-gradient-to-r from-[#E51636] to-[#DD1A21]'
                              }`}
                              style={{ width: `${displayProgress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (trainee._id) {
                                navigate(`/training/progress/${trainee._id}`)
                              }
                            }}
                            disabled={!trainee.currentPlan}
                            className={`text-[#E51636] hover:text-[#DD1A21] hover:bg-[#E51636]/5 rounded-xl transition-all duration-200 ${!trainee.currentPlan ? 'cursor-not-allowed opacity-50' : ''}`}
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
                              className="text-[#E51636] hover:text-[#DD1A21] hover:bg-[#E51636]/5 rounded-xl transition-all duration-200"
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
        </CardContent>
      </Card>

      {/* Mobile Table */}
      <div className="md:hidden space-y-4">
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
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {trainee.currentPlan ? (
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{trainee.currentPlan.name}</div>
                    {trainee.currentPlan.startDate && (
                      <div className="text-xs text-gray-500 mb-1">
                        Assigned: {new Date(trainee.currentPlan.startDate).toLocaleDateString()}
                      </div>
                    )}
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

      {filteredTrainees.length === 0 && allFilteredTrainees.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No trainees found
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg rounded-[20px]">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, allFilteredTrainees.length)} of {allFilteredTrainees.length} trainees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#E51636]/30 transition-all duration-200 rounded-[12px]"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    const isCurrentPage = pageNumber === currentPage

                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNumber === 1 ||
                                   pageNumber === totalPages ||
                                   Math.abs(pageNumber - currentPage) <= 1

                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (pageNumber === 2 && currentPage > 4) {
                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>
                      }
                      if (pageNumber === totalPages - 1 && currentPage < totalPages - 3) {
                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-[40px] h-10 rounded-[12px] transition-all duration-200 ${
                          isCurrentPage
                            ? 'bg-[#E51636] text-white hover:bg-[#E51636]/90 border-[#E51636]'
                            : 'bg-white/80 hover:bg-white border-gray-200 hover:border-[#E51636]/30 text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#E51636]/30 transition-all duration-200 rounded-[12px]"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
