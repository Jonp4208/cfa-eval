import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Users, UserCheck, Clock, Coffee } from 'lucide-react';
import { EmployeeCard } from './EmployeeCard';

interface EmployeeSectionProps {
  title: string;
  employees: any[];
  variant: 'assigned' | 'unassigned' | 'all';
  getBreakStatus: (id: string) => 'active' | 'none';
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  handleBreakClick: (id: string, name: string) => void;
  handleEditClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
  scheduledEmployees?: any[];
  showTimeStats?: boolean;
  allEmployees?: any[];
  assignedEmployees?: any[];
  unassignedEmployees?: any[];
}

export const EmployeeSection: React.FC<EmployeeSectionProps> = ({
  title,
  employees,
  variant,
  getBreakStatus,
  getRemainingBreakTime,
  hasHadBreak,
  handleBreakClick,
  handleEditClick,
  endBreak,
  scheduledEmployees = [],
  showTimeStats = false,
  allEmployees = [],
  assignedEmployees = [],
  unassignedEmployees = []
}) => {
  const getVariantIcon = () => {
    switch (variant) {
      case 'assigned':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'unassigned':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'assigned':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'unassigned':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Show empty state for assigned/unassigned sections, hide completely for 'all' section
  if (employees.length === 0) {
    if (variant === 'all') {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            variant === 'assigned' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {getVariantIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Badge variant="outline" className={getVariantColor()}>
              0 employees
            </Badge>
          </div>
        </div>

        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
            variant === 'assigned' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {getVariantIcon()}
          </div>
          <p className="text-gray-600 font-medium">
            {variant === 'assigned' ? 'No employees assigned yet' : 'No available employees'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {variant === 'assigned'
              ? 'Assign employees to positions to see them here'
              : 'All employees are currently assigned to positions'
            }
          </p>
        </div>
      </div>
    );
  }

  const getStats = () => {
    const onBreak = employees.filter(emp => getBreakStatus(emp.id) === 'active').length;
    const hadBreak = employees.filter(emp => hasHadBreak(emp.id)).length;

    // For 'all' variant, calculate assignment stats
    if (variant === 'all') {
      const assigned = assignedEmployees.length;
      const available = unassignedEmployees.length;
      return { onBreak, hadBreak, assigned, available };
    }

    return { onBreak, hadBreak };
  };

  const stats = getStats();

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            variant === 'assigned' ? 'bg-green-100' :
            variant === 'unassigned' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {getVariantIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getVariantColor()}>
                {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
              </Badge>

              {/* Assignment stats for 'all' variant */}
              {variant === 'all' && 'assigned' in stats && (
                <>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {stats.assigned} assigned
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Users className="h-3 w-3 mr-1" />
                    {stats.available} available
                  </Badge>
                </>
              )}

              {/* Break stats */}
              {stats.onBreak > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Coffee className="h-3 w-3 mr-1" />
                  {stats.onBreak} on break
                </Badge>
              )}
              {stats.hadBreak > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  {stats.hadBreak} had break
                </Badge>
              )}
            </div>
          </div>
        </div>

        {showTimeStats && (
          <div className="text-right">
            <div className="text-sm text-gray-500">
              <Clock className="h-4 w-4 inline mr-1" />
              Coverage Status
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {variant === 'all' && 'assigned' in stats ? `${stats.assigned} assigned` : `${employees.length} active`}
            </div>
          </div>
        )}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid gap-3">
        {employees.map(employee => (
          <EmployeeCard
            key={`${employee.id}-${employee.name}-${Date.now()}`}
            employee={employee}
            breakStatus={getBreakStatus(employee.id)}
            remainingTime={getRemainingBreakTime(employee.id)}
            hasHadBreak={hasHadBreak(employee.id)}
            onBreakClick={handleBreakClick}
            onEditClick={handleEditClick}
            onEndBreak={endBreak}
            scheduledEmployees={scheduledEmployees}
            variant={variant}
            assignedEmployees={assignedEmployees}
            unassignedEmployees={unassignedEmployees}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeSection;
