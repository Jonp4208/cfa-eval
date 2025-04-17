import mongoose from 'mongoose';

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  shiftSetup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShiftSetup',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time blocks
daySchema.virtual('timeBlocks', {
  ref: 'TimeBlock',
  localField: '_id',
  foreignField: 'day'
});

export default mongoose.model('Day', daySchema);
