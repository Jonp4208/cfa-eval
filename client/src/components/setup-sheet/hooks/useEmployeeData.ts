import { useState, useEffect } from 'react';
import { Employee, Setup } from '../types';
import { calculateUnassignedEmployees, extractEmployeesFromPositions } from '../utils/employeeUtils';
import log from '../utils/logUtils';

export const useEmployeeData = (setup: Setup, activeDay: string) => {
  const [scheduledEmployees, setScheduledEmployees] = useState<Employee[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load employee data from setup
  useEffect(() => {
    // Initialize scheduledEmployees from uploadedSchedules if available
    if (setup.uploadedSchedules && setup.uploadedSchedules.length > 0) {
      setScheduledEmployees(setup.uploadedSchedules);
    } else {
      // If no uploadedSchedules, try to extract from positions
      const extractedEmployees = extractEmployeesFromPositions(setup.weekSchedule);
      if (extractedEmployees.length > 0) {
        setScheduledEmployees(extractedEmployees);
      }
    }
  }, [setup._id]); // Only re-run if the setup ID changes

  // Update unassigned employees when active day or scheduled employees change
  useEffect(() => {
    const unassigned = calculateUnassignedEmployees(
      scheduledEmployees,
      activeDay,
      setup.weekSchedule
    );
    setUnassignedEmployees(unassigned);
  }, [activeDay, scheduledEmployees, setup.weekSchedule]);

  // Filter employees by search term
  const filterEmployeesBySearch = (employees: Employee[]): Employee[] => {
    if (!searchTerm) return employees;
    
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filter employees by area (FOH/BOH)
  const filterEmployeesByArea = (employees: Employee[], area: string): Employee[] => {
    if (area === 'all') return employees;
    
    return employees.filter(employee => {
      const employeeArea = employee.area?.toLowerCase() || '';
      
      if (area === 'FOH') {
        return employeeArea === 'foh' || 
               employeeArea === 'front' || 
               employeeArea === 'service' || 
               employeeArea === '';
      } else if (area === 'BOH') {
        return employeeArea === 'boh' || 
               employeeArea === 'back' || 
               employeeArea === 'kitchen';
      }
      
      return true;
    });
  };

  return {
    scheduledEmployees,
    setScheduledEmployees,
    unassignedEmployees,
    setUnassignedEmployees,
    searchTerm,
    setSearchTerm,
    filterEmployeesBySearch,
    filterEmployeesByArea
  };
};
