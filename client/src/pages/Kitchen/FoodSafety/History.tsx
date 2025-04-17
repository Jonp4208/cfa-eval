'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
  Filter
} from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
import { FoodSafetyChecklist, FoodSafetyChecklistCompletion, CompletionStatus } from '@/types/kitchen'
import { cn } from '@/lib/utils'
import { generateChecklistPDF } from '@/utils/ChecklistPdfExport'

export default function History() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<FoodSafetyChecklist | null>(null)
  const [completions, setCompletions] = useState<FoodSafetyChecklistCompletion[]>([])
  const [selectedCompletion, setSelectedCompletion] = useState<FoodSafetyChecklistCompletion | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  
  // New state for enhanced filtering and date range
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  })
  const [statusFilter, setStatusFilter] = useState<CompletionStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [id, dateRange])

  const loadData = async () => {
    try {
      if (!id) return
      setLoading(true)
      const [checklistData, completionsData] = await Promise.all([
        kitchenService.getChecklist(id),
        kitchenService.getChecklistCompletions(id)
      ])
      setChecklist(checklistData)
      setCompletions(completionsData)
    } catch (error) {
      console.error('Error loading data:', error)
      enqueueSnackbar('Failed to load data', { variant: 'error' })
      navigate('/kitchen/food-safety')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async () => {
    try {
      if (!selectedCompletion?._id) return
      await kitchenService.reviewCompletion(selectedCompletion._id, { notes: reviewNotes })
      enqueueSnackbar('Review submitted successfully', { variant: 'success' })
      setReviewDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error submitting review:', error)
      enqueueSnackbar('Failed to submit review', { variant: 'error' })
    }
  }

  const getStatusIcon = (status: CompletionStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const handleExportPDF = async (completion: FoodSafetyChecklistCompletion) => {
    try {
      const pdfBlob = await generateChecklistPDF(completion)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Checklist_${checklist?.name}_${format(new Date(completion.completedAt), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' })
    }
  }

  const filteredCompletions = completions
    .filter(completion => {
      const completionDate = new Date(completion.completedAt)
      const matchesDateRange = completionDate >= startOfDay(dateRange.start) && 
                              completionDate <= endOfDay(dateRange.end)
      const matchesStatus = statusFilter === 'all' || completion.overallStatus === statusFilter
      const matchesSearch = searchTerm === '' || 
        completion.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        completion.completedBy.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesDateRange && matchesStatus && matchesSearch
    })
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  const stats = {
    averageScore: Math.round(
      filteredCompletions.reduce((acc, curr) => acc + curr.score, 0) / filteredCompletions.length || 0
    ),
    passRate: Math.round(
      (filteredCompletions.filter(c => c.overallStatus === 'pass').length / filteredCompletions.length) * 100 || 0
    ),
    criticalFailures: filteredCompletions.filter(c => c.overallStatus === 'fail').length,
    totalCompletions: filteredCompletions.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  if (!checklist) return null

  return (
    <div className="space-y-4 sm:space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#27251F]">{checklist.name}</h1>
          <p className="text-[#27251F]/60 text-sm sm:text-base mt-1">
            History & Analytics
          </p>
        </div>
        <Button
          onClick={() => navigate('/kitchen/food-safety')}
          variant="outline"
          className="w-full md:w-auto h-9 sm:h-10"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Food Safety
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Average Score</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.averageScore}%</h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">During selected period</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-[#E51636]/10 text-[#E51636] rounded-xl sm:rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Pass Rate</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.passRate}%</h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Success rate</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-green-100 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Critical Failures</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.criticalFailures}</h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Need attention</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-red-100 text-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium">Total Checks</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">{stats.totalCompletions}</h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5">Completed checks</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-blue-100 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
        <div className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  type="date"
                  value={format(dateRange.start, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start: new Date(e.target.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-[#27251F]/60">to</span>
                <Input
                  type="date"
                  value={format(dateRange.end, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end: new Date(e.target.value)
                  }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label>Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as CompletionStatus | 'all')}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Search</Label>
              <Input
                type="text"
                placeholder="Search by notes or completed by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Completions List */}
      <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
        <div className="p-3 sm:p-6">
          <h2 className="text-xl font-semibold text-[#27251F] mb-4">Completion History</h2>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredCompletions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-[#27251F]/60">No completions found</p>
                  <p className="text-sm text-[#27251F]/40">
                    Try adjusting your filters or date range
                  </p>
                </div>
              ) : (
                filteredCompletions.map((completion) => (
                  <div
                    key={completion._id}
                    className="p-4 border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={cn(
                              "capitalize",
                              completion.overallStatus === 'pass'
                                ? "bg-green-100 text-green-600"
                                : completion.overallStatus === 'warning'
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            )}
                          >
                            {completion.overallStatus}
                          </Badge>
                          <span className="text-sm text-[#27251F]/60">
                            Score: {completion.score}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#27251F]/60">
                          <Clock className="h-4 w-4" />
                          {format(new Date(completion.completedAt), 'MMM d, yyyy h:mm a')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#27251F]/60 mt-1">
                          <User className="h-4 w-4" />
                          Completed by: {completion.completedBy}
                        </div>
                        {completion.notes && (
                          <p className="mt-2 text-sm text-[#27251F]/80">
                            {completion.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedCompletion(completion)
                            setViewDialogOpen(true)
                          }}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExportPDF(completion)}
                          className="h-8 w-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Checklist Completion Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-1.5">
                {selectedCompletion && getStatusIcon(selectedCompletion.overallStatus)}
                <span className="capitalize">{selectedCompletion?.overallStatus}</span>
              </div>
            </div>
            <div>
              <Label>Score</Label>
              <div className="mt-1.5">{selectedCompletion?.score}%</div>
            </div>
            <div>
              <Label>Completed By</Label>
              <div className="mt-1.5">
                {selectedCompletion?.completedBy}
              </div>
            </div>
            <div>
              <Label>Completed At</Label>
              <div className="mt-1.5">
                {selectedCompletion && format(new Date(selectedCompletion.completedAt), 'PPpp')}
              </div>
            </div>
            {selectedCompletion?.notes && (
              <div>
                <Label>Notes</Label>
                <div className="mt-1.5 whitespace-pre-wrap">{selectedCompletion.notes}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false)
                setReviewDialogOpen(true)
              }}
            >
              Add Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter your review notes..."
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 