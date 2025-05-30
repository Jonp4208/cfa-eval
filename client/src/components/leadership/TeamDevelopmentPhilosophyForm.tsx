import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface TeamDevelopmentPhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

const TeamDevelopmentPhilosophyForm: React.FC<TeamDevelopmentPhilosophyFormProps> = ({ value, onChange }) => {
  const [learningAndGrowthBeliefs, setLearningAndGrowthBeliefs] = useState<string>('')
  const [roleAsDeveloper, setRoleAsDeveloper] = useState<string>('')
  const [developmentBusinessConnection, setDevelopmentBusinessConnection] = useState<string>('')
  const [coreValues, setCoreValues] = useState<string>('')
  const [practicalApplication, setPracticalApplication] = useState<string>('')

  // Parse existing value when component mounts
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setLearningAndGrowthBeliefs(parsed.learningAndGrowthBeliefs || '')
        setRoleAsDeveloper(parsed.roleAsDeveloper || '')
        setDevelopmentBusinessConnection(parsed.developmentBusinessConnection || '')
        setCoreValues(parsed.coreValues || '')
        setPracticalApplication(parsed.practicalApplication || '')
      } catch (e) {
        // If parsing fails, leave fields empty
      }
    }
  }, [value])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      learningAndGrowthBeliefs,
      roleAsDeveloper,
      developmentBusinessConnection,
      coreValues,
      practicalApplication
    })
    onChange(formData)
  }, [learningAndGrowthBeliefs, roleAsDeveloper, developmentBusinessConnection, coreValues, practicalApplication, onChange])

  return (
    <div className="space-y-4">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Team Development Philosophy Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Write a comprehensive statement describing your philosophy on team development. This should reflect your personal beliefs and approach to developing others.
          </p>
        </CardContent>
      </Card>

      {/* Learning and Growth Beliefs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Beliefs About Learning and Growth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="learning-growth-beliefs" className="text-xs font-medium">How do you believe people learn and grow?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "I believe people learn best through a combination of hands-on experience, guided reflection, and supportive feedback. Growth happens when individuals feel psychologically safe to take risks and make mistakes. Everyone has unique strengths and learning styles, so development must be personalized. People are naturally motivated to improve when they understand how their growth connects to their personal goals and the team's success."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="learning-growth-beliefs"
              placeholder="Share your beliefs about how people learn, what motivates growth, and what conditions enable development..."
              value={learningAndGrowthBeliefs}
              onChange={(e) => setLearningAndGrowthBeliefs(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Role as Developer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Your Role as a Developer of Others</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="role-as-developer" className="text-xs font-medium">What is your role in developing team members?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "My role is to be a coach, mentor, and facilitator of growth rather than just a manager who gives directions. I see myself as someone who creates opportunities for learning, provides honest and caring feedback, and helps team members discover their own potential. I'm responsible for creating an environment where people feel valued, challenged, and supported in their development journey."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="role-as-developer"
              placeholder="Describe how you see your role in developing others. What responsibilities do you have? How do you approach this role?"
              value={roleAsDeveloper}
              onChange={(e) => setRoleAsDeveloper(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Development-Business Connection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Connection Between Development and Business Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="development-business-connection" className="text-xs font-medium">How does team development connect to business results?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "When team members grow in their skills and confidence, they provide better guest experiences, which directly impacts our sales and customer loyalty. Developed team members are more engaged, leading to lower turnover and reduced training costs. As people grow into leadership roles, we build internal bench strength and create career pathways that attract top talent. Ultimately, investing in people development is investing in sustainable business success."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="development-business-connection"
              placeholder="Explain how developing your team members contributes to business success, operational excellence, and long-term results..."
              value={developmentBusinessConnection}
              onChange={(e) => setDevelopmentBusinessConnection(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Core Values */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Core Values in Development</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="core-values" className="text-xs font-medium">What core values guide your approach to developing others?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "Respect for the individual - everyone has unique potential and deserves personalized attention. Honesty and transparency in feedback, even when it's difficult. Patience and persistence - development takes time and consistent effort. Celebration of progress - recognizing growth at every level. Servant leadership - putting team members' development needs before my own convenience."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="core-values"
              placeholder="What values are most important to you when developing team members? What principles guide your decisions?"
              value={coreValues}
              onChange={(e) => setCoreValues(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Practical Application */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800">Practical Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="practical-application" className="text-xs font-medium">How do you put this philosophy into practice daily?</Label>
              <Collapsible className="w-full max-w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent">
                    <span>View Example</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-blue-50 p-2 rounded-md text-xs text-blue-800 mt-1 mb-2">
                  <p><strong>Example:</strong> "I start each shift by checking in with team members about their goals and challenges. I look for teachable moments during busy periods to provide real-time coaching. I schedule regular one-on-ones to discuss development progress. I delegate meaningful tasks that stretch people's abilities. I celebrate wins publicly and provide corrective feedback privately. I ask team members what they want to learn and create opportunities for that growth."</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Textarea
              id="practical-application"
              placeholder="Describe specific ways you implement your development philosophy in your daily leadership practices..."
              value={practicalApplication}
              onChange={(e) => setPracticalApplication(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TeamDevelopmentPhilosophyForm
