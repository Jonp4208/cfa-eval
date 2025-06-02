import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CommunityPlan from '../src/models/CommunityPlan.js';
import Store from '../src/models/Store.js';
import User from '../src/models/User.js';

dotenv.config();

const sampleCommunityPlans = [
  {
    name: "New Team Member Onboarding",
    description: "Comprehensive 5-day onboarding program for new team members covering CFA basics, customer service excellence, and food safety fundamentals.",
    department: "FOH",
    position: "Team Member",
    type: "New Hire",
    difficulty: "Beginner",
    duration: "3 days",
    days: [
      {
        dayNumber: 1,
        tasks: [
          {
            name: "CFA History & Values",
            description: "Learn about Chick-fil-A's history, mission, and core values",
            duration: 60
          },
          {
            name: "Uniform & Appearance Standards",
            description: "Review dress code and professional appearance expectations",
            duration: 30
          },
          {
            name: "Basic Food Safety",
            description: "Introduction to food safety protocols and handwashing procedures",
            duration: 45
          }
        ]
      },
      {
        dayNumber: 2,
        tasks: [
          {
            name: "Customer Service Excellence",
            description: "Learn the CFA way of serving customers with excellence",
            duration: 90
          },
          {
            name: "POS System Basics",
            description: "Introduction to the point-of-sale system",
            duration: 60
          }
        ]
      },
      {
        dayNumber: 3,
        tasks: [
          {
            name: "Menu Knowledge",
            description: "Learn about all menu items, ingredients, and allergens",
            duration: 120
          },
          {
            name: "Upselling Techniques",
            description: "Learn how to suggest additional items to enhance customer experience",
            duration: 45
          }
        ]
      }
    ],
    tags: ["onboarding", "customer-service", "food-safety"],
    // These will be set when we have actual store and user data
    store: null,
    author: null,
    likes: [],
    downloads: [],
    ratings: [
      { rating: 5, review: "Excellent comprehensive program!" },
      { rating: 4, review: "Very thorough and well-structured" },
      { rating: 5, review: "Perfect for new hires" }
    ]
  },
  {
    name: "Kitchen Excellence Training",
    description: "Advanced training program for back-of-house team members focusing on food preparation, quality standards, and efficiency.",
    department: "BOH",
    position: "Team Member",
    type: "Regular",
    difficulty: "Intermediate",
    duration: "2 days",
    days: [
      {
        dayNumber: 1,
        tasks: [
          {
            name: "Food Preparation Standards",
            description: "Master the CFA standards for food preparation and presentation",
            duration: 120
          },
          {
            name: "Equipment Operation",
            description: "Learn proper operation of all kitchen equipment",
            duration: 90
          }
        ]
      },
      {
        dayNumber: 2,
        tasks: [
          {
            name: "Quality Control",
            description: "Understand quality standards and inspection procedures",
            duration: 75
          },
          {
            name: "Efficiency Techniques",
            description: "Learn time-saving techniques while maintaining quality",
            duration: 60
          }
        ]
      }
    ],
    tags: ["kitchen", "food-prep", "quality", "efficiency"],
    store: null,
    author: null,
    likes: [],
    downloads: [],
    ratings: [
      { rating: 4, review: "Great for improving kitchen skills" },
      { rating: 5, review: "Helped our team become more efficient" }
    ]
  },
  {
    name: "Leadership Development Fundamentals",
    description: "Essential leadership training for team leaders and shift leaders, covering team management, conflict resolution, and performance coaching.",
    department: "Management",
    position: "Team Leader",
    type: "Leadership",
    difficulty: "Advanced",
    duration: "3 days",
    days: [
      {
        dayNumber: 1,
        tasks: [
          {
            name: "Leadership Principles",
            description: "Core principles of effective leadership in a CFA environment",
            duration: 90
          },
          {
            name: "Team Communication",
            description: "Effective communication strategies for leading teams",
            duration: 75
          }
        ]
      },
      {
        dayNumber: 2,
        tasks: [
          {
            name: "Conflict Resolution",
            description: "Techniques for resolving conflicts and maintaining team harmony",
            duration: 60
          },
          {
            name: "Performance Coaching",
            description: "How to coach team members for improved performance",
            duration: 90
          }
        ]
      },
      {
        dayNumber: 3,
        tasks: [
          {
            name: "Delegation & Accountability",
            description: "Learn to delegate effectively while maintaining accountability",
            duration: 75
          }
        ]
      }
    ],
    tags: ["leadership", "management", "coaching", "communication"],
    store: null,
    author: null,
    likes: [],
    downloads: [],
    ratings: [
      { rating: 5, review: "Transformed our leadership approach" },
      { rating: 4, review: "Very practical and applicable" },
      { rating: 5, review: "Essential for any leader" }
    ]
  }
];

async function clearFakeCommunityPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cfa-eval');
    console.log('Connected to MongoDB');

    // Clear existing fake community plans
    await CommunityPlan.deleteMany({});
    console.log('Cleared all community plans (including fake ones)');

    console.log('Fake community plans removed successfully!');

  } catch (error) {
    console.error('Error seeding community plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the clearing function
clearFakeCommunityPlans();
