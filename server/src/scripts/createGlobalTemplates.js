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

async function createGlobalTemplates() {
  try {
    // Get models
    const Template = getModel('Template');
    const GradingScale = getModel('GradingScale');
    const Store = getModel('Store');
    const User = getModel('User');

    // Get all stores
    const stores = await Store.find({});
    console.log(`🏪 Found ${stores.length} stores`);

    let templatesCreated = 0;
    let templatesSkipped = 0;

    // Process each store
    for (const store of stores) {
      console.log(`\n📋 Processing store: ${store.name}`);

      // Find an admin user for this store (preferably Director)
      const adminUser = await User.findOne({ 
        store: store._id, 
        position: { $in: ['Director', 'Leader'] }
      });

      if (!adminUser) {
        console.log(`⚠️  No admin user found for ${store.name}, skipping...`);
        continue;
      }

      // Find default grading scale for this store
      const defaultScale = await GradingScale.findOne({
        store: store._id,
        isDefault: true
      });

      if (!defaultScale) {
        console.log(`⚠️  No default grading scale found for ${store.name}, skipping...`);
        continue;
      }

      // Helper function to create criteria with consistent structure
      const createCriterion = (title, description) => ({
        title,
        description,
        gradingScale: defaultScale._id,
        weight: 1
      });

      // Check if templates already exist for this store
      const existingTeamTemplate = await Template.findOne({
        name: 'Team Member Performance Evaluation',
        store: store._id
      });

      const existingLeaderTemplate = await Template.findOne({
        name: 'Leadership Development Evaluation',
        store: store._id
      });

      // Create Team Member template if it doesn't exist
      if (!existingTeamTemplate) {
        const teamMemberTemplate = new Template({
          name: 'Team Member Performance Evaluation',
          description: 'Comprehensive performance evaluation for team members focusing on core competencies and job performance',
          store: store._id,
          createdBy: adminUser._id,
          tags: ['General'],
          position: 'Team Member',
          status: 'active',
          sections: [
            {
              title: 'Customer Service Excellence',
              description: 'Ability to provide exceptional customer service and create positive experiences',
              order: 0,
              criteria: [
                createCriterion(
                  'Customer Interaction',
                  'Greets customers warmly, maintains eye contact, and shows genuine care'
                ),
                createCriterion(
                  'Problem Resolution', 
                  'Effectively handles customer concerns and finds appropriate solutions'
                ),
                createCriterion(
                  'Product Knowledge',
                  'Demonstrates thorough knowledge of menu items and can make recommendations'
                )
              ]
            },
            {
              title: 'Work Quality & Efficiency',
              description: 'Consistency and quality of work performance',
              order: 1,
              criteria: [
                createCriterion(
                  'Accuracy',
                  'Completes tasks correctly with minimal errors'
                ),
                createCriterion(
                  'Speed & Efficiency',
                  'Works at appropriate pace to meet service standards'
                ),
                createCriterion(
                  'Attention to Detail',
                  'Pays close attention to details in all aspects of work'
                )
              ]
            },
            {
              title: 'Teamwork & Communication',
              description: 'Ability to work effectively with others and communicate clearly',
              order: 2,
              criteria: [
                createCriterion(
                  'Team Collaboration',
                  'Works well with team members and supports others when needed'
                ),
                createCriterion(
                  'Communication Skills',
                  'Communicates clearly and professionally with team and customers'
                ),
                createCriterion(
                  'Conflict Resolution',
                  'Handles disagreements professionally and seeks positive solutions'
                )
              ]
            },
            {
              title: 'Professional Development',
              description: 'Growth mindset and commitment to continuous improvement',
              order: 3,
              criteria: [
                createCriterion(
                  'Learning Attitude',
                  'Shows willingness to learn new skills and accept feedback'
                ),
                createCriterion(
                  'Initiative',
                  'Takes initiative to improve processes and help the team'
                ),
                createCriterion(
                  'Reliability',
                  'Consistently shows up on time and follows through on commitments'
                )
              ]
            }
          ]
        });

        await teamMemberTemplate.save();
        console.log(`✅ Created Team Member Performance Evaluation for ${store.name}`);
        templatesCreated++;
      } else {
        console.log(`⏭️  Team Member template already exists for ${store.name}`);
        templatesSkipped++;
      }

      // Create Leadership template if it doesn't exist
      if (!existingLeaderTemplate) {
        const leadershipTemplate = new Template({
          name: 'Leadership Development Evaluation',
          description: 'Comprehensive leadership evaluation focusing on core leadership competencies and development areas',
          store: store._id,
          createdBy: adminUser._id,
          tags: ['Leadership'],
          position: 'Leader',
          status: 'active',
          sections: [
            {
              title: 'Vision & Strategic Thinking',
              description: 'Ability to set direction and think strategically about the business',
              order: 0,
              criteria: [
                createCriterion(
                  'Vision Communication',
                  'Clearly communicates vision and strategic direction to the team'
                ),
                createCriterion(
                  'Strategic Planning',
                  'Develops and implements effective strategies to achieve goals'
                ),
                createCriterion(
                  'Innovation',
                  'Encourages creative thinking and implements new ideas'
                )
              ]
            },
            {
              title: 'Team Leadership & Development',
              description: 'Effectiveness in leading, developing, and inspiring team members',
              order: 1,
              criteria: [
                createCriterion(
                  'Team Motivation',
                  'Inspires and motivates team members to achieve their best'
                ),
                createCriterion(
                  'Coaching & Mentoring',
                  'Provides effective coaching and development opportunities'
                ),
                createCriterion(
                  'Performance Management',
                  'Sets clear expectations and provides constructive feedback'
                )
              ]
            },
            {
              title: 'Decision Making & Problem Solving',
              description: 'Quality of decisions and approach to solving complex problems',
              order: 2,
              criteria: [
                createCriterion(
                  'Decision Quality',
                  'Makes well-informed, timely decisions that benefit the business'
                ),
                createCriterion(
                  'Problem Solving',
                  'Effectively identifies and resolves complex operational challenges'
                ),
                createCriterion(
                  'Risk Management',
                  'Appropriately assesses and manages risks in decision making'
                )
              ]
            },
            {
              title: 'Communication & Influence',
              description: 'Effectiveness in communication and ability to influence others',
              order: 3,
              criteria: [
                createCriterion(
                  'Communication Clarity',
                  'Communicates clearly and effectively across all levels'
                ),
                createCriterion(
                  'Active Listening',
                  'Demonstrates strong listening skills and considers input from others'
                ),
                createCriterion(
                  'Influence & Persuasion',
                  'Effectively influences others to achieve positive outcomes'
                )
              ]
            }
          ]
        });

        await leadershipTemplate.save();
        console.log(`✅ Created Leadership Development Evaluation for ${store.name}`);
        templatesCreated++;
      } else {
        console.log(`⏭️  Leadership template already exists for ${store.name}`);
        templatesSkipped++;
      }
    }

    console.log(`\n🎉 Template creation complete!`);
    console.log(`📊 Summary:`);
    console.log(`   • Templates created: ${templatesCreated}`);
    console.log(`   • Templates skipped (already exist): ${templatesSkipped}`);
    console.log(`   • Stores processed: ${stores.length}`);

  } catch (error) {
    console.error('❌ Error creating global templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createGlobalTemplates();
