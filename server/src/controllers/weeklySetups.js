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
      // Keep essential fields and ensure they're valid, including break information
      sanitizedUploadedSchedules = uploadedSchedules.map(emp => ({
        id: String(emp.id || ''),
        name: String(emp.name || ''),
        timeBlock: String(emp.timeBlock || ''),
        area: String(emp.area || ''),
        day: String(emp.day || ''),
        // Include break information
        breaks: emp.breaks || [],
        hadBreak: emp.hadBreak || false,
        breakDate: emp.breakDate || null
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

    // Check for employee deletion header
    const employeeToDeleteId = req.headers['x-delete-employee'];
    const isSecondAttempt = req.headers['x-second-attempt'] === 'true';

    if (employeeToDeleteId) {
      console.log(`Detected employee deletion request for employee ID: ${employeeToDeleteId}`);
      if (isSecondAttempt) {
        console.log(`This is a second attempt to delete employee ${employeeToDeleteId}`);
      }
    }

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

    // Initialize mergedUploadedSchedules at the beginning of the function
    // to ensure it's available throughout the entire function
    let mergedUploadedSchedules = existingSetup.uploadedSchedules || [];

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

    // Log basic info without the full structure
    console.log('Updating weekly setup with ID:', id);
    console.log('Updating setup:', existingSetup.name);

    // Only log the structure size, not the content
    if (weekSchedule) {
      console.log('New weekSchedule days:', Object.keys(weekSchedule));
      console.log('New weekSchedule size:', JSON.stringify(weekSchedule).length, 'bytes');
    }

    // Check if the weekSchedule has the expected structure
    if (weekSchedule) {
      // Log the days in the weekSchedule
      console.log('Days in weekSchedule:', Object.keys(weekSchedule));

      // Check each day for timeBlocks - log only counts, not details
      Object.keys(weekSchedule).forEach(day => {
        if (weekSchedule[day] && weekSchedule[day].timeBlocks) {
          const timeBlockCount = weekSchedule[day].timeBlocks.length;
          const positionCount = weekSchedule[day].timeBlocks.reduce((total, block) =>
            total + (block.positions ? block.positions.length : 0), 0);

          console.log(`Day ${day}: ${timeBlockCount} time blocks, ${positionCount} total positions`);
        } else {
          console.log(`Day ${day} has no time blocks or is not properly structured`);
        }
      });
    } else {
      console.log('No weekSchedule provided in the update');
    }

    // Create a deep copy of the existing setup's weekSchedule to ensure we don't lose any data
    let mergedWeekSchedule = JSON.parse(JSON.stringify(existingSetup.weekSchedule || {}));

    // Check if this is an optimized payload (only contains one day's full data)
    const isOptimizedPayload = weekSchedule && Object.keys(weekSchedule).some(day =>
      weekSchedule[day].timeBlocks && weekSchedule[day].timeBlocks.length > 0 &&
      Object.keys(weekSchedule).some(otherDay =>
        otherDay !== day && (!weekSchedule[otherDay].timeBlocks || weekSchedule[otherDay].timeBlocks.length === 0)
      )
    );

    console.log(`Detected ${isOptimizedPayload ? 'optimized' : 'full'} payload`);

    // If optimized payload, log which days have data and which are empty
    if (isOptimizedPayload && weekSchedule) {
      const daysWithData = Object.keys(weekSchedule).filter(day =>
        weekSchedule[day].timeBlocks && weekSchedule[day].timeBlocks.length > 0
      );
      const emptyDays = Object.keys(weekSchedule).filter(day =>
        !weekSchedule[day].timeBlocks || weekSchedule[day].timeBlocks.length === 0
      );

      console.log(`Optimized payload contains data for: ${daysWithData.join(', ')}`);
      console.log(`Skipping empty days: ${emptyDays.join(', ')}`);
    }

    // If weekSchedule is provided in the request, merge it with the existing weekSchedule
    if (weekSchedule) {
      // For each day in the new weekSchedule
      Object.keys(weekSchedule).forEach(day => {
        // Skip days with empty timeBlocks in optimized payload
        if (isOptimizedPayload && (!weekSchedule[day].timeBlocks || weekSchedule[day].timeBlocks.length === 0)) {
          // Don't log each skipped day individually
          return;
        }

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
                // Count positions to add and update
                let positionsToAdd = 0;
                let positionsToUpdate = 0;

                newTimeBlock.positions.forEach(newPosition => {
                  // Find if this position already exists in the merged time block
                  const existingPositionIndex = mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions.findIndex(
                    pos => pos.id === newPosition.id
                  );

                  if (existingPositionIndex === -1) {
                    // If the position doesn't exist, add it
                    mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions.push(newPosition);
                    positionsToAdd++;
                  } else {
                    // If the position exists, update it
                    mergedWeekSchedule[day].timeBlocks[existingTimeBlockIndex].positions[existingPositionIndex] = newPosition;
                    positionsToUpdate++;

                    // If this position has an employee assigned, update the employee data in uploadedSchedules
                    if (newPosition.employeeId && newPosition.employeeName) {
                      // Find the employee in the existing uploadedSchedules
                      const employeeId = newPosition.employeeId;
                      const employeeName = newPosition.employeeName;

                      // We know mergedUploadedSchedules is initialized at the beginning of the function
                      // Find the employee in the uploadedSchedules
                      const employeeIndex = mergedUploadedSchedules.findIndex(emp => emp.id === employeeId);

                      if (employeeIndex !== -1) {
                        // Update the employee with position information
                        mergedUploadedSchedules[employeeIndex].position = newPosition.name;
                        mergedUploadedSchedules[employeeIndex].department = newPosition.category;
                        mergedUploadedSchedules[employeeIndex].isScheduled = true;
                        console.log(`Updated employee ${employeeName} with position ${newPosition.name}`);
                      }
                    }
                  }
                });

                // Log summary instead of individual positions
                if (positionsToAdd > 0 || positionsToUpdate > 0) {
                  console.log(`Time block ${newTimeBlock.id} on ${day}: Added ${positionsToAdd} positions, updated ${positionsToUpdate} positions`);
                }
              }
            }
          });
        }
      });
    }

    // Log only the size of the merged structure, not the content
    console.log('Final merged weekSchedule size:', JSON.stringify(mergedWeekSchedule).length, 'bytes');

    // Handle optimized employee data

    // First, update employee data based on position assignments in the weekSchedule
    console.log('Updating employee data based on position assignments...');

    // Create a map of existing employees by ID for quick lookup
    const existingEmployeeMap = new Map();
    mergedUploadedSchedules.forEach(emp => {
      existingEmployeeMap.set(emp.id, emp);
    });

    // Scan through all positions in the weekSchedule to update employee data
    Object.keys(mergedWeekSchedule).forEach(day => {
      if (mergedWeekSchedule[day] && mergedWeekSchedule[day].timeBlocks) {
        mergedWeekSchedule[day].timeBlocks.forEach(block => {
          if (block.positions) {
            block.positions.forEach(position => {
              if (position.employeeId && position.employeeName) {
                // Find the employee in the map
                if (existingEmployeeMap.has(position.employeeId)) {
                  const employee = existingEmployeeMap.get(position.employeeId);

                  // Update the employee with position information
                  employee.position = position.name;
                  employee.department = position.category;
                  employee.isScheduled = true;

                  console.log(`Updated employee ${position.employeeName} with position ${position.name} from weekSchedule`);
                }
              }
            });
          }
        });
      }
    });

    // Update the mergedUploadedSchedules array with the updated employee data
    mergedUploadedSchedules = Array.from(existingEmployeeMap.values());

    // If this is an employee deletion request, explicitly remove the employee from mergedUploadedSchedules
    if (employeeToDeleteId) {
      console.log(`Explicitly removing employee ${employeeToDeleteId} from mergedUploadedSchedules`);
      const beforeLength = mergedUploadedSchedules.length;
      mergedUploadedSchedules = mergedUploadedSchedules.filter(emp => emp.id !== employeeToDeleteId);
      const afterLength = mergedUploadedSchedules.length;
      console.log(`Removed ${beforeLength - afterLength} employee records with ID ${employeeToDeleteId}`);

      // Also remove the employee from all positions in the weekSchedule
      let positionsCleared = 0;
      Object.keys(mergedWeekSchedule).forEach(day => {
        if (mergedWeekSchedule[day] && mergedWeekSchedule[day].timeBlocks) {
          mergedWeekSchedule[day].timeBlocks.forEach(block => {
            if (block.positions) {
              block.positions.forEach(position => {
                if (position.employeeId === employeeToDeleteId) {
                  position.employeeId = undefined;
                  position.employeeName = undefined;
                  positionsCleared++;
                }
              });
            }
          });
        }
      });
      console.log(`Cleared employee ${employeeToDeleteId} from ${positionsCleared} positions in the weekSchedule`);
    }

    if (uploadedSchedules) {
      console.log(`Processing ${uploadedSchedules.length} employee records from request`);

      // Only log break-related information for debugging
      if (uploadedSchedules.length > 0) {
        // Count employees with break information
        const employeesWithBreaks = uploadedSchedules.filter(emp =>
          emp.hadBreak || (emp.breaks && emp.breaks.length > 0)
        ).length;

        if (employeesWithBreaks > 0) {
          console.log(`Found ${employeesWithBreaks} employees with break information in the request`);

          // Log a sample employee with break info for debugging
          const breakEmployee = uploadedSchedules.find(emp =>
            emp.hadBreak || (emp.breaks && emp.breaks.length > 0)
          );

          if (breakEmployee) {
            console.log(`Break info for ${breakEmployee.name}: hadBreak=${breakEmployee.hadBreak}, breakDate=${breakEmployee.breakDate}, breaks=${breakEmployee.breaks?.length || 0}`);
          }
        }
      }

      // Only log existing break information if present
      if (mergedUploadedSchedules.length > 0) {
        // Count existing employees with break information
        const existingWithBreaks = mergedUploadedSchedules.filter(emp =>
          emp.hadBreak || (emp.breaks && emp.breaks.length > 0)
        ).length;

        if (existingWithBreaks > 0) {
          console.log(`Found ${existingWithBreaks} existing employees with break information`);
        }
      }

      // Check if this is an optimized employee payload
      // We now consider all payloads as optimized to ensure we always merge data properly
      const isOptimizedEmployeePayload = true;

      console.log(`Detected ${isOptimizedEmployeePayload ? 'optimized' : 'full'} employee payload`);

      // Log the count of employees before merging
      console.log(`Before merging: ${mergedUploadedSchedules.length} existing employees`);

      if (isOptimizedEmployeePayload) {
        // For optimized payloads, we need to merge with existing data
        // We already have the existingEmployeeMap from above
        console.log(`Using existing employee map with ${existingEmployeeMap.size} employees`);

        // Count how many employees we'll update vs. add
        let updateCount = 0;
        let addCount = 0;

        // Update or add employees from the request
        uploadedSchedules.forEach(newEmp => {
          // Skip this employee if it's the one being deleted
          if (employeeToDeleteId && newEmp.id === employeeToDeleteId) {
            console.log(`Skipping employee ${newEmp.id} (${newEmp.name}) as it's marked for deletion`);
            return;
          }

          if (existingEmployeeMap.has(newEmp.id)) {
            // Update existing employee with new data, but preserve fields that might not be in the new data
            const existingEmp = existingEmployeeMap.get(newEmp.id);

            // Merge the objects, prioritizing new data but keeping existing fields if they're not in the new data
            // This ensures we don't lose any fields during updates
            Object.keys(newEmp).forEach(key => {
              // Only update if the new value is defined and not null
              if (newEmp[key] !== undefined && newEmp[key] !== null) {
                existingEmp[key] = newEmp[key];
              }
            });

            // Only log if break information is being updated
            if (newEmp.hadBreak || (newEmp.breaks && newEmp.breaks.length > 0)) {
              console.log(`Updated break info for ${newEmp.name}: hadBreak=${existingEmp.hadBreak}, breaks=${existingEmp.breaks?.length || 0}`);
            }

            updateCount++;
          } else {
            // Add new employee
            mergedUploadedSchedules.push(newEmp);
            addCount++;
          }
        });

        console.log(`Merged employee data: ${updateCount} updated, ${addCount} added, ${mergedUploadedSchedules.length} total employees`);
      } else {
        // For full payloads, replace the entire uploadedSchedules array
        console.log('Replacing entire uploadedSchedules array');
        mergedUploadedSchedules = uploadedSchedules;
      }
    }

    // One final check to ensure the employee is removed if this is a deletion request
    if (employeeToDeleteId) {
      console.log(`Final check: ensuring employee ${employeeToDeleteId} is removed from uploadedSchedules`);
      mergedUploadedSchedules = mergedUploadedSchedules.filter(emp => emp.id !== employeeToDeleteId);
    }

    const updatedSetup = await WeeklySetup.findByIdAndUpdate(
      id,
      {
        name: name || existingSetup.name,
        startDate: startDate || existingSetup.startDate,
        endDate: endDate || existingSetup.endDate,
        weekSchedule: mergedWeekSchedule,
        uploadedSchedules: mergedUploadedSchedules,
        isShared: isShared !== undefined ? isShared : existingSetup.isShared,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Updated weekly setup with ${uploadedSchedules?.length || existingSetup.uploadedSchedules?.length || 0} uploaded employees`);
    console.log(`Updated weekSchedule has ${Object.keys(updatedSetup.weekSchedule).length} days`);
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
