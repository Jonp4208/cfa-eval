import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['multiple_choice', 'rating_scale', 'text_response', 'yes_no', 'likert_scale'],
    required: true
  },
  options: [{
    value: mongoose.Schema.Types.Mixed,
    label: String
  }],
  area: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    default: 1
  },
  required: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const assessmentTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['self_assessment', '360_feedback', 'skill_assessment', 'character_assessment', 'team_assessment'],
    required: true
  },
  category: {
    type: String,
    enum: ['leadership', 'character', 'skills', 'team', 'communication', 'strategy', 'customer_service'],
    required: true
  },
  questions: [questionSchema],
  scoringMethod: {
    type: String,
    enum: ['average', 'weighted_average', 'total_points', 'percentage'],
    default: 'average'
  },
  areas: [{
    name: String,
    description: String,
    weight: {
      type: Number,
      default: 1
    }
  }],
  timeEstimate: {
    type: Number, // in minutes
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }
}, {
  timestamps: true
});

const responseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  score: Number,
  comments: String
}, { _id: false });

const assessmentResponseSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentTemplate',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // For 360 assessments, this is who is being assessed
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'reviewed'],
    default: 'not_started'
  },
  responses: [responseSchema],
  scores: {
    type: Map,
    of: Number // area name -> score
  },
  overallScore: Number,
  startedAt: Date,
  completedAt: Date,
  reviewedAt: Date,
  feedback: String,
  developmentAreas: [String],
  strengths: [String],
  recommendations: [String]
}, {
  timestamps: true
});

// Create models
const AssessmentTemplate = mongoose.model('AssessmentTemplate', assessmentTemplateSchema);
const AssessmentResponse = mongoose.model('AssessmentResponse', assessmentResponseSchema);

export { AssessmentTemplate, AssessmentResponse };
