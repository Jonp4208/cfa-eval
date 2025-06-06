import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  Download,
  BookOpen,
  FileText,
  Video,
  Users,
  Target,
  MessageSquare,
  CheckCircle,
  Star,
  Award,
  Lightbulb,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Play
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { InteractiveTeamAssessmentTool } from '@/components/leadership/InteractiveAssessmentTool'
import { InteractiveCommunicationGuide } from '@/components/leadership/InteractiveCommunicationGuide'
import { InteractiveQuickReference } from '@/components/leadership/InteractiveQuickReference'

interface Resource {
  id: string
  title: string
  description: string
  type: 'template' | 'guide' | 'video' | 'assessment' | 'worksheet'
  category: string
  downloadUrl?: string
  content?: string
  icon: any
  estimatedTime: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

const RESOURCES: Resource[] = [
  {
    id: 'interactive-team-assessment',
    title: 'Interactive Team Assessment Tool',
    description: 'Professional assessment tool with automatic development level calculation and leadership style recommendations',
    type: 'assessment',
    category: 'Assessment Tools',
    icon: Users,
    estimatedTime: '15 minutes per team member',
    difficulty: 'Beginner'
  },
  {
    id: 'interactive-communication-guide',
    title: 'Interactive Communication Style Guide',
    description: 'Build and practice communication examples for each leadership style with AI-powered suggestions',
    type: 'guide',
    category: 'Communication Tools',
    icon: MessageSquare,
    estimatedTime: '20 minutes to practice',
    difficulty: 'Beginner'
  },
  {
    id: 'interactive-quick-reference',
    title: 'Interactive Quick Reference Guide',
    description: 'Searchable, interactive guide with situation-specific recommendations and common mistake warnings',
    type: 'guide',
    category: 'Reference Materials',
    icon: BookOpen,
    estimatedTime: '10 minutes to explore',
    difficulty: 'Beginner'
  },
  {
    id: 'development-planning-worksheet',
    title: 'Individual Development Planning Worksheet',
    description: 'Create personalized development plans using situational leadership principles',
    type: 'worksheet',
    category: 'Development Tools',
    icon: TrendingUp,
    estimatedTime: '30 minutes per team member',
    difficulty: 'Intermediate',
    content: `
# Individual Development Planning Worksheet

## Team Member Information
**Name:** _______________  
**Position:** _______________  
**Date:** _______________  
**Planning Period:** _______________

## Current State Assessment

### Key Responsibilities/Tasks:
1. ________________________________
2. ________________________________
3. ________________________________
4. ________________________________

### Development Level for Each Task:
| Task | Competence (1-5) | Commitment (1-5) | Development Level | Current Leadership Style |
|------|------------------|-------------------|-------------------|-------------------------|
| 1.   |                  |                   |                   |                         |
| 2.   |                  |                   |                   |                         |
| 3.   |                  |                   |                   |                         |
| 4.   |                  |                   |                   |                         |

## Development Goals

### 3-Month Goals:
1. ________________________________
2. ________________________________
3. ________________________________

### 6-Month Goals:
1. ________________________________
2. ________________________________

### 1-Year Vision:
________________________________

## Development Strategies by Task

### Task 1: _______________
**Current Level:** _______________  
**Target Level:** _______________  
**Leadership Style Progression:**
- Month 1: _______________
- Month 2: _______________
- Month 3: _______________

**Specific Actions:**
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

### Task 2: _______________
**Current Level:** _______________  
**Target Level:** _______________  
**Leadership Style Progression:**
- Month 1: _______________
- Month 2: _______________
- Month 3: _______________

**Specific Actions:**
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

## Support Needed

### From Manager:
- ________________________________
- ________________________________

### Training/Resources:
- ________________________________
- ________________________________

### Mentoring/Coaching:
- ________________________________
- ________________________________

## Progress Tracking

### Monthly Check-ins:
- **Month 1 Date:** _______________
- **Month 2 Date:** _______________
- **Month 3 Date:** _______________

### Success Metrics:
1. ________________________________
2. ________________________________
3. ________________________________

## Signatures
**Team Member:** _______________  **Date:** _______________  
**Manager:** _______________  **Date:** _______________
    `
  },
  {
    id: 'meeting-facilitation-guide',
    title: 'Situational Leadership Meeting Facilitation Guide',
    description: 'Run effective team meetings using situational leadership principles',
    type: 'guide',
    category: 'Meeting Tools',
    icon: Users,
    estimatedTime: '15 minutes to review',
    difficulty: 'Intermediate',
    content: `
# Situational Leadership Meeting Facilitation Guide

## Pre-Meeting Preparation

### Assess Your Team
- Review each team member's development level
- Plan your facilitation style for different participants
- Prepare different types of questions for different development levels

### Meeting Structure Planning
- **Opening:** Set tone based on team's overall development level
- **Discussion:** Adapt facilitation style to participants
- **Decision-Making:** Match approach to team's capability
- **Closing:** Provide appropriate follow-up based on needs

## Facilitation Styles by Development Level

### For D1 Team Members (Enthusiastic Beginners)
**Approach:** Provide clear structure and direction
- Give specific agenda items
- Provide background information
- Ask clarifying questions
- Summarize key points frequently

**Sample Phrases:**
- "Let me explain the background..."
- "The key points to understand are..."
- "What questions do you have about this?"

### For D2 Team Members (Disillusioned Learners)
**Approach:** Explain reasoning and provide encouragement
- Explain the "why" behind decisions
- Acknowledge their concerns
- Provide both direction and support
- Encourage participation

**Sample Phrases:**
- "I understand this might seem challenging..."
- "The reason we're doing this is..."
- "What concerns do you have?"
- "Your input is valuable..."

### For D3 Team Members (Capable but Cautious)
**Approach:** Facilitate and encourage their input
- Ask for their opinions and ideas
- Provide encouragement and support
- Help them problem-solve
- Build their confidence

**Sample Phrases:**
- "What's your take on this?"
- "You have experience with this..."
- "What solutions do you see?"
- "I value your perspective..."

### For D4 Team Members (Self-Reliant Achievers)
**Approach:** Delegate and empower
- Ask them to lead discussions
- Seek their expertise
- Give them decision-making authority
- Minimize your direction

**Sample Phrases:**
- "Can you walk us through this?"
- "What do you recommend?"
- "You have the authority to decide..."
- "What's your assessment?"

## Meeting Types and Approaches

### Daily Huddles (5-10 minutes)
**Primary Style:** Directing (S1)
- Quick, structured updates
- Clear priorities for the day
- Specific assignments
- Safety reminders

### Weekly Team Meetings (20-30 minutes)
**Mixed Styles:** Adapt to agenda items
- Performance updates (S1/S2)
- Problem-solving (S3)
- Planning discussions (S2/S3)
- Recognition (S3/S4)

### Monthly Development Meetings (30-45 minutes)
**Primary Style:** Coaching/Supporting (S2/S3)
- Individual development discussions
- Goal setting and review
- Skill development planning
- Career conversations

### Quarterly Planning Sessions (60+ minutes)
**Primary Style:** Supporting/Delegating (S3/S4)
- Strategic discussions
- Team input on goals
- Collaborative planning
- Innovation sessions

## Common Meeting Challenges and Solutions

### Challenge: Quiet Team Members
**Solution:** Use appropriate style based on their development level
- D1/D2: Ask specific, direct questions
- D3: Provide encouragement and wait time
- D4: Ask for their expertise

### Challenge: Dominating Participants
**Solution:** Redirect using situational leadership
- "Thanks for that input, let's hear from others..."
- "Can you help facilitate input from the team?"

### Challenge: Off-Topic Discussions
**Solution:** Use directing style temporarily
- "Let's park that for later discussion..."
- "That's important, but let's focus on..."

### Challenge: Lack of Engagement
**Solution:** Assess and adjust your style
- Too much directing? → Add more support
- Too little structure? → Add more direction

## Post-Meeting Follow-Up

### For Different Development Levels:
- **D1:** Provide detailed action items and check-in schedule
- **D2:** Explain next steps and offer support
- **D3:** Confirm their action items and provide encouragement
- **D4:** Trust them to follow through with minimal oversight

## Meeting Effectiveness Checklist

- [ ] Did I assess the development level of participants?
- [ ] Did I adapt my facilitation style appropriately?
- [ ] Did everyone have appropriate opportunities to contribute?
- [ ] Were decisions made at the right level?
- [ ] Did I provide appropriate follow-up for each person?
- [ ] Did the meeting achieve its objectives?
    `
  }
]

export default function SituationalLeadershipResources() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const categories = ['All', ...Array.from(new Set(RESOURCES.map(r => r.category)))]
  const filteredResources = selectedCategory === 'All' 
    ? RESOURCES 
    : RESOURCES.filter(r => r.category === selectedCategory)

  const handleDownload = (resource: Resource) => {
    // Handle interactive tools differently
    if (['interactive-team-assessment', 'interactive-communication-guide', 'interactive-quick-reference'].includes(resource.id)) {
      toast({
        title: 'Interactive Tool',
        description: 'Please use the Export button within the tool to download your customized content.',
        variant: 'default'
      })
      return
    }

    if (resource.content) {
      // Create a more professional formatted document
      const formattedContent = `${resource.title.toUpperCase()}
Generated: ${new Date().toLocaleDateString()}
Difficulty: ${resource.difficulty}
Estimated Time: ${resource.estimatedTime}

===========================================

${resource.content}

===========================================

Document generated by LD Growth Leadership Development Platform
For more resources, visit your leadership development dashboard.`

      const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Resource Downloaded',
        description: `${resource.title} has been downloaded successfully.`
      })
    } else {
      toast({
        title: 'Download Not Available',
        description: 'This resource does not have downloadable content.',
        variant: 'destructive'
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return FileText
      case 'guide': return BookOpen
      case 'video': return Video
      case 'assessment': return BarChart3
      case 'worksheet': return CheckCircle
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'guide': return 'bg-green-50 text-green-700 border-green-200'
      case 'video': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'assessment': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'worksheet': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/leadership/developmental-plan')}
            className="p-2 hover:bg-[#E51636]/5 hover:text-[#E51636]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">
              Situational Leadership Resources
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              Practical tools, templates, and guides for implementing situational leadership
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white" 
                  : "text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => {
          const TypeIcon = getTypeIcon(resource.type)
          const ResourceIcon = resource.icon

          return (
            <Card key={resource.id} className="bg-white rounded-[20px] border border-gray-100 hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-[#E51636]/10 text-[#E51636] rounded-lg flex items-center justify-center">
                    <ResourceIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${getTypeColor(resource.type)}`}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {resource.type}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-[#27251F] leading-tight">
                      {resource.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-[#27251F]/70 text-sm mb-4 leading-relaxed">
                  {resource.description}
                </p>

                <div className="flex items-center gap-2 mb-4 text-xs text-[#27251F]/60">
                  <Clock className="w-3 h-3" />
                  <span>{resource.estimatedTime}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedResource(resource)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDownload(resource)}
                    size="sm"
                    className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[20px] max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#27251F]">{selectedResource.title}</h2>
                  <p className="text-[#27251F]/60 text-sm mt-1">{selectedResource.description}</p>
                </div>
                <div className="flex gap-2">
                  {!['interactive-team-assessment', 'interactive-communication-guide', 'interactive-quick-reference'].includes(selectedResource.id) && (
                    <Button
                      onClick={() => handleDownload(selectedResource)}
                      size="sm"
                      className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedResource(null)}
                    variant="outline"
                    size="sm"
                    className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedResource.id === 'interactive-team-assessment' && <InteractiveTeamAssessmentTool />}
              {selectedResource.id === 'interactive-communication-guide' && <InteractiveCommunicationGuide />}
              {selectedResource.id === 'interactive-quick-reference' && <InteractiveQuickReference />}
              {selectedResource.content && !['interactive-team-assessment', 'interactive-communication-guide', 'interactive-quick-reference'].includes(selectedResource.id) && (
                <pre className="whitespace-pre-wrap text-sm text-[#27251F] font-mono leading-relaxed">
                  {selectedResource.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-[20px] border border-[#E51636]/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#27251F] text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/leadership/situational-assessment')}
              variant="outline"
              className="h-auto p-4 text-left text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <div>
                  <div className="font-medium">Take Assessment</div>
                  <div className="text-xs opacity-70">Test your situational leadership skills</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/leadership/situational-training')}
              variant="outline"
              className="h-auto p-4 text-left text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5" />
                <div>
                  <div className="font-medium">Practice Scenarios</div>
                  <div className="text-xs opacity-70">Interactive training exercises</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/leadership/developmental-plan?recommended=situational-leadership')}
              variant="outline"
              className="h-auto p-4 text-left text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <div>
                  <div className="font-medium">Development Plan</div>
                  <div className="text-xs opacity-70">12-week mastery program</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
