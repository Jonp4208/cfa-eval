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

  // Get playbook templates
  getPlaybookTemplates() {
    return [
      {
        id: 'facilities-director',
        name: 'Facilities Director Playbook',
        description: 'How to Identify Priorities & Create SMART Goals',
        category: 'Leadership',
        targetRole: 'Director'
      },
      {
        id: 'team-leader',
        name: 'Team Leader Playbook',
        description: 'Essential leadership skills for team leaders',
        category: 'Leadership',
        targetRole: 'Leader'
      },
      {
        id: 'operations-manual',
        name: 'Operations Manual',
        description: 'Standard operating procedures and best practices',
        category: 'Operations',
        targetRole: 'All'
      }
    ];
  }

  // Get template content blocks for a specific template
  getTemplateContentBlocks(templateId: string): ContentBlock[] {
    switch (templateId) {
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
        return [];
    }
  }
}

export default new PlaybookService();
