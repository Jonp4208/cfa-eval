import express from 'express'
import { auth } from '../middleware/auth.js'
import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js'
import { getNewYorkDateString, isDateInNewYork, createNewYorkDateForStorage } from '../utils/timezone-utils.js'

const router = express.Router()

// Get all tasks for a store with completion status for today
router.get('/tasks', auth, async (req, res) => {
  try {
    console.log('GET /foh/tasks - Request received')

    // Get date from query params or use today's date in New York timezone
    const dateParam = req.query.date || getNewYorkDateString(new Date())

    // For debugging
    console.log(`GET /foh/tasks - Requested date: ${dateParam}`)

    // We don't need to create a date range anymore since we'll filter by NY date string

    // Get all active tasks
    const tasks = await FOHTask.find({
      store: req.user.store,
      isActive: true
    }).sort({ shiftType: 1, createdAt: 1 })

    // Get all completions for this store with user information
    // We'll filter by NY date later
    const completions = await FOHTaskCompletion.find({
      store: req.user.store
    }).populate('completedBy', 'name')

    console.log(`GET /foh/tasks - Found ${completions.length} total completions for this store`)

    // Filter completions to only include those from today in New York timezone
    const filteredCompletions = completions.filter(comp => {
      // Check if the completion date is today in New York timezone
      const isCompletedToday = isDateInNewYork(comp.date, dateParam)

      // Get the New York date strings for logging
      const nyCompDateStr = getNewYorkDateString(comp.date)

      // Log for debugging
      console.log(`Task: ${comp.task}, NY Date: ${nyCompDateStr}, Is Today: ${isCompletedToday}`)

      // Only include completions that were completed today in New York timezone
      return isCompletedToday
    })

    console.log(`GET /foh/tasks - After date string filtering: ${filteredCompletions.length} of ${completions.length} completions match today's date`)

    // Create a map of task IDs to completion information
    const completionMap = new Map()
    filteredCompletions.forEach(completion => {
      // Format the time directly from UTC without timezone conversion
      const date = new Date(completion.date);
      const hours = date.getUTCHours();
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const nyTimeString = `${displayHours}:${minutes} ${ampm}`;

      console.log('Task completion time:', {
        taskId: completion.task.toString(),
        date: completion.date,
        utcHours: hours,
        utcMinutes: minutes,
        formattedTime: nyTimeString
      });

      completionMap.set(completion.task.toString(), {
        completed: true,
        completedBy: completion.completedBy ? completion.completedBy.name : 'Unknown',
        completedAt: completion.date,
        nyTimeString: nyTimeString
      })
    })

    // Add completion status and details to each task
    const tasksWithStatus = tasks.map(task => {
      const taskObj = task.toObject()
      const completionInfo = completionMap.get(task._id.toString())

      if (completionInfo) {
        taskObj.completed = true
        taskObj.completedBy = completionInfo.completedBy
        taskObj.completedAt = completionInfo.completedAt
        taskObj.nyTimeString = completionInfo.nyTimeString

        console.log('Task with completion info:', {
          taskId: task._id.toString(),
          completedAt: completionInfo.completedAt,
          nyTimeString: completionInfo.nyTimeString
        })
      } else {
        taskObj.completed = false
      }

      return taskObj
    })

    console.log(`GET /foh/tasks - Found ${tasks.length} tasks, ${filteredCompletions.length} completed today`)
    res.json(tasksWithStatus)
  } catch (error) {
    console.error('Error fetching FOH tasks:', error)
    res.status(500).json({ message: 'Error fetching tasks' })
  }
})

// Create a new task
router.post('/tasks', auth, async (req, res) => {
  try {
    console.log('POST /foh/tasks - Request received')
    console.log('POST /foh/tasks - Request body:', req.body)
    console.log('POST /foh/tasks - User:', req.user)
    console.log('POST /foh/tasks - Headers:', req.headers)

    const task = new FOHTask({
      ...req.body,
      store: req.user.store,
      createdBy: req.user._id
    })
    console.log('POST /foh/tasks - Creating task:', task)
    await task.save()
    console.log('POST /foh/tasks - Task created successfully')
    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating FOH task:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ message: 'Error creating task', error: error.message })
  }
})

// Update a task
router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await FOHTask.findOneAndUpdate(
      { _id: req.params.id, store: req.user.store },
      req.body,
      { new: true }
    )
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    console.error('Error updating FOH task:', error)
    res.status(500).json({ message: 'Error updating task' })
  }
})

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await FOHTask.findOneAndDelete({
      _id: req.params.id,
      store: req.user.store
    })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting FOH task:', error)
    res.status(500).json({ message: 'Error deleting task' })
  }
})

// Uncomplete a task
router.post('/tasks/:id/uncomplete', auth, async (req, res) => {
  try {
    console.log('POST /foh/tasks/:id/uncomplete - Request received', { taskId: req.params.id })

    // Get the task
    const task = await FOHTask.findOne({
      _id: req.params.id,
      store: req.user.store
    })

    if (!task) {
      console.log('POST /foh/tasks/:id/uncomplete - Task not found')
      return res.status(404).json({ message: 'Task not found' })
    }

    // Get date from request body or use today's date in New York timezone
    const dateParam = req.body.date || getNewYorkDateString(new Date())
    const startOfDay = new Date(dateParam + 'T00:00:00.000Z')
    const endOfDay = new Date(dateParam + 'T23:59:59.999Z')

    console.log(`POST /foh/tasks/:id/uncomplete - Using date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`)

    // Find completions for today
    const completions = await FOHTaskCompletion.find({
      task: task._id,
      store: req.user.store,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })

    // Double-check with date string comparison for extra safety using NY timezone
    const todayCompletions = completions.filter(comp => {
      // Check if the completion date is today in New York timezone
      return isDateInNewYork(comp.date, dateParam)
    })

    console.log(`POST /foh/tasks/:id/uncomplete - Found ${todayCompletions.length} completions for today`)

    if (todayCompletions.length === 0) {
      console.log('POST /foh/tasks/:id/uncomplete - No completion record found for today')
      return res.status(404).json({ message: 'No completion record found for today' })
    }

    // Delete all completions for today
    const deletePromises = todayCompletions.map(comp =>
      FOHTaskCompletion.deleteOne({ _id: comp._id })
    )

    const deleteResults = await Promise.all(deletePromises)
    const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0)

    console.log(`POST /foh/tasks/:id/uncomplete - Deleted ${totalDeleted} completion records`)
    console.log('POST /foh/tasks/:id/uncomplete - Task uncompleted successfully')

    res.status(200).json({ message: 'Task uncompleted successfully' })
  } catch (error) {
    console.error('Error uncompleting FOH task:', error)
    res.status(500).json({ message: 'Error uncompleting task' })
  }
})

// Complete a task
router.post('/tasks/:id/complete', auth, async (req, res) => {
  try {
    console.log('POST /foh/tasks/:id/complete - Request received', { taskId: req.params.id })

    // Get the task
    const task = await FOHTask.findOne({
      _id: req.params.id,
      store: req.user.store
    })

    if (!task) {
      console.log('POST /foh/tasks/:id/complete - Task not found')
      return res.status(404).json({ message: 'Task not found' })
    }

    // Get date from request body or use today's date in New York timezone
    const dateParam = req.body.date || getNewYorkDateString(new Date())
    const startOfDay = new Date(dateParam + 'T00:00:00.000Z')
    const endOfDay = new Date(dateParam + 'T23:59:59.999Z')

    console.log(`POST /foh/tasks/:id/complete - Using date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`)

    // Check if task is already completed today using date range
    const existingCompletions = await FOHTaskCompletion.find({
      task: task._id,
      store: req.user.store,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })

    console.log(`POST /foh/tasks/:id/complete - Found ${existingCompletions.length} completions for date range`)

    // Double-check with date string comparison for extra safety
    const todayCompletions = existingCompletions.filter(comp => {
      const nyCompDateStr = getNewYorkDateString(comp.date)
      return nyCompDateStr === dateParam
    })

    console.log(`POST /foh/tasks/:id/complete - After date string filtering: ${todayCompletions.length} completions match today's date`)

    if (todayCompletions.length > 0) {
      console.log('POST /foh/tasks/:id/complete - Task already completed today')
      return res.status(400).json({
        message: 'Task already completed today',
        completion: todayCompletions[0]
      })
    }

    // Create new completion with the current date in New York timezone
    const completion = new FOHTaskCompletion({
      task: task._id,
      completedBy: req.user._id,
      store: req.user.store,
      date: createNewYorkDateForStorage() // Store date that will be correct in NY timezone
    })

    console.log('POST /foh/tasks/:id/complete - About to save completion:', {
      task: completion.task.toString(),
      completedBy: completion.completedBy.toString(),
      store: completion.store.toString(),
      date: completion.date,
      dateObj: completion.date instanceof Date,
      dateISO: completion.date.toISOString(),
      nyDate: getNewYorkDateString(completion.date)
    })

    const savedCompletion = await completion.save()
    console.log('POST /foh/tasks/:id/complete - Task completed successfully', {
      id: savedCompletion._id,
      task: savedCompletion.task.toString(),
      date: savedCompletion.date,
      dateISO: savedCompletion.date.toISOString(),
      nyDate: getNewYorkDateString(savedCompletion.date),
      createdAt: savedCompletion.createdAt
    })

    res.status(201).json(savedCompletion)
  } catch (error) {
    console.error('Error completing FOH task:', error)
    res.status(500).json({ message: 'Error completing task' })
  }
})

// Get task completions for a date range
router.get('/completions', auth, async (req, res) => {
  try {
    console.log('GET /foh/completions - Request received')
    const { startDate, endDate } = req.query

    console.log(`GET /foh/completions - Date range: ${startDate} to ${endDate}`)

    // Create query with date range
    const query = {
      store: req.user.store,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    console.log(`GET /foh/completions - Query: ${JSON.stringify(query)}`)

    // Get all completions for this store in the date range
    const allCompletions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')
      .sort({ date: -1 })

    console.log(`GET /foh/completions - Found ${allCompletions.length} completions in date range`)

    // Add New York timezone date string to each completion for easier client-side display
    const completionsWithTimezone = allCompletions.map(completion => {
      const completionObj = completion.toObject()
      completionObj.nyDateString = getNewYorkDateString(completion.date)
      completionObj.nyTimeString = new Date(completion.date).toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      return completionObj
    })

    console.log(`GET /foh/completions - Returning ${completionsWithTimezone.length} completions with timezone info`)

    res.json(completionsWithTimezone)
  } catch (error) {
    console.error('Error fetching FOH task completions:', error)
    res.status(500).json({ message: 'Error fetching completions' })
  }
})

// Get completion statistics
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('GET /foh/stats - Request received')
    const { startDate, endDate } = req.query

    console.log(`GET /foh/stats - Date range: ${startDate} to ${endDate}`)

    const query = {
      store: req.user.store,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    console.log(`GET /foh/stats - Query: ${JSON.stringify(query)}`)

    // Get all tasks
    const tasks = await FOHTask.find({ store: req.user.store, isActive: true })
    console.log(`GET /foh/stats - Found ${tasks.length} total tasks`)

    // Get completions for the date range
    const allCompletions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')

    console.log(`GET /foh/stats - Found ${allCompletions.length} completions in date range`)

    // Filter completions to ensure they're within the date range in New York timezone
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const startDateStr = getNewYorkDateString(startDateObj)
    const endDateStr = getNewYorkDateString(endDateObj)

    console.log(`GET /foh/stats - NY date range: ${startDateStr} to ${endDateStr}`)

    const completions = allCompletions.filter(comp => {
      const compDateStr = getNewYorkDateString(comp.date)
      return compDateStr >= startDateStr && compDateStr <= endDateStr
    })

    console.log(`GET /foh/stats - After NY timezone filtering: ${completions.length} completions`)

    // Calculate statistics
    const stats = {
      totalTasks: tasks.length,
      completedTasks: completions.length,
      completionRate: tasks.length > 0 ? (completions.length / tasks.length) * 100 : 0,
      completionsByShift: {
        opening: completions.filter(c => c.task.shiftType === 'opening').length,
        transition: completions.filter(c => c.task.shiftType === 'transition').length,
        closing: completions.filter(c => c.task.shiftType === 'closing').length
      }
    }

    console.log(`GET /foh/stats - Returning stats: ${JSON.stringify(stats)}`)

    res.json(stats)
  } catch (error) {
    console.error('Error fetching FOH task statistics:', error)
    res.status(500).json({ message: 'Error fetching statistics' })
  }
})

// Reset FOH task completions for today (admin only)
router.post('/reset-completions', auth, async (req, res) => {
  try {
    // Check if user is admin or manager
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized: Only admins and managers can reset completions' })
    }

    console.log('POST /foh/reset-completions - Request received')

    // Get the current date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    console.log(`POST /foh/reset-completions - Today: ${todayStr}`)

    // Check if this is a force reset (delete all completions for this store)
    const forceReset = req.body.force === true

    if (forceReset) {
      console.log('POST /foh/reset-completions - Performing FORCE RESET')

      // Delete ALL completions for this store
      const result = await FOHTaskCompletion.deleteMany({
        store: req.user.store
      })

      console.log(`POST /foh/reset-completions - Force deleted ${result.deletedCount} completions`)

      return res.json({
        message: 'FOH task completions force reset successfully',
        count: result.deletedCount,
        force: true
      })
    }

    // For regular reset, find all completions for this store
    const allCompletions = await FOHTaskCompletion.find({
      store: req.user.store
    })

    // Filter completions to only include those from today in New York timezone
    const completionsToReset = allCompletions.filter(comp => {
      // Check if the completion date is today in New York timezone
      const isCompletedToday = isDateInNewYork(comp.date, todayStr)

      // Get the New York date strings for logging
      const nyCompDateStr = getNewYorkDateString(comp.date)

      // Log for debugging
      console.log(`Reset check - Task: ${comp.task}, NY Date: ${nyCompDateStr}, Is Today: ${isCompletedToday}`)

      // Only reset completions that were completed today in New York timezone
      return isCompletedToday
    })

    console.log(`POST /foh/reset-completions - Found ${completionsToReset.length} completions to reset`)

    // Delete all completions that need to be reset
    if (completionsToReset.length > 0) {
      const result = await FOHTaskCompletion.deleteMany({
        _id: { $in: completionsToReset.map(c => c._id) }
      })

      console.log(`POST /foh/reset-completions - Deleted ${result.deletedCount} completions`)
    }

    res.json({ message: 'FOH task completions reset successfully', count: completions.length })
  } catch (error) {
    console.error('Error resetting FOH task completions:', error)
    res.status(500).json({ message: 'Error resetting completions' })
  }
})

export default router