import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Play,
  CheckCircle,
  Clock,
  Star,
  Lightbulb,
  Target,
  AlertCircle
} from 'lucide-react'

interface DifficultConversationPracticeFormProps {
  value: string
  onChange: (value: string) => void
}

interface ConversationPractice {
  date: string
  conversationType: string
  participant: string
  preparation: string
  actualConversation: string
  challenges: string
  successes: string
  feedback: string
  improvements: string
}

const DifficultConversationPracticeForm: React.FC<DifficultConversationPracticeFormProps> = ({ value, onChange }) => {
  const [practices, setPractices] = useState<ConversationPractice[]>([
    { date: '', conversationType: '', participant: '', preparation: '', actualConversation: '', challenges: '', successes: '', feedback: '', improvements: '' },
    { date: '', conversationType: '', participant: '', preparation: '', actualConversation: '', challenges: '', successes: '', feedback: '', improvements: '' },
    { date: '', conversationType: '', participant: '', preparation: '', actualConversation: '', challenges: '', successes: '', feedback: '', improvements: '' }
  ])
  const [overallReflection, setOverallReflection] = useState<string>('')
  const [skillDevelopment, setSkillDevelopment] = useState<string>('')
  const [futureStrategy, setFutureStrategy] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.practices) setPractices(parsed.practices)
        if (parsed.overallReflection) setOverallReflection(parsed.overallReflection)
        if (parsed.skillDevelopment) setSkillDevelopment(parsed.skillDevelopment)
        if (parsed.futureStrategy) setFutureStrategy(parsed.futureStrategy)
      } catch (e) {
        console.error('Error parsing difficult conversation practice data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      practices,
      overallReflection,
      skillDevelopment,
      futureStrategy
    })
    onChange(formData)
  }, [practices, overallReflection, skillDevelopment, futureStrategy, onChange])

  const updatePractice = (index: number, field: keyof ConversationPractice, value: string) => {
    const updatedPractices = [...practices]
    updatedPractices[index] = { ...updatedPractices[index], [field]: value }
    setPractices(updatedPractices)
  }

  const getCompletionStatus = () => {
    const completedPractices = practices.filter(practice =>
      practice.conversationType.trim().length > 0 &&
      practice.participant.trim().length > 0 &&
      practice.actualConversation.trim().length > 0
    ).length

    return {
      practices: Math.round((completedPractices / 3) * 100),
      reflection: overallReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Difficult Conversation Practice</h3>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Practice having actual difficult conversations using the frameworks you've developed.
          Document three real conversations to build your confidence and refine your approach.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.practices === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.practices / 33.33)}/3 Conversations
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Practice Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Practice Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Before the Conversation</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Choose your framework approach</li>
                <li>• Prepare key messages</li>
                <li>• Anticipate reactions</li>
                <li>• Set clear objectives</li>
                <li>• Plan the setting and timing</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">During the Conversation</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Stay calm and focused</li>
                <li>• Listen actively</li>
                <li>• Use your framework structure</li>
                <li>• Be empathetic but firm</li>
                <li>• Document key points afterward</li>
              </ul>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">After the Conversation</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Reflect on what went well</li>
                <li>• Identify areas for improvement</li>
                <li>• Note unexpected reactions</li>
                <li>• Plan follow-up actions</li>
                <li>• Update your framework</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Safety Considerations</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Start with lower-stakes conversations</li>
                <li>• Have support available if needed</li>
                <li>• Know when to pause or reschedule</li>
                <li>• Respect privacy and confidentiality</li>
                <li>• Follow company policies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Practices */}
      {practices.map((practice, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Conversation Practice {index + 1}
              {practice.conversationType && practice.participant && practice.actualConversation && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`date-${index}`} className="text-sm font-medium">
                  Date of Conversation
                </Label>
                <Input
                  id={`date-${index}`}
                  type="date"
                  value={practice.date}
                  onChange={(e) => updatePractice(index, 'date', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`type-${index}`} className="text-sm font-medium">
                  Conversation Type
                </Label>
                <Input
                  id={`type-${index}`}
                  placeholder="e.g., Performance Issue, Conflict Resolution, Policy Discussion"
                  value={practice.conversationType}
                  onChange={(e) => updatePractice(index, 'conversationType', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`participant-${index}`} className="text-sm font-medium">
                Conversation Participant (use initials for privacy)
              </Label>
              <Input
                id={`participant-${index}`}
                placeholder="e.g., Team Member A.B., Manager C.D."
                value={practice.participant}
                onChange={(e) => updatePractice(index, 'participant', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`preparation-${index}`} className="text-sm font-medium">
                Preparation & Planning
              </Label>
              <Textarea
                id={`preparation-${index}`}
                placeholder="How did you prepare for this conversation? What framework did you plan to use? What were your objectives?"
                value={practice.preparation}
                onChange={(e) => updatePractice(index, 'preparation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`conversation-${index}`} className="text-sm font-medium">
                How the Conversation Went
              </Label>
              <Textarea
                id={`conversation-${index}`}
                placeholder="Describe how the conversation unfolded. What did you say? How did they respond? How did you handle their reactions?"
                value={practice.actualConversation}
                onChange={(e) => updatePractice(index, 'actualConversation', e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`challenges-${index}`} className="text-sm font-medium">
                Challenges Encountered
              </Label>
              <Textarea
                id={`challenges-${index}`}
                placeholder="What difficulties did you face? What unexpected reactions occurred? Where did you struggle?"
                value={practice.challenges}
                onChange={(e) => updatePractice(index, 'challenges', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`successes-${index}`} className="text-sm font-medium">
                What Went Well
              </Label>
              <Textarea
                id={`successes-${index}`}
                placeholder="What aspects of the conversation were successful? What techniques worked well? What are you proud of?"
                value={practice.successes}
                onChange={(e) => updatePractice(index, 'successes', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`feedback-${index}`} className="text-sm font-medium">
                Feedback Received (if any)
              </Label>
              <Textarea
                id={`feedback-${index}`}
                placeholder="Did you receive any feedback about your approach? How did the other person respond to your conversation style?"
                value={practice.feedback}
                onChange={(e) => updatePractice(index, 'feedback', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`improvements-${index}`} className="text-sm font-medium">
                Areas for Improvement
              </Label>
              <Textarea
                id={`improvements-${index}`}
                placeholder="What would you do differently next time? What specific skills do you want to develop further?"
                value={practice.improvements}
                onChange={(e) => updatePractice(index, 'improvements', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overall Reflection & Development */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Overall Reflection & Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overall-reflection" className="text-sm font-medium">
              Overall Reflection on Practice Sessions
            </Label>
            <Textarea
              id="overall-reflection"
              placeholder="Reflect on your three practice conversations. What patterns do you notice? How has your confidence changed? What are your biggest insights?"
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-development" className="text-sm font-medium">
              Skill Development Progress
            </Label>
            <Textarea
              id="skill-development"
              placeholder="How have your difficult conversation skills developed through this practice? What specific improvements have you made? What skills are you most proud of developing?"
              value={skillDevelopment}
              onChange={(e) => setSkillDevelopment(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="future-strategy" className="text-sm font-medium">
              Future Strategy & Continued Practice
            </Label>
            <Textarea
              id="future-strategy"
              placeholder="How will you continue developing these skills? What types of conversations will you seek out for practice? What support or resources do you need?"
              value={futureStrategy}
              onChange={(e) => setFutureStrategy(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DifficultConversationPracticeForm
