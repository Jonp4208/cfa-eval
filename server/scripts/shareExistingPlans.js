import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CommunityPlan from '../src/models/CommunityPlan.js';
import TrainingPlan from '../src/models/TrainingPlan.js';
import Store from '../src/models/Store.js';
import User from '../src/models/User.js';

dotenv.config();

async function shareExistingTrainingPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cfa-eval');
    console.log('Connected to MongoDB');

    // Get all existing training plans
    const trainingPlans = await TrainingPlan.find({})
      .populate('store', 'name location')
      .populate('createdBy', 'name position');

    console.log(`Found ${trainingPlans.length} existing training plans`);

    if (trainingPlans.length === 0) {
      console.log('No training plans found to share');
      return;
    }

    const sharedPlans = [];
    const skippedPlans = [];
    const errors = [];

    for (const trainingPlan of trainingPlans) {
      try {
        // Check if this plan is already shared to community
        const existingCommunityPlan = await CommunityPlan.findOne({
          originalPlan: trainingPlan._id
        });

        if (existingCommunityPlan) {
          skippedPlans.push({
            name: trainingPlan.name,
            reason: 'Already shared to community'
          });
          continue;
        }

        // Auto-determine difficulty based on position and type
        let difficulty = 'Intermediate'; // Default
        if (trainingPlan.type === 'New Hire' || trainingPlan.position === 'Team Member') {
          difficulty = 'Beginner';
        } else if (trainingPlan.position === 'Manager' || trainingPlan.position === 'Director' || trainingPlan.type === 'Leadership') {
          difficulty = 'Advanced';
        }

        // Calculate duration based on number of days
        let duration = '1 day'; // Default
        if (trainingPlan.days && trainingPlan.days.length > 0) {
          const dayCount = trainingPlan.days.length;
          if (dayCount === 1) {
            duration = '1 day';
          } else if (dayCount <= 7) {
            duration = `${dayCount} days`;
          } else if (dayCount <= 14) {
            duration = `${Math.ceil(dayCount / 7)} week${Math.ceil(dayCount / 7) > 1 ? 's' : ''}`;
          } else {
            duration = `${Math.ceil(dayCount / 30)} month${Math.ceil(dayCount / 30) > 1 ? 's' : ''}`;
          }
        }

        // Create community plan
        const communityPlan = new CommunityPlan({
          name: trainingPlan.name,
          description: trainingPlan.description || `Training plan for ${trainingPlan.position} in ${trainingPlan.department}`,
          department: trainingPlan.department,
          position: trainingPlan.position,
          type: trainingPlan.type,
          difficulty,
          duration, // Add the calculated duration
          days: trainingPlan.days,
          tags: [], // Can be enhanced later with relevant tags
          originalPlan: trainingPlan._id,
          store: trainingPlan.store._id || trainingPlan.store,
          author: trainingPlan.createdBy._id || trainingPlan.createdBy,
          isActive: true,
          isPublic: true,
          moderationStatus: 'approved' // Auto-approve existing plans
        });

        await communityPlan.save();

        sharedPlans.push({
          name: trainingPlan.name,
          department: trainingPlan.department,
          position: trainingPlan.position,
          difficulty,
          store: trainingPlan.store?.name || 'Unknown Store'
        });

        console.log(`✅ Shared: "${trainingPlan.name}" (${difficulty})`);

      } catch (error) {
        errors.push({
          planName: trainingPlan.name,
          error: error.message
        });
        console.error(`❌ Error sharing "${trainingPlan.name}":`, error.message);
      }
    }

    // Summary
    console.log('\n=== SHARING SUMMARY ===');
    console.log(`📊 Total training plans found: ${trainingPlans.length}`);
    console.log(`✅ Successfully shared: ${sharedPlans.length}`);
    console.log(`⏭️  Skipped (already shared): ${skippedPlans.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (sharedPlans.length > 0) {
      console.log('\n🎉 NEWLY SHARED PLANS:');
      sharedPlans.forEach(plan => {
        console.log(`  • ${plan.name} (${plan.department} - ${plan.position}) - ${plan.difficulty} - ${plan.store}`);
      });
    }

    if (skippedPlans.length > 0) {
      console.log('\n⏭️  SKIPPED PLANS:');
      skippedPlans.forEach(plan => {
        console.log(`  • ${plan.name} - ${plan.reason}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => {
        console.log(`  • ${error.planName}: ${error.error}`);
      });
    }

    console.log('\n🌟 Community plans sharing completed!');

  } catch (error) {
    console.error('Error sharing existing training plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the sharing function
shareExistingTrainingPlans();
