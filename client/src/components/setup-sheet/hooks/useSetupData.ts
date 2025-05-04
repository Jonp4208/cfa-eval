import { useState, useEffect } from 'react';
import { Setup, TimeBlock } from '../types';
import log from '../utils/logUtils';

export const useSetupData = (initialSetup: Setup) => {
  const [modifiedSetup, setModifiedSetup] = useState<Setup>(initialSetup);
  const [originalSetup, setOriginalSetup] = useState<Setup>(initialSetup);

  // Function to load cached data from localStorage
  const loadCachedData = () => {
    if (!initialSetup || !initialSetup._id) return false;

    try {
      const cachedDataString = localStorage.getItem(`setup_cache_${initialSetup._id}`);
      if (!cachedDataString) return false;

      const cachedData = JSON.parse(cachedDataString);

      // Check if cache is still valid (less than 30 minutes old)
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheValidityPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (cacheAge > cacheValidityPeriod) {
        // Cache is too old, remove it
        localStorage.removeItem(`setup_cache_${initialSetup._id}`);
        return false;
      }

      // Use the cached data
      const updatedSetup = {
        ...initialSetup,
        uploadedSchedules: cachedData.uploadedSchedules,
        employees: cachedData.employees,
        weekSchedule: cachedData.weekSchedule
      };

      return updatedSetup;
    } catch (error) {
      return false;
    }
  };

  // Check if a weekly setup has positions
  const hasPositions = (setup: Setup) => {
    if (!setup || !setup.weekSchedule) return false;

    let positionCount = 0;
    Object.keys(setup.weekSchedule).forEach(day => {
      const daySchedule = setup.weekSchedule[day];
      if (daySchedule && daySchedule.timeBlocks) {
        daySchedule.timeBlocks.forEach((block: any) => {
          if (block.positions && block.positions.length > 0) {
            positionCount += block.positions.length;
          }
        });
      }
    });

    return positionCount > 0;
  };

  // Get time blocks for a specific day
  const getTimeBlocks = (day: string): TimeBlock[] => {
    if (!modifiedSetup.weekSchedule || !modifiedSetup.weekSchedule[day]) {
      return [];
    }

    const daySchedule = modifiedSetup.weekSchedule[day];
    return daySchedule.timeBlocks || [];
  };

  // Get all hours from the time blocks
  const getAllHours = (day: string): string[] => {
    const timeBlocks = getTimeBlocks(day);
    const hours = new Set<string>();

    timeBlocks.forEach(block => {
      // Add the start hour
      hours.add(block.start.toString());
    });

    return Array.from(hours).sort((a, b) => parseInt(a) - parseInt(b));
  };

  // Find the closest hour to the current time
  const findClosestHour = (hours: string[]): string | null => {
    if (hours.length === 0) return null;

    const currentHour = new Date().getHours();
    
    // Find the hour that is closest to the current hour
    let closestHour = hours[0];
    let minDiff = Math.abs(parseInt(hours[0]) - currentHour);

    for (let i = 1; i < hours.length; i++) {
      const diff = Math.abs(parseInt(hours[i]) - currentHour);
      if (diff < minDiff) {
        minDiff = diff;
        closestHour = hours[i];
      }
    }

    return closestHour;
  };

  // Initialize setup data
  useEffect(() => {
    // Try to load cached data first
    const cachedSetup = loadCachedData();

    if (cachedSetup) {
      log.info('Using cached setup data');
      setModifiedSetup(cachedSetup);
      setOriginalSetup(cachedSetup);
    } else {
      log.info('No valid cache, using data from props');
      
      // If the setup doesn't have positions, we need to add them from the template
      if (!hasPositions(initialSetup)) {
        log.debug('Setup does not have positions');
      }

      // Create a copy of the setup to modify
      const newSetup = JSON.parse(JSON.stringify(initialSetup));
      setModifiedSetup(newSetup);
      setOriginalSetup(newSetup);
    }
  }, [initialSetup._id]); // Only re-run if the setup ID changes

  return {
    modifiedSetup,
    setModifiedSetup,
    originalSetup,
    setOriginalSetup,
    getTimeBlocks,
    getAllHours,
    findClosestHour
  };
};
