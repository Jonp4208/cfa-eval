import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CheckCircle2, Clock, User, Star, Zap, AlertTriangle } from 'lucide-react'

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
          <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your checklist is empty. Click "Customize List" to add tasks and start building your perfect workflow.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E51636]/10 to-[#B91C3C]/10 rounded-full text-[#E51636] font-medium">
          <Zap className="h-4 w-4" />
          <span>Ready to customize</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => {
        const isCompleted = task.isCompleted === true;

        return (
          <div
            key={task.id}
            className={cn(
              'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl',
              isCompleted
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200/50'
                : 'bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-200/50 hover:border-[#E51636]/20',
              task.isRequired && !isCompleted && 'ring-2 ring-[#E51636]/20 border-[#E51636]/30'
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

            {/* Required task indicator */}
            {task.isRequired && !isCompleted && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E51636] to-[#B91C3C]" />
            )}

            <div className="relative p-6">
              <div className="flex items-center gap-4">
                {/* Custom Checkbox */}
                <div className="relative">
                  <input
                    type="checkbox"
                    id={task.id}
                    checked={isCompleted}
                    onChange={() => onComplete(task.id)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={task.id}
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
                        {task.label}
                      </h3>

                      {/* Required Badge */}
                      {task.isRequired && !isCompleted && (
                        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-gradient-to-r from-[#E51636]/10 to-[#B91C3C]/10 rounded-full">
                          <AlertTriangle className="h-3 w-3 text-[#E51636]" />
                          <span className="text-xs font-medium text-[#E51636]">Required Task</span>
                        </div>
                      )}

                      {/* Completion Info */}
                      {isCompleted && task.completedBy && task.completedAt && (
                        <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-800">
                              Completed by {task.completedBy.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                              <Clock className="h-3 w-3" />
                              <span>
                                {task.nyTimeString || new Date(task.completedAt).toLocaleTimeString('en-US', {
                                  timeZone: 'America/New_York',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-emerald-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={cn(
                  'h-3 w-3 rounded-full transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200 animate-pulse'
                    : task.isRequired
                      ? 'bg-gradient-to-br from-[#E51636] to-[#B91C3C] animate-pulse'
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
