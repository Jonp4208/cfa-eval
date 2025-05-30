import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, TrendingUp, AlertTriangle, Target, Shield } from 'lucide-react'

interface RestaurantSWOTAnalysisFormProps {
  value: string
  onChange: (value: string) => void
}

const RestaurantSWOTAnalysisForm: React.FC<RestaurantSWOTAnalysisFormProps> = ({ value, onChange }) => {
  const [strengths, setStrengths] = useState<string>('')
  const [weaknesses, setWeaknesses] = useState<string>('')
  const [opportunities, setOpportunities] = useState<string>('')
  const [threats, setThreats] = useState<string>('')
  const [teamInput, setTeamInput] = useState<string>('')
  const [keyInsights, setKeyInsights] = useState<string>('')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        setStrengths(parsedValue.strengths || '')
        setWeaknesses(parsedValue.weaknesses || '')
        setOpportunities(parsedValue.opportunities || '')
        setThreats(parsedValue.threats || '')
        setTeamInput(parsedValue.teamInput || '')
        setKeyInsights(parsedValue.keyInsights || '')
      } catch (e) {
        // If parsing fails, use the value as-is for the first field
        setStrengths(value)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      strengths,
      weaknesses,
      opportunities,
      threats,
      teamInput,
      keyInsights
    })
    onChange(formData)
  }, [strengths, weaknesses, opportunities, threats, teamInput, keyInsights, onChange])

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">SWOT Analysis Framework</p>
        <p>Analyze your restaurant's internal Strengths and Weaknesses, and external Opportunities and Threats to identify strategic priorities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Strengths (Internal Positives)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="strengths" className="text-xs font-medium">What does your restaurant do well?</Label>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>Examples</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-green-50 p-2 rounded-md text-xs text-green-800 mt-1 mb-2">
                    <p><strong>Examples:</strong><br/>
                    • Exceptional customer service<br/>
                    • Prime location with high foot traffic<br/>
                    • Strong team member retention<br/>
                    • Efficient kitchen operations<br/>
                    • Strong brand reputation<br/>
                    • Consistent food quality</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="strengths"
                placeholder="List your restaurant's key strengths and competitive advantages..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Weaknesses (Internal Negatives)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="weaknesses" className="text-xs font-medium">What areas need improvement?</Label>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>Examples</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-red-50 p-2 rounded-md text-xs text-red-800 mt-1 mb-2">
                    <p><strong>Examples:</strong><br/>
                    • Slow service during peak hours<br/>
                    • High team member turnover<br/>
                    • Limited parking availability<br/>
                    • Inconsistent food preparation<br/>
                    • Outdated technology systems<br/>
                    • Limited menu variety</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="weaknesses"
                placeholder="Identify areas where your restaurant struggles or could improve..."
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <Target className="h-4 w-4" />
              Opportunities (External Positives)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="opportunities" className="text-xs font-medium">What external factors could you leverage?</Label>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>Examples</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                    <p><strong>Examples:</strong><br/>
                    • Growing local population<br/>
                    • New office buildings nearby<br/>
                    • Competitor weaknesses<br/>
                    • Emerging food trends<br/>
                    • Technology improvements<br/>
                    • Catering opportunities</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="opportunities"
                placeholder="Identify external opportunities your restaurant could pursue..."
                value={opportunities}
                onChange={(e) => setOpportunities(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Threats */}
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <Shield className="h-4 w-4" />
              Threats (External Negatives)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="threats" className="text-xs font-medium">What external challenges could impact you?</Label>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>Examples</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-orange-50 p-2 rounded-md text-xs text-orange-800 mt-1 mb-2">
                    <p><strong>Examples:</strong><br/>
                    • New competitors opening<br/>
                    • Rising food costs<br/>
                    • Economic downturn<br/>
                    • Changing customer preferences<br/>
                    • Labor shortages<br/>
                    • Regulatory changes</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="threats"
                placeholder="Identify external threats that could negatively impact your restaurant..."
                value={threats}
                onChange={(e) => setThreats(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Team Member Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="team-input" className="text-xs font-medium">What insights did you gather from at least two team members?</Label>
            <Textarea
              id="team-input"
              placeholder="Document the perspectives and insights you gathered from team members about strengths, weaknesses, opportunities, and threats..."
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-purple-700">Key Strategic Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="key-insights" className="text-xs font-medium">Based on your SWOT analysis, what are the top 3 strategic priorities for your restaurant?</Label>
            <Textarea
              id="key-insights"
              placeholder="1. Priority one based on your analysis...
2. Priority two based on your analysis...
3. Priority three based on your analysis..."
              value={keyInsights}
              onChange={(e) => setKeyInsights(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
          <div className="bg-purple-50 p-2 rounded-md text-xs text-purple-800">
            <p><strong>Tip:</strong> Look for ways to use your strengths to capitalize on opportunities, address weaknesses that make you vulnerable to threats, and leverage opportunities to overcome weaknesses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RestaurantSWOTAnalysisForm
