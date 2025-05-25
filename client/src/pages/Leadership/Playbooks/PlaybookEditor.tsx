import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  ChevronLeft,
  Save,
  Plus,
  Loader2,
  Eye,
  Trash2,
  GripVertical,
  Type,
  Hash,
  List,
  CheckSquare,
  AlertTriangle,
  CheckCircle,
  Target,
  Grid3X3,
  Lightbulb,
  Printer
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import playbookService, { Playbook, ContentBlock } from '@/services/playbookService';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
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
import ContentBlockEditor from './components/ContentBlockEditor';
import PlaybookPreview from './components/PlaybookPreview';

export default function PlaybookEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<number | null>(null);

  const categories = ['Leadership', 'Operations', 'Training', 'Safety', 'Customer Service', 'General'];
  const roles = ['Team Member', 'Trainer', 'Leader', 'Director', 'All'];

  const contentBlockTypes = [
    { type: 'header', label: 'Header', icon: Hash, description: 'Title and subtitle' },
    { type: 'text', label: 'Text', icon: Type, description: 'Paragraph text' },
    { type: 'step-section', label: 'Step Section', icon: List, description: 'Numbered step with title' },
    { type: 'priority-matrix', label: 'Priority Matrix', icon: Grid3X3, description: '2x2 priority grid' },
    { type: 'smart-template', label: 'SMART Template', icon: Target, description: 'Goal setting framework' },
    { type: 'checklist', label: 'Checklist', icon: CheckSquare, description: 'Task checklist' },
    { type: 'example-box', label: 'Example Box', icon: Lightbulb, description: 'Examples and tips' },
    { type: 'warning-box', label: 'Warning Box', icon: AlertTriangle, description: 'Important warnings' },
    { type: 'success-box', label: 'Success Box', icon: CheckCircle, description: 'Success metrics' },
    { type: 'practice-section', label: 'Practice Exercise', icon: Target, description: 'Interactive exercise' }
  ];

  useEffect(() => {
    if (id) {
      fetchPlaybook();
    }
  }, [id]);

  const fetchPlaybook = async () => {
    try {
      setLoading(true);
      const data = await playbookService.getPlaybook(id!);
      setPlaybook(data);
    } catch (error) {
      console.error('Error fetching playbook:', error);
      toast.error('Failed to load playbook');
      navigate('/leadership/playbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!playbook) return;

    try {
      setSaving(true);
      await playbookService.updatePlaybook(playbook._id!, {
        title: playbook.title,
        subtitle: playbook.subtitle,
        description: playbook.description,
        category: playbook.category,
        targetRole: playbook.targetRole,
        contentBlocks: playbook.contentBlocks,
        isPublished: playbook.isPublished,
        tags: playbook.tags
      });
      toast.success('Playbook saved successfully');
    } catch (error) {
      console.error('Error saving playbook:', error);
      toast.error('Failed to save playbook');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!playbook) return;

    try {
      setSaving(true);
      await playbookService.updatePlaybook(playbook._id!, {
        ...playbook,
        isPublished: !playbook.isPublished
      });
      setPlaybook(prev => prev ? { ...prev, isPublished: !prev.isPublished } : null);
      toast.success(playbook.isPublished ? 'Playbook unpublished' : 'Playbook published successfully');
    } catch (error) {
      console.error('Error publishing playbook:', error);
      toast.error('Failed to update playbook status');
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (type: string) => {
    if (!playbook) return;

    const newBlock: ContentBlock = {
      type: type as any,
      order: playbook.contentBlocks.length,
      content: getDefaultContent(type)
    };

    setPlaybook(prev => prev ? {
      ...prev,
      contentBlocks: [...prev.contentBlocks, newBlock]
    } : null);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'header':
        return { title: 'New Header', subtitle: '' };
      case 'text':
        return { text: 'Enter your text here...' };
      case 'step-section':
        return { stepNumber: 1, title: 'Step Title', description: 'Step description...' };
      case 'priority-matrix':
        return {
          title: 'Priority Matrix',
          quadrants: [
            { title: 'URGENT + IMPORTANT', action: 'DO FIRST', description: 'Critical items', color: 'red' },
            { title: 'IMPORTANT + NOT URGENT', action: 'SCHEDULE', description: 'Important items', color: 'blue' },
            { title: 'URGENT + NOT IMPORTANT', action: 'DELEGATE', description: 'Urgent items', color: 'yellow' },
            { title: 'NOT URGENT + NOT IMPORTANT', action: 'ELIMINATE', description: 'Low priority', color: 'gray' }
          ]
        };
      case 'smart-template':
        return {
          title: 'SMART Goal Template',
          items: [
            { label: 'S - Specific', description: 'What exactly needs to be accomplished?' },
            { label: 'M - Measurable', description: 'How will you know when it\'s complete?' },
            { label: 'A - Achievable', description: 'Can this realistically be done?' },
            { label: 'R - Relevant', description: 'Why does this matter?' },
            { label: 'T - Time-bound', description: 'When will this be completed?' }
          ]
        };
      case 'checklist':
        return {
          title: 'Checklist',
          items: ['Item 1', 'Item 2', 'Item 3']
        };
      case 'example-box':
        return {
          title: 'Example',
          content: 'Example content goes here...',
          type: 'good' // or 'bad'
        };
      case 'warning-box':
        return {
          title: 'Important Warning',
          items: ['Warning item 1', 'Warning item 2']
        };
      case 'success-box':
        return {
          title: 'Success Metrics',
          items: ['Success metric 1', 'Success metric 2']
        };
      case 'practice-section':
        return {
          title: 'Practice Exercise',
          description: 'Complete this exercise...',
          exercises: [
            { label: 'Exercise 1', fields: ['Field 1', 'Field 2'] }
          ]
        };
      default:
        return {};
    }
  };

  const updateContentBlock = (index: number, content: any) => {
    if (!playbook) return;

    const updatedBlocks = [...playbook.contentBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], content };

    setPlaybook(prev => prev ? {
      ...prev,
      contentBlocks: updatedBlocks
    } : null);
  };

  const deleteContentBlock = (index: number) => {
    if (!playbook) return;

    const updatedBlocks = playbook.contentBlocks.filter((_, i) => i !== index);
    // Reorder the remaining blocks
    const reorderedBlocks = updatedBlocks.map((block, i) => ({ ...block, order: i }));

    setPlaybook(prev => prev ? {
      ...prev,
      contentBlocks: reorderedBlocks
    } : null);

    setDeleteDialogOpen(false);
    setBlockToDelete(null);
  };

  const moveContentBlock = (index: number, direction: 'up' | 'down') => {
    if (!playbook) return;

    const blocks = [...playbook.contentBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= blocks.length) return;

    // Swap blocks
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

    // Update order
    blocks.forEach((block, i) => {
      block.order = i;
    });

    setPlaybook(prev => prev ? {
      ...prev,
      contentBlocks: blocks
    } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E51636]" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900">Playbook not found</h3>
        <Button onClick={() => navigate('/leadership/playbooks')} className="mt-4">
          Back to Playbooks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={previewMode ? `Preview: ${playbook.title}` : `Edit: ${playbook.title}`}
        subtitle={previewMode ? 'Preview mode - see how your playbook will look' : 'Edit your playbook content and settings'}
        icon={<BookOpen className="h-5 w-5" />}
        actions={
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <Button
              onClick={() => navigate('/leadership/playbooks')}
              className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={() => setPreviewMode(!previewMode)}
              className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>

            {previewMode && (
              <Button
                onClick={() => window.print()}
                className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
            )}

            <Button
              onClick={handlePublish}
              disabled={saving}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{playbook.isPublished ? 'Unpublish' : 'Publish'}</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className={headerButtonClass}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </Button>
          </div>
        }
      />

      {!previewMode ? (
        // Edit Mode
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Blocks */}
          <div className="lg:col-span-3 space-y-6">
            {/* Playbook Settings */}
            <Card className="bg-white rounded-[20px] shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Playbook Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={playbook.title}
                      onChange={(e) => setPlaybook(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={playbook.subtitle || ''}
                      onChange={(e) => setPlaybook(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={playbook.category}
                      onValueChange={(value) => setPlaybook(prev => prev ? { ...prev, category: value as any } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetRole">Target Role</Label>
                    <Select
                      value={playbook.targetRole}
                      onValueChange={(value) => setPlaybook(prev => prev ? { ...prev, targetRole: value as any } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={playbook.description || ''}
                    onChange={(e) => setPlaybook(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Blocks */}
            <Card className="bg-white rounded-[20px] shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Content Blocks</h3>

                {playbook.contentBlocks.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No content blocks yet</h4>
                    <p className="text-sm text-gray-500 mb-4">Add content blocks to build your playbook</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playbook.contentBlocks
                      .sort((a, b) => a.order - b.order)
                      .map((block, index) => (
                        <ContentBlockEditor
                          key={index}
                          block={block}
                          index={index}
                          onUpdate={(content) => updateContentBlock(index, content)}
                          onDelete={() => {
                            setBlockToDelete(index);
                            setDeleteDialogOpen(true);
                          }}
                          onMoveUp={index > 0 ? () => moveContentBlock(index, 'up') : undefined}
                          onMoveDown={index < playbook.contentBlocks.length - 1 ? () => moveContentBlock(index, 'down') : undefined}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Block Palette */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-[20px] shadow-sm sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Add Content Block</h3>
                <div className="space-y-2">
                  {contentBlockTypes.map((blockType) => {
                    const Icon = blockType.icon;
                    return (
                      <Button
                        key={blockType.type}
                        onClick={() => addContentBlock(blockType.type)}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-[#E51636] mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{blockType.label}</div>
                            <div className="text-xs text-gray-500">{blockType.description}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Preview Mode - Show the playbook as it will appear
        <PlaybookPreview playbook={playbook} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content block? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blockToDelete !== null && deleteContentBlock(blockToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
