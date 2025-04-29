import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Store } from '../models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server/.env file
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

/**
 * Add a new store with command line arguments
 * Usage: node src/scripts/addStoreNonInteractive.js <storeNumber> <storeName> <storeAddress> <adminEmail> [adminName] [adminPosition]
 */
async function addStoreNonInteractive() {
  try {
    // Get arguments from command line
    const args = process.argv.slice(2);

    if (args.length < 4) {
      console.error('Insufficient arguments. Usage:');
      console.error('node src/scripts/addStoreNonInteractive.js <storeNumber> <storeName> <storeAddress> <adminEmail> [adminName] [adminPosition]');
      process.exit(1);
    }

    const storeNumber = args[0];
    const storeName = args[1];
    const storeAddress = args[2];
    const adminEmail = args[3];
    const adminName = args[4] || 'Store Admin';
    const adminPosition = args[5] || 'Store Director';

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if store already exists
    const existingStore = await Store.findOne({ storeNumber });
    if (existingStore) {
      console.error(`A store with number ${storeNumber} already exists.`);
      process.exit(1);
    }

    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('Admin user does not exist. Creating new admin user...');

      // Generate a random password
      const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const password = generatePassword();

      // Create admin user
      adminUser = new User({
        email: adminEmail,
        name: adminName,
        position: adminPosition,
        departments: ['Everything'],
        isAdmin: true,
        roles: ['admin', 'director'],
        password: password // This will be hashed by the User model
      });

      await adminUser.save();
      console.log(`Created admin user: ${adminName} (${adminEmail})`);
      console.log(`Temporary password: ${password}`);
      console.log('IMPORTANT: Please have the admin change this password after first login.');
    }

    // Create store
    const store = new Store({
      storeNumber,
      name: storeName,
      storeAddress,
      admins: [adminUser._id]
    });

    await store.save();
    console.log(`Created store: ${storeName} (#${storeNumber})`);

    // Update user's store reference if not already set
    if (!adminUser.store) {
      await User.findByIdAndUpdate(adminUser._id, {
        store: store._id
      });
      console.log(`Updated admin user with store reference`);
    }

    console.log('\nStore creation completed successfully!');

    // Check if we should activate leadership subscription (optional arg)
    const activateSubscription = args[6] === 'activate-subscription';

    if (activateSubscription) {
      // Create subscription
      const { StoreSubscription } = await import('../models/index.js');

      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      const subscription = new StoreSubscription({
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
      console.log(`Activated leadership subscription until ${oneYearFromNow.toLocaleDateString()}`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function if this script is executed directly
if (process.argv[1].endsWith('addStoreNonInteractive.js')) {
  addStoreNonInteractive();
}

export { addStoreNonInteractive };
