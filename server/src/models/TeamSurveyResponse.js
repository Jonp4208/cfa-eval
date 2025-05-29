import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['rating', 'text', 'multiple_choice'],
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  skipped: {
    type: Boolean,
    default: false
  }
});

const teamSurveyResponseSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamSurvey',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  anonymousToken: {
    type: String,
    required: true
  },
  // Demographic data for analytics (no personal identification)
  demographics: {
    department: {
      type: String,
      enum: ['Front of House', 'Back of House', 'Management', 'Other'],
      required: true
    },
    position: {
      type: String,
      required: true
    },
    experienceLevel: {
      type: String,
      enum: ['0-6 months', '6-12 months', '1-2 years', '2+ years'],
      required: true
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time'],
      required: true
    }
  },
  responses: [responseSchema],
  metadata: {
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'mobile'
    },
    userAgent: String,
    ipAddress: String // Hashed for privacy
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for performance and analytics
teamSurveyResponseSchema.index({ survey: 1, status: 1 });
teamSurveyResponseSchema.index({ store: 1, 'demographics.department': 1 });
teamSurveyResponseSchema.index({ store: 1, 'demographics.position': 1 });
teamSurveyResponseSchema.index({ anonymousToken: 1 }, { unique: true });
teamSurveyResponseSchema.index({ createdAt: 1 });

// Virtual for calculating average rating across all rating questions
teamSurveyResponseSchema.virtual('averageRating').get(function() {
  const ratingResponses = this.responses.filter(r => r.questionType === 'rating' && !r.skipped);
  if (ratingResponses.length === 0) return null;

  const sum = ratingResponses.reduce((acc, r) => acc + Number(r.answer), 0);
  return Math.round((sum / ratingResponses.length) * 10) / 10; // Round to 1 decimal
});

// Method to calculate completion percentage
teamSurveyResponseSchema.methods.calculateCompletionPercentage = function() {
  const totalQuestions = this.responses.length;
  const answeredQuestions = this.responses.filter(r => !r.skipped && r.answer !== null && r.answer !== '').length;

  this.completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  return this.completionPercentage;
};

// Method to mark as completed
teamSurveyResponseSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.calculateCompletionPercentage();

  if (this.metadata.startedAt) {
    this.metadata.timeSpent = Math.round((this.completedAt - this.metadata.startedAt) / 1000);
  }
};

// Method to add or update a response
teamSurveyResponseSchema.methods.addResponse = function(questionId, questionText, questionType, answer) {
  const existingResponseIndex = this.responses.findIndex(r => r.questionId === questionId);

  const responseData = {
    questionId,
    questionText,
    questionType,
    answer,
    skipped: answer === null || answer === ''
  };

  if (existingResponseIndex >= 0) {
    this.responses[existingResponseIndex] = responseData;
  } else {
    this.responses.push(responseData);
  }

  this.calculateCompletionPercentage();
};

// Static method to get analytics for a survey
teamSurveyResponseSchema.statics.getAnalytics = async function(surveyId, filters = {}) {
  const pipeline = [
    { $match: { survey: new mongoose.Types.ObjectId(surveyId), status: 'completed' } }
  ];

  // Add filters if provided
  if (filters.department) {
    pipeline[0].$match['demographics.department'] = filters.department;
  }
  if (filters.position) {
    pipeline[0].$match['demographics.position'] = filters.position;
  }
  if (filters.experienceLevel) {
    pipeline[0].$match['demographics.experienceLevel'] = filters.experienceLevel;
  }

  pipeline.push(
    { $unwind: '$responses' },
    {
      $group: {
        _id: {
          questionId: '$responses.questionId',
          questionText: '$responses.questionText',
          questionType: '$responses.questionType'
        },
        totalResponses: { $sum: 1 },
        averageRating: {
          $avg: {
            $cond: [
              { $eq: ['$responses.questionType', 'rating'] },
              { $toDouble: '$responses.answer' },
              null
            ]
          }
        },
        textResponses: {
          $push: {
            $cond: [
              { $eq: ['$responses.questionType', 'text'] },
              '$responses.answer',
              '$$REMOVE'
            ]
          }
        },
        ratingDistribution: {
          $push: {
            $cond: [
              { $eq: ['$responses.questionType', 'rating'] },
              { $toDouble: '$responses.answer' },
              '$$REMOVE'
            ]
          }
        }
      }
    },
    {
      $project: {
        questionId: '$_id.questionId',
        questionText: '$_id.questionText',
        questionType: '$_id.questionType',
        totalResponses: 1,
        averageRating: { $round: ['$averageRating', 1] },
        textResponses: {
          $filter: {
            input: '$textResponses',
            cond: { $ne: ['$$this', ''] }
          }
        },
        ratingDistribution: '$ratingDistribution',
        _id: 0
      }
    },
    { $sort: { questionId: 1 } }
  );

  return await this.aggregate(pipeline);
};

// Static method to get demographic breakdown
teamSurveyResponseSchema.statics.getDemographicBreakdown = async function(surveyId) {
  return await this.aggregate([
    { $match: { survey: new mongoose.Types.ObjectId(surveyId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalResponses: { $sum: 1 },
        departmentBreakdown: {
          $push: '$demographics.department'
        },
        positionBreakdown: {
          $push: '$demographics.position'
        },
        experienceBreakdown: {
          $push: '$demographics.experienceLevel'
        },
        employmentTypeBreakdown: {
          $push: '$demographics.employmentType'
        }
      }
    }
  ]);
};

export default mongoose.model('TeamSurveyResponse', teamSurveyResponseSchema);
