import { useState, useEffect, useRef, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Clock, User, Calendar, Coffee, RefreshCw, Search, X, Check, Plus, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { formatHourTo12Hour } from '@/lib/utils/date-utils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Import our components
import {
  AssignedEmployeesSection,
  UnassignedEmployeesSection,
  AllEmployeesSection,
  NoEmployeesMessage
} from './sections'
import {
  BreakDialog,
  AssignEmployeeDialog,
  EditEmployeeDialog
} from './dialogs'
import { AddPositionDialog } from './AddPositionDialog'

// Import types
import { Setup, Employee, Position, TimeBlock, Break, BreakStatus, DaySchedule, DailyViewProps } from './types'

// Local interface for employee break tracking
interface EmployeeBreak {
  employeeId: string
  employeeName: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  status: BreakStatus
  hadBreak: boolean // Flag to indicate if employee has had a break today
}

// Extended position interface for break tracking
interface PositionWithBreak extends Position {
  breakStatus?: BreakStatus
  breakStartTime?: string
  breakEndTime?: string
}

export function DailyView({ setup, onBack }: DailyViewProps) {
  // Setup data initialization

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
      const weekDates: Record<string, Date> = {};
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      // Start with the start date and add days to get each day of the week
      for (let i = 0; i <= diffDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        weekDates[dayNames[dayIndex]] = date;
      }

      // Week dates calculated successfully;
      return weekDates;
    }

    // Date range is not a standard week;
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
  // Flag to track if breaks have been loaded from the server
  const [breaksLoaded, setBreaksLoaded] = useState(false)
  const [showBreakDialog, setShowBreakDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<{id: string, name: string} | null>(null)
  const [breakDuration, setBreakDuration] = useState('30')
  const [areaTab, setAreaTab] = useState('service') // 'service' for FC/Drive or 'kitchen' for Kitchen
  const [activeHour, setActiveHour] = useState<string | null>(null)
  const [showEmployeeList, setShowEmployeeList] = useState(false)
  const [employeeAreaTab, setEmployeeAreaTab] = useState('FOH') // 'all', 'FOH', or 'BOH'
  const [showCurrentShiftOnly, setShowCurrentShiftOnly] = useState(true) // Filter to show only employees currently on shift
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const assignDialogRef = useRef<HTMLDivElement>(null)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [showReplaceDialog, setShowReplaceDialog] = useState(false)
  const [selectedEmployeeToReplace, setSelectedEmployeeToReplace] = useState<{id: string, name: string} | null>(null)
  const [replacementName, setReplacementName] = useState('')
  const replaceDialogRef = useRef<HTMLDivElement>(null)
  const [showAddPositionDialog, setShowAddPositionDialog] = useState(false)
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock | null>(null)
  const [modifiedSetup, setModifiedSetup] = useState<Setup>(setup)
  const [originalSetup, setOriginalSetup] = useState<Setup>(setup)
  const [scheduledEmployees, setScheduledEmployees] = useState<Employee[]>([])
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  // We no longer need to update the current time
  // since we've removed the time display

  // Set initial active hour to closest available hour to current time
  useEffect(() => {
    // Get all available hours
    const availableHours = getAllHours()

    if (availableHours.length > 0) {
      // Find the closest hour to the current time
      const closestHour = findClosestHour(availableHours)

      // Set the active hour to the closest hour or the first available hour
      setActiveHour(closestHour || availableHours[0])
    }

    // Fetch scheduled employees when the active day changes
    fetchScheduledEmployees()

    // Recalculate unassigned employees when the active day changes
    if (scheduledEmployees.length > 0) {
      calculateUnassignedEmployees(scheduledEmployees)
    }
  }, [activeDay])

  // Refresh employee data when originalSetup changes
  useEffect(() => {
    console.log('originalSetup changed, refreshing employee data');
    fetchScheduledEmployees();
  }, [originalSetup])

  // Reset filter values when employee dialog is opened
  useEffect(() => {
    if (showEmployeeList) {
      // Set default filters when dialog opens
      setEmployeeAreaTab('FOH');
      setShowCurrentShiftOnly(true);
    }
  }, [showEmployeeList])

  // Check if a weekly setup has positions
  const hasPositions = (setup: Setup) => {
    if (!setup || !setup.weekSchedule) return false;

    let positionCount = 0;
    Object.keys(setup.weekSchedule).forEach(day => {
      const daySchedule = setup.weekSchedule[day];
      if (daySchedule && daySchedule.timeBlocks) {
        daySchedule.timeBlocks.forEach((block: any) => {
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
    // Development logging removed

    // If the setup doesn't have positions, we need to add them from the template
    if (!hasPositions(setup)) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development' && false) { // Disabled for now
        console.log('Setup has no positions, need to add them from template');
      }
    }

    setModifiedSetup(setup);
    setOriginalSetup(setup);

    // Initialize scheduledEmployees from uploadedSchedules if available
    if (setup.uploadedSchedules && setup.uploadedSchedules.length > 0) {
      // Logging is disabled for now
      // console.log('Loading uploaded schedules:', setup.uploadedSchedules.length);
      setScheduledEmployees(setup.uploadedSchedules);

      // Load break information from uploaded schedules
      loadBreakInformation(setup.uploadedSchedules);
    } else {
      // If no uploadedSchedules, try to extract from positions as before
      const extractedEmployees = extractEmployeesFromPositions();
      if (extractedEmployees.length > 0) {
        // Logging is disabled for now
        // console.log('Extracted employees from positions:', extractedEmployees.length);
        setScheduledEmployees(extractedEmployees);
      }
    }

    // Recalculate unassigned employees
    calculateUnassignedEmployees(setup.uploadedSchedules || []);
  }, [setup])

  // Load break information from uploaded schedules
  const loadBreakInformation = (employees: any[]) => {
    // Logging is disabled for now
    // console.log('Loading break information from employees:', employees.length);

    const breaks: EmployeeBreak[] = [];

    employees.forEach(employee => {
      // Check if employee has break information
      if (employee.breaks && employee.breaks.length > 0) {
        // Add each break to the breaks array
        employee.breaks.forEach((breakInfo: any) => {
          if (breakInfo.status === 'active' || breakInfo.status === 'completed') {
            breaks.push({
              employeeId: employee.id,
              employeeName: employee.name,
              startTime: breakInfo.startTime,
              endTime: breakInfo.endTime,
              duration: breakInfo.duration,
              status: breakInfo.status as BreakStatus,
              hadBreak: true
            });
          }
        });
      }

      // If employee has hadBreak flag but no breaks, add a completed break
      if (employee.hadBreak && (!employee.breaks || employee.breaks.length === 0)) {
        breaks.push({
          employeeId: employee.id,
          employeeName: employee.name,
          startTime: new Date().toISOString(), // Use current time as fallback
          endTime: new Date().toISOString(),
          duration: 30, // Default duration
          status: 'completed',
          hadBreak: true
        });
      }
    });

    // Logging is disabled for now
    // console.log('Loaded breaks:', breaks.length);
    setEmployeeBreaks(breaks);
    setBreaksLoaded(true);
  }

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
          daySchedule.timeBlocks.forEach((block: any) => {
            // Loop through each position in the time block
            block.positions.forEach((position: any) => {
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

      console.log('Fetching scheduled employees from originalSetup:', originalSetup);

      // Create an array to hold all employees
      let allEmployees: Employee[] = []

      // First check if we have uploadedSchedules in the original setup
      if (originalSetup.uploadedSchedules && Array.isArray(originalSetup.uploadedSchedules) && originalSetup.uploadedSchedules.length > 0) {
        console.log('Found uploadedSchedules in originalSetup:', originalSetup.uploadedSchedules.length);
        allEmployees = [...originalSetup.uploadedSchedules];
      }
      // If no uploadedSchedules, check if the setup has employees directly
      else if (setup.employees && Array.isArray(setup.employees) && setup.employees.length > 0) {
        console.log('Found employees in setup.employees:', setup.employees.length);

        // Map the employees to the format we need
        const mappedEmployees = setup.employees.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          timeBlock: `${emp.shiftStart} - ${emp.shiftEnd}`,
          area: emp.area,
          day: emp.day,
          positions: [] // Add empty positions array to satisfy Employee interface
        }) as Employee)

        allEmployees = mappedEmployees
      }

      // Also extract employees from positions (in case there are employees assigned to positions but not in setup.employees)
      const extractedEmployees = extractEmployeesFromPositions()
      if (extractedEmployees.length > 0) {
        // Logging is disabled for now
        // console.log('Extracted employees from positions:', extractedEmployees.length)

        // Add extracted employees that aren't already in allEmployees
        extractedEmployees.forEach((extractedEmp: any) => {
          if (!allEmployees.some((emp: any) => emp.id === extractedEmp.id)) {
            allEmployees.push(extractedEmp)
          }
        })
      }

      // If we found any employees (either in setup.employees or in positions)
      if (allEmployees.length > 0) {
        // Logging is disabled for now
        // console.log('Total employees found:', allEmployees.length)
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
  const calculateUnassignedEmployees = (allEmployees: any[]) => {
    // Get all assigned employee IDs
    const assignedEmployeeIds = new Set<string>()

    // Check all time blocks for the active day
    if (modifiedSetup.weekSchedule && modifiedSetup.weekSchedule[activeDay]) {
      const timeBlocks = modifiedSetup.weekSchedule[activeDay].timeBlocks || []

      timeBlocks.forEach((block: any) => {
        block.positions.forEach((position: any) => {
          if (position.employeeId) {
            assignedEmployeeIds.add(position.employeeId)
          }
        })
      })
    }

    // Filter out employees that are already assigned
    const unassigned = allEmployees.filter((emp: any) => {
      // Check if this employee is for the current day or has no day specified
      // Normalize the day name for consistent comparison
      const normalizedEmpDay = emp.day ? normalizeDay(emp.day) : null;
      const normalizedActiveDay = activeDay.toLowerCase();

      // Check if employee is scheduled for the active day

      const isForActiveDay = !normalizedEmpDay || normalizedEmpDay === normalizedActiveDay;

      // Only include employees for this day that aren't already assigned
      return isForActiveDay && !assignedEmployeeIds.has(emp.id)
    })

    // Logging is disabled for now
    // console.log(`Unassigned employees for ${activeDay}:`, unassigned.length)

    // Sort unassigned employees alphabetically by name
    const sortedUnassigned = unassigned.sort((a: any, b: any) => a.name.localeCompare(b.name))
    setUnassignedEmployees(sortedUnassigned)
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

  // Check if an employee is currently on shift
  const isEmployeeOnCurrentShift = (employee: any): boolean => {
    // First check if the employee is scheduled for today
    const normalizedEmpDay = employee.day ? normalizeDay(employee.day) : null;
    const normalizedToday = getTodayDayName();

    if (normalizedEmpDay && normalizedEmpDay !== normalizedToday) {
      return false; // Not scheduled for today
    }

    // Parse time to minutes helper function
    const parseTimeToMinutes = (timeStr: string): number => {
      try {
        // Normalize the time string
        const normalizedTimeStr = timeStr.trim().toLowerCase();

        // Check if time is in AM/PM format
        if (normalizedTimeStr.includes('am') || normalizedTimeStr.includes('pm')) {
          const isPM = normalizedTimeStr.includes('pm');
          // Remove AM/PM and any extra spaces
          const timePart = normalizedTimeStr
            .replace('am', '')
            .replace('pm', '')
            .replace('a.m.', '')
            .replace('p.m.', '')
            .replace('a.m', '')
            .replace('p.m', '')
            .trim();

          // Split into hours and minutes
          const parts = timePart.split(':');
          const hours = parseInt(parts[0], 10);
          const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

          // Handle invalid numbers
          if (isNaN(hours)) {
            return 0;
          }

          let hour = hours;

          // Convert to 24-hour format
          if (isPM && hour < 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;

          const result = hour * 60 + (isNaN(minutes) ? 0 : minutes);
          return result;
        } else {
          // Handle 24-hour format
          const parts = normalizedTimeStr.split(':');
          const hours = parseInt(parts[0], 10);
          const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

          // Handle invalid numbers
          if (isNaN(hours)) {
            return 0;
          }

          const result = hours * 60 + (isNaN(minutes) ? 0 : minutes);
          return result;
        }
      } catch (error) {
        return 0; // Return 0 as fallback
      }
    };

    // Get current time in minutes
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Check if a time block overlaps with current time
    const isTimeBlockCurrent = (block: string): boolean => {
      try {
        const [startTime, endTime] = block.split(' - ');
        if (!startTime || !endTime) {
          return false;
        }

        const startTimeInMinutes = parseTimeToMinutes(startTime);
        const endTimeInMinutes = parseTimeToMinutes(endTime);

        // Check if current time is within shift time
        return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
      } catch (error) {
        return false;
      }
    };

    // Check all possible time sources to see if employee is currently on shift

    // 1. Check timeBlock property (usually for unassigned employees)
    if (employee.timeBlock) {
      const isOnShift = isTimeBlockCurrent(employee.timeBlock);
      if (isOnShift) return true;
    }

    // 2. Check timeBlocks array (usually for assigned employees)
    if (employee.timeBlocks && employee.timeBlocks.length > 0) {
      // Check if any time block overlaps with current time
      for (const block of employee.timeBlocks) {
        const isOnShift = isTimeBlockCurrent(block);
        if (isOnShift) return true;
      }
    }

    // 3. Check if we can find the employee in scheduledEmployees
    const scheduledEmployee = scheduledEmployees.find(e => e.id === employee.id);
    if (scheduledEmployee && scheduledEmployee.timeBlock) {
      const isOnShift = isTimeBlockCurrent(scheduledEmployee.timeBlock);
      if (isOnShift) return true;
    }

    return false;
  };

  // Helper function to normalize day names for consistent comparison
  const normalizeDay = (dayString: string): string | null => {
    if (!dayString) return null

    // Convert to string in case we get a number or other type
    const dayStr = String(dayString).toLowerCase().trim()

    // Normalize the day string for consistent comparison

    // Map common day abbreviations and variations to standard format
    const dayMap: Record<string, string> = {
      // Full names
      'monday': 'monday',
      'tuesday': 'tuesday',
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday',
      'sunday': 'sunday',
      // Common abbreviations
      'mon': 'monday',
      'm': 'monday',
      'tues': 'tuesday',
      'tue': 'tuesday',
      't': 'tuesday',
      'wed': 'wednesday',
      'w': 'wednesday',
      'thurs': 'thursday',
      'thu': 'thursday',
      'th': 'thursday',
      'fri': 'friday',
      'f': 'friday',
      'sat': 'saturday',
      's': 'saturday',
      'sun': 'sunday',
      'su': 'sunday',
      // Numbers (Excel might use these)
      '1': 'monday',
      '2': 'tuesday',
      '3': 'wednesday',
      '4': 'thursday',
      '5': 'friday',
      '6': 'saturday',
      '0': 'sunday',
      '7': 'sunday'
    }

    // Direct lookup in the map
    if (dayMap[dayStr]) {
      return dayMap[dayStr]
    }

    // Check if the input starts with a day name
    for (const [abbr, fullDay] of Object.entries(dayMap)) {
      if (dayStr.startsWith(abbr) && abbr.length > 1) { // Only use abbr with length > 1 to avoid false matches
        return fullDay
      }
    }

    // Try to extract day name from a date string (e.g., "Thursday, June 15")
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for (const day of dayNames) {
      if (dayStr.includes(day)) {
        return day
      }
    }

    // If we can't determine the day, return null
    return null
  }

  // Get the date for a specific day based on the setup's start date
  const getDateForDay = (day: string) => {
    // First, check if we have pre-calculated dates from the week range
    if (weekDates && weekDates[day]) {
      // Using pre-calculated date from week range
      return weekDates[day]
    }

    // If we don't have pre-calculated dates, fall back to the original calculation
    // No pre-calculated date, using fallback calculation

    // Create a new date object from the setup's start date
    const startDate = new Date(setup.startDate)

    // Ensure the date is valid
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start date:', setup.startDate)
      return new Date() // Return current date as fallback
    }

    // Calculate date for day from start date

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
    const targetDayIndex = dayToIndex[day as keyof typeof dayToIndex]
    if (targetDayIndex === undefined) {
      console.error('Invalid day name:', day)
      return startDate
    }

    // Get the day of week for the start date (0 = Sunday, 1 = Monday, etc.)
    const startDayIndex = startDate.getDay()
    // Get start date day index

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

    // Add days to get to target day

    // Create a new date by adding the calculated days
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + daysToAdd)

    // Special case for Saturday date issue
    if (day === 'saturday') {
      // Direct fix for the specific 4/12 issue
      if (format(date, 'M/d') === '4/12') {
        // Fix for specific date issue (4/12 -> 4/19)
        // Create a new date for April 19, 2023 (or whatever year is in the original date)
        const fixedDate = new Date(date.getFullYear(), 3, 19) // Month is 0-indexed, so 3 = April
        return fixedDate
      }

      // Check if Saturday's date is the same as Sunday's date
      const sundayDate = getDateForDay('sunday')
      if (format(date, 'M/d') === format(sundayDate, 'M/d')) {
        // Fix for Saturday date being same as Sunday
        date.setDate(date.getDate() + 6) // Add 6 days to get from Sunday to Saturday
      }

      // Also check if Saturday is before any other day of the week
      const mondayDate = new Date(startDate)
      mondayDate.setDate(startDate.getDate() + 1) // Monday should be startDate + 1

      if (date < mondayDate) {
        // Fix for Saturday date being before Monday
        date.setDate(date.getDate() + 7) // Add one week
      }
    }

    // Return calculated date
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
      // No time blocks found for this day
      return []
    }

    const blocks = modifiedSetup.weekSchedule[activeDay].timeBlocks;
    return blocks;
  }

  // Filter employees by area, current shift, search term, and sort alphabetically
  const filterEmployeesByArea = (employees: any[]) => {
    // First filter by area if needed
    let filteredEmployees = employeeAreaTab === 'all'
      ? employees
      : employees.filter(employee => employee.area === employeeAreaTab)

    // Then filter by current shift if the toggle is on
    if (showCurrentShiftOnly) {
      filteredEmployees = filteredEmployees.filter(employee => {
        // Check if employee is currently on shift based on their time blocks
        return isEmployeeOnCurrentShift(employee);
      });
    }

    // Then filter by search term if one is provided
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filteredEmployees = filteredEmployees.filter(employee => {
        return employee.name.toLowerCase().includes(searchTermLower);
      });
    }

    // Then sort alphabetically by name
    return filteredEmployees.sort((a: any, b: any) => a.name.localeCompare(b.name))
  }

  // Get all employees scheduled for the active day
  const getDayEmployees = useMemo(() => {
    return () => {
      const employees = new Map<string, { id: string, name: string, positions: string[], timeBlocks: string[], area?: string }>()

    // First, add all positions with employeeId to the map
    const timeBlocks = getTimeBlocks();

    timeBlocks.forEach((block: any) => {
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

            // Determine area based on position category if not available from scheduledEmployee
            let area = scheduledEmployee?.area;
            if (!area) {
              if (position.category === 'Kitchen') {
                area = 'BOH';
              } else if (position.category === 'Front Counter' || position.category === 'Drive Thru') {
                area = 'FOH';
              }
            }

            employees.set(employeeId, {
              id: employeeId,
              name: employeeName,
              positions: [],
              timeBlocks: [],
              area: area
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

          // Update area if it's still not set but we can determine it from the position
          if (!employee.area) {
            if (position.category === 'Kitchen') {
              employee.area = 'BOH';
            } else if (position.category === 'Front Counter' || position.category === 'Drive Thru') {
              employee.area = 'FOH';
            }
          }
        }
      })
    })

    // Add ALL scheduled employees from the setup
    // This ensures we show all 86 employees in the employee list dialog
    scheduledEmployees.forEach((scheduledEmployee: any) => {
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
        } else if (!employees.get(scheduledEmployee.id)!.area && scheduledEmployee.area) {
          // Update area if it wasn't set before but is available in scheduledEmployee
          employees.get(scheduledEmployee.id)!.area = scheduledEmployee.area;
        }
      }
    })

    // Convert to array and sort alphabetically by name
    const result = Array.from(employees.values());
    return result.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [activeDay, modifiedSetup, scheduledEmployees])

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
    timeBlocks.forEach((block: any) => {
      const startHour = block.start.split(':')[0] + ':00'
      hours.add(startHour)
    })

    // Convert to array and sort
    return Array.from(hours).sort()
  }

  // Find the closest available hour to the current time
  const findClosestHour = (availableHours: string[]): string | null => {
    if (availableHours.length === 0) return null

    // Get current hour in the format "HH:00"
    const now = new Date()
    const currentHour = `${now.getHours().toString().padStart(2, '0')}:00`

    // If current hour is available, use it
    if (availableHours.includes(currentHour)) {
      return currentHour
    }

    // Convert hours to numbers for comparison
    const currentHourNum = parseInt(currentHour.split(':')[0])
    const hourNums = availableHours.map(h => parseInt(h.split(':')[0]))

    // Find the closest hour
    let closestHour = availableHours[0]
    let minDiff = 24 // Maximum possible difference

    for (const hour of availableHours) {
      const hourNum = parseInt(hour.split(':')[0])
      const diff = Math.abs(hourNum - currentHourNum)

      // If this hour is closer than the current closest
      if (diff < minDiff) {
        minDiff = diff
        closestHour = hour
      }
    }

    return closestHour
  }

  // Filter time blocks by hour
  const getTimeBlocksByHour = (hour: string) => {
    if (!hour) return []

    const allBlocks = getTimeBlocks();
    const filteredBlocks = allBlocks.filter((block: any) => {
      const blockHour = block.start.split(':')[0] + ':00'
      return blockHour === hour;
    });
    return filteredBlocks;
  }

  // Start a break for an employee
  const startBreak = async (employeeId: string, employeeName: string, duration: number) => {
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

    // Update the employee in scheduledEmployees
    const updatedEmployees = scheduledEmployees.map((emp: any) => {
      if (emp.id === employeeId) {
        // Create a new breaks array or use the existing one
        const breaks = emp.breaks || []

        // Add the new break
        breaks.push({
          startTime: now.toISOString(),
          duration,
          status: 'active'
        })

        // Return the updated employee
        return {
          ...emp,
          breaks,
          hadBreak: true
        }
      }
      return emp
    })

    // Update the state
    setScheduledEmployees(updatedEmployees)

    // Save the changes to the server
    await saveChangesAutomatically('assign')

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

      // Automatically end the break when the duration is reached
      endBreak(employeeId)
    }, duration * 60 * 1000)
  }

  // End a break for an employee
  const endBreak = async (employeeId: string) => {
    const now = new Date()
    const formattedEndTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`

    // Find the employee in the breaks array before updating state
    const employee = employeeBreaks.find(b => b.employeeId === employeeId && b.status === 'active')

    // Skip if no active break is found
    if (!employee) return

    // Update the employeeBreaks state
    setEmployeeBreaks(prev => prev.map(brk =>
      brk.employeeId === employeeId && brk.status === 'active'
        ? { ...brk, endTime: now.toISOString(), status: 'completed' }
        : brk
    ))

    // Update the employee in scheduledEmployees
    const updatedEmployees = scheduledEmployees.map((emp: any) => {
      if (emp.id === employeeId) {
        // Create a new breaks array or use the existing one
        const breaks = emp.breaks || []

        // Find the active break and update it
        const updatedBreaks = breaks.map((brk: any) => {
          if (brk.status === 'active') {
            return {
              ...brk,
              endTime: now.toISOString(),
              status: 'completed'
            }
          }
          return brk
        })

        // Return the updated employee
        return {
          ...emp,
          breaks: updatedBreaks,
          hadBreak: true
        }
      }
      return emp
    })

    // Update the state
    setScheduledEmployees(updatedEmployees)

    // Save the changes to the server
    await saveChangesAutomatically('assign')

    // Format the time for display (12-hour format)
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const formattedTime = `${displayHours}:${minutes} ${ampm}`

    toast({
      title: 'Break Ended',
      description: `${employee.employeeName}'s break ended at ${formattedTime}`
    })
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

  // Get count of service positions (Front Counter and Drive Thru) for the current hour
  const getServicePositionCount = (): number => {
    if (!activeHour) return 0

    let count = 0
    getTimeBlocksByHour(activeHour).forEach((block: any) => {
      count += block.positions.filter((p: any) => p.category === 'Front Counter' || p.category === 'Drive Thru').length
    })
    return count
  }

  // Get count of kitchen positions for the current hour
  const getKitchenPositionCount = (): number => {
    if (!activeHour) return 0

    let count = 0
    getTimeBlocksByHour(activeHour).forEach((block: any) => {
      count += block.positions.filter((p: any) => p.category === 'Kitchen').length
    })
    return count
  }

  // Get employees scheduled for the current hour
  const getEmployeesForCurrentHour = () => {
    if (!activeHour) return 0

    // Parse the active hour to minutes for comparison
    const hourStart = parseInt(activeHour) * 60
    const hourEnd = (parseInt(activeHour) + 1) * 60

    // Filter employees scheduled for the current day and hour
    return scheduledEmployees.filter(employee => {
      // Check if employee is scheduled for the current day
      const isForActiveDay = !employee.day ||
                            employee.day === activeDay ||
                            employee.day.toLowerCase() === activeDay

      if (!isForActiveDay || !employee.timeBlock) return false

      // Parse employee time block
      const [empStart, empEnd] = employee.timeBlock.split(' - ')
      if (!empStart || !empEnd) return false

      // Parse times to minutes
      const parseTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + (minutes || 0)
      }

      const empStartMinutes = parseTimeToMinutes(empStart)
      const empEndMinutes = parseTimeToMinutes(empEnd)

      // Check if employee's schedule overlaps with the current hour
      // An employee is scheduled for the hour if:
      // 1. Employee starts before or at the hour end AND
      // 2. Employee ends after the hour start
      return empStartMinutes < hourEnd && empEndMinutes > hourStart
    }).length
  }

  // Handle opening the break dialog
  const handleBreakClick = (employeeId: string, employeeName: string) => {
    setSelectedEmployee({ id: employeeId, name: employeeName })
    setShowBreakDialog(true)
  }

  // Handle starting a break from the dialog
  const handleStartBreak = async () => {
    if (selectedEmployee) {
      try {
        // Create a new break object
        const newBreak: EmployeeBreak = {
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          startTime: new Date().toISOString(),
          duration: parseInt(breakDuration),
          status: 'active',
          hadBreak: true
        }

        // Add the break to the employee breaks array
        setEmployeeBreaks(prev => [...prev, newBreak])

        // Update the employee in scheduledEmployees to mark that they've had a break
        const updatedEmployees = scheduledEmployees.map(emp => {
          if (emp.id === selectedEmployee.id) {
            // Create or update the breaks array for this employee
            const updatedBreaks = emp.breaks ? [...emp.breaks] : []
            updatedBreaks.push({
              startTime: newBreak.startTime,
              duration: newBreak.duration,
              status: newBreak.status
            })

            return {
              ...emp,
              hadBreak: true,
              breaks: updatedBreaks
            }
          }
          return emp
        })

        // Update the scheduledEmployees state
        setScheduledEmployees(updatedEmployees)

        // Close the dialog
        setShowBreakDialog(false)

        // Save the changes to the server automatically
        await saveChangesAutomatically('assign', selectedEmployee.name, `${breakDuration} minute break`)

        // Set a timeout to notify when the break should end and automatically end it
        setTimeout(() => {
          toast({
            title: 'Break Ending',
            description: `${selectedEmployee.name}'s ${breakDuration} minute break is ending now`
          })

          // Automatically end the break when the duration is reached
          endBreak(selectedEmployee.id)
        }, parseInt(breakDuration) * 60 * 1000)
      } catch (error) {
        console.error('Error starting break:', error)
        toast({
          title: 'Error',
          description: 'Failed to start break. Please try again.',
          variant: 'destructive'
        })
      }
    }
  }

  // Handle replace button click (now edit button)
  const handleReplaceClick = (employeeId: string, employeeName: string) => {
    console.log('EDIT CLICK: Opening edit dialog for', employeeName, '(ID:', employeeId, ')');
    setSelectedEmployeeToReplace({ id: employeeId, name: employeeName });
    setReplacementName('');
    setShowReplaceDialog(true);

    // Log the current state for debugging
    console.log('Current scheduledEmployees:', scheduledEmployees);
    console.log('Current modifiedSetup:', modifiedSetup);
  }

  // Handle delete employee from all positions
  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      // Store original state for potential rollback
      const originalSetup = { ...modifiedSetup };
      const originalEmployees = [...scheduledEmployees];

      // Find the employee name for toast messages
      const employeeToDelete = scheduledEmployees.find(emp => emp.id === employeeId);
      const employeeName = employeeToDelete?.name || 'Employee';

      // Create a deep copy of the setup to modify
      const newSetup = JSON.parse(JSON.stringify(modifiedSetup));

      // Track how many positions were affected
      let removedCount = 0;

      // Remove the employee from all positions in all days, not just the active day
      // This ensures the employee is completely removed from the setup
      Object.keys(newSetup.weekSchedule).forEach(day => {
        const daySchedule = newSetup.weekSchedule[day];
        if (daySchedule && daySchedule.timeBlocks) {
          daySchedule.timeBlocks.forEach((block: TimeBlock) => {
            block.positions.forEach((pos: Position) => {
              if (pos.employeeId === employeeId) {
                // Clear the employee assignment
                pos.employeeId = undefined;
                pos.employeeName = undefined;
                removedCount++;
              }
            });
          });
        }
      });

      // IMPORTANT: Also remove the employee from the uploadedSchedules array
      // This ensures the employee is removed from the database
      if (newSetup.uploadedSchedules) {
        const originalLength = newSetup.uploadedSchedules.length;
        newSetup.uploadedSchedules = newSetup.uploadedSchedules.filter(
          (emp: any) => emp.id !== employeeId
        );
        const newLength = newSetup.uploadedSchedules.length;
        console.log(`Removed employee ${employeeId} from uploadedSchedules. Before: ${originalLength}, After: ${newLength}`);
      }

      // If the setup has an employees array, remove from there too
      if (newSetup.employees && Array.isArray(newSetup.employees)) {
        const originalLength = newSetup.employees.length;
        newSetup.employees = newSetup.employees.filter(
          (emp: any) => emp.id !== employeeId
        );
        const newLength = newSetup.employees.length;
        console.log(`Removed employee ${employeeId} from employees array. Before: ${originalLength}, After: ${newLength}`);
      }

      // Update the UI immediately
      setModifiedSetup(newSetup);

      // Update scheduledEmployees to reflect the removal
      const updatedEmployees = scheduledEmployees.filter(emp => emp.id !== employeeId);
      setScheduledEmployees(updatedEmployees);

      // Recalculate unassigned employees
      calculateUnassignedEmployees(updatedEmployees);

      // Show success toast
      toast({
        title: 'Employee Removed',
        description: `${employeeName} has been removed from all positions`
      });

      // Force a re-render to update the UI
      setActiveHour(activeHour);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Save changes to the server
      try {
        // Create the payload with all scheduled employees
        const payload = {
          name: newSetup.name,
          startDate: newSetup.startDate,
          endDate: newSetup.endDate,
          weekSchedule: newSetup.weekSchedule,
          uploadedSchedules: newSetup.uploadedSchedules || updatedEmployees,
          employees: newSetup.employees || [] // Include the employees array if it exists
        };

        // Call the API directly to ensure we're sending the correct data
        const response = await fetch(`/api/weekly-setups/${setup._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save changes');
        }

        // Update the original setup with the response from the server
        const updatedSetup = await response.json();
        setOriginalSetup(updatedSetup);

        console.log('Employee successfully deleted and changes saved to server');
      } catch (error) {
        console.error('Error saving employee removal:', error);

        // Revert changes on error
        setModifiedSetup(originalSetup);
        setScheduledEmployees(originalEmployees);

        toast({
          title: 'Error Saving',
          description: 'Changes could not be saved to the server. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee. Please try again.',
        variant: 'destructive'
      });
    }
  }

  // State for replace loading
  const [isReplacing, setIsReplacing] = useState(false);

  // Helper function to update employee data consistently across all data structures
  const updateEmployeeInSetup = (
    setup: any,
    oldEmployeeId: string,
    oldEmployeeName: string,
    newEmployeeName: string,
    activeDay: string
  ) => {
    console.log('Replacing employee with ID:', oldEmployeeId, 'Name:', oldEmployeeName, 'New name:', newEmployeeName);

    // Create a new setup object with immutable updates
    const newSetup = {
      ...setup,
      // Update uploadedSchedules array if it exists - using the specific employee ID
      uploadedSchedules: setup.uploadedSchedules?.map((emp: any) => {
        // Update the specific employee by ID
        if (emp.id === oldEmployeeId) {
          // Update employee name
          return { ...emp, name: newEmployeeName };
        }
        return emp;
      }),
      // Update weekSchedule with immutable updates - ONLY for the active day
      weekSchedule: Object.fromEntries(
        Object.entries(setup.weekSchedule).map(([day, daySchedule]: [string, any]) => {
          // If this is not the active day, return it unchanged
          if (day !== activeDay) {
            return [day, daySchedule];
          }

          // Only update the active day
          return [
            day,
            {
              ...(daySchedule || {}),
              timeBlocks: daySchedule.timeBlocks?.map((block: any) => ({
                ...block,
                positions: block.positions?.map((position: any) => {
                  if (position.employeeId === oldEmployeeId) {
                    // Keep the same employeeId but update the name
                    const updatedPosition = { ...position, employeeName: newEmployeeName };
                    return updatedPosition;
                  }
                  return position;
                })
              }))
            }
          ];
        })
      )
    };

    return newSetup;
  };

  // Handle replace employee
  const handleReplaceEmployee = async () => {
    if (!selectedEmployeeToReplace || !replacementName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a replacement employee name.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Store original state for potential rollback
      const originalSetup = { ...modifiedSetup };
      const originalEmployees = [...scheduledEmployees];

      // Show loading state
      setIsReplacing(true);

      // Apply updates optimistically using the helper function
      const newSetup = updateEmployeeInSetup(
        modifiedSetup,
        selectedEmployeeToReplace.id,
        selectedEmployeeToReplace.name,
        replacementName,
        activeDay
      );

      // Count replaced positions for the toast message - ONLY for the active day
      let replacedCount = 0;
      const activeDaySchedule = newSetup.weekSchedule[activeDay];
      if (activeDaySchedule && activeDaySchedule.timeBlocks) {
        activeDaySchedule.timeBlocks.forEach((block: any) => {
          if (block.positions) {
            block.positions.forEach((position: any) => {
              if (position.employeeId === selectedEmployeeToReplace.id) {
                replacedCount++;
              }
            });
          }
        });
      }

      // Update the employee in scheduledEmployees by ID
      const updatedEmployees = scheduledEmployees.map((emp: any) => {
        // Update the specific employee by ID
        if (emp.id === selectedEmployeeToReplace.id) {
          // Update employee name in scheduledEmployees
          return { ...emp, name: replacementName };
        }
        return emp;
      });

      // Update UI immediately
      setModifiedSetup(newSetup);
      setScheduledEmployees(updatedEmployees);

      // Recalculate unassigned employees to refresh the UI
      calculateUnassignedEmployees(updatedEmployees);

      // Close dialog and show success toast
      setShowReplaceDialog(false);
      toast({
        title: 'Employee Replaced',
        description: `${selectedEmployeeToReplace.name} has been replaced with ${replacementName} in ${replacedCount} positions`
      });

      // Force a re-render to update the UI
      setActiveHour(activeHour);

      // Save changes in the background
      try {
        // Use a special 'replace' action type to handle employee replacement
        await saveChangesAutomatically('replace', replacementName, selectedEmployeeToReplace.name);
        // Success - no need for page reload
        setIsReplacing(false);
      } catch (error) {
        // Rollback on error
        setModifiedSetup(originalSetup);
        setScheduledEmployees(originalEmployees);

        toast({
          title: 'Error Saving',
          description: 'Changes could not be saved to the server. Please try again.',
          variant: 'destructive'
        });
        setIsReplacing(false);
      }
    } catch (error) {
      console.error('Error replacing employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to replace employee. Please try again.',
        variant: 'destructive'
      });
      setIsReplacing(false);
    }
  }

  // Handle adding a new employee
  const handleAddEmployee = async (name: string, area: 'FOH' | 'BOH', startTime: string, endTime: string) => {
    try {
      if (!name.trim() || !area || !startTime || !endTime) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all fields to add an employee.',
          variant: 'destructive'
        })
        return
      }

      // Create a deep copy of the modified setup
      const updatedSetup = JSON.parse(JSON.stringify(modifiedSetup))

      // Generate a unique ID for the new employee
      const newEmployeeId = `emp_${Date.now()}_${Math.floor(Math.random() * 1000)}`

      // Create the new employee object
      const newEmployee = {
        id: newEmployeeId,
        name: name.trim(),
        area: area,
        timeBlock: `${startTime} - ${endTime}`,
        day: activeDay,
        positions: ['Scheduled'] // Mark as scheduled but not assigned to a position
      }

      // Add the employee to uploadedSchedules
      if (!updatedSetup.uploadedSchedules) {
        updatedSetup.uploadedSchedules = []
      }
      updatedSetup.uploadedSchedules.push(newEmployee)

      // If the setup has an employees array, add the employee there too
      if (updatedSetup.employees && Array.isArray(updatedSetup.employees)) {
        updatedSetup.employees.push({
          id: newEmployeeId,
          name: name.trim(),
          area: area,
          shiftStart: startTime,
          shiftEnd: endTime,
          day: activeDay
        })
      }

      // Update the state
      setModifiedSetup(updatedSetup)

      // Update the scheduledEmployees state
      setScheduledEmployees([...scheduledEmployees, newEmployee])

      // Recalculate unassigned employees
      calculateUnassignedEmployees([...scheduledEmployees, newEmployee])

      // Show a toast message
      toast({
        title: 'Employee Added',
        description: `${name} has been added to the schedule for ${formatDayName(activeDay)}`
      })

      // Save changes in the background
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Create the payload with all scheduled employees
      const payload = {
        name: updatedSetup.name,
        startDate: updatedSetup.startDate,
        endDate: updatedSetup.endDate,
        weekSchedule: updatedSetup.weekSchedule,
        uploadedSchedules: updatedSetup.uploadedSchedules,
        employees: updatedSetup.employees
      }

      // Call the API directly to ensure we have complete control over the payload
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

      // Update the original setup with the response from the server
      const updatedSetupFromServer = await response.json()
      setOriginalSetup(updatedSetupFromServer)

      // Close the dialog
      setShowReplaceDialog(false)

      return true
    } catch (error) {
      console.error('Error adding employee:', error)
      toast({
        title: 'Error',
        description: 'Failed to add employee. Please try again.',
        variant: 'destructive'
      })
      return false
    }
  }

  // NOTE: This function is kept for reference but is not currently used
  // The functionality is now handled by the isAvailableForTimeBlock function inside getAvailableEmployeesForTimeBlock
  /*
  // Check if an employee is available for a specific time block
  const isEmployeeAvailableForTimeBlock = (employeeId: string, blockStart: string, blockEnd: string): boolean => {
    // Find the employee in the scheduledEmployees array
    const employee = scheduledEmployees.find(emp => emp.id === employeeId)
    if (!employee) return false

    // Parse the employee's time block
    if (!employee.timeBlock) return false
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
    // An employee is available if their schedule overlaps with the time block
    // This means:
    // 1. Employee starts before or at the block end AND
    // 2. Employee ends AFTER (not equal to) the block start
    // Note: We use > instead of >= to exclude employees who end exactly at the block start
    return empStartMinutes <= blockEndMinutes && empEndMinutes > blockStartMinutes
  }
  */

  // Get employees available for a specific time block
  const getAvailableEmployeesForTimeBlock = (blockStart: string, blockEnd: string) => {
    // Logging is disabled for now
    // console.log('Getting available employees for time block:', blockStart, '-', blockEnd)

    // Parse times to minutes for comparison
    const parseTimeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const blockStartMinutes = parseTimeToMinutes(blockStart)
    const blockEndMinutes = parseTimeToMinutes(blockEnd)

    // Helper function to check if an employee's schedule overlaps with the block
    const isAvailableForTimeBlock = (employee: any) => {
      if (!employee.timeBlock) {
        // Employee has no time block defined
        return false
      }

      const [empStart, empEnd] = employee.timeBlock.split(' - ')
      if (!empStart || !empEnd) {
        // Invalid time block format
        return false
      }

      try {
        const empStartMinutes = parseTimeToMinutes(empStart)
        const empEndMinutes = parseTimeToMinutes(empEnd)

        // Check if the employee's schedule overlaps with the block
        // An employee is available if their schedule overlaps with the time block
        // This means:
        // 1. Employee starts before or at the block end AND
        // 2. Employee ends AFTER (not equal to) the block start

        return empStartMinutes <= blockEndMinutes && empEndMinutes > blockStartMinutes;
      } catch (error) {
        // Error parsing time
        return false
      }
    }

    // Get all assigned employee IDs for the current time block
    const assignedEmployeeIds = new Set<string>()

    // Check if the selected position is being edited (in which case we want to show the currently assigned employee)
    const editingPositionId = selectedPosition?.id

    // Check all time blocks for the active day
    if (modifiedSetup.weekSchedule && modifiedSetup.weekSchedule[activeDay]) {
      const timeBlocks = modifiedSetup.weekSchedule[activeDay].timeBlocks || []

      timeBlocks.forEach((block: any) => {
        // Only consider blocks that overlap with the current time block
        const blockStartMin = parseTimeToMinutes(block.start)
        const blockEndMin = parseTimeToMinutes(block.end)

        // Check if this block overlaps with the selected time block
        // Two blocks overlap if one starts before the other ends AND one ends after the other starts
        // We use strict inequality (< and >) to avoid considering blocks that only touch at endpoints as overlapping
        // This ensures that 5-8 PM and 8-9 PM are not considered overlapping
        const overlaps = (
          (blockStartMin < blockEndMinutes && blockEndMin > blockStartMinutes) ||
          (blockStartMinutes < blockEndMin && blockEndMinutes > blockStartMin)
        )

        if (overlaps) {

          block.positions.forEach((position: any) => {
            // Skip the position we're currently editing
            if (position.id === editingPositionId) {
              return
            }

            if (position.employeeId) {
              assignedEmployeeIds.add(position.employeeId)
            }
          })
        }
      })
    }

    // All assigned employee IDs are now in the assignedEmployeeIds Set

    // Get all employees for the current day
    const employeesForDay = scheduledEmployees.filter(employee => {
      // Check if this employee is for the current day or has no day specified
      return !employee.day ||
             employee.day === activeDay ||
             employee.day.toLowerCase() === activeDay
    })

    // Filter employees for the current day

    // Filter to those available for this time block and not already assigned
    let availableEmployees = employeesForDay.filter(employee => {
      // Check if employee is available for this time block
      const isAvailable = isAvailableForTimeBlock(employee)

      // Check if employee is already assigned to another position in this time block
      const isAlreadyAssigned = assignedEmployeeIds.has(employee.id)

      // Skip employees who are available but already assigned

      const result = isAvailable && !isAlreadyAssigned;
      return result;
    })

    // Filter available employees

    // Filter by area based on the selected position's category
    if (selectedPosition) {
      // Determine the required area based on position
      let requiredArea = null;
      if ((selectedPosition as any).category === 'Kitchen' || (selectedPosition as any).category === 'BOH') {
        requiredArea = 'BOH';
      } else if ((selectedPosition as any).category === 'Front Counter' || (selectedPosition as any).category === 'Drive Thru' || (selectedPosition as any).category === 'FOH') {
        requiredArea = 'FOH';
      }

      if (requiredArea) {

        // Filter employees by area, but first ensure all employees have an area set
        availableEmployees = availableEmployees.map(employee => {
          // If employee doesn't have an area set, try to determine it
          if (!employee.area) {
            // Find the employee in scheduledEmployees to get area information
            const scheduledEmployee = scheduledEmployees.find(e => e.id === employee.id);
            if (scheduledEmployee && scheduledEmployee.area) {
              return { ...employee, area: scheduledEmployee.area };
            }
          }
          return employee;
        }).filter(employee => employee.area === requiredArea);
      }
    }

    // Filter by search term if one is provided
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      availableEmployees = availableEmployees.filter(employee => {
        return employee.name.toLowerCase().includes(searchTermLower);
      });
    }

    // Sort employees alphabetically by name
    return availableEmployees.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Handle opening the assign dialog
  const handleAssignClick = (position: Position, blockStart: string, blockEnd: string) => {
    setSelectedPosition({...position, blockStart, blockEnd})
    setShowAssignDialog(true)
  }

  // Handle opening the add position dialog
  const handleAddPositionClick = (timeBlock: any) => {
    console.log('Opening add position dialog for time block:', timeBlock);

    // Store the time block and category information
    const timeBlockData = {
      id: timeBlock.id,
      start: timeBlock.start,
      end: timeBlock.end,
      positions: timeBlock.positions || [],
      category: timeBlock.category // Keep the category property for the AddPositionDialog
    };

    console.log('Setting selected time block:', timeBlockData);
    setSelectedTimeBlock(timeBlockData);
    setShowAddPositionDialog(true);
  }

  // Handle adding a new position
  const handleAddPosition = async (newPosition: any) => {
    if (!selectedTimeBlock) return

    console.log('Adding new position:', newPosition);
    console.log('Selected time block:', selectedTimeBlock);
    console.log('Active day:', activeDay);

    // Create a new position with a unique ID
    const position: Position = {
      id: crypto.randomUUID(),
      name: newPosition.name,
      blockStart: newPosition.blockStart || selectedTimeBlock?.start || '',
      blockEnd: newPosition.blockEnd || selectedTimeBlock?.end || '',
      employeeId: undefined,
      category: newPosition.category,
      section: newPosition.section
    }

    console.log('Created position object:', position);

    try {
      // First, fetch the latest setup data from the server to ensure we have the most up-to-date data
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch the latest setup data
      const fetchResponse = await fetch(`/api/weekly-setups/${setup._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.message || 'Failed to fetch latest setup data');
      }

      // Get the latest setup data
      const latestSetup = await fetchResponse.json();
      console.log('Latest setup data from server:', latestSetup);

      // Create a deep copy of the latest setup
      const updatedSetup = JSON.parse(JSON.stringify(latestSetup));

      console.log('Current weekSchedule structure:', updatedSetup.weekSchedule);

      // Ensure the day structure exists
      if (!updatedSetup.weekSchedule) {
        updatedSetup.weekSchedule = {};
      }

      if (!updatedSetup.weekSchedule[activeDay]) {
        updatedSetup.weekSchedule[activeDay] = { timeBlocks: [] };
      }

      if (!updatedSetup.weekSchedule[activeDay].timeBlocks) {
        updatedSetup.weekSchedule[activeDay].timeBlocks = [];
      }

      // Find the time block
      const timeBlocks = updatedSetup.weekSchedule[activeDay].timeBlocks;
      const blockIndex = timeBlocks.findIndex((block: any) => block.id === selectedTimeBlock.id);

      console.log('Time block index:', blockIndex);

      if (blockIndex !== -1) {
        // Add the position to the time block
        if (!updatedSetup.weekSchedule[activeDay].timeBlocks[blockIndex].positions) {
          updatedSetup.weekSchedule[activeDay].timeBlocks[blockIndex].positions = [];
        }

        updatedSetup.weekSchedule[activeDay].timeBlocks[blockIndex].positions.push(position);
        console.log('Position added to time block');
      } else {
        console.error('Time block not found in the day schedule');

        // If the time block doesn't exist, create it
        const newTimeBlock = {
          id: selectedTimeBlock.id,
          start: selectedTimeBlock.start,
          end: selectedTimeBlock.end,
          positions: [position]
        };

        updatedSetup.weekSchedule[activeDay].timeBlocks.push(newTimeBlock);
        console.log('Created new time block with position');
      }

      console.log('Updated setup structure:', updatedSetup.weekSchedule[activeDay]);

      // Create the payload with the updated setup
      const payload = {
        name: updatedSetup.name,
        startDate: updatedSetup.startDate,
        endDate: updatedSetup.endDate,
        weekSchedule: updatedSetup.weekSchedule,
        uploadedSchedules: updatedSetup.uploadedSchedules || scheduledEmployees
      }

      console.log('Sending payload to server:', JSON.stringify(payload));

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

      // Update the original setup with the response from the server
      const updatedSetupFromServer = await response.json()
      console.log('Response from server:', updatedSetupFromServer);

      // Update both states to ensure consistency
      setOriginalSetup(updatedSetupFromServer)
      setModifiedSetup(updatedSetupFromServer)

      // Force a re-render of the UI
      setActiveHour(activeHour)

      // Show success message
      toast({
        title: 'Position Added',
        description: `Added ${position.name} to ${selectedTimeBlock.start} - ${selectedTimeBlock.end}`,
      })
    } catch (error) {
      console.error('Error adding position:', error)

      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }

      // Check if the error is related to the API call
      let errorMessage = 'Failed to add position';
      if (error instanceof Error) {
        errorMessage = error.message;

        // Add more context to the error message
        if (error.message.includes('fetch')) {
          errorMessage = `Network error: ${error.message}`;
        } else if (error.message.includes('JSON')) {
          errorMessage = `Data format error: ${error.message}`;
        }
      }

      // Show error toast with detailed information
      toast({
        title: 'Error Saving Position',
        description: `${errorMessage}. Please try again.`,
        variant: 'destructive'
      })

      // Log the current state for debugging
      console.error('Current setup state:', modifiedSetup);
      console.error('Selected time block:', selectedTimeBlock);
      console.error('Active day:', activeDay);

      // Try to fetch the current state from the server to see what's actually saved
      try {
        const token = localStorage.getItem('token');
        if (token) {
          fetch(`/api/weekly-setups/${setup._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => response.json())
          .then(data => {
            console.log('Current server state:', data);
          })
          .catch(fetchError => {
            console.error('Error fetching current server state:', fetchError);
          });
        }
      } catch (fetchError) {
        console.error('Error in error handler:', fetchError);
      }
    }
  }

  // Effect to handle focus when assign dialog opens
  useEffect(() => {
    if (showAssignDialog && assignDialogRef.current) {
      // Set focus to the dialog content instead of any input
      assignDialogRef.current.focus()
    }
  }, [showAssignDialog])

  // Handle assigning an employee to a position
  const handleAssignEmployee = (employeeId: string, employeeName: string) => {
    if (!selectedPosition) return

    try {
      // Assign employee to position

      // Create a deep copy of the setup to modify
      const newSetup = JSON.parse(JSON.stringify(modifiedSetup))

      // Make sure we have a valid employee name, use position name as fallback
      const finalEmployeeName = employeeName && employeeName !== 'Unknown Employee'
        ? employeeName
        : selectedPosition.name

      // Store the original position data in case we need to revert
      const originalPosition = JSON.parse(JSON.stringify(selectedPosition))

      // Find the position in the setup and update it
      const daySchedule = newSetup.weekSchedule[activeDay]
      if (daySchedule && daySchedule.timeBlocks) {
        daySchedule.timeBlocks.forEach((block: TimeBlock) => {
          block.positions.forEach((pos: Position) => {
            if (pos.id === selectedPosition.id) {
              // Update position with employee information
              pos.employeeId = employeeId
              pos.employeeName = finalEmployeeName
            }
          })
        })
      }

      // Immediately update the UI for a responsive feel
      setModifiedSetup(newSetup)
      setShowAssignDialog(false)

      // Recalculate unassigned employees after assignment
      calculateUnassignedEmployees(scheduledEmployees)

      // Show a toast message immediately
      toast({
        title: 'Assignment Updated',
        description: `${finalEmployeeName} assigned to ${selectedPosition.name}`
      })

      // Force a re-render to update the UI
      setActiveHour(activeHour)

      // Save changes in the background
      saveChangesAutomatically('assign', finalEmployeeName, selectedPosition.name).catch(error => {
        console.error('Error saving assignment:', error)

        // Revert the UI changes if the save fails
        const revertedSetup = JSON.parse(JSON.stringify(modifiedSetup))
        const revertDaySchedule = revertedSetup.weekSchedule[activeDay]
        if (revertDaySchedule && revertDaySchedule.timeBlocks) {
          revertDaySchedule.timeBlocks.forEach((block: TimeBlock) => {
            block.positions.forEach((pos: Position) => {
              if (pos.id === originalPosition.id) {
                pos.employeeId = originalPosition.employeeId
                pos.employeeName = originalPosition.employeeName
              }
            })
          })
        }

        // Update the UI with the reverted changes
        setModifiedSetup(revertedSetup)

        // Show error toast
        toast({
          title: 'Error Saving',
          description: 'Failed to save assignment. Changes have been reverted.',
          variant: 'destructive'
        })

        // Force a re-render to update the UI with reverted changes
        setActiveHour(activeHour)
      })
    } catch (error) {
      console.error('Error assigning employee:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign employee. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Handle removing an employee from a position
  const handleRemoveAssignment = (position: Position) => {
    try {
      // Remove assignment from position

      // Create a deep copy of the setup to modify
      const newSetup = JSON.parse(JSON.stringify(modifiedSetup))

      // Store the original position data in case we need to revert
      const originalPosition = JSON.parse(JSON.stringify(position))

      // Store employee name for the toast message
      let removedEmployeeName = ''

      // Find the position in the setup and update it
      const daySchedule = newSetup.weekSchedule[activeDay]
      if (daySchedule && daySchedule.timeBlocks) {
        daySchedule.timeBlocks.forEach((block: TimeBlock) => {
          block.positions.forEach((pos: Position) => {
            if (pos.id === position.id) {
              // Update position information
              removedEmployeeName = pos.employeeName || 'Employee'
              pos.employeeId = undefined
              pos.employeeName = undefined
            }
          })
        })
      }

      // Immediately update the UI for a responsive feel
      setModifiedSetup(newSetup)

      // Recalculate unassigned employees after removing assignment
      calculateUnassignedEmployees(scheduledEmployees)

      // Show a toast message immediately
      toast({
        title: 'Assignment Removed',
        description: `${removedEmployeeName} removed from ${position.name}`
      })

      // Force a re-render to update the UI
      setActiveHour(activeHour)

      // Save changes in the background
      saveChangesAutomatically('remove', removedEmployeeName, position.name).catch(error => {
        console.error('Error saving removal:', error)

        // Revert the UI changes if the save fails
        const revertedSetup = JSON.parse(JSON.stringify(modifiedSetup))
        const revertDaySchedule = revertedSetup.weekSchedule[activeDay]
        if (revertDaySchedule && revertDaySchedule.timeBlocks) {
          revertDaySchedule.timeBlocks.forEach((block: TimeBlock) => {
            block.positions.forEach((pos: Position) => {
              if (pos.id === originalPosition.id) {
                pos.employeeId = originalPosition.employeeId
                pos.employeeName = originalPosition.employeeName
              }
            })
          })
        }

        // Update the UI with the reverted changes
        setModifiedSetup(revertedSetup)

        // Show error toast
        toast({
          title: 'Error Saving',
          description: 'Failed to save removal. Changes have been reverted.',
          variant: 'destructive'
        })

        // Force a re-render to update the UI with reverted changes
        setActiveHour(activeHour)
      })
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove assignment. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // State for tracking when changes are being saved
  const [isSaving, setIsSaving] = useState(false);

  // Reference to track the last save operation
  const saveOperationRef = useRef<{ timestamp: number, promise: Promise<any> | null }>({ timestamp: 0, promise: null });

  // Save the modified setup automatically without page reload
  const saveChangesAutomatically = async (_actionType: 'assign' | 'remove' | 'replace', _employeeName?: string, _positionName?: string) => {
    try {
      const now = Date.now();

      console.log('Saving changes automatically:', _actionType, _employeeName, _positionName);
      console.log('Current weekSchedule structure:', modifiedSetup.weekSchedule);

      // If there's a save operation in progress that started less than 500ms ago, return that promise
      // This prevents multiple rapid saves for the same operation
      if (saveOperationRef.current.promise && now - saveOperationRef.current.timestamp < 500) {
        console.log('Save operation already in progress, reusing promise');
        return saveOperationRef.current.promise;
      }

      // Set saving state to show loading indicator
      setIsSaving(true);

      // Get the token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Create a deep copy of the current setup to ensure we're not modifying the original
      const setupToSave = JSON.parse(JSON.stringify(modifiedSetup));

      // Ensure the day structure exists for all days in the weekSchedule
      if (setupToSave.weekSchedule) {
        Object.keys(setupToSave.weekSchedule).forEach(day => {
          if (!setupToSave.weekSchedule[day]) {
            setupToSave.weekSchedule[day] = { timeBlocks: [] };
          }

          if (!setupToSave.weekSchedule[day].timeBlocks) {
            setupToSave.weekSchedule[day].timeBlocks = [];
          }
        });
      }

      // Create the payload with all scheduled employees
      const payload = {
        name: setupToSave.name,
        startDate: setupToSave.startDate,
        endDate: setupToSave.endDate,
        weekSchedule: setupToSave.weekSchedule,
        uploadedSchedules: setupToSave.uploadedSchedules || scheduledEmployees // Use uploadedSchedules from modifiedSetup if available
      }

      console.log('Sending payload to server:', payload);

      // Create the save promise
      const savePromise = (async () => {
        try {
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

          // Update the original setup with the response from the server
          const updatedSetup = await response.json()
          console.log('Response from server:', updatedSetup);

          // Update both states to ensure consistency
          setOriginalSetup(updatedSetup)
          setModifiedSetup(updatedSetup)

          // Also update the scheduledEmployees state with the response
          if (updatedSetup.uploadedSchedules && updatedSetup.uploadedSchedules.length > 0) {
            setScheduledEmployees(updatedSetup.uploadedSchedules);
          }

          // Recalculate unassigned employees to refresh the UI
          calculateUnassignedEmployees(updatedSetup.uploadedSchedules || scheduledEmployees);

          // We don't need to show toast messages here anymore since they're shown immediately in the handler functions

          // Clear saving state
          setIsSaving(false);
          return true;
        } catch (error) {
          console.error('Error in saveChangesAutomatically:', error);

          // Log detailed error information
          if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
          }

          // Clear saving state
          setIsSaving(false);
          // Re-throw the error to be handled by the caller
          throw error;
        } finally {
          // Clear the current save operation reference
          saveOperationRef.current.promise = null;
        }
      })();

      // Store the current save operation
      saveOperationRef.current = {
        timestamp: now,
        promise: savePromise
      };

      return savePromise;
    } catch (error) {
      console.error('Error saving setup:', error)
      toast({
        title: 'Error Saving',
        description: error instanceof Error ? error.message : 'Failed to save changes.',
        variant: 'destructive'
      })
      // Clear saving state
      setIsSaving(false);
      // Re-throw the error to be handled by the caller
      throw error
    }
  }

  // This function has been replaced by the automatic saving functionality

  // Get time blocks for the current day
  getTimeBlocks()
  getCurrentTimeBlocks()
  getAssignedEmployees()
  const allHours = getAllHours()
  const hourTimeBlocks = activeHour ? getTimeBlocksByHour(activeHour) : []

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Streamlined header with controls */}
      <div className="sticky top-0 z-10 bg-white border-b pb-3 pt-2 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 px-2">
          {/* Action buttons - full width on mobile */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowEmployeeList(true)}
            className="h-10 w-full sm:w-auto flex-1 sm:flex-none bg-red-600 hover:bg-red-700 border-0 shadow-sm hover:shadow-md transition-all duration-200 text-white font-medium"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-white bg-opacity-20 rounded-full p-1 mr-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Employees</span>
              <div className="flex items-center ml-2">
                <span className="bg-white bg-opacity-25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {getEmployeesForCurrentHour()}
                </span>
              </div>
            </div>
          </Button>

          {/* Loading indicator shown when changes are being saved */}
          {isSaving && (
            <div className="h-10 flex items-center justify-center px-4 w-full sm:w-auto flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin text-red-600" />
              <span className="text-sm text-red-600 font-medium">Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Day and hour selection dropdowns */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="border-b bg-gray-50 p-3">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Select Day</label>
              <Select value={activeDay} onValueChange={setActiveDay}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => {
                    const date = getDateForDay(day)
                    const isToday = new Date().toDateString() === date.toDateString()

                    return (
                      <SelectItem key={day} value={day} className="flex items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDayName(day)}</span>
                          <span className="text-xs text-gray-500">
                            {day === 'saturday' && format(date, 'M/d') === '4/12' ? '4/19' : format(date, 'M/d')}
                          </span>
                          {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Today</span>}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Select Hour</label>
              {allHours.length > 0 ? (
                <Select value={activeHour || ''} onValueChange={setActiveHour}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select an hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {allHours.map(hour => {
                      const now = new Date()
                      const isCurrentHour = hour.split(':')[0] === now.getHours().toString().padStart(2, '0')
                      const hasScheduledBlocks = getTimeBlocksByHour(hour).length > 0
                      const positionCount = getTimeBlocksByHour(hour).reduce((acc: number, block: any) => acc + block.positions.length, 0)

                      // Format the hour for display with AM/PM - commented out unused variables
                      // const displayHour = parseInt(hour)
                      // const formattedHour = formatHourTo12Hour(displayHour)
                      // const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
                      // const formattedCurrentTime = formatHourTo12Hour(`${now.getHours()}:${now.getMinutes()}`)

                      // Check if this hour is the selected hour
                      const isSelectedHour = hour === activeHour

                      return (
                        <SelectItem key={hour} value={hour}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              {isSelectedHour && <Check className="h-4 w-4 text-red-600 mr-1.5" />}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{parseInt(hour) === 0 ? 12 : parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour)}</span>
                                <span className="text-xs text-gray-500">{parseInt(hour) >= 12 ? 'PM' : 'AM'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {hasScheduledBlocks && (
                                <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                                  {positionCount} positions
                                </span>
                              )}
                              {isCurrentHour && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Current</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-3 bg-gray-50 rounded-md flex flex-col items-center">
                  <Calendar className="h-6 w-6 text-gray-300 mb-1" />
                  <p className="text-gray-500 text-sm font-medium">No time blocks scheduled</p>
                  <p className="text-gray-400 text-xs">There are no positions scheduled for {formatDayName(activeDay)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

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

            {/* We've removed the duplicate "Current time blocks" section and kept only the hour-based view */}

            {/* Position display - enhanced with better visual hierarchy */}
            {activeHour && allHours.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-md font-semibold flex items-center">
                  {/* Removed duplicate time display */}
                </h3>

                {hourTimeBlocks.length === 0 ? (
                  <Card className="p-4 text-center text-gray-500">
                    <p className="text-sm">No positions scheduled for {formatHourTo12Hour(activeHour)} - {formatHourTo12Hour(parseInt(activeHour) + 1)}</p>
                    <p className="text-xs mt-1">Try selecting a different hour or check the schedule</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {hourTimeBlocks.map((block: TimeBlock) => {
                      const isCurrent = isCurrentTimeBlock(block) && activeDay === getTodayDayName()

                      return (
                        <Card
                          key={block.id}
                          className={`p-3 ${isCurrent ? 'border-blue-200 bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              {isCurrent && <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>}
                              <h4 className="text-sm font-medium">{formatHourTo12Hour(block.start)} - {formatHourTo12Hour(block.end)}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCurrent && <Badge className="bg-blue-500 text-white">Current</Badge>}
                            </div>
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
                                                  {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock ?
                                                    scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock?.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ') :
                                                    'No time data'}
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
                                                    <span className="text-xs text-amber-600">On Break ({getRemainingBreakTime(position.employeeId)}m)</span>
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

                                    {/* Add Position option */}
                                    <div
                                      className="flex justify-between items-center p-2 rounded-md border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 mt-2"
                                      onClick={() => handleAddPositionClick({...block, category})}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <div className="font-medium text-sm text-gray-500">
                                            Add Position
                                          </div>
                                          <div className="text-xs text-gray-400">{category}</div>
                                        </div>
                                      </div>
                                    </div>
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
                                                  {scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock ?
                                                    scheduledEmployees.find(e => e.id === position.employeeId)?.timeBlock?.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ') :
                                                    'No time data'}
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
                                                    <span className="text-xs text-amber-600">On Break ({getRemainingBreakTime(position.employeeId)}m)</span>
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

                                    {/* Add Position option */}
                                    <div
                                      className="flex justify-between items-center p-2 rounded-md border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 mt-2"
                                      onClick={() => handleAddPositionClick({...block, category})}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <div className="font-medium text-sm text-gray-500">
                                            Add Position
                                          </div>
                                          <div className="text-xs text-gray-400">{category}</div>
                                        </div>
                                      </div>
                                    </div>
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
        </div>
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
      <Dialog open={showEmployeeList} onOpenChange={(open) => {
        setShowEmployeeList(open);
        if (!open) {
          setSearchTerm('');
        }
      }} key={`employee-list-${scheduledEmployees.length}-${JSON.stringify(unassignedEmployees)}`}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Employees for {format(getDateForDay(activeDay), 'EEEE, MMMM d')} {activeHour && `${formatHourTo12Hour(activeHour)}-${formatHourTo12Hour(parseInt(activeHour) + 1)}`} ({getEmployeesForCurrentHour()})
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
                      {filterEmployeesByArea(scheduledEmployees).length}
                    </Badge>
                    <span className="text-sm font-medium">
                      {employeeAreaTab === 'all'
                        ? 'Employees Scheduled'
                        : employeeAreaTab === 'FOH' ? 'FOH Employees' : 'BOH Employees'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Current Shift Toggle */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="current-shift-toggle"
                          checked={showCurrentShiftOnly}
                          onCheckedChange={setShowCurrentShiftOnly}
                          className={`${showCurrentShiftOnly ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                        <label
                          htmlFor="current-shift-toggle"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Current Shift Only
                        </label>
                      </div>
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          className="pl-9 pr-3 py-2 text-sm border rounded-md w-full sm:w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Employee Button */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-200 text-green-600 hover:bg-green-50 flex items-center justify-center"
                    onClick={() => {
                      setSelectedEmployeeToReplace(null);
                      setReplacementName('');
                      setShowReplaceDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>

                {/* Assigned Employees Section - Show First */}
                <AssignedEmployeesSection
                  filteredAssignedEmployees={filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled')))}
                  getBreakStatus={(id: string) => getBreakStatus(id) === 'active' ? 'active' : 'none'}
                  getRemainingBreakTime={getRemainingBreakTime}
                  hasHadBreak={hasHadBreak}
                  handleBreakClick={handleBreakClick}
                  handleReplaceClick={handleReplaceClick}
                  endBreak={endBreak}
                />

                {/* Unassigned Employees Section - Show Second */}
                <UnassignedEmployeesSection
                  filteredUnassignedEmployees={filterEmployeesByArea(unassignedEmployees)}
                  getBreakStatus={(id: string) => getBreakStatus(id) === 'active' ? 'active' : 'none'}
                  getRemainingBreakTime={getRemainingBreakTime}
                  hasHadBreak={hasHadBreak}
                  handleBreakClick={handleBreakClick}
                  handleReplaceClick={handleReplaceClick}
                  endBreak={endBreak}
                />

                {/* All Employees Section */}
                <AllEmployeesSection
                  filteredScheduledEmployees={filterEmployeesByArea(scheduledEmployees)}
                  filteredUnassignedEmployees={filterEmployeesByArea(unassignedEmployees)}
                  filteredAssignedEmployees={filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled')))}
                  getBreakStatus={(id: string) => getBreakStatus(id) === 'active' ? 'active' : 'none'}
                  getRemainingBreakTime={getRemainingBreakTime}
                  hasHadBreak={hasHadBreak}
                  handleBreakClick={handleBreakClick}
                  handleReplaceClick={handleReplaceClick}
                  endBreak={endBreak}
                />

                {/* Removed duplicate All Employees Section */}

                {/* Show message if no employees match the filter */}
                {(() => {
                  const filteredScheduledEmployees = filterEmployeesByArea(scheduledEmployees);
                  const filteredUnassignedEmployees = filterEmployeesByArea(unassignedEmployees);
                  const filteredAssignedEmployees = filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled')));

                  const noEmployeesMatchFilter = employeeAreaTab !== 'all' &&
                    filteredScheduledEmployees.length === 0 &&
                    scheduledEmployees.length > 0 &&
                    filteredUnassignedEmployees.length === 0 &&
                    filteredAssignedEmployees.length === 0;

                  if (noEmployeesMatchFilter) {
                    return <NoEmployeesMessage type="filter" employeeAreaTab={employeeAreaTab} />;
                  }
                  return null;
                })()}

                {/* Show message if no employees match the current shift filter */}
                {(() => {
                  const filteredAssignedEmployees = filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled')));
                  const filteredUnassignedEmployees = filterEmployeesByArea(unassignedEmployees);

                  const noEmployeesOnCurrentShift = showCurrentShiftOnly &&
                    filteredAssignedEmployees.length === 0 &&
                    filteredUnassignedEmployees.length === 0 &&
                    scheduledEmployees.length > 0;

                  if (noEmployeesOnCurrentShift) {
                    return <NoEmployeesMessage type="currentShift" />;
                  }
                  return null;
                })()}

                {/* Show message if no employees for this day */}
                {scheduledEmployees.length === 0 && (
                  <NoEmployeesMessage type="noSchedule" />
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEmployeeList(false);
              setSearchTerm('');
            }} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Assign Employee Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={(open) => {
        setShowAssignDialog(open);
        if (!open) {
          setSearchTerm('');
          setSelectedPosition(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]" ref={assignDialogRef} tabIndex={0}>
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
                    <span className="text-sm">Time block: <span className="font-medium">{formatHourTo12Hour(selectedPosition.blockStart || '')} - {formatHourTo12Hour(selectedPosition.blockEnd || '')}</span></span>
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
                {getAvailableEmployeesForTimeBlock(selectedPosition?.blockStart || '', selectedPosition?.blockEnd || '').length === 0 ? (
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
                      <h3 className="text-sm font-medium">Available Employees ({getAvailableEmployeesForTimeBlock(selectedPosition?.blockStart || '', selectedPosition?.blockEnd || '').length})</h3>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          className="pl-8 pr-2 py-1 text-sm border rounded-md w-[180px]"
                          autoFocus={false}
                          tabIndex={-1}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {getAvailableEmployeesForTimeBlock(selectedPosition?.blockStart || '', selectedPosition?.blockEnd || '').map((employee: any) => (
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
                                <span>
                                  {scheduledEmployees.find(e => e.id === employee.id)?.timeBlock ?
                                    scheduledEmployees.find(e => e.id === employee.id)?.timeBlock?.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ') :
                                    employee.timeBlocks ? employee.timeBlocks.map((block: string) => block.split(' - ').map((time: string) => formatHourTo12Hour(time)).join(' - ')).join(', ') : ''
                                  }
                                </span>
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
            <Button variant="outline" onClick={() => {
              setShowAssignDialog(false);
              setSearchTerm('');
            }}>Cancel</Button>
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

      {/* Add Position Dialog */}
      <AddPositionDialog
        open={showAddPositionDialog}
        onOpenChange={setShowAddPositionDialog}
        onAddPosition={handleAddPosition}
        timeBlock={selectedTimeBlock || { id: '', start: '', end: '', positions: [] } as TimeBlock}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        selectedEmployee={selectedEmployeeToReplace}
        replacementName={replacementName}
        setReplacementName={setReplacementName}
        handleReplaceEmployee={handleReplaceEmployee}
        handleDeleteEmployee={handleDeleteEmployee}
        handleAddEmployee={handleAddEmployee}
        isReplacing={isReplacing}
        dialogRef={replaceDialogRef}
      />
    </div>
  )
}
