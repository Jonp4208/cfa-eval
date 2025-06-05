import api from '@/lib/axios';

export interface ContentBlock {
  type: 'header' | 'text' | 'step-section' | 'priority-matrix' | 'smart-template' | 'checklist' | 'example-box' | 'warning-box' | 'success-box' | 'practice-section' | 'leadership-examples';
  order: number;
  content: any;
}

export interface Playbook {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  store: string;
  category: 'Leadership' | 'Operations' | 'Training' | 'Safety' | 'Customer Service' | 'General';
  targetRole: 'Team Member' | 'Trainer' | 'Leader' | 'Director' | 'All';
  contentBlocks: ContentBlock[];
  isPublished: boolean;
  isTemplate?: boolean;
  templateName?: string;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  lastViewedBy?: Array<{
    user: string;
    viewedAt: Date;
  }>;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlaybookData {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  targetRole?: string;
  contentBlocks?: ContentBlock[];
  isPublished?: boolean;
  tags?: string[];
}

export interface UpdatePlaybookData extends Partial<CreatePlaybookData> {}

class PlaybookService {
  // Get all playbooks
  async getPlaybooks(filters?: {
    category?: string;
    targetRole?: string;
    published?: boolean;
  }): Promise<Playbook[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.targetRole) params.append('targetRole', filters.targetRole);
    if (filters?.published !== undefined) params.append('published', filters.published.toString());

    const response = await api.get(`/api/leadership/playbooks?${params.toString()}`);
    return response.data;
  }

  // Get a specific playbook
  async getPlaybook(id: string): Promise<Playbook> {
    const response = await api.get(`/api/leadership/playbooks/${id}`);
    return response.data;
  }

  // Create a new playbook
  async createPlaybook(data: CreatePlaybookData): Promise<Playbook> {
    const response = await api.post('/api/leadership/playbooks', data);
    return response.data;
  }

  // Update a playbook
  async updatePlaybook(id: string, data: UpdatePlaybookData): Promise<Playbook> {
    const response = await api.put(`/api/leadership/playbooks/${id}`, data);
    return response.data;
  }

  // Delete a playbook
  async deletePlaybook(id: string): Promise<void> {
    await api.delete(`/api/leadership/playbooks/${id}`);
  }

  // Duplicate a playbook
  async duplicatePlaybook(id: string): Promise<Playbook> {
    const response = await api.post(`/api/leadership/playbooks/${id}/duplicate`);
    return response.data;
  }

  // Get predefined content block templates
  getContentBlockTemplates() {
    return {
      'step-section': {
        type: 'step-section',
        content: {
          stepNumber: 1,
          title: 'Step Title',
          description: 'Step description goes here...'
        }
      },
      'priority-matrix': {
        type: 'priority-matrix',
        content: {
          title: 'Priority Matrix',
          quadrants: {
            urgentImportant: {
              title: 'URGENT + IMPORTANT',
              subtitle: 'DO FIRST',
              description: 'Critical issues that need immediate attention'
            },
            importantNotUrgent: {
              title: 'IMPORTANT + NOT URGENT',
              subtitle: 'SCHEDULE',
              description: 'Important tasks that can be planned'
            },
            urgentNotImportant: {
              title: 'URGENT + NOT IMPORTANT',
              subtitle: 'DELEGATE',
              description: 'Tasks that can be delegated to others'
            },
            notUrgentNotImportant: {
              title: 'NOT URGENT + NOT IMPORTANT',
              subtitle: 'ELIMINATE',
              description: 'Tasks that should be eliminated'
            }
          }
        }
      },
      'smart-template': {
        type: 'smart-template',
        content: {
          title: 'SMART Goal Template',
          items: [
            {
              label: 'S - Specific',
              prompt: 'What exactly needs to be accomplished? Be precise.'
            },
            {
              label: 'M - Measurable',
              prompt: 'How will you know when it\'s complete? What can you count or observe?'
            },
            {
              label: 'A - Achievable',
              prompt: 'Can this realistically be done with available resources?'
            },
            {
              label: 'R - Relevant',
              prompt: 'Why does this matter to the restaurant\'s success?'
            },
            {
              label: 'T - Time-bound',
              prompt: 'When will this be completed? Set a specific deadline.'
            }
          ]
        }
      },
      'checklist': {
        type: 'checklist',
        content: {
          title: 'Checklist Title',
          items: [
            'First checklist item',
            'Second checklist item',
            'Third checklist item'
          ]
        }
      },
      'example-box': {
        type: 'example-box',
        content: {
          title: 'Example',
          description: 'Example description goes here...'
        }
      },
      'warning-box': {
        type: 'warning-box',
        content: {
          title: 'Important Warning',
          description: 'Warning description goes here...'
        }
      },
      'success-box': {
        type: 'success-box',
        content: {
          title: 'Success Tip',
          description: 'Success tip description goes here...'
        }
      },
      'practice-section': {
        type: 'practice-section',
        content: {
          title: 'Practice Exercise',
          description: 'Practice exercise description goes here...',
          exercises: [
            {
              title: 'Exercise 1',
              fields: [
                { label: 'Specific', placeholder: 'Enter specific details...' },
                { label: 'Measurable', placeholder: 'Enter measurable criteria...' }
              ]
            }
          ]
        }
      }
    };
  }

  // Get playbook templates - Restaurant Business Areas
  getPlaybookTemplates() {
    return [
      {
        id: 'kitchen-operations',
        name: 'Kitchen Operations Excellence',
        description: 'Optimize kitchen efficiency, food safety, and quality standards',
        category: 'Operations',
        targetRole: 'Leader',
        icon: '👨‍🍳',
        businessArea: 'Kitchen',
        estimatedTime: '15 min',
        goals: ['Reduce food waste by 15%', 'Improve kitchen efficiency by 20%'],
        keyMetrics: ['Food Cost %', 'Prep Time', 'Waste Tracking', 'Temperature Compliance']
      },
      {
        id: 'drive-thru-optimization',
        name: 'Drive Thru Speed & Accuracy',
        description: 'Maximize drive thru performance and customer satisfaction',
        category: 'Operations',
        targetRole: 'Leader',
        icon: '🚗',
        businessArea: 'Drive Thru',
        estimatedTime: '12 min',
        goals: ['Achieve 90-second average service time', 'Maintain 98% order accuracy'],
        keyMetrics: ['Service Time', 'Order Accuracy', 'Customer Satisfaction', 'Peak Hour Performance']
      },
      {
        id: 'front-counter-excellence',
        name: 'Front Counter Excellence',
        description: 'Deliver exceptional customer service and operational efficiency',
        category: 'Customer Service',
        targetRole: 'Leader',
        icon: '🏪',
        businessArea: 'Front Counter',
        estimatedTime: '10 min',
        goals: ['Increase customer satisfaction to 95%', 'Reduce wait times to under 3 minutes'],
        keyMetrics: ['Customer Satisfaction', 'Wait Time', 'Upselling Success', 'Order Accuracy']
      },
      {
        id: 'team-leadership',
        name: 'Team Leadership & Development',
        description: 'Build strong teams through effective leadership and coaching',
        category: 'Leadership',
        targetRole: 'Leader',
        icon: '👥',
        businessArea: 'Leadership',
        estimatedTime: '20 min',
        goals: ['Reduce team member turnover by 25%', 'Improve team engagement scores to 85%'],
        keyMetrics: ['Turnover Rate', 'Engagement Score', 'Training Completion', 'Performance Reviews']
      },
      {
        id: 'food-safety-compliance',
        name: 'Food Safety & Compliance',
        description: 'Maintain highest food safety standards and regulatory compliance',
        category: 'Safety',
        targetRole: 'All',
        icon: '🛡️',
        businessArea: 'Food Safety',
        estimatedTime: '18 min',
        goals: ['Achieve 100% food safety audit compliance', 'Reduce food safety incidents to zero'],
        keyMetrics: ['Audit Scores', 'Temperature Logs', 'Incident Reports', 'Training Compliance']
      },
      {
        id: 'training-development',
        name: 'Training & Development Program',
        description: 'Create effective training programs for new and existing team members',
        category: 'Training',
        targetRole: 'Trainer',
        icon: '📚',
        businessArea: 'Training',
        estimatedTime: '25 min',
        goals: ['Reduce new hire training time by 30%', 'Achieve 90% training completion rate'],
        keyMetrics: ['Training Time', 'Completion Rate', 'Knowledge Retention', 'Performance Improvement']
      },
      {
        id: 'cost-management',
        name: 'Cost Management & Profitability',
        description: 'Optimize costs while maintaining quality and service standards',
        category: 'Operations',
        targetRole: 'Director',
        icon: '💰',
        businessArea: 'Financial',
        estimatedTime: '22 min',
        goals: ['Reduce food costs by 3%', 'Improve labor efficiency by 15%'],
        keyMetrics: ['Food Cost %', 'Labor Cost %', 'Waste Reduction', 'Profit Margins']
      },
      {
        id: 'customer-experience',
        name: 'Customer Experience Enhancement',
        description: 'Create memorable customer experiences that drive loyalty',
        category: 'Customer Service',
        targetRole: 'All',
        icon: '⭐',
        businessArea: 'Customer Experience',
        estimatedTime: '16 min',
        goals: ['Increase customer loyalty scores by 20%', 'Achieve 4.8+ star rating'],
        keyMetrics: ['Customer Satisfaction', 'Net Promoter Score', 'Repeat Visits', 'Online Reviews']
      }
    ];
  }

  // Get template content blocks for a specific template
  getTemplateContentBlocks(templateId: string): ContentBlock[] {
    const templates = this.getPlaybookTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return this.getDefaultContentBlocks();
    }

    switch (templateId) {
      case 'kitchen-operations':
        return this.getKitchenOperationsBlocks(template);
      case 'drive-thru-optimization':
        return this.getDriveThruBlocks(template);
      case 'front-counter-excellence':
        return this.getFrontCounterBlocks(template);
      case 'team-leadership':
        return this.getTeamLeadershipBlocks(template);
      case 'food-safety-compliance':
        return this.getFoodSafetyBlocks(template);
      case 'training-development':
        return this.getTrainingDevelopmentBlocks(template);
      case 'cost-management':
        return this.getCostManagementBlocks(template);
      case 'customer-experience':
        return this.getCustomerExperienceBlocks(template);
      case 'facilities-director':
        return [
          {
            type: 'header',
            order: 0,
            content: {
              title: 'Director of Facilities Playbook',
              subtitle: 'How to Identify Priorities & Create SMART Goals'
            }
          },
          {
            type: 'step-section',
            order: 1,
            content: {
              stepNumber: 1,
              title: 'Identify Your Priorities Using the Priority Matrix',
              description: 'Every week, categorize your facility issues into these four boxes:'
            }
          },
          {
            type: 'priority-matrix',
            order: 2,
            content: {
              title: 'Priority Matrix',
              quadrants: [
                {
                  title: 'URGENT + IMPORTANT',
                  action: 'DO FIRST',
                  description: 'Health/safety issues, customer complaints, equipment failures affecting operations',
                  color: 'red'
                },
                {
                  title: 'IMPORTANT + NOT URGENT',
                  action: 'SCHEDULE',
                  description: 'Preventive maintenance, training, system improvements',
                  color: 'blue'
                },
                {
                  title: 'URGENT + NOT IMPORTANT',
                  action: 'DELEGATE',
                  description: 'Routine cleaning, minor repairs, supply orders',
                  color: 'yellow'
                },
                {
                  title: 'NOT URGENT + NOT IMPORTANT',
                  action: 'ELIMINATE',
                  description: 'Busy work, unnecessary meetings, over-organizing',
                  color: 'gray'
                }
              ]
            }
          },
          {
            type: 'example-box',
            order: 3,
            content: {
              title: 'Examples for Facilities',
              type: 'info',
              content: 'URGENT + IMPORTANT: Flies in dining area, broken AC in summer, health department violation\nIMPORTANT + NOT URGENT: Monthly pest control, equipment maintenance schedule, staff training\nURGENT + NOT IMPORTANT: Light bulb replacement, restocking supplies, minor cosmetic repairs\nNOT URGENT + NOT IMPORTANT: Reorganizing storage room, excessive paperwork, non-essential meetings'
            }
          },
          {
            type: 'step-section',
            order: 4,
            content: {
              stepNumber: 2,
              title: 'Turn Top Priorities into SMART Goals',
              description: 'Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:'
            }
          },
          {
            type: 'smart-template',
            order: 5,
            content: {
              title: 'SMART Goal Template',
              items: [
                {
                  label: 'S - Specific',
                  description: 'What exactly needs to be accomplished? Be precise.'
                },
                {
                  label: 'M - Measurable',
                  description: 'How will you know when it\'s complete? What can you count or observe?'
                },
                {
                  label: 'A - Achievable',
                  description: 'Can this realistically be done with available resources?'
                },
                {
                  label: 'R - Relevant',
                  description: 'Why does this matter to the restaurant\'s success?'
                },
                {
                  label: 'T - Time-bound',
                  description: 'When will this be completed? Set a specific deadline.'
                }
              ]
            }
          },
          {
            type: 'success-box',
            order: 6,
            content: {
              title: 'Success Formula',
              items: [
                'Weekly: Assess priorities using the matrix',
                'Monthly: Create 3-5 SMART goals from top priorities',
                'Daily: Work on goal activities, not random tasks',
                'Remember: You manage the work, you don\'t do all the work'
              ]
            }
          }
        ];
      default:
        return this.getDefaultContentBlocks();
    }
  }

  // Default content blocks for blank templates
  getDefaultContentBlocks(): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: 'New Playbook',
          subtitle: 'Enter your subtitle here'
        }
      },
      {
        type: 'step-section',
        order: 1,
        content: {
          stepNumber: 1,
          title: 'Identify Your Priorities Using the Priority Matrix',
          description: 'Every week, categorize your responsibilities and tasks into these four boxes:'
        }
      }
    ];
  }

  // Kitchen Operations template blocks
  getKitchenOperationsBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'step-section',
        order: 1,
        content: {
          stepNumber: 1,
          title: 'Assess Current Kitchen Performance',
          description: 'Evaluate your kitchen operations using these key metrics:'
        }
      },
      {
        type: 'checklist',
        order: 2,
        content: {
          title: 'Kitchen Performance Assessment:',
          items: [
            'Review food cost percentages for the last 3 months',
            'Analyze prep time efficiency and bottlenecks',
            'Check food waste tracking and disposal logs',
            'Evaluate temperature compliance and food safety records',
            'Assess equipment maintenance and downtime issues'
          ]
        }
      },
      {
        type: 'step-section',
        order: 3,
        content: {
          stepNumber: 2,
          title: 'Set SMART Goals for Kitchen Excellence',
          description: 'Create specific, measurable goals to improve kitchen operations:'
        }
      },
      {
        type: 'smart-template',
        order: 4,
        content: {
          title: 'Goal 1: Reduce Food Waste',
          items: [
            {
              label: 'S - Specific',
              description: 'Reduce food waste in kitchen operations by implementing better portion control and inventory management'
            },
            {
              label: 'M - Measurable',
              description: 'Decrease food waste by 15% as measured by weekly waste logs'
            },
            {
              label: 'A - Achievable',
              description: 'Implement portion control training and daily inventory checks with existing staff'
            },
            {
              label: 'R - Relevant',
              description: 'Reducing food waste directly improves profitability and operational efficiency'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 15% reduction within 90 days'
            }
          ]
        }
      },
      {
        type: 'smart-template',
        order: 5,
        content: {
          title: 'Goal 2: Improve Kitchen Efficiency',
          items: [
            {
              label: 'S - Specific',
              description: 'Streamline kitchen prep processes and reduce average prep time per item'
            },
            {
              label: 'M - Measurable',
              description: 'Improve kitchen efficiency by 20% as measured by prep time tracking'
            },
            {
              label: 'A - Achievable',
              description: 'Reorganize prep stations and implement standardized procedures'
            },
            {
              label: 'R - Relevant',
              description: 'Faster prep times improve service speed and reduce labor costs'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 20% improvement within 60 days'
            }
          ]
        }
      },
      {
        type: 'checklist',
        order: 6,
        content: {
          title: 'Weekly Action Items:',
          items: [
            'Monitor daily food waste logs and identify patterns',
            'Conduct prep time studies and identify bottlenecks',
            'Review temperature logs for compliance',
            'Train team on portion control and waste reduction',
            'Evaluate equipment performance and maintenance needs'
          ]
        }
      },
      {
        type: 'success-box',
        order: 7,
        content: {
          title: 'Success Metrics to Track',
          items: [
            'Food Cost Percentage: Target <28%',
            'Prep Time Efficiency: Track minutes per menu item',
            'Waste Percentage: Target <3% of total food cost',
            'Temperature Compliance: Target 100% compliance',
            'Equipment Uptime: Target >95% operational time'
          ]
        }
      }
    ];
  }

  // Drive Thru template blocks
  getDriveThruBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'step-section',
        order: 1,
        content: {
          stepNumber: 1,
          title: 'Analyze Current Drive Thru Performance',
          description: 'Review your drive thru metrics to identify improvement opportunities:'
        }
      },
      {
        type: 'checklist',
        order: 2,
        content: {
          title: 'Performance Analysis Checklist:',
          items: [
            'Review average service times for last 30 days',
            'Analyze order accuracy rates and common errors',
            'Check customer satisfaction scores and feedback',
            'Evaluate peak hour performance and bottlenecks',
            'Assess team member efficiency and training needs'
          ]
        }
      },
      {
        type: 'step-section',
        order: 3,
        content: {
          stepNumber: 2,
          title: 'Set SMART Goals for Drive Thru Excellence',
          description: 'Create specific goals to optimize speed and accuracy:'
        }
      },
      {
        type: 'smart-template',
        order: 4,
        content: {
          title: 'Goal 1: Achieve Target Service Time',
          items: [
            {
              label: 'S - Specific',
              description: 'Reduce average drive thru service time to meet company standards'
            },
            {
              label: 'M - Measurable',
              description: 'Achieve 90-second average service time during peak hours'
            },
            {
              label: 'A - Achievable',
              description: 'Implement order staging and improve communication between stations'
            },
            {
              label: 'R - Relevant',
              description: 'Faster service improves customer satisfaction and increases throughput'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve target within 45 days'
            }
          ]
        }
      },
      {
        type: 'smart-template',
        order: 5,
        content: {
          title: 'Goal 2: Maintain High Order Accuracy',
          items: [
            {
              label: 'S - Specific',
              description: 'Improve order accuracy by reducing errors and implementing verification processes'
            },
            {
              label: 'M - Measurable',
              description: 'Maintain 98% order accuracy rate as measured by customer feedback and remakes'
            },
            {
              label: 'A - Achievable',
              description: 'Implement order confirmation procedures and additional training'
            },
            {
              label: 'R - Relevant',
              description: 'High accuracy reduces waste, improves satisfaction, and builds customer loyalty'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 98% accuracy within 30 days'
            }
          ]
        }
      }
    ];
  }

  // Front Counter template blocks
  getFrontCounterBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'step-section',
        order: 1,
        content: {
          stepNumber: 1,
          title: 'Evaluate Front Counter Performance',
          description: 'Assess current customer service and operational efficiency:'
        }
      },
      {
        type: 'smart-template',
        order: 2,
        content: {
          title: 'Goal 1: Increase Customer Satisfaction',
          items: [
            {
              label: 'S - Specific',
              description: 'Improve customer satisfaction through enhanced service quality and reduced wait times'
            },
            {
              label: 'M - Measurable',
              description: 'Achieve 95% customer satisfaction rating on surveys and feedback'
            },
            {
              label: 'A - Achievable',
              description: 'Implement service training and optimize counter operations'
            },
            {
              label: 'R - Relevant',
              description: 'Higher satisfaction drives repeat business and positive reviews'
            },
            {
              label: 'T - Time-bound',
              description: 'Reach 95% satisfaction within 60 days'
            }
          ]
        }
      },
      {
        type: 'smart-template',
        order: 3,
        content: {
          title: 'Goal 2: Reduce Customer Wait Times',
          items: [
            {
              label: 'S - Specific',
              description: 'Streamline front counter operations to reduce customer wait times'
            },
            {
              label: 'M - Measurable',
              description: 'Reduce average wait time to under 3 minutes during peak hours'
            },
            {
              label: 'A - Achievable',
              description: 'Optimize staffing and implement efficient order-taking procedures'
            },
            {
              label: 'R - Relevant',
              description: 'Shorter wait times improve customer experience and increase throughput'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve target within 45 days'
            }
          ]
        }
      }
    ];
  }

  // Team Leadership template blocks
  getTeamLeadershipBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'step-section',
        order: 1,
        content: {
          stepNumber: 1,
          title: 'Assess Team Performance and Engagement',
          description: 'Evaluate current team dynamics and identify development opportunities:'
        }
      },
      {
        type: 'smart-template',
        order: 2,
        content: {
          title: 'Goal 1: Reduce Team Member Turnover',
          items: [
            {
              label: 'S - Specific',
              description: 'Reduce team member turnover through improved leadership and engagement'
            },
            {
              label: 'M - Measurable',
              description: 'Decrease turnover rate by 25% compared to previous quarter'
            },
            {
              label: 'A - Achievable',
              description: 'Implement regular one-on-ones, recognition programs, and career development'
            },
            {
              label: 'R - Relevant',
              description: 'Lower turnover reduces training costs and improves service consistency'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 25% reduction within 90 days'
            }
          ]
        }
      },
      {
        type: 'smart-template',
        order: 3,
        content: {
          title: 'Goal 2: Improve Team Engagement',
          items: [
            {
              label: 'S - Specific',
              description: 'Increase team engagement through better communication and development opportunities'
            },
            {
              label: 'M - Measurable',
              description: 'Achieve 85% positive engagement score on team surveys'
            },
            {
              label: 'A - Achievable',
              description: 'Conduct regular team meetings, provide feedback, and create growth opportunities'
            },
            {
              label: 'R - Relevant',
              description: 'Engaged teams provide better customer service and are more productive'
            },
            {
              label: 'T - Time-bound',
              description: 'Reach 85% engagement within 60 days'
            }
          ]
        }
      }
    ];
  }

  // Food Safety template blocks
  getFoodSafetyBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'smart-template',
        order: 1,
        content: {
          title: 'Goal 1: Achieve Perfect Audit Compliance',
          items: [
            {
              label: 'S - Specific',
              description: 'Maintain 100% compliance with all food safety regulations and audit requirements'
            },
            {
              label: 'M - Measurable',
              description: 'Achieve 100% compliance score on all food safety audits'
            },
            {
              label: 'A - Achievable',
              description: 'Implement daily checklists and regular training programs'
            },
            {
              label: 'R - Relevant',
              description: 'Compliance protects customers and prevents costly violations'
            },
            {
              label: 'T - Time-bound',
              description: 'Maintain 100% compliance ongoing'
            }
          ]
        }
      },
      {
        type: 'smart-template',
        order: 2,
        content: {
          title: 'Goal 2: Eliminate Food Safety Incidents',
          items: [
            {
              label: 'S - Specific',
              description: 'Prevent all food safety incidents through proper procedures and training'
            },
            {
              label: 'M - Measurable',
              description: 'Achieve zero food safety incidents or customer complaints'
            },
            {
              label: 'A - Achievable',
              description: 'Strengthen training, monitoring, and corrective action procedures'
            },
            {
              label: 'R - Relevant',
              description: 'Zero incidents protects brand reputation and customer health'
            },
            {
              label: 'T - Time-bound',
              description: 'Maintain zero incidents for 12 consecutive months'
            }
          ]
        }
      }
    ];
  }

  // Training Development template blocks
  getTrainingDevelopmentBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'smart-template',
        order: 1,
        content: {
          title: 'Goal 1: Reduce Training Time',
          items: [
            {
              label: 'S - Specific',
              description: 'Streamline new hire training program to reduce time to productivity'
            },
            {
              label: 'M - Measurable',
              description: 'Reduce new hire training time by 30% while maintaining quality'
            },
            {
              label: 'A - Achievable',
              description: 'Develop structured training modules and mentorship programs'
            },
            {
              label: 'R - Relevant',
              description: 'Faster training reduces costs and gets new hires productive sooner'
            },
            {
              label: 'T - Time-bound',
              description: 'Implement new program within 45 days'
            }
          ]
        }
      }
    ];
  }

  // Cost Management template blocks
  getCostManagementBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'smart-template',
        order: 1,
        content: {
          title: 'Goal 1: Reduce Food Costs',
          items: [
            {
              label: 'S - Specific',
              description: 'Reduce food costs through better inventory management and waste reduction'
            },
            {
              label: 'M - Measurable',
              description: 'Decrease food cost percentage by 3% of total sales'
            },
            {
              label: 'A - Achievable',
              description: 'Implement portion control, inventory tracking, and waste monitoring'
            },
            {
              label: 'R - Relevant',
              description: 'Lower food costs directly improve profitability'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 3% reduction within 90 days'
            }
          ]
        }
      }
    ];
  }

  // Customer Experience template blocks
  getCustomerExperienceBlocks(template: any): ContentBlock[] {
    return [
      {
        type: 'header',
        order: 0,
        content: {
          title: template.name,
          subtitle: template.description
        }
      },
      {
        type: 'smart-template',
        order: 1,
        content: {
          title: 'Goal 1: Increase Customer Loyalty',
          items: [
            {
              label: 'S - Specific',
              description: 'Improve customer loyalty through exceptional service experiences'
            },
            {
              label: 'M - Measurable',
              description: 'Increase customer loyalty scores by 20% and repeat visit frequency'
            },
            {
              label: 'A - Achievable',
              description: 'Implement service excellence training and customer feedback systems'
            },
            {
              label: 'R - Relevant',
              description: 'Loyal customers drive repeat business and positive word-of-mouth'
            },
            {
              label: 'T - Time-bound',
              description: 'Achieve 20% increase within 60 days'
            }
          ]
        }
      }
    ];
  }
}

export default new PlaybookService();
