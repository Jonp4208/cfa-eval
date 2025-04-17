import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['FC', 'DT', 'KT'],
    default: 'FC'
  },
  status: {
    type: String,
    enum: ['unassigned', 'assigned'],
    default: 'unassigned'
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  timeBlock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeBlock',
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
  timestamps: true
});

export default mongoose.model('Position', positionSchema);
