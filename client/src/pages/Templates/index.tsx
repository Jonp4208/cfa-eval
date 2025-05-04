// client/src/pages/Templates/index.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  FileText,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Copy,
  ArrowUpDown,
  Filter,
  ChevronDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import PageHeader from '@/components/PageHeader';

interface Template {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  lastModified: string;
  createdBy: {
    name: string;
  };
  usageCount: number;
  sectionsCount: number;
  criteriaCount: number;
}

type SortField = 'name' | 'date' | 'usage';
type SortOrder = 'asc' | 'desc';

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ['templates', statusFilter],
    queryFn: async () => {
      try {
        const response = await api.get('/api/templates', {
          params: { status: statusFilter }
        });
        return response.data.templates;
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        throw err;
      }
    }
  });

  // Handle error state in the UI
  if (error instanceof Error) {
    handleError({ message: error.message });
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
              <h1 className="text-xl font-semibold mb-2">Error Loading Templates</h1>
              <p className="text-gray-600 mb-4">There was a problem loading the templates. Please try again later.</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const sortTemplates = (a: Template, b: Template) => {
    switch (sortField) {
      case 'name':
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'date':
        return sortOrder === 'asc'
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'usage':
        return sortOrder === 'asc'
          ? a.usageCount - b.usageCount
          : b.usageCount - a.usageCount;
      default:
        return 0;
    }
  };

  const filteredTemplates = templates
    ?.filter((template: Template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(sortTemplates);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await api.delete(`/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
        duration: 5000,
      });
      setTemplateToDelete(null);
    },
    onError: (error: any) => {
      handleError(error);
    }
  });

  // Add copy mutation
  const copyMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await api.post(`/api/templates/${templateId}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template copied successfully",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      handleError(error);
    }
  });

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  const handleCopy = async (templateId: string) => {
    try {
      await copyMutation.mutateAsync(templateId);
    } catch (error) {
      console.error('Error copying template:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Use PageHeader instead of custom header */}
        <PageHeader
          title="Evaluation Templates"
          subtitle="Create and manage evaluation forms"
          icon={<FileText className="h-5 w-5" />}
          actions={
            <button
              onClick={() => navigate('/templates/new')}
              className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
          }
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Total Templates</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {templates?.length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Active Templates</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {templates?.filter(t => t.isActive).length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Total Sections</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {templates?.reduce((acc, t) => acc + t.sectionsCount, 0) || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Total Criteria</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {templates?.reduce((acc, t) => acc + t.criteriaCount, 0) || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
          {/* Templates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636] mx-auto"></div>
              </div>
            ) : filteredTemplates?.length === 0 ? (
              <Card className="col-span-full bg-white rounded-[20px] shadow-md">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="h-16 w-16 bg-[#E51636]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-[#E51636]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#27251F]">No templates found</h3>
                  <p className="text-[#27251F]/60 mb-6">Create your first evaluation template to get started.</p>
                  <Link
                    to="/templates/new"
                    className="inline-flex items-center gap-2"
                  >
                    <Button className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12 px-6 rounded-2xl flex items-center gap-2 text-base font-medium w-full sm:w-auto justify-center">
                      <Plus className="w-5 h-5" />
                      Create Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredTemplates?.map((template: Template) => (
                <Card
                  key={template.id}
                  className="bg-white rounded-[20px] shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#27251F] mb-1">{template.name}</h3>
                        <p className="text-[#27251F]/60 text-sm">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  handleCopy(template.id);
                                }}
                                className="h-8 w-8"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy template</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  handleDelete(template);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete template</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#27251F]/60">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#27251F]/60">Last Modified</span>
                        <span className="text-[#27251F]">{new Date(template.lastModified).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#27251F]/60">Usage Count</span>
                        <span className="text-[#27251F]">{template.usageCount}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#27251F]/60">Sections</span>
                          <span className="text-[#27251F]">{template.sectionsCount}</span>
                        </div>
                        <Progress value={(template.sectionsCount / 10) * 100} className="h-1" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#27251F]/60">Criteria</span>
                          <span className="text-[#27251F]">{template.criteriaCount}</span>
                        </div>
                        <Progress value={(template.criteriaCount / 20) * 100} className="h-1" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          navigate(`/templates/${template.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        View & Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}