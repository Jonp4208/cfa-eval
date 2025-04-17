import express from 'express';
import { getTodayCompletions } from '../controllers/fohTaskCompletions.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', auth, getTodayCompletions);

export default router;
