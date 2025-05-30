import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  Clock
} from 'lucide-react'

interface NinetyDayStrategicPlanFormProps {
  value: string
  onChange: (value: string) => void
}

interface StrategicObjective {
  title: string
  description: string
  outcomes: string
  milestones: string
  resources: string
  obstacles: string
  metrics: string
  timeline: string
}

const NinetyDayStrategicPlanForm: React.FC<NinetyDayStrategicPlanFormProps> = ({ value, onChange }) => {
  const [planOverview, setPlanOverview] = useState<string>('')
  const [objectives, setObjectives] = useState<StrategicObjective[]>([
    { title: '', description: '', outcomes: '', milestones: '', resources: '', obstacles: '', metrics: '', timeline: '' },
    { title: '', description: '', outcomes: '', milestones: '', resources: '', obstacles: '', metrics: '', timeline: '' },
    { title: '', description: '', outcomes: '', milestones: '', resources: '', obstacles: '', metrics: '', timeline: '' },
    { title: '', description: '', outcomes: '', milestones: '', resources: '', obstacles: '', metrics: '', timeline: '' },
    { title: '', description: '', outcomes: '', milestones: '', resources: '', obstacles: '', metrics: '', timeline: '' }
  ])
  const [reviewSchedule, setReviewSchedule] = useState<string>('')
  const [contingencyPlans, setContingencyPlans] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setPlanOverview(parsedValue.planOverview || '')
        if (parsedValue.objectives) {
          setObjectives(parsedValue.objectives)
        }
        setReviewSchedule(parsedValue.reviewSchedule || '')
        setContingencyPlans(parsedValue.contingencyPlans || '')
      } catch (e) {
        // If parsing fails, keep default state
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      planOverview,
      objectives,
      reviewSchedule,
      contingencyPlans
    })
    onChange(formData)
  }, [planOverview, objectives, reviewSchedule, contingencyPlans, onChange])

  const updateObjective = (index: number, field: keyof StrategicObjective, value: string) => {
    const updatedObjectives = [...objectives]
    updatedObjectives[index] = { ...updatedObjectives[index], [field]: value }
    setObjectives(updatedObjectives)
  }

  const getObjectiveCompletion = (objective: StrategicObjective) => {
    const fields = Object.values(objective)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const getOverallCompletion = () => {
    const overviewComplete = planOverview.trim().length > 0 ? 1 : 0
    const reviewComplete = reviewSchedule.trim().length > 0 ? 1 : 0
    const objectivesWithContent = objectives.filter(obj => obj.title.trim().length > 0).length
    const totalSections = 2 + Math.max(3, objectivesWithContent) // Overview + Review + at least 3 objectives
    const completedSections = overviewComplete + reviewComplete + objectivesWithContent
    return Math.round((completedSections / totalSections) * 100)
  }

  const getObjectiveIcon = (index: number) => {
    const icons = [Target, TrendingUp, Users, DollarSign, Star]
    const IconComponent = icons[index] || Target
    return IconComponent
  }

  const getObjectiveColor = (index: number) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red']
    return colors[index] || 'blue'
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5" />
          <p className="font-medium">90-Day Strategic Plan</p>
        </div>
        <p>Create a comprehensive 90-day strategic plan with 3-5 strategic objectives. This plan will guide your restaurant's strategic initiatives and ensure focused execution on key priorities.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Strategic Plan Progress</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getOverallCompletion()}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {objectives.slice(0, 5).map((objective, index) => {
              const IconComponent = getObjectiveIcon(index)
              const completion = getObjectiveCompletion(objective)
              return (
                <div key={index} className={`p-3 rounded-lg border border-${getObjectiveColor(index)}-200 bg-${getObjectiveColor(index)}-50`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-4 w-4 text-${getObjectiveColor(index)}-600`} />
                    <span className="font-medium text-sm">Objective {index + 1}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {objective.title || 'Not started'}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {completion}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="obj1" className="text-xs">Obj 1</TabsTrigger>
          <TabsTrigger value="obj2" className="text-xs">Obj 2</TabsTrigger>
          <TabsTrigger value="obj3" className="text-xs">Obj 3</TabsTrigger>
          <TabsTrigger value="obj4" className="text-xs">Obj 4</TabsTrigger>
          <TabsTrigger value="obj5" className="text-xs">Obj 5</TabsTrigger>
          <TabsTrigger value="review" className="text-xs">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                90-Day Strategic Plan Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-overview" className="text-sm font-medium">
                  Strategic Plan Overview & Context
                </Label>
                <Textarea
                  id="plan-overview"
                  placeholder="Provide an overview of your 90-day strategic plan. What is the overall strategic direction? What key challenges or opportunities are you addressing? How does this plan align with your restaurant's long-term goals?"
                  value={planOverview}
                  onChange={(e) => setPlanOverview(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Strategic Planning Tips:</p>
                <ul className="text-xs space-y-1">
                  <li>• Focus on 3-5 strategic objectives maximum</li>
                  <li>• Balance team development and operational improvement goals</li>
                  <li>• Ensure objectives are specific, measurable, and achievable in 90 days</li>
                  <li>• Consider both internal improvements and customer-facing initiatives</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {objectives.map((objective, index) => (
          <TabsContent key={index} value={`obj${index + 1}`} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {React.createElement(getObjectiveIcon(index), { 
                    className: `h-5 w-5 text-${getObjectiveColor(index)}-500` 
                  })}
                  Strategic Objective {index + 1}
                  <Badge variant="outline" className="ml-auto">
                    {getObjectiveCompletion(objective)}% Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`} className="text-sm font-medium">
                    Objective Title
                  </Label>
                  <Input
                    id={`title-${index}`}
                    placeholder="e.g., Improve Customer Satisfaction Scores, Reduce Food Waste, Enhance Team Training"
                    value={objective.title}
                    onChange={(e) => updateObjective(index, 'title', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                    Detailed Description
                  </Label>
                  <Textarea
                    id={`description-${index}`}
                    placeholder="Provide a detailed description of this strategic objective. What exactly will you accomplish? Why is this important for your restaurant?"
                    value={objective.description}
                    onChange={(e) => updateObjective(index, 'description', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`outcomes-${index}`} className="text-sm font-medium">
                    Specific Outcomes Expected
                  </Label>
                  <Textarea
                    id={`outcomes-${index}`}
                    placeholder="What specific, measurable outcomes will you achieve? Be as concrete as possible about what success looks like."
                    value={objective.outcomes}
                    onChange={(e) => updateObjective(index, 'outcomes', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`milestones-${index}`} className="text-sm font-medium">
                      Key Milestones
                    </Label>
                    <Textarea
                      id={`milestones-${index}`}
                      placeholder="List the key milestones and deadlines for this objective. What are the major checkpoints along the way?"
                      value={objective.milestones}
                      onChange={(e) => updateObjective(index, 'milestones', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`resources-${index}`} className="text-sm font-medium">
                      Resources Needed
                    </Label>
                    <Textarea
                      id={`resources-${index}`}
                      placeholder="What resources do you need? Include budget, time, people, equipment, training, or external support."
                      value={objective.resources}
                      onChange={(e) => updateObjective(index, 'resources', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`obstacles-${index}`} className="text-sm font-medium">
                      Potential Obstacles
                    </Label>
                    <Textarea
                      id={`obstacles-${index}`}
                      placeholder="What obstacles or challenges might prevent success? How will you address them?"
                      value={objective.obstacles}
                      onChange={(e) => updateObjective(index, 'obstacles', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`metrics-${index}`} className="text-sm font-medium">
                      Success Metrics
                    </Label>
                    <Textarea
                      id={`metrics-${index}`}
                      placeholder="How will you measure success? What specific metrics will you track and how often?"
                      value={objective.metrics}
                      onChange={(e) => updateObjective(index, 'metrics', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`timeline-${index}`} className="text-sm font-medium">
                    90-Day Timeline
                  </Label>
                  <Textarea
                    id={`timeline-${index}`}
                    placeholder="Break down the timeline for this objective:
Month 1 (Days 1-30): [Key activities and milestones]
Month 2 (Days 31-60): [Key activities and milestones]  
Month 3 (Days 61-90): [Key activities and milestones]"
                    value={objective.timeline}
                    onChange={(e) => updateObjective(index, 'timeline', e.target.value)}
                    className="min-h-[100px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Plan Review & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-schedule" className="text-sm font-medium">
                  Review Schedule & Accountability
                </Label>
                <Textarea
                  id="review-schedule"
                  placeholder="How will you monitor progress on this plan? Include:
• Weekly review schedule (what day/time)
• Monthly progress assessments
• Who will hold you accountable
• How you'll adjust the plan if needed"
                  value={reviewSchedule}
                  onChange={(e) => setReviewSchedule(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contingency-plans" className="text-sm font-medium">
                  Contingency Plans & Risk Management
                </Label>
                <Textarea
                  id="contingency-plans"
                  placeholder="What are your backup plans if objectives fall behind schedule? How will you handle unexpected challenges or opportunities that arise during the 90 days?"
                  value={contingencyPlans}
                  onChange={(e) => setContingencyPlans(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Implementation Success Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Critical Success Factors:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Clear communication to all team members</li>
                    <li>• Regular progress monitoring and adjustments</li>
                    <li>• Adequate resource allocation</li>
                    <li>• Strong leadership commitment</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Common Pitfalls to Avoid:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Setting too many objectives</li>
                    <li>• Lack of specific metrics</li>
                    <li>• Insufficient team involvement</li>
                    <li>• No regular review process</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NinetyDayStrategicPlanForm
