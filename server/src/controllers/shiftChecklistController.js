import { ShiftChecklistItem, ShiftChecklistCompletion } from '../models/ShiftChecklist.js'

// Get checklist items by type
export const getChecklistItems = async (req, res) => {
  const { type } = req.params

  if (!['opening', 'transition', 'closing'].includes(type)) {
    return res.status(400).json({ message: 'Invalid checklist type' })
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
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' })
  }

  // Validate items
  for (const [index, item] of items.entries()) {
    if (!item.label || typeof item.label !== 'string') {
      return res.status(400).json({ message: `Invalid label for item at index ${index}` })
    }
  }

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
  } catch (error) {
    res.status(500).json({ message: 'Error updating checklist items' })
  } finally {
    session.endSession()
  }
}

// Complete a checklist
export const completeChecklist = async (req, res) => {
  const { type } = req.params
  const { items, notes, forcePartialSave } = req.body
  const userId = req.user._id // Use _id instead of id
  const storeId = req.user.store

  console.log('completeChecklist called with:', { type, userId, storeId, forcePartialSave })
  console.log('Items received:', items)
  console.log('User object:', req.user)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' })
  }

  try {
    // Validate items
    const itemIds = items.map(item => item.id)
    console.log('Item IDs to validate:', itemIds)

    const existingItems = await ShiftChecklistItem.find({
      _id: { $in: itemIds },
      type,
      isActive: true
    })

    console.log(`Found ${existingItems.length} existing items out of ${itemIds.length} requested`)

    if (existingItems.length !== itemIds.length) {
      console.error('Item validation failed: not all items exist')
      console.log('Existing items:', existingItems.map(item => item._id))
      console.log('Requested items:', itemIds)
      return res.status(400).json({ message: 'One or more items are invalid' })
    }

    // Check if required items are completed
    const requiredItems = existingItems.filter(item => item.isRequired)
    const completedRequiredItems = items.filter(item =>
      item.isCompleted &&
      requiredItems.some(req => req._id.toString() === item.id)
    )

    // Only enforce all required items to be completed if we're not forcing a partial save
    // This allows individual task updates while still enforcing the rule for final submission
    if (!forcePartialSave && completedRequiredItems.length !== requiredItems.length) {
      console.log('Not all required items are completed and forcePartialSave is not set')
      return res.status(400).json({ message: 'All required items must be completed' })
    }

    console.log('forcePartialSave:', forcePartialSave)

    // Create completion record
    console.log('Creating completion record with items:', items)

    // Check if we have any items that are completed
    const hasCompletedItems = items.some(item => item.isCompleted)

    // Only create a completion record if at least one item is completed
    if (hasCompletedItems) {
      // Make sure all items have the isCompleted property explicitly set
      const processedItems = items.map(item => ({
        item: item.id,
        isCompleted: item.isCompleted === true // Ensure it's a boolean
      }))

      console.log('Processed items for DB:', processedItems)

      try {
        const completion = await ShiftChecklistCompletion.create({
          type,
          items: processedItems,
          completedBy: userId,
          store: storeId,
          notes
        })

        console.log('Completion record created successfully:', completion._id)

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
      } catch (validationError) {
        console.error('Validation error creating completion:', validationError)
        return res.status(400).json({
          message: 'Validation error creating completion',
          details: validationError.message
        })
      }
    } else {
      // If no items are completed, return a success response without creating a record
      res.json({
        type,
        items: items.map(item => ({
          id: item.id,
          isCompleted: item.isCompleted
        })),
        completedBy: {
          id: userId,
          name: req.user.name
        },
        completedAt: new Date(),
        notes
      })
    }
  } catch (error) {
    console.error('Error completing checklist:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ message: 'Error completing checklist', error: error.message })
  }
}

// Get checklist completions
export const getChecklistCompletions = async (req, res) => {
  const { type } = req.params
  const { startDate, endDate } = req.query
  const storeId = req.user.store

  if (!['opening', 'transition', 'closing'].includes(type)) {
    return res.status(400).json({ message: 'Invalid checklist type' })
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklist completions' })
  }
}