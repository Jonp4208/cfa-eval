import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const skillSchema = new Schema({
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
  developmentPlan: {
    actions: [String],
    resources: [String],
    timeline: String
  }
});

const activitySchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['training', 'mentoring', 'assignment', 'development'], 
    required: true 
  },
  description: String,
  timeline: String
});

const teamMemberPlanSchema = new Schema({
  planId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  book: {
    title: String,
    author: String,
    description: String,
    chapterFocus: String
  },
  skills: [skillSchema],
  activities: [activitySchema],
  estimatedWeeks: {
    type: Number,
    default: 4
  },
  targetAudience: {
    type: String,
    default: 'Team Member'
  },
  chickFilAFocus: {
    type: String,
    required: true
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

export default mongoose.model('TeamMemberPlan', teamMemberPlanSchema);
