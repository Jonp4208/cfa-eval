import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

interface TaskCompletion {
  id: string
  taskId: string
  completedAt: string
  completedBy: {
    name: string
    role?: string
  }
  status: 'completed' | 'missed' | 'late'
  notes?: string
}

interface TaskHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskName: string
  completions: TaskCompletion[]
}

export default function TaskHistory({ open, onOpenChange, taskName, completions }: TaskHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed on time'
      case 'missed':
        return 'Missed'
      case 'late':
        return 'Completed late'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task History - {taskName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-4">
            {completions.map((completion) => (
              <div
                key={completion.id}
                className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(completion.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {completion.completedBy.name}
                      {completion.completedBy.role && (
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({completion.completedBy.role})
                        </span>
                      )}
                    </p>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(completion.completedAt), 'MMM d, yyyy h:mm a')}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getStatusText(completion.status)}
                  </p>
                  {completion.notes && (
                    <p className="text-sm mt-2 p-2 bg-muted rounded-md">
                      {completion.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 