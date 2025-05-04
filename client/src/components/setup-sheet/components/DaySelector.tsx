import React from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDayName, getTodayDayName } from '../utils/dateUtils';

interface DaySelectorProps {
  activeDay: string;
  setActiveDay: (day: string) => void;
  days: string[];
  weekDates: Record<string, Date> | null;
}

const DaySelector: React.FC<DaySelectorProps> = ({ 
  activeDay, 
  setActiveDay, 
  days, 
  weekDates 
}) => {
  return (
    <div className="flex items-center">
      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
      <Select value={activeDay} onValueChange={setActiveDay}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select day" />
        </SelectTrigger>
        <SelectContent>
          {days.map(day => {
            const date = weekDates ? weekDates[day] : new Date();
            const isToday = day === getTodayDayName();
            
            return (
              <SelectItem key={day} value={day} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatDayName(day)}</span>
                  <span className="text-xs text-gray-500">
                    {format(date, 'M/d')}
                  </span>
                  {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Today</span>}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DaySelector;
