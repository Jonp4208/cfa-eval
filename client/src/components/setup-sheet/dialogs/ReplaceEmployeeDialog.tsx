import React, { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Employee {
  id: string;
  name: string;
}

interface ReplaceEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployeeToReplace: Employee | null;
  replacementName: string;
  setReplacementName: (name: string) => void;
  handleReplaceEmployee: () => void;
  isReplacing: boolean;
  replaceDialogRef: RefObject<HTMLDivElement>;
}

export const ReplaceEmployeeDialog: React.FC<ReplaceEmployeeDialogProps> = ({
  open,
  onOpenChange,
  selectedEmployeeToReplace,
  replacementName,
  setReplacementName,
  handleReplaceEmployee,
  isReplacing,
  replaceDialogRef
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" ref={replaceDialogRef}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-blue-500" />
            Replace Employee
          </DialogTitle>
          <DialogDescription>
            {selectedEmployeeToReplace
              ? `Enter the name of the employee who will replace ${selectedEmployeeToReplace.name}`
              : 'Enter replacement employee name'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {selectedEmployeeToReplace && (
            <div className="p-3 rounded-lg border bg-blue-50 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedEmployeeToReplace.name}</h4>
                  <p className="text-sm text-gray-500">Will be replaced with:</p>
                </div>
              </div>
            </div>
          )}

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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isReplacing}>Cancel</Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceEmployeeDialog;
