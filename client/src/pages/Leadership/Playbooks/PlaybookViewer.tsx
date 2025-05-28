import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ChevronLeft,
  Edit,
  Copy,
  Download,
  Share,
  Eye,
  Calendar,
  User,
  Tag,
  Printer
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import playbookService, { Playbook } from '@/services/playbookService';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
import PlaybookPreview from './components/PlaybookPreview';
import { downloadReactPDF } from '@/utils/ReactPdfExport';
import PDFLoadingOverlay from '@/components/PDFLoadingOverlay';

export default function PlaybookViewer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStep, setPdfStep] = useState('');

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

  const handleEdit = () => {
    navigate(`/leadership/playbooks/${id}/simple-edit`);
  };

  const handleDuplicate = async () => {
    try {
      const duplicated = await playbookService.duplicatePlaybook(id!);
      toast.success('Playbook duplicated successfully');
      navigate(`/leadership/playbooks/${duplicated._id}/simple-edit`);
    } catch (error) {
      console.error('Error duplicating playbook:', error);
      toast.error('Failed to duplicate playbook');
    }
  };

  const handleExport = async () => {
    if (!playbook) return;

    try {
      setPdfLoading(true);
      setPdfProgress(0);
      setPdfStep('Initializing...');

      // Extract playbook data from content blocks
      const extractedData = {
        title: playbook.title || 'Your Title',
        subtitle: playbook.subtitle || 'Your Subtitle',
        // Default values for priority matrix
        urgentImportantDescription: '2 to 3 Important/urgent Items here',
        importantNotUrgentDescription: '2 to 3 Important/Not urgent Items here',
        urgentNotImportantDescription: '2 to 3 urgent/Not Important Items here',
        notUrgentNotImportantDescription: '2 to 3 Not Urgent/Not Important Items here',
        // Default SMART goals
        smartGoals: [
          {
            id: 1,
            title: 'Goal 1',
            specific: 'What exactly needs to be accomplished? Be precise.',
            measurable: 'How will you know when it\'s complete? What can you count or observe?',
            achievable: 'Can this realistically be done with available resources?',
            relevant: 'Why does this matter to your organization\'s success?',
            timeBound: 'When will this be completed? Set a specific deadline.'
          }
        ]
      };

      // Extract data from content blocks if they exist
      if (playbook.contentBlocks && playbook.contentBlocks.length > 0) {
        playbook.contentBlocks.forEach(block => {
          switch (block.type) {
            case 'priority-matrix':
              if (block.content?.quadrants) {
                block.content.quadrants.forEach((quadrant: any) => {
                  switch (quadrant.title) {
                    case 'URGENT + IMPORTANT':
                      extractedData.urgentImportantDescription = quadrant.description || extractedData.urgentImportantDescription;
                      break;
                    case 'IMPORTANT + NOT URGENT':
                      extractedData.importantNotUrgentDescription = quadrant.description || extractedData.importantNotUrgentDescription;
                      break;
                    case 'URGENT + NOT IMPORTANT':
                      extractedData.urgentNotImportantDescription = quadrant.description || extractedData.urgentNotImportantDescription;
                      break;
                    case 'NOT URGENT + NOT IMPORTANT':
                      extractedData.notUrgentNotImportantDescription = quadrant.description || extractedData.notUrgentNotImportantDescription;
                      break;
                  }
                });
              }
              break;

            case 'practice-section':
              if (block.content?.title === 'Your SMART Goals' && block.content?.exercises) {
                // Extract SMART goals from practice section
                extractedData.smartGoals = block.content.exercises.map((exercise: any, index: number) => ({
                  id: index + 1,
                  title: exercise.title || `Goal ${index + 1}`,
                  specific: exercise.fields?.find((f: any) => f.label === 'Specific')?.value || 'What exactly needs to be accomplished? Be precise.',
                  measurable: exercise.fields?.find((f: any) => f.label === 'Measurable')?.value || 'How will you know when it\'s complete? What can you count or observe?',
                  achievable: exercise.fields?.find((f: any) => f.label === 'Achievable')?.value || 'Can this realistically be done with available resources?',
                  relevant: exercise.fields?.find((f: any) => f.label === 'Relevant')?.value || 'Why does this matter to your organization\'s success?',
                  timeBound: exercise.fields?.find((f: any) => f.label === 'Time-bound')?.value || 'When will this be completed? Set a specific deadline.'
                }));
              }
              break;
          }
        });
      }

      await downloadReactPDF(extractedData, (step: string, progress: number) => {
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

  const handleShare = () => {
    // TODO: Implement share functionality
    toast.info('Share functionality coming soon');
  };

  const canManage = user?.position === 'Leader' || user?.position === 'Director';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]"></div>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="text-center p-8">
        <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Playbook not found</h3>
        <p className="mt-1 text-sm text-gray-500">The playbook you're looking for doesn't exist.</p>
        <Button
          onClick={() => navigate('/leadership/playbooks')}
          className="mt-4"
        >
          Back to Playbooks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start">
        <Button
          onClick={() => navigate('/leadership/playbooks')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Playbooks
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </Button>

          {canManage && (
            <>
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>

              <Button
                onClick={handleDuplicate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
            </>
          )}


        </div>
      </div>

      {/* Playbook Metadata */}
      <Card className="bg-white rounded-[20px] shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{playbook.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Target: {playbook.targetRole}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{playbook.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(playbook.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>By {playbook.createdBy.name}</span>
            </div>
          </div>

          {playbook.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{playbook.description}</p>
            </div>
          )}

          {playbook.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {playbook.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playbook Content */}
      {playbook.contentBlocks.length === 0 ? (
        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardContent className="p-0">
            <div className="text-center p-8">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No content yet</h3>
              <p className="mt-1 text-sm text-gray-500">This playbook doesn't have any content blocks yet.</p>
              {canManage && (
                <Button
                  onClick={handleEdit}
                  className="mt-4"
                >
                  Add Content
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <PlaybookPreview playbook={playbook} />
      )}

      {/* PDF Loading Overlay */}
      <PDFLoadingOverlay
        isVisible={pdfLoading}
        progress={pdfProgress}
        step={pdfStep}
      />
    </div>
  );
}
