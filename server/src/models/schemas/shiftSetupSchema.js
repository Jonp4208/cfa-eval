import mongoose from 'mongoose';

// We're keeping the legacy schemas for backward compatibility during migration
const shiftPositionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['FOH', 'Kitchen', 'FC', 'DT', 'KT'],
    required: true
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.Mixed,  // Allow both ObjectId and String
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['assigned', 'unassigned', 'open'],
    default: 'unassigned'
  }
});

const shiftSchema = new mongoose.Schema({
  type: {
    type: String,
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
  positions: [shiftPositionSchema]
});

const dailyShiftSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  shifts: [shiftSchema]
});

// New schema for time blocks
const timeBlockSchema = new mongoose.Schema({
  id: {
    type: String,
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
  positions: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      enum: ['FC', 'DT', 'KT'],
      required: true
    },
    status: {
      type: String,
      enum: ['assigned', 'unassigned'],
      default: 'unassigned'
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }]
});

// Updated daily schema to include time blocks
const updatedDailySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  shifts: [shiftSchema],  // Keep for backward compatibility
  timeBlocks: [timeBlockSchema]  // New field for time blocks
});

const shiftSetupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  days: [updatedDailySchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedEmployees: {
    type: Array,
    default: []
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 2  // Version 2 indicates the new schema with timeBlocks
  }
}, {
  timestamps: true
});

export default shiftSetupSchema;
