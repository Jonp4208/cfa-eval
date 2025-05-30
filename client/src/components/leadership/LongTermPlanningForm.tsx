import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Eye,
  CheckCircle,
  Clock,
  ChevronDown,
  BarChart3,
  Users,
  Star
} from 'lucide-react'

interface LongTermPlanningFormProps {
  value: string
  onChange: (value: string) => void
}

interface StrategicGoal {
  category: string
  oneYear: string
  threeYear: string
  fiveYear: string
  keyActions: string
  metrics: string
}

const LongTermPlanningForm: React.FC<LongTermPlanningFormProps> = ({ value, onChange }) => {
  const [readingReflection, setReadingReflection] = useState<string>('')
  const [restaurantVision, setRestaurantVision] = useState<string>('')
  const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([
    { category: 'Financial Performance', oneYear: '', threeYear: '', fiveYear: '', keyActions: '', metrics: '' },
    { category: 'Team Development', oneYear: '', threeYear: '', fiveYear: '', keyActions: '', metrics: '' },
    { category: 'Customer Experience', oneYear: '', threeYear: '', fiveYear: '', keyActions: '', metrics: '' },
    { category: 'Operational Excellence', oneYear: '', threeYear: '', fiveYear: '', keyActions: '', metrics: '' }
  ])
  const [accountabilitySystem, setAccountabilitySystem] = useState<string>('')
  const [reviewProcess, setReviewProcess] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setReadingReflection(parsedValue.readingReflection || '')
        setRestaurantVision(parsedValue.restaurantVision || '')
        if (parsedValue.strategicGoals) {
          setStrategicGoals(parsedValue.strategicGoals)
        }
        setAccountabilitySystem(parsedValue.accountabilitySystem || '')
        setReviewProcess(parsedValue.reviewProcess || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the reading reflection
        setReadingReflection(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      readingReflection,
      restaurantVision,
      strategicGoals,
      accountabilitySystem,
      reviewProcess
    })
    onChange(formData)
  }, [readingReflection, restaurantVision, strategicGoals, accountabilitySystem, reviewProcess, onChange])

  const updateStrategicGoal = (index: number, field: keyof StrategicGoal, value: string) => {
    const updatedGoals = [...strategicGoals]
    updatedGoals[index] = { ...updatedGoals[index], [field]: value }
    setStrategicGoals(updatedGoals)
  }

  const getCompletionStatus = () => {
    const mainFields = [readingReflection, restaurantVision, accountabilitySystem, reviewProcess]
    const completedMainFields = mainFields.filter(field => field.trim().length > 0).length
    
    const goalFields = strategicGoals.flatMap(goal => [goal.oneYear, goal.threeYear, goal.fiveYear, goal.keyActions])
    const completedGoalFields = goalFields.filter(field => field.trim().length > 0).length
    
    const totalFields = mainFields.length + goalFields.length
    const completedFields = completedMainFields + completedGoalFields
    
    return Math.round((completedFields / totalFields) * 100)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Financial Performance': return BarChart3
      case 'Team Development': return Users
      case 'Customer Experience': return Star
      case 'Operational Excellence': return Target
      default: return Target
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financial Performance': return 'green'
      case 'Team Development': return 'blue'
      case 'Customer Experience': return 'purple'
      case 'Operational Excellence': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5" />
          <p className="font-medium">Long-term Planning and Goal Setting</p>
        </div>
        <p>Apply the concepts from your reading to create a comprehensive long-term strategic plan for your restaurant. Focus on setting strategic goals that differ from operational goals and building accountability systems.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Long-term Planning Progress</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getCompletionStatus()}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Reading Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Reading Reflection & Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="reading-reflection" className="text-sm font-medium">Key insights from the article on long-term strategic goals</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Prompts</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • What's the difference between strategic and operational goals?<br/>
                  • How do you create accountability for strategic initiatives?<br/>
                  • What goal-setting frameworks resonated with you?<br/>
                  • How will you apply these concepts in your restaurant?</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="reading-reflection"
              placeholder="Summarize the key insights from your reading. What did you learn about setting and achieving long-term strategic goals? How do strategic goals differ from operational goals?"
              value={readingReflection}
              onChange={(e) => setReadingReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Vision */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            5-Year Restaurant Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-vision" className="text-sm font-medium">
              Your Restaurant's 5-Year Vision Statement
            </Label>
            <Textarea
              id="restaurant-vision"
              placeholder="Paint a picture of what your restaurant will look like in 5 years. What will be different? What will you be known for? How will you serve customers? What kind of workplace will it be for team members?"
              value={restaurantVision}
              onChange={(e) => setRestaurantVision(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Strategic Goals by Category */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Strategic Goals by Category</h3>
        {strategicGoals.map((goal, index) => {
          const IconComponent = getCategoryIcon(goal.category)
          const color = getCategoryColor(goal.category)
          
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 text-${color}-500`} />
                  {goal.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`one-year-${index}`} className="text-sm font-medium">
                      1-Year Goal
                    </Label>
                    <Textarea
                      id={`one-year-${index}`}
                      placeholder="What will you achieve in this category within 1 year?"
                      value={goal.oneYear}
                      onChange={(e) => updateStrategicGoal(index, 'oneYear', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`three-year-${index}`} className="text-sm font-medium">
                      3-Year Goal
                    </Label>
                    <Textarea
                      id={`three-year-${index}`}
                      placeholder="What will you achieve in this category within 3 years?"
                      value={goal.threeYear}
                      onChange={(e) => updateStrategicGoal(index, 'threeYear', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`five-year-${index}`} className="text-sm font-medium">
                      5-Year Goal
                    </Label>
                    <Textarea
                      id={`five-year-${index}`}
                      placeholder="What will you achieve in this category within 5 years?"
                      value={goal.fiveYear}
                      onChange={(e) => updateStrategicGoal(index, 'fiveYear', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`actions-${index}`} className="text-sm font-medium">
                      Key Strategic Actions
                    </Label>
                    <Textarea
                      id={`actions-${index}`}
                      placeholder="What are the key strategic actions you'll take to achieve these goals? Focus on high-impact initiatives."
                      value={goal.keyActions}
                      onChange={(e) => updateStrategicGoal(index, 'keyActions', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`metrics-${index}`} className="text-sm font-medium">
                      Success Metrics
                    </Label>
                    <Textarea
                      id={`metrics-${index}`}
                      placeholder="How will you measure progress toward these goals? What specific metrics will you track?"
                      value={goal.metrics}
                      onChange={(e) => updateStrategicGoal(index, 'metrics', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Accountability System */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Accountability System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountability-system" className="text-sm font-medium">
              How You'll Create Accountability for Strategic Goals
            </Label>
            <Textarea
              id="accountability-system"
              placeholder="Describe your accountability system:
• Who will hold you accountable for these goals?
• How will you track progress regularly?
• What consequences exist for missing milestones?
• How will you celebrate achievements?
• What support systems will you put in place?"
              value={accountabilitySystem}
              onChange={(e) => setAccountabilitySystem(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Review Process */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Strategic Review Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-process" className="text-sm font-medium">
              Regular Review and Adjustment Process
            </Label>
            <Textarea
              id="review-process"
              placeholder="Define your strategic review process:
• How often will you review progress on these goals?
• What questions will you ask during reviews?
• How will you adjust goals if circumstances change?
• Who will participate in strategic reviews?
• How will you document and communicate changes?"
              value={reviewProcess}
              onChange={(e) => setReviewProcess(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Strategic vs Operational Goals Guide */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Strategic vs. Operational Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Strategic Goals:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Long-term (1-5 years)</li>
                <li>• Focus on competitive advantage</li>
                <li>• Transform the business</li>
                <li>• Require significant resources</li>
                <li>• Example: "Become the #1 rated restaurant in our area"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Operational Goals:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Short-term (daily, weekly, monthly)</li>
                <li>• Focus on efficiency</li>
                <li>• Maintain current operations</li>
                <li>• Use existing resources</li>
                <li>• Example: "Reduce wait times to under 5 minutes"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LongTermPlanningForm
