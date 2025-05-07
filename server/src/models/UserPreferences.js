import mongoose from 'mongoose';
import userPreferencesSchema from './schemas/userPreferencesSchema.js';

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;
