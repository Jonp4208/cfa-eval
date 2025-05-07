import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences
} from '../controllers/userPreferences.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user preferences
router.get('/', getUserPreferences);

// Update user preferences
router.patch('/', updateUserPreferences);

// Reset user preferences
router.post('/reset', resetUserPreferences);

export default router;
