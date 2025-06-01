import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Crown, Users, Target, Award } from 'lucide-react'

interface RitzCarltonServiceCultureFormProps {
  value: string
  onChange: (value: string) => void
}

export default function RitzCarltonServiceCultureForm({ value, onChange }: RitzCarltonServiceCultureFormProps) {
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
      {/* Key Principles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Ritz-Carlton Service Principles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="keyPrinciples" className="text-sm font-medium">
            What were the most important service culture principles you learned from Horst Schulze?
          </Label>
          <Textarea
            id="keyPrinciples"
            placeholder="Example: 1. 'We are Ladies and Gentlemen serving Ladies and Gentlemen' - Every team member and guest deserves respect and dignity. 2. Service standards must be specific and measurable - Vague expectations lead to inconsistent results. 3. Empower employees to solve problems immediately - Give team members authority to spend up to $2,000 to resolve guest issues without manager approval. 4. Hire for attitude, train for skill - Technical skills can be taught, but genuine care for others cannot. 5. Create emotional connections, not just transactions - Guests remember how you made them feel..."
            value={formData.keyPrinciples || ''}
            onChange={(e) => updateField('keyPrinciples', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Service Standards Application */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Applying Ritz-Carlton Standards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="serviceStandards" className="text-sm font-medium">
            How will you adapt Ritz-Carlton's service standards to your restaurant environment?
          </Label>
          <Textarea
            id="serviceStandards"
            placeholder="Example: 1. 10-Foot Rule - When team members come within 10 feet of a guest, they make eye contact and smile. In our restaurant: Acknowledge every guest within 10 feet with eye contact, smile, and verbal greeting. 2. Anticipate Guest Needs - Notice when guests need refills, napkins, or assistance before they ask. In our restaurant: Proactively offer sauce packets, check on food temperature, notice families with children who might need high chairs. 3. Create Memorable Moments - Go beyond expectations to surprise guests. In our restaurant: Remember regular customers' orders, celebrate birthdays with special treats, offer umbrellas on rainy days..."
            value={formData.serviceStandards || ''}
            onChange={(e) => updateField('serviceStandards', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Team Empowerment Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Team Empowerment & Training</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEmpowerment" className="text-sm font-medium">
            How will you empower and train your team to deliver Ritz-Carlton level service?
          </Label>
          <Textarea
            id="teamEmpowerment"
            placeholder="Example: 1. Empowerment Guidelines - Give each team member authority to comp meals up to $25, offer free desserts/drinks, or provide gift cards for service failures without manager approval. 2. Daily Service Training - Start each shift with 5-minute service story or training moment, share guest compliments, practice service scenarios. 3. Recognition Program - Celebrate team members who demonstrate exceptional service with specific examples, create 'Service Star' awards for outstanding guest interactions. 4. Hiring for Service Attitude - Ask interview questions about helping others, look for genuine smiles and positive energy, prioritize character over experience..."
            value={formData.teamEmpowerment || ''}
            onChange={(e) => updateField('teamEmpowerment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">90-Day Implementation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="implementationPlan" className="text-sm font-medium">
            Create a specific 90-day plan to implement Ritz-Carlton service culture principles in your restaurant
          </Label>
          <Textarea
            id="implementationPlan"
            placeholder="Example: Days 1-30: Establish Foundation - Introduce service philosophy to team, implement daily service huddles, create service standards document, begin recognition program. Days 31-60: Build Skills - Conduct weekly service training sessions, practice service scenarios, implement guest feedback system, start measuring service metrics. Days 61-90: Refine & Sustain - Analyze guest feedback data, adjust service standards based on results, celebrate service wins, create ongoing training schedule. Throughout: Model service behaviors personally, recognize exceptional service daily, address service failures immediately, track guest satisfaction improvements..."
            value={formData.implementationPlan || ''}
            onChange={(e) => updateField('implementationPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
