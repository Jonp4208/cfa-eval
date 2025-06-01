import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Users, Target, TrendingUp } from 'lucide-react'

interface CustomerExperienceExcellenceFormProps {
  value: string
  onChange: (value: string) => void
}

export default function CustomerExperienceExcellenceForm({ value, onChange }: CustomerExperienceExcellenceFormProps) {
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
      {/* Key Insights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Key Customer Experience Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyInsights" className="text-sm font-medium">
            What were the 3 most important insights about creating exceptional customer experiences?
          </Label>
          <Textarea
            id="keyInsights"
            placeholder="Example: 1. Customer experience is about emotions, not just transactions - making guests feel valued and appreciated creates lasting loyalty. 2. Every touchpoint matters - from parking lot to payment, each interaction shapes the overall experience. 3. Empowering team members to solve problems immediately prevents small issues from becoming big complaints..."
            value={formData.keyInsights || ''}
            onChange={(e) => updateField('keyInsights', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Service Culture Elements */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Building Service Culture</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="serviceCulture" className="text-sm font-medium">
            How will you build a service-focused culture in your restaurant? What specific actions will you take?
          </Label>
          <Textarea
            id="serviceCulture"
            placeholder="Example: I will start by modeling exceptional service behaviors myself - greeting every guest warmly, remembering regular customers' preferences, and going above and beyond to solve problems. I'll implement daily huddles to share guest compliments and service wins. We'll create service standards like '30-second greeting rule' and 'always say yes or offer alternatives.' I'll recognize team members who demonstrate outstanding service with specific examples during shift meetings..."
            value={formData.serviceCulture || ''}
            onChange={(e) => updateField('serviceCulture', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Customer Journey Improvements */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Customer Journey Enhancement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="journeyImprovements" className="text-sm font-medium">
            Identify 3 specific touchpoints in your restaurant's customer journey that you can improve immediately.
          </Label>
          <Textarea
            id="journeyImprovements"
            placeholder="Example: 1. Arrival Experience - Train team to acknowledge guests within 10 seconds of entry, even if busy. Add welcome signage and ensure lobby is always clean and inviting. 2. Ordering Process - Implement suggestive selling training to help guests discover menu items they'll love. Ensure team knows ingredients for allergy questions. 3. Wait Time Management - Create system to update guests on wait times, offer samples during delays, and have team check on waiting guests every 3-5 minutes..."
            value={formData.journeyImprovements || ''}
            onChange={(e) => updateField('journeyImprovements', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">30-Day Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a specific 30-day plan to implement these customer experience improvements in your restaurant.
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Example: Week 1: Conduct team training on new service standards, implement daily huddles, begin tracking guest compliments. Week 2: Launch '30-second greeting' initiative, start mystery shopper program, create guest feedback system. Week 3: Implement suggestive selling training, establish wait time communication protocols, begin weekly service awards. Week 4: Review guest feedback data, adjust processes based on results, plan ongoing training schedule. Daily: Model service behaviors, recognize great service, address service failures immediately..."
            value={formData.implementationPlan || ''}
            onChange={(e) => updateField('implementationPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
