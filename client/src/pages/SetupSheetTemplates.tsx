import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Copy } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { useSetupSheetStore } from '@/stores/setupSheetStore'

export function SetupSheetTemplates() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    templates,
    isLoading,
    error,
    templateToDelete,
    setTemplateToDelete,
    fetchTemplates,
    deleteTemplate,
    createTemplate
  } = useSetupSheetStore()

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleDelete = async () => {
    if (!templateToDelete) return
    await deleteTemplate(templateToDelete)
    setTemplateToDelete(null)
  }

  const handleDuplicate = async (templateId: string) => {
    const template = templates.find(t => t._id === templateId)
    if (!template) return

    await createTemplate({
      name: `${template.name} (Copy)`,
      weekSchedule: template.weekSchedule
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Setup Sheet Templates</h1>
        <Button onClick={() => navigate('/setup-sheet-builder')}>
          <Plus className="w-4 h-4 mr-2" />
          New Setup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template._id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                Last updated: {format(new Date(template.updatedAt), 'PPp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/edit-template/${template._id}`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template._id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateToDelete(template._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}