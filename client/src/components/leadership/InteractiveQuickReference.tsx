import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Target, Users, MessageSquare, BarChart3, Download, BookOpen } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SituationalLeadershipDiagram } from './SituationalLeadershipDiagram'
import { pdf } from '@react-pdf/renderer'
import { QuickReferencePDF } from './QuickReferencePDF'

interface QuickTip {
  id: string
  category: string
  situation: string
  recommendedStyle: string
  keyActions: string[]
  communicationTips: string[]
  commonMistakes: string[]
}

export const InteractiveQuickReference: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const quickTips: QuickTip[] = [
    {
      id: '1',
      category: 'New Employee',
      situation: 'First day on the job',
      recommendedStyle: 'Directing (S1)',
      keyActions: [
        'Provide detailed step-by-step instructions',
        'Stay close and monitor progress',
        'Give immediate feedback',
        'Set clear expectations'
      ],
      communicationTips: [
        'Use "Tell" approach - be specific',
        'Explain what, when, where, and how',
        'Avoid asking for opinions initially',
        'Be patient and encouraging'
      ],
      commonMistakes: [
        'Assuming they know basics',
        'Leaving them alone too soon',
        'Not checking understanding',
        'Being too hands-off'
      ]
    },
    {
      id: '2',
      category: 'Performance Issue',
      situation: 'Experienced employee making mistakes',
      recommendedStyle: 'Coaching (S2)',
      keyActions: [
        'Ask questions to understand the issue',
        'Provide guidance and support',
        'Work together to find solutions',
        'Monitor progress closely'
      ],
      communicationTips: [
        'Use "Sell" approach - explain why',
        'Ask "What do you think is happening?"',
        'Listen actively to their concerns',
        'Provide encouragement and direction'
      ],
      commonMistakes: [
        'Being too directive',
        'Not listening to their perspective',
        'Assuming they don\'t care',
        'Jumping to conclusions'
      ]
    },
    {
      id: '3',
      category: 'Motivation Issue',
      situation: 'Skilled but unmotivated team member',
      recommendedStyle: 'Supporting (S3)',
      keyActions: [
        'Listen to their concerns',
        'Encourage their ideas and input',
        'Provide emotional support',
        'Help them solve problems'
      ],
      communicationTips: [
        'Use "Participate" approach - collaborate',
        'Ask "What would help you feel better about this?"',
        'Focus on their feelings and motivation',
        'Encourage decision-making'
      ],
      commonMistakes: [
        'Being too directive',
        'Not addressing emotional needs',
        'Assuming it\'s a skill issue',
        'Not involving them in solutions'
      ]
    },
    {
      id: '4',
      category: 'High Performer',
      situation: 'Experienced, motivated team member',
      recommendedStyle: 'Delegating (S4)',
      keyActions: [
        'Give them ownership of tasks',
        'Set clear outcomes, not methods',
        'Check in periodically',
        'Provide resources they need'
      ],
      communicationTips: [
        'Use "Delegate" approach - trust them',
        'Say "I trust you to handle this"',
        'Focus on results, not process',
        'Be available when they need you'
      ],
      commonMistakes: [
        'Micromanaging their work',
        'Not giving enough autonomy',
        'Over-explaining simple tasks',
        'Not recognizing their expertise'
      ]
    },
    {
      id: '5',
      category: 'Crisis Situation',
      situation: 'Emergency or safety issue',
      recommendedStyle: 'Directing (S1)',
      keyActions: [
        'Take immediate control',
        'Give clear, direct commands',
        'Ensure safety first',
        'Debrief after the crisis'
      ],
      communicationTips: [
        'Be firm and authoritative',
        'Use short, clear commands',
        'Don\'t ask for opinions',
        'Explain reasoning later'
      ],
      commonMistakes: [
        'Hesitating to take control',
        'Asking for input during crisis',
        'Being too collaborative',
        'Not following up afterward'
      ]
    },
    {
      id: '6',
      category: 'Team Conflict',
      situation: 'Disagreement between team members',
      recommendedStyle: 'Supporting (S3)',
      keyActions: [
        'Listen to all perspectives',
        'Facilitate discussion',
        'Help them find common ground',
        'Support their solution'
      ],
      communicationTips: [
        'Ask open-ended questions',
        'Reflect what you hear',
        'Encourage them to talk to each other',
        'Focus on finding solutions together'
      ],
      commonMistakes: [
        'Taking sides immediately',
        'Imposing your solution',
        'Not letting them work it out',
        'Avoiding the conflict'
      ]
    }
  ]

  const categories = ['all', ...Array.from(new Set(quickTips.map(tip => tip.category)))]

  const filteredTips = quickTips.filter(tip => {
    const matchesSearch = tip.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.recommendedStyle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const exportReference = async () => {
    try {
      toast({
        title: 'Generating PDF...',
        description: 'Creating your professional quick reference guide.'
      })

      // Generate PDF using React PDF
      const pdfBlob = await pdf(
        <QuickReferencePDF
          quickTips={quickTips}
          exportDate={new Date().toLocaleDateString()}
        />
      ).toBlob()

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Leadership_Quick_Reference_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'PDF Reference Downloaded',
        description: 'Your professional quick reference guide has been downloaded successfully.'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your PDF reference. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getStyleColor = (style: string) => {
    if (style.includes('Directing')) return 'bg-red-100 text-red-800 border-red-200'
    if (style.includes('Coaching')) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (style.includes('Supporting')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (style.includes('Delegating')) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'New Employee': return Users
      case 'Performance Issue': return BarChart3
      case 'Motivation Issue': return Target
      case 'High Performer': return Target
      case 'Crisis Situation': return Target
      case 'Team Conflict': return MessageSquare
      default: return BookOpen
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interactive Quick Reference</h2>
            <p className="text-sm text-gray-600">Instant guidance for common leadership situations</p>
          </div>
        </div>
        <Button onClick={exportReference} size="sm" className="bg-[#E51636] hover:bg-[#c41230]">
          <Download className="h-4 w-4 mr-2" />
Export PDF
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search situations, categories, or leadership styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category ? "bg-[#E51636] hover:bg-[#c41230]" : ""}
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Situational Leadership Diagram */}
      <SituationalLeadershipDiagram />

      {/* Quick Tips Grid */}
      <div className="grid gap-4">
        {filteredTips.map((tip) => {
          const IconComponent = getCategoryIcon(tip.category)
          return (
            <Card key={tip.id} className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tip.situation}</CardTitle>
                      <Badge variant="outline" className="mt-1">{tip.category}</Badge>
                    </div>
                  </div>
                  <Badge className={`${getStyleColor(tip.recommendedStyle)} border`}>
                    {tip.recommendedStyle}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="actions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="actions">Key Actions</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                    <TabsTrigger value="mistakes">Avoid These</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-800">What to Do:</h4>
                      <ul className="space-y-1">
                        {tip.keyActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="communication" className="mt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-800">How to Communicate:</h4>
                      <ul className="space-y-1">
                        {tip.communicationTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mistakes" className="mt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Common Mistakes to Avoid:</h4>
                      <ul className="space-y-1">
                        {tip.commonMistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-red-600 mt-1">•</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTips.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-sm">Try adjusting your search terms or category filter.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
