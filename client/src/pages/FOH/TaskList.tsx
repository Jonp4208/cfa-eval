import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatUTCTimeDirectly } from '@/lib/utils/date-utils'

interface Task {
  _id: string
  name: string
  shiftType: 'opening' | 'transition' | 'closing'
  isActive: boolean
  completed?: boolean
  completedBy?: string
  completedAt?: string
  nyTimeString?: string
}

interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string) => void
  onDelete?: (taskId: string) => void
  isLoading: boolean
}

export function TaskList({ tasks, onComplete, onDelete, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
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
      <div className="text-center py-12 px-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Click the Add Task button to create a new task for this shift.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isCompleted = task.completed === true;

        return (
          <div
            key={task._id}
            className={cn(
              'bg-white rounded-xl border transition-all duration-200 hover:shadow-md',
              !task.isActive && 'opacity-60',
              isCompleted ? 'border-green-200' : 'border-gray-200'
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="pt-0.5">
                    <Checkbox
                      id={task._id}
                      checked={isCompleted}
                      onCheckedChange={() => onComplete(task._id)}
                      className={cn(
                        'h-5 w-5 rounded-md transition-colors',
                        isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <label
                        htmlFor={task._id}
                        className={cn(
                          'text-sm font-medium cursor-pointer',
                          isCompleted ? 'text-green-700 line-through decoration-green-500/50' : 'text-gray-900'
                        )}
                      >
                        {task.name}
                      </label>

                      {isCompleted && task.completedBy && task.completedAt && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            Completed by <span className="font-medium text-gray-700">{task.completedBy}</span> at {task.nyTimeString || '01:59 AM'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        onDelete(task._id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}