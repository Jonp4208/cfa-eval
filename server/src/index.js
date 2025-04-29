import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from "@sentry/node";
import { initCronJobs } from './services/cronService.js';
import { verifyEmailConfig } from './utils/email.js';
import { connectDB } from './config/db.js';
import { testS3Config } from './config/s3.js';
import app from './app.js';
import logger from './utils/logger.js';

dotenv.config();

// Initialize Sentry with basic configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

const port = process.env.PORT || 5000;

// Verify email configuration on startup
const emailConfigValid = await verifyEmailConfig();
if (!emailConfigValid) {
  logger.warn('Email configuration is invalid. Email notifications will not work.');
}

// Verify S3 configuration on startup
const s3ConfigValid = await testS3Config();
if (!s3ConfigValid) {
  logger.warn('AWS S3 configuration is invalid. File uploads will not work.');
}

// Connect to MongoDB
await connectDB();

// Initialize cron jobs
initCronJobs();

// Basic Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// All controllers should live here
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  logger.error('Unhandled error:', err);
  res.statusCode = 500;
  res.json({
    error: 'Internal server error',
    errorId: res.sentry
  });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});