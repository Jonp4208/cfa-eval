import nodemailer from 'nodemailer';
import config from '../config/index.js';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  trainingAssigned: (employee, plan, startDate) => ({
    subject: 'New Training Plan Assigned',
    html: `
      <h2>New Training Plan Assigned</h2>
      <p>Hello ${employee.name},</p>
      <p>You have been assigned a new training plan:</p>
      <ul>
        <li><strong>Plan:</strong> ${plan.name}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
        <li><strong>Duration:</strong> ${plan.modules.length} modules</li>
      </ul>
      <p>Please log in to the training portal to begin your training:</p>
      <p><a href="https://cfa-eval-app.vercel.app" style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Access Training Portal</a></p>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p>https://cfa-eval-app.vercel.app</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),

  moduleCompleted: (employee, module) => ({
    subject: 'Training Module Completed',
    html: `
      <h2>Training Module Completed</h2>
      <p>Hello ${employee.name},</p>
      <p>Congratulations on completing the following training module:</p>
      <ul>
        <li><strong>Module:</strong> ${module.name}</li>
        <li><strong>Plan:</strong> ${employee.trainingPlan.name}</li>
      </ul>
      <p>Keep up the good work!</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),

  trainingCompleted: (employee, plan) => ({
    subject: 'Training Plan Completed',
    html: `
      <h2>Training Plan Completed</h2>
      <p>Hello ${employee.name},</p>
      <p>Congratulations on completing your training plan:</p>
      <ul>
        <li><strong>Plan:</strong> ${plan.name}</li>
      </ul>
      <p>This is a significant achievement! Your dedication to learning and improvement is appreciated.</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),

  upcomingTraining: (employee, plan, daysUntilStart) => ({
    subject: 'Upcoming Training Reminder',
    html: `
      <h2>Upcoming Training Reminder</h2>
      <p>Hello ${employee.name},</p>
      <p>This is a reminder about your upcoming training:</p>
      <ul>
        <li><strong>Plan:</strong> ${plan.name}</li>
        <li><strong>Starts In:</strong> ${daysUntilStart} days</li>
        <li><strong>Start Date:</strong> ${new Date(plan.startDate).toLocaleDateString()}</li>
      </ul>
      <p>Please ensure you are prepared to begin your training on the specified start date.</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),

  progressUpdate: (manager, updates) => ({
    subject: 'Training Progress Update',
    html: `
      <h2>Training Progress Update</h2>
      <p>Hello ${manager.name},</p>
      <p>Here's a summary of recent training progress:</p>
      <ul>
        ${updates.map(update => `
          <li>
            <strong>${update.employee.name}:</strong>
            ${update.type === 'module' 
              ? `Completed module "${update.module.name}"`
              : `Completed training plan "${update.plan.name}"`}
          </li>
        `).join('')}
      </ul>
      <p>View detailed progress in the training portal.</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),
};

export class NotificationService {
  static async sendEmail(to, template) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: template.subject,
        html: template.html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async notifyTrainingAssigned(employee, plan, startDate) {
    try {
      console.log('Preparing training assignment notification for:', {
        employeeName: employee.name,
        employeeEmail: employee.email,
        planName: plan.name,
        startDate
      });

      const template = emailTemplates.trainingAssigned(employee, plan, startDate);
      
      console.log('Generated email template:', {
        subject: template.subject,
        to: employee.email,
        from: process.env.EMAIL_USER
      });

      await this.sendEmail(employee.email, template);
      console.log('Training assignment notification sent successfully');
    } catch (error) {
      console.error('Failed to send training assignment notification:', error);
      throw error;
    }
  }

  static async notifyModuleCompleted(employee, module) {
    const template = emailTemplates.moduleCompleted(employee, module);
    await this.sendEmail(employee.email, template);

    // Also notify manager if module completion rate reaches certain thresholds
    const completedModules = employee.moduleProgress.filter(m => m.completed).length;
    const totalModules = employee.moduleProgress.length;
    const completionRate = (completedModules / totalModules) * 100;

    if (completionRate === 50 || completionRate === 75 || completionRate === 100) {
      const managerTemplate = emailTemplates.progressUpdate(
        { name: 'Manager' },
        [{
          employee,
          type: 'module',
          module,
        }]
      );
      // Skip manager notification if no manager email is configured
      if (process.env.MANAGER_EMAIL) {
        await this.sendEmail(process.env.MANAGER_EMAIL, managerTemplate);
      }
    }
  }

  static async notifyTrainingCompleted(employee, plan) {
    const template = emailTemplates.trainingCompleted(employee, plan);
    await this.sendEmail(employee.email, template);

    // Notify manager
    const managerTemplate = emailTemplates.progressUpdate(
      { name: 'Manager' },
      [{
        employee,
        type: 'plan',
        plan,
      }]
    );
    // Skip manager notification if no manager email is configured
    if (process.env.MANAGER_EMAIL) {
      await this.sendEmail(process.env.MANAGER_EMAIL, managerTemplate);
    }
  }

  static async sendUpcomingTrainingReminders() {
    try {
      // Get all employees with upcoming training (within next 7 days)
      const employees = await Employee.find({
        'trainingPlan.startDate': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }).populate('trainingPlan');

      for (const employee of employees) {
        const daysUntilStart = Math.ceil(
          (new Date(employee.trainingPlan.startDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        const template = emailTemplates.upcomingTraining(
          employee,
          employee.trainingPlan,
          daysUntilStart
        );
        await this.sendEmail(employee.email, template);
      }
    } catch (error) {
      console.error('Error sending upcoming training reminders:', error);
      throw error;
    }
  }

  static async sendWeeklyProgressReport(managerId) {
    try {
      // Get all updates from the past week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const updates = await TrainingProgress.find({
        updatedAt: { $gte: oneWeekAgo },
      })
        .populate('employee')
        .populate('module')
        .populate('plan');

      if (updates.length > 0) {
        const manager = await Employee.findById(managerId);
        const template = emailTemplates.progressUpdate(manager, updates);
        await this.sendEmail(manager.email, template);
      }
    } catch (error) {
      console.error('Error sending weekly progress report:', error);
      throw error;
    }
  }
} 