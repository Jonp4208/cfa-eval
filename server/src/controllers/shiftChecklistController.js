import { ShiftChecklistItem, ShiftChecklistCompletion } from '../models/ShiftChecklist.js'
import logger from '../utils/logger.js'

// Helper function to create default checklist items
const createDefaultItems = async () => {
  try {
    logger.debug(`[KITCHEN] Creating default checklist items`);

    // Default opening items
    const openingItems = [
      { label: 'Check kitchen equipment is operational', isRequired: true, type: 'opening', order: 0 },
      { label: 'Sanitize all food prep surfaces', isRequired: true, type: 'opening', order: 1 },
      { label: 'Check refrigerator temperatures', isRequired: true, type: 'opening', order: 2 },
      { label: 'Prepare breakfast items', isRequired: false, type: 'opening', order: 3 },
      { label: 'Stock condiments and supplies', isRequired: false, type: 'opening', order: 4 }
    ];

    // Default transition items
    const transitionItems = [
      { label: 'Switch from breakfast to lunch menu', isRequired: true, type: 'transition', order: 0 },
      { label: 'Clean breakfast equipment', isRequired: true, type: 'transition', order: 1 },
      { label: 'Prepare lunch items', isRequired: true, type: 'transition', order: 2 },
      { label: 'Restock supplies', isRequired: false, type: 'transition', order: 3 },
      { label: 'Check food temperatures', isRequired: true, type: 'transition', order: 4 }
    ];

    // Default closing items
    const closingItems = [
      { label: 'Clean all kitchen equipment', isRequired: true, type: 'closing', order: 0 },
      { label: 'Sanitize all food prep surfaces', isRequired: true, type: 'closing', order: 1 },
      { label: 'Store leftover food properly', isRequired: true, type: 'closing', order: 2 },
      { label: 'Take out trash', isRequired: true, type: 'closing', order: 3 },
      { label: 'Check inventory for next day', isRequired: false, type: 'closing', order: 4 }
    ];

    // Add isActive flag to all items
    const allItems = [...openingItems, ...transitionItems, ...closingItems].map(item => ({
      ...item,
      isActive: true
    }));

    // Create all items with ordered: true to fix the MongoDB session issue
    const createdItems = await ShiftChecklistItem.create(allItems, { ordered: true });
    logger.debug(`[KITCHEN] Created ${createdItems.length} default checklist items`);

    return createdItems;
  } catch (error) {
    logger.error(`[KITCHEN] Error creating default items:`, error);
    return null;
  }
};

// Helper function to check if there are any checklist items in the database
const checkForExistingItems = async () => {
  try {
    // Check if there are any items at all
    const totalCount = await ShiftChecklistItem.countDocuments({});
    logger.debug(`[KITCHEN] Total checklist items in database: ${totalCount}`);

    // Check counts by type
    const openingCount = await ShiftChecklistItem.countDocuments({ type: 'opening' });
    const transitionCount = await ShiftChecklistItem.countDocuments({ type: 'transition' });
    const closingCount = await ShiftChecklistItem.countDocuments({ type: 'closing' });

    logger.debug(`[KITCHEN] Checklist items by type: opening=${openingCount}, transition=${transitionCount}, closing=${closingCount}`);

    // Check active items
    const activeCount = await ShiftChecklistItem.countDocuments({ isActive: true });
    logger.debug(`[KITCHEN] Active checklist items: ${activeCount}`);

    // If no items found, create some default items
    if (totalCount === 0) {
      logger.debug(`[KITCHEN] No checklist items found in database. Creating default items.`);
      await createDefaultItems();
    }

    return {
      total: totalCount,
      opening: openingCount,
      transition: transitionCount,
      closing: closingCount,
      active: activeCount
    };
  } catch (error) {
    logger.error(`[KITCHEN] Error checking for existing items:`, error);
    return null;
  }
};

// Get checklist items by type
export const getChecklistItems = async (req, res) => {
  const { type } = req.params

  logger.debug(`[KITCHEN] getChecklistItems called for type: ${type}`)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    logger.warn(`[KITCHEN] Invalid checklist type: ${type}`)
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  try {
    // First, check if there are any items in the database
    await checkForExistingItems();

    const query = {
      type,
      isActive: true
    }

    // Log the query we're using
    logger.debug(`[KITCHEN] Finding checklist items with query: ${JSON.stringify(query)}`)

    const items = await ShiftChecklistItem.find(query).sort('order')

    logger.debug(`[KITCHEN] Found ${items.length} checklist items`)

    // If no items found, log this as it might be the issue
    if (items.length === 0) {
      logger.debug(`[KITCHEN] No checklist items found for type: ${type}`)
    }

    const mappedItems = items.map(item => ({
      id: item._id,
      label: item.label,
      isRequired: item.isRequired,
      type: item.type,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    res.json(mappedItems)
  } catch (error) {
    logger.error(`[KITCHEN] Error in getChecklistItems:`, error)
    res.status(500).json({ message: 'Error fetching checklist items', error: error.message })
  }
}

// Update checklist items
export const updateChecklistItems = async (req, res) => {
  const { type } = req.params
  const { items } = req.body

  logger.info(`[KITCHEN] updateChecklistItems called for type: ${type}`)
  logger.info(`[KITCHEN] Received ${items.length} items to update`)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    logger.warn(`[KITCHEN] Invalid checklist type: ${type}`)
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  if (!Array.isArray(items)) {
    logger.warn(`[KITCHEN] Items is not an array: ${typeof items}`)
    return res.status(400).json({ message: 'Items must be an array' })
  }

  // Validate items
  for (const [index, item] of items.entries()) {
    if (!item.label || typeof item.label !== 'string') {
      logger.warn(`[KITCHEN] Invalid label for item at index ${index}: ${item.label}`)
      return res.status(400).json({ message: `Invalid label for item at index ${index}` })
    }
  }

  // Start a session for the transaction
  const session = await ShiftChecklistItem.startSession()
  logger.info(`[KITCHEN] Started MongoDB session for transaction`)

  try {
    await session.withTransaction(async () => {
      // First, get existing items to preserve their IDs
      const existingItems = await ShiftChecklistItem.find({
        type,
        isActive: true
      }).session(session);

      logger.info(`[KITCHEN] Found ${existingItems.length} existing active items`)

      // Create a map of existing items by label for quick lookup
      const existingItemsByLabel = {};
      existingItems.forEach(item => {
        existingItemsByLabel[item.label] = item;
      });

      // Log the existing items map
      logger.info(`[KITCHEN] Existing items map created with ${Object.keys(existingItemsByLabel).length} entries`)

      // Deactivate all existing items first
      logger.info(`[KITCHEN] Deactivating all existing items of type: ${type}`)
      const deactivateResult = await ShiftChecklistItem.updateMany(
        { type },
        { isActive: false },
        { session }
      )
      logger.info(`[KITCHEN] Deactivated ${deactivateResult.modifiedCount} existing items`)

      // Process items to preserve IDs when possible
      const itemsToCreate = [];
      const itemsToUpdate = [];

      items.forEach((item, index) => {
        // Check if this item already exists (by label)
        const existingItem = existingItemsByLabel[item.label];

        if (existingItem) {
          // If it exists, update it instead of creating a new one
          itemsToUpdate.push({
            updateOne: {
              filter: { _id: existingItem._id },
              update: {
                label: item.label,
                isRequired: item.isRequired || false,
                type,
                order: index,
                isActive: true
              }
            }
          });
        } else {
          // If it's new, create it
          itemsToCreate.push({
            label: item.label,
            isRequired: item.isRequired || false,
            type,
            order: index,
            isActive: true
          });
        }
      });

      logger.info(`[KITCHEN] Items to update: ${itemsToUpdate.length}, Items to create: ${itemsToCreate.length}`)

      // Update existing items
      if (itemsToUpdate.length > 0) {
        const bulkUpdateResult = await ShiftChecklistItem.bulkWrite(itemsToUpdate, { session });
        logger.info(`[KITCHEN] Updated ${bulkUpdateResult.modifiedCount} existing items`)
      }

      // Create new items
      let newItems = [];
      if (itemsToCreate.length > 0) {
        newItems = await ShiftChecklistItem.create(itemsToCreate, {
          session,
          ordered: true
        });
        logger.info(`[KITCHEN] Created ${newItems.length} new items`)
      }

      // Get all updated items to return
      const updatedItems = await ShiftChecklistItem.find({
        type,
        isActive: true
      }).sort('order').session(session);

      logger.info(`[KITCHEN] Returning ${updatedItems.length} total items`)

      const response = updatedItems.map(item => ({
        id: item._id,
        label: item.label,
        isRequired: item.isRequired,
        type: item.type,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      res.json(response)
    })
  } catch (error) {
    logger.error(`[KITCHEN] Error updating checklist items:`, error)
    logger.error(`[KITCHEN] Error stack:`, error.stack)
    res.status(500).json({ message: 'Error updating checklist items', error: error.message })
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

  logger.debug(`[KITCHEN] completeChecklist called for type: ${type}`)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    logger.warn(`[KITCHEN] Invalid checklist type: ${type}`)
    return res.status(400).json({ message: 'Invalid checklist type' })
  }

  if (!Array.isArray(items)) {
    logger.warn(`[KITCHEN] Items is not an array: ${typeof items}`)
    return res.status(400).json({ message: 'Items must be an array' })
  }

  try {
    // Validate items
    const itemIds = items.map(item => item.id)
    logger.debug(`[KITCHEN] Validating ${itemIds.length} item IDs`)

    const existingItems = await ShiftChecklistItem.find({
      _id: { $in: itemIds },
      type,
      isActive: true
    })

    logger.debug(`[KITCHEN] Found ${existingItems.length} existing items out of ${itemIds.length} requested`)

    if (existingItems.length !== itemIds.length) {
      logger.debug(`[KITCHEN] Item validation failed: not all items exist`)

      // Find which items don't exist
      const existingItemIds = existingItems.map(item => item._id.toString())
      const missingItemIds = itemIds.filter(id => !existingItemIds.includes(id))

      return res.status(400).json({
        message: 'One or more items are invalid',
        details: {
          missing: missingItemIds
        }
      })
    }

    // Check if required items are completed
    const requiredItems = existingItems.filter(item => item.isRequired)
    logger.debug(`[KITCHEN] Required items count: ${requiredItems.length}`)

    const completedRequiredItems = items.filter(item =>
      item.isCompleted &&
      requiredItems.some(req => req._id.toString() === item.id)
    )
    logger.debug(`[KITCHEN] Completed required items count: ${completedRequiredItems.length}`)

    // Only enforce all required items to be completed if we're not forcing a partial save
    // This allows individual task updates while still enforcing the rule for final submission
    if (!forcePartialSave && completedRequiredItems.length !== requiredItems.length) {
      logger.debug(`[KITCHEN] Not all required items are completed and forcePartialSave is not set`)

      // Find which required items are not completed
      const completedRequiredItemIds = completedRequiredItems.map(item => item.id)
      const missingRequiredItems = requiredItems
        .filter(item => !completedRequiredItemIds.includes(item._id.toString()))
        .map(item => ({ id: item._id, label: item.label }))

      return res.status(400).json({
        message: 'All required items must be completed',
        details: {
          missingRequired: missingRequiredItems
        }
      })
    }

    // Check if we have any items that are completed
    const hasCompletedItems = items.some(item => item.isCompleted)
    logger.debug(`[KITCHEN] Has completed items: ${hasCompletedItems}`)

    // Only create a completion record if at least one item is completed
    if (hasCompletedItems) {
      // Make sure all items have the isCompleted property explicitly set
      const processedItems = items.map(item => ({
        item: item.id,
        isCompleted: item.isCompleted === true // Ensure it's a boolean
      }))

      logger.debug(`[KITCHEN] Creating completion record with ${processedItems.length} items`)

      try {
        const completion = await ShiftChecklistCompletion.create({
          type,
          items: processedItems,
          completedBy: userId,
          store: storeId,
          notes
        })

        logger.debug(`[KITCHEN] Completion record created successfully: ${completion._id}`)

        await completion.populate([
          { path: 'completedBy', select: 'name' },
          { path: 'items.item', select: 'label isRequired' }
        ])

        const response = {
          id: completion._id,
          type: completion.type,
          items: completion.items.map(item => ({
            id: item.item?._id,
            label: item.item?.label,
            isRequired: item.item?.isRequired,
            isCompleted: item.isCompleted
          })),
          completedBy: {
            id: completion.completedBy?._id,
            name: completion.completedBy?.name
          },
          completedAt: completion.createdAt,
          notes: completion.notes
        }

        res.json(response)
      } catch (validationError) {
        logger.error(`[KITCHEN] Validation error creating completion:`, validationError)
        return res.status(400).json({
          message: 'Validation error creating completion',
          details: validationError.message
        })
      }
    } else {
      // If no items are completed, return a success response without creating a record
      logger.debug(`[KITCHEN] No items completed, returning success without creating record`)
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
    logger.error(`[KITCHEN] Error completing checklist:`, error)
    res.status(500).json({ message: 'Error completing checklist', error: error.message })
  }
}

// Initialize checklist with default items
export const initializeChecklist = async (req, res) => {
  logger.debug(`[KITCHEN] initializeChecklist called`)

  try {
    // First check if there are any items
    const stats = await checkForExistingItems();

    // If there are already items, don't create new ones unless force is true
    if (stats.total > 0 && !req.query.force) {
      logger.debug(`[KITCHEN] Checklist items already exist. Use ?force=true to override.`)
      return res.json({
        message: 'Checklist items already exist',
        stats,
        created: false
      });
    }

    // If we're forcing, deactivate all existing items first
    if (req.query.force) {
      logger.debug(`[KITCHEN] Force flag set, deactivating all existing items`)
      await ShiftChecklistItem.updateMany({}, { isActive: false });
    }

    // Create default items
    const createdItems = await createDefaultItems();

    if (!createdItems) {
      return res.status(500).json({ message: 'Failed to create default items' });
    }

    // Get updated stats
    const updatedStats = await checkForExistingItems();

    res.json({
      message: 'Checklist initialized with default items',
      stats: updatedStats,
      created: true,
      itemCount: createdItems.length
    });
  } catch (error) {
    logger.error(`[KITCHEN] Error in initializeChecklist:`, error)
    res.status(500).json({ message: 'Error initializing checklist', error: error.message })
  }
};

// Get checklist completions
export const getChecklistCompletions = async (req, res) => {
  const { type } = req.params
  const { startDate, endDate } = req.query
  const storeId = req.user.store

  logger.debug(`[KITCHEN] getChecklistCompletions called for type: ${type}`)

  if (!['opening', 'transition', 'closing'].includes(type)) {
    logger.warn(`[KITCHEN] Invalid checklist type: ${type}`)
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

    logger.debug(`[KITCHEN] Finding completions with query: ${JSON.stringify(query)}`)

    const completions = await ShiftChecklistCompletion.find(query)
      .sort('-createdAt')
      .limit(100)
      .populate([
        { path: 'completedBy', select: 'name' },
        { path: 'items.item', select: 'label isRequired' }
      ])

    logger.debug(`[KITCHEN] Found ${completions.length} completions`)

    // If no completions found, log this as it might be the issue
    if (completions.length === 0) {
      logger.debug(`[KITCHEN] No completions found for type: ${type} and date range`)
    }

    const mappedCompletions = completions.map(completion => ({
      id: completion._id,
      type: completion.type,
      items: completion.items.map(item => ({
        id: item.item?._id,
        label: item.item?.label,
        isRequired: item.item?.isRequired,
        isCompleted: item.isCompleted
      })),
      completedBy: {
        id: completion.completedBy?._id,
        name: completion.completedBy?.name
      },
      completedAt: completion.createdAt,
      notes: completion.notes
    }))

    res.json(mappedCompletions)
  } catch (error) {
    logger.error(`[KITCHEN] Error in getChecklistCompletions:`, error)
    res.status(500).json({ message: 'Error fetching checklist completions', error: error.message })
  }
}