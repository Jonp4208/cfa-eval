import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SBIFeedbackFormProps {
  value: string
  onChange: (value: string) => void
}

const SBIFeedbackForm: React.FC<SBIFeedbackFormProps> = ({ value, onChange }) => {
  // Example 1 fields
  const [situation1, setSituation1] = useState<string>('')
  const [behavior1, setBehavior1] = useState<string>('')
  const [impact1, setImpact1] = useState<string>('')

  // Example 2 fields
  const [situation2, setSituation2] = useState<string>('')
  const [behavior2, setBehavior2] = useState<string>('')
  const [impact2, setImpact2] = useState<string>('')

  // Example 3 fields
  const [situation3, setSituation3] = useState<string>('')
  const [behavior3, setBehavior3] = useState<string>('')
  const [impact3, setImpact3] = useState<string>('')

  // Key insights from the article
  const [keyInsights, setKeyInsights] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setSituation1(parsed.situation1 || '')
        setBehavior1(parsed.behavior1 || '')
        setImpact1(parsed.impact1 || '')
        setSituation2(parsed.situation2 || '')
        setBehavior2(parsed.behavior2 || '')
        setImpact2(parsed.impact2 || '')
        setSituation3(parsed.situation3 || '')
        setBehavior3(parsed.behavior3 || '')
        setImpact3(parsed.impact3 || '')
        setKeyInsights(parsed.keyInsights || '')
      } catch (e) {
        // If parsing fails, treat as plain text (legacy format)
        setKeyInsights(value)
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      keyInsights,
      situation1,
      behavior1,
      impact1,
      situation2,
      behavior2,
      impact2,
      situation3,
      behavior3,
      impact3
    })
    onChange(formData)
  }, [keyInsights, situation1, behavior1, impact1, situation2, behavior2, impact2, situation3, behavior3, impact3, onChange])

  return (
    <div className="space-y-3">
      {/* Key Insights Section */}
      <div className="space-y-2">
        <Label htmlFor="key-insights" className="text-sm font-medium">Key Insights from the Article</Label>
        <Textarea
          id="key-insights"
          placeholder="What were the main takeaways about the SBI feedback model from the CCL article?"
          value={keyInsights}
          onChange={(e) => setKeyInsights(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </div>

      <Separator />

      {/* SBI Examples Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">SBI Feedback Examples</h4>
        <p className="text-xs text-gray-600">
          Write up to 3 examples of feedback you need to deliver to team members using the SBI model. You can save your progress and come back to complete more examples later.
        </p>

        {/* Example 1 */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Example 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="situation-1" className="text-xs font-medium">Situation (When/Where)</Label>
              <Textarea
                id="situation-1"
                placeholder="Describe when and where this happened (e.g., 'During yesterday's lunch rush at the front counter...')"
                value={situation1}
                onChange={(e) => setSituation1(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="behavior-1" className="text-xs font-medium">Behavior (What you observed)</Label>
              <Textarea
                id="behavior-1"
                placeholder="Describe the specific behavior you observed (e.g., 'I noticed you interrupted the customer twice while they were ordering...')"
                value={behavior1}
                onChange={(e) => setBehavior1(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="impact-1" className="text-xs font-medium">Impact (Effect on team/guests/operations)</Label>
              <Textarea
                id="impact-1"
                placeholder="Explain the impact of this behavior (e.g., 'This caused the customer to look frustrated and the order took longer than usual...')"
                value={impact1}
                onChange={(e) => setImpact1(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Example 2 */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Example 2 (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="situation-2" className="text-xs font-medium">Situation (When/Where)</Label>
              <Textarea
                id="situation-2"
                placeholder="Describe when and where this happened..."
                value={situation2}
                onChange={(e) => setSituation2(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="behavior-2" className="text-xs font-medium">Behavior (What you observed)</Label>
              <Textarea
                id="behavior-2"
                placeholder="Describe the specific behavior you observed..."
                value={behavior2}
                onChange={(e) => setBehavior2(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="impact-2" className="text-xs font-medium">Impact (Effect on team/guests/operations)</Label>
              <Textarea
                id="impact-2"
                placeholder="Explain the impact of this behavior..."
                value={impact2}
                onChange={(e) => setImpact2(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Example 3 */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Example 3 (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="situation-3" className="text-xs font-medium">Situation (When/Where)</Label>
              <Textarea
                id="situation-3"
                placeholder="Describe when and where this happened..."
                value={situation3}
                onChange={(e) => setSituation3(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="behavior-3" className="text-xs font-medium">Behavior (What you observed)</Label>
              <Textarea
                id="behavior-3"
                placeholder="Describe the specific behavior you observed..."
                value={behavior3}
                onChange={(e) => setBehavior3(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="impact-3" className="text-xs font-medium">Impact (Effect on team/guests/operations)</Label>
              <Textarea
                id="impact-3"
                placeholder="Explain the impact of this behavior..."
                value={impact3}
                onChange={(e) => setImpact3(e.target.value)}
                className="min-h-[50px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SBIFeedbackForm
