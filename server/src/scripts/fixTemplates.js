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

async function fixTemplates() {
  try {
    // Get models
    const Template = getModel('Template');

    // Update the two templates we created to be active
    const result1 = await Template.updateOne(
      { name: 'Team Member Performance Evaluation' },
      { $set: { status: 'active' } }
    );

    const result2 = await Template.updateOne(
      { name: 'Leadership Development Evaluation' },
      { $set: { status: 'active' } }
    );

    console.log('✅ Updated Team Member Performance Evaluation:', result1.modifiedCount > 0 ? 'Success' : 'No changes');
    console.log('✅ Updated Leadership Development Evaluation:', result2.modifiedCount > 0 ? 'Success' : 'No changes');

    // Verify the updates
    const templates = await Template.find({
      name: { $in: ['Team Member Performance Evaluation', 'Leadership Development Evaluation'] }
    });

    console.log('\n📋 Verified templates:');
    templates.forEach(template => {
      console.log(`- ${template.name}: status = ${template.status}`);
    });

  } catch (error) {
    console.error('❌ Error fixing templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixTemplates();
