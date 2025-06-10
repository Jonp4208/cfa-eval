import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const leadershipProfileSchema = new Schema({
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
  primaryArea: {
    type: String,
    required: true,
    enum: [
      'drive-through',
      'kitchen',
      'front-counter',
      'dining-room',
      'marketing',
      'hospitality',
      'catering',
      'training',
      'multi-area',
      'people-leadership',
      'operations'
    ]
  },
  leadershipScope: {
    type: String,
    required: true,
    enum: [
      'team-leader',
      'shift-leader',
      'area-manager',
      'assistant-manager',
      'general-manager',
      'morning-director',
      'evening-director',
      'people-director',
      'operations-director',
      'multi-unit-director'
    ]
  },
  keyResponsibilities: [{
    type: String,
    enum: [
      'operations',
      'training',
      'customer-experience',
      'performance',
      'communication',
      'goal-setting',
      'quality-control',
      'scheduling',
      'people-development',
      'marketing-events',
      'community-engagement',
      'financial-management'
    ]
  }],
  developmentFocus: [{
    type: String,
    enum: [
      'coaching',
      'efficiency',
      'customer-service',
      'team-building',
      'strategic-thinking',
      'communication',
      'conflict-resolution',
      'innovation'
    ]
  }],
  yearlyTheme: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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
  timestamps: true
});

// Ensure one profile per user per store
leadershipProfileSchema.index({ user: 1, store: 1 }, { unique: true });

export default mongoose.model('LeadershipProfile', leadershipProfileSchema);
