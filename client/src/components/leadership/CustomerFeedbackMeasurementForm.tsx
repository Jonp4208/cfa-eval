import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BarChart3, MessageCircle, TrendingUp, Target } from 'lucide-react'

interface CustomerFeedbackMeasurementFormProps {
  value: string
  onChange: (value: string) => void
}

export default function CustomerFeedbackMeasurementForm({ value, onChange }: CustomerFeedbackMeasurementFormProps) {
  const parseValue = (val: string) => {
    try {
      return JSON.parse(val || '{}')
    } catch {
      return {}
    }
  }

  const formData = parseValue(value)

  const updateField = (field: string, fieldValue: string) => {
    const updated = { ...formData, [field]: fieldValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-4">
      {/* Feedback Collection Methods */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Feedback Collection Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="collectionMethods" className="text-sm font-medium">
            What methods will you use to collect customer feedback in your restaurant?
          </Label>
          <Textarea
            id="collectionMethods"
            placeholder="Example: 1. Digital Surveys - QR codes on receipts linking to 2-minute survey, email follow-ups for catering orders, app-based feedback after mobile orders. 2. Comment Cards - Physical cards at tables and counter, suggestion box near exit, multilingual options available. 3. Social Media Monitoring - Daily checks of Google reviews, Facebook comments, Instagram mentions, respond within 24 hours. 4. Direct Conversations - Train team to ask 'How was everything?' during service, manager table visits during peak times, exit interviews for dissatisfied guests. 5. Mystery Shopping - Monthly professional evaluations, quarterly family/friend visits with feedback forms..."
            value={formData.collectionMethods || ''}
            onChange={(e) => updateField('collectionMethods', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Key Metrics to Track */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Customer Experience Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyMetrics" className="text-sm font-medium">
            What specific metrics will you track to measure customer experience success?
          </Label>
          <Textarea
            id="keyMetrics"
            placeholder="Example: 1. Overall Satisfaction Score - Target 4.5/5.0 stars across all platforms, track monthly trends, benchmark against competitors. 2. Net Promoter Score (NPS) - Survey question: 'How likely are you to recommend us?' Target score above 70. 3. Service Speed Metrics - Average order time, drive-thru times, dine-in service speed, track against standards. 4. Complaint Resolution Rate - Percentage of complaints resolved within 24 hours, customer satisfaction after resolution. 5. Repeat Customer Rate - Track loyalty program usage, frequency of visits, customer retention over time. 6. Team Member Recognition - Number of positive guest comments about specific team members..."
            value={formData.keyMetrics || ''}
            onChange={(e) => updateField('keyMetrics', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Analysis & Action Process */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Feedback Analysis & Response</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="analysisProcess" className="text-sm font-medium">
            How will you analyze feedback data and turn insights into actionable improvements?
          </Label>
          <Textarea
            id="analysisProcess"
            placeholder="Example: 1. Weekly Review Process - Compile all feedback sources every Friday, identify trends and patterns, categorize by operational area (food quality, service speed, cleanliness, etc.). 2. Root Cause Analysis - For recurring complaints, use 5 Whys technique to identify underlying causes, involve team members in problem-solving discussions. 3. Action Planning - Create specific improvement plans with timelines, assign ownership to team members, set measurable goals for improvement. 4. Communication Loop - Share feedback insights with team during huddles, celebrate positive comments, address concerns transparently. 5. Follow-up System - Re-contact customers who had negative experiences to ensure resolution, track improvement in subsequent feedback..."
            value={formData.analysisProcess || ''}
            onChange={(e) => updateField('analysisProcess', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Continuous Improvement Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Continuous Improvement Implementation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvementPlan" className="text-sm font-medium">
            Describe your systematic approach to using feedback for continuous improvement
          </Label>
          <Textarea
            id="improvementPlan"
            placeholder="Example: 1. Monthly Improvement Initiatives - Select top 3 feedback themes each month, create specific action plans, implement changes with team input. 2. Feedback Dashboard - Create visual display of key metrics, update weekly, share with all team members to maintain focus on customer experience. 3. Team Involvement - Include team members in feedback review sessions, encourage suggestions for improvements, recognize team members who implement successful changes. 4. Customer Communication - Post signs about improvements made based on feedback, thank customers for suggestions, show that their input matters. 5. Measurement & Validation - Track metrics before and after changes, survey customers about improvements, adjust strategies based on results..."
            value={formData.improvementPlan || ''}
            onChange={(e) => updateField('improvementPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
