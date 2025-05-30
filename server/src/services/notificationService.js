import config from '../config/index.js';
import User from '../models/User.js';
import TrainingProgress from '../models/TrainingProgress.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/email.js';
import mongoose from 'mongoose';

// Email templates
const emailTemplates = {
  trainingAssigned: (employee, plan, startDate) => {
    // Calculate total tasks across all days
    const totalTasks = plan.days?.reduce((total, day) => total + (day.tasks?.length || 0), 0) || 0;

    return {
      subject: 'New Training Plan Assigned',
      html: `
        <h2>New Training Plan Assigned</h2>
        <p>Hello ${employee.name},</p>
        <p>You have been assigned a new training plan:</p>
        <ul>
          <li><strong>Plan:</strong> ${plan.name}</li>
          <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
          <li><strong>Total Tasks:</strong> ${totalTasks}</li>
        </ul>
        <p>Please log in to the training portal to begin your training:</p>
        <p><a href="https://cfa-eval-app.vercel.app" style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Access Training Portal</a></p>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p>https://cfa-eval-app.vercel.app</p>
        <p>Best regards,<br>Training Team</p>
      `,
    }
  },

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
            <strong>${update.trainee.name}:</strong>
            ${update.type === 'module' 
              ? `Completed module "${update.module.name}"`
              : `Completed training plan "${update.trainingPlan.name}"`}
          </li>
        `).join('')}
      </ul>
      <p>View detailed progress in the training portal.</p>
      <p>Best regards,<br>Training Team</p>
    `,
  }),

  equipmentBroken: (equipment, updatedBy, store, issueDetails) => ({
    subject: `ALERT: Equipment Marked as Broken - ${equipment.name}`,
    html: `
      <h2>Equipment Marked as Broken</h2>
      <p>An equipment item has been marked as broken:</p>
      <ul>
        <li><strong>Equipment:</strong> ${equipment.name}</li>
        <li><strong>Category:</strong> ${equipment.category}</li>
        <li><strong>Store:</strong> ${store.name}</li>
        <li><strong>Reported by:</strong> ${updatedBy.name}</li>
        <li><strong>Reported on:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p><strong>Issue Details:</strong></p>
      <p>${issueDetails || 'No details provided'}</p>
      <p>Please review this issue as soon as possible.</p>
      <p>You can view more details and track the status in the system:</p>
      <p><a href="https://cfa-eval-app.vercel.app/kitchen/equipment" style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">View Equipment Status</a></p>
    `,
  }),
};

export class NotificationService {
  static async notifyTrainingAssigned(employee, plan, startDate) {
    try {
      // Send email notification
      const template = emailTemplates.trainingAssigned(employee, plan, startDate);
      await sendEmail({
        to: employee.email,
        subject: template.subject,
        html: template.html
      });

      // Create in-app notification
      const notification = new Notification({
        userId: employee._id,
        storeId: employee.store,
        type: 'TRAINING_ASSIGNED',
        status: 'UNREAD',
        title: 'New Training Plan Assigned',
        message: `You have been assigned to the training plan: ${plan.name}`,
        metadata: {
          trainingPlanId: plan._id,
          startDate: startDate
        },
        employee: {
          name: employee.name,
          position: employee.position || 'Team Member',
          department: employee.department || 'Uncategorized'
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error in notifyTrainingAssigned:', error);
      throw error;
    }
  }

  static async notifyModuleCompleted(employee, module) {
    const template = emailTemplates.moduleCompleted(employee, module);
    await sendEmail({
      to: employee.email,
      subject: template.subject,
      html: template.html
    });

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
      await sendEmail({
        to: config.email.managerEmail,
        subject: managerTemplate.subject,
        html: managerTemplate.html
      });
    }
  }

  static async notifyTrainingCompleted(employee, plan) {
    const template = emailTemplates.trainingCompleted(employee, plan);
    await sendEmail({
      to: employee.email,
      subject: template.subject,
      html: template.html
    });

    // Notify manager
    const managerTemplate = emailTemplates.progressUpdate(
      { name: 'Manager' },
      [{
        employee,
        type: 'plan',
        plan,
      }]
    );
    await sendEmail({
      to: config.email.managerEmail,
      subject: managerTemplate.subject,
      html: managerTemplate.html
    });
  }

  static async sendUpcomingTrainingReminders() {
    try {
      // Get all employees with upcoming training (within next 7 days)
      const employees = await User.find({
        'trainingProgress.startDate': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }).populate('trainingProgress.trainingPlan');

      for (const employee of employees) {
        const daysUntilStart = Math.ceil(
          (new Date(employee.trainingProgress[0].startDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        const template = emailTemplates.upcomingTraining(
          employee,
          employee.trainingProgress[0].trainingPlan,
          daysUntilStart
        );
        await sendEmail({
          to: employee.email,
          subject: template.subject,
          html: template.html
        });
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
        const manager = await User.findById(managerId);
        const template = emailTemplates.progressUpdate(manager, updates);
        await sendEmail({
          to: manager.email,
          subject: template.subject,
          html: template.html
        });
      }
    } catch (error) {
      console.error('Error sending weekly progress report:', error);
      throw error;
    }
  }

  static async notifyEquipmentBroken(equipment, updatedBy, issueDetails) {
    try {
      // Find all directors for the store
      const directors = await User.find({
        store: equipment.store,
        position: 'Director',
        status: 'active'
      });

      if (!directors || directors.length === 0) {
        console.log(`No active directors found for store ID: ${equipment.store}`);
        return;
      }

      // Get store details
      const Store = mongoose.model('Store');
      const store = await Store.findById(equipment.store);

      if (!store) {
        console.error(`Store not found with ID: ${equipment.store}`);
        return;
      }

      const template = emailTemplates.equipmentBroken(equipment, updatedBy, store, issueDetails);

      // Send email notification to each director
      for (const director of directors) {
        // Send email
        await sendEmail({
          to: director.email,
          subject: template.subject,
          html: template.html
        });

        // Create in-app notification
        const notification = new Notification({
          userId: director._id,
          storeId: equipment.store,
          type: 'SYSTEM',
          status: 'UNREAD',
          title: `Equipment Broken: ${equipment.name}`,
          message: `${equipment.name} has been marked as broken by ${updatedBy.name}. Please review.`,
          metadata: {
            equipmentId: equipment.id,
            category: equipment.category,
            reportedBy: updatedBy._id,
            issueDetails: issueDetails
          },
          priority: 'high'
        });

        await notification.save();
      }

      return true;
    } catch (error) {
      console.error('Error in notifyEquipmentBroken:', error);
      return false;
    }
  }
} 