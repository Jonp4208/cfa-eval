import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Brain, Users, Star } from 'lucide-react'

interface EmotionalIntelligencePhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

export default function EmotionalIntelligencePhilosophyForm({ value, onChange }: EmotionalIntelligencePhilosophyFormProps) {
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
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Your Emotional Intelligence Leadership Philosophy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="corePhilosophy" className="text-sm font-medium">
            Write your personal philosophy about the role of emotional intelligence in restaurant leadership
          </Label>
          <Textarea
            id="corePhilosophy"
            placeholder="Example: I believe that emotional intelligence is the foundation of effective restaurant leadership. In our fast-paced, high-stress environment, the ability to understand and manage emotions - both my own and my team's - directly impacts our success. Great restaurant leadership isn't just about operational efficiency; it's about creating an environment where people feel valued, understood, and motivated to give their best. When I lead with emotional intelligence, I can better support my team during challenging moments, celebrate successes in meaningful ways, and build the kind of workplace culture that attracts and retains exceptional people. I believe that emotions are not obstacles to overcome but valuable information that helps me make better decisions and build stronger relationships..."
            value={formData.corePhilosophy || ''}
            onChange={(e) => updateField('corePhilosophy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Emotions in Workplace */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Beliefs About Emotions in the Workplace</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="workplaceEmotions" className="text-sm font-medium">
            What do you believe about the role of emotions in restaurant operations and team dynamics?
          </Label>
          <Textarea
            id="workplaceEmotions"
            placeholder="Example: I believe emotions are an integral part of our restaurant workplace, not something to be suppressed or ignored. When team members feel positive emotions like pride, excitement, and connection, they provide better customer service and work more effectively together. When they experience stress, frustration, or sadness, these emotions affect their performance and the entire team's energy. As a leader, my role is to acknowledge emotions as valid and important, help team members process difficult emotions constructively, and create conditions that foster positive emotional experiences. I believe that when we honor the emotional dimension of work, we create a more human, sustainable, and ultimately more successful restaurant operation. Emotions provide valuable feedback about what's working and what needs attention in our workplace..."
            value={formData.workplaceEmotions || ''}
            onChange={(e) => updateField('workplaceEmotions', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* EQ Development Commitment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Commitment to Developing Team EQ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="teamEQDevelopment" className="text-sm font-medium">
            How will you help your team develop emotional intelligence skills and create an emotionally intelligent workplace?
          </Label>
          <Textarea
            id="teamEQDevelopment"
            placeholder="Example: I commit to helping my team develop emotional intelligence by modeling it myself and creating learning opportunities for them. I will regularly check in with team members about how they're feeling, not just how they're performing. I'll teach simple emotional regulation techniques during team meetings and help team members recognize their emotional patterns and triggers. I'll encourage empathy by helping team members understand different perspectives during conflicts and celebrate when they demonstrate emotional intelligence in customer interactions. I'll create a psychologically safe environment where team members can express emotions appropriately and ask for support when needed. I believe that by investing in my team's emotional intelligence, I'm not only helping them become better employees but better people, which ultimately benefits our restaurant, our customers, and their personal lives..."
            value={formData.teamEQDevelopment || ''}
            onChange={(e) => updateField('teamEQDevelopment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Ongoing Development Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Personal EQ Development Commitment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="personalDevelopment" className="text-sm font-medium">
            How will you continue developing your own emotional intelligence as a restaurant leader?
          </Label>
          <Textarea
            id="personalDevelopment"
            placeholder="Example: I commit to making emotional intelligence development a lifelong journey, not a destination. I will practice daily self-reflection, asking myself how my emotions affected my leadership decisions and interactions. I'll seek feedback from my team about my emotional impact and remain open to learning about my blind spots. I'll continue reading about emotional intelligence, attending workshops when possible, and practicing new techniques for managing stress and building relationships. I'll work with a mentor or coach to help me grow in areas where I struggle, particularly in difficult conversations and conflict resolution. I'll measure my progress not just by operational metrics but by the emotional health and satisfaction of my team. I believe that as I become more emotionally intelligent, I become a more effective leader and create a better workplace for everyone. This is an investment in both my personal growth and the success of our restaurant..."
            value={formData.personalDevelopment || ''}
            onChange={(e) => updateField('personalDevelopment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
