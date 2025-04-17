import mongoose from 'mongoose'

const temperatureLogSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pass', 'warning', 'fail'],
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  type: {
    type: String,
    enum: ['equipment', 'product'],
    default: 'equipment'
  }
}, {
  timestamps: true
})

// Create indexes for efficient querying
temperatureLogSchema.index({ store: 1, timestamp: -1 })
temperatureLogSchema.index({ location: 1, timestamp: -1 })

const TemperatureLog = mongoose.model('TemperatureLog', temperatureLogSchema)

export default TemperatureLog 