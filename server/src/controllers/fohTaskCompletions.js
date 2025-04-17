import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js';
import { getNewYorkDateString, isDateInNewYork } from '../utils/timezone-utils.js';

/**
 * Get all FOH task completions for today
 */
export const getTodayCompletions = async (req, res) => {
  try {
    console.log('GET /foh-task-completions/today - Request received');
    const { store } = req.user;

    // Get today's date in New York timezone
    const today = new Date();
    const todayStr = getNewYorkDateString(today);

    // For debugging, show the exact date we're using
    console.log(`GET /foh-task-completions/today - Current time: ${today.toISOString()}`);
    console.log(`GET /foh-task-completions/today - Today's date in NY: ${todayStr}`);

    // Create date range for today in New York timezone
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay = new Date(todayStr + 'T23:59:59.999Z');

    console.log(`GET /foh-task-completions/today - Date: ${todayStr}`);
    console.log(`GET /foh-task-completions/today - Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Get all completions for today
    const completions = await FOHTaskCompletion.find({
      store
    }).populate('task').populate('completedBy', 'name');

    console.log(`GET /foh-task-completions/today - Found ${completions.length} total completions`);

    // Filter completions for today using New York timezone
    const todayCompletions = completions.filter(comp => {
      // Check if the completion date is today in New York timezone
      const isCompletedToday = isDateInNewYork(comp.date, todayStr);

      // Get the New York date string for logging
      const nyCompDateStr = getNewYorkDateString(comp.date);

      // Also check creation date in New York timezone
      const createdDateInNY = getNewYorkDateString(comp.createdAt);
      const createdToday = createdDateInNY === todayStr;

      console.log(`Completion ${comp._id}: NY date=${nyCompDateStr}, isToday=${isCompletedToday}, createdToday=${createdToday}`);

      // Use both checks - either the date or createdAt should be today in NY timezone
      return isCompletedToday || createdToday;
    });

    console.log(`GET /foh-task-completions/today - Found ${todayCompletions.length} completions for today`);

    // Log all completions with their dates
    console.log('GET /foh-task-completions/today - All completions:', completions.map(comp => ({
      id: comp._id,
      task: comp.task.name,
      taskId: comp.task._id,
      completedBy: comp.completedBy ? comp.completedBy.name : 'Unknown',
      date: comp.date,
      dateStr: new Date(comp.date).toISOString().split('T')[0],
      createdAt: comp.createdAt
    })));

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

    console.log('Tasks by shift:', tasksByShift);

    // Count completions by shift type
    const completionsByShift = {
      opening: todayCompletions.filter(comp => comp.task.shiftType === 'opening').length,
      transition: todayCompletions.filter(comp => comp.task.shiftType === 'transition').length,
      closing: todayCompletions.filter(comp => comp.task.shiftType === 'closing').length
    };

    console.log('Completions by shift:', completionsByShift);

    // Helper function to calculate completion rate, capped at 100%
    const calculateRate = (completed, total) => {
      if (total <= 0) return 0;
      const rate = Math.round((completed / total) * 100);
      // Cap at 100% to prevent values over 100%
      return Math.min(rate, 100);
    };

    // Calculate completion rates by shift type, ensuring they don't exceed 100%
    const completionRatesByShift = {
      opening: calculateRate(completionsByShift.opening, tasksByShift.opening),
      transition: calculateRate(completionsByShift.transition, tasksByShift.transition),
      closing: calculateRate(completionsByShift.closing, tasksByShift.closing)
    };

    console.log('Completion rates by shift:', completionRatesByShift);

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
