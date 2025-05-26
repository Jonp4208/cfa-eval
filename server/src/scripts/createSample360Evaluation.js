import mongoose from 'mongoose';
import { getModel } from '../models/modelRegistry.js';
import { initializeModels } from '../models/initModels.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createSample360Evaluation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Initialize models
    initializeModels();

    // Get models
    const Leadership360 = getModel('Leadership360');
    const Template = getModel('Template');
    const User = getModel('User');
    const Store = getModel('Store');

    // Find your user (Jonathon Pope)
    const user = await User.findOne({ email: 'jonp4208@gmail.com' });
    if (!user) {
      console.error('User not found. Please check the email address.');
      process.exit(1);
    }

    // Get the store
    const store = await Store.findById(user.store);
    if (!store) {
      console.error('Store not found for the user.');
      process.exit(1);
    }

    // Find the Leadership 360 template
    const template = await Template.findOne({
      name: 'Leadership 360 Evaluation',
      store: store._id
    });

    if (!template) {
      console.error('Leadership 360 Evaluation template not found. Please run create360Template.js first.');
      process.exit(1);
    }

    // Check if sample evaluation already exists
    const existingEvaluation = await Leadership360.findOne({
      subject: user._id,
      store: store._id
    });

    if (existingEvaluation) {
      console.log('Sample 360 evaluation already exists. Deleting and recreating...');
      await Leadership360.deleteOne({ _id: existingEvaluation._id });
    }

    // Create sample evaluation with realistic data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10); // Started 10 days ago

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 3); // Due 3 days ago (completed)

    const completedDate = new Date();
    completedDate.setDate(completedDate.getDate() - 2); // Completed 2 days ago

    // Create sample evaluations with realistic feedback
    const sampleEvaluations = [
      {
        evaluator: user._id,
        relationship: 'self',
        isComplete: true,
        submittedAt: completedDate,
        responses: new Map([
          // Strategic Leadership (average: 3.5)
          ['strategic_vision', 4],
          ['strategic_decision', 3],
          ['strategic_business', 4],
          ['strategic_innovation', 3],
          // People Leadership (average: 2.5 - needs development)
          ['people_team', 2],
          ['people_coaching', 3],
          ['people_communication', 2],
          ['people_conflict', 3],
          // Operational Excellence (average: 4.0 - strength)
          ['operational_planning', 4],
          ['operational_execution', 4],
          ['operational_quality', 4],
          ['operational_efficiency', 4],
          // Communication & Influence (average: 2.8 - needs development)
          ['communication_clarity', 3],
          ['communication_listening', 2],
          ['communication_influence', 3],
          ['communication_presentation', 3],
          // Innovation & Change (average: 3.2)
          ['innovation_thinking', 3],
          ['innovation_change', 3],
          ['innovation_adaptability', 4],
          ['innovation_learning', 3],
          // Overall Leadership (average: 3.0)
          ['overall_performance', 3],
          ['overall_culture', 3],
          ['overall_presence', 3],
          ['overall_rating', 3],
          ['textFeedback', {
            strengths: 'Strong operational focus and attention to detail. Consistently delivers results and maintains high standards.',
            improvements: 'Need to work on team communication and coaching skills. Sometimes struggle with difficult conversations.',
            examples: 'Led the successful implementation of new POS system with zero downtime.',
            goals: 'Want to become a better coach and communicator for my team members.'
          }]
        ])
      },
      {
        evaluator: user._id, // Using same user as placeholder for manager
        relationship: 'manager',
        isComplete: true,
        submittedAt: completedDate,
        responses: new Map([
          // Strategic Leadership (average: 3.2)
          ['strategic_vision', 3],
          ['strategic_decision', 3],
          ['strategic_business', 4],
          ['strategic_innovation', 3],
          // People Leadership (average: 2.2 - major development area)
          ['people_team', 2],
          ['people_coaching', 2],
          ['people_communication', 2],
          ['people_conflict', 3],
          // Operational Excellence (average: 4.2 - major strength)
          ['operational_planning', 4],
          ['operational_execution', 5],
          ['operational_quality', 4],
          ['operational_efficiency', 4],
          // Communication & Influence (average: 2.5 - development area)
          ['communication_clarity', 2],
          ['communication_listening', 2],
          ['communication_influence', 3],
          ['communication_presentation', 3],
          // Innovation & Change (average: 3.0)
          ['innovation_thinking', 3],
          ['innovation_change', 3],
          ['innovation_adaptability', 3],
          ['innovation_learning', 3],
          // Overall Leadership (average: 2.8)
          ['overall_performance', 3],
          ['overall_culture', 2],
          ['overall_presence', 3],
          ['overall_rating', 3],
          ['textFeedback', {
            strengths: 'Exceptional operational execution and results delivery. Very reliable and detail-oriented.',
            improvements: 'Needs significant development in people leadership and communication. Team members often feel unheard.',
            examples: 'Achieved 98% customer satisfaction but had 3 team members request transfers due to communication issues.',
            goals: 'Must improve coaching conversations and active listening skills to retain talent.'
          }]
        ])
      },
      {
        evaluator: user._id, // Using same user as placeholder for peer
        relationship: 'peer',
        isComplete: true,
        submittedAt: completedDate,
        responses: new Map([
          // Strategic Leadership (average: 3.0)
          ['strategic_vision', 3],
          ['strategic_decision', 3],
          ['strategic_business', 3],
          ['strategic_innovation', 3],
          // People Leadership (average: 2.8)
          ['people_team', 3],
          ['people_coaching', 2],
          ['people_communication', 3],
          ['people_conflict', 3],
          // Operational Excellence (average: 4.5 - major strength)
          ['operational_planning', 5],
          ['operational_execution', 4],
          ['operational_quality', 5],
          ['operational_efficiency', 4],
          // Communication & Influence (average: 3.0)
          ['communication_clarity', 3],
          ['communication_listening', 3],
          ['communication_influence', 3],
          ['communication_presentation', 3],
          // Innovation & Change (average: 3.2)
          ['innovation_thinking', 3],
          ['innovation_change', 3],
          ['innovation_adaptability', 4],
          ['innovation_learning', 3],
          // Overall Leadership (average: 3.2)
          ['overall_performance', 4],
          ['overall_culture', 3],
          ['overall_presence', 3],
          ['overall_rating', 3],
          ['textFeedback', {
            strengths: 'Amazing at getting things done and maintaining standards. Very organized and efficient.',
            improvements: 'Could be more approachable and spend more time developing team members individually.',
            examples: 'Always has the cleanest, most organized operation but team seems stressed.',
            goals: 'Would benefit from leadership coaching to balance results with people development.'
          }]
        ])
      }
    ];

    // Create the evaluation
    const evaluation = new Leadership360({
      subject: user._id,
      initiator: user._id,
      store: store._id,
      template: template._id,
      status: 'completed',
      startDate,
      dueDate,
      completedDate,
      evaluations: sampleEvaluations
    });

    await evaluation.save();
    console.log('Sample 360 evaluation created successfully!');
    console.log(`Evaluation ID: ${evaluation._id}`);
    console.log(`Subject: ${user.name}`);
    console.log(`Status: ${evaluation.status}`);
    console.log('\nYou can now view this evaluation and generate a development plan!');
    console.log(`URL: http://localhost:3000/leadership/360-evaluations/${evaluation._id}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample evaluation:', error);
    process.exit(1);
  }
}

// Run the script
createSample360Evaluation();
