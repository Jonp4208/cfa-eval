import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Scale, Heart, Users, Target } from 'lucide-react'

interface ConflictResolutionPhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

export default function ConflictResolutionPhilosophyForm({ value, onChange }: ConflictResolutionPhilosophyFormProps) {
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
      {/* Core Philosophy */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Your Conflict Resolution Philosophy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="corePhilosophy" className="text-sm font-medium">
            Write your personal philosophy about conflict resolution and problem-solving in restaurant leadership
          </Label>
          <Textarea
            id="corePhilosophy"
            placeholder="Example: I believe that conflict is a natural part of any workplace where passionate people work closely together under pressure. Rather than viewing conflict as something to avoid or suppress, I see it as an opportunity for growth, understanding, and improvement. My role as a leader is not to eliminate all conflict, but to help people navigate it constructively. I believe that most conflicts arise from unmet needs, miscommunication, or unclear expectations rather than from people being inherently difficult. When I approach conflict with curiosity instead of judgment, I can usually find solutions that address everyone's core concerns. I'm committed to creating an environment where people feel safe to express disagreements and work through them together, because I believe this leads to stronger relationships and better solutions than avoiding difficult conversations..."
            value={formData.corePhilosophy || ''}
            onChange={(e) => updateField('corePhilosophy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Fairness & Justice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Beliefs About Fairness & Justice</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="fairnessBeliefs" className="text-sm font-medium">
            What do you believe about fairness, justice, and treating people equitably during conflicts?
          </Label>
          <Textarea
            id="fairnessBeliefs"
            placeholder="Example: I believe that fairness doesn't always mean treating everyone exactly the same, but rather treating everyone according to their needs and circumstances while maintaining consistent principles. In conflict resolution, fairness means giving all parties equal opportunity to be heard, understood, and respected. It means focusing on behaviors and impacts rather than making character judgments. I believe in restorative justice - helping people understand how their actions affected others and finding ways to repair relationships rather than just punishing wrongdoing. I'm committed to examining my own biases and ensuring that my personal relationships with team members don't influence how I handle conflicts. True fairness sometimes requires making difficult decisions that disappoint people in the short term but serve the greater good of the team and restaurant. I believe that when people trust that I will be fair and consistent, they're more likely to come to me with problems before they escalate..."
            value={formData.fairnessBeliefs || ''}
            onChange={(e) => updateField('fairnessBeliefs', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Collaboration & Relationships */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Collaboration & Relationship Preservation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="collaborationApproach" className="text-sm font-medium">
            How do you balance resolving conflicts with maintaining positive working relationships?
          </Label>
          <Textarea
            id="collaborationApproach"
            placeholder="Example: I believe that preserving and strengthening relationships should be a primary goal of conflict resolution, not just solving the immediate problem. I approach conflicts with the mindset that everyone involved will continue working together, so the solution needs to help them collaborate more effectively in the future. I encourage people to separate the person from the problem - we can disagree with someone's actions while still respecting them as a person. I try to help conflicting parties find common ground and shared goals before addressing their differences. I believe in collaborative problem-solving where the people involved in the conflict help create the solution, because they're more likely to commit to something they helped design. When relationships have been damaged, I focus on helping people understand each other's perspectives and find ways to rebuild trust. I'm willing to invest time in relationship repair because I know that unresolved relationship issues will continue to create problems for the team..."
            value={formData.collaborationApproach || ''}
            onChange={(e) => updateField('collaborationApproach', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Leadership Commitment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Leadership Commitment to Conflict Resolution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="leadershipCommitment" className="text-sm font-medium">
            What is your commitment as a leader to handling conflicts and building a harmonious workplace?
          </Label>
          <Textarea
            id="leadershipCommitment"
            placeholder="Example: As a restaurant leader, I commit to being proactive about conflict resolution rather than reactive. I will address conflicts early before they escalate and damage relationships or affect customer service. I commit to remaining neutral and fair, even when it's difficult or when I have personal preferences. I will continue developing my conflict resolution skills through training, practice, and seeking feedback from my team. I promise to create a safe environment where people can bring conflicts to me without fear of retaliation or judgment. I will model the behavior I want to see - addressing my own conflicts directly and respectfully, admitting when I'm wrong, and showing how to disagree without being disagreeable. I commit to following up on conflict resolutions to ensure they're working and relationships are healing. Most importantly, I will remember that my role is to serve my team by helping them work together effectively, and that sometimes means having difficult conversations and making tough decisions for the greater good of our restaurant family..."
            value={formData.leadershipCommitment || ''}
            onChange={(e) => updateField('leadershipCommitment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
