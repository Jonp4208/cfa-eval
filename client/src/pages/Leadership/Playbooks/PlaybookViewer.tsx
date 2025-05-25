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

export default function PlaybookViewer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
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
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
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

          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
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
    </div>
  );
}
