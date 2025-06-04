import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Store } from '../models/index.js';
import { initializeModels } from '../models/initModels.js';
import { setupNewStoreDefaults } from '../utils/setupNewStore.js';

// Load environment variables
dotenv.config({ path: '.env' });

async function testNewStoreSetup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Initialize models
    initializeModels();

    // Create a test store
    const testStoreNumber = `TEST-${Date.now()}`;
    const testStoreName = `Test Store ${Date.now()}`;
    
    console.log(`\n🏪 Creating test store: ${testStoreName}`);

    // Create store first (needed for user validation)
    const store = new Store({
      storeNumber: testStoreNumber,
      name: testStoreName,
      storeAddress: '123 Test Street, Test City, TS 12345',
      admins: []
    });

    await store.save();
    console.log(`✅ Created store: ${testStoreName} (#${testStoreNumber})`);

    // Create admin user
    const adminUser = new User({
      email: `test-admin-${Date.now()}@example.com`,
      name: 'Test Admin',
      position: 'Director',
      departments: ['Everything'],
      isAdmin: true,
      roles: ['admin', 'director'],
      password: 'TestPassword123!', // This will be hashed by the User model
      store: store._id,
      shift: 'day'
    });

    await adminUser.save();
    console.log(`✅ Created admin user: ${adminUser.name} (${adminUser.email})`);

    // Update store with admin reference
    store.admins = [adminUser._id];
    await store.save();
    console.log(`✅ Updated store with admin reference`);

    // Test the automatic setup
    console.log('\n📋 Testing automatic setup of defaults...');
    const setupResults = await setupNewStoreDefaults(store._id, adminUser._id);
    
    console.log('\n🎉 Setup Results:');
    console.log(`✅ Grading scale created: ${setupResults.gradingScale ? 'Yes' : 'No'}`);
    console.log(`✅ Templates created: ${setupResults.templates.length}`);
    
    if (setupResults.templates.length > 0) {
      setupResults.templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.sections.length} sections)`);
      });
    }
    
    if (setupResults.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      setupResults.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Store: ${testStoreName} (#${testStoreNumber})`);
    console.log(`- Admin: ${adminUser.name} (${adminUser.email})`);
    console.log(`- Grading scale: ${setupResults.gradingScale ? 'Created' : 'Failed'}`);
    console.log(`- Evaluation templates: ${setupResults.templates.length} created`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testNewStoreSetup();
