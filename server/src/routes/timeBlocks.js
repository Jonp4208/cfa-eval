import express from 'express';
import {
  getTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock
} from '../controllers/timeBlocks.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Time block routes
router.get('/', getTimeBlocks);
router.post('/', createTimeBlock);
router.put('/:setupId/:dayIndex/:blockId', updateTimeBlock);
router.delete('/:setupId/:dayIndex/:blockId', deleteTimeBlock);

export default router;
