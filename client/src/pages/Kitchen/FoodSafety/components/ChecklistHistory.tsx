import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Calendar } from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
import { FoodSafetyChecklist, FoodSafetyChecklistCompletion } from '@/types/kitchen'
import { cn } from "@/lib/utils"

export default function ChecklistHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<FoodSafetyChecklist | null>(null)
  const [completions, setCompletions] = useState<FoodSafetyChecklistCompletion[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => new Date())

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      if (!id) return
      const [checklistData, completionsData] = await Promise.all([
        kitchenService.getChecklist(id),
        kitchenService.getChecklistCompletions(id)
      ])
      setChecklist(checklistData)
      setCompletions(completionsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading checklist history:', error)
      enqueueSnackbar('Failed to load checklist history', { variant: 'error' })
      navigate('/kitchen/food-safety')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-600'
      case 'fail':
        return 'bg-red-100 text-red-600'
      case 'warning':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  const getMonthCompletions = () => {
    return completions.filter(completion => {
      const completionDate = new Date(completion.completedAt)
      return (
        completionDate.getMonth() === selectedMonth.getMonth() &&
        completionDate.getFullYear() === selectedMonth.getFullYear()
      )
    })
  }

  const handleMonthChange = (increment: number) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + increment)
      return newDate
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!checklist) return null

  const monthCompletions = getMonthCompletions()

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/kitchen/food-safety')}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#27251F]">{checklist.name}</h1>
          <p className="text-[#27251F]/60 mt-1">Completion History</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {checklist.frequency.charAt(0).toUpperCase() + checklist.frequency.slice(1)}
                </Badge>
                <Badge variant="secondary" className="bg-[#E51636]/10 text-[#E51636]">
                  {checklist.items.length} Items
                </Badge>
                {checklist.items.some(item => item.isCritical) && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600">
                    Contains Critical Items
                  </Badge>
                )}
              </div>
              <p className="text-[#27251F]/60">{checklist.description}</p>
            </div>
            <Button
              onClick={() => navigate(`/kitchen/food-safety/complete/${checklist._id}`)}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              Start New Checklist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white rounded-[20px] p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMonthChange(-1)}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#E51636]" />
          <span className="font-medium">
            {selectedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMonthChange(1)}
          className="hover:bg-gray-100 rotate-180"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {monthCompletions.length === 0 ? (
          <Card className="bg-white rounded-[20px] p-8 text-center">
            <p className="text-[#27251F]/60">No completions found for this month</p>
          </Card>
        ) : (
          monthCompletions.map((completion) => (
            <Card
              key={completion._id}
              className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/kitchen/food-safety/view/${completion._id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(completion.overallStatus)}
                      <h3 className="font-medium text-lg text-[#27251F]">
                        {formatDate(completion.completedAt)}
                      </h3>
                    </div>
                    <p className="text-[#27251F]/60">
                      Completed by: {typeof completion.completedBy === 'string' 
                        ? completion.completedBy 
                        : completion.completedBy.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-lg">{completion.score}%</div>
                      <Badge className={cn("capitalize", getStatusColor(completion.overallStatus))}>
                        {completion.overallStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {completion.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#27251F]/80">{completion.notes}</p>
                  </div>
                )}

                {completion.items.some(item => item.status === 'fail') && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600">Failed Items:</p>
                      <ul className="mt-1 space-y-1">
                        {completion.items
                          .filter(item => item.status === 'fail')
                          .map((item, index) => (
                            <li key={index} className="text-sm text-red-600">
                              • {checklist.items.find(i => i._id === item.item)?.name}
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 