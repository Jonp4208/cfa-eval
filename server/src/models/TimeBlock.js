import mongoose from 'mongoose';

const timeBlockSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  day: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Day',
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

// Virtual for positions
timeBlockSchema.virtual('positions', {
  ref: 'Position',
  localField: '_id',
  foreignField: 'timeBlock'
});

export default mongoose.model('TimeBlock', timeBlockSchema);
