import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatUTCTimeDirectly } from '@/lib/utils/date-utils'
import { CheckCircle2, Clock, User, Star, Zap, Trash2, Users } from 'lucide-react'

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
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-white/20">
            <div className="flex items-center gap-4">
              <div className="h-6 w-6 rounded-lg bg-gray-200"></div>
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-lg">
          <Users className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Serve Excellence?</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your task list is empty. Click "Add Task" to create new service standards and start delivering exceptional experiences.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E51636]/10 to-[#B91C3C]/10 rounded-full text-[#E51636] font-medium">
          <Zap className="h-4 w-4" />
          <span>Ready to add tasks</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => {
        const isCompleted = task.completed === true;

        return (
          <div
            key={task._id}
            className={cn(
              'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl',
              !task.isActive && 'opacity-60',
              isCompleted
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200/50'
                : 'bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-200/50 hover:border-[#E51636]/20'
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Completion celebration effect */}
            {isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 animate-pulse" />
            )}

            <div className="relative p-6">
              <div className="flex items-center gap-4">
                {/* Custom Checkbox */}
                <div className="relative">
                  <input
                    type="checkbox"
                    id={task._id}
                    checked={isCompleted}
                    onChange={() => onComplete(task._id)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={task._id}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-110',
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200'
                        : 'bg-white border-2 border-gray-300 hover:border-[#E51636] shadow-sm'
                    )}
                  >
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-white animate-in zoom-in duration-300" />
                    )}
                  </label>
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={cn(
                        'font-semibold text-base transition-all duration-300',
                        isCompleted
                          ? 'text-emerald-700 line-through decoration-emerald-400/60'
                          : 'text-gray-900 group-hover:text-[#E51636]'
                      )}>
                        {task.name}
                      </h3>

                      {/* Completion Info */}
                      {isCompleted && task.completedBy && task.completedAt && (
                        <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-800">
                              Completed by {task.completedBy}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                              <Clock className="h-3 w-3" />
                              <span>{task.nyTimeString || '01:59 AM'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-emerald-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            onDelete(task._id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={cn(
                  'h-3 w-3 rounded-full transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200 animate-pulse'
                    : 'bg-gray-300'
                )} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}