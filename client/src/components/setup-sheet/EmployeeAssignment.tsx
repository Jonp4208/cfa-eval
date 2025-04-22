import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Copy, CheckCircle2, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { DroppablePosition } from './DroppablePosition'
import { BulkAssignmentHelper } from './BulkAssignmentHelper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Employee {
  id: string
  name: string
  shiftStart: string | number
  shiftEnd: string | number
  area: 'FOH' | 'BOH'
  day?: string | null
}

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  employeeId?: string
}

interface TimeBlock {
  id: string
  start: string | number
  end: string | number
  positions: Position[]
}

interface DaySchedule {
  timeBlocks: TimeBlock[]
}

interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface EmployeeAssignmentProps {
  employees: Employee[]
  template: { weekSchedule: WeekSchedule }
  onSave: (assignments: { weekSchedule: WeekSchedule }) => void
  showSaveButton?: boolean
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export function EmployeeAssignment({ employees, template, onSave, showSaveButton = true }: EmployeeAssignmentProps) {
  // Initialize weekSchedule with safety checks
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(() => initializeWeekSchedule(template))
  const [conflicts, setConflicts] = useState<{ employeeId: string; message: string }[]>([])
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('monday')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([])
  const [unfilledPositions, setUnfilledPositions] = useState<{day: string, block: TimeBlock, position: Position}[]>([])
  const [dayFilteredEmployees, setDayFilteredEmployees] = useState<Employee[]>([])

  // Reset weekSchedule when template changes
  useEffect(() => {
    setWeekSchedule(initializeWeekSchedule(template))
  }, [template])

  // Calculate unassigned employees and unfilled positions
  useEffect(() => {
    // Find unassigned employees
    const assignedEmployeeIds = new Set<string>()
    Object.values(weekSchedule).forEach(day => {
      day.timeBlocks.forEach(block => {
        block.positions.forEach(position => {
          if (position.employeeId) {
            assignedEmployeeIds.add(position.employeeId)
          }
        })
      })
    })

    const unassigned = employees.filter(emp => !assignedEmployeeIds.has(emp.id))
    setUnassignedEmployees(unassigned)

    // Filter employees by selected day
    const filteredByDay = employees.filter(emp => {
      // If employee has no day specified, they're available for all days
      if (!emp.day) return true
      // If employee is assigned to this day, include them
      return emp.day === selectedDay
    })
    setDayFilteredEmployees(filteredByDay)

    // Find unfilled positions
    const unfilled: {day: string, block: TimeBlock, position: Position}[] = []
    DAYS.forEach(day => {
      if (weekSchedule[day]?.timeBlocks) {
        weekSchedule[day].timeBlocks.forEach(block => {
          if (block?.positions) {
            block.positions.forEach(position => {
              if (!position.employeeId) {
                unfilled.push({day, block, position})
              }
            })
          }
        })
      }
    })
    setUnfilledPositions(unfilled)
  }, [weekSchedule, employees, selectedDay])

  // Separate effect for saving to prevent infinite loops
  useEffect(() => {
    // Use a debounce to avoid too many saves
    const timeoutId = setTimeout(() => {
      onSave({ weekSchedule })
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [weekSchedule])

  // Helper function to initialize week schedule
  function initializeWeekSchedule(template: { weekSchedule: WeekSchedule }): WeekSchedule {
    // Ensure each day has a timeBlocks array
    const schedule: WeekSchedule = {
      monday: { timeBlocks: [] },
      tuesday: { timeBlocks: [] },
      wednesday: { timeBlocks: [] },
      thursday: { timeBlocks: [] },
      friday: { timeBlocks: [] },
      saturday: { timeBlocks: [] },
      sunday: { timeBlocks: [] }
    }

    // Copy template data if it exists
    if (template?.weekSchedule) {
      DAYS.forEach(day => {
        if (template.weekSchedule[day]?.timeBlocks) {
          schedule[day] = {
            timeBlocks: template.weekSchedule[day].timeBlocks.map(block => ({
              ...block,
              positions: block.positions || []
            }))
          }
        }
      })
    }

    return schedule
  }

  const handleDrop = (day: typeof DAYS[number], timeBlockId: string, positionId: string, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee) return

    // Check for conflicts
    const newConflicts = checkConflicts(employeeId, day, timeBlockId)
    setConflicts(newConflicts)

    if (newConflicts.length > 0) {
      return
    }

    // Show success message
    setSuccessMessage(`${employee.name} assigned successfully`)
    setTimeout(() => setSuccessMessage(null), 3000)

    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map(block => {
          if (block.id === timeBlockId) {
            return {
              ...block,
              positions: block.positions.map(pos => {
                if (pos.id === positionId) {
                  return { ...pos, employeeId, employeeName: employee.name }
                }
                // Remove employee from other positions in the same time block
                if (pos.employeeId === employeeId) {
                  return { ...pos, employeeId: undefined, employeeName: undefined }
                }
                return pos
              })
            }
          }
          return block
        })
      }
    }))
  }

  const checkConflicts = (employeeId: string, day: typeof DAYS[number], timeBlockId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee) return []

    const conflicts: { employeeId: string; message: string }[] = []

    // Check if employee is assigned to a specific day and it's not this day
    if (employee.day && employee.day !== day) {
      conflicts.push({
        employeeId,
        message: `Employee is only scheduled for ${employee.day.charAt(0).toUpperCase() + employee.day.slice(1)}`
      })
    }

    // Check if employee is already assigned in this time block
    const timeBlock = weekSchedule[day].timeBlocks.find(b => b.id === timeBlockId)
    if (timeBlock) {
      const existingAssignment = timeBlock.positions.find(p => p.employeeId === employeeId)
      if (existingAssignment) {
        conflicts.push({
          employeeId,
          message: `Employee is already assigned to ${existingAssignment.name} in this time block`
        })
      }
    }

    // Check if employee's shift conflicts with time block
    // Use the same logic as isEmployeeAvailableDuringBlock
    if (timeBlock && !isEmployeeAvailableDuringBlock(employee, timeBlock)) {
      conflicts.push({
        employeeId,
        message: 'Employee is not scheduled during this time block'
      })
    }

    return conflicts
  }

  const removeAssignment = (day: typeof DAYS[number], timeBlockId: string, positionId: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map(block => {
          if (block.id === timeBlockId) {
            return {
              ...block,
              positions: block.positions.map(pos => {
                if (pos.id === positionId) {
                  return { ...pos, employeeId: undefined, employeeName: undefined }
                }
                return pos
              })
            }
          }
          return block
        })
      }
    }))
  }

  // Bulk assignment functions
  const copyDayAssignments = (fromDay: typeof DAYS[number], toDays: typeof DAYS[number][]) => {
    setWeekSchedule(prev => {
      const newSchedule = { ...prev }
      toDays.forEach(toDay => {
        // Only copy if the structure matches
        if (prev[fromDay].timeBlocks.length === prev[toDay].timeBlocks.length) {
          newSchedule[toDay] = {
            timeBlocks: prev[fromDay].timeBlocks.map((block, blockIndex) => ({
              ...block,
              positions: block.positions.map((pos, posIndex) => {
                const sourcePosition = prev[fromDay].timeBlocks[blockIndex]?.positions[posIndex];
                return {
                  ...pos,
                  employeeId: sourcePosition?.employeeId,
                  employeeName: sourcePosition?.employeeName
                };
              })
            }))
          }
        }
      })
      return newSchedule
    })

    setSuccessMessage(`Assignments copied from ${fromDay} to ${toDays.length} other days`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const autoAssignEmployees = () => {
    // Simple auto-assignment algorithm
    // Assign employees to positions based on their area (FOH/BOH)
    const newSchedule = { ...weekSchedule }
    const availableEmployees = [...employees]

    // Shuffle available employees to randomize assignments
    for (let i = availableEmployees.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[availableEmployees[i], availableEmployees[j]] = [availableEmployees[j], availableEmployees[i]]
    }

    DAYS.forEach(day => {
      if (newSchedule[day]?.timeBlocks) {
        newSchedule[day].timeBlocks.forEach(block => {
          if (block?.positions) {
            block.positions.forEach(position => {
              if (!position.employeeId) {
                // Find an available employee that matches the position's section and day
                const employeeIndex = availableEmployees.findIndex(emp =>
                  emp.area === position.section &&
                  isEmployeeAvailableDuringBlock(emp, block) &&
                  (!emp.day || emp.day === day) // Only assign if employee is available on this day
                )

                if (employeeIndex !== -1) {
                  const employee = availableEmployees[employeeIndex]
                  position.employeeId = employee.id
                  position.employeeName = employee.name
                  // Remove the employee from available list to prevent double-booking
                  availableEmployees.splice(employeeIndex, 1)
                }
              }
            })
          }
        })
      }
    })

    setWeekSchedule(newSchedule)
    setSuccessMessage(`Auto-assigned ${employees.length - availableEmployees.length} employees`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const isEmployeeAvailableDuringBlock = (employee: Employee, block: TimeBlock) => {
    // Handle special cases for time format
    const normalizeTime = (time: string | number) => {
      // Handle Excel decimal time format (e.g., 0.6770833333333334 = 4:15 PM)
      if (typeof time === 'number' || !isNaN(Number(time))) {
        const decimalTime = typeof time === 'number' ? time : Number(time);

        // Excel stores times as decimal fractions of a 24-hour day
        // 0.5 = 12:00 PM, 0.75 = 6:00 PM, etc.
        const totalMinutes = Math.round(decimalTime * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      // Clean up the time string
      const cleanTime = time.toString().trim().toLowerCase();

      // Handle AM/PM format with various notations
      if (cleanTime.endsWith('a') || cleanTime.endsWith('p') ||
          cleanTime.endsWith('am') || cleanTime.endsWith('pm')) {

        let isPM = false;
        let timePart = cleanTime;

        if (cleanTime.endsWith('p') || cleanTime.endsWith('pm')) {
          isPM = true;
          timePart = cleanTime.endsWith('pm') ? cleanTime.slice(0, -2) : cleanTime.slice(0, -1);
        } else {
          timePart = cleanTime.endsWith('am') ? cleanTime.slice(0, -2) : cleanTime.slice(0, -1);
        }

        // Handle cases with no colon (e.g., "6a" or "2p")
        let hours = 0;
        let minutes = 0;

        if (timePart.includes(':')) {
          [hours, minutes] = timePart.split(':').map(Number);
        } else {
          hours = parseInt(timePart, 10);
          minutes = 0;
        }

        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      // Handle 24-hour format (e.g., "06:00" or "14:00")
      if (cleanTime.includes(':')) {
        const [hours, minutes] = cleanTime.split(':').map(Number);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      // Handle simple hour format (e.g., "6" or "14")
      const hours = parseInt(cleanTime, 10);
      return `${hours.toString().padStart(2, '0')}:00`;
    };

    // Normalize times
    const normalizedBlockStart = normalizeTime(block.start);
    const normalizedBlockEnd = normalizeTime(block.end);
    const normalizedShiftStart = normalizeTime(employee.shiftStart);
    const normalizedShiftEnd = normalizeTime(employee.shiftEnd);

    // Create Date objects for comparison
    const blockStart = new Date(`2000-01-01 ${normalizedBlockStart}`);
    const blockEnd = new Date(`2000-01-01 ${normalizedBlockEnd}`);
    const shiftStart = new Date(`2000-01-01 ${normalizedShiftStart}`);
    const shiftEnd = new Date(`2000-01-01 ${normalizedShiftEnd}`);

    // Check if there's any overlap between the block and the shift
    // This is true if the block starts before the shift ends AND the block ends after the shift starts
    const hasOverlap = blockStart < shiftEnd && blockEnd > shiftStart;

    // Debug logs only when needed - comment out in production
    // Uncomment these lines for debugging time issues
    /*
    console.log(`Employee ${employee.name} availability check:`);
    console.log(`  Block: ${block.start} - ${block.end} → Normalized: ${normalizedBlockStart} - ${normalizedBlockEnd}`);
    console.log(`  Shift: ${employee.shiftStart} - ${employee.shiftEnd} → Normalized: ${normalizedShiftStart} - ${normalizedShiftEnd}`);
    console.log(`  Overlap: ${hasOverlap}`);
    */

    // More lenient check: consider an employee available if their shift overlaps with the time block
    return hasOverlap;
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Create worksheet data for each day
    DAYS.forEach(day => {
      if (!weekSchedule[day]?.timeBlocks?.length) {
        return; // Skip days with no time blocks
      }

      const worksheetData = weekSchedule[day].timeBlocks.flatMap(block => {
        if (!block?.positions?.length) {
          return []; // Skip blocks with no positions
        }

        const rows = block.positions.map(pos => {
          const employee = employees.find(e => e.id === pos.employeeId)
          return {
            'Day': day.charAt(0).toUpperCase() + day.slice(1),
            'Time Block': `${block.start} - ${block.end}`,
            'Position': pos.name,
            'Category': pos.category,
            'Section': pos.section,
            'Employee': employee?.name || '',
            'Employee Shift': employee ? `${employee.shiftStart} - ${employee.shiftEnd}` : ''
          }
        })
        return rows
      })

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, day.charAt(0).toUpperCase() + day.slice(1))
    })

    XLSX.writeFile(workbook, 'setup-sheet.xlsx')
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 employee-assignment-component">
        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {conflicts.map((conflict, index) => (
                <div key={index}>{conflict.message}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Summary of unassigned employees and unfilled positions */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {employees.length} Total Employees
            </Badge>
            {dayFilteredEmployees.length < employees.length && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                {dayFilteredEmployees.length} Available for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={unassignedEmployees.length > 0 ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}>
                    {unassignedEmployees.length} Unassigned
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Employees not yet assigned to any position</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={unfilledPositions.length > 0 ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}>
                    {unfilledPositions.length} Unfilled Positions
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Positions that need to be filled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Bulk assignment tools */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Employee Assignments</h3>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Assignments
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {DAYS.filter(d => d !== selectedDay).map(day => (
                  <DropdownMenuItem
                    key={day}
                    onClick={() => copyDayAssignments(selectedDay, [day])}
                  >
                    Copy to {day.charAt(0).toUpperCase() + day.slice(1)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => copyDayAssignments(selectedDay, DAYS.filter(d => d !== selectedDay))}
                >
                  Copy to All Other Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={autoAssignEmployees}>
                    Auto-Assign Employees
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Automatically assign available employees to unfilled positions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <BulkAssignmentHelper
              employees={dayFilteredEmployees.length > 0 ? dayFilteredEmployees : employees}
              timeBlocks={weekSchedule[selectedDay].timeBlocks}
              onAssign={(assignments) => {
                // Process bulk assignments
                const newSchedule = { ...weekSchedule }

                assignments.forEach(({ positionId, employeeId }) => {
                  // Find the employee
                  const employee = employees.find(e => e.id === employeeId)
                  if (!employee) return

                  // Find the time block and position
                  newSchedule[selectedDay].timeBlocks.forEach(block => {
                    const position = block.positions.find(p => p.id === positionId)
                    if (position) {
                      position.employeeId = employeeId
                      position.employeeName = employee.name
                    }
                  })
                })

                setWeekSchedule(newSchedule)
                setSuccessMessage(`Bulk assigned ${assignments.length} employees`)
                setTimeout(() => setSuccessMessage(null), 3000)
              }}
            />
          </div>
        </div>

        <Tabs value={selectedDay} onValueChange={(value) => setSelectedDay(value as typeof DAYS[number])}>
          <TabsList className="grid w-full grid-cols-7">
            {DAYS.map(day => (
              <TabsTrigger key={day} value={day} className="capitalize">
                {day.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS.map(day => (
            <TabsContent key={day} value={day}>
              <div className="grid gap-6">
                {weekSchedule[day]?.timeBlocks?.length ? (
                  weekSchedule[day].timeBlocks.map((block) => (
                    <Card key={block.id} className="p-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {block.start} - {block.end}
                      </h3>
                      <Tabs defaultValue="FC" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="FC">Front Counter</TabsTrigger>
                          <TabsTrigger value="DT">Drive-Thru</TabsTrigger>
                          <TabsTrigger value="Kitchen">Kitchen</TabsTrigger>
                        </TabsList>

                        <TabsContent value="FC" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {block.positions?.filter(p => p.category === 'Front Counter').length ?
                              block.positions.filter(p => p.category === 'Front Counter').map((position) => {
                                const isUnfilled = !position.employeeId
                                return (
                                  <DroppablePosition
                                    key={position.id}
                                    position={position}
                                    employee={employees.find(e => e.id === position.employeeId)}
                                    onDrop={(employeeId) => handleDrop(day, block.id, position.id, employeeId)}
                                    onRemove={() => removeAssignment(day, block.id, position.id)}
                                    isHighlighted={isUnfilled}
                                    availableEmployees={employees.filter(e =>
                                      // Filter by FOH area for Front Counter positions
                                      e.area === 'FOH' &&
                                      // Filter by availability during this time block
                                      isEmployeeAvailableDuringBlock(e, block) &&
                                      // Filter by day if the employee has a specific day assigned
                                      (!e.day || e.day === day)
                                    )}
                                  />
                                )
                              }) : (
                                <div className="col-span-3 text-center py-4 text-gray-500">
                                  No Front Counter positions defined for this time block
                                </div>
                              )
                            }
                          </div>
                        </TabsContent>

                        <TabsContent value="DT" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {block.positions?.filter(p => p.category === 'Drive Thru').length ?
                              block.positions.filter(p => p.category === 'Drive Thru').map((position) => {
                                const isUnfilled = !position.employeeId
                                return (
                                  <DroppablePosition
                                    key={position.id}
                                    position={position}
                                    employee={employees.find(e => e.id === position.employeeId)}
                                    onDrop={(employeeId) => handleDrop(day, block.id, position.id, employeeId)}
                                    onRemove={() => removeAssignment(day, block.id, position.id)}
                                    isHighlighted={isUnfilled}
                                    availableEmployees={employees.filter(e =>
                                      // Filter by FOH area for Drive Thru positions
                                      e.area === 'FOH' &&
                                      // Filter by availability during this time block
                                      isEmployeeAvailableDuringBlock(e, block) &&
                                      // Filter by day if the employee has a specific day assigned
                                      (!e.day || e.day === day)
                                    )}
                                  />
                                )
                              }) : (
                                <div className="col-span-3 text-center py-4 text-gray-500">
                                  No Drive-Thru positions defined for this time block
                                </div>
                              )
                            }
                          </div>
                        </TabsContent>

                        <TabsContent value="Kitchen" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {block.positions?.filter(p => p.category === 'Kitchen').length ?
                              block.positions.filter(p => p.category === 'Kitchen').map((position) => {
                                const isUnfilled = !position.employeeId
                                return (
                                  <DroppablePosition
                                    key={position.id}
                                    position={position}
                                    employee={employees.find(e => e.id === position.employeeId)}
                                    onDrop={(employeeId) => handleDrop(day, block.id, position.id, employeeId)}
                                    onRemove={() => removeAssignment(day, block.id, position.id)}
                                    isHighlighted={isUnfilled}
                                    availableEmployees={employees.filter(e =>
                                      // Filter by BOH area for Kitchen positions
                                      e.area === 'BOH' &&
                                      // Filter by availability during this time block
                                      isEmployeeAvailableDuringBlock(e, block) &&
                                      // Filter by day if the employee has a specific day assigned
                                      (!e.day || e.day === day)
                                    )}
                                  />
                                )
                              }) : (
                                <div className="col-span-3 text-center py-4 text-gray-500">
                                  No Kitchen positions defined for this time block
                                </div>
                              )
                            }
                          </div>
                        </TabsContent>
                      </Tabs>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No time blocks defined for {day}.</p>
                    <p className="text-sm mt-2">Go to the Template Builder to create time blocks.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between gap-4 mt-8">
          <div>
            {unfilledPositions.length > 0 && (
              <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 max-w-md">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  There are still {unfilledPositions.length} unfilled positions.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-4">
            {showSaveButton && (
              <Button variant="outline" onClick={() => onSave({ weekSchedule })}>
                Save Assignments
              </Button>
            )}
            <Button onClick={exportToExcel}>
              Export to Excel
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}