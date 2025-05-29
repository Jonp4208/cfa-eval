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
  type: {
    type: String,
    enum: ['rating', 'text', 'multiple_choice'],
    required: true
  },
  required: {
    type: Boolean,
    default: true
  },
  options: {
    type: [String],
    default: undefined
  },
  ratingScale: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 10
    }
  }
});

const teamSurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  questions: [questionSchema],
  targetAudience: {
    departments: {
      type: [String],
      default: ['Front of House', 'Back of House', 'Management']
    },
    positions: {
      type: [String],
      default: []
    },
    experienceLevels: {
      type: [String],
      enum: ['0-6 months', '6-12 months', '1-2 years', '2+ years'],
      default: ['0-6 months', '6-12 months', '1-2 years', '2+ years']
    },
    employmentTypes: {
      type: [String],
      enum: ['Full-time', 'Part-time'],
      default: ['Full-time', 'Part-time']
    },
    includeAll: {
      type: Boolean,
      default: true
    },
    excludeRecentResponders: {
      type: Boolean,
      default: false
    },
    excludeRecentDays: {
      type: Number,
      default: 30 // Don't invite if responded to any survey in last 30 days
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    frequency: {
      type: String,
      enum: ['one-time', 'quarterly', 'monthly', 'biannual', 'annual'],
      default: 'quarterly'
    },
    autoActivate: {
      type: Boolean,
      default: false
    },
    nextScheduledDate: Date,
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringSettings: {
      dayOfQuarter: {
        type: Number,
        default: 1 // First day of quarter
      },
      duration: {
        type: Number,
        default: 14 // Survey stays open for 14 days
      },
      autoClose: {
        type: Boolean,
        default: true
      }
    }
  },
  anonymousTokens: [{
    token: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date,
    expiresAt: {
      type: Date,
      required: true
    }
  }],
  analytics: {
    totalInvited: {
      type: Number,
      default: 0
    },
    totalResponses: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0
    },
    lastCalculated: Date
  },
  settings: {
    allowMultipleResponses: {
      type: Boolean,
      default: false
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    requireAllQuestions: {
      type: Boolean,
      default: true
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: [Number],
      default: [7, 3, 1] // Days before end date to send reminders
    }
  },
  notifications: {
    invitesSent: {
      type: Boolean,
      default: false
    },
    invitesSentAt: Date,
    remindersSent: {
      type: [Date],
      default: []
    },
    surveyCompleted: {
      type: Boolean,
      default: false
    },
    emailTemplate: {
      subject: {
        type: String,
        default: 'Your Voice Matters - Team Experience Survey'
      },
      inviteMessage: {
        type: String,
        default: 'We value your feedback! Please take a few minutes to complete our anonymous team experience survey.'
      },
      reminderMessage: {
        type: String,
        default: 'Reminder: Please complete the team experience survey. Your feedback helps us improve.'
      }
    },
    emailStats: {
      invitesSent: {
        type: Number,
        default: 0
      },
      remindersSent: {
        type: Number,
        default: 0
      },
      emailsOpened: {
        type: Number,
        default: 0
      },
      linksClicked: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
teamSurveySchema.index({ store: 1, status: 1 });
teamSurveySchema.index({ 'anonymousTokens.token': 1 });
teamSurveySchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

// Virtual for response rate calculation
teamSurveySchema.virtual('currentResponseRate').get(function() {
  if (this.analytics.totalInvited === 0) return 0;
  return Math.round((this.analytics.totalResponses / this.analytics.totalInvited) * 100);
});

// Method to generate anonymous token
teamSurveySchema.methods.generateAnonymousToken = function(userId) {
  const token = new mongoose.Types.ObjectId().toString() + Date.now().toString(36);
  const expiresAt = new Date(this.schedule.endDate);

  this.anonymousTokens.push({
    token,
    userId,
    expiresAt
  });

  return token;
};

// Method to validate anonymous token
teamSurveySchema.methods.validateToken = function(token) {
  const tokenData = this.anonymousTokens.find(t => t.token === token);

  if (!tokenData) return { valid: false, reason: 'Token not found' };
  if (tokenData.used) return { valid: false, reason: 'Token already used' };
  if (new Date() > tokenData.expiresAt) return { valid: false, reason: 'Token expired' };

  return { valid: true, tokenData };
};

// Method to mark token as used
teamSurveySchema.methods.markTokenUsed = function(token) {
  const tokenData = this.anonymousTokens.find(t => t.token === token);
  if (tokenData) {
    tokenData.used = true;
    tokenData.usedAt = new Date();
  }
};

// Method to calculate next scheduled date
teamSurveySchema.methods.calculateNextScheduledDate = function() {
  if (!this.schedule.isRecurring) return null;

  const now = new Date();
  let nextDate = new Date();

  switch (this.schedule.frequency) {
    case 'quarterly':
      // Find next quarter start
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const nextQuarter = (currentQuarter + 1) % 4;
      const nextYear = nextQuarter === 0 ? now.getFullYear() + 1 : now.getFullYear();
      nextDate = new Date(nextYear, nextQuarter * 3, this.schedule.recurringSettings.dayOfQuarter);
      break;

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(this.schedule.recurringSettings.dayOfQuarter || 1);
      break;

    case 'biannual':
      // Every 6 months
      nextDate.setMonth(nextDate.getMonth() + 6);
      nextDate.setDate(this.schedule.recurringSettings.dayOfQuarter || 1);
      break;

    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      nextDate.setDate(this.schedule.recurringSettings.dayOfQuarter || 1);
      break;
  }

  return nextDate;
};

// Method to create next recurring survey
teamSurveySchema.methods.createNextRecurringSurvey = function() {
  if (!this.schedule.isRecurring) return null;

  const nextStartDate = this.calculateNextScheduledDate();
  if (!nextStartDate) return null;

  const nextEndDate = new Date(nextStartDate);
  nextEndDate.setDate(nextEndDate.getDate() + this.schedule.recurringSettings.duration);

  const nextSurvey = new this.constructor({
    title: this.title,
    description: this.description,
    store: this.store,
    createdBy: this.createdBy,
    questions: this.questions,
    targetAudience: this.targetAudience,
    schedule: {
      ...this.schedule,
      startDate: nextStartDate,
      endDate: nextEndDate,
      nextScheduledDate: this.calculateNextScheduledDate.call({
        schedule: {
          ...this.schedule,
          startDate: nextStartDate
        }
      })
    },
    settings: this.settings,
    notifications: {
      ...this.notifications,
      invitesSent: false,
      invitesSentAt: null,
      remindersSent: [],
      surveyCompleted: false,
      emailStats: {
        invitesSent: 0,
        remindersSent: 0,
        emailsOpened: 0,
        linksClicked: 0
      }
    }
  });

  return nextSurvey;
};

// Static method to find surveys ready for automation
teamSurveySchema.statics.findSurveysForAutomation = function() {
  const now = new Date();

  return this.find({
    'schedule.autoActivate': true,
    'schedule.nextScheduledDate': { $lte: now },
    status: 'draft'
  });
};

// Static method to create default survey template
teamSurveySchema.statics.createDefaultTemplate = function(storeId, createdBy) {
  const defaultQuestions = [
    {
      id: 'q1',
      text: 'How satisfied are you with your overall work experience at Chick-fil-A?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q2',
      text: 'How would you rate your work-life balance?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q3',
      text: 'Do you feel that Chick-fil-A values and respects your contributions?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q4',
      text: 'How comfortable are you with the working conditions (e.g., cleanliness, equipment, facilities)?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q5',
      text: 'How would you rate the communication between team members and leadership?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q6',
      text: 'Do you feel you received sufficient training to perform your job effectively?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q7',
      text: 'Are you given enough opportunities for growth and advancement within the company?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q8',
      text: 'How helpful do you find the feedback you receive from your managers/supervisors?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q9',
      text: 'How satisfied are you with your current pay and benefits package?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q10',
      text: 'Do you believe the compensation you receive is fair for the work you do?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q11',
      text: 'How is the communication between leadership and you (the team member) regarding your schedule and hours you are getting?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q12',
      text: 'How would you rate the team dynamic and camaraderie among your coworkers?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q13',
      text: 'Do you feel that the work culture at Chick-fil-A aligns with the company\'s core values (e.g., hospitality, integrity, teamwork)?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q14',
      text: 'Do you feel comfortable communicating openly with your manager about concerns or ideas?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q15',
      text: 'How effective do you think your manager(s) are in leading and supporting the team?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q16',
      text: 'Do you feel recognized and appreciated for the work you do by your manager(s)?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q17',
      text: 'How motivated do you feel to do your best work at Chick-fil-A?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q18',
      text: 'Do you believe your role at Chick-fil-A is meaningful and impactful?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q19',
      text: 'What do you enjoy most about working at Chick-fil-A?',
      type: 'text'
    },
    {
      id: 'q20',
      text: 'What areas of improvement would you suggest for Chick-fil-A to make your work experience better?',
      type: 'text'
    },
    {
      id: 'q21',
      text: 'Would you recommend Chick-fil-A as a great place to work to friends and family?',
      type: 'rating',
      ratingScale: { min: 1, max: 10 }
    },
    {
      id: 'q22',
      text: 'Is there anything else you would like to share regarding your experience working at Chick-fil-A?',
      type: 'text'
    }
  ];

  return new this({
    title: 'Quarterly Team Experience Survey',
    description: 'Anonymous survey to gather feedback on team member experience and satisfaction',
    store: storeId,
    createdBy: createdBy,
    questions: defaultQuestions,
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
    }
  });
};

export default mongoose.model('TeamSurvey', teamSurveySchema);
