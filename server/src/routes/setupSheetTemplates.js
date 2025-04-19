import express from 'express'
import { checkSchema, body, param } from 'express-validator'
import { auth } from '../middleware/auth.js'
import { SetupSheetTemplate } from '../models/SetupSheetTemplate.js'
import { validationResult } from 'express-validator'

const router = express.Router()

// Get all templates
router.get('/', auth, async (req, res) => {
  try {
    const templates = await SetupSheetTemplate.find({ storeId: req.user.store._id })
      .sort({ updatedAt: -1 })
    res.json(templates)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch templates' })
  }
})

// Create new template
router.post('/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('weekSchedule').isObject().withMessage('Week schedule is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      console.log('Creating template with data:', {
        ...req.body,
        storeId: req.user.store._id,
        createdBy: req.user.userId
      })

      const template = new SetupSheetTemplate({
        ...req.body,
        storeId: req.user.store._id,
        createdBy: req.user.userId
      })

      const savedTemplate = await template.save()
      res.status(201).json(savedTemplate)
    } catch (error) {
      console.error('Error creating template:', error)
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'A template with this name already exists for your store. Please choose a different name.',
          error: 'DUPLICATE_TEMPLATE_NAME'
        })
      }
      
      res.status(500).json({ 
        message: 'Failed to create template',
        error: error.message 
      })
    }
  }
)

// Update template
router.put('/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('weekSchedule').isObject().withMessage('Week schedule is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const template = await SetupSheetTemplate.findOneAndUpdate(
        { _id: req.params.id, storeId: req.user.store._id },
        {
          ...req.body,
          updatedBy: req.user.userId
        },
        { new: true }
      )

      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      res.json(template)
    } catch (error) {
      res.status(500).json({ message: 'Failed to update template' })
    }
  }
)

// Delete template
router.delete('/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid template ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const template = await SetupSheetTemplate.findOneAndDelete({
        _id: req.params.id,
        storeId: req.user.store._id
      })

      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete template' })
    }
  }
)

export { router as setupSheetTemplatesRouter } 