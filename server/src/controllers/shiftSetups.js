import ShiftSetup from '../models/ShiftSetup.js';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
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
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });

// Get all shift setups
export const getShiftSetups = async (req, res) => {
  try {
    const { isTemplate, status, autoCreate, weekOf } = req.query;
    const store = req.user.store;

    // Build query
    const query = { store };

    if (isTemplate !== undefined) {
      query.isTemplate = isTemplate === 'true';
    }

    if (status) {
      query.status = status;
    }

    // Find shift setups
    let shiftSetups = await ShiftSetup.find(query).sort({ updatedAt: -1 });

    // Filter by week if specified
    if (weekOf) {
      const weekDate = new Date(weekOf);
      shiftSetups = shiftSetups.filter(setup => {
        const startDate = new Date(setup.weekStartDate);
        const endDate = new Date(setup.weekEndDate);
        return startDate <= weekDate && endDate >= weekDate;
      });
    }

    // We no longer auto-create setups, users must create them manually
    // The autoCreate parameter is kept for backward compatibility

    res.status(200).json(shiftSetups);
  } catch (error) {
    console.error('Error getting shift setups:', error);
    res.status(500).json({ message: 'Error getting shift setups' });
  }
};

// Get a single shift setup
export const getShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const store = req.user.store;

    const shiftSetup = await ShiftSetup.findOne({ _id: id, store });

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    res.status(200).json(shiftSetup);
  } catch (error) {
    console.error('Error getting shift setup:', error);
    res.status(500).json({ message: 'Error getting shift setup' });
  }
};

// Create a new shift setup
export const createShiftSetup = async (req, res) => {
  try {
    const { name, status, weekStartDate, weekEndDate, isTemplate, days: requestDays } = req.body;
    const store = req.user.store;

    // Validate required fields
    if (!name || !weekStartDate || !weekEndDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use days from request if provided, otherwise create default days
    let days = [];

    if (requestDays && Array.isArray(requestDays) && requestDays.length > 0) {
      console.log('Using days from request:', requestDays.length);
      // Use the days provided in the request
      days = requestDays;
    } else {
      console.log('Creating default days');
      // Create default days array for the week
      const startDate = new Date(weekStartDate);
      const endDate = new Date(weekEndDate);

      // Create a day for each day in the week
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        days.push({
          date: new Date(date),
          timeBlocks: [
            {
              id: `block-${nanoid(8)}`,
              startTime: '05:00',
              endTime: '08:00',
              positions: []
            },
            {
              id: `block-${nanoid(8)}`,
              startTime: '08:00',
              endTime: '11:00',
              positions: []
            },
            {
              id: `block-${nanoid(8)}`,
              startTime: '11:00',
              endTime: '14:00',
              positions: []
            },
            {
              id: `block-${nanoid(8)}`,
              startTime: '14:00',
              endTime: '17:00',
              positions: []
            },
            {
              id: `block-${nanoid(8)}`,
              startTime: '17:00',
              endTime: '20:00',
              positions: []
            },
            {
              id: `block-${nanoid(8)}`,
              startTime: '20:00',
              endTime: '23:00',
              positions: []
            }
          ]
        });
      }
    }

    // Log the days structure before creating the setup
    console.log('Creating shift setup with days structure:', JSON.stringify(days.map(day => {
      return {
        date: day.date,
        timeBlocksCount: day.timeBlocks?.length || 0,
        positionsCount: day.timeBlocks?.reduce((total, block) => total + (block.positions?.length || 0), 0) || 0
      };
    })));

    // Create the shift setup
    const shiftSetup = new ShiftSetup({
      name,
      store,
      weekStartDate,
      weekEndDate,
      days,
      status: status || 'draft',
      createdBy: req.user._id,
      isTemplate: isTemplate || false,
      version: 2 // Using the new schema version
    });

    const savedSetup = await shiftSetup.save();

    // Log the saved setup
    console.log('Saved shift setup with days structure:', JSON.stringify(savedSetup.days.map(day => {
      return {
        date: day.date,
        timeBlocksCount: day.timeBlocks?.length || 0,
        positionsCount: day.timeBlocks?.reduce((total, block) => total + (block.positions?.length || 0), 0) || 0
      };
    })));

    res.status(201).json(savedSetup);
  } catch (error) {
    console.error('Error creating shift setup:', error);
    res.status(500).json({ message: 'Error creating shift setup' });
  }
};

// Update a shift setup
export const updateShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, weekStartDate, weekEndDate, isTemplate } = req.body;
    const store = req.user.store;

    const shiftSetup = await ShiftSetup.findOne({ _id: id, store });

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Update fields if provided
    if (name) shiftSetup.name = name;
    if (status) shiftSetup.status = status;
    if (weekStartDate) shiftSetup.weekStartDate = weekStartDate;
    if (weekEndDate) shiftSetup.weekEndDate = weekEndDate;
    if (isTemplate !== undefined) shiftSetup.isTemplate = isTemplate;

    const updatedSetup = await shiftSetup.save();

    res.status(200).json(updatedSetup);
  } catch (error) {
    console.error('Error updating shift setup:', error);
    res.status(500).json({ message: 'Error updating shift setup' });
  }
};

// Delete a shift setup
export const deleteShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const store = req.user.store;

    const shiftSetup = await ShiftSetup.findOne({ _id: id, store });

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    await shiftSetup.remove();

    res.status(200).json({ message: 'Shift setup deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift setup:', error);
    res.status(500).json({ message: 'Error deleting shift setup' });
  }
};

// Create a copy of a shift setup
export const copyShiftSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, weekStartDate, weekEndDate, isTemplate } = req.body;
    const store = req.user.store;

    const shiftSetup = await ShiftSetup.findOne({ _id: id, store });

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Create a new shift setup based on the existing one
    const newSetup = new ShiftSetup({
      name: name || `Copy of ${shiftSetup.name}`,
      store,
      weekStartDate: weekStartDate || shiftSetup.weekStartDate,
      weekEndDate: weekEndDate || shiftSetup.weekEndDate,
      days: JSON.parse(JSON.stringify(shiftSetup.days)), // Deep copy
      status: 'draft',
      createdBy: req.user._id,
      isTemplate: isTemplate !== undefined ? isTemplate : shiftSetup.isTemplate,
      version: shiftSetup.version || 2
    });

    const savedSetup = await newSetup.save();

    res.status(201).json(savedSetup);
  } catch (error) {
    console.error('Error copying shift setup:', error);
    res.status(500).json({ message: 'Error copying shift setup' });
  }
};

// Create a setup for the upcoming week (disabled - users should create setups manually)
export const createUpcomingWeekSetup = async (req, res) => {
  // Return a message indicating this feature is disabled
  return res.status(400).json({ message: 'Automatic setup creation is disabled. Please create setups manually.' });

  /* Original implementation disabled:
  try {
    const { templateId } = req.body;
    const store = req.user.store;

    // Calculate upcoming week dates
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const currentWeekStartDate = new Date(today);
    currentWeekStartDate.setDate(today.getDate() - day);
    currentWeekStartDate.setHours(0, 0, 0, 0);

    const nextWeekStartDate = new Date(currentWeekStartDate);
    nextWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);

    const nextWeekEndDate = new Date(nextWeekStartDate);
    nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 6);
    nextWeekEndDate.setHours(23, 59, 59, 999);

    // Check if a setup already exists for the upcoming week
    const existingSetup = await ShiftSetup.findOne({
      store,
      isTemplate: false,
      weekStartDate: { $lte: nextWeekEndDate },
      weekEndDate: { $gte: nextWeekStartDate }
    });

    if (existingSetup) {
      return res.status(400).json({
        message: 'A setup already exists for the upcoming week',
        existingSetup
      });
    }

    // Find the template to use
    let template;

    if (templateId) {
      // Use the specified template
      template = await ShiftSetup.findOne({
        _id: templateId,
        store,
        isTemplate: true
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
    } else {
      // Use the most recent published template
      template = await ShiftSetup.findOne({
        store,
        isTemplate: true,
        status: 'published'
      }).sort({ updatedAt: -1 });

      if (!template) {
        return res.status(404).json({ message: 'No published template found' });
      }
    }

    // Create the upcoming week setup
    const upcomingWeekSetup = new ShiftSetup({
      name: 'Upcoming Week Setup',
      store,
      weekStartDate: nextWeekStartDate,
      weekEndDate: nextWeekEndDate,
      days: JSON.parse(JSON.stringify(template.days)), // Deep copy
      status: 'published',
      createdBy: req.user._id,
      isTemplate: false,
      version: template.version || 2
    });

    const savedSetup = await upcomingWeekSetup.save();

    res.status(201).json(savedSetup);
  } catch (error) {
    console.error('Error creating upcoming week setup:', error);
    res.status(500).json({ message: 'Error creating upcoming week setup' });
  }
  */
};

// Upload employees from Excel file
export const uploadSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    if (data.length === 0) {
      return res.status(400).json({ message: 'No data found in the uploaded file' });
    }

    // Get the shift setup ID from the request body
    const { setupId } = req.body;

    if (!setupId) {
      return res.status(400).json({ message: 'Shift setup ID is required' });
    }

    const shiftSetup = await ShiftSetup.findById(setupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Process the data and update the shift setup
    shiftSetup.uploadedEmployees = data;

    await shiftSetup.save();

    res.status(200).json({
      message: 'Schedule uploaded successfully',
      employeeCount: data.length,
      employees: data
    });
  } catch (error) {
    console.error('Error uploading schedule:', error);
    res.status(500).json({ message: 'Error uploading schedule' });
  }
};

// Get uploaded employees for a shift setup
export const getUploadedEmployees = async (req, res) => {
  try {
    const { setupId } = req.params;

    if (!setupId) {
      return res.status(400).json({ message: 'Shift setup ID is required' });
    }

    const shiftSetup = await ShiftSetup.findById(setupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    res.status(200).json(shiftSetup.uploadedEmployees || []);
  } catch (error) {
    console.error('Error getting uploaded employees:', error);
    res.status(500).json({ message: 'Error getting uploaded employees' });
  }
};

// Assign an employee to a position
export const assignEmployee = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId, positionId, employeeId } = req.body;

    if (!setupId || dayIndex === undefined || !blockId || !positionId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const shiftSetup = await ShiftSetup.findById(setupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    if (!shiftSetup.days[dayIndex] || !shiftSetup.days[dayIndex].timeBlocks) {
      return res.status(404).json({ message: 'Day or time blocks not found' });
    }

    const timeBlockIndex = shiftSetup.days[dayIndex].timeBlocks.findIndex(block => block.id === blockId);

    if (timeBlockIndex === -1) {
      return res.status(404).json({ message: 'Time block not found' });
    }

    const positionIndex = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.findIndex(
      pos => pos.id === positionId
    );

    if (positionIndex === -1) {
      return res.status(404).json({ message: 'Position not found' });
    }

    // Update the position
    const position = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions[positionIndex];

    if (employeeId) {
      // Find the employee in uploaded employees or users
      let employee = null;

      if (shiftSetup.uploadedEmployees && shiftSetup.uploadedEmployees.length > 0) {
        employee = shiftSetup.uploadedEmployees.find(emp => emp.id === employeeId || emp._id === employeeId);
      }

      if (!employee) {
        employee = await User.findById(employeeId);
      }

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      position.assignedEmployee = employee;
      position.status = 'assigned';
    } else {
      position.assignedEmployee = null;
      position.status = 'unassigned';
    }

    // Mark the array as modified
    shiftSetup.markModified('days');

    // Save the updated shift setup
    await shiftSetup.save();

    res.status(200).json(position);
  } catch (error) {
    console.error('Error assigning employee:', error);
    res.status(500).json({ message: 'Error assigning employee' });
  }
};

// Get all employees assigned to a shift setup
export const getShiftEmployees = async (req, res) => {
  try {
    const { setupId } = req.params;

    if (!setupId) {
      return res.status(400).json({ message: 'Shift setup ID is required' });
    }

    const shiftSetup = await ShiftSetup.findById(setupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Collect all assigned employees from all positions
    const assignedEmployees = [];

    shiftSetup.days.forEach(day => {
      if (day.timeBlocks) {
        day.timeBlocks.forEach(block => {
          block.positions.forEach(position => {
            if (position.assignedEmployee && position.status === 'assigned') {
              assignedEmployees.push({
                employee: position.assignedEmployee,
                position: position.name,
                department: position.department,
                day: new Date(day.date),
                timeBlock: {
                  id: block.id,
                  startTime: block.startTime,
                  endTime: block.endTime
                }
              });
            }
          });
        });
      }
    });

    res.status(200).json(assignedEmployees);
  } catch (error) {
    console.error('Error getting shift employees:', error);
    res.status(500).json({ message: 'Error getting shift employees' });
  }
};

// Save a shift setup as a template
export const saveAsTemplate = async (req, res) => {
  try {
    const { setupId, name } = req.body;
    const store = req.user.store;

    if (!setupId) {
      return res.status(400).json({ message: 'Shift setup ID is required' });
    }

    const shiftSetup = await ShiftSetup.findOne({ _id: setupId, store });

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Create a new template based on the shift setup
    const template = new ShiftSetup({
      name: name || `Template from ${shiftSetup.name}`,
      store,
      weekStartDate: shiftSetup.weekStartDate,
      weekEndDate: shiftSetup.weekEndDate,
      days: JSON.parse(JSON.stringify(shiftSetup.days)), // Deep copy
      status: 'draft',
      createdBy: req.user._id,
      isTemplate: true,
      version: shiftSetup.version || 2
    });

    const savedTemplate = await template.save();

    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error('Error saving as template:', error);
    res.status(500).json({ message: 'Error saving as template' });
  }
};

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const { status } = req.query;
    const store = req.user.store;

    // Build query
    const query = { store, isTemplate: true };

    if (status) {
      query.status = status;
    }

    const templates = await ShiftSetup.find(query).sort({ updatedAt: -1 });

    // If no templates found, return an empty array instead of 404
    if (!templates || templates.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ message: 'Error getting templates' });
  }
};
