import mongoose from 'mongoose'

const wasteSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['food', 'packaging', 'other'],
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  actionTaken: {
    type: String,
    trim: true
  },
  createdBy: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for efficient querying
wasteSchema.index({ store: 1, date: -1 })
wasteSchema.index({ store: 1, category: 1, date: -1 })

const Waste = mongoose.model('Waste', wasteSchema)

export default Waste 