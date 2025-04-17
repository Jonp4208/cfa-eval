import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getDefaultPositions,
  getDefaultPositionsByDayAndShift,
  createOrUpdateDefaultPositions,
  deleteDefaultPositions
} from '../controllers/defaultPositions.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all default positions for a store
router.get('/', getDefaultPositions);

// Get default positions for a specific day and shift
router.get('/:day/:shift', getDefaultPositionsByDayAndShift);

// Create or update default positions
router.post('/', createOrUpdateDefaultPositions);

// Delete default positions
router.delete('/:id', deleteDefaultPositions);

export default router;
