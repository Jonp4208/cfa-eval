import express from 'express'
import { auth } from '../middleware/auth.js'
import Template from '../models/Template.js'
import DailySchedule from '../models/DailySchedule.js'
import Employee from '../models/Employee.js'

const router = express.Router()

// Get all templates for a store
router.get('/templates/:storeId', auth, async (req, res) => {
  try {
    const templates = await Template.find({
      storeId: req.params.storeId,
      isArchived: false
    }).sort({ createdAt: -1 })
    res.json(templates)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a specific template
router.get('/templates/:storeId/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.templateId,
      storeId: req.params.storeId,
      isArchived: false
    })
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new template
router.post('/templates', auth, async (req, res) => {
  try {
    const template = new Template({
      ...req.body,
      createdBy: req.user._id
    })
    const savedTemplate = await template.save()
    res.status(201).json(savedTemplate)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update a template
router.put('/templates/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.templateId, storeId: req.body.storeId },
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    )
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Archive a template
router.delete('/templates/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.templateId, storeId: req.query.storeId },
      { isArchived: true, updatedBy: req.user._id },
      { new: true }
    )
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get current assignments for a store
router.get('/assignments/:storeId', auth, async (req, res) => {
  try {
    const { date } = req.query
    const dailySchedule = await DailySchedule.findOne({
      storeId: req.params.storeId,
      date: new Date(date)
    }).populate('employeeAssignments.employeeId')
    
    if (!dailySchedule) {
      return res.json({ employeeAssignments: [] })
    }
    
    res.json(dailySchedule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create or update assignments
router.post('/assignments', auth, async (req, res) => {
  try {
    const { storeId, date, employeeAssignments } = req.body
    
    let dailySchedule = await DailySchedule.findOne({
      storeId,
      date: new Date(date)
    })
    
    if (!dailySchedule) {
      dailySchedule = new DailySchedule({
        storeId,
        date: new Date(date),
        employeeAssignments: []
      })
    }
    
    dailySchedule.employeeAssignments = employeeAssignments
    dailySchedule.updatedBy = req.user._id
    
    const savedSchedule = await dailySchedule.save()
    res.json(savedSchedule)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Publish assignments
router.put('/assignments/:storeId/publish', auth, async (req, res) => {
  try {
    const { date } = req.body
    const dailySchedule = await DailySchedule.findOneAndUpdate(
      { storeId: req.params.storeId, date: new Date(date) },
      { 
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: req.user._id
      },
      { new: true }
    )
    
    if (!dailySchedule) {
      return res.status(404).json({ message: 'Daily schedule not found' })
    }
    
    res.json(dailySchedule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router 