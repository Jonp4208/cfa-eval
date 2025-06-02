import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { testS3Config } from './config/s3.js';

// Routes
import authRoutes from './routes/auth.js';
import storesRoutes from './routes/stores.js';
import templateRoutes from './routes/templates.js';
import evaluationRoutes from './routes/evaluations.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import disciplinaryRoutes from './routes/disciplinary.js';
import documentationRoutes from './routes/documentation.js';
import goalsRoutes from './routes/goals.js';
import analyticsRoutes from './routes/analytics.js';
import gradingScalesRouter from './routes/gradingScales.js';
import notificationsRouter from './routes/notifications.js';
import tasksRouter from './routes/tasks.js';
import kitchenRouter from './routes/kitchen.js';
import trainingRouter from './routes/training.js';
import fohRouter from './routes/foh.js';
import fohStatsRouter from './routes/fohStats.js';
import fohTaskCompletionsRouter from './routes/fohTaskCompletions.js';
import kitchenItemRouter from './routes/kitchenItem.js';
import subscriptionsRouter from './routes/subscriptions.js';
import leadershipRouter from './routes/leadership.js';
import shiftsRouter from './routes/shifts.js';
import shiftSetupsRouter from './routes/shiftSetups.js';
import positionsRouter from './routes/positions.js';
import timeBlocksRouter from './routes/timeBlocks.js';
import defaultPositionsRouter from './routes/defaultPositions.js';
import setupSheetRouter from './routes/setupSheetRoutes.js';
import { setupSheetTemplatesRouter } from './routes/setupSheetTemplates.js';
import weeklySetupsRouter from './routes/weeklySetups.js';
import leadsRouter from './routes/leads.js';
import breaksRouter from './routes/breaks.js';
import userPreferencesRouter from './routes/userPreferences.js';
import invoicesRouter from './routes/invoices.js';
import adminRouter from './routes/admin.js';
import userStoreRouter from './routes/userStore.js';
import teamSurveysRouter from './routes/teamSurveys.js';
import teamMemberDevelopmentRouter from './routes/teamMemberDevelopment.js';

// Services
import { initCronJobs } from './services/cronService.js';

// Error Handler
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  logger.info(`Creating uploads directory at ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Initialize cron jobs
initCronJobs();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Debug middleware for route matching - only log at debug level
app.use((req, res, next) => {
  // Skip logging for static assets, common browser requests, and frequent API calls
  if (!req.url.includes('.') &&
      !req.url.includes('favicon.ico') &&
      !req.url.includes('/api/dashboard') &&
      !req.url.includes('/api/auth/profile')) {
    logger.request(req);
  }
  next();
});

// Custom error handler for payload size errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413) {
    logger.error('Request entity too large:', err);

    // Check if this is a weekly setup update request
    if (req.originalUrl.includes('/api/weekly-setups/')) {
      logger.error('Large payload detected for weekly setup update. Please use the optimized payload format.');
      return res.status(413).json({
        error: 'Payload too large',
        message: 'The weekly setup data you are trying to send is too large. The system has been updated to handle this more efficiently. Please refresh the page and try again.',
        code: 'WEEKLY_SETUP_PAYLOAD_TOO_LARGE'
      });
    }

    return res.status(413).json({
      error: 'Payload too large',
      message: 'The data you are trying to send is too large. Please reduce the size of your request.',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('Invalid JSON:', err);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request contains invalid JSON.',
      code: 'INVALID_JSON'
    });
  }

  next(err);
});

// Create a router for API routes
const apiRouter = express.Router();

// Mount all API routes on the API router
apiRouter.use('/auth', authRoutes);
apiRouter.use('/stores', storesRoutes);
apiRouter.use('/templates', templateRoutes);
apiRouter.use('/evaluations', evaluationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/disciplinary', disciplinaryRoutes);
apiRouter.use('/documentation', documentationRoutes);
apiRouter.use('/goals', goalsRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/grading-scales', gradingScalesRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/tasks', tasksRouter);
apiRouter.use('/kitchen', kitchenRouter);
apiRouter.use('/training', trainingRouter);
apiRouter.use('/foh', fohRouter);
apiRouter.use('/foh-stats', fohStatsRouter);
apiRouter.use('/foh-task-completions', fohTaskCompletionsRouter);
apiRouter.use('/kitchen-item', kitchenItemRouter);
apiRouter.use('/subscriptions', subscriptionsRouter);
apiRouter.use('/leadership', leadershipRouter);
apiRouter.use('/shifts', shiftsRouter);
apiRouter.use('/shift-setups', shiftSetupsRouter);
apiRouter.use('/positions', positionsRouter);
apiRouter.use('/time-blocks', timeBlocksRouter);
apiRouter.use('/default-positions', defaultPositionsRouter);
apiRouter.use('/setup-sheet', setupSheetRouter);
apiRouter.use('/setup-sheet-templates', setupSheetTemplatesRouter);
apiRouter.use('/weekly-setups', weeklySetupsRouter);
apiRouter.use('/leads', leadsRouter);
apiRouter.use('/breaks', breaksRouter);
apiRouter.use('/user-preferences', userPreferencesRouter);
apiRouter.use('/invoices', invoicesRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/user-store', userStoreRouter);
apiRouter.use('/team-surveys', teamSurveysRouter);
apiRouter.use('/team-member-development', teamMemberDevelopmentRouter);

// PDF Generation using html-pdf-node
apiRouter.post('/generate-pdf', async (req, res) => {
  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Import the PDF generator utility
    const { generatePDF } = await import('./utils/pdfGenerator.js');

    // Generate PDF using the utility
    const pdfBuffer = await generatePDF(html, options);

    // Set proper headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="playbook.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
    logger.info('PDF response sent successfully');

  } catch (error) {
    logger.error('Error in PDF generation endpoint:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      environment: process.env.NODE_ENV,
      chromeExecutable: process.env.GOOGLE_CHROME_BIN || process.env.CHROME_BIN || 'not set'
    });

    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test PDF Generation
apiRouter.get('/test-pdf', async (req, res) => {
  try {
    logger.info('Testing PDF generation capability');

    // Import the PDF generator utility
    const { testPDFGeneration } = await import('./utils/pdfGenerator.js');

    const isWorking = await testPDFGeneration();

    res.json({
      success: isWorking,
      message: isWorking ? 'PDF generation is working' : 'PDF generation failed',
      environment: process.env.NODE_ENV,
      chromeExecutable: process.env.GOOGLE_CHROME_BIN || process.env.CHROME_BIN || 'not set',
      platform: process.platform,
      nodeVersion: process.version
    });

  } catch (error) {
    logger.error('Error testing PDF generation:', error);
    res.status(500).json({
      success: false,
      message: 'PDF generation test failed',
      error: error.message
    });
  }
});

// Test Email Configuration
apiRouter.post('/test-email', async (req, res) => {
  try {
    console.log('Starting test email send...');
    const { sendEmail } = await import('./utils/email.js');

    console.log('Attempting to send test email to:', process.env.EMAIL_USER);
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test Email from LD Growth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #E4002B;">Test Email</h1>
          <p>This is a test email from LD Growth to verify the email configuration.</p>
          <p>If you received this email, it means your email configuration is working correctly!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('Email send result:', result);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Detailed error in test-email endpoint:', {
      error: error,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response
    });

    res.status(500).json({
      message: 'Failed to send test email',
      error: error.message,
      details: error.code || 'No error code available'
    });
  }
});

// API error handling
apiRouter.use(errorHandler);

// Handle 404s for API routes
apiRouter.all('*', (req, res) => {
  logger.info('404 Not Found:', { url: req.url, method: req.method });
  res.status(404).json({ message: 'API endpoint not found' });
});

// Mount the API router at /api
app.use('/api', apiRouter);

// Serve static files from the public directory
app.use('/api', express.static(path.join(__dirname, '../public')));

// Static file serving - AFTER API routes
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test Sentry
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

// Serve React app for any other routes - This should be LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

export default app;