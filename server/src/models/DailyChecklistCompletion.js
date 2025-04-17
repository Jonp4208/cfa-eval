import mongoose from 'mongoose'

const dailyChecklistCompletionSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: String,
  status: {
    type: String,
    enum: ['pass', 'fail', 'warning'],
    default: 'pass'
  }
}, {
  timestamps: true
})

// Create a compound index to efficiently query completions for a specific day
dailyChecklistCompletionSchema.index({ 
  store: 1, 
  itemId: 1, 
  completedAt: 1 
})

const DailyChecklistCompletion = mongoose.models.DailyChecklistCompletion || 
  mongoose.model('DailyChecklistCompletion', dailyChecklistCompletionSchema)

export default DailyChecklistCompletion 