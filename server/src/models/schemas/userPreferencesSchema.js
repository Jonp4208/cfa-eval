import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // UI preferences
  uiPreferences: {
    // Mobile navigation preferences
    mobileNavigation: {
      // Array of navigation items to show in the mobile bottom menu
      items: {
        type: [{
          key: String,
          show: Boolean
        }],
        default: [
          { key: 'dashboard', show: true },
          { key: 'foh', show: true },
          { key: 'documentation', show: true },
          { key: 'evaluations', show: true },
          { key: 'users', show: true }
        ]
      },
      // Maximum number of items to show in the mobile navigation
      maxItems: {
        type: Number,
        default: 5
      }
    },
    // Other UI preferences can be added here
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  // Notification preferences
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      evaluationScheduled: {
        type: Boolean,
        default: true
      },
      evaluationCompleted: {
        type: Boolean,
        default: true
      },
      evaluationReminder: {
        type: Boolean,
        default: true
      }
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      evaluationScheduled: {
        type: Boolean,
        default: true
      },
      evaluationCompleted: {
        type: Boolean,
        default: true
      },
      evaluationReminder: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

export default userPreferencesSchema;
