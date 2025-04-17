import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ShiftSetup } from '../models/index.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const cleanupDuplicateDays = async () => {
  try {
    // Get all shift setups
    const shiftSetups = await ShiftSetup.find({});
    console.log(`Found ${shiftSetups.length} shift setups`);

    let updatedCount = 0;

    for (const setup of shiftSetups) {
      // Check if there are duplicate days
      if (!setup.days || setup.days.length === 0) {
        console.log(`Shift setup ${setup._id} has no days, skipping`);
        continue;
      }

      // Create a map to store unique days by date string
      const uniqueDaysMap = new Map();
      
      // Process days to keep only unique dates
      setup.days.forEach(day => {
        const dateStr = new Date(day.date).toISOString().split('T')[0];
        
        // If this date isn't in our map yet, or if the current day has more shifts/positions, use this one
        if (!uniqueDaysMap.has(dateStr) || 
            (day.shifts && day.shifts.reduce((count, shift) => count + (Array.isArray(shift.positions) ? shift.positions.length : 0), 0) > 
             uniqueDaysMap.get(dateStr).shifts.reduce((count, shift) => count + (Array.isArray(shift.positions) ? shift.positions.length : 0), 0))) {
          uniqueDaysMap.set(dateStr, day);
        }
      });
      
      // Convert the map values back to an array
      const uniqueDays = Array.from(uniqueDaysMap.values());
      
      // If we found duplicate days, update the shift setup
      if (uniqueDays.length < setup.days.length) {
        console.log(`Shift setup ${setup._id} has ${setup.days.length} days, reducing to ${uniqueDays.length} unique days`);
        
        // Update the shift setup
        setup.days = uniqueDays;
        await setup.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} shift setups`);
    return updatedCount;
  } catch (error) {
    console.error('Error cleaning up duplicate days:', error);
    throw error;
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup function
cleanupDuplicateDays()
  .then(count => {
    console.log(`Successfully cleaned up duplicate days in ${count} shift setups`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error running cleanup script:', err);
    process.exit(1);
  });
