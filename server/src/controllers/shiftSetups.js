import ShiftSetup from '../models/ShiftSetup.js';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
import multer from 'multer';
import ExcelJS from 'exceljs';
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

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit for Excel/CSV files
  },
  fileFilter: function (req, file, cb) {
    // Accept Excel and CSV files only
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

// Helper function to parse time range (e.g., "5:00 AM - 2:00 PM")
const parseTimeRange = (timeStr) => {
  if (!timeStr) return null;

  // Handle both "5:00a - 2:00p" and "5:00 AM - 2:00 PM" formats
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|a|p)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM|a|p)/i);

  if (!timeMatch) return null;

  const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;

  // Convert to 24-hour format
  let start24 = parseInt(startHour);
  let end24 = parseInt(endHour);

  const startIsAM = startPeriod.toLowerCase().startsWith('a');
  const endIsAM = endPeriod.toLowerCase().startsWith('a');

  if (!startIsAM && start24 !== 12) start24 += 12;
  if (startIsAM && start24 === 12) start24 = 0;
  if (!endIsAM && end24 !== 12) end24 += 12;
  if (endIsAM && end24 === 12) end24 = 0;

  const startTime = `${start24.toString().padStart(2, '0')}:${startMin}`;
  const endTime = `${end24.toString().padStart(2, '0')}:${endMin}`;

  return { startTime, endTime };
};

// Helper function to parse position info (e.g., "Leadership | FOH - Shift Leader")
const parsePositionInfo = (positionStr) => {
  if (!positionStr) return { department: 'FOH', position: 'Team Member', isLeadership: false };

  const positionLower = positionStr.toLowerCase();

  // Determine department
  let department = 'FOH';
  if (positionLower.includes('boh') || positionLower.includes('kitchen') || positionLower.includes('back of house')) {
    department = 'BOH';
  }

  // Determine if leadership role
  const isLeadership = positionLower.includes('leadership') || positionLower.includes('leader') || positionLower.includes('manager');

  // Extract position name
  let position = 'Team Member';
  if (positionLower.includes('shift leader')) {
    position = 'Shift Leader';
  } else if (positionLower.includes('manager')) {
    position = 'Manager';
  } else if (positionLower.includes('general')) {
    position = 'General';
  }

  return { department, position, isLeadership };
};

// Helper function to parse a single shift entry (e.g., "5:00 AM - 2:00 PM Leadership | FOH - Shift Leader")
const parseShiftEntry = (shiftText) => {
  if (!shiftText || typeof shiftText !== 'string') return null;

  const trimmed = shiftText.trim();
  if (!trimmed) return null;

  // Split by newlines to handle multiple shifts in one cell
  const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line);
  const shifts = [];

  for (const line of lines) {
    // Try to extract time range and position info
    // Pattern: "5:00 AM - 2:00 PM Leadership | FOH - Shift Leader"
    const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

    if (timeMatch) {
      const [, startTimeStr, endTimeStr] = timeMatch;
      const timeRange = parseTimeRange(`${startTimeStr} - ${endTimeStr}`);

      if (timeRange) {
        // Extract position info (everything after the time range)
        const positionText = line.replace(timeMatch[0], '').trim();
        const positionInfo = parsePositionInfo(positionText);

        shifts.push({
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          department: positionInfo.department,
          position: positionInfo.position,
          isLeadership: positionInfo.isLeadership,
          originalText: line
        });
      }
    }
  }

  return shifts.length > 0 ? shifts : null;
};

// Helper function to process weekly roster data
const processWeeklyRosterData = (rawData) => {
  const processedEmployees = [];
  const shifts = [];

  // Helper function to extract day name from column header
  const extractDayFromColumn = (columnName) => {
    if (!columnName) return null;

    const dayMappings = {
      'sun': 'Sunday',
      'mon': 'Monday',
      'tue': 'Tuesday',
      'wed': 'Wednesday',
      'thu': 'Thursday',
      'fri': 'Friday',
      'sat': 'Saturday'
    };

    // Check if column starts with a day abbreviation (like "Sun, 5/18/25")
    const colStart = columnName.toLowerCase().substring(0, 3);
    if (dayMappings[colStart]) {
      return dayMappings[colStart];
    }

    // Check for exact matches
    const colLower = columnName.toLowerCase();
    for (const [abbr, fullDay] of Object.entries(dayMappings)) {
      if (colLower === abbr || colLower === fullDay.toLowerCase()) {
        return fullDay;
      }
    }

    return null;
  };

  rawData.forEach((row, index) => {
    // Get employee name from first column (try various possible names)
    const employeeName = row.Employee || row.employee || row.Name || row.name ||
                         row['Employee Name'] || row[Object.keys(row)[0]];

    if (!employeeName || typeof employeeName !== 'string' || !employeeName.trim()) {
      return;
    }

    const name = employeeName.trim();

    // Process each day column
    Object.keys(row).forEach(columnName => {
      const dayName = extractDayFromColumn(columnName);

      if (dayName && row[columnName]) {
        const shiftData = row[columnName];
        const dayShifts = parseShiftEntry(shiftData);

        if (dayShifts) {
          dayShifts.forEach(shift => {
            const employee = {
              id: nanoid(),
              name: name,
              day: dayName,
              startTime: shift.startTime,
              endTime: shift.endTime,
              department: shift.department,
              position: shift.position,
              isLeadership: shift.isLeadership,
              originalData: {
                employeeName: name,
                day: dayName,
                shiftText: shift.originalText
              }
            };

            processedEmployees.push(employee);

            const shiftEntry = {
              day: dayName,
              startTime: shift.startTime,
              endTime: shift.endTime,
              department: shift.department,
              position: shift.position,
              employeeName: name,
              employeeId: employee.id
            };

            shifts.push(shiftEntry);
          });
        }
      }
    });
  });

  return { employees: processedEmployees, shifts };
};

// Upload employees from Excel/CSV file
export const uploadSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let rawData = [];

    // Process Excel/CSV file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // Convert worksheet to array of arrays
    rawData = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData = [];
      row.eachCell((cell, colNumber) => {
        rowData[colNumber - 1] = cell.value;
      });
      rawData.push(rowData);
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    if (rawData.length === 0) {
      return res.status(400).json({ message: 'No data found in the uploaded file' });
    }

    // Convert array of arrays to array of objects
    const headers = rawData[0];
    const dataRows = rawData.slice(1).filter(row => row.some(cell => cell && cell.toString().trim()));

    const jsonData = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          obj[header] = row[index];
        }
      });
      return obj;
    });

    // Get the shift setup ID from the request body
    const { setupId } = req.body;

    if (!setupId) {
      return res.status(400).json({ message: 'Shift setup ID is required' });
    }

    const shiftSetup = await ShiftSetup.findById(setupId);

    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }

    // Process the weekly roster data
    const { employees, shifts } = processWeeklyRosterData(jsonData);

    // Store the processed data
    shiftSetup.uploadedEmployees = employees;
    await shiftSetup.save();

    res.status(200).json({
      message: 'Schedule uploaded and processed successfully',
      employeeCount: employees.length,
      shiftCount: shifts.length,
      employees: employees,
      shifts: shifts,
      rawDataSample: jsonData.slice(0, 3) // Include sample for debugging
    });
  } catch (error) {
    console.error('Error uploading schedule:', error);
    res.status(500).json({ message: `Error uploading schedule: ${error.message}` });
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
