import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  BookOpen,
  Users,
  BrainCircuit,
  Presentation,
  Calendar,
  Heart,
  ArrowRight,
  Clock,
  Brain,
  GraduationCap,
  Trophy,
  Lightbulb
} from 'lucide-react'

interface Module {
  title: string
  description: string
  duration: string
  format: 'workshop' | 'online' | 'hybrid' | 'mentoring' | 'self-paced' | 'real-world practice'
  objectives: string[]
  topics: string[]
  resources: string[]
  realWorldPractice?: {
    projects: string
    mentorship: string
    reflection: string
    networking: string
    assessment: string
    documentation: string
    inStoreLeadershipProjects: string
    dailyReflection: string
    activeListening: string
    empowerTeamMembers: string
    serveInUnexpectedWays: string
    mentorTeamMember: string
  }
}

interface TrainingProgram {
  id: string
  title: string
  description: string
  icon: any
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  modules: Module[]
  certification: {
    title: string
    requirements: string[]
  }
}

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'servant-leadership-foundations',
    title: 'Servant Leadership Foundations',
    description: 'Master the core principles of servant leadership through Truett Cathy\'s philosophy and practical application.',
    icon: Heart,
    level: 'beginner',
    duration: '12 weeks',
    modules: [
      {
        title: 'Understanding Servant Leadership',
        description: 'Explore the fundamental principles of servant leadership and its impact on organizational culture.',
        duration: '2 weeks',
        format: 'self-paced',
        objectives: [
          'Define servant leadership and its key principles',
          'Understand Truett Cathy\'s leadership philosophy',
          'Identify characteristics of servant leaders',
          'Learn the impact of servant leadership on team performance'
        ],
        topics: [
          'History and evolution of servant leadership',
          'Truett Cathy\'s leadership principles',
          'The servant leader mindset',
          'Building trust through service'
        ],
        resources: [
          'Book: "Servant Leadership: A Journey into the Nature of Legitimate Power and Greatness" by Robert K. Greenleaf',
          'Book: "It\'s My Pleasure: The Impact of Extraordinary Talent and a Compelling Culture" by Dee Ann Turner',
          'Book: "The Secret: What Great Leaders Know and Do" by Mark Miller and Ken Blanchard',
          'Book: "Eat Mor Chikin: Inspire More People" by S. Truett Cathy',
          'Podcast: ["Serving the Common Good"](https://open.spotify.com/episode/4MY2CB7BDVReqlZGgqqd0a)',
          'Podcast: ["Do Good Anyway"](https://open.spotify.com/episode/6id2sjbE6b6Wf0YYhcJwdO)',
          'Video: [What is Servant Leadership?](https://www.youtube.com/watch?v=h82Goqo3Yys&t=61s&pp=ygUhd2hhdCBpcyBzZXJ2YW50IGxlYWRlcnNoaXAgcmVhbGx5)'
        ]
      },
      {
        title: 'Practicing Servant Leadership',
        description: 'Develop practical skills and habits of effective servant leaders.',
        duration: '3 weeks',
        format: 'real-world practice',
        objectives: [
          'Develop active listening skills',
          'Practice empathy in leadership',
          'Learn to empower and develop others',
          'Create a service-oriented culture'
        ],
        topics: [
          'Active Listening Techniques',
          'Empathy in Leadership',
          'Team Empowerment Strategies',
          'Building a Service Culture'
        ],
        resources: [],
        realWorldPractice: {
          projects: 'Undertake specific projects to apply learning in real-world contexts',
          mentorship: 'Pair with mentors for guidance and feedback',
          reflection: 'Reflect on experiences and gather feedback',
          networking: 'Participate in networking events with industry professionals',
          assessment: 'Assessment and evaluation of practical skills',
          documentation: 'Document experiences and outcomes for certification',
          inStoreLeadershipProjects: 'Lead initiatives to improve customer service or team collaboration',
          dailyReflection: 'Reflect daily on interactions with team members and customers',
          activeListening: 'Practice active listening with team members and customers',
          empowerTeamMembers: 'Empower team members by delegating responsibilities',
          serveInUnexpectedWays: 'Find small, unexpected ways to serve others',
          mentorTeamMember: 'Mentor a team member by sharing experiences and insights'
        }
      }
    ],
    certification: {
      title: 'Certified Servant Leader',
      requirements: [
        'Complete all books, podcasts, and videos',
        'Complete the real-world practice activities',
        'Get checked off by a Director'
      ],
    }
  },
  {
    id: 'strategic-leadership-mastery',
    title: 'Strategic Leadership Mastery',
    description: 'Coming Soon',
    icon: Brain,
    level: 'advanced',
    duration: '16 weeks',
    modules: [
      {
        title: 'Strategic Thinking Fundamentals',
        description: 'Master the core principles of strategic thinking and long-term planning.',
        duration: '4 weeks',
        format: 'hybrid',
        objectives: [
          'Understand strategic thinking frameworks',
          'Develop long-term planning skills',
          'Learn scenario analysis techniques',
          'Master strategic decision-making'
        ],
        topics: [
          'Strategic Thinking Models',
          'Long-term Planning Methods',
          'Scenario Analysis',
          'Decision-Making Frameworks'
        ],
        resources: [
          'Strategic Planning Toolkit',
          'Case Studies Collection',
          'Decision Analysis Software',
          'Planning Templates'
        ]
      },
      {
        title: 'Strategic Execution',
        description: 'Learn to implement strategic initiatives effectively.',
        duration: '4 weeks',
        format: 'workshop',
        objectives: [
          'Develop project execution skills',
          'Learn change management techniques',
          'Master resource allocation',
          'Create effective monitoring systems'
        ],
        topics: [
          'Project Management Methodologies',
          'Change Management',
          'Resource Optimization',
          'Performance Monitoring'
        ],
        resources: [
          'Project Management Tools',
          'Change Management Toolkit',
          'Resource Planning Templates',
          'KPI Dashboard Examples'
        ]
      }
    ],
    certification: {
      title: 'Certified Strategic Leader',
      requirements: [
        'Complete all strategic assessments',
        'Develop and present a strategic plan',
        'Lead a strategic initiative',
        'Pass certification examination'
      ],
    }
  },
  {
    id: 'leadership-culture-builder',
    title: 'Leadership Culture Builder',
    description: 'Coming Soon',
    icon: Users,
    level: 'intermediate',
    duration: '14 weeks',
    modules: [
      {
        title: 'Building Leadership Culture',
        description: 'Learn to create and maintain a strong leadership culture.',
        duration: '3 weeks',
        format: 'hybrid',
        objectives: [
          'Define organizational leadership culture',
          'Identify cultural strengths and gaps',
          'Develop culture change strategies',
          'Create leadership development systems'
        ],
        topics: [
          'Cultural Assessment Methods',
          'Leadership Development Systems',
          'Culture Change Management',
          'Measuring Cultural Impact'
        ],
        resources: [
          'Culture Assessment Tools',
          'Leadership System Templates',
          'Change Management Guide',
          'Measurement Frameworks'
        ]
      },
      {
        title: 'Sustaining Leadership Excellence',
        description: 'Develop systems for maintaining leadership excellence.',
        duration: '3 weeks',
        format: 'workshop',
        objectives: [
          'Create sustainable leadership practices',
          'Develop succession planning',
          'Build mentoring programs',
          'Establish leadership metrics'
        ],
        topics: [
          'Sustainable Leadership Practices',
          'Succession Planning',
          'Mentoring Program Design',
          'Leadership Metrics'
        ],
        resources: [
          'Succession Planning Templates',
          'Mentoring Program Guide',
          'Leadership Metrics Dashboard',
          'Best Practices Library'
        ]
      }
    ],
    certification: {
      title: 'Certified Culture Builder',
      requirements: [
        'Complete culture assessment project',
        'Develop leadership system plan',
        'Implement culture initiative',
        'Pass certification exam'
      ],
    }
  }
]

export default function TrainingPrograms() {
  const navigate = useNavigate()
  const [selectedProgram, setSelectedProgram] = useState<string>('')

  const handleProgramSelection = (programId: string) => {
    setSelectedProgram(selectedProgram === programId ? '' : programId)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {TRAINING_PROGRAMS.map((program) => {
          const Icon = program.icon
          const isSelected = selectedProgram === program.id
          return (
            <div key={program.id} className="space-y-4">
              <Card className="bg-white p-6 hover:shadow-xl transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#E51636]/10 text-[#E51636] rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#27251F]">{program.title}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          program.level === 'beginner' ? 'bg-green-100 text-green-700' :
                          program.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {program.level.charAt(0).toUpperCase() + program.level.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{program.description}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-gray-500">{program.modules.length} Modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-gray-500">{program.duration}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5 rounded-xl"
                      onClick={() => handleProgramSelection(program.id)}
                    >
                      <span className="mr-2">{isSelected ? 'Close Details' : 'View Details'}</span>
                      <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>
                </div>
              </Card>

              {isSelected && (
                <div className="space-y-6 pl-4 border-l-2 border-[#E51636]">
                  <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-50">
                    <div className="space-y-6">
                      {/* Modules */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F]">Program Modules</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {program.modules.map((module, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-[#27251F]">{module.title}</h4>
                                  <span className={`text-sm px-3 py-1 rounded-full ${
                                    module.format === 'workshop' ? 'bg-blue-100 text-blue-700' :
                                    module.format === 'online' ? 'bg-green-100 text-green-700' :
                                    module.format === 'hybrid' ? 'bg-purple-100 text-purple-700' :
                                    module.format === 'real-world practice' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {module.format.charAt(0).toUpperCase() + module.format.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{module.description}</p>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {module.objectives.map((objective, i) => (
                                      <li key={i} className="text-sm text-gray-600">{objective}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Topics:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {module.topics.map((topic, i) => (
                                      <li key={i} className="text-sm text-gray-600">{topic}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Real-World Practice:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {Object.entries(module.realWorldPractice || {}).map(([key, value], i) => (
                                      <li key={i} className="text-sm text-gray-600">{value}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Resources:</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {module.resources.map((resource, i) => (
                                      <li key={i} className="text-sm text-gray-600">{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certification */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#27251F] flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-[#E51636]" />
                          Certification
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <h4 className="font-medium text-[#27251F]">{program.certification.title}</h4>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {program.certification.requirements.map((requirement, i) => (
                                <li key={i} className="text-sm text-gray-600">{requirement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => navigate(`/leadership/training-programs/${program.id}`)}
                          className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
                        >
                          Enroll in Program
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
  )
} 