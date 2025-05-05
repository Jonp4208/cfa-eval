import React, { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Search } from 'lucide-react';
import { formatHourTo12Hour } from '@/lib/utils/date-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Position {
  id: string;
  name: string;
  blockStart: string;
  blockEnd: string;
  employeeId?: string;
}

export interface Employee {
  id: string;
  name: string;
  area?: string;
  timeBlock?: string;
  timeBlocks?: string[];
}

interface AssignEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPosition: Position | null;
  assignDialogRef: RefObject<HTMLDivElement>;
  getAvailableEmployeesForTimeBlock: (start: string, end: string) => Employee[];
  handleAssignEmployee: (id: string, name: string) => void;
  handleRemoveAssignment: (position: Position) => void;
  setShowEmployeeList: (show: boolean) => void;
  scheduledEmployees: Employee[];
}

export const AssignEmployeeDialog: React.FC<AssignEmployeeDialogProps> = ({
  open,
  onOpenChange,
  selectedPosition,
  assignDialogRef,
  getAvailableEmployeesForTimeBlock,
  handleAssignEmployee,
  handleRemoveAssignment,
  setShowEmployeeList,
  scheduledEmployees
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" ref={assignDialogRef} tabIndex={0}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Assign Employee
          </DialogTitle>
          <DialogDescription>
            {selectedPosition ? 'Select an employee to assign' : 'Select an employee'}
          </DialogDescription>
          {selectedPosition && (
            <div className="mt-2">
              <div className="text-sm text-gray-700">Assign to: <span className="font-medium">{selectedPosition.name}</span></div>
              <div className="flex items-center mt-2 bg-blue-50 p-2 rounded-md border border-blue-100">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Time block: <span className="font-medium">{formatHourTo12Hour(selectedPosition.blockStart)} - {formatHourTo12Hour(selectedPosition.blockEnd)}</span></span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {!selectedPosition || !selectedPosition.blockStart ? (
            <div className="text-center text-gray-500 py-4">
              <p>No time block selected</p>
            </div>
          ) : (
            <>
              {/* Show available employees */}
              {getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).length === 0 ? (
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
                    <h3 className="text-sm font-medium">Available Employees ({getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).length})</h3>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="pl-8 pr-2 py-1 text-sm border rounded-md w-[180px]"
                        autoFocus={false}
                        tabIndex="-1"
                      />
                    </div>

                  </div>
                  <div className="space-y-2 mb-4">
                    {getAvailableEmployeesForTimeBlock(selectedPosition.blockStart, selectedPosition.blockEnd).map(employee => (
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
                                  scheduledEmployees.find(e => e.id === employee.id)?.timeBlock.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ') :
                                  employee.timeBlocks?.map(block => block.split(' - ').map(time => formatHourTo12Hour(time)).join(' - ')).join(', ')
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {selectedPosition && selectedPosition.employeeId && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (selectedPosition) {
                  handleRemoveAssignment(selectedPosition);
                  onOpenChange(false);
                }
              }}
            >
              Clear Assignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEmployeeDialog;

