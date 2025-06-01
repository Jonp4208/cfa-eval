import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  Target, 
  TrendingDown,
  Clock,
  Star,
  Trash2
} from 'lucide-react'

interface LeanPrinciplesReadingFormProps {
  value: string
  onChange: (value: string) => void
}

interface LeanReflection {
  keyLearnings: string
  wasteIdentification: string
  valueStreamMapping: string
  implementationStrategy: string
  expectedOutcomes: string
}

const LeanPrinciplesReadingForm: React.FC<LeanPrinciplesReadingFormProps> = ({ 
  value, 
  onChange
}) => {
  const [reflection, setReflection] = useState<LeanReflection>({
    keyLearnings: '',
    wasteIdentification: '',
    valueStreamMapping: '',
    implementationStrategy: '',
    expectedOutcomes: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setReflection(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setReflection(prev => ({ ...prev, keyLearnings: value }))
      }
    }
  }, [value])

  // Update parent component when reflection changes
  useEffect(() => {
    onChange(JSON.stringify(reflection))
  }, [reflection, onChange])

  const updateReflection = (field: keyof LeanReflection, newValue: string) => {
    setReflection(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(reflection)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-green-800">Lean Principles for Restaurants - Reading Reflection</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Reading Assignment
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Learnings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Key Learnings from Lean Principles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyLearnings" className="text-sm font-medium">
            What are the most important lean principles you learned from this reading?
          </Label>
          <Textarea
            id="keyLearnings"
            placeholder="Summarize the key lean principles and concepts you learned, including value, waste, flow, pull, and perfection..."
            value={reflection.keyLearnings}
            onChange={(e) => updateReflection('keyLearnings', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Waste Identification */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Waste Identification in Your Restaurant</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="wasteIdentification" className="text-sm font-medium">
            Identify the 8 types of waste (DOWNTIME) that you observe in your restaurant operations
          </Label>
          <div className="text-xs text-gray-600 mb-2">
            <strong>DOWNTIME:</strong> Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra processing
          </div>
          <Textarea
            id="wasteIdentification"
            placeholder="For each type of waste, provide specific examples you've observed in your restaurant and estimate their impact..."
            value={reflection.wasteIdentification}
            onChange={(e) => updateReflection('wasteIdentification', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Value Stream Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Value Stream Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="valueStreamMapping" className="text-sm font-medium">
            Describe the value stream for one key process in your restaurant (e.g., order-to-delivery)
          </Label>
          <Textarea
            id="valueStreamMapping"
            placeholder="Map out the steps from customer order to delivery, identifying value-added vs. non-value-added activities..."
            value={reflection.valueStreamMapping}
            onChange={(e) => updateReflection('valueStreamMapping', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Lean Implementation Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationStrategy" className="text-sm font-medium">
            Create a strategy for implementing lean principles in your restaurant
          </Label>
          <Textarea
            id="implementationStrategy"
            placeholder="Outline your approach to introducing lean principles, including which areas to start with, team involvement, and timeline..."
            value={reflection.implementationStrategy}
            onChange={(e) => updateReflection('implementationStrategy', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Expected Outcomes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Expected Outcomes & Benefits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="expectedOutcomes" className="text-sm font-medium">
            What improvements do you expect to see from implementing lean principles?
          </Label>
          <Textarea
            id="expectedOutcomes"
            placeholder="Describe the specific benefits you expect in terms of efficiency, quality, cost reduction, customer satisfaction, and employee engagement..."
            value={reflection.expectedOutcomes}
            onChange={(e) => updateReflection('expectedOutcomes', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default LeanPrinciplesReadingForm
