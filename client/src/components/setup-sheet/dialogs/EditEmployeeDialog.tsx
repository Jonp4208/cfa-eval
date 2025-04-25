import React, { RefObject, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, RefreshCw, Trash2, AlertTriangle, UserPlus, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { formatHourTo12Hour } from '@/lib/utils/date-utils';

export interface Employee {
  id: string;
  name: string;
  area?: 'FOH' | 'BOH';
  timeBlock?: string;
}

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee: Employee | null;
  replacementName: string;
  setReplacementName: (name: string) => void;
  handleReplaceEmployee: () => void;
  handleDeleteEmployee: (employeeId: string) => void;
  handleAddEmployee: (name: string, area: 'FOH' | 'BOH', startTime: string, endTime: string) => void;
  isReplacing: boolean;
  dialogRef: RefObject<HTMLDivElement>;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  open,
  onOpenChange,
  selectedEmployee,
  replacementName,
  setReplacementName,
  handleReplaceEmployee,
  handleDeleteEmployee,
  handleAddEmployee,
  isReplacing,
  dialogRef
}) => {
  const [activeTab, setActiveTab] = useState<string>("replace");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [newEmployeeName, setNewEmployeeName] = useState<string>("");
  const [newEmployeeArea, setNewEmployeeArea] = useState<'FOH' | 'BOH'>('FOH');

  // Time state with separate hour, minute, and period
  const [startHour, setStartHour] = useState<string>("7");
  const [startMinute, setStartMinute] = useState<string>("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");

  const [endHour, setEndHour] = useState<string>("3");
  const [endMinute, setEndMinute] = useState<string>("00");
  const [endPeriod, setEndPeriod] = useState<"PM" | "AM">("PM");

  // Derived state for the actual time strings in 24-hour format
  const [newEmployeeStartTime, setNewEmployeeStartTime] = useState<string>("7:00");
  const [newEmployeeEndTime, setNewEmployeeEndTime] = useState<string>("15:00");

  // Update the 24-hour format times when the individual components change
  useEffect(() => {
    try {
      // Convert 12-hour format to 24-hour format
      let hour24 = parseInt(startHour);
      if (startPeriod === "PM" && hour24 < 12) hour24 += 12;
      if (startPeriod === "AM" && hour24 === 12) hour24 = 0;

      // Format with leading zeros for hours and ensure minutes are included
      const formattedHour = hour24.toString().padStart(2, '0');
      setNewEmployeeStartTime(`${formattedHour}:${startMinute}`);
    } catch (error) {
      // If there's an error, use a default value
      setNewEmployeeStartTime("07:00");
    }
  }, [startHour, startMinute, startPeriod]);

  useEffect(() => {
    try {
      // Convert 12-hour format to 24-hour format
      let hour24 = parseInt(endHour);
      if (endPeriod === "PM" && hour24 < 12) hour24 += 12;
      if (endPeriod === "AM" && hour24 === 12) hour24 = 0;

      // Format with leading zeros for hours and ensure minutes are included
      const formattedHour = hour24.toString().padStart(2, '0');
      setNewEmployeeEndTime(`${formattedHour}:${endMinute}`);
    } catch (error) {
      // If there's an error, use a default value
      setNewEmployeeEndTime("15:00");
    }
  }, [endHour, endMinute, endPeriod]);

  // Set the title based on whether we're adding or editing
  const dialogTitle = selectedEmployee ? "Edit Employee" : "Add Employee";
  const dialogDescription = selectedEmployee
    ? `Edit or remove ${selectedEmployee.name} from assigned positions`
    : 'Add a new employee to the schedule';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        {selectedEmployee && (
          <div className="p-3 rounded-lg border bg-blue-50 border-blue-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">{selectedEmployee.name}</h4>
                <p className="text-sm text-gray-500">Currently assigned</p>
              </div>
            </div>
          </div>
        )}

        {selectedEmployee ? (
          <Tabs defaultValue="replace" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="replace">Replace</TabsTrigger>
              <TabsTrigger value="delete">Delete</TabsTrigger>
            </TabsList>

          <TabsContent value="replace" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Replacement Employee Name</label>
                <Input
                  type="text"
                  placeholder="Enter name..."
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delete" className="py-4">
            <div className="space-y-4">
              {!confirmDelete ? (
                <>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This will remove {selectedEmployee?.name} from all assigned positions.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Employee
                  </Button>
                </>
              ) : (
                <>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Are you sure?</AlertTitle>
                    <AlertDescription>
                      This action cannot be undone. The employee will be removed from all positions.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        if (selectedEmployee) {
                          handleDeleteEmployee(selectedEmployee.id);
                          onOpenChange(false);
                        }
                      }}
                    >
                      Confirm Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>


        </Tabs>
        ) : (
          <div className="py-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee Name</label>
                <Input
                  type="text"
                  placeholder="Enter name..."
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Select value={newEmployeeArea} onValueChange={(value: 'FOH' | 'BOH') => setNewEmployeeArea(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOH">Front of House (FOH)</SelectItem>
                    <SelectItem value="BOH">Back of House (BOH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-1/3">
                      <Select value={startHour} onValueChange={setStartHour}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(hour => (
                            <SelectItem key={`start-hour-${hour}`} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span>:</span>
                    <div className="w-1/3">
                      <Select value={startMinute} onValueChange={setStartMinute}>
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {['00', '15', '30', '45'].map(minute => (
                            <SelectItem key={`start-min-${minute}`} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/3">
                      <Select value={startPeriod} onValueChange={(value: "AM" | "PM") => setStartPeriod(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    24-hour format: {newEmployeeStartTime}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-1/3">
                      <Select value={endHour} onValueChange={setEndHour}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(hour => (
                            <SelectItem key={`end-hour-${hour}`} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span>:</span>
                    <div className="w-1/3">
                      <Select value={endMinute} onValueChange={setEndMinute}>
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {['00', '15', '30', '45'].map(minute => (
                            <SelectItem key={`end-min-${minute}`} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/3">
                      <Select value={endPeriod} onValueChange={(value: "AM" | "PM") => setEndPeriod(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    24-hour format: {newEmployeeEndTime}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Time Selection</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    Select the hours, minutes, and AM/PM for the employee's shift.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isReplacing}>Cancel</Button>
          {activeTab === "replace" && (
            <Button
              onClick={handleReplaceEmployee}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={!replacementName.trim() || isReplacing}
            >
              {isReplacing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Replacing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replace
                </>
              )}
            </Button>
          )}
          {!selectedEmployee && (
            <Button
              onClick={async () => {
                try {
                  // Make sure we have valid time formats
                  if (!newEmployeeStartTime.includes(':') || !newEmployeeEndTime.includes(':')) {
                    throw new Error('Invalid time format');
                  }

                  // Call the handleAddEmployee function
                  const success = await handleAddEmployee(
                    newEmployeeName,
                    newEmployeeArea,
                    newEmployeeStartTime,
                    newEmployeeEndTime
                  );

                  // Only reset and close if the operation was successful
                  if (success) {
                    setNewEmployeeName("");
                    // Reset time inputs to default values
                    setStartHour("7");
                    setStartMinute("00");
                    setStartPeriod("AM");
                    setEndHour("3");
                    setEndMinute("00");
                    setEndPeriod("PM");
                    onOpenChange(false);
                  }
                } catch (error) {
                  // If there's an error, keep the dialog open
                  console.error('Error adding employee:', error);
                }
              }}
              className="bg-green-500 hover:bg-green-600 flex items-center"
              disabled={!newEmployeeName.trim() || isReplacing}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
