import { addDays, startOfDay, endOfDay, format } from 'date-fns';

/**
 * Adjusts a date range to ensure it creates a proper Sunday to Saturday week
 * @param startDate The initial start date
 * @param endDate The initial end date
 * @returns An object with adjusted startDate and endDate for a 7-day week
 */
export function adjustToSundayToSaturdayRange(startDate: Date | string, endDate: Date | string): { startDate: Date, endDate: Date } {
  // Convert string dates to Date objects if needed
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);

  // Log the input date for debugging
  console.log('Input date:', start.toISOString(), 'Day of week:', start.getDay());

  // Find the Sunday of the week containing the start date
  const startDay = start.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create a new date for Sunday (start of week)
  const adjustedStart = new Date(start);

  // If not already Sunday, go back to the previous Sunday
  if (startDay !== 0) {
    adjustedStart.setDate(start.getDate() - startDay);
  }

  // Ensure we're working with the start of the day
  adjustedStart.setHours(0, 0, 0, 0);

  // Create a new date for Saturday (end of week) - always 6 days after Sunday
  const adjustedEnd = new Date(adjustedStart);
  adjustedEnd.setDate(adjustedStart.getDate() + 6); // Add 6 days to get to Saturday

  // Ensure we're working with the end of the day for the end date
  adjustedEnd.setHours(23, 59, 59, 999);

  // Log the output dates for debugging
  console.log('Adjusted dates:', {
    start: adjustedStart.toISOString(),
    end: adjustedEnd.toISOString(),
    startDay: adjustedStart.getDay(),
    endDay: adjustedEnd.getDay()
  });

  return { startDate: adjustedStart, endDate: adjustedEnd };
}

/**
 * Gets the day of week name for a date
 * @param date The date to get the day name for
 * @returns The day name (e.g., "Sunday", "Monday", etc.)
 */
export function getDayOfWeekName(date: Date | string | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE'); // Returns full day name (e.g., "Sunday")
}

/**
 * Gets a short day of week name for a date
 * @param date The date to get the day name for
 * @returns The short day name (e.g., "Sun", "Mon", etc.)
 */
export function getShortDayOfWeekName(date: Date | string | null): string {
  if (!date) return '';

  // Ensure we're creating a proper date object
  let dateObj: Date;
  if (typeof date === 'string') {
    // For YYYY-MM-DD format from input fields, we need to ensure proper parsing
    const parts = date.split('-');
    if (parts.length === 3) {
      // Create date using year, month (0-indexed), day
      dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = dateObj.getDay();

  // Log for debugging
  console.log('Date debug:', {
    input: date,
    parsed: dateObj.toISOString(),
    year: dateObj.getFullYear(),
    month: dateObj.getMonth() + 1, // +1 for human-readable month
    day: dateObj.getDate(),
    dayOfWeek: dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  });

  // Map numeric day to short day name to ensure correctness
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayMap[dayOfWeek];
}

/**
 * Test function to verify day of week for specific dates
 * This is used for debugging purposes
 */
export function testSpecificDates() {
  // Test April 13, 2025
  const testDate = new Date(2025, 3, 13); // Month is 0-indexed, so 3 = April
  const dayOfWeek = testDate.getDay();
  const formattedDay = format(testDate, 'EEE');

  console.log('Test date April 13, 2025:', {
    date: testDate.toISOString(),
    numericDay: dayOfWeek,
    formattedDay: formattedDay,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  });

  // Test a few more dates around it
  for (let i = 12; i <= 19; i++) {
    const date = new Date(2025, 3, i);
    console.log(`April ${i}, 2025:`, {
      day: date.getDay(),
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
    });
  }
}
