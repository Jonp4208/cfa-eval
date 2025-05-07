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
import { Search, Plus, AlertCircle, UserCircle, Users, Loader2, Clock, CheckCircle2, UserPlus, GraduationCap } from 'lucide-react'
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
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Total New Hires Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Total New Hires</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">{totalNewHires}</h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Last 60 days</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <UserPlus className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>

        {/* Needs Training Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Needs Training</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">{needsTraining}</h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Not yet started</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>

        {/* In Training Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">In Training</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">{inTraining}</h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Currently training</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <GraduationCap className="h-4 w-4 md:h-6 md:w-6 text-[#16A34A]" />
            </div>
          </div>
        </Card>

        {/* Average Days Card */}
        <Card className="bg-white rounded-[20px] p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#6B7280] text-xs md:text-sm font-medium">Avg. Time</p>
              <h3 className="text-2xl md:text-[32px] font-bold mt-1 md:mt-1.5 text-[#27251F] leading-none">{averageDays}</h3>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-0.5 md:mt-1">Days at company</p>
            </div>
            <div className="h-9 w-9 md:h-12 md:w-12 bg-[#FEE4E2] rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 md:h-6 md:w-6 text-[#E51636]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search new hires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* New Hires Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHires.map((hire) => (
          <Card key={hire._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Employee Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">{hire.name}</h3>
                    <p className="text-gray-600">{hire.position}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(hire.trainingStatus)}`}>
                    {getStatusText(hire.trainingStatus)}
                  </span>
                </div>

                {/* Department and Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{hire.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Time at Company</p>
                    <p className="font-medium text-gray-900">{hire.daysSinceHire} days</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {hire.trainingStatus !== 'completed' && (user?.role === 'admin' || user?.role === 'Leader') && (
                    <Button
                      onClick={() => {
                        setSelectedHire(hire)
                        setIsAssignDialogOpen(true)
                      }}
                      className="w-full gap-2 rounded-full bg-[#E51636] text-white hover:bg-[#E51636]/90"
                    >
                      <Plus className="h-4 w-4" />
                      Assign Training
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/users/${hire._id}`)}
                    className="w-full gap-2 rounded-full border-[#E51636] border text-[#E51636] hover:bg-[#FEE4E2]"
                  >
                    <UserCircle className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHires.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Users className="h-12 w-12 text-gray-400" />
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">No New Hires Found</h3>
                <p className="text-gray-600">There are no new hires matching your search criteria.</p>
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