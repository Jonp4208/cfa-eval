import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: String,
  section: {
    type: String,
    enum: ['FOH', 'BOH']
  },
  color: String,
  count: {
    type: Number,
    default: 1
  },
  employeeId: String,
  employeeName: String
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const timeBlockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  start: String,
  end: String,
  positions: [positionSchema]
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const dayScheduleSchema = new mongoose.Schema({
  timeBlocks: [timeBlockSchema]
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const weekScheduleSchema = new mongoose.Schema({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const breakSchema = new mongoose.Schema({
  startTime: {
    type: String,
    default: null
  },
  endTime: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['none', 'active', 'completed'],
    default: 'none'
  }
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const employeeScheduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  timeBlock: String,
  area: String,
  day: String,
  breaks: {
    type: [breakSchema],
    default: []
  },
  hadBreak: {
    type: Boolean,
    default: false
  }
}, { _id: false }); // Disable _id generation for subdocuments to reduce size

const weeklySetupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  weekSchedule: {
    type: weekScheduleSchema,
    required: true
  },
  uploadedSchedules: {
    type: [employeeScheduleSchema],
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true // Add index for better query performance
  },
  isShared: {
    type: Boolean,
    default: false,
    index: true // Add index for better filtering
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add options for better performance
  timestamps: true, // Use built-in timestamps
  minimize: false, // Don't remove empty objects
  strict: true, // Enforce schema
  validateBeforeSave: true // Validate before saving
});

export default mongoose.model('WeeklySetup', weeklySetupSchema);
