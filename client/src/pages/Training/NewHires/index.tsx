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
import { Search, Plus, AlertCircle, UserCircle, Users, Loader2, Clock, CheckCircle2, UserPlus, GraduationCap, TrendingUp, Target, Award, Calendar as CalendarIcon, BarChart2, BookOpen, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'

interface User {
  _id: string
  name: string
  email: string
  position: string
  department: string
  role?: string
}

interface AuthContextType {
  user: User | null
}

interface NewHire {
  _id: string
  name: string
  position: string
  department: string
  hireDate: string
  daysSinceHire: number
  trainingStatus: 'not_started' | 'in_progress' | 'completed'
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

export default function NewHires() {
  const navigate = useNavigate()
  const { user } = useAuth() as AuthContextType
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newHires, setNewHires] = useState<NewHire[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null)
  const [availablePlans, setAvailablePlans] = useState<TrainingPlan[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignData, setAssignData] = useState<AssignTrainingData>({
    employeeId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchNewHires()
  }, [])

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchTrainingPlans()
    }
  }, [isAssignDialogOpen])

  const fetchNewHires = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/training/employees/new-hires')

      console.log('New hires response:', response.data)

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format')
      }

      setNewHires(response.data)
    } catch (error) {
      console.error('Failed to fetch new hires:', error)
      setError('Failed to load new hire employees')
      toast({
        title: 'Error',
        description: 'Failed to load new hire employees',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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

  const handleAssignTraining = async () => {
    if (!assignData.planId || !selectedHire) {
      toast({
        title: 'Error',
        description: 'Please select a training plan',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsAssigning(true)
      const response = await api.post('/api/training/plans/assign', {
        ...assignData,
        employeeId: selectedHire._id
      })

      toast({
        title: 'Success',
        description: 'Training plan assigned successfully',
      })

      setIsAssignDialogOpen(false)
      setSelectedHire(null)
      setAssignData({
        employeeId: '',
        planId: '',
        startDate: new Date().toISOString().split('T')[0]
      })

      // Refresh the new hires list
      await fetchNewHires()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
      case 'in_progress':
        return 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20'
      default:
        return 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Needs Training'
    }
  }

  // Calculate stats for the info cards
  const totalNewHires = newHires.length

  const needsTraining = newHires.filter(hire =>
    hire.trainingStatus === 'not_started'
  ).length

  const inTraining = newHires.filter(hire =>
    hire.trainingStatus === 'in_progress'
  ).length

  const completedTraining = newHires.filter(hire =>
    hire.trainingStatus === 'completed'
  ).length

  // Calculate average days since hire
  const calculateAverageDays = () => {
    if (newHires.length === 0) return 0
    const totalDays = newHires.reduce((sum, hire) => sum + hire.daysSinceHire, 0)
    return Math.round(totalDays / newHires.length)
  }

  const averageDays = calculateAverageDays()

  const filteredHires = newHires.filter(hire =>
    hire.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hire.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hire.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-[#E51636]" />
        <div className="text-lg font-semibold text-gray-900">{error}</div>
        <Button onClick={fetchNewHires}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total New Hires Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#004F71] to-[#0066A1] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Total New Hires</p>
                <h3 className="text-4xl font-bold text-white">{totalNewHires}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Last 60 days</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Needs Training Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E51636] to-[#DD1A21] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Needs Training</p>
                <h3 className="text-4xl font-bold text-white">{needsTraining}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Immediate attention</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* In Training Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">In Training</p>
                <h3 className="text-4xl font-bold text-white">{inTraining}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">Currently training</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Average Days Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FDB022] to-[#F39C12] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Avg. Time</p>
                <h3 className="text-4xl font-bold text-white">{averageDays}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">Days at company</span>
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

      {/* Enhanced Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
          <Input
            placeholder="Search new hires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 rounded-xl"
          />
        </div>
      </div>

      {/* Enhanced New Hires Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHires.map((hire) => (
          <Card key={hire._id} className="bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Employee Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#004F71] to-[#0066A1] rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {hire.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#27251F] group-hover:text-[#E51636] transition-colors duration-200">{hire.name}</h3>
                        <p className="text-[#27251F]/60 text-sm">{hire.position}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(hire.trainingStatus)}`}>
                    {hire.trainingStatus === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {hire.trainingStatus === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                    {hire.trainingStatus === 'not_started' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {getStatusText(hire.trainingStatus)}
                  </span>
                </div>

                {/* Department and Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Department</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-[#E51636] rounded-full"></div>
                      <p className="font-medium text-[#27251F]">{hire.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Time at Company</p>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-[#FDB022]" />
                      <p className="font-medium text-[#27251F]">{hire.daysSinceHire} days</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {hire.trainingStatus !== 'completed' && (user?.role === 'admin' || user?.role === 'Leader') && (
                    <Button
                      onClick={() => {
                        setSelectedHire(hire)
                        setIsAssignDialogOpen(true)
                      }}
                      className="flex-1 gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Assign Training
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/users/${hire._id}`)}
                    className={`gap-2 border-[#004F71]/20 text-[#004F71] hover:bg-[#004F71]/5 hover:border-[#004F71] rounded-xl transition-all duration-200 font-medium ${
                      hire.trainingStatus !== 'completed' && (user?.role === 'admin' || user?.role === 'Leader')
                        ? 'flex-1'
                        : 'w-full'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHires.length === 0 && (
        <Card className="bg-white rounded-[20px] border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 bg-gradient-to-br from-[#004F71]/10 to-[#0066A1]/10 rounded-3xl flex items-center justify-center">
                <Users className="h-10 w-10 text-[#004F71]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#27251F]">No New Hires Found</h3>
                <p className="text-[#27251F]/60 max-w-md">There are no new hires matching your search criteria. Try adjusting your search or check back later for new team members.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Training Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[20px] border-none shadow-lg p-4 md:p-6">
          <DialogHeader className="space-y-3 pb-4 md:pb-6">
            <DialogTitle className="text-xl font-semibold">Assign Training Plan</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a training plan for {selectedHire?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
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
                    <SelectItem
                      key={plan._id}
                      value={plan._id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {plan.name}
                        <span className="ml-2 text-gray-500">
                          ({plan.department})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  )
}