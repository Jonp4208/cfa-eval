import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Play,
  Pause,
  RotateCcw,
  Award,
  Lightbulb,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface LeadershipStyle {
  id: string
  name: string
  description: string
  whenToUse: string[]
  characteristics: string[]
  communication: string[]
  examples: string[]
  color: string
  icon: any
}

interface Scenario {
  id: string
  title: string
  situation: string
  teamMemberProfile: {
    name: string
    experience: string
    competence: string
    commitment: string
    developmentLevel: string
  }
  options: {
    style: string
    approach: string
    outcome: string
    effectiveness: number
  }[]
  bestStyle: string
  explanation: string
}

const LEADERSHIP_STYLES: LeadershipStyle[] = [
  {
    id: 'directing',
    name: 'Directing (S1)',
    description: 'High Direction, Low Support - Provide specific instructions and closely supervise performance',
    whenToUse: [
      'New team members with low competence and high commitment',
      'Crisis situations requiring immediate action',
      'Safety-critical tasks',
      'When clear procedures must be followed exactly'
    ],
    characteristics: [
      'Give clear, specific instructions',
      'Set deadlines and check progress frequently',
      'Make decisions without input',
      'Focus on task completion',
      'Provide detailed guidance'
    ],
    communication: [
      '"Here\'s exactly what you need to do..."',
      '"Follow these steps in this order..."',
      '"I need this completed by..."',
      '"Let me show you the correct way..."',
      '"Check with me before proceeding to the next step"'
    ],
    examples: [
      'Training a new cashier on POS system procedures',
      'Implementing new safety protocols during busy periods',
      'Directing team during equipment malfunction',
      'Teaching proper food handling procedures to new kitchen staff'
    ],
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: Target
  },
  {
    id: 'coaching',
    name: 'Coaching (S2)',
    description: 'High Direction, High Support - Explain decisions and provide opportunity for clarification',
    whenToUse: [
      'Team members with some competence but variable commitment',
      'When building skills and confidence',
      'During skill development phases',
      'When team members need encouragement'
    ],
    characteristics: [
      'Explain the "why" behind decisions',
      'Encourage questions and discussion',
      'Provide both direction and support',
      'Build confidence through encouragement',
      'Share decision-making gradually'
    ],
    communication: [
      '"Let me explain why we do it this way..."',
      '"What questions do you have about this?"',
      '"You\'re making good progress, and here\'s how to improve..."',
      '"I\'d like your thoughts on this approach..."',
      '"Here\'s what I\'m thinking, what do you think?"'
    ],
    examples: [
      'Developing a team leader\'s management skills',
      'Helping experienced staff learn new menu items',
      'Supporting someone taking on additional responsibilities',
      'Coaching through challenging customer service situations'
    ],
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: MessageSquare
  },
  {
    id: 'supporting',
    name: 'Supporting (S3)',
    description: 'Low Direction, High Support - Facilitate and support team member\'s efforts',
    whenToUse: [
      'Competent team members with variable commitment',
      'When motivation or confidence is low',
      'For problem-solving and decision-making',
      'When team members have the skills but need encouragement'
    ],
    characteristics: [
      'Listen actively and provide encouragement',
      'Facilitate problem-solving',
      'Share decision-making',
      'Focus on building confidence',
      'Provide emotional support'
    ],
    communication: [
      '"What do you think we should do?"',
      '"You have the skills to handle this..."',
      '"I\'m here if you need me..."',
      '"How would you approach this situation?"',
      '"I trust your judgment on this"'
    ],
    examples: [
      'Supporting a skilled but discouraged team member',
      'Helping resolve conflicts between experienced staff',
      'Encouraging innovation in service delivery',
      'Supporting team members through personal challenges'
    ],
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: Users
  },
  {
    id: 'delegating',
    name: 'Delegating (S4)',
    description: 'Low Direction, Low Support - Turn over responsibility for decisions and implementation',
    whenToUse: [
      'Highly competent and committed team members',
      'When team members are self-motivated experts',
      'For routine tasks within their expertise',
      'When developing leadership in others'
    ],
    characteristics: [
      'Provide minimal direction',
      'Allow autonomous decision-making',
      'Monitor results, not methods',
      'Trust team member\'s expertise',
      'Focus on outcomes'
    ],
    communication: [
      '"I\'m confident you can handle this..."',
      '"You decide how to approach this..."',
      '"Let me know if you need anything..."',
      '"I trust your judgment completely..."',
      '"Just keep me updated on the results"'
    ],
    examples: [
      'Delegating shift management to experienced leaders',
      'Allowing expert staff to train new team members',
      'Giving autonomy over department operations',
      'Empowering team leaders to make scheduling decisions'
    ],
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Award
  }
]

const TRAINING_SCENARIOS: Scenario[] = [
  {
    id: 'new-cashier',
    title: 'New Team Member - First Week',
    situation: 'Sarah is a brand new team member who just started yesterday. She\'s enthusiastic and eager to learn but has never worked in food service before. She\'s been assigned to work the front counter during lunch rush.',
    teamMemberProfile: {
      name: 'Sarah',
      experience: 'No food service experience',
      competence: 'Low - Learning basic tasks',
      commitment: 'High - Very motivated and eager',
      developmentLevel: 'D1 - Enthusiastic Beginner'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Provide step-by-step instructions, stay close to supervise, give specific guidance on each customer interaction',
        outcome: 'Sarah feels supported and learns quickly with clear structure',
        effectiveness: 95
      },
      {
        style: 'Coaching',
        approach: 'Explain procedures and ask for her input on how to handle different situations',
        outcome: 'Sarah becomes overwhelmed trying to think through complex decisions too early',
        effectiveness: 60
      },
      {
        style: 'Supporting',
        approach: 'Encourage her to figure things out and offer help when she asks',
        outcome: 'Sarah struggles and makes mistakes, losing confidence quickly',
        effectiveness: 30
      },
      {
        style: 'Delegating',
        approach: 'Give her the basics and let her handle customers independently',
        outcome: 'Sarah feels abandoned and makes significant errors that upset customers',
        effectiveness: 15
      }
    ],
    bestStyle: 'Directing',
    explanation: 'Sarah is a D1 (Enthusiastic Beginner) - high commitment but low competence. She needs clear, specific direction and close supervision to build her skills safely. The Directing style provides the structure she needs while maintaining her enthusiasm.'
  },
  {
    id: 'experienced-struggling',
    title: 'Experienced Team Member Having Difficulties',
    situation: 'Mike has been with the team for 8 months and usually performs well. Lately, he\'s been making uncharacteristic mistakes and seems less engaged. He has the skills but appears to have lost some motivation.',
    teamMemberProfile: {
      name: 'Mike',
      experience: '8 months - Usually reliable',
      competence: 'High - Knows the job well',
      commitment: 'Low - Recently disengaged',
      developmentLevel: 'D3 - Capable but Cautious'
    },
    options: [
      {
        style: 'Directing',
        approach: 'Give him detailed instructions and monitor his work closely',
        outcome: 'Mike feels micromanaged and becomes more disengaged',
        effectiveness: 25
      },
      {
        style: 'Coaching',
        approach: 'Explain expectations clearly and discuss what might be affecting his performance',
        outcome: 'Mike appreciates the attention but still needs more emotional support',
        effectiveness: 70
      },
      {
        style: 'Supporting',
        approach: 'Listen to his concerns, provide encouragement, and collaborate on solutions',
        outcome: 'Mike feels heard and supported, regains confidence and motivation',
        effectiveness: 90
      },
      {
        style: 'Delegating',
        approach: 'Give him space and trust him to work through his issues independently',
        outcome: 'Mike continues to struggle without the support he needs',
        effectiveness: 40
      }
    ],
    bestStyle: 'Supporting',
    explanation: 'Mike is a D3 (Capable but Cautious) - high competence but low commitment. He has the skills but needs emotional support and encouragement to regain his motivation. The Supporting style addresses his confidence issues while leveraging his existing competence.'
  }
]

export default function SituationalLeadershipTraining() {
  const { week } = useParams<{ week: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [currentStyleIndex, setCurrentStyleIndex] = useState(0)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([])
  const [trainingProgress, setTrainingProgress] = useState(0)

  const currentStyle = LEADERSHIP_STYLES[currentStyleIndex]
  const currentScenario = TRAINING_SCENARIOS[currentScenarioIndex]

  useEffect(() => {
    // Calculate progress based on completed scenarios
    const progress = (completedScenarios.length / TRAINING_SCENARIOS.length) * 100
    setTrainingProgress(progress)
  }, [completedScenarios])

  const handleOptionSelect = (style: string) => {
    setSelectedOption(style)
    setShowResults(true)
    
    if (!completedScenarios.includes(currentScenario.id)) {
      setCompletedScenarios(prev => [...prev, currentScenario.id])
    }
  }

  const nextScenario = () => {
    if (currentScenarioIndex < TRAINING_SCENARIOS.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResults(false)
    }
  }

  const previousScenario = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(prev => prev - 1)
      setSelectedOption(null)
      setShowResults(false)
    }
  }

  const resetScenario = () => {
    setSelectedOption(null)
    setShowResults(false)
  }

  const nextStyle = () => {
    if (currentStyleIndex < LEADERSHIP_STYLES.length - 1) {
      setCurrentStyleIndex(prev => prev + 1)
    }
  }

  const previousStyle = () => {
    if (currentStyleIndex > 0) {
      setCurrentStyleIndex(prev => prev - 1)
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
              Situational Leadership Training
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              Master the four leadership styles and learn when to use each approach
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#E51636]">{Math.round(trainingProgress)}%</div>
            <div className="text-sm text-[#27251F]/60">Complete</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={trainingProgress} className="h-2" />
        </div>
      </div>

      {/* Leadership Styles Overview */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#27251F]">Leadership Styles Overview</CardTitle>
              <p className="text-[#27251F]/60 text-sm mt-1">Learn the four situational leadership styles</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStyle}
                disabled={currentStyleIndex === 0}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStyle}
                disabled={currentStyleIndex === LEADERSHIP_STYLES.length - 1}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className={`p-6 rounded-lg border ${currentStyle.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                <currentStyle.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentStyle.name}</h3>
                <p className="text-sm opacity-80">{currentStyle.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">When to Use:</h4>
                <ul className="space-y-2">
                  {currentStyle.whenToUse.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Key Characteristics:</h4>
                <ul className="space-y-2">
                  {currentStyle.characteristics.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Communication Examples:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStyle.communication.map((phrase, index) => (
                  <div key={index} className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm italic">"{phrase}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Restaurant Examples:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStyle.examples.map((example, index) => (
                  <div key={index} className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Style Navigation */}
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              {LEADERSHIP_STYLES.map((style, index) => (
                <button
                  key={style.id}
                  onClick={() => setCurrentStyleIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStyleIndex ? 'bg-[#E51636]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Scenarios */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#27251F]">Practice Scenarios</CardTitle>
              <p className="text-[#27251F]/60 text-sm mt-1">Apply situational leadership to real restaurant situations</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousScenario}
                disabled={currentScenarioIndex === 0}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetScenario}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextScenario}
                disabled={currentScenarioIndex === TRAINING_SCENARIOS.length - 1}
                className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-6">
            {/* Scenario Header */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-[#E51636] text-white rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#27251F]">{currentScenario.title}</h3>
                  <p className="text-sm text-[#27251F]/60">Scenario {currentScenarioIndex + 1} of {TRAINING_SCENARIOS.length}</p>
                </div>
              </div>
              <p className="text-[#27251F] leading-relaxed">{currentScenario.situation}</p>
            </div>

            {/* Team Member Profile */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">Team Member Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700"><strong>Name:</strong> {currentScenario.teamMemberProfile.name}</p>
                  <p className="text-sm text-blue-700"><strong>Experience:</strong> {currentScenario.teamMemberProfile.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700"><strong>Competence:</strong> {currentScenario.teamMemberProfile.competence}</p>
                  <p className="text-sm text-blue-700"><strong>Commitment:</strong> {currentScenario.teamMemberProfile.commitment}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800"><strong>Development Level:</strong> {currentScenario.teamMemberProfile.developmentLevel}</p>
              </div>
            </div>

            {/* Leadership Options */}
            {!showResults && (
              <div>
                <h4 className="font-semibold text-[#27251F] mb-4">How would you lead in this situation?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentScenario.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option.style)}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#E51636] hover:bg-[#E51636]/5 transition-colors"
                    >
                      <div className="font-medium text-[#27251F] mb-2">{option.style} Style</div>
                      <p className="text-sm text-[#27251F]/70">{option.approach}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {showResults && selectedOption && (
              <div className="space-y-4">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">Your Choice: {selectedOption} Style</h4>
                  {(() => {
                    const selectedOptionData = currentScenario.options.find(opt => opt.style === selectedOption)
                    const isCorrect = selectedOption === currentScenario.bestStyle

                    return (
                      <div>
                        <p className="text-sm text-green-700 mb-3">{selectedOptionData?.outcome}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-800">Effectiveness:</span>
                          <div className="flex-1 bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedOptionData?.effectiveness}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-green-800">{selectedOptionData?.effectiveness}%</span>
                        </div>
                        {isCorrect && (
                          <div className="mt-3 flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Excellent choice! This is the most effective approach.</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-3">
                    <Lightbulb className="w-5 h-5 inline mr-2" />
                    Best Approach: {currentScenario.bestStyle} Style
                  </h4>
                  <p className="text-sm text-yellow-700">{currentScenario.explanation}</p>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={nextScenario}
                    disabled={currentScenarioIndex === TRAINING_SCENARIOS.length - 1}
                    className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  >
                    {currentScenarioIndex === TRAINING_SCENARIOS.length - 1 ? 'Complete Training' : 'Next Scenario'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-[20px] border border-[#E51636]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#27251F] text-lg">Training Progress</h3>
              <p className="text-[#27251F]/70 text-sm">
                {completedScenarios.length} of {TRAINING_SCENARIOS.length} scenarios completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#E51636]">{Math.round(trainingProgress)}%</div>
              <div className="text-sm text-[#27251F]/60">Complete</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={trainingProgress} className="h-3" />
          </div>
          {trainingProgress === 100 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-[#E51636]/20">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#E51636]" />
                <div>
                  <h4 className="font-semibold text-[#27251F]">Congratulations!</h4>
                  <p className="text-sm text-[#27251F]/70">You've completed all training scenarios. Ready to apply situational leadership!</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
