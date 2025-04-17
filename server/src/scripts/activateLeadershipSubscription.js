import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreSubscription } from '../models/index.js';
import Store from '../models/Store.js';

// Load environment variables
dotenv.config();

// Function to activate leadership subscription for a store
async function activateLeadershipSubscription(storeNumber) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the store by store number
    const store = await Store.findOne({ storeNumber });
    
    if (!store) {
      console.error(`Store with number ${storeNumber} not found`);
      return;
    }

    console.log(`Found store: ${store.name} (${store.storeNumber})`);

    // Check if subscription already exists
    let subscription = await StoreSubscription.findOne({ store: store._id });
    
    // Set dates for subscription period (1 year)
    const now = new Date();
    const oneYearFromNow = new Date(now);
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (subscription) {
      // Update existing subscription
      subscription.subscriptionStatus = 'active';
      subscription.features = {
        ...subscription.features,
        leadershipPlans: true
      };
      subscription.currentPeriod = {
        startDate: now,
        endDate: oneYearFromNow
      };
      
      // Add payment record
      subscription.paymentHistory.push({
        amount: 499,
        date: now,
        paymentMethod: 'Manual Entry',
        transactionId: `manual-${Date.now()}`,
        notes: 'Annual leadership plans subscription'
      });

      await subscription.save();
      console.log('Updated existing subscription to active status');
    } else {
      // Create new subscription
      subscription = new StoreSubscription({
        store: store._id,
        subscriptionStatus: 'active',
        features: {
          leadershipPlans: true
        },
        currentPeriod: {
          startDate: now,
          endDate: oneYearFromNow
        },
        paymentHistory: [{
          amount: 499,
          date: now,
          paymentMethod: 'Manual Entry',
          transactionId: `manual-${Date.now()}`,
          notes: 'Annual leadership plans subscription'
        }]
      });

      await subscription.save();
      console.log('Created new active subscription');
    }

    console.log(`Successfully activated leadership subscription for ${store.name}`);
    console.log(`Subscription active until: ${oneYearFromNow.toLocaleDateString()}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get store number from command line arguments
const storeNumber = process.argv[2];

if (!storeNumber) {
  console.error('Please provide a store number as a command line argument');
  console.log('Example: node activateLeadershipSubscription.js 01234');
  process.exit(1);
}

// Run the function
activateLeadershipSubscription(storeNumber);
