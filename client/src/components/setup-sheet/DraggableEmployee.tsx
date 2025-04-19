import { useDrag } from 'react-dnd'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Employee {
  id: string
  name: string
  shiftStart: string
  shiftEnd: string
  area: 'FOH' | 'BOH'
}

interface DraggableEmployeeProps {
  employee: Employee
}

export function DraggableEmployee({ employee }: DraggableEmployeeProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EMPLOYEE',
    item: { id: employee.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  // Calculate shift duration in hours
  const calculateShiftDuration = () => {
    try {
      const startParts = employee.shiftStart.split(':').map(Number)
      const endParts = employee.shiftEnd.split(':').map(Number)

      const startMinutes = startParts[0] * 60 + startParts[1]
      const endMinutes = endParts[0] * 60 + endParts[1]

      // Handle overnight shifts
      const durationMinutes = endMinutes >= startMinutes
        ? endMinutes - startMinutes
        : (24 * 60) - startMinutes + endMinutes

      return (durationMinutes / 60).toFixed(1)
    } catch (e) {
      return '?'
    }
  }

  const shiftDuration = calculateShiftDuration()

  // Determine background color based on area
  const getBgColor = () => {
    return employee.area === 'FOH'
      ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      : 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
          >
            <Card className={`p-3 transition-colors border ${getBgColor()}`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{employee.name}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {employee.shiftStart} - {employee.shiftEnd}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={employee.area === 'FOH' ? 'bg-blue-100' : 'bg-amber-100'}>
                  {employee.area}
                </Badge>
              </div>
            </Card>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Employee:</span> {employee.name}</p>
            <p><span className="font-medium">Shift:</span> {employee.shiftStart} - {employee.shiftEnd}</p>
            <p><span className="font-medium">Duration:</span> {shiftDuration} hours</p>
            <p><span className="font-medium">Area:</span> {employee.area}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}