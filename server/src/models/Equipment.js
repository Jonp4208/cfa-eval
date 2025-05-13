import mongoose from 'mongoose'

const cleaningChecklistItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isRequired: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const cleaningCompletionItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const cleaningScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly']
  },
  description: {
    type: String,
    default: ''
  },
  checklist: [cleaningChecklistItemSchema],
  lastCompleted: {
    type: Date
  },
  nextDue: {
    type: Date
  },
  completionHistory: [{
    date: {
      type: Date,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String,
    completedItems: [cleaningCompletionItemSchema],
    isEarlyCompletion: {
      type: Boolean,
      default: false
    }
  }]
}, { _id: false })

const equipmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
    // Removed unique constraint here, using compound index instead
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cooking', 'refrigeration', 'preparation', 'cleaning']
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  maintenanceInterval: {
    type: Number,
    required: true,
    min: 1
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'repair', 'offline'],
    default: 'operational'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number
  },
  issues: [{
    type: String
  }],
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String,
    previousStatus: String,
    newStatus: String,
    type: {
      type: String,
      enum: ['maintenance', 'note'],
      default: 'maintenance'
    }
  }],
  cleaningSchedules: [cleaningScheduleSchema]
}, {
  timestamps: true
})

// Create compound index for store and equipment id
equipmentSchema.index({ store: 1, id: 1 }, { unique: true })

const Equipment = mongoose.model('Equipment', equipmentSchema)

export default Equipment