import express from 'express'
import { auth } from '../middleware/auth.js'
import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js'
import { getNewYorkDateString, isDateInNewYork, createNewYorkDateForStorage } from '../utils/timezone-utils.js'

const router = express.Router()

// Get all tasks for a store with completion status for today
router.get('/tasks', auth, async (req, res) => {
  try {
    // Get date from query params or use today's date in New York timezone
    const dateParam = req.query.date || getNewYorkDateString(new Date())

    // Get all active tasks
    const tasks = await FOHTask.find({
      store: req.user.store,
      isActive: true
    }).sort({ shiftType: 1, createdAt: 1 })

    // Get all completions for this store with user information
    const completions = await FOHTaskCompletion.find({
      store: req.user.store
    }).populate('completedBy', 'name')

    // Filter completions to only include those from today in New York timezone
    const filteredCompletions = completions.filter(comp => {
      // Check if the completion date is today in New York timezone
      const isCompletedToday = isDateInNewYork(comp.date, dateParam)
      // Only include completions that were completed today in New York timezone
      return isCompletedToday
    })

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
      } else {
        taskObj.completed = false
      }

      return taskObj
    })

    res.json(tasksWithStatus)
  } catch (error) {
    console.error('Error fetching FOH tasks:', error)
    res.status(500).json({ message: 'Error fetching tasks' })
  }
})

// Create a new task
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new FOHTask({
      ...req.body,
      store: req.user.store,
      createdBy: req.user._id
    })
    await task.save()
    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating FOH task:', error)
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
    // Get the task
    const task = await FOHTask.findOne({
      _id: req.params.id,
      store: req.user.store
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Get date from request body or use today's date in New York timezone
    const dateParam = req.body.date || getNewYorkDateString(new Date())
    const startOfDay = new Date(dateParam + 'T00:00:00.000Z')
    const endOfDay = new Date(dateParam + 'T23:59:59.999Z')

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

    if (todayCompletions.length === 0) {
      return res.status(404).json({ message: 'No completion record found for today' })
    }

    // Delete all completions for today
    const deletePromises = todayCompletions.map(comp =>
      FOHTaskCompletion.deleteOne({ _id: comp._id })
    )

    const deleteResults = await Promise.all(deletePromises)
    const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0)

    res.status(200).json({ message: 'Task uncompleted successfully' })
  } catch (error) {
    console.error('Error uncompleting FOH task:', error)
    res.status(500).json({ message: 'Error uncompleting task' })
  }
})

// Complete a task
router.post('/tasks/:id/complete', auth, async (req, res) => {
  try {
    // Get the task
    const task = await FOHTask.findOne({
      _id: req.params.id,
      store: req.user.store
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Get date from request body or use today's date in New York timezone
    const dateParam = req.body.date || getNewYorkDateString(new Date())
    const startOfDay = new Date(dateParam + 'T00:00:00.000Z')
    const endOfDay = new Date(dateParam + 'T23:59:59.999Z')

    // Check if task is already completed today using date range
    const existingCompletions = await FOHTaskCompletion.find({
      task: task._id,
      store: req.user.store,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })

    // Double-check with date string comparison for extra safety
    const todayCompletions = existingCompletions.filter(comp => {
      const nyCompDateStr = getNewYorkDateString(comp.date)
      return nyCompDateStr === dateParam
    })

    if (todayCompletions.length > 0) {
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

    const savedCompletion = await completion.save()
    res.status(201).json(savedCompletion)
  } catch (error) {
    console.error('Error completing FOH task:', error)
    res.status(500).json({ message: 'Error completing task' })
  }
})

// Get task completions for a date range
router.get('/completions', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Create query with date range
    const query = {
      store: req.user.store,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Get all completions for this store in the date range
    const allCompletions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')
      .sort({ date: -1 })

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

    res.json(completionsWithTimezone)
  } catch (error) {
    console.error('Error fetching FOH task completions:', error)
    res.status(500).json({ message: 'Error fetching completions' })
  }
})

// Get completion statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const query = {
      store: req.user.store,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Get all tasks
    const tasks = await FOHTask.find({ store: req.user.store, isActive: true })

    // Get completions for the date range
    const allCompletions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')

    // Filter completions to ensure they're within the date range in New York timezone
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const startDateStr = getNewYorkDateString(startDateObj)
    const endDateStr = getNewYorkDateString(endDateObj)

    const completions = allCompletions.filter(comp => {
      const compDateStr = getNewYorkDateString(comp.date)
      return compDateStr >= startDateStr && compDateStr <= endDateStr
    })

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

    // Get the current date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Check if this is a force reset (delete all completions for this store)
    const forceReset = req.body.force === true

    if (forceReset) {
      // Delete ALL completions for this store
      const result = await FOHTaskCompletion.deleteMany({
        store: req.user.store
      })

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
      // Only reset completions that were completed today in New York timezone
      return isCompletedToday
    })

    // Delete all completions that need to be reset
    if (completionsToReset.length > 0) {
      const result = await FOHTaskCompletion.deleteMany({
        _id: { $in: completionsToReset.map(c => c._id) }
      })
    }

    res.json({ message: 'FOH task completions reset successfully', count: completionsToReset.length })
  } catch (error) {
    console.error('Error resetting FOH task completions:', error)
    res.status(500).json({ message: 'Error resetting completions' })
  }
})

export default router