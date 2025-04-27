import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface KitchenChecklistItemProps {
  id: string
  label: string
  isCompleted: boolean
  isRequired?: boolean
  onComplete: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function KitchenChecklistItem({
  id,
  label,
  isCompleted,
  isRequired = false,
  onComplete,
  onEdit,
  onDelete,
  showActions = false
}: KitchenChecklistItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start gap-3 flex-1">
        <div className="pt-0.5">
          <Checkbox
            id={id}
            checked={isCompleted}
            onCheckedChange={() => onComplete(id)}
            className={cn(
              'h-5 w-5 rounded-md transition-colors',
              isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300'
            )}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col">
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer',
                isCompleted ? 'text-green-700 line-through decoration-green-500/50' : 'text-gray-900'
              )}
            >
              {label}
            </label>
            {isRequired && (
              <span className="text-xs text-red-500 mt-0.5">Required</span>
            )}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-[#E51636] hover:bg-[#E51636]/5 rounded-md"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
