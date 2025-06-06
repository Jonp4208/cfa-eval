import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Users,
  BookOpen,
  BrainCircuit,
  Puzzle,
  Heart,
  Lock,
  CheckCircle,
  Loader2,
  Clock,
  ArrowRight,
  Target,
  MessageSquare,
  Settings,
  Lightbulb
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
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
  },
  {
    id: 'restaurant-culture-builder',
    title: 'Restaurant Culture Builder',
    description: 'Learn to intentionally shape your restaurant\'s culture to create an environment where team members are engaged, guests receive exceptional service, and business results follow. This comprehensive 8-week plan provides practical tools for building a thriving culture.',
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
            'Provide immediate, specific feedback',
            'Develop accountability systems for standards',
            'Train team leaders on expectation setting'
          ],
          resources: [
            'Book: "The Culture Map" by Erin Meyer (free at local library)',
            'Free visual standards template (Google Docs)',
            'Free pre-shift meeting checklist (downloadable PDF)',
            'YouTube: "The 5 Levels of Leadership" by John Maxwell'
          ],
          timeline: '3-weeks'
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
            'Celebrate team wins consistently',
            'Establish team traditions and rituals',
            'Foster peer-to-peer recognition programs'
          ],
          resources: [
            'Book: "The Five Dysfunctions of a Team" by Patrick Lencioni (free audiobook on Spotify)',
            'Free team huddle template (Google Sheets)',
            'Free cross-training tracker (Excel template)',
            'YouTube: "How Great Leaders Inspire Action" by Simon Sinek (TED Talk)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Culture Reinforcement',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Create culture scorecards and metrics',
            'Implement regular culture check-ins',
            'Address culture violations immediately',
            'Reward culture champions publicly',
            'Integrate culture into hiring and training'
          ],
          resources: [
            'Book: "Delivering Happiness" by Tony Hsieh (free PDF online)',
            'Free culture scorecard template (Google Docs)',
            'Free culture interview questions (downloadable PDF)',
            'Podcast: "Culture by Design" episodes (free on Apple Podcasts)',
            '90-Day Culture Leadership Plan Template (downloadable)',
            '90-Day Culture Leadership Plan Example (Chick-fil-A)'
          ],
          timeline: '2-weeks'
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
        description: 'Lead a comprehensive session to define your team\'s core values and behaviors.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Culture Implementation Project',
        type: 'assignment',
        description: 'Design and implement a culture improvement initiative for your restaurant.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Leadership Culture Coaching',
        type: 'mentoring',
        description: 'Work with a mentor to refine your culture-building leadership style.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'team-development',
    title: 'Team Development Expert',
    description: 'Master the skills of coaching, feedback, and talent development to build a high-performing restaurant team. This comprehensive 10-week plan equips you with practical tools to help each team member reach their full potential while driving operational excellence.',
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
            'Ask powerful questions that promote self-discovery',
            'Practice active listening and empathy in coaching',
            'Develop coaching plans for different personality types'
          ],
          resources: [
            'Book: "The Coaching Habit" by Michael Bungay Stanier (free summary on Blinkist trial)',
            'Free coaching conversation template (Google Docs)',
            'YouTube: "Active Listening Skills" by TED-Ed (free)',
            'Free personality assessment: 16Personalities.com'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Talent Development',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify high-potential team members using assessment tools',
            'Create personalized development plans for each team member',
            'Provide stretch assignments for growth',
            'Implement succession planning for key positions',
            'Track and measure development progress'
          ],
          resources: [
            'Book: "Multipliers" by Liz Wiseman (free at local library)',
            'Free development plan template (Microsoft Word online)',
            'Free succession planning guide (SHRM.org)',
            'Free progress tracking spreadsheet (Google Sheets)'
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
            'Conduct regular one-on-one performance discussions',
            'Set SMART goals with team members',
            'Address performance issues promptly and fairly',
            'Recognize and reward high performance',
            'Create performance improvement plans when needed'
          ],
          resources: [
            'Book: "Radical Candor" by Kim Scott (free summary on YouTube)',
            'Free one-on-one meeting template (Notion.so)',
            'Free SMART goals worksheet (MindTools.com)',
            'Free performance improvement plan template (HR.com)'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Coaching Skills Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your current coaching abilities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Coaching Practice Sessions',
        type: 'training',
        description: 'Practice coaching conversations with peers and receive detailed feedback.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Team Development Project',
        type: 'assignment',
        description: 'Create and implement development plans for your entire team.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Performance Management Workshop',
        type: 'training',
        description: 'Learn advanced performance management techniques and tools.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'strategic-leadership',
    title: 'Strategic Leadership Mastery',
    description: 'Develop strategic thinking, vision-setting, and decision-making capabilities to drive organizational success. This comprehensive 12-week plan builds the skills needed to think beyond day-to-day operations and lead with strategic purpose.',
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
            'Create monthly strategic reviews with your team',
            'Develop scenario planning for different business conditions',
            'Learn competitive analysis and market positioning'
          ],
          resources: [
            'Book: "Good Strategy Bad Strategy" by Richard Rumelt (free at local library)',
            'Free industry analysis template (McKinsey Insights)',
            'Free scenario planning guide (MIT Sloan free resources)',
            'YouTube: "What is Strategy?" by Harvard Business Review'
          ],
          timeline: '4-weeks'
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
            'Align daily operations with long-term goals',
            'Create visual representations of your vision',
            'Build consensus around shared vision'
          ],
          resources: [
            'Book: "Start with Why" by Simon Sinek (free TED Talk + summary)',
            'Free vision statement template (Business.gov.au)',
            'YouTube: "The Power of Storytelling" by TED',
            'Free consensus building guide (Harvard Negotiation Project)'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Decision Making Excellence',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn structured decision-making frameworks',
            'Practice data-driven decision making',
            'Develop risk assessment capabilities',
            'Improve decision timing and execution',
            'Build decision accountability systems'
          ],
          resources: [
            'Book: "Decisive" by Chip Heath & Dan Heath (free summary on Blinkist trial)',
            'Free decision matrix template (Smartsheet.com)',
            'Free risk assessment worksheet (ISO 31000 guide)',
            'YouTube: "Better Decision Making" by TED-Ed'
          ],
          timeline: '4-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Strategic Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your strategic leadership capabilities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Strategic Planning Workshop',
        type: 'training',
        description: 'Participate in an intensive strategic planning workshop.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Vision Implementation Project',
        type: 'assignment',
        description: 'Develop and implement a strategic vision for your restaurant.',
        timeline: '6 weeks',
        status: 'not-started'
      },
      {
        title: 'Strategic Mentoring',
        type: 'mentoring',
        description: 'Work with a strategic leadership mentor to refine your approach.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'communication-influence',
    title: 'Communication & Influence Excellence',
    description: 'Master the art of clear communication and positive influence to inspire teams and drive results. This comprehensive 10-week plan develops both verbal and non-verbal communication skills essential for effective leadership.',
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
            'Provide specific, actionable feedback daily',
            'Master non-verbal communication and body language',
            'Develop written communication excellence'
          ],
          resources: [
            'Book: "Crucial Conversations" by Kerry Patterson (free at local library)',
            'Free active listening checklist (MindTools.com)',
            'YouTube: "Body Language Secrets" by Vanessa Van Edwards',
            'Free email templates (Grammarly.com free resources)'
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
            'Lead by example in all situations',
            'Practice influence without authority techniques',
            'Develop emotional intelligence for better influence'
          ],
          resources: [
            'Book: "Influence: The Psychology of Persuasion" by Robert Cialdini (free summary online)',
            'Free rapport building guide (Dale Carnegie free resources)',
            'YouTube: "6 Principles of Persuasion" by Robert Cialdini',
            'Free emotional intelligence assessment (Psychology Today)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Difficult Conversations',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn the CRUCIAL conversations framework',
            'Practice delivering difficult feedback constructively',
            'Master conflict resolution communication',
            'Develop skills for crucial accountability conversations',
            'Build confidence in challenging discussions'
          ],
          resources: [
            'Book: "Difficult Conversations" by Douglas Stone (free at local library)',
            'Free feedback conversation template (15Five.com)',
            'YouTube: "How to Have Difficult Conversations" by TED',
            'Free conflict resolution guide (Harvard Law School)'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Communication Style Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your communication style and its impact.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Presentation Skills Mastery',
        type: 'training',
        description: 'Intensive training on presentation and public speaking skills.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Influence Practice Project',
        type: 'assignment',
        description: 'Lead a change initiative using influence techniques without formal authority.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Communication Coaching',
        type: 'mentoring',
        description: 'Work with a communication coach to refine your leadership communication.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'operational-excellence',
    title: 'Operational Excellence Leader',
    description: 'Drive efficiency, quality, and continuous improvement in restaurant operations. This comprehensive 10-week plan equips you with the tools and mindset to optimize processes and deliver consistent results.',
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
            'Track and measure process efficiency metrics',
            'Learn Lean Six Sigma principles for restaurants',
            'Create standard operating procedures for all processes'
          ],
          resources: [
            'Book: "The Lean Startup" by Eric Ries (free summary on YouTube)',
            'Free process mapping template (Lucidchart.com)',
            'Free Lean Six Sigma Yellow Belt course (GoLeanSixSigma.com)',
            'Free SOP template (Process.st)'
          ],
          timeline: '4-weeks'
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
            'Train team on quality expectations and procedures',
            'Implement quality control checkpoints',
            'Develop corrective action procedures'
          ],
          resources: [
            'Book: "Out of the Crisis" by W. Edwards Deming (free PDF online)',
            'Free quality audit checklist (ASQ.org)',
            'YouTube: "Quality Management Principles" by ASQ',
            'Free corrective action template (SafetyCulture.com)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Performance Analytics',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Identify key performance indicators for your restaurant',
            'Implement data collection and analysis systems',
            'Create performance dashboards and reports',
            'Use data to drive operational decisions',
            'Train team on performance metrics importance'
          ],
          resources: [
            'Book: "Lean Analytics" by Alistair Croll (free summary online)',
            'Free KPI template (Klipfolio.com)',
            'Free Google Data Studio course (Google Analytics Academy)',
            'YouTube: "Data-Driven Decision Making" by MIT'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Operational Assessment',
        type: 'development',
        description: 'Complete a comprehensive assessment of your current operational effectiveness.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Lean Operations Training',
        type: 'training',
        description: 'Intensive training on Lean principles and waste elimination in restaurants.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Process Optimization Project',
        type: 'assignment',
        description: 'Lead a major process improvement initiative in your restaurant.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Quality System Implementation',
        type: 'assignment',
        description: 'Design and implement a comprehensive quality management system.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'innovation-change',
    title: 'Innovation & Change Champion',
    description: 'Lead innovation initiatives and guide teams through change with confidence. This comprehensive 9-week plan develops the skills needed to foster creativity, adapt to change, and drive continuous improvement.',
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
            'Celebrate small wins during change initiatives',
            'Build change readiness in your team',
            'Create change communication plans'
          ],
          resources: [
            'Book: "Switch" by Chip Heath & Dan Heath (free summary on Blinkist trial)',
            'Free change management guide (Prosci.com free resources)',
            'YouTube: "Leading Change" by John Kotter',
            'Free change communication template (McKinsey Insights)'
          ],
          timeline: '3-weeks'
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
            'Learn from failures and iterate quickly',
            'Create innovation time and space for team',
            'Implement idea generation and evaluation systems'
          ],
          resources: [
            'Book: "The Innovator\'s Dilemma" by Clayton Christensen (free at local library)',
            'Free innovation workshop toolkit (IDEO Design Kit)',
            'YouTube: "Creative Thinking Techniques" by Stanford d.school',
            'Free idea management template (Trello.com)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Continuous Improvement',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Establish regular improvement review cycles',
            'Train team on problem identification and solving',
            'Implement suggestion and feedback systems',
            'Measure and track improvement initiatives',
            'Create a culture of continuous learning'
          ],
          resources: [
            'Book: "Kaizen: The Key to Japan\'s Competitive Success" (free PDF online)',
            'Free problem-solving toolkit (MindTools.com)',
            'YouTube: "Continuous Improvement" by Toyota Production System',
            'Free improvement tracking template (Smartsheet.com)'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Innovation Assessment',
        type: 'development',
        description: 'Assess your current innovation and change leadership capabilities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Change Management Workshop',
        type: 'training',
        description: 'Intensive training on leading organizational change effectively.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Innovation Implementation Project',
        type: 'assignment',
        description: 'Lead a major innovation initiative in your restaurant.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Change Leadership Mentoring',
        type: 'mentoring',
        description: 'Work with an experienced change leader to develop your skills.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience Leader',
    description: 'Excel at creating exceptional customer experiences and building a hospitality-focused culture. This comprehensive 8-week plan develops the skills needed to consistently deliver outstanding service and recover from service failures.',
    icon: Heart,
    skills: [
      {
        area: 'Service Excellence',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Set clear service standards and expectations',
            'Model exceptional customer service behaviors',
            'Conduct regular service quality assessments',
            'Create customer journey maps for your restaurant',
            'Implement service training programs for team'
          ],
          resources: [
            'Book: "The Customer Service Revolution" by John DiJulius (free at local library)',
            'Free service standards checklist (CustomerServiceZone.com)',
            'Free customer journey mapping template (UXPressia.com)',
            'YouTube: "Service Excellence" by Ritz-Carlton Leadership Center'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Customer Recovery',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn the LAST method (Listen, Apologize, Solve, Thank)',
            'Practice turning complaints into opportunities',
            'Follow up with customers after service recovery',
            'Empower team to resolve issues immediately',
            'Create service recovery protocols and training'
          ],
          resources: [
            'Book: "Complaint Free World" by Will Bowen (free summary online)',
            'Free service recovery template (Help Scout free resources)',
            'YouTube: "Turning Complaints into Opportunities" by Disney Institute',
            'Free empowerment guidelines (Zappos Insights)'
          ],
          timeline: '2-weeks'
        }
      },
      {
        area: 'Hospitality Culture',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Define hospitality values for your restaurant',
            'Train team on hospitality mindset and behaviors',
            'Create systems to recognize hospitality excellence',
            'Measure and track customer satisfaction',
            'Build customer loyalty programs and initiatives'
          ],
          resources: [
            'Book: "Unreasonable Hospitality" by Will Guidara (free at local library)',
            'Free values workshop template (Culture Amp free resources)',
            'YouTube: "Setting the Table" by Danny Meyer (92nd Street Y)',
            'Free customer satisfaction survey (SurveyMonkey.com)'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Customer Experience Assessment',
        type: 'development',
        description: 'Evaluate your current customer experience delivery and identify gaps.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Service Excellence Training',
        type: 'training',
        description: 'Intensive training on delivering exceptional customer service.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Customer Experience Improvement Project',
        type: 'assignment',
        description: 'Lead a major customer experience improvement initiative.',
        timeline: '3 weeks',
        status: 'not-started'
      },
      {
        title: 'Hospitality Mentoring',
        type: 'mentoring',
        description: 'Work with a hospitality expert to refine your customer experience leadership.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution & Problem Solving',
    description: 'Master the skills to resolve conflicts constructively and solve complex problems effectively. This comprehensive 9-week plan equips you with tools to handle difficult conversations and find win-win solutions.',
    icon: Users,
    skills: [
      {
        area: 'Conflict Management',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Practice active listening during disagreements',
            'Use the DESC method (Describe, Express, Specify, Consequences)',
            'Focus on interests, not positions',
            'Learn mediation and facilitation techniques',
            'Develop de-escalation strategies for heated situations'
          ],
          resources: [
            'Book: "Getting to Yes" by Roger Fisher (free at local library)',
            'Free conflict resolution guide (Harvard Negotiation Project)',
            'YouTube: "Conflict Resolution Skills" by TED-Ed',
            'Free de-escalation techniques (Crisis Prevention Institute)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Critical Thinking',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Use structured problem-solving frameworks',
            'Gather data before making decisions',
            'Consider multiple perspectives and solutions',
            'Practice root cause analysis techniques',
            'Develop analytical and logical reasoning skills'
          ],
          resources: [
            'Book: "Thinking, Fast and Slow" by Daniel Kahneman (free summary online)',
            'Free problem-solving toolkit (MindTools.com)',
            'YouTube: "Critical Thinking" by Crash Course',
            'Free root cause analysis template (Lucidchart.com)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Negotiation Skills',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn principled negotiation techniques',
            'Practice win-win solution finding',
            'Develop preparation strategies for negotiations',
            'Master communication during negotiations',
            'Build relationship-preserving negotiation skills'
          ],
          resources: [
            'Book: "Never Split the Difference" by Chris Voss (free summary on YouTube)',
            'Free negotiation preparation worksheet (Harvard Business School)',
            'YouTube: "Negotiation Masterclass" by Chris Voss',
            'Free win-win negotiation guide (Program on Negotiation at Harvard)'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Conflict Resolution Assessment',
        type: 'development',
        description: 'Assess your current conflict resolution and problem-solving capabilities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Mediation Training Workshop',
        type: 'training',
        description: 'Intensive training on mediation and conflict resolution techniques.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Complex Problem-Solving Project',
        type: 'assignment',
        description: 'Lead the resolution of a complex, multi-stakeholder problem.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Negotiation Skills Practice',
        type: 'training',
        description: 'Practice negotiation skills through simulations and role-playing.',
        timeline: '2 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence Leader',
    description: 'Develop emotional intelligence to better understand yourself and others, build stronger relationships, and lead with empathy. This comprehensive 10-week plan focuses on self-awareness, social skills, and emotional regulation.',
    icon: Heart,
    skills: [
      {
        area: 'Self-Awareness',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Practice daily self-reflection and journaling',
            'Seek feedback on your emotional responses',
            'Identify your emotional triggers and patterns',
            'Develop mindfulness and present-moment awareness',
            'Learn to recognize emotions as they arise'
          ],
          resources: [
            'Book: "Emotional Intelligence 2.0" by Travis Bradberry (free at local library)',
            'Free EQ assessment (Psychology Today)',
            'Free mindfulness app: Insight Timer',
            'YouTube: "Understanding Emotions" by TED-Ed'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Empathy & Social Skills',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Practice reading non-verbal communication cues',
            'Ask open-ended questions to understand others',
            'Respond with empathy to team member concerns',
            'Develop perspective-taking abilities',
            'Build rapport and connection with diverse personalities'
          ],
          resources: [
            'Book: "Nonviolent Communication" by Marshall Rosenberg (free PDF online)',
            'Free empathy exercises (Greater Good Science Center)',
            'YouTube: "Reading Body Language" by Joe Navarro',
            'Free social skills guide (SkillsYouNeed.com)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Emotional Regulation',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn stress management and coping strategies',
            'Practice emotional self-control in challenging situations',
            'Develop resilience and bounce-back capabilities',
            'Master techniques for staying calm under pressure',
            'Build emotional stability and consistency'
          ],
          resources: [
            'Book: "The Resilience Factor" by Karen Reivich (free summary online)',
            'Free stress management toolkit (American Psychological Association)',
            'Free meditation app: Headspace (free trial)',
            'YouTube: "Building Resilience" by American Psychological Association'
          ],
          timeline: '3-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Comprehensive EQ Assessment',
        type: 'development',
        description: 'Complete a detailed emotional intelligence assessment and development plan.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Emotional Intelligence Workshop',
        type: 'training',
        description: 'Intensive workshop on developing emotional intelligence for leaders.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'EQ Leadership Project',
        type: 'assignment',
        description: 'Lead a team initiative focusing on emotional intelligence and relationship building.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'EQ Coaching and Mentoring',
        type: 'mentoring',
        description: 'Work with an EQ coach to develop your emotional leadership capabilities.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
  },
  {
    id: 'situational-leadership',
    title: 'Situational Leadership Mastery',
    description: 'Master the art of adapting your leadership style to match the situation and development level of your team members. This comprehensive 12-week plan teaches you the four leadership styles and when to use each for maximum effectiveness.',
    icon: Target,
    skills: [
      {
        area: 'Situational Assessment',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn to assess team member competence and commitment levels',
            'Practice diagnosing readiness for different tasks and responsibilities',
            'Develop skills in recognizing when leadership style changes are needed',
            'Master the art of reading situational cues and team dynamics',
            'Create assessment frameworks for different leadership scenarios'
          ],
          resources: [
            'Book: "Leadership and the One Minute Manager" by Ken Blanchard (free at local library)',
            'Situational Leadership Assessment Tool (free download)',
            'YouTube: "Situational Leadership Explained" by Ken Blanchard Companies',
            'Free webinar: "Diagnosing Development Levels" (Center for Creative Leadership)',
            'Situational Leadership Quick Reference Guide (printable PDF)'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Leadership Style Flexibility',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Master the four leadership styles: Directing, Coaching, Supporting, Delegating',
            'Practice switching between styles based on team member needs',
            'Develop comfort with all four leadership approaches',
            'Learn to communicate style changes clearly to team members',
            'Build confidence in using non-preferred leadership styles'
          ],
          resources: [
            'Situational Leadership Style Practice Scenarios (free download)',
            'Leadership Style Self-Assessment Tool',
            'Book: "The New One Minute Manager" by Ken Blanchard',
            'Free online course: "Adaptive Leadership" (Coursera audit)',
            'Leadership Style Quick Reference Cards (printable)'
          ],
          timeline: '4-weeks'
        }
      },
      {
        area: 'Communication Adaptation',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn to match communication style to leadership approach',
            'Practice directive communication for new or struggling team members',
            'Develop coaching conversation skills for developing team members',
            'Master supportive communication for competent but unmotivated individuals',
            'Perfect delegating communication for high performers'
          ],
          resources: [
            'Communication Style Guide for Each Leadership Approach',
            'Free template: "Situational Communication Scripts"',
            'Book: "Crucial Conversations" by Kerry Patterson (library)',
            'YouTube: "Communication Styles for Leaders" playlist',
            'Practice conversation starters for each leadership style'
          ],
          timeline: '3-weeks'
        }
      },
      {
        area: 'Performance Coaching Through Development Stages',
        currentLevel: 1,
        targetLevel: 5,
        developmentPlan: {
          actions: [
            'Learn to move team members through the four development stages',
            'Practice providing appropriate support for each development level',
            'Develop skills in accelerating team member growth',
            'Master the art of knowing when to increase or decrease support',
            'Create individual development plans using situational leadership'
          ],
          resources: [
            'Development Stage Assessment Worksheet',
            'Free guide: "Coaching Through Development Levels"',
            'Book: "The Coaching Habit" by Michael Bungay Stanier',
            'Situational Coaching Conversation Templates',
            'Team Member Development Tracking Sheet'
          ],
          timeline: '2-weeks'
        }
      }
    ],
    activities: [
      {
        title: 'Situational Leadership Assessment',
        type: 'assessment',
        description: 'Complete a comprehensive assessment of your current situational leadership skills.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Team Member Development Level Analysis',
        type: 'development',
        description: 'Assess each team member\'s development level for their key responsibilities.',
        timeline: '1 week',
        status: 'not-started'
      },
      {
        title: 'Leadership Style Practice Sessions',
        type: 'training',
        description: 'Practice each of the four leadership styles in controlled scenarios.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Real-World Application Project',
        type: 'assignment',
        description: 'Apply situational leadership with different team members and document results.',
        timeline: '4 weeks',
        status: 'not-started'
      },
      {
        title: 'Peer Leadership Style Exchange',
        type: 'mentoring',
        description: 'Partner with another leader to practice and provide feedback on style adaptation.',
        timeline: '2 weeks',
        status: 'not-started'
      },
      {
        title: 'Team Dynamics Optimization',
        type: 'assignment',
        description: 'Use situational leadership to optimize your team\'s overall performance.',
        timeline: '3 weeks',
        status: 'not-started'
      }
    ],
    learningPath: [
      {
        week: 1,
        focus: 'Foundation & Assessment',
        objectives: [
          'Understand the four leadership styles',
          'Learn the development level framework',
          'Assess your current leadership flexibility',
          'Evaluate your team members\' development levels'
        ],
        activities: [
          'Read "Leadership and the One Minute Manager" chapters 1-3',
          'Complete Situational Leadership self-assessment',
          'Analyze your team using the development level framework',
          'Identify your preferred and least comfortable leadership styles'
        ]
      },
      {
        week: 2,
        focus: 'Directing Style Mastery',
        objectives: [
          'Master when and how to use the Directing style',
          'Practice clear, specific instruction giving',
          'Learn to provide structure for new team members',
          'Develop comfort with close supervision'
        ],
        activities: [
          'Practice directing conversations with role-play scenarios',
          'Create clear instruction templates for common tasks',
          'Implement directing style with appropriate team members',
          'Document results and team member responses'
        ]
      },
      {
        week: 3,
        focus: 'Coaching Style Development',
        objectives: [
          'Learn when and how to use the Coaching style',
          'Practice explaining decisions and soliciting suggestions',
          'Develop skills in two-way communication',
          'Master the balance of direction and support'
        ],
        activities: [
          'Practice coaching conversations using structured frameworks',
          'Implement coaching approach with developing team members',
          'Learn to ask powerful questions that promote growth',
          'Practice giving feedback that builds competence and confidence'
        ]
      },
      {
        week: 4,
        focus: 'Supporting Style Excellence',
        objectives: [
          'Master when and how to use the Supporting style',
          'Practice facilitating problem-solving',
          'Learn to provide encouragement and motivation',
          'Develop skills in shared decision-making'
        ],
        activities: [
          'Practice supporting conversations with competent but unmotivated team members',
          'Learn to facilitate team member problem-solving',
          'Implement shared decision-making processes',
          'Focus on building confidence and motivation'
        ]
      },
      {
        week: 5,
        focus: 'Delegating Style Mastery',
        objectives: [
          'Learn when and how to use the Delegating style',
          'Practice turning over responsibility for decisions',
          'Develop comfort with minimal supervision',
          'Master the art of empowerment'
        ],
        activities: [
          'Practice delegating conversations with high performers',
          'Learn to set clear expectations while giving autonomy',
          'Implement delegation with appropriate team members',
          'Develop systems for monitoring without micromanaging'
        ]
      },
      {
        week: 6,
        focus: 'Style Flexibility & Adaptation',
        objectives: [
          'Practice switching between styles fluidly',
          'Learn to read situational cues quickly',
          'Develop comfort with all four styles',
          'Master explaining style changes to team members'
        ],
        activities: [
          'Practice rapid style switching in scenario exercises',
          'Implement different styles with the same person for different tasks',
          'Learn to communicate why you\'re changing your approach',
          'Get feedback from team members on your adaptability'
        ]
      },
      {
        week: 7,
        focus: 'Communication Mastery',
        objectives: [
          'Match communication style to leadership approach',
          'Practice clear, appropriate communication for each style',
          'Learn to adjust tone and method based on situation',
          'Develop scripts and frameworks for each style'
        ],
        activities: [
          'Practice communication approaches for each leadership style',
          'Develop personal communication templates',
          'Record and review your communication effectiveness',
          'Get feedback on communication clarity and appropriateness'
        ]
      },
      {
        week: 8,
        focus: 'Development Stage Progression',
        objectives: [
          'Learn to move team members through development stages',
          'Practice accelerating team member growth',
          'Master knowing when to increase or decrease support',
          'Develop individual progression plans'
        ],
        activities: [
          'Create development progression plans for each team member',
          'Practice moving team members to higher development levels',
          'Learn to recognize readiness for increased responsibility',
          'Implement systematic development tracking'
        ]
      },
      {
        week: 9,
        focus: 'Advanced Situational Reading',
        objectives: [
          'Develop expertise in reading complex situations',
          'Learn to assess multiple factors simultaneously',
          'Master adapting to changing circumstances',
          'Practice real-time style adjustment'
        ],
        activities: [
          'Practice complex scenario analysis',
          'Learn to factor in multiple situational variables',
          'Implement real-time style adjustments',
          'Develop intuitive situational assessment skills'
        ]
      },
      {
        week: 10,
        focus: 'Team Optimization',
        objectives: [
          'Use situational leadership to optimize team performance',
          'Balance individual and team needs',
          'Create high-performing team dynamics',
          'Master team-level situational leadership'
        ],
        activities: [
          'Analyze and optimize overall team dynamics',
          'Implement team-level situational leadership strategies',
          'Balance different development levels within the team',
          'Create systems for ongoing team optimization'
        ]
      },
      {
        week: 11,
        focus: 'Advanced Applications',
        objectives: [
          'Apply situational leadership to complex challenges',
          'Master crisis and change leadership',
          'Develop expertise in difficult conversations',
          'Practice advanced coaching techniques'
        ],
        activities: [
          'Apply situational leadership to challenging situations',
          'Practice crisis leadership using appropriate styles',
          'Master difficult conversations using situational approaches',
          'Implement advanced coaching and development techniques'
        ]
      },
      {
        week: 12,
        focus: 'Mastery & Integration',
        objectives: [
          'Integrate all situational leadership skills',
          'Develop personal leadership philosophy',
          'Create systems for continuous improvement',
          'Plan for ongoing development'
        ],
        activities: [
          'Complete comprehensive situational leadership assessment',
          'Create personal leadership development plan',
          'Establish systems for ongoing skill refinement',
          'Plan next steps in leadership development journey'
        ]
      }
    ]
  }
];

interface PlanStatus {
  enrolled: boolean
  status: string | null
  progress: number
  enrolledAt: string | null
  completedAt: string | null
}

interface Plan {
  id: string
  title: string
  description: string
  isFree: boolean
  enrolled?: boolean
  status?: string | null
  progress?: number
  enrolledAt?: string | null
  completedAt?: string | null
}

export default function DevelopmentalPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasActiveSubscription } = useSubscription()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [planStatuses, setPlanStatuses] = useState<Record<string, PlanStatus>>({})

  // Get planId or recommended from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const planId = queryParams.get('planId')
    const recommended = queryParams.get('recommended')

    if (planId) {
      setSelectedPlan(planId)
    } else if (recommended) {
      setSelectedPlan(recommended)
    }
  }, [location.search])

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leadership/plans')
      const data = response.data

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data)
        toast({
          title: 'Data Format Error',
          description: 'Received unexpected data format from server. Attempting to recover...',
          variant: 'destructive'
        })

        // Try to recover by using the hardcoded plans with no enrollment status
        const fallbackPlans = LEADERSHIP_PLANS.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          isFree: plan.id === 'heart-of-leadership',
          enrolled: false,
          status: null,
          progress: 0
        }))

        // Use the fallback plans
        console.log('Using fallback plans:', fallbackPlans)
        return processPlanData(fallbackPlans)
      }

      // Process the plan data
      processPlanData(data)
    } catch (error: any) {
      console.error('Error fetching plans:', error)

      // Check if the error response contains a plans array
      if (error.response?.data?.plans && Array.isArray(error.response.data.plans)) {
        console.log('Using fallback plans from error response')
        processPlanData(error.response.data.plans)
      } else {
        // Use hardcoded plans as a last resort
        console.log('Using hardcoded plans as fallback')
        const fallbackPlans = LEADERSHIP_PLANS.map(plan => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          isFree: plan.id === 'heart-of-leadership',
          enrolled: false,
          status: null,
          progress: 0
        }))
        processPlanData(fallbackPlans)
      }

      toast({
        title: 'Error',
        description: 'Failed to load plans. Using fallback data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (planId: string) => {
    try {
      setEnrolling(planId)
      const response = await api.post(`/api/leadership/plans/${planId}/enroll`)

      // Update local state
      setPlanStatuses(prev => ({
        ...prev,
        [planId]: {
          enrolled: true,
          status: 'enrolled',
          progress: 0,
          enrolledAt: new Date().toISOString(),
          completedAt: null
        }
      }))

      toast({
        title: 'Enrolled Successfully',
        description: 'You have been enrolled in the development plan.',
      })

      // Navigate to the tasks page after successful enrollment
      navigate(`/leadership/plans/${planId}/tasks`)
    } catch (error: any) {
      console.error('Error enrolling in plan:', error)
      toast({
        title: 'Enrollment Failed',
        description: error.response?.data?.message || 'Failed to enroll in plan. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(null)
    }
  }

  const handlePlanSelection = (planId: string) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null)
    } else {
      setSelectedPlan(planId)
    }
  }

  // Function to process plan data and update state
  const processPlanData = (plans: Plan[]) => {
    try {
      // Create a map of plan statuses
      const statusMap: Record<string, PlanStatus> = {}

      // Safely process each plan
      plans.forEach((plan: Plan) => {
        if (plan && plan.id) {
          statusMap[plan.id] = {
            enrolled: plan.enrolled || false,
            status: plan.status || null,
            progress: plan.progress || 0,
            enrolledAt: plan.enrolledAt || null,
            completedAt: plan.completedAt || null
          }
        }
      })

      setPlanStatuses(statusMap)

      // Log success for debugging
      console.log('Successfully loaded plans:', Object.keys(statusMap).length)
      return statusMap
    } catch (error) {
      console.error('Error processing plan data:', error)
      return {}
    }
  }

  // Debug function to check API response directly
  const debugApiResponse = async () => {
    try {
      // First check the debug endpoint
      const debugResponse = await api.get('/api/leadership/debug-store-id')
      console.log('Debug API Response:', debugResponse.data)

      // Then check the plans endpoint directly
      const plansResponse = await api.get('/api/leadership/plans')
      console.log('Plans API Response:', plansResponse.data)
      console.log('Plans API Response type:', typeof plansResponse.data)
      console.log('Is array?', Array.isArray(plansResponse.data))

      toast({
        title: 'Debug Info',
        description: 'Check console for debug information',
      })

      // Try to refresh plans
      fetchPlans()
    } catch (error) {
      console.error('Debug API error:', error)
      toast({
        title: 'Debug Error',
        description: 'Failed to get debug info. Check console.',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-[#E51636] animate-spin" />
        </div>
      ) : (

      <div className="space-y-6">
        {/* Recommended Plan Header */}
        {(() => {
          const queryParams = new URLSearchParams(location.search)
          const recommendedPlanId = queryParams.get('recommended')
          const recommendedPlan = LEADERSHIP_PLANS.find(plan => plan.id === recommendedPlanId)

          if (recommendedPlan) {
            return (
              <Card className="bg-gradient-to-r from-[#E51636]/10 to-[#E51636]/5 border border-[#E51636]/20 rounded-[20px]">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-[#E51636] text-white rounded-xl flex items-center justify-center">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#27251F]">Recommended Development Plan</h2>
                      <p className="text-[#27251F]/70 text-sm">Based on your recent assessment results</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-[#E51636]/10">
                    <div className="flex items-center gap-3">
                      <recommendedPlan.icon className="h-6 w-6 text-[#E51636]" />
                      <div>
                        <h3 className="font-semibold text-[#27251F]">{recommendedPlan.title}</h3>
                        <p className="text-sm text-[#27251F]/70">{recommendedPlan.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          }
          return null
        })()}

        {LEADERSHIP_PLANS.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          const planStatus = planStatuses[plan.id] || { enrolled: false, status: null, progress: 0 }
          const isEnrolled = planStatus.enrolled
          const isPlanCompleted = planStatus.status === 'completed'

          // Check if this is the recommended plan from URL
          const queryParams = new URLSearchParams(location.search)
          const recommendedPlanId = queryParams.get('recommended')
          const isRecommended = recommendedPlanId === plan.id

          return (
            <div key={plan.id} className="space-y-4">
              <Card
                className={`p-6 hover:shadow-xl transition-all duration-300 relative cursor-pointer border-l-4 ${
                  isRecommended
                    ? 'bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 border-l-[#E51636] border border-[#E51636]/20'
                    : 'bg-white border-l-transparent hover:border-l-[#E51636]'
                }`}
                onClick={() => planStatuses[plan.id]?.enrolled ? navigate(`/leadership/plans/${plan.id}/tasks`) : null}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/20 text-[#E51636] rounded-xl flex items-center justify-center shadow-sm">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-[#27251F]">{plan.title}</h3>
                          {isRecommended && (
                            <Badge variant="outline" className="bg-[#E51636] text-white border-[#E51636] text-xs">
                              ⭐ Recommended for You
                            </Badge>
                          )}
                          {plan.id === 'heart-of-leadership' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              🆓 Free Access
                            </Badge>
                          )}
                          {isEnrolled && (
                            <Badge variant="outline" className={`text-xs ${
                              isPlanCompleted
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {isPlanCompleted ? '✅ Completed' : '📚 Enrolled'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {plan.skills.length} skills
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {plan.activities.length} activities
                          </span>
                        </div>
                      </div>
                    </div>
                    {isEnrolled && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#E51636]">{planStatus.progress}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{plan.description}</p>

                  {isEnrolled && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className="text-sm font-bold text-[#E51636]">{planStatus.progress}%</span>
                        </div>
                        <Progress value={planStatus.progress} className="h-3 bg-gray-200" />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>📅 Enrolled: {formatDate(planStatus.enrolledAt)}</span>
                          {planStatus.completedAt && (
                            <span>🎉 Completed: {formatDate(planStatus.completedAt)}</span>
                          )}
                        </div>
                      </div>

                      {/* Skills Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plan.skills.slice(0, 2).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-800">{skill.area}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < skill.currentLevel ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-500">{plan.skills.length} Core Skills</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {isEnrolled ? (
                        <Button
                          variant="default"
                          className="w-full sm:w-auto bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leadership/plans/${plan.id}/tasks`);
                          }}
                        >
                          {isPlanCompleted ? '🎉 Review Plan' : '📚 Continue Learning'}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full sm:w-auto bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleEnroll(plan.id);
                          }}
                          disabled={
                            (plan.id !== 'heart-of-leadership' && !hasActiveSubscription) ||
                            enrolling === plan.id
                          }
                        >
                          {enrolling === plan.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            '🚀 Enroll Now'
                          )}
                          {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && (
                            <Lock className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handlePlanSelection(plan.id);
                        }}
                        disabled={plan.id !== 'heart-of-leadership' && !hasActiveSubscription && !isEnrolled}
                      >
                        <span className="mr-2">{isSelected ? 'Close Details' : 'View Details'}</span>
                        {plan.id !== 'heart-of-leadership' && !hasActiveSubscription && !isEnrolled && (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
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
                                  <h5 className="text-sm font-medium text-gray-700">Development Actions:</h5>
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {skill.developmentPlan.actions.map((action, i) => (
                                      <li key={i} className="text-sm text-gray-600">{action}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Resources:</h5>
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
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
                                  <span className="text-xs font-medium text-gray-700">Timeline:</span>
                                  <span className="text-xs text-gray-600">{skill.developmentPlan.timeline}</span>
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
                                    <span className="text-xs text-gray-500">Timeline: {activity.timeline}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                      {activity.status === 'not-started' && 'Not Started'}
                                      {activity.status === 'in-progress' && 'In Progress'}
                                      {activity.status === 'completed' && 'Completed'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
