import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { TemplateBuilder } from '@/components/setup-sheet/TemplateBuilder'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'

export function EditTemplate() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { templates, fetchTemplates, isLoading } = useSetupSheetStore()
  const [template, setTemplate] = useState<any>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // Check if this is a new template
        if (id === 'new') {
          // Create an empty template structure
          setTemplate({
            name: 'New Template',
            weekSchedule: {
              monday: { timeBlocks: [] },
              tuesday: { timeBlocks: [] },
              wednesday: { timeBlocks: [] },
              thursday: { timeBlocks: [] },
              friday: { timeBlocks: [] },
              saturday: { timeBlocks: [] },
              sunday: { timeBlocks: [] }
            }
          })
          return
        }

        // If templates are not loaded yet, fetch them
        if (templates.length === 0) {
          await fetchTemplates()
        }

        // Find the template with the matching ID
        const foundTemplate = templates.find(t => t._id === id)
        if (foundTemplate) {
          setTemplate(foundTemplate)
        } else {
          toast({
            title: 'Error',
            description: 'Template not found',
            variant: 'destructive'
          })
          navigate('/setup-sheet-templates')
        }
      } catch (error) {
        console.error('Error loading template:', error)
        toast({
          title: 'Error',
          description: 'Failed to load template',
          variant: 'destructive'
        })
      }
    }

    loadTemplate()
  }, [id, templates, fetchTemplates, navigate, toast])

  if (isLoading || !template) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-20 sm:pb-4 space-y-6">
      {/* Enhanced header with gradient */}
      <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {id === 'new' ? 'Create New Template' : `Edit Template: ${template.name}`}
            </h1>
            <p className="text-white/90 text-sm md:text-base">
              {id === 'new' ? 'Create a new template for your weekly setup sheets' : 'Modify your existing template'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white"
              onClick={() => navigate('/setup-sheet-templates')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 shadow-sm">
        <TemplateBuilder initialTemplate={template} />
      </Card>
    </div>
  )
}
