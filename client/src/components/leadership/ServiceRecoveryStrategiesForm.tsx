import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react'

interface ServiceRecoveryStrategiesFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ServiceRecoveryStrategiesForm({ value, onChange }: ServiceRecoveryStrategiesFormProps) {
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
      {/* LAST Method Understanding */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">LAST Method Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="lastMethod" className="text-sm font-medium">
            Explain the LAST method (Listen, Apologize, Solve, Thank) and how you'll apply it in your restaurant.
          </Label>
          <Textarea
            id="lastMethod"
            placeholder="Example: LISTEN - I'll train my team to give guests their full attention, make eye contact, and let them fully explain the issue without interrupting. APOLOGIZE - We'll offer sincere apologies that acknowledge the guest's feelings: 'I'm so sorry this happened and that you had to wait.' SOLVE - We'll empower team members to fix problems immediately - remake food, offer refunds, provide free items, or escalate to management. THANK - We'll thank guests for bringing issues to our attention and for giving us the chance to make it right..."
            value={formData.lastMethod || ''}
            onChange={(e) => updateField('lastMethod', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Common Service Failures */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">Common Service Failures & Solutions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="serviceFailures" className="text-sm font-medium">
            List 5 common service failures in your restaurant and specific recovery strategies for each.
          </Label>
          <Textarea
            id="serviceFailures"
            placeholder="Example: 1. Long wait times - Acknowledge immediately, provide time estimates, offer samples or drinks, check in every 5 minutes, consider priority seating for next visit. 2. Wrong order - Apologize sincerely, remake correctly immediately, offer to comp the item or provide discount, ensure guest is satisfied before leaving. 3. Cold food - Replace with hot food immediately, apologize for the inconvenience, offer dessert or drink on the house. 4. Rude service - Manager apologizes personally, retrain team member, offer significant gesture of goodwill. 5. Cleanliness issues - Address immediately, clean thoroughly, apologize, offer to move guest to different area..."
            value={formData.serviceFailures || ''}
            onChange={(e) => updateField('serviceFailures', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Empowerment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Team Empowerment Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEmpowerment" className="text-sm font-medium">
            How will you empower your team members to handle service recovery without always needing manager approval?
          </Label>
          <Textarea
            id="teamEmpowerment"
            placeholder="Example: I'll give each team member authority to comp items up to $15 without manager approval. They can offer free desserts, drinks, or appetizers to resolve complaints. I'll create clear guidelines: if a guest waits more than 10 minutes past quoted time, offer a free drink. If food is wrong or cold, remake immediately and offer 20% discount. I'll train team on when to escalate (angry guests, large groups, expensive items) vs. when to handle independently. We'll have weekly role-playing sessions to practice service recovery scenarios..."
            value={formData.teamEmpowerment || ''}
            onChange={(e) => updateField('teamEmpowerment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Follow-up Process */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Follow-up & Learning Process</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="followUpProcess" className="text-sm font-medium">
            Describe your process for following up on service failures and using them as learning opportunities.
          </Label>
          <Textarea
            id="followUpProcess"
            placeholder="Example: After any service failure, I'll personally follow up with the guest within 24-48 hours via phone or email to ensure they're satisfied with the resolution. I'll document all service failures in a log with details about what happened, how it was resolved, and what we learned. During weekly team meetings, we'll review service failures (without naming guests) to identify patterns and prevent future issues. I'll use failures as training opportunities - 'Here's what happened and here's how we can handle it better next time.' We'll track our service recovery success rate and celebrate improvements..."
            value={formData.followUpProcess || ''}
            onChange={(e) => updateField('followUpProcess', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
