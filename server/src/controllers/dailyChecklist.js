import DailyChecklistCompletion from '../models/DailyChecklistCompletion.js'
import FoodSafetyConfig from '../models/FoodSafetyConfig.js'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

// Get daily checklist items with their completion status for today
export const getDailyChecklistItems = async (req, res) => {
  try {
    // Get the store's food safety config
    const config = await FoodSafetyConfig.findOne({ store: req.user.store })
    if (!config) {
      return res.status(404).json({ message: 'Food safety configuration not found' })
    }

    // Get today's completions
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const completions = await DailyChecklistCompletion.find({
      store: req.user.store,
      completedAt: { $gte: startOfToday, $lte: endOfToday }
    }).populate('completedBy', 'name')

    // Format the response
    const result = {}
    
    // Process each category of items
    Object.entries(config.dailyChecklistItems).forEach(([category, items]) => {
      result[category] = items.map(item => {
        // Find all completions for this item today
        const itemCompletions = completions.filter(c => c.itemId === item.id && c.category === category)
        
        return {
          ...item,
          timeframe: item.timeframe || 'morning', // Default to morning if not specified
          completions: itemCompletions.map(c => ({
            id: c._id,
            completedBy: c.completedBy.name,
            completedAt: c.completedAt,
            value: c.value,
            notes: c.notes,
            status: c.status
          })),
          completedCount: itemCompletions.length,
          isCompleted: item.frequency === 'once' 
            ? itemCompletions.length > 0 
            : itemCompletions.length >= (item.requiredCompletions || 1)
        }
      })
    })

    res.json(result)
  } catch (error) {
    console.error('Error getting daily checklist items:', error)
    res.status(500).json({ message: 'Error getting daily checklist items' })
  }
}

// Complete a daily checklist item
export const completeDailyChecklistItem = async (req, res) => {
  try {
    const { category, itemId } = req.params
    const { value, notes, status } = req.body

    // Validate that the item exists in the config
    const config = await FoodSafetyConfig.findOne({ store: req.user.store })
    if (!config) {
      return res.status(404).json({ message: 'Food safety configuration not found' })
    }

    const categoryItems = config.dailyChecklistItems[category]
    if (!categoryItems) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const item = categoryItems.find(i => i.id === itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Create a new completion record
    const completion = await DailyChecklistCompletion.create({
      store: req.user.store,
      category,
      itemId,
      completedBy: req.user._id,
      value,
      notes,
      status: status || 'pass'
    })

    await completion.populate('completedBy', 'name')

    res.status(201).json({
      id: completion._id,
      completedBy: completion.completedBy.name,
      completedAt: completion.completedAt,
      value: completion.value,
      notes: completion.notes,
      status: completion.status
    })
  } catch (error) {
    console.error('Error completing daily checklist item:', error)
    res.status(500).json({ message: 'Error completing daily checklist item' })
  }
}

// Delete a daily checklist completion
export const deleteDailyChecklistCompletion = async (req, res) => {
  try {
    const { completionId } = req.params

    const completion = await DailyChecklistCompletion.findById(completionId)
    if (!completion) {
      return res.status(404).json({ message: 'Completion not found' })
    }

    // Ensure the completion belongs to the user's store
    if (completion.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this completion' })
    }

    await completion.remove()
    res.json({ message: 'Completion deleted successfully' })
  } catch (error) {
    console.error('Error deleting daily checklist completion:', error)
    res.status(500).json({ message: 'Error deleting daily checklist completion' })
  }
}

// Get daily checklist history for a date range
export const getDailyChecklistHistory = async (req, res) => {
  try {
    const { startDate, endDate, category, itemId } = req.query
    
    console.log('History request params:', { startDate, endDate, category, itemId })
    
    // Parse dates using date-fns
    const start = startOfDay(parseISO(startDate))
    const end = endOfDay(parseISO(endDate))
    
    console.log('Using date range:', { start, end })
    
    // Build query
    const query = {
      store: req.user.store,
      completedAt: {
        $gte: start,
        $lte: end
      }
    }
    
    // Add optional filters
    if (category) query.category = category
    if (itemId) query.itemId = itemId
    
    console.log('Query:', JSON.stringify(query))
    
    // Get completions for the date range
    const completions = await DailyChecklistCompletion.find(query)
      .populate('completedBy', 'name')
      .sort({ completedAt: -1 })
    
    console.log(`Found ${completions.length} completions`)
    
    // Get the store's food safety config for item details
    const config = await FoodSafetyConfig.findOne({ store: req.user.store })
    
    // Format the response
    const formattedCompletions = completions.map(completion => {
      // Find the item details from config
      let itemDetails = null
      if (config && config.dailyChecklistItems[completion.category]) {
        itemDetails = config.dailyChecklistItems[completion.category].find(
          item => item.id === completion.itemId
        )
      }
      
      return {
        id: completion._id,
        category: completion.category,
        itemId: completion.itemId,
        itemName: itemDetails?.name || 'Unknown Item',
        completedBy: completion.completedBy.name,
        completedAt: completion.completedAt,
        value: completion.value,
        notes: completion.notes,
        status: completion.status,
        timeframe: itemDetails?.timeframe || 'unknown'
      }
    })
    
    // Group by date for easier client-side processing
    const groupedByDate = {}
    formattedCompletions.forEach(completion => {
      const dateKey = new Date(completion.completedAt).toISOString().split('T')[0]
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = []
      }
      groupedByDate[dateKey].push(completion)
    })
    
    // Log the dates we have data for
    console.log('Dates with data:', Object.keys(groupedByDate))
    
    res.json({
      dateRange: { startDate, endDate },
      completions: formattedCompletions,
      groupedByDate
    })
  } catch (error) {
    console.error('Error getting daily checklist history:', error)
    res.status(500).json({ message: 'Error getting daily checklist history' })
  }
} 