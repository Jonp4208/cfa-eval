import mongoose from 'mongoose';
import shiftSetupSchema from './schemas/shiftSetupSchema.js';

const ShiftSetup = mongoose.model('ShiftSetup', shiftSetupSchema);

export default ShiftSetup;
