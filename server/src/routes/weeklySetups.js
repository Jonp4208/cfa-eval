import express from 'express';
import {
  getWeeklySetups,
  getWeeklySetup,
  createWeeklySetup,
  updateWeeklySetup,
  deleteWeeklySetup
} from '../controllers/weeklySetups.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Weekly setup routes
router.get('/', getWeeklySetups);
router.get('/:id', getWeeklySetup);
router.post('/', createWeeklySetup);
router.put('/:id', updateWeeklySetup);
router.delete('/:id', deleteWeeklySetup);

export default router;
