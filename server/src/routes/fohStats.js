import express from 'express';
import { getFOHTaskStats } from '../controllers/fohStats.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', auth, getFOHTaskStats);

export default router;
