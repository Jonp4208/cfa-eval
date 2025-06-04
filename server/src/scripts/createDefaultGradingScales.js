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

async function createDefaultGradingScales() {
  try {
    // Get models
    const GradingScale = getModel('GradingScale');
    const Store = getModel('Store');
    const User = getModel('User');

    // Get all stores
    const stores = await Store.find({});
    console.log(`🏪 Found ${stores.length} stores`);

    let scalesCreated = 0;
    let scalesSkipped = 0;

    // Process each store
    for (const store of stores) {
      console.log(`\n📊 Processing store: ${store.name}`);

      // Check if default grading scale already exists
      const existingScale = await GradingScale.findOne({
        store: store._id,
        isDefault: true
      });

      if (existingScale) {
        console.log(`⏭️  Default grading scale already exists for ${store.name}`);
        scalesSkipped++;
        continue;
      }

      // Find an admin user for this store
      const adminUser = await User.findOne({ 
        store: store._id, 
        position: { $in: ['Director', 'Leader'] }
      });

      if (!adminUser) {
        console.log(`⚠️  No admin user found for ${store.name}, skipping...`);
        continue;
      }

      // Create default grading scale
      const defaultScale = new GradingScale({
        name: 'Standard 5-Point Scale',
        description: 'Default evaluation scale from Poor to Excellent',
        store: store._id,
        createdBy: adminUser._id,
        isDefault: true,
        grades: [
          { value: 1, label: 'Poor', description: 'Significant improvement needed', color: '#dc2626' },
          { value: 2, label: 'Fair', description: 'Below expectations', color: '#f97316' },
          { value: 3, label: 'Good', description: 'Meets expectations', color: '#eab308' },
          { value: 4, label: 'Very Good', description: 'Exceeds expectations', color: '#22c55e' },
          { value: 5, label: 'Excellent', description: 'Outstanding performance', color: '#15803d' }
        ]
      });

      await defaultScale.save();
      console.log(`✅ Created default grading scale for ${store.name}`);
      scalesCreated++;
    }

    console.log(`\n🎉 Grading scale creation complete!`);
    console.log(`📊 Summary:`);
    console.log(`   • Grading scales created: ${scalesCreated}`);
    console.log(`   • Grading scales skipped (already exist): ${scalesSkipped}`);
    console.log(`   • Stores processed: ${stores.length}`);

  } catch (error) {
    console.error('❌ Error creating default grading scales:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createDefaultGradingScales();
