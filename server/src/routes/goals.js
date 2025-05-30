import express from 'express';
import { auth } from '../middleware/auth.js';
import { Goal } from '../models/index.js';

const router = express.Router();

// Get all goals for the current user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, businessArea, goalPeriod, kpis } = req.body;

    // Validate required fields
    if (!name || !businessArea || !goalPeriod || !kpis?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate KPIs
    if (!Array.isArray(kpis)) {
      return res.status(400).json({ message: 'KPIs must be an array' });
    }

    for (const kpi of kpis) {
      if (!kpi.name || !kpi.targetValue || !kpi.unit || !kpi.peak) {
        return res.status(400).json({ message: 'Invalid KPI data' });
      }
    }

    const goal = new Goal({
      name,
      description,
      businessArea,
      goalPeriod,
      kpis,
      user: req.user._id,
      progress: 0,
      status: 'not-started',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Failed to create goal' });
  }
});

// Update a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, businessArea, goalPeriod, progress, status, kpis } = req.body;

    console.log('Updating goal:', id);
    console.log('Request body:', req.body);

    const goal = await Goal.findOne({ _id: id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.name = name || goal.name;
    goal.description = description || goal.description;
    goal.businessArea = businessArea || goal.businessArea;
    goal.goalPeriod = goalPeriod || goal.goalPeriod;
    goal.progress = progress !== undefined ? progress : goal.progress;
    goal.status = status || goal.status;

    if (kpis) {
      console.log('Updating KPIs:', kpis);

      // Process each KPI to ensure measurements are properly handled
      kpis.forEach((kpi, index) => {
        // Ensure measurements is an array
        if (kpi.measurements) {
          // Convert date strings to Date objects
          kpi.measurements = kpi.measurements.map(m => ({
            ...m,
            date: new Date(m.date)
          }));
        } else {
          kpi.measurements = [];
        }
      });

      goal.kpis = kpis;
    }

    goal.updatedAt = new Date();
    console.log('Saving updated goal');
    await goal.save();
    console.log('Goal saved successfully');
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
});

// Update step completion
router.patch('/:id/steps/:stepIndex', auth, async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const { completed } = req.body;

    const goal = await Goal.findOne({ _id: id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (!goal.steps[stepIndex]) {
      return res.status(404).json({ message: 'Step not found' });
    }

    goal.steps[stepIndex].completed = completed;

    // Update progress based on completed steps
    const completedSteps = goal.steps.filter(step => step.completed).length;
    goal.progress = Math.round((completedSteps / goal.steps.length) * 100);

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ message: 'Failed to update step' });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findOneAndDelete({ _id: id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Failed to delete goal' });
  }
});

export default router;