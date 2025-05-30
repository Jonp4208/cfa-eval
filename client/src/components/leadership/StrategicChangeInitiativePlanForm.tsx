import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  TrendingUp, 
  Target, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  MessageSquare,
  Star,
  ArrowRight
} from 'lucide-react'

interface StrategicChangeInitiativePlanFormProps {
  value: string
  onChange: (value: string) => void
}

const StrategicChangeInitiativePlanForm: React.FC<StrategicChangeInitiativePlanFormProps> = ({ value, onChange }) => {
  const [changeInitiative, setChangeInitiative] = useState<string>('')
  const [urgencyReason, setUrgencyReason] = useState<string>('')
  const [visionStatement, setVisionStatement] = useState<string>('')
  const [coalitionMembers, setCoalitionMembers] = useState<string>('')
  const [communicationPlan, setCommunicationPlan] = useState<string>('')
  const [empowermentActions, setEmpowermentActions] = useState<string>('')
  const [shortTermWins, setShortTermWins] = useState<string>('')
  const [sustainabilityPlan, setSustainabilityPlan] = useState<string>('')
  const [resistanceManagement, setResistanceManagement] = useState<string>('')
  const [successMetrics, setSuccessMetrics] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setChangeInitiative(parsedValue.changeInitiative || '')
        setUrgencyReason(parsedValue.urgencyReason || '')
        setVisionStatement(parsedValue.visionStatement || '')
        setCoalitionMembers(parsedValue.coalitionMembers || '')
        setCommunicationPlan(parsedValue.communicationPlan || '')
        setEmpowermentActions(parsedValue.empowermentActions || '')
        setShortTermWins(parsedValue.shortTermWins || '')
        setSustainabilityPlan(parsedValue.sustainabilityPlan || '')
        setResistanceManagement(parsedValue.resistanceManagement || '')
        setSuccessMetrics(parsedValue.successMetrics || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setChangeInitiative(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      changeInitiative,
      urgencyReason,
      visionStatement,
      coalitionMembers,
      communicationPlan,
      empowermentActions,
      shortTermWins,
      sustainabilityPlan,
      resistanceManagement,
      successMetrics
    })
    onChange(formData)
  }, [changeInitiative, urgencyReason, visionStatement, coalitionMembers, communicationPlan, empowermentActions, shortTermWins, sustainabilityPlan, resistanceManagement, successMetrics, onChange])

  const getCompletionStatus = () => {
    const fields = [changeInitiative, urgencyReason, visionStatement, coalitionMembers, communicationPlan, empowermentActions, shortTermWins, sustainabilityPlan]
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5" />
          <p className="font-medium">Strategic Change Initiative Plan</p>
        </div>
        <p>Use Kotter's 8-Step Change Process to plan and implement a strategic change in your restaurant. This framework ensures successful change management and team buy-in.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Change Plan Progress</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getCompletionStatus()}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Step 1: Create Urgency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Step 1: Create a Sense of Urgency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-initiative" className="text-sm font-medium">
              Strategic Change Initiative
            </Label>
            <Input
              id="change-initiative"
              placeholder="e.g., Implement new POS system, Redesign kitchen workflow, Launch customer loyalty program"
              value={changeInitiative}
              onChange={(e) => setChangeInitiative(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="urgency-reason" className="text-sm font-medium">Why This Change is Urgent and Necessary</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-red-600 hover:text-red-800 hover:bg-transparent">
                    <span>View Examples</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-red-50 p-2 rounded-md text-xs text-red-800 mt-1 mb-2">
                  <p><strong>Examples:</strong><br/>
                  • Customer complaints about wait times are increasing<br/>
                  • Competitors are gaining market share with new technology<br/>
                  • Food costs are rising and we need better inventory control<br/>
                  • Team turnover is high due to outdated processes</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="urgency-reason"
              placeholder="Explain the compelling reasons why this change must happen now. What problems will worsen if we don't act? What opportunities will we miss?"
              value={urgencyReason}
              onChange={(e) => setUrgencyReason(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Build Coalition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Step 2: Build a Guiding Coalition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coalition-members" className="text-sm font-medium">
              Key Team Members Who Will Champion This Change
            </Label>
            <Textarea
              id="coalition-members"
              placeholder="List the team members who will help lead this change. Include their roles and why they're important to the success of this initiative."
              value={coalitionMembers}
              onChange={(e) => setCoalitionMembers(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Create Vision */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Step 3: Create a Vision for Change
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision-statement" className="text-sm font-medium">
              Clear Vision Statement for the Change
            </Label>
            <Textarea
              id="vision-statement"
              placeholder="Write a clear, compelling vision of what success looks like after this change is implemented. How will things be different and better?"
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Communicate Vision */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            Step 4: Communicate the Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="communication-plan" className="text-sm font-medium">
              Communication Strategy and Timeline
            </Label>
            <Textarea
              id="communication-plan"
              placeholder="How will you communicate this change to your team? Include: team meetings, one-on-ones, training sessions, written communications, and timeline for each."
              value={communicationPlan}
              onChange={(e) => setCommunicationPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Empower Action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-orange-500" />
            Step 5: Empower Broad-Based Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empowerment-actions" className="text-sm font-medium">
              How You'll Remove Barriers and Empower Team Members
            </Label>
            <Textarea
              id="empowerment-actions"
              placeholder="What barriers might prevent success? How will you remove them? What authority or resources will you give team members to make this change happen?"
              value={empowermentActions}
              onChange={(e) => setEmpowermentActions(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Short-term Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Step 6: Generate Short-term Wins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="short-term-wins" className="text-sm font-medium">
              Early Victories to Build Momentum
            </Label>
            <Textarea
              id="short-term-wins"
              placeholder="What quick wins can you achieve in the first 30-60 days? How will you celebrate these wins with your team to maintain momentum?"
              value={shortTermWins}
              onChange={(e) => setShortTermWins(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 7: Sustain Acceleration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Step 7: Sustain Acceleration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sustainability-plan" className="text-sm font-medium">
              Plan for Sustaining Change Momentum
            </Label>
            <Textarea
              id="sustainability-plan"
              placeholder="How will you keep the change moving forward after initial implementation? What ongoing support, training, or reinforcement is needed?"
              value={sustainabilityPlan}
              onChange={(e) => setSustainabilityPlan(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 8: Institute Change */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Step 8: Institute Change in Culture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resistance-management" className="text-sm font-medium">
              Resistance Management Strategy
            </Label>
            <Textarea
              id="resistance-management"
              placeholder="What resistance do you expect? How will you address concerns and objections? What support will resistant team members need?"
              value={resistanceManagement}
              onChange={(e) => setResistanceManagement(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-metrics" className="text-sm font-medium">
              Success Metrics and Timeline
            </Label>
            <Textarea
              id="success-metrics"
              placeholder="How will you measure success? What specific metrics will you track? What's your timeline for full implementation and when will you evaluate results?"
              value={successMetrics}
              onChange={(e) => setSuccessMetrics(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Implementation Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Implementation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Before Implementation:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Secure leadership support</li>
                <li>• Identify and prepare champions</li>
                <li>• Develop communication materials</li>
                <li>• Plan training sessions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">During Implementation:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Monitor progress regularly</li>
                <li>• Address resistance quickly</li>
                <li>• Celebrate early wins</li>
                <li>• Adjust plan as needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicChangeInitiativePlanForm
