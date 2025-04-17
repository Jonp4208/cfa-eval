import { ShiftChecklistItem, ShiftChecklistCompletion } from '../models/ShiftChecklist.js'
import { validateObjectId } from '../utils/validation.js'
import { ApiError } from '../utils/errors.js'

// Get checklist items by type
export const getChecklistItems = async (req, res) => {
  const { type } = req.params
  
  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  const items = await ShiftChecklistItem.find({ 
    type,
    isActive: true 
  }).sort('order')

  res.json(items.map(item => ({
    id: item._id,
    label: item.label,
    isRequired: item.isRequired,
    type: item.type,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  })))
}

// Update checklist items
export const updateChecklistItems = async (req, res) => {
  const { type } = req.params
  const { items } = req.body

  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  if (!Array.isArray(items)) {
    throw new ApiError(400, 'Items must be an array')
  }

  // Validate items
  items.forEach((item, index) => {
    if (!item.label || typeof item.label !== 'string') {
      throw new ApiError(400, `Invalid label for item at index ${index}`)
    }
  })

  // Start a session for the transaction
  const session = await ShiftChecklistItem.startSession()
  
  try {
    await session.withTransaction(async () => {
      // Deactivate all existing items
      await ShiftChecklistItem.updateMany(
        { type },
        { isActive: false },
        { session }
      )

      // Create new items
      const newItems = await ShiftChecklistItem.create(
        items.map((item, index) => ({
          label: item.label,
          isRequired: item.isRequired || false,
          type,
          order: index,
          isActive: true
        })),
        { session }
      )

      res.json(newItems.map(item => ({
        id: item._id,
        label: item.label,
        isRequired: item.isRequired,
        type: item.type,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })))
    })
  } finally {
    session.endSession()
  }
}

// Complete a checklist
export const completeChecklist = async (req, res) => {
  const { type } = req.params
  const { items, notes } = req.body
  const userId = req.user.id
  const storeId = req.user.store

  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  if (!Array.isArray(items)) {
    throw new ApiError(400, 'Items must be an array')
  }

  // Validate items
  const itemIds = items.map(item => item.id)
  const existingItems = await ShiftChecklistItem.find({
    _id: { $in: itemIds },
    type,
    isActive: true
  })

  if (existingItems.length !== itemIds.length) {
    throw new ApiError(400, 'One or more items are invalid')
  }

  // Check if required items are completed
  const requiredItems = existingItems.filter(item => item.isRequired)
  const completedRequiredItems = items.filter(item => 
    item.isCompleted && 
    requiredItems.some(req => req._id.toString() === item.id)
  )

  if (completedRequiredItems.length !== requiredItems.length) {
    throw new ApiError(400, 'All required items must be completed')
  }

  // Create completion record
  const completion = await ShiftChecklistCompletion.create({
    type,
    items: items.map(item => ({
      item: item.id,
      isCompleted: item.isCompleted
    })),
    completedBy: userId,
    store: storeId,
    notes
  })

  await completion.populate([
    { path: 'completedBy', select: 'name' },
    { path: 'items.item', select: 'label isRequired' }
  ])

  res.json({
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
    completedAt: completion.createdAt,
    notes: completion.notes
  })
}

// Get checklist completions
export const getChecklistCompletions = async (req, res) => {
  const { type } = req.params
  const { startDate, endDate } = req.query
  const storeId = req.user.store

  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  const query = {
    type,
    store: storeId
  }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
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
    completedAt: completion.createdAt,
    notes: completion.notes
  })))
} 