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

async function createDefaultTemplates() {
  try {
    // Get models
    const Template = getModel('Template');
    const GradingScale = getModel('GradingScale');
    const User = getModel('User');
    const Store = getModel('Store');

    // Find an admin user (first director)
    const adminUser = await User.findOne({ position: 'Director' });
    if (!adminUser) {
      console.error('No director user found. Please create a director user first.');
      process.exit(1);
    }

    // Get the store
    const store = await Store.findById(adminUser.store);
    if (!store) {
      console.error('Store not found for the admin user.');
      process.exit(1);
    }

    // Find default grading scale
    const defaultScale = await GradingScale.findOne({
      store: store._id,
      isDefault: true
    });

    if (!defaultScale) {
      console.error('No default grading scale found. Please create a default grading scale first.');
      process.exit(1);
    }

    // Helper function to create criteria with consistent structure
    const createCriterion = (title, description) => ({
      title,
      description,
      gradingScale: defaultScale._id,
      weight: 1
    });

    // Template 1: Team Member Performance Evaluation
    await createTeamMemberTemplate(Template, store, adminUser, createCriterion);
    
    // Template 2: Leadership Development Evaluation  
    await createLeadershipTemplate(Template, store, adminUser, createCriterion);

    console.log('✅ Default evaluation templates created successfully!');
    console.log('📋 Available templates:');
    console.log('   • Team Member Performance Evaluation');
    console.log('   • Leadership Development Evaluation');

  } catch (error) {
    console.error('❌ Error creating templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createTeamMemberTemplate(Template, store, adminUser, createCriterion) {
  // Check if template already exists
  const existingTemplate = await Template.findOne({
    name: 'Team Member Performance Evaluation',
    store: store._id
  });

  if (existingTemplate) {
    console.log('⚠️  Team Member Performance Evaluation template already exists');
    return existingTemplate;
  }

  const template = new Template({
    name: 'Team Member Performance Evaluation',
    description: 'Comprehensive performance evaluation for team members focusing on core competencies and job performance',
    store: store._id,
    createdBy: adminUser._id,
    tags: ['General'],
    position: 'Team Member',
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

  await template.save();
  console.log('✅ Created: Team Member Performance Evaluation');
  return template;
}

async function createLeadershipTemplate(Template, store, adminUser, createCriterion) {
  // Check if template already exists
  const existingTemplate = await Template.findOne({
    name: 'Leadership Development Evaluation',
    store: store._id
  });

  if (existingTemplate) {
    console.log('⚠️  Leadership Development Evaluation template already exists');
    return existingTemplate;
  }

  const template = new Template({
    name: 'Leadership Development Evaluation',
    description: 'Comprehensive leadership evaluation focusing on core leadership competencies and development areas',
    store: store._id,
    createdBy: adminUser._id,
    tags: ['Leadership'],
    position: 'Leader',
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

  await template.save();
  console.log('✅ Created: Leadership Development Evaluation');
  return template;
}

// Run the script
createDefaultTemplates();
