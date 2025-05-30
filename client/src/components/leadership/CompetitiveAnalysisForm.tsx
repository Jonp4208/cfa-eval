import React, { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  DollarSign, 
  Users, 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  MapPin,
  Clock,
  Utensils,
  Award,
  Eye
} from 'lucide-react'

interface CompetitiveAnalysisFormProps {
  value: string
  onChange: (value: string) => void
}

interface Competitor {
  name: string
  location: string
  menuOfferings: string
  pricing: string
  serviceStyle: string
  targetCustomers: string
  strengths: string
  weaknesses: string
  marketPosition: string
}

const CompetitiveAnalysisForm: React.FC<CompetitiveAnalysisFormProps> = ({ value, onChange }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: '', location: '', menuOfferings: '', pricing: '', serviceStyle: '', targetCustomers: '', strengths: '', weaknesses: '', marketPosition: '' },
    { name: '', location: '', menuOfferings: '', pricing: '', serviceStyle: '', targetCustomers: '', strengths: '', weaknesses: '', marketPosition: '' },
    { name: '', location: '', menuOfferings: '', pricing: '', serviceStyle: '', targetCustomers: '', strengths: '', weaknesses: '', marketPosition: '' },
    { name: '', location: '', menuOfferings: '', pricing: '', serviceStyle: '', targetCustomers: '', strengths: '', weaknesses: '', marketPosition: '' },
    { name: '', location: '', menuOfferings: '', pricing: '', serviceStyle: '', targetCustomers: '', strengths: '', weaknesses: '', marketPosition: '' }
  ])
  const [marketGaps, setMarketGaps] = useState<string>('')
  const [opportunities, setOpportunities] = useState<string>('')
  const [threats, setThreats] = useState<string>('')
  const [strategicRecommendations, setStrategicRecommendations] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('competitor-0')

  // Parse the initial value if it exists
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = JSON.parse(value)
        if (parsedValue.competitors) {
          setCompetitors(parsedValue.competitors)
        }
        setMarketGaps(parsedValue.marketGaps || '')
        setOpportunities(parsedValue.opportunities || '')
        setThreats(parsedValue.threats || '')
        setStrategicRecommendations(parsedValue.strategicRecommendations || '')
      } catch (e) {
        // If parsing fails, keep default state
      }
    }
  }, [])

  // Update the parent component with the structured data
  useEffect(() => {
    const formData = JSON.stringify({
      competitors,
      marketGaps,
      opportunities,
      threats,
      strategicRecommendations
    })
    onChange(formData)
  }, [competitors, marketGaps, opportunities, threats, strategicRecommendations, onChange])

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const updatedCompetitors = [...competitors]
    updatedCompetitors[index] = { ...updatedCompetitors[index], [field]: value }
    setCompetitors(updatedCompetitors)
  }

  const getCompletionStatus = (competitor: Competitor) => {
    const fields = Object.values(competitor)
    const completedFields = fields.filter(field => field.trim().length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5" />
          <p className="font-medium">Competitive Analysis Framework</p>
        </div>
        <p>Analyze your 5 most direct competitors to identify market opportunities and strategic positioning. This comprehensive analysis will help you understand your competitive landscape and find ways to differentiate your restaurant.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {competitors.map((competitor, index) => (
            <TabsTrigger 
              key={index} 
              value={`competitor-${index}`}
              className="text-xs"
            >
              <div className="flex flex-col items-center gap-1">
                <span>#{index + 1}</span>
                {competitor.name && (
                  <Badge variant="secondary" className="text-xs px-1">
                    {getCompletionStatus(competitor)}%
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
          <TabsTrigger value="analysis" className="text-xs">
            <div className="flex flex-col items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Analysis</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {competitors.map((competitor, index) => (
          <TabsContent key={index} value={`competitor-${index}`} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  Competitor #{index + 1} Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="text-sm font-medium">Restaurant Name *</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="e.g., McDonald's, Subway, Local Burger Joint"
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`location-${index}`} className="text-sm font-medium">Location/Distance</Label>
                    <Input
                      id={`location-${index}`}
                      placeholder="e.g., 0.5 miles away, Same shopping center"
                      value={competitor.location}
                      onChange={(e) => updateCompetitor(index, 'location', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Menu & Pricing */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`menu-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Menu Offerings & Specialties
                    </Label>
                    <Textarea
                      id={`menu-${index}`}
                      placeholder="Describe their menu items, specialties, variety, quality, unique offerings, dietary options, etc."
                      value={competitor.menuOfferings}
                      onChange={(e) => updateCompetitor(index, 'menuOfferings', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`pricing-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pricing Strategy & Value
                    </Label>
                    <Textarea
                      id={`pricing-${index}`}
                      placeholder="Average meal cost, pricing strategy (premium/value/budget), portion sizes, value perception, promotions, etc."
                      value={competitor.pricing}
                      onChange={(e) => updateCompetitor(index, 'pricing', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                {/* Service & Customers */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`service-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Service Style & Experience
                    </Label>
                    <Textarea
                      id={`service-${index}`}
                      placeholder="Fast food, fast casual, full service, counter service, drive-thru, delivery, atmosphere, speed, hospitality level, etc."
                      value={competitor.serviceStyle}
                      onChange={(e) => updateCompetitor(index, 'serviceStyle', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`customers-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Target Customers & Demographics
                    </Label>
                    <Textarea
                      id={`customers-${index}`}
                      placeholder="Who do they primarily serve? Age groups, income levels, families, business people, students, etc."
                      value={competitor.targetCustomers}
                      onChange={(e) => updateCompetitor(index, 'targetCustomers', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`strengths-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500" />
                      Key Strengths
                    </Label>
                    <Textarea
                      id={`strengths-${index}`}
                      placeholder="What do they do really well? Brand recognition, food quality, speed, convenience, price, location, etc."
                      value={competitor.strengths}
                      onChange={(e) => updateCompetitor(index, 'strengths', e.target.value)}
                      className="min-h-[100px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`weaknesses-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Notable Weaknesses
                    </Label>
                    <Textarea
                      id={`weaknesses-${index}`}
                      placeholder="Where do they fall short? Long wait times, limited menu, poor service, high prices, outdated facilities, etc."
                      value={competitor.weaknesses}
                      onChange={(e) => updateCompetitor(index, 'weaknesses', e.target.value)}
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                </div>

                {/* Market Position */}
                <div className="space-y-2">
                  <Label htmlFor={`position-${index}`} className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Market Position & Competitive Advantage
                  </Label>
                  <Textarea
                    id={`position-${index}`}
                    placeholder="How do they position themselves in the market? What's their main competitive advantage? How do customers perceive them?"
                    value={competitor.marketPosition}
                    onChange={(e) => updateCompetitor(index, 'marketPosition', e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Market Analysis & Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Gaps */}
              <div className="space-y-2">
                <Label htmlFor="market-gaps" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Market Gaps & Unmet Needs
                </Label>
                <Textarea
                  id="market-gaps"
                  placeholder="What customer needs are not being met by competitors? What menu items, services, or experiences are missing from the market? Where do you see opportunities?"
                  value={marketGaps}
                  onChange={(e) => setMarketGaps(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>

              {/* Opportunities */}
              <div className="space-y-2">
                <Label htmlFor="opportunities" className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  Strategic Opportunities for Your Restaurant
                </Label>
                <Textarea
                  id="opportunities"
                  placeholder="Based on competitor analysis, what opportunities can your restaurant pursue? How can you differentiate? What competitive advantages can you build?"
                  value={opportunities}
                  onChange={(e) => setOpportunities(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>

              {/* Threats */}
              <div className="space-y-2">
                <Label htmlFor="threats" className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Competitive Threats & Challenges
                </Label>
                <Textarea
                  id="threats"
                  placeholder="What competitive threats should you be aware of? Which competitors pose the biggest challenge? What market trends could impact your business?"
                  value={threats}
                  onChange={(e) => setThreats(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>

              {/* Strategic Recommendations */}
              <div className="space-y-2">
                <Label htmlFor="recommendations" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Strategic Recommendations & Action Items
                </Label>
                <Textarea
                  id="recommendations"
                  placeholder="Based on this analysis, what specific actions should your restaurant take? Menu changes, service improvements, pricing adjustments, marketing strategies, etc."
                  value={strategicRecommendations}
                  onChange={(e) => setStrategicRecommendations(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CompetitiveAnalysisForm
