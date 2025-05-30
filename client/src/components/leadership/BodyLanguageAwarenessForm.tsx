import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
  Target,
  Camera
} from 'lucide-react'

interface BodyLanguageAwarenessFormProps {
  value: string
  onChange: (value: string) => void
}

interface ObservationSession {
  date: string
  setting: string
  teamMember: string
  positiveSignals: string
  concerningSignals: string
  contextFactors: string
  insights: string
}

interface SelfAssessment {
  strengths: string
  blindSpots: string
  improvementAreas: string
  actionPlan: string
}

const BodyLanguageAwarenessForm: React.FC<BodyLanguageAwarenessFormProps> = ({ value, onChange }) => {
  const [observations, setObservations] = useState<ObservationSession[]>([
    { date: '', setting: '', teamMember: '', positiveSignals: '', concerningSignals: '', contextFactors: '', insights: '' },
    { date: '', setting: '', teamMember: '', positiveSignals: '', concerningSignals: '', contextFactors: '', insights: '' },
    { date: '', setting: '', teamMember: '', positiveSignals: '', concerningSignals: '', contextFactors: '', insights: '' }
  ])
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessment>({
    strengths: '',
    blindSpots: '',
    improvementAreas: '',
    actionPlan: ''
  })
  const [keyLearnings, setKeyLearnings] = useState<string>('')
  const [implementationPlan, setImplementationPlan] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.observations) setObservations(parsed.observations)
        if (parsed.selfAssessment) setSelfAssessment(parsed.selfAssessment)
        if (parsed.keyLearnings) setKeyLearnings(parsed.keyLearnings)
        if (parsed.implementationPlan) setImplementationPlan(parsed.implementationPlan)
      } catch (e) {
        console.error('Error parsing body language awareness data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      observations,
      selfAssessment,
      keyLearnings,
      implementationPlan
    })
    onChange(formData)
  }, [observations, selfAssessment, keyLearnings, implementationPlan, onChange])

  const updateObservation = (index: number, field: keyof ObservationSession, value: string) => {
    const updatedObservations = [...observations]
    updatedObservations[index] = { ...updatedObservations[index], [field]: value }
    setObservations(updatedObservations)
  }

  const updateSelfAssessment = (field: keyof SelfAssessment, value: string) => {
    setSelfAssessment(prev => ({ ...prev, [field]: value }))
  }

  const getCompletionStatus = () => {
    const completedObservations = observations.filter(obs =>
      obs.teamMember.trim().length > 0 &&
      obs.setting.trim().length > 0 &&
      obs.positiveSignals.trim().length > 0
    ).length

    const selfAssessmentComplete = selfAssessment.strengths.trim().length > 0 &&
                                  selfAssessment.improvementAreas.trim().length > 0

    return {
      observations: Math.round((completedObservations / 3) * 100),
      selfAssessment: selfAssessmentComplete ? 100 : 0,
      overall: keyLearnings.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Body Language Awareness Practice</h3>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Develop your ability to read and interpret non-verbal communication by observing team members in different settings.
          Practice identifying positive engagement signals and potential concerns through body language.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.observations === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.observations / 33.33)}/3 Observations
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.selfAssessment === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Self-Assessment {status.selfAssessment === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Body Language Reference Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Body Language Reading Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Positive Engagement Signals</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Open posture, uncrossed arms</li>
                <li>• Direct eye contact during conversation</li>
                <li>• Leaning in when listening</li>
                <li>• Nodding and responsive facial expressions</li>
                <li>• Relaxed shoulders</li>
                <li>• Mirroring your body language</li>
              </ul>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Potential Concern Signals</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Crossed arms or defensive posture</li>
                <li>• Avoiding eye contact</li>
                <li>• Fidgeting or restless movements</li>
                <li>• Tense facial expressions</li>
                <li>• Turning body away</li>
                <li>• Checking phone/watch frequently</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observation Sessions */}
      {observations.map((observation, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-500" />
              Observation Session {index + 1}
              {observation.teamMember && observation.setting && observation.positiveSignals && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`date-${index}`} className="text-sm font-medium">
                  Date of Observation
                </Label>
                <Input
                  id={`date-${index}`}
                  type="date"
                  value={observation.date}
                  onChange={(e) => updateObservation(index, 'date', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`setting-${index}`} className="text-sm font-medium">
                  Setting/Context
                </Label>
                <Input
                  id={`setting-${index}`}
                  placeholder="e.g., Team huddle, busy lunch rush, one-on-one meeting"
                  value={observation.setting}
                  onChange={(e) => updateObservation(index, 'setting', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-${index}`} className="text-sm font-medium">
                Team Member Observed (use initials for privacy)
              </Label>
              <Input
                id={`member-${index}`}
                placeholder="e.g., J.S., Team Member A"
                value={observation.teamMember}
                onChange={(e) => updateObservation(index, 'teamMember', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`positive-${index}`} className="text-sm font-medium">
                Positive Body Language Signals Observed
              </Label>
              <Textarea
                id={`positive-${index}`}
                placeholder="What positive non-verbal cues did you notice? (e.g., maintained eye contact, open posture, engaged facial expressions)"
                value={observation.positiveSignals}
                onChange={(e) => updateObservation(index, 'positiveSignals', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`concerning-${index}`} className="text-sm font-medium">
                Concerning or Disengaged Signals (if any)
              </Label>
              <Textarea
                id={`concerning-${index}`}
                placeholder="Any signs of discomfort, disengagement, or stress? (e.g., crossed arms, avoiding eye contact, fidgeting)"
                value={observation.concerningSignals}
                onChange={(e) => updateObservation(index, 'concerningSignals', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`context-${index}`} className="text-sm font-medium">
                Context Factors
              </Label>
              <Textarea
                id={`context-${index}`}
                placeholder="What was happening that might have influenced their body language? (e.g., busy period, difficult customer, new task)"
                value={observation.contextFactors}
                onChange={(e) => updateObservation(index, 'contextFactors', e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`insights-${index}`} className="text-sm font-medium">
                Your Insights & Interpretation
              </Label>
              <Textarea
                id={`insights-${index}`}
                placeholder="What do you think their body language was telling you? How might you adjust your leadership approach based on these observations?"
                value={observation.insights}
                onChange={(e) => updateObservation(index, 'insights', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Self-Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Body Language Self-Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strengths" className="text-sm font-medium">
              Your Body Language Reading Strengths
            </Label>
            <Textarea
              id="strengths"
              placeholder="What are you naturally good at when it comes to reading body language? What signals do you pick up on easily?"
              value={selfAssessment.strengths}
              onChange={(e) => updateSelfAssessment('strengths', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blind-spots" className="text-sm font-medium">
              Potential Blind Spots
            </Label>
            <Textarea
              id="blind-spots"
              placeholder="What body language signals might you miss or misinterpret? Are there cultural or personal biases to be aware of?"
              value={selfAssessment.blindSpots}
              onChange={(e) => updateSelfAssessment('blindSpots', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement-areas" className="text-sm font-medium">
              Areas for Improvement
            </Label>
            <Textarea
              id="improvement-areas"
              placeholder="What aspects of body language reading do you want to develop further? What will you focus on improving?"
              value={selfAssessment.improvementAreas}
              onChange={(e) => updateSelfAssessment('improvementAreas', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-plan" className="text-sm font-medium">
              Personal Action Plan
            </Label>
            <Textarea
              id="action-plan"
              placeholder="How will you continue developing this skill? What specific practices will you implement in your daily leadership?"
              value={selfAssessment.actionPlan}
              onChange={(e) => updateSelfAssessment('actionPlan', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Learnings & Implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Key Learnings & Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-learnings" className="text-sm font-medium">
              Most Important Insights from This Practice
            </Label>
            <Textarea
              id="key-learnings"
              placeholder="What were your biggest takeaways? What surprised you? How has this changed your awareness of non-verbal communication?"
              value={keyLearnings}
              onChange={(e) => setKeyLearnings(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-plan" className="text-sm font-medium">
              Implementation Plan for Daily Leadership
            </Label>
            <Textarea
              id="implementation-plan"
              placeholder="How will you apply these insights in your daily leadership? What specific behaviors will you change or implement?"
              value={implementationPlan}
              onChange={(e) => setImplementationPlan(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BodyLanguageAwarenessForm
