import express from 'express';
import authRoutes from './auth.js';
import storesRoutes from './stores.js';
import templateRoutes from './templates.js';
import evaluationRoutes from './evaluations.js';
import dashboardRoutes from './dashboard.js';
import settingsRoutes from './settings.js';
import usersRoutes from './users.js';
import disciplinaryRoutes from './disciplinary.js';

import analyticsRoutes from './analytics.js';
import gradingScalesRouter from './gradingScales.js';
import notificationsRouter from './notifications.js';
import kitchenRoutes from './kitchen.js';
import leadershipRoutes from './leadership.js';
import fohRoutes from './foh.js';
import subscriptionsRoutes from './subscriptions.js';
import shiftsRoutes from './shifts.js';
import shiftSetupsRoutes from './shiftSetups.js';
import positionsRoutes from './positions.js';
import timeBlocksRoutes from './timeBlocks.js';
import defaultPositionsRoutes from './defaultPositions.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/stores', storesRoutes);
router.use('/templates', templateRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes);
router.use('/disciplinary', disciplinaryRoutes);

router.use('/analytics', analyticsRoutes);
router.use('/grading-scales', gradingScalesRouter);
router.use('/notifications', notificationsRouter);
router.use('/kitchen', kitchenRoutes);
router.use('/leadership', leadershipRoutes);
router.use('/foh', fohRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/shifts', shiftsRoutes);
router.use('/shift-setups', shiftSetupsRoutes);
router.use('/positions', positionsRoutes);
router.use('/time-blocks', timeBlocksRoutes);
router.use('/default-positions', defaultPositionsRoutes);

export default router;