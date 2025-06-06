import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Users, Target, MessageSquare, BarChart3 } from 'lucide-react'

interface FormProps {
  value: string
  onChange: (value: string) => void
}

// Leadership Style Assessment Form
export const LeadershipStyleAssessmentForm: React.FC<FormProps> = ({ value, onChange }) => {
  const parseValue = () => {
    try {
      return value ? JSON.parse(value) : {
        dominantScore: '',
        influentialScore: '',
        steadyScore: '',
        conscientiousScore: '',
        primaryStyle: '',
        secondaryStyle: '',
        adaptationStrengths: '',
        adaptationChallenges: '',
        teamApplications: ''
      }
    } catch {
      return {
        dominantScore: '',
        influentialScore: '',
        steadyScore: '',
        conscientiousScore: '',
        primaryStyle: '',
        secondaryStyle: '',
        adaptationStrengths: '',
        adaptationChallenges: '',
        teamApplications: ''
      }
    }
  }

  const data = parseValue()

  const updateData = (field: string, newValue: string) => {
    const updated = { ...data, [field]: newValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800">Leadership Style Assessment Results</h4>
      </div>

      {/* Assessment Scores */}
      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Your DISC Assessment Scores</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dominant">Dominant (D) Score</Label>
              <Input
                id="dominant"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={data.dominantScore}
                onChange={(e) => updateData('dominantScore', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="influential">Influential (I) Score</Label>
              <Input
                id="influential"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={data.influentialScore}
                onChange={(e) => updateData('influentialScore', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="steady">Steady (S) Score</Label>
              <Input
                id="steady"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={data.steadyScore}
                onChange={(e) => updateData('steadyScore', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conscientious">Conscientious (C) Score</Label>
              <Input
                id="conscientious"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={data.conscientiousScore}
                onChange={(e) => updateData('conscientiousScore', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Analysis */}
      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Style Analysis</h5>
          <div className="space-y-4">
            <div>
              <Label htmlFor="primary">Primary Leadership Style</Label>
              <RadioGroup
                value={data.primaryStyle}
                onValueChange={(value) => updateData('primaryStyle', value)}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Dominant" id="primary-d" />
                  <Label htmlFor="primary-d">Dominant (D)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Influential" id="primary-i" />
                  <Label htmlFor="primary-i">Influential (I)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Steady" id="primary-s" />
                  <Label htmlFor="primary-s">Steady (S)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Conscientious" id="primary-c" />
                  <Label htmlFor="primary-c">Conscientious (C)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="secondary">Secondary Leadership Style</Label>
              <RadioGroup
                value={data.secondaryStyle}
                onValueChange={(value) => updateData('secondaryStyle', value)}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Dominant" id="secondary-d" />
                  <Label htmlFor="secondary-d">Dominant (D)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Influential" id="secondary-i" />
                  <Label htmlFor="secondary-i">Influential (I)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Steady" id="secondary-s" />
                  <Label htmlFor="secondary-s">Steady (S)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Conscientious" id="secondary-c" />
                  <Label htmlFor="secondary-c">Conscientious (C)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptation Analysis */}
      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Adaptation Abilities</h5>
          <div className="space-y-4">
            <div>
              <Label htmlFor="strengths">Adaptation Strengths</Label>
              <Textarea
                id="strengths"
                placeholder="What situations do you adapt well to? When do you naturally adjust your leadership style?"
                value={data.adaptationStrengths}
                onChange={(e) => updateData('adaptationStrengths', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="challenges">Adaptation Challenges</Label>
              <Textarea
                id="challenges"
                placeholder="What situations are challenging for you to adapt to? When do you struggle to adjust your style?"
                value={data.adaptationChallenges}
                onChange={(e) => updateData('adaptationChallenges', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Applications */}
      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Application to Your Team</h5>
          <div>
            <Label htmlFor="applications">How will you use these insights with your team?</Label>
            <Textarea
              id="applications"
              placeholder="Describe specific ways you'll apply your leadership style knowledge with your restaurant team members..."
              value={data.teamApplications}
              onChange={(e) => updateData('teamApplications', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Team Member Development Assessment Form
export const TeamMemberDevelopmentForm: React.FC<FormProps> = ({ value, onChange }) => {
  const parseValue = () => {
    try {
      return value ? JSON.parse(value) : {
        teamMembers: [
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' },
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' },
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' }
        ]
      }
    } catch {
      return {
        teamMembers: [
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' },
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' },
          { name: '', task: '', competenceLevel: '', commitmentLevel: '', recommendedStyle: '', reasoning: '' }
        ]
      }
    }
  }

  const data = parseValue()

  const updateTeamMember = (index: number, field: string, newValue: string) => {
    const updated = { ...data }
    updated.teamMembers[index] = { ...updated.teamMembers[index], [field]: newValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-800">Team Member Development Assessment</h4>
      </div>

      {data.teamMembers.map((member, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h5 className="font-medium mb-3">Team Member #{index + 1}</h5>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Team Member Name</Label>
                  <Input
                    id={`name-${index}`}
                    placeholder="Enter name"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`task-${index}`}>Specific Task/Responsibility</Label>
                  <Input
                    id={`task-${index}`}
                    placeholder="e.g., Taking orders, Food prep, Cleaning"
                    value={member.task}
                    onChange={(e) => updateTeamMember(index, 'task', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`competence-${index}`}>Competence Level</Label>
                  <RadioGroup
                    value={member.competenceLevel}
                    onValueChange={(value) => updateTeamMember(index, 'competenceLevel', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id={`comp-low-${index}`} />
                      <Label htmlFor={`comp-low-${index}`}>Low - New to this task</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Moderate" id={`comp-mod-${index}`} />
                      <Label htmlFor={`comp-mod-${index}`}>Moderate - Some experience</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id={`comp-high-${index}`} />
                      <Label htmlFor={`comp-high-${index}`}>High - Very skilled</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor={`commitment-${index}`}>Commitment Level</Label>
                  <RadioGroup
                    value={member.commitmentLevel}
                    onValueChange={(value) => updateTeamMember(index, 'commitmentLevel', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id={`comm-low-${index}`} />
                      <Label htmlFor={`comm-low-${index}`}>Low - Reluctant/Unmotivated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Variable" id={`comm-var-${index}`} />
                      <Label htmlFor={`comm-var-${index}`}>Variable - Inconsistent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id={`comm-high-${index}`} />
                      <Label htmlFor={`comm-high-${index}`}>High - Enthusiastic/Motivated</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label htmlFor={`style-${index}`}>Recommended Leadership Style</Label>
                <RadioGroup
                  value={member.recommendedStyle}
                  onValueChange={(value) => updateTeamMember(index, 'recommendedStyle', value)}
                  className="flex flex-wrap gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Directing" id={`style-dir-${index}`} />
                    <Label htmlFor={`style-dir-${index}`}>Directing (S1)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Coaching" id={`style-coach-${index}`} />
                    <Label htmlFor={`style-coach-${index}`}>Coaching (S2)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Supporting" id={`style-supp-${index}`} />
                    <Label htmlFor={`style-supp-${index}`}>Supporting (S3)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Delegating" id={`style-del-${index}`} />
                    <Label htmlFor={`style-del-${index}`}>Delegating (S4)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`reasoning-${index}`}>Reasoning for Style Choice</Label>
                <Textarea
                  id={`reasoning-${index}`}
                  placeholder="Explain why this leadership style is appropriate for this team member on this task..."
                  value={member.reasoning}
                  onChange={(e) => updateTeamMember(index, 'reasoning', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Interactive Training Scenarios Form
export const InteractiveTrainingScenariosForm: React.FC<FormProps> = ({ value, onChange }) => {
  const parseValue = () => {
    try {
      return value ? JSON.parse(value) : {
        scenarios: [
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' },
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' },
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' }
        ]
      }
    } catch {
      return {
        scenarios: [
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' },
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' },
          { title: '', situation: '', chosenStyle: '', reasoning: '', feedback: '', application: '' }
        ]
      }
    }
  }

  const data = parseValue()

  const updateScenario = (index: number, field: string, newValue: string) => {
    const updated = { ...data }
    updated.scenarios[index] = { ...updated.scenarios[index], [field]: newValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-purple-600" />
        <h4 className="font-semibold text-purple-800">Training Scenarios Completed</h4>
      </div>

      {data.scenarios.map((scenario, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h5 className="font-medium mb-3">Scenario #{index + 1}</h5>
            <div className="space-y-4">
              <div>
                <Label htmlFor={`title-${index}`}>Scenario Title/Name</Label>
                <Input
                  id={`title-${index}`}
                  placeholder="e.g., New Employee Training, Performance Issue, etc."
                  value={scenario.title}
                  onChange={(e) => updateScenario(index, 'title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`situation-${index}`}>Situation Description</Label>
                <Textarea
                  id={`situation-${index}`}
                  placeholder="Describe the scenario situation you worked through..."
                  value={scenario.situation}
                  onChange={(e) => updateScenario(index, 'situation', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor={`style-${index}`}>Leadership Style You Chose</Label>
                <RadioGroup
                  value={scenario.chosenStyle}
                  onValueChange={(value) => updateScenario(index, 'chosenStyle', value)}
                  className="flex flex-wrap gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Directing" id={`scenario-dir-${index}`} />
                    <Label htmlFor={`scenario-dir-${index}`}>Directing (S1)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Coaching" id={`scenario-coach-${index}`} />
                    <Label htmlFor={`scenario-coach-${index}`}>Coaching (S2)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Supporting" id={`scenario-supp-${index}`} />
                    <Label htmlFor={`scenario-supp-${index}`}>Supporting (S3)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Delegating" id={`scenario-del-${index}`} />
                    <Label htmlFor={`scenario-del-${index}`}>Delegating (S4)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`reasoning-${index}`}>Why You Chose This Style</Label>
                <Textarea
                  id={`reasoning-${index}`}
                  placeholder="Explain your reasoning for choosing this leadership style for this scenario..."
                  value={scenario.reasoning}
                  onChange={(e) => updateScenario(index, 'reasoning', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor={`feedback-${index}`}>Feedback Received</Label>
                <Textarea
                  id={`feedback-${index}`}
                  placeholder="What feedback did the training module give you? Was your choice correct?"
                  value={scenario.feedback}
                  onChange={(e) => updateScenario(index, 'feedback', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor={`application-${index}`}>How You'll Apply This Learning</Label>
                <Textarea
                  id={`application-${index}`}
                  placeholder="How will you apply what you learned from this scenario in your restaurant?"
                  value={scenario.application}
                  onChange={(e) => updateScenario(index, 'application', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Communication Style Adaptation Form
export const CommunicationStyleAdaptationForm: React.FC<FormProps> = ({ value, onChange }) => {
  const parseValue = () => {
    try {
      return value ? JSON.parse(value) : {
        directingExample: '',
        coachingExample: '',
        supportingExample: '',
        delegatingExample: '',
        practiceReflection: '',
        implementationPlan: ''
      }
    } catch {
      return {
        directingExample: '',
        coachingExample: '',
        supportingExample: '',
        delegatingExample: '',
        practiceReflection: '',
        implementationPlan: ''
      }
    }
  }

  const data = parseValue()

  const updateData = (field: string, newValue: string) => {
    const updated = { ...data, [field]: newValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-orange-600" />
        <h4 className="font-semibold text-orange-800">Communication Style Adaptation Practice</h4>
      </div>

      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Communication Examples by Leadership Style</h5>
          <div className="space-y-4">
            <div>
              <Label htmlFor="directing">Directing Style Communication</Label>
              <Textarea
                id="directing"
                placeholder="Give a specific example of how you would communicate when using the Directing style (clear instructions, specific expectations)..."
                value={data.directingExample}
                onChange={(e) => updateData('directingExample', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="coaching">Coaching Style Communication</Label>
              <Textarea
                id="coaching"
                placeholder="Give a specific example of how you would communicate when using the Coaching style (explain why, ask questions, encourage)..."
                value={data.coachingExample}
                onChange={(e) => updateData('coachingExample', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="supporting">Supporting Style Communication</Label>
              <Textarea
                id="supporting"
                placeholder="Give a specific example of how you would communicate when using the Supporting style (listen, encourage, facilitate)..."
                value={data.supportingExample}
                onChange={(e) => updateData('supportingExample', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="delegating">Delegating Style Communication</Label>
              <Textarea
                id="delegating"
                placeholder="Give a specific example of how you would communicate when using the Delegating style (minimal direction, trust, check-ins)..."
                value={data.delegatingExample}
                onChange={(e) => updateData('delegatingExample', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Practice Reflection</h5>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reflection">What did you learn from practicing these different communication styles?</Label>
              <Textarea
                id="reflection"
                placeholder="Reflect on what you discovered about adapting your communication style..."
                value={data.practiceReflection}
                onChange={(e) => updateData('practiceReflection', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="implementation">Implementation Plan</Label>
              <Textarea
                id="implementation"
                placeholder="How will you implement these communication adaptations with your team? What specific situations will you practice in?"
                value={data.implementationPlan}
                onChange={(e) => updateData('implementationPlan', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Situational Leadership Application Test Form
export const SituationalLeadershipApplicationTestForm: React.FC<FormProps> = ({ value, onChange }) => {
  const parseValue = () => {
    try {
      return value ? JSON.parse(value) : {
        testScore: '',
        totalQuestions: '',
        correctAnswers: '',
        challengingScenarios: '',
        improvementAreas: '',
        practiceCommitment: '',
        nextSteps: ''
      }
    } catch {
      return {
        testScore: '',
        totalQuestions: '',
        correctAnswers: '',
        challengingScenarios: '',
        improvementAreas: '',
        practiceCommitment: '',
        nextSteps: ''
      }
    }
  }

  const data = parseValue()

  const updateData = (field: string, newValue: string) => {
    const updated = { ...data, [field]: newValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-800">Application Test Results</h4>
      </div>

      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Test Performance</h5>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="score">Your Score (%)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={data.testScore}
                onChange={(e) => updateData('testScore', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="total">Total Questions</Label>
              <Input
                id="total"
                type="number"
                placeholder="20"
                value={data.totalQuestions}
                onChange={(e) => updateData('totalQuestions', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="correct">Correct Answers</Label>
              <Input
                id="correct"
                type="number"
                placeholder="17"
                value={data.correctAnswers}
                onChange={(e) => updateData('correctAnswers', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium mb-3">Analysis & Reflection</h5>
          <div className="space-y-4">
            <div>
              <Label htmlFor="challenging">Most Challenging Scenarios</Label>
              <Textarea
                id="challenging"
                placeholder="Which scenarios were most difficult for you? What made them challenging?"
                value={data.challengingScenarios}
                onChange={(e) => updateData('challengingScenarios', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="improvement">Areas for Improvement</Label>
              <Textarea
                id="improvement"
                placeholder="Based on your test results, what specific areas of situational leadership do you need to practice more?"
                value={data.improvementAreas}
                onChange={(e) => updateData('improvementAreas', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="commitment">Practice Commitment</Label>
              <Textarea
                id="commitment"
                placeholder="What specific situations will you practice these skills in? How will you apply what you learned?"
                value={data.practiceCommitment}
                onChange={(e) => updateData('practiceCommitment', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="nextsteps">Next Steps</Label>
              <Textarea
                id="nextsteps"
                placeholder="What are your next steps for developing your situational leadership skills?"
                value={data.nextSteps}
                onChange={(e) => updateData('nextSteps', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
