import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const actionItemSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'reading', 'activity', 'reflection', 'assessment'],
    default: 'activity'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  resourceUrl: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  notes: String
});

const skillProgressSchema = new Schema({
  skillId: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  startLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
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
  actions: [actionItemSchema],
  resources: [actionItemSchema],
  notes: String
});

const activityProgressSchema = new Schema({
  activityId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  startedAt: Date,
  completedAt: Date,
  notes: String,
  evidence: [{
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

const leadershipProgressSchema = new Schema({
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
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'abandoned'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  skillProgress: [skillProgressSchema],
  activityProgress: [activityProgressSchema],
  // Add a dedicated array for learning tasks
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
    notes: String
  }],
  completedAt: Date,
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add method to calculate progress based on completed tasks
leadershipProgressSchema.methods.calculateProgress = function() {
  if (!this.learningTasks || this.learningTasks.length === 0) {
    return 0;
  }

  const completedTasks = this.learningTasks.filter(task => task.completed).length;
  const totalTasks = this.learningTasks.length;

  return Math.round((completedTasks / totalTasks) * 100);
};

// Pre-save hook to update progress
leadershipProgressSchema.pre('save', function(next) {
  // Calculate progress based on completed tasks
  if (this.learningTasks && this.learningTasks.length > 0) {
    this.progress = this.calculateProgress();

    // Update status based on progress
    if (this.progress === 100) {
      this.status = 'completed';
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else if (this.progress > 0) {
      this.status = 'in-progress';
    }
  }

  next();
});

export default mongoose.model('LeadershipProgress', leadershipProgressSchema);
