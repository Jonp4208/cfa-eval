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
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/setup-sheet-templates')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Create New Template' : `Edit Template: ${template.name}`}
        </h1>
      </div>

      <Card className="p-6">
        <TemplateBuilder initialTemplate={template} />
      </Card>
    </div>
  )
}
