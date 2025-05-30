import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Shield,
  CheckCircle,
  AlertTriangle,
  Heart,
  Lightbulb,
  Target,
  Users
} from 'lucide-react'

interface DifficultConversationsFrameworkFormProps {
  value: string
  onChange: (value: string) => void
}

interface ConversationFramework {
  conversationType: string
  preparation: string
  openingApproach: string
  keyMessages: string
  anticipatedReactions: string
  responseStrategies: string
  closingApproach: string
}

interface FrameworkApplication {
  scenario: string
  stakeholder: string
  challenge: string
  frameworkUsed: string
  outcome: string
  lessons: string
}

const DifficultConversationsFrameworkForm: React.FC<DifficultConversationsFrameworkFormProps> = ({ value, onChange }) => {
  const [frameworks, setFrameworks] = useState<ConversationFramework[]>([
    { conversationType: '', preparation: '', openingApproach: '', keyMessages: '', anticipatedReactions: '', responseStrategies: '', closingApproach: '' },
    { conversationType: '', preparation: '', openingApproach: '', keyMessages: '', anticipatedReactions: '', responseStrategies: '', closingApproach: '' }
  ])
  const [applications, setApplications] = useState<FrameworkApplication[]>([
    { scenario: '', stakeholder: '', challenge: '', frameworkUsed: '', outcome: '', lessons: '' },
    { scenario: '', stakeholder: '', challenge: '', frameworkUsed: '', outcome: '', lessons: '' }
  ])
  const [personalReflection, setPersonalReflection] = useState<string>('')
  const [improvementPlan, setImprovementPlan] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.frameworks) setFrameworks(parsed.frameworks)
        if (parsed.applications) setApplications(parsed.applications)
        if (parsed.personalReflection) setPersonalReflection(parsed.personalReflection)
        if (parsed.improvementPlan) setImprovementPlan(parsed.improvementPlan)
      } catch (e) {
        console.error('Error parsing difficult conversations framework data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      frameworks,
      applications,
      personalReflection,
      improvementPlan
    })
    onChange(formData)
  }, [frameworks, applications, personalReflection, improvementPlan, onChange])

  const updateFramework = (index: number, field: keyof ConversationFramework, value: string) => {
    const updatedFrameworks = [...frameworks]
    updatedFrameworks[index] = { ...updatedFrameworks[index], [field]: value }
    setFrameworks(updatedFrameworks)
  }

  const updateApplication = (index: number, field: keyof FrameworkApplication, value: string) => {
    const updatedApplications = [...applications]
    updatedApplications[index] = { ...updatedApplications[index], [field]: value }
    setApplications(updatedApplications)
  }

  const getCompletionStatus = () => {
    const completedFrameworks = frameworks.filter(framework =>
      framework.conversationType.trim().length > 0 &&
      framework.preparation.trim().length > 0 &&
      framework.keyMessages.trim().length > 0
    ).length

    const completedApplications = applications.filter(app =>
      app.scenario.trim().length > 0 &&
      app.challenge.trim().length > 0 &&
      app.outcome.trim().length > 0
    ).length

    return {
      frameworks: Math.round((completedFrameworks / 2) * 100),
      applications: Math.round((completedApplications / 2) * 100),
      reflection: personalReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-800">Difficult Conversations Framework</h3>
        </div>
        <p className="text-sm text-red-700 mb-3">
          Develop structured approaches for handling challenging conversations in the workplace.
          Create frameworks for different types of difficult conversations and practice applying them effectively.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.frameworks === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.frameworks / 50)}/2 Frameworks
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.applications === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.applications / 50)}/2 Applications
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Conversation Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Common Difficult Conversation Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">Performance Issues</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Addressing poor performance</li>
                <li>• Discussing missed deadlines</li>
                <li>• Correcting behavior problems</li>
                <li>• Setting performance expectations</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Interpersonal Conflicts</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mediating team disputes</li>
                <li>• Addressing personality clashes</li>
                <li>• Resolving communication breakdowns</li>
                <li>• Managing workplace tensions</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Policy & Compliance</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Enforcing company policies</li>
                <li>• Addressing safety violations</li>
                <li>• Discussing attendance issues</li>
                <li>• Handling inappropriate behavior</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Change & Transitions</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Communicating organizational changes</li>
                <li>• Discussing role modifications</li>
                <li>• Addressing resistance to change</li>
                <li>• Managing transition concerns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Frameworks */}
      {frameworks.map((framework, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Conversation Framework {index + 1}
              {framework.conversationType && framework.preparation && framework.keyMessages && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`conversation-type-${index}`} className="text-sm font-medium">
                Conversation Type
              </Label>
              <Input
                id={`conversation-type-${index}`}
                placeholder="e.g., Performance Correction, Conflict Resolution, Policy Enforcement"
                value={framework.conversationType}
                onChange={(e) => updateFramework(index, 'conversationType', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`preparation-${index}`} className="text-sm font-medium">
                Preparation Strategy
              </Label>
              <Textarea
                id={`preparation-${index}`}
                placeholder="How do you prepare for this type of conversation? What information do you gather? How do you plan your approach?"
                value={framework.preparation}
                onChange={(e) => updateFramework(index, 'preparation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`opening-${index}`} className="text-sm font-medium">
                Opening Approach
              </Label>
              <Textarea
                id={`opening-${index}`}
                placeholder="How do you start this type of difficult conversation? What tone and words do you use to set the right atmosphere?"
                value={framework.openingApproach}
                onChange={(e) => updateFramework(index, 'openingApproach', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`key-messages-${index}`} className="text-sm font-medium">
                Key Messages & Structure
              </Label>
              <Textarea
                id={`key-messages-${index}`}
                placeholder="What are the essential points you need to communicate? How do you structure the conversation to be clear and effective?"
                value={framework.keyMessages}
                onChange={(e) => updateFramework(index, 'keyMessages', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`reactions-${index}`} className="text-sm font-medium">
                Anticipated Reactions
              </Label>
              <Textarea
                id={`reactions-${index}`}
                placeholder="What reactions do you typically expect? How might people respond emotionally or defensively?"
                value={framework.anticipatedReactions}
                onChange={(e) => updateFramework(index, 'anticipatedReactions', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`response-strategies-${index}`} className="text-sm font-medium">
                Response Strategies
              </Label>
              <Textarea
                id={`response-strategies-${index}`}
                placeholder="How do you handle different reactions? What techniques do you use to keep the conversation productive?"
                value={framework.responseStrategies}
                onChange={(e) => updateFramework(index, 'responseStrategies', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`closing-${index}`} className="text-sm font-medium">
                Closing & Follow-up
              </Label>
              <Textarea
                id={`closing-${index}`}
                placeholder="How do you end the conversation positively? What follow-up actions do you typically plan?"
                value={framework.closingApproach}
                onChange={(e) => updateFramework(index, 'closingApproach', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Framework Applications */}
      {applications.map((application, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Framework Application {index + 1}
              {application.scenario && application.challenge && application.outcome && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`scenario-${index}`} className="text-sm font-medium">
                Real Scenario Description
              </Label>
              <Textarea
                id={`scenario-${index}`}
                placeholder="Describe a real difficult conversation you had or need to have. What was the situation and context?"
                value={application.scenario}
                onChange={(e) => updateApplication(index, 'scenario', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stakeholder-${index}`} className="text-sm font-medium">
                Stakeholder (use initials for privacy)
              </Label>
              <Input
                id={`stakeholder-${index}`}
                placeholder="e.g., Team Member J.D., Manager K.S."
                value={application.stakeholder}
                onChange={(e) => updateApplication(index, 'stakeholder', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`challenge-${index}`} className="text-sm font-medium">
                Primary Challenge
              </Label>
              <Textarea
                id={`challenge-${index}`}
                placeholder="What made this conversation difficult? What were the main challenges or sensitivities?"
                value={application.challenge}
                onChange={(e) => updateApplication(index, 'challenge', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`framework-used-${index}`} className="text-sm font-medium">
                Framework Applied
              </Label>
              <Textarea
                id={`framework-used-${index}`}
                placeholder="Which framework did you use or plan to use? How did you adapt it for this specific situation?"
                value={application.frameworkUsed}
                onChange={(e) => updateApplication(index, 'frameworkUsed', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`outcome-${index}`} className="text-sm font-medium">
                Outcome & Results
              </Label>
              <Textarea
                id={`outcome-${index}`}
                placeholder="What was the result of the conversation? How did the person respond? What was achieved?"
                value={application.outcome}
                onChange={(e) => updateApplication(index, 'outcome', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`lessons-${index}`} className="text-sm font-medium">
                Lessons Learned
              </Label>
              <Textarea
                id={`lessons-${index}`}
                placeholder="What did you learn from this experience? What would you do differently? How will you improve your approach?"
                value={application.lessons}
                onChange={(e) => updateApplication(index, 'lessons', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Personal Reflection & Improvement Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Personal Reflection & Improvement Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-reflection" className="text-sm font-medium">
              Personal Reflection on Difficult Conversations
            </Label>
            <Textarea
              id="personal-reflection"
              placeholder="Reflect on your overall approach to difficult conversations. What are your strengths? What patterns do you notice in your challenges? How has developing these frameworks helped you?"
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement-plan" className="text-sm font-medium">
              Continuous Improvement Plan
            </Label>
            <Textarea
              id="improvement-plan"
              placeholder="What specific steps will you take to continue improving your difficult conversation skills? How will you practice and refine your frameworks?"
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DifficultConversationsFrameworkForm
