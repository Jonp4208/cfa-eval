import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatHourTo12Hour } from '../utils/dateUtils';

interface HourSelectorProps {
  activeHour: string | null;
  setActiveHour: (hour: string) => void;
  hours: string[];
  currentHour: number;
}

const HourSelector: React.FC<HourSelectorProps> = ({ 
  activeHour, 
  setActiveHour, 
  hours, 
  currentHour 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-2 text-blue-600" />
        <span className="text-sm font-medium">Hour</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {hours.map(hour => {
          const isCurrent = parseInt(hour) === currentHour;
          const isActive = hour === activeHour;
          
          return (
            <Button
              key={hour}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`
                ${isCurrent ? 'border-blue-300' : ''}
                ${isActive ? 'bg-blue-600 text-white' : ''}
              `}
              onClick={() => setActiveHour(hour)}
            >
              {formatHourTo12Hour(hour)}
              {isCurrent && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded">Now</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default HourSelector;
