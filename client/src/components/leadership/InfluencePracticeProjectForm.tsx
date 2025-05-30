import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Rocket,
  Target,
  CheckCircle,
  Users,
  TrendingUp,
  Lightbulb,
  Calendar,
  BarChart3
} from 'lucide-react'

interface InfluencePracticeProjectFormProps {
  value: string
  onChange: (value: string) => void
}

interface ProjectPlanning {
  projectTitle: string
  objective: string
  stakeholders: string
  timeline: string
  successMetrics: string
  challenges: string
}

interface InfluenceStrategy {
  primaryTactic: string
  secondaryTactics: string
  relationshipBuilding: string
  communicationPlan: string
  contingencyPlan: string
}

interface Implementation {
  week1Actions: string
  week2Actions: string
  week3Actions: string
  week4Actions: string
  keyMilestones: string
  adjustmentsMade: string
}

interface Results {
  finalOutcome: string
  successLevel: string
  stakeholderFeedback: string
  unexpectedResults: string
  lessonsLearned: string
  futureApplication: string
}

const InfluencePracticeProjectForm: React.FC<InfluencePracticeProjectFormProps> = ({ value, onChange }) => {
  const [planning, setPlanning] = useState<ProjectPlanning>({
    projectTitle: '',
    objective: '',
    stakeholders: '',
    timeline: '',
    successMetrics: '',
    challenges: ''
  })
  const [strategy, setStrategy] = useState<InfluenceStrategy>({
    primaryTactic: '',
    secondaryTactics: '',
    relationshipBuilding: '',
    communicationPlan: '',
    contingencyPlan: ''
  })
  const [implementation, setImplementation] = useState<Implementation>({
    week1Actions: '',
    week2Actions: '',
    week3Actions: '',
    week4Actions: '',
    keyMilestones: '',
    adjustmentsMade: ''
  })
  const [results, setResults] = useState<Results>({
    finalOutcome: '',
    successLevel: '',
    stakeholderFeedback: '',
    unexpectedResults: '',
    lessonsLearned: '',
    futureApplication: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.planning) setPlanning(parsed.planning)
        if (parsed.strategy) setStrategy(parsed.strategy)
        if (parsed.implementation) setImplementation(parsed.implementation)
        if (parsed.results) setResults(parsed.results)
      } catch (e) {
        console.error('Error parsing influence practice project data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      planning,
      strategy,
      implementation,
      results
    })
    onChange(formData)
  }, [planning, strategy, implementation, results, onChange])

  const updatePlanning = (field: keyof ProjectPlanning, value: string) => {
    setPlanning(prev => ({ ...prev, [field]: value }))
  }

  const updateStrategy = (field: keyof InfluenceStrategy, value: string) => {
    setStrategy(prev => ({ ...prev, [field]: value }))
  }

  const updateImplementation = (field: keyof Implementation, value: string) => {
    setImplementation(prev => ({ ...prev, [field]: value }))
  }

  const updateResults = (field: keyof Results, value: string) => {
    setResults(prev => ({ ...prev, [field]: value }))
  }

  const getCompletionStatus = () => {
    const planningComplete = planning.projectTitle.trim().length > 0 &&
                            planning.objective.trim().length > 0 &&
                            planning.stakeholders.trim().length > 0

    const strategyComplete = strategy.primaryTactic.trim().length > 0 &&
                           strategy.communicationPlan.trim().length > 0

    const implementationComplete = implementation.week1Actions.trim().length > 0 ||
                                 implementation.week2Actions.trim().length > 0

    const resultsComplete = results.finalOutcome.trim().length > 0 &&
                          results.lessonsLearned.trim().length > 0

    return {
      planning: planningComplete ? 100 : 0,
      strategy: strategyComplete ? 100 : 0,
      implementation: implementationComplete ? 100 : 0,
      results: resultsComplete ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-800">Influence Practice Project</h3>
        </div>
        <p className="text-sm text-indigo-700 mb-3">
          Design and execute a month-long project to practice your influence skills in a real workplace situation.
          This comprehensive project will help you apply influence tactics systematically and measure your progress.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.planning === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Planning {status.planning === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.strategy === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Strategy {status.strategy === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.implementation === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Implementation {status.implementation === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.results === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Results {status.results === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Project Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Project Planning
            {status.planning === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title" className="text-sm font-medium">
              Project Title
            </Label>
            <Input
              id="project-title"
              placeholder="e.g., Improving Cross-Department Collaboration, Implementing New Process"
              value={planning.projectTitle}
              onChange={(e) => updatePlanning('projectTitle', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective" className="text-sm font-medium">
              Project Objective
            </Label>
            <Textarea
              id="objective"
              placeholder="What specific outcome do you want to achieve? What change are you trying to influence?"
              value={planning.objective}
              onChange={(e) => updatePlanning('objective', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakeholders" className="text-sm font-medium">
              Key Stakeholders
            </Label>
            <Textarea
              id="stakeholders"
              placeholder="Who are the key people you need to influence? What are their roles, interests, and potential concerns?"
              value={planning.stakeholders}
              onChange={(e) => updatePlanning('stakeholders', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              Timeline (4 weeks)
            </Label>
            <Textarea
              id="timeline"
              placeholder="Break down your 4-week timeline. What will you accomplish each week?"
              value={planning.timeline}
              onChange={(e) => updatePlanning('timeline', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-metrics" className="text-sm font-medium">
              Success Metrics
            </Label>
            <Textarea
              id="success-metrics"
              placeholder="How will you measure success? What specific indicators will show you've achieved your influence goals?"
              value={planning.successMetrics}
              onChange={(e) => updatePlanning('successMetrics', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-sm font-medium">
              Anticipated Challenges
            </Label>
            <Textarea
              id="challenges"
              placeholder="What obstacles or resistance do you expect? How will you address them?"
              value={planning.challenges}
              onChange={(e) => updatePlanning('challenges', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Influence Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Influence Strategy
            {status.strategy === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-tactic" className="text-sm font-medium">
              Primary Influence Tactic
            </Label>
            <Textarea
              id="primary-tactic"
              placeholder="What will be your main influence approach? (e.g., rational persuasion, inspirational appeals, consultation)"
              value={strategy.primaryTactic}
              onChange={(e) => updateStrategy('primaryTactic', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-tactics" className="text-sm font-medium">
              Secondary Tactics
            </Label>
            <Textarea
              id="secondary-tactics"
              placeholder="What backup or supporting influence tactics will you use?"
              value={strategy.secondaryTactics}
              onChange={(e) => updateStrategy('secondaryTactics', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-building" className="text-sm font-medium">
              Relationship Building Plan
            </Label>
            <Textarea
              id="relationship-building"
              placeholder="How will you build and strengthen relationships with key stakeholders throughout the project?"
              value={strategy.relationshipBuilding}
              onChange={(e) => updateStrategy('relationshipBuilding', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-plan" className="text-sm font-medium">
              Communication Plan
            </Label>
            <Textarea
              id="communication-plan"
              placeholder="How will you communicate with stakeholders? What channels, frequency, and messaging will you use?"
              value={strategy.communicationPlan}
              onChange={(e) => updateStrategy('communicationPlan', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contingency-plan" className="text-sm font-medium">
              Contingency Plan
            </Label>
            <Textarea
              id="contingency-plan"
              placeholder="What will you do if your primary influence approach doesn't work? What's your backup plan?"
              value={strategy.contingencyPlan}
              onChange={(e) => updateStrategy('contingencyPlan', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Implementation Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Implementation Tracking
            {status.implementation === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="week1-actions" className="text-sm font-medium">
              Week 1 Actions & Results
            </Label>
            <Textarea
              id="week1-actions"
              placeholder="What specific actions did you take in week 1? What were the results and reactions?"
              value={implementation.week1Actions}
              onChange={(e) => updateImplementation('week1Actions', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="week2-actions" className="text-sm font-medium">
              Week 2 Actions & Results
            </Label>
            <Textarea
              id="week2-actions"
              placeholder="What specific actions did you take in week 2? How did stakeholders respond?"
              value={implementation.week2Actions}
              onChange={(e) => updateImplementation('week2Actions', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="week3-actions" className="text-sm font-medium">
              Week 3 Actions & Results
            </Label>
            <Textarea
              id="week3-actions"
              placeholder="What specific actions did you take in week 3? What progress was made?"
              value={implementation.week3Actions}
              onChange={(e) => updateImplementation('week3Actions', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="week4-actions" className="text-sm font-medium">
              Week 4 Actions & Results
            </Label>
            <Textarea
              id="week4-actions"
              placeholder="What specific actions did you take in week 4? How did you close out the project?"
              value={implementation.week4Actions}
              onChange={(e) => updateImplementation('week4Actions', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key-milestones" className="text-sm font-medium">
              Key Milestones Achieved
            </Label>
            <Textarea
              id="key-milestones"
              placeholder="What were the major milestones or breakthroughs during the project?"
              value={implementation.keyMilestones}
              onChange={(e) => updateImplementation('keyMilestones', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustments-made" className="text-sm font-medium">
              Adjustments Made
            </Label>
            <Textarea
              id="adjustments-made"
              placeholder="What adjustments did you make to your approach during the project? Why were they necessary?"
              value={implementation.adjustmentsMade}
              onChange={(e) => updateImplementation('adjustmentsMade', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results & Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Results & Reflection
            {status.results === 100 && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="final-outcome" className="text-sm font-medium">
              Final Outcome
            </Label>
            <Textarea
              id="final-outcome"
              placeholder="What was the final result of your influence project? Did you achieve your objective?"
              value={results.finalOutcome}
              onChange={(e) => updateResults('finalOutcome', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-level" className="text-sm font-medium">
              Success Level Assessment
            </Label>
            <Textarea
              id="success-level"
              placeholder="On a scale of 1-10, how successful was your project? What factors contributed to this level of success?"
              value={results.successLevel}
              onChange={(e) => updateResults('successLevel', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakeholder-feedback" className="text-sm font-medium">
              Stakeholder Feedback
            </Label>
            <Textarea
              id="stakeholder-feedback"
              placeholder="What feedback did you receive from stakeholders? How did they perceive your influence efforts?"
              value={results.stakeholderFeedback}
              onChange={(e) => updateResults('stakeholderFeedback', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unexpected-results" className="text-sm font-medium">
              Unexpected Results
            </Label>
            <Textarea
              id="unexpected-results"
              placeholder="What unexpected outcomes or side effects occurred? Were there any surprises?"
              value={results.unexpectedResults}
              onChange={(e) => updateResults('unexpectedResults', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessons-learned" className="text-sm font-medium">
              Key Lessons Learned
            </Label>
            <Textarea
              id="lessons-learned"
              placeholder="What are the most important lessons you learned about influence from this project? What would you do differently?"
              value={results.lessonsLearned}
              onChange={(e) => updateResults('lessonsLearned', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="future-application" className="text-sm font-medium">
              Future Application
            </Label>
            <Textarea
              id="future-application"
              placeholder="How will you apply what you learned to future influence situations? What practices will you continue?"
              value={results.futureApplication}
              onChange={(e) => updateResults('futureApplication', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfluencePracticeProjectForm
