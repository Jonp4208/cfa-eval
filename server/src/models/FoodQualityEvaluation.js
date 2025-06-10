import mongoose from 'mongoose';

const itemEvaluationSchema = new mongoose.Schema({
  criteriaId: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'warning', 'not_applicable'],
    required: true
  },
  notes: String,
  photo: String
}, { _id: false });

const foodQualityEvaluationSchema = new mongoose.Schema({
  productType: {
    type: String,
    required: true,
    trim: true
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  items: [itemEvaluationSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  overallStatus: {
    type: String,
    enum: ['pass', 'fail', 'warning', 'not_applicable'],
    required: true
  },
  notes: String,
  photos: [String],
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
foodQualityEvaluationSchema.index({ store: 1, evaluatedAt: -1 });
foodQualityEvaluationSchema.index({ store: 1, productType: 1, evaluatedAt: -1 });

const FoodQualityEvaluation = mongoose.models.FoodQualityEvaluation || mongoose.model('FoodQualityEvaluation', foodQualityEvaluationSchema);

export default FoodQualityEvaluation;
