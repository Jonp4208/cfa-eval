import mongoose from 'mongoose'
const Schema = mongoose.Schema

const trainingSessionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Validates time format HH:mm
  },
  trainees: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['Food Safety', 'Customer Service', 'Leadership', 'Other']
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
})

// Index for efficient querying by date range
trainingSessionSchema.index({ date: 1, store: 1 })

export default mongoose.model('TrainingSession', trainingSessionSchema) 