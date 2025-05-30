import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import DevelopmentPlanPDFDownload from './DevelopmentPlanPDFDownload'

interface DevelopmentPlanFormProps {
  value: string
  onChange: (value: string) => void
}

const DevelopmentPlanForm: React.FC<DevelopmentPlanFormProps> = ({ value, onChange }) => {
  const [teamMemberName, setTeamMemberName] = useState<string>('')
  const [currentPosition, setCurrentPosition] = useState<string>('')
  const [planCreatedDate, setPlanCreatedDate] = useState<string>('')

  // Skills Development
  const [skillsToFocus, setSkillsToFocus] = useState<string>('')
  const [learningResources, setLearningResources] = useState<string>('')
  const [onJobExperiences, setOnJobExperiences] = useState<string>('')

  // Timeline & Milestones
  const [thirtyDayGoals, setThirtyDayGoals] = useState<string>('')
  const [sixtyDayGoals, setSixtyDayGoals] = useState<string>('')
  const [ninetyDayGoals, setNinetyDayGoals] = useState<string>('')

  // Check-ins & Support
  const [checkInSchedule, setCheckInSchedule] = useState<string>('')
  const [supportNeeded, setSupportNeeded] = useState<string>('')

  // Team Member Input
  const [teamMemberFeedback, setTeamMemberFeedback] = useState<string>('')
  const [planRefinements, setPlanRefinements] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setTeamMemberName(parsed.teamMemberName || '')
        setCurrentPosition(parsed.currentPosition || '')
        setPlanCreatedDate(parsed.planCreatedDate || '')
        setSkillsToFocus(parsed.skillsToFocus || '')
        setLearningResources(parsed.learningResources || '')
        setOnJobExperiences(parsed.onJobExperiences || '')
        setThirtyDayGoals(parsed.thirtyDayGoals || '')
        setSixtyDayGoals(parsed.sixtyDayGoals || '')
        setNinetyDayGoals(parsed.ninetyDayGoals || '')
        setCheckInSchedule(parsed.checkInSchedule || '')
        setSupportNeeded(parsed.supportNeeded || '')
        setTeamMemberFeedback(parsed.teamMemberFeedback || '')
        setPlanRefinements(parsed.planRefinements || '')
      } catch (e) {
        // If parsing fails, leave fields empty
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      teamMemberName,
      currentPosition,
      planCreatedDate,
      skillsToFocus,
      learningResources,
      onJobExperiences,
      thirtyDayGoals,
      sixtyDayGoals,
      ninetyDayGoals,
      checkInSchedule,
      supportNeeded,
      teamMemberFeedback,
      planRefinements
    })
    onChange(formData)
  }, [teamMemberName, currentPosition, planCreatedDate, skillsToFocus, learningResources, onJobExperiences, thirtyDayGoals, sixtyDayGoals, ninetyDayGoals, checkInSchedule, supportNeeded, teamMemberFeedback, planRefinements, onChange])

  return (
    <div className="space-y-4">
      {/* Team Member Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Team Member Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="team-member-name" className="text-xs font-medium">Team Member Name</Label>
              <Input
                id="team-member-name"
                placeholder="Enter team member's name..."
                value={teamMemberName}
                onChange={(e) => setTeamMemberName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="current-position" className="text-xs font-medium">Current Position</Label>
              <Input
                id="current-position"
                placeholder="e.g., Team Member, Shift Leader..."
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="plan-date" className="text-xs font-medium">Plan Created Date</Label>
            <Input
              id="plan-date"
              type="date"
              value={planCreatedDate}
              onChange={(e) => setPlanCreatedDate(e.target.value)}
              className="text-sm w-full sm:w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills Development */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Skills Development Focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="skills-focus" className="text-xs font-medium">Specific Skills to Develop</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> 1) Guest service recovery and complaint handling, 2) Training and mentoring new team members, 3) Shift leadership and delegation skills, 4) Inventory management and cost control, 5) Conflict resolution between team members</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="skills-focus"
              placeholder="List the specific skills this team member should focus on developing..."
              value={skillsToFocus}
              onChange={(e) => setSkillsToFocus(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="learning-resources" className="text-xs font-medium">Learning Resources</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Chick-fil-A Pathway modules on Leadership and Guest Experience<br/>• "The One Minute Manager" book (available at library)<br/>• Monthly leadership articles from Harvard Business Review online<br/>• Internal training videos on conflict resolution<br/>• Mentoring sessions with experienced shift leaders</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="learning-resources"
              placeholder="What books, articles, videos, or training materials will support their development?"
              value={learningResources}
              onChange={(e) => setLearningResources(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="on-job-experiences" className="text-xs font-medium">On-the-Job Experiences</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Lead team huddles twice per week<br/>• Train 2 new hires on register operations<br/>• Handle guest complaints independently (with manager nearby)<br/>• Assist with weekly inventory counts<br/>• Shadow different shift leaders to observe various leadership styles<br/>• Lead a team improvement project (e.g., reducing wait times)</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="on-job-experiences"
              placeholder="What hands-on experiences and stretch assignments will accelerate their growth?"
              value={onJobExperiences}
              onChange={(e) => setOnJobExperiences(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 90-Day Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">90-Day Development Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="thirty-day-goals" className="text-xs font-medium">30-Day Goals</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Complete guest service recovery training module<br/>• Successfully handle 5 guest complaints with minimal manager intervention<br/>• Lead 8 team huddles with confidence<br/>• Begin training first new hire on basic register operations</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="thirty-day-goals"
              placeholder="What should they accomplish in the first 30 days?"
              value={thirtyDayGoals}
              onChange={(e) => setThirtyDayGoals(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="sixty-day-goals" className="text-xs font-medium">60-Day Goals</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Train 2 new hires completely through register certification<br/>• Handle all guest complaints independently and confidently<br/>• Lead a team improvement initiative (reduce average order time by 30 seconds)<br/>• Complete conflict resolution training and apply skills with team</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="sixty-day-goals"
              placeholder="What should they accomplish by day 60?"
              value={sixtyDayGoals}
              onChange={(e) => setSixtyDayGoals(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="ninety-day-goals" className="text-xs font-medium">90-Day Goals</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Ready for promotion to Shift Leader position<br/>• Mentor other team members in guest service excellence<br/>• Lead shifts independently during manager breaks<br/>• Complete leadership assessment and development planning for next level</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="ninety-day-goals"
              placeholder="What should they accomplish by day 90?"
              value={ninetyDayGoals}
              onChange={(e) => setNinetyDayGoals(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Check-ins & Support */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Check-ins & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="check-in-schedule" className="text-xs font-medium">Regular Check-in Schedule</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Weekly 15-minute one-on-one meetings every Tuesday at 2 PM<br/>• Bi-weekly progress reviews with specific goal assessment<br/>• Monthly formal evaluation with written feedback<br/>• Informal daily check-ins during shifts for immediate coaching</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="check-in-schedule"
              placeholder="How often will you meet to review progress and provide feedback?"
              value={checkInSchedule}
              onChange={(e) => setCheckInSchedule(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="support-needed" className="text-xs font-medium">Support & Resources Needed</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> • Access to Pathway training modules during slower periods<br/>• Pairing with Jessica (experienced shift leader) as mentor<br/>• Manager availability for guest complaint backup initially<br/>• Budget approval for leadership book purchases<br/>• Scheduling flexibility for training sessions</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="support-needed"
              placeholder="What support, resources, or accommodations will help them succeed?"
              value={supportNeeded}
              onChange={(e) => setSupportNeeded(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Member Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Team Member Input & Refinements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="team-member-feedback" className="text-xs font-medium">Team Member's Feedback on the Plan</Label>
            <Textarea
              id="team-member-feedback"
              placeholder="What did the team member say when you shared this plan? What are their thoughts, concerns, or excitement?"
              value={teamMemberFeedback}
              onChange={(e) => setTeamMemberFeedback(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="plan-refinements" className="text-xs font-medium">Plan Refinements Based on Their Input</Label>
            <Textarea
              id="plan-refinements"
              placeholder="How did you adjust the plan based on their feedback? What changes were made?"
              value={planRefinements}
              onChange={(e) => setPlanRefinements(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* PDF Download Section */}
      {(teamMemberName || skillsToFocus || thirtyDayGoals) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-800">Download Development Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Generate a professional PDF version of this development plan to share with the team member or keep for your records.
                </p>
              </div>
              <DevelopmentPlanPDFDownload
                data={{
                  teamMemberName,
                  currentPosition,
                  planCreatedDate,
                  skillsToFocus,
                  learningResources,
                  onJobExperiences,
                  thirtyDayGoals,
                  sixtyDayGoals,
                  ninetyDayGoals,
                  checkInSchedule,
                  supportNeeded,
                  teamMemberFeedback,
                  planRefinements
                }}
                className="w-full sm:w-auto"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DevelopmentPlanForm
