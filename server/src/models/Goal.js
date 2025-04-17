import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

const kpiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  peak: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'All Day']
  },
  measurementMethod: {
    type: String,
    trim: true
  },
  measurements: [measurementSchema]
});

const goalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  businessArea: {
    type: String,
    required: true,
    enum: ['Front Counter', 'Drive Thru', 'Kitchen'],
    default: 'Drive Thru'
  },
  goalPeriod: {
    type: String,
    required: true,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    default: 'Monthly'
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['not-started', 'in-progress', 'completed', 'overdue'],
    default: 'not-started'
  },
  kpis: [kpiSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Update status based on progress
goalSchema.pre('save', function(next) {
  if (this.progress === 100) {
    this.status = 'completed';
  } else if (this.progress > 0) {
    this.status = 'in-progress';
  }
  next();
});

export default mongoose.model('Goal', goalSchema);