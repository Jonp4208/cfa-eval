import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface GROWCoachingFormProps {
  value: string
  onChange: (value: string) => void
}

const GROWCoachingForm: React.FC<GROWCoachingFormProps> = ({ value, onChange }) => {
  const [teamMemberName, setTeamMemberName] = useState<string>('')
  const [conversationDate, setConversationDate] = useState<string>('')
  
  // GROW Model sections
  const [goal, setGoal] = useState<string>('')
  const [reality, setReality] = useState<string>('')
  const [options, setOptions] = useState<string>('')
  const [willWayForward, setWillWayForward] = useState<string>('')
  
  // Reflection
  const [wentWell, setWentWell] = useState<string>('')
  const [wouldDoDifferently, setWouldDoDifferently] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setTeamMemberName(parsed.teamMemberName || '')
        setConversationDate(parsed.conversationDate || '')
        setGoal(parsed.goal || '')
        setReality(parsed.reality || '')
        setOptions(parsed.options || '')
        setWillWayForward(parsed.willWayForward || '')
        setWentWell(parsed.wentWell || '')
        setWouldDoDifferently(parsed.wouldDoDifferently || '')
      } catch (e) {
        // If parsing fails, leave fields empty
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      teamMemberName,
      conversationDate,
      goal,
      reality,
      options,
      willWayForward,
      wentWell,
      wouldDoDifferently
    })
    onChange(formData)
  }, [teamMemberName, conversationDate, goal, reality, options, willWayForward, wentWell, wouldDoDifferently, onChange])

  return (
    <div className="space-y-4">
      {/* Conversation Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Conversation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="team-member" className="text-xs font-medium">Team Member Name</Label>
              <Input
                id="team-member"
                placeholder="Enter team member's name..."
                value={teamMemberName}
                onChange={(e) => setTeamMemberName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conversation-date" className="text-xs font-medium">Conversation Date</Label>
              <Input
                id="conversation-date"
                type="date"
                value={conversationDate}
                onChange={(e) => setConversationDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GROW Model */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">GROW Model Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="goal" className="text-xs font-medium">Goal - What does the team member want to achieve?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "I want to become more confident when handling difficult guest complaints. My goal is to be able to resolve most guest issues without needing to call a manager, and to feel more comfortable during these interactions within the next month."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="goal"
              placeholder="What specific goal or outcome does the team member want to achieve?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Reality */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="reality" className="text-xs font-medium">Reality - What is the current situation?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Currently, when a guest complains, I feel anxious and immediately call for a manager. I've handled about 3 guest complaints in the past month, and each time I felt overwhelmed. I know the basic service recovery steps, but I get nervous about making decisions on my own, especially when it involves comping items or offering solutions."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="reality"
              placeholder="What is happening now? What are the current challenges or obstacles?"
              value={reality}
              onChange={(e) => setReality(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Options */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="options" className="text-xs font-medium">Options - What are the possible solutions or approaches?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "We discussed several options: 1) Role-playing different complaint scenarios during slower periods, 2) Shadowing experienced team members when they handle complaints, 3) Creating a quick reference guide with common solutions and my authority limits, 4) Starting with smaller complaints and gradually working up to more complex issues, 5) Having a manager nearby for support initially but trying to handle it first."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="options"
              placeholder="What different approaches or solutions were discussed?"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Will/Way Forward */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="will-way-forward" className="text-xs font-medium">Will/Way Forward - What specific actions will be taken?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Sarah committed to: 1) Practice role-playing with me for 15 minutes twice this week, 2) Create her own quick reference card with common solutions, 3) Handle the next minor complaint independently while I observe from nearby, 4) Check in with me after each complaint she handles to discuss what went well. We'll meet again in two weeks to review her progress and adjust the plan if needed."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="will-way-forward"
              placeholder="What specific actions and commitments were made? Include timelines and follow-up plans."
              value={willWayForward}
              onChange={(e) => setWillWayForward(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Coaching Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="went-well" className="text-xs font-medium">What went well in this coaching conversation?</Label>
            <Textarea
              id="went-well"
              placeholder="Reflect on what aspects of the conversation were effective..."
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="would-do-differently" className="text-xs font-medium">What would you do differently next time?</Label>
            <Textarea
              id="would-do-differently"
              placeholder="What would you change or improve in future coaching conversations?"
              value={wouldDoDifferently}
              onChange={(e) => setWouldDoDifferently(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GROWCoachingForm
