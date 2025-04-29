import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Store } from '../models/index.js';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server/.env file
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function addStore() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get store details from user input
    const storeNumber = await question('Enter store number (e.g., 01234): ');
    const storeName = await question('Enter store name: ');
    const storeAddress = await question('Enter store address: ');
    const storePhone = await question('Enter store phone (optional, press Enter to skip): ');
    const storeEmail = await question('Enter store email (optional, press Enter to skip): ');

    // Check if store already exists
    const existingStore = await Store.findOne({ storeNumber });
    if (existingStore) {
      console.error(`A store with number ${storeNumber} already exists.`);
      return;
    }

    // Get admin user email
    const adminEmail = await question('Enter email for store admin: ');

    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('Admin user does not exist. Creating new admin user...');

      const adminName = await question('Enter admin name: ');
      const adminPosition = await question('Enter admin position (e.g., Store Director): ');

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
      storePhone: storePhone || undefined,
      storeEmail: storeEmail || undefined,
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
    console.log('Summary:');
    console.log(`- Store: ${storeName} (#${storeNumber})`);
    console.log(`- Admin: ${adminUser.name} (${adminUser.email})`);

    // Ask if leadership subscription should be activated
    const activateSubscription = await question('Do you want to activate leadership subscription for this store? (y/n): ');

    if (activateSubscription.toLowerCase() === 'y') {
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
  } finally {
    // Close readline interface
    rl.close();

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function if this script is executed directly
if (process.argv[1].endsWith('addStore.js')) {
  addStore();
}

export { addStore };
