import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  estimatedTime: {
    type: Number, // in minutes
    required: false
  },
  scheduledTime: {
    type: String, // HH:mm format
    required: false
  }
});

const taskListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['opening', 'transition', 'closing', 'other'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  monthlyDate: {
    type: Number,
    min: 1,
    max: 31,
    validate: {
      validator: function(value) {
        return !this.isRecurring || this.recurringType !== 'monthly' || (value >= 1 && value <= 31);
      },
      message: 'Monthly date must be between 1 and 31'
    }
  },
  tasks: [taskSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add validation to prevent duplicate task titles
taskListSchema.pre('save', function(next) {
  // Update the updatedAt timestamp
  this.updatedAt = new Date();

  // Check for duplicate task titles
  const taskTitles = this.tasks.map(task => task.title.toLowerCase());
  const uniqueTitles = new Set(taskTitles);
  
  if (taskTitles.length !== uniqueTitles.size) {
    next(new Error('Duplicate task titles are not allowed within the same category'));
    return;
  }

  next();
});

export default mongoose.model('TaskList', taskListSchema); 