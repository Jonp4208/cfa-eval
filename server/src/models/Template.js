import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  shifts: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    positions: [{
      positionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        required: true
      },
      count: {
        type: Number,
        required: true,
        min: 1
      }
    }]
  }],
  isArchived: {
    type: Boolean,
    default: false
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
});

// Indexes
templateSchema.index({ storeId: 1, isArchived: 1 });
templateSchema.index({ storeId: 1, name: 1 });

// Export the model only if it hasn't been registered yet
export default mongoose.models.Template || mongoose.model('Template', templateSchema); 