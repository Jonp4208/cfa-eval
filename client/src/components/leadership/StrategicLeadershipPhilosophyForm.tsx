import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  Compass,
  Star
} from 'lucide-react'

interface StrategicLeadershipPhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

const StrategicLeadershipPhilosophyForm: React.FC<StrategicLeadershipPhilosophyFormProps> = ({ value, onChange }) => {
  const [roleOfStrategy, setRoleOfStrategy] = useState<string>('')
  const [balancingApproach, setBalancingApproach] = useState<string>('')
  const [decisionMakingApproach, setDecisionMakingApproach] = useState<string>('')
  const [continuousLearning, setContinuousLearning] = useState<string>('')
  const [leadershipVision, setLeadershipVision] = useState<string>('')
  const [coreValues, setCoreValues] = useState<string>('')
  const [finalPhilosophy, setFinalPhilosophy] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setRoleOfStrategy(parsedValue.roleOfStrategy || '')
        setBalancingApproach(parsedValue.balancingApproach || '')
        setDecisionMakingApproach(parsedValue.decisionMakingApproach || '')
        setContinuousLearning(parsedValue.continuousLearning || '')
        setLeadershipVision(parsedValue.leadershipVision || '')
        setCoreValues(parsedValue.coreValues || '')
        setFinalPhilosophy(parsedValue.finalPhilosophy || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the final philosophy
        setFinalPhilosophy(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      roleOfStrategy,
      balancingApproach,
      decisionMakingApproach,
      continuousLearning,
      leadershipVision,
      coreValues,
      finalPhilosophy
    })
    onChange(formData)
  }, [roleOfStrategy, balancingApproach, decisionMakingApproach, continuousLearning, leadershipVision, coreValues, finalPhilosophy, onChange])

  const getCompletionStatus = () => {
    const sections = [roleOfStrategy, balancingApproach, decisionMakingApproach, continuousLearning, leadershipVision, coreValues]
    const completedSections = sections.filter(section => section.trim().length > 0).length
    return Math.round((completedSections / sections.length) * 100)
  }

  const generatePhilosophy = () => {
    const sections = [
      roleOfStrategy && `**The Role of Strategy in Restaurant Leadership**\n${roleOfStrategy}`,
      balancingApproach && `**Balancing Short-term Operations with Long-term Thinking**\n${balancingApproach}`,
      decisionMakingApproach && `**My Approach to Strategic Decision-Making**\n${decisionMakingApproach}`,
      leadershipVision && `**My Vision as a Strategic Leader**\n${leadershipVision}`,
      coreValues && `**Core Values That Guide My Strategic Leadership**\n${coreValues}`,
      continuousLearning && `**Commitment to Continuous Strategic Development**\n${continuousLearning}`
    ].filter(Boolean)

    const generatedPhilosophy = sections.join('\n\n')
    setFinalPhilosophy(generatedPhilosophy)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-5 w-5" />
          <p className="font-medium">Strategic Leadership Philosophy</p>
        </div>
        <p>Develop your personal strategic leadership philosophy statement. This will serve as your guiding framework for making strategic decisions and leading with long-term vision in your restaurant.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Philosophy Development Progress</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getCompletionStatus()}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Section 1: Role of Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            The Role of Strategy in Restaurant Leadership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="role-strategy" className="text-sm font-medium">Your beliefs about the role of strategy in restaurant leadership</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • Why is strategic thinking important for restaurant leaders?<br/>
                  • How does strategy differ from day-to-day operations?<br/>
                  • What role should strategy play in your daily leadership?<br/>
                  • How does strategic leadership impact team performance and guest experience?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="role-strategy"
              placeholder="Describe your beliefs about the importance and role of strategic thinking in restaurant leadership. How do you view the relationship between strategy and operational excellence?"
              value={roleOfStrategy}
              onChange={(e) => setRoleOfStrategy(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Balancing Approach */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Balancing Short-term Operations with Long-term Thinking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="balancing-approach" className="text-sm font-medium">How you balance immediate operational needs with long-term strategic goals</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-purple-600 hover:text-purple-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-purple-50 p-2 rounded-md text-xs text-purple-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • How do you prioritize when short-term and long-term needs conflict?<br/>
                  • What systems or practices help you maintain strategic focus during busy operations?<br/>
                  • How do you ensure long-term goals don't get lost in daily urgencies?<br/>
                  • What role does your team play in maintaining this balance?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="balancing-approach"
              placeholder="Explain your approach to balancing the immediate demands of restaurant operations with the need for long-term strategic thinking and planning."
              value={balancingApproach}
              onChange={(e) => setBalancingApproach(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Decision-Making Approach */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-500" />
            Strategic Decision-Making Approach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="decision-making" className="text-sm font-medium">Your framework and principles for making strategic decisions</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-green-600 hover:text-green-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-green-50 p-2 rounded-md text-xs text-green-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • What process do you follow when making strategic decisions?<br/>
                  • How do you gather and evaluate information for strategic choices?<br/>
                  • What role do data, intuition, and team input play in your decisions?<br/>
                  • How do you handle uncertainty and risk in strategic decisions?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="decision-making"
              placeholder="Describe your approach to strategic decision-making. What principles guide you? What process do you follow? How do you involve others?"
              value={decisionMakingApproach}
              onChange={(e) => setDecisionMakingApproach(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Leadership Vision */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-500" />
            Vision as a Strategic Leader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="leadership-vision" className="text-sm font-medium">Your vision for yourself as a strategic leader</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-orange-600 hover:text-orange-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-orange-50 p-2 rounded-md text-xs text-orange-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • What kind of strategic leader do you aspire to be?<br/>
                  • How do you want your team to view your strategic leadership?<br/>
                  • What impact do you want to have on your restaurant's future?<br/>
                  • What legacy do you want to create through strategic leadership?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="leadership-vision"
              placeholder="Paint a picture of your vision for yourself as a strategic leader. What kind of strategic leader do you want to be? What impact do you want to have?"
              value={leadershipVision}
              onChange={(e) => setLeadershipVision(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Core Values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-500" />
            Core Values in Strategic Leadership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="core-values" className="text-sm font-medium">The core values that guide your strategic leadership</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-indigo-50 p-2 rounded-md text-xs text-indigo-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • What values are non-negotiable in your strategic leadership?<br/>
                  • How do your personal values align with strategic decision-making?<br/>
                  • What ethical principles guide your strategic choices?<br/>
                  • How do you ensure your values are reflected in your strategic actions?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="core-values"
              placeholder="Identify and describe the core values that guide your strategic leadership. How do these values influence your strategic decisions and actions?"
              value={coreValues}
              onChange={(e) => setCoreValues(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Continuous Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            Commitment to Continuous Strategic Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="continuous-learning" className="text-sm font-medium">How you will continue developing your strategic thinking skills</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-red-600 hover:text-red-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-red-50 p-2 rounded-md text-xs text-red-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • What specific actions will you take to improve your strategic thinking?<br/>
                  • How will you stay current with industry trends and best practices?<br/>
                  • What resources will you use for ongoing strategic development?<br/>
                  • How will you measure your growth as a strategic leader?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="continuous-learning"
              placeholder="Describe your commitment to ongoing strategic leadership development. What specific steps will you take to continue growing your strategic thinking skills?"
              value={continuousLearning}
              onChange={(e) => setContinuousLearning(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Philosophy Button */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-500" />
            Your Strategic Leadership Philosophy Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={generatePhilosophy}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              disabled={getCompletionStatus() < 50}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Philosophy Statement
            </Button>
            <Badge variant="secondary">
              {getCompletionStatus()}% sections completed
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-philosophy" className="text-sm font-medium">
              Final Strategic Leadership Philosophy Statement
            </Label>
            <Textarea
              id="final-philosophy"
              placeholder="Your complete strategic leadership philosophy statement will appear here after you complete the sections above and click 'Generate Philosophy Statement'. You can then edit and refine it as needed."
              value={finalPhilosophy}
              onChange={(e) => setFinalPhilosophy(e.target.value)}
              className="min-h-[200px] text-sm"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Tips for Your Philosophy Statement:</p>
            <ul className="text-xs space-y-1">
              <li>• Keep it to about 1 page (300-500 words)</li>
              <li>• Make it personal and authentic to your leadership style</li>
              <li>• Include specific examples from your restaurant experience</li>
              <li>• Review and refine it regularly as you grow as a leader</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicLeadershipPhilosophyForm
