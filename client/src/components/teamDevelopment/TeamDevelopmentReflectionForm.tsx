import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Brain, Lightbulb } from 'lucide-react'

interface TeamDevelopmentReflectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (evidence: string, notes: string) => void
  task: {
    title: string
    description: string
    chickFilAExample?: string
  }
  isCompleted?: boolean
  existingEvidence?: string
  existingNotes?: string
}

const TeamDevelopmentReflectionForm: React.FC<TeamDevelopmentReflectionFormProps> = ({
  open,
  onOpenChange,
  onComplete,
  task,
  isCompleted = false,
  existingEvidence = '',
  existingNotes = ''
}) => {
  const [currentSituation, setCurrentSituation] = useState(existingEvidence || '')
  const [insights, setInsights] = useState('')
  const [actionPlan, setActionPlan] = useState('')
  const [notes, setNotes] = useState(existingNotes || '')
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (!currentSituation.trim()) return

    setCompleting(true)
    
    const evidence = JSON.stringify({
      currentSituation: currentSituation.trim(),
      insights: insights.trim(),
      actionPlan: actionPlan.trim()
    })

    await onComplete(evidence, notes.trim())
    setCompleting(false)
  }

  const parsedEvidence = existingEvidence ? JSON.parse(existingEvidence) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Brain className="h-5 w-5 text-purple-600" />
            )}
            {task.title}
          </DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant Example */}
          {task.chickFilAExample && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Restaurant Reflection Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">{task.chickFilAExample}</p>
              </CardContent>
            </Card>
          )}

          {/* Completion Form */}
          {isCompleted ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Current Situation Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence?.currentSituation}</p>
                </CardContent>
              </Card>

              {parsedEvidence?.insights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence.insights}</p>
                  </CardContent>
                </Card>
              )}

              {parsedEvidence?.actionPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Action Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence.actionPlan}</p>
                  </CardContent>
                </Card>
              )}

              {existingNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{existingNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">Reflection Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700">
                    Take time to honestly reflect on your current situation and identify areas for growth. 
                    Be specific about your experiences at Chick-fil-A.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="currentSituation">
                  Honestly assess your current situation in this area *
                </Label>
                <Textarea
                  id="currentSituation"
                  placeholder="Example: Currently, when I face challenges during busy shifts, I sometimes get frustrated and focus on what's going wrong rather than what I can learn. I notice I say things like 'I'm not good at handling rushes' instead of thinking about how I can improve..."
                  value={currentSituation}
                  onChange={(e) => setCurrentSituation(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be honest about your strengths and areas where you can grow.
                </p>
              </div>

              <div>
                <Label htmlFor="insights">
                  What insights or realizations do you have?
                </Label>
                <Textarea
                  id="insights"
                  placeholder="Example: I realize that my mindset affects not just my performance, but also how I interact with teammates and guests. When I approach challenges with curiosity instead of frustration, I learn faster and stay more positive..."
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="actionPlan">
                  What specific actions will you take to improve?
                </Label>
                <Textarea
                  id="actionPlan"
                  placeholder="Example: 1. When I make a mistake, I'll ask myself 'What can I learn from this?' instead of getting upset
2. I'll practice saying 'I can't do this YET' when facing new challenges
3. I'll ask teammates for tips when I'm struggling instead of trying to figure it out alone..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Make your action plan specific and measurable.
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Additional Thoughts or Questions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other reflections, questions for your manager, or ideas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={completing || !currentSituation.trim()}
                >
                  {completing ? 'Completing...' : 'Complete Reflection'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeamDevelopmentReflectionForm
