import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Download, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SituationalLeadershipDiagram } from './SituationalLeadershipDiagram'
import { pdf } from '@react-pdf/renderer'
import { CommunicationGuidePDF } from './CommunicationGuidePDF'

interface CommunicationExample {
  situation: string
  directing: string
  coaching: string
  supporting: string
  delegating: string
}

export const InteractiveCommunicationGuide: React.FC = () => {
  const { toast } = useToast()
  const [customSituation, setCustomSituation] = useState('')
  const [customExamples, setCustomExamples] = useState<CommunicationExample>({
    situation: '',
    directing: '',
    coaching: '',
    supporting: '',
    delegating: ''
  })

  const [savedExamples, setSavedExamples] = useState<CommunicationExample[]>([])

  const prebuiltExamples: CommunicationExample[] = [
    {
      situation: "New team member learning to take orders",
      directing: "Follow these exact steps: greet the guest, ask for their order, repeat it back, enter it in the system, and tell them the total. Watch me do it first, then you'll practice.",
      coaching: "Let me show you the order-taking process and explain why each step matters for guest satisfaction. What questions do you have about greeting guests? Let's practice together.",
      supporting: "You're getting better at taking orders! What part feels most challenging right now? How can I help you feel more confident with difficult orders?",
      delegating: "You've got order-taking down well. Handle the next few customers on your own. Let me know if you need anything, but I trust your judgment."
    },
    {
      situation: "Team member making repeated mistakes",
      directing: "I need you to follow the procedure exactly as written. Here's what you need to do differently: [specific steps]. I'll check back in 30 minutes to see your progress.",
      coaching: "I've noticed some mistakes in your work. Let's talk about what's happening and figure out how to prevent them. What do you think is causing the issues?",
      supporting: "I know you want to do well, and I believe you can. What support do you need to feel more confident? Let's work together to solve this.",
      delegating: "I trust you to figure out the best approach to improve your accuracy. What's your plan, and how can I support you?"
    },
    {
      situation: "Busy rush period with long wait times",
      directing: "Everyone focus on speed. Sarah, you're on register 1. Mike, help with bagging. Follow the rush procedures exactly. No deviations.",
      coaching: "We're getting busy. Let's use our rush strategies. Sarah, what's your plan for managing the line? Mike, how can you best support the team right now?",
      supporting: "I know this is stressful, but you're all doing great. What do you need from me to help manage this rush? How are you feeling about the pace?",
      delegating: "You all know what to do during rush. Take the lead on managing your stations. I'm here if you need me, but I trust your experience."
    }
  ]

  const addCustomExample = () => {
    if (customExamples.situation.trim() === '') {
      toast({
        title: 'Missing Information',
        description: 'Please enter a situation before saving.',
        variant: 'destructive'
      })
      return
    }

    setSavedExamples([...savedExamples, { ...customExamples }])
    setCustomExamples({
      situation: '',
      directing: '',
      coaching: '',
      supporting: '',
      delegating: ''
    })
    
    toast({
      title: 'Example Saved',
      description: 'Your communication example has been added to your collection.'
    })
  }

  const copyToClipboard = (text: string, style: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: `${style} communication example copied to clipboard.`
    })
  }

  const exportExamples = async () => {
    const allExamples = [...prebuiltExamples, ...savedExamples]

    if (allExamples.length === 0) {
      toast({
        title: 'No Examples to Export',
        description: 'Create some communication examples before exporting.',
        variant: 'destructive'
      })
      return
    }

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Creating your professional communication guide.'
      })

      // Generate PDF using React PDF
      const pdfBlob = await pdf(
        <CommunicationGuidePDF
          examples={allExamples}
          exportDate={new Date().toLocaleDateString()}
          customExamplesCount={savedExamples.length}
        />
      ).toBlob()

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Communication_Style_Guide_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'PDF Guide Downloaded',
        description: 'Your professional communication guide has been downloaded successfully.'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your PDF guide. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const generateSuggestion = (style: string, situation: string) => {
    const suggestions = {
      directing: [
        `For "${situation}": Give clear, specific instructions. Tell them exactly what to do and when. Monitor closely and provide immediate feedback.`,
        `Approach: Be direct and specific. "Here's exactly what you need to do..." Focus on the task, not the person.`,
        `Key phrases: "Follow these steps...", "I need you to...", "The procedure is...", "Do this first, then..."`
      ],
      coaching: [
        `For "${situation}": Explain the why behind actions. Ask questions to check understanding. Provide guidance while building their confidence.`,
        `Approach: Be supportive but directive. "Let me explain why we do this..." Encourage questions and practice.`,
        `Key phrases: "Here's why this matters...", "What questions do you have?", "Let's practice together...", "How does this feel?"`
      ],
      supporting: [
        `For "${situation}": Listen to their concerns. Encourage their ideas. Provide emotional support while they work through challenges.`,
        `Approach: Be encouraging and collaborative. "What do you think?" Focus on building confidence and motivation.`,
        `Key phrases: "What's your opinion?", "How can I help?", "You're doing well...", "What would work better?"`
      ],
      delegating: [
        `For "${situation}": Give them ownership. Set clear expectations but let them determine the how. Check in periodically.`,
        `Approach: Be hands-off but available. "I trust you to handle this." Focus on outcomes, not methods.`,
        `Key phrases: "You've got this...", "What's your plan?", "I trust your judgment...", "Let me know if you need anything"`
      ]
    }

    const styleKey = style.toLowerCase() as keyof typeof suggestions
    const randomSuggestion = suggestions[styleKey][Math.floor(Math.random() * suggestions[styleKey].length)]
    
    return randomSuggestion
  }

  const getStyleColor = (style: string) => {
    const colors = {
      directing: 'bg-red-100 text-red-800 border-red-200',
      coaching: 'bg-orange-100 text-orange-800 border-orange-200',
      supporting: 'bg-blue-100 text-blue-800 border-blue-200',
      delegating: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[style.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interactive Communication Style Guide</h2>
            <p className="text-sm text-gray-600">Learn and practice adapting your communication for each leadership style</p>
          </div>
        </div>
        <Button
          onClick={exportExamples}
          size="sm"
          className="bg-[#E51636] hover:bg-[#c41230]"
        >
          <Download className="h-4 w-4 mr-2" />
Export PDF
        </Button>
      </div>

      {/* Situational Leadership Diagram */}
      <SituationalLeadershipDiagram />

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="examples">Example Scenarios</TabsTrigger>
          <TabsTrigger value="practice">Practice Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid gap-4">
            {prebuiltExamples.map((example, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg">{example.situation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['directing', 'coaching', 'supporting', 'delegating'] as const).map((style) => (
                      <div key={style} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getStyleColor(style)} border capitalize`}>
                            {style}
                          </Badge>
                          <Button
                            onClick={() => copyToClipboard(example[style], style)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                          "{example[style]}"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {savedExamples.map((example, index) => (
              <Card key={`custom-${index}`} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{example.situation}</CardTitle>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">Custom</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['directing', 'coaching', 'supporting', 'delegating'] as const).map((style) => (
                      <div key={style} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getStyleColor(style)} border capitalize`}>
                            {style}
                          </Badge>
                          <Button
                            onClick={() => copyToClipboard(example[style], style)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                          "{example[style] || 'No example provided'}"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Own Communication Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="situation">Situation Description</Label>
                <Input
                  id="situation"
                  placeholder="Describe a specific situation you encounter with your team..."
                  value={customExamples.situation}
                  onChange={(e) => setCustomExamples({...customExamples, situation: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['directing', 'coaching', 'supporting', 'delegating'] as const).map((style) => (
                  <div key={style} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize font-medium">{style} Style</Label>
                      <Button
                        onClick={() => {
                          if (customExamples.situation.trim()) {
                            const suggestion = generateSuggestion(style, customExamples.situation)
                            setCustomExamples({...customExamples, [style]: suggestion})
                          } else {
                            toast({
                              title: 'Add Situation First',
                              description: 'Please describe the situation before generating suggestions.',
                              variant: 'destructive'
                            })
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Suggest
                      </Button>
                    </div>
                    <Textarea
                      placeholder={`How would you communicate using the ${style} style?`}
                      value={customExamples[style]}
                      onChange={(e) => setCustomExamples({...customExamples, [style]: e.target.value})}
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                ))}
              </div>

              <Button onClick={addCustomExample} className="w-full">
                Save Communication Example
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
