import React from 'react';
import { User, Clock } from 'lucide-react';

interface NoEmployeesMessageProps {
  type: 'filter' | 'currentShift' | 'noSchedule';
  employeeAreaTab?: string;
}

export const NoEmployeesMessage: React.FC<NoEmployeesMessageProps> = ({ type, employeeAreaTab }) => {
  if (type === 'filter') {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
        <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="font-medium">No {employeeAreaTab} employees found</p>
        <p className="text-sm mt-1">Try selecting a different area filter</p>
      </div>
    );
  }

  if (type === 'currentShift') {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
        <Clock className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="font-medium">No employees currently on shift</p>
        <p className="text-sm mt-1">Try turning off the "Current Shift Only" filter</p>
      </div>
    );
  }

  if (type === 'noSchedule') {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
        <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p className="font-medium">No employees scheduled for this day</p>
        <p className="text-sm mt-1">Employees may be scheduled for other days of the week</p>
      </div>
    );
  }

  return null;
};

export default NoEmployeesMessage;
