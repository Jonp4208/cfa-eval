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

// Ensure Communication Style Assessment exists
const ensureCommunicationStyleAssessment = async () => {
  try {
    // Check if it already exists
    const existing = await AssessmentTemplate.findOne({
      title: 'Communication Style Assessment',
      store: null
    });

    // If it exists but has fewer than 30 questions, delete and recreate
    if (existing && existing.questions.length < 30) {
      await AssessmentTemplate.deleteOne({ _id: existing._id });
      logger.info('Deleted old Communication Style Assessment to recreate with 30 questions');
    } else if (existing && existing.questions.length >= 30) {
      return existing;
    }

    // Find a system user to use as creator (admin user)
    const systemUser = await User.findOne({
      $or: [
        { email: 'jonp4208@gmail.com' },
        { isAdmin: true },
        { role: 'admin' }
      ]
    }).sort({ createdAt: 1 }); // Get the first admin user

    if (!systemUser) {
      logger.error('No admin user found to create system assessment template');
      return null;
    }

    // Create the Communication Style Assessment
    const communicationAssessment = new AssessmentTemplate({
      title: 'Communication Style Assessment',
      description: 'Discover your natural communication style and learn how to adapt your approach for maximum effectiveness with different team members and situations.',
      type: 'self_assessment',
      category: 'communication',
      timeEstimate: 20,
      scoringMethod: 'weighted_average',
      areas: [
        {
          name: 'Direct Communication',
          description: 'Your tendency to be straightforward, clear, and results-focused in communication',
          weight: 1
        },
        {
          name: 'Expressive Communication',
          description: 'Your tendency to be enthusiastic, people-focused, and emotionally expressive',
          weight: 1
        },
        {
          name: 'Supportive Communication',
          description: 'Your tendency to be patient, collaborative, and relationship-focused',
          weight: 1
        },
        {
          name: 'Analytical Communication',
          description: 'Your tendency to be detail-oriented, systematic, and fact-focused',
          weight: 1
        }
      ],
      questions: [
        // Direct Communication Questions
        {
          id: 'direct-1',
          text: 'When giving instructions to team members, I prefer to:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Give clear, specific directions with expected outcomes and deadlines' },
            { value: 4, label: 'Provide direct guidance with some flexibility for questions' },
            { value: 3, label: 'Give general direction and check in periodically' },
            { value: 2, label: 'Offer suggestions and let them figure out the details' },
            { value: 1, label: 'Provide minimal direction and let them work independently' }
          ]
        },
        {
          id: 'direct-2',
          text: 'When addressing performance issues, I typically:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Address the issue immediately and directly with specific examples' },
            { value: 4, label: 'Schedule a meeting to discuss the issue clearly but diplomatically' },
            { value: 3, label: 'Bring it up when the opportunity naturally arises' },
            { value: 2, label: 'Hint at the issue and hope they pick up on it' },
            { value: 1, label: 'Avoid direct confrontation and work around the issue' }
          ]
        },
        {
          id: 'direct-3',
          text: 'In team meetings, I tend to:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Keep discussions focused on agenda items and decisions' },
            { value: 4, label: 'Guide conversation toward productive outcomes' },
            { value: 3, label: 'Balance task focus with relationship building' },
            { value: 2, label: 'Allow for plenty of discussion and input from everyone' },
            { value: 1, label: 'Let conversations flow naturally without much structure' }
          ]
        },
        {
          id: 'direct-4',
          text: 'When delegating tasks, I typically:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Give specific instructions with clear deadlines and check-in points' },
            { value: 4, label: 'Provide clear expectations and let them know when to update me' },
            { value: 3, label: 'Give general guidance and check progress periodically' },
            { value: 2, label: 'Explain the goal and let them determine the approach' },
            { value: 1, label: 'Assign the task and trust them to handle it independently' }
          ]
        },
        {
          id: 'direct-5',
          text: 'When time is limited during busy periods, my communication becomes:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Very direct and focused on essential information only' },
            { value: 4, label: 'Concise but still clear about expectations' },
            { value: 3, label: 'Balanced between efficiency and clarity' },
            { value: 2, label: 'Still take time to explain context when possible' },
            { value: 1, label: 'Maintain detailed communication even when rushed' }
          ]
        },
        {
          id: 'direct-6',
          text: 'When setting expectations for my team, I prefer to:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Be very specific about what success looks like and how to measure it' },
            { value: 4, label: 'Provide clear standards with some examples' },
            { value: 3, label: 'Give general guidelines and clarify when asked' },
            { value: 2, label: 'Share the vision and let them interpret the details' },
            { value: 1, label: 'Trust them to understand expectations from context' }
          ]
        },
        {
          id: 'direct-7',
          text: 'When someone asks for my opinion, I tend to:',
          type: 'multiple_choice',
          area: 'Direct Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Give my honest, direct assessment immediately' },
            { value: 4, label: 'Share my thoughts clearly but diplomatically' },
            { value: 3, label: 'Balance honesty with consideration for their feelings' },
            { value: 2, label: 'Soften my response to avoid potential conflict' },
            { value: 1, label: 'Ask questions to help them reach their own conclusion' }
          ]
        },
        // Expressive Communication Questions
        {
          id: 'expressive-1',
          text: 'When motivating my team, I prefer to:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Use enthusiasm, stories, and emotional connection to inspire' },
            { value: 4, label: 'Share vision and excitement while providing clear goals' },
            { value: 3, label: 'Balance emotional appeal with logical reasoning' },
            { value: 2, label: 'Focus on facts and logical benefits of the work' },
            { value: 1, label: 'Rely primarily on clear expectations and accountability' }
          ]
        },
        {
          id: 'expressive-2',
          text: 'During busy shifts, my communication style becomes:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'More animated and energetic to keep team spirits up' },
            { value: 4, label: 'Encouraging but focused on maintaining momentum' },
            { value: 3, label: 'Balanced between energy and efficiency' },
            { value: 2, label: 'More focused on tasks with less social interaction' },
            { value: 1, label: 'Very task-focused with minimal conversation' }
          ]
        },
        {
          id: 'expressive-3',
          text: 'When celebrating team successes, I typically:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Make it a big celebration with public recognition and enthusiasm' },
            { value: 4, label: 'Acknowledge achievements with genuine appreciation and some fanfare' },
            { value: 3, label: 'Recognize success in a balanced, appropriate way' },
            { value: 2, label: 'Give quiet, sincere recognition to individuals' },
            { value: 1, label: 'Acknowledge success briefly and move on to next tasks' }
          ]
        },
        {
          id: 'expressive-4',
          text: 'When explaining new procedures or changes, I tend to:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Use stories, examples, and enthusiasm to make it engaging and memorable' },
            { value: 4, label: 'Share the benefits and get people excited about the change' },
            { value: 3, label: 'Balance factual information with some enthusiasm' },
            { value: 2, label: 'Focus on the practical details with minimal emotional appeal' },
            { value: 1, label: 'Present the facts clearly and let them draw their own conclusions' }
          ]
        },
        {
          id: 'expressive-5',
          text: 'In one-on-one conversations with team members, I:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Am very animated and expressive, using gestures and varied tone' },
            { value: 4, label: 'Show enthusiasm and energy while staying focused' },
            { value: 3, label: 'Adapt my energy level to match the situation' },
            { value: 2, label: 'Maintain a calm, steady demeanor' },
            { value: 1, label: 'Keep conversations professional and matter-of-fact' }
          ]
        },
        {
          id: 'expressive-6',
          text: 'When sharing information in team huddles, I prefer to:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Make it interactive and engaging with questions and enthusiasm' },
            { value: 4, label: 'Present information in an upbeat, positive way' },
            { value: 3, label: 'Balance information sharing with team engagement' },
            { value: 2, label: 'Share key points efficiently and answer questions' },
            { value: 1, label: 'Deliver information clearly and concisely' }
          ]
        },
        {
          id: 'expressive-7',
          text: 'When trying to persuade someone to see my point of view, I:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Use passion, personal stories, and emotional connection' },
            { value: 4, label: 'Combine enthusiasm with logical reasoning' },
            { value: 3, label: 'Balance emotional appeal with facts' },
            { value: 2, label: 'Focus primarily on logical arguments and evidence' },
            { value: 1, label: 'Present facts and let them make their own decision' }
          ]
        },
        {
          id: 'expressive-8',
          text: 'My natural speaking pace and volume tends to be:',
          type: 'multiple_choice',
          area: 'Expressive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Fast-paced and animated, with varied volume for emphasis' },
            { value: 4, label: 'Energetic but controlled, with good vocal variety' },
            { value: 3, label: 'Moderate pace with some variation in tone' },
            { value: 2, label: 'Steady pace with consistent, professional tone' },
            { value: 1, label: 'Calm, measured pace with even tone' }
          ]
        },
        // Supportive Communication Questions
        {
          id: 'supportive-1',
          text: 'When a team member is struggling, I:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Take time to listen, understand their situation, and offer patient support' },
            { value: 4, label: 'Show empathy and work together to find solutions' },
            { value: 3, label: 'Balance understanding with practical problem-solving' },
            { value: 2, label: 'Focus on identifying the problem and providing clear solutions' },
            { value: 1, label: 'Address the performance issue directly and set clear expectations' }
          ]
        },
        {
          id: 'supportive-2',
          text: 'My approach to building team relationships involves:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Investing significant time in getting to know each person individually' },
            { value: 4, label: 'Building personal connections while maintaining professional focus' },
            { value: 3, label: 'Balancing personal and professional interactions' },
            { value: 2, label: 'Keeping interactions mostly professional with some personal elements' },
            { value: 1, label: 'Focusing primarily on work-related communication' }
          ]
        },
        {
          id: 'supportive-3',
          text: 'When making changes that affect the team, I:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Involve the team in planning and ensure everyone feels heard' },
            { value: 4, label: 'Explain changes thoroughly and address individual concerns' },
            { value: 3, label: 'Communicate changes clearly and allow time for questions' },
            { value: 2, label: 'Announce changes with rationale and implementation timeline' },
            { value: 1, label: 'Implement changes efficiently with clear communication of expectations' }
          ]
        },
        {
          id: 'supportive-4',
          text: 'When giving constructive feedback, I focus on:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Creating a safe space and focusing on growth and development' },
            { value: 4, label: 'Being encouraging while addressing areas for improvement' },
            { value: 3, label: 'Balancing positive reinforcement with constructive criticism' },
            { value: 2, label: 'Providing clear, specific feedback with some encouragement' },
            { value: 1, label: 'Focusing on performance issues that need immediate correction' }
          ]
        },
        {
          id: 'supportive-5',
          text: 'When conflicts arise between team members, I:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Facilitate discussion to help them understand each other\'s perspectives' },
            { value: 4, label: 'Listen to both sides and help them find common ground' },
            { value: 3, label: 'Mediate the situation and guide them toward resolution' },
            { value: 2, label: 'Address the conflict directly and establish clear expectations' },
            { value: 1, label: 'Make a decision quickly to resolve the issue and move forward' }
          ]
        },
        {
          id: 'supportive-6',
          text: 'My approach to team development involves:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Investing time in understanding each person\'s goals and supporting their growth' },
            { value: 4, label: 'Providing mentoring and guidance tailored to individual needs' },
            { value: 3, label: 'Balancing individual development with team objectives' },
            { value: 2, label: 'Focusing on skill development that benefits team performance' },
            { value: 1, label: 'Providing training and development opportunities as time allows' }
          ]
        },
        {
          id: 'supportive-7',
          text: 'When team members come to me with personal concerns, I:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Listen empathetically and offer support while respecting boundaries' },
            { value: 4, label: 'Show genuine concern and help them find resources if needed' },
            { value: 3, label: 'Listen supportively while keeping focus on work impact' },
            { value: 2, label: 'Acknowledge their concerns and redirect to work-related solutions' },
            { value: 1, label: 'Keep conversations focused on work and suggest they handle personal matters privately' }
          ]
        },
        {
          id: 'supportive-8',
          text: 'When making decisions that affect my team, I:',
          type: 'multiple_choice',
          area: 'Supportive Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Seek input from everyone and consider how decisions impact each person' },
            { value: 4, label: 'Consult with key team members and explain my reasoning' },
            { value: 3, label: 'Balance team input with business needs' },
            { value: 2, label: 'Make decisions based on business needs and communicate clearly' },
            { value: 1, label: 'Make decisions efficiently and inform the team of changes' }
          ]
        },
        // Analytical Communication Questions
        {
          id: 'analytical-1',
          text: 'When explaining procedures to team members, I:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Provide detailed, step-by-step instructions with written documentation' },
            { value: 4, label: 'Give thorough explanations with supporting details and examples' },
            { value: 3, label: 'Balance detail with practical application' },
            { value: 2, label: 'Provide key points and let them ask for more detail if needed' },
            { value: 1, label: 'Give brief overview and expect them to figure out the details' }
          ]
        },
        {
          id: 'analytical-2',
          text: 'When making decisions, I prefer to:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Gather comprehensive data and analyze all options thoroughly' },
            { value: 4, label: 'Collect relevant information and consider multiple perspectives' },
            { value: 3, label: 'Balance data analysis with intuition and experience' },
            { value: 2, label: 'Use key information and trust my experience and judgment' },
            { value: 1, label: 'Make quick decisions based on immediate information available' }
          ]
        },
        {
          id: 'analytical-3',
          text: 'When giving feedback, I typically:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Provide specific examples, data, and detailed improvement plans' },
            { value: 4, label: 'Give concrete examples with clear suggestions for improvement' },
            { value: 3, label: 'Balance specific feedback with encouragement and support' },
            { value: 2, label: 'Focus on key points with some supporting examples' },
            { value: 1, label: 'Give direct, brief feedback focused on immediate needs' }
          ]
        },
        {
          id: 'analytical-4',
          text: 'When preparing for important conversations, I:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Research thoroughly, prepare detailed notes, and anticipate questions' },
            { value: 4, label: 'Gather relevant information and organize my key points' },
            { value: 3, label: 'Do some preparation but stay flexible for the conversation flow' },
            { value: 2, label: 'Think through main points and trust my ability to adapt' },
            { value: 1, label: 'Prefer to keep conversations natural and spontaneous' }
          ]
        },
        {
          id: 'analytical-5',
          text: 'When someone asks me a question I don\'t immediately know the answer to, I:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Say I need to research it and get back to them with complete information' },
            { value: 4, label: 'Share what I know and commit to finding the missing details' },
            { value: 3, label: 'Give my best assessment and note areas of uncertainty' },
            { value: 2, label: 'Provide my initial thoughts and suggest we explore it together' },
            { value: 1, label: 'Give my gut reaction and move the conversation forward' }
          ]
        },
        {
          id: 'analytical-6',
          text: 'When documenting processes or procedures, I prefer to:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Create comprehensive, detailed documentation with examples and troubleshooting' },
            { value: 4, label: 'Write thorough instructions with clear steps and key points' },
            { value: 3, label: 'Balance detail with readability and practical application' },
            { value: 2, label: 'Focus on essential steps and let people ask for clarification' },
            { value: 1, label: 'Keep documentation brief and rely on verbal explanation' }
          ]
        },
        {
          id: 'analytical-7',
          text: 'When reviewing team performance data, I:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Analyze trends, identify patterns, and prepare detailed insights' },
            { value: 4, label: 'Review data carefully and draw evidence-based conclusions' },
            { value: 3, label: 'Look at key metrics and combine data with observations' },
            { value: 2, label: 'Focus on main trends and trust my experience to interpret' },
            { value: 1, label: 'Glance at numbers and rely more on direct observation' }
          ]
        },
        {
          id: 'analytical-8',
          text: 'When training new team members, I:',
          type: 'multiple_choice',
          area: 'Analytical Communication',
          weight: 1,
          required: true,
          options: [
            { value: 5, label: 'Create structured training plans with detailed checklists and progress tracking' },
            { value: 4, label: 'Provide systematic training with clear learning objectives' },
            { value: 3, label: 'Balance structured learning with hands-on experience' },
            { value: 2, label: 'Focus on key skills and let them learn through practice' },
            { value: 1, label: 'Show them the basics and let them figure out their own approach' }
          ]
        }
      ],
      isActive: true,
      createdBy: systemUser._id, // System-created using admin user
      store: null // Global template
    });

    await communicationAssessment.save();
    logger.info(`Created Communication Style Assessment with ${communicationAssessment.questions.length} questions`);
    return communicationAssessment;
  } catch (error) {
    logger.error('Error creating Communication Style Assessment:', error);
    throw error;
  }
};

// Get all assessment templates
export const getAssessmentTemplates = async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);

    // Ensure Communication Style Assessment exists
    await ensureCommunicationStyleAssessment();

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

// Get specific assessment
export const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const storeId = extractStoreId(req.user);

    const assessment = await AssessmentResponse.findOne({
      _id: assessmentId,
      store: storeId,
      $or: [
        { respondent: req.user._id },
        { subject: req.user._id }
      ]
    }).populate('template', 'title description type category questions areas timeEstimate')
      .populate('respondent', 'name email')
      .populate('subject', 'name email');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    logger.error('Error fetching assessment:', error);
    res.status(500).json({ message: 'Server error' });
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
