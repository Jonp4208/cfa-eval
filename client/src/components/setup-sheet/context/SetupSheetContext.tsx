import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Setup, 
  Employee, 
  Position, 
  TimeBlock, 
  BreakInfo 
} from '../types';
import { format } from 'date-fns';

interface SetupSheetContextType {
  // State
  activeDay: string;
  setActiveDay: (day: string) => void;
  activeHour: string;
  setActiveHour: (hour: string) => void;
  employeeAreaTab: string;
  setEmployeeAreaTab: (tab: string) => void;
  showCurrentShiftOnly: boolean;
  setShowCurrentShiftOnly: (show: boolean) => void;
  breaks: BreakInfo[];
  setBreaks: React.Dispatch<React.SetStateAction<BreakInfo[]>>;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
  
  // Computed values
  days: string[];
  allHours: string[];
  hourTimeBlocks: TimeBlock[];
  scheduledEmployees: Employee[];
  unassignedEmployees: Employee[];
  
  // Functions
  getDayEmployees: () => Employee[];
  getEmployeeById: (id: string | undefined) => Employee | undefined;
  getBreakStatus: (id: string) => 'active' | 'none';
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  filterEmployeesByArea: (employees: Employee[]) => Employee[];
  isCurrentTimeBlock: (block: TimeBlock) => boolean;
  getDateForDay: (day: string) => Date;
  formatDayName: (day: string) => string;
  getTodayDayName: () => string;
  getAvailableEmployeesForTimeBlock: (start: string, end: string) => Employee[];
  countAssignedEmployees: () => number;
  countUnassignedEmployees: () => number;
  
  // Actions
  handleBreakClick: (id: string, name: string) => void;
  handleReplaceClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
  handleStartBreak: () => void;
  handleSaveChanges: () => void;
  handleAssignEmployee: (id: string, name: string) => void;
  handleRemoveAssignment: (position: Position) => void;
  handleReplaceEmployee: () => void;
}

const SetupSheetContext = createContext<SetupSheetContextType | undefined>(undefined);

interface SetupSheetProviderProps {
  children: ReactNode;
  setup: Setup;
  onBack: () => void;
}

export const SetupSheetProvider: React.FC<SetupSheetProviderProps> = ({ 
  children, 
  setup,
  onBack
}) => {
  // State from DailyView component
  const [activeDay, setActiveDay] = useState('sunday');
  const [activeHour, setActiveHour] = useState('');
  const [employeeAreaTab, setEmployeeAreaTab] = useState('all');
  const [showCurrentShiftOnly, setShowCurrentShiftOnly] = useState(true);
  const [breaks, setBreaks] = useState<BreakInfo[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Additional state needed for actions
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [breakDuration, setBreakDuration] = useState(30);
  const [selectedEmployeeToReplace, setSelectedEmployeeToReplace] = useState<Employee | null>(null);
  const [replacementName, setReplacementName] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
  // Computed values
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const allHours = setup.weekSchedule[activeDay]?.timeBlocks
    ? Array.from(new Set(setup.weekSchedule[activeDay].timeBlocks.flatMap(block => {
        const hours = [];
        for (let i = parseInt(block.start); i < parseInt(block.end); i++) {
          hours.push(i.toString());
        }
        return hours;
      })))
      .sort((a, b) => parseInt(a) - parseInt(b))
    : [];
    
  const hourTimeBlocks = setup.weekSchedule[activeDay]?.timeBlocks
    ? setup.weekSchedule[activeDay].timeBlocks.filter(block => {
        const blockStart = parseInt(block.start);
        const blockEnd = parseInt(block.end);
        const hour = parseInt(activeHour);
        return blockStart <= hour && blockEnd > hour;
      })
    : [];
    
  const scheduledEmployees = setup.employees.filter(employee => {
    // Filter by current shift if enabled
    if (showCurrentShiftOnly) {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if employee has a time block that includes the current hour
      return employee.timeBlocks?.some(block => {
        const [start, end] = block.split(' - ').map(time => parseInt(time));
        return start <= currentHour && end > currentHour;
      });
    }
    
    return true;
  });
  
  const unassignedEmployees = scheduledEmployees.filter(employee => {
    // Check if this employee is assigned to any position in the current day
    const isAssigned = setup.weekSchedule[activeDay]?.timeBlocks.some(block => 
      block.positions.some(position => position.employeeId === employee.id)
    );
    
    return !isAssigned;
  });
  
  // Functions
  const getDayEmployees = () => {
    const employees: Employee[] = [];
    const employeeMap = new Map<string, Employee>();
    
    // Get all employees assigned to positions in the current day
    setup.weekSchedule[activeDay]?.timeBlocks.forEach(block => {
      block.positions.forEach(position => {
        if (position.employeeId) {
          const employee = setup.employees.find(e => e.id === position.employeeId);
          if (employee && !employeeMap.has(employee.id)) {
            const employeeWithPositions = {
              ...employee,
              positions: [position.name]
            };
            employeeMap.set(employee.id, employeeWithPositions);
            employees.push(employeeWithPositions);
          } else if (employee && employeeMap.has(employee.id)) {
            const existingEmployee = employeeMap.get(employee.id);
            if (existingEmployee && !existingEmployee.positions.includes(position.name)) {
              existingEmployee.positions.push(position.name);
            }
          }
        }
      });
    });
    
    return employees;
  };
  
  const getEmployeeById = (id: string | undefined) => {
    if (!id) return undefined;
    return setup.employees.find(e => e.id === id);
  };
  
  const getBreakStatus = (id: string) => {
    const activeBreak = breaks.find(b => b.employeeId === id && b.isActive);
    return activeBreak ? 'active' : 'none';
  };
  
  const getRemainingBreakTime = (id: string) => {
    const activeBreak = breaks.find(b => b.employeeId === id && b.isActive);
    if (!activeBreak) return 0;
    
    const elapsedMinutes = Math.floor((Date.now() - activeBreak.startTime) / (1000 * 60));
    const remainingMinutes = Math.max(0, activeBreak.duration - elapsedMinutes);
    return remainingMinutes;
  };
  
  const hasHadBreak = (id: string) => {
    return breaks.some(b => b.employeeId === id && !b.isActive);
  };
  
  const filterEmployeesByArea = (employees: Employee[]) => {
    if (employeeAreaTab === 'all') return employees;
    return employees.filter(e => e.area === employeeAreaTab);
  };
  
  const isCurrentTimeBlock = (block: TimeBlock) => {
    const now = new Date();
    const currentHour = now.getHours();
    const blockStart = parseInt(block.start);
    const blockEnd = parseInt(block.end);
    return blockStart <= currentHour && blockEnd > currentHour;
  };
  
  const getDateForDay = (day: string) => {
    const startDate = new Date(setup.startDate);
    const dayIndex = days.indexOf(day);
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayIndex);
    return date;
  };
  
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const getTodayDayName = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    return days[dayIndex];
  };
  
  const getAvailableEmployeesForTimeBlock = (start: string, end: string) => {
    return scheduledEmployees.filter(employee => {
      // Check if employee is available during this time block
      return employee.timeBlocks?.some(block => {
        const [empStart, empEnd] = block.split(' - ').map(time => parseInt(time));
        const blockStart = parseInt(start);
        const blockEnd = parseInt(end);
        
        // Employee is available if their shift overlaps with the time block
        // and they are available at least 1 minute past the start time
        return empStart <= blockStart && empEnd > blockStart + 0.01;
      });
    });
  };
  
  const countAssignedEmployees = () => {
    return filterEmployeesByArea(getDayEmployees().filter(e => e.positions.some(p => p !== 'Scheduled'))).length;
  };
  
  const countUnassignedEmployees = () => {
    return filterEmployeesByArea(unassignedEmployees).length;
  };
  
  // Actions
  const handleBreakClick = (id: string, name: string) => {
    const employee = getEmployeeById(id);
    if (employee) {
      setSelectedEmployee(employee);
      // Open break dialog (handled in DailyView)
    }
  };
  
  const handleReplaceClick = (id: string, name: string) => {
    const employee = getEmployeeById(id);
    if (employee) {
      setSelectedEmployeeToReplace(employee);
      setReplacementName('');
      // Open replace dialog (handled in DailyView)
    }
  };
  
  const endBreak = (id: string) => {
    setBreaks(prev => 
      prev.map(b => 
        b.employeeId === id && b.isActive 
          ? { ...b, isActive: false } 
          : b
      )
    );
    setHasChanges(true);
  };
  
  const handleStartBreak = () => {
    if (!selectedEmployee) return;
    
    const newBreak: BreakInfo = {
      id: `break-${Date.now()}`,
      employeeId: selectedEmployee.id,
      startTime: Date.now(),
      duration: breakDuration,
      isActive: true
    };
    
    setBreaks(prev => [...prev, newBreak]);
    setHasChanges(true);
    // Close break dialog (handled in DailyView)
  };
  
  const handleSaveChanges = () => {
    // Save changes logic (handled in DailyView)
    setHasChanges(false);
  };
  
  const handleAssignEmployee = (id: string, name: string) => {
    if (!selectedPosition) return;
    
    // Update the position with the new employee
    const updatedTimeBlocks = setup.weekSchedule[activeDay].timeBlocks.map(block => {
      if (block.positions.some(p => p.id === selectedPosition.id)) {
        return {
          ...block,
          positions: block.positions.map(p => 
            p.id === selectedPosition.id 
              ? { ...p, employeeId: id } 
              : p
          )
        };
      }
      return block;
    });
    
    // Update the setup
    setup.weekSchedule[activeDay].timeBlocks = updatedTimeBlocks;
    
    setHasChanges(true);
    // Close assign dialog (handled in DailyView)
  };
  
  const handleRemoveAssignment = (position: Position) => {
    // Remove the employee from the position
    const updatedTimeBlocks = setup.weekSchedule[activeDay].timeBlocks.map(block => {
      if (block.positions.some(p => p.id === position.id)) {
        return {
          ...block,
          positions: block.positions.map(p => 
            p.id === position.id 
              ? { ...p, employeeId: undefined } 
              : p
          )
        };
      }
      return block;
    });
    
    // Update the setup
    setup.weekSchedule[activeDay].timeBlocks = updatedTimeBlocks;
    
    setHasChanges(true);
  };
  
  const handleReplaceEmployee = () => {
    if (!selectedEmployeeToReplace || !replacementName.trim()) return;
    
    setIsReplacing(true);
    
    // Find all positions assigned to the employee being replaced
    const positions: Position[] = [];
    setup.weekSchedule[activeDay].timeBlocks.forEach(block => {
      block.positions.forEach(position => {
        if (position.employeeId === selectedEmployeeToReplace.id) {
          positions.push(position);
        }
      });
    });
    
    // Update all positions with the replacement employee
    const updatedTimeBlocks = setup.weekSchedule[activeDay].timeBlocks.map(block => {
      return {
        ...block,
        positions: block.positions.map(p => 
          p.employeeId === selectedEmployeeToReplace.id 
            ? { ...p, employeeId: `replacement-${Date.now()}` } 
            : p
        )
      };
    });
    
    // Update the setup
    setup.weekSchedule[activeDay].timeBlocks = updatedTimeBlocks;
    
    // Add the replacement employee if they don't exist
    const replacementEmployee = setup.employees.find(e => e.name === replacementName);
    if (!replacementEmployee) {
      setup.employees.push({
        id: `replacement-${Date.now()}`,
        name: replacementName,
        positions: selectedEmployeeToReplace.positions,
        area: selectedEmployeeToReplace.area,
        timeBlocks: selectedEmployeeToReplace.timeBlocks
      });
    }
    
    setHasChanges(true);
    setIsReplacing(false);
    // Close replace dialog (handled in DailyView)
  };
  
  // Initialize activeHour on component mount
  useEffect(() => {
    if (allHours.length > 0) {
      // Set to current hour if it's in the list, otherwise first hour
      const now = new Date();
      const currentHour = now.getHours().toString();
      if (allHours.includes(currentHour)) {
        setActiveHour(currentHour);
      } else {
        setActiveHour(allHours[0]);
      }
    }
  }, [allHours]);
  
  const value = {
    // State
    activeDay,
    setActiveDay,
    activeHour,
    setActiveHour,
    employeeAreaTab,
    setEmployeeAreaTab,
    showCurrentShiftOnly,
    setShowCurrentShiftOnly,
    breaks,
    setBreaks,
    hasChanges,
    setHasChanges,
    
    // Computed values
    days,
    allHours,
    hourTimeBlocks,
    scheduledEmployees,
    unassignedEmployees,
    
    // Functions
    getDayEmployees,
    getEmployeeById,
    getBreakStatus,
    getRemainingBreakTime,
    hasHadBreak,
    filterEmployeesByArea,
    isCurrentTimeBlock,
    getDateForDay,
    formatDayName,
    getTodayDayName,
    getAvailableEmployeesForTimeBlock,
    countAssignedEmployees,
    countUnassignedEmployees,
    
    // Actions
    handleBreakClick,
    handleReplaceClick,
    endBreak,
    handleStartBreak,
    handleSaveChanges,
    handleAssignEmployee,
    handleRemoveAssignment,
    handleReplaceEmployee
  };
  
  return (
    <SetupSheetContext.Provider value={value}>
      {children}
    </SetupSheetContext.Provider>
  );
};

export const useSetupSheet = () => {
  const context = useContext(SetupSheetContext);
  if (context === undefined) {
    throw new Error('useSetupSheet must be used within a SetupSheetProvider');
  }
  return context;
};

export default SetupSheetContext;
