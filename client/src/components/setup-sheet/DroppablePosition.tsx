import { useDrop } from 'react-dnd'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { UserPlus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from 'react'

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  employeeId?: string
}

interface Employee {
  id: string
  name: string
  shiftStart: string
  shiftEnd: string
  area: 'FOH' | 'BOH'
}

interface DroppablePositionProps {
  position: Position
  employee?: Employee
  onDrop: (employeeId: string) => void
  onRemove: () => void
  isHighlighted?: boolean
  availableEmployees?: Employee[]
}

export function DroppablePosition({
  position,
  employee,
  onDrop,
  onRemove,
  isHighlighted = false,
  availableEmployees = []
}: DroppablePositionProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  const handleAssign = () => {
    if (selectedEmployeeId) {
      onDrop(selectedEmployeeId)
      setShowAssignDialog(false)
      setSelectedEmployeeId(null)
    }
  }
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EMPLOYEE',
    drop: (item: { id: string }) => {
      onDrop(item.id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drop}
            className={`p-4 border rounded transition-colors ${
              isOver ? 'bg-primary/10 border-primary' :
              isHighlighted ? 'bg-amber-50 border-amber-200 animate-pulse' : ''
            }`}
            style={{ borderLeftColor: position.color, borderLeftWidth: '4px' }}
          >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{position.name}</h4>
          <p className="text-sm text-gray-500">{position.category}</p>
          <p className="text-xs text-gray-400">{position.section}</p>
        </div>
        {employee && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
          {employee ? (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <div className="flex flex-col">
                <span className="font-medium">{employee.name}</span>
                <span className="text-sm text-gray-500">
                  {employee.shiftStart} - {employee.shiftEnd}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div className="p-2 border-2 border-dashed rounded text-center text-gray-400 mb-2">
                Drop employee here
              </div>
              <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Employee to {position.name}</DialogTitle>
                    <DialogDescription>
                      Select an employee to assign to this position.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[300px] overflow-y-auto py-4">
                    {availableEmployees && availableEmployees.length > 0 ? (
                      <div className="space-y-2">
                        {availableEmployees.map(emp => (
                          <div
                            key={emp.id}
                            className={`p-3 border rounded cursor-pointer transition-colors ${selectedEmployeeId === emp.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{emp.name}</p>
                                <p className="text-sm text-gray-500">{emp.shiftStart} - {emp.shiftEnd}</p>
                                <p className="text-xs text-gray-400">{emp.area}</p>
                              </div>
                              {selectedEmployeeId === emp.id && (
                                <div className="h-4 w-4 rounded-full bg-primary"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No available employees to assign.
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={!selectedEmployeeId}>Assign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p><span className="font-medium">Position:</span> {position.name}</p>
            <p><span className="font-medium">Category:</span> {position.category}</p>
            <p><span className="font-medium">Section:</span> {position.section}</p>
            {employee && (
              <p><span className="font-medium">Assigned:</span> {employee.name}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}