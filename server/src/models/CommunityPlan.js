import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const communityPlanSchema = new Schema({
  // Basic plan information
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['FOH', 'BOH', 'Management']
  },
  position: {
    type: String,
    required: true,
    enum: ['Team Member', 'Team Leader', 'Shift Leader', 'Manager', 'Director']
  },
  type: {
    type: String,
    required: true,
    enum: ['New Hire', 'Regular', 'Leadership', 'Specialized']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: true // e.g., "5 days", "2 weeks", "1 month"
  },
  
  // Original training plan reference
  originalPlan: {
    type: Schema.Types.ObjectId,
    ref: 'TrainingPlan',
    required: true
  },
  
  // Plan content (copied from original for community sharing)
  days: [{
    dayNumber: {
      type: Number,
      required: true,
      min: 1
    },
    tasks: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      duration: {
        type: Number,
        required: true,
        min: 1
      },
      pathwayUrl: {
        type: String
      },
      competencyChecklist: [{
        type: String
      }]
    }]
  }],
  
  // Community features
  tags: [{
    type: String,
    trim: true
  }],
  
  // Store and author information
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Community engagement metrics
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  downloads: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Moderation
  reportCount: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Virtual for like count
communityPlanSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for download count
communityPlanSchema.virtual('downloadCount').get(function() {
  return this.downloads ? this.downloads.length : 0;
});

// Virtual for average rating
communityPlanSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal place
});

// Virtual for rating count
communityPlanSchema.virtual('ratingCount').get(function() {
  return this.ratings ? this.ratings.length : 0;
});

// Ensure virtual fields are serialized
communityPlanSchema.set('toJSON', { virtuals: true });
communityPlanSchema.set('toObject', { virtuals: true });

// Index for search and filtering
communityPlanSchema.index({ name: 'text', description: 'text', tags: 'text' });
communityPlanSchema.index({ department: 1, position: 1, difficulty: 1 });
communityPlanSchema.index({ createdAt: -1 });
communityPlanSchema.index({ 'likes.length': -1 }); // For sorting by popularity
communityPlanSchema.index({ 'downloads.length': -1 }); // For sorting by downloads

// Pre-save middleware to update duration based on days
communityPlanSchema.pre('save', function(next) {
  if (this.days && this.days.length > 0) {
    const dayCount = this.days.length;
    if (dayCount === 1) {
      this.duration = '1 day';
    } else if (dayCount <= 7) {
      this.duration = `${dayCount} days`;
    } else if (dayCount <= 14) {
      this.duration = `${Math.ceil(dayCount / 7)} week${Math.ceil(dayCount / 7) > 1 ? 's' : ''}`;
    } else {
      this.duration = `${Math.ceil(dayCount / 30)} month${Math.ceil(dayCount / 30) > 1 ? 's' : ''}`;
    }
  }
  next();
});

// Static method to get popular plans
communityPlanSchema.statics.getPopular = function(limit = 10) {
  return this.aggregate([
    { $match: { isActive: true, isPublic: true, moderationStatus: 'approved' } },
    { $addFields: { 
      likeCount: { $size: '$likes' },
      downloadCount: { $size: '$downloads' }
    }},
    { $sort: { likeCount: -1, downloadCount: -1, createdAt: -1 } },
    { $limit: limit },
    { $lookup: {
      from: 'stores',
      localField: 'store',
      foreignField: '_id',
      as: 'storeInfo'
    }},
    { $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'authorInfo'
    }},
    { $unwind: '$storeInfo' },
    { $unwind: '$authorInfo' }
  ]);
};

// Static method to search plans
communityPlanSchema.statics.searchPlans = function(query, filters = {}) {
  const searchCriteria = {
    isActive: true,
    isPublic: true,
    moderationStatus: 'approved'
  };

  if (query) {
    searchCriteria.$text = { $search: query };
  }

  if (filters.department && filters.department !== 'all') {
    searchCriteria.department = filters.department;
  }

  if (filters.difficulty && filters.difficulty !== 'all') {
    searchCriteria.difficulty = filters.difficulty;
  }

  if (filters.position) {
    searchCriteria.position = filters.position;
  }

  return this.find(searchCriteria)
    .populate('store', 'name location')
    .populate('author', 'name position')
    .sort({ createdAt: -1 });
};

export default mongoose.model('CommunityPlan', communityPlanSchema);
