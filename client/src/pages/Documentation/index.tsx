import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  User2,
  Sparkles,
  TrendingUp,
  Shield,
  Archive,
  Users,
  Calendar,
  Eye,
  BarChart3,
  Activity,
  Star,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import documentationService, { DocumentationRecord, CombinedRecord } from '@/services/documentationService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';

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
    pipCount: number;
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
      if (filter === 'pip') {
        filtered = filtered.filter(doc => doc.category.toLowerCase() === 'pip');
      } else {
        filtered = filtered.filter(doc => doc.category.toLowerCase() === filter);
      }
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

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          pipCount: 0,
          administrativeCount: 0,
          latestDocument: doc
        });
      }

      const employeeData = employeeMap.get(employeeId)!;
      employeeData.documents.push(doc);

      // Update counts
      if (doc.category === 'Disciplinary') {
        employeeData.disciplinaryCount++;
      } else if (doc.category === 'PIP') {
        employeeData.pipCount++;
      } else {
        employeeData.administrativeCount++;
      }

      // Update latest document if this one is newer
      if (new Date(doc.date) > new Date(employeeData.latestDocument.date)) {
        employeeData.latestDocument = doc;
      }
    });

    // Convert map to array and sort by latest document date (newest first)
    return Array.from(employeeMap.values())
      .sort((a, b) => new Date(b.latestDocument.date).getTime() - new Date(a.latestDocument.date).getTime());
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
      case 'PIP':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Replace the custom header with PageHeader */}
        {employeeFilter ? (
          <PageHeader
            title={`${getFilteredDocuments()[0]?.employee.name || 'Employee'} Documents`}
            subtitle="View and manage documents for this team member"
            icon={<FileText className="h-5 w-5" />}
            actions={
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Button
                  className={headerButtonClass}
                  onClick={() => navigate('/documentation')}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              </div>
            }
          />
        ) : (
          <PageHeader
            title="Team Documentation"
            subtitle="Professional documentation system for tracking team member records, performance, and administrative notes"
            icon={<ClipboardList className="h-5 w-5" />}
            actions={
              (user?.position === 'Leader' || user?.position === 'Director') && (
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <Button
                    onClick={handleNewDocument}
                    className={headerButtonClass}
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>New Document</span>
                  </Button>
                </div>
              )
            }
          />
        )}

        {/* Stats Cards - Only show when not filtering by employee */}
        {!employeeFilter && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {/* Total Documents Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
              <CardContent className="p-3 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs md:text-sm font-medium mb-1">Total Documents</p>
                    <p className="text-xl md:text-3xl font-bold">{stats.disciplinary + stats.administrative}</p>
                    <p className="text-blue-200 text-xs mt-1">All records</p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <FileText className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disciplinary Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent"></div>
              <CardContent className="p-3 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs md:text-sm font-medium mb-1">Disciplinary</p>
                    <p className="text-xl md:text-3xl font-bold">{stats.disciplinary}</p>
                    <p className="text-red-200 text-xs mt-1">Action items</p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <Shield className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Administrative Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#E51636] to-[#DD0031] text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/20 to-transparent"></div>
              <CardContent className="p-3 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs md:text-sm font-medium mb-1">Administrative</p>
                    <p className="text-xl md:text-3xl font-bold">{stats.administrative}</p>
                    <p className="text-red-200 text-xs mt-1">General records</p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <Archive className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Employees Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent"></div>
              <CardContent className="p-3 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs md:text-sm font-medium mb-1">Active Employees</p>
                    <p className="text-xl md:text-3xl font-bold">{getGroupedDocuments().length}</p>
                    <p className="text-green-200 text-xs mt-1">With records</p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <Users className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border border-gray-200 shadow-lg bg-white overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {/* Search Section */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by employee name, document type, or description..."
                  className="pl-12 h-12 border-gray-300 focus:border-[#E51636] focus:ring-[#E51636] bg-white text-base shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  className={`h-10 md:h-12 px-3 md:px-6 transition-all duration-200 text-sm md:text-base ${
                    filter === 'all'
                      ? 'bg-[#E51636] hover:bg-[#DD0031] text-white shadow-lg'
                      : 'border-gray-300 hover:border-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  <Sparkles className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">All Documents</span>
                  <span className="sm:hidden">All</span>
                </Button>
                <Button
                  variant={filter === 'disciplinary' ? 'default' : 'outline'}
                  className={`h-10 md:h-12 px-3 md:px-6 transition-all duration-200 text-sm md:text-base ${
                    filter === 'disciplinary'
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      : 'border-gray-300 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                  onClick={() => setFilter('disciplinary')}
                >
                  <Shield className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Disciplinary</span>
                  <span className="sm:hidden">Disc</span>
                </Button>
                <Button
                  variant={filter === 'pip' ? 'default' : 'outline'}
                  className={`h-10 md:h-12 px-3 md:px-6 transition-all duration-200 text-sm md:text-base ${
                    filter === 'pip'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
                      : 'border-gray-300 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50'
                  }`}
                  onClick={() => setFilter('pip')}
                >
                  <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">PIP</span>
                  <span className="sm:hidden">PIP</span>
                </Button>
                <Button
                  variant={filter === 'administrative' ? 'default' : 'outline'}
                  className={`h-10 md:h-12 px-3 md:px-6 transition-all duration-200 text-sm md:text-base ${
                    filter === 'administrative'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                      : 'border-gray-300 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={() => setFilter('administrative')}
                >
                  <Archive className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Administrative</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="bg-blue-500 p-2 md:p-3 rounded-xl shadow-lg">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  {employeeFilter ? 'Employee Documents' : 'Team Documentation Overview'}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm md:text-base mt-1">
                  {employeeFilter
                    ? 'Detailed view of all documents for this team member'
                    : 'Comprehensive view of all team member documentation and records'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#E51636]/20 border-t-[#E51636] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#E51636] animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading documentation...</p>
              </div>
            ) : getFilteredDocuments().length === 0 ? (
              <div className="text-center p-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? "No documents match your search criteria. Try adjusting your search terms or filters."
                    : "There are no documents in this category yet. Create your first document to get started."}
                </p>
                {(user?.position === 'Leader' || user?.position === 'Director') && (
                  <Button
                    onClick={handleNewDocument}
                    className="bg-gradient-to-r from-[#E51636] to-[#DD0031] hover:from-[#DD0031] hover:to-[#C41E3A] text-white px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FilePlus className="w-5 h-5 mr-2" />
                    Create New Document
                  </Button>
                )}
              </div>
            ) : employeeFilter ? (
              // Show individual documents when filtering by employee
              <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                {getFilteredDocuments().map((doc, index) => (
                  <Card
                    key={doc._id}
                    className="border shadow-md bg-white hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className={`p-2 md:p-3 rounded-xl shadow-sm ${
                            doc.category === 'Disciplinary'
                              ? 'bg-red-100 text-red-600'
                              : doc.category === 'PIP'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {getCategoryIcon(doc.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className={`text-base md:text-lg font-bold ${
                                doc.category === 'Disciplinary'
                                  ? 'text-red-700'
                                  : doc.category === 'PIP'
                                  ? 'text-orange-700'
                                  : 'text-blue-700'
                              }`}>
                                {doc.type}
                              </h3>
                              <div className="flex items-center gap-2">
                                {doc.source === 'disciplinary' && (
                                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                                    Legacy
                                  </span>
                                )}
                                {getStatusBadge(doc.status)}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {new Date(doc.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User2 className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Created by {doc.createdBy.name}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm md:text-base line-clamp-2 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            #{index + 1}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 hover:border-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(doc);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Show grouped documents by employee when not filtering
              <div className="p-3 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {getGroupedDocuments().map((employeeData, index) => (
                    <Card
                      key={employeeData.employee._id}
                      className="border border-gray-200 shadow-lg bg-white hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden group"
                    >
                      <CardContent className="p-0">
                        {/* Employee Header */}
                        <div className="p-5 md:p-6">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-xl md:text-2xl text-gray-900 mb-1">{employeeData.employee.name}</h3>
                              <p className="text-gray-500 text-base md:text-lg">{employeeData.employee.position}</p>
                              {employeeData.employee.department && (
                                <p className="text-gray-400 text-sm mt-1">{employeeData.employee.department}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div className="bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {employeeData.documents.length} Doc{employeeData.documents.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div className="px-4 md:px-5 py-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {employeeData.disciplinaryCount > 0 && (
                              <div className="flex items-center gap-1.5 bg-red-100 px-2.5 py-1 rounded-full">
                                <Shield className="w-3 h-3 text-red-600" />
                                <span className="text-xs font-medium text-red-700">
                                  {employeeData.disciplinaryCount} Disciplinary
                                </span>
                              </div>
                            )}
                            {employeeData.pipCount > 0 && (
                              <div className="flex items-center gap-1.5 bg-orange-100 px-2.5 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 text-orange-600" />
                                <span className="text-xs font-medium text-orange-700">
                                  {employeeData.pipCount} PIP
                                </span>
                              </div>
                            )}
                            {employeeData.administrativeCount > 0 && (
                              <div className="flex items-center gap-1.5 bg-blue-100 px-2.5 py-1 rounded-full">
                                <Archive className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">
                                  {employeeData.administrativeCount} Admin
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Latest Document Preview */}
                        <div className="p-4 md:p-5">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className={`w-6 h-6 ${
                                employeeData.latestDocument.category === 'Disciplinary'
                                  ? 'text-red-500'
                                  : employeeData.latestDocument.category === 'PIP'
                                  ? 'text-orange-500'
                                  : 'text-blue-500'
                              }`}>
                                {getCategoryIcon(employeeData.latestDocument.category)}
                              </div>
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                employeeData.latestDocument.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h4 className={`font-semibold text-base ${
                                  employeeData.latestDocument.category === 'Disciplinary'
                                    ? 'text-red-700'
                                    : employeeData.latestDocument.category === 'PIP'
                                    ? 'text-orange-700'
                                    : 'text-blue-700'
                                } truncate`}>
                                  {employeeData.latestDocument.type}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {employeeData.latestDocument.source === 'disciplinary' && (
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                      Legacy
                                    </span>
                                  )}
                                  {getStatusBadge(employeeData.latestDocument.status)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(employeeData.latestDocument.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                  {employeeData.latestDocument.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer with Actions */}
                        <div className="px-4 md:px-5 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="flex justify-between items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {employeeData.documents.length} total record{employeeData.documents.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 hover:border-[#E51636] hover:text-white hover:bg-[#E51636] transition-all duration-200 font-medium text-sm px-4 py-2"
                              onClick={() => handleViewEmployeeDocuments(employeeData.employee._id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View All
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {getGroupedDocuments().length === 0 && (
                  <div className="col-span-full text-center p-12">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No employees with documents found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {searchQuery
                        ? "No employees match your search criteria. Try adjusting your search terms or filters."
                        : "There are no employees with documents in this category yet."}
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
