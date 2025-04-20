import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Copy, LayoutDashboard, Calendar } from 'lucide-react'
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex flex-col items-center">
          <Trash2 className="w-8 h-8 mb-2" />
          <p className="font-medium">Error loading templates</p>
          <p className="text-sm">{error}</p>
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Setup Sheet Templates</h1>
            <p className="text-white/90 text-sm md:text-base">Create and manage templates for your weekly setup sheets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white"
              onClick={() => navigate('/setup-sheet-builder')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Setup
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-50 border-gray-200"
          disabled
        >
          <LayoutDashboard className="w-4 h-4 text-red-600" />
          Templates
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/edit-template/new')}
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/saved-setups')}
        >
          <Calendar className="w-4 h-4" />
          Saved Setups
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <LayoutDashboard className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Templates Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first template to get started with setting up your weekly schedules.
            </p>
            <Button onClick={() => navigate('/edit-template/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Template
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
          <Card key={template._id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gray-50 border-b pb-3">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-red-600" />
                {template.name}
              </CardTitle>
              <CardDescription>
                Last updated: {format(new Date(template.updatedAt), 'PPp')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Time blocks:</p>
                {template.weekSchedule?.monday?.timeBlocks?.length > 0 ? (
                  <p className="text-sm">{template.weekSchedule.monday.timeBlocks.length} time blocks defined</p>
                ) : (
                  <p className="text-sm text-gray-400">No time blocks defined</p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => navigate(`/edit-template/${template._id}`)}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  onClick={() => handleDuplicate(template._id)}
                >
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => setTemplateToDelete(template._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  )
}