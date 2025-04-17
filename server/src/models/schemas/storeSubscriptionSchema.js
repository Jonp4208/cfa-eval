import mongoose from 'mongoose';

const storeSubscriptionSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'trial', 'none'],
    default: 'none'
  },
  features: {
    leadershipPlans: {
      type: Boolean,
      default: false
    },
    // Add other premium features here as needed
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    paymentMethod: String,
    transactionId: String,
    notes: String
  }],
  currentPeriod: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
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

export default storeSubscriptionSchema;
