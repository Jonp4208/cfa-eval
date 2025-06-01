import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  CheckCircle, 
  Star, 
  Target, 
  AlertTriangle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react'

interface QualityStandardsFormProps {
  value: string
  onChange: (value: string) => void
}

interface QualityStandard {
  area: string
  description: string
  goodDefinition: string
  measurementMethod: string
  correctiveActions: string
}

interface QualityStandardsData {
  standards: QualityStandard[]
  implementationPlan: string
  trainingApproach: string
  monitoringSystem: string
}

const QualityStandardsForm: React.FC<QualityStandardsFormProps> = ({ 
  value, 
  onChange
}) => {
  const [data, setData] = useState<QualityStandardsData>({
    standards: [
      { area: '', description: '', goodDefinition: '', measurementMethod: '', correctiveActions: '' },
      { area: '', description: '', goodDefinition: '', measurementMethod: '', correctiveActions: '' },
      { area: '', description: '', goodDefinition: '', measurementMethod: '', correctiveActions: '' }
    ],
    implementationPlan: '',
    trainingApproach: '',
    monitoringSystem: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setData(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setData(prev => ({ ...prev, implementationPlan: value }))
      }
    }
  }, [value])

  // Update parent component when data changes
  useEffect(() => {
    onChange(JSON.stringify(data))
  }, [data, onChange])

  const updateStandard = (index: number, field: keyof QualityStandard, newValue: string) => {
    setData(prev => ({
      ...prev,
      standards: prev.standards.map((standard, i) => 
        i === index ? { ...standard, [field]: newValue } : standard
      )
    }))
  }

  const updateData = (field: keyof Omit<QualityStandardsData, 'standards'>, newValue: string) => {
    setData(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const addStandard = () => {
    setData(prev => ({
      ...prev,
      standards: [...prev.standards, { area: '', description: '', goodDefinition: '', measurementMethod: '', correctiveActions: '' }]
    }))
  }

  const removeStandard = (index: number) => {
    if (data.standards.length > 1) {
      setData(prev => ({
        ...prev,
        standards: prev.standards.filter((_, i) => i !== index)
      }))
    }
  }

  const getCompletionPercentage = () => {
    const standardsComplete = data.standards.filter(s => 
      s.area.trim() && s.description.trim() && s.goodDefinition.trim() && 
      s.measurementMethod.trim() && s.correctiveActions.trim()
    ).length
    const otherFieldsComplete = [data.implementationPlan, data.trainingApproach, data.monitoringSystem]
      .filter(field => field.trim().length > 0).length
    
    const totalFields = data.standards.length * 5 + 3
    const completedFields = standardsComplete * 5 + otherFieldsComplete
    
    return Math.round((completedFields / totalFields) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-blue-800">Quality Standards Development</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Activity
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quality Standards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quality Standards ({data.standards.length})</h3>
          <Button
            onClick={addStandard}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Standard
          </Button>
        </div>

        {data.standards.map((standard, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Quality Standard #{index + 1}</CardTitle>
                </div>
                {data.standards.length > 1 && (
                  <Button
                    onClick={() => removeStandard(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`area-${index}`} className="text-sm font-medium">
                  Quality Area
                </Label>
                <Input
                  id={`area-${index}`}
                  placeholder="e.g., Food Presentation, Customer Service, Cleanliness"
                  value={standard.area}
                  onChange={(e) => updateStandard(index, 'area', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                  Standard Description
                </Label>
                <Textarea
                  id={`description-${index}`}
                  placeholder="Describe what this quality standard covers and why it's important..."
                  value={standard.description}
                  onChange={(e) => updateStandard(index, 'description', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`good-${index}`} className="text-sm font-medium">
                  Definition of "Good" Quality
                </Label>
                <Textarea
                  id={`good-${index}`}
                  placeholder="Define specifically what 'good' looks like for this standard. Be detailed and measurable..."
                  value={standard.goodDefinition}
                  onChange={(e) => updateStandard(index, 'goodDefinition', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`measurement-${index}`} className="text-sm font-medium">
                  How to Measure/Monitor
                </Label>
                <Textarea
                  id={`measurement-${index}`}
                  placeholder="Describe how you will measure and monitor this standard (frequency, methods, tools, etc.)..."
                  value={standard.measurementMethod}
                  onChange={(e) => updateStandard(index, 'measurementMethod', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`corrective-${index}`} className="text-sm font-medium">
                  Corrective Actions
                </Label>
                <Textarea
                  id={`corrective-${index}`}
                  placeholder="What actions will be taken when this standard is not met? Include immediate fixes and prevention strategies..."
                  value={standard.correctiveActions}
                  onChange={(e) => updateStandard(index, 'correctiveActions', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            How will you implement these quality standards in your restaurant?
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Describe your rollout strategy, timeline, communication plan, and how you'll ensure adoption..."
            value={data.implementationPlan}
            onChange={(e) => updateData('implementationPlan', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Training Approach */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Team Training Approach</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="trainingApproach" className="text-sm font-medium">
            How will you train your team on these quality standards?
          </Label>
          <Textarea
            id="trainingApproach"
            placeholder="Detail your training methods, materials, practice sessions, and how you'll ensure understanding..."
            value={data.trainingApproach}
            onChange={(e) => updateData('trainingApproach', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Monitoring System */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Ongoing Monitoring System</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="monitoringSystem" className="text-sm font-medium">
            How will you continuously monitor and maintain these quality standards?
          </Label>
          <Textarea
            id="monitoringSystem"
            placeholder="Describe your ongoing monitoring approach, review schedules, feedback mechanisms, and continuous improvement process..."
            value={data.monitoringSystem}
            onChange={(e) => updateData('monitoringSystem', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default QualityStandardsForm
