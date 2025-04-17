import { ShiftSetup, User, DefaultPositions } from '../models/index.js';
import { handleError, ErrorCategory } from '../utils/errorHandler.js';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept Excel and CSV files
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'text/csv' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  }
});

// Get all shift setups for a store
export const getShiftSetups = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { includeTemplates, autoCreate } = req.query;
    const store = storeId || req.user.store;

    // Build the query
    const query = { store };

    // By default, don't include templates unless specifically requested
    if (includeTemplates !== 'true') {
      query.isTemplate = { $ne: true };
    }

    console.log('Fetching shift setups with query:', query);

    let shiftSetups = await ShiftSetup.find(query)
      .sort({ weekStartDate: -1 })
      .populate('createdBy', 'name');

    console.log(`Found ${shiftSetups.length} shift setups`);

    // Disabled auto-creation of setups
    console.log('Auto-creation of setups is disabled');
    if (false) { // Always skip this block
      // Check if we need to create setups for current and upcoming weeks
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate current week dates
      const currentWeekStartDate = new Date(today);
      currentWeekStartDate.setDate(today.getDate() - day);
      currentWeekStartDate.setHours(0, 0, 0, 0);

      const currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6);
      currentWeekEndDate.setHours(23, 59, 59, 999);

      // Calculate next week dates
      const nextWeekStartDate = new Date(currentWeekStartDate);
      nextWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);

      const nextWeekEndDate = new Date(nextWeekStartDate);
      nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 6);
      nextWeekEndDate.setHours(23, 59, 59, 999);

      // Check if we have a setup for the current week
      const hasCurrentWeekSetup = shiftSetups.some(setup => {
        const setupStartDate = new Date(setup.weekStartDate);
        const setupEndDate = new Date(setup.weekEndDate);
        return setupStartDate <= currentWeekEndDate && setupEndDate >= currentWeekStartDate;
      });

      // Check if we have a setup for the upcoming week
      const hasUpcomingWeekSetup = shiftSetups.some(setup => {
        const setupStartDate = new Date(setup.weekStartDate);
        const setupEndDate = new Date(setup.weekEndDate);
        return setupStartDate <= nextWeekEndDate && setupEndDate >= nextWeekStartDate;
      });

      console.log('Current week setup exists:', hasCurrentWeekSetup);
      console.log('Upcoming week setup exists:', hasUpcomingWeekSetup);

      // Find a published template
      console.log('Looking for a published template with store:', store);
      let template = await ShiftSetup.findOne({
        store,
        isTemplate: true,
        status: 'published'
      }).sort({ updatedAt: -1 });

      // If no published template, find any template and publish it
      if (!template) {
        console.log('No published template found, looking for any template');
        const anyTemplate = await ShiftSetup.findOne({
          store,
          isTemplate: true
        }).sort({ updatedAt: -1 });

        if (anyTemplate) {
          console.log('Found unpublished template, publishing it:', anyTemplate._id);
          anyTemplate.status = 'published';
          template = await anyTemplate.save();
          console.log('Template published successfully');
        }

      }

      console.log('Template search result:', template ? `Found template with ID ${template._id}` : 'No template found');

      if (template) {
        console.log('Found template to use:', template._id);
        const createdSetups = [];

        // Create current week setup if needed
        if (!hasCurrentWeekSetup) {
          console.log('Creating setup for current week');
          const currentWeekSetup = new ShiftSetup({
            name: 'Current Week Setup',
            store,
            weekStartDate: currentWeekStartDate,
            weekEndDate: currentWeekEndDate,
            days: template.days,
            status: 'published',
            createdBy: req.user._id,
            isTemplate: false
          });

          const savedCurrentSetup = await currentWeekSetup.save();
          console.log('Created setup for current week:', savedCurrentSetup._id);
          createdSetups.push(savedCurrentSetup);
        }

        // Create upcoming week setup if needed
        if (!hasUpcomingWeekSetup) {
          console.log('Creating setup for upcoming week');
          const upcomingWeekSetup = new ShiftSetup({
            name: 'Upcoming Week Setup',
            store,
            weekStartDate: nextWeekStartDate,
            weekEndDate: nextWeekEndDate,
            days: template.days,
            status: 'published',
            createdBy: req.user._id,
            isTemplate: false
          });

          const savedUpcomingSetup = await upcomingWeekSetup.save();
          console.log('Created setup for upcoming week:', savedUpcomingSetup._id);
          createdSetups.push(savedUpcomingSetup);
        }

        // Add the new setups to the results
        if (createdSetups.length > 0) {
          shiftSetups = [...shiftSetups, ...createdSetups];
        }
      } else {
        console.log('No template found to create a setup from');
      }
    }

    res.status(200).json(shiftSetups);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getShiftSetups',
      user: req.user?._id,
      store: req.params.storeId || req.user?.store
    });
    res.status(500).json({ message: 'Error fetching shift setups' });
  }
};

// Get a specific shift setup
export const getShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;

    // Special case for 'new' - return an empty template
    if (id === 'new') {
      console.log('Creating new shift setup template');
      // Get the current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find the first day of the week (Monday)
      const day = today.getDay();
      const weekStartDate = new Date(today);
      // Adjust to start on Monday (1) instead of Sunday (0)
      // If today is Sunday (0), go back 6 days to previous Monday
      // Otherwise, go back (day - 1) days
      weekStartDate.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

      // Calculate week end date (Saturday - 6 days after Monday)
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      // Create days array with empty shifts
      const days = [];

      // Create shifts for each day
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);

        const shifts = [];

        // Create shifts for this day with empty positions
        const shiftTypes = ['Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner', 'Closing'];

        shiftTypes.forEach(type => {
          shifts.push({
            type,
            startTime: getShiftStartTime(type),
            endTime: getShiftEndTime(type),
            positions: []
          });
        });

        days.push({
          date,
          shifts
        });
      }

      // Log the created days for debugging
      console.log(`Created ${days.length} days for shift setup:`);
      days.forEach((day, index) => {
        console.log(`Day ${index}: ${day.date.toDateString()} with ${day.shifts.length} shifts`);
      });

      // Create the template object
      const template = {
        _id: 'new',
        store: req.user.store,
        weekStartDate,
        weekEndDate,
        days,
        status: 'draft',
        createdBy: {
          _id: req.user._id,
          name: req.user.name
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Returning new shift setup template');
      return res.status(200).json(template);
    }

    // Regular case - get the shift setup with createdBy populated
    const shiftSetup = await ShiftSetup.findById(id).populate('createdBy', 'name');

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Create a modified version of the shift setup to return
    const result = shiftSetup.toObject();

    // Process each position to handle both ObjectId and String employee references
    if (result.days && Array.isArray(result.days)) {
      for (const day of result.days) {
        if (day.shifts && Array.isArray(day.shifts)) {
          for (const shift of day.shifts) {
            if (shift.positions && Array.isArray(shift.positions)) {
              for (const position of shift.positions) {
                // If there's an assigned employee
                if (position.assignedEmployee) {
                  // Check if it's a string (name) or ObjectId
                  if (typeof position.assignedEmployee === 'string') {
                    // It's already a name, keep it as is
                    // No need to do anything
                  } else if (typeof position.assignedEmployee === 'object') {
                    // It's an ObjectId, try to populate
                    try {
                      const user = await User.findById(position.assignedEmployee).select('name departments shift');
                      if (user) {
                        // Replace the ObjectId with the user's name
                        position.assignedEmployee = user.name;
                      }
                    } catch (err) {
                      // If population fails, convert to string to avoid future errors
                      position.assignedEmployee = String(position.assignedEmployee);
                      console.log(`Could not populate employee ${position.assignedEmployee}:`, err.message);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    res.status(200).json(result);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getShiftSetup',
      user: req.user?._id,
      shiftSetupId: req.params.id
    });
    res.status(500).json({ message: 'Error fetching shift setup' });
  }
};

// Create a new shift setup
export const createShiftSetup = async (req, res) => {
  try {
    const { weekStartDate: reqWeekStartDate, weekEndDate: reqWeekEndDate, days: reqDays } = req.body;
    console.log('Creating shift setup with request body:', JSON.stringify(req.body, null, 2));

    // Initialize dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the first day of the week (Sunday)
    const day = today.getDay();
    const weekStartDate = reqWeekStartDate ? new Date(reqWeekStartDate) : new Date(today);

    // If no start date provided, calculate it
    if (!reqWeekStartDate) {
      // Adjust to start on Sunday (0)
      // Go back 'day' days to previous Sunday
      weekStartDate.setDate(today.getDate() - day);
      console.log('Calculated week start date:', weekStartDate.toDateString());
    }

    // Calculate week end date (Saturday - 6 days after Monday)
    const weekEndDate = reqWeekEndDate ? new Date(reqWeekEndDate) : new Date(weekStartDate);

    // If no end date provided, calculate it
    if (!reqWeekEndDate) {
      weekEndDate.setDate(weekStartDate.getDate() + 6);
    }

    // Use provided days if available, otherwise create default days
    let days = [];

    if (reqDays && Array.isArray(reqDays) && reqDays.length > 0) {
      console.log('Using provided days from request body');
      console.log('First day structure:', JSON.stringify(reqDays[0], null, 2));

      // Check if we need to handle timeBlocks format
      if (reqDays[0].timeBlocks) {
        console.log('Detected timeBlocks format, converting to shifts format');
        days = reqDays.map(day => {
          // If day already has shifts, use them
          if (day.shifts && Array.isArray(day.shifts) && day.shifts.length > 0) {
            return day;
          }

          // Otherwise, convert timeBlocks to shifts
          const shifts = Array.isArray(day.timeBlocks) ? day.timeBlocks.map(timeBlock => ({
            type: `Custom ${timeBlock.startTime}-${timeBlock.endTime}`,
            startTime: timeBlock.startTime,
            endTime: timeBlock.endTime,
            positions: Array.isArray(timeBlock.positions) ? timeBlock.positions.map(pos => ({
              name: pos.name,
              department: pos.department,
              status: pos.status || 'unassigned',
              assignedEmployee: pos.assignedEmployee || null
            })) : []
          })) : [];

          return {
            date: day.date,
            shifts
          };
        });
      } else {
        days = reqDays;
      }
    } else {
      console.log('Creating default days with positions');
      // Create shifts for each day (Sunday through Saturday)
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);
        console.log(`Creating day ${i}: ${date.toDateString()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]})`);


        const shifts = [];

        // Create shifts for this day with default positions
        const shiftTypes = ['Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner', 'Closing'];

        shiftTypes.forEach(type => {
          // Create default positions for each department
          const defaultPositions = [];

          // Front Counter positions
          if (['Opening', 'Morning', 'Lunch', 'Afternoon'].includes(type)) {
            defaultPositions.push(
              { name: 'Register 1', department: 'FC', status: 'unassigned' },
              { name: 'Register 2', department: 'FC', status: 'unassigned' },
              { name: 'Bagger', department: 'FC', status: 'unassigned' },
              { name: 'Runner', department: 'FC', status: 'unassigned' }
            );
          }

          // Drive Thru positions
          if (['Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner'].includes(type)) {
            defaultPositions.push(
              { name: 'Window', department: 'DT', status: 'unassigned' },
              { name: 'Order Taker', department: 'DT', status: 'unassigned' },
              { name: 'Bagger', department: 'DT', status: 'unassigned' },
              { name: 'Runner', department: 'DT', status: 'unassigned' }
            );
          }

          // Kitchen positions
          if (['Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner'].includes(type)) {
            defaultPositions.push(
              { name: 'Primary', department: 'KT', status: 'unassigned' },
              { name: 'Secondary', department: 'KT', status: 'unassigned' },
              { name: 'Breader', department: 'KT', status: 'unassigned' },
              { name: 'Prep', department: 'KT', status: 'unassigned' }
            );
          }

          shifts.push({
            type,
            startTime: getShiftStartTime(type),
            endTime: getShiftEndTime(type),
            positions: defaultPositions
          });
        });

        days.push({
          date,
          shifts
        });
      }
    }

    // Log the days for debugging
    console.log(`Using ${days.length} days for new shift setup:`);
    days.forEach((day, index) => {
      console.log(`Day ${index}: ${new Date(day.date).toDateString()} with ${day.shifts ? day.shifts.length : (day.timeBlocks ? day.timeBlocks.length : 0)} shifts/timeBlocks`);

      // Ensure each day has a shifts array
      if (!day.shifts) {
        console.log(`Adding empty shifts array to day ${index}`);
        day.shifts = [];
      }

      // Log the first shift's positions if available
      if (day.shifts && day.shifts.length > 0 && day.shifts[0].positions) {
        console.log(`Day ${index}, first shift has ${day.shifts[0].positions.length} positions`);
      }
    });

    // Extract additional fields from request body
    const { name, status, isTemplate } = req.body;

    const shiftSetup = new ShiftSetup({
      name: name || 'Position Setup',
      store: req.user.store,
      weekStartDate,
      weekEndDate,
      days,
      status: status || 'draft',
      createdBy: req.user._id,
      isTemplate: isTemplate || false
    });

    console.log('Creating shift setup with isTemplate:', isTemplate);

    const savedShiftSetup = await shiftSetup.save();
    console.log('Saved shift setup with ID:', savedShiftSetup._id);
    res.status(201).json(savedShiftSetup);
  } catch (error) {
    console.error('Error creating shift setup:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // Log the request body for debugging
    console.error('Request body:', JSON.stringify(req.body, null, 2));

    handleError(error, ErrorCategory.DATABASE, {
      operation: 'createShiftSetup',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error creating shift setup: ' + error.message });
  }
};

// Update a shift setup
export const updateShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekStartDate, weekEndDate, days, status } = req.body;

    // Special case for 'new' - create a new shift setup instead of updating
    if (id === 'new') {
      console.log('Creating new shift setup from update endpoint');

      // Create a new shift setup
      const shiftSetup = new ShiftSetup({
        store: req.user.store._id,
        weekStartDate: weekStartDate || new Date(),
        weekEndDate: weekEndDate || new Date(new Date().setDate(new Date().getDate() + 6)),
        days: days || [],
        status: status || 'draft',
        createdBy: req.user._id
      });

      const savedShiftSetup = await shiftSetup.save();
      return res.status(201).json(savedShiftSetup);
    }

    // Regular case - update existing shift setup
    const shiftSetup = await ShiftSetup.findById(id);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Update fields
    if (weekStartDate) shiftSetup.weekStartDate = weekStartDate;
    if (weekEndDate) shiftSetup.weekEndDate = weekEndDate;

    // Handle days update - replace the entire days array
    if (days) {
      console.log('Updating days array with new data');
      console.log('Original days length:', shiftSetup.days.length);
      console.log('New days length:', days.length);

      // Log position counts before update
      const originalPositionCount = shiftSetup.days.reduce((total, day) => {
        if (day.timeBlocks) {
          return total + day.timeBlocks.reduce((blockTotal, block) => {
            return blockTotal + (block.positions ? block.positions.length : 0);
          }, 0);
        } else if (day.shifts) {
          return total + day.shifts.reduce((shiftTotal, shift) => {
            return shiftTotal + (shift.positions ? shift.positions.length : 0);
          }, 0);
        }
        return total;
      }, 0);

      const newPositionCount = days.reduce((total, day) => {
        if (day.timeBlocks) {
          return total + day.timeBlocks.reduce((blockTotal, block) => {
            return blockTotal + (block.positions ? block.positions.length : 0);
          }, 0);
        } else if (day.shifts) {
          return total + day.shifts.reduce((shiftTotal, shift) => {
            return shiftTotal + (shift.positions ? shift.positions.length : 0);
          }, 0);
        }
        return total;
      }, 0);

      console.log(`Position count before update: ${originalPositionCount}`);
      console.log(`Position count after update: ${newPositionCount}`);

      // First, clear the existing days array
      shiftSetup.days = [];

      // Then add the new days
      shiftSetup.days = days;

      console.log(`Updated days array with ${days.length} days`);

      // Force the document to be marked as modified
      shiftSetup.markModified('days');
    }

    if (status) shiftSetup.status = status;

    const updatedShiftSetup = await shiftSetup.save();
    res.status(200).json(updatedShiftSetup);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'updateShiftSetup',
      user: req.user?._id,
      shiftSetupId: req.params.id
    });
    res.status(500).json({ message: 'Error updating shift setup' });
  }
};

// Delete a shift setup
export const deleteShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;

    const shiftSetup = await ShiftSetup.findById(id);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    await ShiftSetup.findByIdAndDelete(id);
    res.status(200).json({ message: 'Shift setup deleted successfully' });
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'deleteShiftSetup',
      user: req.user?._id,
      shiftSetupId: req.params.id
    });
    res.status(500).json({ message: 'Error deleting shift setup' });
  }
};

// Assign an employee to a position
export const assignEmployee = async (req, res) => {
  try {
    const { shiftSetupId, dayIndex, shiftIndex, positionIndex, employeeId } = req.body;

    const shiftSetup = await ShiftSetup.findById(shiftSetupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // If employeeId is empty, unassign the position
    if (!employeeId) {
      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].assignedEmployee = null;
      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].status = 'unassigned';
    }
    // Check if this is a temporary ID (from uploaded employees)
    else if (employeeId.startsWith('temp-')) {
      // For temporary IDs, store the employee name instead of the ID
      // Extract the name from the ID (e.g., 'temp-megan-silvernail' -> 'Megan Silvernail')
      const nameParts = employeeId.replace('temp-', '').split('-');
      const employeeName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].assignedEmployee = employeeName;
      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].status = 'assigned';
    } else {
      // For regular database IDs, store the ID as before
      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].assignedEmployee = employeeId;
      shiftSetup.days[dayIndex].shifts[shiftIndex].positions[positionIndex].status = 'assigned';
    }

    const updatedShiftSetup = await shiftSetup.save();
    res.status(200).json(updatedShiftSetup);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'assignEmployee',
      user: req.user?._id,
      shiftSetupId: req.body.shiftSetupId
    });
    res.status(500).json({ message: 'Error assigning employee' });
  }
};

// Upload Excel schedule
// Get employees assigned to a shift setup
export const getShiftEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting employees for shift setup:', id);

    // Find the shift setup
    const shiftSetup = await ShiftSetup.findById(id);
    if (!shiftSetup) {
      console.log('Shift setup not found');
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    console.log('Found shift setup:', shiftSetup._id);

    // Extract all assigned employees from the shift setup
    const employees = [];
    const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // If no days are available, return sample data for testing
    if (!shiftSetup.days || shiftSetup.days.length === 0) {
      console.log('No days found in shift setup, returning sample data');
      // Return sample data for testing
      return res.status(200).json([
        { name: 'John Smith', day: 'Monday', shiftTime: '8:00a - 4:00p', department: 'Kitchen', position: 'Primary' },
        { name: 'Jane Doe', day: 'Monday', shiftTime: '9:00a - 5:00p', department: 'FOH', position: 'Register 1' },
        { name: 'Bob Johnson', day: 'Tuesday', shiftTime: '7:00a - 3:00p', department: 'FOH', position: 'Bagger' },
        { name: 'Alice Williams', day: 'Wednesday', shiftTime: '10:00a - 6:00p', department: 'Kitchen', position: 'Secondary' },
      ]);
    }

    // Process each day
    shiftSetup.days.forEach((day, dayIndex) => {
      try {
        const dayDate = new Date(day.date);
        const dayName = dayNameMap[dayDate.getDay()];
        console.log(`Processing day: ${dayName}`);

        if (!day.shifts || !Array.isArray(day.shifts)) {
          console.log('No shifts found for day');
          return;
        }

        day.shifts.forEach((shift) => {
          if (!shift.positions || !Array.isArray(shift.positions)) {
            console.log('No positions found for shift:', shift.type);
            return;
          }

          shift.positions.forEach((position) => {
            if (position.status === 'assigned' && position.assignedEmployee) {
              // For demo purposes, we'll create a more detailed employee object
              const employeeName = typeof position.assignedEmployee === 'string' ?
                position.assignedEmployee :
                (position.assignedEmployee.name || String(position.assignedEmployee));

              employees.push({
                name: employeeName,
                day: dayName,
                shiftTime: `${shift.startTime} - ${shift.endTime}`,
                department: position.department,
                position: position.name
              });
            }
          });
        });
      } catch (err) {
        console.error('Error processing day:', err);
      }
    });

    // Add uploaded employees to the response
    if (shiftSetup.uploadedEmployees && Array.isArray(shiftSetup.uploadedEmployees) && shiftSetup.uploadedEmployees.length > 0) {
      console.log(`Adding ${shiftSetup.uploadedEmployees.length} uploaded employees to response`);

      // Convert uploaded employees to the same format as assigned employees
      const uploadedEmployeesList = shiftSetup.uploadedEmployees.map(emp => ({
        name: emp.name,
        day: emp.day,
        shiftTime: emp.time,
        department: emp.department,
        position: 'Unassigned',
        isUploaded: true
      }));

      employees.push(...uploadedEmployeesList);
    }

    console.log(`Returning ${employees.length} employees`);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error in getShiftEmployees:', error);
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getShiftEmployees',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error getting shift employees' });
  }
};

// Get uploaded employees for a shift setup
export const getUploadedEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting uploaded employees for shift setup:', id);

    // Find the shift setup
    const shiftSetup = await ShiftSetup.findById(id);
    if (!shiftSetup) {
      console.log('Shift setup not found');
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    console.log('Found shift setup:', shiftSetup._id);
    console.log('Shift setup has uploadedEmployees field:', shiftSetup.hasOwnProperty('uploadedEmployees'));
    console.log('Shift setup uploadedEmployees:', shiftSetup.uploadedEmployees);

    // Check if the shift setup has uploaded employees
    if (!shiftSetup.uploadedEmployees || !Array.isArray(shiftSetup.uploadedEmployees) || shiftSetup.uploadedEmployees.length === 0) {
      console.log('No uploaded employees found, returning empty array');
      return res.status(200).json([]);
    }

    console.log(`Found ${shiftSetup.uploadedEmployees.length} uploaded employees`);
    res.status(200).json(shiftSetup.uploadedEmployees);
  } catch (error) {
    console.error('Error in getUploadedEmployees:', error);
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getUploadedEmployees',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error getting uploaded employees' });
  }
};

export const uploadSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read Excel or CSV file
    const workbook = xlsx.readFile(req.file.path, { raw: false, dateNF: 'yyyy-mm-dd' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    // Check if we're updating an existing shift setup
    let existingShiftSetup;
    if (req.body.shiftSetupId) {
      existingShiftSetup = await ShiftSetup.findById(req.body.shiftSetupId);
      if (!existingShiftSetup) {
        return res.status(404).json({ message: 'Shift setup not found' });
      }
    }

    // Process data and create shift setup
    let weekStartDate, weekEndDate, days;

    if (existingShiftSetup) {
      // Use existing shift setup dates and days
      weekStartDate = new Date(existingShiftSetup.weekStartDate);
      weekEndDate = new Date(existingShiftSetup.weekEndDate);
      days = JSON.parse(JSON.stringify(existingShiftSetup.days)); // Deep copy
    } else {
      // Create new shift setup
      weekStartDate = new Date();
      weekStartDate.setHours(0, 0, 0, 0);

      // Find the first day of the week (Monday)
      const day = weekStartDate.getDay();
      weekStartDate.setDate(weekStartDate.getDate() - (day === 0 ? 6 : day - 1));

      weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      // Create days array with shifts
      days = [];
    }

    // Map day names to day indices (0 = Sunday, 1 = Monday, etc.)
    const dayNameToIndex = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    // Get default positions for each day and shift
    const getPositionsForShift = async (day, shiftType) => {
      try {
        // Find default positions for this day and shift
        const defaultPositions = await DefaultPositions.findOne({
          store: req.user.store._id,
          day,
          shift: shiftType
        });

        if (defaultPositions) {
          // Group positions by department
          const positions = {
            FC: [],
            DT: [],
            KT: []
          };

          defaultPositions.positions.forEach(pos => {
            if (positions[pos.department]) {
              positions[pos.department].push({
                name: pos.name,
                department: pos.department,
                assignedEmployee: null,
                status: 'unassigned'
              });
            }
          });

          return positions;
        }
      } catch (error) {
        console.error(`Error getting default positions for day ${day}, shift ${shiftType}:`, error);
      }

      // Return empty positions if no defaults found
      return {
        FC: [],
        DT: [],
        KT: []
      };
    };

    // Initialize days array with shifts and default positions
    // We need to use async/await here
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);

      const shifts = [];

      // Create shifts for this day with default positions
      const shiftTypes = ['Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner', 'Closing'];

      // We need to use Promise.all to wait for all async operations
      const shiftPromises = shiftTypes.map(async (type) => {
        const positionsForShift = await getPositionsForShift(i, type);

        return {
          type,
          startTime: getShiftStartTime(type),
          endTime: getShiftEndTime(type),
          positions: [...positionsForShift.FC, ...positionsForShift.DT, ...positionsForShift.KT]
        };
      });

      // Wait for all shifts to be created
      const resolvedShifts = await Promise.all(shiftPromises);
      shifts.push(...resolvedShifts);

      days.push({
        date,
        shifts
      });
    }

    // Store employee availability for later assignment
    const employeeAvailability = [];

    // Log the data for debugging
    console.log('Uploaded data:', data.slice(0, 5));

    // Determine column names (handle different possible formats)
    const getColumnValue = (employee, possibleNames) => {
      for (const name of possibleNames) {
        if (employee[name] !== undefined && employee[name] !== '') {
          return employee[name];
        }
      }
      return null;
    };

    // Process each employee's schedule to determine availability
    data.forEach(employee => {
      // Get employee data using flexible column names
      const name = getColumnValue(employee, ['Name', 'name', 'Employee', 'employee', 'EmployeeName']);
      const shiftTime = getColumnValue(employee, ['ShiftTime', 'shiftTime', 'Shift Time', 'shift time', 'Time', 'time']);
      const day = getColumnValue(employee, ['Day', 'day', 'Workday', 'workday']);
      const department = getColumnValue(employee, ['Department', 'department', 'Dept', 'dept']);

      console.log('Processing employee:', { name, shiftTime, day, department });

      if (!name || !shiftTime || !day || !department) {
        console.log('Skipping incomplete entry:', employee);
        return; // Skip incomplete entries
      }

      // Get day index (0-6)
      const dayIndex = dayNameToIndex[day];
      if (dayIndex === undefined) {
        console.log('Invalid day:', day);
        return; // Skip invalid days
      }

      // Parse shift time (e.g., "5:00a - 2:00p")
      const shiftTimeParts = shiftTime.split(' - ');
      if (shiftTimeParts.length !== 2) {
        console.log('Invalid shift time format:', shiftTime);
        return; // Skip invalid shift times
      }

      const startTimeStr = shiftTimeParts[0];
      const endTimeStr = shiftTimeParts[1];

      // Convert to 24-hour format
      const startTime = convertTo24Hour(startTimeStr);
      const endTime = convertTo24Hour(endTimeStr);
      if (!startTime || !endTime) {
        console.log('Invalid time conversion:', { startTimeStr, endTimeStr });
        return; // Skip invalid times
      }

      // Determine which shift(s) this employee works in
      const shiftIndices = determineShifts(startTime, endTime);

      // Add employee availability information
      shiftIndices.forEach(shiftIndex => {
        if (shiftIndex >= 0 && shiftIndex < 6) { // Ensure valid shift index
          employeeAvailability.push({
            name: employee.Name,
            department: employee.Department,
            day: dayIndex,
            shift: shiftIndex,
            startTime,
            endTime
          });
        }
      });
    });

    // Optional: Auto-assign employees to positions based on availability
    // This is just a simple example - you might want more sophisticated assignment logic
    employeeAvailability.forEach(employee => {
      const dayShifts = days[employee.day].shifts[employee.shift];

      // Find an unassigned position in the employee's department
      const availablePosition = dayShifts.positions.find(pos =>
        pos.department === employee.department &&
        pos.status === 'unassigned'
      );

      // Assign employee if a position is available
      if (availablePosition) {
        availablePosition.assignedEmployee = employee.name;
        availablePosition.status = 'assigned';
      }
    });

    // Process uploaded employees into a structured format
    const uploadedEmployees = data.map(employee => {
      const name = getColumnValue(employee, ['Name', 'name', 'Employee', 'employee', 'EmployeeName']);
      const shiftTime = getColumnValue(employee, ['ShiftTime', 'shiftTime', 'Shift Time', 'shift time', 'Time', 'time']);
      const day = getColumnValue(employee, ['Day', 'day', 'Workday', 'workday']);
      const department = getColumnValue(employee, ['Department', 'department', 'Dept', 'dept']);

      return {
        name,
        time: shiftTime,
        day,
        department
      };
    }).filter(emp => emp.name && emp.time && emp.day && emp.department);

    console.log(`Processed ${uploadedEmployees.length} valid employees from upload:`, uploadedEmployees);

    let savedShiftSetup;

    if (existingShiftSetup) {
      // Update existing shift setup
      // IMPORTANT: Don't replace the existing days, just update the uploadedEmployees
      existingShiftSetup.uploadedEmployees = uploadedEmployees;
      existingShiftSetup.updatedAt = new Date();
      savedShiftSetup = await existingShiftSetup.save();
      console.log('Updated shift setup with uploaded employees:', savedShiftSetup.uploadedEmployees);
    } else {
      // Create new shift setup
      const shiftSetup = new ShiftSetup({
        store: req.user.store,
        weekStartDate,
        weekEndDate,
        days,
        uploadedEmployees,
        createdBy: req.user._id
      });

      savedShiftSetup = await shiftSetup.save();
      console.log('Created new shift setup with uploaded employees:', savedShiftSetup.uploadedEmployees);
    }

    // Delete the uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json(savedShiftSetup);
  } catch (error) {
    // Delete the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    handleError(error, ErrorCategory.FILE_UPLOAD, {
      operation: 'uploadSchedule',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error uploading schedule' });
  }
};

// Helper function to get shift start time
function getShiftStartTime(shiftType) {
  switch (shiftType) {
    case 'Opening':
      return '05:00';
    case 'Morning':
      return '08:00';
    case 'Lunch':
      return '11:00';
    case 'Afternoon':
      return '14:00';
    case 'Dinner':
      return '17:00';
    case 'Closing':
      return '20:00';
    default:
      return '08:00';
  }
}

// Helper function to get shift end time
function getShiftEndTime(shiftType) {
  switch (shiftType) {
    case 'Opening':
      return '08:00';
    case 'Morning':
      return '11:00';
    case 'Lunch':
      return '14:00';
    case 'Afternoon':
      return '17:00';
    case 'Dinner':
      return '20:00';
    case 'Closing':
      return '23:00';
    default:
      return '17:00';
  }
}

// Helper function to convert time from 12-hour format to 24-hour format
function convertTo24Hour(timeStr) {
  console.log('Converting time:', timeStr);

  // Handle formats like "5:00a" or "2:00p" or "5:00a�" (with special characters)
  const match = timeStr.replace(/[^0-9:ap]/g, '').match(/^(\d+):(\d+)([ap])$/);
  if (!match) {
    console.log('Time format not recognized:', timeStr);
    return null;
  }

  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  console.log('Parsed time components:', { hours, minutes, ampm });

  // Convert to 24-hour format
  if (ampm === 'p' && hours < 12) {
    hours += 12;
  } else if (ampm === 'a' && hours === 12) {
    hours = 0;
  }

  // Format as HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Helper function to determine which shifts an employee works in based on their start and end times
function determineShifts(startTime, endTime) {
  const shiftBoundaries = [
    { start: '05:00', end: '08:00' }, // Opening
    { start: '08:00', end: '11:00' }, // Morning
    { start: '11:00', end: '14:00' }, // Lunch
    { start: '14:00', end: '17:00' }, // Afternoon
    { start: '17:00', end: '20:00' }, // Dinner
    { start: '20:00', end: '23:00' }  // Closing
  ];

  const shifts = [];

  // Convert times to minutes for easier comparison
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Check each shift
  shiftBoundaries.forEach((shift, index) => {
    const shiftStartMinutes = timeToMinutes(shift.start);
    const shiftEndMinutes = timeToMinutes(shift.end);

    // Employee works in this shift if their shift overlaps with it
    if (!(endMinutes <= shiftStartMinutes || startMinutes >= shiftEndMinutes)) {
      shifts.push(index);
    }
  });

  return shifts;
}

// Helper function to convert time string (HH:MM) to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await ShiftSetup.find({
      store: req.user.store,
      isTemplate: true
    })
    .sort({ updatedAt: -1 })
    .populate('createdBy', 'name');

    console.log(`Found ${templates.length} templates`);
    res.status(200).json(templates);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getTemplates',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

// Create a setup for the upcoming week (disabled - users should create setups manually)
export const createUpcomingWeekSetup = async (req, res) => {
  // Return a message indicating this feature is disabled
  return res.status(400).json({ message: 'Automatic setup creation is disabled. Please create setups manually.' });

  /* Original implementation disabled:
  try {
    const { templateId } = req.body;

    // Find the template to use
    let template;
    if (templateId) {
      template = await ShiftSetup.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
    } else {
      // Find the most recent published template
      template = await ShiftSetup.findOne({
        store: req.user.store,
        isTemplate: true,
        status: 'published'
      }).sort({ updatedAt: -1 });

      if (!template) {
        return res.status(404).json({ message: 'No published template found' });
      }
    }

    // Calculate next week dates
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find the first day of next week (Sunday)
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - day + 7); // Add 7 days to get to next week
    weekStartDate.setHours(0, 0, 0, 0);

    // End date is Saturday (6 days after Sunday)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    // Check if a setup already exists for this week
    const existingSetup = await ShiftSetup.findOne({
      store: req.user.store,
      isTemplate: false,
      weekStartDate: { $gte: weekStartDate },
      weekEndDate: { $lte: weekEndDate }
    });

    if (existingSetup) {
      return res.status(400).json({
        message: 'A setup already exists for the upcoming week',
        setup: existingSetup
      });
    }

    // Create a new setup from the template
    const newSetup = new ShiftSetup({
      name: 'Upcoming Week Setup',
      store: req.user.store,
      weekStartDate,
      weekEndDate,
      days: template.days,
      status: 'published',
      createdBy: req.user._id,
      isTemplate: false
    });

    const savedSetup = await newSetup.save();
    console.log('Created setup for upcoming week:', savedSetup._id);

    res.status(201).json(savedSetup);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'createUpcomingWeekSetup',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error creating setup for upcoming week' });
  }
  */
};

// Delete a position from a shift setup
export const deletePosition = async (req, res) => {
  try {
    const { id, dayIndex, blockId, positionId } = req.body;

    console.log('Deleting position:', { id, dayIndex, blockId, positionId });

    // Find the shift setup
    const shiftSetup = await ShiftSetup.findById(id);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Check if the day exists
    if (!shiftSetup.days[dayIndex]) {
      return res.status(404).json({ message: 'Day not found' });
    }

    // Check if the day has timeBlocks
    if (!shiftSetup.days[dayIndex].timeBlocks) {
      return res.status(404).json({ message: 'Time blocks not found for this day' });
    }

    // Find the block
    const blockIndex = shiftSetup.days[dayIndex].timeBlocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) {
      return res.status(404).json({ message: 'Block not found' });
    }

    // Count positions before deletion
    const positionCountBefore = shiftSetup.days[dayIndex].timeBlocks[blockIndex].positions.length;

    // Remove the position
    shiftSetup.days[dayIndex].timeBlocks[blockIndex].positions =
      shiftSetup.days[dayIndex].timeBlocks[blockIndex].positions.filter(pos => pos.id !== positionId);

    // Count positions after deletion
    const positionCountAfter = shiftSetup.days[dayIndex].timeBlocks[blockIndex].positions.length;

    console.log(`Position count before: ${positionCountBefore}, after: ${positionCountAfter}`);

    if (positionCountBefore === positionCountAfter) {
      return res.status(400).json({ message: 'Position not found or could not be deleted' });
    }

    // Mark the days array as modified
    shiftSetup.markModified('days');

    // Save the updated shift setup
    const updatedShiftSetup = await shiftSetup.save();

    console.log('Position deleted successfully');
    res.status(200).json(updatedShiftSetup);
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Error deleting position' });
  }
};

// Save a shift setup as a template
export const saveAsTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    // Find the original shift setup
    const originalSetup = await ShiftSetup.findById(id);
    if (!originalSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Create a new shift setup as a template
    const templateSetup = new ShiftSetup({
      name: name, // Add the name field
      store: req.user.store,
      weekStartDate: originalSetup.weekStartDate,
      weekEndDate: originalSetup.weekEndDate,
      days: originalSetup.days,
      status: 'draft',
      createdBy: req.user._id,
      isTemplate: true // Mark as a template
    });

    const savedTemplate = await templateSetup.save();
    console.log('Saved shift setup template:', savedTemplate._id);
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error('Error saving shift setup as template:', error);
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'saveAsTemplate',
      user: req.user?._id,
      shiftSetupId: req.params.id
    });
    res.status(500).json({ message: 'Error saving template' });
  }
};
