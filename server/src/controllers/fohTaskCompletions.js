import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js';
import { getNewYorkDateString, isDateInNewYork } from '../utils/timezone-utils.js';

/**
 * Get all FOH task completions for today
 */
export const getTodayCompletions = async (req, res) => {
  try {
    const { store } = req.user;

    // Get today's date in New York timezone
    const today = new Date();
    const todayStr = getNewYorkDateString(today);

    // Get all completions for today
    const completions = await FOHTaskCompletion.find({
      store
    }).populate('task').populate('completedBy', 'name');

    // Filter completions for today using New York timezone
    const todayCompletions = completions.filter(comp => {
      const isCompletedToday = isDateInNewYork(comp.date, todayStr);
      const createdDateInNY = getNewYorkDateString(comp.createdAt);
      const createdToday = createdDateInNY === todayStr;
      return isCompletedToday || createdToday;
    });

    // Get all active tasks
    const tasks = await FOHTask.find({
      store,
      isActive: true
    });

    // Count tasks by shift type
    const tasksByShift = {
      opening: tasks.filter(task => task.shiftType === 'opening').length,
      transition: tasks.filter(task => task.shiftType === 'transition').length,
      closing: tasks.filter(task => task.shiftType === 'closing').length
    };

    // Count completions by shift type
    const completionsByShift = {
      opening: todayCompletions.filter(comp => comp.task.shiftType === 'opening').length,
      transition: todayCompletions.filter(comp => comp.task.shiftType === 'transition').length,
      closing: todayCompletions.filter(comp => comp.task.shiftType === 'closing').length
    };

    // Helper function to calculate completion rate, capped at 100%
    const calculateRate = (completed, total) => {
      if (total <= 0) return 0;
      const rate = Math.round((completed / total) * 100);
      return Math.min(rate, 100);
    };

    // Calculate completion rates by shift type
    const completionRatesByShift = {
      opening: calculateRate(completionsByShift.opening, tasksByShift.opening),
      transition: calculateRate(completionsByShift.transition, tasksByShift.transition),
      closing: calculateRate(completionsByShift.closing, tasksByShift.closing)
    };

    // Create response with task details
    const response = todayCompletions.map(comp => ({
      id: comp._id,
      task: comp.task.name,
      taskId: comp.task._id,
      shiftType: comp.task.shiftType,
      completedBy: comp.completedBy ? comp.completedBy.name : 'Unknown',
      completedAt: comp.date
    }));

    res.json({
      date: todayStr,
      completions: response,
      totalTasks: tasks.length,
      completedTasks: todayCompletions.length,
      completionRate: tasks.length > 0 ? Math.min(Math.round((todayCompletions.length / tasks.length) * 100), 100) : 0,
      tasksByShift,
      completionsByShift,
      completionRatesByShift
    });

  } catch (error) {
    console.error('Error getting FOH task completions:', error);
    res.status(500).json({
      message: 'Error getting FOH task completions',
      error: error.message
    });
  }
};
