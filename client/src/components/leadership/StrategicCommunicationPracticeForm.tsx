import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Target, 
  Users, 
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Lightbulb
} from 'lucide-react'

interface StrategicCommunicationPracticeFormProps {
  value: string
  onChange: (value: string) => void
}

interface TeamMemberFeedback {
  name: string
  role: string
  feedback: string
  understanding: string
  questions: string
}

const StrategicCommunicationPracticeForm: React.FC<StrategicCommunicationPracticeFormProps> = ({ value, onChange }) => {
  const [strategicInitiative, setStrategicInitiative] = useState<string>('')
  const [whyItMatters, setWhyItMatters] = useState<string>('')
  const [successLooks, setSuccessLooks] = useState<string>('')
  const [teamContribution, setTeamContribution] = useState<string>('')
  const [presentationOutline, setPresentationOutline] = useState<string>('')
  const [keyMessages, setKeyMessages] = useState<string>('')
  const [teamMemberFeedback, setTeamMemberFeedback] = useState<TeamMemberFeedback[]>([
    { name: '', role: '', feedback: '', understanding: '', questions: '' },
    { name: '', role: '', feedback: '', understanding: '', questions: '' },
    { name: '', role: '', feedback: '', understanding: '', questions: '' }
  ])
  const [lessonsLearned, setLessonsLearned] = useState<string>('')
  const [improvements, setImprovements] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setStrategicInitiative(parsedValue.strategicInitiative || '')
        setWhyItMatters(parsedValue.whyItMatters || '')
        setSuccessLooks(parsedValue.successLooks || '')
        setTeamContribution(parsedValue.teamContribution || '')
        setPresentationOutline(parsedValue.presentationOutline || '')
        setKeyMessages(parsedValue.keyMessages || '')
        if (parsedValue.teamMemberFeedback) {
          setTeamMemberFeedback(parsedValue.teamMemberFeedback)
        }
        setLessonsLearned(parsedValue.lessonsLearned || '')
        setImprovements(parsedValue.improvements || '')
      } catch (e) {
        // If parsing fails, keep default state
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      strategicInitiative,
      whyItMatters,
      successLooks,
      teamContribution,
      presentationOutline,
      keyMessages,
      teamMemberFeedback,
      lessonsLearned,
      improvements
    })
    onChange(formData)
  }, [strategicInitiative, whyItMatters, successLooks, teamContribution, presentationOutline, keyMessages, teamMemberFeedback, lessonsLearned, improvements, onChange])

  const updateTeamMemberFeedback = (index: number, field: keyof TeamMemberFeedback, value: string) => {
    const updatedFeedback = [...teamMemberFeedback]
    updatedFeedback[index] = { ...updatedFeedback[index], [field]: value }
    setTeamMemberFeedback(updatedFeedback)
  }

  const getCompletionStatus = () => {
    const requiredFields = [strategicInitiative, whyItMatters, successLooks, teamContribution, presentationOutline]
    const completedFields = requiredFields.filter(field => field.trim().length > 0).length
    const feedbackCompleted = teamMemberFeedback.filter(feedback => 
      feedback.name.trim().length > 0 && feedback.feedback.trim().length > 0
    ).length
    
    return {
      preparation: Math.round((completedFields / requiredFields.length) * 100),
      feedback: Math.round((feedbackCompleted / 3) * 100)
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5" />
          <p className="font-medium">Strategic Communication Practice</p>
        </div>
        <p>Practice communicating strategic concepts effectively to your team. This exercise helps you develop the critical skill of translating strategy into clear, actionable messages that inspire and engage team members.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Communication Practice Progress</span>
            <div className="flex gap-2">
              <Badge variant="secondary">
                Prep: {status.preparation}%
              </Badge>
              <Badge variant="secondary">
                Feedback: {status.feedback}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Step 1: Strategic Initiative Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Step 1: Choose Your Strategic Initiative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategic-initiative" className="text-sm font-medium">
              Strategic Initiative from Your 90-Day Plan
            </Label>
            <Input
              id="strategic-initiative"
              placeholder="e.g., Improve customer satisfaction scores, Reduce food waste by 15%, Implement new training program"
              value={strategicInitiative}
              onChange={(e) => setStrategicInitiative(e.target.value)}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Presentation Preparation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            Step 2: Prepare Your 5-Minute Presentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="why-matters" className="text-sm font-medium">
              Why This Initiative Matters
            </Label>
            <Textarea
              id="why-matters"
              placeholder="Explain the importance of this initiative. How does it connect to restaurant goals? What problems does it solve? Why should team members care?"
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-looks" className="text-sm font-medium">
              What Success Looks Like
            </Label>
            <Textarea
              id="success-looks"
              placeholder="Paint a clear picture of success. What specific outcomes will you achieve? How will things be different? What metrics will improve?"
              value={successLooks}
              onChange={(e) => setSuccessLooks(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-contribution" className="text-sm font-medium">
              How Team Members Contribute
            </Label>
            <Textarea
              id="team-contribution"
              placeholder="Explain specific ways team members will contribute to this initiative. What actions do you need from them? How can they make a difference?"
              value={teamContribution}
              onChange={(e) => setTeamContribution(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentation-outline" className="text-sm font-medium">
              5-Minute Presentation Outline
            </Label>
            <Textarea
              id="presentation-outline"
              placeholder="Create your presentation structure:
1. Opening (30 seconds) - Hook and overview
2. Why it matters (2 minutes) - Problem and importance  
3. What success looks like (1.5 minutes) - Vision and outcomes
4. How team contributes (1 minute) - Specific actions needed
5. Closing (30 seconds) - Call to action and next steps"
              value={presentationOutline}
              onChange={(e) => setPresentationOutline(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-messages" className="text-sm font-medium">
              Key Messages & Talking Points
            </Label>
            <Textarea
              id="key-messages"
              placeholder="List your most important messages and key phrases you want to use. What are the 3-5 main points you absolutely must communicate?"
              value={keyMessages}
              onChange={(e) => setKeyMessages(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Team Member Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Step 3: Deliver Presentation & Gather Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-3 rounded-md text-sm text-green-800">
            <p className="font-medium mb-1">Instructions:</p>
            <p>Deliver your 5-minute presentation to at least 3 team members individually or in small groups. After each presentation, gather their feedback using the form below.</p>
          </div>

          {teamMemberFeedback.map((feedback, index) => (
            <Card key={index} className="border-2 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="outline">Team Member #{index + 1}</Badge>
                  {feedback.name && <span className="text-sm text-gray-600">- {feedback.name}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="text-sm font-medium">Team Member Name</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Enter team member's name"
                      value={feedback.name}
                      onChange={(e) => updateTeamMemberFeedback(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`role-${index}`} className="text-sm font-medium">Role/Position</Label>
                    <Input
                      id={`role-${index}`}
                      placeholder="e.g., Team Member, Shift Leader, etc."
                      value={feedback.role}
                      onChange={(e) => updateTeamMemberFeedback(index, 'role', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`feedback-${index}`} className="text-sm font-medium">
                    Overall Feedback on Your Presentation
                  </Label>
                  <Textarea
                    id={`feedback-${index}`}
                    placeholder="What did they think of your presentation? Was it clear? Engaging? What did they like? What suggestions did they have?"
                    value={feedback.feedback}
                    onChange={(e) => updateTeamMemberFeedback(index, 'feedback', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`understanding-${index}`} className="text-sm font-medium">
                    Their Understanding of the Initiative
                  </Label>
                  <Textarea
                    id={`understanding-${index}`}
                    placeholder="Can they explain back what the initiative is about? Do they understand why it matters and what success looks like?"
                    value={feedback.understanding}
                    onChange={(e) => updateTeamMemberFeedback(index, 'understanding', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`questions-${index}`} className="text-sm font-medium">
                    Questions They Asked
                  </Label>
                  <Textarea
                    id={`questions-${index}`}
                    placeholder="What questions did they ask? What concerns did they raise? What additional information did they need?"
                    value={feedback.questions}
                    onChange={(e) => updateTeamMemberFeedback(index, 'questions', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Step 4: Reflection & Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Step 4: Reflection & Continuous Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessons-learned" className="text-sm font-medium">
              Key Lessons Learned
            </Label>
            <Textarea
              id="lessons-learned"
              placeholder="What did you learn from this communication practice? What worked well? What was challenging? How did team members respond differently than expected?"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements" className="text-sm font-medium">
              How You'll Improve Strategic Communication
            </Label>
            <Textarea
              id="improvements"
              placeholder="Based on the feedback and your experience, how will you improve your strategic communication skills? What specific changes will you make for future strategic communications?"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicCommunicationPracticeForm
