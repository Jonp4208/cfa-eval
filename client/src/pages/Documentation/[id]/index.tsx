import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  AlertTriangle,
  Clock,
  FileText,
  User,
  MessageCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Edit,
  Printer,
  History,
  Eye,
  Loader2,
  Star,
  FileCheck,
  FilePlus,
  Upload,
  Bell,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import documentationService, { DocumentationRecord } from '@/services/documentationService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AcknowledgmentDialog from '../components/AcknowledgmentDialog';
import FollowUpDialog from '../components/FollowUpDialog';
import DocumentUploadDialog from '../components/DocumentUploadDialog';
import PageHeader from '@/components/PageHeader';

export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [document, setDocument] = useState<DocumentationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAcknowledgmentDialog, setShowAcknowledgmentDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [showDocumentUploadDialog, setShowDocumentUploadDialog] = useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{ id: string, name: string } | null>(null);

  const isEmployee = user?._id === document?.employee?._id;
  const isManager = user?._id === document?.supervisor?._id || user?.role === 'admin';

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  useEffect(() => {
    // Only restrict access to followUps tab for non-managers
    // Allow access to details and documents tabs for all users
    if (!isManager && activeTab === 'followUps') {
      setActiveTab('details');
    }
  }, [isManager, activeTab]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await documentationService.getDocumentById(id as string);

      // Check that we received valid data
      if (!data || typeof data !== 'object') {
        console.error('Invalid document data received:', data);
        toast.error('Failed to load document: Invalid data');
        setDocument(null);
        return;
      }

      // Log the raw data
      console.log('RAW API RESPONSE:', JSON.stringify(data, null, 2));

      // Check if key properties are ObjectIds instead of populated objects
      const isObjectId = (val) => val && typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

      // Normalize references that might be ObjectIds instead of populated objects
      let normalizedData = { ...data };

      // Handle employee field
      if (isObjectId(normalizedData.employee) || (normalizedData.employee && !normalizedData.employee.name)) {
        const employeeId = typeof normalizedData.employee === 'string'
          ? normalizedData.employee
          : normalizedData.employee?._id || normalizedData.employee;
        normalizedData.employee = {
          _id: employeeId,
          name: `Employee ID: ${employeeId}`,
          position: 'Unknown',
          department: 'Unknown'
        };
      }

      // Handle supervisor field
      if (isObjectId(normalizedData.supervisor) || (normalizedData.supervisor && !normalizedData.supervisor.name)) {
        const supervisorId = typeof normalizedData.supervisor === 'string'
          ? normalizedData.supervisor
          : normalizedData.supervisor?._id || normalizedData.supervisor;
        normalizedData.supervisor = {
          _id: supervisorId,
          name: `Supervisor ID: ${supervisorId}`
        };
      }

      // Handle createdBy field
      if (isObjectId(normalizedData.createdBy) || (normalizedData.createdBy && !normalizedData.createdBy.name)) {
        const createdById = typeof normalizedData.createdBy === 'string'
          ? normalizedData.createdBy
          : normalizedData.createdBy?._id || normalizedData.createdBy;
        normalizedData.createdBy = {
          _id: createdById,
          name: `Created by ID: ${createdById}`
        };
      }

      // Handle followUps array
      if (Array.isArray(normalizedData.followUps)) {
        normalizedData.followUps = normalizedData.followUps.map(followUp => {
          if (isObjectId(followUp.by) || (followUp.by && !followUp.by.name)) {
            const byId = typeof followUp.by === 'string'
              ? followUp.by
              : followUp.by?._id || followUp.by;
            return {
              ...followUp,
              by: { _id: byId, name: `User ID: ${byId}` }
            };
          }
          return followUp;
        });
      } else {
        normalizedData.followUps = [];
      }

      // Handle documents array
      if (Array.isArray(normalizedData.documents)) {
        normalizedData.documents = normalizedData.documents.map(doc => {
          if (isObjectId(doc.uploadedBy) || (doc.uploadedBy && !doc.uploadedBy.name)) {
            const uploadedById = typeof doc.uploadedBy === 'string'
              ? doc.uploadedBy
              : doc.uploadedBy?._id || doc.uploadedBy;
            return {
              ...doc,
              uploadedBy: { _id: uploadedById, name: `User ID: ${uploadedById}` }
            };
          }
          return doc;
        });
      } else {
        normalizedData.documents = [];
      }

      console.log('NORMALIZED DATA:', normalizedData);
      setDocument(normalizedData);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/documentation/${id}/edit`);
  };

  const handleAcknowledge = () => {
    setShowAcknowledgmentDialog(true);
  };

  const handleScheduleFollowUp = () => {
    setShowFollowUpDialog(true);
  };

  const handleCompleteFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setShowFollowUpDialog(true);
  };

  const handleUploadDocument = () => {
    setShowDocumentUploadDialog(true);
  };

  const handleSendEmail = async () => {
    try {
      await documentationService.sendEmail(id as string);
      toast.success('Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    }
  };

  const handleSendReminder = async () => {
    try {
      await documentationService.sendUnacknowledgedNotification(id as string);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
      console.error('Error sending reminder:', error);
    }
  };

  const handleDeleteAttachment = (attachmentId: string, attachmentName: string) => {
    setAttachmentToDelete({ id: attachmentId, name: attachmentName });
    setShowDeleteDialog(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;

    try {
      await documentationService.deleteDocumentAttachment(id as string, attachmentToDelete.id);
      toast.success('Document deleted successfully');
      loadDocument(); // Reload the document to update the UI
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    } finally {
      setShowDeleteDialog(false);
      setAttachmentToDelete(null);
    }
  };

  const getCategoryIcon = () => {
    if (!document) return null;

    switch (document.category) {
      case 'Disciplinary':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'Medical':
        return <FileCheck className="w-6 h-6 text-blue-500" />;
      case 'Administrative':
        return <FileText className="w-6 h-6 text-[#E51636]" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Acknowledgment':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Acknowledgment
          </span>
        );
      case 'Pending Follow-up':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Follow-up
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </span>
        );
      case 'Documented':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FileCheck className="w-3 h-3 mr-1" />
            Documented
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getSafe = (obj: any, path: string, defaultValue: any = 'Unknown') => {
    try {
      const parts = path.split('.');
      let current = obj;

      for (const part of parts) {
        if (current === undefined || current === null) {
          return defaultValue;
        }
        current = current[part];
      }

      return current === undefined || current === null ? defaultValue : current;
    } catch (e) {
      console.error(`Error accessing path ${path}:`, e);
      return defaultValue;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Document Details"
          subtitle="View and manage document information"
          icon={<FileText className="h-5 w-5" />}
          actions={
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Button
                className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
                onClick={() => navigate('/documentation')}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#E51636]" />
          </div>
        ) : document ? (
          <div className="space-y-6">
            <Card className="bg-white rounded-[20px] shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gray-100">
                      {getCategoryIcon()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{getSafe(document, 'employee.name', 'Unknown Employee')}</h2>
                        {getStatusBadge(document.status)}
                      </div>
                      <p className="text-gray-500">
                        {document.type} - {document.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isManager && (
                      <>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="border-[#E51636] text-[#E51636] hover:bg-[#FEE4E2] hover:text-[#E51636] flex items-center gap-1.5 justify-center w-full"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendEmail}
                            className="border-[#E51636] text-[#E51636] hover:bg-[#FEE4E2] hover:text-[#E51636] flex items-center gap-1.5 justify-center w-full"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Email
                          </Button>
                        </div>
                        {document.status === 'Pending Acknowledgment' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendReminder}
                            className="border-[#E51636] text-[#E51636] hover:bg-[#FEE4E2] hover:text-[#E51636] flex items-center gap-1.5 w-full"
                          >
                            <Bell className="w-4 h-4" />
                            Remind
                          </Button>
                        )}
                      </>
                    )}
                    {isEmployee && document.category === 'Disciplinary' && document.status === 'Pending Acknowledgment' && (
                      <Button
                        className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                        size="sm"
                        onClick={handleAcknowledge}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex border-b mb-6 w-full">
                  <button
                    className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'details'
                        ? 'text-[#E51636] border-b-2 border-[#E51636] bg-[#FEE4E2]/30'
                        : 'text-gray-500 hover:text-[#E51636] hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                  {isManager && (
                    <button
                      className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'followUps'
                          ? 'text-[#E51636] border-b-2 border-[#E51636] bg-[#FEE4E2]/30'
                          : 'text-gray-500 hover:text-[#E51636] hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('followUps')}
                    >
                      Follow-ups
                    </button>
                  )}
                  <button
                    className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'documents'
                        ? 'text-[#E51636] border-b-2 border-[#E51636] bg-[#FEE4E2]/30'
                        : 'text-gray-500 hover:text-[#E51636] hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('documents')}
                  >
                    Documents
                  </button>
                </div>
              </CardContent>
            </Card>

            {activeTab === 'details' && (
              <Card className="bg-white rounded-[20px] shadow-sm">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Document Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{new Date(document.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className={`font-medium ${document.category === 'Disciplinary' ? 'text-red-600 font-bold' : ''}`}>{document.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{document.category}</span>
                        </div>
                        {document.severity && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Severity:</span>
                            <span className="font-medium">{document.severity}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium">{document.status}</span>
                        </div>
                        {document.previousIncidents && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Previous Incidents:</span>
                            <span className="font-medium">Yes</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created By:</span>
                          <span className="font-medium">{getSafe(document, 'createdBy.name')}</span>
                        </div>
                        {document.witnesses && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Witnesses:</span>
                            <span className="font-medium">{document.witnesses}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Employee Notified:</span>
                          <span className="font-medium">
                            {document.notifyEmployee ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">People Involved</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Employee:</span>
                          <span className="font-medium">{getSafe(document, 'employee.name')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Position:</span>
                          <span className="font-medium">{getSafe(document, 'employee.position')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Department:</span>
                          <span className="font-medium">{getSafe(document, 'employee.department')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Supervisor:</span>
                          <span className="font-medium">{getSafe(document, 'supervisor.name')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{document.description}</p>
                      </div>
                    </div>

                    {document.actionTaken && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Action Taken</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{document.actionTaken}</p>
                        </div>
                      </div>
                    )}

                    {document.followUpDate && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Follow-up Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Follow-up Date:</span>
                            <span className="font-medium">{new Date(document.followUpDate).toLocaleDateString()}</span>
                          </div>
                          {document.followUpActions && (
                            <div>
                              <span className="text-gray-500">Follow-up Actions:</span>
                              <p className="mt-1">{document.followUpActions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {document.acknowledgment?.acknowledged && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Acknowledgment</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Acknowledged On:</span>
                            <span className="font-medium">
                              {new Date(document.acknowledgment.date).toLocaleDateString()}
                            </span>
                          </div>
                          {document.acknowledgment.rating && (
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-500">Fairness Rating:</span>
                              <span className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < document.acknowledgment!.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </span>
                            </div>
                          )}
                          {document.acknowledgment.comments && (
                            <div>
                              <span className="text-gray-500">Comments:</span>
                              <p className="mt-1 whitespace-pre-wrap">{document.acknowledgment.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'followUps' && (
              <Card className="bg-white rounded-[20px] shadow-sm">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Follow-ups</h2>
                    <Button
                      className="bg-[#E51636] hover:bg-[#E51636]/90 text-white flex items-center gap-1.5 px-4"
                      onClick={handleScheduleFollowUp}
                    >
                      Schedule Follow-up
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {document.followUps.map((followUp) => (
                      <div key={followUp._id} className="border p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {new Date(followUp.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {followUp.status === 'Pending' ? (
                              <>
                                <span className="text-yellow-600 text-sm">Pending</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteFollowUp(followUp._id)}
                                  className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-1.5"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Complete
                                </Button>
                              </>
                            ) : (
                              <span className="text-green-600 text-sm">Completed</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <User className="w-4 h-4" />
                          <div>
                            By {getSafe(followUp, 'by.name')}
                          </div>
                        </div>
                        <p className="text-gray-600">{followUp.note}</p>
                      </div>
                    ))}

                    {document.followUps.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No follow-ups recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'documents' && (
              <Card className="bg-white rounded-[20px] shadow-sm">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Related Documents</h2>
                    {/* Allow both managers and the employee who owns the document to upload */}
                    {(isManager || isEmployee) && (
                      <Button
                        className="bg-[#E51636] hover:bg-[#E51636]/90 text-white flex items-center gap-1.5 px-4"
                        onClick={handleUploadDocument}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {document.documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.name} <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${doc.category === 'Disciplinary' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{doc.type}</span></p>
                            <p className="text-sm text-gray-500">
                              Added by {getSafe(doc, 'uploadedBy.name')} on{' '}
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          {isManager && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttachment(doc._id, doc.name)}
                              className="text-red-500 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {document.documents.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No documents attached</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-white rounded-[20px] shadow-sm">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">Document Not Found</h2>
              <p className="text-gray-500 mb-6">The document you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button
                onClick={() => navigate('/documentation')}
                className="bg-[#E51636] hover:bg-[#E51636]/90 text-white flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <AcknowledgmentDialog
          documentId={id!}
          isOpen={showAcknowledgmentDialog}
          onClose={() => setShowAcknowledgmentDialog(false)}
          onAcknowledge={loadDocument}
        />

        <FollowUpDialog
          documentId={id!}
          followUpId={selectedFollowUpId}
          isOpen={showFollowUpDialog}
          onClose={() => {
            setShowFollowUpDialog(false);
            setSelectedFollowUpId(undefined);
          }}
          onComplete={loadDocument}
          mode={selectedFollowUpId ? 'complete' : 'schedule'}
        />

        <DocumentUploadDialog
          documentId={id!}
          isOpen={showDocumentUploadDialog}
          onClose={() => setShowDocumentUploadDialog(false)}
          onUpload={loadDocument}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{attachmentToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAttachment}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
