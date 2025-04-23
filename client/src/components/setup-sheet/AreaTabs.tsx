import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Filter } from 'lucide-react';

interface AreaTabsProps {
  employeeAreaTab: string;
  setEmployeeAreaTab: (tab: string) => void;
  showCurrentShiftOnly: boolean;
  setShowCurrentShiftOnly: (show: boolean) => void;
  countAssignedEmployees: () => number;
  countUnassignedEmployees: () => number;
}

export const AreaTabs: React.FC<AreaTabsProps> = ({
  employeeAreaTab,
  setEmployeeAreaTab,
  showCurrentShiftOnly,
  setShowCurrentShiftOnly,
  countAssignedEmployees,
  countUnassignedEmployees
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Filter className="h-3 w-3 text-gray-600" />
          </div>
          <h3 className="text-sm font-medium">Filter Employees</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="current-shift"
            checked={showCurrentShiftOnly}
            onCheckedChange={setShowCurrentShiftOnly}
          />
          <label
            htmlFor="current-shift"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Current Shift Only
          </label>
        </div>
      </div>

      <div className="flex border rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-r ${
            employeeAreaTab === 'all' ? 'bg-gray-100' : ''
          }`}
          onClick={() => setEmployeeAreaTab('all')}
        >
          <User className="h-4 w-4 mr-2" />
          All ({countAssignedEmployees() + countUnassignedEmployees()})
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-r ${
            employeeAreaTab === 'FOH' ? 'bg-blue-50' : ''
          }`}
          onClick={() => setEmployeeAreaTab('FOH')}
        >
          <User className="h-4 w-4 mr-2 text-blue-500" />
          FOH
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none ${
            employeeAreaTab === 'BOH' ? 'bg-green-50' : ''
          }`}
          onClick={() => setEmployeeAreaTab('BOH')}
        >
          <User className="h-4 w-4 mr-2 text-green-500" />
          BOH
        </Button>
      </div>
    </div>
  );
};

export default AreaTabs;
