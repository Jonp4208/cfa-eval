import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  
  // Message content
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Message metadata
  category: {
    type: String,
    enum: ['bug', 'feature_request', 'question', 'billing', 'technical_support', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  
  // Contact information
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String
  },
  
  // Admin response
  adminResponse: {
    type: String,
    maxlength: 2000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  
  // Timestamps
  readAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ storeId: 1, createdAt: -1 });
messageSchema.index({ status: 1, priority: 1 });
messageSchema.index({ category: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });

// Virtual for user details
messageSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for store details
messageSchema.virtual('storeDetails', {
  ref: 'Store',
  localField: 'storeId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
