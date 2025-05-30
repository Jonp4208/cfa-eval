import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Target,
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
  Handshake,
  Brain
} from 'lucide-react'

interface InfluenceWithoutAuthorityFormProps {
  value: string
  onChange: (value: string) => void
}

interface InfluenceScenario {
  situation: string
  stakeholder: string
  goal: string
  approach: string
  tactics: string
  outcome: string
  lessons: string
}

interface InfluenceStrategy {
  strategy: string
  description: string
  whenToUse: string
  example: string
}

const InfluenceWithoutAuthorityForm: React.FC<InfluenceWithoutAuthorityFormProps> = ({ value, onChange }) => {
  const [scenarios, setScenarios] = useState<InfluenceScenario[]>([
    { situation: '', stakeholder: '', goal: '', approach: '', tactics: '', outcome: '', lessons: '' },
    { situation: '', stakeholder: '', goal: '', approach: '', tactics: '', outcome: '', lessons: '' },
    { situation: '', stakeholder: '', goal: '', approach: '', tactics: '', outcome: '', lessons: '' }
  ])
  const [strategies, setStrategies] = useState<InfluenceStrategy[]>([
    { strategy: '', description: '', whenToUse: '', example: '' },
    { strategy: '', description: '', whenToUse: '', example: '' }
  ])
  const [personalReflection, setPersonalReflection] = useState<string>('')
  const [actionPlan, setActionPlan] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.scenarios) setScenarios(parsed.scenarios)
        if (parsed.strategies) setStrategies(parsed.strategies)
        if (parsed.personalReflection) setPersonalReflection(parsed.personalReflection)
        if (parsed.actionPlan) setActionPlan(parsed.actionPlan)
      } catch (e) {
        console.error('Error parsing influence without authority data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      scenarios,
      strategies,
      personalReflection,
      actionPlan
    })
    onChange(formData)
  }, [scenarios, strategies, personalReflection, actionPlan, onChange])

  const updateScenario = (index: number, field: keyof InfluenceScenario, value: string) => {
    const updatedScenarios = [...scenarios]
    updatedScenarios[index] = { ...updatedScenarios[index], [field]: value }
    setScenarios(updatedScenarios)
  }

  const updateStrategy = (index: number, field: keyof InfluenceStrategy, value: string) => {
    const updatedStrategies = [...strategies]
    updatedStrategies[index] = { ...updatedStrategies[index], [field]: value }
    setStrategies(updatedStrategies)
  }

  const getCompletionStatus = () => {
    const completedScenarios = scenarios.filter(scenario =>
      scenario.situation.trim().length > 0 &&
      scenario.goal.trim().length > 0 &&
      scenario.approach.trim().length > 0
    ).length

    const completedStrategies = strategies.filter(strategy =>
      strategy.strategy.trim().length > 0 &&
      strategy.description.trim().length > 0
    ).length

    return {
      scenarios: Math.round((completedScenarios / 3) * 100),
      strategies: Math.round((completedStrategies / 2) * 100),
      reflection: personalReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Handshake className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Influence Without Authority Practice</h3>
        </div>
        <p className="text-sm text-purple-700 mb-3">
          Develop your ability to influence and persuade others when you don't have direct authority over them.
          Practice building relationships, finding common ground, and using various influence tactics effectively.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.scenarios === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.scenarios / 33.33)}/3 Scenarios
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.strategies === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.strategies / 50)}/2 Strategies
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Influence Tactics Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Influence Tactics Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Relationship-Based Tactics</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Personal Appeals:</strong> Appeal to loyalty and friendship</li>
                <li>• <strong>Inspirational Appeals:</strong> Appeal to values and ideals</li>
                <li>• <strong>Consultation:</strong> Involve them in planning</li>
                <li>• <strong>Exchange:</strong> Offer something of value</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Logic-Based Tactics</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Rational Persuasion:</strong> Use facts and logic</li>
                <li>• <strong>Legitimating:</strong> Appeal to rules and precedent</li>
                <li>• <strong>Coalition:</strong> Build support from others</li>
                <li>• <strong>Apprising:</strong> Explain benefits to them</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influence Scenarios */}
      {scenarios.map((scenario, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Influence Scenario {index + 1}
              {scenario.situation && scenario.goal && scenario.approach && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`situation-${index}`} className="text-sm font-medium">
                Situation Description
              </Label>
              <Textarea
                id={`situation-${index}`}
                placeholder="Describe a situation where you needed to influence someone without direct authority (e.g., peer department, vendor, team member from another shift)"
                value={scenario.situation}
                onChange={(e) => updateScenario(index, 'situation', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stakeholder-${index}`} className="text-sm font-medium">
                Key Stakeholder (use initials for privacy)
              </Label>
              <Input
                id={`stakeholder-${index}`}
                placeholder="e.g., Manager from Kitchen, Vendor Rep, Team Lead"
                value={scenario.stakeholder}
                onChange={(e) => updateScenario(index, 'stakeholder', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`goal-${index}`} className="text-sm font-medium">
                Your Influence Goal
              </Label>
              <Textarea
                id={`goal-${index}`}
                placeholder="What specific outcome were you trying to achieve? What did you want them to do or agree to?"
                value={scenario.goal}
                onChange={(e) => updateScenario(index, 'goal', e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`approach-${index}`} className="text-sm font-medium">
                Your Influence Approach
              </Label>
              <Textarea
                id={`approach-${index}`}
                placeholder="How did you approach this person? What was your strategy for building rapport and presenting your case?"
                value={scenario.approach}
                onChange={(e) => updateScenario(index, 'approach', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`tactics-${index}`} className="text-sm font-medium">
                Specific Tactics Used
              </Label>
              <Textarea
                id={`tactics-${index}`}
                placeholder="Which influence tactics did you use? (e.g., rational persuasion, personal appeals, exchange, consultation)"
                value={scenario.tactics}
                onChange={(e) => updateScenario(index, 'tactics', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`outcome-${index}`} className="text-sm font-medium">
                Outcome & Results
              </Label>
              <Textarea
                id={`outcome-${index}`}
                placeholder="What was the result? Did you achieve your goal? How did they respond?"
                value={scenario.outcome}
                onChange={(e) => updateScenario(index, 'outcome', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`lessons-${index}`} className="text-sm font-medium">
                Lessons Learned
              </Label>
              <Textarea
                id={`lessons-${index}`}
                placeholder="What did you learn from this experience? What would you do differently next time?"
                value={scenario.lessons}
                onChange={(e) => updateScenario(index, 'lessons', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Personal Influence Strategies */}
      {strategies.map((strategy, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Influence Strategy {index + 1}
              {strategy.strategy && strategy.description && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`strategy-name-${index}`} className="text-sm font-medium">
                Strategy Name
              </Label>
              <Input
                id={`strategy-name-${index}`}
                placeholder="e.g., Building Trust First, Finding Win-Win Solutions, Data-Driven Persuasion"
                value={strategy.strategy}
                onChange={(e) => updateStrategy(index, 'strategy', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`strategy-desc-${index}`} className="text-sm font-medium">
                Strategy Description
              </Label>
              <Textarea
                id={`strategy-desc-${index}`}
                placeholder="Describe this influence strategy in detail. How does it work? What makes it effective?"
                value={strategy.description}
                onChange={(e) => updateStrategy(index, 'description', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`strategy-when-${index}`} className="text-sm font-medium">
                When to Use This Strategy
              </Label>
              <Textarea
                id={`strategy-when-${index}`}
                placeholder="In what situations is this strategy most effective? What types of people or circumstances?"
                value={strategy.whenToUse}
                onChange={(e) => updateStrategy(index, 'whenToUse', e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`strategy-example-${index}`} className="text-sm font-medium">
                Specific Example
              </Label>
              <Textarea
                id={`strategy-example-${index}`}
                placeholder="Provide a specific example of how you've used or plan to use this strategy"
                value={strategy.example}
                onChange={(e) => updateStrategy(index, 'example', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Personal Reflection & Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Personal Reflection & Development Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-reflection" className="text-sm font-medium">
              Personal Reflection on Influence Skills
            </Label>
            <Textarea
              id="personal-reflection"
              placeholder="Reflect on your current influence abilities. What are your strengths? What challenges do you face when trying to influence without authority? How has your understanding evolved?"
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-plan" className="text-sm font-medium">
              Action Plan for Developing Influence Skills
            </Label>
            <Textarea
              id="action-plan"
              placeholder="What specific steps will you take to improve your influence without authority? What practices will you implement? How will you measure your progress?"
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfluenceWithoutAuthorityForm
