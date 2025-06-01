import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Star, Users, Lightbulb } from 'lucide-react'

interface HospitalityCultureFormProps {
  value: string
  onChange: (value: string) => void
}

export default function HospitalityCultureForm({ value, onChange }: HospitalityCultureFormProps) {
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
      {/* Service vs Hospitality */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Service vs. Hospitality Understanding</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="serviceVsHospitality" className="text-sm font-medium">
            Explain the difference between service and hospitality, and how this applies to your restaurant.
          </Label>
          <Textarea
            id="serviceVsHospitality"
            placeholder="Example: Service is the technical execution - taking orders correctly, delivering food promptly, processing payments efficiently. Hospitality is the emotional connection - making guests feel welcomed, valued, and cared for. In our restaurant, service means getting the order right and fast. Hospitality means remembering a regular customer's usual order, asking about their family, or surprising a child with a special treat. Service meets expectations; hospitality exceeds them and creates emotional memories that bring guests back..."
            value={formData.serviceVsHospitality || ''}
            onChange={(e) => updateField('serviceVsHospitality', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Unreasonable Hospitality Examples */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Unreasonable Hospitality Ideas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="unreasonableHospitality" className="text-sm font-medium">
            List 5 'unreasonable hospitality' gestures you could implement in your restaurant to create memorable experiences.
          </Label>
          <Textarea
            id="unreasonableHospitality"
            placeholder="Example: 1. Birthday Surprise - When guests mention it's someone's birthday, bring out a special dessert with sparkler and have the whole team sing. 2. Weather Care - On rainy days, offer umbrellas to guests without one, or hot chocolate to kids who got caught in the rain. 3. Local Connection - For out-of-town guests, provide a handwritten list of local attractions and hidden gems. 4. Celebration Recognition - Notice anniversary couples and offer a complimentary appetizer or dessert. 5. Comfort Gestures - For guests with crying babies, offer a quiet booth and bring extra napkins and wet wipes without being asked..."
            value={formData.unreasonableHospitality || ''}
            onChange={(e) => updateField('unreasonableHospitality', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Training Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Hospitality Training Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="trainingStrategy" className="text-sm font-medium">
            How will you train your team to shift from a service mindset to a hospitality mindset?
          </Label>
          <Textarea
            id="trainingStrategy"
            placeholder="Example: I'll start with storytelling - sharing examples of great hospitality experiences and how they made people feel. We'll role-play scenarios where team members practice going beyond basic service. I'll teach the 'Yes, and...' approach - instead of just fulfilling requests, look for ways to add unexpected value. We'll have weekly 'hospitality challenges' where team members share creative ways they made guests feel special. I'll model hospitality behaviors myself and recognize team members who demonstrate genuine care for guests. We'll discuss the difference between scripted service and authentic hospitality..."
            value={formData.trainingStrategy || ''}
            onChange={(e) => updateField('trainingStrategy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Action Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Hospitality Culture Implementation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a specific action plan for building a hospitality-focused culture in your restaurant over the next 60 days.
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Example: Week 1-2: Introduce hospitality concept to team, share Will Guidara's examples, begin daily hospitality stories in huddles. Week 3-4: Implement 'guest delight fund' - $50/week budget for team to create special moments. Week 5-6: Launch 'hospitality hero' recognition program, start tracking guest compliments about team members. Week 7-8: Create guest memory system to track preferences and special occasions. Throughout: Model hospitality behaviors daily, celebrate hospitality wins in team meetings, adjust processes that prevent team from being hospitable, measure guest satisfaction and loyalty improvements..."
            value={formData.implementationPlan || ''}
            onChange={(e) => updateField('implementationPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
