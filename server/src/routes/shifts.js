import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getShiftSetups,
  getShiftSetup,
  createShiftSetup,
  updateShiftSetup,
  deleteShiftSetup,
  assignEmployee,
  uploadSchedule,
  getShiftEmployees,
  getUploadedEmployees,
  saveAsTemplate,
  getTemplates,
  createUpcomingWeekSetup,
  deletePosition,
  upload
} from '../controllers/shifts.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all shift setups for a store
router.get('/', getShiftSetups);
router.get('/store/:storeId', getShiftSetups);

// Get all templates - IMPORTANT: This must come before the /:id route
router.get('/templates', getTemplates);

// Create a new shift setup from the 'new' template
router.post('/new', createShiftSetup);

// Upload Excel schedule
router.post('/upload', upload.single('file'), uploadSchedule);

// Assign an employee to a position
router.post('/assign', assignEmployee);

// Delete a position from a shift setup
router.post('/delete-position', deletePosition);

// Create a setup for the upcoming week
router.post('/upcoming-week', createUpcomingWeekSetup);

// Get a specific shift setup - This should come after all other specific routes
router.get('/:id', getShiftSetup);

// Create a new shift setup
router.post('/', createShiftSetup);

// Update a shift setup
router.put('/:id', updateShiftSetup);

// Delete a shift setup
router.delete('/:id', deleteShiftSetup);

// Get employees assigned to a shift setup
router.get('/:id/employees', getShiftEmployees);

// Get uploaded employees for a shift setup
router.get('/:id/uploaded-employees', getUploadedEmployees);

// Save a shift setup as a template
router.post('/:id/template', saveAsTemplate);

export default router;
