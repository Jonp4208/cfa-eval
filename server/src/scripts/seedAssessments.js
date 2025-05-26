import mongoose from 'mongoose';
import { AssessmentTemplate } from '../models/Assessment.js';
import User from '../models/User.js';
import Store from '../models/Store.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createLeadershipStyleAssessment = () => ({
  title: 'Leadership Style Assessment',
  description: 'Discover your leadership style and understand how you lead others. This comprehensive assessment evaluates your approach across multiple leadership dimensions.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Decision Making', description: 'How you approach decisions and problem-solving', weight: 1 },
    { name: 'Communication', description: 'Your communication style and approach', weight: 1 },
    { name: 'Team Development', description: 'How you develop and empower your team', weight: 1 },
    { name: 'Conflict Resolution', description: 'Your approach to handling conflicts and challenges', weight: 1 },
    { name: 'Vision & Direction', description: 'How you set direction and inspire others', weight: 1 }
  ],
  questions: [
    // Decision Making Questions (4 questions)
    {
      id: 'decision_1',
      text: 'When making important decisions, I prefer to:',
      type: 'multiple_choice',
      area: 'Decision Making',
      options: [
        { value: 1, label: 'Make quick decisions based on my experience and intuition' },
        { value: 2, label: 'Gather input from my team before deciding' },
        { value: 3, label: 'Analyze all available data thoroughly before deciding' },
        { value: 4, label: 'Delegate the decision to the most qualified team member' }
      ]
    },
    {
      id: 'decision_2',
      text: 'When facing a problem, my first instinct is to:',
      type: 'multiple_choice',
      area: 'Decision Making',
      options: [
        { value: 1, label: 'Take charge and solve it myself' },
        { value: 2, label: 'Bring the team together to brainstorm solutions' },
        { value: 3, label: 'Research best practices and proven solutions' },
        { value: 4, label: 'Coach team members to solve it themselves' }
      ]
    },
    {
      id: 'decision_3',
      text: 'I involve my team in decision-making because:',
      type: 'likert_scale',
      area: 'Decision Making',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'decision_4',
      text: 'I am comfortable making decisions with incomplete information.',
      type: 'likert_scale',
      area: 'Decision Making',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Communication Questions (4 questions)
    {
      id: 'communication_1',
      text: 'My communication style is best described as:',
      type: 'multiple_choice',
      area: 'Communication',
      options: [
        { value: 1, label: 'Direct and to-the-point' },
        { value: 2, label: 'Collaborative and inclusive' },
        { value: 3, label: 'Detailed and informative' },
        { value: 4, label: 'Supportive and encouraging' }
      ]
    },
    {
      id: 'communication_2',
      text: 'When giving feedback to team members, I:',
      type: 'multiple_choice',
      area: 'Communication',
      options: [
        { value: 1, label: 'Give clear, specific direction on what needs to change' },
        { value: 2, label: 'Ask questions to help them discover the solution' },
        { value: 3, label: 'Provide detailed examples and best practices' },
        { value: 4, label: 'Focus on their strengths and potential' }
      ]
    },
    {
      id: 'communication_3',
      text: 'I actively listen to understand others\' perspectives before responding.',
      type: 'likert_scale',
      area: 'Communication',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'communication_4',
      text: 'I adapt my communication style based on who I\'m talking to.',
      type: 'likert_scale',
      area: 'Communication',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Team Development Questions (4 questions)
    {
      id: 'team_dev_1',
      text: 'When developing team members, I prefer to:',
      type: 'multiple_choice',
      area: 'Team Development',
      options: [
        { value: 1, label: 'Set clear expectations and monitor progress closely' },
        { value: 2, label: 'Involve them in setting their own development goals' },
        { value: 3, label: 'Create structured learning plans with specific milestones' },
        { value: 4, label: 'Provide mentoring and emotional support' }
      ]
    },
    {
      id: 'team_dev_2',
      text: 'I believe the best way to motivate team members is to:',
      type: 'multiple_choice',
      area: 'Team Development',
      options: [
        { value: 1, label: 'Set challenging goals and recognize achievement' },
        { value: 2, label: 'Give them autonomy and trust in their abilities' },
        { value: 3, label: 'Provide clear processes and consistent feedback' },
        { value: 4, label: 'Show personal interest in their growth and well-being' }
      ]
    },
    {
      id: 'team_dev_3',
      text: 'I regularly provide opportunities for team members to take on new challenges.',
      type: 'likert_scale',
      area: 'Team Development',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'team_dev_4',
      text: 'I invest time in understanding each team member\'s individual strengths and goals.',
      type: 'likert_scale',
      area: 'Team Development',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Conflict Resolution Questions (3 questions)
    {
      id: 'conflict_1',
      text: 'When team members have a disagreement, I:',
      type: 'multiple_choice',
      area: 'Conflict Resolution',
      options: [
        { value: 1, label: 'Step in quickly to make a decision and resolve it' },
        { value: 2, label: 'Facilitate a discussion to help them work it out together' },
        { value: 3, label: 'Gather all facts before determining the best solution' },
        { value: 4, label: 'Focus on maintaining relationships while finding compromise' }
      ]
    },
    {
      id: 'conflict_2',
      text: 'I address conflicts and difficult situations promptly rather than avoiding them.',
      type: 'likert_scale',
      area: 'Conflict Resolution',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'conflict_3',
      text: 'I remain calm and objective when dealing with workplace tensions.',
      type: 'likert_scale',
      area: 'Conflict Resolution',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Vision & Direction Questions (3 questions)
    {
      id: 'vision_1',
      text: 'When setting direction for my team, I:',
      type: 'multiple_choice',
      area: 'Vision & Direction',
      options: [
        { value: 1, label: 'Set clear, specific goals and expectations' },
        { value: 2, label: 'Involve the team in creating our shared vision' },
        { value: 3, label: 'Research industry best practices and proven methods' },
        { value: 4, label: 'Focus on inspiring and motivating the team toward the vision' }
      ]
    },
    {
      id: 'vision_2',
      text: 'I regularly communicate how our daily work connects to the bigger picture.',
      type: 'likert_scale',
      area: 'Vision & Direction',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'vision_3',
      text: 'I help team members understand their role in achieving our restaurant\'s success.',
      type: 'likert_scale',
      area: 'Vision & Direction',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    }
  ]
});

const createServantLeadershipAssessment = () => ({
  title: 'Servant Leadership Assessment',
  description: 'Assess your servant leadership capabilities and identify growth opportunities in serving others.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Empowerment', description: 'Enabling others to grow and succeed', weight: 1 },
    { name: 'Service Orientation', description: 'Putting others\' needs first', weight: 1 },
    { name: 'Vision Sharing', description: 'Communicating purpose and direction', weight: 1 },
    { name: 'Stewardship', description: 'Taking care of people and resources', weight: 1 }
  ],
  questions: [
    {
      id: 'empowerment_1',
      text: 'I delegate meaningful responsibilities to team members.',
      type: 'likert_scale',
      area: 'Empowerment',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'empowerment_2',
      text: 'I provide opportunities for team members to develop new skills.',
      type: 'likert_scale',
      area: 'Empowerment',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'service_1',
      text: 'I prioritize my team\'s needs over my own convenience.',
      type: 'likert_scale',
      area: 'Service Orientation',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'service_2',
      text: 'I actively remove obstacles that prevent my team from succeeding.',
      type: 'likert_scale',
      area: 'Service Orientation',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'vision_1',
      text: 'I clearly communicate our team\'s purpose and goals.',
      type: 'likert_scale',
      area: 'Vision Sharing',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'vision_2',
      text: 'I help team members connect their daily work to our larger mission.',
      type: 'likert_scale',
      area: 'Vision Sharing',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'stewardship_1',
      text: 'I take responsibility for developing my team members.',
      type: 'likert_scale',
      area: 'Stewardship',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'stewardship_2',
      text: 'I manage resources responsibly and efficiently.',
      type: 'likert_scale',
      area: 'Stewardship',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    }
  ]
});

const createCustomerServiceLeadershipAssessment = () => ({
  title: 'Customer Service Leadership Assessment',
  description: 'Evaluate your leadership in delivering exceptional customer service and creating a hospitality-focused culture in your restaurant.',
  type: 'self_assessment',
  category: 'customer_service',
  timeEstimate: 20,
  scoringMethod: 'average',
  areas: [
    { name: 'Service Standards', description: 'Setting and maintaining high service standards', weight: 1 },
    { name: 'Customer Recovery', description: 'Handling complaints and service failures effectively', weight: 1 },
    { name: 'Team Training', description: 'Training and developing team members in service excellence', weight: 1 },
    { name: 'Leading by Example', description: 'Modeling exceptional customer service behaviors', weight: 1 },
    { name: 'Service Culture', description: 'Building a customer-focused team culture', weight: 1 }
  ],
  questions: [
    // Service Standards Questions (3 questions)
    {
      id: 'standards_1',
      text: 'When establishing service standards for my team, I:',
      type: 'multiple_choice',
      area: 'Service Standards',
      options: [
        { value: 1, label: 'Set clear, specific expectations and monitor compliance closely' },
        { value: 2, label: 'Involve the team in defining what great service looks like' },
        { value: 3, label: 'Use proven industry standards and best practices' },
        { value: 4, label: 'Focus on the emotional connection and guest experience' }
      ]
    },
    {
      id: 'standards_2',
      text: 'I consistently communicate and reinforce our service standards during busy periods.',
      type: 'likert_scale',
      area: 'Service Standards',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'standards_3',
      text: 'I regularly observe and provide feedback on team members\' customer interactions.',
      type: 'likert_scale',
      area: 'Service Standards',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Customer Recovery Questions (3 questions)
    {
      id: 'recovery_1',
      text: 'When a customer has a complaint, my first priority is to:',
      type: 'multiple_choice',
      area: 'Customer Recovery',
      options: [
        { value: 1, label: 'Quickly resolve the issue and get them back to satisfied' },
        { value: 2, label: 'Listen fully to understand their perspective and feelings' },
        { value: 3, label: 'Follow our established complaint resolution procedures' },
        { value: 4, label: 'Make them feel heard and valued as a guest' }
      ]
    },
    {
      id: 'recovery_2',
      text: 'I empower my team members to resolve customer issues without always needing approval.',
      type: 'likert_scale',
      area: 'Customer Recovery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'recovery_3',
      text: 'I use service failures as learning opportunities to improve our processes.',
      type: 'likert_scale',
      area: 'Customer Recovery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Team Training Questions (3 questions)
    {
      id: 'training_1',
      text: 'When training team members on customer service, I focus on:',
      type: 'multiple_choice',
      area: 'Team Training',
      options: [
        { value: 1, label: 'Specific procedures and scripts they should follow' },
        { value: 2, label: 'Role-playing and practicing different scenarios together' },
        { value: 3, label: 'Teaching them the principles behind great service' },
        { value: 4, label: 'Helping them understand the guest\'s emotional journey' }
      ]
    },
    {
      id: 'training_2',
      text: 'I provide ongoing coaching and feedback on customer service skills.',
      type: 'likert_scale',
      area: 'Team Training',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'training_3',
      text: 'I recognize and celebrate team members who deliver exceptional customer service.',
      type: 'likert_scale',
      area: 'Team Training',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Leading by Example Questions (3 questions)
    {
      id: 'example_1',
      text: 'I actively interact with customers and model the service behaviors I expect.',
      type: 'likert_scale',
      area: 'Leading by Example',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'example_2',
      text: 'When I see a customer need, I:',
      type: 'multiple_choice',
      area: 'Leading by Example',
      options: [
        { value: 1, label: 'Direct a team member to handle it immediately' },
        { value: 2, label: 'Step in myself to show how it should be done' },
        { value: 3, label: 'Use it as a teaching moment with my team' },
        { value: 4, label: 'Address it personally while explaining my approach to nearby team members' }
      ]
    },
    {
      id: 'example_3',
      text: 'I maintain a positive, welcoming demeanor even during stressful situations.',
      type: 'likert_scale',
      area: 'Leading by Example',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    // Service Culture Questions (3 questions)
    {
      id: 'culture_1',
      text: 'I help my team understand how their role impacts the overall guest experience.',
      type: 'likert_scale',
      area: 'Service Culture',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'culture_2',
      text: 'I encourage team members to go above and beyond for customers when appropriate.',
      type: 'likert_scale',
      area: 'Service Culture',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'culture_3',
      text: 'My team feels comfortable approaching me with customer service ideas and concerns.',
      type: 'likert_scale',
      area: 'Service Culture',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    }
  ]
});

const seedAssessments = async () => {
  try {
    await connectDB();

    // Find a system user to assign as creator
    const systemUser = await User.findOne({ email: 'jonp4208@gmail.com' });
    if (!systemUser) {
      console.error('System user not found. Please ensure a user exists.');
      process.exit(1);
    }

    // Clear existing assessment templates
    await AssessmentTemplate.deleteMany({});
    console.log('Cleared existing assessment templates');

    // Create assessment templates
    const templates = [
      createLeadershipStyleAssessment(),
      createCustomerServiceLeadershipAssessment(),
      createServantLeadershipAssessment()
    ];

    for (const templateData of templates) {
      const template = new AssessmentTemplate({
        ...templateData,
        createdBy: systemUser._id,
        store: null, // Global template
        isActive: true
      });

      await template.save();
      console.log(`Created assessment template: ${template.title}`);
    }

    console.log('Assessment templates seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding assessments:', error);
    process.exit(1);
  }
};

seedAssessments();
