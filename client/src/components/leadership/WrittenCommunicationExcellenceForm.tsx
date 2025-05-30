import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Edit,
  CheckCircle,
  Mail,
  Star,
  Lightbulb,
  Target,
  Users
} from 'lucide-react'

interface WrittenCommunicationExcellenceFormProps {
  value: string
  onChange: (value: string) => void
}

interface CommunicationSample {
  type: string
  purpose: string
  audience: string
  originalDraft: string
  revisedVersion: string
  improvementsMade: string
  feedback: string
}

interface WritingPrinciple {
  principle: string
  description: string
  example: string
  application: string
}

const WrittenCommunicationExcellenceForm: React.FC<WrittenCommunicationExcellenceFormProps> = ({ value, onChange }) => {
  const [samples, setSamples] = useState<CommunicationSample[]>([
    { type: '', purpose: '', audience: '', originalDraft: '', revisedVersion: '', improvementsMade: '', feedback: '' },
    { type: '', purpose: '', audience: '', originalDraft: '', revisedVersion: '', improvementsMade: '', feedback: '' },
    { type: '', purpose: '', audience: '', originalDraft: '', revisedVersion: '', improvementsMade: '', feedback: '' }
  ])
  const [principles, setPrinciples] = useState<WritingPrinciple[]>([
    { principle: '', description: '', example: '', application: '' },
    { principle: '', description: '', example: '', application: '' }
  ])
  const [personalReflection, setPersonalReflection] = useState<string>('')
  const [improvementPlan, setImprovementPlan] = useState<string>('')

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.trim() && value !== '{}') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.samples) setSamples(parsed.samples)
        if (parsed.principles) setPrinciples(parsed.principles)
        if (parsed.personalReflection) setPersonalReflection(parsed.personalReflection)
        if (parsed.improvementPlan) setImprovementPlan(parsed.improvementPlan)
      } catch (e) {
        console.error('Error parsing written communication excellence data:', e)
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      samples,
      principles,
      personalReflection,
      improvementPlan
    })
    onChange(formData)
  }, [samples, principles, personalReflection, improvementPlan, onChange])

  const updateSample = (index: number, field: keyof CommunicationSample, value: string) => {
    const updatedSamples = [...samples]
    updatedSamples[index] = { ...updatedSamples[index], [field]: value }
    setSamples(updatedSamples)
  }

  const updatePrinciple = (index: number, field: keyof WritingPrinciple, value: string) => {
    const updatedPrinciples = [...principles]
    updatedPrinciples[index] = { ...updatedPrinciples[index], [field]: value }
    setPrinciples(updatedPrinciples)
  }

  const getCompletionStatus = () => {
    const completedSamples = samples.filter(sample =>
      sample.type.trim().length > 0 &&
      sample.originalDraft.trim().length > 0 &&
      sample.revisedVersion.trim().length > 0
    ).length

    const completedPrinciples = principles.filter(principle =>
      principle.principle.trim().length > 0 &&
      principle.description.trim().length > 0
    ).length

    return {
      samples: Math.round((completedSamples / 3) * 100),
      principles: Math.round((completedPrinciples / 2) * 100),
      reflection: personalReflection.trim().length > 0 ? 100 : 0
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Written Communication Excellence</h3>
        </div>
        <p className="text-sm text-green-700 mb-3">
          Develop your written communication skills by analyzing and improving various types of workplace writing.
          Practice creating clear, professional, and effective written communications.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.samples === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.samples / 33.33)}/3 Samples
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.principles === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              {Math.floor(status.principles / 50)}/2 Principles
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${status.reflection === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
              Reflection {status.reflection === 100 ? 'Complete' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Writing Excellence Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Written Communication Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Clarity & Structure</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Clear purpose and main message</li>
                <li>• Logical organization and flow</li>
                <li>• Appropriate headings and formatting</li>
                <li>• Concise and direct language</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Audience Awareness</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Appropriate tone and formality</li>
                <li>• Relevant content for audience</li>
                <li>• Clear call to action</li>
                <li>• Cultural sensitivity</li>
              </ul>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">Professional Standards</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Proper grammar and spelling</li>
                <li>• Professional formatting</li>
                <li>• Appropriate subject lines</li>
                <li>• Timely responses</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Impact & Effectiveness</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Achieves intended purpose</li>
                <li>• Motivates desired action</li>
                <li>• Builds positive relationships</li>
                <li>• Prevents misunderstandings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Samples */}
      {samples.map((sample, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-500" />
              Communication Sample {index + 1}
              {sample.type && sample.originalDraft && sample.revisedVersion && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`type-${index}`} className="text-sm font-medium">
                  Communication Type
                </Label>
                <Input
                  id={`type-${index}`}
                  placeholder="e.g., Email, Memo, Policy Update, Team Announcement"
                  value={sample.type}
                  onChange={(e) => updateSample(index, 'type', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`purpose-${index}`} className="text-sm font-medium">
                  Purpose
                </Label>
                <Input
                  id={`purpose-${index}`}
                  placeholder="e.g., Inform, Request, Persuade, Instruct"
                  value={sample.purpose}
                  onChange={(e) => updateSample(index, 'purpose', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`audience-${index}`} className="text-sm font-medium">
                Target Audience
              </Label>
              <Input
                id={`audience-${index}`}
                placeholder="e.g., Team Members, Management, Customers, Vendors"
                value={sample.audience}
                onChange={(e) => updateSample(index, 'audience', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`original-${index}`} className="text-sm font-medium">
                Original Draft
              </Label>
              <Textarea
                id={`original-${index}`}
                placeholder="Paste or write your original version of this communication..."
                value={sample.originalDraft}
                onChange={(e) => updateSample(index, 'originalDraft', e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`revised-${index}`} className="text-sm font-medium">
                Revised Version
              </Label>
              <Textarea
                id={`revised-${index}`}
                placeholder="Write your improved version here, applying best practices for clarity, tone, and effectiveness..."
                value={sample.revisedVersion}
                onChange={(e) => updateSample(index, 'revisedVersion', e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`improvements-${index}`} className="text-sm font-medium">
                Improvements Made
              </Label>
              <Textarea
                id={`improvements-${index}`}
                placeholder="What specific changes did you make? Why were these improvements necessary? What principles did you apply?"
                value={sample.improvementsMade}
                onChange={(e) => updateSample(index, 'improvementsMade', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`feedback-${index}`} className="text-sm font-medium">
                Feedback Received (if applicable)
              </Label>
              <Textarea
                id={`feedback-${index}`}
                placeholder="If you shared this with others, what feedback did you receive? How was it received by the audience?"
                value={sample.feedback}
                onChange={(e) => updateSample(index, 'feedback', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Personal Writing Principles */}
      {principles.map((principle, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Writing Principle {index + 1}
              {principle.principle && principle.description && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`principle-name-${index}`} className="text-sm font-medium">
                Principle Name
              </Label>
              <Input
                id={`principle-name-${index}`}
                placeholder="e.g., Lead with Purpose, Be Concise and Clear, Show Don't Tell"
                value={principle.principle}
                onChange={(e) => updatePrinciple(index, 'principle', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-desc-${index}`} className="text-sm font-medium">
                Principle Description
              </Label>
              <Textarea
                id={`principle-desc-${index}`}
                placeholder="Describe this writing principle in detail. Why is it important? How does it improve communication?"
                value={principle.description}
                onChange={(e) => updatePrinciple(index, 'description', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-example-${index}`} className="text-sm font-medium">
                Example Application
              </Label>
              <Textarea
                id={`principle-example-${index}`}
                placeholder="Provide a specific example of how you apply this principle in your writing"
                value={principle.example}
                onChange={(e) => updatePrinciple(index, 'example', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`principle-application-${index}`} className="text-sm font-medium">
                When to Apply This Principle
              </Label>
              <Textarea
                id={`principle-application-${index}`}
                placeholder="In what situations is this principle most important? What types of communications benefit most from this approach?"
                value={principle.application}
                onChange={(e) => updatePrinciple(index, 'application', e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Personal Reflection & Development Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Personal Reflection & Development Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-reflection" className="text-sm font-medium">
              Personal Reflection on Written Communication
            </Label>
            <Textarea
              id="personal-reflection"
              placeholder="Reflect on your written communication skills. What are your strengths? What challenges do you face? How has this practice improved your writing?"
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvement-plan" className="text-sm font-medium">
              Continuous Improvement Plan
            </Label>
            <Textarea
              id="improvement-plan"
              placeholder="What specific steps will you take to continue improving your written communication? What practices will you implement? How will you seek feedback?"
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WrittenCommunicationExcellenceForm
