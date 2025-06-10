import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    // Will be used as the productType identifier
    validate: {
      validator: function(v) {
        return /^[a-z0-9_]+$/.test(v);
      },
      message: 'Key must contain only lowercase letters, numbers, and underscores'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['sandwich', 'nuggets', 'strips', 'fries', 'grilled', 'sides', 'beverages', 'other'],
    default: 'other'
  },
  icon: {
    type: String,
    default: 'utensils' // Lucide icon name
  },
  isDefault: {
    type: Boolean,
    default: false // true for system default items, false for custom items
  },
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true
});

// Compound index to ensure unique keys per store
foodItemSchema.index({ key: 1, store: 1 }, { unique: true });

// Index for efficient queries
foodItemSchema.index({ store: 1, isActive: 1 });
foodItemSchema.index({ store: 1, category: 1, isActive: 1 });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

export default FoodItem;
