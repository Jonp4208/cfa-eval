import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Play, ExternalLink } from 'lucide-react'

interface GrowthMindsetVideoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (evidence: string, notes: string) => void
  task: {
    title: string
    description: string
    resourceUrl?: string
    chickFilAExample?: string
  }
  isCompleted?: boolean
  existingEvidence?: string
  existingNotes?: string
}

const GrowthMindsetVideoForm: React.FC<GrowthMindsetVideoFormProps> = ({
  open,
  onOpenChange,
  onComplete,
  task,
  isCompleted = false,
  existingEvidence = '',
  existingNotes = ''
}) => {
  const [keyLearnings, setKeyLearnings] = useState(existingEvidence || '')
  const [application, setApplication] = useState('')
  const [notes, setNotes] = useState(existingNotes || '')
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (!keyLearnings.trim()) return

    setCompleting(true)
    
    const evidence = JSON.stringify({
      keyLearnings: keyLearnings.trim(),
      application: application.trim()
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
              <Play className="h-5 w-5 text-blue-600" />
            )}
            {task.title}
          </DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Link */}
          {task.resourceUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Resource</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => window.open(task.resourceUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Video: {task.title}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chick-fil-A Example */}
          {task.chickFilAExample && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800">Chick-fil-A Application</CardTitle>
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
                  <CardTitle>Your Key Learnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{parsedEvidence?.keyLearnings}</p>
                </CardContent>
              </Card>

              {parsedEvidence?.application && (
                <Card>
                  <CardHeader>
                    <CardTitle>How You'll Apply This at Chick-fil-A</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{parsedEvidence.application}</p>
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
              <div>
                <Label htmlFor="keyLearnings">
                  What are the 3 most important things you learned from this video? *
                </Label>
                <Textarea
                  id="keyLearnings"
                  placeholder="Example: 1. The power of 'yet' changes how I think about challenges..."
                  value={keyLearnings}
                  onChange={(e) => setKeyLearnings(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about what resonated with you and why it's important.
                </p>
              </div>

              <div>
                <Label htmlFor="application">
                  How will you apply these concepts during your shifts at Chick-fil-A?
                </Label>
                <Textarea
                  id="application"
                  placeholder="Example: When I face a challenging order or difficult guest, I'll remind myself that I can't handle it perfectly YET, but I can learn and improve..."
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Think about specific situations where you can use a growth mindset.
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Additional Thoughts or Questions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other reflections, questions, or ideas..."
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
                  disabled={completing || !keyLearnings.trim()}
                >
                  {completing ? 'Completing...' : 'Complete Task'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GrowthMindsetVideoForm
