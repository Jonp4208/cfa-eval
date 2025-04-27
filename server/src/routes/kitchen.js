import express from 'express';
import { auth } from '../middleware/auth.js';
import FoodSafetyChecklist from '../models/FoodSafetyChecklist.js';
import FoodSafetyChecklistCompletion from '../models/FoodSafetyChecklistCompletion.js';
import Waste from '../models/Waste.js';
import Equipment from '../models/Equipment.js';
import { createWasteSchema, updateWasteSchema, getWasteListSchema, getWasteMetricsSchema } from '../schemas/waste.js';
import CleaningTask from '../models/CleaningTask.js';
import CleaningTaskCompletion from '../models/CleaningTaskCompletion.js';
import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';
import * as shiftChecklistController from '../controllers/shiftChecklistController.js';
import FoodSafetyConfig from '../models/FoodSafetyConfig.js';
import * as dailyChecklistController from '../controllers/dailyChecklist.js';
import * as temperatureLogController from '../controllers/temperatureLog.js'

// Helper function to calculate next due date based on cleaning frequency
function calculateNextDueDate(frequency, fromDate = new Date()) {
  const nextDue = new Date(fromDate);

  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'biweekly':
      nextDue.setDate(nextDue.getDate() + 14);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'bimonthly':
      nextDue.setMonth(nextDue.getMonth() + 2);
      break;
    case 'quarterly':
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;
    default:
      nextDue.setDate(nextDue.getDate() + 7); // Default to weekly
  }

  return nextDue;
}

const router = express.Router();

// Get all checklists for a store
router.get('/food-safety/checklists', auth, async (req, res) => {
  try {
    const checklists = await FoodSafetyChecklist.find({
      store: req.user.store._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new checklist
router.post('/food-safety/checklists', auth, async (req, res) => {
  try {
    const checklist = new FoodSafetyChecklist({
      ...req.body,
      store: req.user.store._id,
      createdBy: req.user._id
    });

    const savedChecklist = await checklist.save();
    res.status(201).json(savedChecklist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific checklist
router.get('/food-safety/checklists/:id', auth, async (req, res) => {
  try {
    const checklist = await FoodSafetyChecklist.findOne({
      _id: req.params.id,
      store: req.user.store._id
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a checklist
router.patch('/food-safety/checklists/:id', auth, async (req, res) => {
  try {
    const checklist = await FoodSafetyChecklist.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      req.body,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a checklist (soft delete)
router.delete('/food-safety/checklists/:id', auth, async (req, res) => {
  try {
    const checklist = await FoodSafetyChecklist.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      { isActive: false },
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a checklist
router.post('/food-safety/checklists/:id/complete', auth, async (req, res) => {
  try {
    const checklist = await FoodSafetyChecklist.findOne({
      _id: req.params.id,
      store: req.user.store._id
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    // Calculate score and status based on item completions
    let totalItems = 0;
    let passedItems = 0;
    let hasCriticalFail = false;

    const itemCompletions = req.body.items.map(completion => {
      const checklistItem = checklist.items.id(completion.item);
      if (!checklistItem) {
        throw new Error(`Item ${completion.item} not found in checklist`);
      }

      let status = 'pass';
      totalItems++;

      // Validate based on check type
      if (checklistItem.type === 'temperature') {
        const temp = parseFloat(completion.value);
        const { minTemp, maxTemp, warningThreshold, criticalThreshold } = checklistItem.validation;

        if (temp < minTemp - criticalThreshold || temp > maxTemp + criticalThreshold) {
          status = 'fail';
          if (checklistItem.isCritical) hasCriticalFail = true;
        } else if (temp < minTemp - warningThreshold || temp > maxTemp + warningThreshold) {
          status = 'warning';
        }

        if (status === 'pass') passedItems++;
        else if (status === 'warning') passedItems += 0.5;
      } else if (checklistItem.type === 'yes_no') {
        if (completion.value !== checklistItem.validation.requiredValue) {
          status = 'fail';
          if (checklistItem.isCritical) hasCriticalFail = true;
        } else {
          passedItems++;
        }
      } else if (checklistItem.type === 'text') {
        if (checklistItem.validation.requiredPattern) {
          const regex = new RegExp(checklistItem.validation.requiredPattern);
          if (!regex.test(completion.value)) {
            status = 'fail';
            if (checklistItem.isCritical) hasCriticalFail = true;
          } else {
            passedItems++;
          }
        } else {
          // If no pattern is required, any non-empty text passes
          if (completion.value && completion.value.trim()) {
            passedItems++;
          } else {
            status = 'fail';
            if (checklistItem.isCritical) hasCriticalFail = true;
          }
        }
      }

      return {
        item: checklistItem._id,
        value: completion.value,
        status,
        notes: completion.notes,
        photo: completion.photo
      };
    });

    const score = Math.round((passedItems / totalItems) * 100);
    const overallStatus = hasCriticalFail ? 'fail' :
                         score < checklist.passingScore ? 'fail' :
                         score < checklist.passingScore + 10 ? 'warning' : 'pass';

    const completion = new FoodSafetyChecklistCompletion({
      checklist: checklist._id,
      completedBy: req.user._id,
      store: req.user.store._id,
      items: itemCompletions,
      overallStatus,
      score,
      notes: req.body.notes
    });

    await completion.save();
    res.status(201).json(completion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get checklist completions
router.get('/food-safety/checklists/:id/completions', auth, async (req, res) => {
  try {
    const completions = await FoodSafetyChecklistCompletion.find({
      checklist: req.params.id,
      store: req.user.store._id
    })
    .populate('completedBy', 'name')
    .populate('reviewedBy', 'name')
    .sort({ completedAt: -1 });

    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review a checklist completion
router.post('/food-safety/completions/:id/review', auth, async (req, res) => {
  try {
    const completion = await FoodSafetyChecklistCompletion.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id
      },
      {
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNotes: req.body.notes
      },
      { new: true }
    );

    if (!completion) {
      return res.status(404).json({ message: 'Completion not found' });
    }

    res.json(completion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new waste entry
router.post('/waste', auth, async (req, res) => {
  try {
    const validatedData = createWasteSchema.parse(req.body)

    const waste = new Waste({
      ...validatedData,
      store: req.user.store._id,
      createdBy: {
        _id: req.user._id,
        name: req.user.name
      }
    })

    const savedWaste = await waste.save()
    res.status(201).json(savedWaste)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    res.status(400).json({ message: error.message })
  }
})

// Get waste entries with filtering
router.get('/waste', auth, async (req, res) => {
  try {
    const { startDate, endDate, category, page = 1, limit = 20 } = getWasteListSchema.parse(req.query)

    const query = {
      store: req.user.store._id,
      isActive: true
    }

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }
    if (category) {
      query.category = category
    }

    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      Waste.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Waste.countDocuments(query)
    ])

    res.json({
      entries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    res.status(500).json({ message: error.message })
  }
})

// Get waste metrics
router.get('/waste/metrics', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = getWasteMetricsSchema.parse(req.query)

    const matchStage = {
      store: req.user.store._id,
      isActive: true,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    if (category) {
      matchStage.category = category
    }

    const metrics = await Waste.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            category: '$category',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          dailyCost: { $sum: '$cost' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          totalCost: { $sum: '$dailyCost' },
          dailyBreakdown: {
            $push: {
              date: '$_id.date',
              cost: '$dailyCost',
              count: '$count'
            }
          }
        }
      }
    ])

    const totalCost = metrics.reduce((sum, m) => sum + m.totalCost, 0)

    res.json({
      totalCost,
      categoryBreakdown: metrics,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    res.status(500).json({ message: error.message })
  }
})

// Get a specific waste entry
router.get('/waste/:id', auth, async (req, res) => {
  try {
    const waste = await Waste.findOne({
      _id: req.params.id,
      store: req.user.store._id,
      isActive: true
    })

    if (!waste) {
      return res.status(404).json({ message: 'Waste entry not found' })
    }

    res.json(waste)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a waste entry
router.patch('/waste/:id', auth, async (req, res) => {
  try {
    const validatedData = updateWasteSchema.parse(req.body)

    const waste = await Waste.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id,
        isActive: true
      },
      validatedData,
      { new: true }
    )

    if (!waste) {
      return res.status(404).json({ message: 'Waste entry not found' })
    }

    res.json(waste)
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    res.status(400).json({ message: error.message })
  }
})

// Delete a waste entry (soft delete)
router.delete('/waste/:id', auth, async (req, res) => {
  try {
    const waste = await Waste.findOneAndUpdate(
      {
        _id: req.params.id,
        store: req.user.store._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    )

    if (!waste) {
      return res.status(404).json({ message: 'Waste entry not found' })
    }

    res.json({ message: 'Waste entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Equipment Routes

// Get all equipment statuses for a store
router.get('/equipment/statuses', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      store: req.user.store._id
    }).sort({ updatedAt: -1 })

    // Transform to object with equipment id as key
    const equipmentStatuses = equipment.reduce((acc, item) => {
      acc[item.id] = {
        id: item.id,
        status: item.status,
        lastMaintenance: item.lastMaintenance,
        nextMaintenance: item.nextMaintenance,
        notes: item.notes,
        temperature: item.temperature,
        issues: item.issues,
        category: item.category,
        cleaningSchedules: item.cleaningSchedules || []
      }
      return acc
    }, {})

    res.json(equipmentStatuses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update equipment status
router.patch('/equipment/:id/status', auth, async (req, res) => {
  try {
    const { status, notes, temperature, issues, lastMaintenance, nextMaintenance, name, category, maintenanceInterval } = req.body

    // Find existing equipment or create new
    let equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      // If equipment doesn't exist, we need name, category, and maintenanceInterval
      if (!name || !category || !maintenanceInterval) {
        return res.status(400).json({
          message: 'Missing required fields for new equipment',
          requiredFields: ['name', 'category', 'maintenanceInterval']
        })
      }

      equipment = new Equipment({
        id: req.params.id,
        store: req.user.store._id,
        name,
        category,
        maintenanceInterval,
        status,
        notes,
        temperature,
        issues,
        lastMaintenance,
        nextMaintenance
      })
    } else {
      // Add to maintenance history if status is changing
      if (equipment.status !== status) {
        equipment.maintenanceHistory.push({
          date: new Date(),
          performedBy: req.user._id,
          notes,
          previousStatus: equipment.status,
          newStatus: status
        })
      }

      // Update fields
      equipment.status = status
      equipment.notes = notes
      equipment.temperature = temperature
      equipment.issues = issues
      equipment.lastMaintenance = lastMaintenance
      equipment.nextMaintenance = nextMaintenance
    }

    await equipment.save()
    res.json({
      id: equipment.id,
      status: equipment.status,
      lastMaintenance: equipment.lastMaintenance,
      nextMaintenance: equipment.nextMaintenance,
      notes: equipment.notes,
      temperature: equipment.temperature,
      issues: equipment.issues
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get maintenance history for equipment
router.get('/equipment/:id/history', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    }).populate('maintenanceHistory.performedBy', 'name')

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    res.json(equipment.maintenanceHistory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add maintenance note
router.post('/equipment/:id/history', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    // Add new note to maintenance history
    equipment.maintenanceHistory.push({
      date: new Date(),
      performedBy: req.user._id,
      notes: req.body.notes,
      previousStatus: equipment.status,
      newStatus: equipment.status // Status remains the same for standalone notes
    })

    await equipment.save()
    res.status(201).json({ message: 'Maintenance note added successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update maintenance record
router.patch('/equipment/:id/history/:date', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const record = equipment.maintenanceHistory.find(
      record => record.date.toISOString() === req.params.date
    )

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' })
    }

    // Update the notes
    record.notes = req.body.notes

    await equipment.save()
    res.json({ message: 'Maintenance record updated successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete maintenance record
router.delete('/equipment/:id/history/:date', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const record = equipment.maintenanceHistory.find(
      record => record.date.toISOString() === req.params.date
    )

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' })
    }

    // Remove the record from the maintenance history
    equipment.maintenanceHistory = equipment.maintenanceHistory.filter(
      r => r.date.toISOString() !== req.params.date
    )

    await equipment.save()
    res.json({ message: 'Maintenance record deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get cleaning schedules for equipment
router.get('/equipment/:id/cleaning-schedules', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    res.json(equipment.cleaningSchedules || [])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add cleaning schedule
router.post('/equipment/:id/cleaning-schedules', auth, async (req, res) => {
  try {
    const { name, frequency, description, checklist } = req.body

    if (!name || !frequency) {
      return res.status(400).json({ message: 'Name and frequency are required' })
    }

    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    // Check if a schedule with this name already exists
    if (equipment.cleaningSchedules && equipment.cleaningSchedules.some(s => s.name === name)) {
      return res.status(400).json({ message: 'A cleaning schedule with this name already exists' })
    }

    // Calculate next due date based on frequency
    const nextDue = calculateNextDueDate(frequency)

    // Add the new cleaning schedule
    if (!equipment.cleaningSchedules) {
      equipment.cleaningSchedules = []
    }

    equipment.cleaningSchedules.push({
      name,
      frequency,
      description: description || '',
      checklist: checklist || [],
      nextDue
    })

    await equipment.save()
    res.status(201).json({ message: 'Cleaning schedule added successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update cleaning schedule
router.patch('/equipment/:id/cleaning-schedules/:name', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const scheduleName = decodeURIComponent(req.params.name)
    const scheduleIndex = equipment.cleaningSchedules.findIndex(s => s.name === scheduleName)

    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Cleaning schedule not found' })
    }

    // Update the schedule fields
    const { name, frequency, description, checklist } = req.body
    const schedule = equipment.cleaningSchedules[scheduleIndex]

    if (name) schedule.name = name
    if (frequency) {
      schedule.frequency = frequency
      // Recalculate next due date if frequency changes
      if (schedule.frequency !== frequency) {
        schedule.nextDue = calculateNextDueDate(frequency)
      }
    }
    if (description !== undefined) schedule.description = description
    if (checklist) schedule.checklist = checklist

    await equipment.save()
    res.json({ message: 'Cleaning schedule updated successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete cleaning schedule
router.delete('/equipment/:id/cleaning-schedules/:name', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const scheduleName = decodeURIComponent(req.params.name)

    // Remove the schedule
    equipment.cleaningSchedules = equipment.cleaningSchedules.filter(
      s => s.name !== scheduleName
    )

    await equipment.save()
    res.json({ message: 'Cleaning schedule deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Complete cleaning task
router.post('/equipment/:id/cleaning-schedules/:name/complete', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      store: req.user.store._id,
      id: req.params.id
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const scheduleName = decodeURIComponent(req.params.name)
    const scheduleIndex = equipment.cleaningSchedules.findIndex(s => s.name === scheduleName)

    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Cleaning schedule not found' })
    }

    const now = new Date()
    const schedule = equipment.cleaningSchedules[scheduleIndex]
    const isEarlyCompletion = req.body.isEarlyCompletion === true

    // Add completion record
    if (!schedule.completionHistory) {
      schedule.completionHistory = []
    }

    // Process completed checklist items
    const completedItems = req.body.completedItems || []

    // Create completion record with completed items
    schedule.completionHistory.push({
      date: now,
      performedBy: req.user._id,
      notes: req.body.notes || '',
      completedItems: completedItems,
      isEarlyCompletion: isEarlyCompletion
    })

    // Update last completed and next due dates
    schedule.lastCompleted = now

    // If it's an early completion, calculate next due date from today
    // Otherwise, calculate based on the normal schedule
    schedule.nextDue = calculateNextDueDate(schedule.frequency, now)

    await equipment.save()
    res.status(201).json({
      message: isEarlyCompletion ? 'Cleaning task completed early' : 'Cleaning task completed successfully',
      nextDue: schedule.nextDue
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get store equipment configuration
router.get('/equipment/config', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      store: req.user.store._id
    }).select('id category name maintenanceInterval')

    // Group by category
    const config = equipment.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push({
        id: item.id,
        name: item.name,
        maintenanceInterval: item.maintenanceInterval
      })
      return acc
    }, {})

    res.json(config)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update store equipment configuration
router.post('/equipment/config', auth, async (req, res) => {
  try {
    const { category, items } = req.body

    // Remove existing equipment in this category
    await Equipment.deleteMany({
      store: req.user.store._id,
      category
    })

    // Add new equipment
    const equipment = await Equipment.insertMany(
      items.map(item => ({
        id: item.id,
        name: item.name,
        category,
        maintenanceInterval: item.maintenanceInterval,
        store: req.user.store._id,
        status: 'operational',
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + item.maintenanceInterval * 24 * 60 * 60 * 1000)
      }))
    )

    res.status(201).json(equipment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Cleaning Tasks Routes
router.get('/cleaning/tasks', auth, async (req, res) => {
  try {
    const tasks = await CleaningTask.find({ store: req.user.store })
      .sort({ area: 1, name: 1 })
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching cleaning tasks:', error)
    res.status(500).json({ message: 'Error fetching cleaning tasks' })
  }
})

router.get('/cleaning/tasks/:id', auth, async (req, res) => {
  try {
    const task = await CleaningTask.findOne({
      _id: req.params.id,
      store: req.user.store
    })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    console.error('Error fetching cleaning task:', error)
    res.status(500).json({ message: 'Error fetching cleaning task' })
  }
})

router.post('/cleaning/tasks', auth, async (req, res) => {
  try {
    const task = new CleaningTask({
      ...req.body,
      createdBy: {
        _id: req.user._id,
        name: req.user.name
      },
      store: req.user.store
    })
    await task.save()
    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating cleaning task:', error)
    res.status(500).json({ message: 'Error creating cleaning task' })
  }
})

router.patch('/cleaning/tasks/:id', auth, async (req, res) => {
  try {
    const task = await CleaningTask.findOneAndUpdate(
      { _id: req.params.id, store: req.user.store },
      { $set: req.body },
      { new: true }
    )
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    console.error('Error updating cleaning task:', error)
    res.status(500).json({ message: 'Error updating cleaning task' })
  }
})

router.delete('/cleaning/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params

    // Validate that id is provided and is a valid ObjectId
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID provided' })
    }

    const task = await CleaningTask.findOneAndDelete({
      _id: id,
      store: req.user.store
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Also delete all completions for this task
    await CleaningTaskCompletion.deleteMany({ taskId: id })
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting cleaning task:', error)
    res.status(500).json({ message: 'Error deleting cleaning task' })
  }
})

router.post('/cleaning/tasks/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params

    // Validate that id is provided and is a valid ObjectId
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID provided' })
    }

    // First check if the task exists
    const task = await CleaningTask.findOne({
      _id: id,
      store: req.user.store
    })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Create the completion record
    const completion = new CleaningTaskCompletion({
      taskId: task._id,
      completedBy: {
        _id: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      ...req.body,
      store: req.user.store
    })
    await completion.save()

    // Update the task's lastCompleted and nextDue dates
    const now = new Date()
    const nextDue = new Date()

    switch (task.frequency) {
      case 'hourly':
        nextDue.setHours(nextDue.getHours() + 1)
        break
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1)
        break
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7)
        break
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1)
        break
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3)
        break
    }

    task.lastCompleted = now
    task.nextDue = nextDue
    await task.save()

    res.status(201).json(completion)
  } catch (error) {
    console.error('Error completing cleaning task:', error)
    res.status(500).json({ message: 'Error completing cleaning task' })
  }
})

router.get('/cleaning/tasks/:id/completions', auth, async (req, res) => {
  try {
    const { id } = req.params

    // Validate that id is provided and is a valid ObjectId
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID provided' })
    }

    const completions = await CleaningTaskCompletion.find({
      taskId: id,
      store: req.user.store
    })
      .sort({ completedAt: -1 })
      .limit(50) // Limit to last 50 completions
    res.json(completions)
  } catch (error) {
    console.error('Error fetching cleaning task completions:', error)
    res.status(500).json({ message: 'Error fetching cleaning task completions' })
  }
})

// Shift Checklist Routes

// Initialize checklist with default items
// Note: This route needs to be before the /:type routes to avoid conflicts
router.post(
  '/checklists/shift-initialize',
  auth,
  expressAsyncHandler(shiftChecklistController.initializeChecklist)
)

// Type-specific routes
router.get(
  '/checklists/shift/:type',
  auth,
  expressAsyncHandler(shiftChecklistController.getChecklistItems)
)

router.put(
  '/checklists/shift/:type',
  auth,
  expressAsyncHandler(shiftChecklistController.updateChecklistItems)
)

router.post(
  '/checklists/shift/:type/complete',
  auth,
  expressAsyncHandler(shiftChecklistController.completeChecklist)
)

router.get(
  '/checklists/shift/:type/completions',
  auth,
  expressAsyncHandler(shiftChecklistController.getChecklistCompletions)
)

// Get all checklist completions
router.get('/food-safety/completions', auth, async (req, res) => {
  try {
    const completions = await FoodSafetyChecklistCompletion.find({
      store: req.user.store._id
    })
    .populate('completedBy', 'name')
    .populate('reviewedBy', 'name')
    .populate('checklist', 'name')
    .sort({ completedAt: -1 })

    res.json(completions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update daily checklist items configuration
router.post('/food-safety/config/daily-items', auth, async (req, res) => {
  try {
    const { items } = req.body
    const store = req.user.store._id

    // Find existing config or create new one
    let config = await FoodSafetyConfig.findOne({ store })
    if (!config) {
      config = new FoodSafetyConfig({ store })
    }

    // Update daily items
    config.dailyChecklistItems = items
    await config.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating daily checklist items:', error)
    res.status(500).json({ error: 'Failed to update daily checklist items' })
  }
})

// Get food safety configuration
router.get('/food-safety/config', auth, async (req, res) => {
  try {
    const store = req.user.store._id
    let config = await FoodSafetyConfig.findOne({ store })

    // If no config exists, create one with defaults
    if (!config) {
      config = await FoodSafetyConfig.create({ store })
    }

    res.json({
      dailyChecklistItems: config.dailyChecklistItems,
      temperatureRanges: config.temperatureRanges
    })
  } catch (error) {
    console.error('Error getting food safety config:', error)
    res.status(500).json({ error: 'Failed to get food safety configuration' })
  }
})

// Update food safety configuration
router.post('/food-safety/config', auth, async (req, res) => {
  try {
    const { dailyChecklistItems, temperatureRanges } = req.body
    const store = req.user.store._id

    // Find existing config or create new one
    let config = await FoodSafetyConfig.findOne({ store })
    if (!config) {
      config = new FoodSafetyConfig({ store })
    }

    // Update configuration
    config.dailyChecklistItems = dailyChecklistItems
    config.temperatureRanges = temperatureRanges
    await config.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating food safety config:', error)
    res.status(500).json({ error: 'Failed to update food safety configuration' })
  }
})

// Daily Checklist Routes
router.get(
  '/food-safety/daily-checklist',
  auth,
  expressAsyncHandler(dailyChecklistController.getDailyChecklistItems)
)

router.post(
  '/food-safety/daily-checklist/:category/:itemId',
  auth,
  expressAsyncHandler(dailyChecklistController.completeDailyChecklistItem)
)

router.delete(
  '/food-safety/daily-checklist/completion/:completionId',
  auth,
  expressAsyncHandler(dailyChecklistController.deleteDailyChecklistCompletion)
)

router.get(
  '/food-safety/daily-checklist/history',
  auth,
  expressAsyncHandler(dailyChecklistController.getDailyChecklistHistory)
)

// Temperature Log Routes
router.get('/food-safety/temperature-logs', auth, temperatureLogController.getTemperatureLogs)
router.post('/food-safety/temperature-logs', auth, temperatureLogController.recordTemperature)
router.post('/food-safety/temperature-logs/batch', auth, temperatureLogController.recordMultipleTemperatures)
router.get('/food-safety/temperature-logs/latest', auth, temperatureLogController.getLatestTemperatures)

export default router;