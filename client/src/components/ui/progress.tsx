import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-[8px] bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

const SimpleProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    color?: 'default' | 'red' | 'green' | 'blue' | 'yellow'
  }
>(({ className, value = 0, max = 100, color = 'default', ...props }, ref) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)
  
  return (
    <div
      ref={ref}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-gray-100',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-300',
          {
            'bg-gradient-to-r from-blue-400 to-blue-500': color === 'default',
            'bg-gradient-to-r from-red-400 to-red-500': color === 'red',
            'bg-gradient-to-r from-green-400 to-green-500': color === 'green',
            'bg-gradient-to-r from-blue-400 to-blue-500': color === 'blue',
            'bg-gradient-to-r from-yellow-400 to-yellow-500': color === 'yellow',
          }
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})

SimpleProgress.displayName = 'SimpleProgress'

export { Progress, SimpleProgress }
