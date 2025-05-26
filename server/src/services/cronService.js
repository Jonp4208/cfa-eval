import cron from 'node-cron';
import mongoose from 'mongoose';
import { scheduleAllEvaluations } from './evaluationScheduler.js';
import { Evaluation, Notification, User } from '../models/index.js';
import { FOHTaskCompletion } from '../models/FOHTask.js';
import { getNewYorkDateString } from '../utils/timezone-utils.js';
import { sendEmailWithRetry } from '../utils/email.js';
import { handleError, withRetry, ErrorCategory } from '../utils/errorHandler.js';

const sendReminderEmail = async (evaluation, daysUntilDue) => {
  try {
    await withRetry(async () => {
      await sendEmailWithRetry({
        to: evaluation.employee.email,
        subject: `Evaluation Due in ${daysUntilDue} Days`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #E4002B;">Evaluation Reminder</h1>
            <p>Hello ${evaluation.employee.name},</p>
            <p>This is a reminder that your evaluation is due in ${daysUntilDue} days.</p>
            <p><strong>Due Date:</strong> ${new Date(evaluation.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Evaluator:</strong> ${evaluation.evaluator.name}</p>
            <p>Please log in to the LD Growth platform to complete your evaluation.</p>
            <p>Best regards,<br>LD Growth Team</p>
          </div>
        `
      });
    });

    // Log successful email send
    logger.info(`Sent evaluation reminder email to ${evaluation.employee.email} (${daysUntilDue} days until due)`);
  } catch (error) {
    handleError(error, ErrorCategory.SYSTEM, {
      evaluationId: evaluation._id,
      employeeId: evaluation.employee._id,
      function: 'sendReminderEmail'
    });
  }
};

const notifyAdminsOfFailure = async (error, context) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin' });

    // Create notifications for each admin
    const notifications = admins.map(admin => ({
      user: admin._id,
      store: admin.store,
      type: 'system_error',
      priority: 'urgent',
      title: 'Scheduling System Error',
      message: `Error in evaluation scheduling: ${error.message}`,
      metadata: context
    }));

    await Notification.insertMany(notifications);

    // Send emails to admins
    for (const admin of admins) {
      await withRetry(async () => {
        await sendEmailWithRetry({
          to: admin.email,
          subject: 'Evaluation Scheduling System Error',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #E4002B;">System Error Alert</h1>
              <p>An error occurred in the evaluation scheduling system:</p>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><strong>Context:</strong></p>
              <pre>${JSON.stringify(context, null, 2)}</pre>
              <p>Please check the admin dashboard for more details.</p>
            </div>
          `
        });
      });
    }
  } catch (emailError) {
    handleError(emailError, ErrorCategory.SYSTEM, {
      originalError: error.message,
      function: 'notifyAdminsOfFailure'
    });
  }
};

// Schedule evaluations based on user preferences
const scheduleUserEvaluations = async () => {
  try {
    console.log('Running user-based evaluation scheduling...');

    // Get all users with auto-scheduling enabled
    const users = await User.find({
      'schedulingPreferences.autoSchedule': true,
      evaluator: { $exists: true }
    }).populate('evaluator');

    console.log(`Found ${users.length} users with auto-scheduling enabled`);

    const results = {
      scheduled: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    for (const user of users) {
      try {
        const today = new Date();
        const nextEvalDate = user.schedulingPreferences.nextEvaluationDate;

        // Skip if next evaluation date is not yet due
        if (!nextEvalDate || nextEvalDate > today) {
          results.skipped++;
          continue;
        }

        // Create new evaluation
        const evaluation = new Evaluation({
          employee: user._id,
          evaluator: user.evaluator._id,
          scheduledDate: nextEvalDate,
          status: 'pending_self_evaluation',
          store: user.store
        });

        await evaluation.save();

        // Calculate next evaluation date properly based on cycle start preference
        let newNextDate;

        if (user.schedulingPreferences.cycleStart === 'hire_date' && user.startDate) {
          const hireDate = new Date(user.startDate);
          if (!isNaN(hireDate.getTime())) {
            // Extract month and day from hire date
            const hireMonth = hireDate.getMonth(); // 0-indexed (0 = January, 1 = February, etc.)
            const hireDay = hireDate.getDate();

            console.log(`Hire date: ${hireDate.toISOString()}, Month: ${hireMonth + 1}, Day: ${hireDay}`);

            // Use current year with hire month/day
            const currentYear = today.getFullYear();

            // Create a date with current year and hire month/day
            const hireAnniversaryThisYear = new Date(currentYear, hireMonth, hireDay);
            console.log(`Anniversary this year: ${hireAnniversaryThisYear.toISOString()}`);

            // Calculate the next evaluation date based on frequency
            if (user.schedulingPreferences.frequency >= 365) {
              // For annual or longer frequencies, use the hire date anniversary
              if (hireAnniversaryThisYear < today) {
                // If this year's anniversary has passed, use next year
                newNextDate = new Date(currentYear + 1, hireMonth, hireDay);
                console.log(`Using next year's anniversary: ${newNextDate.toISOString()}`);
              } else {
                // Use this year's anniversary
                newNextDate = hireAnniversaryThisYear;
                console.log(`Using this year's anniversary: ${newNextDate.toISOString()}`);
              }
            } else {
              // For frequencies less than a year (e.g., 180 days = 6 months)
              // Start with this year's anniversary
              newNextDate = new Date(hireAnniversaryThisYear);

              // If the anniversary is in the past, add the frequency to it
              // until we get a future date
              while (newNextDate < today) {
                // Add frequency days
                newNextDate.setTime(newNextDate.getTime() + (user.schedulingPreferences.frequency * 24 * 60 * 60 * 1000));
                console.log(`Added ${user.schedulingPreferences.frequency} days, new date: ${newNextDate.toISOString()}`);
              }
            }
          } else {
            // Invalid hire date, fallback to today
            newNextDate = new Date(today);
            newNextDate.setTime(newNextDate.getTime() + (user.schedulingPreferences.frequency * 24 * 60 * 60 * 1000));
          }
        } else {
          // Use today as the base for calculation
          newNextDate = new Date(today);
          // Add frequency days
          newNextDate.setTime(newNextDate.getTime() + (user.schedulingPreferences.frequency * 24 * 60 * 60 * 1000));
        }

        await User.findByIdAndUpdate(user._id, {
          $set: {
            'schedulingPreferences.nextEvaluationDate': newNextDate,
            'schedulingPreferences.lastCalculatedAt': today
          }
        });

        results.scheduled++;
        results.details.push({
          userId: user._id,
          name: user.name,
          status: 'scheduled',
          nextDate: newNextDate
        });

      } catch (error) {
        console.error(`Error scheduling evaluation for user ${user._id}:`, error);
        results.errors++;
        results.details.push({
          userId: user._id,
          name: user.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('User-based scheduling complete:', results);
    return results;
  } catch (error) {
    console.error('Error in scheduleUserEvaluations:', error);
    throw error;
  }
};

export const initCronJobs = () => {
  // Run evaluation scheduling at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running automatic evaluation scheduling...');
    try {
      const result = await scheduleAllEvaluations();
      logger.info('Automatic evaluation scheduling completed', result);

      // If there were errors, notify admins
      if (result.totalErrors > 0) {
        await notifyAdminsOfFailure(
          new Error(`Scheduling completed with ${result.totalErrors} errors`),
          {
            totalStores: result.storeResults.length,
            totalSuccess: result.totalSuccess,
            totalErrors: result.totalErrors,
            failedStores: result.storeResults.filter(r => r.error)
          }
        );
      }
    } catch (error) {
      console.error('Error in evaluation scheduling cron job:', error);
      await notifyAdminsOfFailure(error, {
        cronJob: 'scheduleAllEvaluations',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Run reminders once per day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Reminder] Starting daily evaluation reminders check...');
    try {
      const upcomingEvaluations = await withRetry(async () => {
        return await Evaluation.find({
          status: { $ne: 'completed' },
          scheduledDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }).populate('employee evaluator');
      });

      console.log(`[Reminder] Found ${upcomingEvaluations.length} upcoming evaluations`);

      for (const evaluation of upcomingEvaluations) {
        try {
          const daysUntilDue = Math.ceil(
            (new Date(evaluation.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24)
          );

          // Only send reminders at specific day intervals
          if (![1, 2, 3, 5, 7].includes(daysUntilDue)) {
            continue;
          }

          // Determine notification priority based on days until due
          let priority = 'low';
          if (daysUntilDue <= 1) {
            priority = 'urgent';
          } else if (daysUntilDue <= 3) {
            priority = 'high';
          } else if (daysUntilDue <= 5) {
            priority = 'medium';
          }

          // Check if we already sent a notification in the last 20 hours
          // Using 20 hours instead of 24 to account for daylight savings and timezone changes
          const existingNotification = await withRetry(async () => {
            return await Notification.findOne({
              user: evaluation.employee._id,
              relatedId: evaluation._id,
              type: 'reminder',
              createdAt: { $gte: new Date(Date.now() - 20 * 60 * 60 * 1000) }
            });
          });

          if (!existingNotification) {
            console.log(`[Reminder] Creating notification for evaluation ${evaluation._id} (${daysUntilDue} days until due)`);

            // Create notification
            await withRetry(async () => {
              await Notification.create({
                user: evaluation.employee._id,
                store: evaluation.store,
                type: 'reminder',
                priority,
                title: 'Evaluation Due Soon',
                message: `Your evaluation is due in ${daysUntilDue} days`,
                relatedId: evaluation._id,
                relatedModel: 'Evaluation'
              });
            });

            // Send email for evaluations due within 3 days
            if (daysUntilDue <= 3) {
              await sendReminderEmail(evaluation, daysUntilDue);
            }
          } else {
            console.log(`[Reminder] Skipping notification for evaluation ${evaluation._id} - already sent within 20 hours`);
          }
        } catch (error) {
          handleError(error, ErrorCategory.SYSTEM, {
            evaluationId: evaluation._id,
            function: 'reminderCronJob'
          });
        }
      }
      console.log('[Reminder] Completed daily evaluation reminders check');
    } catch (error) {
      console.error('[Reminder] Error in reminder cron job:', error);
      await notifyAdminsOfFailure(error, {
        cronJob: 'evaluationReminders',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Run user-based evaluation scheduling daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await scheduleUserEvaluations();
    } catch (error) {
      console.error('Error running user-based evaluation scheduling:', error);
    }
  });

  // Reset FOH task completions at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running FOH task completions reset...');

      // Get today's date in New York timezone
      const today = new Date();
      const todayStr = getNewYorkDateString(today);

      // Get all stores
      const stores = await mongoose.connection.db.collection('stores').find({}).toArray();
      console.log(`Found ${stores.length} stores to process`);

      // For each store, check if there are any completions with today's date
      // that might have been created before midnight (incorrect date)
      for (const store of stores) {
        // Find all completions for this store
        const allCompletions = await FOHTaskCompletion.find({
          store: store._id
        });

        // Filter to find completions where the date in NY timezone doesn't match the createdAt date in NY timezone
        // This indicates a potential issue with the date
        const completions = allCompletions.filter(comp => {
          const dateInNY = getNewYorkDateString(comp.date);
          const createdAtInNY = getNewYorkDateString(comp.createdAt);
          return dateInNY !== createdAtInNY;
        });

        if (completions.length > 0) {
          console.log(`Found ${completions.length} FOH task completions with potential date issues for store ${store._id}`);

          // Delete these problematic completions
          const deleteResult = await FOHTaskCompletion.deleteMany({
            _id: { $in: completions.map(c => c._id) }
          });

          console.log(`Deleted ${deleteResult.deletedCount} problematic FOH task completions`);
        }
      }

      console.log('FOH task completions reset completed');
    } catch (error) {
      console.error('Error resetting FOH task completions:', error);
    }
  });

  console.log('Cron jobs initialized');
};