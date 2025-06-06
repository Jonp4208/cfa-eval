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

const createLeadershipStyleAdaptationAssessment = () => ({
  title: 'Leadership Style & Adaptation Assessment',
  description: 'Discover your natural leadership style based on DISC principles and learn how to adapt your approach for maximum effectiveness with different team members and situations. This comprehensive 28-question assessment identifies your primary leadership style and provides specific strategies for leading different personality types.',
  type: 'self_assessment',
  category: 'leadership',
  timeEstimate: 25,
  scoringMethod: 'weighted_average',
  areas: [
    { name: 'Dominant Leadership', description: 'Results-focused, direct, and decisive leadership approach', weight: 1 },
    { name: 'Influential Leadership', description: 'People-focused, enthusiastic, and inspiring leadership style', weight: 1 },
    { name: 'Steady Leadership', description: 'Supportive, patient, and team-oriented leadership approach', weight: 1 },
    { name: 'Conscientious Leadership', description: 'Process-focused, analytical, and quality-driven leadership style', weight: 1 },
    { name: 'Situational Adaptation', description: 'Ability to adapt leadership style based on situation and team needs', weight: 1.2 },
    { name: 'Team Dynamics Understanding', description: 'Understanding and managing different personality types on your team', weight: 1.1 }
  ],
  questions: [
    // Dominant Leadership Questions (7 questions)
    {
      id: 'dom_1',
      text: 'When facing a tight deadline, how do you typically lead your team?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Collaborate extensively', description: 'Spend significant time getting everyone\'s input and building consensus' },
        { value: 2, label: 'Seek some input', description: 'Get key perspectives but make decisions relatively quickly' },
        { value: 3, label: 'Balance input and action', description: 'Get essential input while maintaining momentum toward the goal' },
        { value: 4, label: 'Take charge decisively', description: 'Make quick decisions and direct the team with clear expectations' },
        { value: 5, label: 'Drive results immediately', description: 'Take immediate control, set clear priorities, and push for fast execution' }
      ]
    },
    {
      id: 'dom_2',
      text: 'How comfortable are you with making difficult decisions that may be unpopular?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Very uncomfortable', description: 'Avoid difficult decisions and seek to please everyone' },
        { value: 2, label: 'Somewhat uncomfortable', description: 'Hesitate but eventually make necessary decisions' },
        { value: 3, label: 'Moderately comfortable', description: 'Can make tough decisions when clearly necessary' },
        { value: 4, label: 'Comfortable', description: 'Willing to make unpopular decisions for the greater good' },
        { value: 5, label: 'Very comfortable', description: 'Readily make tough decisions and stand by them confidently' }
      ]
    },
    {
      id: 'dom_3',
      text: 'When your team faces a challenge, what\'s your first instinct?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Support and encourage', description: 'Focus on team morale and emotional support first' },
        { value: 2, label: 'Analyze the situation', description: 'Gather data and carefully study the problem' },
        { value: 3, label: 'Facilitate discussion', description: 'Bring the team together to brainstorm solutions' },
        { value: 4, label: 'Develop action plan', description: 'Quickly assess and create a clear plan of attack' },
        { value: 5, label: 'Take immediate action', description: 'Jump in and start solving the problem directly' }
      ]
    },
    {
      id: 'dom_4',
      text: 'How do you prefer to communicate expectations to your team?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Gentle suggestions', description: 'Offer ideas and let team members decide how to proceed' },
        { value: 2, label: 'Collaborative planning', description: 'Work together to establish mutual expectations' },
        { value: 3, label: 'Clear guidelines', description: 'Provide structured expectations with some flexibility' },
        { value: 4, label: 'Direct instructions', description: 'Give clear, specific directions about what needs to be done' },
        { value: 5, label: 'Firm directives', description: 'Set non-negotiable expectations with clear consequences' }
      ]
    },
    {
      id: 'dom_5',
      text: 'When delegating tasks, how much control do you typically maintain?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Full autonomy', description: 'Give complete freedom and check in only when asked' },
        { value: 2, label: 'Minimal oversight', description: 'Provide guidance and check in occasionally' },
        { value: 3, label: 'Regular check-ins', description: 'Monitor progress with scheduled updates' },
        { value: 4, label: 'Close monitoring', description: 'Stay closely involved and provide frequent direction' },
        { value: 5, label: 'Tight control', description: 'Maintain detailed oversight and frequent course corrections' }
      ]
    },
    {
      id: 'dom_6',
      text: 'How do you handle team members who resist your leadership?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Accommodate their concerns', description: 'Adjust your approach to address their resistance' },
        { value: 2, label: 'Seek to understand', description: 'Explore their perspective and find common ground' },
        { value: 3, label: 'Address directly', description: 'Have an honest conversation about expectations' },
        { value: 4, label: 'Assert authority', description: 'Make it clear that your leadership decisions stand' },
        { value: 5, label: 'Demand compliance', description: 'Insist on immediate alignment with your direction' }
      ]
    },
    {
      id: 'dom_7',
      text: 'In high-pressure situations, how do you maintain team performance?',
      type: 'multiple_choice',
      area: 'Dominant Leadership',
      options: [
        { value: 1, label: 'Emotional support', description: 'Focus on reducing stress and maintaining team morale' },
        { value: 2, label: 'Collaborative problem-solving', description: 'Work together to find solutions and share the load' },
        { value: 3, label: 'Structured approach', description: 'Create clear processes and systems to manage pressure' },
        { value: 4, label: 'Direct leadership', description: 'Take charge and guide the team through decisive action' },
        { value: 5, label: 'Drive results', description: 'Push hard for performance and maintain high standards' }
      ]
    },

    // Influential Leadership Questions (7 questions)
    {
      id: 'inf_1',
      text: 'How do you typically motivate your team members?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Clear processes', description: 'Provide structured systems and detailed procedures' },
        { value: 2, label: 'Stable environment', description: 'Create predictable, supportive working conditions' },
        { value: 3, label: 'Achievement goals', description: 'Set challenging targets and track progress' },
        { value: 4, label: 'Personal connection', description: 'Build relationships and inspire through enthusiasm' },
        { value: 5, label: 'Vision and excitement', description: 'Paint compelling pictures of success and celebrate wins' }
      ]
    },
    {
      id: 'inf_2',
      text: 'When introducing changes to your team, what\'s your approach?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Detailed analysis', description: 'Present comprehensive data and logical reasoning' },
        { value: 2, label: 'Gradual implementation', description: 'Introduce changes slowly with plenty of support' },
        { value: 3, label: 'Direct communication', description: 'Explain the change clearly and expect compliance' },
        { value: 4, label: 'Enthusiastic presentation', description: 'Generate excitement about the benefits and possibilities' },
        { value: 5, label: 'Inspiring vision', description: 'Paint a compelling picture of the positive future state' }
      ]
    },
    {
      id: 'inf_3',
      text: 'How do you prefer to conduct team meetings?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Structured agenda', description: 'Follow detailed agendas with specific time allocations' },
        { value: 2, label: 'Supportive discussion', description: 'Create safe spaces for everyone to contribute' },
        { value: 3, label: 'Efficient and focused', description: 'Cover key points quickly and make decisions' },
        { value: 4, label: 'Interactive and engaging', description: 'Encourage participation and build energy' },
        { value: 5, label: 'Dynamic and inspiring', description: 'Create excitement and momentum around goals' }
      ]
    },
    {
      id: 'inf_4',
      text: 'How do you handle team conflicts?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Systematic analysis', description: 'Gather facts and analyze the situation objectively' },
        { value: 2, label: 'Patient mediation', description: 'Listen carefully and help parties find common ground' },
        { value: 3, label: 'Direct resolution', description: 'Address the issue head-on and make decisions' },
        { value: 4, label: 'Positive reframing', description: 'Help parties see opportunities and focus on solutions' },
        { value: 5, label: 'Inspiring unity', description: 'Rally the team around shared vision and common goals' }
      ]
    },
    {
      id: 'inf_5',
      text: 'What\'s your communication style during one-on-one meetings?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Detailed and thorough', description: 'Cover all points systematically with documentation' },
        { value: 2, label: 'Supportive and patient', description: 'Listen carefully and provide steady encouragement' },
        { value: 3, label: 'Direct and efficient', description: 'Get to the point quickly and make clear decisions' },
        { value: 4, label: 'Warm and engaging', description: 'Build rapport and create positive energy' },
        { value: 5, label: 'Inspiring and motivational', description: 'Focus on possibilities and generate excitement' }
      ]
    },
    {
      id: 'inf_6',
      text: 'How do you recognize and celebrate team achievements?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Formal documentation', description: 'Record achievements systematically in performance reviews' },
        { value: 2, label: 'Personal appreciation', description: 'Offer sincere, private thanks and recognition' },
        { value: 3, label: 'Results-focused praise', description: 'Acknowledge achievements and set next targets' },
        { value: 4, label: 'Public recognition', description: 'Celebrate successes openly and enthusiastically' },
        { value: 5, label: 'Big celebrations', description: 'Create memorable events and share success stories widely' }
      ]
    },
    {
      id: 'inf_7',
      text: 'When building team culture, what do you emphasize most?',
      type: 'multiple_choice',
      area: 'Influential Leadership',
      options: [
        { value: 1, label: 'Quality standards', description: 'Focus on excellence, accuracy, and continuous improvement' },
        { value: 2, label: 'Team harmony', description: 'Emphasize cooperation, stability, and mutual support' },
        { value: 3, label: 'Performance results', description: 'Prioritize achievement, efficiency, and goal attainment' },
        { value: 4, label: 'Positive energy', description: 'Create enthusiasm, optimism, and team spirit' },
        { value: 5, label: 'Shared vision', description: 'Build excitement around common goals and possibilities' }
      ]
    },

    // Steady Leadership Questions (7 questions)
    {
      id: 'ste_1',
      text: 'How do you approach building relationships with team members?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Professional boundaries', description: 'Maintain clear professional relationships focused on work' },
        { value: 2, label: 'Gradual trust building', description: 'Slowly develop trust through consistent, reliable interactions' },
        { value: 3, label: 'Goal-oriented connection', description: 'Build relationships that support achieving objectives' },
        { value: 4, label: 'Personal interest', description: 'Show genuine interest in team members as individuals' },
        { value: 5, label: 'Deep personal bonds', description: 'Invest heavily in knowing and caring for each person' }
      ]
    },
    {
      id: 'ste_2',
      text: 'When team members are struggling, what\'s your typical response?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Provide resources', description: 'Offer tools, training, or information to help them improve' },
        { value: 2, label: 'Patient support', description: 'Give them time and steady encouragement to work through it' },
        { value: 3, label: 'Direct intervention', description: 'Step in quickly to address the issue and get back on track' },
        { value: 4, label: 'Emotional support', description: 'Focus on their feelings and provide encouragement' },
        { value: 5, label: 'Comprehensive care', description: 'Address both professional and personal factors affecting them' }
      ]
    },
    {
      id: 'ste_3',
      text: 'How do you handle team members who need extra guidance?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Systematic training', description: 'Provide structured learning programs and clear procedures' },
        { value: 2, label: 'Patient mentoring', description: 'Work with them consistently over time at their pace' },
        { value: 3, label: 'Clear expectations', description: 'Set specific goals and monitor progress closely' },
        { value: 4, label: 'Encouraging coaching', description: 'Build their confidence while providing guidance' },
        { value: 5, label: 'Nurturing development', description: 'Invest deeply in their growth and potential' }
      ]
    },
    {
      id: 'ste_4',
      text: 'What\'s your approach to team decision-making?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Data-driven analysis', description: 'Base decisions on thorough research and facts' },
        { value: 2, label: 'Consensus building', description: 'Ensure everyone feels heard and agrees with the direction' },
        { value: 3, label: 'Efficient decisions', description: 'Make decisions quickly based on available information' },
        { value: 4, label: 'Collaborative input', description: 'Gather perspectives and build team buy-in' },
        { value: 5, label: 'Inclusive process', description: 'Ensure every voice is heard and valued in decisions' }
      ]
    },
    {
      id: 'ste_5',
      text: 'How do you maintain team morale during difficult periods?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Focus on facts', description: 'Provide clear information and logical perspective' },
        { value: 2, label: 'Steady reassurance', description: 'Offer consistent support and remind them of stability' },
        { value: 3, label: 'Drive forward', description: 'Keep the team focused on goals and moving ahead' },
        { value: 4, label: 'Positive outlook', description: 'Maintain optimism and help them see opportunities' },
        { value: 5, label: 'Emotional support', description: 'Provide deep care and understanding for their struggles' }
      ]
    },
    {
      id: 'ste_6',
      text: 'When giving feedback, what\'s your typical style?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Detailed and specific', description: 'Provide comprehensive, fact-based feedback' },
        { value: 2, label: 'Gentle and supportive', description: 'Deliver feedback kindly with encouragement' },
        { value: 3, label: 'Direct and clear', description: 'Give straightforward feedback focused on results' },
        { value: 4, label: 'Encouraging and positive', description: 'Frame feedback in an uplifting, motivational way' },
        { value: 5, label: 'Caring and personal', description: 'Consider their feelings deeply and provide nurturing guidance' }
      ]
    },
    {
      id: 'ste_7',
      text: 'How do you handle changes that affect your team?',
      type: 'multiple_choice',
      area: 'Steady Leadership',
      options: [
        { value: 1, label: 'Thorough preparation', description: 'Research all aspects and prepare detailed implementation plans' },
        { value: 2, label: 'Gradual transition', description: 'Implement changes slowly with lots of support and communication' },
        { value: 3, label: 'Swift implementation', description: 'Move quickly to implement changes and adapt as needed' },
        { value: 4, label: 'Positive framing', description: 'Help team see benefits and maintain enthusiasm' },
        { value: 5, label: 'Comprehensive support', description: 'Provide extensive emotional and practical support throughout' }
      ]
    },

    // Conscientious Leadership Questions (7 questions)
    {
      id: 'con_1',
      text: 'How do you approach planning and organizing team work?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Flexible adaptation', description: 'Keep plans loose and adapt as situations change' },
        { value: 2, label: 'Collaborative planning', description: 'Work with team to create plans everyone supports' },
        { value: 3, label: 'Results-focused planning', description: 'Plan efficiently to achieve goals quickly' },
        { value: 4, label: 'Structured organization', description: 'Create clear systems and organized approaches' },
        { value: 5, label: 'Detailed systematization', description: 'Develop comprehensive, thorough planning systems' }
      ]
    },
    {
      id: 'con_2',
      text: 'How do you ensure quality in your team\'s work?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Trust and flexibility', description: 'Trust team members to maintain their own quality standards' },
        { value: 2, label: 'Supportive guidance', description: 'Provide gentle reminders and encouragement for quality' },
        { value: 3, label: 'Results monitoring', description: 'Focus on end results and address quality issues as they arise' },
        { value: 4, label: 'Regular quality checks', description: 'Implement systematic quality review processes' },
        { value: 5, label: 'Detailed standards', description: 'Establish comprehensive quality standards and procedures' }
      ]
    },
    {
      id: 'con_3',
      text: 'When problems arise, how do you investigate and solve them?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Quick solutions', description: 'Address problems quickly and move forward' },
        { value: 2, label: 'Team collaboration', description: 'Work with team to understand and solve problems together' },
        { value: 3, label: 'Direct action', description: 'Take immediate action to resolve issues efficiently' },
        { value: 4, label: 'Systematic analysis', description: 'Gather information and analyze problems methodically' },
        { value: 5, label: 'Thorough investigation', description: 'Conduct comprehensive analysis to understand root causes' }
      ]
    },
    {
      id: 'con_4',
      text: 'How do you handle documentation and record-keeping?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Minimal documentation', description: 'Keep only essential records and focus on action' },
        { value: 2, label: 'Basic record-keeping', description: 'Maintain necessary documentation with team input' },
        { value: 3, label: 'Results-focused records', description: 'Document key outcomes and performance metrics' },
        { value: 4, label: 'Organized documentation', description: 'Maintain systematic, well-organized records' },
        { value: 5, label: 'Comprehensive records', description: 'Keep detailed, thorough documentation of all activities' }
      ]
    },
    {
      id: 'con_5',
      text: 'How do you approach training and development for your team?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Learning by doing', description: 'Let team members learn through experience and practice' },
        { value: 2, label: 'Supportive learning', description: 'Provide patient, encouraging learning environments' },
        { value: 3, label: 'Goal-oriented training', description: 'Focus training on achieving specific performance targets' },
        { value: 4, label: 'Structured programs', description: 'Develop organized, systematic training approaches' },
        { value: 5, label: 'Comprehensive development', description: 'Create detailed, thorough development programs' }
      ]
    },
    {
      id: 'con_6',
      text: 'When setting standards and procedures, what\'s your approach?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Flexible guidelines', description: 'Provide general direction and let team adapt as needed' },
        { value: 2, label: 'Collaborative standards', description: 'Work with team to establish mutually agreed standards' },
        { value: 3, label: 'Performance-based standards', description: 'Set standards that focus on achieving results' },
        { value: 4, label: 'Clear procedures', description: 'Establish well-defined, systematic procedures' },
        { value: 5, label: 'Detailed protocols', description: 'Create comprehensive, thorough procedural documentation' }
      ]
    },
    {
      id: 'con_7',
      text: 'How do you monitor and evaluate team performance?',
      type: 'multiple_choice',
      area: 'Conscientious Leadership',
      options: [
        { value: 1, label: 'Informal observation', description: 'Monitor performance through casual observation and feedback' },
        { value: 2, label: 'Regular check-ins', description: 'Have consistent, supportive conversations about performance' },
        { value: 3, label: 'Results tracking', description: 'Focus on measuring and tracking key performance outcomes' },
        { value: 4, label: 'Systematic evaluation', description: 'Use organized, consistent performance evaluation methods' },
        { value: 5, label: 'Comprehensive assessment', description: 'Conduct thorough, detailed performance analysis and documentation' }
      ]
    },

    // Situational Adaptation Questions (4 questions)
    {
      id: 'sit_1',
      text: 'How well do you adjust your leadership style based on the situation?',
      type: 'multiple_choice',
      area: 'Situational Adaptation',
      options: [
        { value: 1, label: 'Rarely adjust', description: 'Use the same leadership approach in most situations' },
        { value: 2, label: 'Sometimes adjust', description: 'Occasionally modify approach when clearly necessary' },
        { value: 3, label: 'Regularly adjust', description: 'Often adapt leadership style based on circumstances' },
        { value: 4, label: 'Frequently adjust', description: 'Consistently modify approach to match situations' },
        { value: 5, label: 'Always adapt', description: 'Seamlessly adjust leadership style for optimal effectiveness' }
      ]
    },
    {
      id: 'sit_2',
      text: 'When working with a new team member, how do you adapt your leadership?',
      type: 'multiple_choice',
      area: 'Situational Adaptation',
      options: [
        { value: 1, label: 'Standard approach', description: 'Use your normal leadership style regardless of experience' },
        { value: 2, label: 'Slight modifications', description: 'Make minor adjustments to your usual approach' },
        { value: 3, label: 'Moderate adaptation', description: 'Adjust your style somewhat based on their needs' },
        { value: 4, label: 'Significant adaptation', description: 'Substantially modify your approach for new team members' },
        { value: 5, label: 'Complete customization', description: 'Fully tailor your leadership to their experience and learning style' }
      ]
    },
    {
      id: 'sit_3',
      text: 'How do you modify your communication style for different team members?',
      type: 'multiple_choice',
      area: 'Situational Adaptation',
      options: [
        { value: 1, label: 'Consistent style', description: 'Communicate the same way with everyone' },
        { value: 2, label: 'Minor adjustments', description: 'Make small changes based on obvious differences' },
        { value: 3, label: 'Moderate adaptation', description: 'Adjust communication style for different personalities' },
        { value: 4, label: 'Significant customization', description: 'Substantially modify communication for each person' },
        { value: 5, label: 'Complete personalization', description: 'Fully customize communication style for maximum effectiveness' }
      ]
    },
    {
      id: 'sit_4',
      text: 'When facing different types of challenges, how do you vary your leadership approach?',
      type: 'multiple_choice',
      area: 'Situational Adaptation',
      options: [
        { value: 1, label: 'Same approach', description: 'Handle all challenges with your standard leadership style' },
        { value: 2, label: 'Slight variations', description: 'Make minor adjustments for obviously different challenges' },
        { value: 3, label: 'Moderate flexibility', description: 'Adapt approach based on the type of challenge' },
        { value: 4, label: 'High flexibility', description: 'Significantly modify leadership based on challenge characteristics' },
        { value: 5, label: 'Complete adaptability', description: 'Fully customize leadership approach for each unique challenge' }
      ]
    },

    // Team Dynamics Understanding Questions (4 questions)
    {
      id: 'team_1',
      text: 'How well do you understand the different personality types on your team?',
      type: 'multiple_choice',
      area: 'Team Dynamics Understanding',
      options: [
        { value: 1, label: 'Basic awareness', description: 'Notice obvious personality differences but don\'t analyze deeply' },
        { value: 2, label: 'General understanding', description: 'Have a general sense of different personality types' },
        { value: 3, label: 'Good insight', description: 'Understand most team members\' personality preferences' },
        { value: 4, label: 'Strong understanding', description: 'Have detailed insight into each team member\'s personality' },
        { value: 5, label: 'Expert insight', description: 'Deeply understand personality types and their implications for leadership' }
      ]
    },
    {
      id: 'team_2',
      text: 'How effectively do you manage conflicts between different personality types?',
      type: 'multiple_choice',
      area: 'Team Dynamics Understanding',
      options: [
        { value: 1, label: 'Basic intervention', description: 'Address conflicts when they become obvious problems' },
        { value: 2, label: 'Standard mediation', description: 'Use general conflict resolution approaches' },
        { value: 3, label: 'Personality-aware resolution', description: 'Consider personality differences in conflict resolution' },
        { value: 4, label: 'Tailored intervention', description: 'Customize conflict resolution based on personality types involved' },
        { value: 5, label: 'Expert mediation', description: 'Expertly navigate conflicts using deep personality understanding' }
      ]
    },
    {
      id: 'team_3',
      text: 'How do you leverage different personality strengths on your team?',
      type: 'multiple_choice',
      area: 'Team Dynamics Understanding',
      options: [
        { value: 1, label: 'Standard assignments', description: 'Assign tasks based on availability and basic skills' },
        { value: 2, label: 'Skill-based assignments', description: 'Consider individual skills and preferences' },
        { value: 3, label: 'Personality-aware assignments', description: 'Factor in personality strengths when assigning work' },
        { value: 4, label: 'Strategic personality use', description: 'Strategically leverage personality strengths for team success' },
        { value: 5, label: 'Expert optimization', description: 'Expertly optimize team performance using personality insights' }
      ]
    },
    {
      id: 'team_4',
      text: 'How well do you help team members understand and work with each other\'s differences?',
      type: 'multiple_choice',
      area: 'Team Dynamics Understanding',
      options: [
        { value: 1, label: 'Minimal guidance', description: 'Let team members figure out how to work together' },
        { value: 2, label: 'Basic facilitation', description: 'Provide general guidance on working together' },
        { value: 3, label: 'Personality education', description: 'Help team understand basic personality differences' },
        { value: 4, label: 'Active facilitation', description: 'Actively help team members appreciate and leverage differences' },
        { value: 5, label: 'Expert development', description: 'Expertly develop team understanding and appreciation of personality diversity' }
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
      createCoachingPerformanceAssessment(),
      createLeadershipStyleAdaptationAssessment()
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
