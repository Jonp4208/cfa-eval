import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  Brain,
  Target,
  Users,
  Heart,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Assessment {
  id: string
  title: string
  type: 'skills' | 'leadership' | 'character' | 'team'
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  dueDate: string
  completionDate?: string
  score?: number
  areas: {
    name: string
    score: number
    recommendations: string[]
  }[]
}

export default function Assessments() {
  const navigate = useNavigate()
  const [assessments] = useState<Assessment[]>([
    {
      id: 'leadership-character',
      title: 'Leadership Character Assessment',
      type: 'character',
      description: 'Evaluate your leadership character traits and identify areas for growth.',
      status: 'not_started',
      dueDate: '2024-06-30',
      areas: [
        {
          name: 'Integrity',
          score: 0,
          recommendations: [
            'Practice transparent communication',
            'Lead by example in ethical decision-making',
            'Build trust through consistent actions'
          ]
        },
        {
          name: 'Humility',
          score: 0,
          recommendations: [
            'Seek feedback regularly',
            'Acknowledge mistakes openly',
            'Give credit to team members'
          ]
        },
        {
          name: 'Courage',
          score: 0,
          recommendations: [
            'Take calculated risks',
            'Stand up for principles',
            'Address conflicts directly'
          ]
        }
      ]
    },
    {
      id: 'servant-leadership',
      title: 'Servant Leadership Assessment',
      type: 'leadership',
      description: 'Assess your servant leadership capabilities and identify growth opportunities.',
      status: 'in_progress',
      dueDate: '2024-07-15',
      areas: [
        {
          name: 'Empowerment',
          score: 3,
          recommendations: [
            'Delegate meaningful responsibilities',
            'Support team member growth',
            'Create opportunities for leadership'
          ]
        },
        {
          name: 'Service Orientation',
          score: 4,
          recommendations: [
            'Put others\' needs first',
            'Create a supportive environment',
            'Remove obstacles for team success'
          ]
        },
        {
          name: 'Vision Sharing',
          score: 2,
          recommendations: [
            'Communicate clear direction',
            'Inspire through purpose',
            'Connect daily work to mission'
          ]
        }
      ]
    },
    {
      id: 'team-dynamics',
      title: 'Team Leadership Assessment',
      type: 'team',
      description: 'Evaluate your ability to build and lead high-performing teams.',
      status: 'completed',
      dueDate: '2024-05-30',
      completionDate: '2024-05-28',
      score: 85,
      areas: [
        {
          name: 'Team Building',
          score: 4,
          recommendations: [
            'Foster team cohesion',
            'Build trust among members',
            'Create shared goals'
          ]
        },
        {
          name: 'Conflict Resolution',
          score: 3,
          recommendations: [
            'Address conflicts early',
            'Facilitate open dialogue',
            'Find win-win solutions'
          ]
        },
        {
          name: 'Performance Management',
          score: 4,
          recommendations: [
            'Set clear expectations',
            'Provide regular feedback',
            'Recognize achievements'
          ]
        }
      ]
    },
    {
      id: 'grow-leadership',
      title: 'GROW Leadership Assessment',
      type: 'leadership',
      description: 'Based on Mark Miller and Ken Blanchard\'s GROW model, assess your ability to guide and develop others through Goals, Reality, Options, and Way Forward.',
      status: 'not_started',
      dueDate: '2024-08-15',
      areas: [
        {
          name: 'Goals',
          score: 0,
          recommendations: [
            'Practice setting SMART goals with team members',
            'Align individual goals with organizational objectives',
            'Help team members create meaningful and challenging goals'
          ]
        },
        {
          name: 'Reality',
          score: 0,
          recommendations: [
            'Develop deeper situation analysis skills',
            'Practice active listening and powerful questioning',
            'Guide honest self-assessment discussions'
          ]
        },
        {
          name: 'Options',
          score: 0,
          recommendations: [
            'Facilitate creative brainstorming sessions',
            'Help identify and evaluate multiple solutions',
            'Encourage innovative thinking and approaches'
          ]
        },
        {
          name: 'Way Forward',
          score: 0,
          recommendations: [
            'Create clear action plans with accountability',
            'Establish specific timelines and milestones',
            'Follow up on commitments and progress'
          ]
        }
      ]
    }
  ])

  const getStatusColor = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: Assessment['type']) => {
    switch (type) {
      case 'character':
        return <Heart className="w-4 h-4" />
      case 'leadership':
        return <Brain className="w-4 h-4" />
      case 'team':
        return <Users className="w-4 h-4" />
      default:
        return <ClipboardList className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Progress Overview */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <CardDescription>Track your completion status across all assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Overall Progress</p>
                <div className="text-2xl font-bold text-[#27251F]">
                  {Math.round(
                    (assessments.filter(a => a.status === 'completed').length /
                      assessments.length) *
                      100
                  )}
                  %
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <div className="text-2xl font-bold text-green-600">
                  {assessments.filter(a => a.status === 'completed').length}/
                  {assessments.length}
                </div>
              </div>
            </div>
            <Progress
              value={
                (assessments.filter(a => a.status === 'completed').length /
                  assessments.length) *
                100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map(assessment => (
          <Card key={assessment.id} className="bg-white rounded-[20px] border border-gray-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 ${
                    assessment.type === 'character' ? 'bg-red-50 text-[#E51636]' :
                    assessment.type === 'leadership' ? 'bg-blue-50 text-blue-600' :
                    assessment.type === 'team' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-600'
                  } rounded-xl flex items-center justify-center`}>
                    {getTypeIcon(assessment.type)}
                  </div>
                  <CardTitle className="text-[#27251F]">{assessment.title}</CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(
                    assessment.status
                  )} text-white capitalize px-3 py-1 rounded-full text-xs font-medium`}
                >
                  {assessment.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription className="mt-2 text-[#27251F]/60">{assessment.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(assessment.status)}
                    <span className="text-[#27251F]/60">
                      {assessment.status === 'completed'
                        ? `Completed on ${new Date(
                            assessment.completionDate!
                          ).toLocaleDateString()}`
                        : `Due by ${new Date(assessment.dueDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  {assessment.score && (
                    <div className="font-medium text-green-600">
                      Score: {assessment.score}%
                    </div>
                  )}
                </div>

                {assessment.areas && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#27251F]/60">Key Areas:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {assessment.areas.map(area => (
                        <div
                          key={area.name}
                          className="text-sm p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="font-medium text-[#27251F]">{area.name}</div>
                          {area.score > 0 && (
                            <div className="text-xs text-[#27251F]/60 mt-1">
                              Score: {area.score}/5
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]"
                  onClick={() => navigate(`/leadership/assessments/${assessment.id}`)}
                >
                  {assessment.status === 'completed'
                    ? 'View Results'
                    : assessment.status === 'in_progress'
                    ? 'Continue Assessment'
                    : 'Start Assessment'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 