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
  title: 'Comprehensive Leadership Style Assessment',
  description: 'Discover your leadership style and understand how you lead others. This comprehensive 30-question assessment provides detailed insights across all major leadership dimensions for accurate development recommendations.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 30,
  scoringMethod: 'average',
  areas: [
    { name: 'Decision Making', description: 'How you approach decisions and problem-solving', weight: 1 },
    { name: 'Communication', description: 'Your communication style and approach', weight: 1 },
    { name: 'Team Development', description: 'How you develop and empower your team', weight: 1 },
    { name: 'Conflict Resolution', description: 'Your approach to handling conflicts and challenges', weight: 1 },
    { name: 'Vision & Direction', description: 'How you set direction and inspire others', weight: 1 }
  ],
  questions: [
    // Decision Making Questions (6 questions)
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
    {
      id: 'decision_5',
      text: 'When making decisions under pressure, I:',
      type: 'multiple_choice',
      area: 'Decision Making',
      options: [
        { value: 1, label: 'Rely on my experience and make quick decisions' },
        { value: 2, label: 'Take a moment to gather key input from my team' },
        { value: 3, label: 'Use a structured decision-making process even under pressure' },
        { value: 4, label: 'Focus on the decision that best serves the team and customers' }
      ]
    },
    {
      id: 'decision_6',
      text: 'I regularly evaluate the outcomes of my decisions to improve future decision-making.',
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
    // Communication Questions (6 questions)
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
    {
      id: 'communication_5',
      text: 'During busy periods, I maintain clear and calm communication with my team.',
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
      id: 'communication_6',
      text: 'When communicating expectations, I:',
      type: 'multiple_choice',
      area: 'Communication',
      options: [
        { value: 1, label: 'Give clear, specific instructions with deadlines' },
        { value: 2, label: 'Explain the why behind the expectations' },
        { value: 3, label: 'Check for understanding and answer questions' },
        { value: 4, label: 'Connect expectations to team and customer impact' }
      ]
    },
    // Team Development Questions (6 questions)
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
    {
      id: 'team_dev_5',
      text: 'I provide regular feedback to help team members improve their performance.',
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
      id: 'team_dev_6',
      text: 'When a team member makes a mistake, I:',
      type: 'multiple_choice',
      area: 'Team Development',
      options: [
        { value: 1, label: 'Address it immediately and show them the correct way' },
        { value: 2, label: 'Use it as a coaching opportunity to help them learn' },
        { value: 3, label: 'Discuss what happened and how to prevent it in the future' },
        { value: 4, label: 'Focus on their growth and learning from the experience' }
      ]
    },
    // Conflict Resolution Questions (4 questions)
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
    {
      id: 'conflict_4',
      text: 'I follow up after resolving conflicts to ensure the solution is working.',
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
    // Vision & Direction Questions (4 questions)
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
    },
    {
      id: 'vision_4',
      text: 'I adapt our approach and goals based on changing circumstances while maintaining our core purpose.',
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
  title: 'Comprehensive Servant Leadership Assessment',
  description: 'Comprehensive assessment of your servant leadership capabilities and growth opportunities in serving others. This 20-question assessment provides detailed insights into your servant leadership approach.',
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
      id: 'empowerment_3',
      text: 'I encourage team members to make decisions within their areas of responsibility.',
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
      id: 'empowerment_4',
      text: 'I trust my team members to handle important tasks without micromanaging.',
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
      id: 'empowerment_5',
      text: 'I celebrate and recognize team members when they take initiative.',
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
      id: 'service_3',
      text: 'I ask my team members how I can better support them in their work.',
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
      id: 'service_4',
      text: 'I make personal sacrifices to ensure my team has what they need to succeed.',
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
      id: 'service_5',
      text: 'I focus more on serving my team than on being served by them.',
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
      id: 'vision_sharing_3',
      text: 'I regularly communicate our restaurant\'s mission and values to the team.',
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
      id: 'vision_sharing_4',
      text: 'I connect daily tasks to our bigger goals and vision.',
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
      id: 'vision_sharing_5',
      text: 'I inspire team members by sharing stories of how we make a difference.',
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
    },
    {
      id: 'stewardship_3',
      text: 'I take responsibility for developing the potential of each team member.',
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
      id: 'stewardship_4',
      text: 'I make decisions that benefit the team and organization, even when it\'s difficult for me personally.',
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
      id: 'stewardship_5',
      text: 'I protect and advocate for my team members when they need support.',
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

const createEmotionalIntelligenceAssessment = () => ({
  title: 'Comprehensive Emotional Intelligence Leadership Assessment',
  description: 'Comprehensive evaluation of your emotional intelligence capabilities and how they impact your leadership effectiveness. This 20-question assessment provides detailed insights into your emotional leadership skills.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Self-Awareness', description: 'Understanding your own emotions and their impact', weight: 1 },
    { name: 'Self-Regulation', description: 'Managing your emotions effectively', weight: 1 },
    { name: 'Empathy', description: 'Understanding and responding to others\' emotions', weight: 1 },
    { name: 'Social Skills', description: 'Building relationships and influencing others', weight: 1 }
  ],
  questions: [
    {
      id: 'self_awareness_1',
      text: 'I am aware of how my emotions affect my decision-making.',
      type: 'likert_scale',
      area: 'Self-Awareness',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_awareness_2',
      text: 'I recognize my emotional triggers and how they impact my leadership.',
      type: 'likert_scale',
      area: 'Self-Awareness',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_awareness_3',
      text: 'I understand how my mood affects my team\'s performance and morale.',
      type: 'likert_scale',
      area: 'Self-Awareness',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_awareness_4',
      text: 'I can accurately identify my strengths and weaknesses as a leader.',
      type: 'likert_scale',
      area: 'Self-Awareness',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_awareness_5',
      text: 'I regularly reflect on my emotional responses to challenging situations.',
      type: 'likert_scale',
      area: 'Self-Awareness',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_regulation_1',
      text: 'I remain calm and composed during high-pressure situations.',
      type: 'likert_scale',
      area: 'Self-Regulation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_regulation_2',
      text: 'I can control my emotional reactions when receiving criticism or feedback.',
      type: 'likert_scale',
      area: 'Self-Regulation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_regulation_3',
      text: 'I manage my stress effectively without letting it affect my team.',
      type: 'likert_scale',
      area: 'Self-Regulation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_regulation_4',
      text: 'I can quickly recover from setbacks and maintain a positive attitude.',
      type: 'likert_scale',
      area: 'Self-Regulation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'self_regulation_5',
      text: 'I pause and think before reacting when faced with frustrating situations.',
      type: 'likert_scale',
      area: 'Self-Regulation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'empathy_1',
      text: 'I can accurately read the emotions of my team members.',
      type: 'likert_scale',
      area: 'Empathy',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'empathy_2',
      text: 'I adjust my leadership approach based on individual team members\' emotional needs.',
      type: 'likert_scale',
      area: 'Empathy',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'empathy_3',
      text: 'I can sense when team members are struggling, even when they don\'t say anything.',
      type: 'likert_scale',
      area: 'Empathy',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'empathy_4',
      text: 'I consider how my decisions will emotionally impact each team member.',
      type: 'likert_scale',
      area: 'Empathy',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'empathy_5',
      text: 'I show genuine concern for my team members\' personal well-being.',
      type: 'likert_scale',
      area: 'Empathy',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'social_skills_1',
      text: 'I build strong, trusting relationships with my team members.',
      type: 'likert_scale',
      area: 'Social Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'social_skills_2',
      text: 'I can influence others without relying on my formal authority.',
      type: 'likert_scale',
      area: 'Social Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'social_skills_3',
      text: 'I effectively manage conflicts between team members.',
      type: 'likert_scale',
      area: 'Social Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'social_skills_4',
      text: 'I inspire and motivate others through my communication and presence.',
      type: 'likert_scale',
      area: 'Social Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'social_skills_5',
      text: 'I build networks and collaborative relationships easily.',
      type: 'likert_scale',
      area: 'Social Skills',
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

const createStrategicThinkingAssessment = () => ({
  title: 'Comprehensive Strategic Thinking & Innovation Assessment',
  description: 'Comprehensive assessment of your strategic thinking capabilities and approach to innovation and change in restaurant operations. This 20-question assessment provides detailed insights into your strategic leadership abilities.',
  type: 'self_assessment',
  category: 'strategy',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Strategic Planning', description: 'Developing long-term plans and strategies', weight: 1 },
    { name: 'Innovation', description: 'Generating and implementing new ideas', weight: 1 },
    { name: 'Change Management', description: 'Leading and managing organizational change', weight: 1 },
    { name: 'Process Improvement', description: 'Identifying and improving operational processes', weight: 1 },
    { name: 'Systems Thinking', description: 'Understanding interconnections and big picture', weight: 1 }
  ],
  questions: [
    {
      id: 'strategic_1',
      text: 'When planning for the future, I:',
      type: 'multiple_choice',
      area: 'Strategic Planning',
      options: [
        { value: 1, label: 'Focus on immediate operational needs and challenges' },
        { value: 2, label: 'Set goals based on past performance and trends' },
        { value: 3, label: 'Analyze market trends and competitive landscape' },
        { value: 4, label: 'Envision breakthrough possibilities and work backward' }
      ]
    },
    {
      id: 'strategic_2',
      text: 'I regularly analyze industry trends and their potential impact on our restaurant.',
      type: 'likert_scale',
      area: 'Strategic Planning',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'strategic_3',
      text: 'I develop long-term goals that align with our restaurant\'s mission and values.',
      type: 'likert_scale',
      area: 'Strategic Planning',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'strategic_4',
      text: 'I consider multiple scenarios and contingency plans when making strategic decisions.',
      type: 'likert_scale',
      area: 'Strategic Planning',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'innovation_1',
      text: 'When faced with a recurring problem, I:',
      type: 'multiple_choice',
      area: 'Innovation',
      options: [
        { value: 1, label: 'Apply proven solutions that have worked before' },
        { value: 2, label: 'Research how other restaurants handle similar issues' },
        { value: 3, label: 'Brainstorm creative alternatives with my team' },
        { value: 4, label: 'Challenge assumptions and explore completely new approaches' }
      ]
    },
    {
      id: 'innovation_2',
      text: 'I encourage my team to experiment with new ideas and approaches.',
      type: 'likert_scale',
      area: 'Innovation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'innovation_3',
      text: 'I create an environment where team members feel safe to share creative ideas.',
      type: 'likert_scale',
      area: 'Innovation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'innovation_4',
      text: 'I regularly seek input from customers and team members to identify improvement opportunities.',
      type: 'likert_scale',
      area: 'Innovation',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'change_1',
      text: 'When implementing changes in our restaurant, I:',
      type: 'multiple_choice',
      area: 'Change Management',
      options: [
        { value: 1, label: 'Announce the change and expect compliance' },
        { value: 2, label: 'Explain the reasons and benefits of the change' },
        { value: 3, label: 'Involve the team in planning the implementation' },
        { value: 4, label: 'Help team members understand their role in the change vision' }
      ]
    },
    {
      id: 'change_2',
      text: 'I help my team adapt to changes by addressing their concerns and resistance.',
      type: 'likert_scale',
      area: 'Change Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'change_3',
      text: 'I communicate the vision and benefits of change clearly to gain buy-in.',
      type: 'likert_scale',
      area: 'Change Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'change_4',
      text: 'I monitor and adjust change initiatives based on feedback and results.',
      type: 'likert_scale',
      area: 'Change Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'process_1',
      text: 'I regularly look for ways to improve our operational efficiency.',
      type: 'likert_scale',
      area: 'Process Improvement',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'process_2',
      text: 'I use data and metrics to identify areas for operational improvement.',
      type: 'likert_scale',
      area: 'Process Improvement',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'process_3',
      text: 'I involve team members in identifying and implementing process improvements.',
      type: 'likert_scale',
      area: 'Process Improvement',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'process_4',
      text: 'I standardize successful improvements to ensure consistent implementation.',
      type: 'likert_scale',
      area: 'Process Improvement',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'systems_1',
      text: 'I understand how changes in one area of the restaurant affect other areas.',
      type: 'likert_scale',
      area: 'Systems Thinking',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'systems_2',
      text: 'I consider the long-term consequences of decisions, not just immediate results.',
      type: 'likert_scale',
      area: 'Systems Thinking',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'systems_3',
      text: 'I look for root causes rather than just addressing symptoms of problems.',
      type: 'likert_scale',
      area: 'Systems Thinking',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'systems_4',
      text: 'I consider how external factors (economy, competition, trends) affect our restaurant operations.',
      type: 'likert_scale',
      area: 'Systems Thinking',
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

const createCoachingPerformanceAssessment = () => ({
  title: 'Comprehensive Coaching & Performance Management Assessment',
  description: 'Comprehensive evaluation of your coaching abilities and performance management skills for developing team members. This 20-question assessment provides detailed insights into your coaching and performance leadership capabilities.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Coaching Skills', description: 'Ability to coach and develop others', weight: 1 },
    { name: 'Performance Management', description: 'Managing and improving team performance', weight: 1 },
    { name: 'Feedback Delivery', description: 'Providing effective feedback and guidance', weight: 1 },
    { name: 'Goal Setting', description: 'Setting and tracking meaningful goals', weight: 1 }
  ],
  questions: [
    {
      id: 'coaching_1',
      text: 'When helping a team member improve, I prefer to:',
      type: 'multiple_choice',
      area: 'Coaching Skills',
      options: [
        { value: 1, label: 'Tell them exactly what they need to do differently' },
        { value: 2, label: 'Show them the correct way and have them practice' },
        { value: 3, label: 'Ask questions to help them discover the solution' },
        { value: 4, label: 'Guide them through reflection on their own performance' }
      ]
    },
    {
      id: 'coaching_2',
      text: 'I regularly schedule one-on-one coaching conversations with team members.',
      type: 'likert_scale',
      area: 'Coaching Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'coaching_3',
      text: 'I ask powerful questions that help team members discover solutions themselves.',
      type: 'likert_scale',
      area: 'Coaching Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'coaching_4',
      text: 'I listen actively and give team members my full attention during coaching conversations.',
      type: 'likert_scale',
      area: 'Coaching Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'coaching_5',
      text: 'I tailor my coaching approach to each individual\'s learning style and needs.',
      type: 'likert_scale',
      area: 'Coaching Skills',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'performance_1',
      text: 'I track individual team member performance using specific metrics.',
      type: 'likert_scale',
      area: 'Performance Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'performance_2',
      text: 'I address performance issues promptly and constructively.',
      type: 'likert_scale',
      area: 'Performance Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'performance_3',
      text: 'I create individual development plans for each team member based on their performance.',
      type: 'likert_scale',
      area: 'Performance Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'performance_4',
      text: 'I recognize and reward high performance consistently.',
      type: 'likert_scale',
      area: 'Performance Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'performance_5',
      text: 'I document performance conversations and track progress over time.',
      type: 'likert_scale',
      area: 'Performance Management',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'feedback_1',
      text: 'When giving feedback, I focus on specific behaviors rather than personality traits.',
      type: 'likert_scale',
      area: 'Feedback Delivery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'feedback_2',
      text: 'I provide both positive recognition and constructive feedback regularly.',
      type: 'likert_scale',
      area: 'Feedback Delivery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'feedback_3',
      text: 'I deliver feedback in a timely manner, close to when the behavior occurred.',
      type: 'likert_scale',
      area: 'Feedback Delivery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'feedback_4',
      text: 'I create a safe environment where team members feel comfortable receiving feedback.',
      type: 'likert_scale',
      area: 'Feedback Delivery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'feedback_5',
      text: 'I follow up on feedback to ensure understanding and track improvement.',
      type: 'likert_scale',
      area: 'Feedback Delivery',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'goals_1',
      text: 'I work with team members to set SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals.',
      type: 'likert_scale',
      area: 'Goal Setting',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'goals_2',
      text: 'I regularly check in on progress toward goals and adjust as needed.',
      type: 'likert_scale',
      area: 'Goal Setting',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'goals_3',
      text: 'I help team members connect their personal goals with restaurant objectives.',
      type: 'likert_scale',
      area: 'Goal Setting',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'goals_4',
      text: 'I break down large goals into smaller, achievable milestones.',
      type: 'likert_scale',
      area: 'Goal Setting',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ]
    },
    {
      id: 'goals_5',
      text: 'I celebrate goal achievements and use them as motivation for future goals.',
      type: 'likert_scale',
      area: 'Goal Setting',
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

const createCustomerServiceLeadershipAssessment = () => ({
  title: 'Comprehensive Customer Service Leadership Assessment',
  description: 'Comprehensive evaluation of your leadership in delivering exceptional customer service and creating a hospitality-focused culture in your restaurant. This 25-question assessment provides detailed insights into your service leadership capabilities.',
  type: 'self_assessment',
  category: 'customer_service',
  timeEstimate: 25,
  scoringMethod: 'average',
  areas: [
    { name: 'Service Standards', description: 'Setting and maintaining high service standards', weight: 1 },
    { name: 'Customer Recovery', description: 'Handling complaints and service failures effectively', weight: 1 },
    { name: 'Team Training', description: 'Training and developing team members in service excellence', weight: 1 },
    { name: 'Leading by Example', description: 'Modeling exceptional customer service behaviors', weight: 1 },
    { name: 'Service Culture', description: 'Building a customer-focused team culture', weight: 1 }
  ],
  questions: [
    // Service Standards Questions (5 questions)
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
    {
      id: 'standards_4',
      text: 'I ensure our service standards are clearly documented and accessible to all team members.',
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
      id: 'standards_5',
      text: 'I regularly review and update our service standards based on customer feedback and industry best practices.',
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
      createServantLeadershipAssessment(),
      createEmotionalIntelligenceAssessment(),
      createStrategicThinkingAssessment(),
      createCoachingPerformanceAssessment()
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
