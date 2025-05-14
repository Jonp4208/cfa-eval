import express from 'express';
import { auth } from '../middleware/auth.js';
import { switchUserStore } from '../controllers/userStore.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Switch store
router.post('/switch', switchUserStore);

export default router;
