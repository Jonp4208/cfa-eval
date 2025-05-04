import { useState, useEffect } from 'react';
import { Employee, BreakStatus } from '../types';
import log from '../utils/logUtils';

interface EmployeeBreak {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  status: BreakStatus;
  hadBreak: boolean; // Flag to indicate if employee has had a break today
}

export const useBreakManager = (scheduledEmployees: Employee[]) => {
  const [employeeBreaks, setEmployeeBreaks] = useState<EmployeeBreak[]>([]);
  const [breaksLoaded, setBreaksLoaded] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{id: string, name: string} | null>(null);
  const [breakDuration, setBreakDuration] = useState('30');

  // Load break information from uploaded schedules
  useEffect(() => {
    if (scheduledEmployees.length > 0 && !breaksLoaded) {
      loadBreakInformation(scheduledEmployees);
    }
  }, [scheduledEmployees, breaksLoaded]);

  // Load break information from uploaded schedules
  const loadBreakInformation = (employees: Employee[]) => {
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

    setEmployeeBreaks(breaks);
    setBreaksLoaded(true);
  };

  // Get break status for an employee
  const getBreakStatus = (employeeId: string): BreakStatus => {
    const activeBreak = employeeBreaks.find(
      b => b.employeeId === employeeId && b.status === 'active'
    );
    
    return activeBreak ? 'active' : 'none';
  };

  // Check if an employee has had a break today
  const hasHadBreak = (employeeId: string): boolean => {
    return employeeBreaks.some(
      b => b.employeeId === employeeId && (b.status === 'completed' || b.hadBreak)
    );
  };

  // Get remaining break time in minutes
  const getRemainingBreakTime = (employeeId: string): number => {
    const activeBreak = employeeBreaks.find(
      b => b.employeeId === employeeId && b.status === 'active'
    );
    
    if (!activeBreak) return 0;
    
    const startTime = new Date(activeBreak.startTime).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
    
    return Math.max(0, activeBreak.duration - elapsedMinutes);
  };

  // Handle starting a break
  const startBreak = (employeeId: string, employeeName: string, duration: number) => {
    // Create a new break
    const newBreak: EmployeeBreak = {
      employeeId,
      employeeName,
      startTime: new Date().toISOString(),
      duration,
      status: 'active',
      hadBreak: true
    };
    
    // Add the new break to the list
    setEmployeeBreaks(prev => [...prev, newBreak]);
    
    // Update the employee in scheduledEmployees
    // This would typically be handled by the parent component
    
    log.info(`Started ${duration} minute break for ${employeeName}`);
  };

  // Handle ending a break
  const endBreak = (employeeId: string) => {
    setEmployeeBreaks(prev => 
      prev.map(b => 
        b.employeeId === employeeId && b.status === 'active'
          ? { ...b, status: 'completed', endTime: new Date().toISOString() }
          : b
      )
    );
    
    // Update the employee in scheduledEmployees
    // This would typically be handled by the parent component
    
    log.info(`Ended break for employee ${employeeId}`);
  };

  // Handle opening the break dialog
  const handleBreakClick = (id: string, name: string) => {
    setSelectedEmployee({ id, name });
    setShowBreakDialog(true);
  };

  return {
    employeeBreaks,
    setEmployeeBreaks,
    breaksLoaded,
    showBreakDialog,
    setShowBreakDialog,
    selectedEmployee,
    setSelectedEmployee,
    breakDuration,
    setBreakDuration,
    getBreakStatus,
    hasHadBreak,
    getRemainingBreakTime,
    startBreak,
    endBreak,
    handleBreakClick
  };
};
