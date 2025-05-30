import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Network,
  Settings,
  CheckCircle,
  TrendingUp,
  Users,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react'

interface CommunicationSystemImprovementFormProps {
  value: string
  onChange: (value: string) => void
}

interface SystemAssessment {
  currentSystem: string
  strengths: string
  weaknesses: string
  gaps: string
  stakeholderFeedback: string
}

interface ImprovementInitiative {
  initiative: string
  problem: string
  solution: string
  implementation: string
  timeline: string
  successMetrics: string
  results: string
}

const CommunicationSystemImprovementForm: React.FC<CommunicationSystemImprovementFormProps> = ({ value, onChange }) => {
  const [assessment, setAssessment] = useState<SystemAssessment>({
    currentSystem: '',
    strengths: '',
    weaknesses: '',
    gaps: '',
    stakeholderFeedback: ''
  })
  const [initiatives, setInitiatives] = useState<ImprovementInitiative[]>([
    { initiative: '', problem: '', solution: '', implementation: '', timeline: '', successMetrics: '', results: '' },
    { initiative: '', problem: '', solution: '', implementation: '', timeline: '', successMetrics: '', results: '' }
  ])
  const [overallReflection, setOverallReflection] = useState<string>('')
  const [futureStrategy, setFutureStrategy] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.assessment) setAssessment(parsed.assessment)
        if (parsed.initiatives) setInitiatives(parsed.initiatives)
        if (parsed.overallReflection) setOverallReflection(parsed.overallReflection)
        if (parsed.futureStrategy) setFutureStrategy(parsed.futureStrategy)
      } catch (e) {
        console.error('Error parsing communication system improvement data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      assessment,
      initiatives,
      overallReflection,
      futureStrategy
    })
    onChange(formData)
  }, [assessment, initiatives, overallReflection, futureStrategy, onChange])

  const updateAssessment = (field: keyof SystemAssessment, value: string) => {
    setAssessment(prev => ({ ...prev, [field]: value }))
  }

  const updateInitiative = (index: number, field: keyof ImprovementInitiative, value: string) => {
    const updatedInitiatives = [...initiatives]
    updatedInitiatives[index] = { ...updatedInitiatives[index], [field]: value }
    setInitiatives(updatedInitiatives)
  }

  const getCompletionStatus = () => {
    const assessmentComplete = assessment.currentSystem.trim().length > 0 &&
                              assessment.strengths.trim().length > 0 &&
                              assessment.weaknesses.trim().length > 0

    const completedInitiatives = initiatives.filter(initiative =>
      initiative.initiative.trim().length > 0 &&
      initiative.problem.trim().length > 0 &&
      initiative.solution.trim().length > 0
    ).length

    return {
      assessment: assessmentComplete ? 100 : 0,
      initiatives: Math.round((completedInitiatives / 2) * 100),
      reflection: overallReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <Network className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-800">Communication System Improvement</h3>
        </div>
        <p className="text-sm text-indigo-700 mb-3">
          Analyze and improve your restaurant's communication systems and processes.
          Identify gaps, implement solutions, and create more effective communication flows.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.assessment === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Assessment {status.assessment === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.initiatives === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.initiatives / 50)}/2 Initiatives
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* System Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Current Communication System Assessment
            {status.assessment === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-system" className="text-sm font-medium">
              Current Communication System Overview
            </Label>
            <Textarea
              id="current-system"
              placeholder="Describe your restaurant's current communication systems. How do you share information between shifts, departments, and management levels?"
              value={assessment.currentSystem}
              onChange={(e) => updateAssessment('currentSystem', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths" className="text-sm font-medium">
              System Strengths
            </Label>
            <Textarea
              id="strengths"
              placeholder="What aspects of your current communication system work well? What are you proud of?"
              value={assessment.strengths}
              onChange={(e) => updateAssessment('strengths', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weaknesses" className="text-sm font-medium">
              System Weaknesses
            </Label>
            <Textarea
              id="weaknesses"
              placeholder="What problems exist in your current communication system? Where do breakdowns occur?"
              value={assessment.weaknesses}
              onChange={(e) => updateAssessment('weaknesses', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gaps" className="text-sm font-medium">
              Communication Gaps
            </Label>
            <Textarea
              id="gaps"
              placeholder="What information isn't being communicated effectively? Where do people feel out of the loop?"
              value={assessment.gaps}
              onChange={(e) => updateAssessment('gaps', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakeholder-feedback" className="text-sm font-medium">
              Stakeholder Feedback
            </Label>
            <Textarea
              id="stakeholder-feedback"
              placeholder="What feedback have you received from team members, managers, or other stakeholders about communication?"
              value={assessment.stakeholderFeedback}
              onChange={(e) => updateAssessment('stakeholderFeedback', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Improvement Initiatives */}
      {initiatives.map((initiative, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Improvement Initiative {index + 1}
              {initiative.initiative && initiative.problem && initiative.solution && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`initiative-name-${index}`} className="text-sm font-medium">
                Initiative Name
              </Label>
              <Input
                id={`initiative-name-${index}`}
                placeholder="e.g., Daily Huddle Improvement, Shift Handoff System, Digital Communication Board"
                value={initiative.initiative}
                onChange={(e) => updateInitiative(index, 'initiative', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`problem-${index}`} className="text-sm font-medium">
                Problem Being Addressed
              </Label>
              <Textarea
                id={`problem-${index}`}
                placeholder="What specific communication problem does this initiative solve? What impact was this problem having?"
                value={initiative.problem}
                onChange={(e) => updateInitiative(index, 'problem', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`solution-${index}`} className="text-sm font-medium">
                Proposed Solution
              </Label>
              <Textarea
                id={`solution-${index}`}
                placeholder="Describe your solution in detail. How will it work? What tools or processes will you use?"
                value={initiative.solution}
                onChange={(e) => updateInitiative(index, 'solution', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`implementation-${index}`} className="text-sm font-medium">
                Implementation Plan
              </Label>
              <Textarea
                id={`implementation-${index}`}
                placeholder="How did you or will you implement this solution? What steps are involved? Who needs to be involved?"
                value={initiative.implementation}
                onChange={(e) => updateInitiative(index, 'implementation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`timeline-${index}`} className="text-sm font-medium">
                Timeline
              </Label>
              <Input
                id={`timeline-${index}`}
                placeholder="e.g., 2 weeks, 1 month, ongoing"
                value={initiative.timeline}
                onChange={(e) => updateInitiative(index, 'timeline', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`metrics-${index}`} className="text-sm font-medium">
                Success Metrics
              </Label>
              <Textarea
                id={`metrics-${index}`}
                placeholder="How will you measure the success of this initiative? What indicators will show improvement?"
                value={initiative.successMetrics}
                onChange={(e) => updateInitiative(index, 'successMetrics', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`results-${index}`} className="text-sm font-medium">
                Results & Impact
              </Label>
              <Textarea
                id={`results-${index}`}
                placeholder="What were the results of this initiative? What impact did it have on communication and operations?"
                value={initiative.results}
                onChange={(e) => updateInitiative(index, 'results', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Overall Reflection & Future Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Overall Reflection & Future Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overall-reflection" className="text-sm font-medium">
              Overall Reflection on Communication System Improvements
            </Label>
            <Textarea
              id="overall-reflection"
              placeholder="Reflect on your communication system improvement efforts. What have you learned? What patterns do you notice? How has this impacted your restaurant's operations?"
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="future-strategy" className="text-sm font-medium">
              Future Communication Strategy
            </Label>
            <Textarea
              id="future-strategy"
              placeholder="What is your ongoing strategy for maintaining and improving communication systems? What additional improvements do you want to make? How will you ensure continuous improvement?"
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

export default CommunicationSystemImprovementForm
