import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  UserX,
  ClipboardList,
  Filter,
  Search,
  Loader2,
  Mail,
  Bell,
  ChevronLeft,
  Plus,
  FileCheck,
  FilePlus,
  User2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import documentationService, { DocumentationRecord, CombinedRecord } from '@/services/documentationService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

export default function DocumentationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [documents, setDocuments] = useState<CombinedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null);
  const [stats, setStats] = useState({
    disciplinary: 0,
    administrative: 0
  });

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employee');
    setEmployeeFilter(employeeId);
  }, [location.search]);

  // Interface for grouped employee documents
  interface EmployeeDocuments {
    employee: {
      _id: string;
      name: string;
      position: string;
      department: string;
    };
    documents: CombinedRecord[];
    disciplinaryCount: number;
    administrativeCount: number;
    latestDocument: CombinedRecord;
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Use the combined records method instead
      const data = await documentationService.getAllCombinedRecords();
      console.log('Raw combined data from server:', data);

      // Log any null documents
      const nullDocuments = data.filter(doc => !doc || !doc._id);
      if (nullDocuments.length > 0) {
        console.warn('Found null or invalid documents:', nullDocuments);
      }

      setDocuments(data);

      // Debug logging
      console.log('All combined documents:', data.map(d => ({
        id: d._id,
        source: d.source,
        status: d.status,
        type: d.type,
        category: d.category,
        description: d.description
      })));

      // Calculate stats - now includes both documentation and disciplinary records
      const stats = {
        disciplinary: data.filter(d => d.category === 'Disciplinary').length,
        administrative: data.filter(d => d.category === 'Administrative').length
      };
      console.log('Calculated stats:', stats);
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDocuments = () => {
    // Filter out null or undefined documents and those with missing required data
    let filtered = documents.filter(doc =>
      doc != null &&
      doc._id != null &&
      doc.status != null &&
      doc.employee != null &&
      doc.employee._id != null
    );

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(doc => doc.category.toLowerCase() === filter);
    }

    // Apply employee filter if present
    if (employeeFilter) {
      filtered = filtered.filter(doc => doc.employee._id === employeeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.employee?.name?.toLowerCase().includes(query) ||
        doc.type?.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Group documents by employee
  const getGroupedDocuments = (): EmployeeDocuments[] => {
    const filteredDocs = getFilteredDocuments();
    const employeeMap = new Map<string, EmployeeDocuments>();

    // Group documents by employee ID
    filteredDocs.forEach(doc => {
      // Skip documents with missing employee data
      if (!doc.employee || !doc.employee._id) {
        console.warn('Document with missing employee data:', doc);
        return; // Skip this document
      }

      const employeeId = doc.employee._id;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee: doc.employee,
          documents: [],
          disciplinaryCount: 0,
          administrativeCount: 0,
          latestDocument: doc
        });
      }

      const employeeData = employeeMap.get(employeeId)!;
      employeeData.documents.push(doc);

      // Update counts
      if (doc.category === 'Disciplinary') {
        employeeData.disciplinaryCount++;
      } else {
        employeeData.administrativeCount++;
      }

      // Update latest document if this one is newer
      if (new Date(doc.date) > new Date(employeeData.latestDocument.date)) {
        employeeData.latestDocument = doc;
      }
    });

    // Convert map to array and sort by employee name
    return Array.from(employeeMap.values())
      .sort((a, b) => a.employee.name.localeCompare(b.employee.name));
  };

  const handleNewDocument = () => {
    navigate('/documentation/new');
  };

  const handleViewDocument = (record: CombinedRecord) => {
    // Navigate to the appropriate detail page based on the record source
    if (record.source === 'documentation') {
      navigate(`/documentation/${record._id}`);
    } else {
      navigate(`/disciplinary/${record._id}`);
    }
  };

  const handleViewEmployeeDocuments = (employeeId: string) => {
    // We'll implement a view to show all documents for a specific employee
    // For now, we'll just navigate to the documentation page with an employee filter
    navigate(`/documentation?employee=${employeeId}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Disciplinary':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Administrative':
        return <ClipboardList className="w-5 h-5 text-[#E51636]" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Acknowledgment':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'Pending Follow-up':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Follow-up
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

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Replace the custom header with PageHeader */}
        {employeeFilter ? (
          <PageHeader
            title={`${getFilteredDocuments()[0]?.employee.name || 'Employee'} Documents`}
            subtitle="View and manage documents for this team member"
            icon={<FileText className="h-5 w-5" />}
            actions={
              <Button
                className="w-full bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                onClick={() => navigate('/documentation')}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            }
          />
        ) : (
          <PageHeader
            title="Team Documentation"
            subtitle="Track and manage team member documentation, disciplinary actions, call outs, and doctor's notes"
            icon={<ClipboardList className="h-5 w-5" />}
            actions={
              (user?.position === 'Leader' || user?.position === 'Director') && (
                <Button
                  onClick={handleNewDocument}
                  className="w-full bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>New Document</span>
                </Button>
              )
            }
          />
        )}

        {/* Stats Cards - Only show when not filtering by employee */}
        {!employeeFilter && (
          <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-[20px] shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Disciplinary</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.disciplinary}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Administrative</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stats.administrative}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E51636]/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-white rounded-[20px] p-2 flex-1">
            <div className="p-2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by employee, type, or description..."
              className="border-none shadow-none focus-visible:ring-0 flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'disciplinary' ? 'default' : 'outline'}
              className={filter === 'disciplinary' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
              onClick={() => setFilter('disciplinary')}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Disciplinary
            </Button>
            <Button
              variant={filter === 'administrative' ? 'default' : 'outline'}
              className={filter === 'administrative' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
              onClick={() => setFilter('administrative')}
            >
              <ClipboardList className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <Card className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#E51636]" />
              </div>
            ) : getFilteredDocuments().length === 0 ? (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "No documents match your search criteria."
                    : "There are no documents in this category yet."}
                </p>
                {(user?.position === 'Leader' || user?.position === 'Director') && (
                  <div className="mt-6">
                    <Button
                      onClick={handleNewDocument}
                      className="bg-[#E51636] hover:bg-[#E51636]/90"
                    >
                      <FilePlus className="w-4 h-4 mr-2" />
                      Create New Document
                    </Button>
                  </div>
                )}
              </div>
            ) : employeeFilter ? (
              // Show individual documents when filtering by employee
              <div className="divide-y divide-gray-200">
                {getFilteredDocuments().map((doc) => (
                  <div
                    key={doc._id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${doc.category === 'Disciplinary' ? 'text-red-600' : 'text-green-600'}`}>
                              {doc.type}
                            </p>
                            {doc.source === 'disciplinary' && (
                              <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full">Legacy</span>
                            )}
                            {getStatusBadge(doc.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-sm text-gray-500">
                          Created by {doc.createdBy.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show grouped documents by employee when not filtering
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getGroupedDocuments().map((employeeData) => (
                  <Card
                    key={employeeData.employee._id}
                    className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Employee Header */}
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center">
                            <User2 className="h-5 w-5 text-[#E51636]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{employeeData.employee.name}</h3>
                            <p className="text-sm text-gray-500">{employeeData.employee.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {employeeData.disciplinaryCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {employeeData.disciplinaryCount} Disciplinary
                            </span>
                          )}
                          {employeeData.administrativeCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E51636]/10 text-[#E51636]">
                              {employeeData.administrativeCount} Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Latest Document Preview */}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getCategoryIcon(employeeData.latestDocument.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-medium ${employeeData.latestDocument.category === 'Disciplinary' ? 'text-red-600' : 'text-[#E51636]'}`}>
                                {employeeData.latestDocument.type}
                              </p>
                              {employeeData.latestDocument.source === 'disciplinary' && (
                                <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full">Legacy</span>
                              )}
                              {getStatusBadge(employeeData.latestDocument.status)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              Latest document: {new Date(employeeData.latestDocument.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {employeeData.latestDocument.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer with Actions */}
                      <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {employeeData.documents.length} document{employeeData.documents.length !== 1 ? 's' : ''} total
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10"
                          onClick={() => handleViewEmployeeDocuments(employeeData.employee._id)}
                        >
                          View All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getGroupedDocuments().length === 0 && (
                  <div className="col-span-full text-center p-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No employees with documents found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery
                        ? "No employees match your search criteria."
                        : "There are no documents in this category yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
