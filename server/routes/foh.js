import express from 'express'
import { auth } from '../middleware/auth.js'
import { FOHTask, FOHTaskCompletion } from '../models/FOHTask.js'
import { getNewYorkDateString, isDateInNewYork, createNewYorkDateForStorage } from '../utils/timezone-utils.js'

const router = express.Router()

// Get all tasks for a store
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await FOHTask.find({
      store: req.user.store,
      isActive: true
    }).sort({ shiftType: 1, createdAt: 1 })
    res.json(tasks)
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
    res.status(500).json({ message: 'Error creating task' })
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

    // Create new completion with the current date in New York timezone
    const completion = new FOHTaskCompletion({
      task: task._id,
      completedBy: req.user._id,
      store: req.user.store,
      date: createNewYorkDateForStorage() // Store date that will be correct in NY timezone
    })

    const savedCompletion = await completion.save()
    console.log('POST /foh/tasks/:id/complete - Task completed successfully')

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
    const query = {
      store: req.user.store,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    const completions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')
      .sort({ date: -1 })
    res.json(completions)
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
    const completions = await FOHTaskCompletion.find(query)
      .populate('task')
      .populate('completedBy', 'name')

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

export default router