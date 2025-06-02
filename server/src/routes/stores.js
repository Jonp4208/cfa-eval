// server/src/routes/stores.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { getCurrentStore, updateCurrentStore } from '../controllers/stores.js';

const router = express.Router();

// Get current store info
router.get('/current', auth, getCurrentStore);

// Update current store info
router.patch('/current', auth, updateCurrentStore);

export default router;