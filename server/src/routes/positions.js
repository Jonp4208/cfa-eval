import express from 'express';
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition
} from '../controllers/positions.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Position routes
router.get('/', getPositions);
router.post('/', createPosition);
router.put('/:setupId/:dayIndex/:blockId/:positionId', updatePosition);
router.delete('/:setupId/:dayIndex/:blockId/:positionId', deletePosition);

export default router;
