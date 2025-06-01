import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Clock, MessageSquare, Star } from 'lucide-react'

interface ServiceStandardsDevelopmentFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ServiceStandardsDevelopmentForm({ value, onChange }: ServiceStandardsDevelopmentFormProps) {
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
      {/* Greeting Standards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Greeting & Welcome Standards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="greetingStandards" className="text-sm font-medium">
            Define specific, measurable greeting protocols for your restaurant
          </Label>
          <Textarea
            id="greetingStandards"
            placeholder="Example: 1. 10-Second Rule - Every guest acknowledged within 10 seconds of entry with eye contact and smile, even if serving other customers. 2. Verbal Greeting - 'Welcome to Chick-fil-A! How can I serve you today?' or 'Good [morning/afternoon], welcome to Chick-fil-A!' 3. Body Language - Face the guest, make eye contact, smile genuinely, stand up straight. 4. Busy Period Protocol - If unable to take order immediately, acknowledge guest and provide time estimate: 'I'll be right with you in just one moment.' 5. Repeat Customers - Attempt to greet regular customers by name when possible..."
            value={formData.greetingStandards || ''}
            onChange={(e) => updateField('greetingStandards', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Response Time Standards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Response Time & Service Speed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="responseTimeStandards" className="text-sm font-medium">
            Set specific time standards for various service touchpoints
          </Label>
          <Textarea
            id="responseTimeStandards"
            placeholder="Example: 1. Order Taking - Begin taking order within 30 seconds of guest reaching counter. 2. Food Preparation - Target 90 seconds for most menu items, 3 minutes maximum for any order. 3. Order Delivery - Deliver food within 2 minutes of completion, call order number clearly. 4. Guest Check-ins - Check on dine-in guests within 2 minutes of food delivery. 5. Problem Resolution - Address any guest concern within 1 minute of being notified. 6. Phone Answering - Answer phone within 3 rings with 'Thank you for calling Chick-fil-A, this is [name], how can I help you?'"
            value={formData.responseTimeStandards || ''}
            onChange={(e) => updateField('responseTimeStandards', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Quality Standards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Food & Service Quality Standards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="qualityStandards" className="text-sm font-medium">
            Define quality expectations for food preparation and service delivery
          </Label>
          <Textarea
            id="qualityStandards"
            placeholder="Example: 1. Food Temperature - All hot food served at 140°F or above, cold items at 40°F or below, check with thermometer hourly. 2. Food Presentation - Sandwiches wrapped neatly, fries filled to top of container, sauces included without asking. 3. Order Accuracy - 99% accuracy target, double-check all orders before delivery, confirm special requests. 4. Cleanliness - Dining area cleaned every 30 minutes, restrooms checked hourly, team members wash hands every 30 minutes. 5. Appearance - Uniforms clean and pressed, name tags visible, hair properly restrained, friendly facial expressions..."
            value={formData.qualityStandards || ''}
            onChange={(e) => updateField('qualityStandards', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Training & Implementation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Training & Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="trainingPlan" className="text-sm font-medium">
            Describe how you will train your team on these standards and ensure consistent implementation
          </Label>
          <Textarea
            id="trainingPlan"
            placeholder="Example: 1. Initial Training - Conduct 2-hour service standards workshop for all team members, provide written standards document, practice role-playing scenarios. 2. Daily Reinforcement - Review one service standard during each shift huddle, share positive examples, address any gaps immediately. 3. Monitoring System - Use mystery shoppers monthly, conduct manager observations daily, track service metrics weekly. 4. Recognition Program - Celebrate team members who consistently meet standards, share guest compliments publicly, provide incentives for exceptional service. 5. Ongoing Development - Monthly refresher training, quarterly standards review and updates, annual service excellence awards..."
            value={formData.trainingPlan || ''}
            onChange={(e) => updateField('trainingPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
