import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Store } from '../models/index.js';
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
 * Add a new store without requiring an admin user
 * Usage: node src/scripts/addStoreSimple.js <storeNumber> <storeName> <storeAddress> [storePhone] [storeEmail]
 */
async function addStoreSimple() {
  try {
    // Get arguments from command line
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error('Insufficient arguments. Usage:');
      console.error('node src/scripts/addStoreSimple.js <storeNumber> <storeName> <storeAddress> [storePhone] [storeEmail]');
      process.exit(1);
    }
    
    const storeNumber = args[0];
    const storeName = args[1];
    const storeAddress = args[2];
    const storePhone = args[3] || '';
    const storeEmail = args[4] || '';
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if store already exists
    const existingStore = await Store.findOne({ storeNumber });
    if (existingStore) {
      console.error(`A store with number ${storeNumber} already exists.`);
      process.exit(1);
    }
    
    // Create store
    const store = new Store({
      storeNumber,
      name: storeName,
      storeAddress,
      storePhone: storePhone || undefined,
      storeEmail: storeEmail || undefined,
      admins: [] // No admins initially
    });
    
    await store.save();
    console.log(`Created store: ${storeName} (#${storeNumber})`);
    console.log(`Address: ${storeAddress}`);
    if (storePhone) console.log(`Phone: ${storePhone}`);
    if (storeEmail) console.log(`Email: ${storeEmail}`);
    
    console.log('\nStore creation completed successfully!');
    
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
if (process.argv[1].endsWith('addStoreSimple.js')) {
  addStoreSimple();
}

export { addStoreSimple };
