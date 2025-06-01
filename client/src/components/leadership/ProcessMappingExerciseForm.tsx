import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Users
} from 'lucide-react'

interface ProcessMappingExerciseFormProps {
  value: string
  onChange: (value: string) => void
}

interface ProcessMapping {
  processName: string
  processDescription: string
  currentStateSteps: string
  bottlenecks: string
  wasteIdentified: string
  futureStateSteps: string
  improvementActions: string
  implementationPlan: string
  successMetrics: string
}

const ProcessMappingExerciseForm: React.FC<ProcessMappingExerciseFormProps> = ({ 
  value, 
  onChange
}) => {
  const [mapping, setMapping] = useState<ProcessMapping>({
    processName: '',
    processDescription: '',
    currentStateSteps: '',
    bottlenecks: '',
    wasteIdentified: '',
    futureStateSteps: '',
    improvementActions: '',
    implementationPlan: '',
    successMetrics: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setMapping(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setMapping(prev => ({ ...prev, processDescription: value }))
      }
    }
  }, [value])

  // Update parent component when mapping changes
  useEffect(() => {
    onChange(JSON.stringify(mapping))
  }, [mapping, onChange])

  const updateMapping = (field: keyof ProcessMapping, newValue: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(mapping)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-purple-800">Process Mapping Exercise</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  Activity
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Process Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Process Selection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="processName" className="text-sm font-medium">
              Process Name
            </Label>
            <Input
              id="processName"
              placeholder="e.g., Order Taking, Food Preparation, Table Service, Cleaning"
              value={mapping.processName}
              onChange={(e) => updateMapping('processName', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processDescription" className="text-sm font-medium">
              Process Description
            </Label>
            <Textarea
              id="processDescription"
              placeholder="Provide a brief description of this process and why you selected it for mapping..."
              value={mapping.processDescription}
              onChange={(e) => updateMapping('processDescription', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current State Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Current State Process Steps</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="currentStateSteps" className="text-sm font-medium">
            Map out the current process step-by-step (include timing if possible)
          </Label>
          <Textarea
            id="currentStateSteps"
            placeholder="List each step in the current process:
1. Step 1 (time: X minutes)
2. Step 2 (time: X minutes)
3. Step 3 (time: X minutes)
..."
            value={mapping.currentStateSteps}
            onChange={(e) => updateMapping('currentStateSteps', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Bottlenecks & Pain Points</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="bottlenecks" className="text-sm font-medium">
            Identify bottlenecks, delays, and pain points in the current process
          </Label>
          <Textarea
            id="bottlenecks"
            placeholder="Describe specific bottlenecks, where delays occur, what causes them, and their impact on the overall process..."
            value={mapping.bottlenecks}
            onChange={(e) => updateMapping('bottlenecks', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Waste Identification */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Waste Identification</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="wasteIdentified" className="text-sm font-medium">
            Identify types of waste in this process (DOWNTIME: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra processing)
          </Label>
          <Textarea
            id="wasteIdentified"
            placeholder="For each type of waste you observe, provide specific examples and estimate their impact..."
            value={mapping.wasteIdentified}
            onChange={(e) => updateMapping('wasteIdentified', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Future State */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Future State Process Design</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="futureStateSteps" className="text-sm font-medium">
            Design the improved future state process
          </Label>
          <Textarea
            id="futureStateSteps"
            placeholder="Map out the improved process steps:
1. Improved Step 1 (time: X minutes)
2. Improved Step 2 (time: X minutes)
3. New/Modified Step 3 (time: X minutes)
..."
            value={mapping.futureStateSteps}
            onChange={(e) => updateMapping('futureStateSteps', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Improvement Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Specific Improvement Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvementActions" className="text-sm font-medium">
            List specific actions needed to achieve the future state
          </Label>
          <Textarea
            id="improvementActions"
            placeholder="Detail the specific changes, tools, training, or resources needed to implement the improved process..."
            value={mapping.improvementActions}
            onChange={(e) => updateMapping('improvementActions', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a timeline and plan for implementing these improvements
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Include timeline, responsible parties, training needs, pilot testing approach, and rollout strategy..."
            value={mapping.implementationPlan}
            onChange={(e) => updateMapping('implementationPlan', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Success Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="successMetrics" className="text-sm font-medium">
            Define how you will measure the success of this process improvement
          </Label>
          <Textarea
            id="successMetrics"
            placeholder="Include specific metrics like time reduction, error reduction, cost savings, customer satisfaction improvements, etc..."
            value={mapping.successMetrics}
            onChange={(e) => updateMapping('successMetrics', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ProcessMappingExerciseForm
