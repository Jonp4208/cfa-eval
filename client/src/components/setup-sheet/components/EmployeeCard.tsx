import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Coffee, Play, Check, Clock, Pencil, MapPin } from 'lucide-react';
import { formatHourTo12Hour } from '@/lib/utils/date-utils';

interface EmployeeCardProps {
  employee: any;
  breakStatus: 'active' | 'none';
  remainingTime: number;
  hasHadBreak: boolean;
  onBreakClick: (id: string, name: string) => void;
  onEditClick: (id: string, name: string) => void;
  onEndBreak: (id: string) => void;
  scheduledEmployees?: any[];
  variant?: 'assigned' | 'unassigned' | 'all';
  assignedEmployees?: any[];
  unassignedEmployees?: any[];
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  breakStatus,
  remainingTime,
  hasHadBreak,
  onBreakClick,
  onEditClick,
  onEndBreak,
  scheduledEmployees = [],
  variant = 'all',
  assignedEmployees = [],
  unassignedEmployees = []
}) => {
  // Determine if employee is assigned when variant is 'all'
  const isAssigned = variant === 'all'
    ? assignedEmployees.some(emp => emp.id === employee.id)
    : variant === 'assigned';

  const isUnassigned = variant === 'all'
    ? unassignedEmployees.some(emp => emp.id === employee.id)
    : variant === 'unassigned';
  const getVariantStyles = () => {
    // For 'all' variant, use assignment status to determine styling
    if (variant === 'all') {
      if (isAssigned) {
        return {
          border: 'border-green-200',
          bg: breakStatus === 'active' ? 'bg-amber-50' : hasHadBreak ? 'bg-green-50' : 'bg-white',
          hover: 'hover:bg-green-50',
          icon: 'bg-green-100 text-green-600',
          badge: 'bg-green-50 text-green-700 border-green-200'
        };
      } else {
        return {
          border: 'border-blue-200',
          bg: breakStatus === 'active' ? 'bg-amber-50' : hasHadBreak ? 'bg-green-50' : 'bg-white',
          hover: 'hover:bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      }
    }

    // Original variant-based styling for backward compatibility
    switch (variant) {
      case 'assigned':
        return {
          border: 'border-green-200',
          bg: breakStatus === 'active' ? 'bg-amber-50' : hasHadBreak ? 'bg-green-50' : 'bg-white',
          hover: 'hover:bg-green-50',
          icon: 'bg-green-100 text-green-600',
          badge: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'unassigned':
        return {
          border: 'border-blue-200',
          bg: breakStatus === 'active' ? 'bg-amber-50' : hasHadBreak ? 'bg-green-50' : 'bg-white',
          hover: 'hover:bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: breakStatus === 'active' ? 'bg-amber-50' : hasHadBreak ? 'bg-green-50' : 'bg-white',
          hover: 'hover:bg-gray-50',
          icon: 'bg-gray-100 text-gray-600',
          badge: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const styles = getVariantStyles();

  const getTimeDisplay = () => {
    const scheduledEmployee = scheduledEmployees.find(e => e.id === employee.id);
    if (scheduledEmployee?.timeBlock) {
      return scheduledEmployee.timeBlock.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ');
    }
    if (employee.timeBlock) {
      return employee.timeBlock.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ');
    }
    if (employee.timeBlocks && employee.timeBlocks.length > 0) {
      return employee.timeBlocks.map(block =>
        block.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ')
      ).join(', ');
    }
    return 'No schedule';
  };

  const getBreakEndTime = () => {
    // Get today's date string for filtering
    const today = new Date().toISOString().split('T')[0];

    // Find the employee's breaks for today
    const employeeBreaks = employee.breaks || [];
    const todaysBreaks = employeeBreaks.filter(b =>
      b.breakDate === today && b.status === 'completed' && b.endTime
    );

    if (todaysBreaks.length === 0) {
      return 'Had break today';
    }

    // Get the most recent completed break
    const latestBreak = todaysBreaks.sort((a, b) =>
      new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    )[0];

    // Format the end time
    const endTime = new Date(latestBreak.endTime);
    const timeString = endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `Break ended at ${timeString}`;
  };

  const getStatusBadge = () => {
    // For 'all' variant, show assignment status
    if (variant === 'all') {
      if (isAssigned && employee.positions && employee.positions.length > 0) {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <MapPin className="h-3 w-3 mr-1" />
            {employee.positions.join(', ')}
          </Badge>
        );
      } else if (isAssigned) {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <MapPin className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        );
      } else {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Available
          </Badge>
        );
      }
    }

    // Original variant-based badges
    if (variant === 'assigned' && employee.positions) {
      return (
        <Badge variant="outline" className={styles.badge}>
          <MapPin className="h-3 w-3 mr-1" />
          {employee.positions.join(', ')}
        </Badge>
      );
    }
    if (variant === 'unassigned') {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Available
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className={styles.badge}>
        {variant === 'assigned' ? 'Assigned' : 'Available'}
      </Badge>
    );
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${styles.border} ${styles.bg} ${styles.hover}`}>
      <div className="flex items-start justify-between">
        {/* Left side - Employee info */}
        <div className="flex items-start gap-3 flex-1">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
            <User className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{employee.name}</h4>
              {employee.area && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    employee.area === 'FOH'
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-green-50 text-green-600 border-green-200'
                  }`}
                >
                  {employee.area}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {getStatusBadge()}

              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getTimeDisplay()}</span>
              </div>

              {hasHadBreak && breakStatus !== 'active' && (
                <div className="flex items-center text-xs text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  <span>{getBreakEndTime()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col gap-2 ml-3">
          {breakStatus === 'active' ? (
            <>
              <div className="flex items-center justify-center bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md text-xs font-medium">
                <Coffee className="h-3 w-3 mr-1" />
                <span>Break ({remainingTime}m)</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
                onClick={() => onEndBreak(employee.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                End
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-3 text-xs ${
                  hasHadBreak
                    ? 'border-green-200 text-green-600 hover:bg-green-50'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => onBreakClick(employee.id, employee.name)}
              >
                <Coffee className="h-3 w-3 mr-1" />
                {hasHadBreak ? 'Another' : 'Break'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => onEditClick(employee.id, employee.name)}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
