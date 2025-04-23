import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Coffee, Play, RefreshCw, Check, Clock, Pencil } from 'lucide-react';
import { formatHourTo12Hour } from '@/lib/utils/date-utils';

interface UnassignedEmployeesSectionProps {
  filteredUnassignedEmployees: any[];
  getBreakStatus: (id: string) => 'active' | 'none';
  getRemainingBreakTime: (id: string) => number;
  hasHadBreak: (id: string) => boolean;
  handleBreakClick: (id: string, name: string) => void;
  handleReplaceClick: (id: string, name: string) => void;
  endBreak: (id: string) => void;
}

export const UnassignedEmployeesSection: React.FC<UnassignedEmployeesSectionProps> = ({
  filteredUnassignedEmployees,
  getBreakStatus,
  getRemainingBreakTime,
  hasHadBreak,
  handleBreakClick,
  handleReplaceClick,
  endBreak
}) => {
  if (filteredUnassignedEmployees.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-3 w-3 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium">Unassigned Employees</h3>
          <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">
            {filteredUnassignedEmployees.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {filteredUnassignedEmployees.map(employee => {
          const breakStatus = getBreakStatus(employee.id);
          const remainingTime = getRemainingBreakTime(employee.id);

          return (
            <div
              key={`${employee.id}-${employee.name}-${Date.now()}`}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-md border ${
                breakStatus === 'active'
                  ? 'bg-amber-50 border-amber-200'
                  : hasHadBreak(employee.id)
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-white hover:bg-blue-50 border-gray-200'
              }`}
            >
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
                      <Badge variant="outline" className={`text-xs ${
                        employee.area === 'FOH'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
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
                    <span>
                      {employee.timeBlock ?
                        employee.timeBlock.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ') :
                        ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0 sm:items-end">
                {breakStatus === 'active' ? (
                  <>
                    <div className="flex items-center justify-center bg-amber-100 text-amber-600 px-3 py-2 rounded-md text-sm font-medium">
                      <Coffee className="h-3 w-3 mr-1" />
                      <span>On Break ({remainingTime}m)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 border-amber-200 text-amber-600 hover:bg-amber-50 w-full"
                      onClick={() => endBreak(employee.id)}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      End Break
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 px-3 w-full ${
                        hasHadBreak(employee.id) ? 'border-green-200 text-green-600 hover:bg-green-50' : ''
                      }`}
                      onClick={() => handleBreakClick(employee.id, employee.name)}
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      {hasHadBreak(employee.id) ? 'Another Break' : 'Start Break'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleReplaceClick(employee.id, employee.name)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnassignedEmployeesSection;
