import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Lightbulb,
  Target,
  Clock,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Star
} from 'lucide-react'

interface InnovationWorkshopFormProps {
  value: string
  onChange: (value: string) => void
}

interface WorkshopDetails {
  workshopTopic: string
  participantList: string
  workshopDuration: string
  problemStatement: string
  brainstormingResults: string
  selectedSolutions: string
  implementationPlan: string
  teamFeedback: string
  lessonsLearned: string
}

const InnovationWorkshopForm: React.FC<InnovationWorkshopFormProps> = ({ value, onChange }) => {
  const [workshop, setWorkshop] = useState<WorkshopDetails>({
    workshopTopic: '',
    participantList: '',
    workshopDuration: '',
    problemStatement: '',
    brainstormingResults: '',
    selectedSolutions: '',
    implementationPlan: '',
    teamFeedback: '',
    lessonsLearned: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setWorkshop(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setWorkshop(prev => ({ ...prev, workshopTopic: value }))
      }
    }
  }, [value])

  // Update parent component when workshop changes
  useEffect(() => {
    onChange(JSON.stringify(workshop))
  }, [workshop, onChange])

  const updateField = (field: keyof WorkshopDetails, value: string) => {
    setWorkshop(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            Innovation Workshop Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workshop-topic" className="text-xs font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                Workshop Topic/Focus Area
              </Label>
              <Input
                id="workshop-topic"
                placeholder="Example: Reducing customer wait times during lunch rush"
                value={workshop.workshopTopic}
                onChange={(e) => updateField('workshopTopic', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workshop-duration" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Workshop Duration
              </Label>
              <Input
                id="workshop-duration"
                placeholder="Example: 45 minutes"
                value={workshop.workshopDuration}
                onChange={(e) => updateField('workshopDuration', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant-list" className="text-xs font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Workshop Participants
            </Label>
            <Input
              id="participant-list"
              placeholder="Example: Sarah (Assistant Manager), Mike (Kitchen Lead), Jessica (Front Counter), Tom (Drive-thru), Lisa (Team Member)"
              value={workshop.participantList}
              onChange={(e) => updateField('participantList', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-statement" className="text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />
              Problem Statement
            </Label>
            <Textarea
              id="problem-statement"
              placeholder="Example: How might we reduce customer wait times from 8 minutes to 5 minutes during our busiest lunch period (11:30am-1:30pm) without compromising food quality or customer service?"
              value={workshop.problemStatement}
              onChange={(e) => updateField('problemStatement', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brainstorming-results" className="text-xs font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Brainstorming Results
            </Label>
            <Textarea
              id="brainstorming-results"
              placeholder="Example: Pre-prep more items during slow periods, add mobile ordering, create express lane for simple orders, cross-train team members, improve kitchen layout, batch similar orders, use timer system, add staff during peak..."
              value={workshop.brainstormingResults}
              onChange={(e) => updateField('brainstormingResults', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="selected-solutions" className="text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3" />
              Selected Solutions
            </Label>
            <Textarea
              id="selected-solutions"
              placeholder="Example: 1) Pre-prep sandwiches during 10am-11am slow period, 2) Cross-train 2 more team members on grill, 3) Create express lane for drinks/sides only. Chosen because they're low-cost, quick to implement, and address our biggest bottlenecks."
              value={workshop.selectedSolutions}
              onChange={(e) => updateField('selectedSolutions', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-plan" className="text-xs font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Implementation Plan
            </Label>
            <Textarea
              id="implementation-plan"
              placeholder="Example: Week 1: Mike trains Lisa and Tom on grill (Mon-Wed). Week 2: Start pre-prep routine with Sarah leading (daily 10-11am). Week 3: Test express lane during lunch rush (Jessica manages). Track wait times daily."
              value={workshop.implementationPlan}
              onChange={(e) => updateField('implementationPlan', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-feedback" className="text-xs font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Team Feedback
            </Label>
            <Textarea
              id="team-feedback"
              placeholder="What feedback did participants give about the workshop process? How engaged were they?"
              value={workshop.teamFeedback}
              onChange={(e) => updateField('teamFeedback', e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessons-learned" className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Lessons Learned
            </Label>
            <Textarea
              id="lessons-learned"
              placeholder="What did you learn about facilitating innovation workshops? What would you do differently next time?"
              value={workshop.lessonsLearned}
              onChange={(e) => updateField('lessonsLearned', e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InnovationWorkshopForm
