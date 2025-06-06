import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Target, Download, Plus, Trash2, BarChart3 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SituationalLeadershipDiagram } from './SituationalLeadershipDiagram'
import { pdf } from '@react-pdf/renderer'
import { TeamAssessmentPDF } from './TeamAssessmentPDF'

interface TeamMember {
  id: string
  name: string
  task: string
  competenceLevel: number
  commitmentLevel: number
  developmentLevel: string
  recommendedStyle: string
  notes: string
}

export const InteractiveTeamAssessmentTool: React.FC = () => {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: '',
      task: '',
      competenceLevel: 1,
      commitmentLevel: 1,
      developmentLevel: 'D1',
      recommendedStyle: 'Directing (S1)',
      notes: ''
    }
  ])

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: '',
      task: '',
      competenceLevel: 1,
      commitmentLevel: 1,
      developmentLevel: 'D1',
      recommendedStyle: 'Directing (S1)',
      notes: ''
    }
    setTeamMembers([...teamMembers, newMember])
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id))
  }

  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    setTeamMembers(teamMembers.map(member => {
      if (member.id === id) {
        const updated = { ...member, [field]: value }
        
        // Auto-calculate development level and recommended style
        if (field === 'competenceLevel' || field === 'commitmentLevel') {
          const { developmentLevel, recommendedStyle } = calculateDevelopmentLevel(
            field === 'competenceLevel' ? value : member.competenceLevel,
            field === 'commitmentLevel' ? value : member.commitmentLevel
          )
          updated.developmentLevel = developmentLevel
          updated.recommendedStyle = recommendedStyle
        }
        
        return updated
      }
      return member
    }))
  }

  const calculateDevelopmentLevel = (competence: number, commitment: number) => {
    if (competence <= 2 && commitment >= 4) {
      return { developmentLevel: 'D1', recommendedStyle: 'Directing (S1)' }
    } else if (competence <= 2 && commitment <= 3) {
      return { developmentLevel: 'D2', recommendedStyle: 'Coaching (S2)' }
    } else if (competence >= 3 && commitment <= 3) {
      return { developmentLevel: 'D3', recommendedStyle: 'Supporting (S3)' }
    } else {
      return { developmentLevel: 'D4', recommendedStyle: 'Delegating (S4)' }
    }
  }

  const exportAssessment = async () => {
    const validMembers = teamMembers.filter(member => member.name.trim() !== '')

    if (validMembers.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'Please add at least one team member before exporting.',
        variant: 'destructive'
      })
      return
    }

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Creating your professional assessment report.'
      })

      // Generate PDF using React PDF
      const pdfBlob = await pdf(
        <TeamAssessmentPDF
          teamMembers={validMembers}
          assessmentDate={new Date().toLocaleDateString()}
        />
      ).toBlob()

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Team_Assessment_Report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'PDF Report Downloaded',
        description: 'Your professional team assessment report has been downloaded successfully.'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your PDF report. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getCompetenceLabel = (level: number) => {
    const labels = {
      1: 'No knowledge/skills',
      2: 'Limited knowledge/skills', 
      3: 'Moderate knowledge/skills',
      4: 'Good knowledge/skills',
      5: 'Expert knowledge/skills'
    }
    return labels[level as keyof typeof labels]
  }

  const getCommitmentLabel = (level: number) => {
    const labels = {
      1: 'Low motivation/confidence',
      2: 'Some motivation/confidence',
      3: 'Variable motivation/confidence',
      4: 'High motivation/confidence',
      5: 'Very high motivation/confidence'
    }
    return labels[level as keyof typeof labels]
  }

  const getDevelopmentLevelColor = (level: string) => {
    const colors = {
      'D1': 'bg-red-100 text-red-800 border-red-200',
      'D2': 'bg-orange-100 text-orange-800 border-orange-200',
      'D3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D4': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interactive Team Assessment Tool</h2>
            <p className="text-sm text-gray-600">Assess your team members' development levels and get leadership style recommendations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={addTeamMember} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button
            onClick={exportAssessment}
            size="sm"
            className="bg-[#E51636] hover:bg-[#c41230]"
            disabled={teamMembers.filter(member => member.name.trim() !== '').length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
Export PDF
          </Button>
        </div>
      </div>

      {/* Assessment Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Assessment Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Competence (Knowledge & Skills)</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>1-2:</strong> New to the task, needs training</li>
                <li>• <strong>3:</strong> Some experience, developing skills</li>
                <li>• <strong>4-5:</strong> Skilled and experienced</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Commitment (Motivation & Confidence)</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>1-2:</strong> Low motivation or confidence</li>
                <li>• <strong>3:</strong> Variable motivation/confidence</li>
                <li>• <strong>4-5:</strong> High motivation and confidence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Situational Leadership Diagram */}
      <SituationalLeadershipDiagram />

      {/* Team Member Assessments */}
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <Card key={member.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Team Member #{index + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getDevelopmentLevelColor(member.developmentLevel)} border`}>
                    {member.developmentLevel}
                  </Badge>
                  {teamMembers.length > 1 && (
                    <Button
                      onClick={() => removeTeamMember(member.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${member.id}`}>Team Member Name</Label>
                  <Input
                    id={`name-${member.id}`}
                    placeholder="Enter name"
                    value={member.name}
                    onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`task-${member.id}`}>Specific Task/Responsibility</Label>
                  <Input
                    id={`task-${member.id}`}
                    placeholder="e.g., Taking orders, Food prep, Cleaning"
                    value={member.task}
                    onChange={(e) => updateTeamMember(member.id, 'task', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">Competence Level</Label>
                  <p className="text-sm text-gray-600 mb-3">Rate their knowledge and skills for this task</p>
                  <RadioGroup
                    value={member.competenceLevel.toString()}
                    onValueChange={(value) => updateTeamMember(member.id, 'competenceLevel', parseInt(value))}
                    className="space-y-2"
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.toString()} id={`comp-${member.id}-${level}`} />
                        <Label htmlFor={`comp-${member.id}-${level}`} className="text-sm">
                          <span className="font-medium">{level}</span> - {getCompetenceLabel(level)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Commitment Level</Label>
                  <p className="text-sm text-gray-600 mb-3">Rate their motivation and confidence</p>
                  <RadioGroup
                    value={member.commitmentLevel.toString()}
                    onValueChange={(value) => updateTeamMember(member.id, 'commitmentLevel', parseInt(value))}
                    className="space-y-2"
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.toString()} id={`comm-${member.id}-${level}`} />
                        <Label htmlFor={`comm-${member.id}-${level}`} className="text-sm">
                          <span className="font-medium">{level}</span> - {getCommitmentLabel(level)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Assessment Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Development Level</Label>
                    <Badge className={`${getDevelopmentLevelColor(member.developmentLevel)} border mt-1`}>
                      {member.developmentLevel}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Recommended Leadership Style</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{member.recommendedStyle}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`notes-${member.id}`}>Additional Notes</Label>
                <Textarea
                  id={`notes-${member.id}`}
                  placeholder="Any additional observations or context about this team member..."
                  value={member.notes}
                  onChange={(e) => updateTeamMember(member.id, 'notes', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {teamMembers.some(member => member.name.trim() !== '') && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-900 mb-3">Assessment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {['D1', 'D2', 'D3', 'D4'].map(level => {
                const count = teamMembers.filter(member => 
                  member.name.trim() !== '' && member.developmentLevel === level
                ).length
                return (
                  <div key={level} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${getDevelopmentLevelColor(level)}`}>
                      {count}
                    </div>
                    <p className="mt-1 font-medium">{level}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
