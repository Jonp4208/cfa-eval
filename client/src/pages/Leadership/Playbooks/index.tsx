import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Users,
  Calendar,
  Tag,
  Loader2,
  FileText,
  Globe,
  Lock,
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import playbookService, { Playbook } from '@/services/playbookService';
import PlaybookPreview from './components/PlaybookPreview';
import { downloadReactPDF } from '@/utils/ReactPdfExport';
import PDFLoadingOverlay from '@/components/PDFLoadingOverlay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Playbooks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playbookToDelete, setPlaybookToDelete] = useState<Playbook | null>(null);
  const [demoPlaybookOpen, setDemoPlaybookOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [playbookModalOpen, setPlaybookModalOpen] = useState(false);
  const [loadingPlaybook, setLoadingPlaybook] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStep, setPdfStep] = useState('');

  const categories = ['Leadership', 'Operations', 'Training', 'Safety', 'Customer Service', 'General'];
  const roles = ['Team Member', 'Trainer', 'Leader', 'Director', 'All'];

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const data = await playbookService.getPlaybooks();
      // Ensure data is always an array
      setPlaybooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      toast.error('Failed to load playbooks');
      // Set empty array on error
      setPlaybooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaybook = () => {
    navigate('/leadership/playbooks/new');
  };

  const handleViewPlaybook = async (playbook: Playbook) => {
    try {
      setLoadingPlaybook(true);
      // Fetch the full playbook data to ensure we have all content blocks
      const fullPlaybook = await playbookService.getPlaybook(playbook._id!);
      setSelectedPlaybook(fullPlaybook);
      setPlaybookModalOpen(true);
    } catch (error) {
      console.error('Error fetching playbook:', error);
      toast.error('Failed to load playbook');
    } finally {
      setLoadingPlaybook(false);
    }
  };

  const handleEditPlaybook = (id: string) => {
    navigate(`/leadership/playbooks/${id}/simple-edit`);
  };

  const handleDuplicatePlaybook = async (playbook: Playbook) => {
    try {
      const duplicated = await playbookService.duplicatePlaybook(playbook._id!);
      toast.success('Playbook duplicated successfully');
      fetchPlaybooks();
    } catch (error) {
      console.error('Error duplicating playbook:', error);
      toast.error('Failed to duplicate playbook');
    }
  };

  const handleDeletePlaybook = async () => {
    if (!playbookToDelete) return;

    try {
      await playbookService.deletePlaybook(playbookToDelete._id!);
      toast.success('Playbook deleted successfully');
      setDeleteDialogOpen(false);
      setPlaybookToDelete(null);
      fetchPlaybooks();
    } catch (error) {
      console.error('Error deleting playbook:', error);
      toast.error('Failed to delete playbook');
    }
  };

  const openDeleteDialog = (playbook: Playbook) => {
    setPlaybookToDelete(playbook);
    setDeleteDialogOpen(true);
  };

  const handleExportPDF = async (playbook: Playbook) => {
    try {
      setPdfLoading(true);
      setPdfProgress(0);
      setPdfStep('Initializing...');

      await downloadReactPDF(playbook, (step: string, progress: number) => {
        setPdfStep(step);
        setPdfProgress(progress);
      });

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      // Keep the overlay visible for a moment to show completion
      setTimeout(() => {
        setPdfLoading(false);
        setPdfProgress(0);
        setPdfStep('');
      }, 1000);
    }
  };

  const handleExportDemoPDF = async () => {
    // Create a demo playbook object for PDF export
    const demoPlaybook: Playbook = {
      _id: 'demo',
      title: 'Director of Facilities Playbook',
      subtitle: 'How to Identify Priorities & Create SMART Goals',
      description: 'A comprehensive guide for facilities directors on prioritizing tasks and creating effective SMART goals.',
      category: 'Leadership',
      targetRole: 'Director',
      tags: ['facilities', 'priorities', 'smart-goals'],
      isPublished: true,
      viewCount: 247,
      contentBlocks: [
        {
          id: '1',
          type: 'header',
          order: 1,
          content: { text: 'Identify Your Priorities Using the Priority Matrix' }
        },
        {
          id: '2',
          type: 'text',
          order: 2,
          content: { text: 'Every week, categorize your facility issues into four boxes: Urgent + Important (DO FIRST), Important + Not Urgent (SCHEDULE), Urgent + Not Important (DELEGATE), and Not Urgent + Not Important (ELIMINATE).' }
        },
        {
          id: '3',
          type: 'header',
          order: 3,
          content: { text: 'Turn Top Priorities into SMART Goals' }
        },
        {
          id: '4',
          type: 'text',
          order: 4,
          content: { text: 'Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals using the template below.' }
        },
        {
          id: '5',
          type: 'practice-section',
          order: 5,
          content: {
            title: 'SMART Goal Template',
            description: 'Use this template to create effective goals from your priorities.',
            exercises: [
              {
                title: 'SMART Goal #1',
                fields: [
                  { label: 'S - Specific', value: 'What exactly needs to be accomplished? Be precise.' },
                  { label: 'M - Measurable', value: 'How will you know when it\'s complete? What can you count or observe?' },
                  { label: 'A - Achievable', value: 'Can this realistically be done with available resources?' },
                  { label: 'R - Relevant', value: 'Why does this matter to the restaurant\'s success?' },
                  { label: 'T - Time-bound', value: 'When will this be completed? Set a specific deadline.' }
                ]
              }
            ]
          }
        }
      ],
      createdBy: { _id: 'demo', name: 'Demo User', email: 'demo@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setPdfLoading(true);
      setPdfProgress(0);
      setPdfStep('Initializing...');

      await downloadReactPDF(demoPlaybook, (step: string, progress: number) => {
        setPdfStep(step);
        setPdfProgress(progress);
      });

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting demo PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      // Keep the overlay visible for a moment to show completion
      setTimeout(() => {
        setPdfLoading(false);
        setPdfProgress(0);
        setPdfStep('');
      }, 1000);
    }
  };

  const getFilteredPlaybooks = () => {
    // Ensure playbooks is always an array
    if (!Array.isArray(playbooks)) {
      return [];
    }

    return playbooks.filter(playbook => {
      const matchesSearch = playbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           playbook.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           playbook.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || playbook.category === categoryFilter;
      const matchesRole = roleFilter === 'all' || playbook.targetRole === roleFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'published' && playbook.isPublished) ||
                           (statusFilter === 'draft' && !playbook.isPublished);

      return matchesSearch && matchesCategory && matchesRole && matchesStatus;
    });
  };

  const canManagePlaybooks = user?.position === 'Leader' || user?.position === 'Director';

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card className="bg-white rounded-[20px] shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search playbooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playbooks List */}
      <Card className="bg-white rounded-[20px] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#E51636]" />
            </div>
          ) : (searchQuery || categoryFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && getFilteredPlaybooks().length === 0 ? (
            // Show simple message when filtering and no results
            <div className="text-center p-8">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No playbooks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No playbooks match your search criteria.
              </p>
            </div>
          ) : (
            // Always show book-style layout with demo + created playbooks
            <div className="p-6">
              <div className="space-y-6">
                {getFilteredPlaybooks().length === 0 && (
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-medium text-gray-900">Get started by creating your first playbook</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Build comprehensive guides for your team with structured content blocks
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                  {/* Demo Playbook Card - Always Show */}
                  <div className="relative">
                    {/* Book Cover */}
                    <div
                      className="bg-gradient-to-br from-[#E51636] to-[#B91429] rounded-lg p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer hover:shadow-xl h-full"
                      onClick={() => setDemoPlaybookOpen(true)}
                    >
                      <div className="bg-white/10 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-6 h-6 text-white" />
                          <span className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                            LEADERSHIP PLAYBOOK
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                          Director of Facilities
                        </h3>
                        <h4 className="text-lg text-white/90 mb-4 leading-tight">
                          How to Identify Priorities & Create SMART Goals
                        </h4>

                        <div className="border-t border-white/20 pt-3">
                          <p className="text-white/80 text-sm">
                            A comprehensive guide for facilities directors on prioritizing tasks and creating effective SMART goals.
                          </p>
                        </div>
                      </div>

                      {/* Book Spine Effect */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 rounded-l-lg"></div>
                      <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/10"></div>

                      {/* Book Pages Effect */}
                      <div className="absolute -right-1 top-1 bottom-1 w-2 bg-gray-200 rounded-r-lg shadow-sm"></div>
                      <div className="absolute -right-2 top-2 bottom-2 w-2 bg-gray-100 rounded-r-lg shadow-sm"></div>

                      {/* Book Stats */}
                      <div className="flex items-center justify-between text-white/70 text-xs mt-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Director
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            247 views
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                          <Globe className="w-3 h-3 mr-1" />
                          Published
                        </span>
                      </div>
                    </div>

                    {/* Demo Badge */}
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                      📖 DEMO
                    </div>
                  </div>

                  {/* Created Playbooks in Book Style */}
                  {getFilteredPlaybooks().map((playbook) => (
                    <div key={playbook._id} className="relative">
                      {/* Book Cover */}
                      <div
                        className="bg-gradient-to-br from-[#E51636] to-[#B91429] rounded-lg p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer hover:shadow-xl h-full"
                        onClick={() => handleViewPlaybook(playbook)}
                      >
                        <div className="bg-white/10 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-6 h-6 text-white" />
                            <span className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                              {playbook.category.toUpperCase()} PLAYBOOK
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                            {playbook.title}
                          </h3>
                          {playbook.subtitle && (
                            <h4 className="text-lg text-white/90 mb-4 leading-tight">
                              {playbook.subtitle}
                            </h4>
                          )}

                          <div className="border-t border-white/20 pt-3">
                            <p className="text-white/80 text-sm line-clamp-2">
                              {playbook.description || 'A comprehensive leadership guide for your team.'}
                            </p>
                          </div>
                        </div>

                        {/* Book Spine Effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 rounded-l-lg"></div>
                        <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/10"></div>

                        {/* Book Pages Effect */}
                        <div className="absolute -right-1 top-1 bottom-1 w-2 bg-gray-200 rounded-r-lg shadow-sm"></div>
                        <div className="absolute -right-2 top-2 bottom-2 w-2 bg-gray-100 rounded-r-lg shadow-sm"></div>

                        {/* Book Stats */}
                        <div className="flex items-center justify-between text-white/70 text-xs mt-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {playbook.targetRole}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {playbook.viewCount} views
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            playbook.isPublished
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}>
                            {playbook.isPublished ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`absolute -top-2 -right-2 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 ${
                        playbook.isPublished
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}>
                        {playbook.isPublished ? '✅ LIVE' : '📝 DRAFT'}
                      </div>

                      {/* Action Buttons */}
                      {canManagePlaybooks && (
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPlaybook(playbook._id!);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white p-1 h-auto"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicatePlaybook(playbook);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white p-1 h-auto"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(playbook);
                            }}
                            className="bg-red-500/70 hover:bg-red-600/80 text-white p-1 h-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Skeleton/Create Card - Only show when no playbooks exist */}
                  {getFilteredPlaybooks().length === 0 && (
                    <div className="border-2 border-dashed border-[#E51636] rounded-lg p-6 hover:border-[#E51636] transition-colors bg-gray-50/50 h-full">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                            <div className="px-2 py-1 bg-gray-100 rounded-full">
                              <span className="text-xs text-gray-500">Draft</span>
                            </div>
                          </div>

                          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              All Roles
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              0 views
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>

                      {canManagePlaybooks && (
                        <div className="mt-6 text-center">
                          <Button
                            onClick={handleCreatePlaybook}
                            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white px-6 py-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Playbook
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skeleton/Create Card - Always show for managers when playbooks exist */}
                  {canManagePlaybooks && getFilteredPlaybooks().length > 0 && (
                    <div className="border-2 border-dashed border-[#E51636] rounded-lg p-6 hover:border-[#E51636] transition-colors bg-gray-50/50 h-full">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                            <div className="px-2 py-1 bg-gray-100 rounded-full">
                              <span className="text-xs text-gray-500">Draft</span>
                            </div>
                          </div>

                          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              All Roles
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              0 views
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <Button
                          onClick={handleCreatePlaybook}
                          className="bg-[#E51636] hover:bg-[#E51636]/90 text-white px-6 py-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Playbook
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Example Content Preview - Only show when no playbooks exist */}
                {getFilteredPlaybooks().length === 0 && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">💡 What you can create:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Step-by-step procedures
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Priority matrices
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        SMART goal templates
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Interactive checklists
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Best practice guides
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Training materials
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Playbook Modal */}
      <AlertDialog open={demoPlaybookOpen} onOpenChange={setDemoPlaybookOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <AlertDialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E51636]" />
                <AlertDialogTitle className="flex items-center gap-2 m-0">
                  Director of Facilities Playbook
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Demo</span>
                </AlertDialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportDemoPDF}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Export PDF
                </Button>
                <AlertDialogAction onClick={() => setDemoPlaybookOpen(false)} className="m-0">
                  Close
                </AlertDialogAction>
              </div>
            </div>
            <AlertDialogDescription>
              How to Identify Priorities & Create SMART Goals
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="playbook-content space-y-6 flex-1 overflow-y-auto">
            {/* Header */}
            <div className="text-center border-b-3 border-[#E51636] pb-5 mb-8">
              <h1 className="text-3xl font-bold text-[#E51636] mb-2">
                Director of Facilities Playbook
              </h1>
              <h2 className="text-lg text-gray-600">
                How to Identify Priorities & Create SMART Goals
              </h2>
            </div>

            {/* Step 1 */}
            <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-[#E51636]">
                  Identify Your Priorities Using the Priority Matrix
                </h3>
              </div>
              <p className="text-gray-700 font-semibold">Every week, categorize your facility issues into these four boxes:</p>
            </div>

            {/* Priority Matrix */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 text-center">
                  <h5 className="font-bold text-red-800 mb-1">URGENT + IMPORTANT</h5>
                  <p className="text-sm font-medium text-red-700 mb-2">DO FIRST</p>
                  <p className="text-sm text-red-600">Health/safety issues, customer complaints, equipment failures affecting operations</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 text-center">
                  <h5 className="font-bold text-blue-800 mb-1">IMPORTANT + NOT URGENT</h5>
                  <p className="text-sm font-medium text-blue-700 mb-2">SCHEDULE</p>
                  <p className="text-sm text-blue-600">Preventive maintenance, training, system improvements</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4 text-center">
                  <h5 className="font-bold text-yellow-800 mb-1">URGENT + NOT IMPORTANT</h5>
                  <p className="text-sm font-medium text-yellow-700 mb-2">DELEGATE</p>
                  <p className="text-sm text-yellow-600">Routine cleaning, minor repairs, supply orders</p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-600 rounded-lg p-4 text-center">
                  <h5 className="font-bold text-gray-800 mb-1">NOT URGENT + NOT IMPORTANT</h5>
                  <p className="text-sm font-medium text-gray-700 mb-2">ELIMINATE</p>
                  <p className="text-sm text-gray-600">Busy work, unnecessary meetings, over-organizing</p>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">🔍 Examples for Facilities:</div>
              <div className="space-y-2 text-sm">
                <p><strong>URGENT + IMPORTANT:</strong> Flies in dining area, broken AC in summer, health department violation</p>
                <p><strong>IMPORTANT + NOT URGENT:</strong> Monthly pest control, equipment maintenance schedule, staff training</p>
                <p><strong>URGENT + NOT IMPORTANT:</strong> Light bulb replacement, restocking supplies, minor cosmetic repairs</p>
                <p><strong>NOT URGENT + NOT IMPORTANT:</strong> Reorganizing storage room, excessive paperwork, non-essential meetings</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-[#E51636]">
                  Turn Top Priorities into SMART Goals
                </h3>
              </div>
              <p className="text-gray-700 font-semibold">Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:</p>
            </div>

            {/* SMART Template */}
            <div className="bg-white border-2 border-[#E51636] rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-[#E51636]">📝 SMART Goal Template</h4>
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">S - Specific</div>
                  <div className="text-gray-600 italic mt-1">What exactly needs to be accomplished? Be precise.</div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">M - Measurable</div>
                  <div className="text-gray-600 italic mt-1">How will you know when it's complete? What can you count or observe?</div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">A - Achievable</div>
                  <div className="text-gray-600 italic mt-1">Can this realistically be done with available resources?</div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">R - Relevant</div>
                  <div className="text-gray-600 italic mt-1">Why does this matter to the restaurant's success?</div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">T - Time-bound</div>
                  <div className="text-gray-600 italic mt-1">When will this be completed? Set a specific deadline.</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-[#E51636]">
                  Weekly Priority Assessment Process
                </h3>
              </div>
            </div>

            {/* Weekly Checklist */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-800 mb-3">📅 Every Monday Morning (15 minutes):</h4>
              <div className="space-y-2">
                {[
                  "Walk the entire facility - what do you see that needs attention?",
                  "Review customer complaints from last week - any facility-related issues?",
                  "Check equipment status - anything breaking down or needing service?",
                  "Ask team members - what problems are they seeing?",
                  "Review upcoming schedules - pest control, maintenance, inspections due?"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-500 mt-1">☐</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorization Checklist */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Then Categorize Each Issue:</h4>
              <div className="space-y-2">
                {[
                  "Write each issue on the priority matrix",
                  "Focus on \"Urgent + Important\" first",
                  "Schedule \"Important + Not Urgent\" items",
                  "Delegate \"Urgent + Not Important\" to team",
                  "Eliminate or ignore \"Not Urgent + Not Important\""
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-500 mt-1">☐</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-[#E51636]">
                  Goal Setting Examples
                </h3>
              </div>
            </div>

            {/* Bad Example */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">❌ BAD Goal Example:</div>
              <p className="font-semibold">"Fix the cleanliness problems"</p>
              <p className="text-sm italic text-gray-600 mt-2">Problem: Too vague, no timeline, can't measure success</p>
            </div>

            {/* Good Example */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">✅ GOOD Goal Example:</div>
              <p className="font-semibold">"Achieve 100% completion of daily cleaning checklists in all areas for 30 consecutive days by [specific date]"</p>
              <p className="text-sm italic text-gray-600 mt-2">Why it works: Specific (checklists), Measurable (100%, 30 days), Achievable (daily tasks), Relevant (cleanliness), Time-bound (specific date)</p>
            </div>

            {/* Bad Example 2 */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">❌ BAD Goal Example:</div>
              <p className="font-semibold">"Deal with pest issues"</p>
              <p className="text-sm italic text-gray-600 mt-2">Problem: Not specific, no measurement, no deadline</p>
            </div>

            {/* Good Example 2 */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">✅ GOOD Goal Example:</div>
              <p className="font-semibold">"Eliminate all visible pests in customer areas and receive zero pest-related customer complaints for 14 consecutive days by [specific date]"</p>
              <p className="text-sm italic text-gray-600 mt-2">Why it works: Specific (visible pests, customer areas), Measurable (zero complaints, 14 days), Time-bound (specific date)</p>
            </div>

            {/* Common Mistakes */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                Common Mistakes to Avoid
              </h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Setting too many goals:</strong> Focus on 3-5 goals maximum at one time</li>
                <li><strong>Making goals too big:</strong> Break large projects into smaller 30-90 day goals</li>
                <li><strong>No clear deadline:</strong> "Soon" or "ASAP" are not deadlines</li>
                <li><strong>Can't measure success:</strong> If you can't count it or see it, rewrite the goal</li>
                <li><strong>Doing instead of managing:</strong> Your goals should be about creating systems, not doing tasks</li>
              </ul>
            </div>

            {/* Step 5 */}
            <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  5
                </div>
                <h3 className="text-xl font-semibold text-[#E51636]">
                  Cleanliness Standards & Systems
                </h3>
              </div>
              <p className="text-gray-700 font-semibold">As Facilities Director, you don't clean - you create systems that ensure consistent cleanliness.</p>
            </div>

            {/* Cleanliness Role */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-5">
              <div className="text-blue-800 font-semibold mb-3">🧹 Your Cleanliness Role:</div>
              <p className="mb-2"><strong>✅ DIRECTOR LEVEL:</strong> Set standards, create checklists, train team, monitor compliance, solve system problems</p>
              <p><strong>❌ NOT YOUR JOB:</strong> Wiping tables, mopping floors, cleaning bathrooms, washing dishes</p>
            </div>

            {/* System Setup */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-800 mb-3">📋 Cleanliness System Setup:</h4>
              <div className="space-y-2">
                {[
                  "Create Simple Checklists: Daily, weekly, monthly cleaning tasks with checkboxes",
                  "Assign Ownership: Specific people responsible for specific areas",
                  "Set Standards: What does \"clean\" look like? Take photos of properly cleaned areas",
                  "Monitor Compliance: Check completed checklists, do random spot checks",
                  "Address Failures: Retrain, reassign, or improve systems when standards aren't met"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-500 mt-1">☐</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cleanliness SMART Goals */}
            <div className="bg-white border-2 border-[#E51636] rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-[#E51636]">📝 Cleanliness SMART Goal Examples</h4>
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-4 rounded-r">
                  <div className="font-bold text-[#E51636] mb-2">Bathroom Cleanliness</div>
                  <div className="text-gray-700">
                    <strong>Goal:</strong> "Achieve 100% completion of hourly bathroom cleaning checklists with zero customer complaints about bathroom cleanliness for 30 consecutive days by [date]"
                  </div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-4 rounded-r">
                  <div className="font-bold text-[#E51636] mb-2">Dining Area Standards</div>
                  <div className="text-gray-700">
                    <strong>Goal:</strong> "Implement table cleaning system where all tables are cleaned within 2 minutes of customer departure, measured by manager observations during 5 random checks daily for 14 days by [date]"
                  </div>
                </div>
                <div className="bg-blue-50 border-l-3 border-[#E51636] p-4 rounded-r">
                  <div className="font-bold text-[#E51636] mb-2">Kitchen Cleanliness</div>
                  <div className="text-gray-700">
                    <strong>Goal:</strong> "Establish end-of-shift deep cleaning checklist with 100% completion rate verified by photos for 21 consecutive days by [date]"
                  </div>
                </div>
              </div>
            </div>

            {/* Red Flags */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                Cleanliness Red Flags - Take Action Immediately
              </h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Customer complaints</strong> about dirty bathrooms, sticky tables, or messy areas</li>
                <li><strong>Team members</strong> not following cleaning protocols or skipping checklist items</li>
                <li><strong>Health department</strong> concerns or potential violations</li>
                <li><strong>Visible dirt/grime</strong> that customers can see</li>
                <li><strong>Bad odors</strong> in any customer area</li>
              </ul>
            </div>

            {/* Success Metrics */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h4 className="font-semibold text-green-800 mb-3">✅ Cleanliness Success Metrics</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Daily:</strong> All cleaning checklists completed and verified</p>
                <p><strong>Weekly:</strong> Zero cleanliness-related customer complaints</p>
                <p><strong>Monthly:</strong> Pass all internal cleanliness inspections</p>
                <p><strong>Remember:</strong> Clean facilities = happy customers = better business</p>
              </div>
            </div>

            {/* Practice Exercise */}
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6">
              <h3 className="text-yellow-800 font-bold mb-4">🎯 Practice Exercise</h3>
              <p className="font-semibold mb-4">Right now, identify 3 facility issues and turn them into SMART goals:</p>

              <div className="space-y-6">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="font-semibold mb-3">Issue #{num}: _________________________________</p>
                    <div className="ml-4 space-y-2 text-sm">
                      <p><strong>Specific:</strong> _________________________________</p>
                      <p><strong>Measurable:</strong> _________________________________</p>
                      <p><strong>Achievable:</strong> _________________________________</p>
                      <p><strong>Relevant:</strong> _________________________________</p>
                      <p><strong>Time-bound:</strong> _________________________________</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Formula */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h4 className="font-semibold text-green-800 mb-3">✅ Success Formula</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Weekly:</strong> Assess priorities using the matrix</p>
                <p><strong>Monthly:</strong> Create 3-5 SMART goals from top priorities</p>
                <p><strong>Daily:</strong> Work on goal activities, not random tasks</p>
                <p><strong>Remember:</strong> You manage the work, you don't do all the work</p>
              </div>
            </div>

            {/* Key Question */}
            <div className="bg-gray-50 border-2 border-[#E51636] rounded-lg p-6 text-center">
              <h3 className="text-[#E51636] font-bold mb-3">🎯 KEY QUESTION</h3>
              <p className="text-lg font-medium text-gray-800 mb-2">
                "Is this something only a Director can do, or can I teach someone else to handle it?"
              </p>
              <p className="text-gray-600 text-sm">
                If someone else can do it, delegate it and focus on director-level priorities.
              </p>
            </div>
          </div>


        </AlertDialogContent>
      </AlertDialog>

      {/* Created Playbook Modal */}
      <AlertDialog open={playbookModalOpen} onOpenChange={setPlaybookModalOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          {loadingPlaybook ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E51636] mx-auto mb-2" />
                <p className="text-gray-600">Loading playbook...</p>
              </div>
            </div>
          ) : selectedPlaybook ? (
            <>
              <AlertDialogHeader className="flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#E51636]" />
                    <AlertDialogTitle className="flex items-center gap-2 m-0">
                      {selectedPlaybook.title}
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedPlaybook.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedPlaybook.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </AlertDialogTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(selectedPlaybook)}
                      className="flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <AlertDialogAction onClick={() => setPlaybookModalOpen(false)} className="m-0">
                      Close
                    </AlertDialogAction>
                  </div>
                </div>
                <AlertDialogDescription>
                  {selectedPlaybook.subtitle || selectedPlaybook.description}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="playbook-content flex-1 overflow-y-auto space-y-6 p-6">
                {/* Header */}
                <div className="text-center border-b-2 border-red-600 pb-6 mb-8">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">
                    {selectedPlaybook.title}
                  </h1>
                  <h2 className="text-base text-gray-600">
                    {selectedPlaybook.subtitle || 'Leadership Development Playbook'}
                  </h2>
                </div>

                {/* Description */}
                {selectedPlaybook.description && (
                  <div className="text-gray-700 leading-relaxed">
                    {selectedPlaybook.description}
                  </div>
                )}

                {/* Content Blocks */}
                {selectedPlaybook.contentBlocks && selectedPlaybook.contentBlocks.length > 0 ? (
                  <div className="space-y-6">
                    {selectedPlaybook.contentBlocks.map((block, index) => (
                      <div key={index} className="border-l-4 border-red-600 pl-4 py-2">
                        {block.type === 'header' && (
                          <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">
                              {block.content.title}
                            </h3>
                            {block.content.subtitle && (
                              <p className="text-gray-600">{block.content.subtitle}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div className="prose max-w-none">
                            <p className="text-gray-700">{block.content.text}</p>
                          </div>
                        )}

                        {block.type === 'step-section' && (
                          <div className="bg-blue-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                            <div className="flex items-center mb-3">
                              <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                                {block.content.stepNumber || '?'}
                              </div>
                              <h3 className="text-lg font-semibold text-red-600">
                                {block.content.title}
                              </h3>
                            </div>
                            {block.content.description && (
                              <p className="text-gray-700 text-sm">{block.content.description}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'checklist' && (
                          <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-3">{block.content.title || 'Checklist'}</h3>
                            {block.content.items && block.content.items.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2">
                                  {block.content.items.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} className="flex items-start gap-3">
                                      <span className="text-gray-500 mt-1 text-sm">☐</span>
                                      <span className="text-gray-700 text-sm">{item.text || item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(block.type === 'example-box' || block.type === 'warning-box' || block.type === 'success-box') && (
                          <div className={`border rounded-lg p-4 ${
                            block.type === 'warning-box' ? 'bg-yellow-50 border-yellow-200' :
                            block.type === 'success-box' ? 'bg-green-50 border-green-200' :
                            'bg-blue-50 border-blue-200'
                          }`}>
                            <h4 className={`font-semibold mb-2 text-sm ${
                              block.type === 'warning-box' ? 'text-yellow-800' :
                              block.type === 'success-box' ? 'text-green-800' :
                              'text-blue-800'
                            }`}>
                              {block.content.title ||
                                (block.type === 'warning-box' ? '⚠️ Warning' :
                                 block.type === 'success-box' ? '✅ Success' : '💡 Example')
                              }
                            </h4>
                            {block.content.content && (
                              <p className="text-gray-700 text-sm">{block.content.content}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'priority-matrix' && (
                          <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-4">{block.content.title || 'Priority Matrix'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {block.content.quadrants && Array.isArray(block.content.quadrants) ? (
                                block.content.quadrants.map((quadrant: any, qIndex: number) => {
                                  const bgColor = quadrant.color === 'red' ? 'bg-red-50 border-red-200' :
                                                 quadrant.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                                                 quadrant.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                                                 'bg-gray-50 border-gray-200';
                                  const textColor = quadrant.color === 'red' ? 'text-red-800' :
                                                   quadrant.color === 'blue' ? 'text-blue-800' :
                                                   quadrant.color === 'yellow' ? 'text-yellow-800' :
                                                   'text-gray-800';
                                  const subtitleColor = quadrant.color === 'red' ? 'text-red-700' :
                                                       quadrant.color === 'blue' ? 'text-blue-700' :
                                                       quadrant.color === 'yellow' ? 'text-yellow-700' :
                                                       'text-gray-700';
                                  const descColor = quadrant.color === 'red' ? 'text-red-600' :
                                                   quadrant.color === 'blue' ? 'text-blue-600' :
                                                   quadrant.color === 'yellow' ? 'text-yellow-600' :
                                                   'text-gray-600';

                                  return (
                                    <div key={qIndex} className={`border rounded-lg p-3 ${bgColor}`}>
                                      <h4 className={`font-bold mb-1 text-sm ${textColor}`}>
                                        {quadrant.title}
                                      </h4>
                                      <p className={`text-xs font-medium mb-1 ${subtitleColor}`}>
                                        {quadrant.action || quadrant.subtitle}
                                      </p>
                                      <p className={`text-xs ${descColor}`}>
                                        {quadrant.description}
                                      </p>
                                    </div>
                                  );
                                })
                              ) : (
                                /* Fallback for old object-based structure */
                                <>
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <h4 className="font-bold text-red-800 mb-1 text-sm">URGENT + IMPORTANT</h4>
                                    <p className="text-xs font-medium text-red-700 mb-1">DO FIRST</p>
                                    <p className="text-xs text-red-600">Critical issues requiring immediate attention</p>
                                  </div>
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <h4 className="font-bold text-blue-800 mb-1 text-sm">IMPORTANT + NOT URGENT</h4>
                                    <p className="text-xs font-medium text-blue-700 mb-1">SCHEDULE</p>
                                    <p className="text-xs text-blue-600">Important tasks to plan and schedule</p>
                                  </div>
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <h4 className="font-bold text-yellow-800 mb-1 text-sm">URGENT + NOT IMPORTANT</h4>
                                    <p className="text-xs font-medium text-yellow-700 mb-1">DELEGATE</p>
                                    <p className="text-xs text-yellow-600">Tasks that can be delegated to others</p>
                                  </div>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-bold text-gray-800 mb-1 text-sm">NOT URGENT + NOT IMPORTANT</h4>
                                    <p className="text-xs font-medium text-gray-700 mb-1">ELIMINATE</p>
                                    <p className="text-xs text-gray-600">Activities to minimize or eliminate</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {(block.type === 'smart-template' || block.type === 'practice-section') && (
                          <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-4">{block.content.title || 'SMART Goals'}</h3>

                            {/* Check for practice-section with exercises (actual SMART goals) */}
                            {block.type === 'practice-section' && block.content.exercises && block.content.exercises.length > 0 ? (
                              <div className="space-y-3">
                                {block.content.exercises.map((exercise: any, exerciseIndex: number) => (
                                  <div key={exerciseIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-red-600 mb-2 text-sm">{exercise.title || `Goal ${exerciseIndex + 1}`}</h4>
                                    <div className="space-y-1 text-xs">
                                      {exercise.fields && exercise.fields.map((field: any, fieldIndex: number) => (
                                        <div key={fieldIndex}>
                                          <strong>{field.label}:</strong> {field.value}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : block.content.goals && block.content.goals.length > 0 ? (
                              /* If there are actual goals in smart-template format, show them */
                              <div className="space-y-3">
                                {block.content.goals.map((goal: any, goalIndex: number) => (
                                  <div key={goalIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-red-600 mb-2 text-sm">{goal.title}</h4>
                                    <div className="space-y-1 text-xs">
                                      <div><strong>Specific:</strong> {goal.specific}</div>
                                      <div><strong>Measurable:</strong> {goal.measurable}</div>
                                      <div><strong>Achievable:</strong> {goal.achievable}</div>
                                      <div><strong>Relevant:</strong> {goal.relevant}</div>
                                      <div><strong>Time-bound:</strong> {goal.timeBound}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : block.content.items && block.content.items.length > 0 ? (
                              /* If it's a template with items, show the template */
                              <div className="space-y-3">
                                {block.content.items.map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="bg-blue-50 border-l-4 border-red-600 p-3 rounded-r">
                                    <div className="font-bold text-red-600 text-sm">{item.label}</div>
                                    <div className="text-gray-600 italic mt-1 text-xs">{item.prompt}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic text-sm">No SMART goals or template defined yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">This playbook doesn't have any content yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Add content blocks to build your playbook.</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playbook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{playbookToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlaybook}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Loading Overlay */}
      <PDFLoadingOverlay
        isVisible={pdfLoading}
        progress={pdfProgress}
        step={pdfStep}
      />
    </div>
  );
}
