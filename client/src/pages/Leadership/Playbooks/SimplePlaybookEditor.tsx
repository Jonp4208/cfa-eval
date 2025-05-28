import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Save, Eye, EyeOff, Printer } from 'lucide-react';
import playbookService, { Playbook, ContentBlock } from '@/services/playbookService';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  isPreview?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
  isPreview = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // In preview mode, just show the text without editing capability
  if (isPreview) {
    return (
      <div className={className}>
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${className} min-h-[60px]`}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={className}
            placeholder={placeholder}
            autoFocus
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer border-2 border-dashed border-blue-300 bg-blue-50/30 rounded px-2 py-1 transition-all duration-200 relative group hover:border-blue-400 hover:bg-blue-50`}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
      {!isPreview && (
        <span className="absolute -top-2 -right-2 text-xs text-blue-600 bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center border border-blue-400">
          ✏️
        </span>
      )}
    </div>
  );
};

export default function SimplePlaybookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Default playbook structure based on the demo
  const [playbookData, setPlaybookData] = useState({
    title: 'Your Title',
    subtitle: 'Your Subtitle',
    // Priority Matrix - only descriptions are editable
    urgentImportantDescription: '2 to 3 Important/urgent Items heres',
    importantNotUrgentDescription: '2 to 3 Important/Not urgent Items heres',
    urgentNotImportantDescription: '2 to 3 urgent/Not Important Items heres',
    notUrgentNotImportantDescription: '2 to 3 Not Urgent/Not Important Items heres',

    // SMART Template - only descriptions are editable
    specificDescription: 'What exactly needs to be accomplished? Be precise.',
    measurableDescription: 'How will you know when it\'s complete? What can you count or observe?',
    achievableDescription: 'Can this realistically be done with available resources?',
    relevantDescription: 'Why does this matter to your organization\'s success?',
    timeBoundDescription: 'When will this be completed? Set a specific deadline.',

    // SMART Goals - users can create multiple goals
    smartGoals: [
      {
        id: 1,
        title: 'Goal 1',
        specific: 'What exactly needs to be accomplished? Be precise.',
        measurable: 'How will you know when it\'s complete? What can you count or observe?',
        achievable: 'Can this realistically be done with available resources?',
        relevant: 'Why does this matter to your organization\'s success?',
        timeBound: 'When will this be completed? Set a specific deadline.'
      }
    ],
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPlaybook();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPlaybook = async () => {
    try {
      const data = await playbookService.getPlaybook(id!);
      setPlaybook(data);

      // Extract data from content blocks if they exist
      if (data.contentBlocks && data.contentBlocks.length > 0) {
        // Parse existing content blocks back into our simple structure
        const extractedData = {
          title: data.title || 'Your Title',
          subtitle: data.subtitle || 'Your Subtitle',
          // Default values for priority matrix
          urgentImportantDescription: '2 to 3 Important/urgent Items heres',
          importantNotUrgentDescription: '2 to 3 Important/Not urgent Items heres',
          urgentNotImportantDescription: '2 to 3 urgent/Not Important Items heres',
          notUrgentNotImportantDescription: '2 to 3 Not Urgent/Not Important Items heres',
          // Default values for SMART template
          specificDescription: 'What exactly needs to be accomplished? Be precise.',
          measurableDescription: 'How will you know when it\'s complete? What can you count or observe?',
          achievableDescription: 'Can this realistically be done with available resources?',
          relevantDescription: 'Why does this matter to your organization\'s success?',
          timeBoundDescription: 'When will this be completed? Set a specific deadline.',
          // Default SMART goals
          smartGoals: [
            {
              id: 1,
              title: 'Goal 1',
              specific: 'What exactly needs to be accomplished? Be precise.',
              measurable: 'How will you know when it\'s complete? What can you count or observe?',
              achievable: 'Can this realistically be done with available resources?',
              relevant: 'Why does this matter to your organization\'s success?',
              timeBound: 'When will this be completed? Set a specific deadline.'
            }
          ]
        };

        // Extract data from content blocks
        data.contentBlocks.forEach((block: any) => {
          switch (block.type) {
            case 'header':
              if (block.content?.title) extractedData.title = block.content.title;
              if (block.content?.subtitle) extractedData.subtitle = block.content.subtitle;
              break;

            case 'priority-matrix':
              if (block.content?.quadrants) {
                block.content.quadrants.forEach((quadrant: any) => {
                  switch (quadrant.title) {
                    case 'URGENT + IMPORTANT':
                      extractedData.urgentImportantDescription = quadrant.description || extractedData.urgentImportantDescription;
                      break;
                    case 'IMPORTANT + NOT URGENT':
                      extractedData.importantNotUrgentDescription = quadrant.description || extractedData.importantNotUrgentDescription;
                      break;
                    case 'URGENT + NOT IMPORTANT':
                      extractedData.urgentNotImportantDescription = quadrant.description || extractedData.urgentNotImportantDescription;
                      break;
                    case 'NOT URGENT + NOT IMPORTANT':
                      extractedData.notUrgentNotImportantDescription = quadrant.description || extractedData.notUrgentNotImportantDescription;
                      break;
                  }
                });
              }
              break;

            case 'smart-template':
              if (block.content?.items) {
                block.content.items.forEach((item: any) => {
                  switch (item.label) {
                    case 'S - Specific':
                      extractedData.specificDescription = item.description || extractedData.specificDescription;
                      break;
                    case 'M - Measurable':
                      extractedData.measurableDescription = item.description || extractedData.measurableDescription;
                      break;
                    case 'A - Achievable':
                      extractedData.achievableDescription = item.description || extractedData.achievableDescription;
                      break;
                    case 'R - Relevant':
                      extractedData.relevantDescription = item.description || extractedData.relevantDescription;
                      break;
                    case 'T - Time-bound':
                      extractedData.timeBoundDescription = item.description || extractedData.timeBoundDescription;
                      break;
                  }
                });
              }
              break;

            case 'practice-section':
              if (block.content?.title === 'Your SMART Goals' && block.content?.exercises) {
                // Extract SMART goals from practice section
                extractedData.smartGoals = block.content.exercises.map((exercise: any, index: number) => ({
                  id: index + 1,
                  title: exercise.title || `Goal ${index + 1}`,
                  specific: exercise.fields?.find((f: any) => f.label === 'Specific')?.value || 'What exactly needs to be accomplished? Be precise.',
                  measurable: exercise.fields?.find((f: any) => f.label === 'Measurable')?.value || 'How will you know when it\'s complete? What can you count or observe?',
                  achievable: exercise.fields?.find((f: any) => f.label === 'Achievable')?.value || 'Can this realistically be done with available resources?',
                  relevant: exercise.fields?.find((f: any) => f.label === 'Relevant')?.value || 'Why does this matter to your organization\'s success?',
                  timeBound: exercise.fields?.find((f: any) => f.label === 'Time-bound')?.value || 'When will this be completed? Set a specific deadline.'
                }));
              }
              break;
          }
        });

        // Update the playbook data state with extracted values
        setPlaybookData(extractedData);
      } else {
        // If no content blocks, use the basic title and subtitle from the playbook
        setPlaybookData(prev => ({
          ...prev,
          title: data.title || 'Your Title',
          subtitle: data.subtitle || 'Your Subtitle'
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching playbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playbook',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert our simple structure back to content blocks
      const contentBlocks: ContentBlock[] = [
        {
          type: 'header' as const,
          order: 0,
          content: {
            title: playbookData.title,
            subtitle: playbookData.subtitle
          }
        },
        {
          type: 'step-section' as const,
          order: 1,
          content: {
            stepNumber: 1,
            title: 'Identify Your Priorities Using the Priority Matrix',
            description: 'Every week, categorize your responsibilities and tasks into these four boxes:'
          }
        },
        {
          type: 'priority-matrix' as const,
          order: 2,
          content: {
            title: 'Priority Matrix',
            quadrants: [
              {
                title: 'URGENT + IMPORTANT',
                action: 'DO FIRST',
                description: playbookData.urgentImportantDescription,
                color: 'red'
              },
              {
                title: 'IMPORTANT + NOT URGENT',
                action: 'SCHEDULE',
                description: playbookData.importantNotUrgentDescription,
                color: 'blue'
              },
              {
                title: 'URGENT + NOT IMPORTANT',
                action: 'DELEGATE',
                description: playbookData.urgentNotImportantDescription,
                color: 'yellow'
              },
              {
                title: 'NOT URGENT + NOT IMPORTANT',
                action: 'ELIMINATE',
                description: playbookData.notUrgentNotImportantDescription,
                color: 'gray'
              }
            ]
          }
        },
        {
          type: 'step-section' as const,
          order: 3,
          content: {
            stepNumber: 2,
            title: 'Turn Top Priorities into SMART Goals',
            description: 'Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:'
          }
        },
        {
          type: 'smart-template' as const,
          order: 4,
          content: {
            title: 'SMART Goal Template',
            items: [
              {
                label: 'S - Specific',
                description: playbookData.specificDescription
              },
              {
                label: 'M - Measurable',
                description: playbookData.measurableDescription
              },
              {
                label: 'A - Achievable',
                description: playbookData.achievableDescription
              },
              {
                label: 'R - Relevant',
                description: playbookData.relevantDescription
              },
              {
                label: 'T - Time-bound',
                description: playbookData.timeBoundDescription
              }
            ]
          }
        },
        {
          type: 'practice-section' as const,
          order: 5,
          content: {
            title: 'Your SMART Goals',
            description: 'Complete your SMART goals using the template above',
            exercises: playbookData.smartGoals.map(goal => ({
              title: goal.title,
              fields: [
                { label: 'Specific', value: goal.specific },
                { label: 'Measurable', value: goal.measurable },
                { label: 'Achievable', value: goal.achievable },
                { label: 'Relevant', value: goal.relevant },
                { label: 'Time-bound', value: goal.timeBound }
              ]
            }))
          }
        },
        {
          type: 'step-section' as const,
          order: 6,
          content: {
            stepNumber: 3,
            title: 'Weekly Priority Assessment Process',
            description: 'Follow this systematic approach every week:'
          }
        },
        {
          type: 'checklist' as const,
          order: 7,
          content: {
            title: '📅 Every Monday Morning (15 minutes):',
            items: [
              'Walk the entire facility - what do you see that needs attention?',
              'Review customer complaints from last week - any facility-related issues?',
              'Check equipment status - anything breaking down or needing service?',
              'Ask team members - what problems are they seeing?',
              'Review upcoming schedules - pest control, maintenance, inspections due?'
            ]
          }
        },
        {
          type: 'checklist' as const,
          order: 8,
          content: {
            title: '📊 Then Categorize Each Issue:',
            items: [
              'Write each issue on the priority matrix',
              'Focus on "Urgent + Important" first',
              'Schedule "Important + Not Urgent" items',
              'Delegate "Urgent + Not Important" to team',
              'Eliminate or ignore "Not Urgent + Not Important"'
            ]
          }
        },
        {
          type: 'step-section' as const,
          order: 9,
          content: {
            stepNumber: 4,
            title: 'Monthly Priority Assessment Process',
            description: 'Review and adjust your priorities monthly to stay aligned with organizational goals:'
          }
        },
        {
          type: 'checklist' as const,
          order: 10,
          content: {
            title: '📅 Every Month End (30 minutes):',
            items: [
              'Review completed goals from the past month',
              'Assess which priorities shifted or changed',
              'Identify new challenges or opportunities',
              'Update your priority matrix with new information',
              'Set 3-5 new SMART goals for the upcoming month'
            ]
          }
        },
        {
          type: 'example-box' as const,
          order: 11,
          content: {
            type: 'bad',
            content: '"Fix the problems"',
            explanation: 'Problem: Too vague, no timeline, can\'t measure success'
          }
        },
        {
          type: 'example-box' as const,
          order: 12,
          content: {
            type: 'good',
            content: '"Achieve 100% completion of daily maintenance checklists in all areas for 30 consecutive days by [specific date]"',
            explanation: 'Why it works: Specific (checklists), Measurable (100%, 30 days), Achievable (daily tasks), Relevant (maintenance), Time-bound (specific date)'
          }
        },
        {
          type: 'step-section' as const,
          order: 13,
          content: {
            stepNumber: 5,
            title: 'Implementation & Systems',
            description: 'As a leader, you don\'t do all the work - you create systems that ensure consistent results.'
          }
        },
        {
          type: 'success-box' as const,
          order: 14,
          content: {
            title: 'Your Leadership Role',
            items: [
              '✅ LEADER LEVEL: Set standards, create processes, train team, monitor compliance, solve system problems',
              '❌ NOT YOUR JOB: Doing all the individual tasks, micromanaging every detail, working in the business instead of on it'
            ]
          }
        },
        {
          type: 'warning-box' as const,
          order: 15,
          content: {
            title: 'Common Mistakes to Avoid',
            items: [
              'Setting too many goals: Focus on 3-5 goals maximum at one time',
              'Making goals too big: Break large projects into smaller 30-90 day goals',
              'No clear deadline: "Soon" or "ASAP" are not deadlines',
              'Can\'t measure success: If you can\'t count it or see it, rewrite the goal',
              'Doing instead of managing: Your goals should be about creating systems, not doing tasks'
            ]
          }
        }
      ];

      const updateData = {
        title: playbookData.title,
        subtitle: playbookData.subtitle,
        contentBlocks,
        category: 'Leadership',
        targetRole: 'Director'
      };

      if (id && id !== 'new' && id !== 'simple-edit') {
        await playbookService.updatePlaybook(id, updateData);
        toast({
          title: 'Success',
          description: 'Playbook updated successfully'
        });
      } else {
        const newPlaybook = await playbookService.createPlaybook(updateData);
        navigate(`/leadership/playbooks/${newPlaybook._id}/simple-edit`);
        toast({
          title: 'Success',
          description: 'Playbook created successfully'
        });
      }
    } catch (error) {
      console.error('Error saving playbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to save playbook',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setPlaybookData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSmartGoal = () => {
    const newId = Math.max(...playbookData.smartGoals.map(g => g.id)) + 1;
    setPlaybookData(prev => ({
      ...prev,
      smartGoals: [...prev.smartGoals, {
        id: newId,
        title: `Goal ${newId}`,
        specific: 'What exactly needs to be accomplished? Be precise.',
        measurable: 'How will you know when it\'s complete? What can you count or observe?',
        achievable: 'Can this realistically be done with available resources?',
        relevant: 'Why does this matter to your organization\'s success?',
        timeBound: 'When will this be completed? Set a specific deadline.'
      }]
    }));
  };

  const removeSmartGoal = (id: number) => {
    if (playbookData.smartGoals.length > 1) {
      setPlaybookData(prev => ({
        ...prev,
        smartGoals: prev.smartGoals.filter(goal => goal.id !== id)
      }));
    }
  };

  const updateSmartGoal = (id: number, field: string, value: string) => {
    setPlaybookData(prev => ({
      ...prev,
      smartGoals: prev.smartGoals.map(goal =>
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const handlePrint = async () => {
    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we create your PDF...'
      });

      // Convert the current playbook data to the format expected by the PDF generator
      const playbookForPdf = {
        title: playbookData.title,
        subtitle: playbookData.subtitle,
        description: playbookData.description,
        category: playbookData.category,
        targetRole: playbookData.targetRole,
        contentBlocks: [
          // Step 1 - Priority Matrix
          {
            type: 'step-section',
            order: 1,
            content: {
              stepNumber: 1,
              title: 'Identify Your Priorities Using the Priority Matrix',
              description: 'Every week, categorize your responsibilities and tasks into these four boxes:'
            }
          },
          {
            type: 'priority-matrix',
            order: 2,
            content: {
              urgentImportant: playbookData.urgentImportantDescription,
              importantNotUrgent: playbookData.importantNotUrgentDescription,
              urgentNotImportant: playbookData.urgentNotImportantDescription,
              notUrgentNotImportant: playbookData.notUrgentNotImportantDescription
            }
          },
          // Step 2 - SMART Goals
          {
            type: 'step-section',
            order: 3,
            content: {
              stepNumber: 2,
              title: 'Turn Top Priorities into SMART Goals',
              description: 'Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:'
            }
          },
          {
            type: 'smart-template',
            order: 4,
            content: {
              goals: playbookData.smartGoals
            }
          },
          // Step 3 - Weekly Process
          {
            type: 'step-section',
            order: 5,
            content: {
              stepNumber: 3,
              title: 'Weekly Priority Assessment Process',
              description: 'Follow this weekly process to stay on top of your priorities:'
            }
          },
          {
            type: 'checklist',
            order: 6,
            content: {
              title: 'Every Monday Morning (15 minutes):',
              items: [
                'Review your area of responsibility - what needs attention?',
                'Check feedback from last week - any recurring issues?',
                'Assess current projects and systems - what needs follow-up?',
                'Ask team members - what challenges are they facing?',
                'Review upcoming deadlines and commitments - what\'s due soon?'
              ]
            }
          },
          {
            type: 'checklist',
            order: 7,
            content: {
              title: 'Then Categorize Each Issue:',
              items: [
                'Write each issue on the priority matrix',
                'Focus on "Urgent + Important" first',
                'Schedule "Important + Not Urgent" items',
                'Delegate "Urgent + Not Important" to team',
                'Eliminate or ignore "Not Urgent + Not Important"'
              ]
            }
          },
          // Step 4 - Monthly Process
          {
            type: 'step-section',
            order: 8,
            content: {
              stepNumber: 4,
              title: 'Monthly Priority Assessment Process',
              description: 'Every month, conduct a comprehensive review of your priorities and systems:'
            }
          },
          {
            type: 'checklist',
            order: 9,
            content: {
              title: 'Monthly Review (First Monday of Month):',
              items: [
                'Review all completed weekly assessments - what patterns do you see?',
                'Analyze feedback and performance data - any recurring issues?',
                'Evaluate systems and processes - what needs improvement or updating?',
                'Assess team development - who needs additional training or support?',
                'Review goals and priorities - are they still relevant and achievable?'
              ]
            }
          }
        ]
      };

      // Use the new React PDF export
      const { downloadReactPDF } = await import('../../../utils/ReactPdfExport');
      await downloadReactPDF(playbookForPdf);

      toast({
        title: 'Success',
        description: 'PDF downloaded successfully!'
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading playbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/leadership/playbooks')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Playbooks
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {id === 'new' || id === 'simple-edit' ? 'Create New Playbook' : 'Edit Playbook'}
              </h1>
              <p className="text-sm text-gray-500">
                {isPreview ? 'Preview mode - showing final result' : 'Click any blue dashed box with pencil icon to edit it'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2"
            >
              {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? 'Edit Mode' : 'Preview'}
            </Button>
            {isPreview && (
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Download PDF
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Playbook'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardContent className="p-0">
            <div className="playbook-content p-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b-3 border-[#E51636] pb-5 mb-8">
                <EditableText
                  value={playbookData.title}
                  onChange={(value) => updateField('title', value)}
                  className="text-3xl font-bold text-[#E51636] mb-2 text-center"
                  placeholder="Enter playbook title..."
                  isPreview={isPreview}
                />
                <EditableText
                  value={playbookData.subtitle}
                  onChange={(value) => updateField('subtitle', value)}
                  className="text-lg text-gray-600 text-center"
                  placeholder="Enter subtitle..."
                  isPreview={isPreview}
                />
              </div>

              {/* Step 1 */}
              <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-[#E51636]">
                    Identify Your Priorities Using the Priority Matrix
                  </h3>
                </div>
                <p className="text-gray-700 font-semibold">
                  Every week, categorize your responsibilities and tasks into these four boxes:
                </p>
              </div>

              {/* Priority Matrix */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Urgent + Important */}
                  <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 text-center">
                    <div className="font-bold text-red-800 mb-1">URGENT + IMPORTANT</div>
                    <div className="text-sm font-medium text-red-700 mb-2">DO FIRST</div>
                    <EditableText
                      value={playbookData.urgentImportantDescription}
                      onChange={(value) => updateField('urgentImportantDescription', value)}
                      className="text-sm text-red-600"
                      multiline
                      placeholder="Description..."
                      isPreview={isPreview}
                    />
                  </div>

                  {/* Important + Not Urgent */}
                  <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 text-center">
                    <div className="font-bold text-blue-800 mb-1">IMPORTANT + NOT URGENT</div>
                    <div className="text-sm font-medium text-blue-700 mb-2">SCHEDULE</div>
                    <EditableText
                      value={playbookData.importantNotUrgentDescription}
                      onChange={(value) => updateField('importantNotUrgentDescription', value)}
                      className="text-sm text-blue-600"
                      multiline
                      placeholder="Description..."
                      isPreview={isPreview}
                    />
                  </div>

                  {/* Urgent + Not Important */}
                  <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4 text-center">
                    <div className="font-bold text-yellow-800 mb-1">URGENT + NOT IMPORTANT</div>
                    <div className="text-sm font-medium text-yellow-700 mb-2">DELEGATE</div>
                    <EditableText
                      value={playbookData.urgentNotImportantDescription}
                      onChange={(value) => updateField('urgentNotImportantDescription', value)}
                      className="text-sm text-yellow-600"
                      multiline
                      placeholder="Description..."
                      isPreview={isPreview}
                    />
                  </div>

                  {/* Not Urgent + Not Important */}
                  <div className="bg-gray-50 border-2 border-gray-600 rounded-lg p-4 text-center">
                    <div className="font-bold text-gray-800 mb-1">NOT URGENT + NOT IMPORTANT</div>
                    <div className="text-sm font-medium text-gray-700 mb-2">ELIMINATE</div>
                    <EditableText
                      value={playbookData.notUrgentNotImportantDescription}
                      onChange={(value) => updateField('notUrgentNotImportantDescription', value)}
                      className="text-sm text-gray-600"
                      multiline
                      placeholder="Description..."
                      isPreview={isPreview}
                    />
                  </div>
                </div>
              </div>


              {/* Step 2 */}
              <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-[#E51636]">
                    Turn Top Priorities into SMART Goals
                  </h3>
                </div>
                <p className="text-gray-700 font-semibold">
                  Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:
                </p>
              </div>

              {/* SMART Goals Section */}
              <div className="bg-white border-2 border-[#E51636] rounded-lg p-6 page-break">
                <h4 className="text-lg font-semibold text-[#E51636] mb-4">📝 Your SMART Goals</h4>

                <div className="space-y-6">
                  {playbookData.smartGoals.map((goal) => (
                    <div key={goal.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <EditableText
                          value={goal.title}
                          onChange={(value) => updateSmartGoal(goal.id, 'title', value)}
                          className="text-lg font-semibold text-[#E51636]"
                          placeholder="Goal Title..."
                          isPreview={isPreview}
                        />
                        {!isPreview && playbookData.smartGoals.length > 1 && (
                          <button
                            onClick={() => removeSmartGoal(goal.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                          <div className="font-bold text-[#E51636]">S - Specific</div>
                          <div className="mt-2 text-gray-700">
                            <EditableText
                              value={goal.specific}
                              onChange={(value) => updateSmartGoal(goal.id, 'specific', value)}
                              className="text-gray-700"
                              placeholder="What exactly needs to be accomplished? Be precise."
                              isPreview={isPreview}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                          <div className="font-bold text-[#E51636]">M - Measurable</div>
                          <div className="mt-2 text-gray-700">
                            <EditableText
                              value={goal.measurable}
                              onChange={(value) => updateSmartGoal(goal.id, 'measurable', value)}
                              className="text-gray-700"
                              placeholder="How will you know when it's complete? What can you count or observe?"
                              isPreview={isPreview}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                          <div className="font-bold text-[#E51636]">A - Achievable</div>
                          <div className="mt-2 text-gray-700">
                            <EditableText
                              value={goal.achievable}
                              onChange={(value) => updateSmartGoal(goal.id, 'achievable', value)}
                              className="text-gray-700"
                              placeholder="Can this realistically be done with available resources?"
                              isPreview={isPreview}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                          <div className="font-bold text-[#E51636]">R - Relevant</div>
                          <div className="mt-2 text-gray-700">
                            <EditableText
                              value={goal.relevant}
                              onChange={(value) => updateSmartGoal(goal.id, 'relevant', value)}
                              className="text-gray-700"
                              placeholder="Why does this matter to your organization's success?"
                              isPreview={isPreview}
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                          <div className="font-bold text-[#E51636]">T - Time-bound</div>
                          <div className="mt-2 text-gray-700">
                            <EditableText
                              value={goal.timeBound}
                              onChange={(value) => updateSmartGoal(goal.id, 'timeBound', value)}
                              className="text-gray-700"
                              placeholder="When will this be completed? Set a specific deadline."
                              isPreview={isPreview}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isPreview && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={addSmartGoal}
                      className="bg-[#E51636] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#C41E3A] transition-colors"
                    >
                      + Add Smart Goal
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg page-break">
                <div className="flex items-center mb-4">
                  <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-[#E51636]">
                    Weekly Priority Assessment Process
                  </h3>
                </div>
                <p className="text-gray-700 font-semibold mb-4">
                  Follow this weekly process to stay on top of your priorities:
                </p>

                {/* Monday Morning Checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📅 Every Monday Morning (15 minutes):</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Review your area of responsibility - what needs attention?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Check feedback from last week - any recurring issues?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Assess current projects and systems - what needs follow-up?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Ask team members - what challenges are they facing?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Review upcoming deadlines and commitments - what's due soon?</span>
                    </li>
                  </ul>
                </div>

                {/* Categorization Checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Then Categorize Each Issue:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Write each issue on the priority matrix</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Focus on "Urgent + Important" first</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Schedule "Important + Not Urgent" items</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Delegate "Urgent + Not Important" to team</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Eliminate or ignore "Not Urgent + Not Important"</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-[#E51636]">
                    Monthly Priority Assessment Process
                  </h3>
                </div>
                <p className="text-gray-700 font-semibold mb-4">
                  Every month, conduct a comprehensive review of your priorities and systems:
                </p>

                {/* Monthly Review Checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📅 Monthly Review (First Monday of Month):</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Review all completed weekly assessments - what patterns do you see?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Analyze feedback and performance data - any recurring issues?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Evaluate systems and processes - what needs improvement or updating?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Assess team performance and development needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Review budget and resources - are you on track with targets?</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Plan upcoming projects and initiatives for next month</span>
                    </li>
                  </ul>
                </div>

                {/* Monthly Goal Setting */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-800 mb-3">🎯 Set Monthly Goals:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Set 3-5 major goals for the upcoming month</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Ensure each goal follows SMART criteria from Step 2</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Assign responsibility for each goal to specific team members</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Schedule weekly check-ins to monitor progress</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Document goals and share with your manager and team</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    5
                  </div>
                  <h3 className="text-xl font-semibold text-[#E51636]">
                    Leadership Standards & Systems
                  </h3>
                </div>
                <p className="text-gray-700 font-semibold mb-4">
                  As a leader, you don't do all the work - you create systems that ensure consistent results.
                </p>

                {/* Role Definition */}
                <div className="bg-blue-50 border border-gray-200 rounded-lg p-5 mb-4">
                  <div className="text-blue-800 font-semibold mb-3">👑 Your Leadership Role:</div>
                  <p className="mb-2">
                    <strong>✅ Your Job:</strong> Set standards, create processes, train team, monitor performance, solve system problems
                  </p>
                  <p>
                    <strong>❌ NOT YOUR JOB:</strong> Doing all the individual tasks, micromanaging every detail, working in the business instead of on it
                  </p>
                </div>

                {/* System Setup */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📋 Leadership System Setup:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Create Simple Processes: Daily, weekly, monthly tasks with clear steps and checkboxes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Assign Ownership: Specific people responsible for specific areas and outcomes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Set Standards: What does "success" look like? Define clear expectations and examples</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Monitor Performance: Check completed work, do regular reviews and spot checks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">Address Gaps: Retrain, reassign, or improve systems when standards aren't met</span>
                    </li>
                  </ul>
                </div>

                {/* Leadership SMART Goal Examples */}
                <div className="bg-white border-2 border-[#E51636] rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-[#E51636]">📝 Leadership SMART Goal Examples:</h4>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                      <div className="font-bold text-[#E51636]">Process Improvement</div>
                      <div className="mt-2 text-gray-700">
                        <strong>Goal:</strong> "Achieve 100% completion of daily task checklists with zero quality issues for 30 consecutive days by [date]"
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                      <div className="font-bold text-[#E51636]">System Implementation</div>
                      <div className="mt-2 text-gray-700">
                        <strong>Goal:</strong> "Implement process improvement system where all issues are addressed within 24 hours, measured by tracking logs for 14 days by [date]"
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                      <div className="font-bold text-[#E51636]">Performance Standards</div>
                      <div className="mt-2 text-gray-700">
                        <strong>Goal:</strong> "Establish end-of-week review checklist with 100% completion rate verified by documentation for 21 consecutive days by [date]"
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isPreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 text-lg">💡</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">How to Edit Your Playbook:</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• <strong>Blue dashed boxes</strong> show all editable content with pencil icons (✏️)</li>
                        <li>• <strong>Click any blue box</strong> to edit that text</li>
                        <li>• <strong>Press Enter</strong> to save, <strong>Escape</strong> to cancel</li>
                        <li>• <strong>Use Preview mode</strong> to see the final result without edit boxes</li>
                        <li>• <strong>Framework structure</strong> stays the same, content is yours to customize</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2"
            >
              {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            {isPreview && (
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Download PDF
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
