import { Employee, Position, TimeBlock } from '../types';
import { normalizeDay, getTodayDayName } from './dateUtils';

// Check if an employee is currently on shift
export const isEmployeeOnCurrentShift = (employee: Employee): boolean => {
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

  return false;
};

// Extract employees from positions in the setup
export const extractEmployeesFromPositions = (weekSchedule: any) => {
  const employeesMap = new Map();

  // Check if the setup has a weekSchedule
  if (weekSchedule) {
    // Loop through each day in the week schedule
    Object.keys(weekSchedule).forEach(day => {
      const daySchedule = weekSchedule[day];

      // Check if the day has time blocks
      if (daySchedule && daySchedule.timeBlocks) {
        // Loop through each time block
        daySchedule.timeBlocks.forEach((block: TimeBlock) => {
          // Loop through each position in the time block
          block.positions.forEach((position: Position) => {
            // If the position has an employee assigned
            if (position.employeeId && position.employeeName) {
              // Add the employee to the map if not already there
              if (!employeesMap.has(position.employeeId)) {
                employeesMap.set(position.employeeId, {
                  id: position.employeeId,
                  name: position.employeeName,
                  timeBlock: `${block.start} - ${block.end}`,
                  day: day
                });
              }
            }
          });
        });
      }
    });
  }

  return Array.from(employeesMap.values());
};

// Calculate unassigned employees based on current assignments
export const calculateUnassignedEmployees = (
  employees: Employee[], 
  activeDay: string, 
  weekSchedule: any
): Employee[] => {
  // Create a set of all assigned employee IDs
  const assignedEmployeeIds = new Set<string>();

  // Get all assigned employee IDs from the current day's schedule
  if (weekSchedule && weekSchedule[activeDay]) {
    const daySchedule = weekSchedule[activeDay];
    if (daySchedule && daySchedule.timeBlocks) {
      daySchedule.timeBlocks.forEach((block: TimeBlock) => {
        block.positions.forEach((position: Position) => {
          if (position.employeeId) {
            assignedEmployeeIds.add(position.employeeId);
          }
        });
      });
    }
  }

  // Filter employees to find those scheduled for the active day but not assigned
  const normalizedActiveDay = normalizeDay(activeDay);

  const unassigned = employees.filter(emp => {
    // Normalize the employee's day for consistent comparison
    const normalizedEmpDay = emp.day ? normalizeDay(emp.day) : null;

    // Check if employee is scheduled for the active day
    const isForActiveDay = !normalizedEmpDay || normalizedEmpDay === normalizedActiveDay;

    // Only include employees for this day that aren't already assigned
    return isForActiveDay && !assignedEmployeeIds.has(emp.id);
  });

  return unassigned;
};
