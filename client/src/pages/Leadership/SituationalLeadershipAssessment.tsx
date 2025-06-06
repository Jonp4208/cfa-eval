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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Users,
  MessageSquare,
  CheckCircle,
  Star,
  BookOpen,
  Award,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AssessmentQuestion {
  id: string
  scenario: string
  teamMember: {
    name: string
    situation: string
    competence: string
    commitment: string
  }
  options: {
    style: 'Directing' | 'Coaching' | 'Supporting' | 'Delegating'
    approach: string
    points: number
  }[]
  correctStyle: string
  explanation: string
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    scenario: 'First Day Training',
    teamMember: {
      name: 'Alex',
      situation: 'Brand new team member, first day on the job, very excited but has no restaurant experience',
      competence: 'Low - Never worked in food service',
      commitment: 'High - Very enthusiastic and motivated'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Provide detailed step-by-step instructions and stay close to supervise every task',
        points: 4
      },
      {
        style: 'Coaching',
        approach: 'Explain the basics and ask for their thoughts on how to handle situations',
        points: 2
      },
      {
        style: 'Supporting',
        approach: 'Give them encouragement and let them figure things out with minimal guidance',
        points: 1
      },
      {
        style: 'Delegating',
        approach: 'Assign them tasks and check back at the end of the shift',
        points: 0
      }
    ],
    correctStyle: 'Directing',
    explanation: 'New team members with high enthusiasm but low competence need clear direction and close supervision to build skills safely while maintaining their motivation.'
  },
  {
    id: 'q2',
    scenario: 'Experienced but Struggling',
    teamMember: {
      name: 'Jordan',
      situation: 'Has 6 months experience and usually performs well, but recently making mistakes and seems less motivated',
      competence: 'High - Knows the job well',
      commitment: 'Low - Recently disengaged'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Give detailed instructions and monitor closely to prevent more mistakes',
        points: 1
      },
      {
        style: 'Coaching',
        approach: 'Discuss performance expectations and explore what might be affecting their work',
        points: 3
      },
      {
        style: 'Supporting',
        approach: 'Listen to their concerns, provide encouragement, and collaborate on solutions',
        points: 4
      },
      {
        style: 'Delegating',
        approach: 'Trust them to work through their issues and maintain normal expectations',
        points: 2
      }
    ],
    correctStyle: 'Supporting',
    explanation: 'Team members with high competence but low commitment need emotional support and encouragement to regain motivation, not more direction.'
  },
  {
    id: 'q3',
    scenario: 'Learning New Skills',
    teamMember: {
      name: 'Sam',
      situation: 'Experienced cashier learning to work in the kitchen, has some skills but feels uncertain about the new role',
      competence: 'Moderate - Some skills but learning new area',
      commitment: 'Moderate - Willing but uncertain'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Provide specific instructions for each kitchen task without asking for input',
        points: 2
      },
      {
        style: 'Coaching',
        approach: 'Explain kitchen procedures, answer questions, and gradually increase their responsibility',
        points: 4
      },
      {
        style: 'Supporting',
        approach: 'Encourage them to apply their existing skills and provide emotional support',
        points: 3
      },
      {
        style: 'Delegating',
        approach: 'Let them figure out the kitchen work based on their cashier experience',
        points: 1
      }
    ],
    correctStyle: 'Coaching',
    explanation: 'Team members with moderate competence and commitment benefit from explanation and two-way communication to build both skills and confidence.'
  },
  {
    id: 'q4',
    scenario: 'High Performer',
    teamMember: {
      name: 'Taylor',
      situation: 'Top performer with 2+ years experience, consistently excellent work, takes initiative, and helps train others',
      competence: 'High - Expert level skills',
      commitment: 'High - Self-motivated and engaged'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Continue to provide detailed guidance to maintain their high standards',
        points: 1
      },
      {
        style: 'Coaching',
        approach: 'Explain decisions and ask for their input on improvements',
        points: 3
      },
      {
        style: 'Supporting',
        approach: 'Provide encouragement and collaborate on new challenges',
        points: 2
      },
      {
        style: 'Delegating',
        approach: 'Give them autonomy to manage their work and make decisions within their expertise',
        points: 4
      }
    ],
    correctStyle: 'Delegating',
    explanation: 'High performers with both competence and commitment should be given autonomy and trusted to make decisions within their area of expertise.'
  },
  {
    id: 'q5',
    scenario: 'Crisis Situation',
    teamMember: {
      name: 'Casey',
      situation: 'Equipment malfunction during lunch rush, team member is competent but the situation is urgent and safety-critical',
      competence: 'High - Experienced team member',
      commitment: 'High - Wants to help resolve the crisis'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Take immediate control, give specific instructions for safety procedures',
        points: 4
      },
      {
        style: 'Coaching',
        approach: 'Explain the safety concerns and ask for their thoughts on solutions',
        points: 2
      },
      {
        style: 'Supporting',
        approach: 'Encourage them to handle the situation and offer assistance if needed',
        points: 1
      },
      {
        style: 'Delegating',
        approach: 'Trust them to handle the crisis independently',
        points: 0
      }
    ],
    correctStyle: 'Directing',
    explanation: 'In crisis situations, especially those involving safety, leaders should use a directing style regardless of the team member\'s usual competence level.'
  }
]

export default function SituationalLeadershipAssessment() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [styleScores, setStyleScores] = useState<Record<string, number>>({
    Directing: 0,
    Coaching: 0,
    Supporting: 0,
    Delegating: 0
  })

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100

  useEffect(() => {
    // Calculate max possible score
    const max = ASSESSMENT_QUESTIONS.reduce((total, question) => {
      const maxPoints = Math.max(...question.options.map(opt => opt.points))
      return total + maxPoints
    }, 0)
    setMaxScore(max)
  }, [])

  const handleAnswerSelect = (style: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: style
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    let totalScore = 0
    const styleCount = { Directing: 0, Coaching: 0, Supporting: 0, Delegating: 0 }

    ASSESSMENT_QUESTIONS.forEach(question => {
      const selectedStyle = answers[question.id]
      if (selectedStyle) {
        const selectedOption = question.options.find(opt => opt.style === selectedStyle)
        if (selectedOption) {
          totalScore += selectedOption.points
          styleCount[selectedStyle as keyof typeof styleCount]++
        }
      }
    })

    setScore(totalScore)
    setStyleScores(styleCount)
    setShowResults(true)
  }

  const getScorePercentage = () => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const getScoreLevel = () => {
    const percentage = getScorePercentage()
    if (percentage >= 90) return { level: 'Expert', color: 'text-green-600', description: 'Excellent situational leadership skills' }
    if (percentage >= 75) return { level: 'Proficient', color: 'text-blue-600', description: 'Good understanding of situational leadership' }
    if (percentage >= 60) return { level: 'Developing', color: 'text-yellow-600', description: 'Basic understanding, room for improvement' }
    return { level: 'Beginner', color: 'text-red-600', description: 'Needs significant development in situational leadership' }
  }

  const getMostUsedStyle = () => {
    const maxCount = Math.max(...Object.values(styleScores))
    const mostUsedStyles = Object.entries(styleScores)
      .filter(([_, count]) => count === maxCount)
      .map(([style, _]) => style)
    
    return mostUsedStyles.length === 1 ? mostUsedStyles[0] : 'Varied'
  }

  if (showResults) {
    const scoreLevel = getScoreLevel()
    const mostUsedStyle = getMostUsedStyle()

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
                Assessment Results
              </h1>
              <p className="text-[#27251F]/60 mt-1">
                Your situational leadership assessment results
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-[20px] border border-[#E51636]/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E51636] mb-2">{getScorePercentage()}%</div>
              <div className={`text-xl font-semibold mb-2 ${scoreLevel.color}`}>{scoreLevel.level}</div>
              <p className="text-[#27251F]/70">{scoreLevel.description}</p>
              <div className="mt-4">
                <Progress value={getScorePercentage()} className="h-3" />
              </div>
              <p className="text-sm text-[#27251F]/60 mt-2">
                {score} out of {maxScore} points
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Style Usage Breakdown */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-[#27251F]">Leadership Style Usage</CardTitle>
            <p className="text-[#27251F]/60 text-sm">How often you selected each leadership style</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {Object.entries(styleScores).map(([style, count]) => (
                <div key={style} className="flex items-center justify-between">
                  <span className="font-medium text-[#27251F]">{style}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#E51636] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(count / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#27251F] w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Most Used Style:</strong> {mostUsedStyle}
                {mostUsedStyle !== 'Varied' && (
                  <span className="block mt-1">
                    Consider developing flexibility in using other leadership styles based on the situation.
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-white rounded-[20px] border border-gray-100">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-[#27251F]">Development Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {getScorePercentage() < 75 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Focus Areas for Improvement:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Practice identifying team member development levels</li>
                    <li>• Learn when to use each leadership style</li>
                    <li>• Develop flexibility in switching between styles</li>
                  </ul>
                </div>
              )}
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Complete the Situational Leadership Mastery development plan</li>
                  <li>• Practice with the interactive training scenarios</li>
                  <li>• Apply these concepts with your team members</li>
                  <li>• Retake this assessment in 4-6 weeks to track progress</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                onClick={() => navigate('/leadership/developmental-plan?recommended=situational-leadership')}
                className="flex-1 bg-[#E51636] hover:bg-[#E51636]/90 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Development Plan
              </Button>
              <Button
                onClick={() => navigate('/leadership/situational-training')}
                variant="outline"
                className="flex-1 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <Target className="w-4 h-4 mr-2" />
                Practice Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              Situational Leadership Assessment
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              Test your ability to choose the right leadership style for different situations
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#E51636]">
              {currentQuestionIndex + 1} / {ASSESSMENT_QUESTIONS.length}
            </div>
            <div className="text-sm text-[#27251F]/60">Questions</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#E51636] text-white rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#27251F]">{currentQuestion.scenario}</CardTitle>
              <p className="text-[#27251F]/60 text-sm">Choose the most appropriate leadership style</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-6">
            {/* Team Member Profile */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">Team Member: {currentQuestion.teamMember.name}</h4>
              <div className="space-y-2">
                <p className="text-sm text-blue-700"><strong>Situation:</strong> {currentQuestion.teamMember.situation}</p>
                <p className="text-sm text-blue-700"><strong>Competence Level:</strong> {currentQuestion.teamMember.competence}</p>
                <p className="text-sm text-blue-700"><strong>Commitment Level:</strong> {currentQuestion.teamMember.commitment}</p>
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <h4 className="font-semibold text-[#27251F] mb-4">What leadership style would you use?</h4>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option.style)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      answers[currentQuestion.id] === option.style
                        ? 'border-[#E51636] bg-[#E51636]/5'
                        : 'border-gray-200 hover:border-[#E51636] hover:bg-[#E51636]/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        answers[currentQuestion.id] === option.style
                          ? 'border-[#E51636] bg-[#E51636]'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option.style && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#27251F] mb-1">{option.style} Style</div>
                        <p className="text-sm text-[#27251F]/70">{option.approach}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {ASSESSMENT_QUESTIONS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentQuestionIndex
                        ? 'bg-[#E51636]'
                        : answers[ASSESSMENT_QUESTIONS[index].id]
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion.id]}
                className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
              >
                {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? 'View Results' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Info */}
      <Card className="bg-gray-50 rounded-[20px] border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Estimated time: {(ASSESSMENT_QUESTIONS.length - currentQuestionIndex) * 2} minutes remaining
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {Object.keys(answers).length} of {ASSESSMENT_QUESTIONS.length} answered
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
