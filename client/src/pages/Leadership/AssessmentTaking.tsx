import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Save, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

interface Question {
  id: string
  text: string
  description?: string
  type: 'multiple_choice' | 'rating_scale' | 'text_response' | 'yes_no' | 'likert_scale'
  options: { value: number | string; label: string }[]
  area: string
  weight: number
  required: boolean
}

interface Assessment {
  _id: string
  template: {
    _id: string
    title: string
    description: string
    questions: Question[]
    areas: { name: string; description: string; weight: number }[]
  }
  status: string
  responses: { questionId: string; answer: any; score?: number }[]
}

export default function AssessmentTaking() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAssessment()
  }, [assessmentId])

  const fetchAssessment = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/leadership/assessments/${assessmentId}`)
      const assessmentData = response.data

      setAssessment(assessmentData)

      // Initialize responses from existing data
      const existingResponses: Record<string, any> = {}
      assessmentData.responses?.forEach((r: any) => {
        existingResponses[r.questionId] = r.answer
      })
      setResponses(existingResponses)

    } catch (error) {
      console.error('Error fetching assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to load assessment. Please try again.',
        variant: 'destructive'
      })
      navigate('/leadership/assessments')
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (isComplete = false) => {
    if (!assessment) return

    try {
      setSaving(true)

      // Convert responses to the expected format
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
        const question = assessment.template.questions.find(q => q.id === questionId)
        let score = undefined

        // Calculate score based on question type
        if (question?.type === 'likert_scale' || question?.type === 'rating_scale') {
          score = typeof answer === 'number' ? answer : parseInt(answer)
        } else if (question?.type === 'yes_no') {
          score = answer === 'yes' ? 5 : 1
        }

        return {
          questionId,
          answer,
          score
        }
      })

      await api.put(`/api/leadership/assessments/${assessmentId}/submit`, {
        responses: formattedResponses,
        isComplete
      })

      if (isComplete) {
        toast({
          title: 'Assessment Completed!',
          description: 'Your responses have been saved and scored.',
        })
        navigate(`/leadership/assessments/${assessmentId}/results`)
      } else {
        toast({
          title: 'Progress Saved',
          description: 'Your responses have been saved.',
        })
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to save responses. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const canProceed = () => {
    if (!assessment) return false
    const currentQuestion = assessment.template.questions[currentQuestionIndex]
    return !currentQuestion.required || responses[currentQuestion.id] !== undefined
  }

  const isComplete = () => {
    if (!assessment) return false
    return assessment.template.questions.every(q =>
      !q.required || responses[q.id] !== undefined
    )
  }

  const progress = assessment ?
    (Object.keys(responses).length / assessment.template.questions.length) * 100 : 0

  if (loading || !assessment) {
    return (
      <div className="space-y-6 px-4 md:px-6 pb-6">
        <div className="bg-white rounded-[20px] p-6 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = assessment.template.questions[currentQuestionIndex]

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'likert_scale':
      case 'rating_scale':
        return (
          <RadioGroup
            value={responses[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                <Label htmlFor={option.value.toString()} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'yes_no':
        return (
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        )

      case 'text_response':
        return (
          <Textarea
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Enter your response..."
            className="min-h-[120px]"
          />
        )

      case 'multiple_choice':
        return (
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                <Label htmlFor={option.value.toString()} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return <div>Unsupported question type</div>
    }
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
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">
              {assessment.template.title}
            </h1>
            <p className="text-[#27251F]/60 mt-1">
              Question {currentQuestionIndex + 1} of {assessment.template.questions.length}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveProgress(false)}
            disabled={saving}
            className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-[#27251F]/60">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="bg-white rounded-[20px] border border-gray-100">
        <CardHeader className="p-6">
          <CardTitle className="text-xl text-[#27251F]">{currentQuestion.text}</CardTitle>
          {currentQuestion.description && (
            <p className="text-[#27251F]/60 mt-2">{currentQuestion.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              {currentQuestion.area}
            </span>
            {currentQuestion.required && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                Required
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {renderQuestionInput()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === assessment.template.questions.length - 1 ? (
            <Button
              onClick={() => saveProgress(true)}
              disabled={!isComplete() || saving}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {saving ? 'Submitting...' : 'Complete Assessment'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(assessment.template.questions.length - 1, currentQuestionIndex + 1))}
              disabled={!canProceed()}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
