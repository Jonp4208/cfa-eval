import nodemailer from 'nodemailer';
import logger from './logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

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
    return true;
  } catch (error) {
    logger.error('Email configuration error:', {
      message: error.message,
      code: error.code
    });
    return false;
  }
};

export const sendEmailWithRetry = async ({ to, subject, html }, retries = 0) => {
  try {
    logger.debug(`Attempting to send email (attempt ${retries + 1}/${MAX_RETRIES})...`);

    const transporter = createTransporter();
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
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendEmailWithRetry({ to, subject, html }, retries + 1);
    }

    throw new Error(`Failed to send email after ${MAX_RETRIES} attempts: ${error.message}`);
  }
};

// Backward compatibility wrapper
export const sendEmail = async ({ to, subject, html }) => {
  try {
    logger.debug('Preparing to send email:', {
      to,
      subject,
      from: process.env.EMAIL_USER
    });

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', {
      messageId: result.messageId
    });
    return result;
  } catch (error) {
    logger.error('Failed to send email:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw error;
  }
};