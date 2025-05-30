import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Compass,
  Heart,
  CheckCircle,
  Star,
  Users,
  Lightbulb,
  Target,
  MessageCircle
} from 'lucide-react'

interface CommunicationLeadershipPhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

interface CoreBelief {
  belief: string
  description: string
  application: string
  example: string
}

interface CommunicationPrinciple {
  principle: string
  rationale: string
  implementation: string
  measurement: string
}

interface Philosophy {
  visionStatement: string
  coreValues: string
  leadershipApproach: string
  teamImpact: string
  personalCommitment: string
  continuousImprovement: string
}

const CommunicationLeadershipPhilosophyForm: React.FC<CommunicationLeadershipPhilosophyFormProps> = ({ value, onChange }) => {
  const [beliefs, setBeliefs] = useState<CoreBelief[]>([
    { belief: '', description: '', application: '', example: '' },
    { belief: '', description: '', application: '', example: '' },
    { belief: '', description: '', application: '', example: '' }
  ])
  const [principles, setPrinciples] = useState<CommunicationPrinciple[]>([
    { principle: '', rationale: '', implementation: '', measurement: '' },
    { principle: '', rationale: '', implementation: '', measurement: '' }
  ])
  const [philosophy, setPhilosophy] = useState<Philosophy>({
    visionStatement: '',
    coreValues: '',
    leadershipApproach: '',
    teamImpact: '',
    personalCommitment: '',
    continuousImprovement: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.beliefs) setBeliefs(parsed.beliefs)
        if (parsed.principles) setPrinciples(parsed.principles)
        if (parsed.philosophy) setPhilosophy(parsed.philosophy)
      } catch (e) {
        console.error('Error parsing communication leadership philosophy data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      beliefs,
      principles,
      philosophy
    })
    onChange(formData)
  }, [beliefs, principles, philosophy, onChange])

  const updateBelief = (index: number, field: keyof CoreBelief, value: string) => {
    const updatedBeliefs = [...beliefs]
    updatedBeliefs[index] = { ...updatedBeliefs[index], [field]: value }
    setBeliefs(updatedBeliefs)
  }

  const updatePrinciple = (index: number, field: keyof CommunicationPrinciple, value: string) => {
    const updatedPrinciples = [...principles]
    updatedPrinciples[index] = { ...updatedPrinciples[index], [field]: value }
    setPrinciples(updatedPrinciples)
  }

  const updatePhilosophy = (field: keyof Philosophy, value: string) => {
    setPhilosophy(prev => ({ ...prev, [field]: value }))
  }

  const getCompletionStatus = () => {
    const completedBeliefs = beliefs.filter(belief =>
      belief.belief.trim().length > 0 &&
      belief.description.trim().length > 0
    ).length

    const completedPrinciples = principles.filter(principle =>
      principle.principle.trim().length > 0 &&
      principle.rationale.trim().length > 0
    ).length

    const philosophyComplete = philosophy.visionStatement.trim().length > 0 &&
                              philosophy.coreValues.trim().length > 0 &&
                              philosophy.leadershipApproach.trim().length > 0

    return {
      beliefs: Math.round((completedBeliefs / 3) * 100),
      principles: Math.round((completedPrinciples / 2) * 100),
      philosophy: philosophyComplete ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Communication Leadership Philosophy</h3>
        </div>
        <p className="text-sm text-purple-700 mb-3">
          Develop your personal philosophy for communication leadership. Define your beliefs, principles, and approach
          to leading through effective communication in your restaurant environment.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.beliefs === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.beliefs / 33.33)}/3 Beliefs
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.principles === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.principles / 50)}/2 Principles
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.philosophy === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Philosophy {status.philosophy === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Core Beliefs */}
      {beliefs.map((belief, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Core Belief {index + 1}
              {belief.belief && belief.description && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`belief-${index}`} className="text-sm font-medium">
                Core Belief Statement
              </Label>
              <Input
                id={`belief-${index}`}
                placeholder="e.g., Communication builds trust, Transparency creates accountability, Every voice matters"
                value={belief.belief}
                onChange={(e) => updateBelief(index, 'belief', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`belief-desc-${index}`} className="text-sm font-medium">
                Belief Description
              </Label>
              <Textarea
                id={`belief-desc-${index}`}
                placeholder="Explain this belief in detail. Why is it important to you? How does it shape your leadership approach?"
                value={belief.description}
                onChange={(e) => updateBelief(index, 'description', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`belief-app-${index}`} className="text-sm font-medium">
                How You Apply This Belief
              </Label>
              <Textarea
                id={`belief-app-${index}`}
                placeholder="How do you put this belief into practice in your daily leadership? What specific actions demonstrate this belief?"
                value={belief.application}
                onChange={(e) => updateBelief(index, 'application', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`belief-example-${index}`} className="text-sm font-medium">
                Specific Example
              </Label>
              <Textarea
                id={`belief-example-${index}`}
                placeholder="Provide a specific example of how this belief has guided your communication or decision-making"
                value={belief.example}
                onChange={(e) => updateBelief(index, 'example', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Communication Principles */}
      {principles.map((principle, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Communication Principle {index + 1}
              {principle.principle && principle.rationale && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`principle-${index}`} className="text-sm font-medium">
                Principle Statement
              </Label>
              <Input
                id={`principle-${index}`}
                placeholder="e.g., Listen first, speak second, Be direct but kind, Communicate with purpose"
                value={principle.principle}
                onChange={(e) => updatePrinciple(index, 'principle', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-rationale-${index}`} className="text-sm font-medium">
                Rationale
              </Label>
              <Textarea
                id={`principle-rationale-${index}`}
                placeholder="Why is this principle important? What impact does it have when followed consistently?"
                value={principle.rationale}
                onChange={(e) => updatePrinciple(index, 'rationale', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-implementation-${index}`} className="text-sm font-medium">
                Implementation Strategy
              </Label>
              <Textarea
                id={`principle-implementation-${index}`}
                placeholder="How do you implement this principle in your daily communication? What specific practices support this principle?"
                value={principle.implementation}
                onChange={(e) => updatePrinciple(index, 'implementation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-measurement-${index}`} className="text-sm font-medium">
                How You Measure Success
              </Label>
              <Textarea
                id={`principle-measurement-${index}`}
                placeholder="How do you know when you're successfully applying this principle? What feedback or results indicate success?"
                value={principle.measurement}
                onChange={(e) => updatePrinciple(index, 'measurement', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Leadership Philosophy Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Your Communication Leadership Philosophy
            {status.philosophy === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision-statement" className="text-sm font-medium">
              Vision Statement
            </Label>
            <Textarea
              id="vision-statement"
              placeholder="Write your vision for communication leadership. What kind of communication culture do you want to create? What impact do you want to have?"
              value={philosophy.visionStatement}
              onChange={(e) => updatePhilosophy('visionStatement', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="core-values" className="text-sm font-medium">
              Core Values in Communication
            </Label>
            <Textarea
              id="core-values"
              placeholder="What values guide your communication leadership? What principles are non-negotiable for you?"
              value={philosophy.coreValues}
              onChange={(e) => updatePhilosophy('coreValues', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadership-approach" className="text-sm font-medium">
              Leadership Approach
            </Label>
            <Textarea
              id="leadership-approach"
              placeholder="Describe your overall approach to leading through communication. How do you balance different communication needs and styles?"
              value={philosophy.leadershipApproach}
              onChange={(e) => updatePhilosophy('leadershipApproach', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-impact" className="text-sm font-medium">
              Impact on Your Team
            </Label>
            <Textarea
              id="team-impact"
              placeholder="How do you want your communication leadership to impact your team? What outcomes do you strive for?"
              value={philosophy.teamImpact}
              onChange={(e) => updatePhilosophy('teamImpact', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-commitment" className="text-sm font-medium">
              Personal Commitment
            </Label>
            <Textarea
              id="personal-commitment"
              placeholder="What personal commitments are you making to yourself and your team regarding communication leadership?"
              value={philosophy.personalCommitment}
              onChange={(e) => updatePhilosophy('personalCommitment', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="continuous-improvement" className="text-sm font-medium">
              Continuous Improvement Plan
            </Label>
            <Textarea
              id="continuous-improvement"
              placeholder="How will you continue to grow and improve as a communication leader? What practices will you maintain for ongoing development?"
              value={philosophy.continuousImprovement}
              onChange={(e) => updatePhilosophy('continuousImprovement', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunicationLeadershipPhilosophyForm
