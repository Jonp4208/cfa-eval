import { ShiftChecklistItem, ShiftChecklistCompletion } from '../models/ShiftChecklist.js'
import { validateObjectId } from '../utils/validation.js'
import { ApiError } from '../utils/errors.js'

// Get all checklist items (similar to FOH tasks)
export const getChecklistItems = async (req, res) => {
  const storeId = req.user.store
  const { type } = req.query // Get type from query params instead of route params

  try {
    // Create a query for store and active items
    const query = {
      isActive: true,
      store: storeId
    }

    // Add type filter if provided
    if (type && ['opening', 'transition', 'closing'].includes(type)) {
      query.type = type
    }

    console.log('Fetching kitchen tasks with query:', query)
    const items = await ShiftChecklistItem.find(query).sort({ type: 1, order: 1 })

    res.json(items.map(item => ({
      id: item._id,
      name: item.label, // Map label to name for consistency with FOH
      shiftType: item.type, // Map type to shiftType for consistency with FOH
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    })))
  } catch (error) {
    console.error('Error fetching kitchen tasks:', error)
    res.status(500).json({ message: 'Error fetching tasks', error: error.message })
  }
}

// Update checklist items
export const updateChecklistItems = async (req, res) => {
  const { type } = req.params
  const { items } = req.body
  const storeId = req.user.store

  console.log('updateChecklistItems called with:', { type, storeId })
  console.log('Items received:', items)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' })
  }

  try {
    // Deactivate all existing items of this type
    await ShiftChecklistItem.updateMany(
      { type, isActive: true },
      { isActive: false }
    )

    // Create new items
    const newItems = []

    // Process each item one by one
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (!item.label || typeof item.label !== 'string') {
        return res.status(400).json({ message: `Invalid label for item at index ${i}` })
      }

      try {
        const newItem = new ShiftChecklistItem({
          label: item.label,
          isRequired: item.isRequired || false,
          type,
          order: i,
          isActive: true,
          store: storeId
        })

        const savedItem = await newItem.save()
        newItems.push(savedItem)
      } catch (itemError) {
        console.error(`Error saving item at index ${i}:`, itemError)
        // Continue with the next item
      }
    }

    // Return the new items
    res.json(newItems.map(item => ({
      id: item._id,
      label: item.label,
      isRequired: item.isRequired,
      type: item.type,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    })))
  } catch (error) {
    console.error('Error updating checklist items:', error)
    res.status(500).json({ message: 'Error updating checklist items', error: error.message })
  }
}

// Complete a checklist
export const completeChecklist = async (req, res) => {
  const { type } = req.params
  const { items, notes, forcePartialSave } = req.body
  const userId = req.user.id
  const storeId = req.user.store

  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  if (!Array.isArray(items)) {
    throw new ApiError(400, 'Items must be an array')
  }

  try {
    // Validate items
    const itemIds = items.map(item => item.id)

    // Create a query that handles both items with and without store field
    const query = {
      _id: { $in: itemIds },
      type,
      isActive: true
    }

    if (storeId) {
      query.$or = [
        { store: storeId },
        { store: { $exists: false } }
      ]
    }

    console.log('Validating items with query:', query)
    const existingItems = await ShiftChecklistItem.find(query)

    if (existingItems.length !== itemIds.length) {
      throw new ApiError(400, 'One or more items are invalid')
    }

    // Check if required items are completed (unless forcePartialSave is true)
    if (!forcePartialSave) {
      const requiredItems = existingItems.filter(item => item.isRequired)
      const completedRequiredItems = items.filter(item =>
        item.isCompleted &&
        requiredItems.some(req => req._id.toString() === item.id)
      )

      if (completedRequiredItems.length !== requiredItems.length) {
        throw new ApiError(400, 'All required items must be completed')
      }
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
        id: item.item?._id || 'unknown',
        label: item.item?.label || 'Unknown Item',
        isRequired: item.item?.isRequired || false,
        isCompleted: item.isCompleted
      })),
      completedBy: {
        id: completion.completedBy._id,
        name: completion.completedBy.name
      },
      completedAt: completion.createdAt,
      notes: completion.notes,
      savedToServer: true
    })
  } catch (error) {
    console.error('Error completing checklist:', error)
    res.status(500).json({ message: 'Error completing checklist', error: error.message })
  }
}

// Get checklist completions
export const getChecklistCompletions = async (req, res) => {
  const { type } = req.params
  const { startDate, endDate } = req.query
  const storeId = req.user.store

  if (!['opening', 'transition', 'closing'].includes(type)) {
    throw new ApiError(400, 'Invalid checklist type')
  }

  try {
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
        id: item.item?._id || 'unknown',
        label: item.item?.label || 'Unknown Item',
        isRequired: item.item?.isRequired || false,
        isCompleted: item.isCompleted
      })),
      completedBy: {
        id: completion.completedBy?._id || 'unknown',
        name: completion.completedBy?.name || 'Unknown User'
      },
      completedAt: completion.createdAt,
      notes: completion.notes
    })))
  } catch (error) {
    console.error('Error fetching checklist completions:', error)
    res.status(500).json({ message: 'Error fetching checklist completions', error: error.message })
  }
}

// Create a single checklist item (similar to FOH task creation)
export const createChecklistItem = async (req, res) => {
  const { name, shiftType } = req.body
  const storeId = req.user.store

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required and must be a string' })
  }

  if (!['opening', 'transition', 'closing'].includes(shiftType)) {
    return res.status(400).json({ message: 'Invalid shift type' })
  }

  try {
    console.log('Creating kitchen task:', { name, shiftType, store: storeId })

    // Get the highest order value for this type
    const highestOrderItem = await ShiftChecklistItem.findOne({
      type: shiftType,
      store: storeId,
      isActive: true
    }).sort('-order')

    const order = highestOrderItem ? highestOrderItem.order + 1 : 0

    // Create the new item (using the same field names internally)
    const newItem = new ShiftChecklistItem({
      label: name, // Map name to label
      type: shiftType, // Map shiftType to type
      order,
      isActive: true,
      store: storeId
    })

    const savedItem = await newItem.save()
    console.log('Kitchen task created successfully:', savedItem)

    // Return with FOH-compatible field names
    res.status(201).json({
      id: savedItem._id,
      name: savedItem.label,
      shiftType: savedItem.type,
      createdAt: savedItem.createdAt,
      updatedAt: savedItem.updatedAt
    })
  } catch (error) {
    console.error('Error creating kitchen task:', error)
    res.status(500).json({ message: 'Error creating task', error: error.message })
  }
}

// Update a single checklist item
export const updateChecklistItem = async (req, res) => {
  const { id } = req.params
  const { label, isRequired } = req.body
  const storeId = req.user.store

  if (!label || typeof label !== 'string') {
    return res.status(400).json({ message: 'Label is required and must be a string' })
  }

  try {
    const item = await ShiftChecklistItem.findOne({
      _id: id,
      store: storeId,
      isActive: true
    })

    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' })
    }

    item.label = label
    item.isRequired = isRequired || false

    const updatedItem = await item.save()

    res.json({
      id: updatedItem._id,
      label: updatedItem.label,
      isRequired: updatedItem.isRequired,
      type: updatedItem.type,
      order: updatedItem.order,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt
    })
  } catch (error) {
    console.error('Error updating checklist item:', error)
    res.status(500).json({ message: 'Error updating checklist item', error: error.message })
  }
}

// Delete a single checklist item
export const deleteChecklistItem = async (req, res) => {
  const { id } = req.params
  const storeId = req.user.store

  try {
    const item = await ShiftChecklistItem.findOne({
      _id: id,
      store: storeId,
      isActive: true
    })

    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' })
    }

    // Soft delete by setting isActive to false
    item.isActive = false
    await item.save()

    res.json({ message: 'Checklist item deleted successfully' })
  } catch (error) {
    console.error('Error deleting checklist item:', error)
    res.status(500).json({ message: 'Error deleting checklist item', error: error.message })
  }
}