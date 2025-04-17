import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js';

/**
 * Get FOH task completion statistics
 */
export const getFOHTaskStats = async (req, res) => {
  try {
    console.log('GET /foh-stats/stats - Request received');
    const { store } = req.user;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`GET /foh-stats/stats - Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`GET /foh-stats/stats - Store: ${store}`);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all active tasks
    const allTasks = await FOHTask.find({
      store,
      isActive: true
    });

    // Get today's date as a string (YYYY-MM-DD) for more reliable date comparison
    const todayStr = today.toISOString().split('T')[0];
    console.log(`GET /foh-stats/stats - Today's date string: ${todayStr}`);

    // Get all task completions for today using date string comparison
    const todayCompletions = await FOHTaskCompletion.find({
      store,
      // Use $expr and $substr to compare just the date part (YYYY-MM-DD)
      $expr: {
        $eq: [
          { $substr: [{ $toString: "$date" }, 0, 10] },
          todayStr
        ]
      }
    }).populate('completedBy', 'name');

    // Also try the original date range query as a fallback
    const todayCompletionsAlt = await FOHTaskCompletion.find({
      store,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('completedBy', 'name');

    console.log(`GET /foh-stats/stats - Alternative query found ${todayCompletionsAlt.length} completions`);

    // Combine results from both queries (removing duplicates)
    const combinedCompletions = [...todayCompletions];
    todayCompletionsAlt.forEach(comp => {
      if (!combinedCompletions.some(c => c._id.toString() === comp._id.toString())) {
        combinedCompletions.push(comp);
      }
    });

    console.log(`GET /foh-stats/stats - Combined query found ${combinedCompletions.length} completions`);

    console.log(`GET /foh-stats/stats - Found ${todayCompletions.length} completions for today`);

    // Get ALL completions (for debugging)
    const allCompletions = await FOHTaskCompletion.find({ store }).populate('completedBy', 'name');
    console.log(`GET /foh-stats/stats - Found ${allCompletions.length} total completions in database`);

    if (allCompletions.length > 0) {
      console.log('GET /foh-stats/stats - All completions:', allCompletions.map(comp => ({
        id: comp._id,
        task: comp.task,
        completedBy: comp.completedBy ? comp.completedBy.name : 'Unknown',
        date: comp.date,
        dateStr: comp.date.toISOString().split('T')[0],
        createdAt: comp.createdAt
      })));
    }

    if (combinedCompletions.length > 0) {
      console.log('GET /foh-stats/stats - Sample today completion:', {
        id: combinedCompletions[0]._id,
        task: combinedCompletions[0].task,
        completedBy: combinedCompletions[0].completedBy ? combinedCompletions[0].completedBy.name : 'Unknown',
        date: combinedCompletions[0].date,
        dateStr: combinedCompletions[0].date.toISOString().split('T')[0]
      });
    }

    // Get all task completions for this week
    const weekCompletions = await FOHTaskCompletion.find({
      store,
      date: {
        $gte: startOfWeek,
        $lte: endOfDay
      }
    });

    // Calculate statistics by shift type
    const tasksByShift = {
      opening: allTasks.filter(task => task.shiftType === 'opening').length,
      transition: allTasks.filter(task => task.shiftType === 'transition').length,
      closing: allTasks.filter(task => task.shiftType === 'closing').length
    };

    const completionsByShift = {
      opening: combinedCompletions.filter(comp =>
        allTasks.find(task =>
          task._id.toString() === comp.task.toString() && task.shiftType === 'opening'
        )
      ).length,
      transition: combinedCompletions.filter(comp =>
        allTasks.find(task =>
          task._id.toString() === comp.task.toString() && task.shiftType === 'transition'
        )
      ).length,
      closing: combinedCompletions.filter(comp =>
        allTasks.find(task =>
          task._id.toString() === comp.task.toString() && task.shiftType === 'closing'
        )
      ).length
    };

    // Calculate completion rates
    const totalTasks = allTasks.length;
    const totalCompletionsToday = combinedCompletions.length;
    const totalCompletionsWeek = weekCompletions.length;

    const dailyCompletionRate = totalTasks > 0
      ? Math.round((totalCompletionsToday / totalTasks) * 100)
      : 0;

    // Get recent completions with user info
    const recentCompletions = combinedCompletions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(comp => {
        const task = allTasks.find(t => t._id.toString() === comp.task.toString());
        return {
          taskName: task ? task.name : 'Unknown Task',
          shiftType: task ? task.shiftType : 'unknown',
          completedBy: comp.completedBy ? comp.completedBy.name : 'Unknown User',
          completedAt: comp.date
        };
      });

    const response = {
      totalTasks,
      totalCompletionsToday,
      totalCompletionsWeek,
      dailyCompletionRate,
      tasksByShift,
      completionsByShift,
      recentCompletions
    };

    console.log('GET /foh-stats/stats - Response:', response);
    res.json(response);

  } catch (error) {
    console.error('Error getting FOH task stats:', error);
    res.status(500).json({
      message: 'Error getting FOH task stats',
      error: error.message
    });
  }
};
