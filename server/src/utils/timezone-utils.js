/**
 * Timezone utility functions for the application
 */

/**
 * Convert a UTC date to New York timezone (Eastern Time)
 * @param {Date|string} utcDate - The UTC date to convert
 * @returns {Date} The date in New York timezone
 */
export function convertToNewYorkTime(utcDate) {
  if (!utcDate) {
    console.warn('convertToNewYorkTime called with null or undefined date');
    utcDate = new Date(); // Default to current date
  }

  try {
    // Create a date object from the input
    const date = new Date(utcDate);

    // Log the input date for debugging
    console.log(`convertToNewYorkTime input: ${date.toISOString()}`);

    // Create a formatter in the New York timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Format the date in New York timezone
    const nyDateParts = formatter.formatToParts(date);

    // Extract the parts
    const parts = {};
    nyDateParts.forEach(part => {
      if (part.type !== 'literal') {
        parts[part.type] = part.value;
      }
    });

    // Create a new date in New York timezone
    const nyDate = new Date(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
    );

    // Log the output date for debugging
    console.log(`convertToNewYorkTime output: ${nyDate.toISOString()}`);

    return nyDate;
  } catch (error) {
    console.error('Error in convertToNewYorkTime:', error);
    // Return the original date as a fallback
    return new Date(utcDate);
  }
}

/**
 * Create a date object that, when stored in MongoDB (UTC), will represent
 * the current date in New York timezone regardless of the server's timezone
 * @returns {Date} A date object that will correctly represent today in New York when stored in MongoDB
 */
export function createNewYorkDateForStorage() {
  try {
    // Get the current date
    const now = new Date();

    // Get the current date/time in New York timezone as a string
    const nyDateTimeString = now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Parse the date/time string
    // Format will be something like "04/13/2024, 21:45:30"
    const [datePart, timePart] = nyDateTimeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    // Create a new Date object with the NY date/time
    // Note: months are 0-indexed in JavaScript Date
    const nyDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    ));

    console.log(`NY date/time string: ${nyDateTimeString}`);
    console.log(`Parsed components: year=${year}, month=${month}, day=${day}, hours=${hours}, minutes=${minutes}, seconds=${seconds}`);
    console.log(`Created date for MongoDB storage: ${nyDate.toISOString()}`);

    return nyDate;
  } catch (error) {
    console.error('Error in createNewYorkDateForStorage:', error);
    // Fallback to current date if there's an error
    return new Date();
  }
}

/**
 * Get the date string (YYYY-MM-DD) for a date in New York timezone
 * @param {Date|string} utcDate - The UTC date to convert
 * @returns {string} The date string in YYYY-MM-DD format
 */
export function getNewYorkDateString(utcDate) {
  if (!utcDate) {
    console.warn('getNewYorkDateString called with null or undefined date');
    utcDate = new Date(); // Default to current date
  }

  try {
    // Get the current date in New York timezone
    const date = new Date(utcDate);

    // Create a date string that includes the timezone
    const nyDateString = date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    // Parse the date string to extract year, month, and day
    const [month, day, year] = nyDateString.split('/');

    // Format as YYYY-MM-DD
    const result = `${year}-${month}-${day}`;

    console.log(`getNewYorkDateString: UTC date=${date.toISOString()}, NY date=${result}`);
    return result;
  } catch (error) {
    console.error('Error in getNewYorkDateString:', error);
    // Fallback to current date in local timezone
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Check if a UTC date falls on the given date in New York timezone
 * @param {Date|string} utcDate - The UTC date to check
 * @param {string} dateString - The date string to compare against (YYYY-MM-DD)
 * @returns {boolean} True if the UTC date falls on the given date in New York timezone
 */
export function isDateInNewYork(utcDate, dateString) {
  if (!utcDate) return false;

  try {
    // Get the date string in New York timezone for the UTC date
    const nyDateString = getNewYorkDateString(utcDate);

    // Compare with the target date string
    const result = nyDateString === dateString;

    // Log for debugging
    console.log(`isDateInNewYork check: UTC date=${new Date(utcDate).toISOString()}, NY date=${nyDateString}, comparing with=${dateString}, result=${result}`);

    return result;
  } catch (error) {
    console.error('Error in isDateInNewYork:', error);
    // Default to false on error
    return false;
  }
}
