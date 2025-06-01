import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Thermometer, Users, TrendingUp, Target } from 'lucide-react'

interface TeamEmotionalClimateFormProps {
  value: string
  onChange: (value: string) => void
}

export default function TeamEmotionalClimateForm({ value, onChange }: TeamEmotionalClimateFormProps) {
  const parseValue = (val: string) => {
    try {
      return JSON.parse(val || '{}')
    } catch {
      return {}
    }
  }

  const formData = parseValue(value)

  const updateField = (field: string, fieldValue: string) => {
    const updated = { ...formData, [field]: fieldValue }
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-4">
      {/* Current Emotional Climate */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Current Team Emotional Climate Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="currentClimate" className="text-sm font-medium">
            Assess the current emotional climate of your team across different dimensions
          </Label>
          <Textarea
            id="currentClimate"
            placeholder="Example: OVERALL ENERGY LEVEL (7/10) - Team generally has good energy, especially during slower periods. Energy drops during very busy times but recovers quickly. STRESS LEVELS (6/10) - Moderate stress during peak hours, but most team members handle it well. A few individuals show signs of chronic stress. TEAM COHESION (8/10) - Strong relationships between most team members. Some cliques forming but generally supportive environment. COMMUNICATION OPENNESS (5/10) - Team members comfortable talking about work issues but hesitant to share personal concerns or give feedback to peers. OPTIMISM/POSITIVITY (7/10) - Generally positive attitude, team celebrates successes together. Some negativity around scheduling and workload. TRUST LEVELS (6/10) - Team trusts me as leader, moderate trust between team members. Some gossip and side conversations indicate trust gaps. EMOTIONAL SUPPORT (5/10) - Team helps each other during busy periods but limited emotional support during personal challenges..."
            value={formData.currentClimate || ''}
            onChange={(e) => updateField('currentClimate', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Stress Sources */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Sources of Team Stress & Negative Energy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="stressSources" className="text-sm font-medium">
            Identify the main sources of stress and negative emotions affecting your team
          </Label>
          <Textarea
            id="stressSources"
            placeholder="Example: OPERATIONAL STRESSORS: 1. Equipment Failures - POS system crashes and fryer issues create immediate stress and frustration for entire team. 2. Understaffing - When team members call out, remaining staff feel overwhelmed and resentful. 3. Rush Period Chaos - Lack of clear systems during busy times leads to confusion and tension. INTERPERSONAL STRESSORS: 1. Unequal Workload - Some team members feel others don't pull their weight, creating resentment. 2. Communication Gaps - Kitchen and front-of-house miscommunications cause frustration and blame. 3. Personality Conflicts - Two team members have ongoing tension that affects group dynamics. MANAGEMENT STRESSORS: 1. Unclear Expectations - Team unsure about performance standards and priorities. 2. Inconsistent Feedback - Some team members feel they don't know how they're doing. 3. Limited Growth Opportunities - Ambitious team members frustrated by lack of advancement paths. EXTERNAL STRESSORS: 1. Difficult Customers - Rude or demanding customers affect team morale. 2. Corporate Pressure - Sales targets and district manager visits create anxiety..."
            value={formData.stressSources || ''}
            onChange={(e) => updateField('stressSources', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Positive Energy Sources */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Sources of Positive Energy & Motivation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="positiveEnergy" className="text-sm font-medium">
            Identify what currently creates positive energy and motivation in your team
          </Label>
          <Textarea
            id="positiveEnergy"
            placeholder="Example: ACHIEVEMENT & RECOGNITION: 1. Customer Compliments - Team gets energized when customers praise their service or food quality. 2. Sales Goals - Hitting daily or weekly targets creates team celebration and pride. 3. Individual Recognition - Public praise for exceptional performance boosts morale. RELATIONSHIPS & TEAMWORK: 1. Helping Each Other - Team members feel good when they successfully support colleagues during busy periods. 2. Shared Humor - Inside jokes and laughter during slower periods build bonds. 3. New Team Member Success - Everyone feels proud when new hires succeed and fit in well. PERSONAL GROWTH: 1. Skill Development - Team members excited about learning new positions or responsibilities. 2. Problem Solving - Satisfaction when team works together to solve operational challenges. 3. Leadership Opportunities - Enthusiasm when given chance to train others or lead projects. WORK ENVIRONMENT: 1. Fair Treatment - Appreciation for consistent, fair scheduling and policies. 2. Flexibility - Gratitude when personal needs are accommodated. 3. Fun Atmosphere - Enjoyment of work when environment is relaxed and positive..."
            value={formData.positiveEnergy || ''}
            onChange={(e) => updateField('positiveEnergy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Improvement Action Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Emotional Climate Improvement Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="improvementPlan" className="text-sm font-medium">
            Create specific strategies to improve your team's emotional climate over the next 60 days
          </Label>
          <Textarea
            id="improvementPlan"
            placeholder="Example: IMMEDIATE ACTIONS (Week 1-2): 1. Address Equipment Issues - Schedule POS system maintenance and fryer repair to reduce operational stress. 2. Improve Communication - Implement daily huddles and kitchen-FOH communication protocols. 3. Recognize Positive Energy - Start daily practice of acknowledging one team member's contribution. SHORT-TERM GOALS (Week 3-8): 1. Stress Reduction - Teach team simple stress management techniques, create 'reset moments' during busy periods. 2. Team Building - Plan monthly team activity, implement peer recognition system. 3. Clear Expectations - Create written performance standards and provide regular feedback. 4. Conflict Resolution - Address personality conflicts through mediation and clear boundaries. LONG-TERM VISION (Month 3-4): 1. Emotional Intelligence Training - Teach team to recognize and manage emotions effectively. 2. Support Systems - Create peer support partnerships and emotional check-in routines. 3. Culture Development - Establish team values around mutual support and positive communication. MEASUREMENT: Monthly team satisfaction surveys, observation of energy levels, tracking of conflicts and celebrations..."
            value={formData.improvementPlan || ''}
            onChange={(e) => updateField('improvementPlan', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
