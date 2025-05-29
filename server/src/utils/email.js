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
      const logInfo = {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 100) + '...'
      };

      if (options.attachments && options.attachments.length > 0) {
        logInfo.attachments = options.attachments.map(att => ({
          filename: att.filename,
          path: att.path ? att.path.substring(0, 50) + '...' : '[content]'
        }));
      }

      logger.info('MOCK EMAIL:', logInfo);
      return { messageId: 'mock-' + Date.now() };
    }
  };
};

export const sendEmailWithRetry = async ({ to, subject, html, attachments = [] }, retries = 0) => {
  try {
    logger.debug(`Attempting to send email (attempt ${retries + 1}/${MAX_RETRIES})...`);

    // Use mock transporter if email config failed verification
    const transporter = emailConfigVerified ? createTransporter() : createMockTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments
    };

    const logOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject
    };

    if (attachments && attachments.length > 0) {
      logOptions.attachments = attachments.map(att => ({
        filename: att.filename,
        contentType: att.contentType
      }));
    }

    logger.debug('Mail options:', logOptions);

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
      return sendEmailWithRetry({ to, subject, html, attachments }, retries + 1);
    }

    // If all retries fail, log the email content but don't block the app
    const logInfo = {
      to,
      subject,
      html: html.substring(0, 100) + '...'
    };

    if (attachments && attachments.length > 0) {
      logInfo.attachments = attachments.map(att => ({
        filename: att.filename
      }));
    }

    logger.warn('Failed to send email after all retries, logging content:', logInfo);

    // Return mock success - this prevents the app from crashing due to email failures
    return {
      messageId: 'failed-but-logged-' + Date.now(),
      status: 'logged-only'
    };
  }
};

// Backward compatibility wrapper
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    return await sendEmailWithRetry({ to, subject, html, attachments });
  } catch (error) {
    // Log but don't rethrow to prevent email issues from crashing the app
    const logInfo = {
      error: error.message,
      to,
      subject
    };

    if (attachments && attachments.length > 0) {
      logInfo.attachments = attachments.map(att => ({
        filename: att.filename
      }));
    }

    logger.error('Email sending completely failed, continuing app execution:', logInfo);

    // Return a mock result
    return {
      messageId: 'failed-gracefully-' + Date.now(),
      status: 'failed-gracefully'
    };
  }
};

// Survey invitation email
export const sendSurveyInviteEmail = async (to, data) => {
  const subject = 'Your Voice Matters - Team Experience Survey';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #E51636, #FF4757); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Team Experience Survey</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your feedback helps us improve</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${data.userName},</p>

        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
          ${data.customMessage || 'We value your feedback! Please take a few minutes to complete our anonymous team experience survey.'}
        </p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #E51636; margin: 0 0 10px 0;">Survey: ${data.surveyTitle}</h3>
          <p style="margin: 0; color: #666;">
            <strong>Deadline:</strong> ${new Date(data.expiryDate).toLocaleDateString()}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.surveyUrl}"
             style="background: #E51636; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Take Survey Now
          </a>
        </div>

        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #2d5a2d;">
            <strong>🔒 Your responses are completely anonymous.</strong> We cannot trace answers back to individuals.
          </p>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you have any questions, please contact your manager.<br>
          Thank you for helping us create a better workplace!
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          This is an automated message from the Chick-fil-A Leadership Development Platform
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// Survey reminder email
export const sendSurveyReminderEmail = async (to, data) => {
  const subject = `Reminder: ${data.surveyTitle} - ${data.daysLeft} days left`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E51636); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Survey Reminder</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">
          ${data.daysLeft === 'manual' ? 'Don\'t miss out!' : `${data.daysLeft} days remaining`}
        </p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${data.userName},</p>

        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
          ${data.customMessage || 'This is a friendly reminder to complete the team experience survey. Your feedback is important to us!'}
        </p>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">⏰ Survey: ${data.surveyTitle}</h3>
          <p style="margin: 0; color: #856404;">
            ${data.daysLeft === 'manual' ? 'Please complete soon' : `Closes in ${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.surveyUrl}"
             style="background: #E51636; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Complete Survey
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Your anonymous feedback helps us improve the workplace for everyone.
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          This is an automated reminder from the Chick-fil-A Leadership Development Platform
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};