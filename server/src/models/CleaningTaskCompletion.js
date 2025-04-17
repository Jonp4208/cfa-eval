import mongoose from 'mongoose'
const Schema = mongoose.Schema

const cleaningTaskCompletionSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'CleaningTask',
    required: true
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedBy: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: String
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['completed', 'missed', 'late']
  },
  suppliesVerified: {
    type: Boolean,
    required: true
  },
  stepsVerified: {
    type: Boolean,
    required: true
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
cleaningTaskCompletionSchema.index({ taskId: 1, completedAt: -1 })
cleaningTaskCompletionSchema.index({ store: 1, completedAt: -1 })
cleaningTaskCompletionSchema.index({ 'completedBy._id': 1, completedAt: -1 })

const CleaningTaskCompletion = mongoose.model('CleaningTaskCompletion', cleaningTaskCompletionSchema)

export default CleaningTaskCompletion 