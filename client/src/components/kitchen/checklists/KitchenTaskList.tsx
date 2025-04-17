import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Task {
  id: string
  label: string
  isRequired?: boolean
  isCompleted: boolean
  type: 'opening' | 'transition' | 'closing'
  completedBy?: {
    id: string
    name: string
  }
  completedAt?: string
}

interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string) => void
  isLoading: boolean
}

export function KitchenTaskList({ tasks, onComplete, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/60 rounded-xl p-3 sm:p-4 animate-pulse">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-5 w-5 rounded-sm bg-gray-200"></div>
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-100 mb-3 sm:mb-4">
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900">No tasks found</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Click the "Customize List" button to add tasks to this checklist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {tasks.map((task) => {
        const isCompleted = task.isCompleted === true;

        return (
          <div
            key={task.id}
            className={cn(
              'bg-white rounded-xl border transition-all duration-200 hover:shadow-md',
              isCompleted ? 'border-green-200' : 'border-gray-200',
              task.isRequired && !isCompleted ? 'border-l-4 border-l-red-400' : ''
            )}
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1">
                  <div className="pt-0.5">
                    <Checkbox
                      id={task.id}
                      checked={isCompleted}
                      onCheckedChange={() => onComplete(task.id)}
                      className={cn(
                        'h-5 w-5 rounded-md transition-colors touch-manipulation',
                        isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <label
                        htmlFor={task.id}
                        className={cn(
                          'text-sm font-medium cursor-pointer better-text-select',
                          isCompleted ? 'text-green-700 line-through decoration-green-500/50' : 'text-gray-900'
                        )}
                      >
                        {task.label}
                        {task.isRequired && !isCompleted && (
                          <span className="ml-1 sm:ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </label>

                      {isCompleted && task.completedBy && task.completedAt && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="truncate">
                            Completed by <span className="font-medium text-gray-700">{task.completedBy.name}</span> at {task.nyTimeString || new Date(task.completedAt).toLocaleTimeString('en-US', {
                              timeZone: 'America/New_York',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
