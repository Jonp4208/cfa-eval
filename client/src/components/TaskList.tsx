import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TaskItem } from '@/types/task'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { formatUTCTimeDirectly } from '@/lib/utils/date-utils'

interface TaskListProps {
  tasks: TaskItem[]
  instanceTasks?: TaskItem[]
  completedByUsers: Record<string, { name: string }>
  onTaskComplete: (taskId: string, status: 'pending' | 'completed') => void
  onReorder?: (tasks: TaskItem[]) => void
  disabled?: boolean
}

export function TaskList({
  tasks,
  instanceTasks = [],
  completedByUsers,
  onTaskComplete,
  onReorder,
  disabled = false
}: TaskListProps) {
  const moveTask = (index: number, direction: 'up' | 'down') => {
    if (!onReorder) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= tasks.length) return

    const newTasks = [...tasks]
    const [removed] = newTasks.splice(index, 1)
    newTasks.splice(newIndex, 0, removed)
    onReorder(newTasks)
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => {
          const instanceTask = instanceTasks.find(t =>
            t._id.toString() === task._id.toString() ||
            t.title === task.title
          )

          return (
            <motion.div
              key={task._id.toString()}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative p-4 bg-white rounded-lg border shadow-sm',
                disabled && 'opacity-60 cursor-not-allowed',
                instanceTask?.status === 'completed' && 'bg-gray-50'
              )}
            >
              <div className="flex items-start gap-4">
                {!disabled && (
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0}
                      onClick={() => moveTask(index, 'up')}
                      aria-label="Move task up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === tasks.length - 1}
                      onClick={() => moveTask(index, 'down')}
                      aria-label="Move task down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div
                  className="cursor-pointer"
                  onClick={() => !disabled && onTaskComplete(task._id.toString(), instanceTask?.status === 'completed' ? 'pending' : 'completed')}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-colors',
                      instanceTask?.status === 'completed'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 hover:border-[#E51636]'
                    )}
                  >
                    {instanceTask?.status === 'completed' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center h-full"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={cn(
                      "font-medium text-[#27251F]",
                      instanceTask?.status === 'completed' && "line-through text-[#27251F]/60"
                    )}>
                      {task.title}
                    </h4>
                    {task.priority === 'high' && (
                      <Badge variant="destructive" className="bg-red-100 text-red-700">
                        High Priority
                      </Badge>
                    )}
                  </div>

                  {task.description && (
                    <p className={cn(
                      "text-sm text-[#27251F]/60 mt-1",
                      instanceTask?.status === 'completed' && "line-through"
                    )}>
                      {task.description}
                    </p>
                  )}

                  {instanceTask?.status === 'completed' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#27251F]/40 mt-1"
                    >
                      Completed by {instanceTask.completedBy && typeof instanceTask.completedBy === 'object' && 'name' in instanceTask.completedBy
                        ? instanceTask.completedBy.name
                        : completedByUsers[instanceTask.completedBy as string]?.name}
                      {instanceTask.completedAt && (
                        <> at {formatUTCTimeDirectly(instanceTask.completedAt)}</>
                      )}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}