import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Search, Filter, Plus, BarChart2, UserPlus, ClipboardCheck, AlertCircle, TrendingUp, Users, Target, Award, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { useTranslation } from '@/contexts/TranslationContext'
import PageHeader, { headerButtonClass } from '@/components/PageHeader'
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
      
      const needsTraining = traineesData.filter((trainee: TraineeProgress) => 
        trainee.status === 'not_started'
      ).length

      // Calculate completion rate
      const completedTrainees = traineesData.filter((trainee: TraineeProgress) => 
        trainee.status === 'completed'
      ).length
      const totalTrainees = traineesData.length
      const completionRate = totalTrainees > 0 
        ? Math.round((completedTrainees / totalTrainees) * 100)
        : 0

      // Update stats
      const newStats = {
        needsTraining,
        completionRate,
        newHires: newHiresResponse.data.length,
        activePlans: plansResponse.data.length
      }
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
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
      case 'in_progress':
        return 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20'
      default:
        return 'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20'
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
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <Button
              className={headerButtonClass}
              onClick={() => navigate('/training/new-hires')}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Hires</span>
            </Button>
          </div>
        }
      />

      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Needs Training Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E51636] to-[#DD1A21] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Needs Training</p>
                <h3 className="text-4xl font-bold text-white">{stats.needsTraining}</h3>
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

        {/* Completion Rate Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#004F71] to-[#0066A1] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Completion Rate</p>
                <h3 className="text-4xl font-bold text-white">{stats.completionRate}%</h3>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats.completionRate}%` }}
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
          <CardContent className="p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">New Hires</p>
                <h3 className="text-4xl font-bold text-white">{stats.newHires}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">This month</span>
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
          <CardContent className="p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Active Plans</p>
                <h3 className="text-4xl font-bold text-white">{stats.activePlans}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">In progress</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <span className="text-sm text-[#27251F]/60">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E51636] to-[#DD1A21] rounded-full transition-all duration-1000" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Back of House */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#27251F]">Back of House</span>
                <span className="text-sm text-[#27251F]/60">72%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#004F71] to-[#0066A1] rounded-full transition-all duration-1000" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#27251F]">Management</span>
                <span className="text-sm text-[#27251F]/60">95%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-full transition-all duration-1000" style={{ width: '95%' }} />
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
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-[#16A34A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#27251F]">John Smith completed</p>
                <p className="text-xs text-[#27251F]/60">Food Safety Training</p>
                <p className="text-xs text-[#27251F]/40">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-[#E51636]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-4 w-4 text-[#E51636]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#27251F]">Sarah Johnson enrolled</p>
                <p className="text-xs text-[#27251F]/60">Customer Service Excellence</p>
                <p className="text-xs text-[#27251F]/40">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-[#004F71]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-4 w-4 text-[#004F71]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#27251F]">Mike Davis achieved</p>
                <p className="text-xs text-[#27251F]/60">Leadership Certification</p>
                <p className="text-xs text-[#27251F]/40">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Progress Table */}
      <Card className="bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
                <Input
                  placeholder="Search trainees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px] border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 rounded-xl"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 border-gray-200 hover:border-[#E51636] hover:bg-[#E51636]/5 rounded-xl">
                    <Filter className="h-4 w-4 mr-2 text-[#27251F]/60" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-gray-200">
                  <DropdownMenuItem onClick={() => setFilter('all')} className="hover:bg-[#E51636]/5">All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('in_progress')} className="hover:bg-[#004F71]/5">In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('completed')} className="hover:bg-[#16A34A]/5">Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('not_started')} className="hover:bg-[#FDB022]/5">Not Started</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button className="h-10 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Trainee
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 border-gray-100">
                  <TableHead className="font-semibold text-[#27251F] py-4">Trainee</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Position</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Current Plan</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Progress</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Status</TableHead>
                  <TableHead className="font-semibold text-[#27251F] py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee, index) => (
                  <TableRow
                    key={trainee._id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 border-gray-100"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#E51636] to-[#DD1A21] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {trainee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#27251F]">
                            {trainee.currentPlan?.progress || 0}%
                          </span>
                          <span className="text-xs text-[#27251F]/60">
                            {trainee.currentPlan?.progress >= 100 ? 'Complete' : 'In Progress'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              trainee.currentPlan?.progress >= 100
                                ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D]'
                                : trainee.currentPlan?.progress >= 50
                                ? 'bg-gradient-to-r from-[#004F71] to-[#0066A1]'
                                : 'bg-gradient-to-r from-[#E51636] to-[#DD1A21]'
                            }`}
                            style={{ width: `${trainee.currentPlan?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trainee.status)}`}>
                        {trainee.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {trainee.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {trainee.status === 'not_started' && <XCircle className="h-3 w-3 mr-1" />}
                        {getStatusText(trainee.status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        onClick={() => {}}
                        className="text-[#E51636] hover:text-[#DD1A21] hover:bg-[#E51636]/5 rounded-xl transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 