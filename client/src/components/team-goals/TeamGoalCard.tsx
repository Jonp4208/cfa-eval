'use client'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash, LineChart, Clock, Target, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Goal } from '../../types/goals'
import { useState } from 'react'
import { UpdateGoalDialog } from './UpdateGoalDialog'
import { deleteGoal } from '../../services/goalService'
import { useToast } from '@/components/ui/use-toast'
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
import { TrackKPIDialog } from './TrackKPIDialog'

interface TeamGoalCardProps {
  goal: Goal
  onUpdate: () => void
}

export function TeamGoalCard({ goal, onUpdate }: TeamGoalCardProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showTrackDialog, setShowTrackDialog] = useState(false)
  const { toast } = useToast()

  const getBusinessAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      'Front Counter': 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20',
      'Drive Thru': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      'Kitchen': 'bg-[#DD1A21]/10 text-[#DD1A21] border-[#DD1A21]/20',
      'Dining Room': 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20',
      'Catering': 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20',
      'Food Safety': 'bg-[#DD1A21]/10 text-[#DD1A21] border-[#DD1A21]/20',
      'Inventory': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      'Facilities': 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20',
      'Marketing': 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20',
      'Leadership': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      'Training': 'bg-[#DD1A21]/10 text-[#DD1A21] border-[#DD1A21]/20',
      'Team Member Development': 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20'
    }
    return colors[area] || 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20',
      'in-progress': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      completed: 'bg-[#DD1A21]/10 text-[#DD1A21] border-[#DD1A21]/20',
      overdue: 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
    }
    return colors[status as keyof typeof colors] || colors['not-started']
  }

  const getGoalPeriodColor = (period: string) => {
    const colors: Record<string, string> = {
      'Monthly': 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20',
      'Quarterly': 'bg-[#DD1A21]/10 text-[#DD1A21] border-[#DD1A21]/20',
      'Yearly': 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
    }
    return colors[period] || 'bg-[#58595B]/10 text-[#58595B] border-[#58595B]/20'
  }

  const handleDelete = async () => {
    try {
      await deleteGoal(goal._id)
      onUpdate()
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border-[#E51636]/10 overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getBusinessAreaColor(goal.businessArea)} border`} variant="outline">
                {goal.businessArea}
              </Badge>
              <Badge className={`${getGoalPeriodColor(goal.goalPeriod)} border`} variant="outline">
                {goal.goalPeriod}
              </Badge>
              <Badge className={`${getStatusColor(goal.status)} border`} variant="outline">
                {goal.status.replace('-', ' ')}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#E51636] hover:text-[#E51636]/80 hover:bg-[#E51636]/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#E51636]/10">
                <DropdownMenuItem onClick={() => setIsUpdateDialogOpen(true)} className="text-[#004F71] hover:text-[#004F71] hover:bg-[#004F71]/10">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h3 className="font-semibold text-lg leading-tight text-[#E51636]">{goal.name}</h3>
          <p className="text-sm text-[#58595B]">{goal.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Section */}
          {goal.kpis && goal.kpis.length > 0 && (
            <div className="space-y-3">
              {goal.kpis.map((kpi, index) => {
                const latestMeasurement = kpi.measurements && kpi.measurements.length > 0
                  ? kpi.measurements[kpi.measurements.length - 1].value
                  : null;

                const previousMeasurement = kpi.measurements && kpi.measurements.length > 1
                  ? kpi.measurements[kpi.measurements.length - 2].value
                  : null;

                const trend = latestMeasurement && previousMeasurement
                  ? latestMeasurement > previousMeasurement ? 'up' : 'down'
                  : null;

                const progress = latestMeasurement !== null
                  ? Math.min(Math.round((latestMeasurement / kpi.targetValue) * 100), 100)
                  : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-[#27251F] truncate max-w-[150px] xs:max-w-none">{kpi.name}</span>
                        {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                        {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {latestMeasurement !== null && (
                          <span className="text-sm font-semibold text-[#27251F]">
                            {latestMeasurement} {kpi.unit}
                          </span>
                        )}
                        <span className="text-xs text-[#58595B]">
                          / {kpi.targetValue} {kpi.unit}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 [&>div]:bg-[#E51636] bg-[#E51636]/10"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#58595B]">
              <span>Overall Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress
              value={goal.progress}
              className="h-2 [&>div]:bg-[#E51636] bg-[#E51636]/10"
            />
          </div>
          {goal.kpis.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#E51636]">KPIs</h4>
              <div className="space-y-1">
                {goal.kpis.map((kpi, index) => (
                  <div key={index} className="text-sm flex justify-between items-center">
                    <span className="text-[#58595B]">{kpi.name}</span>
                    <span className="text-[#004F71]">
                      {kpi.targetValue} {kpi.unit} ({kpi.peak})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4 border-t border-[#E51636]/10">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center w-full gap-2 xs:gap-0">
            <div className="flex items-center gap-2">
              <Avatar className="border-2 border-[#E51636]/10 h-8 w-8 xs:h-10 xs:w-10">
                <AvatarFallback className="bg-[#E51636]/10 text-[#E51636] text-xs xs:text-sm">
                  {goal.user?.name ? goal.user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs text-[#58595B]">
                <p>Last updated: {new Date(goal.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#58595B] mr-1">Status:</span>
              {goal.status === 'in-progress' && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-[#004F71]" />
                  <span className="text-xs text-[#004F71]">In Progress</span>
                </div>
              )}
              {goal.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-[#DD1A21]" />
                  <span className="text-xs text-[#DD1A21]">Completed</span>
                </div>
              )}
              {goal.status === 'overdue' && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-[#E51636]" />
                  <span className="text-xs text-[#E51636]">Overdue</span>
                </div>
              )}
              {goal.status === 'not-started' && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-[#58595B]" />
                  <span className="text-xs text-[#58595B]">Not Started</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrackDialog(true)}
            className="w-full flex items-center justify-center gap-2 border-[#E51636] text-[#E51636] hover:bg-[#E51636] hover:text-white transition-colors"
          >
            <LineChart className="h-4 w-4" />
            Update Measurements
          </Button>
        </CardFooter>
      </Card>

      <UpdateGoalDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        goal={goal}
        onUpdate={onUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-[#E51636]/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E51636]">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#58595B]">
              This action cannot be undone. This will permanently delete the goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#58595B]/20 text-[#58595B] hover:bg-[#58595B]/10 hover:text-[#58595B]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="border-[#E51636] bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TrackKPIDialog
        open={showTrackDialog}
        onOpenChange={setShowTrackDialog}
        goal={goal}
        onUpdate={onUpdate}
      />
    </>
  )
}