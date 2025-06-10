import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['operational', 'leadership', 'development', 'financial']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  timeline: {
    type: String,
    required: true,
    enum: ['quarterly', 'annual'],
    default: 'annual'
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started'
  },
  startDate: {
    type: Date
  },
  targetDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const leadershipGoalsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  goals: [goalSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user and store
leadershipGoalsSchema.index({ user: 1, store: 1 }, { unique: true });

// Update the updatedAt field before saving
leadershipGoalsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
leadershipGoalsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model('LeadershipGoals', leadershipGoalsSchema);
