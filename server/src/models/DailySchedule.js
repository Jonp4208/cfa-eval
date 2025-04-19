import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
})

const dailyScheduleSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  assignments: [assignmentSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
dailyScheduleSchema.index({ storeId: 1, date: 1 }, { unique: true })
dailyScheduleSchema.index({ 'assignments.employeeId': 1, date: 1 })

// Pre-save middleware to validate assignment times
dailyScheduleSchema.pre('save', function(next) {
  for (const assignment of this.assignments) {
    const start = new Date(`1970-01-01T${assignment.startTime}`)
    const end = new Date(`1970-01-01T${assignment.endTime}`)
    
    if (end <= start) {
      next(new Error('End time must be after start time'))
      return
    }
  }
  next()
})

const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema)

export default DailySchedule 