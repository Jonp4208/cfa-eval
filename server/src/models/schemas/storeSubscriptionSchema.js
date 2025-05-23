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
    // The 7 subscription sections
    fohTasks: {
      type: Boolean,
      default: true
    },
    setups: {
      type: Boolean,
      default: true
    },
    kitchen: {
      type: Boolean,
      default: true
    },
    documentation: {
      type: Boolean,
      default: true
    },
    training: {
      type: Boolean,
      default: true
    },
    evaluations: {
      type: Boolean,
      default: true
    },
    leadership: {
      type: Boolean,
      default: true
    },
    // Legacy feature - keeping for backward compatibility
    leadershipPlans: {
      type: Boolean,
      default: true
    }
  },
  pendingChanges: {
    hasChanges: {
      type: Boolean,
      default: false
    },
    features: {
      fohTasks: Boolean,
      setups: Boolean,
      kitchen: Boolean,
      documentation: Boolean,
      training: Boolean,
      evaluations: Boolean,
      leadership: Boolean,
      leadershipPlans: Boolean
    },
    effectiveDate: {
      type: Date
    },
    submittedAt: {
      type: Date
    }
  },
  pricing: {
    sectionPrice: {
      type: Number,
      default: 50 // $50 per section
    },
    maxPrice: {
      type: Number,
      default: 200 // $200 maximum
    }
  },
  trialInfo: {
    isInTrial: {
      type: Boolean,
      default: false
    },
    trialStartDate: {
      type: Date
    },
    trialEndDate: {
      type: Date
    }
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
