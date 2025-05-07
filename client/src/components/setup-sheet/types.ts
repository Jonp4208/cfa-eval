// Basic types
export type BreakStatus = 'active' | 'none' | 'completed';

export interface Break {
  startTime: string;
  endTime?: string;
  duration: number;
  status: BreakStatus;
  breakDate?: string; // Date when the break was taken (YYYY-MM-DD format)
}

export interface Employee {
  id: string;
  name: string;
  area?: 'FOH' | 'BOH';
  positions: string[];
  timeBlock?: string;
  timeBlocks?: string[];
  category?: string;
  section?: string;
  day?: string;
  breaks?: Break[];
  hadBreak?: boolean;
  breakDate?: string; // Date when the employee had a break (YYYY-MM-DD format)
}

export interface Position {
  id: string;
  name: string;
  blockStart: string;
  blockEnd: string;
  employeeId?: string;
  employeeName?: string;
  category?: string;
  section?: string;
}

export interface TimeBlock {
  id: string;
  start: string;
  end: string;
  positions: Position[];
  category?: string;
}

export interface DaySchedule {
  day: string;
  timeBlocks: TimeBlock[];
}

export interface Setup {
  _id?: string;
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  weekSchedule: Record<string, DaySchedule>;
  employees: Employee[];
  uploadedSchedules?: Employee[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isShared: boolean;
}

export interface BreakInfo {
  id: string;
  employeeId: string;
  startTime: number;
  duration: number;
  isActive: boolean;
}

// Component props types
export interface AssignedEmployeesSectionProps {
  filteredAssignedEmployees: Employee[];
  getBreakStatus: (id: string) => BreakStatus;
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  handleBreakClick: (id: string, name: string) => void;
  handleReplaceClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
}

export interface UnassignedEmployeesSectionProps {
  filteredUnassignedEmployees: Employee[];
  getBreakStatus: (id: string) => BreakStatus;
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  handleBreakClick: (id: string, name: string) => void;
  handleReplaceClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
}

export interface AllEmployeesSectionProps {
  filteredScheduledEmployees: Employee[];
  filteredUnassignedEmployees: Employee[];
  filteredAssignedEmployees: Employee[];
  getBreakStatus: (id: string) => BreakStatus;
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  handleBreakClick: (id: string, name: string) => void;
  handleReplaceClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
}

export interface NoEmployeesMessageProps {
  type: 'filter' | 'currentShift' | 'noSchedule';
  employeeAreaTab?: string;
}

export interface DayHourSelectorProps {
  days: string[];
  activeDay: string;
  setActiveDay: (day: string) => void;
  activeHour: string;
  setActiveHour: (hour: string) => void;
  allHours: string[];
  getDateForDay: (day: string) => Date;
  formatDayName: (day: string) => string;
  getTodayDayName: () => string;
}

export interface AreaTabsProps {
  employeeAreaTab: string;
  setEmployeeAreaTab: (tab: string) => void;
  showCurrentShiftOnly: boolean;
  setShowCurrentShiftOnly: (show: boolean) => void;
  countAssignedEmployees: () => number;
  countUnassignedEmployees: () => number;
}

export interface BreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee: Employee | null;
  breakDuration: number;
  setBreakDuration: (duration: number) => void;
  hasHadBreak: (id: string) => boolean;
  handleStartBreak: () => void;
}

export interface AssignEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPosition: Position | null;
  assignDialogRef: React.RefObject<HTMLDivElement>;
  getAvailableEmployeesForTimeBlock: (start: string, end: string) => Employee[];
  handleAssignEmployee: (id: string, name: string) => void;
  handleRemoveAssignment: (position: Position) => void;
  setShowEmployeeList: (show: boolean) => void;
  scheduledEmployees: Employee[];
}

export interface ReplaceEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployeeToReplace: Employee | null;
  replacementName: string;
  setReplacementName: (name: string) => void;
  handleReplaceEmployee: () => void;
  isReplacing: boolean;
  replaceDialogRef: React.RefObject<HTMLDivElement>;
}

export interface DailyViewProps {
  setup: Setup;
  onBack: () => void;
}
