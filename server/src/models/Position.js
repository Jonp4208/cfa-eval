import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
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
  color: {
    type: String,
    default: '#000000'
  },
  isActive: {
    type: Boolean,
    default: true
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
positionSchema.index({ storeId: 1, name: 1 }, { unique: true });
positionSchema.index({ storeId: 1, isActive: 1 });

const Position = mongoose.model('Position', positionSchema);

export default Position;
