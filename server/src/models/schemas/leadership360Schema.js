import mongoose from 'mongoose';

const evaluationResponseSchema = new mongoose.Schema({
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    enum: ['manager', 'peer', 'direct_report', 'self'],
    required: true
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  overallComments: String,
  submittedAt: Date,
  isComplete: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const leadership360Schema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending_evaluators',    // Initial state - waiting for evaluators to be added
      'in_progress',           // Evaluators have been added, evaluations in progress
      'completed',             // All evaluations completed
      'reviewed'               // Subject has reviewed the results
    ],
    default: 'pending_evaluators'
  },
  evaluations: [evaluationResponseSchema],
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  reviewedDate: Date,
  summary: {
    strengths: [String],
    improvements: [String],
    overallComments: String
  },
  notificationStatus: {
    evaluatorsInvited: { type: Boolean, default: false },
    evaluationCompleted: { type: Boolean, default: false },
    resultReviewed: { type: Boolean, default: false }
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default leadership360Schema;
