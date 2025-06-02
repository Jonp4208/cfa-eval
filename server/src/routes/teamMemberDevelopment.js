import express from 'express'
import { auth } from '../middleware/auth.js'
import mongoose from 'mongoose'
import { StoreSubscription } from '../models/index.js'
import TeamMemberPlan from '../models/TeamMemberPlan.js'
import TeamMemberProgress from '../models/TeamMemberProgress.js'
import User from '../models/User.js'
import logger from '../utils/logger.js'
import { isManager, isDirector } from '../middleware/roles.js'

const router = express.Router()

// Helper function to extract store ID
const extractStoreId = (user) => {
  if (!user) return null;

  if (user.store) {
    if (typeof user.store === 'string') return user.store;
    if (user.store._id) return user.store._id;
    if (user.store.$oid) return user.store.$oid;
  }

  return null;
};

// Check subscription middleware
const checkSubscription = async (req, res, next) => {
  try {
    const storeId = extractStoreId(req.user);

    if (!storeId) {
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    const subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      // If no subscription exists, create a default one with all features enabled
      const newSubscription = await StoreSubscription.create({
        store: storeId,
        subscriptionStatus: 'active',
        features: {
          fohTasks: true,
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
      req.hasActiveSubscription = true;
    } else {
      // Check if leadership feature is enabled (team member development is part of leadership)
      req.hasActiveSubscription = subscription.subscriptionStatus === 'active' &&
                                  (subscription.features?.leadership === true || subscription.features?.leadershipPlans === true);
    }

    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

// Get all available team member development plans
router.get('/plans', auth, checkSubscription, async (req, res) => {
  try {
    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    // For now, return hardcoded plans - later we can store these in database
    const plans = [
      {
        id: 'growth-mindset-champion',
        title: 'Growth Mindset Champion',
        description: 'Develop a growth mindset that embraces challenges and sees failures as learning opportunities. Perfect for team members who want to continuously improve and help create a positive restaurant culture.',
        estimatedWeeks: 4,
        book: {
          title: 'Mindset: The New Psychology of Success',
          author: 'Carol S. Dweck',
          description: 'Learn the difference between fixed and growth mindsets and how to develop resilience in fast-paced restaurant environments.'
        },
        chickFilAFocus: 'Building resilience during rush periods and embracing feedback as a tool for growth'
      },
      {
        id: 'second-mile-service',
        title: 'Second Mile Service Excellence',
        description: 'Master the art of going above and beyond for every guest. Learn how small actions create memorable experiences that keep customers coming back to Chick-fil-A.',
        estimatedWeeks: 6,
        book: {
          title: 'The Fred Factor',
          author: 'Mark Sanborn',
          description: 'Discover how ordinary people can achieve extraordinary results through exceptional service and attention to detail.'
        },
        chickFilAFocus: 'Implementing "My Pleasure" culture and creating wow moments for guests'
      },
      {
        id: 'team-unity-builder',
        title: 'Team Unity Builder',
        description: 'Learn how to support teammates, communicate effectively, and contribute to a positive team environment during busy shifts and challenging situations.',
        estimatedWeeks: 4,
        book: {
          title: 'The Five Dysfunctions of a Team',
          author: 'Patrick Lencioni',
          description: 'Understand what makes teams work well together and how to avoid common pitfalls that hurt team performance.'
        },
        chickFilAFocus: 'Supporting teammates during rush periods and maintaining positive communication'
      },
      {
        id: 'ownership-initiative',
        title: 'Ownership & Initiative',
        description: 'Develop personal responsibility and learn to take initiative in solving problems and improving restaurant operations without being asked.',
        estimatedWeeks: 5,
        book: {
          title: 'The Oz Principle',
          author: 'Roger Connors',
          description: 'Learn how to take ownership of results and develop accountability that drives restaurant success.'
        },
        chickFilAFocus: 'Taking ownership of guest experience and restaurant cleanliness standards'
      },
      {
        id: 'continuous-improvement',
        title: 'Continuous Improvement Mindset',
        description: 'Build daily habits that improve service quality and develop systems thinking to make the restaurant run more smoothly.',
        estimatedWeeks: 6,
        book: {
          title: 'Atomic Habits',
          author: 'James Clear',
          description: 'Learn how small, consistent improvements in daily habits lead to remarkable results over time.'
        },
        chickFilAFocus: 'Developing habits that improve speed of service and food quality consistency'
      },
      {
        id: 'positive-energy-creator',
        title: 'Positive Energy Creator',
        description: 'Learn to maintain enthusiasm and create positive energy that spreads to teammates and guests, even during challenging shifts.',
        estimatedWeeks: 4,
        book: {
          title: 'The Energy Bus',
          author: 'Jon Gordon',
          description: 'Discover how to fuel your life, work, and team with positive energy that overcomes challenges.'
        },
        chickFilAFocus: 'Maintaining positive attitude during busy periods and spreading joy to guests'
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Error fetching team member plans:', error);
    res.status(500).json({ message: 'Error fetching development plans' });
  }
});

// Get team member's enrolled plans and progress
router.get('/my-plans', auth, checkSubscription, async (req, res) => {
  try {
    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    const enrollments = await TeamMemberProgress.find({
      user: req.user._id,
      store: storeId
    }).populate('assignedBy', 'name position')
      .populate('manager', 'name position')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching team member progress:', error);
    res.status(500).json({ message: 'Error fetching your development plans' });
  }
});

// Enroll team member in a development plan (managers/directors or self-enrollment)
router.post('/plans/:planId/enroll/:userId', auth, checkSubscription, async (req, res) => {
  try {
    const { planId, userId } = req.params;

    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    // Check if this is self-enrollment or manager enrollment
    const isSelfEnrollment = userId === req.user._id.toString();

    // Verify the user exists and is in the same store
    let teamMember;
    if (isSelfEnrollment) {
      // For self-enrollment, just verify the user is a team member
      if (req.user.position !== 'Team Member') {
        return res.status(403).json({
          message: 'Only team members can self-enroll in development plans'
        });
      }
      teamMember = req.user;
    } else {
      // For manager enrollment, verify they have permission and the target is a team member
      if (!['Manager', 'Director', 'Leader'].includes(req.user.position)) {
        return res.status(403).json({
          message: 'Only managers and directors can enroll other team members'
        });
      }

      teamMember = await User.findOne({
        _id: userId,
        store: storeId,
        position: 'Team Member'
      });

      if (!teamMember) {
        return res.status(404).json({
          message: 'Team member not found or not in your store'
        });
      }
    }

    // Check if already enrolled
    const existingEnrollment = await TeamMemberProgress.findOne({
      user: userId,
      planId,
      store: storeId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: 'Team member is already enrolled in this plan'
      });
    }

    // Create learning tasks based on plan
    let learningTasks = [];

    if (planId === 'growth-mindset-champion') {
      learningTasks = [
        {
          id: 'gmc-task-1',
          type: 'video',
          title: 'The Power of Yet',
          description: 'Watch this introduction to growth mindset and the power of adding "yet" to your vocabulary.',
          resourceUrl: 'https://www.youtube.com/watch?v=J-swZaKN2Ic',
          estimatedTime: '10 minutes',
          chickFilAExample: 'Instead of "I can\'t handle the breakfast rush," try "I can\'t handle the breakfast rush YET."'
        },
        {
          id: 'gmc-task-2',
          type: 'reading',
          title: 'Mindset: Chapter 1 - The Mindsets',
          description: 'Read the first chapter to understand the difference between fixed and growth mindsets.',
          estimatedTime: '30 minutes',
          chickFilAExample: 'Think about how you approach learning new positions at Chick-fil-A - do you see challenges as threats or opportunities?'
        },
        {
          id: 'gmc-task-3',
          type: 'reflection',
          title: 'Growth Mindset Self-Assessment',
          description: 'Reflect on your current mindset and identify areas where you can develop a more growth-oriented approach.',
          estimatedTime: '20 minutes',
          chickFilAExample: 'Consider a recent challenging situation at work - how could a growth mindset have helped you handle it differently?'
        },
        {
          id: 'gmc-task-4',
          type: 'activity',
          title: 'Failure Learning Journal',
          description: 'Start a daily practice of writing down one mistake or challenge and what you learned from it.',
          estimatedTime: '5 minutes daily',
          chickFilAExample: 'If you mess up an order, write down what happened and how you can prevent it next time.'
        },
        {
          id: 'gmc-task-5',
          type: 'video',
          title: 'Grit: The Power of Passion and Perseverance',
          description: 'Learn about the importance of persistence and passion in achieving long-term goals.',
          resourceUrl: 'https://www.youtube.com/watch?v=H14bBuluwB8',
          estimatedTime: '20 minutes',
          chickFilAExample: 'Think about how grit applies to mastering your position and providing excellent service consistently.'
        },
        {
          id: 'gmc-task-6',
          type: 'reflection',
          title: 'Growth Mindset Action Plan',
          description: 'Create a personal action plan for developing a stronger growth mindset in your daily work.',
          estimatedTime: '25 minutes',
          chickFilAExample: 'Set specific goals for how you\'ll embrace challenges and seek feedback at Chick-fil-A.'
        }
      ];
    } else if (planId === 'second-mile-service') {
      learningTasks = [
        {
          id: 'sms-task-1',
          type: 'video',
          title: 'The Fred Factor Introduction',
          description: 'Learn the four principles of The Fred Factor and how ordinary people achieve extraordinary results.',
          resourceUrl: 'https://www.youtube.com/watch?v=f5Z2WlRqiOI',
          estimatedTime: '15 minutes',
          chickFilAExample: 'Think about how you can make every guest interaction memorable at Chick-fil-A.'
        },
        {
          id: 'sms-task-2',
          type: 'reading',
          title: 'The Fred Factor: Chapter 1-2',
          description: 'Read about the original Fred and the four principles that make the difference.',
          estimatedTime: '45 minutes',
          chickFilAExample: 'Consider how you can apply Fred\'s principles during busy lunch rushes.'
        },
        {
          id: 'sms-task-3',
          type: 'activity',
          title: 'Second Mile Service Challenge',
          description: 'For one week, find one way each day to go above and beyond for a guest.',
          estimatedTime: '10 minutes daily',
          chickFilAExample: 'Walk a guest to their table, remember a regular\'s order, or offer extra sauce without being asked.'
        },
        {
          id: 'sms-task-4',
          type: 'reflection',
          title: 'My Pleasure Philosophy',
          description: 'Write about what "My Pleasure" means to you and how you can embody this in every interaction.',
          estimatedTime: '20 minutes',
          chickFilAExample: 'Reflect on how saying "My Pleasure" with genuine enthusiasm can change a guest\'s day.'
        },
        {
          id: 'sms-task-5',
          type: 'video',
          title: 'Customer Service Excellence',
          description: 'Watch examples of exceptional customer service and identify key behaviors.',
          resourceUrl: 'https://www.youtube.com/watch?v=R35gWBtLCYg',
          estimatedTime: '12 minutes',
          chickFilAExample: 'Notice how small gestures create big impacts in the restaurant environment.'
        },
        {
          id: 'sms-task-6',
          type: 'activity',
          title: 'Guest Experience Improvement Plan',
          description: 'Create a plan for how you will consistently deliver second-mile service.',
          estimatedTime: '30 minutes',
          chickFilAExample: 'Identify specific actions you can take at each position to exceed guest expectations.'
        }
      ];
    } else if (planId === 'team-unity-builder') {
      learningTasks = [
        {
          id: 'tub-task-1',
          type: 'video',
          title: 'The Five Dysfunctions Overview',
          description: 'Learn about the five dysfunctions that prevent teams from working effectively together.',
          resourceUrl: 'https://www.youtube.com/watch?v=GCxct4CR-To',
          estimatedTime: '18 minutes',
          chickFilAExample: 'Think about how these dysfunctions might show up during busy shifts at Chick-fil-A.'
        },
        {
          id: 'tub-task-2',
          type: 'reading',
          title: 'Five Dysfunctions: The Fable',
          description: 'Read the fable portion to understand how dysfunction affects team performance.',
          estimatedTime: '60 minutes',
          chickFilAExample: 'Consider how trust and communication impact your team during rush periods.'
        },
        {
          id: 'tub-task-3',
          type: 'reflection',
          title: 'Team Assessment',
          description: 'Honestly assess your team\'s strengths and areas for improvement.',
          estimatedTime: '25 minutes',
          chickFilAExample: 'Evaluate how well your team communicates during shift changes and busy periods.'
        },
        {
          id: 'tub-task-4',
          type: 'activity',
          title: 'Support a Teammate Challenge',
          description: 'Each day for a week, actively help a teammate without being asked.',
          estimatedTime: '15 minutes daily',
          chickFilAExample: 'Help restock supplies, assist with difficult orders, or cover a position during breaks.'
        },
        {
          id: 'tub-task-5',
          type: 'video',
          title: 'Building Trust in Teams',
          description: 'Learn practical ways to build trust and improve team communication.',
          resourceUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
          estimatedTime: '14 minutes',
          chickFilAExample: 'Apply trust-building techniques during team meetings and daily interactions.'
        },
        {
          id: 'tub-task-6',
          type: 'reflection',
          title: 'Team Unity Action Plan',
          description: 'Create a personal plan for how you will contribute to better team unity.',
          estimatedTime: '30 minutes',
          chickFilAExample: 'Identify specific ways you can improve communication and support during shifts.'
        }
      ];
    } else if (planId === 'ownership-initiative') {
      learningTasks = [
        {
          id: 'oi-task-1',
          type: 'video',
          title: 'The Oz Principle Introduction',
          description: 'Learn about taking ownership and accountability for results.',
          resourceUrl: 'https://www.youtube.com/watch?v=8bfyS3pC-hs',
          estimatedTime: '16 minutes',
          chickFilAExample: 'Think about how taking ownership of guest satisfaction impacts the entire restaurant.'
        },
        {
          id: 'oi-task-2',
          type: 'reading',
          title: 'The Oz Principle: Chapters 1-3',
          description: 'Read about the accountability ladder and how to stay above the line.',
          estimatedTime: '50 minutes',
          chickFilAExample: 'Consider how you can stay "above the line" when facing challenges during busy shifts.'
        },
        {
          id: 'oi-task-3',
          type: 'reflection',
          title: 'Personal Accountability Assessment',
          description: 'Honestly assess areas where you can take more ownership in your work.',
          estimatedTime: '25 minutes',
          chickFilAExample: 'Identify situations where you might blame circumstances instead of taking ownership.'
        },
        {
          id: 'oi-task-4',
          type: 'activity',
          title: 'Initiative Challenge',
          description: 'For one week, identify and solve one problem each day without being asked.',
          estimatedTime: '20 minutes daily',
          chickFilAExample: 'Notice when supplies are low, clean areas that need attention, or help train new team members.'
        },
        {
          id: 'oi-task-5',
          type: 'video',
          title: 'Taking Initiative at Work',
          description: 'Learn practical ways to demonstrate initiative and ownership.',
          resourceUrl: 'https://www.youtube.com/watch?v=lmyZMtPVodo',
          estimatedTime: '11 minutes',
          chickFilAExample: 'Apply initiative-taking strategies to improve restaurant operations and guest experience.'
        },
        {
          id: 'oi-task-6',
          type: 'reflection',
          title: 'Ownership Action Plan',
          description: 'Create a plan for how you will consistently demonstrate ownership and initiative.',
          estimatedTime: '30 minutes',
          chickFilAExample: 'Define specific ways you will take ownership of your role and contribute to restaurant success.'
        }
      ];
    } else if (planId === 'continuous-improvement') {
      learningTasks = [
        {
          id: 'ci-task-1',
          type: 'video',
          title: 'Atomic Habits Overview',
          description: 'Learn how small habits compound to create remarkable results.',
          resourceUrl: 'https://www.youtube.com/watch?v=YT7tQzmGRLA',
          estimatedTime: '18 minutes',
          chickFilAExample: 'Think about small daily habits that could improve your performance at Chick-fil-A.'
        },
        {
          id: 'ci-task-2',
          type: 'reading',
          title: 'Atomic Habits: The Fundamentals',
          description: 'Read about the four laws of behavior change and habit formation.',
          estimatedTime: '60 minutes',
          chickFilAExample: 'Consider how you can apply the four laws to develop better work habits.'
        },
        {
          id: 'ci-task-3',
          type: 'activity',
          title: 'Habit Tracker Setup',
          description: 'Create a simple habit tracker for 3 work-related improvements.',
          estimatedTime: '15 minutes',
          chickFilAExample: 'Track habits like greeting every guest with a smile, checking cleanliness hourly, or helping teammates.'
        },
        {
          id: 'ci-task-4',
          type: 'reflection',
          title: 'Process Improvement Ideas',
          description: 'Identify 3 processes at work that could be improved and brainstorm solutions.',
          estimatedTime: '30 minutes',
          chickFilAExample: 'Look at order accuracy, speed of service, or team communication for improvement opportunities.'
        },
        {
          id: 'ci-task-5',
          type: 'video',
          title: 'Continuous Improvement Mindset',
          description: 'Learn about kaizen and the power of small, continuous improvements.',
          resourceUrl: 'https://www.youtube.com/watch?v=jq33zyXRdlQ',
          estimatedTime: '14 minutes',
          chickFilAExample: 'Apply kaizen principles to gradually improve your efficiency and quality at each position.'
        },
        {
          id: 'ci-task-6',
          type: 'activity',
          title: '30-Day Improvement Challenge',
          description: 'Implement one small improvement each week for a month and track results.',
          estimatedTime: '10 minutes daily',
          chickFilAExample: 'Focus on improvements like faster order taking, better food presentation, or cleaner workstations.'
        }
      ];
    } else if (planId === 'positive-energy-creator') {
      learningTasks = [
        {
          id: 'pec-task-1',
          type: 'video',
          title: 'The Energy Bus Principles',
          description: 'Learn the 10 rules for fueling your life, work, and team with positive energy.',
          resourceUrl: 'https://www.youtube.com/watch?v=kOHFz7hBzWI',
          estimatedTime: '15 minutes',
          chickFilAExample: 'Think about how your energy affects teammates and guests during busy shifts.'
        },
        {
          id: 'pec-task-2',
          type: 'reading',
          title: 'The Energy Bus: Rules 1-5',
          description: 'Read about taking control of your energy and choosing positivity.',
          estimatedTime: '45 minutes',
          chickFilAExample: 'Consider how you can be the driver of your own energy bus at Chick-fil-A.'
        },
        {
          id: 'pec-task-3',
          type: 'activity',
          title: 'Positive Energy Challenge',
          description: 'For one week, consciously bring positive energy to every interaction.',
          estimatedTime: 'Throughout shift',
          chickFilAExample: 'Smile genuinely, use encouraging words with teammates, and maintain enthusiasm even during rushes.'
        },
        {
          id: 'pec-task-4',
          type: 'reflection',
          title: 'Energy Audit',
          description: 'Assess what drains your energy and what gives you energy at work.',
          estimatedTime: '20 minutes',
          chickFilAExample: 'Identify specific situations or people that affect your energy and plan how to respond positively.'
        },
        {
          id: 'pec-task-5',
          type: 'video',
          title: 'Creating Positive Workplace Culture',
          description: 'Learn how individual positive energy contributes to team culture.',
          resourceUrl: 'https://www.youtube.com/watch?v=gF_qQYrIlak',
          estimatedTime: '12 minutes',
          chickFilAExample: 'Understand how your positive attitude can influence the entire restaurant atmosphere.'
        },
        {
          id: 'pec-task-6',
          type: 'reflection',
          title: 'Energy Action Plan',
          description: 'Create a personal plan for maintaining positive energy and spreading it to others.',
          estimatedTime: '25 minutes',
          chickFilAExample: 'Define specific strategies for staying positive during challenging shifts and helping teammates do the same.'
        }
      ];
    }

    // Create enrollment
    const enrollment = new TeamMemberProgress({
      user: userId,
      planId,
      store: storeId,
      status: 'enrolled',
      progress: 0,
      enrolledAt: new Date(),
      assignedBy: req.user._id,
      manager: isSelfEnrollment ? null : req.user._id, // No manager for self-enrollment
      learningTasks: learningTasks
    });

    await enrollment.save();

    res.status(201).json({
      message: 'Team member successfully enrolled in development plan',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling team member:', error);
    res.status(500).json({ message: 'Error enrolling team member in plan' });
  }
});

// Self-enroll in a development plan (team members only)
router.post('/plans/:planId/self-enroll', auth, checkSubscription, async (req, res) => {
  try {
    const { planId } = req.params;

    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    // Only allow team members to self-enroll
    if (req.user.position !== 'Team Member') {
      return res.status(403).json({
        message: 'Only team members can self-enroll in development plans'
      });
    }

    // Call the enrollment endpoint with the user's own ID
    const enrollmentReq = {
      ...req,
      params: {
        ...req.params,
        userId: req.user._id.toString()
      }
    };

    // Redirect to the enrollment route
    return res.redirect(307, `/api/team-member-development/plans/${planId}/enroll/${req.user._id}`);
  } catch (error) {
    console.error('Error in self-enrollment:', error);
    res.status(500).json({ message: 'Error enrolling in development plan' });
  }
});

// Get team member plan details with tasks
router.get('/plans/:planId/tasks', auth, checkSubscription, async (req, res) => {
  try {
    const { planId } = req.params;

    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    // Get the user's enrollment for this plan
    const enrollment = await TeamMemberProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({
        message: 'You are not enrolled in this development plan'
      });
    }

    res.json({
      planId,
      enrollment,
      tasks: enrollment.learningTasks
    });
  } catch (error) {
    console.error('Error fetching plan tasks:', error);
    res.status(500).json({ message: 'Error fetching plan tasks' });
  }
});

// Complete a learning task
router.post('/plans/:planId/tasks/:taskId/complete', auth, checkSubscription, async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { evidence, notes } = req.body;

    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    const enrollment = await TeamMemberProgress.findOne({
      user: req.user._id,
      planId,
      store: storeId
    });

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found'
      });
    }

    // Find and update the specific task
    const task = enrollment.learningTasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    task.completed = true;
    task.completedAt = new Date();
    task.evidence = evidence;
    task.notes = notes;

    // Calculate overall progress
    const completedTasks = enrollment.learningTasks.filter(t => t.completed).length;
    const totalTasks = enrollment.learningTasks.length;
    enrollment.progress = Math.round((completedTasks / totalTasks) * 100);

    // Update status if all tasks completed
    if (completedTasks === totalTasks) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    } else if (enrollment.status === 'enrolled') {
      enrollment.status = 'in-progress';
      enrollment.startedAt = new Date();
    }

    await enrollment.save();

    res.json({
      message: 'Task completed successfully',
      task,
      progress: enrollment.progress,
      status: enrollment.status
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Error completing task' });
  }
});

// Get team member development overview for managers/directors
router.get('/team-overview', auth, checkSubscription, isManager, async (req, res) => {
  try {
    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    // Get all team members in the store
    const teamMembers = await User.find({
      store: storeId,
      position: 'Team Member',
      status: 'active'
    }).select('name email position startDate');

    // Get all enrollments for team members
    const enrollments = await TeamMemberProgress.find({
      store: storeId
    }).populate('user', 'name email position startDate')
      .populate('assignedBy', 'name position')
      .sort({ enrolledAt: -1 });

    // Group enrollments by user
    const teamMemberProgress = teamMembers.map(member => {
      const memberEnrollments = enrollments.filter(e =>
        e.user._id.toString() === member._id.toString()
      );

      return {
        teamMember: member,
        enrollments: memberEnrollments,
        totalPlans: memberEnrollments.length,
        completedPlans: memberEnrollments.filter(e => e.status === 'completed').length,
        inProgressPlans: memberEnrollments.filter(e => e.status === 'in-progress').length
      };
    });

    res.json({
      teamMembers: teamMemberProgress,
      summary: {
        totalTeamMembers: teamMembers.length,
        enrolledMembers: teamMemberProgress.filter(tm => tm.totalPlans > 0).length,
        totalEnrollments: enrollments.length,
        completedPlans: enrollments.filter(e => e.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Error fetching team overview:', error);
    res.status(500).json({ message: 'Error fetching team development overview' });
  }
});

// Add manager note to team member's progress
router.post('/progress/:progressId/notes', auth, checkSubscription, isManager, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { content } = req.body;

    if (!req.hasActiveSubscription) {
      return res.status(403).json({
        message: 'Leadership subscription required for team member development'
      });
    }

    const storeId = extractStoreId(req.user);

    const progress = await TeamMemberProgress.findOne({
      _id: progressId,
      store: storeId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress record not found'
      });
    }

    progress.managerNotes.push({
      content,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await progress.save();

    res.json({
      message: 'Note added successfully',
      note: progress.managerNotes[progress.managerNotes.length - 1]
    });
  } catch (error) {
    console.error('Error adding manager note:', error);
    res.status(500).json({ message: 'Error adding note' });
  }
});

export default router
