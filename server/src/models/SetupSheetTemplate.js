import mongoose from 'mongoose'

const setupSheetTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  weekSchedule: {
    type: Object,
    required: true
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

// Create compound index for storeId and name to ensure unique names within a store
setupSheetTemplateSchema.index({ storeId: 1, name: 1 }, { unique: true })

export const SetupSheetTemplate = mongoose.model('SetupSheetTemplate', setupSheetTemplateSchema) 