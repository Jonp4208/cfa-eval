import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface SkillBuildingWorkshopFormProps {
  value: string
  onChange: (value: string) => void
}

const SkillBuildingWorkshopForm: React.FC<SkillBuildingWorkshopFormProps> = ({ value, onChange }) => {
  const [workshopDate, setWorkshopDate] = useState<string>('')
  const [skillTopic, setSkillTopic] = useState<string>('')
  const [performanceGap, setPerformanceGap] = useState<string>('')
  const [attendees, setAttendees] = useState<string>('')
  
  // Tell-Show-Do-Review Method
  const [tellSection, setTellSection] = useState<string>('')
  const [showSection, setShowSection] = useState<string>('')
  const [doSection, setDoSection] = useState<string>('')
  const [reviewSection, setReviewSection] = useState<string>('')
  
  // Workshop Outcomes
  const [teamResponse, setTeamResponse] = useState<string>('')
  const [keyLearnings, setKeyLearnings] = useState<string>('')
  const [followUpActions, setFollowUpActions] = useState<string>('')
  const [improvementsForNext, setImprovementsForNext] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setWorkshopDate(parsed.workshopDate || '')
        setSkillTopic(parsed.skillTopic || '')
        setPerformanceGap(parsed.performanceGap || '')
        setAttendees(parsed.attendees || '')
        setTellSection(parsed.tellSection || '')
        setShowSection(parsed.showSection || '')
        setDoSection(parsed.doSection || '')
        setReviewSection(parsed.reviewSection || '')
        setTeamResponse(parsed.teamResponse || '')
        setKeyLearnings(parsed.keyLearnings || '')
        setFollowUpActions(parsed.followUpActions || '')
        setImprovementsForNext(parsed.improvementsForNext || '')
      } catch (e) {
        // If parsing fails, leave fields empty
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      workshopDate,
      skillTopic,
      performanceGap,
      attendees,
      tellSection,
      showSection,
      doSection,
      reviewSection,
      teamResponse,
      keyLearnings,
      followUpActions,
      improvementsForNext
    })
    onChange(formData)
  }, [workshopDate, skillTopic, performanceGap, attendees, tellSection, showSection, doSection, reviewSection, teamResponse, keyLearnings, followUpActions, improvementsForNext, onChange])

  return (
    <div className="space-y-4">
      {/* Workshop Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Workshop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="workshop-date" className="text-xs font-medium">Workshop Date</Label>
              <Input
                id="workshop-date"
                type="date"
                value={workshopDate}
                onChange={(e) => setWorkshopDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="skill-topic" className="text-xs font-medium">Skill Topic</Label>
              <Input
                id="skill-topic"
                placeholder="e.g., Guest recovery, Suggestive selling, Teamwork..."
                value={skillTopic}
                onChange={(e) => setSkillTopic(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="performance-gap" className="text-xs font-medium">Performance Gap Addressed</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Team members are inconsistent with suggestive selling - some skip it entirely, others use scripted language that feels unnatural. Guest feedback indicates they want more personalized recommendations. Sales data shows we're missing opportunities to increase average order value."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="performance-gap"
              placeholder="What specific performance issue or improvement opportunity does this workshop address?"
              value={performanceGap}
              onChange={(e) => setPerformanceGap(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="attendees" className="text-xs font-medium">Workshop Attendees</Label>
            <Textarea
              id="attendees"
              placeholder="List the team members who attended the workshop..."
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="min-h-[50px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tell-Show-Do-Review Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Tell-Show-Do-Review Training Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tell */}
          <div className="border-l-4 border-l-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="tell-section" className="text-xs font-medium">TELL - Explain the Skill</Label>
                <Collapsible className="w-full max-w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>View Example</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-blue-100 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                    <p><strong>Example:</strong> "I explained that suggestive selling isn't about pushing products, but about enhancing the guest experience. I covered the 3 key principles: 1) Listen to what they order first, 2) Make relevant suggestions based on their choices, 3) Use conversational language like 'Would you like to try...' instead of 'Do you want...'"</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="tell-section"
                placeholder="What did you explain to the team? What key concepts or principles did you cover?"
                value={tellSection}
                onChange={(e) => setTellSection(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          {/* Show */}
          <div className="border-l-4 border-l-green-500 pl-4 bg-green-50 p-3 rounded-r-lg">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="show-section" className="text-xs font-medium">SHOW - Demonstrate the Skill</Label>
                <Collapsible className="w-full max-w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>View Example</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-green-100 p-2 rounded-md text-xs text-green-800 mt-1 mb-2">
                    <p><strong>Example:</strong> "I role-played with Sarah as the guest. When she ordered a chicken sandwich, I demonstrated saying 'That's a great choice! Since you're getting the chicken sandwich, would you like to try our waffle fries? They're really popular with that sandwich.' I showed both good and poor examples."</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="show-section"
                placeholder="How did you demonstrate the skill? What examples did you show?"
                value={showSection}
                onChange={(e) => setShowSection(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          {/* Do */}
          <div className="border-l-4 border-l-amber-500 pl-4 bg-amber-50 p-3 rounded-r-lg">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="do-section" className="text-xs font-medium">DO - Practice the Skill</Label>
                <Collapsible className="w-full max-w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>View Example</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-amber-100 p-2 rounded-md text-xs text-amber-800 mt-1 mb-2">
                    <p><strong>Example:</strong> "Each team member practiced with a partner using different order scenarios. I gave them scenario cards: 'Guest orders a salad,' 'Family with kids orders meals,' 'Guest seems in a hurry.' They took turns being the team member and the guest, practicing natural conversation flow."</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="do-section"
                placeholder="How did team members practice the skill? What activities or exercises did you use?"
                value={doSection}
                onChange={(e) => setDoSection(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          {/* Review */}
          <div className="border-l-4 border-l-purple-500 pl-4 bg-purple-50 p-3 rounded-r-lg">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="review-section" className="text-xs font-medium">REVIEW - Provide Feedback</Label>
                <Collapsible className="w-full max-w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                      <span>View Example</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-purple-100 p-2 rounded-md text-xs text-purple-800 mt-1 mb-2">
                    <p><strong>Example:</strong> "I gave specific feedback to each person: 'Mike, great job listening to the guest's order first. Try making your suggestion sound more like a recommendation from a friend.' We discussed what felt natural vs. scripted and identified key phrases that worked well."</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Textarea
                id="review-section"
                placeholder="What feedback did you provide? How did you reinforce key learning points?"
                value={reviewSection}
                onChange={(e) => setReviewSection(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workshop Outcomes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Workshop Outcomes & Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="team-response" className="text-xs font-medium">Team Response & Engagement</Label>
            <Textarea
              id="team-response"
              placeholder="How did the team respond to the workshop? What was their level of engagement?"
              value={teamResponse}
              onChange={(e) => setTeamResponse(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="key-learnings" className="text-xs font-medium">Key Learnings & Insights</Label>
            <Textarea
              id="key-learnings"
              placeholder="What were the main takeaways from the workshop? What insights emerged?"
              value={keyLearnings}
              onChange={(e) => setKeyLearnings(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="follow-up-actions" className="text-xs font-medium">Follow-up Actions</Label>
            <Textarea
              id="follow-up-actions"
              placeholder="What follow-up actions will you take to reinforce the learning?"
              value={followUpActions}
              onChange={(e) => setFollowUpActions(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="improvements-for-next" className="text-xs font-medium">Improvements for Next Workshop</Label>
            <Textarea
              id="improvements-for-next"
              placeholder="What would you do differently in future skill-building workshops?"
              value={improvementsForNext}
              onChange={(e) => setImprovementsForNext(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SkillBuildingWorkshopForm
