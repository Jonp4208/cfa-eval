import { format } from 'date-fns';

// Helper function to format hour to 12-hour format (imported from elsewhere)
export const formatHourTo12Hour = (hour: string | number): string => {
  // Convert to number if it's a string
  const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
  
  if (isNaN(hourNum)) {
    return '';
  }
  
  // Convert 24-hour format to 12-hour format
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${hour12}${period}`;
};

// Helper function to sort days in correct order
export const sortDays = (days: string[]): string[] => {
  const dayOrder: Record<string, number> = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
  };

  return days.sort((a, b) => {
    return (dayOrder[a.toLowerCase()] || 0) - (dayOrder[b.toLowerCase()] || 0);
  });
};

// Helper function to normalize day names for consistent comparison
export const normalizeDay = (day: string): string => {
  if (!day) return '';

  // Convert to lowercase and trim
  const normalizedDay = day.toLowerCase().trim();

  // Map abbreviated days to full names
  const dayMap: Record<string, string> = {
    // Full names
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday',
    // Common abbreviations
    'mon': 'monday',
    'm': 'monday',
    'tues': 'tuesday',
    'tue': 'tuesday',
    't': 'tuesday',
    'wed': 'wednesday',
    'w': 'wednesday',
    'thurs': 'thursday',
    'thu': 'thursday',
    'th': 'thursday',
    'fri': 'friday',
    'f': 'friday',
    'sat': 'saturday',
    's': 'saturday',
    'sun': 'sunday',
    'su': 'sunday',
    // Numbers (Excel might use these)
    '1': 'monday',
    '2': 'tuesday',
    '3': 'wednesday',
    '4': 'thursday',
    '5': 'friday',
    '6': 'saturday',
    '0': 'sunday',
    '7': 'sunday'
  };

  // Direct lookup in the map
  if (dayMap[normalizedDay]) {
    return dayMap[normalizedDay];
  }

  // Check if the input starts with a day name
  for (const [abbr, fullDay] of Object.entries(dayMap)) {
    if (normalizedDay.startsWith(abbr) && abbr.length > 1) { // Only use abbr with length > 1 to avoid false matches
      return fullDay;
    }
  }

  // Try to extract day name from a date string (e.g., "Thursday, June 15")
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const day of dayNames) {
    if (normalizedDay.includes(day)) {
      return day;
    }
  }

  // If we can't determine the day, return the original
  return normalizedDay;
};

// Helper function to get today's day name
export const getTodayDayName = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  return days[today.getDay()];
};

// Format day name for display
export const formatDayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

// Format day name for short display (mobile)
export const formatShortDayName = (day: string): string => {
  const shortNames: Record<string, string> = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  return shortNames[day] || day.substring(0, 3);
};

// Calculate the correct dates for each day of the week
export const calculateWeekDates = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ensure dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  // Calculate the difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If the difference is approximately 6 days (accounting for time differences),
  // we assume this is a standard week
  if (diffDays >= 5 && diffDays <= 7) {
    const weekDates: Record<string, Date> = {};
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Start with the start date and add days to get each day of the week
    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      weekDates[dayNames[dayIndex]] = date;
    }

    return weekDates;
  }

  // Date range is not a standard week
  return null;
};
