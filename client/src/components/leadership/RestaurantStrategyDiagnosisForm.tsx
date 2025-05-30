import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Target, TrendingDown, AlertTriangle } from 'lucide-react'

interface RestaurantStrategyDiagnosisFormProps {
  value: string
  onChange: (value: string) => void
}

const RestaurantStrategyDiagnosisForm: React.FC<RestaurantStrategyDiagnosisFormProps> = ({ value, onChange }) => {
  const [keyChallenges, setKeyChallenges] = useState<string>('')
  const [competitivePosition, setCompetitivePosition] = useState<string>('')
  const [operationalChallenges, setOperationalChallenges] = useState<string>('')
  const [marketOpportunities, setMarketOpportunities] = useState<string>('')
  const [rootCause, setRootCause] = useState<string>('')
  const [strategicDiagnosis, setStrategicDiagnosis] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setKeyChallenges(parsedValue.keyChallenges || '')
        setCompetitivePosition(parsedValue.competitivePosition || '')
        setOperationalChallenges(parsedValue.operationalChallenges || '')
        setMarketOpportunities(parsedValue.marketOpportunities || '')
        setRootCause(parsedValue.rootCause || '')
        setStrategicDiagnosis(parsedValue.strategicDiagnosis || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setKeyChallenges(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      keyChallenges,
      competitivePosition,
      operationalChallenges,
      marketOpportunities,
      rootCause,
      strategicDiagnosis
    })
    onChange(formData)
  }, [keyChallenges, competitivePosition, operationalChallenges, marketOpportunities, rootCause, strategicDiagnosis, onChange])

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">Strategic Diagnosis Framework</p>
        <p>A good strategic diagnosis identifies the key challenges and opportunities your restaurant faces. This forms the foundation for developing effective strategy.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Key Challenges Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="key-challenges" className="text-xs font-medium">What are the 3 most significant challenges your restaurant currently faces?</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Examples</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Examples:</strong><br/>
                  • High team member turnover (30% annually)<br/>
                  • Inconsistent service quality during peak hours<br/>
                  • Rising food costs impacting profitability<br/>
                  • Competition from new restaurants in the area<br/>
                  • Difficulty maintaining standards across all shifts</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="key-challenges"
              placeholder="1. Challenge one and its impact...
2. Challenge two and its impact...
3. Challenge three and its impact..."
              value={keyChallenges}
              onChange={(e) => setKeyChallenges(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Competitive Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="competitive-position" className="text-xs font-medium">How does your restaurant compare to direct competitors?</Label>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Framework</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Consider:</strong><br/>
                  • Service speed and quality vs. competitors<br/>
                  • Menu variety and pricing<br/>
                  • Location advantages/disadvantages<br/>
                  • Brand reputation and customer loyalty<br/>
                  • Team member experience and retention</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="competitive-position"
              placeholder="Analyze your strengths and weaknesses relative to your top 3 competitors..."
              value={competitivePosition}
              onChange={(e) => setCompetitivePosition(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Operational Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="operational-challenges" className="text-xs font-medium">What operational issues are limiting your restaurant's performance?</Label>
            <Textarea
              id="operational-challenges"
              placeholder="Identify specific operational bottlenecks, process issues, or resource constraints..."
              value={operationalChallenges}
              onChange={(e) => setOperationalChallenges(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Market Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="market-opportunities" className="text-xs font-medium">What external opportunities could your restaurant leverage?</Label>
            <Textarea
              id="market-opportunities"
              placeholder="Consider market trends, customer needs, competitor weaknesses, or external factors you could capitalize on..."
              value={marketOpportunities}
              onChange={(e) => setMarketOpportunities(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Root Cause Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="root-cause" className="text-xs font-medium">What is the underlying root cause of your biggest challenge?</Label>
            <Textarea
              id="root-cause"
              placeholder="Use the '5 Whys' technique to dig deeper into the root cause of your most significant challenge..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-700">Strategic Diagnosis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="strategic-diagnosis" className="text-xs font-medium">Based on your analysis above, write a clear strategic diagnosis of your restaurant's current situation:</Label>
            <Textarea
              id="strategic-diagnosis"
              placeholder="In 2-3 paragraphs, summarize the key challenges, competitive position, and opportunities that define your restaurant's strategic situation..."
              value={strategicDiagnosis}
              onChange={(e) => setStrategicDiagnosis(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
          <div className="bg-yellow-50 p-2 rounded-md text-xs text-yellow-800">
            <p><strong>Tip:</strong> A good strategic diagnosis is specific, actionable, and identifies the most critical issues that need to be addressed for your restaurant to succeed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RestaurantStrategyDiagnosisForm
