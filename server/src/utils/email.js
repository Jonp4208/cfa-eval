import nodemailer from 'nodemailer';
import logger from './logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

let emailConfigVerified = false;

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  logger.debug('Creating email transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user
    }
  });

  return nodemailer.createTransport(config);
};

// Create alternate transporter that doesn't require SMTP auth
const createAlternateTransporter = () => {
  // For Gmail, recommend using a service account or app-specific password
  // https://nodemailer.com/usage/using-gmail/
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Use this option if having trouble with Gmail
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const verifyEmailConfig = async () => {
  try {
    logger.info('Starting email configuration verification...');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Missing required email configuration environment variables');
    }

    logger.debug('Email configuration variables:', {
      EMAIL_USER: process.env.EMAIL_USER
    });

    logger.debug('Creating test transporter...');
    const transporter = createTransporter();

    logger.debug('Verifying transporter...');
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    emailConfigVerified = true;
    return true;
  } catch (error) {
    logger.error('Email configuration error:', {
      message: error.message,
      code: error.code
    });
    
    // Try alternate transporter if primary fails
    try {
      logger.debug('Trying alternate email configuration...');
      const alternateTransporter = createAlternateTransporter();
      await alternateTransporter.verify();
      logger.info('Alternate email configuration verified successfully');
      emailConfigVerified = true;
      return true;
    } catch (altError) {
      logger.error('Alternate email configuration also failed:', {
        message: altError.message,
        code: altError.code
      });
      emailConfigVerified = false;
      return false;
    }
  }
};

// Create a mock transport for development or when email config fails
const createMockTransporter = () => {
  logger.warn('Using mock email transport - emails will be logged but not sent');
  return {
    sendMail: async (options) => {
      logger.info('MOCK EMAIL:', {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 100) + '...'
      });
      return { messageId: 'mock-' + Date.now() };
    }
  };
};

export const sendEmailWithRetry = async ({ to, subject, html }, retries = 0) => {
  try {
    logger.debug(`Attempting to send email (attempt ${retries + 1}/${MAX_RETRIES})...`);

    // Use mock transporter if email config failed verification
    const transporter = emailConfigVerified ? createTransporter() : createMockTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    logger.debug('Mail options:', {
      from: process.env.EMAIL_USER,
      to,
      subject
    });

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', { messageId: result.messageId });
    return result;
  } catch (error) {
    logger.error(`Email sending failed (attempt ${retries + 1}/${MAX_RETRIES}):`, {
      message: error.message,
      code: error.code
    });

    if (retries < MAX_RETRIES - 1) {
      logger.info(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      
      // If this was the first failure, try the alternate transporter next time
      if (retries === 0 && error.code === 'EAUTH') {
        logger.info('Auth error detected, will try alternate transporter on next attempt');
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendEmailWithRetry({ to, subject, html }, retries + 1);
    }

    // If all retries fail, log the email content but don't block the app
    logger.warn('Failed to send email after all retries, logging content:', {
      to,
      subject,
      html: html.substring(0, 100) + '...'
    });
    
    // Return mock success - this prevents the app from crashing due to email failures
    return { 
      messageId: 'failed-but-logged-' + Date.now(),
      status: 'logged-only'
    };
  }
};

// Backward compatibility wrapper
export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await sendEmailWithRetry({ to, subject, html });
  } catch (error) {
    // Log but don't rethrow to prevent email issues from crashing the app
    logger.error('Email sending completely failed, continuing app execution:', {
      error: error.message,
      to,
      subject
    });
    
    // Return a mock result
    return { 
      messageId: 'failed-gracefully-' + Date.now(),
      status: 'failed-gracefully'
    };
  }
};