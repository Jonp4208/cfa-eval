import express from 'express'
import { auth } from '../middleware/auth.js'
import { ShiftChecklistItem, ShiftChecklistCompletion } from '../models/ShiftChecklist.js'

const router = express.Router()

// Get all kitchen checklist items
router.get('/items/:type', auth, async (req, res) => {
  try {
    const { type } = req.params
    
    if (!['opening', 'transition', 'closing'].includes(type)) {
      return res.status(400).json({ message: 'Invalid checklist type' })
    }
    
    const items = await ShiftChecklistItem.find({
      type,
      isActive: true
    }).sort({ order: 1 })
    
    res.json(items)
  } catch (error) {
    console.error('Error fetching kitchen checklist items:', error)
    res.status(500).json({ message: 'Error fetching checklist items' })
  }
})

// Complete a single kitchen checklist item
router.post('/items/:id/complete', auth, async (req, res) => {
  try {
    console.log('POST /kitchen/items/:id/complete - Request received', { itemId: req.params.id })
    
    // Get the item
    const item = await ShiftChecklistItem.findOne({
      _id: req.params.id,
      isActive: true
    })
    
    if (!item) {
      console.log('POST /kitchen/items/:id/complete - Item not found')
      return res.status(404).json({ message: 'Item not found' })
    }
    
    // Always use the current date and time
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    console.log(`POST /kitchen/items/:id/complete - Using date: ${today}`)
    
    // Check if item is already completed today
    const existingCompletion = await ShiftChecklistCompletion.findOne({
      'items.item': item._id,
      store: req.user.store,
      createdAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    })
    
    if (existingCompletion) {
      console.log('POST /kitchen/items/:id/complete - Item already has a completion record for today')
      
      // Check if this specific item is marked as completed
      const itemEntry = existingCompletion.items.find(i => 
        i.item.toString() === item._id.toString()
      )
      
      if (itemEntry && itemEntry.isCompleted) {
        console.log('POST /kitchen/items/:id/complete - Item is already completed in the record')
        return res.status(400).json({
          message: 'Item already completed today',
          completion: existingCompletion
        })
      }
      
      // If the item exists in the record but is not completed, update it
      if (itemEntry) {
        itemEntry.isCompleted = true
        await existingCompletion.save()
        
        console.log('POST /kitchen/items/:id/complete - Updated existing completion record')
        return res.status(200).json(existingCompletion)
      }
      
      // If the item doesn't exist in the record, add it
      existingCompletion.items.push({
        item: item._id,
        isCompleted: true
      })
      
      await existingCompletion.save()
      
      console.log('POST /kitchen/items/:id/complete - Added item to existing completion record')
      return res.status(200).json(existingCompletion)
    }
    
    // Create new completion record
    const completion = new ShiftChecklistCompletion({
      type: item.type,
      items: [{
        item: item._id,
        isCompleted: true
      }],
      completedBy: req.user._id,
      store: req.user.store
    })
    
    console.log('POST /kitchen/items/:id/complete - Creating new completion record')
    
    const savedCompletion = await completion.save()
    await savedCompletion.populate([
      { path: 'completedBy', select: 'name' },
      { path: 'items.item', select: 'label isRequired' }
    ])
    
    console.log('POST /kitchen/items/:id/complete - Item completed successfully')
    
    res.status(201).json({
      id: savedCompletion._id,
      type: savedCompletion.type,
      items: savedCompletion.items.map(item => ({
        id: item.item._id,
        label: item.item.label,
        isRequired: item.item.isRequired,
        isCompleted: item.isCompleted
      })),
      completedBy: {
        id: savedCompletion.completedBy._id,
        name: savedCompletion.completedBy.name
      },
      completedAt: savedCompletion.createdAt
    })
  } catch (error) {
    console.error('Error completing kitchen checklist item:', error)
    res.status(500).json({ message: 'Error completing checklist item' })
  }
})

// Uncomplete a kitchen checklist item
router.post('/items/:id/uncomplete', auth, async (req, res) => {
  try {
    console.log('POST /kitchen/items/:id/uncomplete - Request received', { itemId: req.params.id })
    
    // Get the item
    const item = await ShiftChecklistItem.findOne({
      _id: req.params.id,
      isActive: true
    })
    
    if (!item) {
      console.log('POST /kitchen/items/:id/uncomplete - Item not found')
      return res.status(404).json({ message: 'Item not found' })
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    const startOfDay = new Date(today)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    
    console.log(`POST /kitchen/items/:id/uncomplete - Using date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`)
    
    // Find the completion record for today
    const completion = await ShiftChecklistCompletion.findOne({
      'items.item': item._id,
      store: req.user.store,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    
    if (!completion) {
      console.log('POST /kitchen/items/:id/uncomplete - No completion record found for today')
      return res.status(404).json({ message: 'No completion record found for today' })
    }
    
    // Find the item in the completion record
    const itemEntry = completion.items.find(i => 
      i.item.toString() === item._id.toString()
    )
    
    if (!itemEntry || !itemEntry.isCompleted) {
      console.log('POST /kitchen/items/:id/uncomplete - Item is not completed in the record')
      return res.status(400).json({ message: 'Item is not completed' })
    }
    
    // Update the item to be uncompleted
    itemEntry.isCompleted = false
    await completion.save()
    
    console.log('POST /kitchen/items/:id/uncomplete - Item uncompleted successfully')
    res.status(200).json({ message: 'Item uncompleted successfully' })
  } catch (error) {
    console.error('Error uncompleting kitchen checklist item:', error)
    res.status(500).json({ message: 'Error uncompleting checklist item' })
  }
})

// Get completions for a date range
router.get('/completions/:type', auth, async (req, res) => {
  try {
    const { type } = req.params
    const { startDate, endDate } = req.query
    
    if (!['opening', 'transition', 'closing'].includes(type)) {
      return res.status(400).json({ message: 'Invalid checklist type' })
    }
    
    const query = {
      type,
      store: req.user.store
    }
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999))
    }
    
    const completions = await ShiftChecklistCompletion.find(query)
      .sort('-createdAt')
      .limit(100)
      .populate([
        { path: 'completedBy', select: 'name' },
        { path: 'items.item', select: 'label isRequired' }
      ])
    
    res.json(completions.map(completion => ({
      id: completion._id,
      type: completion.type,
      items: completion.items.map(item => ({
        id: item.item._id,
        label: item.item.label,
        isRequired: item.item.isRequired,
        isCompleted: item.isCompleted
      })),
      completedBy: {
        id: completion.completedBy._id,
        name: completion.completedBy.name
      },
      completedAt: completion.createdAt
    })))
  } catch (error) {
    console.error('Error fetching kitchen checklist completions:', error)
    res.status(500).json({ message: 'Error fetching checklist completions' })
  }
})

export default router
