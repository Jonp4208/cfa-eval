import React, { RefObject, useState } from 'react';
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
  const [newEmployeeStartTime, setNewEmployeeStartTime] = useState<string>("7:00");
  const [newEmployeeEndTime, setNewEmployeeEndTime] = useState<string>("15:00");

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="text"
                    placeholder="7:00"
                    value={newEmployeeStartTime}
                    onChange={(e) => setNewEmployeeStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="text"
                    placeholder="15:00"
                    value={newEmployeeEndTime}
                    onChange={(e) => setNewEmployeeEndTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Time Format</AlertTitle>
                  <AlertDescription>
                    Enter times in 24-hour format (e.g., 7:00, 15:30)
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
              onClick={() => {
                handleAddEmployee(newEmployeeName, newEmployeeArea, newEmployeeStartTime, newEmployeeEndTime);
                setNewEmployeeName("");
                setNewEmployeeStartTime("7:00");
                setNewEmployeeEndTime("15:00");
                onOpenChange(false);
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
