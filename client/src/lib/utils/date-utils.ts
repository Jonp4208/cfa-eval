/**
 * Date utility functions for the application
 */

/**
 * Get today's date in YYYY-MM-DD format in New York timezone
 */
export function getTodayDateString(): string {
  // Create a formatter in the New York timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Format the date in New York timezone
  const nyDateParts = formatter.formatToParts(new Date());

  // Extract the parts
  const parts: Record<string, string> = {};
  nyDateParts.forEach(part => {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  });

  // Return in YYYY-MM-DD format
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Check if the current date is different from the stored date
 * This uses midnight (00:00) as the cutoff time for a new day
 */
export function isNewDay(lastSavedDate: string | null): boolean {
  if (!lastSavedDate) return true;

  const today = getTodayDateString();
  return lastSavedDate !== today;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString();
}

/**
 * Format a time for display
 */
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a time for display in New York timezone
 */
export function formatNewYorkTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a UTC time for display without timezone conversion
 * This is useful when the time is already stored in the desired timezone
 */
export function formatUTCTimeDirectly(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Convert 24-hour time format (HH:MM) to 12-hour AM/PM format
 */
export function formatHourTo12Hour(hour: string | number): string {
  // Handle null or undefined
  if (hour === null || hour === undefined) {
    return '';
  }

  // If it's already in the format we want, return it
  if (typeof hour === 'string') {
    if (hour.indexOf('AM') > -1 || hour.indexOf('PM') > -1) {
      return hour;
    }
  }

  // Parse the hour and minutes
  let hourNum: number;
  let minutes: string = '00';

  if (typeof hour === 'string') {
    // Handle formats like "14:00" or "14"
    const parts = hour.split(':');
    hourNum = parseInt(parts[0]);

    // Extract minutes if available
    if (parts.length > 1) {
      minutes = parts[1].padStart(2, '0');
    }

    if (isNaN(hourNum)) {
      return hour; // Return original if parsing fails
    }
  } else if (typeof hour === 'number') {
    hourNum = hour;
  } else {
    return String(hour); // Return string representation for other types
  }

  // Convert to 12-hour format
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM

  // Check if the original hour had minutes
  const hasMinutes = typeof hour === 'string' && hour.indexOf(':') > -1;

  return `${hour12}:${hasMinutes ? minutes : '00'} ${ampm}`;
}
