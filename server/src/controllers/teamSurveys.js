import TeamSurvey from '../models/TeamSurvey.js';
import TeamSurveyResponse from '../models/TeamSurveyResponse.js';
import User from '../models/User.js';
import { Notification } from '../models/index.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

// Helper function to create notifications
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      userId: notificationData.recipient,
      storeId: notificationData.store,
      type: notificationData.type.toUpperCase(),
      status: 'UNREAD',
      title: notificationData.title,
      message: notificationData.message,
      metadata: notificationData.metadata || {}
    });

    await notification.save();
    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    return null;
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const storeId = req.user.store._id;

    // Get active surveys count
    const activeSurveys = await TeamSurvey.countDocuments({
      store: storeId,
      status: 'active'
    });

    // Get total responses this quarter
    const quarterStart = new Date();
    quarterStart.setMonth(quarterStart.getMonth() - 3);

    const totalResponses = await TeamSurveyResponse.countDocuments({
      store: storeId,
      status: 'completed',
      createdAt: { $gte: quarterStart }
    });

    // Get average response rate
    const surveys = await TeamSurvey.find({
      store: storeId,
      status: { $in: ['active', 'closed'] }
    }).select('analytics');

    const avgResponseRate = surveys.length > 0
      ? surveys.reduce((sum, s) => sum + (s.analytics.responseRate || 0), 0) / surveys.length
      : 0;

    // Get recent survey activity
    const recentSurveys = await TeamSurvey.find({
      store: storeId
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title status analytics.totalResponses analytics.responseRate updatedAt');

    res.json({
      activeSurveys,
      totalResponses,
      avgResponseRate: Math.round(avgResponseRate),
      recentSurveys
    });
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard statistics' });
  }
};

// Create a new survey
export const createSurvey = async (req, res) => {
  try {
    const { title, description, questions, targetAudience, schedule, settings } = req.body;

    // If no questions provided, use default template
    let surveyQuestions = questions;
    if (!questions || questions.length === 0) {
      const defaultSurvey = TeamSurvey.createDefaultTemplate(req.user.store._id, req.user._id);
      surveyQuestions = defaultSurvey.questions;
    }

    const survey = new TeamSurvey({
      title: title || 'Team Experience Survey',
      description: description || 'Anonymous survey to gather feedback on team member experience',
      store: req.user.store._id,
      createdBy: req.user._id,
      questions: surveyQuestions,
      targetAudience: targetAudience || {
        departments: ['Front of House', 'Back of House', 'Management'],
        positions: [],
        includeAll: true
      },
      schedule: {
        startDate: schedule?.startDate || new Date(),
        endDate: schedule?.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        frequency: schedule?.frequency || 'quarterly'
      },
      settings: settings || {}
    });

    await survey.save();

    logger.info(`Survey created: ${survey._id} by user ${req.user._id}`);

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    logger.error('Error creating survey:', error);
    res.status(500).json({ message: 'Failed to create survey' });
  }
};

// Get all surveys for a store
export const getSurveys = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const storeId = req.user.store._id;

    const filter = { store: storeId };
    if (status) filter.status = status;

    const surveys = await TeamSurvey.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TeamSurvey.countDocuments(filter);

    res.json({
      surveys,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error getting surveys:', error);
    res.status(500).json({ message: 'Failed to get surveys' });
  }
};

// Get a specific survey
export const getSurvey = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    }).populate('createdBy', 'name email');

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    logger.error('Error getting survey:', error);
    res.status(500).json({ message: 'Failed to get survey' });
  }
};

// Update a survey
export const updateSurvey = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Don't allow updates to active surveys except for certain fields
    if (survey.status === 'active') {
      const allowedFields = ['description', 'schedule.endDate', 'settings'];
      const updates = {};

      allowedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (req.body[parent] && req.body[parent][child] !== undefined) {
            if (!updates[parent]) updates[parent] = {};
            updates[parent][child] = req.body[parent][child];
          }
        } else if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      Object.assign(survey, updates);
    } else {
      // Allow full updates for draft surveys
      Object.assign(survey, req.body);
    }

    await survey.save();

    res.json({
      message: 'Survey updated successfully',
      survey
    });
  } catch (error) {
    logger.error('Error updating survey:', error);
    res.status(500).json({ message: 'Failed to update survey' });
  }
};

// Delete a survey
export const deleteSurvey = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Don't allow deletion of active surveys
    if (survey.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete active survey. Close it first.' });
    }

    // Delete associated responses
    await TeamSurveyResponse.deleteMany({ survey: survey._id });

    // Delete the survey
    await TeamSurvey.deleteOne({ _id: survey._id });

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    logger.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Failed to delete survey' });
  }
};

// Activate a survey and generate tokens
export const activateSurvey = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft surveys can be activated' });
    }

    // Generate anonymous tokens for all eligible users
    const filter = { store: req.user.store._id, status: 'active' };

    // Apply target audience filters
    if (!survey.targetAudience.includeAll) {
      if (survey.targetAudience.departments.length > 0) {
        filter.department = { $in: survey.targetAudience.departments };
      }
      if (survey.targetAudience.positions.length > 0) {
        filter.position = { $in: survey.targetAudience.positions };
      }
    }

    const eligibleUsers = await User.find(filter).select('_id name email department position');

    // Generate tokens
    for (const user of eligibleUsers) {
      survey.generateAnonymousToken(user._id);
    }

    // Update survey status and analytics
    survey.status = 'active';
    survey.analytics.totalInvited = eligibleUsers.length;
    survey.analytics.lastCalculated = new Date();

    await survey.save();

    // Send notifications to users
    for (const user of eligibleUsers) {
      const token = survey.anonymousTokens.find(t => t.userId.toString() === user._id.toString())?.token;

      await createNotification({
        recipient: user._id,
        type: 'survey_invitation',
        title: 'Team Experience Survey',
        message: `You've been invited to participate in an anonymous team experience survey: ${survey.title}`,
        metadata: {
          surveyId: survey._id,
          token: token,
          surveyTitle: survey.title
        },
        store: req.user.store._id
      });
    }

    // Mark notifications as sent
    survey.notifications.invitesSent = true;
    await survey.save();

    logger.info(`Survey activated: ${survey._id}, tokens generated for ${eligibleUsers.length} users`);

    res.json({
      message: 'Survey activated successfully',
      survey,
      tokensGenerated: eligibleUsers.length
    });
  } catch (error) {
    logger.error('Error activating survey:', error);
    res.status(500).json({ message: 'Failed to activate survey' });
  }
};

// Close a survey
export const closeSurvey = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.status !== 'active') {
      return res.status(400).json({ message: 'Only active surveys can be closed' });
    }

    survey.status = 'closed';
    survey.notifications.surveyCompleted = true;

    // Update final analytics
    const responseCount = await TeamSurveyResponse.countDocuments({
      survey: survey._id,
      status: 'completed'
    });

    survey.analytics.totalResponses = responseCount;
    survey.analytics.responseRate = survey.analytics.totalInvited > 0
      ? Math.round((responseCount / survey.analytics.totalInvited) * 100)
      : 0;
    survey.analytics.lastCalculated = new Date();

    await survey.save();

    res.json({
      message: 'Survey closed successfully',
      survey
    });
  } catch (error) {
    logger.error('Error closing survey:', error);
    res.status(500).json({ message: 'Failed to close survey' });
  }
};





// Generate anonymous tokens (for manual token generation)
export const generateAnonymousTokens = async (req, res) => {
  try {
    const survey = await TeamSurvey.findOne({
      _id: req.params.surveyId,
      store: req.user.store._id
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const tokens = [];
    for (const userId of userIds) {
      // Check if token already exists
      const existingToken = survey.anonymousTokens.find(t => t.userId.toString() === userId);
      if (!existingToken) {
        const token = survey.generateAnonymousToken(userId);
        tokens.push({ userId, token });
      }
    }

    await survey.save();

    res.json({
      message: 'Tokens generated successfully',
      tokens
    });
  } catch (error) {
    logger.error('Error generating tokens:', error);
    res.status(500).json({ message: 'Failed to generate tokens' });
  }
};

// Get survey by anonymous token (for taking survey)
export const getSurveyByToken = async (req, res) => {
  try {
    const { token } = req.params;

    logger.info(`Looking for survey with token: ${token}`);

    const survey = await TeamSurvey.findOne({
      'anonymousTokens.token': token,
      status: 'active'
    }).select('title description questions schedule settings anonymousTokens');

    logger.info(`Survey found: ${survey ? 'Yes' : 'No'}`);

    if (!survey) {
      logger.info('Survey not found or not active');
      return res.status(404).json({ message: 'Survey not found or no longer active' });
    }

    // Validate token
    const validation = survey.validateToken(token);
    logger.info(`Token validation result: ${JSON.stringify(validation)}`);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    // Check if response already exists
    const existingResponse = await TeamSurveyResponse.findOne({
      anonymousToken: token
    });

    logger.info(`Existing response found: ${existingResponse ? 'Yes' : 'No'}`);

    // Get user information for auto-filling demographics
    const tokenData = validation.tokenData;
    const user = await User.findById(tokenData.userId).select('department position hireDate employmentType');

    // Calculate experience level based on hire date
    let experienceLevel = '0-6 months';
    if (user?.hireDate) {
      const monthsSinceHire = Math.floor((new Date() - new Date(user.hireDate)) / (1000 * 60 * 60 * 24 * 30));
      if (monthsSinceHire >= 24) {
        experienceLevel = '2+ years';
      } else if (monthsSinceHire >= 12) {
        experienceLevel = '1-2 years';
      } else if (monthsSinceHire >= 6) {
        experienceLevel = '6-12 months';
      }
    }

    // Auto-fill demographics based on user profile
    const suggestedDemographics = {
      department: user?.department || 'Front of House',
      position: user?.position || 'Team Member',
      experienceLevel: experienceLevel,
      employmentType: user?.employmentType || 'Part-time'
    };

    res.json({
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        settings: survey.settings
      },
      existingResponse: existingResponse ? {
        id: existingResponse._id,
        responses: existingResponse.responses,
        demographics: existingResponse.demographics,
        status: existingResponse.status,
        completionPercentage: existingResponse.completionPercentage
      } : null,
      suggestedDemographics: suggestedDemographics
    });
  } catch (error) {
    logger.error('Error getting survey by token:', error);
    res.status(500).json({ message: 'Failed to get survey' });
  }
};

// Submit survey response
export const submitSurveyResponse = async (req, res) => {
  try {
    const { token } = req.params;
    const { demographics, responses, deviceInfo } = req.body;

    const survey = await TeamSurvey.findOne({
      'anonymousTokens.token': token,
      status: 'active'
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found or no longer active' });
    }

    // Validate token
    const validation = survey.validateToken(token);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    // Check if response already exists
    let surveyResponse = await TeamSurveyResponse.findOne({
      anonymousToken: token
    });

    if (surveyResponse && surveyResponse.status === 'completed') {
      return res.status(400).json({ message: 'Survey already completed' });
    }

    // Create or update response
    if (!surveyResponse) {
      surveyResponse = new TeamSurveyResponse({
        survey: survey._id,
        store: survey.store,
        anonymousToken: token,
        demographics,
        metadata: {
          deviceType: deviceInfo?.deviceType || 'unknown',
          userAgent: deviceInfo?.userAgent,
          ipAddress: crypto.createHash('sha256').update(req.ip || '').digest('hex')
        }
      });
    }

    // Add responses
    if (responses && Array.isArray(responses)) {
      responses.forEach(response => {
        surveyResponse.addResponse(
          response.questionId,
          response.questionText,
          response.questionType,
          response.answer
        );
      });
    }

    // Mark as completed
    surveyResponse.markCompleted();

    await surveyResponse.save();

    // Mark token as used
    survey.markTokenUsed(token);
    await survey.save();

    // Update survey analytics
    const responseCount = await TeamSurveyResponse.countDocuments({
      survey: survey._id,
      status: 'completed'
    });

    survey.analytics.totalResponses = responseCount;
    survey.analytics.responseRate = survey.analytics.totalInvited > 0
      ? Math.round((responseCount / survey.analytics.totalInvited) * 100)
      : 0;
    survey.analytics.lastCalculated = new Date();

    await survey.save();

    res.json({
      message: 'Survey response submitted successfully',
      responseId: surveyResponse._id
    });
  } catch (error) {
    logger.error('Error submitting survey response:', error);
    res.status(500).json({ message: 'Failed to submit survey response' });
  }
};

// Update survey response (for saving progress)
export const updateSurveyResponse = async (req, res) => {
  try {
    const { token } = req.params;
    const { demographics, responses, deviceInfo } = req.body;

    const survey = await TeamSurvey.findOne({
      'anonymousTokens.token': token,
      status: 'active'
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found or no longer active' });
    }

    // Validate token
    const validation = survey.validateToken(token);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    // Find or create response
    let surveyResponse = await TeamSurveyResponse.findOne({
      anonymousToken: token
    });

    if (!surveyResponse) {
      surveyResponse = new TeamSurveyResponse({
        survey: survey._id,
        store: survey.store,
        anonymousToken: token,
        demographics,
        metadata: {
          deviceType: deviceInfo?.deviceType || 'unknown',
          userAgent: deviceInfo?.userAgent,
          ipAddress: crypto.createHash('sha256').update(req.ip || '').digest('hex')
        }
      });
    }

    // Update demographics if provided
    if (demographics) {
      surveyResponse.demographics = { ...surveyResponse.demographics, ...demographics };
    }

    // Update responses
    if (responses && Array.isArray(responses)) {
      responses.forEach(response => {
        surveyResponse.addResponse(
          response.questionId,
          response.questionText,
          response.questionType,
          response.answer
        );
      });
    }

    await surveyResponse.save();

    res.json({
      message: 'Survey progress saved successfully',
      response: {
        id: surveyResponse._id,
        completionPercentage: surveyResponse.completionPercentage,
        status: surveyResponse.status
      }
    });
  } catch (error) {
    logger.error('Error updating survey response:', error);
    res.status(500).json({ message: 'Failed to update survey response' });
  }
};

// Get survey analytics
export const getSurveyAnalytics = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { department, position, experienceLevel, employmentType } = req.query;

    // Build filter for demographics
    const demographicsFilter = {};
    if (department) demographicsFilter['demographics.department'] = department;
    if (position) demographicsFilter['demographics.position'] = position;
    if (experienceLevel) demographicsFilter['demographics.experienceLevel'] = experienceLevel;
    if (employmentType) demographicsFilter['demographics.employmentType'] = employmentType;

    // Get survey
    const survey = await TeamSurvey.findOne({
      _id: surveyId,
      store: req.user.store._id
    }).select('title status analytics questions');
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Get responses with filters
    const responses = await TeamSurveyResponse.find({
      survey: surveyId,
      status: 'completed',
      ...demographicsFilter
    });

    // Calculate overall score (average of all rating questions)
    let overallScore = null;
    const ratingQuestions = survey.questions.filter(q => q.type === 'rating');

    if (ratingQuestions.length > 0 && responses.length > 0) {
      let totalScore = 0;
      let totalResponses = 0;

      ratingQuestions.forEach(question => {
        responses.forEach(response => {
          const answer = response.responses.find(r => r.questionId === question.id);
          if (answer && typeof answer.answer === 'number') {
            totalScore += answer.answer;
            totalResponses++;
          }
        });
      });

      if (totalResponses > 0) {
        overallScore = totalScore / totalResponses;
      }
    }

    // Analyze each question
    const questionAnalytics = survey.questions.map(question => {
      const questionResponses = responses.map(response =>
        response.responses.find(r => r.questionId === question.id)
      ).filter(Boolean);

      const analytics = {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalResponses: questionResponses.length
      };

      if (question.type === 'rating') {
        // Calculate average rating and distribution
        const ratings = questionResponses
          .map(r => r.answer)
          .filter(answer => typeof answer === 'number');

        if (ratings.length > 0) {
          analytics.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

          // Create distribution array (0-9 for ratings 1-10)
          analytics.ratingDistribution = new Array(10).fill(0);
          ratings.forEach(rating => {
            if (rating >= 1 && rating <= 10) {
              analytics.ratingDistribution[rating - 1]++;
            }
          });
        }
      } else if (question.type === 'text') {
        // Get text responses
        analytics.textResponses = questionResponses
          .map(r => r.answer)
          .filter(answer => typeof answer === 'string' && answer.trim().length > 0);
      }

      return analytics;
    });

    // Demographics breakdown
    const demographics = {
      totalResponses: responses.length,
      departmentBreakdown: await TeamSurveyResponse.aggregate([
        { $match: { survey: survey._id, status: 'completed', ...demographicsFilter } },
        { $group: { _id: '$demographics.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      positionBreakdown: await TeamSurveyResponse.aggregate([
        { $match: { survey: survey._id, status: 'completed', ...demographicsFilter } },
        { $group: { _id: '$demographics.position', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      experienceBreakdown: await TeamSurveyResponse.aggregate([
        { $match: { survey: survey._id, status: 'completed', ...demographicsFilter } },
        { $group: { _id: '$demographics.experienceLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      employmentTypeBreakdown: await TeamSurveyResponse.aggregate([
        { $match: { survey: survey._id, status: 'completed', ...demographicsFilter } },
        { $group: { _id: '$demographics.employmentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };

    // Response timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const responseTimeline = await TeamSurveyResponse.aggregate([
      {
        $match: {
          survey: survey._id,
          status: 'completed',
          submittedAt: { $gte: thirtyDaysAgo },
          ...demographicsFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      survey: {
        id: survey._id,
        title: survey.title,
        status: survey.status,
        analytics: survey.analytics
      },
      overallScore,
      questionAnalytics,
      demographics,
      responseTimeline
    });
  } catch (error) {
    logger.error('Error getting survey analytics:', error);
    res.status(500).json({ message: 'Failed to get survey analytics' });
  }
};

// Export survey results
export const exportSurveyResults = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Get survey with questions
    const survey = await TeamSurvey.findOne({
      _id: surveyId,
      store: req.user.store._id
    });
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Get all completed responses
    const responses = await TeamSurveyResponse.find({
      survey: surveyId,
      status: 'completed'
    }).sort({ submittedAt: -1 });

    // Format data for export
    const exportData = {
      survey: {
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt,
        totalResponses: responses.length
      },
      questions: survey.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type
      })),
      responses: responses.map(response => ({
        id: response._id,
        demographics: response.demographics,
        responses: response.responses,
        submittedAt: response.metadata?.completedAt || response.updatedAt,
        completionPercentage: response.completionPercentage
      }))
    };

    res.json(exportData);
  } catch (error) {
    logger.error('Error exporting survey results:', error);
    res.status(500).json({ message: 'Failed to export survey results' });
  }
};

// Manual survey automation actions
export const activateSurveyNow = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const surveyScheduler = await import('../services/surveyScheduler.js');

    const success = await surveyScheduler.default.activateSurveyNow(surveyId);

    if (success) {
      res.json({ message: 'Survey activated successfully' });
    } else {
      res.status(404).json({ message: 'Survey not found' });
    }
  } catch (error) {
    logger.error('Error manually activating survey:', error);
    res.status(500).json({ message: 'Failed to activate survey' });
  }
};

export const sendRemindersNow = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const surveyScheduler = await import('../services/surveyScheduler.js');

    const success = await surveyScheduler.default.sendRemindersNow(surveyId);

    if (success) {
      res.json({ message: 'Reminders sent successfully' });
    } else {
      res.status(404).json({ message: 'Survey not found' });
    }
  } catch (error) {
    logger.error('Error manually sending reminders:', error);
    res.status(500).json({ message: 'Failed to send reminders' });
  }
};