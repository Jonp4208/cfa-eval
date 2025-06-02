import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Users, BookOpen, TrendingUp, Award, Plus, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'

interface TeamMember {
  _id: string
  name: string
  email: string
  position: string
  startDate: string
}

interface TeamMemberProgress {
  teamMember: TeamMember
  enrollments: Array<{
    _id: string
    planId: string
    status: string
    progress: number
    enrolledAt: string
    completedAt?: string
  }>
  totalPlans: number
  completedPlans: number
  inProgressPlans: number
}

interface TeamOverviewData {
  teamMembers: TeamMemberProgress[]
  summary: {
    totalTeamMembers: number
    enrolledMembers: number
    totalEnrollments: number
    completedPlans: number
  }
}

interface AvailablePlan {
  id: string
  title: string
  description: string
  estimatedWeeks: number
}

const TeamOverview: React.FC = () => {
  const [overviewData, setOverviewData] = useState<TeamOverviewData | null>(null)
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [enrolling, setEnrolling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeamOverview()
    fetchAvailablePlans()
  }, [])

  const fetchTeamOverview = async () => {
    try {
      const response = await api.get('/team-member-development/team-overview')
      setOverviewData(response.data)
    } catch (error) {
      console.error('Error fetching team overview:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team development overview.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      const response = await api.get('/team-member-development/plans')
      setAvailablePlans(response.data)
    } catch (error) {
      console.error('Error fetching available plans:', error)
    }
  }

  const handleEnrollTeamMember = async () => {
    if (!selectedTeamMember || !selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please select both a team member and a plan.',
        variant: 'destructive'
      })
      return
    }

    setEnrolling(true)
    try {
      await api.post(`/team-member-development/plans/${selectedPlan}/enroll/${selectedTeamMember}`)

      toast({
        title: 'Success',
        description: 'Team member enrolled in development plan successfully.',
      })

      setEnrollDialogOpen(false)
      setSelectedTeamMember('')
      setSelectedPlan('')
      fetchTeamOverview() // Refresh data
    } catch (error: any) {
      console.error('Error enrolling team member:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to enroll team member.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'enrolled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanTitle = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId)
    return plan?.title || planId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load team development data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.summary.totalTeamMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Members</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.summary.enrolledMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((overviewData.summary.enrolledMembers / overviewData.summary.totalTeamMembers) * 100)}% of team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.summary.totalEnrollments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.summary.completedPlans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enroll Team Member Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Team Member Progress</h2>

        <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Enroll Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll Team Member in Development Plan</DialogTitle>
              <DialogDescription>
                Select a team member and development plan to get started.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Member</label>
                <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {overviewData.teamMembers.map((member) => (
                      <SelectItem key={member.teamMember._id} value={member.teamMember._id}>
                        {member.teamMember.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Development Plan</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a development plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.title} ({plan.estimatedWeeks} weeks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleEnrollTeamMember}
                disabled={enrolling || !selectedTeamMember || !selectedPlan}
                className="w-full"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Team Member'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Member Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {overviewData.teamMembers.map((member) => (
          <Card key={member.teamMember._id}>
            <CardHeader>
              <CardTitle className="text-lg">{member.teamMember.name}</CardTitle>
              <CardDescription>{member.teamMember.email}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">{member.totalPlans}</div>
                  <div className="text-xs text-gray-500">Total Plans</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">{member.inProgressPlans}</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{member.completedPlans}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>

              {/* Recent Enrollments */}
              {member.enrollments.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Plans</h4>
                  {member.enrollments.slice(0, 2).map((enrollment) => (
                    <div key={enrollment._id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{getPlanTitle(enrollment.planId)}</span>
                      <Badge className={`ml-2 ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))}
                  {member.enrollments.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{member.enrollments.length - 2} more plans
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No development plans yet</p>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TeamOverview
