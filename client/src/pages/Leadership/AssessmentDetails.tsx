import * as React from 'react'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  text: string
  description?: string
  area: string
  options: {
    value: number
    label: string
    description: string
  }[]
}

const questions: Record<string, Question[]> = {
  'leadership-character': [
    {
      id: 'integrity-1',
      text: 'How consistently do you demonstrate ethical behavior in challenging situations?',
      description: 'Consider situations where there might be pressure to compromise standards.',
      area: 'Integrity',
      options: [
        { value: 1, label: 'Rarely', description: 'Often struggle with ethical decisions' },
        { value: 2, label: 'Sometimes', description: 'Occasionally maintain ethical standards' },
        { value: 3, label: 'Usually', description: 'Generally uphold ethical standards' },
        { value: 4, label: 'Almost Always', description: 'Consistently demonstrate ethical behavior' },
        { value: 5, label: 'Always', description: 'Unwavering commitment to ethical principles' }
      ]
    },
    {
      id: 'integrity-2',
      text: 'How transparent are you in your communication with team members?',
      area: 'Integrity',
      options: [
        { value: 1, label: 'Minimal', description: 'Share only what is absolutely necessary' },
        { value: 2, label: 'Limited', description: 'Share some information selectively' },
        { value: 3, label: 'Moderate', description: 'Share most relevant information' },
        { value: 4, label: 'High', description: 'Regular transparent communication' },
        { value: 5, label: 'Complete', description: 'Full transparency in all appropriate matters' }
      ]
    },
    {
      id: 'integrity-3',
      text: 'How well do you maintain commitments and promises to your team?',
      area: 'Integrity',
      options: [
        { value: 1, label: 'Rarely', description: 'Often fail to follow through' },
        { value: 2, label: 'Sometimes', description: 'Follow through inconsistently' },
        { value: 3, label: 'Usually', description: 'Generally keep commitments' },
        { value: 4, label: 'Almost Always', description: 'Consistently reliable' },
        { value: 5, label: 'Always', description: 'Known for absolute reliability' }
      ]
    },
    {
      id: 'humility-1',
      text: 'How often do you actively seek feedback from others?',
      area: 'Humility',
      options: [
        { value: 1, label: 'Never', description: 'Do not seek feedback' },
        { value: 2, label: 'Rarely', description: 'Only during required reviews' },
        { value: 3, label: 'Sometimes', description: 'Occasionally ask for feedback' },
        { value: 4, label: 'Often', description: 'Regularly seek feedback' },
        { value: 5, label: 'Very Often', description: 'Proactively seek feedback in all areas' }
      ]
    },
    {
      id: 'humility-2',
      text: 'How willing are you to admit mistakes and learn from them?',
      area: 'Humility',
      options: [
        { value: 1, label: 'Rarely', description: 'Difficulty acknowledging mistakes' },
        { value: 2, label: 'Sometimes', description: 'Occasionally admit clear mistakes' },
        { value: 3, label: 'Usually', description: 'Generally open to acknowledging errors' },
        { value: 4, label: 'Almost Always', description: 'Readily admit and learn from mistakes' },
        { value: 5, label: 'Always', description: 'Actively use mistakes as learning opportunities' }
      ]
    },
    {
      id: 'courage-1',
      text: 'How comfortable are you making difficult decisions?',
      area: 'Courage',
      options: [
        { value: 1, label: 'Very Uncomfortable', description: 'Avoid difficult decisions' },
        { value: 2, label: 'Somewhat Uncomfortable', description: 'Hesitant with difficult decisions' },
        { value: 3, label: 'Moderately Comfortable', description: 'Can make difficult decisions when needed' },
        { value: 4, label: 'Comfortable', description: 'Confident in making difficult decisions' },
        { value: 5, label: 'Very Comfortable', description: 'Embrace challenging decisions' }
      ]
    },
    {
      id: 'courage-2',
      text: 'How often do you speak up about important issues, even when it\'s uncomfortable?',
      area: 'Courage',
      options: [
        { value: 1, label: 'Rarely', description: 'Avoid confrontation' },
        { value: 2, label: 'Sometimes', description: 'Speak up occasionally' },
        { value: 3, label: 'Usually', description: 'Generally voice concerns' },
        { value: 4, label: 'Often', description: 'Regularly address important issues' },
        { value: 5, label: 'Always', description: 'Consistently advocate for what\'s right' }
      ]
    }
  ],
  'servant-leadership': [
    {
      id: 'empowerment-1',
      text: 'How effectively do you delegate responsibilities to team members?',
      area: 'Empowerment',
      options: [
        { value: 1, label: 'Rarely', description: 'Prefer to handle most tasks personally' },
        { value: 2, label: 'Sometimes', description: 'Delegate only when necessary' },
        { value: 3, label: 'Usually', description: 'Regularly delegate appropriate tasks' },
        { value: 4, label: 'Often', description: 'Actively look for delegation opportunities' },
        { value: 5, label: 'Always', description: 'Consistently empower others through delegation' }
      ]
    },
    {
      id: 'empowerment-2',
      text: 'How well do you support team members\' professional development?',
      area: 'Empowerment',
      options: [
        { value: 1, label: 'Minimal', description: 'Limited focus on development' },
        { value: 2, label: 'Basic', description: 'Some support for development' },
        { value: 3, label: 'Moderate', description: 'Regular development support' },
        { value: 4, label: 'Strong', description: 'Active development facilitation' },
        { value: 5, label: 'Exceptional', description: 'Prioritize and champion development' }
      ]
    },
    {
      id: 'service-1',
      text: 'How often do you prioritize team members\' needs over your own?',
      area: 'Service Orientation',
      options: [
        { value: 1, label: 'Rarely', description: 'Focus primarily on own responsibilities' },
        { value: 2, label: 'Sometimes', description: 'Consider team needs occasionally' },
        { value: 3, label: 'Usually', description: 'Balance team and personal priorities' },
        { value: 4, label: 'Often', description: 'Regularly put team first' },
        { value: 5, label: 'Always', description: 'Consistently prioritize team needs' }
      ]
    },
    {
      id: 'service-2',
      text: 'How effectively do you remove obstacles for your team?',
      area: 'Service Orientation',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited involvement in problem-solving' },
        { value: 2, label: 'Sometimes', description: 'Address obvious obstacles' },
        { value: 3, label: 'Usually', description: 'Regularly help remove barriers' },
        { value: 4, label: 'Often', description: 'Proactively identify and remove obstacles' },
        { value: 5, label: 'Always', description: 'Consistently eliminate barriers to success' }
      ]
    },
    {
      id: 'vision-1',
      text: 'How effectively do you communicate the team\'s vision and purpose?',
      area: 'Vision Sharing',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited vision communication' },
        { value: 2, label: 'Sometimes', description: 'Occasional vision discussions' },
        { value: 3, label: 'Usually', description: 'Regular vision reinforcement' },
        { value: 4, label: 'Often', description: 'Active vision promotion' },
        { value: 5, label: 'Always', description: 'Inspiring vision communication' }
      ]
    },
    {
      id: 'vision-2',
      text: 'How well do you connect daily work to larger organizational goals?',
      area: 'Vision Sharing',
      options: [
        { value: 1, label: 'Rarely', description: 'Focus mainly on tasks' },
        { value: 2, label: 'Sometimes', description: 'Occasional goal connection' },
        { value: 3, label: 'Usually', description: 'Regular goal alignment' },
        { value: 4, label: 'Often', description: 'Strong goal integration' },
        { value: 5, label: 'Always', description: 'Seamless goal connection' }
      ]
    }
  ],
  'team-dynamics': [
    {
      id: 'team-building-1',
      text: 'How effective are you at building trust within your team?',
      area: 'Team Building',
      options: [
        { value: 1, label: 'Not Effective', description: 'Struggle to build trust' },
        { value: 2, label: 'Somewhat Effective', description: 'Basic trust-building skills' },
        { value: 3, label: 'Effective', description: 'Good at building trust' },
        { value: 4, label: 'Very Effective', description: 'Strong trust-building abilities' },
        { value: 5, label: 'Extremely Effective', description: 'Expert at building team trust' }
      ]
    },
    {
      id: 'team-building-2',
      text: 'How well do you foster collaboration among team members?',
      area: 'Team Building',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited collaboration focus' },
        { value: 2, label: 'Sometimes', description: 'Basic collaboration support' },
        { value: 3, label: 'Usually', description: 'Regular collaboration promotion' },
        { value: 4, label: 'Often', description: 'Active collaboration facilitation' },
        { value: 5, label: 'Always', description: 'Excellence in fostering collaboration' }
      ]
    },
    {
      id: 'conflict-1',
      text: 'How effectively do you manage team conflicts?',
      area: 'Conflict Resolution',
      options: [
        { value: 1, label: 'Not Effective', description: 'Avoid addressing conflicts' },
        { value: 2, label: 'Somewhat Effective', description: 'Basic conflict management' },
        { value: 3, label: 'Effective', description: 'Good conflict resolution skills' },
        { value: 4, label: 'Very Effective', description: 'Strong conflict management' },
        { value: 5, label: 'Extremely Effective', description: 'Expert at resolving conflicts' }
      ]
    },
    {
      id: 'conflict-2',
      text: 'How well do you facilitate productive discussions during disagreements?',
      area: 'Conflict Resolution',
      options: [
        { value: 1, label: 'Rarely', description: 'Struggle with difficult discussions' },
        { value: 2, label: 'Sometimes', description: 'Basic facilitation skills' },
        { value: 3, label: 'Usually', description: 'Good discussion management' },
        { value: 4, label: 'Often', description: 'Strong facilitation abilities' },
        { value: 5, label: 'Always', description: 'Expert at facilitating discussions' }
      ]
    }
  ],
  'grow-leadership': [
    {
      id: 'goals-1',
      text: 'How effectively do you help team members set clear and meaningful goals?',
      area: 'Goals',
      description: 'Consider your ability to guide others in establishing SMART goals that align with organizational objectives.',
      options: [
        { value: 1, label: 'Rarely', description: 'Minimal involvement in goal-setting process' },
        { value: 2, label: 'Sometimes', description: 'Occasionally help set basic goals' },
        { value: 3, label: 'Usually', description: 'Regularly assist in setting clear goals' },
        { value: 4, label: 'Often', description: 'Actively guide meaningful goal development' },
        { value: 5, label: 'Always', description: 'Consistently facilitate powerful goal-setting sessions' }
      ]
    },
    {
      id: 'goals-2',
      text: 'How well do you align individual goals with team objectives?',
      area: 'Goals',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited goal alignment' },
        { value: 2, label: 'Sometimes', description: 'Basic goal connection' },
        { value: 3, label: 'Usually', description: 'Regular goal alignment' },
        { value: 4, label: 'Often', description: 'Strong goal integration' },
        { value: 5, label: 'Always', description: 'Expert at goal alignment' }
      ]
    },
    {
      id: 'reality-1',
      text: 'How well do you help team members assess their current situation and challenges?',
      area: 'Reality',
      description: 'Evaluate your ability to facilitate honest self-assessment and situation analysis.',
      options: [
        { value: 1, label: 'Basic', description: 'Limited exploration of current situations' },
        { value: 2, label: 'Developing', description: 'Some ability to assess current state' },
        { value: 3, label: 'Competent', description: 'Good at helping identify key challenges' },
        { value: 4, label: 'Skilled', description: 'Strong ability to facilitate deep situation analysis' },
        { value: 5, label: 'Expert', description: 'Exceptional at guiding thorough reality assessment' }
      ]
    },
    {
      id: 'reality-2',
      text: 'How effectively do you use questioning to uncover root causes?',
      area: 'Reality',
      options: [
        { value: 1, label: 'Basic', description: 'Limited questioning skills' },
        { value: 2, label: 'Developing', description: 'Some questioning ability' },
        { value: 3, label: 'Competent', description: 'Good questioning techniques' },
        { value: 4, label: 'Skilled', description: 'Strong questioning skills' },
        { value: 5, label: 'Expert', description: 'Masterful at uncovering root causes' }
      ]
    },
    {
      id: 'options-1',
      text: 'How effectively do you help team members explore different options and possibilities?',
      area: 'Options',
      description: 'Consider your ability to facilitate creative problem-solving and option generation.',
      options: [
        { value: 1, label: 'Limited', description: 'Rarely explore multiple options' },
        { value: 2, label: 'Fair', description: 'Sometimes consider alternative approaches' },
        { value: 3, label: 'Good', description: 'Regularly explore various possibilities' },
        { value: 4, label: 'Very Good', description: 'Actively encourage creative solution finding' },
        { value: 5, label: 'Excellent', description: 'Masterful at facilitating option exploration' }
      ]
    },
    {
      id: 'options-2',
      text: 'How well do you encourage innovative thinking in problem-solving?',
      area: 'Options',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited focus on innovation' },
        { value: 2, label: 'Sometimes', description: 'Basic innovation support' },
        { value: 3, label: 'Usually', description: 'Good at encouraging new ideas' },
        { value: 4, label: 'Often', description: 'Strong innovation facilitation' },
        { value: 5, label: 'Always', description: 'Excellence in fostering innovation' }
      ]
    },
    {
      id: 'way-forward-1',
      text: 'How well do you support team members in creating actionable plans?',
      area: 'Way Forward',
      description: 'Assess your ability to help others develop concrete action steps and commitment.',
      options: [
        { value: 1, label: 'Rarely', description: 'Minimal focus on action planning' },
        { value: 2, label: 'Occasionally', description: 'Sometimes help create basic plans' },
        { value: 3, label: 'Usually', description: 'Regularly assist in developing action steps' },
        { value: 4, label: 'Frequently', description: 'Actively guide detailed plan creation' },
        { value: 5, label: 'Always', description: 'Consistently ensure robust action planning' }
      ]
    },
    {
      id: 'way-forward-2',
      text: 'How effectively do you follow up on commitments and progress?',
      area: 'Way Forward',
      options: [
        { value: 1, label: 'Rarely', description: 'Limited follow-up' },
        { value: 2, label: 'Sometimes', description: 'Occasional progress checks' },
        { value: 3, label: 'Usually', description: 'Regular progress monitoring' },
        { value: 4, label: 'Often', description: 'Consistent follow-up process' },
        { value: 5, label: 'Always', description: 'Excellence in progress tracking' }
      ]
    }
  ]
}

const formSchema = z.object({
  answers: z.record(z.number().min(1).max(5))
})

export default function AssessmentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const assessmentQuestions = questions[id || ''] || []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {}
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Calculate scores by area
    const areaScores: Record<string, { total: number; count: number }> = {}
    
    Object.entries(values.answers).forEach(([questionId, score]) => {
      const question = assessmentQuestions.find(q => q.id === questionId)
      if (question) {
        if (!areaScores[question.area]) {
          areaScores[question.area] = { total: 0, count: 0 }
        }
        areaScores[question.area].total += score
        areaScores[question.area].count += 1
      }
    })

    // Calculate final scores and navigate to results
    const results = Object.entries(areaScores).map(([area, scores]) => ({
      area,
      score: Math.round((scores.total / scores.count) * 100) / 100
    }))

    // TODO: Save results to backend
    console.log('Assessment completed:', results)
    
    // Navigate back to assessments list
    navigate('/leadership/assessments')
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100

  const handleNext = () => {
    const currentAnswer = form.getValues().answers[currentQuestion.id]
    if (!currentAnswer) {
      form.setError(`answers.${currentQuestion.id}`, {
        type: 'required',
        message: 'Please select an answer before continuing'
      })
      return
    }
    
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  if (!id || !assessmentQuestions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E51636]" />
        <h2 className="text-xl font-semibold text-[#27251F]">Assessment Not Found</h2>
        <p className="text-[#27251F]/60">The requested assessment could not be found.</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/leadership/assessments')}
          className="hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </Button>
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
            onClick={() => navigate('/leadership/assessments')}
            className="p-2 hover:bg-[#E51636]/5 hover:text-[#E51636]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">
              {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Assessment
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-[#27251F]/60">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-[#27251F]">{currentQuestion.text}</CardTitle>
          {currentQuestion.description && (
            <CardDescription className="text-[#27251F]/60 mt-2">{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name={`answers.${currentQuestion.id}`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="space-y-3">
                        {currentQuestion.options.map(option => (
                          <div
                            key={option.value}
                            className="flex items-start space-x-3 space-y-0"
                          >
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <RadioGroupItem 
                                value={option.value}
                                className="border-2 border-gray-200 text-[#E51636] focus:border-[#E51636]"
                              />
                            </RadioGroup>
                            <label
                              className="font-normal cursor-pointer"
                              onClick={() => field.onChange(option.value)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-[#27251F]">{option.label}</span>
                                <span className="text-sm text-[#27251F]/60">
                                  {option.description}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#E51636]" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636] ${
            currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
        >
          {currentQuestionIndex === assessmentQuestions.length - 1 ? (
            <>
              Complete
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 