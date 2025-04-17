import express from 'express';
import { auth } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';
import TrainingCategory from '../models/TrainingCategory.js';
import TrainingPlan from '../models/TrainingPlan.js';
import User from '../models/User.js';
import TrainingProgress from '../models/TrainingProgress.js';
import * as schedule from 'node-schedule';
import emailTemplates from '../utils/emailTemplates.js';
import { handleAsync } from '../utils/errorHandler.js';
import TrainingSession from '../models/TrainingSession.js'

const router = express.Router();

// Get all categories for the store
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await TrainingCategory.find({ store: req.user.store._id })
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create a new category
router.post('/categories', auth, async (req, res) => {
  try {
    const category = new TrainingCategory({
      ...req.body,
      store: req.user.store._id
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update a category
router.put('/categories/:id', auth, async (req, res) => {
  try {
    const category = await TrainingCategory.findOneAndUpdate(
      { _id: req.params.id, store: req.user.store._id },
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Update category status
router.patch('/categories/:id', auth, async (req, res) => {
  try {
    const category = await TrainingCategory.findOneAndUpdate(
      { _id: req.params.id, store: req.user.store._id },
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ message: 'Error updating category status' });
  }
});

// Delete a category
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    const category = await TrainingCategory.findOneAndDelete({
      _id: req.params.id,
      store: req.user.store._id
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Get all training templates for the store
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await TrainingPlan.find({
      store: req.user.store._id,
      isTemplate: true,
    })
      .populate('modules.position')
      .sort({ name: 1 });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Error fetching templates' });
  }
});

// Create a new template
router.post('/templates', auth, async (req, res) => {
  try {
    const template = new TrainingPlan({
      ...req.body,
      store: req.user.store._id,
      createdBy: req.user._id,
    });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Error creating template' });
  }
});

// Update a template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const template = await TrainingPlan.findOneAndUpdate(
      { _id: req.params.id, store: req.user.store._id, isTemplate: true },
      req.body,
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Error updating template' });
  }
});

// Delete a template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const template = await TrainingPlan.findOneAndDelete({
      _id: req.params.id,
      store: req.user.store._id,
      isTemplate: true,
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Error deleting template' });
  }
});

// Duplicate a template
router.post('/templates/:id/duplicate', auth, async (req, res) => {
  try {
    const template = await TrainingPlan.findOne({
      _id: req.params.id,
      store: req.user.store._id,
      isTemplate: true,
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const duplicateTemplate = new TrainingPlan({
      ...template.toObject(),
      _id: undefined,
      name: `${template.name} (Copy)`,
      createdBy: req.user._id,
      createdAt: undefined,
      updatedAt: undefined,
    });

    await duplicateTemplate.save();
    res.status(201).json(duplicateTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ message: 'Error duplicating template' });
  }
});

// Get all training plans
router.get('/plans', auth, handleAsync(async (req, res) => {
  console.log('Fetching training plans for store:', req.user.store._id);
  const plans = await TrainingPlan.find({
    store: req.user.store._id,
    deleted: { $ne: true }
  })
  .select('name type department position days')
  .lean();

  // Transform the plans to match the client-side interface
  const transformedPlans = plans.map(plan => ({
    _id: plan._id.toString(),
    name: plan.name,
    type: plan.type,
    department: plan.department,
    position: plan.position
  }));

  res.json(transformedPlans);
}));

// Get active training plans
router.get('/plans/active', auth, async (req, res) => {
  try {
    const plans = await TrainingPlan.find({
      store: req.user.store._id,
      isTemplate: false,
      isActive: true,
    })
      .populate('assignedTo')
      .populate('modules.position')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching active training plans:', error);
    res.status(500).json({ message: 'Error fetching active training plans' });
  }
});

// Get employee training progress
router.get('/employees/training-progress', auth, async (req, res) => {
  try {
    // Get all training progress entries for the store
    const trainingProgress = await TrainingProgress.find({
      store: req.user.store._id,
      deleted: { $ne: true }
    })
    .populate({
      path: 'trainee',
      select: 'name position department status',
      match: { status: 'active' }
    })
    .populate({
      path: 'trainingPlan',
      select: 'name type department position modules days',
      match: { deleted: { $ne: true } },
      populate: {
        path: 'days',
        select: 'dayNumber tasks',
        populate: {
          path: 'tasks',
          select: '_id name'
        }
      }
    })
    .lean();

    console.log(`Found ${trainingProgress.length} training progress records`);

    // Add a debug mock entry for testing if needed
    if (process.env.NODE_ENV === 'development' && trainingProgress.length === 0) {
      console.log('Adding debug mock entry for testing');

      // Create a mock trainee with known progress values
      const mockTrainee = {
        trainee: {
          _id: '123456789012345678901234',
          name: 'Debug Trainee',
          position: 'Team Member',
          department: 'FOH',
          status: 'active'
        },
        trainingPlan: {
          _id: '123456789012345678901235',
          name: 'Debug Training Plan',
          days: [
            {
              dayNumber: 1,
              tasks: [
                { _id: 'task1', name: 'Task 1' },
                { _id: 'task2', name: 'Task 2' },
                { _id: 'task3', name: 'Task 3' }
              ]
            },
            {
              dayNumber: 2,
              tasks: [
                { _id: 'task4', name: 'Task 4' },
                { _id: 'task5', name: 'Task 5' }
              ]
            }
          ]
        },
        moduleProgress: [
          { moduleId: 'task1', completed: true },
          { moduleId: 'task2', completed: true },
          { moduleId: 'task3', completed: false },
          { moduleId: 'task4', completed: false },
          { moduleId: 'task5', completed: false }
        ],
        status: 'IN_PROGRESS'
      };

      trainingProgress.push(mockTrainee);
    }

    // Transform the data to match frontend expectations
    const transformedTrainees = trainingProgress
      .filter(progress => progress.trainee) // Filter out any entries where trainee was not found
      .map(progress => {
        const traineeName = progress.trainee?.name || 'Unknown';
        console.log(`\nProcessing trainee: ${traineeName} (${progress.trainee?._id})`);

        // Calculate progress based on completed modules vs total tasks
        const moduleProgress = progress.moduleProgress || [];

        // First, get all tasks from all days
        let allTasks = [];
        if (progress.trainingPlan?.days && Array.isArray(progress.trainingPlan.days)) {
          progress.trainingPlan.days.forEach(day => {
            if (day.tasks && Array.isArray(day.tasks)) {
              allTasks = allTasks.concat(day.tasks);
            }
          });
        }

        console.log(`- Found ${allTasks.length} tasks in training plan`);
        console.log(`- Found ${moduleProgress.length} module progress entries`);

        // Create a map of task IDs for easier matching
        const taskIdMap = new Map();
        allTasks.forEach(task => {
          if (task._id) {
            taskIdMap.set(task._id.toString(), task);
          }
        });

        // Count completed modules that correspond to tasks in the plan
        const completedModules = moduleProgress.filter(mp => {
          const isCompleted = mp.completed;
          const hasMatchingTask = mp.moduleId && taskIdMap.has(mp.moduleId.toString());
          return isCompleted && hasMatchingTask;
        }).length;

        console.log(`- Completed modules with matching tasks: ${completedModules}`);

        // Calculate progress percentage
        let totalModules = allTasks.length;

        // If no tasks found, fall back to module count to avoid division by zero
        if (totalModules === 0) {
          totalModules = progress.trainingPlan?.modules?.length || 1;
          console.log(`- No tasks found, using fallback module count: ${totalModules}`);
        }

        let progressPercentage = 0;
        if (totalModules > 0) {
          progressPercentage = Math.round((completedModules / totalModules) * 100);
        }

        console.log(`- Final calculation: (${completedModules} / ${totalModules}) * 100 = ${progressPercentage}%`);

        return {
          _id: progress.trainee._id,
          name: progress.trainee.name,
          position: progress.trainee.position,
          department: progress.trainee.department,
          currentPlan: progress.trainingPlan ? {
            _id: progress._id, // Use the training progress ID for navigation
            name: progress.trainingPlan.name,
            progress: progressPercentage
          } : undefined,
          status: progress.status?.toLowerCase() || 'not_started'
        };
      });

    res.json(transformedTrainees);
  } catch (error) {
    console.error('Error fetching training progress:', error);
    res.status(500).json({ error: 'Failed to fetch training progress' });
  }
});

// Create a new training plan
router.post('/plans', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      department,
      position,
      type,
      days,
      selfPaced
    } = req.body;

    const trainingPlan = new TrainingPlan({
      name,
      description,
      department,
      position,
      type,
      days,
      selfPaced,
      store: req.user.store._id,
      createdBy: req.user._id
    });

    // Log the plan data before saving for debugging
    console.log('Creating training plan:', {
      name,
      department,
      position,
      type,
      selfPaced,
      daysCount: days?.length,
      store: req.user.store._id,
      createdBy: req.user._id
    });

    await trainingPlan.save();

    // Return the created plan with populated fields
    const populatedPlan = await TrainingPlan.findById(trainingPlan._id)
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.status(201).json(populatedPlan);
  } catch (error) {
    console.error('Error creating training plan:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      message: 'Error creating training plan',
      error: error.message
    });
  }
});

// Get a specific training plan
router.get('/plans/:id', auth, async (req, res) => {
  try {
    const trainingPlan = await TrainingPlan.findById(req.params.id);
    if (!trainingPlan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }
    res.json(trainingPlan);
  } catch (error) {
    console.error('Error fetching training plan:', error);
    res.status(500).json({ message: 'Error fetching training plan', error: error.message });
  }
});

// Update a training plan
router.put('/plans/:id', auth, async (req, res) => {
  try {
    const trainingPlan = await TrainingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!trainingPlan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }
    res.json(trainingPlan);
  } catch (error) {
    console.error('Error updating training plan:', error);
    res.status(500).json({ message: 'Error updating training plan', error: error.message });
  }
});

// Delete a training plan
router.delete('/plans/:id', auth, async (req, res) => {
  try {
    const trainingPlan = await TrainingPlan.findByIdAndDelete(req.params.id);
    if (!trainingPlan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }
    res.json({ message: 'Training plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting training plan:', error);
    res.status(500).json({ message: 'Error deleting training plan', error: error.message });
  }
});

// Update module progress
router.patch('/progress/:progressId/modules/:moduleId', auth, async (req, res) => {
  try {
    const { progressId, moduleId } = req.params;
    const { completed, notes } = req.body;

    const trainingProgress = await TrainingProgress.findOne({
      _id: progressId,
      store: req.user.store._id,
    }).populate('trainingPlan');

    if (!trainingProgress) {
      return res.status(404).json({ message: 'Training progress not found' });
    }

    // Check if the plan is self-paced or if the user is a trainer or above
    const isSelfPaced = trainingProgress.trainingPlan?.selfPaced || false;
    const isTrainerOrAbove = ['Director', 'Leader', 'Trainer'].includes(req.user.position);

    // If plan is not self-paced and user is not a trainer or above, deny access
    if (!isSelfPaced && !isTrainerOrAbove) {
      return res.status(403).json({ message: 'Only trainers and above can mark modules as complete for this plan' });
    }

    // Find the module progress entry
    const moduleProgress = trainingProgress.moduleProgress.find(
      (mp) => mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      // If module progress doesn't exist, create it
      trainingProgress.moduleProgress.push({
        moduleId,
        completed,
        completionPercentage: completed ? 100 : 0,
        completedBy: completed ? req.user._id : undefined,
        completedAt: completed ? new Date() : undefined,
        notes,
      });
    } else {
      // Update existing module progress
      moduleProgress.completed = completed;
      moduleProgress.completionPercentage = completed ? 100 : 0;
      moduleProgress.completedBy = completed ? req.user._id : undefined;
      moduleProgress.completedAt = completed ? new Date() : undefined;
      moduleProgress.notes = notes;
    }

    // Save the changes
    await trainingProgress.save();

    // Fetch the updated training progress with populated fields
    const updatedProgress = await TrainingProgress.findOne({
      _id: progressId,
      store: req.user.store._id,
    })
    .populate({
      path: 'trainingPlan',
      select: 'name description type days'
    })
    .populate({
      path: 'moduleProgress.completedBy',
      select: 'name position'
    })
    .populate('trainee', 'name position department');

    if (!updatedProgress) {
      return res.status(404).json({ message: 'Training progress not found after update' });
    }

    // Initialize modules array
    let modules = [];

    // Transform days into modules format for frontend compatibility
    if (updatedProgress.trainingPlan?.days) {
      updatedProgress.trainingPlan.days.forEach(day => {
        if (day?.tasks && Array.isArray(day.tasks)) {
          day.tasks.forEach(task => {
            if (task) {
              modules.push({
                _id: task._id.toString(),
                name: task.name || 'Unnamed Task',
                description: task.description || '',
                position: task.position || (updatedProgress.trainee?.position || '')
              });
            }
          });
        }
      });
    }

    // Create transformed response
    const transformedProgress = {
      ...updatedProgress.toObject(),
      trainingPlan: {
        ...updatedProgress.trainingPlan.toObject(),
        modules
      }
    };

    // Check if all modules are completed
    const allModulesCompleted = modules.every(module => {
      const progress = transformedProgress.moduleProgress.find(
        mp => mp.moduleId.toString() === module._id.toString()
      );
      return progress && progress.completed;
    });

    if (allModulesCompleted) {
      transformedProgress.status = 'COMPLETED';
      await TrainingProgress.findByIdAndUpdate(progressId, { status: 'COMPLETED' });
    }

    res.json(transformedProgress);
  } catch (error) {
    console.error('Error updating module progress:', error);
    res.status(500).json({ message: 'Error updating module progress' });
  }
});

// Assign training plan to employee
router.post('/plans/assign', auth, async (req, res) => {
  try {
    const { employeeId, planId, startDate } = req.body;
    console.log('Assigning training plan:', { employeeId, planId, startDate });

    // Find the employee
    const employee = await User.findOne({
      _id: employeeId,
      store: req.user.store._id,
    }).select('name email position department');

    if (!employee) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log('Found employee:', {
      id: employee._id,
      name: employee.name,
      position: employee.position
    });

    // Find the training plan and populate modules
    const trainingPlan = await TrainingPlan.findOne({
      _id: planId,
      store: req.user.store._id,
    });

    if (!trainingPlan) {
      console.log('Training plan not found:', planId);
      return res.status(404).json({ message: 'Training plan not found' });
    }

    console.log('Found training plan:', {
      id: trainingPlan._id,
      name: trainingPlan.name,
      daysCount: trainingPlan.days?.length
    });

    // Initialize module progress array from training plan days and tasks
    const moduleProgress = [];
    if (trainingPlan.days && Array.isArray(trainingPlan.days)) {
      trainingPlan.days.forEach(day => {
        if (day.tasks && Array.isArray(day.tasks)) {
          day.tasks.forEach(task => {
            moduleProgress.push({
              moduleId: task._id,
              completed: false,
              completionPercentage: 0
            });
          });
        }
      });
    }

    console.log('Initialized module progress:', {
      count: moduleProgress.length,
      modules: moduleProgress.map(mp => ({
        moduleId: mp.moduleId,
        completed: mp.completed
      }))
    });

    // Create a new training progress entry
    const trainingProgress = new TrainingProgress({
      trainee: employeeId,
      trainingPlan: planId,
      startDate: new Date(startDate),
      assignedTrainer: req.user._id,
      store: req.user.store._id,
      status: 'IN_PROGRESS',
      moduleProgress
    });

    await trainingProgress.save();
    console.log('Created training progress:', {
      id: trainingProgress._id,
      trainee: trainingProgress.trainee,
      plan: trainingProgress.trainingPlan,
      status: trainingProgress.status
    });

    // Add the training progress to the employee's trainingProgress array
    employee.trainingProgress = employee.trainingProgress || [];
    employee.trainingProgress.push(trainingProgress._id);
    await employee.save();

    console.log('Updated employee training progress array:', {
      employeeId: employee._id,
      trainingProgressCount: employee.trainingProgress.length
    });

    // Send immediate assignment notification
    try {
      await NotificationService.notifyTrainingAssigned(employee, trainingPlan, startDate);
      console.log(`Training assignment notification sent to ${employee.email}`);
    } catch (notificationError) {
      console.error('Error sending training assignment notification:', {
        error: notificationError.message,
        employee: employee._id,
        trainingPlan: trainingPlan._id,
      });
      // Continue execution even if notification fails
    }

    // Schedule a reminder notification for 1 day before the start date
    const reminderDate = new Date(startDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    if (reminderDate > new Date()) { // Only schedule if start date is in the future
      schedule.scheduleJob(reminderDate, async () => {
        try {
          const daysUntilStart = 1;
          await NotificationService.sendEmail(
            employee.email,
            emailTemplates.upcomingTraining(employee, trainingPlan, daysUntilStart)
          );
          console.log(`Training reminder notification sent to ${employee.email}`);
        } catch (reminderError) {
          console.error('Error sending training reminder notification:', {
            error: reminderError.message,
            employee: employee._id,
            trainingPlan: trainingPlan._id,
          });
        }
      });
      console.log(`Reminder scheduled for ${reminderDate.toISOString()}`);
    }

    // Populate the response
    await trainingProgress.populate([
      {
        path: 'trainee',
        select: 'name position department',
      },
      {
        path: 'trainingPlan',
        select: 'name description type days'
      },
      {
        path: 'assignedTrainer',
        select: 'name',
      },
    ]);

    res.status(201).json(trainingProgress);
  } catch (error) {
    console.error('Error assigning training plan:', error);
    res.status(500).json({ message: 'Error assigning training plan' });
  }
});

// Delete training progress
router.delete('/trainee-progress/:id', auth, async (req, res) => {
  try {
    // Check if user is a Director
    if (req.user.position !== 'Director') {
      return res.status(403).json({ message: 'Only Directors can delete training progress' })
    }

    const { id } = req.params

    // Find and delete the training progress
    const trainingProgress = await TrainingProgress.findByIdAndDelete(id)

    if (!trainingProgress) {
      return res.status(404).json({ message: 'Training progress not found' })
    }

    // Return success response
    res.status(200).json({ message: 'Training progress deleted successfully' })
  } catch (error) {
    console.error('Error deleting training progress:', error)
    res.status(500).json({ message: 'Error deleting training progress' })
  }
})

// Get training progress for current user or specified user
router.get('/progress', auth, async (req, res) => {
  try {
    // Check if a specific trainee ID was provided
    const traineeId = req.query.traineeId || req.user._id;
    console.log('Fetching training progress for user:', traineeId);

    const trainingProgress = await TrainingProgress.find({
      trainee: traineeId,
      deleted: { $ne: true }
    })
    .populate({
      path: 'trainingPlan',
      select: 'name type days'
    })
    .populate('moduleProgress.completedBy', 'firstName lastName name')
    .sort({ createdAt: -1 });

    console.log('Found training progress:', {
      count: trainingProgress.length,
      progress: trainingProgress.map(p => ({
        id: p._id,
        planName: p.trainingPlan?.name,
        status: p.status,
        startDate: p.startDate,
        moduleProgressCount: p.moduleProgress?.length
      }))
    });

    // Transform the data to include module information from days
    const transformedProgress = trainingProgress.map(progress => {
      const modules = [];

      // Extract modules from days
      if (progress.trainingPlan?.days) {
        progress.trainingPlan.days.forEach(day => {
          if (day?.tasks && Array.isArray(day.tasks)) {
            day.tasks.forEach(task => {
              if (task) {
                modules.push({
                  _id: task._id.toString(),
                  name: task.name || 'Unnamed Task',
                  description: task.description || '',
                });
              }
            });
          }
        });
      }

      // Create the transformed object
      return {
        _id: progress._id,
        status: progress.status,
        startDate: progress.startDate,
        completedAt: progress.completedAt,
        moduleProgress: progress.moduleProgress,
        trainingPlan: {
          _id: progress.trainingPlan?._id,
          name: progress.trainingPlan?.name,
          type: progress.trainingPlan?.type,
          modules
        }
      };
    });

    res.json(transformedProgress);
  } catch (error) {
    console.error('Error fetching user training progress:', error);
    res.status(500).json({ message: 'Error fetching training progress' });
  }
});

// Update competency checklist item
router.patch('/progress/:progressId/tasks/:taskId/competency/:itemId', auth, async (req, res) => {
  try {
    const { progressId, taskId, itemId } = req.params
    const { completed } = req.body

    const trainingProgress = await TrainingProgress.findOne({
      _id: progressId,
      store: req.user.store._id,
    }).populate('trainingPlan')

    if (!trainingProgress) {
      return res.status(404).json({ message: 'Training progress not found' })
    }

    // Check if the plan is self-paced or if the user is a trainer or above
    const isSelfPaced = trainingProgress.trainingPlan?.selfPaced || false;
    const isTrainerOrAbove = ['Director', 'Leader', 'Trainer'].includes(req.user.position);

    // If plan is not self-paced and user is not a trainer or above, deny access
    if (!isSelfPaced && !isTrainerOrAbove) {
      return res.status(403).json({ message: 'Only trainers and above can update competency items for this plan' })
    }

    // Initialize competencyProgress if it doesn't exist
    if (!trainingProgress.competencyProgress) {
      trainingProgress.competencyProgress = []
    }

    // Find existing progress or create new one
    const existingIndex = trainingProgress.competencyProgress.findIndex(
      cp => cp.taskId === taskId.toString() && cp.itemId === itemId.toString()
    )

    if (existingIndex === -1) {
      // Create new progress entry
      trainingProgress.competencyProgress.push({
        taskId: taskId.toString(),
        itemId: itemId.toString(),
        completed,
        completedBy: completed ? req.user._id : undefined,
        completedAt: completed ? new Date() : undefined
      })
    } else {
      // Update existing progress
      trainingProgress.competencyProgress[existingIndex] = {
        ...trainingProgress.competencyProgress[existingIndex],
        taskId: taskId.toString(),
        itemId: itemId.toString(),
        completed,
        completedBy: completed ? req.user._id : undefined,
        completedAt: completed ? new Date() : undefined
      }
    }

    // Mark the competencyProgress array as modified
    trainingProgress.markModified('competencyProgress')

    // Save the changes
    await trainingProgress.save()
    console.log('Saved competency progress:', trainingProgress.competencyProgress)

    // Return updated training progress with populated data
    const updatedProgress = await TrainingProgress.findOne({
      _id: progressId,
      store: req.user.store._id,
    })
    .populate({
      path: 'trainingPlan',
      select: 'name description type days'
    })
    .populate({
      path: 'moduleProgress.completedBy',
      select: 'name position'
    })
    .populate('trainee', 'name position department')
    .populate('competencyProgress.completedBy', 'name position')

    // Transform the response to include days structure and competency progress
    const transformedProgress = {
      ...updatedProgress.toObject(),
      trainingPlan: {
        ...updatedProgress.trainingPlan.toObject(),
        days: updatedProgress.trainingPlan.days.map((day, index) => ({
          ...day,
          dayNumber: index + 1,
          tasks: day.tasks.map(task => {
            // Find competency progress for this task
            const taskCompetencyProgress = updatedProgress.competencyProgress
              .filter(cp => cp.taskId === task._id.toString())
              .map(cp => ({
                itemId: cp.itemId,
                completed: cp.completed,
                completedBy: cp.completedBy,
                completedAt: cp.completedAt
              }));

            return {
              _id: task._id.toString(),
              name: task.name || 'Unnamed Task',
              description: task.description || '',
              position: task.position || (updatedProgress.trainee?.position || ''),
              urls: task.urls || [],
              checklist: task.checklist || [],
              duration: task.duration,
              pathwayUrl: task.pathwayUrl,
              competencyChecklist: task.competencyChecklist || [],
              competencyProgress: taskCompetencyProgress
            }
          })
        }))
      }
    }

    // Log the transformed response for debugging
    console.log('Sending transformed response:', {
      id: transformedProgress._id,
      planName: transformedProgress.trainingPlan.name,
      daysCount: transformedProgress.trainingPlan.days.length,
      competencyProgress: transformedProgress.competencyProgress?.map(cp => ({
        taskId: cp.taskId,
        itemId: cp.itemId,
        completed: cp.completed,
        completedBy: cp.completedBy?.name,
        completedAt: cp.completedAt
      })) || []
    });

    res.json(transformedProgress)
  } catch (error) {
    console.error('Error updating competency item:', error)
    res.status(500).json({ message: 'Error updating competency item' })
  }
})

// Get a specific training progress
router.get('/progress/:progressId', auth, async (req, res) => {
  try {
    const trainingProgress = await TrainingProgress.findOne({
      _id: req.params.progressId,
      store: req.user.store._id,
    })
    .populate({
      path: 'trainingPlan',
      select: 'name description type days'
    })
    .populate({
      path: 'moduleProgress.completedBy',
      select: 'name position'
    })
    .populate('trainee', 'name position department')
    .populate('competencyProgress.completedBy', 'name position');

    if (!trainingProgress) {
      return res.status(404).json({ message: 'Training progress not found' });
    }

    // Transform the response to include days structure
    const transformedProgress = {
      ...trainingProgress.toObject(),
      trainingPlan: {
        ...trainingProgress.trainingPlan.toObject(),
        days: trainingProgress.trainingPlan.days.map((day, index) => ({
          ...day,
          dayNumber: index + 1,
          tasks: day.tasks.map(task => {
            // Find competency progress for this task
            const taskCompetencyProgress = trainingProgress.competencyProgress
              .filter(cp => cp.taskId === task._id.toString())
              .map(cp => ({
                itemId: cp.itemId,
                completed: cp.completed,
                completedBy: cp.completedBy,
                completedAt: cp.completedAt
              }));

            return {
              _id: task._id.toString(),
              name: task.name || 'Unnamed Task',
              description: task.description || '',
              position: task.position || (trainingProgress.trainee?.position || ''),
              urls: task.urls || [],
              checklist: task.checklist || [],
              duration: task.duration,
              pathwayUrl: task.pathwayUrl,
              competencyChecklist: task.competencyChecklist || [],
              competencyProgress: taskCompetencyProgress,
              // Find the module progress for this task
              progress: trainingProgress.moduleProgress.find(
                mp => mp.moduleId.toString() === task._id.toString()
              ) || {
                completed: false,
                completionPercentage: 0
              }
            };
          })
        }))
      }
    };

    // Log the transformed data for debugging
    console.log('Transformed training progress:', {
      id: transformedProgress._id,
      planName: transformedProgress.trainingPlan.name,
      daysCount: transformedProgress.trainingPlan.days.length,
      moduleProgress: transformedProgress.moduleProgress?.map(mp => ({
        moduleId: mp.moduleId,
        completed: mp.completed,
        completedBy: mp.completedBy,
        completedAt: mp.completedAt
      })) || [],
      competencyProgress: transformedProgress.competencyProgress?.map(cp => ({
        taskId: cp.taskId,
        itemId: cp.itemId,
        completed: cp.completed,
        completedBy: cp.completedBy?.name,
        completedAt: cp.completedAt
      })) || []
    });

    res.json(transformedProgress);
  } catch (error) {
    console.error('Error fetching training progress:', error);
    res.status(500).json({ message: 'Error fetching training progress' });
  }
});

// Get training sessions for a date range
router.get('/sessions', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = { store: req.user.store._id }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const sessions = await TrainingSession.find(query)
      .populate('createdBy', 'name')
      .populate('attendees', 'name')
      .sort({ date: 1, startTime: 1 })

    res.json(sessions)
  } catch (error) {
    console.error('Error fetching training sessions:', error)
    res.status(500).json({ message: 'Error fetching training sessions' })
  }
})

// Create a new training session
router.post('/sessions', auth, async (req, res) => {
  try {
    const { title, date, startTime, trainees, type } = req.body

    // Validate the date is not in the past
    const sessionDate = new Date(date)
    const [hours, minutes] = startTime.split(':')
    sessionDate.setHours(parseInt(hours), parseInt(minutes))

    if (sessionDate < new Date()) {
      return res.status(400).json({ message: 'Cannot schedule sessions in the past' })
    }

    const session = new TrainingSession({
      title,
      date: sessionDate,
      startTime,
      trainees,
      type,
      store: req.user.store._id,
      createdBy: req.user._id
    })

    await session.save()

    // Populate creator details before sending response
    await session.populate('createdBy', 'firstName lastName')

    res.status(201).json(session)
  } catch (error) {
    console.error('Error creating training session:', error)
    res.status(500).json({
      message: 'Error creating training session',
      error: error.message
    })
  }
})

// Update a training session
router.put('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await TrainingSession.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name')
      .populate('attendees', 'name')

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error updating training session:', error)
    res.status(500).json({ message: 'Error updating training session' })
  }
})

// Delete a training session
router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await TrainingSession.findOneAndDelete({
      _id: req.params.id,
      store: req.user.store._id
    })

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' })
    }

    res.json({ message: 'Training session deleted successfully' })
  } catch (error) {
    console.error('Error deleting training session:', error)
    res.status(500).json({ message: 'Error deleting training session' })
  }
})

// Add attendee to a session
router.post('/sessions/:id/attendees', auth, async (req, res) => {
  try {
    const { userId } = req.body

    const session = await TrainingSession.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id,
        attendees: { $ne: userId }
      },
      {
        $addToSet: { attendees: userId }
      },
      { new: true }
    ).populate('createdBy', 'name')
      .populate('attendees', 'name')

    if (!session) {
      return res.status(404).json({ message: 'Training session not found or attendee already added' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error adding attendee to session:', error)
    res.status(500).json({ message: 'Error adding attendee to session' })
  }
})

// Remove attendee from a session
router.delete('/sessions/:id/attendees/:userId', auth, async (req, res) => {
  try {
    const session = await TrainingSession.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      {
        $pull: { attendees: req.params.userId }
      },
      { new: true }
    ).populate('createdBy', 'name')
      .populate('attendees', 'name')

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error removing attendee from session:', error)
    res.status(500).json({ message: 'Error removing attendee from session' })
  }
})

// Update session status
router.patch('/sessions/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body

    const session = await TrainingSession.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      { status },
      { new: true }
    ).populate('createdBy', 'name')
      .populate('attendees', 'name')

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error updating session status:', error)
    res.status(500).json({ message: 'Error updating session status' })
  }
})

// Get new hire employees (60 days or newer)
router.get('/employees/new-hires', auth, handleAsync(async (req, res) => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // First get all new hires from the last 60 days
  const newHires = await User.find({
    store: req.user.store._id,
    status: 'active',
    startDate: { $gte: sixtyDaysAgo }  // Changed from createdAt to startDate
  })
  .select('firstName lastName name position department startDate')  // Changed to include startDate
  .sort({ startDate: -1 })  // Sort by startDate instead of createdAt
  .lean();

  // Get all training progress for these employees
  const trainingProgress = await TrainingProgress.find({
    trainee: { $in: newHires.map(hire => hire._id) },
    deleted: { $ne: true }
  })
  .select('trainee status')
  .lean();

  // Create a map of employee ID to training status
  const trainingStatusMap = trainingProgress.reduce((acc, progress) => {
    acc[progress.trainee.toString()] = progress.status?.toLowerCase() || 'not_started';
    return acc;
  }, {});

  // Transform the data to include days since hire and training status
  const transformedHires = newHires.map(employee => {
    const daysSinceHire = Math.floor((new Date() - new Date(employee.startDate)) / (1000 * 60 * 60 * 24));
    return {
      _id: employee._id.toString(),
      name: employee.name || `${employee.firstName} ${employee.lastName}`,
      position: employee.position || 'Unknown Position',
      department: employee.department || 'Unknown Department',
      hireDate: employee.startDate,
      daysSinceHire,
      trainingStatus: trainingStatusMap[employee._id.toString()] || 'not_started'
    };
  });

  console.log('Sending new hires data:', transformedHires);
  res.json(transformedHires);
}));

export default router;