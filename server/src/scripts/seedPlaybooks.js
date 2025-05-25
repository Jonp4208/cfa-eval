import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Playbook from '../models/Playbook.js';
import User from '../models/User.js';
import Store from '../models/Store.js';

dotenv.config();

const facilitiesDirectorPlaybook = {
  title: "Director of Facilities Playbook",
  subtitle: "How to Identify Priorities & Create SMART Goals",
  description: "A comprehensive guide for facilities directors on prioritizing tasks and creating effective SMART goals for restaurant operations.",
  category: "Leadership",
  targetRole: "Director",
  isPublished: true,
  tags: ["facilities", "priorities", "smart-goals", "leadership"],
  contentBlocks: [
    {
      type: "header",
      order: 1,
      content: {
        title: "Director of Facilities Playbook",
        subtitle: "How to Identify Priorities & Create SMART Goals"
      }
    },
    {
      type: "step-section",
      order: 2,
      content: {
        stepNumber: 1,
        title: "Identify Your Priorities Using the Priority Matrix",
        description: "Every week, categorize your facility issues into these four boxes:"
      }
    },
    {
      type: "priority-matrix",
      order: 3,
      content: {
        title: "Priority Matrix",
        quadrants: {
          urgentImportant: {
            title: "URGENT + IMPORTANT",
            subtitle: "DO FIRST",
            description: "Health/safety issues, customer complaints, equipment failures affecting operations"
          },
          importantNotUrgent: {
            title: "IMPORTANT + NOT URGENT",
            subtitle: "SCHEDULE",
            description: "Preventive maintenance, training, system improvements"
          },
          urgentNotImportant: {
            title: "URGENT + NOT IMPORTANT",
            subtitle: "DELEGATE",
            description: "Routine cleaning, minor repairs, supply orders"
          },
          notUrgentNotImportant: {
            title: "NOT URGENT + NOT IMPORTANT",
            subtitle: "ELIMINATE",
            description: "Busy work, unnecessary meetings, over-organizing"
          }
        }
      }
    },
    {
      type: "example-box",
      order: 4,
      content: {
        title: "🔍 Examples for Facilities:",
        description: "URGENT + IMPORTANT: Flies in dining area, broken AC in summer, health department violation\n\nIMPORTANT + NOT URGENT: Monthly pest control, equipment maintenance schedule, staff training\n\nURGENT + NOT IMPORTANT: Light bulb replacement, restocking supplies, minor cosmetic repairs\n\nNOT URGENT + NOT IMPORTANT: Reorganizing storage room, excessive paperwork, non-essential meetings"
      }
    },
    {
      type: "step-section",
      order: 5,
      content: {
        stepNumber: 2,
        title: "Turn Top Priorities into SMART Goals",
        description: "Take your \"URGENT + IMPORTANT\" and \"IMPORTANT + NOT URGENT\" items and make them SMART goals:"
      }
    },
    {
      type: "smart-template",
      order: 6,
      content: {
        title: "📝 SMART Goal Template",
        items: [
          {
            label: "S - Specific",
            prompt: "What exactly needs to be accomplished? Be precise."
          },
          {
            label: "M - Measurable",
            prompt: "How will you know when it's complete? What can you count or observe?"
          },
          {
            label: "A - Achievable",
            prompt: "Can this realistically be done with available resources?"
          },
          {
            label: "R - Relevant",
            prompt: "Why does this matter to the restaurant's success?"
          },
          {
            label: "T - Time-bound",
            prompt: "When will this be completed? Set a specific deadline."
          }
        ]
      }
    },
    {
      type: "step-section",
      order: 7,
      content: {
        stepNumber: 3,
        title: "Weekly Priority Assessment Process",
        description: "Follow this systematic approach every week:"
      }
    },
    {
      type: "checklist",
      order: 8,
      content: {
        title: "📅 Every Monday Morning (15 minutes):",
        items: [
          "Walk the entire facility - what do you see that needs attention?",
          "Review customer complaints from last week - any facility-related issues?",
          "Check equipment status - anything breaking down or needing service?",
          "Ask team members - what problems are they seeing?",
          "Review upcoming schedules - pest control, maintenance, inspections due?"
        ]
      }
    },
    {
      type: "checklist",
      order: 9,
      content: {
        title: "📊 Then Categorize Each Issue:",
        items: [
          "Write each issue on the priority matrix",
          "Focus on \"Urgent + Important\" first",
          "Schedule \"Important + Not Urgent\" items",
          "Delegate \"Urgent + Not Important\" to team",
          "Eliminate or ignore \"Not Urgent + Not Important\""
        ]
      }
    },
    {
      type: "warning-box",
      order: 10,
      content: {
        title: "⚠️ Common Mistakes to Avoid",
        description: "• Setting too many goals: Focus on 3-5 goals maximum at one time\n• Making goals too big: Break large projects into smaller 30-90 day goals\n• No clear deadline: \"Soon\" or \"ASAP\" are not deadlines\n• Can't measure success: If you can't count it or see it, rewrite the goal\n• Doing instead of managing: Your goals should be about creating systems, not doing tasks"
      }
    },
    {
      type: "success-box",
      order: 11,
      content: {
        title: "✅ Success Formula",
        description: "Weekly: Assess priorities using the matrix\nMonthly: Create 3-5 SMART goals from top priorities\nDaily: Work on goal activities, not random tasks\nRemember: You manage the work, you don't do all the work"
      }
    },
    {
      type: "practice-section",
      order: 12,
      content: {
        title: "🎯 Practice Exercise",
        description: "Right now, identify 3 facility issues and turn them into SMART goals:",
        exercises: [
          {
            title: "Issue #1",
            fields: [
              { label: "Specific", placeholder: "What exactly needs to be accomplished?" },
              { label: "Measurable", placeholder: "How will you measure success?" },
              { label: "Achievable", placeholder: "Is this realistic?" },
              { label: "Relevant", placeholder: "Why does this matter?" },
              { label: "Time-bound", placeholder: "When will this be completed?" }
            ]
          },
          {
            title: "Issue #2",
            fields: [
              { label: "Specific", placeholder: "What exactly needs to be accomplished?" },
              { label: "Measurable", placeholder: "How will you measure success?" },
              { label: "Achievable", placeholder: "Is this realistic?" },
              { label: "Relevant", placeholder: "Why does this matter?" },
              { label: "Time-bound", placeholder: "When will this be completed?" }
            ]
          },
          {
            title: "Issue #3",
            fields: [
              { label: "Specific", placeholder: "What exactly needs to be accomplished?" },
              { label: "Measurable", placeholder: "How will you measure success?" },
              { label: "Achievable", placeholder: "Is this realistic?" },
              { label: "Relevant", placeholder: "Why does this matter?" },
              { label: "Time-bound", placeholder: "When will this be completed?" }
            ]
          }
        ]
      }
    }
  ]
};

async function seedPlaybooks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a store and user to associate with the playbook
    const store = await Store.findOne();
    const user = await User.findOne({ position: 'Director' });

    if (!store) {
      console.error('No store found. Please create a store first.');
      return;
    }

    if (!user) {
      console.error('No director user found. Please create a director user first.');
      return;
    }

    // Check if playbook already exists
    const existingPlaybook = await Playbook.findOne({
      title: facilitiesDirectorPlaybook.title,
      store: store._id
    });

    if (existingPlaybook) {
      console.log('Facilities Director Playbook already exists');
      return;
    }

    // Create the playbook
    const playbook = new Playbook({
      ...facilitiesDirectorPlaybook,
      store: store._id,
      createdBy: user._id
    });

    await playbook.save();
    console.log('Facilities Director Playbook created successfully');

  } catch (error) {
    console.error('Error seeding playbooks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlaybooks();
}

export default seedPlaybooks;
