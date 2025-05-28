import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'header',
      'text',
      'step-section',
      'priority-matrix',
      'smart-template',
      'checklist',
      'example-box',
      'warning-box',
      'success-box',
      'practice-section',
      'leadership-examples'
    ]
  },
  order: {
    type: Number,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

const playbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Leadership',
      'Operations',
      'Training',
      'Safety',
      'Customer Service',
      'General'
    ],
    default: 'Leadership'
  },
  targetRole: {
    type: String,
    enum: ['Team Member', 'Trainer', 'Leader', 'Director', 'All'],
    default: 'All'
  },
  contentBlocks: [contentBlockSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastViewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
playbookSchema.index({ store: 1, category: 1 });
playbookSchema.index({ store: 1, isPublished: 1 });
playbookSchema.index({ store: 1, targetRole: 1 });

export default mongoose.model('Playbook', playbookSchema);
