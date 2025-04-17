import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreSubscription } from '../models/index.js';
import Store from '../models/Store.js';

// Load environment variables
dotenv.config();

// Function to check subscription status for a store
async function checkSubscriptionStatus(storeNumber) {
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

    // Check if subscription exists
    const subscription = await StoreSubscription.findOne({ store: store._id });
    
    if (!subscription) {
      console.log('No subscription found for this store');
      return;
    }

    // Display subscription details
    console.log('\nSubscription Details:');
    console.log('---------------------');
    console.log(`Status: ${subscription.subscriptionStatus}`);
    console.log(`Leadership Plans Access: ${subscription.features.leadershipPlans ? 'Enabled' : 'Disabled'}`);
    
    if (subscription.currentPeriod && subscription.currentPeriod.startDate) {
      console.log(`Start Date: ${new Date(subscription.currentPeriod.startDate).toLocaleDateString()}`);
    }
    
    if (subscription.currentPeriod && subscription.currentPeriod.endDate) {
      console.log(`End Date: ${new Date(subscription.currentPeriod.endDate).toLocaleDateString()}`);
      
      // Check if subscription is expired
      const now = new Date();
      const endDate = new Date(subscription.currentPeriod.endDate);
      if (endDate < now) {
        console.log('\nWARNING: Subscription has expired!');
      } else {
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        console.log(`Days Remaining: ${daysRemaining}`);
      }
    }
    
    // Display payment history
    if (subscription.paymentHistory && subscription.paymentHistory.length > 0) {
      console.log('\nPayment History:');
      console.log('----------------');
      subscription.paymentHistory.forEach((payment, index) => {
        console.log(`Payment #${index + 1}:`);
        console.log(`  Amount: $${payment.amount}`);
        console.log(`  Date: ${new Date(payment.date).toLocaleDateString()}`);
        console.log(`  Method: ${payment.paymentMethod || 'N/A'}`);
        console.log(`  Transaction ID: ${payment.transactionId || 'N/A'}`);
        if (payment.notes) console.log(`  Notes: ${payment.notes}`);
        console.log('');
      });
    }

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
  console.log('Example: node checkSubscriptionStatus.js 01234');
  process.exit(1);
}

// Run the function
checkSubscriptionStatus(storeNumber);
