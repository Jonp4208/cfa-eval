import express from 'express';
import { auth } from '../middleware/auth.js';
import { isManager, isDirector } from '../middleware/roles.js';
import {
  createSurvey,
  getSurveys,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  activateSurvey,
  closeSurvey,
  getSurveyAnalytics,
  exportSurveyResults,
  generateAnonymousTokens,
  submitSurveyResponse,
  getSurveyByToken,
  updateSurveyResponse,
  getDashboardStats,
  activateSurveyNow,
  sendRemindersNow
} from '../controllers/teamSurveys.js';

const router = express.Router();

// Dashboard and overview routes
router.get('/dashboard', auth, isManager, getDashboardStats);

// Survey management routes (Manager+ only)
router.post('/', auth, isManager, createSurvey);
router.get('/', auth, isManager, getSurveys);
router.get('/:surveyId', auth, isManager, getSurvey);
router.put('/:surveyId', auth, isManager, updateSurvey);
router.delete('/:surveyId', auth, isManager, deleteSurvey);

// Survey lifecycle routes
router.post('/:surveyId/activate', auth, isManager, activateSurvey);
router.post('/:surveyId/close', auth, isManager, closeSurvey);
router.post('/:surveyId/generate-tokens', auth, isManager, generateAnonymousTokens);

// Analytics and reporting routes (Director+ for export)
router.get('/:surveyId/analytics', auth, isManager, getSurveyAnalytics);
router.get('/:surveyId/export', auth, isDirector, exportSurveyResults);

// Advanced automation routes
router.post('/:surveyId/activate-now', auth, isManager, activateSurveyNow);
router.post('/:surveyId/send-reminders', auth, isManager, sendRemindersNow);

// Anonymous survey taking routes (no auth required)
router.get('/take/:token', getSurveyByToken);
router.post('/take/:token', submitSurveyResponse);
router.put('/take/:token', updateSurveyResponse);

// Test route for development (remove in production)
router.post('/test/create-and-activate', auth, isManager, async (req, res) => {
  try {
    const { createSurvey, activateSurvey } = await import('../controllers/teamSurveys.js');

    // Create a test survey
    req.body = {
      title: 'Test Team Experience Survey',
      description: 'Test survey for development purposes',
      useDefaultQuestions: true
    };

    // Mock response object for createSurvey
    let surveyData;
    const mockRes = {
      status: (code) => mockRes,
      json: (data) => {
        console.log('Survey creation response:', data);
        surveyData = data;
        return mockRes;
      }
    };

    await createSurvey(req, mockRes);

    if (surveyData && surveyData.survey) {
      // Activate the survey
      req.params = { surveyId: surveyData.survey._id };

      let activationData;
      const mockActivationRes = {
        status: (code) => mockActivationRes,
        json: (data) => {
          console.log('Survey activation response:', data);
          activationData = data;
          return mockActivationRes;
        }
      };

      await activateSurvey(req, mockActivationRes);

      // Get a token for testing
      const survey = activationData.survey;
      const testToken = survey.anonymousTokens[0]?.token;

      console.log('Test token generated:', testToken);
      console.log('Total tokens:', survey.anonymousTokens.length);

      res.json({
        message: 'Test survey created and activated',
        surveyId: survey._id,
        testToken: testToken,
        testUrl: `/survey/${testToken}`,
        totalTokens: survey.anonymousTokens.length
      });
    } else {
      console.error('No survey data returned from createSurvey');
      res.status(500).json({ message: 'Failed to create test survey' });
    }
  } catch (error) {
    console.error('Error creating test survey:', error);
    res.status(500).json({ message: 'Failed to create test survey', error: error.message });
  }
});

export default router;
