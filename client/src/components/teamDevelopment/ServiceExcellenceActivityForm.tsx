import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Heart, Star } from 'lucide-react'

interface ServiceExcellenceActivityFormProps {
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

const ServiceExcellenceActivityForm: React.FC<ServiceExcellenceActivityFormProps> = ({
  open,
  onOpenChange,
  onComplete,
  task,
  isCompleted = false,
  existingEvidence = '',
  existingNotes = ''
}) => {
  const [examples, setExamples] = useState(existingEvidence || '')
  const [guestReactions, setGuestReactions] = useState('')
  const [learnings, setLearnings] = useState('')
  const [notes, setNotes] = useState(existingNotes || '')
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (!examples.trim()) return

    setCompleting(true)
    
    const evidence = JSON.stringify({
      examples: examples.trim(),
      guestReactions: guestReactions.trim(),
      learnings: learnings.trim()
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
              <Heart className="h-5 w-5 text-red-600" />
            )}
            {task.title}
          </DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chick-fil-A Example */}
          {task.chickFilAExample && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Chick-fil-A Second Mile Service Ideas
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
                  <CardTitle>Your Second Mile Service Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence?.examples}</p>
                </CardContent>
              </Card>

              {parsedEvidence?.guestReactions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Reactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence.guestReactions}</p>
                  </CardContent>
                </Card>
              )}

              {parsedEvidence?.learnings && (
                <Card>
                  <CardHeader>
                    <CardTitle>What You Learned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{parsedEvidence.learnings}</p>
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
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Challenge Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700">
                    For one week, find one way each day to go above and beyond for a guest. 
                    Document your efforts and the guest reactions below.
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="examples">
                  Describe 5-7 specific examples of how you went above and beyond for guests *
                </Label>
                <Textarea
                  id="examples"
                  placeholder="Day 1: I noticed a guest struggling with a crying baby, so I offered to carry their tray to their table and brought extra napkins without being asked. The guest smiled and said 'thank you so much, that really helped!'

Day 2: A guest mentioned they were having a tough day, so I drew a smiley face on their cup and wrote 'Hope your day gets better!' They laughed and said it made their day.

Day 3: ..."
                  value={examples}
                  onChange={(e) => setExamples(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about what you did and include the guest's reaction when possible.
                </p>
              </div>

              <div>
                <Label htmlFor="guestReactions">
                  What were the most memorable guest reactions?
                </Label>
                <Textarea
                  id="guestReactions"
                  placeholder="Example: One guest was so surprised when I remembered their usual order that they asked to speak to my manager to give me a compliment..."
                  value={guestReactions}
                  onChange={(e) => setGuestReactions(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="learnings">
                  What did you learn about the impact of second mile service?
                </Label>
                <Textarea
                  id="learnings"
                  placeholder="Example: I learned that small gestures can completely change someone's day. Even when I was tired, seeing guests smile gave me energy..."
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Thoughts or Reflections (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other insights, challenges, or ideas for future second mile service..."
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
                  disabled={completing || !examples.trim()}
                >
                  {completing ? 'Completing...' : 'Complete Challenge'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceExcellenceActivityForm
