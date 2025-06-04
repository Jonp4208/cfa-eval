import { getModel } from '../models/modelRegistry.js';

/**
 * Sets up default grading scale and evaluation templates for a new store
 * @param {string} storeId - The store ID
 * @param {string} adminUserId - The admin user ID who will be the creator
 * @returns {Promise<Object>} - Result object with created items
 */
export async function setupNewStoreDefaults(storeId, adminUserId) {
  try {
    const GradingScale = getModel('GradingScale');
    const Template = getModel('Template');
    
    const results = {
      gradingScale: null,
      templates: [],
      errors: []
    };

    // 1. Create default grading scale
    try {
      const defaultScale = new GradingScale({
        name: 'Standard 5-Point Scale',
        description: 'Default evaluation scale from Poor to Excellent',
        store: storeId,
        createdBy: adminUserId,
        isDefault: true,
        grades: [
          { value: 1, label: 'Poor', description: 'Significant improvement needed', color: '#dc2626' },
          { value: 2, label: 'Fair', description: 'Below expectations', color: '#f97316' },
          { value: 3, label: 'Good', description: 'Meets expectations', color: '#eab308' },
          { value: 4, label: 'Very Good', description: 'Exceeds expectations', color: '#22c55e' },
          { value: 5, label: 'Excellent', description: 'Outstanding performance', color: '#15803d' }
        ]
      });

      await defaultScale.save();
      results.gradingScale = defaultScale;
      console.log(`✅ Created default grading scale for store ${storeId}`);
    } catch (error) {
      console.error(`❌ Error creating grading scale for store ${storeId}:`, error);
      results.errors.push(`Grading scale: ${error.message}`);
    }

    // 2. Create evaluation templates (only if grading scale was created successfully)
    if (results.gradingScale) {
      const createCriterion = (name, description) => ({
        name,
        description,
        gradingScale: results.gradingScale._id,
        required: true
      });

      // Template 1: Team Member Performance Evaluation
      try {
        const teamMemberTemplate = new Template({
          name: 'Team Member Performance Evaluation',
          description: 'Comprehensive performance evaluation for team members focusing on core competencies and job performance',
          store: storeId,
          createdBy: adminUserId,
          tags: ['General'],
          position: 'Team Member',
          isActive: true,
          sections: [
            {
              title: 'Customer Service Excellence',
              description: 'Ability to provide exceptional customer service and create positive experiences',
              order: 0,
              criteria: [
                createCriterion('Customer Interaction', 'Greets customers warmly, maintains eye contact, and shows genuine care'),
                createCriterion('Problem Resolution', 'Effectively handles customer concerns and finds appropriate solutions'),
                createCriterion('Product Knowledge', 'Demonstrates thorough knowledge of menu items and can make recommendations')
              ]
            },
            {
              title: 'Work Quality & Efficiency',
              description: 'Consistency and quality of work performance',
              order: 1,
              criteria: [
                createCriterion('Accuracy', 'Completes tasks correctly with minimal errors'),
                createCriterion('Speed & Efficiency', 'Works at appropriate pace to meet service standards'),
                createCriterion('Attention to Detail', 'Pays close attention to details in all aspects of work')
              ]
            },
            {
              title: 'Teamwork & Communication',
              description: 'Ability to work effectively with others and communicate clearly',
              order: 2,
              criteria: [
                createCriterion('Team Collaboration', 'Works well with team members and supports others when needed'),
                createCriterion('Communication Skills', 'Communicates clearly and professionally with team and customers'),
                createCriterion('Conflict Resolution', 'Handles disagreements professionally and seeks positive solutions')
              ]
            },
            {
              title: 'Professional Development',
              description: 'Growth mindset and commitment to continuous improvement',
              order: 3,
              criteria: [
                createCriterion('Learning Attitude', 'Shows willingness to learn new skills and accept feedback'),
                createCriterion('Initiative', 'Takes initiative to improve processes and help the team'),
                createCriterion('Reliability', 'Consistently shows up on time and follows through on commitments')
              ]
            }
          ]
        });

        await teamMemberTemplate.save();
        results.templates.push(teamMemberTemplate);
        console.log(`✅ Created Team Member Performance Evaluation for store ${storeId}`);
      } catch (error) {
        console.error(`❌ Error creating Team Member template for store ${storeId}:`, error);
        results.errors.push(`Team Member template: ${error.message}`);
      }

      // Template 2: Leadership Development Evaluation
      try {
        const leadershipTemplate = new Template({
          name: 'Leadership Development Evaluation',
          description: 'Comprehensive leadership evaluation focusing on core leadership competencies and development areas',
          store: storeId,
          createdBy: adminUserId,
          tags: ['Leadership'],
          position: 'Leader',
          isActive: true,
          sections: [
            {
              title: 'Vision & Strategic Thinking',
              description: 'Ability to set direction and think strategically about the business',
              order: 0,
              criteria: [
                createCriterion('Vision Communication', 'Clearly communicates vision and strategic direction to the team'),
                createCriterion('Strategic Planning', 'Develops and implements effective strategies to achieve goals'),
                createCriterion('Innovation', 'Encourages creative thinking and implements new ideas')
              ]
            },
            {
              title: 'Team Leadership & Development',
              description: 'Effectiveness in leading, developing, and inspiring team members',
              order: 1,
              criteria: [
                createCriterion('Team Motivation', 'Inspires and motivates team members to achieve their best'),
                createCriterion('Coaching & Mentoring', 'Provides effective coaching and development opportunities'),
                createCriterion('Performance Management', 'Sets clear expectations and provides constructive feedback')
              ]
            },
            {
              title: 'Decision Making & Problem Solving',
              description: 'Quality of decisions and approach to solving complex problems',
              order: 2,
              criteria: [
                createCriterion('Decision Quality', 'Makes well-informed, timely decisions that benefit the business'),
                createCriterion('Problem Solving', 'Effectively identifies and resolves complex operational challenges'),
                createCriterion('Risk Management', 'Appropriately assesses and manages risks in decision making')
              ]
            },
            {
              title: 'Communication & Influence',
              description: 'Effectiveness in communication and ability to influence others',
              order: 3,
              criteria: [
                createCriterion('Communication Clarity', 'Communicates clearly and effectively across all levels'),
                createCriterion('Active Listening', 'Demonstrates strong listening skills and considers input from others'),
                createCriterion('Influence & Persuasion', 'Effectively influences others to achieve positive outcomes')
              ]
            }
          ]
        });

        await leadershipTemplate.save();
        results.templates.push(leadershipTemplate);
        console.log(`✅ Created Leadership Development Evaluation for store ${storeId}`);
      } catch (error) {
        console.error(`❌ Error creating Leadership template for store ${storeId}:`, error);
        results.errors.push(`Leadership template: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    console.error(`❌ Error setting up defaults for store ${storeId}:`, error);
    throw error;
  }
}
