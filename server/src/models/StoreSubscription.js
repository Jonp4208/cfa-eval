import mongoose from 'mongoose';
import storeSubscriptionSchema from './schemas/storeSubscriptionSchema.js';

const StoreSubscription = mongoose.model('StoreSubscription', storeSubscriptionSchema);

export default StoreSubscription;
