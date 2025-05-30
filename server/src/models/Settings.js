import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  userAccess: {
    roleManagement: {
      storeDirectorAccess: { type: Boolean, default: true },
      kitchenDirectorAccess: { type: Boolean, default: true },
      serviceDirectorAccess: { type: Boolean, default: true },
      storeLeaderAccess: { type: Boolean, default: true },
      trainingLeaderAccess: { type: Boolean, default: true },
      shiftLeaderAccess: { type: Boolean, default: true },
      fohLeaderAccess: { type: Boolean, default: true },
      bohLeaderAccess: { type: Boolean, default: true },
      dtLeaderAccess: { type: Boolean, default: true }
    },
    evaluation: {
      departmentRestriction: { type: Boolean, default: true },
      requireStoreLeaderReview: { type: Boolean, default: true },
      requireDirectorApproval: { type: Boolean, default: true },
      trainingAccess: { type: Boolean, default: true },
      certificationApproval: { type: Boolean, default: true },
      metricsAccess: { type: Boolean, default: true },
      workflowType: {
        type: String,
        enum: ['simple', 'standard', 'strict'],
        default: 'standard'
      }
    }
  },
  evaluations: {
    scheduling: {
      autoSchedule: { type: Boolean, default: false },
      frequency: { type: Number, default: 90 }, // Default to quarterly (90 days)
      cycleStart: {
        type: String,
        enum: ['hire_date', 'calendar_year', 'fiscal_year', 'custom'],
        default: 'hire_date'
      },
      customStartDate: { type: Date },
      transitionMode: {
        type: String,
        enum: ['immediate', 'complete_cycle', 'align_next'],
        default: 'complete_cycle'
      }
    }
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  compactMode: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['en', 'es'],
    default: 'en'
  },
  checklists: {
    endOfDayTime: {
      type: String,
      default: '00:00', // Default to midnight (00:00)
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // Validate time format (HH:MM)
        },
        message: props => `${props.value} is not a valid time format (HH:MM)!`
      }
    }
  },
  storeName: String,
  storeNumber: String,
  storeAddress: String,
  storePhone: String,
  storeEmail: String,
  wasteItemPrices: {
    type: Map,
    of: Number,
    default: {}
  },
  customWasteItems: {
    type: [{
      name: { type: String, required: true },
      unit: { type: String, required: true, default: 'pieces' },
      defaultCost: { type: Number, required: true, default: 1.0 },
      icon: { type: String, default: '🍽️' },
      mealPeriod: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
      },
      isCustom: { type: Boolean, default: true }
    }],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;