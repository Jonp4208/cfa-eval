import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';
import { getShortDayOfWeekName, testSpecificDates } from '@/lib/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SaveSetupDialogProps {
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  setupName: string;
  setSetupName: (name: string) => void;
  setupStartDate: string;
  setSetupStartDate: (date: string) => void;
  setupEndDate: string;
  setSetupEndDate: (date: string) => void;
  handleSaveWeeklySetup: () => void;
  adjustToSundayToSaturdayRange: (startDate: Date | string, endDate: Date | string) => { startDate: Date, endDate: Date };
  completionPercentage: number;
  currentTemplateName: string;
  employeesCount: number;
}

export function SaveSetupDialog({
  showSaveDialog,
  setShowSaveDialog,
  setupName,
  setSetupName,
  setupStartDate,
  setSetupStartDate,
  setupEndDate,
  setSetupEndDate,
  handleSaveWeeklySetup,
  adjustToSundayToSaturdayRange,
  completionPercentage,
  currentTemplateName,
  employeesCount
}: SaveSetupDialogProps) {
  // Run the test function when the component mounts
  useEffect(() => {
    // Test April 13, 2025 to verify it's a Sunday
    testSpecificDates();
  }, []);

  return (
    <div className="mt-6 flex justify-end">
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Weekly Setup
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
            handleSaveWeeklySetup();
          }}>
            <DialogHeader>
              <DialogTitle>Save Weekly Setup</DialogTitle>
              <DialogDescription>
                Save your employee assignments for this week.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="setupName">Setup Name</Label>
                <Input
                  id="setupName"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="e.g., Week of 4/19 (will use end date)"
                />
              </div>
              <div className="mb-2 text-sm text-gray-500">
                Note: Date range will be adjusted to create a Sunday-Saturday week.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date <span className="text-xs text-blue-600">(Will adjust to Sunday)</span></Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={setupStartDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setSetupStartDate(newStartDate);

                        // Automatically calculate the end date (Saturday of the same week)
                        if (newStartDate) {
                          try {
                            const startDateObj = new Date(newStartDate);
                            console.log('Setting up date range for:', startDateObj.toISOString());

                            const { endDate } = adjustToSundayToSaturdayRange(startDateObj, startDateObj);

                            // Format the end date as YYYY-MM-DD for the input field
                            const formattedEndDate = endDate.toISOString().split('T')[0];
                            console.log('Setting end date to:', formattedEndDate);

                            setSetupEndDate(formattedEndDate);
                          } catch (error) {
                            console.error('Error calculating end date:', error);
                          }
                        }
                      }}
                    />
                    {setupStartDate && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {(() => {
                          // Parse the date manually to ensure correct day of week
                          const parts = setupStartDate.split('-');
                          if (parts.length === 3) {
                            const year = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1; // 0-indexed month
                            const day = parseInt(parts[2]);
                            const date = new Date(year, month, day);
                            const dayOfWeek = date.getDay();
                            const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                            console.log(`Date ${setupStartDate} parsed as:`, {
                              year, month: month + 1, day, dayOfWeek,
                              dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
                            });

                            return dayMap[dayOfWeek];
                          }
                          return getShortDayOfWeekName(new Date(setupStartDate));
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date <span className="text-xs text-blue-600">(Always Saturday)</span></Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={setupEndDate}
                      readOnly
                      className="bg-gray-50"
                    />
                    {setupEndDate && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {(() => {
                          // Parse the date manually to ensure correct day of week
                          const parts = setupEndDate.split('-');
                          if (parts.length === 3) {
                            const year = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1; // 0-indexed month
                            const day = parseInt(parts[2]);
                            const date = new Date(year, month, day);
                            const dayOfWeek = date.getDay();
                            const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                            console.log(`End date ${setupEndDate} parsed as:`, {
                              year, month: month + 1, day, dayOfWeek,
                              dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
                            });

                            return dayMap[dayOfWeek];
                          }
                          return getShortDayOfWeekName(new Date(setupEndDate));
                        })()}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">End date is automatically set to Saturday</p>
                </div>
              </div>

              {/* Summary of assignments */}
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Assignment Summary</h4>
                <div className="text-sm">
                  <p>Completion: {completionPercentage}%</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{currentTemplateName}</Badge>
                    <Badge variant="outline">{employeesCount} Employees</Badge>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button type="submit">Save Setup</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
