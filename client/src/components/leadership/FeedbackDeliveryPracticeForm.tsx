import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Users, 
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
  Target
} from 'lucide-react'

interface FeedbackDeliveryPracticeFormProps {
  value: string
  onChange: (value: string) => void
}

interface FeedbackSession {
  teamMemberName: string
  teamMemberRole: string
  situation: string
  behavior: string
  impact: string
  teamMemberResponse: string
  lessonsLearned: string
}

const FeedbackDeliveryPracticeForm: React.FC<FeedbackDeliveryPracticeFormProps> = ({ value, onChange }) => {
  const [feedbackSessions, setFeedbackSessions] = useState<FeedbackSession[]>([
    { teamMemberName: '', teamMemberRole: '', situation: '', behavior: '', impact: '', teamMemberResponse: '', lessonsLearned: '' },
    { teamMemberName: '', teamMemberRole: '', situation: '', behavior: '', impact: '', teamMemberResponse: '', lessonsLearned: '' },
    { teamMemberName: '', teamMemberRole: '', situation: '', behavior: '', impact: '', teamMemberResponse: '', lessonsLearned: '' }
  ])
  const [overallReflection, setOverallReflection] = useState<string>('')
  const [improvementAreas, setImprovementAreas] = useState<string>('')
  const [nextSteps, setNextSteps] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.feedbackSessions) setFeedbackSessions(parsed.feedbackSessions)
        if (parsed.overallReflection) setOverallReflection(parsed.overallReflection)
        if (parsed.improvementAreas) setImprovementAreas(parsed.improvementAreas)
        if (parsed.nextSteps) setNextSteps(parsed.nextSteps)
      } catch (e) {
        console.error('Error parsing feedback delivery practice data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      feedbackSessions,
      overallReflection,
      improvementAreas,
      nextSteps
    })
    onChange(formData)
  }, [feedbackSessions, overallReflection, improvementAreas, nextSteps, onChange])

  const updateFeedbackSession = (index: number, field: keyof FeedbackSession, value: string) => {
    const updatedSessions = [...feedbackSessions]
    updatedSessions[index] = { ...updatedSessions[index], [field]: value }
    setFeedbackSessions(updatedSessions)
  }

  const getCompletionStatus = () => {
    const completedSessions = feedbackSessions.filter(session => 
      session.teamMemberName.trim().length > 0 && 
      session.situation.trim().length > 0 && 
      session.behavior.trim().length > 0 && 
      session.impact.trim().length > 0
    ).length
    
    return {
      sessions: Math.round((completedSessions / 3) * 100),
      reflection: overallReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-orange-800">Feedback Delivery Practice</h3>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          Practice delivering feedback using the SBI (Situation-Behavior-Impact) model with three different team members. 
          This structured approach helps ensure your feedback is specific, objective, and constructive.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.sessions === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.sessions / 33.33)}/3 Sessions
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* SBI Model Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            SBI Model Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Situation</h4>
              <p className="text-sm text-blue-700">Describe the specific time, place, and context when the behavior occurred.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-1">Behavior</h4>
              <p className="text-sm text-green-700">Describe the specific, observable actions or words you witnessed.</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-1">Impact</h4>
              <p className="text-sm text-purple-700">Explain the effect the behavior had on you, the team, or the business.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Sessions */}
      {feedbackSessions.map((session, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Feedback Session {index + 1}
              {session.teamMemberName && session.situation && session.behavior && session.impact && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                  Team Member Name
                </Label>
                <Input
                  id={`name-${index}`}
                  placeholder="Enter team member's name"
                  value={session.teamMemberName}
                  onChange={(e) => updateFeedbackSession(index, 'teamMemberName', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`role-${index}`} className="text-sm font-medium">
                  Team Member Role/Position
                </Label>
                <Input
                  id={`role-${index}`}
                  placeholder="e.g., Team Member, Trainer, Leader"
                  value={session.teamMemberRole}
                  onChange={(e) => updateFeedbackSession(index, 'teamMemberRole', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`situation-${index}`} className="text-sm font-medium">
                Situation (When & Where)
              </Label>
              <Textarea
                id={`situation-${index}`}
                placeholder="Describe the specific time, place, and context. Example: 'During the lunch rush on Tuesday, at the front counter...'"
                value={session.situation}
                onChange={(e) => updateFeedbackSession(index, 'situation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`behavior-${index}`} className="text-sm font-medium">
                Behavior (What You Observed)
              </Label>
              <Textarea
                id={`behavior-${index}`}
                placeholder="Describe the specific, observable actions or words. Example: 'You interrupted the customer twice while they were ordering and didn't make eye contact...'"
                value={session.behavior}
                onChange={(e) => updateFeedbackSession(index, 'behavior', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`impact-${index}`} className="text-sm font-medium">
                Impact (The Effect)
              </Label>
              <Textarea
                id={`impact-${index}`}
                placeholder="Explain the effect on you, the team, customers, or business. Example: 'This made the customer appear frustrated and they left without completing their order...'"
                value={session.impact}
                onChange={(e) => updateFeedbackSession(index, 'impact', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`response-${index}`} className="text-sm font-medium">
                Team Member's Response
              </Label>
              <Textarea
                id={`response-${index}`}
                placeholder="How did they respond to your feedback? Were they receptive? Did they ask questions? What was their body language?"
                value={session.teamMemberResponse}
                onChange={(e) => updateFeedbackSession(index, 'teamMemberResponse', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`lessons-${index}`} className="text-sm font-medium">
                What You Learned About Your Feedback Delivery
              </Label>
              <Textarea
                id={`lessons-${index}`}
                placeholder="What did you learn about your feedback delivery style? What worked well? What could you improve?"
                value={session.lessonsLearned}
                onChange={(e) => updateFeedbackSession(index, 'lessonsLearned', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overall Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Overall Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overall-reflection" className="text-sm font-medium">
              Overall Insights from Your Feedback Practice
            </Label>
            <Textarea
              id="overall-reflection"
              placeholder="What patterns did you notice across all three conversations? What surprised you? How did your confidence change from the first to the third conversation?"
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement-areas" className="text-sm font-medium">
              Areas for Improvement
            </Label>
            <Textarea
              id="improvement-areas"
              placeholder="What specific aspects of your feedback delivery do you want to improve? (e.g., timing, tone, clarity, follow-up)"
              value={improvementAreas}
              onChange={(e) => setImprovementAreas(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-steps" className="text-sm font-medium">
              Next Steps & Action Plan
            </Label>
            <Textarea
              id="next-steps"
              placeholder="What will you do differently in future feedback conversations? What specific actions will you take to improve?"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FeedbackDeliveryPracticeForm
