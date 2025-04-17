import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreSubscription } from '../models/index.js';
import Store from '../models/Store.js';

// Load environment variables
dotenv.config();

// Function to list all stores and their subscription status
async function listStoreSubscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all stores
    const stores = await Store.find({}).sort({ storeNumber: 1 });
    
    if (stores.length === 0) {
      console.log('No stores found in the database');
      return;
    }

    console.log(`Found ${stores.length} stores`);
    console.log('\nStore Subscription Status:');
    console.log('-------------------------');

    // For each store, check subscription status
    for (const store of stores) {
      const subscription = await StoreSubscription.findOne({ store: store._id });
      
      let status = 'No subscription';
      let leadershipAccess = 'No';
      let expiryDate = 'N/A';
      
      if (subscription) {
        status = subscription.subscriptionStatus;
        leadershipAccess = subscription.features.leadershipPlans ? 'Yes' : 'No';
        
        if (subscription.currentPeriod && subscription.currentPeriod.endDate) {
          expiryDate = new Date(subscription.currentPeriod.endDate).toLocaleDateString();
          
          // Check if expired
          if (new Date(subscription.currentPeriod.endDate) < new Date()) {
            expiryDate += ' (EXPIRED)';
          }
        }
      }
      
      console.log(`Store: ${store.name} (#${store.storeNumber})`);
      console.log(`  Status: ${status}`);
      console.log(`  Leadership Plans: ${leadershipAccess}`);
      console.log(`  Expiry: ${expiryDate}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
listStoreSubscriptions();
