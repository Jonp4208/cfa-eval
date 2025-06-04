import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getModel } from '../models/modelRegistry.js';
import { initializeModels } from '../models/initModels.js';

// Load environment variables
dotenv.config({ path: '.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize models
initializeModels();

async function checkTemplates() {
  try {
    // Get models
    const Template = getModel('Template');
    const Store = getModel('Store');
    const User = getModel('User');

    // Find all templates
    const templates = await Template.find({});
    console.log(`\n📋 Found ${templates.length} templates in database:`);
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}`);
      console.log(`   ID: ${template._id}`);
      console.log(`   Store: ${template.store}`);
      console.log(`   Created By: ${template.createdBy}`);
      console.log(`   Active: ${template.isActive}`);
      console.log(`   Tags: ${template.tags}`);
      console.log(`   Sections: ${template.sections?.length || 0}`);
    });

    // Find all stores
    const stores = await Store.find({});
    console.log(`\n🏪 Found ${stores.length} stores:`);
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name} (ID: ${store._id})`);
    });

    // Find all users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.position} (Store: ${user.store})`);
    });

  } catch (error) {
    console.error('❌ Error checking templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkTemplates();
