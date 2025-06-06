import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  note: {
    type: String,
    required: true
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Disciplinary', 'Administrative'],
    default: 'Administrative'
  },
  url: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: false // Optional for backward compatibility
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const documentationSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Call Out',
      'Doctor Note',
      'Verbal Warning',
      'Written Warning',
      'Final Warning',
      'Performance Improvement Plan',
      'Suspension',
      'Termination',
      'Other'
    ]
  },
  category: {
    type: String,
    enum: ['Disciplinary', 'PIP', 'Administrative'],
    default: 'Administrative'
  },
  severity: {
    type: String,
    enum: ['Minor', 'Moderate', 'Major', 'Critical'],
    required: function() {
      return this.category === 'Disciplinary' || this.category === 'PIP';
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'Pending Acknowledgment', 'Pending Follow-up', 'Resolved', 'Documented'],
    default: 'Open'
  },
  description: {
    type: String,
    required: true
  },
  witnesses: {
    type: String
  },
  actionTaken: {
    type: String,
    required: function() {
      return this.category === 'Disciplinary' || this.category === 'PIP';
    }
  },
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpActions: {
    type: String
  },
  acknowledgment: {
    acknowledged: {
      type: Boolean,
      default: false
    },
    date: Date,
    comments: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  previousIncidents: {
    type: Boolean,
    default: false
  },
  documentationAttached: {
    type: Boolean,
    default: false
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notifyEmployee: {
    type: Boolean,
    default: true
  },
  // Performance Improvement Plan specific fields
  pipDetails: {
    goals: [{
      description: String,
      targetDate: Date,
      completed: { type: Boolean, default: false },
      completedDate: Date,
      evidence: String
    }],
    timeline: {
      type: Number, // Days (30, 60, 90)
      default: 90
    },
    checkInDates: [{
      date: Date,
      completed: { type: Boolean, default: false },
      notes: String,
      rating: { type: Number, min: 1, max: 5 },
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    resources: [{
      title: String,
      type: { type: String, enum: ['training', 'document', 'video', 'meeting'] },
      url: String,
      completed: { type: Boolean, default: false },
      completedDate: Date
    }],
    successCriteria: String,
    consequences: String,
    finalOutcome: {
      type: String,
      enum: ['successful', 'unsuccessful', 'extended', 'pending'],
      default: 'pending'
    },
    finalNotes: String,
    completedDate: Date
  },
  followUps: [followUpSchema],
  documents: [documentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Documentation', documentationSchema);
