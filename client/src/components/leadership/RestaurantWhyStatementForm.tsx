import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Heart, 
  Target, 
  Users, 
  Star,
  CheckCircle,
  ChevronDown,
  MessageSquare,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface RestaurantWhyStatementFormProps {
  value: string
  onChange: (value: string) => void
}

const RestaurantWhyStatementForm: React.FC<RestaurantWhyStatementFormProps> = ({ value, onChange }) => {
  const [purposeStatement, setPurposeStatement] = useState<string>('')
  const [impactOnGuests, setImpactOnGuests] = useState<string>('')
  const [impactOnCommunity, setImpactOnCommunity] = useState<string>('')
  const [teamMotivation, setTeamMotivation] = useState<string>('')
  const [whyStatement, setWhyStatement] = useState<string>('')
  const [teamFeedback, setTeamFeedback] = useState<string>('')
  const [refinedWhy, setRefinedWhy] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setPurposeStatement(parsedValue.purposeStatement || '')
        setImpactOnGuests(parsedValue.impactOnGuests || '')
        setImpactOnCommunity(parsedValue.impactOnCommunity || '')
        setTeamMotivation(parsedValue.teamMotivation || '')
        setWhyStatement(parsedValue.whyStatement || '')
        setTeamFeedback(parsedValue.teamFeedback || '')
        setRefinedWhy(parsedValue.refinedWhy || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the purpose statement
        setPurposeStatement(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      purposeStatement,
      impactOnGuests,
      impactOnCommunity,
      teamMotivation,
      whyStatement,
      teamFeedback,
      refinedWhy
    })
    onChange(formData)
  }, [purposeStatement, impactOnGuests, impactOnCommunity, teamMotivation, whyStatement, teamFeedback, refinedWhy, onChange])

  const getCompletionStatus = () => {
    const fields = [purposeStatement, impactOnGuests, impactOnCommunity, teamMotivation, whyStatement]
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const generateWhyStatement = () => {
    if (purposeStatement && impactOnGuests && teamMotivation) {
      const generated = `We exist to ${purposeStatement.toLowerCase()}. We believe that ${impactOnGuests.toLowerCase()}, and this drives us to ${teamMotivation.toLowerCase()}. Our purpose goes beyond serving food - we're here to ${impactOnCommunity.toLowerCase() || 'make a positive impact in our community'}.`
      setWhyStatement(generated)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5" />
          <p className="font-medium">Develop Your Restaurant's Why</p>
        </div>
        <p>Create a clear "Why" statement that goes beyond making money. Define the purpose that drives your team and the impact you want to have on guests and the community.</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Why Statement Progress</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getCompletionStatus()}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Step 1: Core Purpose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Step 1: Define Your Core Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="purpose-statement" className="text-sm font-medium">What is your restaurant's fundamental purpose?</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Examples</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Examples:</strong><br/>
                  • "Create moments of joy and connection through exceptional food and service"<br/>
                  • "Nourish our community with fresh, quality meals and genuine hospitality"<br/>
                  • "Bring families together around great food and memorable experiences"<br/>
                  • "Fuel people's lives with delicious, convenient meals that brighten their day"</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="purpose-statement"
              placeholder="Think beyond profit. What deeper purpose drives your restaurant? What do you exist to do for people?"
              value={purposeStatement}
              onChange={(e) => setPurposeStatement(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Impact on Guests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Step 2: Impact on Guests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="impact-guests" className="text-sm font-medium">
              How do you want guests to feel when they visit your restaurant?
            </Label>
            <Textarea
              id="impact-guests"
              placeholder="Describe the emotional impact you want to have on guests. How should they feel during and after their experience with you?"
              value={impactOnGuests}
              onChange={(e) => setImpactOnGuests(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Community Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Step 3: Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="impact-community" className="text-sm font-medium">
              What positive impact do you want to have on your community?
            </Label>
            <Textarea
              id="impact-community"
              placeholder="How does your restaurant contribute to the local community? What role do you play beyond serving food?"
              value={impactOnCommunity}
              onChange={(e) => setImpactOnCommunity(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Team Motivation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Step 4: What Drives Your Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-motivation" className="text-sm font-medium">
              What motivates your team members beyond their paycheck?
            </Label>
            <Textarea
              id="team-motivation"
              placeholder="What deeper purpose can team members connect with? How does working at your restaurant contribute to something meaningful?"
              value={teamMotivation}
              onChange={(e) => setTeamMotivation(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Create Why Statement */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Step 5: Craft Your Why Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={generateWhyStatement}
              disabled={!purposeStatement || !impactOnGuests || !teamMotivation}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Why Statement
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="why-statement" className="text-sm font-medium">
              Your Restaurant's Why Statement
            </Label>
            <Textarea
              id="why-statement"
              placeholder="Write or refine your restaurant's Why statement. This should be clear, inspiring, and memorable for both team members and guests."
              value={whyStatement}
              onChange={(e) => setWhyStatement(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Why Statement Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Keep it simple and memorable (1-2 sentences)</li>
              <li>• Focus on the impact you have on people</li>
              <li>• Make it emotional and inspiring</li>
              <li>• Avoid industry jargon or corporate speak</li>
              <li>• Test it with team members to ensure it resonates</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Team Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Step 6: Test with Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-feedback" className="text-sm font-medium">
              Share your Why statement with 2-3 team members. What was their feedback?
            </Label>
            <Textarea
              id="team-feedback"
              placeholder="Document the feedback you received:
• Who did you share it with?
• What was their initial reaction?
• Did it resonate with them?
• What suggestions did they have?
• How did they think guests would respond?"
              value={teamFeedback}
              onChange={(e) => setTeamFeedback(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 7: Final Refined Statement */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Step 7: Final Why Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refined-why" className="text-sm font-medium">
              Your Final, Refined Why Statement
            </Label>
            <Textarea
              id="refined-why"
              placeholder="Based on team feedback, write your final Why statement. This will guide your restaurant's culture and decision-making."
              value={refinedWhy}
              onChange={(e) => setRefinedWhy(e.target.value)}
              className="min-h-[100px] text-sm font-medium"
            />
          </div>

          <div className="bg-green-100 p-3 rounded-md text-sm text-green-800">
            <p className="font-medium mb-1">🎯 Next Steps:</p>
            <ul className="text-xs space-y-1">
              <li>• Share this Why statement with your entire team</li>
              <li>• Post it visibly in your restaurant</li>
              <li>• Reference it in team meetings and training</li>
              <li>• Use it to guide major decisions</li>
              <li>• Review and refine it annually</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RestaurantWhyStatementForm
