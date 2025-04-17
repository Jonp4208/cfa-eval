import express from 'express';
import {
  getShiftSetups,
  getShiftSetup,
  createShiftSetup,
  updateShiftSetup,
  deleteShiftSetup,
  copyShiftSetup,
  createUpcomingWeekSetup,
  uploadSchedule,
  getUploadedEmployees,
  assignEmployee,
  getShiftEmployees,
  saveAsTemplate,
  getTemplates,
  upload
} from '../controllers/shiftSetups.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Template routes
router.get('/templates', getTemplates);
router.post('/templates', saveAsTemplate);

// Shift setup routes
router.get('/', getShiftSetups);
router.get('/:id', getShiftSetup);
router.post('/', createShiftSetup);
router.put('/:id', updateShiftSetup);
router.delete('/:id', deleteShiftSetup);
router.post('/:id/copy', copyShiftSetup);

// Upcoming week setup
router.post('/upcoming-week', createUpcomingWeekSetup);

// Employee routes
router.post('/upload', upload.single('file'), uploadSchedule);
router.post('/assign', assignEmployee);
router.get('/:setupId/employees', getUploadedEmployees);
router.get('/:setupId/assigned', getShiftEmployees);

export default router;
