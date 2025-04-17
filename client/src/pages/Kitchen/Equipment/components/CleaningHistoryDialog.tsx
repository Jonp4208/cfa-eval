import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { CleaningSchedule, CleaningCompletion } from '@/services/kitchenService'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CleaningHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: CleaningSchedule
}

export default function CleaningHistoryDialog({
  open,
  onOpenChange,
  schedule
}: CleaningHistoryDialogProps) {
  const [expandedItems, setExpandedItems] = React.useState<Record<number, boolean>>({})

  const sortedHistory = schedule.completionHistory
    ? [...schedule.completionHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : []

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[600px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Cleaning History: {schedule.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Frequency: {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
            </p>
            {schedule.description && (
              <p className="text-sm mt-2 bg-gray-50 p-3 rounded-md">{schedule.description}</p>
            )}
          </div>

          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No cleaning history available</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] sm:h-[300px] w-full pr-4">
              <div className="space-y-3">
                {sortedHistory.map((completion, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow touch-manipulation"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="font-medium text-base">
                            Completed by {completion.performedBy.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(completion.date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        {completion.notes && (
                          <p className="text-sm mt-2 text-gray-700">{completion.notes}</p>
                        )}

                        {/* Checklist items */}
                        {completion.completedItems && completion.completedItems.length > 0 && (
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 sm:h-7 px-3 sm:px-2 text-sm sm:text-xs flex items-center gap-1 text-gray-600 touch-manipulation"
                              onClick={() => toggleExpand(index)}
                            >
                              {expandedItems[index] ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  Hide Checklist
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  Show Checklist ({completion.completedItems.length} items)
                                </>
                              )}
                            </Button>

                            {expandedItems[index] && (
                              <div className="mt-3 border-t pt-3 space-y-2">
                                {completion.completedItems.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 touch-manipulation">
                                    {item.isCompleted ? (
                                      <CheckCircle2 className="h-5 w-5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-5 w-5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                                    )}
                                    <span className={cn(
                                      "text-gray-700 text-base sm:text-sm",
                                      item.isCompleted ? "" : "text-gray-400"
                                    )}>
                                      {item.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
