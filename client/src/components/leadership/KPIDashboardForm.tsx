import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface KPIDashboardFormProps {
  value: string
  onChange: (value: string) => void
}

interface KPI {
  name: string
  description: string
  currentValue: string
  targetValue: string
  measurementFrequency: string
  dataSource: string
  actionPlan: string
}

interface KPIDashboardData {
  kpis: KPI[]
  dashboardDesign: string
  reviewProcess: string
  improvementStrategy: string
}

const KPIDashboardForm: React.FC<KPIDashboardFormProps> = ({ 
  value, 
  onChange
}) => {
  const [data, setData] = useState<KPIDashboardData>({
    kpis: [
      { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' },
      { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' },
      { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' },
      { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' },
      { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' }
    ],
    dashboardDesign: '',
    reviewProcess: '',
    improvementStrategy: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setData(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setData(prev => ({ ...prev, dashboardDesign: value }))
      }
    }
  }, [value])

  // Update parent component when data changes
  useEffect(() => {
    onChange(JSON.stringify(data))
  }, [data, onChange])

  const updateKPI = (index: number, field: keyof KPI, newValue: string) => {
    setData(prev => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) => 
        i === index ? { ...kpi, [field]: newValue } : kpi
      )
    }))
  }

  const updateData = (field: keyof Omit<KPIDashboardData, 'kpis'>, newValue: string) => {
    setData(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const addKPI = () => {
    setData(prev => ({
      ...prev,
      kpis: [...prev.kpis, { name: '', description: '', currentValue: '', targetValue: '', measurementFrequency: '', dataSource: '', actionPlan: '' }]
    }))
  }

  const removeKPI = (index: number) => {
    if (data.kpis.length > 1) {
      setData(prev => ({
        ...prev,
        kpis: prev.kpis.filter((_, i) => i !== index)
      }))
    }
  }

  const getCompletionPercentage = () => {
    const kpisComplete = data.kpis.filter(k => 
      k.name.trim() && k.description.trim() && k.currentValue.trim() && 
      k.targetValue.trim() && k.measurementFrequency.trim() && k.dataSource.trim() && k.actionPlan.trim()
    ).length
    const otherFieldsComplete = [data.dashboardDesign, data.reviewProcess, data.improvementStrategy]
      .filter(field => field.trim().length > 0).length
    
    const totalFields = data.kpis.length * 7 + 3
    const completedFields = kpisComplete * 7 + otherFieldsComplete
    
    return Math.round((completedFields / totalFields) * 100)
  }

  const suggestedKPIs = [
    'Customer Satisfaction Score',
    'Average Order Value',
    'Table Turnover Rate',
    'Food Cost Percentage',
    'Labor Cost Percentage',
    'Order Accuracy Rate',
    'Average Service Time'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-green-800">KPI Dashboard Creation</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Activity
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Suggested KPIs */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800">Suggested Restaurant KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {suggestedKPIs.map((kpi, index) => (
              <Badge key={index} variant="outline" className="text-blue-600 border-blue-300">
                {kpi}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Key Performance Indicators ({data.kpis.length})</h3>
          <Button
            onClick={addKPI}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add KPI
          </Button>
        </div>

        {data.kpis.map((kpi, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">KPI #{index + 1}</CardTitle>
                </div>
                {data.kpis.length > 1 && (
                  <Button
                    onClick={() => removeKPI(index)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                    KPI Name
                  </Label>
                  <Input
                    id={`name-${index}`}
                    placeholder="e.g., Customer Satisfaction Score"
                    value={kpi.name}
                    onChange={(e) => updateKPI(index, 'name', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`frequency-${index}`} className="text-sm font-medium">
                    Measurement Frequency
                  </Label>
                  <Input
                    id={`frequency-${index}`}
                    placeholder="e.g., Daily, Weekly, Monthly"
                    value={kpi.measurementFrequency}
                    onChange={(e) => updateKPI(index, 'measurementFrequency', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                  Description & Why It Matters
                </Label>
                <Textarea
                  id={`description-${index}`}
                  placeholder="Describe what this KPI measures and why it's important for your restaurant..."
                  value={kpi.description}
                  onChange={(e) => updateKPI(index, 'description', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`current-${index}`} className="text-sm font-medium">
                    Current Performance
                  </Label>
                  <Input
                    id={`current-${index}`}
                    placeholder="e.g., 4.2/5, 85%, $25"
                    value={kpi.currentValue}
                    onChange={(e) => updateKPI(index, 'currentValue', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`target-${index}`} className="text-sm font-medium">
                    Target Value
                  </Label>
                  <Input
                    id={`target-${index}`}
                    placeholder="e.g., 4.5/5, 95%, $30"
                    value={kpi.targetValue}
                    onChange={(e) => updateKPI(index, 'targetValue', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`source-${index}`} className="text-sm font-medium">
                  Data Source & Collection Method
                </Label>
                <Textarea
                  id={`source-${index}`}
                  placeholder="How will you collect this data? (POS system, surveys, manual tracking, etc.)"
                  value={kpi.dataSource}
                  onChange={(e) => updateKPI(index, 'dataSource', e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`action-${index}`} className="text-sm font-medium">
                  Action Plan for Improvement
                </Label>
                <Textarea
                  id={`action-${index}`}
                  placeholder="What specific actions will you take to improve this KPI?"
                  value={kpi.actionPlan}
                  onChange={(e) => updateKPI(index, 'actionPlan', e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Design */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Dashboard Design & Layout</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="dashboardDesign" className="text-sm font-medium">
            How will you design and organize your KPI dashboard?
          </Label>
          <Textarea
            id="dashboardDesign"
            placeholder="Describe your dashboard layout, visualization methods (charts, graphs, tables), and how you'll make it easy to read and understand..."
            value={data.dashboardDesign}
            onChange={(e) => updateData('dashboardDesign', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Review Process */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Regular Review Process</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="reviewProcess" className="text-sm font-medium">
            How will you regularly review and discuss these KPIs with your team?
          </Label>
          <Textarea
            id="reviewProcess"
            placeholder="Describe your review schedule, team meetings, discussion format, and how you'll use KPIs to drive decisions..."
            value={data.reviewProcess}
            onChange={(e) => updateData('reviewProcess', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Improvement Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Continuous Improvement Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvementStrategy" className="text-sm font-medium">
            How will you use these KPIs to drive continuous improvement?
          </Label>
          <Textarea
            id="improvementStrategy"
            placeholder="Describe how you'll identify trends, set improvement goals, track progress, and celebrate successes..."
            value={data.improvementStrategy}
            onChange={(e) => updateData('improvementStrategy', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default KPIDashboardForm
