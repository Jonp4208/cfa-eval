import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  position: {
    type: String,
    required: true,
    enum: ['TM', 'TL', 'SM', 'GM'],
    default: 'TM'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
employeeSchema.index({ storeId: 1, email: 1 }, { unique: true })
employeeSchema.index({ storeId: 1, isActive: 1 })
employeeSchema.index({ storeId: 1, position: 1 })

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtuals are included when converting to JSON
employeeSchema.set('toJSON', { virtuals: true })
employeeSchema.set('toObject', { virtuals: true })

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee 