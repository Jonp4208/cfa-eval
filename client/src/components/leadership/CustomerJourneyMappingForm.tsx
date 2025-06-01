import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Clock, Star, TrendingUp } from 'lucide-react'

interface CustomerJourneyMappingFormProps {
  value: string
  onChange: (value: string) => void
}

export default function CustomerJourneyMappingForm({ value, onChange }: CustomerJourneyMappingFormProps) {
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
      {/* Pre-Arrival Stage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Pre-Arrival Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="preArrival" className="text-sm font-medium">
            Map the customer journey before they arrive (online research, ordering, parking, etc.)
          </Label>
          <Textarea
            id="preArrival"
            placeholder="Example: 1. Online Research - Customer sees our website/social media, reads reviews, checks menu and hours. Opportunity: Ensure website is mobile-friendly with clear menu, photos, and easy ordering. 2. Mobile Ordering - Customer places order through app. Opportunity: Streamline app interface, offer personalized recommendations. 3. Parking - Customer arrives and looks for parking. Opportunity: Clear signage, designated mobile order pickup spots, team member directing traffic during busy times..."
            value={formData.preArrival || ''}
            onChange={(e) => updateField('preArrival', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Arrival & Greeting */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Arrival & First Impression</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="arrival" className="text-sm font-medium">
            Detail the arrival experience from entering the parking lot to being greeted
          </Label>
          <Textarea
            id="arrival"
            placeholder="Example: 1. Exterior Approach - Customer sees building, signage, cleanliness of exterior. Opportunity: Fresh landscaping, clean windows, welcoming signage. 2. Entry - Customer opens door, first visual impression of interior. Opportunity: Ensure lobby is clean, well-lit, with pleasant music and aroma. 3. Initial Greeting - Team member acknowledges customer within 10 seconds. Opportunity: Train all team members to make eye contact, smile genuinely, and use welcoming language like 'Welcome to Chick-fil-A! How can I serve you today?'"
            value={formData.arrival || ''}
            onChange={(e) => updateField('arrival', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Ordering Process */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Ordering Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="ordering" className="text-sm font-medium">
            Map the ordering process from menu review to payment completion
          </Label>
          <Textarea
            id="ordering"
            placeholder="Example: 1. Menu Review - Customer looks at menu boards or mobile app. Opportunity: Clear, appetizing photos, easy-to-read descriptions, highlight popular items. 2. Order Taking - Team member takes order, suggests additions. Opportunity: Train suggestive selling, ask about sauces/drinks, confirm order accuracy. 3. Payment - Customer pays and receives receipt. Opportunity: Explain wait time, offer table tent with number, thank customer by name. 4. Wait Management - Customer waits for order. Opportunity: Provide accurate time estimates, offer samples during delays, check in every 3-5 minutes..."
            value={formData.ordering || ''}
            onChange={(e) => updateField('ordering', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Service & Dining */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Service & Dining Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="serviceDining" className="text-sm font-medium">
            Detail the service delivery and dining experience through departure
          </Label>
          <Textarea
            id="serviceDining"
            placeholder="Example: 1. Order Delivery - Food is brought to customer or called for pickup. Opportunity: Deliver with smile, confirm order accuracy, offer condiments/napkins. 2. Dining Experience - Customer eats meal (dine-in). Opportunity: Check back within 2 minutes, refill drinks proactively, clear empty trays. 3. Problem Resolution - If issues arise, how are they handled? Opportunity: Empower team to fix problems immediately, follow up to ensure satisfaction. 4. Departure - Customer leaves restaurant. Opportunity: Thank them personally, invite them back, hold door open, ensure they have everything..."
            value={formData.serviceDining || ''}
            onChange={(e) => updateField('serviceDining', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Improvement Opportunities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Top 5 Improvement Opportunities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvements" className="text-sm font-medium">
            Identify the 5 most impactful improvements you can make to enhance the customer journey
          </Label>
          <Textarea
            id="improvements"
            placeholder="Example: 1. Implement 10-second greeting standard - Every customer acknowledged within 10 seconds of entry, even during rush. 2. Create mobile order pickup experience - Dedicated parking spots, clear signage, expedited service for app orders. 3. Enhance wait time communication - Provide accurate estimates, offer samples for delays over 5 minutes, proactive updates. 4. Improve suggestive selling - Train team on menu knowledge, recommend popular items, ask about meal completion. 5. Develop departure ritual - Personal thank you, invitation to return, ensure customer satisfaction before leaving..."
            value={formData.improvements || ''}
            onChange={(e) => updateField('improvements', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
