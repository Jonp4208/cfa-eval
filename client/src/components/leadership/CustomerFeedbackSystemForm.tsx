import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Users, BarChart, RefreshCw } from 'lucide-react'

interface CustomerFeedbackSystemFormProps {
  value: string
  onChange: (value: string) => void
}

export default function CustomerFeedbackSystemForm({ value, onChange }: CustomerFeedbackSystemFormProps) {
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
      {/* System Implementation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Feedback System Setup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="systemSetup" className="text-sm font-medium">
            Describe the specific feedback system you implemented and how it works
          </Label>
          <Textarea
            id="systemSetup"
            placeholder="Example: 1. Digital Platform - Set up Google Forms survey with QR code printed on receipts, created 5-question survey covering food quality, service speed, cleanliness, team friendliness, and likelihood to return. 2. Physical Collection - Placed comment cards at each table and counter area, installed suggestion box near exit with weekly prize drawing for participants. 3. Social Media Monitoring - Set up Google Alerts for restaurant name, created daily routine to check Google Reviews, Facebook, and Instagram mentions. 4. Staff Training - Trained team to ask 'How was your experience today?' and note verbal feedback in daily log. 5. Response System - Created templates for responding to online reviews within 24 hours..."
            value={formData.systemSetup || ''}
            onChange={(e) => updateField('systemSetup', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Initial Results Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Initial Feedback Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="initialResults" className="text-sm font-medium">
            What were the key findings from your initial feedback collection period?
          </Label>
          <Textarea
            id="initialResults"
            placeholder="Example: 1. Response Rate - Received 47 digital survey responses and 23 comment cards in first month, 4.2/5.0 average satisfaction score. 2. Top Strengths - 89% rated food quality as excellent, 85% praised team friendliness, 78% appreciated cleanliness. 3. Improvement Areas - 34% mentioned longer wait times than expected, 28% wanted more menu variety, 19% suggested better mobile order pickup process. 4. Specific Compliments - 12 customers mentioned team member Sarah by name for exceptional service, 8 praised manager's problem-solving skills. 5. Actionable Complaints - 6 customers reported cold food, 4 mentioned dirty restrooms during peak hours, 3 had issues with mobile order accuracy..."
            value={formData.initialResults || ''}
            onChange={(e) => updateField('initialResults', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Action Plans Created */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Action Plans from Feedback</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="actionPlans" className="text-sm font-medium">
            What specific action plans did you create based on the feedback received?
          </Label>
          <Textarea
            id="actionPlans"
            placeholder="Example: 1. Wait Time Improvement - Implemented order time tracking system, added team member during peak hours, created 'order ready' notification system to reduce perceived wait times. 2. Mobile Order Enhancement - Designated parking spots for mobile orders, trained team on mobile order priority system, created pickup window with clear signage. 3. Food Temperature Standards - Implemented food temperature checks every 30 minutes, retrained kitchen team on holding procedures, added heat lamps for fries. 4. Restroom Maintenance - Increased cleaning schedule to every 30 minutes during peak hours, assigned specific team member responsibility, added cleaning log checklist. 5. Team Recognition - Created 'Customer Compliment Board' to celebrate team members mentioned in positive feedback..."
            value={formData.actionPlans || ''}
            onChange={(e) => updateField('actionPlans', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Ongoing System Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">System Maintenance & Evolution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="systemMaintenance" className="text-sm font-medium">
            How will you maintain and improve your feedback system over time?
          </Label>
          <Textarea
            id="systemMaintenance"
            placeholder="Example: 1. Weekly Review Process - Every Friday, compile all feedback sources, analyze trends, identify action items for following week. 2. Monthly System Updates - Review survey questions for relevance, update QR codes if needed, refresh comment card design, analyze response rates. 3. Quarterly Deep Dive - Comprehensive analysis of feedback trends, comparison to previous quarters, adjustment of action plans, team feedback on system effectiveness. 4. Technology Improvements - Explore new feedback platforms, consider tablet-based surveys, integrate with POS system for automatic feedback requests. 5. Team Involvement - Train new team members on feedback importance, include feedback discussion in monthly team meetings, recognize team members who generate positive feedback..."
            value={formData.systemMaintenance || ''}
            onChange={(e) => updateField('systemMaintenance', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
