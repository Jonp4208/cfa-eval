const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// import { NotificationService } from '../services/notificationService.js';
const { Employee, TrainingPlan, TrainingProgress } = require('../models');
const User = require('../models/user');

// Try to import CommunityPlan with error handling
let CommunityPlan = null;
try {
  CommunityPlan = require('../src/models/CommunityPlan');
  console.log('CommunityPlan model loaded successfully');
} catch (error) {
  console.error('Error loading CommunityPlan model:', error);
}

// Get all training plans
router.get('/plans', auth, async (req, res) => {
  try {
    const plans = await TrainingPlan.find().populate('modules');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching training plans' });
  }
});

// Get active training plans
router.get('/plans/active', auth, async (req, res) => {
  try {
    const plans = await TrainingPlan.find({ active: true }).populate('modules');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active training plans' });
  }
});

// Create a new training plan
router.post('/plans', auth, async (req, res) => {
  try {
    const plan = new TrainingPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Error creating training plan' });
  }
});

// Update a training plan
router.put('/plans/:id', auth, async (req, res) => {
  try {
    const plan = await TrainingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Error updating training plan' });
  }
});

// Delete a training plan
router.delete('/plans/:id', auth, async (req, res) => {
  try {
    const plan = await TrainingPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }
    res.json({ message: 'Training plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting training plan' });
  }
});

// Assign a training plan to an employee
router.post('/plans/assign', auth, async (req, res) => {
  try {
    const { employeeId, planId, startDate } = req.body;

    const employee = await User.findById(employeeId);
    const plan = await TrainingPlan.findById(planId).populate('modules');

    if (!employee || !plan) {
      return res.status(404).json({ message: 'Employee or plan not found' });
    }

    // Create initial progress entries for each module
    const moduleProgress = plan.modules.map(module => ({
      moduleId: module._id,
      completed: false,
      completionPercentage: 0
    }));

    // Create new training progress document
    const trainingProgress = new TrainingProgress({
      trainee: employee._id,
      trainingPlan: plan._id,
      startDate,
      assignedTrainer: req.user._id, // The person assigning the training
      status: 'IN_PROGRESS',
      moduleProgress,
      store: employee.store
    });

    await trainingProgress.save();

    // Add training progress to employee's training progress array
    employee.trainingProgress.push(trainingProgress._id);
    await employee.save();

    // Send notification
    await NotificationService.notifyTrainingAssigned(employee, plan, startDate);

    // Return the populated training progress
    const populatedProgress = await TrainingProgress.findById(trainingProgress._id)
      .populate('trainingPlan')
      .populate('trainee')
      .populate('assignedTrainer');

    res.json(populatedProgress);
  } catch (err) {
    console.error('Error assigning training plan:', err);
    res.status(400).json({ message: 'Error assigning training plan' });
  }
});

// Update training progress
router.post('/progress/update', auth, async (req, res) => {
  try {
    const { employeeId, moduleId, completed, notes } = req.body;

    const employee = await Employee.findById(employeeId).populate('trainingPlan');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update module progress
    const moduleIndex = employee.moduleProgress.findIndex(
      m => m.moduleId.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const wasCompleted = employee.moduleProgress[moduleIndex].completed;
    employee.moduleProgress[moduleIndex].completed = completed;
    employee.moduleProgress[moduleIndex].notes = notes;

    await employee.save();

    // Send notifications if module was just completed
    if (completed && !wasCompleted) {
      const module = employee.trainingPlan.modules.find(
        m => m._id.toString() === moduleId
      );
      await NotificationService.notifyModuleCompleted(employee, module);

      // Check if all modules are completed
      const allCompleted = employee.moduleProgress.every(m => m.completed);
      if (allCompleted) {
        await NotificationService.notifyTrainingCompleted(employee, employee.trainingPlan);
      }
    }

    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: 'Error updating training progress' });
  }
});

// Get employee training progress
router.get('/employees/training-progress', auth, async (req, res) => {
  try {
    console.log('Fetching employees for store:', req.user.store._id);
    const employees = await User.find({
      store: req.user.store._id,
      status: 'active'
    })
      .populate({
        path: 'trainingProgress',
        populate: [{
          path: 'trainingPlan',
          populate: {
            path: 'modules',
            select: 'name position completed'
          }
        }],
        select: 'status moduleProgress startDate trainingPlan'
      })
      .select('name position departments role trainingProgress')
      .sort({ name: 1 });

    console.log('Found employees:', employees.length);
    console.log('Employee details:', employees.map(e => ({ 
      name: e.name, 
      position: e.position,
      departments: e.departments,
      hasTrainingProgress: e.trainingProgress && e.trainingProgress.length > 0
    })));
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employee training progress:', error);
    res.status(500).json({ message: 'Error fetching employee training progress' });
  }
});

// Duplicate a training plan
router.post('/plans/:id/duplicate', auth, async (req, res) => {
  try {
    const originalPlan = await TrainingPlan.findById(req.params.id);
    if (!originalPlan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }

    const newPlan = new TrainingPlan({
      ...originalPlan.toObject(),
      _id: undefined,
      name: `${originalPlan.name} (Copy)`,
      modules: originalPlan.modules,
    });

    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(400).json({ message: 'Error duplicating training plan' });
  }
});

// Schedule reminders job (run daily)
const scheduleReminders = require('node-schedule');
scheduleReminders.scheduleJob('0 0 * * *', async () => {
  try {
    await NotificationService.sendUpcomingTrainingReminders();
  } catch (err) {
    console.error('Error sending training reminders:', err);
  }
});

// Schedule weekly progress reports (run every Monday)
scheduleReminders.scheduleJob('0 0 * * 1', async () => {
  try {
    const managers = await Employee.find({ role: 'manager' });
    for (const manager of managers) {
      await NotificationService.sendWeeklyProgressReport(manager._id);
    }
  } catch (err) {
    console.error('Error sending weekly progress reports:', err);
  }
});

// ==================== COMMUNITY PLANS API ====================

console.log('Registering community plans routes...');

// Test route to see if community plans routes are working
router.get('/community-plans-test', (req, res) => {
  res.json({ message: 'Community plans routes are working!' });
});

// Get all community plans with filtering and sorting
router.get('/community-plans', auth, async (req, res) => {
  console.log('Community plans route hit:', req.url);
  console.log('CommunityPlan model available:', !!CommunityPlan);

  // For now, return empty array since CommunityPlan might not be loaded
  if (!CommunityPlan) {
    console.log('CommunityPlan model not available, returning empty array');
    return res.json([]);
  }

  try {
    const { sortBy = 'popular', search, department, difficulty, page = 1, limit = 20 } = req.query;

    let query = {
      isActive: true,
      isPublic: true,
      moderationStatus: 'approved'
    };

    // Add search criteria
    if (search) {
      query.$text = { $search: search };
    }

    // Add filters
    if (department && department !== 'all') {
      query.department = department;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    // Build aggregation pipeline
    let pipeline = [
      { $match: query },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          downloadCount: { $size: '$downloads' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$ratings' }, 0] },
              then: { $avg: '$ratings.rating' },
              else: 0
            }
          }
        }
      }
    ];

    // Add sorting
    let sortCriteria = {};
    switch (sortBy) {
      case 'popular':
        sortCriteria = { likeCount: -1, downloadCount: -1, createdAt: -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'rating':
        sortCriteria = { averageRating: -1, likeCount: -1, createdAt: -1 };
        break;
      case 'downloads':
        sortCriteria = { downloadCount: -1, likeCount: -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    pipeline.push({ $sort: sortCriteria });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Add lookups for store and author info
    pipeline.push(
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$storeInfo' },
      { $unwind: '$authorInfo' }
    );

    // Add user-specific fields (isLiked)
    pipeline.push({
      $addFields: {
        isLiked: {
          $in: [req.user._id, '$likes.user']
        },
        store: {
          name: '$storeInfo.name',
          location: '$storeInfo.location',
          id: '$storeInfo._id'
        },
        author: {
          name: '$authorInfo.name',
          position: '$authorInfo.position'
        },
        rating: '$averageRating',
        downloads: '$downloadCount',
        likes: '$likeCount'
      }
    });

    // Remove sensitive fields
    pipeline.push({
      $project: {
        storeInfo: 0,
        authorInfo: 0,
        'likes.user': 0,
        'downloads.user': 0,
        'ratings.user': 0
      }
    });

    const plans = await CommunityPlan.aggregate(pipeline);

    res.json(plans);
  } catch (error) {
    console.error('Error fetching community plans:', error);
    res.status(500).json({ message: 'Error fetching community plans' });
  }
});

// Get a specific community plan by ID
router.get('/community-plans/:id', auth, async (req, res) => {
  try {
    const plan = await CommunityPlan.findById(req.params.id)
      .populate('store', 'name location')
      .populate('author', 'name position');

    if (!plan || !plan.isActive || !plan.isPublic || plan.moderationStatus !== 'approved') {
      return res.status(404).json({ message: 'Community plan not found' });
    }

    // Add computed fields
    const planData = plan.toObject();
    planData.isLiked = plan.likes.some(like => like.user.toString() === req.user._id.toString());
    planData.rating = plan.averageRating;
    planData.downloads = plan.downloadCount;
    planData.likes = plan.likeCount;

    // Format store and author info
    planData.store = {
      name: plan.store.name,
      location: plan.store.location,
      id: plan.store._id
    };
    planData.author = {
      name: plan.author.name,
      position: plan.author.position
    };

    res.json(planData);
  } catch (error) {
    console.error('Error fetching community plan:', error);
    res.status(500).json({ message: 'Error fetching community plan' });
  }
});

// Like/Unlike a community plan
router.post('/community-plans/:id/like', auth, async (req, res) => {
  try {
    const plan = await CommunityPlan.findById(req.params.id);

    if (!plan || !plan.isActive || !plan.isPublic || plan.moderationStatus !== 'approved') {
      return res.status(404).json({ message: 'Community plan not found' });
    }

    const userId = req.user._id;
    const existingLikeIndex = plan.likes.findIndex(like => like.user.toString() === userId.toString());

    if (existingLikeIndex > -1) {
      // Unlike - remove the like
      plan.likes.splice(existingLikeIndex, 1);
    } else {
      // Like - add the like
      plan.likes.push({ user: userId });
    }

    await plan.save();

    res.json({
      isLiked: existingLikeIndex === -1,
      likeCount: plan.likes.length
    });
  } catch (error) {
    console.error('Error liking community plan:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

// Add a community plan to your store (create a copy)
router.post('/community-plans/:id/add-to-store', auth, async (req, res) => {
  try {
    const communityPlan = await CommunityPlan.findById(req.params.id);

    if (!communityPlan || !communityPlan.isActive || !communityPlan.isPublic || communityPlan.moderationStatus !== 'approved') {
      return res.status(404).json({ message: 'Community plan not found' });
    }

    // Check if user already has this plan in their store
    const existingPlan = await TrainingPlan.findOne({
      store: req.user.store._id,
      name: communityPlan.name,
      department: communityPlan.department,
      position: communityPlan.position
    });

    if (existingPlan) {
      return res.status(400).json({ message: 'You already have a similar plan in your store' });
    }

    // Create a new training plan based on the community plan
    const newTrainingPlan = new TrainingPlan({
      name: `${communityPlan.name} (Community)`,
      description: `${communityPlan.description}\n\nAdapted from community plan shared by ${communityPlan.store.name}`,
      department: communityPlan.department,
      position: communityPlan.position,
      type: communityPlan.type === 'New Hire' ? 'New Hire' : 'Regular',
      days: communityPlan.days,
      createdBy: req.user._id,
      store: req.user.store._id,
      selfPaced: false,
      isTemplate: false,
      includesCoreValues: false,
      includesBrandStandards: false,
      usePhaseTerminology: false
    });

    await newTrainingPlan.save();

    // Record the download
    communityPlan.downloads.push({
      user: req.user._id,
      store: req.user.store._id
    });
    await communityPlan.save();

    // Send notification to the original author
    try {
      // await NotificationService.notifyPlanDownloaded(communityPlan.author, communityPlan, req.user);
      console.log('Would send notification to plan author');
    } catch (notificationError) {
      console.error('Error sending download notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      message: 'Community plan successfully added to your store',
      trainingPlan: newTrainingPlan,
      downloadCount: communityPlan.downloads.length
    });
  } catch (error) {
    console.error('Error adding community plan to store:', error);
    res.status(500).json({ message: 'Error adding plan to your store' });
  }
});

// Share a training plan to the community
router.post('/plans/:id/share-to-community', auth, async (req, res) => {
  try {
    const { difficulty, tags = [] } = req.body;

    // Validate difficulty
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    const trainingPlan = await TrainingPlan.findById(req.params.id)
      .populate('store', 'name location')
      .populate('createdBy', 'name position');

    if (!trainingPlan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }

    // Check if user has permission to share this plan
    if (trainingPlan.store._id.toString() !== req.user.store._id.toString()) {
      return res.status(403).json({ message: 'You can only share plans from your own store' });
    }

    // Check if this plan is already shared
    const existingCommunityPlan = await CommunityPlan.findOne({
      originalPlan: trainingPlan._id
    });

    if (existingCommunityPlan) {
      return res.status(400).json({ message: 'This plan is already shared with the community' });
    }

    // Create community plan
    const communityPlan = new CommunityPlan({
      name: trainingPlan.name,
      description: trainingPlan.description || `Training plan for ${trainingPlan.position} in ${trainingPlan.department}`,
      department: trainingPlan.department,
      position: trainingPlan.position,
      type: trainingPlan.type,
      difficulty,
      days: trainingPlan.days,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      originalPlan: trainingPlan._id,
      store: trainingPlan.store._id,
      author: req.user._id,
      isActive: true,
      isPublic: true,
      moderationStatus: 'approved' // Auto-approve for now, can add moderation later
    });

    await communityPlan.save();

    res.json({
      message: 'Training plan successfully shared with the community',
      communityPlan: {
        _id: communityPlan._id,
        name: communityPlan.name,
        difficulty: communityPlan.difficulty,
        tags: communityPlan.tags
      }
    });
  } catch (error) {
    console.error('Error sharing plan to community:', error);
    res.status(500).json({ message: 'Error sharing plan to community' });
  }
});

module.exports = router;