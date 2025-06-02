import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import {
  Search,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  CheckSquare,
  ChefHat,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  FileText,
  CalendarDays,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  BookOpen,
  Target,
  Award,
  Lightbulb,
  HelpCircle,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HowToSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  steps: {
    title: string;
    description: string;
    tips?: string[];
  }[];
  features?: string[];
  troubleshooting?: {
    problem: string;
    solution: string;
  }[];
  videos?: {
    title: string;
    url: string;
    description: string;
  }[];
}

const HowTo: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const quickHelpRef = useRef<HTMLDivElement>(null);

  // Close quick help when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickHelpRef.current && !quickHelpRef.current.contains(event.target as Node)) {
        setShowQuickHelp(false);
      }
    };

    if (showQuickHelp) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickHelp]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const quickHelpItems = [
    {
      title: "Getting Started",
      description: "New to LD Growth? Start here",
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowQuickHelp(false);
      },
      icon: Play,
      color: "from-emerald-400 to-blue-400"
    },
    {
      title: "Dashboard Overview",
      description: "Understanding your metrics",
      action: () => {
        setSearchTerm('');
        if (!expandedSections.includes('dashboard')) {
          toggleSection('dashboard');
        }
        document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
        setShowQuickHelp(false);
      },
      icon: LayoutDashboard,
      color: "from-blue-400 to-purple-400"
    },
    {
      title: "FOH Tasks",
      description: "Managing daily tasks",
      action: () => {
        setSearchTerm('');
        if (!expandedSections.includes('foh-tasks')) {
          toggleSection('foh-tasks');
        }
        document.getElementById('foh-tasks-section')?.scrollIntoView({ behavior: 'smooth' });
        setShowQuickHelp(false);
      },
      icon: CheckSquare,
      color: "from-blue-400 to-indigo-400"
    },
    {
      title: "Kitchen Management",
      description: "Waste tracking & food safety",
      action: () => {
        setSearchTerm('');
        if (!expandedSections.includes('kitchen')) {
          toggleSection('kitchen');
        }
        document.getElementById('kitchen-section')?.scrollIntoView({ behavior: 'smooth' });
        setShowQuickHelp(false);
      },
      icon: ChefHat,
      color: "from-orange-400 to-red-400"
    },
    {
      title: "Training & Development",
      description: "Employee training programs",
      action: () => {
        setSearchTerm('');
        if (!expandedSections.includes('training')) {
          toggleSection('training');
        }
        document.getElementById('training-section')?.scrollIntoView({ behavior: 'smooth' });
        setShowQuickHelp(false);
      },
      icon: GraduationCap,
      color: "from-green-400 to-emerald-400"
    },
    {
      title: "Search Help Topics",
      description: "Find specific information",
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          document.querySelector('input[placeholder*="Search"]')?.focus();
        }, 500);
        setShowQuickHelp(false);
      },
      icon: Search,
      color: "from-purple-400 to-pink-400"
    }
  ];

  const howToSections: HowToSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: LayoutDashboard,
      description: 'Your central hub for monitoring all store operations and team performance',
      color: 'bg-blue-100 text-blue-600',
      steps: [
        {
          title: 'Understanding Your Dashboard',
          description: 'The dashboard shows 4 key metric cards based on your active features, providing real-time insights into your store\'s performance.',
          tips: [
            'Cards automatically adjust based on which features your store has enabled',
            'Click on any card to navigate directly to that feature',
            'Metrics update in real-time as your team completes tasks'
          ]
        },
        {
          title: 'Reading Performance Metrics',
          description: 'Each metric card shows completion percentages, progress bars, and recent activity to help you identify areas needing attention.',
          tips: [
            'Green indicators show good performance (80%+ completion)',
            'Yellow indicators suggest areas for improvement (60-79%)',
            'Red indicators require immediate attention (<60%)'
          ]
        }
      ],
      features: ['Real-time metrics', 'Performance tracking', 'Quick navigation', 'Role-based views']
    },
    {
      id: 'foh-tasks',
      title: 'FOH Tasks Management',
      icon: CheckSquare,
      description: 'Manage front-of-house tasks across opening, transition, and closing shifts',
      color: 'bg-blue-100 text-blue-600',
      steps: [
        {
          title: 'Creating Tasks',
          description: 'Add new tasks for specific shift types (opening, transition, closing) to ensure consistent execution.',
          tips: [
            'Be specific with task names for clarity',
            'Assign tasks to appropriate shift types',
            'Consider the time required for each task'
          ]
        },
        {
          title: 'Completing Tasks',
          description: 'Team members can check off tasks as they complete them throughout their shift.',
          tips: [
            'Tasks are organized by shift type for easy navigation',
            'Completed tasks show who completed them and when',
            'Tasks reset daily for consistent tracking'
          ]
        }
      ],
      features: ['Shift-based organization', 'Real-time completion tracking', 'Team accountability'],
      videos: [
        {
          title: 'How to Add New Tasks',
          url: '/videos/AddNewTask.mp4',
          description: 'Learn how to create and configure new tasks for your team'
        },
        {
          title: 'Viewing Task History',
          url: '/videos/taskHistory.mp4',
          description: 'See how to review completed tasks and track team performance'
        }
      ]
    },
    {
      id: 'kitchen',
      title: 'Kitchen Management',
      icon: ChefHat,
      description: 'Comprehensive kitchen operations including waste tracking, food safety, and equipment monitoring',
      color: 'bg-orange-100 text-orange-600',
      steps: [
        {
          title: 'Waste Tracker',
          description: 'Log and analyze food waste to identify patterns and reduce costs. Track waste by meal period and reason.',
          tips: [
            'Log waste immediately when it occurs for accurate tracking',
            'Use the bulk entry feature for multiple items at once',
            'Review analytics weekly to identify trends',
            'Customize your waste item list to match your store\'s products'
          ]
        },
        {
          title: 'Food Safety Checklists',
          description: 'Complete daily food safety checklists to ensure compliance and maintain quality standards.',
          tips: [
            'Checklists reset at 12:00 AM New York time',
            'Take photos when required for documentation',
            'Review history to track compliance trends',
            'Address any failed items immediately'
          ]
        },
        {
          title: 'Equipment Monitoring',
          description: 'Track equipment temperatures and maintenance to prevent issues and ensure food safety.',
          tips: [
            'Check equipment temperatures at required intervals',
            'Report issues immediately when discovered',
            'Use the equipment detail view for maintenance history',
            'Set up alerts for critical temperature ranges'
          ]
        }
      ],
      features: ['Waste analytics', 'Food safety compliance', 'Equipment tracking', 'Temperature monitoring']
    },
    {
      id: 'training',
      title: 'Training Management',
      icon: GraduationCap,
      description: 'Manage employee training plans, track progress, and ensure team development',
      color: 'bg-green-100 text-green-600',
      steps: [
        {
          title: 'Creating Training Plans',
          description: 'Build comprehensive training programs with modules, objectives, and assessments.',
          tips: [
            'Break training into digestible modules',
            'Set clear learning objectives for each module',
            'Include both theoretical and practical components',
            'Assign realistic timeframes for completion'
          ]
        },
        {
          title: 'Tracking Progress',
          description: 'Monitor employee progress through training programs and identify those needing support.',
          tips: [
            'Review progress reports weekly',
            'Provide additional support for struggling employees',
            'Celebrate completions to encourage others',
            'Use analytics to improve training effectiveness'
          ]
        },
        {
          title: 'Managing New Hires',
          description: 'Ensure new team members complete required training within their first weeks.',
          tips: [
            'Assign training plans immediately upon hire',
            'Set up check-in points during the first 30 days',
            'Pair new hires with experienced mentors',
            'Track completion rates for onboarding effectiveness'
          ]
        }
      ],
      features: ['Custom training plans', 'Progress tracking', 'New hire onboarding', 'Completion analytics']
    },
    {
      id: 'leadership',
      title: 'Leadership Development',
      icon: TrendingUp,
      description: 'Develop leadership skills through structured plans, assessments, and 360 evaluations',
      color: 'bg-purple-100 text-purple-600',
      steps: [
        {
          title: 'Development Plans',
          description: 'Create and follow structured leadership development plans with specific goals and milestones.',
          tips: [
            'Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)',
            'Break large goals into smaller, actionable tasks',
            'Regular check-ins help maintain momentum',
            'Document progress and learnings along the way'
          ]
        },
        {
          title: 'Leadership Assessments',
          description: 'Take comprehensive assessments to understand your leadership style and areas for growth.',
          tips: [
            'Answer honestly for accurate results',
            'Use results to guide development planning',
            'Retake assessments periodically to track growth',
            'Share results with mentors for guidance'
          ]
        },
        {
          title: '360 Evaluations',
          description: 'Gather feedback from peers, supervisors, and direct reports for comprehensive leadership insights.',
          tips: [
            'Choose evaluators who work closely with you',
            'Provide context to evaluators about the process',
            'Review feedback objectively and look for patterns',
            'Create action plans based on feedback received'
          ]
        }
      ],
      features: ['Development planning', 'Leadership assessments', '360 feedback', 'Goal tracking'],
      videos: [
        {
          title: 'Leadership Development Overview',
          url: '/videos/leadership.mp4',
          description: 'Complete walkthrough of leadership development features and how to use them effectively'
        }
      ]
    },
    {
      id: 'evaluations',
      title: 'Performance Evaluations',
      icon: ClipboardList,
      description: 'Conduct comprehensive performance evaluations and track employee development',
      color: 'bg-red-100 text-red-600',
      steps: [
        {
          title: 'Scheduling Evaluations',
          description: 'Set up regular evaluation cycles based on hire dates or custom schedules.',
          tips: [
            'Use automatic scheduling for consistency',
            'Allow adequate time for thorough evaluations',
            'Send reminders before evaluations are due',
            'Consider workload when scheduling multiple evaluations'
          ]
        },
        {
          title: 'Conducting Evaluations',
          description: 'Use structured evaluation forms to assess performance across multiple dimensions.',
          tips: [
            'Prepare specific examples before the evaluation',
            'Focus on behaviors and outcomes, not personality',
            'Provide balanced feedback with strengths and areas for improvement',
            'Set clear expectations for the next evaluation period'
          ]
        },
        {
          title: 'Following Up',
          description: 'Create development plans and track progress on evaluation feedback.',
          tips: [
            'Document action items and timelines',
            'Schedule regular check-ins to monitor progress',
            'Provide resources and support for improvement areas',
            'Recognize and celebrate achievements'
          ]
        }
      ],
      features: ['Automated scheduling', 'Structured forms', 'Progress tracking', 'Development planning'],
      videos: [
        {
          title: 'Performance Evaluations Guide',
          url: '/videos/evaluations.mp4',
          description: 'Step-by-step guide to conducting effective performance evaluations'
        }
      ]
    },
    {
      id: 'documentation',
      title: 'Employee Documentation',
      icon: FileText,
      description: 'Manage employee files, disciplinary actions, and important documentation',
      color: 'bg-gray-100 text-gray-600',
      steps: [
        {
          title: 'Managing Employee Files',
          description: 'Upload and organize important documents for each team member including certifications and training records.',
          tips: [
            'Use clear, descriptive file names',
            'Organize documents by category (training, disciplinary, etc.)',
            'Ensure sensitive documents are properly secured',
            'Regular review and update of employee files'
          ]
        },
        {
          title: 'Disciplinary Documentation',
          description: 'Document disciplinary actions with proper procedures and follow-up tracking.',
          tips: [
            'Document incidents immediately while details are fresh',
            'Be objective and factual in descriptions',
            'Include witness statements when applicable',
            'Follow up on improvement plans and deadlines'
          ]
        },
        {
          title: 'Document Access Control',
          description: 'Control who can view and edit sensitive employee documentation based on roles.',
          tips: [
            'Limit access to authorized personnel only',
            'Use role-based permissions appropriately',
            'Audit document access regularly',
            'Maintain confidentiality at all times'
          ]
        }
      ],
      features: ['File management', 'Disciplinary tracking', 'Access control', 'Document history'],
      videos: [
        {
          title: 'Employee Documentation Tutorial',
          url: '/videos/Documentemployees.mp4',
          description: 'Learn how to manage employee files and documentation effectively'
        }
      ]
    },
    {
      id: 'setup-sheets',
      title: 'Setup Sheet Management',
      icon: CalendarDays,
      description: 'Create and manage daily setup templates for consistent store operations',
      color: 'bg-indigo-100 text-indigo-600',
      steps: [
        {
          title: 'Creating Templates',
          description: 'Build reusable setup sheet templates for different days, seasons, or special events.',
          tips: [
            'Include all necessary setup tasks and procedures',
            'Consider seasonal variations and special events',
            'Make templates detailed enough for new team members',
            'Update templates based on operational changes'
          ]
        },
        {
          title: 'Daily Setup Execution',
          description: 'Use templates to create daily setup sheets and track completion.',
          tips: [
            'Start setup sheets early in the day',
            'Assign specific team members to setup tasks',
            'Check off items as they are completed',
            'Note any issues or deviations from standard procedures'
          ]
        },
        {
          title: 'Template Management',
          description: 'Maintain and update setup sheet templates to reflect current best practices.',
          tips: [
            'Review templates monthly for accuracy',
            'Incorporate feedback from team members',
            'Version control important template changes',
            'Archive outdated templates for reference'
          ]
        }
      ],
      features: ['Template builder', 'Daily execution', 'Progress tracking', 'Version control']
    },
    {
      id: 'team-surveys',
      title: 'Team Surveys',
      icon: MessageSquare,
      description: 'Gather anonymous feedback from team members to improve workplace culture',
      color: 'bg-teal-100 text-teal-600',
      steps: [
        {
          title: 'Creating Surveys',
          description: 'Design surveys with relevant questions to gather meaningful feedback from your team.',
          tips: [
            'Keep surveys concise to encourage participation',
            'Use a mix of rating scales and open-ended questions',
            'Focus on actionable areas for improvement',
            'Ensure complete anonymity to get honest feedback'
          ]
        },
        {
          title: 'Analyzing Results',
          description: 'Review survey responses to identify trends and areas for improvement.',
          tips: [
            'Look for patterns across multiple responses',
            'Pay attention to both quantitative scores and qualitative comments',
            'Compare results over time to track progress',
            'Share appropriate insights with leadership team'
          ]
        },
        {
          title: 'Taking Action',
          description: 'Develop action plans based on survey feedback and communicate changes to the team.',
          tips: [
            'Prioritize issues that affect the most team members',
            'Create specific, measurable action plans',
            'Communicate back to the team about changes being made',
            'Follow up with subsequent surveys to measure improvement'
          ]
        }
      ],
      features: ['Anonymous feedback', 'Custom questions', 'Analytics dashboard', 'Trend tracking']
    },
    {
      id: 'settings',
      title: 'Settings & Administration',
      icon: Settings,
      description: 'Configure system settings, manage users, and control feature access',
      color: 'bg-slate-100 text-slate-600',
      steps: [
        {
          title: 'User Management',
          description: 'Add, edit, and manage user accounts with appropriate roles and permissions.',
          tips: [
            'Assign roles based on job responsibilities',
            'Regularly review and update user permissions',
            'Deactivate accounts for departed employees promptly',
            'Use strong password requirements for security'
          ]
        },
        {
          title: 'Feature Configuration',
          description: 'Enable or disable features based on your store\'s subscription and needs.',
          tips: [
            'Start with essential features and add others gradually',
            'Train team members before enabling new features',
            'Monitor usage to ensure features are being utilized',
            'Adjust feature access based on team feedback'
          ]
        },
        {
          title: 'System Preferences',
          description: 'Configure system-wide settings like notifications, time zones, and display options.',
          tips: [
            'Set appropriate notification preferences to avoid spam',
            'Configure time zones correctly for accurate reporting',
            'Customize the interface to match your team\'s workflow',
            'Regularly backup important configuration settings'
          ]
        }
      ],
      features: ['User management', 'Role-based access', 'Feature toggles', 'System configuration'],
      troubleshooting: [
        {
          problem: 'Users can\'t access certain features',
          solution: 'Check that the feature is enabled in subscription settings and the user has the appropriate role permissions.'
        },
        {
          problem: 'Notifications not working',
          solution: 'Verify notification settings in user preferences and check that email addresses are correct and verified.'
        },
        {
          problem: 'Data not syncing properly',
          solution: 'Check internet connection and try refreshing the page. Contact support if issues persist.'
        }
      ],
      videos: [
        {
          title: 'Adding New Users',
          url: '/videos/addNewUsers.mp4',
          description: 'Step-by-step guide to adding and managing user accounts in the system'
        }
      ]
    }
  ];

  const filteredSections = howToSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-red-600/10"></div>
        <div className="relative">
          <PageHeader
            title="How To Use LD Growth"
            subtitle="Your complete guide to mastering every feature of the leadership development platform"
            showBackButton={true}
            icon={<BookOpen className="h-6 w-6" />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help topics, features, or instructions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-2xl blur opacity-30"></div>
                  <div className="relative p-3 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-2xl">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Quick Start Guide
                  </CardTitle>
                  <p className="text-gray-600 mt-1">New to LD Growth? Follow these steps to get started!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">Set Up Your Profile</h3>
                      <p className="text-gray-600 text-sm">Complete your user profile and preferences</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">Explore Features</h3>
                      <p className="text-gray-600 text-sm">Browse available features for your store</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">Start Using Tools</h3>
                      <p className="text-gray-600 text-sm">Begin with daily tasks and checklists</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Sections */}
        <div className="space-y-4">
          {filteredSections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);

            return (
              <div key={section.id} id={`${section.id}-section`} className="w-full">
                <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-4"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className={`p-3 ${section.color} rounded-xl shadow-sm`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {section.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 px-6 pb-8">
                      <div className="space-y-8">
                        {/* Videos */}
                        {section.videos && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl"></div>
                            <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
                              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                                <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl">
                                  <Play className="w-5 h-5 text-white" />
                                </div>
                                Video Tutorials
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.videos.map((video, index) => (
                                  <div key={index} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl transform group-hover:scale-105 transition-transform duration-200"></div>
                                    <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden">
                                      <div className="aspect-video bg-gray-100 relative">
                                        <video
                                          controls
                                          className="w-full h-full object-cover"
                                          preload="metadata"
                                        >
                                          <source src={video.url} type="video/mp4" />
                                          Your browser does not support the video tag.
                                        </video>
                                      </div>
                                      <div className="p-4">
                                        <h5 className="font-bold text-gray-900 mb-2">{video.title}</h5>
                                        <p className="text-gray-600 text-sm leading-relaxed">{video.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {section.features && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl"></div>
                            <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                                Key Features
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {section.features.map((feature, index) => (
                                  <div key={index} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl transform group-hover:scale-105 transition-transform duration-200"></div>
                                    <div className="relative p-3 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-200">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                                        <span className="font-medium text-gray-800">{feature}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Steps */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-2xl"></div>
                          <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                              <div className="p-2 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              Step-by-Step Guide
                            </h4>
                            <div className="space-y-6">
                              {section.steps.map((step, index) => (
                                <div key={index} className="group relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-full"></div>
                                  <div className="pl-8 relative">
                                    <div className="absolute -left-2 top-2 w-5 h-5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full border-4 border-white shadow-lg"></div>
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                      <h5 className="font-bold text-gray-900 mb-3 text-lg">{step.title}</h5>
                                      <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>
                                      {step.tips && (
                                        <div className="relative">
                                          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl"></div>
                                          <div className="relative p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200">
                                            <div className="flex items-center gap-3 mb-3">
                                              <div className="p-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg">
                                                <Lightbulb className="w-4 h-4 text-white" />
                                              </div>
                                              <span className="font-bold text-amber-900">Pro Tips</span>
                                            </div>
                                            <ul className="space-y-2">
                                              {step.tips.map((tip, tipIndex) => (
                                                <li key={tipIndex} className="flex items-start gap-3 text-amber-800">
                                                  <div className="mt-1.5">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                  </div>
                                                  <span className="leading-relaxed">{tip}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Troubleshooting */}
                        {section.troubleshooting && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-orange-50/50 rounded-2xl"></div>
                            <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
                              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                                <div className="p-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl">
                                  <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                Troubleshooting
                              </h4>
                              <div className="space-y-4">
                                {section.troubleshooting.map((item, index) => (
                                  <div key={index} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl transform group-hover:scale-105 transition-transform duration-200"></div>
                                    <div className="relative p-5 bg-white rounded-xl border border-orange-200 shadow-sm group-hover:shadow-md transition-all duration-200">
                                      <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex-shrink-0">
                                          <HelpCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-bold text-gray-900 mb-2">{item.problem}</h5>
                                          <p className="text-gray-700 leading-relaxed">{item.solution}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-50/50 rounded-3xl blur-xl"></div>
            <Card className="relative text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
              <CardContent>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-30 w-24 h-24 mx-auto"></div>
                  <div className="relative p-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <HelpCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No results found</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  Try searching with different keywords or browse all sections above to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Quick Help Menu - Positioned above mobile nav */}
        <div className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-40 md:z-50">
          <div className="relative" ref={quickHelpRef}>
            {/* Quick Help Menu */}
            {showQuickHelp && (
              <>
                {/* Mobile: Full-screen overlay */}
                <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm -z-10" onClick={() => setShowQuickHelp(false)} />

                {/* Desktop: Floating menu */}
                <div className="hidden md:block absolute bottom-16 right-0 w-80 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <h3 className="font-bold text-lg">Quick Help</h3>
                        <p className="text-blue-100 text-sm">Jump to common topics</p>
                      </div>
                      <div className="p-2 max-h-96 overflow-y-auto">
                        {quickHelpItems.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={index}
                              onClick={item.action}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-all duration-200 text-left group"
                            >
                              <div className={`p-2 bg-gradient-to-r ${item.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.title}</div>
                                <div className="text-sm text-gray-600">{item.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile: Bottom sheet */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 max-h-[70vh] overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Quick Help</h3>
                        <p className="text-blue-100 text-sm">Jump to common topics</p>
                      </div>
                      <button
                        onClick={() => setShowQuickHelp(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {quickHelpItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={item.action}
                            className="w-full p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-left group active:scale-95"
                          >
                            <div className={`p-3 bg-gradient-to-r ${item.color} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-base">{item.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Quick Help Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Button
                onClick={() => setShowQuickHelp(!showQuickHelp)}
                className="relative w-16 h-16 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl border-2 border-white/20 transform hover:scale-110 active:scale-95 transition-all duration-300 touch-manipulation"
                style={{
                  touchAction: 'manipulation'
                }}
              >
                <HelpCircle className="w-7 h-7 md:w-6 md:h-6" />
              </Button>
              {/* Desktop tooltip only */}
              <div className="hidden md:block absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Quick Help
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowTo;
