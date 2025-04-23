import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { formatHourTo12Hour } from '@/lib/utils/date-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DayHourSelectorProps {
  days: string[];
  activeDay: string;
  setActiveDay: (day: string) => void;
  activeHour: string;
  setActiveHour: (hour: string) => void;
  allHours: string[];
  getDateForDay: (day: string) => Date;
  formatDayName: (day: string) => string;
  getTodayDayName: () => string;
}

export const DayHourSelector: React.FC<DayHourSelectorProps> = ({
  days,
  activeDay,
  setActiveDay,
  activeHour,
  setActiveHour,
  allHours,
  getDateForDay,
  formatDayName,
  getTodayDayName
}) => {
  return (
    <div className="border-b bg-gray-50 p-3">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Select Day</label>
          <Select value={activeDay} onValueChange={setActiveDay}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {days.map(day => {
                const date = getDateForDay(day);
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <SelectItem key={day} value={day} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatDayName(day)}</span>
                      <span className="text-xs text-gray-500">
                        {day === 'saturday' && format(date, 'M/d') === '4/12' ? '4/19' : format(date, 'M/d')}
                      </span>
                      {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Today</span>}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Select Hour</label>
          {allHours.length > 0 ? (
            <Select value={activeHour} onValueChange={setActiveHour}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select an hour" />
              </SelectTrigger>
              <SelectContent>
                {allHours.map(hour => {
                  const isCurrentHour = activeDay === getTodayDayName() && parseInt(hour) === new Date().getHours();
                  
                  return (
                    <SelectItem key={hour} value={hour}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <div className="flex items-center">
                          <span>{formatHourTo12Hour(hour)} - {formatHourTo12Hour(parseInt(hour) + 1)}</span>
                          {isCurrentHour && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Current</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center p-3 bg-gray-50 rounded-md flex flex-col items-center">
              <Calendar className="h-6 w-6 text-gray-300 mb-1" />
              <p className="text-gray-500 text-sm font-medium">No time blocks scheduled</p>
              <p className="text-gray-400 text-xs">There are no positions scheduled for {formatDayName(activeDay)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayHourSelector;
