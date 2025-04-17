import mongoose from 'mongoose'

const FOHTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shiftType: {
    type: String,
    required: true,
    enum: ['opening', 'transition', 'closing']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const FOHTaskCompletionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FOHTask',
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for better query performance
FOHTaskSchema.index({ store: 1, shiftType: 1, isActive: 1 })
FOHTaskCompletionSchema.index({ store: 1, date: -1 })
FOHTaskCompletionSchema.index({ task: 1, date: -1 })

export const FOHTask = mongoose.model('FOHTask', FOHTaskSchema)
export const FOHTaskCompletion = mongoose.model('FOHTaskCompletion', FOHTaskCompletionSchema) 