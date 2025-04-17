import mongoose from 'mongoose';

const defaultPositionsSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  day: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true
  },
  shift: {
    type: String, // 'Opening', 'Morning', 'Lunch', 'Afternoon', 'Dinner', 'Closing'
    required: true
  },
  positions: [{
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      enum: ['FC', 'DT', 'KT'],
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
defaultPositionsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DefaultPositions = mongoose.model('DefaultPositions', defaultPositionsSchema);

export default DefaultPositions;
