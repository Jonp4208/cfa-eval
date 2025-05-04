import React, { useState, useEffect } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, Plus, BarChart2, UserPlus, ClipboardCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { useTranslation } from '@/contexts/TranslationContext'
import PageHeader from '@/components/PageHeader'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  needsTraining: number
  completionRate: number
  newHires: number
  activePlans: number
}

interface TraineeProgress {
  _id: string
  name: string
  position: string
  department: string
  currentPlan?: {
    _id: string
    name: string
    progress: number
  }
  status: 'not_started' | 'in_progress' | 'completed'
}

export default function TrainingProgress() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [trainees, setTrainees] = useState<TraineeProgress[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    needsTraining: 0,
    completionRate: 0,
    newHires: 0,
    activePlans: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [traineesResponse, newHiresResponse, plansResponse] = await Promise.all([
        api.get('/api/training/employees/training-progress'),
        api.get('/api/training/employees/new-hires'),
        api.get('/api/training/plans')
      ])

      // Process trainees data
      const traineesData = traineesResponse.data as TraineeProgress[]
      console.log('Trainees data:', traineesData)
      
      const needsTraining = traineesData.filter((trainee: TraineeProgress) => 
        trainee.status === 'not_started'
      ).length
      console.log('Needs training:', needsTraining)

      // Calculate completion rate
      const completedTrainees = traineesData.filter((trainee: TraineeProgress) => 
        trainee.status === 'completed'
      ).length
      const totalTrainees = traineesData.length
      const completionRate = totalTrainees > 0 
        ? Math.round((completedTrainees / totalTrainees) * 100)
        : 0
      console.log('Completion stats:', { completedTrainees, totalTrainees, completionRate })

      // Update stats
      const newStats = {
        needsTraining,
        completionRate,
        newHires: newHiresResponse.data.length,
        activePlans: plansResponse.data.length
      }
      console.log('Setting stats:', newStats)
      setStats(newStats)

      // Transform and set trainees data
      const transformedTrainees = traineesData.map((trainee: TraineeProgress) => ({
        _id: trainee._id,
        name: trainee.name,
        position: trainee.position,
        department: trainee.department,
        currentPlan: trainee.currentPlan,
        status: trainee.status
      }))
      setTrainees(transformedTrainees)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: t('common.error'),
        description: t('training.failedToLoadData', 'Failed to load training data'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || trainee.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Not Started'
    }
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
      {/* Add PageHeader at the beginning */}
      <PageHeader
        title="Progress Tracking"
        subtitle="Track and monitor employee training progress"
        icon={<BarChart2 className="h-5 w-5" />}
        actions={
          <Button
            className="bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
            onClick={() => navigate('/training/new-hires')}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Hires</span>
          </Button>
        }
      />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Needs Training Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Needs Training</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{stats.needsTraining}</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Completion Rate</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{stats.completionRate}%</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <BarChart2 className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Hires Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">New Hires</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{stats.newHires}</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <UserPlus className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Plans Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 font-medium">Active Plans</p>
                <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{stats.activePlans}</h3>
              </div>
              <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                <ClipboardCheck className="h-7 w-7 text-[#E51636]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Progress Table */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search trainees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('in_progress')}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('completed')}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('not_started')}>Not Started</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Trainee
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainees.map((trainee) => (
                <TableRow key={trainee._id}>
                  <TableCell>{trainee.name}</TableCell>
                  <TableCell>{trainee.position}</TableCell>
                  <TableCell>{trainee.currentPlan?.name || 'No Plan'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E51636] rounded-full"
                          style={{ width: `${trainee.currentPlan?.progress || 0}%` }}
                        />
                      </div>
                      <span>{trainee.currentPlan?.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(trainee.status)}`}>
                      {getStatusText(trainee.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => {}}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 