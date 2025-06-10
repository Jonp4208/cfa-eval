import mongoose from 'mongoose';

const validationSchema = new mongoose.Schema({
  // For weight checks
  minWeight: Number,
  maxWeight: Number,
  // For temperature checks
  minTemp: Number,
  maxTemp: Number,
  // For count checks
  minCount: Number,
  maxCount: Number,
  // For measurement checks
  minMeasurement: Number,
  maxMeasurement: Number,
  // For yes/no checks
  requiredValue: {
    type: String,
    enum: ['yes', 'no']
  },
  // For taste rating checks
  minTasteRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
  },
  maxTasteRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 10
  }
}, { _id: false });

const criteriaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['visual', 'weight', 'temperature', 'taste', 'measurement', 'count', 'yes_no'],
    required: true
  },
  description: String,
  required: {
    type: Boolean,
    default: true
  },
  validation: validationSchema,
  order: {
    type: Number,
    required: true
  }
});

const foodQualityStandardSchema = new mongoose.Schema({
  productType: {
    type: String,
    enum: [
      'sandwich_regular',
      'sandwich_spicy', 
      'nuggets_8',
      'nuggets_12',
      'strips_4',
      'grilled_sandwich',
      'grilled_nuggets_8',
      'grilled_nuggets_12',
      'fries_small',
      'fries_medium',
      'fries_large'
    ],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  criteria: [criteriaSchema],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for store and productType
foodQualityStandardSchema.index({ store: 1, productType: 1 });

const FoodQualityStandard = mongoose.models.FoodQualityStandard || mongoose.model('FoodQualityStandard', foodQualityStandardSchema);

export default FoodQualityStandard;
