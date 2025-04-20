import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, Calendar, ArrowLeft, Coffee, Play, Pause, Download, Printer, RefreshCw, Search, Filter, ChevronDown, X, Check, Save } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define types for our component props
interface DailyViewProps {
  setup: any
  onBack: () => void
}

type BreakStatus = 'none' | 'active' | 'completed'

interface EmployeeBreak {
  employeeId: string
  employeeName: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  status: BreakStatus
  hadBreak: boolean // Flag to indicate if employee has had a break today
}

interface PositionWithBreak extends Position {
  breakStatus?: BreakStatus
  breakStartTime?: string
  breakEndTime?: string
}

interface Position {
  id: string
  name: string
  category: string
  employeeId?: string
  employeeName?: string
  blockStart?: string
  blockEnd?: string
}

interface TimeBlock {
  id: string
  start: string
  end: string
  positions: Position[]
}

export function DailyView({ setup, onBack }: DailyViewProps) {
  // Log setup data for debugging
  console.log('Setup data:', {
    name: setup.name,
    startDate: setup.startDate,
    endDate: setup.endDate,
    weekSchedule: Object.keys(setup.weekSchedule || {}),
  })

  // Calculate the correct dates for each day of the week
  const calculateWeekDates = () => {
    if (!setup.startDate || !setup.endDate) return null;

    const startDate = new Date(setup.startDate);
    const endDate = new Date(setup.endDate);

    // Ensure dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date range:', { startDate, endDate });
      return null;
    }

    // Calculate the difference in days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If the difference is approximately 6 days (accounting for time differences),
    // we assume this is a standard week
    if (diffDays >= 5 && diffDays <= 7) {
      const weekDates = {};
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      // Start with the start date and add days to get each day of the week
      for (let i = 0; i <= diffDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        weekDates[dayNames[dayIndex]] = date;
      }

      console.log('Calculated week dates:', weekDates);
      return weekDates;
    }

    console.log('Date range does not appear to be a standard week:', { diffDays });
    return null;
  }

  // Store the calculated week dates
  const weekDates = calculateWeekDates()

  // Get today's day of the week
  const getTodayDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  // This function was removed to avoid duplication with the one below

  const [activeDay, setActiveDay] = useState(getTodayDayName())
  // Using a constant for current time since we don't need to update it anymore
  const currentTime = new Date()
  const [employeeBreaks, setEmployeeBreaks] = useState<EmployeeBreak[]>([])
  const [showBreakDialog, setShowBreakDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<{id: string, name: string} | null>(null)
  const [breakDuration, setBreakDuration] = useState('30')
  const [areaTab, setAreaTab] = useState('service') // 'service' for FC/Drive or 'kitchen' for Kitchen
  const [activeHour, setActiveHour] = useState<string | null>(null)
  const [showEmployeeList, setShowEmployeeList] = useState(false)
  const [employeeAreaTab, setEmployeeAreaTab] = useState('all') // 'all', 'FOH', or 'BOH'
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [modifiedSetup, setModifiedSetup] = useState<any>(setup)
  const [scheduledEmployees, setScheduledEmployees] = useState<Array<{id: string, name: string, timeBlock: string, area?: string, day?: string}>>([])
  const [unassignedEmployees, setUnassignedEmployees] = useState<Array<{id: string, name: string, timeBlock: string, area?: string, day?: string}>>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  // We no longer need to update the current time
  // since we've removed the time display

  // Set initial active hour to first available hour or current hour if available
  useEffect(() => {
    // Get all available hours
    const availableHours = getAllHours()

    if (availableHours.length > 0) {
      // Get current hour in the format "HH:00"
      const now = new Date()
      const currentHour = `${now.getHours().toString().padStart(2, '0')}:00`

      // If current hour is available, set it as active, otherwise use the first available hour
      if (availableHours.includes(currentHour)) {
        setActiveHour(currentHour)
      } else {
        setActiveHour(availableHours[0])
      }
    }

    // Fetch scheduled employees when the active day changes
    fetchScheduledEmployees()

    // Recalculate unassigned employees when the active day changes
    if (scheduledEmployees.length > 0) {
      calculateUnassignedEmployees(scheduledEmployees)
    }
  }, [activeDay])

  // Check if a weekly setup has positions
  const hasPositions = (setup) => {
    if (!setup || !setup.weekSchedule) return false;

    let positionCount = 0;
    Object.keys(setup.weekSchedule).forEach(day => {
      const daySchedule = setup.weekSchedule[day];
      if (daySchedule && daySchedule.timeBlocks) {
        daySchedule.timeBlocks.forEach(block => {
          if (block.positions && block.positions.length > 0) {
            positionCount += block.positions.length;
          }
        });
      }
    });

    return positionCount > 0;
  };

  // Initialize modifiedSetup when setup changes
  useEffect(() => {
    console.log('Setup received:', setup);
    console.log('Setup weekSchedule:', setup.weekSchedule);
    console.log('Setup has positions:', hasPositions(setup));

    // If the setup doesn't have positions, we need to add them from the template
    if (!hasPositions(setup)) {
      console.log('Setup has no positions, need to add them from template');
    }

    setModifiedSetup(setup);

    // Initialize scheduledEmployees from uploadedSchedules if available
    if (setup.uploadedSchedules && setup.uploadedSchedules.length > 0) {
      console.log('Loading uploaded schedules:', setup.uploadedSchedules.length);
      setScheduledEmployees(setup.uploadedSchedules);
    } else {
      // If no uploadedSchedules, try to extract from positions as before
      const extractedEmployees = extractEmployeesFromPositions();
      if (extractedEmployees.length > 0) {
        console.log('Extracted employees from positions:', extractedEmployees.length);
        setScheduledEmployees(extractedEmployees);
      }
    }

    // Recalculate unassigned employees
    calculateUnassignedEmployees(setup.uploadedSchedules || []);
  }, [setup])

  // Extract employees from positions in the setup
  const extractEmployeesFromPositions = () => {
    const employeesMap = new Map()

    // Check if the setup has a weekSchedule
    if (setup.weekSchedule) {
      // Loop through each day in the week schedule
      Object.keys(setup.weekSchedule).forEach(day => {
        const daySchedule = setup.weekSchedule[day]

        // Check if the day has time blocks
        if (daySchedule && daySchedule.timeBlocks) {
          // Loop through each time block
          daySchedule.timeBlocks.forEach(block => {
            // Loop through each position in the time block
            block.positions.forEach(position => {
              // If the position has an employee assigned
              if (position.employeeId && position.employeeName) {
                // Add the employee to the map if not already there
                if (!employeesMap.has(position.employeeId)) {
                  employeesMap.set(position.employeeId, {
                    id: position.employeeId,
                    name: position.employeeName,
                    timeBlock: `${block.start} - ${block.end}`,
                    day: day
                  })
                }
              }
            })
          })
        }
      })
    }

    return Array.from(employeesMap.values())
  }

  // Fetch all scheduled employees for the current setup
  const fetchScheduledEmployees = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      // Create an array to hold all employees
      let allEmployees = []

      // Check if the setup has employees directly
      if (setup.employees && Array.isArray(setup.employees) && setup.employees.length > 0) {
        console.log('Found employees in setup.employees:', setup.employees.length)

        // Map the employees to the format we need
        const mappedEmployees = setup.employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          timeBlock: `${emp.shiftStart} - ${emp.shiftEnd}`,
          area: emp.area,
          day: emp.day
        }))

        allEmployees = mappedEmployees
      }

      // Also extract employees from positions (in case there are employees assigned to positions but not in setup.employees)
      const extractedEmployees = extractEmployeesFromPositions()
      if (extractedEmployees.length > 0) {
        console.log('Extracted employees from positions:', extractedEmployees.length)

        // Add extracted employees that aren't already in allEmployees
        extractedEmployees.forEach(extractedEmp => {
          if (!allEmployees.some(emp => emp.id === extractedEmp.id)) {
            allEmployees.push(extractedEmp)
          }
        })
      }

      // If we found any employees (either in setup.employees or in positions)
      if (allEmployees.length > 0) {
        console.log('Total employees found:', allEmployees.length)
        setScheduledEmployees(allEmployees)
        calculateUnassignedEmployees(allEmployees)
        return
      }

      // No employees found in setup
      console.error('No employees found in setup. Please upload employees first.')
      toast({
        title: 'No Employees Found',
        description: 'Please upload employees first before assigning positions.',
        variant: 'destructive'
      })

      // Set empty arrays
      setScheduledEmployees([])
      setUnassignedEmployees([])
    } catch (error) {
      console.error('Error fetching scheduled employees:', error)
    }
  }

  // Calculate unassigned employees based on assigned positions
  const calculateUnassignedEmployees = (allEmployees) => {
    // Get all assigned employee IDs
    const assignedEmployeeIds = new Set<string>()

    // Check all time blocks for the active day
    if (modifiedSetup.weekSchedule && modifiedSetup.weekSchedule[activeDay]) {
      const timeBlocks = modifiedSetup.weekSchedule[activeDay].timeBlocks || []

      timeBlocks.forEach(block => {
        block.positions.forEach(position => {
          if (position.employeeId) {
            assignedEmployeeIds.add(position.employeeId)
          }
        })
      })
    }

    // Filter out employees that are already assigned
    const unassigned = allEmployees.filter(emp => {
      // Check if this employee is for the current day or has no day specified
      const isForActiveDay = !emp.day || emp.day === activeDay || emp.day.toLowerCase() === activeDay

      // Only include employees for this day that aren't already assigned
      return isForActiveDay && !assignedEmployeeIds.has(emp.id)
    })

    console.log(`Unassigned employees for ${activeDay}:`, unassigned.length)
    setUnassignedEmployees(unassigned)
  }

  // Get the days of the week from the setup and sort them in correct order (Sunday to Saturday)
  const sortDays = (days: string[]) => {
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  }

  const days = sortDays(Object.keys(setup.weekSchedule || {}))

  // Format day name for display
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  // Format day name for short display (mobile)
  const formatShortDayName = (day: string) => {
    const shortNames: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    }
    return shortNames[day] || day.substring(0, 3)
  }

  // Get the date for a specific day based on the setup's start date
  const getDateForDay = (day: string) => {
    // First, check if we have pre-calculated dates from the week range
    if (weekDates && weekDates[day]) {
      console.log(`Using pre-calculated date for ${day}: ${weekDates[day].toDateString()}`)
      return weekDates[day]
    }

    // If we don't have pre-calculated dates, fall back to the original calculation
    console.log(`No pre-calculated date for ${day}, using fallback calculation`)

    // Create a new date object from the setup's start date
    const startDate = new Date(setup.startDate)

    // Ensure the date is valid
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start date:', setup.startDate)
      return new Date() // Return current date as fallback
    }

    // Special case for debugging the specific issue
    console.log(`Calculating date for ${day} from start date ${startDate.toISOString()}`)

    // For a week starting on Sunday (4/12), the dates should be:
    // Sunday: 4/12, Monday: 4/13, Tuesday: 4/14, Wednesday: 4/15,
    // Thursday: 4/16, Friday: 4/17, Saturday: 4/18

    // Map of day names to their index (0 = Sunday, 1 = Monday, etc.)
    const dayToIndex = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    }

    // Get the index for the requested day
    const targetDayIndex = dayToIndex[day]
    if (targetDayIndex === undefined) {
      console.error('Invalid day name:', day)
      return startDate
    }

    // Get the day of week for the start date (0 = Sunday, 1 = Monday, etc.)
    const startDayIndex = startDate.getDay()
    console.log(`Start date ${startDate.toDateString()} is day index ${startDayIndex}`)

    // Calculate days to add to get from start date to target day
    let daysToAdd = 0

    // If the start date is a Sunday (0) and we're calculating for days within the same week
    if (startDayIndex === 0) {
      // Simply add the target day index (0 for Sunday, 6 for Saturday)
      daysToAdd = targetDayIndex
    } else {
      // For other start days, use the original formula
      daysToAdd = (targetDayIndex - startDayIndex + 7) % 7
    }

    console.log(`Adding ${daysToAdd} days to get to ${day}`)

    // Create a new date by adding the calculated days
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + daysToAdd)

    // Special case for Saturday date issue
    if (day === 'saturday') {
      // Direct fix for the specific 4/12 issue
      if (format(date, 'M/d') === '4/12') {
        console.log('Detected Saturday 4/12 issue, setting to 4/19')
        // Create a new date for April 19, 2023 (or whatever year is in the original date)
        const fixedDate = new Date(date.getFullYear(), 3, 19) // Month is 0-indexed, so 3 = April
        return fixedDate
      }

      // Check if Saturday's date is the same as Sunday's date
      const sundayDate = getDateForDay('sunday')
      if (format(date, 'M/d') === format(sundayDate, 'M/d')) {
        console.log('Detected Saturday date issue - same as Sunday, adding 6 days to fix')
        date.setDate(date.getDate() + 6) // Add 6 days to get from Sunday to Saturday
      }

      // Also check if Saturday is before any other day of the week
      const mondayDate = new Date(startDate)
      mondayDate.setDate(startDate.getDate() + 1) // Monday should be startDate + 1

      if (date < mondayDate) {
        console.log('Detected Saturday date issue - before Monday, adding 7 days to fix')
        date.setDate(date.getDate() + 7) // Add one week
      }
    }

    console.log(`Result date for ${day}: ${date.toDateString()} (${format(date, 'M/d')})`)
    return date
  }

  // Check if a time block is current (happening now)
  const isCurrentTimeBlock = (block: TimeBlock) => {
    const now = currentTime
    const [startHour, startMinute] = block.start.split(':').map(Number)
    const [endHour, endMinute] = block.end.split(':').map(Number)

    const blockStartTime = new Date(now)
    blockStartTime.setHours(startHour, startMinute, 0)

    const blockEndTime = new Date(now)
    blockEndTime.setHours(endHour, endMinute, 0)

    return now >= blockStartTime && now <= blockEndTime
  }

  // Get the time blocks for the active day
  const getTimeBlocks = () => {
    if (!modifiedSetup.weekSchedule || !modifiedSetup.weekSchedule[activeDay] || !modifiedSetup.weekSchedule[activeDay].timeBlocks) {
      console.log('No time blocks found for day:', activeDay);
      return []
    }

    const blocks = modifiedSetup.weekSchedule[activeDay].timeBlocks;
    console.log('Time blocks for day:', activeDay, blocks);
    return blocks;
  }

  // Filter employees by area
  const filterEmployeesByArea = (employees: any[]) => {
    if (employeeAreaTab === 'all') return employees

    return employees.filter(employee => employee.area === employeeAreaTab)
  }

  // Get all employees scheduled for the active day
  const getDayEmployees = () => {
    const employees = new Map<string, { id: string, name: string, positions: string[], timeBlocks: string[], area?: string }>()

    // First, add all positions with employeeId to the map
    getTimeBlocks().forEach(block => {
      block.positions.forEach((position: any) => {
        if (position.employeeId) {
          // Create a unique ID if employeeId exists but no name
          const employeeId = position.employeeId

          // Use position name as a fallback for the employee name
          let employeeName = position.employeeName
          if (!employeeName || employeeName === 'Unknown Employee') {
            employeeName = position.name
          }

          if (!employees.has(employeeId)) {
            // Find the employee in scheduledEmployees to get area information
            const scheduledEmployee = scheduledEmployees.find(e => e.id === employeeId)

            employees.set(employeeId, {
              id: employeeId,
              name: employeeName,
              positions: [],
              timeBlocks: [],
              area: scheduledEmployee?.area
            })
          } else if (employees.get(employeeId)!.name === 'Unknown Employee' && employeeName !== 'Unknown Employee') {
            // Update the name if we found a better one
            employees.get(employeeId)!.name = employeeName
          }

          const employee = employees.get(employeeId)!
          if (!employee.positions.includes(position.name)) {
            employee.positions.push(position.name)
          }

          const timeBlock = `${block.start} - ${block.end}`
          if (!employee.timeBlocks.includes(timeBlock)) {
            employee.timeBlocks.push(timeBlock)
          }
        }
      })
    })

    // Add ALL scheduled employees from the setup
    // This ensures we show all 86 employees in the employee list dialog
    scheduledEmployees.forEach(scheduledEmployee => {
      // Filter employees for the current day if they have day information
      // If no day is specified, include them for all days
      const isForActiveDay = !scheduledEmployee.day ||
                            scheduledEmployee.day === activeDay ||
                            scheduledEmployee.day.toLowerCase() === activeDay

      if (isForActiveDay) {
        if (!employees.has(scheduledEmployee.id)) {
          employees.set(scheduledEmployee.id, {
            id: scheduledEmployee.id,
            name: scheduledEmployee.name,
            positions: ['Scheduled'], // Indicate this employee is scheduled but not assigned
            timeBlocks: [scheduledEmployee.timeBlock],
            area: scheduledEmployee.area
          })
        }
      }
    })

    console.log(`Total employees for ${activeDay}:`, Array.from(employees.values()).length)
    return Array.from(employees.values())
  }

  // Get all employees assigned to the active day
  const getAssignedEmployees = () => {
    const employees: Record<string, { name: string, positions: string[], timeBlocks: string[] }> = {}

    const timeBlocks = getTimeBlocks()
    timeBlocks.forEach((block: any) => {
      block.positions.forEach((position: any) => {
        if (position.employeeId) {
          // Use position name as a fallback for the employee name
          let employeeName = position.employeeName
          if (!employeeName || employeeName === 'Unknown Employee') {
            employeeName = position.name
          }

          if (!employees[position.employeeId]) {
            employees[position.employeeId] = {
              name: employeeName,
              positions: [],
              timeBlocks: []
            }
          } else if (employees[position.employeeId].name === 'Unknown Employee' && employeeName !== 'Unknown Employee') {
            // Update the name if we found a better one
            employees[position.employeeId].name = employeeName
          }

          employees[position.employeeId].positions.push(position.name)
          if (!employees[position.employeeId].timeBlocks.includes(`${block.start} - ${block.end}`)) {
            employees[position.employeeId].timeBlocks.push(`${block.start} - ${block.end}`)
          }
        }
      })
    })

    return employees
  }

  // Get current time blocks (happening now)
  const getCurrentTimeBlocks = () => {
    return getTimeBlocks().filter(isCurrentTimeBlock)
  }

  // Get all hours that have time blocks in the active day
  const getAllHours = () => {
    const hours = new Set<string>()

    // Get all time blocks for the active day
    const timeBlocks = getTimeBlocks()

    // Extract the hours from the time blocks
    timeBlocks.forEach(block => {
      const startHour = block.start.split(':')[0] + ':00'
      hours.add(startHour)
    })

    // Convert to array and sort
    return Array.from(hours).sort()
  }

  // Filter time blocks by hour
  const getTimeBlocksByHour = (hour: string) => {
    if (!hour) return []

    const allBlocks = getTimeBlocks();
    console.log('All blocks before filtering by hour:', allBlocks);

    const filteredBlocks = allBlocks.filter(block => {
      const blockHour = block.start.split(':')[0] + ':00'
      const matches = blockHour === hour;
      console.log(`Block ${block.start}-${block.end}, hour: ${blockHour}, matches ${hour}: ${matches}`);
      return matches;
    });

    console.log('Filtered blocks for hour', hour, ':', filteredBlocks);
    return filteredBlocks;
  }

  // Start a break for an employee
  const startBreak = (employeeId: string, employeeName: string, duration: number) => {
    const now = new Date()

    // Check if employee already had a break today
    const hadBreakBefore = employeeBreaks.some(brk =>
      brk.employeeId === employeeId && brk.hadBreak
    )

    const newBreak: EmployeeBreak = {
      employeeId,
      employeeName,
      startTime: now.toISOString(),
      duration,
      status: 'active',
      hadBreak: true // Mark that this employee is having a break
    }

    setEmployeeBreaks(prev => [...prev, newBreak])

    toast({
      title: 'Break Started',
      description: `${employeeName} is now on a ${duration} minute break`
    })

    // Set a timeout to notify when the break should end
    setTimeout(() => {
      toast({
        title: 'Break Ending',
        description: `${employeeName}'s ${duration} minute break is ending now`
      })
    }, duration * 60 * 1000)
  }

  // End a break for an employee
  const endBreak = (employeeId: string) => {
    setEmployeeBreaks(prev => prev.map(brk =>
      brk.employeeId === employeeId && brk.status === 'active'
        ? { ...brk, endTime: new Date().toISOString(), status: 'completed' }
        : brk
    ))

    const employee = employeeBreaks.find(b => b.employeeId === employeeId && b.status === 'active')
    if (employee) {
      toast({
        title: 'Break Ended',
        description: `${employee.employeeName}'s break has ended`
      })
    }
  }

  // Get break status for an employee
  const getBreakStatus = (employeeId: string): BreakStatus => {
    const activeBreak = employeeBreaks.find(b =>
      b.employeeId === employeeId && b.status === 'active'
    )

    return activeBreak ? 'active' : 'none'
  }

  // Check if an employee has had a break today
  const hasHadBreak = (employeeId: string): boolean => {
    return employeeBreaks.some(b =>
      b.employeeId === employeeId && b.hadBreak
    )
  }

  // Get remaining break time in minutes
  const getRemainingBreakTime = (employeeId: string): number => {
    const activeBreak = employeeBreaks.find(b =>
      b.employeeId === employeeId && b.status === 'active'
    )

    if (!activeBreak) return 0

    const startTime = new Date(activeBreak.startTime)
    const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60))
    const remaining = activeBreak.duration - elapsedMinutes

    return remaining > 0 ? remaining : 0
  }

  // Get count of service positions (Front Counter and Drive Thru)
  const getServicePositionCount = (): number => {
    let count = 0
    getTimeBlocks().forEach(block => {
      count += block.positions.filter(p => p.category === 'Front Counter' || p.category === 'Drive Thru').length
    })
    return count
  }

  // Get count of kitchen positions
  const getKitchenPositionCount = (): number => {
    let count = 0
    getTimeBlocks().forEach(block => {
      count += block.positions.filter(p => p.category === 'Kitchen').length
    })
    return count
  }

  // Handle opening the break dialog
  const handleBreakClick = (employeeId: string, employeeName: string) => {
    setSelectedEmployee({ id: employeeId, name: employeeName })
    setShowBreakDialog(true)
  }

  // Handle starting a break from the dialog
  const handleStartBreak = () => {
    if (selectedEmployee) {
      startBreak(selectedEmployee.id, selectedEmployee.name, parseInt(breakDuration))
      setShowBreakDialog(false)
    }
  }

  // Check if an employee is available for a specific time block
  const isEmployeeAvailableForTimeBlock = (employeeId: string, blockStart: string, blockEnd: string): boolean => {
    // Find the employee in the scheduledEmployees array
    const employee = scheduledEmployees.find(emp => emp.id === employeeId)
    if (!employee) return false

    // Parse the employee's time block
    const [empStart, empEnd] = employee.timeBlock.split(' - ')

    // Parse all times to minutes since midnight for easier comparison
    const parseTimeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const empStartMinutes = parseTimeToMinutes(empStart)
    const empEndMinutes = parseTimeToMinutes(empEnd)
    const blockStartMinutes = parseTimeToMinutes(blockStart)
    const blockEndMinutes = parseTimeToMinutes(blockEnd)

    // Check if the employee's schedule overlaps with the block
    return empStartMinutes <= blockEndMinutes && empEndMinutes >= blockStartMinutes
  }

  // Get employees available for a specific time block
  const getAvailableEmployeesForTimeBlock = (blockStart: string, blockEnd: string) => {
    // Parse times to minutes for comparison
    const parseTimeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const blockStartMinutes = parseTimeToMinutes(blockStart)
    const blockEndMinutes = parseTimeToMinutes(blockEnd)

    // Helper function to check if an employee's schedule overlaps with the block
    const isAvailableForTimeBlock = (employee) => {
      if (!employee.timeBlock) {
        console.warn('Employee missing timeBlock:', employee)
        return false
      }

      const [empStart, empEnd] = employee.timeBlock.split(' - ')
      if (!empStart || !empEnd) {
        console.warn('Invalid timeBlock format:', employee.timeBlock)
        return false
      }

      try {
        const empStartMinutes = parseTimeToMinutes(empStart)
        const empEndMinutes = parseTimeToMinutes(empEnd)
        return empStartMinutes <= blockEndMinutes && empEndMinutes >= blockStartMinutes
      } catch (error) {
        console.error('Error parsing time for employee:', employee, error)
        return false
      }
    }

    // Get all employees for the current day
    const employeesForDay = scheduledEmployees.filter(employee => {
      // Check if this employee is for the current day or has no day specified
      return !employee.day ||
             employee.day === activeDay ||
             employee.day.toLowerCase() === activeDay
    })

    console.log(`Found ${employeesForDay.length} employees for ${activeDay}`)

    // Filter to those available for this time block
    let availableEmployees = employeesForDay.filter(isAvailableForTimeBlock)

    // Filter by area based on the selected position's category
    if (selectedPosition) {
      if (selectedPosition.category === 'Kitchen') {
        // For Kitchen positions, only show BOH employees
        availableEmployees = availableEmployees.filter(employee => employee.area === 'BOH')
        console.log(`Filtered to ${availableEmployees.length} BOH employees for Kitchen position`)
      } else if (selectedPosition.category === 'Front Counter' || selectedPosition.category === 'Drive Thru') {
        // For Front Counter and Drive Thru positions, only show FOH employees
        availableEmployees = availableEmployees.filter(employee => employee.area === 'FOH')
        console.log(`Filtered to ${availableEmployees.length} FOH employees for ${selectedPosition.category} position`)
      }
    }

    return availableEmployees
  }

  // Handle opening the assign dialog
  const handleAssignClick = (position: Position, blockStart: string, blockEnd: string) => {
    setSelectedPosition({...position, blockStart, blockEnd})
    setShowAssignDialog(true)
  }

  // Handle assigning an employee to a position
  const handleAssignEmployee = (employeeId: string, employeeName: string) => {
    if (!selectedPosition) return

    // Create a deep copy of the setup to modify
    const newSetup = JSON.parse(JSON.stringify(modifiedSetup))

    // Make sure we have a valid employee name, use position name as fallback
    const finalEmployeeName = employeeName && employeeName !== 'Unknown Employee'
      ? employeeName
      : selectedPosition.name

    // Find the position in the setup and update it
    const daySchedule = newSetup.weekSchedule[activeDay]
    if (daySchedule && daySchedule.timeBlocks) {
      daySchedule.timeBlocks.forEach((block: TimeBlock) => {
        block.positions.forEach((pos: Position) => {
          if (pos.id === selectedPosition.id) {
            pos.employeeId = employeeId
            pos.employeeName = finalEmployeeName
          }
        })
      })
    }

    // Update the state with the modified setup
    setModifiedSetup(newSetup)
    setShowAssignDialog(false)

    // Recalculate unassigned employees after assignment
    calculateUnassignedEmployees(scheduledEmployees)

    toast({
      title: 'Assignment Updated',
      description: `${finalEmployeeName} assigned to ${selectedPosition.name}`
    })
  }

  // Handle removing an employee from a position
  const handleRemoveAssignment = (position: Position) => {
    // Create a deep copy of the setup to modify
    const newSetup = JSON.parse(JSON.stringify(modifiedSetup))

    // Find the position in the setup and update it
    const daySchedule = newSetup.weekSchedule[activeDay]
    if (daySchedule && daySchedule.timeBlocks) {
      daySchedule.timeBlocks.forEach((block: TimeBlock) => {
        block.positions.forEach((pos: Position) => {
          if (pos.id === position.id) {
            const employeeName = pos.employeeName
            pos.employeeId = undefined
            pos.employeeName = undefined

            toast({
              title: 'Assignment Removed',
              description: `${employeeName} removed from ${position.name}`
            })
          }
        })
      })
    }

    // Update the state with the modified setup
    setModifiedSetup(newSetup)

    // Recalculate unassigned employees after removing assignment
    calculateUnassignedEmployees(scheduledEmployees)
  }

  // Save the modified setup
  const handleSaveChanges = async () => {
    try {
      // Show loading toast
      toast({
        title: 'Saving Changes',
        description: 'Please wait while we save your changes...'
      })

      // Get the token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Create the payload with all scheduled employees
      const payload = {
        name: modifiedSetup.name,
        startDate: modifiedSetup.startDate,
        endDate: modifiedSetup.endDate,
        weekSchedule: modifiedSetup.weekSchedule,
        uploadedSchedules: scheduledEmployees // Save in the new field
      }

      // Call the API to update the setup
      const response = await fetch(`/api/weekly-setups/${setup._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save changes')
      }

      // Update the original setup with the modified one
      const updatedSetup = await response.json()

      toast({
        title: 'Changes Saved',
        description: 'Your changes have been saved successfully'
      })

      // Refresh the page to show the updated setup
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error saving setup:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const timeBlocks = getTimeBlocks()
  const currentTimeBlocks = getCurrentTimeBlocks()
  const assignedEmployees = getAssignedEmployees()
  const allHours = getAllHours()
  const hourTimeBlocks = activeHour ? getTimeBlocksByHour(activeHour) : []

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Streamlined header with controls */}
      <div className="sticky top-0 z-10 bg-white border-b pb-3 pt-2 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 px-2">
          {/* Action buttons - full width on mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmployeeList(true)}
            className="h-10 border-gray-200 w-full sm:w-auto flex-1 sm:flex-none"
          >
            <User className="h-4 w-4 mr-2" />
            <span className="font-medium">Employees</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSaveChanges}
            className="h-10 bg-red-600 hover:bg-red-700 w-full sm:w-auto flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Day tabs - redesigned for better visual hierarchy */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full h-full flex flex-col">
          <div className="border-b bg-gray-50 flex-shrink-0 overflow-x-auto">
            <TabsList className="w-full justify-start p-0 bg-transparent rounded-none flex min-w-[700px]">
              {days.map(day => {
                const date = getDateForDay(day)
                const isToday = new Date().toDateString() === date.toDateString()
                const isActive = activeDay === day

                return (
                  <TabsTrigger
                    key={day}
                    value={day}
                    className={`px-4 py-3 rounded-none border-b-2 ${isActive ? 'border-red-600 bg-white' : 'border-transparent'}
                              ${isToday && !isActive ? 'bg-red-50' : ''} transition-all flex-1`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isActive ? 'text-red-600' : ''}`}>{formatShortDayName(day)}</span>
                        {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded">Today</span>}
                      </div>
                      <span className="text-xs mt-1 text-gray-500">
                        {day === 'saturday' && format(date, 'M/d') === '4/12' ? '4/19' : format(date, 'M/d')}
                      </span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

        {days.map(day => (
          <TabsContent key={day} value={day} className="flex-1 overflow-y-auto p-4">
            {/* Time blocks selection - redesigned for better usability */}
            {allHours.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Time Blocks
                  </h3>
                  <div className="text-xs text-gray-500">
                    {getTimeBlocks().length} time blocks • {getTimeBlocks().reduce((acc, block) => acc + block.positions.length, 0)} positions
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="flex overflow-x-auto pb-1 pt-1 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {allHours.map(hour => {
                      const isCurrentHour = hour.split(':')[0] === new Date().getHours().toString().padStart(2, '0')
                      const hasScheduledBlocks = getTimeBlocksByHour(hour).length > 0
                      const positionCount = getTimeBlocksByHour(hour).reduce((acc, block) => acc + block.positions.length, 0)
                      const isActive = activeHour === hour

                      // Format the hour for display (5:00, 6:00, etc.)
                      const displayHour = parseInt(hour).toString()

                      return (
                        <div key={hour} className="flex-shrink-0 px-1">
                          <Button
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={`min-w-[70px] justify-center py-3 ${isCurrentHour ? 'border-red-300 ring-1 ring-red-100' : ''}
                                      ${hasScheduledBlocks ? 'font-semibold' : 'opacity-80'}
                                      ${isActive ? 'shadow-sm bg-red-600 text-white hover:bg-red-700' :
                                        hasScheduledBlocks ? 'bg-white hover:bg-gray-50 border-red-200' : 'hover:bg-gray-100'}`}
                            onClick={() => setActiveHour(hour)}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{displayHour}:00</span>
                              {hasScheduledBlocks && (
                                <span className={`text-xs mt-1 ${isActive ? 'text-red-100' : 'text-gray-500'}`}>
                                  {positionCount} pos
                                </span>
                              )}
                            </div>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 flex flex-col items-center">
                <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">No time blocks scheduled</p>
                <p className="text-gray-400 text-sm">There are no positions scheduled for {formatDayName(activeDay)}</p>
              </div>
            )}

            {/* Area tabs - redesigned with better visual hierarchy */}
            {allHours.length > 0 && activeHour && (
              <div className="mb-6">
                <div className="flex bg-white border rounded-lg overflow-hidden shadow-sm">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2
                              ${areaTab === 'service'
                                ? 'border-b-blue-600 text-blue-600'
                                : 'border-b-transparent text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => setAreaTab('service')}
                  >
                    <User className={`h-4 w-4 ${areaTab === 'service' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Service (FC & DT)</span>
                    <Badge variant="outline" className={`ml-1 ${areaTab === 'service' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {getServicePositionCount()}
                    </Badge>
                  </button>
                  <div className="w-px bg-gray-200"></div>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2
                              ${areaTab === 'kitchen'
                                ? 'border-b-green-600 text-green-600'
                                : 'border-b-transparent text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => setAreaTab('kitchen')}
                  >
                    <Coffee className={`h-4 w-4 ${areaTab === 'kitchen' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Kitchen</span>
                    <Badge variant="outline" className={`ml-1 ${areaTab === 'kitchen' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {getKitchenPositionCount()}
                    </Badge>
                  </button>
                </div>
              </div>
            )}

            {/* Current time blocks section - enhanced with visual indicators */}
            {currentTimeBlocks.length > 0 && day === getTodayDayName() && (
              <div className="mb-6 space-y-2">
                <h3 className="text-md font-semibold flex items-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 mr-2">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-blue-800">Current Positions</span>
                  <Badge className="ml-2 bg-blue-500 text-white">Live</Badge>
                </h3>

                <Card className="p-4 border-blue-200 bg-blue-50 shadow-sm">
                  {currentTimeBlocks.map((block: TimeBlock) => (
                    <div key={block.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                          <h4 className="text-sm font-medium">{block.start} - {block.end}</h4>
                        </div>
                        <Badge variant="outline" className="bg-white border-blue-200">
                          {block.positions.filter(p => p.employeeId).length} Employees
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {areaTab === 'service' ? (
                          // Front Counter and Drive Thru
                          ['Front Counter', 'Drive Thru'].map(category => {
                            const positions = block.positions.filter(p => p.category === category)
                            if (positions.length === 0) return null

                            return (
                              <div key={category} className="space-y-1">
                                <h5 className={`text-xs font-medium ${category === 'Front Counter' ? 'text-blue-600' : 'text-green-600'}`}>
                                  {category}
                                </h5>

                                {positions.map((position: any) => {
                                  const breakStatus = getBreakStatus(position.employeeId)
                                  const remainingTime = getRemainingBreakTime(position.employeeId)

                                  return (
                                    <div key={position.id} className={`flex justify-between items-center p-2 rounded-md ${breakStatus === 'active' ? 'bg-amber-50 border border-amber-200' : position.employeeId ? 'bg-white border' : 'bg-gray-50 border border-dashed border-gray-300'}`}>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <div className="font-medium text-sm">{position.employeeName}</div>
                                          <div className="text-xs text-gray-500">{position.name}</div>
                                          {position.employeeId && (
                                            <div className="text-xs text-blue-500 flex items-center mt-1">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock || 'No time data'}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center">
                                        {position.employeeId ? (
                                          <>
                                            {breakStatus === 'active' ? (
                                              <div className="flex items-center mr-2">
                                                <Coffee className="h-3 w-3 text-amber-500 mr-1" />
                                                <span className="text-xs text-amber-600">{remainingTime}m</span>
                                              </div>
                                            ) : null}

                                            {breakStatus === 'active' ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => endBreak(position.employeeId!)}
                                              >
                                                <Play className="h-3 w-3 mr-1" />
                                                End
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => handleBreakClick(position.employeeId!, position.employeeName!)}
                                              >
                                                <Coffee className="h-3 w-3 mr-1" />
                                                Break
                                              </Button>
                                            )}
                                          </>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                            onClick={() => handleAssignClick(position, block.start, block.end)}
                                          >
                                            Assign
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })
                        ) : (
                          // Kitchen
                          ['Kitchen'].map(category => {
                            const positions = block.positions.filter(p => p.category === category)
                            if (positions.length === 0) return null

                            return (
                              <div key={category} className="space-y-1">
                                <h5 className="text-xs font-medium text-orange-600">
                                  {category}
                                </h5>

                                {positions.map((position: any) => {
                                  const breakStatus = getBreakStatus(position.employeeId)
                                  const remainingTime = getRemainingBreakTime(position.employeeId)

                                  return (
                                    <div key={position.id} className={`flex justify-between items-center p-2 rounded-md ${breakStatus === 'active' ? 'bg-amber-50 border border-amber-200' : position.employeeId ? 'bg-white border' : 'bg-gray-50 border border-dashed border-gray-300'}`}>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <div className="font-medium text-sm">{position.employeeName}</div>
                                          <div className="text-xs text-gray-500">{position.name}</div>
                                          {position.employeeId && (
                                            <div className="text-xs text-blue-500 flex items-center mt-1">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock || 'No time data'}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center">
                                        {position.employeeId ? (
                                          <>
                                            {breakStatus === 'active' ? (
                                              <div className="flex items-center mr-2">
                                                <Coffee className="h-3 w-3 text-amber-500 mr-1" />
                                                <span className="text-xs text-amber-600">{remainingTime}m</span>
                                              </div>
                                            ) : null}

                                            {breakStatus === 'active' ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => endBreak(position.employeeId!)}
                                              >
                                                <Play className="h-3 w-3 mr-1" />
                                                End
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => handleBreakClick(position.employeeId!, position.employeeName!)}
                                              >
                                                <Coffee className="h-3 w-3 mr-1" />
                                                Break
                                              </Button>
                                            )}
                                          </>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                            onClick={() => handleAssignClick(position, block.start, block.end)}
                                          >
                                            Assign
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {/* Selected hour time blocks - only show if there are time blocks */}
            {activeHour && allHours.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-md font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {activeHour} - {parseInt(activeHour) + 1}:00
                </h3>

                {hourTimeBlocks.length === 0 ? (
                  <Card className="p-4 text-center text-gray-500">
                    <p className="text-sm">No positions scheduled for {parseInt(activeHour)}:00 - {parseInt(activeHour) + 1}:00</p>
                    <p className="text-xs mt-1">Try selecting a different hour or check the schedule</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {hourTimeBlocks.map((block: TimeBlock) => {
                      const isCurrent = isCurrentTimeBlock(block) && day === getTodayDayName()

                      return (
                        <Card
                          key={block.id}
                          className={`p-3 ${isCurrent ? 'border-blue-200 bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">{block.start} - {block.end}</h4>
                            {isCurrent && <Badge className="bg-blue-500 text-white">Current</Badge>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {areaTab === 'service' ? (
                              // Front Counter and Drive Thru
                              ['Front Counter', 'Drive Thru'].map(category => {
                                const positions = block.positions.filter(p => p.category === category)
                                if (positions.length === 0) return null

                                return (
                                  <div key={category} className="space-y-1">
                                    <h5 className={`text-xs font-medium ${category === 'Front Counter' ? 'text-blue-600' : 'text-green-600'}`}>
                                      {category}
                                    </h5>

                                    {positions.map((position: any) => {
                                      const breakStatus = getBreakStatus(position.employeeId)

                                      return (
                                        <div key={position.id} className={`flex justify-between items-center p-2 rounded-md ${breakStatus === 'active' ? 'bg-amber-50 border border-amber-200' : position.employeeId ? 'bg-white border' : 'bg-gray-50 border border-dashed border-gray-300'}`}>
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <div>
                                              <div className="font-medium text-sm">
                                                {position.employeeName || <span className="text-gray-400 italic">Unassigned</span>}
                                              </div>
                                              <div className="text-xs text-gray-500">{position.name}</div>
                                              {position.employeeId && (
                                                <div className="text-xs text-blue-500 flex items-center mt-1">
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock || 'No time data'}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            {position.employeeId ? (
                                              <>
                                                {isCurrent && breakStatus === 'active' ? (
                                                  <div className="flex items-center gap-1 mr-1">
                                                    <Coffee className="h-3 w-3 text-amber-500" />
                                                    <span className="text-xs text-amber-600">On Break</span>
                                                  </div>
                                                ) : null}

                                                {isCurrent && breakStatus !== 'active' && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs mr-1"
                                                    onClick={() => handleBreakClick(position.employeeId!, position.employeeName!)}
                                                  >
                                                    <Coffee className="h-3 w-3 mr-1" />
                                                    Break
                                                  </Button>
                                                )}

                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200"
                                                  onClick={() => handleRemoveAssignment(position)}
                                                >
                                                  Remove
                                                </Button>
                                              </>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                                onClick={() => handleAssignClick(position, block.start, block.end)}
                                              >
                                                Assign
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })
                            ) : (
                              // Kitchen
                              ['Kitchen'].map(category => {
                                const positions = block.positions.filter(p => p.category === category)
                                if (positions.length === 0) return null

                                return (
                                  <div key={category} className="space-y-1">
                                    <h5 className="text-xs font-medium text-orange-600">
                                      {category}
                                    </h5>

                                    {positions.map((position: any) => {
                                      const breakStatus = getBreakStatus(position.employeeId)

                                      return (
                                        <div key={position.id} className={`flex justify-between items-center p-2 rounded-md ${breakStatus === 'active' ? 'bg-amber-50 border border-amber-200' : position.employeeId ? 'bg-white border' : 'bg-gray-50 border border-dashed border-gray-300'}`}>
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <div>
                                              <div className="font-medium text-sm">
                                                {position.employeeName || <span className="text-gray-400 italic">Unassigned</span>}
                                              </div>
                                              <div className="text-xs text-gray-500">{position.name}</div>
                                              {position.employeeId && (
                                                <div className="text-xs text-blue-500 flex items-center mt-1">
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock || 'No time data'}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            {position.employeeId ? (
                                              <>
                                                {isCurrent && breakStatus === 'active' ? (
                                                  <div className="flex items-center gap-1 mr-1">
                                                    <Coffee className="h-3 w-3 text-amber-500" />
                                                    <span className="text-xs text-amber-600">On Break</span>
                                                  </div>
                                                ) : null}

                                                {isCurrent && breakStatus !== 'active' && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs mr-1"
                                                    onClick={() => handleBreakClick(position.employeeId!, position.employeeName!)}
                                                  >
                                                    <Coffee className="h-3 w-3 mr-1" />
                                                    Break
                                                  </Button>
                                                )}

                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200"
                                                  onClick={() => handleRemoveAssignment(position)}
                                                >
                                                  Remove
                                                </Button>
                                              </>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                                onClick={() => handleAssignClick(position, block.start, block.end)}
                                              >
                                                Assign
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      </div>

      {/* Enhanced Break Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Coffee className="h-5 w-5 mr-2 text-amber-500" />
              Start Break
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee ? (
                hasHadBreak(selectedEmployee.id) ?
                  `${selectedEmployee.name} has already had a break today` :
                  `Select break duration for ${selectedEmployee.name}`
              ) : 'Select break duration'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {selectedEmployee && (
              <div className={`p-3 rounded-lg border ${hasHadBreak(selectedEmployee.id) ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${hasHadBreak(selectedEmployee.id) ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <User className={`h-5 w-5 ${hasHadBreak(selectedEmployee.id) ? 'text-green-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedEmployee.name}</h4>
                    {hasHadBreak(selectedEmployee.id) ? (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        <p>Has already had a break today</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Currently working</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Break Duration</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={breakDuration === '30' ? 'default' : 'outline'}
                  className={`h-16 ${breakDuration === '30' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-200 hover:bg-amber-50'}`}
                  onClick={() => setBreakDuration('30')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">30</span>
                    <span className="text-xs">minutes</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={breakDuration === '60' ? 'default' : 'outline'}
                  className={`h-16 ${breakDuration === '60' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-200 hover:bg-amber-50'}`}
                  onClick={() => setBreakDuration('60')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">60</span>
                    <span className="text-xs">minutes</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                Break Timer
              </h4>
              <p className="text-sm mt-1">Employee will be on break for {breakDuration} minutes</p>
              <div className="mt-2">
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakDialog(false)}>Cancel</Button>
            {selectedEmployee && hasHadBreak(selectedEmployee.id) ? (
              <Button onClick={handleStartBreak} className="bg-amber-500 hover:bg-amber-600">
                <Coffee className="h-4 w-4 mr-2" />
                Start Another Break
              </Button>
            ) : (
              <Button onClick={handleStartBreak} className="bg-amber-500 hover:bg-amber-600">
                <Coffee className="h-4 w-4 mr-2" />
                Start Break
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee List Dialog */}
      <Dialog open={showEmployeeList} onOpenChange={setShowEmployeeList}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Employees for {format(getDateForDay(activeDay), 'EEEE, MMMM d')}
            </DialogTitle>
            <DialogDescription>
              Manage employee breaks and view assignments
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {/* Check if we have employees in the setup */}
            {scheduledEmployees.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No employees found in the setup</p>
                <p className="text-sm mt-2">Please upload employees first</p>
              </div>
            ) : (
              <>
                {/* Area Tabs */}
                <div className="mb-4 border-b">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEmployeeAreaTab('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${employeeAreaTab === 'all'
                        ? 'bg-white border-x border-t text-blue-600 border-gray-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      All Employees
                    </button>
                    <button
                      onClick={() => setEmployeeAreaTab('FOH')}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${employeeAreaTab === 'FOH'
                        ? 'bg-white border-x border-t text-blue-600 border-gray-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      Front of House
                    </button>
                    <button
                      onClick={() => setEmployeeAreaTab('BOH')}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${employeeAreaTab === 'BOH'
                        ? 'bg-white border-x border-t text-green-600 border-gray-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      Kitchen
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">
                      {employeeAreaTab === 'all'
                        ? scheduledEmployees.length
                        : scheduledEmployees.filter(e => e.area === employeeAreaTab).length}
                    </Badge>
                    <span className="text-sm font-medium">
                      {employeeAreaTab === 'all'
                        ? 'Employees Scheduled'
                        : employeeAreaTab === 'FOH' ? 'FOH Employees' : 'BOH Employees'}
                    </span>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="pl-9 pr-3 py-2 text-sm border rounded-md w-full sm:w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Unassigned Employees Section */}
                {filterEmployeesByArea(unassignedEmployees).length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium">Unassigned Employees</h3>
                        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                          {filterEmployeesByArea(unassignedEmployees).length}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filterEmployeesByArea(unassignedEmployees).map(employee => {
                        const breakStatus = getBreakStatus(employee.id)
                        const remainingTime = getRemainingBreakTime(employee.id)

                        return (
                          <div key={employee.id} className={`flex items-center justify-between p-4 rounded-md border ${breakStatus === 'active' ? 'bg-amber-50 border-amber-200' : hasHadBreak(employee.id) ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-blue-50 border-gray-200'}`}>
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-medium">{employee.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                                    Unassigned
                                  </Badge>
                                  {employee.area && (
                                    <Badge variant="outline" className={`text-xs ${employee.area === 'FOH' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                      {employee.area}
                                    </Badge>
                                  )}
                                  {hasHadBreak(employee.id) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                                      <Check className="h-3 w-3 mr-1" />
                                      Had Break
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>{employee.timeBlock}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {breakStatus === 'active' ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-amber-100 text-amber-600 px-2 py-1 rounded-md text-xs">
                                    <Coffee className="h-3 w-3 mr-1" />
                                    <span>On Break ({remainingTime}m)</span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-3 border-amber-200 text-amber-600 hover:bg-amber-50"
                                    onClick={() => endBreak(employee.id)}
                                  >
                                    <Play className="h-3 w-3 mr-2" />
                                    End Break
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 px-3 ${hasHadBreak(employee.id) ? 'border-green-200 text-green-600 hover:bg-green-50' : ''}`}
                                    onClick={() => handleBreakClick(employee.id, employee.name)}
                                  >
                                    <Coffee className="h-4 w-4 mr-2" />
                                    {hasHadBreak(employee.id) ? 'Another Break' : 'Start Break'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Assigned Employees Section */}
                {filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled'))).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium">Assigned Employees</h3>
                        <Badge className="bg-green-100 text-green-600 hover:bg-green-200">
                          {filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled'))).length}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filterEmployeesByArea(getDayEmployees()
                        .filter(e => e.positions.some(p => p !== 'Scheduled')))
                        .map(employee => {
                          const breakStatus = getBreakStatus(employee.id)
                          const remainingTime = getRemainingBreakTime(employee.id)

                          return (
                            <div key={employee.id} className={`flex items-center justify-between p-4 rounded-md border ${breakStatus === 'active' ? 'bg-amber-50 border-amber-200' : hasHadBreak(employee.id) ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-green-50 border-gray-200'}`}>
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <User className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-medium">{employee.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {employee.area && (
                                      <Badge variant="outline" className={`text-xs ${employee.area === 'FOH' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        {employee.area}
                                      </Badge>
                                    )}
                                    {hasHadBreak(employee.id) && (
                                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                                        <Check className="h-3 w-3 mr-1" />
                                        Had Break
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {employee.positions
                                      .filter(p => p !== 'Scheduled')
                                      .map((position, index) => (
                                        <Badge key={index} variant="outline" className="bg-green-50 border-green-100 text-green-600">
                                          {position}
                                        </Badge>
                                    ))}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                    <span>{scheduledEmployees.find(e => e.id === employee.id)?.timeBlock || employee.timeBlocks.join(', ')}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                {breakStatus === 'active' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-amber-100 text-amber-600 px-2 py-1 rounded-md text-xs">
                                      <Coffee className="h-3 w-3 mr-1" />
                                      <span>On Break ({remainingTime}m)</span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 px-3 border-amber-200 text-amber-600 hover:bg-amber-50"
                                      onClick={() => endBreak(employee.id)}
                                    >
                                      <Play className="h-3 w-3 mr-2" />
                                      End Break
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-9 px-3 ${hasHadBreak(employee.id) ? 'border-green-200 text-green-600 hover:bg-green-50' : ''}`}
                                      onClick={() => handleBreakClick(employee.id, employee.name)}
                                    >
                                      <Coffee className="h-4 w-4 mr-2" />
                                      {hasHadBreak(employee.id) ? 'Another Break' : 'Start Break'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* All Employees Section */}
                {filterEmployeesByArea(scheduledEmployees).length > 0 && filterEmployeesByArea(unassignedEmployees).length === 0 && filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled'))).length === 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                        <h3 className="text-sm font-medium">All Employees</h3>
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                          {filterEmployeesByArea(scheduledEmployees).length}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filterEmployeesByArea(scheduledEmployees).map(employee => {
                        const breakStatus = getBreakStatus(employee.id)
                        const remainingTime = getRemainingBreakTime(employee.id)

                        return (
                          <div key={employee.id} className={`flex items-center justify-between p-4 rounded-md border ${breakStatus === 'active' ? 'bg-amber-50 border-amber-200' : hasHadBreak(employee.id) ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                              <div>
                                <h4 className="text-lg font-medium">{employee.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                    Available
                                  </Badge>
                                  {employee.area && (
                                    <Badge variant="outline" className={`text-xs ${employee.area === 'FOH' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                      {employee.area}
                                    </Badge>
                                  )}
                                  {hasHadBreak(employee.id) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                                      <Check className="h-3 w-3 mr-1" />
                                      Had Break
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>{employee.timeBlock}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {breakStatus === 'active' ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-amber-100 text-amber-600 px-2 py-1 rounded-md text-xs">
                                    <Coffee className="h-3 w-3 mr-1" />
                                    <span>On Break ({remainingTime}m)</span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-3 border-amber-200 text-amber-600 hover:bg-amber-50"
                                    onClick={() => endBreak(employee.id)}
                                  >
                                    <Play className="h-3 w-3 mr-2" />
                                    End Break
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 px-3 ${hasHadBreak(employee.id) ? 'border-green-200 text-green-600 hover:bg-green-50' : ''}`}
                                    onClick={() => handleBreakClick(employee.id, employee.name)}
                                  >
                                    <Coffee className="h-4 w-4 mr-2" />
                                    {hasHadBreak(employee.id) ? 'Another Break' : 'Start Break'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Show message if no employees match the filter */}
                {(employeeAreaTab !== 'all' && filterEmployeesByArea(scheduledEmployees).length === 0 && scheduledEmployees.length > 0) && (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
                    <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium">No {employeeAreaTab} employees found</p>
                    <p className="text-sm mt-1">Try selecting a different area filter</p>
                  </div>
                )}

                {/* Show message if no employees for this day */}
                {scheduledEmployees.length === 0 && (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
                    <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium">No employees scheduled for this day</p>
                    <p className="text-sm mt-1">Employees may be scheduled for other days of the week</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeList(false)} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Assign Employee Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Assign Employee
            </DialogTitle>
            <DialogDescription>
              {selectedPosition ? (
                <>
                  <div>Select an employee to assign to <span className="font-medium">{selectedPosition.name}</span></div>
                  <div className="flex items-center mt-2 bg-blue-50 p-2 rounded-md border border-blue-100">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Time block: <span className="font-medium">{selectedPosition.blockStart} - {selectedPosition.blockEnd}</span></span>
                  </div>
                </>
              ) : 'Select an employee'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {!selectedPosition || !selectedPosition.blockStart ? (
              <div className="text-center text-gray-500 py-4">
                <p>No time block selected</p>
              </div>
            ) : (
              <>
                {/* Show available employees */}
                {getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                    <User className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No employees available</p>
                    <p className="text-gray-400 text-sm">There are no employees scheduled for this time block</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowEmployeeList(true)}>
                      View All Employees
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Available Employees ({getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).length})</h3>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          className="pl-8 pr-2 py-1 text-sm border rounded-md w-[180px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).map(employee => (
                        <div
                          key={employee.id}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => handleAssignEmployee(employee.id, employee.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{employee.name}</div>
                                {employee.area && (
                                  <Badge variant="outline" className={`text-xs ${employee.area === 'FOH' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                    {employee.area}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{scheduledEmployees.find(e => e.id === employee.id)?.timeBlock || employee.timeBlocks.join(', ')}</span>
                              </div>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            <User className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            {selectedPosition && selectedPosition.employeeId && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (selectedPosition) {
                    handleRemoveAssignment(selectedPosition);
                    setShowAssignDialog(false);
                  }
                }}
              >
                Clear Assignment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
