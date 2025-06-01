import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Users,
  Star,
  CheckCircle,
  Lightbulb,
  Shield
} from 'lucide-react'

interface OperationalExcellencePhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

interface Philosophy {
  coreBeliefs: string
  efficiencyApproach: string
  qualityCommitment: string
  customerValue: string
  continuousImprovement: string
  teamEngagement: string
  leadershipRole: string
  implementation: string
}

const OperationalExcellencePhilosophyForm: React.FC<OperationalExcellencePhilosophyFormProps> = ({ 
  value, 
  onChange
}) => {
  const [philosophy, setPhilosophy] = useState<Philosophy>({
    coreBeliefs: '',
    efficiencyApproach: '',
    qualityCommitment: '',
    customerValue: '',
    continuousImprovement: '',
    teamEngagement: '',
    leadershipRole: '',
    implementation: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setPhilosophy(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setPhilosophy(prev => ({ ...prev, coreBeliefs: value }))
      }
    }
  }, [value])

  // Update parent component when philosophy changes
  useEffect(() => {
    onChange(JSON.stringify(philosophy))
  }, [philosophy, onChange])

  const updatePhilosophy = (field: keyof Philosophy, newValue: string) => {
    setPhilosophy(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(philosophy)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const getWordCount = () => {
    const allText = Object.values(philosophy).join(' ')
    return allText.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-red-800">Operational Excellence Philosophy</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-red-600 border-red-300">
                  Reflection
                </Badge>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  ~{getWordCount()} words
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              <strong>Instructions:</strong> Write a comprehensive 1-page statement (approximately 300-500 words) describing your operational excellence philosophy. 
              This should reflect your personal beliefs and approach to driving efficiency, quality, and continuous improvement in restaurant operations.
            </p>
            <p>
              Consider how you will lead by example, engage your team, and create a culture of excellence that delivers exceptional value to customers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Core Beliefs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Core Beliefs About Operational Excellence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="coreBeliefs" className="text-sm font-medium">
            What are your fundamental beliefs about operational excellence in restaurants?
          </Label>
          <Textarea
            id="coreBeliefs"
            placeholder="Express your core beliefs about what operational excellence means, why it matters, and how it impacts the restaurant business..."
            value={philosophy.coreBeliefs}
            onChange={(e) => updatePhilosophy('coreBeliefs', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Efficiency Approach */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Approach to Efficiency</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="efficiencyApproach" className="text-sm font-medium">
            How do you approach efficiency in restaurant operations?
          </Label>
          <Textarea
            id="efficiencyApproach"
            placeholder="Describe your philosophy on creating efficient processes, eliminating waste, and optimizing operations without compromising quality..."
            value={philosophy.efficiencyApproach}
            onChange={(e) => updatePhilosophy('efficiencyApproach', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Quality Commitment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Commitment to Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="qualityCommitment" className="text-sm font-medium">
            What is your philosophy on maintaining and improving quality?
          </Label>
          <Textarea
            id="qualityCommitment"
            placeholder="Share your beliefs about quality standards, consistency, and how you ensure excellence in every aspect of operations..."
            value={philosophy.qualityCommitment}
            onChange={(e) => updatePhilosophy('qualityCommitment', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Customer Value */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Creating Customer Value</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="customerValue" className="text-sm font-medium">
            How do you ensure operational excellence creates value for customers?
          </Label>
          <Textarea
            id="customerValue"
            placeholder="Explain how your operational excellence efforts directly benefit customers and enhance their experience..."
            value={philosophy.customerValue}
            onChange={(e) => updatePhilosophy('customerValue', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Continuous Improvement */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Continuous Improvement Mindset</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="continuousImprovement" className="text-sm font-medium">
            What is your philosophy on continuous improvement and innovation?
          </Label>
          <Textarea
            id="continuousImprovement"
            placeholder="Describe your beliefs about always seeking better ways to operate, learning from mistakes, and fostering innovation..."
            value={philosophy.continuousImprovement}
            onChange={(e) => updatePhilosophy('continuousImprovement', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Engagement */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Team Engagement & Empowerment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEngagement" className="text-sm font-medium">
            How do you engage and empower your team in operational excellence?
          </Label>
          <Textarea
            id="teamEngagement"
            placeholder="Share your philosophy on involving team members in improvement efforts, recognizing contributions, and building a culture of excellence..."
            value={philosophy.teamEngagement}
            onChange={(e) => updatePhilosophy('teamEngagement', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Leadership Role */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Your Role as a Leader</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="leadershipRole" className="text-sm font-medium">
            What is your role as a leader in driving operational excellence?
          </Label>
          <Textarea
            id="leadershipRole"
            placeholder="Describe how you will model excellence, support your team, make decisions, and create the conditions for operational success..."
            value={philosophy.leadershipRole}
            onChange={(e) => updatePhilosophy('leadershipRole', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Putting Philosophy into Practice</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementation" className="text-sm font-medium">
            How will you implement this philosophy in your daily leadership?
          </Label>
          <Textarea
            id="implementation"
            placeholder="Explain how you will translate these beliefs into concrete actions, decisions, and behaviors in your restaurant..."
            value={philosophy.implementation}
            onChange={(e) => updatePhilosophy('implementation', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default OperationalExcellencePhilosophyForm
