import mongoose from 'mongoose'

const shiftChecklistItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['opening', 'transition', 'closing'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const shiftChecklistCompletionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['opening', 'transition', 'closing'],
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShiftChecklistItem',
      required: true
    },
    isCompleted: {
      type: Boolean,
      required: true
    }
  }],
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
  notes: String
}, {
  timestamps: true
})

// Create indexes
shiftChecklistItemSchema.index({ type: 1, order: 1 })
shiftChecklistCompletionSchema.index({ type: 1, completedAt: -1 })
shiftChecklistCompletionSchema.index({ store: 1, completedAt: -1 })

const ShiftChecklistItem = mongoose.model('ShiftChecklistItem', shiftChecklistItemSchema)
const ShiftChecklistCompletion = mongoose.model('ShiftChecklistCompletion', shiftChecklistCompletionSchema)

export {
  ShiftChecklistItem,
  ShiftChecklistCompletion
} 