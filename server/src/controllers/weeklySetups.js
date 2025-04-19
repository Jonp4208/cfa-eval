import mongoose from 'mongoose';
import WeeklySetup from '../models/weeklySetup.js';

// Get all weekly setups
export const getWeeklySetups = async (req, res) => {
  try {
    console.log('Getting weekly setups for user:', req.user?.userId || 'Unknown user');
    const weeklySetups = await WeeklySetup.find({ user: req.user?.userId }).sort({ createdAt: -1 });
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

    const weeklySetup = await WeeklySetup.findOne({ _id: id, user: req.user?.userId });

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

    const { name, startDate, endDate, weekSchedule, uploadedSchedules } = req.body;

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

    // Create the new setup with a try-catch for validation errors
    let newWeeklySetup;
    try {
      newWeeklySetup = new WeeklySetup({
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        weekSchedule,
        uploadedSchedules: sanitizedUploadedSchedules,
        user: req.user.userId
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
          user: req.user.userId
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
              user: req.user.userId
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
    const { name, startDate, endDate, weekSchedule, uploadedSchedules } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid ID format' });
    }

    if (!req.user || !req.user.userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    // Check if the setup exists and belongs to the user
    const existingSetup = await WeeklySetup.findOne({ _id: id, user: req.user.userId });
    if (!existingSetup) {
      return res.status(404).json({ message: 'Weekly setup not found' });
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

    const updatedSetup = await WeeklySetup.findByIdAndUpdate(
      id,
      {
        name: name || existingSetup.name,
        startDate: startDate || existingSetup.startDate,
        endDate: endDate || existingSetup.endDate,
        weekSchedule: weekSchedule || existingSetup.weekSchedule,
        uploadedSchedules: uploadedSchedules || existingSetup.uploadedSchedules,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Updated weekly setup with ${uploadedSchedules?.length || existingSetup.uploadedSchedules?.length || 0} uploaded employees`);

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

    const weeklySetup = await WeeklySetup.findOne({ _id: id, user: req.user.userId });

    if (!weeklySetup) {
      return res.status(404).json({ message: 'Weekly setup not found' });
    }

    await WeeklySetup.findByIdAndDelete(id);
    console.log('Weekly setup deleted successfully:', id);

    res.status(200).json({ message: 'Weekly setup deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly setup:', error);
    res.status(500).json({ message: 'Error deleting weekly setup', error: error.message });
  }
};
