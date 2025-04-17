import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Target,
  Plus,
  Trash2,
  GraduationCap,
  Users,
  BookOpen,
  BrainCircuit,
  Presentation,
  Puzzle,
  Calendar,
  Heart,
  Lightbulb,
  Trophy,
  ArrowRight,
  Clock,
  Brain,
  Lock,
  AlertCircle,
  RefreshCw,
  Bug
} from 'lucide-react'
import { format } from 'date-fns'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/axios'

interface SkillAssessment {
  area: string
  currentLevel: number
  targetLevel: number
  developmentPlan: {
    actions: string[]
    resources: string[]
    timeline: string
  }
}

interface DevelopmentActivity {
  title: string
  type: 'training' | 'mentoring' | 'assignment' | 'development'
  description: string
  timeline: string
  status: 'not-started' | 'in-progress' | 'completed'
}

interface Milestone {
  title: string
  dueDate: string
  description: string
}

const LEADERSHIP_PLANS = [
  {
    id: 'heart-of-leadership',
    title: 'The Heart of Leadership',
    description: 'Build a foundation of character-based leadership focused on serving others first - the essential starting point for restaurant leaders.',
    icon: Heart,
    skills: [
      {
        area: 'Lead with Character',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Start each shift by helping a team member with their tasks',
            'Practice active listening during team conversations',
            'Acknowledge mistakes openly and take responsibility'
          ],
          resources: [
            'The Heart of Leadership by Mark Miller',
            '5-minute daily reflection journal'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Put Others First',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Hold weekly one-on-ones with team members',
            'Recognize team member contributions publicly',
            'Ask "How can I help you succeed today?" daily'
          ],
          resources: [
            'One-on-one meeting template',
            'Team recognition ideas'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Character Self-Assessment',
        type: 'development',
        description: 'Complete a brief assessment of your leadership character traits and identify one area to improve.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Team Feedback Session',
        type: 'development',
        description: 'Ask your team for honest feedback on how you can better serve them as a leader.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Character Growth Plan',
        dueDate: '2024-04-15',
        description: 'Create a specific plan to strengthen one leadership character trait'
      },
      {
        title: 'Service-First Leadership',
        dueDate: '2024-05-15',
        description: 'Demonstrate consistent actions that put team needs before your own'
      }
    ]
  },
  {
    id: 'restaurant-culture-builder',
    title: 'Restaurant Culture Builder',
    description: 'Create a positive, high-performing restaurant culture where team members thrive and guests receive exceptional service.',
    icon: Users,
    skills: [
      {
        area: 'Set Clear Expectations',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Create simple, visual standards for each station',
            'Conduct daily pre-shift meetings with clear goals',
            'Provide immediate, specific feedback'
          ],
          resources: [
            'Visual standards template',
            'Pre-shift meeting guide'
          ],
          timeline: '2-weeks'
        }
      },
      {
        area: 'Build Team Unity',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Implement team huddles during shifts',
            'Create cross-training opportunities',
            'Celebrate team wins consistently'
          ],
          resources: [
            'Team huddle format',
            'Cross-training schedule template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Culture Assessment',
        type: 'development',
        description: 'Survey your team to identify cultural strengths and opportunities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Team Values Workshop',
        type: 'training',
        description: 'Lead a brief session to define your team\'s core values and behaviors.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Team Values Defined',
        dueDate: '2024-05-01',
        description: 'Document and display your team\'s core values and expected behaviors'
      },
      {
        title: 'Culture Reinforcement System',
        dueDate: '2024-06-01',
        description: 'Implement a system to recognize and reward values-aligned behaviors'
      }
    ]
  },
  {
    id: 'guest-experience-master',
    title: 'Guest Experience Master',
    description: 'Apply Truett Cathy\'s principles to create remarkable guest experiences that build loyalty and drive business results.',
    icon: Heart,
    skills: [
      {
        area: 'Second-Mile Service',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify 3 "second-mile" service opportunities for your restaurant',
            'Train team on recognizing guest needs before they\'re expressed',
            'Share and celebrate second-mile service stories daily'
          ],
          resources: [
            'Second-mile service examples',
            'Guest need anticipation guide'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Service Recovery',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Implement the LAST model: Listen, Apologize, Solve, Thank',
            'Empower team members to resolve guest issues on the spot',
            'Debrief service failures to prevent recurrence'
          ],
          resources: [
            'LAST model quick reference',
            'Service recovery role-play scenarios'
          ],
          timeline: '2-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Guest Journey Mapping',
        type: 'development',
        description: 'Map your guest experience from arrival to departure, identifying moments that matter.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Service Standards Workshop',
        type: 'training',
        description: 'Define specific, observable service behaviors for each guest touchpoint.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Service Standards Implementation',
        dueDate: '2024-05-15',
        description: 'Train all team members on new service standards and expectations'
      },
      {
        title: 'Guest Feedback System',
        dueDate: '2024-06-15',
        description: 'Implement a simple system to collect and act on guest feedback'
      }
    ]
  },
  {
    id: 'team-development',
    title: 'Team Development Expert',
    description: 'Build a high-performing restaurant team by mastering the art of hiring, training, and developing exceptional team members.',
    icon: Users,
    skills: [
      {
        area: 'Effective Coaching',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Use the "Tell-Show-Do-Review" method for skill training',
            'Provide specific, behavior-focused feedback',
            'Ask powerful questions that promote self-discovery'
          ],
          resources: [
            'Coaching conversation guide',
            'Feedback formula template'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Talent Development',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify potential in team members using the "will/skill" matrix',
            'Create simple development plans for high-potential team members',
            'Provide stretch assignments that build new capabilities'
          ],
          resources: [
            'Will/skill assessment tool',
            'Development plan template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Team Skills Assessment',
        type: 'development',
        description: 'Evaluate your team\'s current capabilities and identify development needs.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Coaching Practice Sessions',
        type: 'training',
        description: 'Conduct structured practice of coaching conversations with peer feedback.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Team Development Plans',
        dueDate: '2024-06-01',
        description: 'Create development plans for all team members'
      },
      {
        title: 'Coaching Effectiveness Review',
        dueDate: '2024-07-15',
        description: 'Gather feedback on coaching effectiveness and adjust approach'
      }
    ]
  },
  {
    id: 'operational-excellence',
    title: 'Operational Excellence',
    description: 'Master the fundamentals of restaurant operations to deliver consistent quality, speed, and efficiency that drives business results.',
    icon: Brain,
    skills: [
      {
        area: 'Process Optimization',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify and eliminate bottlenecks in service delivery',
            'Implement visual management tools for key processes',
            'Conduct regular process audits and improvements'
          ],
          resources: [
            'Process mapping template',
            'Visual management examples'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Performance Management',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Set clear, measurable targets for key performance indicators',
            'Implement daily/weekly performance tracking',
            'Hold effective performance conversations'
          ],
          resources: [
            'KPI tracking template',
            'Performance conversation guide'
          ],
          timeline: '2-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Operations Assessment',
        type: 'development',
        description: 'Evaluate current operational performance against standards and identify gaps.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Process Improvement Project',
        type: 'assignment',
        description: 'Select one operational process to optimize for better results.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Performance Dashboard',
        dueDate: '2024-05-15',
        description: 'Implement visual tracking of key performance metrics'
      },
      {
        title: 'Process Improvement Results',
        dueDate: '2024-07-01',
        description: 'Document measurable improvements from process optimization'
      }
    ]
  }
]

export default function NewDevelopmentalPlan() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [assignee, setAssignee] = useState('')
  const [initialComments, setInitialComments] = useState('')
  // Use the subscription context
  const { hasActiveSubscription, subscriptionStatus, loading, refreshSubscription } = useSubscription()
  const [refreshing, setRefreshing] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSubscription()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const fetchDebugInfo = async () => {
    try {
      const response = await api.get('/api/leadership/subscription-debug')
      setDebugInfo(response.data)
      setShowDebug(true)
    } catch (error) {
      console.error('Error fetching debug info:', error)
      setDebugInfo({ error: 'Failed to fetch subscription data' })
      setShowDebug(true)
    }
  }

  const handlePlanSelection = (planId: string) => {
    // Always allow access to the first plan (heart-of-leadership)
    if (planId === 'heart-of-leadership' || hasActiveSubscription) {
      setSelectedPlan(selectedPlan === planId ? '' : planId)
    } else {
      // For other plans, only allow selection if subscription is active
      setSelectedPlan('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Leadership Development Plans</h1>
            <p className="text-gray-600">
              Select a development plan to help you grow as a leader.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDebugInfo}
              className="flex items-center gap-1"
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
          </div>
        </div>
      <div className="space-y-6">
        {LEADERSHIP_PLANS.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          return (
            <div key={plan.id} className="space-y-4">
              <Card className="bg-white p-6 hover:shadow-xl transition-all duration-300 relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#27251F]">{plan.title}</h3>
                      {plan.id === 'heart-of-leadership' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Free Access
                        </Badge>
                      )}
                      {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          <Lock className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-500">{plan.skills.length} Core Skills</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5 rounded-xl"
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={plan.id !== 'heart-of-leadership' && !hasActiveSubscription}
                    >
                      <span className="mr-2">{isSelected ? 'Close Details' : 'View Details'}</span>
                      <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>
                </div>
                {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && (
                  <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center">
                      <Lock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                      <h4 className="font-semibold text-gray-800 mb-1">Premium Content</h4>
                      <p className="text-sm text-gray-600 mb-3">This leadership plan requires a subscription.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        onClick={() => navigate('/leadership/subscription')}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {isSelected && (
                <div className="space-y-6 pl-4 border-l-2 border-[#E51636]">
                  <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-50">
                    <div className="space-y-6">
                      {/* Core Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Core Skills to Develop</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {plan.skills.map((skill, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-[#27251F]">{skill.area}</h4>
                                <span className="text-sm text-[#E51636]">Target Level: {skill.targetLevel}/5</span>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Development Actions:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {skill.developmentPlan.actions.map((action, i) => (
                                      <li key={i} className="text-sm text-gray-600">{action}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Required Resources:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {skill.developmentPlan.resources.map((resource, i) => (
                                      <li key={i} className="text-sm text-gray-600">{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Timeline: {skill.developmentPlan.timeline}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Development Activities */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Development Activities</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {plan.activities.map((activity, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-6 w-6 bg-[#E51636]/10 text-[#E51636] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                  {activity.type === 'training' && <BookOpen className="h-4 w-4" />}
                                  {activity.type === 'mentoring' && <Users className="h-4 w-4" />}
                                  {activity.type === 'assignment' && <Puzzle className="h-4 w-4" />}
                                  {activity.type === 'development' && <BrainCircuit className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#27251F]">{activity.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {activity.timeline}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Key Milestones</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {plan.milestones.map((milestone, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                              <h4 className="font-medium text-[#27251F]">{milestone.title}</h4>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => navigate(`/leadership/developmental-plans/${plan.id}`)}
                          className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
                        >
                          Select This Plan
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )
        })}
      </div>
      </div>

      {showDebug && debugInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Subscription Debug Information</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>Close</Button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Subscription Status</h4>
                <div className="bg-gray-100 p-2 rounded mb-2">
                  <p><strong>Has Active Subscription:</strong> {hasActiveSubscription ? 'Yes' : 'No'}</p>
                  <p><strong>Status:</strong> {subscriptionStatus}</p>
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mb-4"
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Subscription Status'}
                </Button>
              </div>

              <h4 className="font-medium mb-2">Debug Data from Server</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-[300px]">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}