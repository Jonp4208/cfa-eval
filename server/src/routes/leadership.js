import express from 'express'
import { auth } from '../middleware/auth.js'
import mongoose from 'mongoose'
import { StoreSubscription } from '../models/index.js'
import LeadershipPlan from '../models/LeadershipPlan.js'
import LeadershipProgress from '../models/LeadershipProgress.js'
import Playbook from '../models/Playbook.js'
import User from '../models/User.js'
import logger from '../utils/logger.js'
import { isManager, isDirector } from '../middleware/roles.js'
import {
  getLeadership360Evaluations,
  getLeadership360Evaluation,
  createLeadership360Evaluation,
  addEvaluators,
  submitEvaluationResponse,
  markAsReviewed,
  deleteLeadership360Evaluation,
  getEvaluationSummary,
  generateDevelopmentPlan
} from '../controllers/leadership360.js'
import {
  getAssessmentTemplates,
  getAssessmentTemplate,
  createAssessmentTemplate,
  getUserAssessments,
  getAssessment,
  startAssessment,
  submitAssessmentResponse,
  getAssessmentResults,
  getAssessmentAnalytics
} from '../controllers/assessments.js'

const router = express.Router()

// Utility function to extract store ID from user object
const extractStoreId = (user) => {
  if (!user || !user.store) {
    console.error('User or store is undefined');
    return null;
  }

  // Handle case where store is an object with _id property
  if (typeof user.store === 'object' && user.store._id) {
    return user.store._id.toString();
  }

  // Handle case where store is already a string or ObjectId
  return user.store.toString();
};

// Middleware to check subscription status
const checkSubscription = async (req, res, next) => {
  try {
    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in checkSubscription middleware');
      req.hasActiveSubscription = false;
      return next();
    }

    console.log('Checking subscription for store ID:', storeId);

    // Find subscription for the store
    const subscription = await StoreSubscription.findOne({ store: storeId });

    // If no subscription exists or it's not active, set a flag on the request
    if (!subscription || subscription.subscriptionStatus !== 'active' || !subscription.features.leadershipPlans) {
      req.hasActiveSubscription = false;
    } else {
      req.hasActiveSubscription = true;
    }

    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    req.hasActiveSubscription = false;
    next();
  }
};

// Get leadership dashboard stats
router.get('/dashboard', auth, checkSubscription, async (req, res) => {
  try {
    const userId = req.user._id;
    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in dashboard endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Fetching dashboard for store ID:', storeId);

    // Get user's leadership progress
    const userProgress = await LeadershipProgress.find({ user: userId, store: storeId }) || [];

    // Calculate stats from progress data
    const enrolledPlans = userProgress.length;
    const completedPlans = userProgress.filter(p => p.status === 'completed').length;
    const inProgressPlans = userProgress.filter(p => p.status === 'in-progress').length;

    // Calculate overall progress percentage
    let overallProgress = 0;
    if (enrolledPlans > 0) {
      const totalProgress = userProgress.reduce((sum, p) => sum + p.progress, 0);
      overallProgress = Math.round(totalProgress / enrolledPlans);
    }

    // Calculate task stats
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;

    userProgress.forEach(plan => {
      if (plan.learningTasks && plan.learningTasks.length > 0) {
        totalTasks += plan.learningTasks.length;
        completedTasks += plan.learningTasks.filter(task => task.completed).length;
      }
    });

    pendingTasks = totalTasks - completedTasks;

    // Get recent activity (last 5 completed tasks)
    const recentActivity = [];
    userProgress.forEach(plan => {
      if (plan.learningTasks && plan.learningTasks.length > 0) {
        const completedWithDates = plan.learningTasks
          .filter(task => task.completed && task.completedAt)
          .map(task => ({
            planId: plan.planId,
            planTitle: getPlanTitle(plan.planId),
            taskId: task.id,
            taskTitle: task.title,
            taskType: task.type,
            completedAt: task.completedAt
          }));

        recentActivity.push(...completedWithDates);
      }
    });

    // Sort by completion date (newest first) and take the first 5
    recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const recentActivityLimited = recentActivity.slice(0, 5);

    // Get upcoming tasks (first 5 incomplete tasks)
    const upcomingTasks = [];
    userProgress.forEach(plan => {
      if (plan.learningTasks && plan.learningTasks.length > 0) {
        const incomplete = plan.learningTasks
          .filter(task => !task.completed)
          .map(task => ({
            planId: plan.planId,
            planTitle: getPlanTitle(plan.planId),
            taskId: task.id,
            taskTitle: task.title,
            taskType: task.type,
            estimatedTime: task.estimatedTime
          }));

        upcomingTasks.push(...incomplete);
      }
    });

    const upcomingTasksLimited = upcomingTasks.slice(0, 5);

    // Return the dashboard stats
    const stats = {
      plans: {
        enrolled: enrolledPlans,
        completed: completedPlans,
        inProgress: inProgressPlans,
        overallProgress: overallProgress
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      recentActivity: recentActivityLimited,
      upcomingTasks: upcomingTasksLimited
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching leadership dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
})

// Helper function to get plan title from plan ID
function getPlanTitle(planId) {
  const planTitles = {
    'heart-of-leadership': 'The Heart of Leadership',
    'restaurant-culture-builder': 'Restaurant Culture Builder',
    'operational-excellence': 'Operational Excellence',
    'team-development': 'Team Development',
    'guest-experience-mastery': 'Guest Experience Mastery',
    'strategic-leadership': 'Strategic Leadership Mastery'
  };

  return planTitles[planId] || 'Leadership Plan';
}

// Get all training programs
router.get('/training', auth, checkSubscription, async (req, res) => {
  try {
    const programs = [] // TODO: Implement with actual model
    res.json(programs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new training program
router.post('/training', auth, checkSubscription, async (req, res) => {
  try {
    // TODO: Implement with actual model
    res.status(201).json({ message: 'Training program created' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get development goals
router.get('/goals', auth, checkSubscription, async (req, res) => {
  try {
    const goals = [] // TODO: Implement with actual model
    res.json(goals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new development goal
router.post('/goals', auth, checkSubscription, async (req, res) => {
  try {
    // TODO: Implement with actual model
    res.status(201).json({ message: 'Development goal created' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Assessment Routes
router.get('/assessment-templates', auth, getAssessmentTemplates);
router.get('/assessment-templates/:templateId', auth, getAssessmentTemplate);
router.post('/assessment-templates', auth, isManager, createAssessmentTemplate);

router.get('/assessments', auth, getUserAssessments);
router.get('/assessments/user/:userId', auth, getUserAssessments);
router.get('/assessments/:assessmentId', auth, getAssessment);
router.post('/assessments/:templateId/start', auth, startAssessment);
router.put('/assessments/:assessmentId/submit', auth, submitAssessmentResponse);
router.get('/assessments/:assessmentId/results', auth, getAssessmentResults);
router.get('/assessments/analytics', auth, getAssessmentAnalytics);

// Get mentorship programs
router.get('/mentorship', auth, checkSubscription, async (req, res) => {
  try {
    const mentorships = [] // TODO: Implement with actual model
    res.json(mentorships)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new mentorship relationship
router.post('/mentorship', auth, checkSubscription, async (req, res) => {
  try {
    // TODO: Implement with actual model
    res.status(201).json({ message: 'Mentorship created' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get leadership analytics
router.get('/analytics', auth, checkSubscription, async (req, res) => {
  try {
    const analytics = {
      growthTrends: [],
      completionRates: [],
      skillsProgress: [],
      teamPerformance: []
    }
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 360 Leadership Evaluation Routes
router.get('/360-evaluations', auth, getLeadership360Evaluations);
router.get('/360-evaluations/:evaluationId', auth, getLeadership360Evaluation);
router.post('/360-evaluations', auth, isManager, createLeadership360Evaluation);
router.post('/360-evaluations/:evaluationId/evaluators', auth, isManager, addEvaluators);
router.post('/360-evaluations/:evaluationId/submit', auth, submitEvaluationResponse);
router.post('/360-evaluations/:evaluationId/review', auth, markAsReviewed);
router.delete('/360-evaluations/:evaluationId', auth, deleteLeadership360Evaluation);
router.get('/360-evaluations/:evaluationId/summary', auth, getEvaluationSummary);
router.get('/360-evaluations/:evaluationId/development-plan', auth, generateDevelopmentPlan);

// Get subscription status
router.get('/subscription-status', auth, async (req, res) => {
  // Use logger.debug instead of console.log for subscription status checks
  logger.debug('Subscription status check');
  try {
    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      logger.error('Failed to extract store ID in subscription-status endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    // Find subscription for the store
    let subscription = await StoreSubscription.findOne({ store: storeId });

    // If no subscription exists, create a default one
    if (!subscription) {
      subscription = await StoreSubscription.create({
        store: storeId,
        subscriptionStatus: 'none',
        features: {
          leadershipPlans: false
        }
      });
    }

    // Calculate the actual subscription status
    const hasActiveSubscription = subscription.subscriptionStatus === 'active' && subscription.features.leadershipPlans === true;

    // Send the response
    res.json({
      hasActiveSubscription: hasActiveSubscription,
      subscriptionStatus: subscription.subscriptionStatus,
      features: subscription.features,
      currentPeriod: subscription.currentPeriod
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple test endpoint without auth
router.get('/subscription-test', async (req, res) => {
  try {
    // Find all subscriptions
    const subscriptions = await StoreSubscription.find({});

    res.json({
      message: 'Test endpoint working',
      subscriptionsCount: subscriptions.length,
      subscriptions: subscriptions
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint for subscription
router.get('/subscription-debug', auth, async (req, res) => {
  try {
    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in subscription-debug endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    // Get user details
    const user = await mongoose.model('User').findById(req.user._id);

    // Find subscription
    const subscription = await StoreSubscription.findOne({ store: storeId });

    // Find store
    const store = await mongoose.model('Store').findById(storeId);

    // Return debug info
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        store: user.store
      },
      store: store ? {
        _id: store._id,
        name: store.name,
        storeNumber: store.storeNumber
      } : null,
      subscription: subscription,
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error in subscription debug endpoint:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all leadership plans
router.get('/plans', auth, async (req, res) => {
  try {
    // For now, we'll return a hardcoded list of plans since they're defined in the frontend
    // In the future, these could be stored in the database
    const plans = [
      {
        id: 'heart-of-leadership',
        title: 'The Heart of Leadership',
        description: 'Build a foundation of character-based leadership focused on serving others first - the essential starting point for restaurant leaders.',
        isFree: true
      },
      {
        id: 'communication-influence',
        title: 'Communication & Influence Excellence',
        description: 'Master the art of clear communication and positive influence to inspire teams and drive results. This comprehensive 10-week plan develops both verbal and non-verbal communication skills essential for effective leadership.',
        isFree: false
      },
      {
        id: 'restaurant-culture-builder',
        title: 'Restaurant Culture Builder',
        description: 'Create a positive, high-performing restaurant culture where team members thrive and guests receive exceptional service.',
        isFree: false
      },
      {
        id: 'team-development',
        title: 'Team Development Expert',
        description: 'Build a high-performing restaurant team by mastering the art of hiring, training, and developing exceptional team members.',
        isFree: false
      },
      {
        id: 'strategic-leadership',
        title: 'Strategic Leadership Mastery',
        description: 'Develop strategic thinking, vision-setting, and decision-making capabilities to drive organizational success. This comprehensive 12-week plan builds the skills needed to think beyond day-to-day operations and lead with strategic purpose.',
        isFree: false
      },
      {
        id: 'operational-excellence',
        title: 'Operational Excellence Leader',
        description: 'Drive efficiency, quality, and continuous improvement in restaurant operations. This comprehensive 10-week plan equips you with the tools and mindset to optimize processes and deliver consistent results.',
        isFree: false
      },
      {
        id: 'innovation-change',
        title: 'Innovation & Change Champion',
        description: 'Lead innovation initiatives and guide teams through change with confidence. This comprehensive 9-week plan develops the skills needed to foster creativity, adapt to change, and drive continuous improvement.',
        isFree: false
      },
      {
        id: 'customer-experience',
        title: 'Customer Experience Leader',
        description: 'Excel at creating exceptional customer experiences and building a hospitality-focused culture. This comprehensive 8-week plan develops the skills needed to consistently deliver outstanding service and recover from service failures.',
        isFree: false
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution & Problem Solving',
        description: 'Master the skills to resolve conflicts constructively and solve complex problems effectively. This comprehensive 9-week plan equips you with tools to handle difficult conversations and find win-win solutions.',
        isFree: false
      },
      {
        id: 'emotional-intelligence',
        title: 'Emotional Intelligence Leader',
        description: 'Develop emotional intelligence to better understand yourself and others, build stronger relationships, and lead with empathy. This comprehensive 10-week plan focuses on self-awareness, social skills, and emotional regulation.',
        isFree: false
      }
    ];

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in plans endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Fetching plans for store ID:', storeId);

    // Get user's enrolled plans
    const enrolledPlans = await LeadershipProgress.find({
      user: req.user._id,
      store: storeId
    }).select('planId status progress enrolledAt completedAt');

    // Map enrolled status to plans
    const plansWithStatus = plans.map(plan => {
      const enrollment = enrolledPlans.find(ep => ep.planId === plan.id);
      return {
        ...plan,
        enrolled: !!enrollment,
        status: enrollment ? enrollment.status : null,
        progress: enrollment ? enrollment.progress : 0,
        enrolledAt: enrollment ? enrollment.enrolledAt : null,
        completedAt: enrollment ? enrollment.completedAt : null
      };
    });

    // Ensure we're sending an array
    if (!Array.isArray(plansWithStatus)) {
      console.error('plansWithStatus is not an array:', plansWithStatus);
      return res.json([]);
    }

    // Log what we're sending
    console.log(`Sending ${plansWithStatus.length} plans to client`);
    res.json(plansWithStatus);
  } catch (error) {
    console.error('Error fetching leadership plans:', error);
    // Always return an array even on error
    res.status(500).json({
      message: error.message,
      plans: [] // Include empty plans array as fallback
    });
  }
});

// Enroll in a leadership plan
router.post('/plans/:planId/enroll', auth, checkSubscription, async (req, res) => {
  try {
    const { planId } = req.params;

    // Check if plan is free or user has subscription
    const isFreeHeartOfLeadership = planId === 'heart-of-leadership';
    if (!isFreeHeartOfLeadership && !req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Subscription required to enroll in this plan'
      });
    }

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in enroll endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Enrolling in plan for store ID:', storeId);

    // Check if already enrolled
    const existingEnrollment = await LeadershipProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: 'Already enrolled in this plan',
        enrollment: existingEnrollment
      });
    }

    // Define learning tasks based on the plan
    let learningTasks = [];

    if (planId === 'heart-of-leadership') {
      learningTasks = [
        {
          id: 'heart-task-1',
          type: 'video',
          title: 'Introduction to Servant Leadership',
          description: 'Watch this video to understand the core principles of servant leadership and how it applies in a restaurant setting. Take notes on how you can apply these principles in your daily interactions with team members.',
          resourceUrl: 'https://www.youtube.com/watch?v=vA8D-LGnpxk',
          estimatedTime: '15 minutes'
        },
        {
          id: 'heart-task-2a',
          type: 'reading',
          title: 'The Heart of Leadership: Introduction & Chapter 1',
          description: 'Read the Introduction and Chapter 1 of "The Heart of Leadership" by Mark Miller. Focus on understanding the difference between capacity and character in leadership. Write down what it means that people follow others because of who they are, not just the skills they have.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2a-activity',
          type: 'activity',
          title: 'Character vs. Capacity Reflection',
          description: 'Based on your reading, create a two-column list: one column for leadership character traits and one for leadership capacity/skills. Identify which of these you currently possess and which you need to develop. Choose one character trait to focus on developing in the next week.',
          estimatedTime: '20 minutes'
        },
        {
          id: 'heart-task-2b',
          type: 'reading',
          title: 'The Heart of Leadership: Think Others First',
          description: 'Read the chapter on "Think Others First" from "The Heart of Leadership" by Mark Miller. Identify specific examples of how you can demonstrate selfless leadership in your restaurant. How can you put team members\'s needs before your own in practical ways?',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2b-activity',
          type: 'activity',
          title: 'Selfless Leadership in Action',
          description: 'Identify three specific actions you can take during your next shift that put your team members\'s needs before your own. Implement these actions and document the results and team member reactions.',
          estimatedTime: '30 minutes (plus implementation time)'
        },
        {
          id: 'heart-task-2c',
          type: 'reading',
          title: 'The Heart of Leadership: Expect the Best',
          description: 'Read the chapter on "Expect the Best" from "The Heart of Leadership" by Mark Miller. Reflect on how your expectations of your team affect their performance. Identify one team member who might benefit from you having higher expectations of them.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2c-activity',
          type: 'activity',
          title: 'Setting Higher Expectations',
          description: 'Create a development plan for the team member you identified who would benefit from higher expectations. Include specific goals, the support you will provide, and how you will communicate your expectations positively.',
          estimatedTime: '25 minutes'
        },
        {
          id: 'heart-task-2d',
          type: 'reading',
          title: 'The Heart of Leadership: Respond with Courage',
          description: 'Read the chapter on "Respond with Courage" from "The Heart of Leadership" by Mark Miller. Identify a situation in your restaurant that requires a courageous response from you as a leader. What specific actions will you take?',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2d-activity',
          type: 'activity',
          title: 'Courageous Conversation Plan',
          description: 'Prepare for a courageous conversation you need to have with a team member or about a challenging situation. Outline what you will say, anticipate responses, and identify potential obstacles. Set a deadline for when you will have this conversation.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-2e',
          type: 'reading',
          title: 'The Heart of Leadership: Final Chapters & Application',
          description: 'Complete the remaining chapters of "The Heart of Leadership" focusing on thinking long-term and displaying humility. Create a personal action plan with 3 specific ways you will apply the five character traits in your leadership role over the next 30 days.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '45-60 minutes'
        },
        {
          id: 'heart-task-2e-activity',
          type: 'activity',
          title: '30-Day Leadership Character Plan',
          description: 'Create a detailed 30-day plan with specific actions for developing each of the five leadership character traits from the book. Include how you will measure success and what resources or support you will need.',
          estimatedTime: '40 minutes'
        },
        {
          id: 'heart-task-3',
          type: 'activity',
          title: 'Leadership Values Exercise',
          description: 'Identify your top 5 leadership values (e.g., integrity, service, excellence) and write a brief statement about how each value influences your leadership approach. Then, create one specific action for each value that you will implement in your next shift.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'heart-task-4',
          type: 'reflection',
          title: 'Leadership Self-Assessment',
          description: 'Complete the Purdue leadership self-assessment worksheet to identify your strengths and areas for growth. Review your scores across all leadership dimensions and identify one specific leadership trait you want to develop further. Create a specific plan for how you will develop this trait over the next 30 days.',
          resourceUrl: 'https://www.purdue.edu/meercat/ldp/wp-content/uploads/sites/2/2018/08/LSA.pdf',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-5',
          type: 'activity',
          title: 'Active Listening Practice',
          description: 'During your next three shifts, practice these active listening techniques with at least two team members per shift: 1) Maintain eye contact, 2) Ask clarifying questions, 3) Paraphrase what you heard, 4) Avoid interrupting. Record your observations and learnings in a journal.',
          estimatedTime: '1 hour (across multiple shifts)'
        },
        {
          id: 'heart-task-6',
          type: 'activity',
          title: 'Servant Leadership in Action',
          description: 'Identify one operational challenge your team is facing. Instead of directing a solution, gather input from team members who are closest to the issue. Implement their ideas and document the results. Reflect on how this approach differs from a top-down approach.',
          estimatedTime: '1-2 hours'
        },
        {
          id: 'heart-task-7',
          type: 'video',
          title: 'The Power of Vulnerability in Leadership',
          description: 'Watch Brené Brown\'s TED Talk on vulnerability and reflect on how showing appropriate vulnerability can strengthen your leadership. Write down 2-3 ways you can be more authentic with your team.',
          resourceUrl: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-8',
          type: 'reflection',
          title: 'Leadership Legacy Statement',
          description: 'Write a 1-page statement describing the impact you want to have as a leader. What do you want team members to say about your leadership when you\'re not in the room? How do you want to be remembered as a leader?',
          estimatedTime: '45 minutes'
        }
      ];
    } else if (planId === 'restaurant-culture-builder') {
      learningTasks = [
        {
          id: 'culture-task-1',
          type: 'video',
          title: 'Building a Positive Restaurant Culture',
          description: 'Watch this video on how Chick-fil-A built a world-class culture. Pay special attention to the connection between culture and operational excellence, team retention, and guest satisfaction.',
          resourceUrl: 'https://www.youtube.com/watch?v=-0agMNXMGrA',
          estimatedTime: '20 minutes'
        },
        {
          id: 'culture-task-2',
          type: 'reading',
          title: 'Culture by Design',
          description: 'Read this comprehensive guide on building epic restaurant culture. Take notes on the key elements of strong cultures and identify which elements are present or missing in your restaurant.',
          resourceUrl: 'https://www.7shifts.com/blog/build-restaurant-culture/',
          estimatedTime: '25 minutes'
        },
        {
          id: 'culture-task-3',
          type: 'activity',
          title: 'Culture Audit',
          description: 'Conduct a "culture walk" through your restaurant during a busy shift. Observe team member interactions, guest service moments, and operational execution. Document 5 positive cultural elements you observe and 3 opportunities for improvement.',
          estimatedTime: '1 hour'
        },
        {
          id: 'culture-task-4',
          type: 'assessment',
          title: 'Team Experience Survey',
          description: 'Create and distribute a brief anonymous survey to team members asking about their experience working in your restaurant. Include questions about team support, leadership accessibility, growth opportunities, and overall satisfaction. Analyze results and identify 3 key insights.\n\n🎯 Use our built-in Team Experience Survey feature to create, distribute, and analyze your survey results.',
          resourceUrl: '/team-surveys/new',
          estimatedTime: '2 hours'
        },
        {
          id: 'culture-task-5',
          type: 'activity',
          title: 'Team Values Workshop',
          description: 'Conduct a 30-minute workshop with your team to identify and define your shared values. Use the "Start, Stop, Continue" framework to identify behaviors that align with these values. Create visual reminders of these values to display in team areas.\n\n🛠️ Use the interactive workshop tool to facilitate your team session\n👀 View the example to see a completed workshop for a Chick-fil-A team',
          resourceUrl: '/templates/team-values-workshop.html',
          exampleUrl: '/templates/team-values-workshop-example.html',
          estimatedTime: '1.5 hours'
        },
        {
          id: 'culture-task-6',
          type: 'activity',
          title: 'Recognition Program Design',
          description: 'Design a simple team member recognition program that aligns with your restaurant values. Include both formal and informal recognition methods, peer-to-peer recognition, and ways to celebrate both individual and team achievements.',
          estimatedTime: '1 hour'
        },
        {
          id: 'culture-task-7',
          type: 'activity',
          title: 'Culture-Building Rituals',
          description: 'Implement three new team rituals that reinforce your desired culture: 1) A pre-shift huddle format that energizes the team, 2) A method for celebrating wins, and 3) A consistent approach to addressing challenges. Document these rituals and practice them for two weeks.',
          estimatedTime: '2 hours (across multiple shifts)'
        },
        {
          id: 'culture-task-8',
          type: 'reflection',
          title: 'Culture Leadership Plan',
          description: 'Create a 90-day culture leadership plan with specific actions you will take to strengthen your restaurant\'s culture. Include how you will model desired behaviors, reinforce values, and address cultural misalignments.\n\n📋 Use the blank template to create your own plan\n👀 View the example to see how a completed plan looks for a Chick-fil-A restaurant',
          resourceUrl: '/templates/90-day-culture-leadership-plan.html',
          exampleUrl: '/templates/90-day-culture-leadership-plan-example.html',
          estimatedTime: '1 hour'
        }
      ];
    } else if (planId === 'team-development') {
      learningTasks = [
        {
          id: 'team-task-1',
          type: 'video',
          title: 'Effective Coaching Techniques',
          description: 'Watch this video on coaching techniques specifically designed for restaurant team development. Focus on the difference between directing, coaching, and mentoring approaches and when to use each one.',
          resourceUrl: 'https://www.youtube.com/watch?v=R3sHXrjbT2s',
          estimatedTime: '25 minutes'
        },
        {
          id: 'team-task-2',
          type: 'reading',
          title: 'The Art of Feedback',
          description: 'Read this article on delivering effective feedback in fast-paced environments. Then practice the SBI (Situation-Behavior-Impact) feedback model by writing out 3 examples of feedback you need to deliver to team members. For each example, clearly identify: 1) The Situation (when/where), 2) The Behavior (what you observed), and 3) The Impact (effect on team/guests/operations). Write your 3 examples in the evidence section when marking this task complete.',
          resourceUrl: 'https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/',
          estimatedTime: '30 minutes'
        },
        {
          id: 'team-task-3',
          type: 'activity',
          title: 'Talent Assessment',
          description: 'Create a talent map of your team by placing each team member in one of four quadrants: 1) High performance/High potential, 2) High performance/Lower potential, 3) Lower performance/High potential, 4) Lower performance/Lower potential. Identify specific development actions for each quadrant.\n\n**QUADRANT EXAMPLES & DEVELOPMENT ACTIONS:**\n\n**1. HIGH PERFORMANCE/HIGH POTENTIAL (Stars)**\nExample: Sarah - Consistently exceeds guest service standards, shows leadership during rush periods, asks thoughtful questions about operations, and other team members naturally look to her for guidance.\n• Development Actions: Cross-train in multiple positions, assign mentoring responsibilities, include in leadership meetings, provide stretch assignments like leading team huddles, consider for promotion track\n\n**2. HIGH PERFORMANCE/LOWER POTENTIAL (Solid Performers)**\nExample: Mike - Reliable team member who consistently meets all standards, shows up on time, follows procedures perfectly, but prefers routine tasks and doesn\'t seek additional responsibilities.\n• Development Actions: Recognize and reward consistency, use as trainer for new hires, provide opportunities to specialize in their strength areas, focus on job enrichment rather than advancement\n\n**3. LOWER PERFORMANCE/HIGH POTENTIAL (Diamonds in the Rough)**\nExample: Jessica - New team member who sometimes struggles with speed during rush but shows great attitude, asks lots of questions, volunteers for extra tasks, and demonstrates strong problem-solving when given time.\n• Development Actions: Provide intensive coaching and mentoring, pair with high performers, set clear short-term goals, give frequent feedback, invest in additional training, be patient with development timeline\n\n**4. LOWER PERFORMANCE/LOWER POTENTIAL (Needs Basic Development)**\nExample: Alex - Struggles to meet basic job requirements, frequently late, needs constant reminders about procedures, shows little initiative or interest in improvement.\n• Development Actions: Provide clear expectations and consequences, implement performance improvement plan, consider role fit assessment, provide basic skills training, set minimum performance standards with timeline',
          estimatedTime: '1 hour'
        },
        {
          id: 'team-task-4',
          type: 'activity',
          title: 'GROW Coaching Conversation',
          description: 'Conduct a coaching conversation with a team member using the GROW model (Goal, Reality, Options, Will/Way Forward). Document the conversation and reflect on what went well and what you would do differently next time.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'team-task-5',
          type: 'activity',
          title: 'Development Plan Creation',
          description: 'Create a detailed 90-day development plan for a high-potential team member. Include specific skills to develop, learning resources, on-the-job experiences, and regular check-in points. Share this plan with the team member and refine it based on their input.',
          estimatedTime: '1 hour'
        },
        {
          id: 'team-task-6',
          type: 'activity',
          title: 'Training Effectiveness Audit',
          description: 'Observe 3 different team members who were recently trained on a procedure. Note variations in execution and identify potential gaps in the training approach. Create a plan to address these gaps and standardize training outcomes.',
          estimatedTime: '2 hours (across multiple shifts)'
        },
        {
          id: 'team-task-7',
          type: 'activity',
          title: 'Skill-Building Workshop',
          description: 'Design and deliver a 15-minute skill-building session for your team on a topic where performance could be improved (e.g., guest recovery, suggestive selling, teamwork during rush periods). Use the "Tell, Show, Do, Review" training method.',
          estimatedTime: '2 hours'
        },
        {
          id: 'team-task-8',
          type: 'reflection',
          title: 'Team Development Philosophy',
          description: 'Write a 1-page statement describing your philosophy on team development. Include your beliefs about how people learn and grow, your role as a developer of others, and the connection between team development and business results.',
          estimatedTime: '45 minutes'
        }
      ];
    } else if (planId === 'communication-influence') {
      learningTasks = [
        {
          id: 'comm-task-1',
          type: 'video',
          title: 'Introduction to Effective Communication',
          description: 'Watch this comprehensive introduction to effective communication for leaders. Focus on understanding the difference between talking and communicating, and how clear communication drives team performance.',
          resourceUrl: 'https://www.youtube.com/watch?v=HAnw168huqA',
          estimatedTime: '20 minutes'
        },
        {
          id: 'comm-task-2',
          type: 'reading',
          title: 'Crucial Conversations - Core Concepts',
          description: 'Read the first three chapters of "Crucial Conversations" by Kerry Patterson. Focus on understanding what makes a conversation crucial, how to recognize when safety is at risk, and the importance of creating a safe space for dialogue.',
          resourceUrl: 'https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/0071771328',
          estimatedTime: '45-60 minutes'
        },
        {
          id: 'comm-task-2-activity',
          type: 'assessment',
          title: 'Communication Style Assessment',
          description: 'Complete our comprehensive 30-question Communication Style Assessment to discover your natural communication preferences across four key dimensions: Direct, Expressive, Supportive, and Analytical communication. This professional-grade assessment will help you identify your primary communication style, understand your strengths, and learn how to adapt your approach for maximum effectiveness with different team members and situations.',
          resourceUrl: '/leadership/assessments',
          estimatedTime: '20 minutes'
        },
        {
          id: 'comm-task-3',
          type: 'video',
          title: 'Active Listening Mastery',
          description: 'Watch this detailed training on active listening techniques. Pay special attention to the difference between hearing and listening, and practice the techniques demonstrated.',
          resourceUrl: 'https://www.youtube.com/watch?v=rzsVh8YwZEQ',
          estimatedTime: '25 minutes'
        },
        {
          id: 'comm-task-3-activity',
          type: 'activity',
          title: 'Active Listening Practice',
          description: 'During your next three shifts, practice active listening with at least two team members per shift. Use these techniques: 1) Maintain eye contact, 2) Ask clarifying questions, 3) Paraphrase what you heard, 4) Avoid interrupting. Document your observations and what you learned.',
          estimatedTime: '1 hour (across multiple shifts)'
        },
        {
          id: 'comm-task-4',
          type: 'reading',
          title: 'The Art of Feedback',
          description: 'Read this comprehensive guide on delivering effective feedback in fast-paced environments. Focus on the SBI (Situation-Behavior-Impact) feedback model and practice writing out 3 examples of feedback you need to deliver to team members.',
          resourceUrl: 'https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/',
          estimatedTime: '30 minutes'
        },
        {
          id: 'comm-task-4-activity',
          type: 'activity',
          title: 'Feedback Delivery Practice',
          description: 'Practice delivering feedback using the SBI model with three different team members. For each conversation, document: 1) The situation you addressed, 2) The specific behavior you observed, 3) The impact it had, 4) The team member\'s response, 5) What you learned about your feedback delivery.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'comm-task-5',
          type: 'video',
          title: 'Non-Verbal Communication and Body Language',
          description: 'Watch Vanessa Van Edwards\' presentation on body language secrets for leaders. Focus on how your non-verbal communication affects your leadership presence and team interactions.',
          resourceUrl: 'https://www.youtube.com/watch?v=ZZZ7k8cMA-4',
          estimatedTime: '18 minutes'
        },
        {
          id: 'comm-task-5-activity',
          type: 'activity',
          title: 'Body Language Awareness',
          description: 'For one week, focus on your non-verbal communication during team interactions. Ask a trusted team member to observe and provide feedback on your body language, tone, and presence. Identify 2-3 specific improvements to make.',
          estimatedTime: '1 week of observation + 30 minutes reflection'
        },
        {
          id: 'comm-task-6',
          type: 'reading',
          title: 'Influence Without Authority',
          description: 'Read this Harvard Business Review article on influencing others when you don\'t have formal authority. Focus on the six principles of influence and how to apply them in restaurant leadership.',
          resourceUrl: 'https://hbr.org/2005/02/influence-without-authority-2',
          estimatedTime: '25 minutes'
        },
        {
          id: 'comm-task-6-activity',
          type: 'activity',
          title: 'Influence Practice Project',
          description: 'Identify a change or improvement you want to implement that requires team buy-in but you don\'t have direct authority to mandate. Use influence techniques (reciprocity, commitment, social proof, etc.) to gain support. Document your approach and results.',
          estimatedTime: '1-2 hours'
        },
        {
          id: 'comm-task-7',
          type: 'video',
          title: 'Difficult Conversations Framework',
          description: 'Watch this TED Talk on how to have difficult conversations. Learn the framework for approaching challenging discussions with team members while maintaining relationships.',
          resourceUrl: 'https://www.youtube.com/watch?v=l3QEXLzWbZU',
          estimatedTime: '15 minutes'
        },
        {
          id: 'comm-task-7-activity',
          type: 'activity',
          title: 'Difficult Conversation Practice',
          description: 'Prepare for and conduct a difficult conversation you\'ve been avoiding with a team member. Use the framework from the video: 1) Prepare your mindset, 2) Start with facts, 3) Share your story, 4) Ask for their perspective, 5) Work together on solutions. Reflect on the outcome.',
          estimatedTime: '45 minutes preparation + conversation time'
        },
        {
          id: 'comm-task-8',
          type: 'reading',
          title: 'Written Communication Excellence',
          description: 'Read this guide on clear, professional written communication. Focus on techniques for emails, schedules, and team communications that reduce confusion and improve efficiency.',
          resourceUrl: 'https://www.grammarly.com/blog/business-writing-tips/',
          estimatedTime: '20 minutes'
        },
        {
          id: 'comm-task-8-activity',
          type: 'activity',
          title: 'Communication System Improvement',
          description: 'Audit your current written communication methods (schedules, announcements, emails, etc.). Identify 3 areas for improvement and implement changes. Create templates for common communications to ensure consistency and clarity.',
          estimatedTime: '1 hour'
        },
        {
          id: 'comm-task-9',
          type: 'reflection',
          title: 'Communication Leadership Philosophy',
          description: 'Write a 1-page statement describing your communication leadership philosophy. Include your beliefs about: the role of communication in leadership, how you will create psychological safety for open dialogue, your approach to giving and receiving feedback, and how you will continue developing your communication skills.',
          estimatedTime: '45 minutes'
        }
      ];
    } else if (planId === 'strategic-leadership') {
      learningTasks = [
        {
          id: 'strategic-task-1',
          type: 'video',
          title: 'Introduction to Strategic Thinking',
          description: 'Watch this comprehensive introduction to strategic thinking for leaders. Focus on understanding the difference between operational thinking and strategic thinking, and how to develop a strategic mindset in your daily leadership role.',
          resourceUrl: 'https://www.youtube.com/watch?v=iuYlGRnC7J8',
          estimatedTime: '20 minutes'
        },
        {
          id: 'strategic-task-2',
          type: 'reading',
          title: 'Good Strategy Bad Strategy - Core Concepts',
          description: 'Read the first three chapters of "Good Strategy Bad Strategy" by Richard Rumelt. Focus on understanding what makes a strategy good versus bad, and the kernel of good strategy (diagnosis, guiding policy, coherent action). Take notes on how these concepts apply to restaurant leadership.',
          resourceUrl: 'https://www.amazon.com/Good-Strategy-Bad-Strategy-Difference/dp/0307886239',
          estimatedTime: '45-60 minutes'
        },
        {
          id: 'strategic-task-2-activity',
          type: 'activity',
          title: 'Restaurant Strategy Diagnosis',
          description: 'Apply the strategic diagnosis framework to your restaurant. Identify the key challenges and opportunities your restaurant faces. Write a clear diagnosis of your current situation, including competitive position, operational challenges, and market opportunities.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'strategic-task-3',
          type: 'video',
          title: 'Start with Why - Vision and Purpose',
          description: 'Watch Simon Sinek\'s famous TED Talk "Start with Why" and reflect on how purpose-driven leadership creates strategic advantage. Consider how you can apply the "Golden Circle" concept to your restaurant leadership.',
          resourceUrl: 'https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action',
          estimatedTime: '18 minutes'
        },
        {
          id: 'strategic-task-3-activity',
          type: 'activity',
          title: 'Develop Your Restaurant\'s Why',
          description: 'Create a clear "Why" statement for your restaurant that goes beyond making money. Define the purpose that drives your team and the impact you want to have on guests and the community. Test this with 2-3 team members to ensure it resonates.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'strategic-task-4',
          type: 'reading',
          title: 'Strategic Planning Fundamentals',
          description: 'Read this comprehensive guide on strategic planning for small businesses. Focus on the sections about environmental scanning, SWOT analysis, and setting strategic objectives. Adapt the concepts to restaurant operations.',
          resourceUrl: 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan',
          estimatedTime: '30 minutes'
        },
        {
          id: 'strategic-task-4-activity',
          type: 'activity',
          title: 'Restaurant SWOT Analysis',
          description: 'Conduct a thorough SWOT analysis for your restaurant: Strengths (what you do well), Weaknesses (areas for improvement), Opportunities (external factors you can leverage), and Threats (external challenges). Include input from at least two team members for different perspectives.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'strategic-task-5',
          type: 'video',
          title: 'Decision Making Under Uncertainty',
          description: 'Watch this Harvard Business Review video on making strategic decisions when you don\'t have all the information. Learn frameworks for decision-making in uncertain environments, which is common in restaurant operations.',
          resourceUrl: 'https://www.youtube.com/watch?v=7VB_PqEQ4zY',
          estimatedTime: '15 minutes'
        },
        {
          id: 'strategic-task-5-activity',
          type: 'activity',
          title: 'Strategic Decision Framework',
          description: 'Identify a significant decision you need to make in your restaurant (staffing, menu, operations, etc.). Apply a structured decision-making framework: 1) Define the decision clearly, 2) Gather relevant information, 3) Identify alternatives, 4) Evaluate pros/cons, 5) Make the decision, 6) Plan implementation. Document your process.',
          estimatedTime: '1 hour'
        },
        {
          id: 'strategic-task-6',
          type: 'reading',
          title: 'Competitive Analysis and Market Positioning',
          description: 'Read this guide on competitive analysis for restaurants. Learn how to systematically analyze your competition and identify your unique positioning in the market.',
          resourceUrl: 'https://www.restaurantowner.com/public/How-to-Analyze-Your-Restaurant-Competition.cfm',
          estimatedTime: '25 minutes'
        },
        {
          id: 'strategic-task-6-activity',
          type: 'activity',
          title: 'Competitive Landscape Mapping',
          description: 'Create a competitive analysis of the 5 restaurants that compete most directly with yours. For each competitor, analyze: menu offerings, pricing, service style, target customers, strengths, and weaknesses. Identify gaps in the market that your restaurant could fill.',
          estimatedTime: '1.5 hours'
        },
        {
          id: 'strategic-task-7',
          type: 'video',
          title: 'Leading Change and Innovation',
          description: 'Watch John Kotter\'s presentation on leading change. Focus on the 8-step process for leading change and how to overcome resistance to strategic initiatives.',
          resourceUrl: 'https://www.youtube.com/watch?v=Gc_FMz5_RCE',
          estimatedTime: '25 minutes'
        },
        {
          id: 'strategic-task-7-activity',
          type: 'activity',
          title: 'Strategic Change Initiative Plan',
          description: 'Identify one strategic change you want to implement in your restaurant (new process, service improvement, team development initiative, etc.). Create a change management plan using Kotter\'s 8-step process, including how you will communicate the change and address potential resistance.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'strategic-task-8',
          type: 'reading',
          title: 'Long-term Planning and Goal Setting',
          description: 'Read this article on setting and achieving long-term strategic goals. Focus on the difference between strategic goals and operational goals, and how to create accountability systems for strategic initiatives.',
          resourceUrl: 'https://hbr.org/2017/01/how-to-set-goals-that-actually-get-achieved',
          estimatedTime: '20 minutes'
        },
        {
          id: 'strategic-task-8-activity',
          type: 'activity',
          title: '90-Day Strategic Plan',
          description: 'Create a 90-day strategic plan for your restaurant with 3-5 strategic objectives. For each objective, define: specific outcomes, key milestones, resources needed, potential obstacles, and success metrics. Include both team development and operational improvement goals.',
          estimatedTime: '1 hour'
        },
        {
          id: 'strategic-task-9',
          type: 'reflection',
          title: 'Strategic Leadership Self-Assessment',
          description: 'Complete a comprehensive self-assessment of your strategic leadership capabilities. Evaluate yourself on: strategic thinking, vision communication, decision-making, change leadership, and long-term planning. Identify your top 3 strategic leadership development priorities for the next 6 months.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'strategic-task-10',
          type: 'activity',
          title: 'Strategic Communication Practice',
          description: 'Practice communicating strategic concepts to your team. Choose one strategic initiative from your 90-day plan and create a 5-minute presentation explaining: why it matters, what success looks like, and how team members contribute. Deliver this to at least 3 team members and gather feedback.',
          estimatedTime: '1 hour'
        },
        {
          id: 'strategic-task-11',
          type: 'reflection',
          title: 'Strategic Leadership Philosophy',
          description: 'Write a 1-page strategic leadership philosophy statement. Include your beliefs about: the role of strategy in restaurant leadership, how you balance short-term operations with long-term thinking, your approach to strategic decision-making, and how you will continue developing strategic thinking skills.',
          estimatedTime: '45 minutes'
        }
      ];
    } else if (planId === 'operational-excellence') {
      learningTasks = [
        {
          id: 'ops-task-1',
          type: 'video',
          title: 'Introduction to Operational Excellence',
          description: 'Watch this comprehensive introduction to operational excellence in restaurants. Focus on understanding the principles of efficiency, quality, and continuous improvement.',
          resourceUrl: 'https://www.youtube.com/watch?v=RWy998r37oM',
          estimatedTime: '20 minutes'
        },
        {
          id: 'ops-task-2',
          type: 'reading',
          title: 'Lean Principles for Restaurants',
          description: 'Read this guide on applying Lean principles to restaurant operations. Focus on identifying waste, improving flow, and creating value for customers.',
          resourceUrl: 'https://www.lean.org/lexicon-terms/lean-thinking/',
          estimatedTime: '30 minutes'
        },
        {
          id: 'ops-task-2-activity',
          type: 'activity',
          title: 'Process Mapping Exercise',
          description: 'Map out one key process in your restaurant (e.g., order taking, food preparation, cleaning). Identify bottlenecks, waste, and opportunities for improvement. Create a visual map showing current state and proposed improvements.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'ops-task-3',
          type: 'video',
          title: 'Quality Management Systems',
          description: 'Learn about quality management principles and how to implement quality control systems in restaurant operations.',
          resourceUrl: 'https://www.youtube.com/watch?v=9rzzkw4KX8E',
          estimatedTime: '25 minutes'
        },
        {
          id: 'ops-task-3-activity',
          type: 'activity',
          title: 'Quality Standards Development',
          description: 'Create quality standards for three key areas in your restaurant. Define what "good" looks like, how to measure it, and what corrective actions to take when standards aren\'t met.',
          estimatedTime: '1 hour'
        },
        {
          id: 'ops-task-4',
          type: 'reading',
          title: 'Performance Metrics and KPIs',
          description: 'Read about key performance indicators for restaurant operations. Learn how to select, track, and use metrics to drive operational improvements.',
          resourceUrl: 'https://www.lightspeedhq.com/blog/restaurant-kpis/',
          estimatedTime: '25 minutes'
        },
        {
          id: 'ops-task-4-activity',
          type: 'activity',
          title: 'KPI Dashboard Creation',
          description: 'Identify 5-7 key performance indicators for your restaurant and create a simple dashboard to track them. Include targets, current performance, and action plans for improvement.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'ops-task-5',
          type: 'activity',
          title: 'Continuous Improvement Project',
          description: 'Implement a small continuous improvement project in your restaurant. Use the Plan-Do-Check-Act cycle to test and refine the improvement. Document results and lessons learned.',
          estimatedTime: '2 hours (across multiple days)'
        },
        {
          id: 'ops-task-6',
          type: 'reflection',
          title: 'Operational Excellence Philosophy',
          description: 'Write a 1-page statement describing your operational excellence philosophy. Include your beliefs about efficiency, quality, customer value, and continuous improvement.',
          estimatedTime: '30 minutes'
        }
      ];
    } else if (planId === 'innovation-change') {
      learningTasks = [
        {
          id: 'innovation-task-1',
          type: 'video',
          title: 'Leading Change in Organizations',
          description: 'Watch John Kotter\'s presentation on the 8-step process for leading change. Focus on how to create urgency, build coalitions, and sustain change initiatives.',
          resourceUrl: 'https://www.youtube.com/watch?v=Gc_FMz5_RCE',
          estimatedTime: '25 minutes'
        },
        {
          id: 'innovation-task-2',
          type: 'reading',
          title: 'Innovation Mindset Development',
          description: 'Read about developing an innovation mindset in fast-paced environments. Focus on techniques for encouraging creativity and managing resistance to new ideas.',
          resourceUrl: 'https://hbr.org/2019/11/the-hard-truth-about-innovative-cultures',
          estimatedTime: '20 minutes'
        },
        {
          id: 'innovation-task-2-activity',
          type: 'activity',
          title: 'Innovation Audit',
          description: 'Assess your restaurant\'s current innovation culture. Identify barriers to innovation, existing creative practices, and opportunities to foster more innovative thinking among your team.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'innovation-task-3',
          type: 'video',
          title: 'Creative Problem Solving Techniques',
          description: 'Learn creative problem-solving techniques that can be applied in restaurant operations. Focus on brainstorming, design thinking, and rapid prototyping.',
          resourceUrl: 'https://www.youtube.com/watch?v=muqvsLabtfM',
          estimatedTime: '18 minutes'
        },
        {
          id: 'innovation-task-3-activity',
          type: 'activity',
          title: 'Innovation Workshop',
          description: 'Conduct a 30-minute innovation workshop with your team. Use creative problem-solving techniques to generate ideas for improving one aspect of your restaurant operations.',
          estimatedTime: '1 hour'
        },
        {
          id: 'innovation-task-4',
          type: 'reading',
          title: 'Change Management Strategies',
          description: 'Read about effective change management strategies for restaurants. Learn how to communicate change, address resistance, and ensure successful implementation.',
          resourceUrl: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-psychology-of-change-management',
          estimatedTime: '25 minutes'
        },
        {
          id: 'innovation-task-4-activity',
          type: 'activity',
          title: 'Change Implementation Plan',
          description: 'Create a detailed plan for implementing one change or innovation in your restaurant. Include communication strategy, timeline, success metrics, and contingency plans.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'innovation-task-5',
          type: 'activity',
          title: 'Continuous Improvement System',
          description: 'Design and implement a system for capturing and evaluating improvement ideas from your team. Include idea submission, evaluation criteria, and feedback processes.',
          estimatedTime: '1 hour'
        },
        {
          id: 'innovation-task-6',
          type: 'reflection',
          title: 'Innovation Leadership Philosophy',
          description: 'Write a 1-page statement describing your approach to innovation and change leadership. Include your beliefs about creativity, risk-taking, and continuous improvement.',
          estimatedTime: '30 minutes'
        }
      ];
    } else if (planId === 'customer-experience') {
      learningTasks = [
        {
          id: 'cx-task-1',
          type: 'video',
          title: 'Customer Experience Excellence',
          description: 'Watch this comprehensive guide to creating exceptional customer experiences in restaurants. Focus on understanding customer journey mapping and touchpoint optimization.',
          resourceUrl: 'https://www.youtube.com/watch?v=4cCOCUHPHqA',
          estimatedTime: '22 minutes'
        },
        {
          id: 'cx-task-2',
          type: 'reading',
          title: 'Service Recovery Strategies',
          description: 'Read about effective service recovery techniques. Learn the LAST method (Listen, Apologize, Solve, Thank) and how to turn complaints into opportunities.',
          resourceUrl: 'https://www.restaurantowner.com/public/Service-Recovery-in-Restaurants.cfm',
          estimatedTime: '25 minutes'
        },
        {
          id: 'cx-task-2-activity',
          type: 'activity',
          title: 'Customer Journey Mapping',
          description: 'Create a detailed customer journey map for your restaurant. Identify all touchpoints from arrival to departure and note opportunities to enhance the experience at each stage.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'cx-task-3',
          type: 'video',
          title: 'Building a Hospitality Culture',
          description: 'Learn how to build a culture focused on hospitality and customer care. Understand the difference between service and hospitality.',
          resourceUrl: 'https://www.youtube.com/watch?v=QTWJGy7Jw_U',
          estimatedTime: '18 minutes'
        },
        {
          id: 'cx-task-3-activity',
          type: 'activity',
          title: 'Service Standards Development',
          description: 'Create specific, measurable service standards for your restaurant. Include greeting protocols, response times, and quality expectations. Train your team on these standards.',
          estimatedTime: '1 hour'
        },
        {
          id: 'cx-task-4',
          type: 'reading',
          title: 'Customer Feedback and Measurement',
          description: 'Read about effective methods for collecting and analyzing customer feedback. Learn how to use feedback to drive continuous improvement.',
          resourceUrl: 'https://blog.hubspot.com/service/how-to-collect-customer-feedback',
          estimatedTime: '20 minutes'
        },
        {
          id: 'cx-task-4-activity',
          type: 'activity',
          title: 'Customer Feedback System',
          description: 'Implement a system for regularly collecting customer feedback. This could include surveys, comment cards, or digital feedback tools. Analyze initial results and create action plans.',
          estimatedTime: '1 hour'
        },
        {
          id: 'cx-task-5',
          type: 'activity',
          title: 'Service Recovery Training',
          description: 'Conduct a training session with your team on service recovery techniques. Practice handling different types of customer complaints and turning negative experiences into positive ones.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'cx-task-6',
          type: 'reflection',
          title: 'Customer Experience Philosophy',
          description: 'Write a 1-page statement describing your customer experience philosophy. Include your beliefs about hospitality, service excellence, and creating memorable experiences.',
          estimatedTime: '30 minutes'
        }
      ];
    } else if (planId === 'conflict-resolution') {
      learningTasks = [
        {
          id: 'conflict-task-1',
          type: 'video',
          title: 'Conflict Resolution Fundamentals',
          description: 'Learn the fundamentals of conflict resolution in workplace settings. Focus on understanding different types of conflict and when to intervene.',
          resourceUrl: 'https://www.youtube.com/watch?v=tbLEqIjBWAU',
          estimatedTime: '20 minutes'
        },
        {
          id: 'conflict-task-2',
          type: 'reading',
          title: 'Active Listening in Conflict Situations',
          description: 'Read about the critical role of active listening in resolving conflicts. Learn techniques for truly understanding all parties\' perspectives.',
          resourceUrl: 'https://www.mindtools.com/pages/article/newLDR_81.htm',
          estimatedTime: '25 minutes'
        },
        {
          id: 'conflict-task-2-activity',
          type: 'activity',
          title: 'Conflict Assessment Exercise',
          description: 'Identify current or recent conflicts in your restaurant. Analyze the root causes, stakeholders involved, and potential resolution strategies for each situation.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'conflict-task-3',
          type: 'video',
          title: 'Mediation and Facilitation Skills',
          description: 'Learn mediation techniques for helping team members resolve conflicts. Focus on remaining neutral and guiding parties to their own solutions.',
          resourceUrl: 'https://www.youtube.com/watch?v=KY5TWVz5ZDU',
          estimatedTime: '18 minutes'
        },
        {
          id: 'conflict-task-3-activity',
          type: 'activity',
          title: 'Mediation Practice',
          description: 'Practice mediating a conflict between team members (real or role-played). Use structured mediation techniques and document the process and outcomes.',
          estimatedTime: '1 hour'
        },
        {
          id: 'conflict-task-4',
          type: 'reading',
          title: 'Problem-Solving Frameworks',
          description: 'Read about structured problem-solving approaches. Learn the 5 Whys technique, root cause analysis, and collaborative problem-solving methods.',
          resourceUrl: 'https://asq.org/quality-resources/problem-solving',
          estimatedTime: '30 minutes'
        },
        {
          id: 'conflict-task-4-activity',
          type: 'activity',
          title: 'Problem-Solving Workshop',
          description: 'Lead a problem-solving session with your team to address a recurring operational challenge. Use structured techniques to identify root causes and develop solutions.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'conflict-task-5',
          type: 'activity',
          title: 'Conflict Prevention System',
          description: 'Develop a system for preventing conflicts in your restaurant. Include clear communication protocols, regular check-ins, and early intervention strategies.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'conflict-task-6',
          type: 'reflection',
          title: 'Conflict Resolution Philosophy',
          description: 'Write a 1-page statement describing your approach to conflict resolution and problem-solving. Include your beliefs about fairness, collaboration, and maintaining relationships.',
          estimatedTime: '30 minutes'
        }
      ];
    } else if (planId === 'emotional-intelligence') {
      learningTasks = [
        {
          id: 'eq-task-1',
          type: 'video',
          title: 'Introduction to Emotional Intelligence',
          description: 'Learn about the four domains of emotional intelligence: self-awareness, self-management, social awareness, and relationship management.',
          resourceUrl: 'https://www.youtube.com/watch?v=Y7m9eNoB3NU',
          estimatedTime: '18 minutes'
        },
        {
          id: 'eq-task-2',
          type: 'reading',
          title: 'Self-Awareness Development',
          description: 'Read about developing self-awareness as a leader. Learn techniques for understanding your emotions, triggers, and impact on others.',
          resourceUrl: 'https://hbr.org/2018/01/what-self-awareness-really-is-and-how-to-cultivate-it',
          estimatedTime: '25 minutes'
        },
        {
          id: 'eq-task-2-activity',
          type: 'activity',
          title: 'Emotional Intelligence Assessment',
          description: 'Complete a comprehensive EQ assessment and reflect on your results. Identify your strongest and weakest areas, and create a development plan for improvement.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'eq-task-3',
          type: 'video',
          title: 'Empathy and Social Skills',
          description: 'Learn about developing empathy and social skills for better leadership. Focus on reading non-verbal cues and responding appropriately to others\' emotions.',
          resourceUrl: 'https://www.youtube.com/watch?v=1Evwgu369Jw',
          estimatedTime: '20 minutes'
        },
        {
          id: 'eq-task-3-activity',
          type: 'activity',
          title: 'Empathy Practice Exercise',
          description: 'For one week, practice empathy-building exercises with your team. Focus on understanding their perspectives, acknowledging their emotions, and responding with compassion.',
          estimatedTime: '1 week of practice + 30 minutes reflection'
        },
        {
          id: 'eq-task-4',
          type: 'reading',
          title: 'Emotional Regulation Techniques',
          description: 'Read about techniques for managing your emotions under pressure. Learn stress management strategies and how to maintain composure in challenging situations.',
          resourceUrl: 'https://www.apa.org/topics/stress/manage',
          estimatedTime: '20 minutes'
        },
        {
          id: 'eq-task-4-activity',
          type: 'activity',
          title: 'Stress Management Plan',
          description: 'Create a personal stress management plan for high-pressure situations in your restaurant. Include breathing techniques, mindfulness practices, and coping strategies.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'eq-task-5',
          type: 'activity',
          title: 'Team Emotional Climate Assessment',
          description: 'Assess the emotional climate of your team. Identify sources of stress, positive energy, and opportunities to improve team emotional well-being.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'eq-task-6',
          type: 'reflection',
          title: 'Emotional Intelligence Leadership Philosophy',
          description: 'Write a 1-page statement describing your approach to emotional intelligence in leadership. Include your beliefs about emotions in the workplace and how you will continue developing your EQ.',
          estimatedTime: '30 minutes'
        }
      ];
    }

    // Create enrollment with learning tasks
    const enrollment = new LeadershipProgress({
      user: req.user._id,
      planId,
      store: storeId, // Use the extracted storeId
      status: 'enrolled',
      progress: 0,
      enrolledAt: new Date(),
      learningTasks: learningTasks
    });

    await enrollment.save();

    res.status(201).json({
      message: 'Successfully enrolled in leadership plan',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in leadership plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's enrolled plans
router.get('/my-plans', auth, async (req, res) => {
  try {
    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in my-plans endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Fetching my plans for store ID:', storeId);

    const enrollments = await LeadershipProgress.find({
      user: req.user._id,
      store: storeId
    }).sort('-enrolledAt');

    // For now, we'll use the hardcoded plan data and combine with enrollment status
    const plans = [
      {
        id: 'heart-of-leadership',
        title: 'The Heart of Leadership',
        description: 'Build a foundation of character-based leadership focused on serving others first - the essential starting point for restaurant leaders.',
        isFree: true
      },
      {
        id: 'communication-influence',
        title: 'Communication & Influence Excellence',
        description: 'Master the art of clear communication and positive influence to inspire teams and drive results. This comprehensive 10-week plan develops both verbal and non-verbal communication skills essential for effective leadership.',
        isFree: false
      },
      {
        id: 'restaurant-culture-builder',
        title: 'Restaurant Culture Builder',
        description: 'Create a positive, high-performing restaurant culture where team members thrive and guests receive exceptional service.',
        isFree: false
      },
      {
        id: 'team-development',
        title: 'Team Development Expert',
        description: 'Build a high-performing restaurant team by mastering the art of hiring, training, and developing exceptional team members.',
        isFree: false
      },
      {
        id: 'strategic-leadership',
        title: 'Strategic Leadership Mastery',
        description: 'Develop strategic thinking, vision-setting, and decision-making capabilities to drive organizational success. This comprehensive plan builds the skills needed to think beyond day-to-day operations and lead with strategic purpose.',
        isFree: false
      },
      {
        id: 'operational-excellence',
        title: 'Operational Excellence Leader',
        description: 'Drive efficiency, quality, and continuous improvement in restaurant operations. This comprehensive 10-week plan equips you with the tools and mindset to optimize processes and deliver consistent results.',
        isFree: false
      },
      {
        id: 'innovation-change',
        title: 'Innovation & Change Champion',
        description: 'Lead innovation initiatives and guide teams through change with confidence. This comprehensive 9-week plan develops the skills needed to foster creativity, adapt to change, and drive continuous improvement.',
        isFree: false
      },
      {
        id: 'customer-experience',
        title: 'Customer Experience Leader',
        description: 'Excel at creating exceptional customer experiences and building a hospitality-focused culture. This comprehensive 8-week plan develops the skills needed to consistently deliver outstanding service and recover from service failures.',
        isFree: false
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution & Problem Solving',
        description: 'Master the skills to resolve conflicts constructively and solve complex problems effectively. This comprehensive 9-week plan equips you with tools to handle difficult conversations and find win-win solutions.',
        isFree: false
      },
      {
        id: 'emotional-intelligence',
        title: 'Emotional Intelligence Leader',
        description: 'Develop emotional intelligence to better understand yourself and others, build stronger relationships, and lead with empathy. This comprehensive 10-week plan focuses on self-awareness, social skills, and emotional regulation.',
        isFree: false
      }
    ];

    const myPlans = enrollments.map(enrollment => {
      const planData = plans.find(p => p.id === enrollment.planId) || {
        title: 'Unknown Plan',
        description: 'Plan details not available'
      };

      return {
        ...planData,
        enrollmentId: enrollment._id,
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt
      };
    });

    res.json(myPlans);
  } catch (error) {
    console.error('Error fetching enrolled plans:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update plan progress
router.patch('/my-plans/:planId/progress', auth, async (req, res) => {
  try {
    const { planId } = req.params;
    const { progress, status, activityUpdates } = req.body;

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in progress endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Updating progress for store ID:', storeId);

    const enrollment = await LeadershipProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Only allow starting a plan (enrolled -> in-progress) or updating activity progress
    // Do not allow manual completion - completion should only happen through task completion
    if (status === 'completed') {
      return res.status(400).json({
        message: 'Plans can only be completed by finishing all required tasks. Please complete your tasks to finish the plan.'
      });
    }

    // Update progress if provided
    if (progress !== undefined) {
      enrollment.progress = progress;
    }

    // Update status if provided
    if (status) {
      enrollment.status = status;

      // If status is completed, set completedAt
      if (status === 'completed' && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }
    }

    // Update activities if provided
    if (activityUpdates && activityUpdates.length > 0) {
      activityUpdates.forEach(update => {
        const activityIndex = enrollment.activityProgress.findIndex(
          a => a.activityId === update.activityId
        );

        if (activityIndex >= 0) {
          // Update existing activity
          enrollment.activityProgress[activityIndex] = {
            ...enrollment.activityProgress[activityIndex],
            ...update,
            ...(update.status === 'completed' && { completedAt: new Date() }),
            ...(update.status === 'in-progress' && !enrollment.activityProgress[activityIndex].startedAt && { startedAt: new Date() })
          };
        } else if (update.activityId) {
          // Add new activity progress
          enrollment.activityProgress.push({
            activityId: update.activityId,
            title: update.title || 'Activity',
            status: update.status || 'not-started',
            ...(update.status === 'completed' && { completedAt: new Date() }),
            ...(update.status === 'in-progress' && { startedAt: new Date() })
          });
        }
      });
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error updating plan progress:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update task completion status
router.patch('/my-plans/:planId/tasks/:taskId', auth, async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { completed, notes, evidence } = req.body;

    // Debug logging
    console.log('Server received request body:', {
      completed,
      notes,
      evidence,
      completedType: typeof completed,
      notesType: typeof notes,
      evidenceType: typeof evidence,
      fullBody: req.body
    });

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in task completion endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Updating task for store ID:', storeId);

    const enrollment = await LeadershipProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Find the task
    const taskIndex = enrollment.learningTasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task
    enrollment.learningTasks[taskIndex].completed = completed;

    if (completed) {
      // When marking as complete, require evidence for certain task types
      const taskType = enrollment.learningTasks[taskIndex].type;
      const taskTitle = enrollment.learningTasks[taskIndex].title;

      // Special handling for "The Art of Feedback" task - allow saving progress without evidence
      const isFeedbackTask = taskTitle === 'The Art of Feedback';

      if (['reading', 'video', 'reflection', 'assessment'].includes(taskType) && !evidence && !isFeedbackTask) {
        return res.status(400).json({
          message: `Evidence of completion is required for ${taskType} tasks`
        });
      }

      enrollment.learningTasks[taskIndex].completedAt = new Date();

      // Update evidence and notes
      if (evidence) {
        enrollment.learningTasks[taskIndex].evidence = evidence;
      }

      if (notes) {
        enrollment.learningTasks[taskIndex].notes = notes;
      }
    } else {
      // When marking as incomplete, clear completion data
      enrollment.learningTasks[taskIndex].completedAt = undefined;
      enrollment.learningTasks[taskIndex].evidence = '';
      enrollment.learningTasks[taskIndex].notes = '';
    }

    // Save the enrollment (progress will be auto-calculated in pre-save hook)
    await enrollment.save();

    res.json({
      message: 'Task updated successfully',
      task: enrollment.learningTasks[taskIndex],
      progress: enrollment.progress,
      status: enrollment.status
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get tasks for a plan
router.get('/my-plans/:planId/tasks', auth, async (req, res) => {
  try {
    const { planId } = req.params;

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in get tasks endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Fetching tasks for store ID:', storeId);

    const enrollment = await LeadershipProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({
      tasks: enrollment.learningTasks,
      progress: enrollment.progress,
      status: enrollment.status
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an enrollment (for development/testing purposes)
router.delete('/my-plans/:planId', auth, async (req, res) => {
  try {
    const { planId } = req.params;

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in delete enrollment endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Deleting enrollment for store ID:', storeId);

    const result = await LeadershipProgress.deleteOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update tasks for an existing enrollment (for development/testing purposes)
router.post('/my-plans/:planId/update-tasks', auth, async (req, res) => {
  try {
    const { planId } = req.params;

    // Extract the store ID using the utility function
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      console.error('Failed to extract store ID in update-tasks endpoint');
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    console.log('Updating tasks for store ID:', storeId);

    const enrollment = await LeadershipProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Get the current completion status of tasks
    const completionStatus = {};
    enrollment.learningTasks.forEach(task => {
      completionStatus[task.id] = {
        completed: task.completed,
        completedAt: task.completedAt,
        evidence: task.evidence,
        notes: task.notes
      };
    });

    // Debug logging
    console.log('Completion status before update:', JSON.stringify(completionStatus, null, 2));

    // Define new learning tasks based on the plan
    let learningTasks = [];

    if (planId === 'heart-of-leadership') {
      learningTasks = [
        {
          id: 'heart-task-1',
          type: 'video',
          title: 'Introduction to Servant Leadership',
          description: 'Watch this video to understand the core principles of servant leadership and how it applies in a restaurant setting. Take notes on how you can apply these principles in your daily interactions with team members.',
          resourceUrl: 'https://www.youtube.com/watch?v=vA8D-LGnpxk',
          estimatedTime: '15 minutes'
        },
        {
          id: 'heart-task-2a',
          type: 'reading',
          title: 'The Heart of Leadership: Introduction & Chapter 1',
          description: 'Read the Introduction and Chapter 1 of "The Heart of Leadership" by Mark Miller. Focus on understanding the difference between capacity and character in leadership. Write down what it means that people follow others because of who they are, not just the skills they have.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2a-activity',
          type: 'activity',
          title: 'Character vs. Capacity Assessment',
          description: 'Create a two-column list with "Character" and "Capacity" as headers. Under each, list 5 specific traits or skills you currently possess. Then identify which character traits you need to develop further to become a more effective leader. Share this assessment with your manager or mentor for feedback.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-2b',
          type: 'reading',
          title: 'The Heart of Leadership: Think Others First',
          description: 'Read the chapter on "Think Others First" from "The Heart of Leadership" by Mark Miller. Identify specific examples of how you can demonstrate selfless leadership in your restaurant. How can you put team members\'s needs before your own in practical ways?',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2b-activity',
          type: 'activity',
          title: 'Team Member Needs Assessment',
          description: 'During your next shift, have a brief one-on-one conversation with 3-5 team members asking: "What\'s one thing I could do to make your job easier or better?" Document their responses and create an action plan to address at least two of their needs within the next week. Report back on what you did and the results.',
          estimatedTime: '1 hour (across one shift)'
        },
        {
          id: 'heart-task-2c',
          type: 'reading',
          title: 'The Heart of Leadership: Expect the Best',
          description: 'Read the chapter on "Expect the Best" from "The Heart of Leadership" by Mark Miller. Reflect on how your expectations of your team affect their performance. Identify one team member who might benefit from you having higher expectations of them.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2c-activity',
          type: 'activity',
          title: 'Raising Expectations Conversation',
          description: 'Select one team member who has potential to grow. Have a structured conversation with them about their capabilities and your belief in them. Set a specific, challenging but achievable goal together. Document the conversation and the goal you set. Follow up in two weeks to check progress and provide encouragement.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'heart-task-2d',
          type: 'reading',
          title: 'The Heart of Leadership: Respond with Courage',
          description: 'Read the chapter on "Respond with Courage" from "The Heart of Leadership" by Mark Miller. Identify a situation in your restaurant that requires a courageous response from you as a leader. What specific actions will you take?',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '30-45 minutes'
        },
        {
          id: 'heart-task-2d-activity',
          type: 'activity',
          title: 'Courageous Conversation',
          description: 'Identify a difficult conversation you\'ve been avoiding or a problem you\'ve been hesitant to address. Create a plan for how you will approach this situation with courage, including specific talking points. Have the conversation within the next week and document what happened, how you felt, and what you learned from the experience.',
          estimatedTime: '1 hour'
        },
        {
          id: 'heart-task-2e',
          type: 'reading',
          title: 'The Heart of Leadership: Think Long-term & Display Humility',
          description: 'Complete the remaining chapters of "The Heart of Leadership" focusing on thinking long-term and displaying humility. Note specific examples of how these traits manifest in effective leaders.',
          resourceUrl: 'https://www.amazon.com/Heart-Leadership-Becoming-People-Follow/dp/1609949641',
          estimatedTime: '45-60 minutes'
        },
        {
          id: 'heart-task-2e-activity',
          type: 'activity',
          title: 'Long-term Vision & Humility in Action',
          description: 'Create a 90-day development plan for your team that demonstrates long-term thinking. Then, identify one area where you need to grow as a leader and ask a team member for honest feedback about your performance in this area. Document both the plan and what you learned from the feedback.',
          estimatedTime: '1 hour'
        },
        {
          id: 'heart-task-2f-activity',
          type: 'activity',
          title: 'Leadership Character Integration Plan',
          description: 'Create a personal action plan with specific ways you will apply all five character traits (Think Others First, Expect the Best, Respond with Courage, Think Long-term, Display Humility) in your leadership role over the next 30 days. Include at least one specific action for each trait and how you will measure success.',
          estimatedTime: '45-60 minutes'
        },
        {
          id: 'heart-task-3-video',
          type: 'video',
          title: 'The Power of Vulnerability in Leadership',
          description: 'Watch Brené Brown\'s TED Talk on vulnerability and reflect on how showing appropriate vulnerability can strengthen your leadership. Write down 2-3 ways you can be more authentic with your team.',
          resourceUrl: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-3-activity',
          type: 'activity',
          title: 'Authentic Leadership Moment',
          description: 'Plan and execute one "authentic leadership moment" with your team where you demonstrate appropriate vulnerability. This could be sharing a mistake you made and what you learned, asking for help in an area where you\'re not strong, or admitting when you don\'t have all the answers. Document what happened and how your team responded.',
          estimatedTime: '30 minutes'
        },
        {
          id: 'heart-task-4-activity',
          type: 'activity',
          title: 'Active Listening Practice',
          description: 'During your next shift, practice these active listening techniques with at least three team members: 1) Maintain eye contact, 2) Ask clarifying questions, 3) Paraphrase what you heard, 4) Avoid interrupting. For each conversation, write down one new insight you gained about the team member or their perspective that you wouldn\'t have learned without active listening.',
          estimatedTime: '1 hour (during one shift)'
        },
        {
          id: 'heart-task-5-activity',
          type: 'activity',
          title: 'Servant Leadership in Action',
          description: 'Identify one operational challenge your team is facing. Instead of directing a solution, gather input from team members who are closest to the issue. Implement their ideas and document the results. Reflect on how this approach differs from a top-down approach and what you learned from the experience.',
          estimatedTime: '2 hours (across multiple days)'
        },
        {
          id: 'heart-task-6-assessment',
          type: 'assessment',
          title: 'Leadership Self-Assessment',
          description: 'Complete the leadership self-assessment worksheet to identify your strengths and areas for growth. Focus on the "character" section and identify one specific trait you want to develop further. Create a specific plan for how you will develop this trait over the next 30 days.',
          resourceUrl: 'https://www.mindtools.com/pages/article/newLDR_50.htm',
          estimatedTime: '45 minutes'
        },
        {
          id: 'heart-task-7-reflection',
          type: 'reflection',
          title: 'Leadership Legacy Statement',
          description: 'Write a 1-page statement describing the impact you want to have as a leader. What do you want team members to say about your leadership when you\'re not in the room? How do you want to be remembered as a leader? Include specific examples of behaviors that will help you create this legacy.',
          estimatedTime: '45 minutes'
        }
      ];
    } else if (planId === 'restaurant-culture-builder') {
      learningTasks = [
        {
          id: 'culture-task-1',
          type: 'video',
          title: 'Building a Positive Restaurant Culture',
          description: 'Watch this video on creating a positive workplace culture in restaurants. Focus on practical strategies for building team cohesion, improving communication, and creating an environment where team members want to work.',
          resourceUrl: 'https://www.youtube.com/watch?v=fLanvSTCqpE',
          estimatedTime: '20 minutes'
        },
        {
          id: 'culture-task-2',
          type: 'reading',
          title: 'The Culture Map for Restaurants',
          description: 'Read this article on understanding and mapping your restaurant\'s current culture. Learn how to identify cultural strengths and areas for improvement, and how to create a plan for positive cultural change.',
          resourceUrl: 'https://hbr.org/2013/05/what-is-organizational-culture',
          estimatedTime: '25 minutes'
        },
        {
          id: 'culture-task-3',
          type: 'activity',
          title: 'Culture Assessment Exercise',
          description: 'Complete a comprehensive assessment of your restaurant\'s current culture. Evaluate team dynamics, communication patterns, leadership effectiveness, and guest service standards. Identify 3 key areas for improvement.',
          estimatedTime: '1 hour'
        },
        {
          id: 'culture-task-4',
          type: 'assessment',
          title: 'Team Experience Survey',
          description: 'Create and distribute a brief anonymous survey to team members asking about their experience working in your restaurant. Include questions about team support, leadership accessibility, growth opportunities, and overall satisfaction. Analyze results and identify 3 key insights.\n\n🎯 Use our built-in Team Experience Survey feature to create, distribute, and analyze your survey results.',
          resourceUrl: '/team-surveys/new',
          estimatedTime: '2 hours'
        },
        {
          id: 'culture-task-5',
          type: 'activity',
          title: 'Team Values Workshop',
          description: 'Conduct a 30-minute workshop with your team to identify and define your shared values. Use the "Start, Stop, Continue" framework to identify behaviors that align with these values. Create visual reminders of these values to display in team areas.\n\n🛠️ Use the interactive workshop tool to facilitate your team session\n👀 View the example to see a completed workshop for a Chick-fil-A team',
          resourceUrl: '/templates/team-values-workshop.html',
          exampleUrl: '/templates/team-values-workshop-example.html',
          estimatedTime: '1.5 hours'
        },
        {
          id: 'culture-task-6',
          type: 'activity',
          title: 'Recognition Program Design',
          description: 'Design a simple team member recognition program that aligns with your restaurant values. Include both formal and informal recognition methods, peer-to-peer recognition, and ways to celebrate both individual and team achievements.',
          estimatedTime: '1 hour'
        },
        {
          id: 'culture-task-7',
          type: 'activity',
          title: 'Culture-Building Rituals',
          description: 'Implement three new team rituals that reinforce your desired culture: 1) A pre-shift huddle format that energizes the team, 2) A method for celebrating wins, and 3) A consistent approach to addressing challenges. Document these rituals and practice them for two weeks.',
          estimatedTime: '2 hours (across multiple shifts)'
        },
        {
          id: 'culture-task-8',
          type: 'reflection',
          title: 'Culture Leadership Plan',
          description: 'Create a 90-day culture leadership plan with specific actions you will take to strengthen your restaurant\'s culture. Include how you will model desired behaviors, reinforce values, and address cultural misalignments.\n\n📋 Use the blank template to create your own plan\n👀 View the example to see how a completed plan looks for a Chick-fil-A restaurant',
          resourceUrl: '/templates/90-day-culture-leadership-plan.html',
          exampleUrl: '/templates/90-day-culture-leadership-plan-example.html',
          estimatedTime: '1 hour'
        }
      ];
    } else if (planId === 'team-development') {
      learningTasks = [
        {
          id: 'team-task-1',
          type: 'video',
          title: 'Effective Coaching Techniques',
          description: 'Watch this video on coaching techniques specifically designed for restaurant team development. Focus on the difference between directing, coaching, and mentoring approaches and when to use each one.',
          resourceUrl: 'https://www.youtube.com/watch?v=R3sHXrjbT2s',
          estimatedTime: '25 minutes'
        },
        {
          id: 'team-task-2',
          type: 'reading',
          title: 'The Art of Feedback',
          description: 'Read this article on delivering effective feedback in fast-paced environments. Then practice the SBI (Situation-Behavior-Impact) feedback model by writing out 3 examples of feedback you need to deliver to team members. For each example, clearly identify: 1) The Situation (when/where), 2) The Behavior (what you observed), and 3) The Impact (effect on team/guests/operations). Write your 3 examples in the evidence section when marking this task complete.',
          resourceUrl: 'https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/',
          estimatedTime: '30 minutes'
        },
        {
          id: 'team-task-3',
          type: 'activity',
          title: 'Talent Assessment',
          description: 'Create a talent map of your team by placing each team member in one of four quadrants: 1) High performance/High potential, 2) High performance/Lower potential, 3) Lower performance/High potential, 4) Lower performance/Lower potential. Identify specific development actions for each quadrant.\n\n**QUADRANT EXAMPLES & DEVELOPMENT ACTIONS:**\n\n**1. HIGH PERFORMANCE/HIGH POTENTIAL (Stars)**\nExample: Sarah - Consistently exceeds guest service standards, shows leadership during rush periods, asks thoughtful questions about operations, and other team members naturally look to her for guidance.\n• Development Actions: Cross-train in multiple positions, assign mentoring responsibilities, include in leadership meetings, provide stretch assignments like leading team huddles, consider for promotion track\n\n**2. HIGH PERFORMANCE/LOWER POTENTIAL (Solid Performers)**\nExample: Mike - Reliable team member who consistently meets all standards, shows up on time, follows procedures perfectly, but prefers routine tasks and doesn\'t seek additional responsibilities.\n• Development Actions: Recognize and reward consistency, use as trainer for new hires, provide opportunities to specialize in their strength areas, focus on job enrichment rather than advancement\n\n**3. LOWER PERFORMANCE/HIGH POTENTIAL (Diamonds in the Rough)**\nExample: Jessica - New team member who sometimes struggles with speed during rush but shows great attitude, asks lots of questions, volunteers for extra tasks, and demonstrates strong problem-solving when given time.\n• Development Actions: Provide intensive coaching and mentoring, pair with high performers, set clear short-term goals, give frequent feedback, invest in additional training, be patient with development timeline\n\n**4. LOWER PERFORMANCE/LOWER POTENTIAL (Needs Basic Development)**\nExample: Alex - Struggles to meet basic job requirements, frequently late, needs constant reminders about procedures, shows little initiative or interest in improvement.\n• Development Actions: Provide clear expectations and consequences, implement performance improvement plan, consider role fit assessment, provide basic skills training, set minimum performance standards with timeline',
          estimatedTime: '1 hour'
        },
        {
          id: 'team-task-4',
          type: 'activity',
          title: 'GROW Coaching Conversation',
          description: 'Conduct a coaching conversation with a team member using the GROW model (Goal, Reality, Options, Will/Way Forward). Document the conversation and reflect on what went well and what you would do differently next time.',
          estimatedTime: '45 minutes'
        },
        {
          id: 'team-task-5',
          type: 'activity',
          title: 'Development Plan Creation',
          description: 'Create a detailed 90-day development plan for a high-potential team member. Include specific skills to develop, learning resources, on-the-job experiences, and regular check-in points. Share this plan with the team member and refine it based on their input.',
          estimatedTime: '1 hour'
        },
        {
          id: 'team-task-6',
          type: 'activity',
          title: 'Training Effectiveness Audit',
          description: 'Observe 3 different team members who were recently trained on a procedure. Note variations in execution and identify potential gaps in the training approach. Create a plan to address these gaps and standardize training outcomes.',
          estimatedTime: '2 hours (across multiple shifts)'
        },
        {
          id: 'team-task-7',
          type: 'activity',
          title: 'Skill-Building Workshop',
          description: 'Design and deliver a 15-minute skill-building session for your team on a topic where performance could be improved (e.g., guest recovery, suggestive selling, teamwork during rush periods). Use the "Tell, Show, Do, Review" training method.',
          estimatedTime: '2 hours'
        },
        {
          id: 'team-task-8',
          type: 'reflection',
          title: 'Team Development Philosophy',
          description: 'Write a 1-page statement describing your philosophy on team development. Include your beliefs about how people learn and grow, your role as a developer of others, and the connection between team development and business results.',
          estimatedTime: '45 minutes'
        }
      ];
    }

    // Preserve completion status for existing tasks
    learningTasks = learningTasks.map(task => {
      if (completionStatus[task.id]) {
        const restoredTask = {
          ...task,
          completed: completionStatus[task.id].completed,
          completedAt: completionStatus[task.id].completedAt,
          evidence: completionStatus[task.id].evidence,
          notes: completionStatus[task.id].notes
        };

        // Debug logging for specific task
        if (task.id === 'team-task-2') {
          console.log('Restoring team-task-2:', {
            originalEvidence: completionStatus[task.id].evidence,
            restoredEvidence: restoredTask.evidence
          });
        }

        return restoredTask;
      }
      return task;
    });

    // Update the enrollment with new tasks
    enrollment.learningTasks = learningTasks;
    await enrollment.save();

    res.json({
      message: 'Tasks updated successfully',
      tasks: enrollment.learningTasks
    });
  } catch (error) {
    console.error('Error updating tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint to check store ID extraction
router.get('/debug-store-id', auth, async (req, res) => {
  try {
    // Get the raw store value
    const rawStore = req.user.store;

    // Get the extracted store ID
    const extractedStoreId = extractStoreId(req.user);

    // Get user details
    const user = await User.findById(req.user._id).select('-password');

    // Find subscription
    const subscription = extractedStoreId
      ? await StoreSubscription.findOne({ store: extractedStoreId })
      : null;

    // Return debug info
    res.json({
      rawStore: {
        type: typeof rawStore,
        value: rawStore,
        stringified: String(rawStore),
        hasIdProperty: typeof rawStore === 'object' && rawStore !== null && '_id' in rawStore,
        idValue: typeof rawStore === 'object' && rawStore !== null && rawStore._id ? rawStore._id : null
      },
      extractedStoreId,
      user,
      subscription,
      hasActiveSubscription: subscription ?
        (subscription.subscriptionStatus === 'active' && subscription.features.leadershipPlans) : false,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    console.error('Error in debug-store-id endpoint:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Playbook Routes
// Get all playbooks for the store
router.get('/playbooks', auth, checkSubscription, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const { category, targetRole, published } = req.query;

    const filter = { store: storeId };
    if (category) filter.category = category;
    if (targetRole) filter.targetRole = targetRole;
    if (published !== undefined) filter.isPublished = published === 'true';

    const playbooks = await Playbook.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(playbooks);
  } catch (error) {
    logger.error('Error fetching playbooks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific playbook
router.get('/playbooks/:id', auth, checkSubscription, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const playbook = await Playbook.findOne({
      _id: req.params.id,
      store: storeId
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }

    // Track view
    playbook.viewCount += 1;

    // Update last viewed by user
    const existingView = playbook.lastViewedBy.find(
      view => view.user.toString() === req.user._id.toString()
    );

    if (existingView) {
      existingView.viewedAt = new Date();
    } else {
      playbook.lastViewedBy.push({
        user: req.user._id,
        viewedAt: new Date()
      });
    }

    await playbook.save();

    res.json(playbook);
  } catch (error) {
    logger.error('Error fetching playbook:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new playbook
router.post('/playbooks', auth, checkSubscription, isManager, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const {
      title,
      subtitle,
      description,
      category,
      targetRole,
      contentBlocks,
      isPublished,
      tags
    } = req.body;

    const playbook = new Playbook({
      title,
      subtitle,
      description,
      store: storeId,
      category: category || 'Leadership',
      targetRole: targetRole || 'All',
      contentBlocks: contentBlocks || [],
      isPublished: isPublished || false,
      tags: tags || [],
      createdBy: req.user._id
    });

    await playbook.save();
    await playbook.populate('createdBy', 'name email');

    res.status(201).json(playbook);
  } catch (error) {
    logger.error('Error creating playbook:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a playbook
router.put('/playbooks/:id', auth, checkSubscription, isManager, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const {
      title,
      subtitle,
      description,
      category,
      targetRole,
      contentBlocks,
      isPublished,
      tags
    } = req.body;

    const playbook = await Playbook.findOne({
      _id: req.params.id,
      store: storeId
    });

    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }

    // Update fields
    if (title !== undefined) playbook.title = title;
    if (subtitle !== undefined) playbook.subtitle = subtitle;
    if (description !== undefined) playbook.description = description;
    if (category !== undefined) playbook.category = category;
    if (targetRole !== undefined) playbook.targetRole = targetRole;
    if (contentBlocks !== undefined) playbook.contentBlocks = contentBlocks;
    if (isPublished !== undefined) playbook.isPublished = isPublished;
    if (tags !== undefined) playbook.tags = tags;

    playbook.updatedBy = req.user._id;

    await playbook.save();
    await playbook.populate(['createdBy', 'updatedBy'], 'name email');

    res.json(playbook);
  } catch (error) {
    logger.error('Error updating playbook:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a playbook
router.delete('/playbooks/:id', auth, checkSubscription, isManager, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const playbook = await Playbook.findOne({
      _id: req.params.id,
      store: storeId
    });

    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }

    await Playbook.deleteOne({ _id: req.params.id });

    res.json({ message: 'Playbook deleted successfully' });
  } catch (error) {
    logger.error('Error deleting playbook:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Duplicate a playbook
router.post('/playbooks/:id/duplicate', auth, checkSubscription, isManager, async (req, res) => {
  try {
    const storeId = extractStoreId(req.user);
    const originalPlaybook = await Playbook.findOne({
      _id: req.params.id,
      store: storeId
    });

    if (!originalPlaybook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }

    const duplicatedPlaybook = new Playbook({
      title: `${originalPlaybook.title} (Copy)`,
      subtitle: originalPlaybook.subtitle,
      description: originalPlaybook.description,
      store: storeId,
      category: originalPlaybook.category,
      targetRole: originalPlaybook.targetRole,
      contentBlocks: originalPlaybook.contentBlocks,
      isPublished: false, // Always start as draft
      tags: originalPlaybook.tags,
      createdBy: req.user._id
    });

    await duplicatedPlaybook.save();
    await duplicatedPlaybook.populate('createdBy', 'name email');

    res.status(201).json(duplicatedPlaybook);
  } catch (error) {
    logger.error('Error duplicating playbook:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router