import { User } from '../models/index.js';
import { Evaluation } from '../models/index.js';

// Update user metrics
export const updateUserMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const { heartsAndHands } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize metrics if it doesn't exist
    if (!user.metrics) {
      user.metrics = {};
    }

    // Update metrics while preserving other metrics data
    user.metrics = {
      ...user.metrics,
      heartsAndHands
    };

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating user metrics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('Updating user with ID:', id);
    console.log('Update data received:', updates);

    // Check if email is being updated and if it's unique
    if (updates.email) {
      console.log('Email update detected:', updates.email);

      // Check if the email is already in use by another user
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: id } // Exclude the current user
      });

      if (existingUser) {
        console.error('Email already in use by another user:', updates.email);
        return res.status(400).json({
          error: 'Email already in use by another user'
        });
      }
    }

    // Handle scheduling preferences
    if (updates.schedulingPreferences) {
      const { autoSchedule, frequency, cycleStart } = updates.schedulingPreferences;

      // If auto-schedule is enabled, calculate next evaluation date
      if (autoSchedule) {
        try {
          // Get user's last evaluation
          const lastEvaluation = await Evaluation.findOne({
            employee: id,
            status: 'completed'
          }).sort({ completedAt: -1 });

          let nextEvaluationDate;
          const today = new Date();

          if (cycleStart === 'last_evaluation' && lastEvaluation?.completedAt) {
            // Calculate from last evaluation date
            nextEvaluationDate = new Date(lastEvaluation.completedAt);
            if (!isNaN(nextEvaluationDate.getTime())) {
              nextEvaluationDate.setDate(nextEvaluationDate.getDate() + Number(frequency));

              // If calculated date is in the past, schedule from today
              if (nextEvaluationDate < today) {
                nextEvaluationDate = new Date(today);
                nextEvaluationDate.setDate(today.getDate() + Number(frequency));
              }
            } else {
              // Invalid last evaluation date, fallback to today
              nextEvaluationDate = new Date(today);
              nextEvaluationDate.setDate(today.getDate() + Number(frequency));
            }
          } else {
            // No previous evaluation or using hire date, schedule from today
            nextEvaluationDate = new Date(today);
            nextEvaluationDate.setDate(today.getDate() + Number(frequency));
          }

          // Validate the calculated date
          if (isNaN(nextEvaluationDate.getTime())) {
            throw new Error('Invalid evaluation date calculated');
          }

          updates.schedulingPreferences.nextEvaluationDate = nextEvaluationDate;
          updates.schedulingPreferences.lastCalculatedAt = today;
        } catch (dateError) {
          console.error('Error calculating evaluation dates:', dateError);
          return res.status(400).json({
            error: 'Failed to calculate evaluation dates',
            details: dateError.message
          });
        }
      } else {
        // If auto-schedule disabled, clear dates
        updates.schedulingPreferences.nextEvaluationDate = null;
        updates.schedulingPreferences.lastCalculatedAt = null;
      }
    }

    // Ensure all fields are properly included in the update
    const updateFields = {
      name: updates.name,
      email: updates.email,
      departments: updates.departments,
      position: updates.position,
      role: updates.role,
      status: updates.status,
      shift: updates.shift,
      manager: updates.manager,
      schedulingPreferences: updates.schedulingPreferences
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    console.log('Final update fields:', updateFields);

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('evaluator');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User updated successfully:', user.name, user.email);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
};