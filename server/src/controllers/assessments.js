import { AssessmentTemplate, AssessmentResponse } from '../models/Assessment.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { generateRecommendations } from '../utils/assessmentRecommendations.js';

// Helper function to extract store ID
const extractStoreId = (user) => {
  return user.store?._id || user.store;
};

// Helper function to calculate scores
const calculateScores = (responses, template) => {
  const areaScores = new Map();
  const areaCounts = new Map();

  // Initialize area scores
  template.areas.forEach(area => {
    areaScores.set(area.name, 0);
    areaCounts.set(area.name, 0);
  });

  // Calculate scores for each area
  responses.forEach(response => {
    const question = template.questions.find(q => q.id === response.questionId);
    if (question && response.score !== undefined) {
      const currentScore = areaScores.get(question.area) || 0;
      const currentCount = areaCounts.get(question.area) || 0;

      areaScores.set(question.area, currentScore + (response.score * question.weight));
      areaCounts.set(question.area, currentCount + question.weight);
    }
  });

  // Calculate final area scores
  const finalScores = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  areaScores.forEach((score, area) => {
    const count = areaCounts.get(area);
    if (count > 0) {
      const areaScore = score / count;
      finalScores[area] = Math.round(areaScore * 100) / 100;

      const areaWeight = template.areas.find(a => a.name === area)?.weight || 1;
      totalWeightedScore += areaScore * areaWeight;
      totalWeight += areaWeight;
    }
  });

  const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;

  return { areaScores: finalScores, overallScore };
};

// Get all assessment templates
export const getAssessmentTemplates = async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);

    const templates = await AssessmentTemplate.find({
      $or: [
        { store: storeId },
        { store: null } // Global templates
      ],
      isActive: true
    }).populate('createdBy', 'name email');

    console.log('Found templates:', templates.length);
    res.json(templates || []);
  } catch (error) {
    logger.error('Error fetching assessment templates:', error);
    res.status(500).json({ message: 'Server error', templates: [] });
  }
};

// Get specific assessment template
export const getAssessmentTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const storeId = extractStoreId(req.user);

    const template = await AssessmentTemplate.findOne({
      _id: templateId,
      $or: [
        { store: storeId },
        { store: null }
      ],
      isActive: true
    }).populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Assessment template not found' });
    }

    res.json(template);
  } catch (error) {
    logger.error('Error fetching assessment template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new assessment template
export const createAssessmentTemplate = async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const {
      title,
      description,
      type,
      category,
      questions,
      areas,
      timeEstimate,
      scoringMethod
    } = req.body;

    const template = new AssessmentTemplate({
      title,
      description,
      type,
      category,
      questions,
      areas,
      timeEstimate,
      scoringMethod,
      store: storeId,
      createdBy: req.user._id
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating assessment template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's assessment responses
export const getUserAssessments = async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const userId = req.params.userId || req.user._id;

    const assessments = await AssessmentResponse.find({
      respondent: userId,
      store: storeId
    }).populate('template', 'title description type category timeEstimate')
      .populate('respondent', 'name email')
      .populate('subject', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found assessments:', assessments.length);
    res.json(assessments || []);
  } catch (error) {
    logger.error('Error fetching user assessments:', error);
    res.status(500).json({ message: 'Server error', assessments: [] });
  }
};

// Start new assessment
export const startAssessment = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { subjectId } = req.body; // For 360 assessments
    const storeId = extractStoreId(req.user);

    // Check if template exists
    const template = await AssessmentTemplate.findOne({
      _id: templateId,
      $or: [
        { store: storeId },
        { store: null }
      ],
      isActive: true
    });

    if (!template) {
      return res.status(404).json({ message: 'Assessment template not found' });
    }

    // Check if assessment already exists
    const existingAssessment = await AssessmentResponse.findOne({
      template: templateId,
      respondent: req.user._id,
      subject: subjectId || req.user._id,
      store: storeId,
      status: { $in: ['not_started', 'in_progress'] }
    });

    if (existingAssessment) {
      return res.json(existingAssessment);
    }

    // Create new assessment response
    const assessment = new AssessmentResponse({
      template: templateId,
      respondent: req.user._id,
      subject: subjectId || req.user._id,
      store: storeId,
      status: 'in_progress',
      startedAt: new Date(),
      responses: [],
      scores: new Map()
    });

    await assessment.save();
    await assessment.populate('template', 'title description type category questions areas');

    res.status(201).json(assessment);
  } catch (error) {
    logger.error('Error starting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assessment response
export const submitAssessmentResponse = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { responses, isComplete } = req.body;

    const assessment = await AssessmentResponse.findOne({
      _id: assessmentId,
      respondent: req.user._id
    }).populate('template');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Update responses
    assessment.responses = responses;

    if (isComplete) {
      // Calculate scores
      const { areaScores, overallScore } = calculateScores(responses, assessment.template);

      assessment.scores = areaScores;
      assessment.overallScore = overallScore;
      assessment.status = 'completed';
      assessment.completedAt = new Date();

      // Generate comprehensive recommendations
      const assessmentType = assessment.template.category === 'customer_service' ? 'customer_service' : 'leadership';
      const recommendations = generateRecommendations(assessmentType, areaScores, overallScore);

      // Extract development areas and strengths
      const developmentAreas = [];
      const strengths = [];

      Object.entries(areaScores).forEach(([area, score]) => {
        if (score < 3) {
          developmentAreas.push(area);
        } else if (score >= 4) {
          strengths.push(area);
        }
      });

      assessment.developmentAreas = developmentAreas;
      assessment.strengths = strengths;
      assessment.recommendations = recommendations.map(r => r.recommendation);
    }

    await assessment.save();
    res.json(assessment);
  } catch (error) {
    logger.error('Error submitting assessment response:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assessment results
export const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const storeId = extractStoreId(req.user);

    const assessment = await AssessmentResponse.findOne({
      _id: assessmentId,
      store: storeId,
      status: 'completed'
    }).populate('template', 'title description type category areas')
      .populate('respondent', 'name email')
      .populate('subject', 'name email');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment results not found' });
    }

    res.json(assessment);
  } catch (error) {
    logger.error('Error fetching assessment results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assessment analytics
export const getAssessmentAnalytics = async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const { templateId, timeframe = '30' } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(timeframe));

    const matchFilter = {
      store: storeId,
      status: 'completed',
      completedAt: { $gte: dateFilter }
    };

    if (templateId) {
      matchFilter.template = templateId;
    }

    const analytics = await AssessmentResponse.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$template',
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$overallScore' },
          completionRate: { $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'assessmenttemplates',
          localField: '_id',
          foreignField: '_id',
          as: 'template'
        }
      }
    ]);

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching assessment analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
