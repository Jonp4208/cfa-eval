import mongoose from 'mongoose';
import WeeklySetup from '../models/weeklySetup.js';

// Get all weekly setups
export const getWeeklySetups = async (req, res) => {
  try {
    console.log('Getting weekly setups for user:', req.user?.userId || 'Unknown user');

    // Get the user's store ID
    const storeId = req.user?.store?._id || req.user?.store;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID not found in user profile' });
    }

    // Find setups that either belong to the user OR are shared and belong to the same store
    const weeklySetups = await WeeklySetup.find({
      $or: [
        { user: req.user?.userId },
        { isShared: true, store: storeId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(weeklySetups);
  } catch (error) {
    console.error('Error fetching weekly setups:', error);
    res.status(500).json({ message: 'Error fetching weekly setups', error: error.message });
  }
};

// Get a specific weekly setup by ID
export const getWeeklySetup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid ID format' });
    }

    // Get the user's store ID
    const storeId = req.user?.store?._id || req.user?.store;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID not found in user profile' });
    }

    // Find setup that either belongs to the user OR is shared and belongs to the same store
    const weeklySetup = await WeeklySetup.findOne({
      _id: id,
      $or: [
        { user: req.user?.userId },
        { isShared: true, store: storeId }
      ]
    });

    if (!weeklySetup) {
      return res.status(404).json({ message: 'Weekly setup not found' });
    }

    res.status(200).json(weeklySetup);
  } catch (error) {
    console.error('Error fetching weekly setup:', error);
    res.status(500).json({ message: 'Error fetching weekly setup', error: error.message });
  }
};

// Create a new weekly setup
export const createWeeklySetup = async (req, res) => {
  try {
    console.log('Creating weekly setup for user:', req.user?.userId || 'Unknown user');
    console.log('Request body keys:', Object.keys(req.body));

    const { name, startDate, endDate, weekSchedule, uploadedSchedules, isShared } = req.body;

    // Log detailed information about the request
    console.log('Weekly setup request details:', {
      name,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      hasWeekSchedule: !!weekSchedule,
      weekScheduleDays: weekSchedule ? Object.keys(weekSchedule) : [],
      uploadedSchedulesCount: uploadedSchedules ? (Array.isArray(uploadedSchedules) ? uploadedSchedules.length : 'not an array') : 'none'
    });

    // Validate required fields
    if (!name || !startDate || !endDate || !weekSchedule) {
      console.error('Missing required fields:', { name, startDate, endDate, hasWeekSchedule: !!weekSchedule });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!req.user || !req.user.userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    // Check if a setup with the same name already exists for this user
    const existingSetup = await WeeklySetup.findOne({ name, user: req.user.userId });
    if (existingSetup) {
      console.log('Duplicate setup name found:', name);
      return res.status(400).json({
        message: 'A setup with this name already exists',
        code: 'DUPLICATE_SETUP_NAME'
      });
    }

    // Check data size
    const dataSize = JSON.stringify(req.body).length;
    console.log(`Weekly setup data size: ${dataSize} bytes`);

    if (dataSize > 15 * 1024 * 1024) { // 15MB limit
      console.error('Weekly setup data too large:', dataSize, 'bytes');
      return res.status(413).json({
        message: 'Request entity too large. Please reduce the amount of data being sent.',
        error: 'PAYLOAD_TOO_LARGE'
      });
    }

    // Ensure uploadedSchedules is an array and sanitize it
    let sanitizedUploadedSchedules = [];
    if (Array.isArray(uploadedSchedules)) {
      // Only keep essential fields and ensure they're valid
      sanitizedUploadedSchedules = uploadedSchedules.map(emp => ({
        id: String(emp.id || ''),
        name: String(emp.name || ''),
        timeBlock: String(emp.timeBlock || ''),
        area: String(emp.area || ''),
        day: String(emp.day || '')
      }));
    }

    console.log(`Sanitized ${sanitizedUploadedSchedules.length} employee records`);

    // Get the user's store ID
    const storeId = req.user?.store?._id || req.user?.store;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID not found in user profile' });
    }

    // Create the new setup with a try-catch for validation errors
    let newWeeklySetup;
    try {

      newWeeklySetup = new WeeklySetup({
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        weekSchedule,
        uploadedSchedules: sanitizedUploadedSchedules,
        user: req.user.userId,
        store: storeId,
        isShared: isShared === true // Convert to boolean
      });

      // Validate the document before saving
      const validationError = newWeeklySetup.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        return res.status(400).json({
          message: 'Invalid data format',
          error: validationError.message,
          details: validationError.errors
        });
      }
    } catch (modelError) {
      console.error('Error creating WeeklySetup model:', modelError);
      return res.status(400).json({
        message: 'Error creating setup model',
        error: modelError.message
      });
    }

    console.log(`Attempting to save weekly setup with ${sanitizedUploadedSchedules.length} uploaded employees`);

    try {
      // Try saving without the uploaded schedules first if there are many
      if (sanitizedUploadedSchedules.length > 100) {
        console.log('Large number of employees detected, attempting to save without them first');
        const setupWithoutEmployees = new WeeklySetup({
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          weekSchedule,
          uploadedSchedules: [], // Empty array
          user: req.user.userId,
          store: storeId, // Use the storeId from above
          isShared: isShared === true // Convert to boolean
        });

        // Save the setup without employees
        await setupWithoutEmployees.save();
        console.log('Setup saved without employees, now updating with employees');

        // Now try to update with employees in batches if needed
        if (sanitizedUploadedSchedules.length > 0) {
          await WeeklySetup.findByIdAndUpdate(
            setupWithoutEmployees._id,
            { uploadedSchedules: sanitizedUploadedSchedules }
          );
          console.log('Successfully updated setup with employees');
        }

        // Return the complete setup
        const completeSetup = await WeeklySetup.findById(setupWithoutEmployees._id);
        console.log('Weekly setup created successfully:', completeSetup._id);
        return res.status(201).json(completeSetup);
      } else {
        // For smaller setups, save directly
        await newWeeklySetup.save();
        console.log('Weekly setup created successfully:', newWeeklySetup._id);
        return res.status(201).json(newWeeklySetup);
      }
    } catch (saveError) {
      console.error('Error saving weekly setup to database:', saveError);
      console.error('Error details:', JSON.stringify(saveError, null, 2));

      // Check for specific MongoDB errors
      if (saveError.name === 'MongoServerError') {
        if (saveError.code === 10334 || saveError.code === 16389) { // Document too large
          console.log('Document too large error detected, trying to save without employees');

          // Try saving without employees as a fallback
          try {
            const setupWithoutEmployees = new WeeklySetup({
              name,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              weekSchedule,
              uploadedSchedules: [], // Empty array
              user: req.user.userId,
              store: storeId, // Use the storeId from above
              isShared: isShared === true // Convert to boolean
            });

            await setupWithoutEmployees.save();
            console.log('Fallback: Setup saved without employees');

            return res.status(201).json({
              ...setupWithoutEmployees.toObject(),
              _warning: 'Employee data was too large and was not saved'
            });
          } catch (fallbackError) {
            console.error('Fallback save also failed:', fallbackError);
            return res.status(413).json({
              message: 'Document too large to save even without employees. The setup structure may be too complex.',
              error: 'DOCUMENT_TOO_LARGE_CRITICAL'
            });
          }
        }
      }

      // For validation errors
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          error: saveError.message,
          details: saveError.errors
        });
      }

      throw saveError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error creating weekly setup:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Error creating weekly setup', error: error.message });
  }
};

// Update a weekly setup
export const updateWeeklySetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, weekSchedule, uploadedSchedules, isShared } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid ID format' });
    }

    if (!req.user || !req.user.userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    // Check if the setup exists in the user's store
    const storeId = req.user?.store?._id || req.user?.store;
    const existingSetup = await WeeklySetup.findOne({ _id: id, store: storeId });

    if (!existingSetup) {
      return res.status(404).json({ message: 'Weekly setup not found' });
    }

    // Check if user has permission to edit this setup
    // Allow if: user is the creator OR user is a Leader/Director
    const isCreator = existingSetup.user.toString() === req.user.userId.toString();
    const isLeaderOrDirector = ['Leader', 'Director'].includes(req.user.position);

    if (!isCreator && !isLeaderOrDirector) {
      return res.status(403).json({ message: 'You do not have permission to edit this setup' });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== existingSetup.name) {
      const duplicateSetup = await WeeklySetup.findOne({
        name,
        user: req.user.userId,
        _id: { $ne: id } // Exclude the current setup
      });

      if (duplicateSetup) {
        return res.status(400).json({
          message: 'A setup with this name already exists',
          code: 'DUPLICATE_SETUP_NAME'
        });
      }
    }

    // Log the incoming weekSchedule data for debugging
    console.log('Updating weekly setup with ID:', id);
    console.log('Existing weekSchedule structure:', JSON.stringify(existingSetup.weekSchedule, null, 2));
    console.log('New weekSchedule structure:', JSON.stringify(weekSchedule, null, 2));

    // Check if the weekSchedule has the expected structure
    if (weekSchedule) {
      // Log the days in the weekSchedule
      console.log('Days in weekSchedule:', Object.keys(weekSchedule));

      // Check each day for timeBlocks
      Object.keys(weekSchedule).forEach(day => {
        if (weekSchedule[day] && weekSchedule[day].timeBlocks) {
          console.log(`Day ${day} has ${weekSchedule[day].timeBlocks.length} time blocks`);

          // Check each time block for positions
          weekSchedule[day].timeBlocks.forEach((block, index) => {
            console.log(`Time block ${index} (${block.start}-${block.end}) has ${block.positions ? block.positions.length : 0} positions`);

            // Log position details
            if (block.positions && block.positions.length > 0) {
              block.positions.forEach(position => {
                console.log(`Position: ${position.name}, Category: ${position.category}, Section: ${position.section}`);
              });
            }
          });
        } else {
          console.log(`Day ${day} has no time blocks or is not properly structured`);
        }
      });
    } else {
      console.log('No weekSchedule provided in the update');
    }

    // Create a deep copy of the existing setup's weekSchedule to ensure we don't lose any data
    let mergedWeekSchedule = JSON.parse(JSON.stringify(existingSetup.weekSchedule || {}));

    // If weekSchedule is provided in the request, merge it with the existing weekSchedule
    if (weekSchedule) {
      // For each day in the new weekSchedule
      Object.keys(weekSchedule).forEach(day => {
        if (!mergedWeekSchedule[day]) {
          // If the day doesn't exist in the merged schedule, add it
          mergedWeekSchedule[day] = weekSchedule[day];
        } else if (weekSchedule[day] && weekSchedule[day].timeBlocks) {
          // If the day exists, ensure timeBlocks array exists
          if (!mergedWeekSchedule[day].timeBlocks) {
            mergedWeekSchedule[day].timeBlocks = [];
          }

          // For each time block in the new weekSchedule for this day
          weekSchedule[day].timeBlocks.forEach(newTimeBlock => {
            // Find if this time block already exists in the merged schedule
            const existingTimeBlockIndex = mergedWeekSchedule[day].timeBlocks.findIndex(
              block => block.id === newTimeBlock.id
            );

            if (existingTimeBlockIndex === -1) {
              // If the time block doesn't exist, add it
              mergedWeekSchedule[day].timeBlocks.push(newTimeBlock);
              console.log(`Added new time block ${newTimeBlock.id} to ${day}`);
            } else {
              // If the time block exists, update it
              // Ensure positions array exists
              if (!mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions) {
                mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions = [];
              }

              // For each position in the new time block
              if (newTimeBlock.positions) {
                newTimeBlock.positions.forEach(newPosition => {
                  // Find if this position already exists in the merged time block
                  const existingPositionIndex = mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions.findIndex(
                    pos => pos.id === newPosition.id
                  );

                  if (existingPositionIndex === -1) {
                    // If the position doesn't exist, add it
                    mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions.push(newPosition);
                    console.log(`Added new position ${newPosition.name} to time block ${newTimeBlock.id} on ${day}`);
                  } else {
                    // If the position exists, update it
                    mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions[existingPositionIndex] = newPosition;
                    console.log(`Updated position ${newPosition.name} in time block ${newTimeBlock.id} on ${day}`);
                  }
                });
              }
            }
          });
        }
      });
    }

    console.log('Final merged weekSchedule structure:', JSON.stringify(mergedWeekSchedule, null, 2));

    const updatedSetup = await WeeklySetup.findByIdAndUpdate(
      id,
      {
        name: name || existingSetup.name,
        startDate: startDate || existingSetup.startDate,
        endDate: endDate || existingSetup.endDate,
        weekSchedule: mergedWeekSchedule,
        uploadedSchedules: uploadedSchedules || existingSetup.uploadedSchedules,
        isShared: isShared !== undefined ? isShared : existingSetup.isShared,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Updated weekly setup with ${uploadedSchedules?.length || existingSetup.uploadedSchedules?.length || 0} uploaded employees`);

    // Log the updated setup structure to verify it was saved correctly
    console.log('Updated weekSchedule structure:', JSON.stringify(updatedSetup.weekSchedule, null, 2));
    console.log('Weekly setup updated successfully:', id);
    res.status(200).json(updatedSetup);
  } catch (error) {
    console.error('Error updating weekly setup:', error);
    res.status(500).json({ message: 'Error updating weekly setup', error: error.message });
  }
};

// Delete a weekly setup
export const deleteWeeklySetup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid ID format' });
    }

    if (!req.user || !req.user.userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    // Check if the setup exists in the user's store
    const storeId = req.user?.store?._id || req.user?.store;
    const weeklySetup = await WeeklySetup.findOne({ _id: id, store: storeId });

    if (!weeklySetup) {
      return res.status(404).json({ message: 'Weekly setup not found' });
    }

    // Check if user has permission to delete this setup
    // Allow if: user is the creator OR user is a Leader/Director
    const isCreator = weeklySetup.user.toString() === req.user.userId.toString();
    const isLeaderOrDirector = ['Leader', 'Director'].includes(req.user.position);

    if (!isCreator && !isLeaderOrDirector) {
      return res.status(403).json({ message: 'You do not have permission to delete this setup' });
    }

    await WeeklySetup.findByIdAndDelete(id);
    console.log('Weekly setup deleted successfully:', id);

    res.status(200).json({ message: 'Weekly setup deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly setup:', error);
    res.status(500).json({ message: 'Error deleting weekly setup', error: error.message });
  }
};
