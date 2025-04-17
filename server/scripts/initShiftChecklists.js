const mongoose = require('mongoose')
const { ShiftChecklistItem } = require('../models/ShiftChecklist')
require('dotenv').config()

const defaultItems = {
  opening: [
    { label: 'Turn on all equipment', isRequired: true },
    { label: 'Check refrigeration temperatures', isRequired: true },
    { label: 'Sanitize work surfaces', isRequired: true },
    { label: 'Check inventory levels', isRequired: false },
    { label: 'Prep stations setup', isRequired: true },
    { label: 'Review daily specials', isRequired: false },
    { label: 'Staff briefing', isRequired: true },
    { label: 'Check safety equipment', isRequired: true }
  ],
  transition: [
    { label: 'Clean and sanitize work areas', isRequired: true },
    { label: 'Restock supplies', isRequired: false },
    { label: 'Temperature checks on all equipment', isRequired: true },
    { label: 'Update inventory counts', isRequired: false },
    { label: 'Brief incoming staff', isRequired: true },
    { label: 'Review remaining prep work', isRequired: false },
    { label: 'Check waste tracking', isRequired: false }
  ],
  closing: [
    { label: 'Clean and sanitize all surfaces', isRequired: true },
    { label: 'Store leftover ingredients properly', isRequired: true },
    { label: 'Turn off and clean equipment', isRequired: true },
    { label: 'Empty and clean waste bins', isRequired: false },
    { label: 'Final temperature checks', isRequired: true },
    { label: 'Lock up and secure premises', isRequired: true },
    { label: 'Complete daily logs', isRequired: true },
    { label: 'Set up for next day', isRequired: false }
  ]
}

async function initializeChecklists() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Start a session for the transaction
    const session = await mongoose.startSession()
    
    try {
      await session.withTransaction(async () => {
        // Deactivate all existing items
        await ShiftChecklistItem.updateMany(
          {},
          { isActive: false },
          { session }
        )

        // Create new items for each type
        for (const [type, items] of Object.entries(defaultItems)) {
          const newItems = await ShiftChecklistItem.create(
            items.map((item, index) => ({
              label: item.label,
              isRequired: item.isRequired,
              type,
              order: index,
              isActive: true
            })),
            { session }
          )
          console.log(`Created ${newItems.length} ${type} checklist items`)
        }
      })

      console.log('Successfully initialized shift checklists')
    } finally {
      session.endSession()
    }
  } catch (error) {
    console.error('Error initializing shift checklists:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

initializeChecklists() 