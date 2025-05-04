import React from 'react';
import { Button } from '@/components/ui/button';
import { Coffee, User, Check, Play } from 'lucide-react';
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

interface BreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee: Employee | null;
  breakDuration: number;
  setBreakDuration: (duration: number) => void;
  hasHadBreak: (id: string) => boolean;
  handleStartBreak: () => void;
}

export const BreakDialog: React.FC<BreakDialogProps> = ({
  open,
  onOpenChange,
  selectedEmployee,
  breakDuration,
  setBreakDuration,
  hasHadBreak,
  handleStartBreak
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Coffee className="h-5 w-5 mr-2 text-amber-500" />
            Start Break
          </DialogTitle>
          <DialogDescription>
            {selectedEmployee ? `Select a break duration for ${selectedEmployee.name}` : 'Select an employee and break duration'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {selectedEmployee && (
            <div className={`p-3 rounded-lg border ${hasHadBreak(selectedEmployee.id) ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${hasHadBreak(selectedEmployee.id) ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <User className={`h-5 w-5 ${hasHadBreak(selectedEmployee.id) ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h4 className="font-medium">{selectedEmployee.name}</h4>
                  {hasHadBreak(selectedEmployee.id) ? (
                    <div className="flex items-center text-sm text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Has already had a break today</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No breaks taken today</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Break Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={breakDuration === 30 ? 'default' : 'outline'}
                className={breakDuration === 30 ? 'bg-amber-500 hover:bg-amber-600' : ''}
                onClick={() => setBreakDuration(30)}
              >
                <Coffee className="h-4 w-4 mr-2" />
                30 Minutes
              </Button>
              <Button
                variant={breakDuration === 60 ? 'default' : 'outline'}
                className={breakDuration === 60 ? 'bg-amber-500 hover:bg-amber-600' : ''}
                onClick={() => setBreakDuration(60)}
              >
                <Coffee className="h-4 w-4 mr-2" />
                60 Minutes
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleStartBreak}
            className="bg-amber-500 hover:bg-amber-600"
            disabled={!selectedEmployee}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Start Break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BreakDialog;
