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
  Bug,
  MessageSquare,
  Settings
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
    description: 'Build a foundation of character-based leadership focused on serving others first. This plan develops the essential leadership traits that inspire team members to follow you because of who you are, not just your position.',
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
    description: 'Learn to intentionally shape your restaurant\'s culture to create an environment where team members are engaged, guests receive exceptional service, and business results follow. This plan provides practical tools for building a thriving culture.',
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
            'Cross-training schedule template',
            '90-Day Culture Leadership Plan Template (downloadable)',
            '90-Day Culture Leadership Plan Example (Chick-fil-A)'
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
    id: 'team-development',
    title: 'Team Development Expert',
    description: 'Master the skills of coaching, feedback, and talent development to build a high-performing restaurant team. This plan equips you with practical tools to help each team member reach their full potential while driving operational excellence.',
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
            'Identify high-potential team members',
            'Create personalized development plans',
            'Provide stretch assignments for growth'
          ],
          resources: [
            'Potential assessment guide',
            'Development plan template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Coaching Practice',
        type: 'development',
        description: 'Practice coaching conversations with a peer or mentor for feedback.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Team Member Development Plan',
        type: 'assignment',
        description: 'Create a development plan for one high-potential team member.',
        timeline: '3 weeks',
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
    id: 'strategic-leadership',
    title: 'Strategic Leadership Mastery',
    description: 'Develop strategic thinking, vision-setting, and decision-making capabilities to drive organizational success. This plan builds the skills needed to think beyond day-to-day operations and lead with strategic purpose.',
    icon: Target,
    skills: [
      {
        area: 'Strategic Thinking',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Analyze industry trends and their impact on your restaurant',
            'Practice the "5 Whys" technique for root cause analysis',
            'Create monthly strategic reviews with your team'
          ],
          resources: [
            'Strategic Thinking for Leaders course',
            'Industry trend analysis template'
          ],
          timeline: '6-weeks'
        }
      },
      {
        area: 'Vision & Direction',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Develop a clear 90-day vision for your team',
            'Communicate vision through storytelling',
            'Align daily operations with long-term goals'
          ],
          resources: [
            'Vision crafting workshop',
            'Storytelling for leaders guide'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Strategic Planning Session',
        type: 'development',
        description: 'Lead a strategic planning session with your team to set quarterly goals.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Industry Analysis Project',
        type: 'assignment',
        description: 'Research and present on industry trends affecting your restaurant.',
        timeline: '4 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Strategic Plan Development',
        dueDate: '2024-06-01',
        description: 'Create a comprehensive strategic plan for your team'
      },
      {
        title: 'Vision Communication',
        dueDate: '2024-07-01',
        description: 'Successfully communicate and align team with strategic vision'
      }
    ]
  },
  {
    id: 'communication-influence',
    title: 'Communication & Influence Excellence',
    description: 'Master the art of clear communication and positive influence to inspire teams and drive results. This plan develops both verbal and non-verbal communication skills essential for effective leadership.',
    icon: MessageSquare,
    skills: [
      {
        area: 'Clear Communication',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Practice the "Tell-Show-Check" communication method',
            'Use active listening techniques in all conversations',
            'Provide specific, actionable feedback daily'
          ],
          resources: [
            'Communication skills workshop',
            'Active listening checklist'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Positive Influence',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Build rapport with team members through genuine interest',
            'Use persuasion techniques based on understanding others\' motivations',
            'Lead by example in all situations'
          ],
          resources: [
            'Influence without authority guide',
            'Rapport building techniques'
          ],
          timeline: '5-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Communication Style Assessment',
        type: 'development',
        description: 'Complete an assessment to understand your communication style and its impact.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Presentation Skills Practice',
        type: 'training',
        description: 'Practice presenting to your team and receive feedback on delivery.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Communication Improvement',
        dueDate: '2024-05-15',
        description: 'Demonstrate measurable improvement in communication effectiveness'
      },
      {
        title: 'Influence Mastery',
        dueDate: '2024-06-15',
        description: 'Successfully influence positive change in team behavior'
      }
    ]
  },
  {
    id: 'operational-excellence',
    title: 'Operational Excellence Leader',
    description: 'Drive efficiency, quality, and continuous improvement in restaurant operations. This plan equips you with the tools and mindset to optimize processes and deliver consistent results.',
    icon: Settings,
    skills: [
      {
        area: 'Process Improvement',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Map current processes and identify bottlenecks',
            'Implement small improvements weekly',
            'Track and measure process efficiency metrics'
          ],
          resources: [
            'Process mapping template',
            'Lean restaurant operations guide'
          ],
          timeline: '6-weeks'
        }
      },
      {
        area: 'Quality Management',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Establish quality standards for all key processes',
            'Conduct regular quality audits',
            'Train team on quality expectations and procedures'
          ],
          resources: [
            'Quality management system',
            'Audit checklist template'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Process Improvement Project',
        type: 'assignment',
        description: 'Identify and improve one key operational process in your restaurant.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Efficiency Metrics Dashboard',
        type: 'development',
        description: 'Create a dashboard to track key operational efficiency metrics.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Process Optimization',
        dueDate: '2024-06-01',
        description: 'Complete optimization of one major operational process'
      },
      {
        title: 'Quality System Implementation',
        dueDate: '2024-07-15',
        description: 'Implement comprehensive quality management system'
      }
    ]
  },
  {
    id: 'innovation-change',
    title: 'Innovation & Change Champion',
    description: 'Lead innovation initiatives and guide teams through change with confidence. This plan develops the skills needed to foster creativity, adapt to change, and drive continuous improvement.',
    icon: Lightbulb,
    skills: [
      {
        area: 'Change Leadership',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Communicate the "why" behind changes clearly',
            'Address resistance with empathy and understanding',
            'Celebrate small wins during change initiatives'
          ],
          resources: [
            'Change management framework',
            'Resistance management guide'
          ],
          timeline: '5-weeks'
        }
      },
      {
        area: 'Innovation Mindset',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Encourage team members to suggest improvements',
            'Test small experiments before major changes',
            'Learn from failures and iterate quickly'
          ],
          resources: [
            'Innovation workshop materials',
            'Experimentation framework'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Innovation Challenge',
        type: 'development',
        description: 'Lead a team innovation challenge to improve customer experience.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Change Management Case Study',
        type: 'training',
        description: 'Study a successful change initiative and present learnings to leadership.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
    milestones: [
      {
        title: 'Innovation Implementation',
        dueDate: '2024-06-15',
        description: 'Successfully implement one innovative solution'
      },
      {
        title: 'Change Leadership Mastery',
        dueDate: '2024-08-01',
        description: 'Lead a major change initiative with positive outcomes'
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
                                      <li key={i} className="text-sm text-gray-600">
                                        {resource.includes('90-Day Culture Leadership Plan Template') ? (
                                          <button
                                            onClick={() => window.open('/templates/90-day-culture-leadership-plan.html', '_blank')}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          >
                                            {resource}
                                          </button>
                                        ) : resource.includes('90-Day Culture Leadership Plan Example') ? (
                                          <button
                                            onClick={() => window.open('/templates/90-day-culture-leadership-plan-example.html', '_blank')}
                                            className="text-green-600 hover:text-green-800 hover:underline cursor-pointer"
                                          >
                                            {resource}
                                          </button>
                                        ) : (
                                          resource
                                        )}
                                      </li>
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