import mongoose from 'mongoose'
const Schema = mongoose.Schema

const cleaningTaskSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    enum: ['kitchen_equipment', 'food_prep', 'storage', 'floors']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly']
  },
  description: {
    type: String,
    required: true
  },
  requiredSupplies: [{
    type: String,
    trim: true
  }],
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  lastCompleted: {
    type: Date
  },
  nextDue: {
    type: Date
  },
  createdBy: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
}, {
  timestamps: true
})

// Create indexes
cleaningTaskSchema.index({ store: 1, area: 1 })
cleaningTaskSchema.index({ store: 1, frequency: 1 })
cleaningTaskSchema.index({ store: 1, nextDue: 1 })

const CleaningTask = mongoose.model('CleaningTask', cleaningTaskSchema)

export default CleaningTask 