import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Target, 
  CheckCircle, 
  TrendingUp,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Clock
} from 'lucide-react'

interface ContinuousImprovementFormProps {
  value: string
  onChange: (value: string) => void
}

interface PDCAProject {
  projectTitle: string
  problemStatement: string
  planPhase: string
  doPhase: string
  checkPhase: string
  actPhase: string
  timeline: string
  resources: string
  successMetrics: string
  lessonsLearned: string
  nextSteps: string
}

const ContinuousImprovementForm: React.FC<ContinuousImprovementFormProps> = ({ 
  value, 
  onChange
}) => {
  const [project, setProject] = useState<PDCAProject>({
    projectTitle: '',
    problemStatement: '',
    planPhase: '',
    doPhase: '',
    checkPhase: '',
    actPhase: '',
    timeline: '',
    resources: '',
    successMetrics: '',
    lessonsLearned: '',
    nextSteps: ''
  })

  // Parse existing value on component mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setProject(parsed)
      } catch (error) {
        // If parsing fails, treat as legacy text format
        setProject(prev => ({ ...prev, problemStatement: value }))
      }
    }
  }, [value])

  // Update parent component when project changes
  useEffect(() => {
    onChange(JSON.stringify(project))
  }, [project, onChange])

  const updateProject = (field: keyof PDCAProject, newValue: string) => {
    setProject(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(project)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const getPDCAPhaseColor = (phase: string) => {
    switch (phase) {
      case 'plan': return 'text-blue-600'
      case 'do': return 'text-green-600'
      case 'check': return 'text-orange-600'
      case 'act': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-indigo-800">Continuous Improvement Project (PDCA Cycle)</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                  Activity
                </Badge>
                <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PDCA Overview */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-800">PDCA Cycle Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="font-semibold text-blue-600">PLAN</div>
              <div className="text-gray-600">Identify & Plan</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="font-semibold text-green-600">DO</div>
              <div className="text-gray-600">Implement</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="font-semibold text-orange-600">CHECK</div>
              <div className="text-gray-600">Measure & Analyze</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="font-semibold text-purple-600">ACT</div>
              <div className="text-gray-600">Standardize</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Project Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectTitle" className="text-sm font-medium">
              Project Title
            </Label>
            <Input
              id="projectTitle"
              placeholder="e.g., Reduce Order Wait Time, Improve Food Quality Consistency"
              value={project.projectTitle}
              onChange={(e) => updateProject('projectTitle', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemStatement" className="text-sm font-medium">
              Problem Statement
            </Label>
            <Textarea
              id="problemStatement"
              placeholder="Clearly describe the problem or opportunity for improvement. Include current state, impact, and why it needs to be addressed..."
              value={project.problemStatement}
              onChange={(e) => updateProject('problemStatement', e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-sm font-medium">
                Project Timeline
              </Label>
              <Input
                id="timeline"
                placeholder="e.g., 2 weeks, 1 month"
                value={project.timeline}
                onChange={(e) => updateProject('timeline', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resources" className="text-sm font-medium">
                Resources Needed
              </Label>
              <Input
                id="resources"
                placeholder="e.g., Team time, materials, budget"
                value={project.resources}
                onChange={(e) => updateProject('resources', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PLAN Phase */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base text-blue-600">PLAN Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="planPhase" className="text-sm font-medium">
            Planning Details (Root cause analysis, solution design, success criteria)
          </Label>
          <Textarea
            id="planPhase"
            placeholder="• What is the root cause of the problem?
• What solution will you implement?
• What are your success criteria?
• What risks do you anticipate?
• How will you measure success?"
            value={project.planPhase}
            onChange={(e) => updateProject('planPhase', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* DO Phase */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base text-green-600">DO Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="doPhase" className="text-sm font-medium">
            Implementation Details (What you did, when, who was involved)
          </Label>
          <Textarea
            id="doPhase"
            placeholder="• What specific actions did you take?
• When did you implement the changes?
• Who was involved in the implementation?
• What challenges did you encounter?
• How did you communicate the changes to your team?"
            value={project.doPhase}
            onChange={(e) => updateProject('doPhase', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* CHECK Phase */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base text-orange-600">CHECK Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="checkPhase" className="text-sm font-medium">
            Results Analysis (Data collected, results achieved, comparison to goals)
          </Label>
          <Textarea
            id="checkPhase"
            placeholder="• What data did you collect?
• What were the actual results?
• How do the results compare to your success criteria?
• What worked well? What didn't work?
• What unexpected outcomes occurred?"
            value={project.checkPhase}
            onChange={(e) => updateProject('checkPhase', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* ACT Phase */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base text-purple-600">ACT Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="actPhase" className="text-sm font-medium">
            Standardization & Next Steps (How you'll maintain improvements)
          </Label>
          <Textarea
            id="actPhase"
            placeholder="• Will you standardize this improvement? How?
• What processes or procedures need to be updated?
• How will you train others on the new approach?
• What will you do differently next time?
• How will you sustain the improvement?"
            value={project.actPhase}
            onChange={(e) => updateProject('actPhase', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Success Metrics & Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="successMetrics" className="text-sm font-medium">
            Quantifiable results and impact measurements
          </Label>
          <Textarea
            id="successMetrics"
            placeholder="Include specific metrics like time saved, cost reduction, quality improvements, customer satisfaction changes, etc..."
            value={project.successMetrics}
            onChange={(e) => updateProject('successMetrics', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Lessons Learned</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="lessonsLearned" className="text-sm font-medium">
            Key insights and learnings from this improvement project
          </Label>
          <Textarea
            id="lessonsLearned"
            placeholder="What did you learn about the improvement process? What would you do differently? What insights can be applied to future projects?"
            value={project.lessonsLearned}
            onChange={(e) => updateProject('lessonsLearned', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Next Steps & Future Improvements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="nextSteps" className="text-sm font-medium">
            What are your next steps for continuous improvement?
          </Label>
          <Textarea
            id="nextSteps"
            placeholder="Describe follow-up actions, additional improvements to pursue, and how you'll continue the improvement culture..."
            value={project.nextSteps}
            onChange={(e) => updateProject('nextSteps', e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ContinuousImprovementForm
