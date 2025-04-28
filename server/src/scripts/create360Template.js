import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getModel } from '../models/modelRegistry.js';
import { initializeModels } from '../models/initModels.js';

// Load environment variables
dotenv.config({ path: 'server/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize models
initializeModels();

async function createLeadership360Template() {
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

    // Check if 360 template already exists
    const existingTemplate = await Template.findOne({
      name: 'Leadership 360 Evaluation',
      store: store._id
    });

    if (existingTemplate) {
      console.log('Leadership 360 Evaluation template already exists.');
      process.exit(0);
    }

    // Helper function to create criteria with consistent structure
    const createCriterion = (title, description) => ({
      title,
      description,
      gradingScale: defaultScale._id,
      weight: 1,
      required: true
    });

    // Create the 360 leadership evaluation template
    const template = new Template({
      name: 'Leadership 360 Evaluation',
      description: 'Comprehensive 360-degree feedback template for leadership evaluation',
      store: store._id,
      createdBy: adminUser._id,
      tags: ['Leadership'],
      status: 'active',
      position: 'Leader', // Required field in templateSchema
      sections: [
        {
          title: 'Strategic Leadership',
          description: 'Ability to set vision, develop strategy, and drive results',
          order: 0,
          weight: 1,
          criteria: [
            createCriterion(
              'Vision & Direction',
              'Clearly communicates vision and strategic direction'
            ),
            createCriterion(
              'Decision Making',
              'Makes timely, informed decisions that drive the business forward'
            ),
            createCriterion(
              'Business Acumen',
              'Demonstrates understanding of business operations and financial implications'
            ),
            createCriterion(
              'Innovation',
              'Encourages and implements innovative ideas and solutions'
            )
          ]
        },
        {
          title: 'People Leadership',
          description: 'Ability to inspire, develop, and manage team members effectively',
          order: 1,
          weight: 1,
          criteria: [
            createCriterion(
              'Team Development',
              'Develops team members through coaching, feedback, and growth opportunities'
            ),
            createCriterion(
              'Delegation',
              'Effectively delegates tasks and empowers team members'
            ),
            createCriterion(
              'Conflict Resolution',
              'Addresses and resolves conflicts constructively'
            ),
            createCriterion(
              'Recognition',
              'Recognizes and celebrates team achievements and individual contributions'
            )
          ]
        },
        {
          title: 'Communication',
          description: 'Effectiveness in communicating with all stakeholders',
          order: 2,
          weight: 1,
          criteria: [
            createCriterion(
              'Clarity',
              'Communicates ideas and expectations clearly and concisely'
            ),
            createCriterion(
              'Active Listening',
              'Listens attentively and responds thoughtfully to others'
            ),
            createCriterion(
              'Feedback Delivery',
              'Provides constructive feedback in a respectful and helpful manner'
            ),
            createCriterion(
              'Transparency',
              'Shares appropriate information openly and honestly'
            )
          ]
        },
        {
          title: 'Character & Integrity',
          description: 'Demonstration of ethical behavior and leadership values',
          order: 3,
          weight: 1,
          criteria: [
            createCriterion(
              'Trustworthiness',
              'Builds trust through consistent, reliable behavior'
            ),
            createCriterion(
              'Accountability',
              'Takes responsibility for actions and outcomes'
            ),
            createCriterion(
              'Ethical Behavior',
              'Demonstrates high ethical standards in all situations'
            ),
            createCriterion(
              'Consistency',
              'Applies policies and standards consistently and fairly'
            )
          ]
        },
        {
          title: 'Adaptability & Resilience',
          description: 'Ability to navigate change and overcome challenges',
          order: 4,
          weight: 1,
          criteria: [
            createCriterion(
              'Change Management',
              'Effectively leads team through change and transitions'
            ),
            createCriterion(
              'Problem Solving',
              'Approaches problems with creativity and persistence'
            ),
            createCriterion(
              'Stress Management',
              'Maintains composure and effectiveness under pressure'
            ),
            createCriterion(
              'Continuous Learning',
              'Actively seeks feedback and opportunities for growth'
            )
          ]
        },
        {
          title: 'Overall Leadership Effectiveness',
          description: 'General assessment of leadership impact and effectiveness',
          order: 5,
          weight: 1,
          criteria: [
            createCriterion(
              'Team Performance',
              'Effectiveness in driving team performance and results'
            ),
            createCriterion(
              'Culture Building',
              'Contribution to a positive, productive work environment'
            ),
            createCriterion(
              'Leadership Presence',
              'Projects confidence and inspires others'
            ),
            createCriterion(
              'Overall Leadership Rating',
              'Overall assessment of leadership effectiveness'
            )
          ]
        }
      ]
    });

    await template.save();
    console.log('Leadership 360 Evaluation template created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating template:', error);
    process.exit(1);
  }
}

// Run the function
createLeadership360Template();
