import cron from 'node-cron';
import TeamSurvey from '../models/TeamSurvey.js';
import User from '../models/User.js';
import { sendSurveyInviteEmail, sendSurveyReminderEmail } from '../utils/email.js';
import logger from '../utils/logger.js';

class SurveyScheduler {
  constructor() {
    this.jobs = new Map();
    this.init();
  }

  init() {
    // Check for surveys to activate every hour
    cron.schedule('0 * * * *', () => {
      this.checkAndActivateSurveys();
    });

    // Check for reminders to send every day at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.checkAndSendReminders();
    });

    // Check for surveys to close every day at midnight
    cron.schedule('0 0 * * *', () => {
      this.checkAndCloseSurveys();
    });

    // Create next recurring surveys every day at 1 AM
    cron.schedule('0 1 * * *', () => {
      this.createRecurringSurveys();
    });

    logger.info('Survey scheduler initialized');
  }

  async checkAndActivateSurveys() {
    try {
      const surveysToActivate = await TeamSurvey.findSurveysForAutomation();

      for (const survey of surveysToActivate) {
        await this.activateSurvey(survey);
      }

      if (surveysToActivate.length > 0) {
        logger.info(`Activated ${surveysToActivate.length} scheduled surveys`);
      }
    } catch (error) {
      logger.error('Error checking surveys for activation:', error);
    }
  }

  async activateSurvey(survey) {
    try {
      // Generate tokens for eligible users
      const eligibleUsers = await this.getEligibleUsers(survey);

      for (const user of eligibleUsers) {
        survey.generateAnonymousToken(user._id);
      }

      // Update survey status
      survey.status = 'active';
      survey.analytics.totalInvited = eligibleUsers.length;
      await survey.save();

      // Send invitation emails
      if (survey.settings.sendReminders) {
        await this.sendInvitationEmails(survey, eligibleUsers);
      }

      logger.info(`Activated survey: ${survey.title} for ${eligibleUsers.length} users`);
    } catch (error) {
      logger.error(`Error activating survey ${survey._id}:`, error);
    }
  }

  async getEligibleUsers(survey) {
    try {
      const query = {
        store: survey.store,
        isActive: true
      };

      // Apply targeting filters
      if (!survey.targetAudience.includeAll) {
        if (survey.targetAudience.departments.length > 0) {
          query.department = { $in: survey.targetAudience.departments };
        }

        if (survey.targetAudience.positions.length > 0) {
          query.position = { $in: survey.targetAudience.positions };
        }

        if (survey.targetAudience.employmentTypes.length > 0) {
          query.employmentType = { $in: survey.targetAudience.employmentTypes };
        }
      }

      const users = await User.find(query);

      // Filter by experience level
      const eligibleUsers = users.filter(user => {
        if (survey.targetAudience.experienceLevels.length === 0) return true;

        const experienceLevel = this.calculateExperienceLevel(user.hireDate);
        return survey.targetAudience.experienceLevels.includes(experienceLevel);
      });

      // Exclude recent responders if configured
      if (survey.targetAudience.excludeRecentResponders) {
        const recentCutoff = new Date();
        recentCutoff.setDate(recentCutoff.getDate() - survey.targetAudience.excludeRecentDays);

        // This would require checking recent survey responses
        // Implementation depends on your response tracking needs
      }

      return eligibleUsers;
    } catch (error) {
      logger.error('Error getting eligible users:', error);
      return [];
    }
  }

  calculateExperienceLevel(hireDate) {
    if (!hireDate) return '0-6 months';

    const monthsSinceHire = Math.floor((new Date() - new Date(hireDate)) / (1000 * 60 * 60 * 24 * 30));

    if (monthsSinceHire >= 24) return '2+ years';
    if (monthsSinceHire >= 12) return '1-2 years';
    if (monthsSinceHire >= 6) return '6-12 months';
    return '0-6 months';
  }

  async sendInvitationEmails(survey, users) {
    try {
      let emailsSent = 0;

      for (const user of users) {
        const token = survey.anonymousTokens.find(t => t.userId.toString() === user._id.toString());
        if (token) {
          const surveyUrl = `${process.env.CLIENT_URL}/survey/${token.token}`;

          await sendSurveyInviteEmail(user.email, {
            userName: user.name,
            surveyTitle: survey.title,
            surveyUrl: surveyUrl,
            expiryDate: survey.schedule.endDate,
            customMessage: survey.notifications.emailTemplate.inviteMessage
          });

          emailsSent++;
        }
      }

      // Update survey notification status
      survey.notifications.invitesSent = true;
      survey.notifications.invitesSentAt = new Date();
      survey.notifications.emailStats.invitesSent = emailsSent;
      await survey.save();

      logger.info(`Sent ${emailsSent} invitation emails for survey: ${survey.title}`);
    } catch (error) {
      logger.error('Error sending invitation emails:', error);
    }
  }

  async checkAndSendReminders() {
    try {
      const now = new Date();
      const activeSurveys = await TeamSurvey.find({
        status: 'active',
        'settings.sendReminders': true,
        'schedule.endDate': { $gt: now }
      });

      for (const survey of activeSurveys) {
        await this.checkSurveyReminders(survey);
      }
    } catch (error) {
      logger.error('Error checking survey reminders:', error);
    }
  }

  async checkSurveyReminders(survey) {
    try {
      const now = new Date();
      const endDate = new Date(survey.schedule.endDate);
      const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      // Check if we should send a reminder
      const shouldSendReminder = survey.settings.reminderDays.includes(daysUntilEnd);
      const alreadySentToday = survey.notifications.remindersSent.some(date =>
        new Date(date).toDateString() === now.toDateString()
      );

      if (shouldSendReminder && !alreadySentToday) {
        await this.sendReminderEmails(survey, daysUntilEnd);
      }
    } catch (error) {
      logger.error(`Error checking reminders for survey ${survey._id}:`, error);
    }
  }

  async sendReminderEmails(survey, daysLeft) {
    try {
      // Get users who haven't responded yet
      const unusedTokens = survey.anonymousTokens.filter(token => !token.used);
      const userIds = unusedTokens.map(token => token.userId);
      const users = await User.find({ _id: { $in: userIds } });

      let remindersSent = 0;

      for (const user of users) {
        const token = unusedTokens.find(t => t.userId.toString() === user._id.toString());
        if (token) {
          const surveyUrl = `${process.env.CLIENT_URL}/survey/${token.token}`;

          await sendSurveyReminderEmail(user.email, {
            userName: user.name,
            surveyTitle: survey.title,
            surveyUrl: surveyUrl,
            daysLeft: daysLeft,
            customMessage: survey.notifications.emailTemplate.reminderMessage
          });

          remindersSent++;
        }
      }

      // Update reminder tracking
      survey.notifications.remindersSent.push(new Date());
      survey.notifications.emailStats.remindersSent += remindersSent;
      await survey.save();

      logger.info(`Sent ${remindersSent} reminder emails for survey: ${survey.title} (${daysLeft} days left)`);
    } catch (error) {
      logger.error('Error sending reminder emails:', error);
    }
  }

  async checkAndCloseSurveys() {
    try {
      const now = new Date();
      const surveysToClose = await TeamSurvey.find({
        status: 'active',
        'schedule.endDate': { $lte: now },
        'schedule.recurringSettings.autoClose': true
      });

      for (const survey of surveysToClose) {
        survey.status = 'closed';
        survey.notifications.surveyCompleted = true;
        await survey.save();

        logger.info(`Auto-closed survey: ${survey.title}`);
      }

      if (surveysToClose.length > 0) {
        logger.info(`Auto-closed ${surveysToClose.length} surveys`);
      }
    } catch (error) {
      logger.error('Error auto-closing surveys:', error);
    }
  }

  async createRecurringSurveys() {
    try {
      const recurringTemplates = await TeamSurvey.find({
        'schedule.isRecurring': true,
        status: 'closed'
      });

      let surveysCreated = 0;

      for (const template of recurringTemplates) {
        const nextSurvey = template.createNextRecurringSurvey();
        if (nextSurvey) {
          await nextSurvey.save();
          surveysCreated++;

          logger.info(`Created next recurring survey: ${nextSurvey.title} scheduled for ${nextSurvey.schedule.startDate}`);
        }
      }

      if (surveysCreated > 0) {
        logger.info(`Created ${surveysCreated} recurring surveys`);
      }
    } catch (error) {
      logger.error('Error creating recurring surveys:', error);
    }
  }

  // Manual methods for immediate actions
  async activateSurveyNow(surveyId) {
    try {
      const survey = await TeamSurvey.findById(surveyId);
      if (survey) {
        await this.activateSurvey(survey);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error manually activating survey ${surveyId}:`, error);
      return false;
    }
  }

  async sendRemindersNow(surveyId) {
    try {
      const survey = await TeamSurvey.findById(surveyId);
      if (survey) {
        await this.sendReminderEmails(survey, 'manual');
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error manually sending reminders for survey ${surveyId}:`, error);
      return false;
    }
  }
}

export default new SurveyScheduler();
