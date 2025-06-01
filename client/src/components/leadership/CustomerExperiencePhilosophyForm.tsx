import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Target, Users, Star } from 'lucide-react'

interface CustomerExperiencePhilosophyFormProps {
  value: string
  onChange: (value: string) => void
}

export default function CustomerExperiencePhilosophyForm({ value, onChange }: CustomerExperiencePhilosophyFormProps) {
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
            <CardTitle className="text-base">Your Customer Experience Philosophy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="corePhilosophy" className="text-sm font-medium">
            Write your personal philosophy about customer experience. What do you believe about creating exceptional experiences?
          </Label>
          <Textarea
            id="corePhilosophy"
            placeholder="Example: I believe that exceptional customer experience is about creating emotional connections that go beyond the transaction. Every guest who enters our restaurant should feel valued, welcomed, and cared for as an individual. Great customer experience happens when we anticipate needs, exceed expectations, and make people feel like they matter. It's not just about perfect food or fast service - it's about creating moments that make people smile, feel appreciated, and want to return. I believe that when we genuinely care about our guests' happiness, everything else follows..."
            value={formData.corePhilosophy || ''}
            onChange={(e) => updateField('corePhilosophy', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Hospitality Beliefs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-base">Hospitality & Service Excellence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="hospitalityBeliefs" className="text-sm font-medium">
            What does hospitality mean to you, and how do you define service excellence in your restaurant?
          </Label>
          <Textarea
            id="hospitalityBeliefs"
            placeholder="Example: Hospitality is the art of making people feel at home when they're away from home. It's about genuine warmth, authentic care, and creating an atmosphere where guests feel comfortable and valued. Service excellence means consistently delivering on our promises while looking for opportunities to surprise and delight. It's about attention to detail, anticipating needs, and recovering gracefully when things don't go perfectly. True hospitality comes from the heart - it can't be scripted or faked. It's about seeing each guest as a person with their own story, needs, and desires..."
            value={formData.hospitalityBeliefs || ''}
            onChange={(e) => updateField('hospitalityBeliefs', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Memorable Experiences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Creating Memorable Experiences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="memorableExperiences" className="text-sm font-medium">
            How do you approach creating memorable experiences that turn first-time guests into loyal customers?
          </Label>
          <Textarea
            id="memorableExperiences"
            placeholder="Example: I believe memorable experiences come from unexpected moments of care and attention. It's remembering a regular customer's name and order, celebrating special occasions without being asked, or going out of our way to accommodate special requests. I focus on training my team to notice details - the guest who seems stressed, the child who's excited about their first visit, the couple celebrating an anniversary. We create memories by being present, engaged, and genuinely interested in making people happy. Small gestures often have the biggest impact - a handwritten thank you note, a complimentary dessert, or simply taking time to have a real conversation..."
            value={formData.memorableExperiences || ''}
            onChange={(e) => updateField('memorableExperiences', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Leadership Commitment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Leadership Commitment to Excellence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="leadershipCommitment" className="text-sm font-medium">
            As a leader, how will you personally model and drive customer experience excellence in your restaurant?
          </Label>
          <Textarea
            id="leadershipCommitment"
            placeholder="Example: As a leader, I commit to being the example of the customer experience I want to see. I will greet guests personally, engage in genuine conversations, and show my team what exceptional service looks like. I'll invest in my team's development, giving them the tools, training, and empowerment they need to create great experiences. I'll celebrate customer experience wins publicly and use failures as learning opportunities. I'll regularly walk the floor, observe interactions, and provide coaching in real-time. Most importantly, I'll create a culture where taking care of guests is our highest priority, and I'll remove any barriers that prevent my team from delivering exceptional service..."
            value={formData.leadershipCommitment || ''}
            onChange={(e) => updateField('leadershipCommitment', e.target.value)}
            className="min-h-[120px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}
