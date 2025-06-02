import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const skillProgressSchema = new Schema({
  area: {
    type: String,
    required: true
  },
  currentLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  targetLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const activityProgressSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['training', 'mentoring', 'assignment', 'development'],
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  startedAt: Date,
  completedAt: Date,
  notes: String
});

const teamMemberProgressSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'paused'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  skillProgress: [skillProgressSchema],
  activityProgress: [activityProgressSchema],
  // Learning tasks with evidence-based completion
  learningTasks: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['video', 'reading', 'activity', 'reflection', 'assessment', 'task'],
      default: 'task'
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    resourceUrl: String,
    estimatedTime: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    notes: String,
    evidence: String,  // JSON string containing completion form data
    chickFilAExample: String  // Specific Chick-fil-A example or scenario
  }],
  // Manager/Director oversight
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  managerNotes: [{
    content: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Recognition and milestones
  milestonesAchieved: [{
    milestone: String,
    achievedAt: {
      type: Date,
      default: Date.now
    },
    recognizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
teamMemberProgressSchema.index({ user: 1, planId: 1 });
teamMemberProgressSchema.index({ store: 1, status: 1 });
teamMemberProgressSchema.index({ manager: 1 });

export default mongoose.model('TeamMemberProgress', teamMemberProgressSchema);
