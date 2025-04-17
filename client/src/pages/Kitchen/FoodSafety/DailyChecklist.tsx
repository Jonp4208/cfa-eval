import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Plus,
  Trash2,
  AlarmClock,
  Coffee,
  Utensils,
  Sun,
  Moon,
  ClipboardCheck,
  TimerReset,
  Info
} from 'lucide-react'
import { kitchenService, DailyChecklistItemWithCompletions as BaseDailyChecklistItemWithCompletions, DailyChecklistCompletion } from '@/services/kitchenService'
import { cn } from '@/lib/utils'
import { TimeFrame } from '@/types/kitchen'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type TabType = TimeFrame | 'all'

// Extend the base interface to include categoryName
interface DailyChecklistItemWithCompletions extends BaseDailyChecklistItemWithCompletions {
  categoryName?: string;
}

const DailyChecklist: React.FC = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [checklistItems, setChecklistItems] = useState<Record<string, DailyChecklistItemWithCompletions[]>>({})
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    category: string
    item: DailyChecklistItemWithCompletions
  } | null>(null)
  const [formData, setFormData] = useState({
    value: '',
    notes: '',
    status: 'pass' as 'pass' | 'warning' | 'fail'
  })
  const [activeTab, setActiveTab] = useState<TabType>('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-select the most relevant tab based on current time
    const currentHour = new Date().getHours()
    
    if (currentHour >= 5 && currentHour < 11) {
      setActiveTab('morning')
    } else if (currentHour >= 11 && currentHour < 16) {
      setActiveTab('lunch')
    } else if (currentHour >= 16 && currentHour < 22) {
      setActiveTab('dinner')
    } else {
      // Between 10 PM and 5 AM, show all tasks
      setActiveTab('all')
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await kitchenService.getDailyChecklistItems()
      setChecklistItems(data)
    } catch (error) {
      console.error('Error loading daily checklist items:', error)
      enqueueSnackbar('Failed to load daily checklist items', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item: DailyChecklistItemWithCompletions) => {
    setSelectedItem({ 
      category: 'items', // Use a default category
      item 
    })
    setFormData({
      value: '',
      notes: '',
      status: 'pass'
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedItem(null)
  }

  const handleSubmit = async () => {
    if (!selectedItem) return

    try {
      const { category, item } = selectedItem
      await kitchenService.completeDailyChecklistItem(category, item.id, formData)
      enqueueSnackbar('Item completed successfully', { variant: 'success' })
      handleCloseDialog()
      loadData()
    } catch (error) {
      console.error('Error completing item:', error)
      enqueueSnackbar('Failed to complete item', { variant: 'error' })
    }
  }

  const handleDeleteCompletion = async (completionId: string) => {
    if (!window.confirm('Are you sure you want to delete this completion?')) return

    try {
      await kitchenService.deleteDailyChecklistCompletion(completionId)
      enqueueSnackbar('Completion deleted successfully', { variant: 'success' })
      loadData()
    } catch (error) {
      console.error('Error deleting completion:', error)
      enqueueSnackbar('Failed to delete completion', { variant: 'error' })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'morning':
        return <Coffee className="h-4 w-4" />
      case 'lunch':
        return <Utensils className="h-4 w-4" />
      case 'afternoon':
        return <Sun className="h-4 w-4" />
      case 'dinner':
        return <Utensils className="h-4 w-4" />
      case 'closing':
        return <Moon className="h-4 w-4" />
      case '30min':
        return <TimerReset className="h-4 w-4" />
      case 'hourly':
        return <Clock className="h-4 w-4" />
      case 'all':
        return <ClipboardCheck className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTimeframeLabel = (timeframe: TimeFrame) => {
    switch (timeframe) {
      case 'morning':
        return 'Morning (5am-11am)'
      case 'lunch':
        return 'Lunch (11am-4pm)'
      case 'dinner':
        return 'Dinner (4pm-10pm)'
      case '30min':
        return '30-Minute Checks'
      case 'hourly':
        return 'Hourly Checks'
      default:
        return timeframe
    }
  }

  // Get all items for the current tab, flattened into a single array
  const getItemsForTab = (tab: TabType) => {
    let allItems: DailyChecklistItemWithCompletions[] = []
    
    Object.entries(checklistItems).forEach(([category, items]) => {
      // Add category information to each item
      const itemsWithCategory = items.map(item => ({
        ...item,
        categoryName: category.replace('_', ' ')
      }))
      allItems = [...allItems, ...itemsWithCategory]
    })
    
    if (tab === 'all') return allItems
    
    return allItems.filter(item => item.timeframe === tab)
  }

  const getTabCount = (tab: TabType) => {
    const items = getItemsForTab(tab)
    return items.length
  }

  const getIncompleteCount = (tab: TabType) => {
    const items = getItemsForTab(tab)
    return items.filter(item => !item.isCompleted).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#E51636]/20 border-t-[#E51636] animate-spin"></div>
          </div>
          <p className="text-[#27251F]/70 font-medium">Loading checklist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F9F9F9]">
      <div className="space-y-6 px-4 sm:px-6 md:px-8 pt-6 pb-16 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/kitchen/food-safety')}
              className="h-10 w-10 rounded-full hover:bg-white/80 border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 text-[#27251F]" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#27251F]">Daily Food Safety Checklist</h1>
              <p className="text-[#27251F]/70 mt-1 text-sm sm:text-base">Complete required safety checks throughout the day</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-medium">{getIncompleteCount('all')} incomplete</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You have {getIncompleteCount('all')} incomplete checks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="bg-white rounded-xl border-0 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 border-b">
              <TabsList className="flex w-full overflow-x-auto p-1 bg-[#F5F5F5] rounded-lg mb-4 hide-scrollbar">
                <TabsTrigger 
                  value="all" 
                  className={`flex items-center gap-2 ${activeTab === 'all' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('all')}
                  <span>All Tasks</span>
                  {getIncompleteCount('all') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('all')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="morning" 
                  className={`flex items-center gap-2 ${activeTab === 'morning' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('morning')}
                  <span className="hidden sm:inline">Morning</span>
                  {getIncompleteCount('morning') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('morning')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="lunch" 
                  className={`flex items-center gap-2 ${activeTab === 'lunch' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('lunch')}
                  <span className="hidden sm:inline">Lunch</span>
                  {getIncompleteCount('lunch') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('lunch')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="dinner" 
                  className={`flex items-center gap-2 ${activeTab === 'dinner' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('dinner')}
                  <span className="hidden sm:inline">Dinner</span>
                  {getIncompleteCount('dinner') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('dinner')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="30min" 
                  className={`flex items-center gap-2 ${activeTab === '30min' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('30min')}
                  <span className="hidden sm:inline">30-Min</span>
                  {getIncompleteCount('30min') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('30min')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="hourly" 
                  className={`flex items-center gap-2 ${activeTab === 'hourly' ? 'bg-white text-[#E51636] shadow-sm' : 'hover:bg-white/50'}`}
                >
                  {getTabIcon('hourly')}
                  <span className="hidden sm:inline">Hourly</span>
                  {getIncompleteCount('hourly') > 0 && (
                    <Badge className="bg-[#E51636] text-white ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                      {getIncompleteCount('hourly')}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-4 sm:px-6 pt-6 pb-6">
              <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
                {activeTab !== 'all' && (
                  <div className="flex items-center mb-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h2 className="text-sm font-medium text-[#27251F]">{getTimeframeLabel(activeTab as TimeFrame)}</h2>
                      <p className="text-xs text-[#27251F]/70 mt-0.5">
                        {activeTab === '30min' && 'Tasks that need to be checked every 30 minutes'}
                        {activeTab === 'hourly' && 'Tasks that need to be checked every hour'}
                        {activeTab !== '30min' && activeTab !== 'hourly' && 'Tasks for this time period'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {getItemsForTab(activeTab).map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "bg-white border rounded-xl p-4 sm:p-5 transition-all duration-300 hover:shadow-md",
                        item.isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="font-medium text-[#27251F]">{item.name}</h3>
                            <Badge 
                              className={cn(
                                "capitalize text-xs",
                                item.frequency === 'multiple' 
                                  ? "bg-blue-100 text-blue-600 border-blue-200" 
                                  : "bg-green-100 text-green-600 border-green-200"
                              )}
                            >
                              {item.frequency === 'multiple' ? `${item.completedCount}/${item.requiredCompletions}` : 'Once Daily'}
                            </Badge>
                            {item.timeframe && (
                              <Badge variant="outline" className="capitalize text-xs border-gray-300 text-gray-600">
                                {item.timeframe === '30min' ? '30-min' : item.timeframe}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#27251F]/60">
                            {item.frequency === 'multiple' 
                              ? `Required ${item.requiredCompletions} times per day` 
                              : 'Required once per day'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleOpenDialog(item)}
                          className={cn(
                            "transition-all h-10",
                            item.isCompleted
                              ? "bg-green-500 hover:bg-green-600 text-white" 
                              : "bg-gradient-to-r from-[#E51636] to-[#C41230] hover:brightness-105 text-white shadow-sm"
                          )}
                        >
                          {item.isCompleted ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Add Completion
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete Check
                            </>
                          )}
                        </Button>
                      </div>

                      {item.completions && item.completions.length > 0 && (
                        <div className="mt-4 bg-white rounded-lg p-2 border border-gray-100">
                          <h4 className="text-sm font-medium text-[#27251F]/80 mb-2 px-2">Today's Completions</h4>
                          <div className="space-y-2">
                            {item.completions.map(completion => (
                              <div 
                                key={completion.id} 
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-md",
                                  completion.status === 'pass' ? "bg-green-50" :
                                  completion.status === 'warning' ? "bg-yellow-50" :
                                  "bg-red-50"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {completion.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                  {completion.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                  {completion.status === 'fail' && <XCircle className="h-4 w-4 text-red-600" />}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{completion.completedBy}</span>
                                      <span className="text-xs text-[#27251F]/60">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {formatTime(completion.completedAt)}
                                      </span>
                                    </div>
                                    {completion.value && (
                                      <p className="text-xs text-[#27251F]/80">Value: {completion.value}</p>
                                    )}
                                    {completion.notes && (
                                      <p className="text-xs text-[#27251F]/60 mt-1">{completion.notes}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCompletion(completion.id)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {getItemsForTab(activeTab).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-gray-100 rounded-full p-5 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-[#27251F] mb-1">No checklist items</h3>
                    <p className="text-[#27251F]/60 max-w-md">
                      There are no checklist items for this time period. Please check another tab or contact your manager.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 rounded-xl border-0 shadow-xl">
          <div className="bg-[#E51636]/5 p-4 sm:p-6 border-b border-[#E51636]/10">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#27251F]">Complete Check: {selectedItem?.item.name}</DialogTitle>
              <DialogDescription className="text-[#27251F]/70 mt-1">
                Record the completion of this food safety check.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-4 sm:p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <div className="flex gap-3 mt-2">
                <div 
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    formData.status === 'pass' 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:border-green-300"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'pass' }))}
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="font-medium text-sm">Pass</span>
                </div>
                <div 
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    formData.status === 'warning' 
                      ? "border-yellow-500 bg-yellow-50" 
                      : "border-gray-200 hover:border-yellow-300"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'warning' }))}
                >
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <span className="font-medium text-sm">Warning</span>
                </div>
                <div 
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    formData.status === 'fail' 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-200 hover:border-red-300"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'fail' }))}
                >
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="font-medium text-sm">Fail</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="value" className="text-sm font-medium">Value (optional)</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter a value if applicable"
                className="h-10 border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/10"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any relevant notes"
                className="min-h-[100px] border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/10"
              />
            </div>
          </div>
          
          <DialogFooter className="p-4 sm:p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-[#E51636] to-[#C41230] hover:brightness-105 text-white shadow-md transition-all duration-200 active:translate-y-0.5"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DailyChecklist 