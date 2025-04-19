import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Employee {
  id: string
  name: string
  shiftStart: string
  shiftEnd: string
  area: 'FOH' | 'BOH'
}

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  count: number
  employeeId?: string
}

interface TimeBlock {
  id: string
  start: string
  end: string
  positions: Position[]
}

interface BulkAssignmentHelperProps {
  employees: Employee[]
  timeBlocks: TimeBlock[]
  onAssign: (assignments: { positionId: string, employeeId: string }[]) => void
}

export function BulkAssignmentHelper({ employees, timeBlocks, onAssign }: BulkAssignmentHelperProps) {
  const [open, setOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<'FOH' | 'BOH' | 'ALL'>('ALL')
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('')
  const [selectedPositionType, setSelectedPositionType] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Get all available positions from the selected time block
  const getAvailablePositions = () => {
    if (!selectedTimeBlock) return []
    
    const timeBlock = timeBlocks.find(block => block.id === selectedTimeBlock)
    if (!timeBlock) return []
    
    return timeBlock.positions.filter(position => {
      // Filter by area if selected
      if (selectedArea !== 'ALL' && position.section !== selectedArea) {
        return false
      }
      
      // Filter by position type if selected
      if (selectedPositionType && position.name !== selectedPositionType) {
        return false
      }
      
      // Only include positions that don't have an employee assigned
      return !position.employeeId
    })
  }
  
  // Get all available employees that match the criteria
  const getAvailableEmployees = () => {
    if (!selectedTimeBlock) return []
    
    const timeBlock = timeBlocks.find(block => block.id === selectedTimeBlock)
    if (!timeBlock) return []
    
    return employees.filter(employee => {
      // Filter by area if selected
      if (selectedArea !== 'ALL' && employee.area !== selectedArea) {
        return false
      }
      
      // Check if employee is available during this time block
      const employeeStart = new Date(`2000-01-01 ${employee.shiftStart}`)
      const employeeEnd = new Date(`2000-01-01 ${employee.shiftEnd}`)
      const blockStart = new Date(`2000-01-01 ${timeBlock.start}`)
      const blockEnd = new Date(`2000-01-01 ${timeBlock.end}`)
      
      return blockStart >= employeeStart && blockEnd <= employeeEnd
    })
  }
  
  const availablePositions = getAvailablePositions()
  const availableEmployees = getAvailableEmployees()
  
  // Get all unique position types from the time blocks
  const getUniquePositionTypes = () => {
    const positionTypes = new Set<string>()
    
    timeBlocks.forEach(block => {
      block.positions.forEach(position => {
        positionTypes.add(position.name)
      })
    })
    
    return Array.from(positionTypes).sort()
  }
  
  const handleBulkAssign = () => {
    if (availablePositions.length === 0 || availableEmployees.length === 0) {
      setError('No available positions or employees to assign')
      return
    }
    
    // Assign employees to positions (up to the number of available positions)
    const assignments: { positionId: string, employeeId: string }[] = []
    
    // Sort employees by name to ensure consistent assignment
    const sortedEmployees = [...availableEmployees].sort((a, b) => a.name.localeCompare(b.name))
    
    // Assign employees to positions (up to the number of available positions or employees)
    const maxAssignments = Math.min(availablePositions.length, sortedEmployees.length)
    
    for (let i = 0; i < maxAssignments; i++) {
      assignments.push({
        positionId: availablePositions[i].id,
        employeeId: sortedEmployees[i].id
      })
    }
    
    onAssign(assignments)
    
    setSuccess(`Successfully assigned ${assignments.length} employees to positions`)
    setTimeout(() => setSuccess(null), 3000)
    
    // Close the dialog after a short delay
    setTimeout(() => setOpen(false), 1500)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Bulk Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Employee Assignment</DialogTitle>
          <DialogDescription>
            Quickly assign multiple employees to positions based on criteria
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="timeBlock">Time Block</Label>
            <Select
              value={selectedTimeBlock}
              onValueChange={setSelectedTimeBlock}
            >
              <SelectTrigger id="timeBlock">
                <SelectValue placeholder="Select a time block" />
              </SelectTrigger>
              <SelectContent>
                {timeBlocks.map(block => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.start} - {block.end} ({block.positions.length} positions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Select
              value={selectedArea}
              onValueChange={(value) => setSelectedArea(value as 'FOH' | 'BOH' | 'ALL')}
            >
              <SelectTrigger id="area">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Areas</SelectItem>
                <SelectItem value="FOH">Front of House</SelectItem>
                <SelectItem value="BOH">Back of House</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="positionType">Position Type (Optional)</Label>
            <Select
              value={selectedPositionType}
              onValueChange={setSelectedPositionType}
            >
              <SelectTrigger id="positionType">
                <SelectValue placeholder="Select a position type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Position</SelectItem>
                {getUniquePositionTypes().map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Summary */}
          {selectedTimeBlock && (
            <Card className="p-3 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Assignment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Available Positions:</span>
                  <Badge variant="outline">{availablePositions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Available Employees:</span>
                  <Badge variant="outline">{availableEmployees.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Possible Assignments:</span>
                  <Badge variant="outline">
                    {Math.min(availablePositions.length, availableEmployees.length)}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkAssign}
            disabled={!selectedTimeBlock || availablePositions.length === 0 || availableEmployees.length === 0}
          >
            Assign Employees
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
