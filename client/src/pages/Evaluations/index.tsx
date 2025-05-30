import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  FileText,
  Users,
  Trash2,
  Calendar,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Mail,
  Bell,
  ClipboardCheck,
  UserCircle,
  Store
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import MyTeamDialog from './components/MyTeamDialog';

interface Evaluation {
  _id: string;
  employee: {
    _id: string;
    name: string;
    position: string;
  };
  evaluator: {
    _id: string;
    name: string;
  };
  template: {
    _id: string;
    name: string;
  };
  status: 'pending_self_evaluation' | 'pending_manager_review' | 'in_review_session' | 'completed';
  scheduledDate: string;
  reviewSessionDate?: string;
  completedDate?: string;
  acknowledgement?: {
    acknowledged: boolean;
    date: string;
  };
}

type SortField = 'date' | 'name' | 'status';
type SortOrder = 'asc' | 'desc';

interface Department {
  value: string;
  label: string;
}

export default function Evaluations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [showMyTeamDialog, setShowMyTeamDialog] = useState(false);

  // Add debug logging
  console.log('User data:', {
    user,
    isAdmin: user?.isAdmin,
    position: user?.position
  });

  const [view, setView] = useState<'all' | 'pending' | 'completed'>(user?.position === 'Team Member' ? 'all' : 'pending');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<'team' | 'store'>(user?.position === 'Team Member' ? 'store' : 'team');

  // Fetch evaluations
  const { data: evaluations, isLoading, error, refetch } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/evaluations');
        console.log('Raw API response:', response);
        console.log('Fetched evaluations:', response.data.evaluations);
        console.log('Current user:', user);
        return response.data.evaluations;
      } catch (error: any) {
        console.error('Error fetching evaluations:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch evaluations');
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 30000
  });

  // Delete evaluation mutation
  const deleteEvaluation = useMutation({
    mutationFn: async (evaluationId: string) => {
      await api.delete(`/api/evaluations/${evaluationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
        variant: "default",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete evaluation",
        variant: "destructive",
      });
    }
  });

  // Add this with other mutations at the top of the component
  const sendUnacknowledgedNotification = useMutation({
    mutationFn: async (evaluationId: string) => {
      return api.post(`/api/evaluations/${evaluationId}/notify-unacknowledged`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Acknowledgement reminder sent successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send notification",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, evaluationId: string) => {
    e.stopPropagation(); // Prevent card click navigation
    setEvaluationToDelete(evaluationId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (evaluationToDelete) {
      deleteEvaluation.mutate(evaluationToDelete);
      setShowDeleteDialog(false);
      setEvaluationToDelete(null);
    }
  };

  const departments: Department[] = [...new Set(evaluations?.map((evaluation: Evaluation) => evaluation.employee?.position?.split(' ')[0]) || [])]
    .filter((dept): dept is string => Boolean(dept))
    .map(dept => ({ value: dept, label: dept }));

  const sortEvaluations = (a: Evaluation, b: Evaluation) => {
    // Skip sorting if required data is missing
    if (!a.employee || !b.employee || !a.template || !b.template) {
      return 0;
    }

    switch (sortField) {
      case 'date':
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return sortOrder === 'asc'
          ? new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
          : new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
      case 'name':
        return sortOrder === 'asc'
          ? a.employee.name.localeCompare(b.employee.name)
          : b.employee.name.localeCompare(a.employee.name);
      case 'status':
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      default:
        return 0;
    }
  };

  const filteredEvaluations = evaluations
    ?.filter((evaluation: Evaluation) => {
      // First check if evaluation has required data
      if (!evaluation.employee?.name || !evaluation.template?.name || !evaluation.evaluator?.name) {
        console.log('Filtering out evaluation due to missing data:', evaluation);
        return false;
      }

      let shouldShow = true;

      // Status filter
      if (view === 'pending') {
        shouldShow = evaluation.status !== 'completed';
      } else if (view === 'completed') {
        shouldShow = evaluation.status === 'completed';
      }

      // Team/Store scope filter
      if (shouldShow && viewScope === 'team' && user?._id) {
        // Show only evaluations where the current user is the evaluator
        shouldShow = evaluation.evaluator?._id === user._id;
      }

      // Department filter
      if (shouldShow && departmentFilter !== 'all') {
        const employeeDepartment = evaluation.employee.position?.split(' ')[0];
        shouldShow = employeeDepartment === departmentFilter;
      }

      // Search filter
      if (shouldShow && searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        shouldShow = evaluation.employee.name.toLowerCase().includes(searchLower) ||
                    evaluation.template.name.toLowerCase().includes(searchLower);
      }

      return shouldShow;
    })
    .sort(sortEvaluations);



  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_self_evaluation':
        return 'bg-blue-100 text-blue-800';
      case 'pending_manager_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review_session':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (evaluation: Evaluation) => {
    const status = evaluation.status.replace(/_/g, ' ');
    const isEmployee = user?._id === evaluation.employee?._id;
    const isManager = user?._id === evaluation.evaluator?._id;

    switch (evaluation.status) {
      case 'pending_self_evaluation':
        return isEmployee ? 'Action Required: Self-Evaluation' : 'Awaiting Self-Evaluation';
      case 'pending_manager_review':
        return isManager ? 'Action Required: Schedule Review' : 'Pending Manager Review';
      case 'in_review_session':
        return isManager ? 'Action Required: Complete Review' : 'In Review Session';
      case 'completed':
        return evaluation.acknowledgement?.acknowledged
          ? 'Completed & Acknowledged'
          : isEmployee
            ? 'Action Required: Acknowledge'
            : 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getDueStatus = (date: string, status: string, completedDate?: string) => {
    if (status === 'completed' && completedDate) {
      return { text: `Completed ${new Date(completedDate).toLocaleDateString()}`, class: 'text-green-600' };
    }

    const dueDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', class: 'text-red-600' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, class: 'text-yellow-600' };
    return { text: `Due in ${diffDays} days`, class: 'text-gray-500' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_self_evaluation':
        return Clock;
      case 'pending_manager_review':
        return AlertCircle;
      case 'in_review_session':
        return Users;
      case 'completed':
        return CheckCircle2;
      default:
        return AlertTriangle;
    }
  };

  const sendEvaluationEmail = async (evaluationId: string) => {
    try {
      const response = await api.post(`/api/evaluations/${evaluationId}/send-email`);

      if (!response.data) {
        throw new Error('Failed to send evaluation email');
      }

      showNotification(
        'success',
        'Email Sent',
        'Evaluation has been sent to the store email.'
      );
    } catch (error: any) {
      showNotification(
        'error',
        'Email Failed',
        error.response?.data?.message || 'Failed to send evaluation email. Please try again.'
      );
    }
  };

  // Handle error state in the UI
  if (error instanceof Error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-[20px] bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-[#E51636]" />
                </div>
                <h1 className="text-xl font-semibold mb-2 text-[#27251F]">Error Loading Evaluations</h1>
                <p className="text-[#27251F]/60 mb-6">There was a problem loading the evaluations. Please try again later.</p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced premium header with subtle gradient */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-3 md:p-6 text-white shadow-md">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold tracking-tight">Performance Reviews</h1>
                  <p className="text-white/90 text-sm md:text-base">Track and manage employee evaluations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Only show My Team button for managers, leaders, and directors */}
                {user?.position && ['Manager', 'Leader', 'Director'].includes(user.position) && (
                  <button
                    onClick={() => setShowMyTeamDialog(true)}
                    className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                  >
                    <Users className="w-4 h-4" />
                    <span>My Team</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/templates')}
                  className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Templates</span>
                </button>
                <button
                  onClick={() => navigate('/evaluations/new')}
                  className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Pending Reviews</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {evaluations?.filter((e: Evaluation) => e.status !== 'completed').length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">In Review</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {evaluations?.filter((e: Evaluation) => e.status === 'in_review_session').length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Completed</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {evaluations?.filter((e: Evaluation) => e.status === 'completed').length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 text-sm sm:text-base font-medium">Unacknowledged</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {evaluations?.filter((e: Evaluation) => !e.acknowledgement?.acknowledged).length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white rounded-[20px] shadow-md">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#27251F]/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={view === 'all' ? 'default' : 'outline'}
                    onClick={() => setView('all')}
                    className={`rounded-full text-sm sm:text-base ${
                      view === 'all'
                        ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                        : 'hover:bg-[#E51636]/10 hover:text-[#E51636]'
                    }`}
                  >
                    All Reviews
                  </Button>
                  <Button
                    variant={view === 'pending' ? 'default' : 'outline'}
                    onClick={() => setView('pending')}
                    className={`rounded-full text-sm sm:text-base ${
                      view === 'pending'
                        ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                        : 'hover:bg-[#E51636]/10 hover:text-[#E51636]'
                    }`}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={view === 'completed' ? 'default' : 'outline'}
                    onClick={() => setView('completed')}
                    className={`rounded-full text-sm sm:text-base ${
                      view === 'completed'
                        ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                        : 'hover:bg-[#E51636]/10 hover:text-[#E51636]'
                    }`}
                  >
                    Completed
                  </Button>
                </div>

                {/* Team/Store Toggle */}
                <div className="flex items-center justify-center sm:justify-end gap-2 ml-auto bg-gray-50 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <UserCircle className={`h-5 w-5 ${viewScope === 'team' ? 'text-[#E51636]' : 'text-gray-400'}`} />
                    <Label htmlFor="team-store-toggle" className="text-sm font-medium cursor-pointer">Your Team</Label>
                  </div>
                  <Switch
                    id="team-store-toggle"
                    checked={viewScope === 'store'}
                    onCheckedChange={(checked) => setViewScope(checked ? 'store' : 'team')}
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor="team-store-toggle" className="text-sm font-medium cursor-pointer">All Store</Label>
                    <Store className={`h-5 w-5 ${viewScope === 'store' ? 'text-[#E51636]' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
            </div>
          ) : filteredEvaluations?.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-[#27251F]/60 mb-4">
                {view === 'pending' ? 'No pending evaluations found' :
                 view === 'completed' ? 'No completed evaluations found' :
                 'No evaluations found'}
              </p>
              <Button
                onClick={() => navigate('/evaluations/new')}
                className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Evaluation
              </Button>
            </div>
          ) : (
            filteredEvaluations?.sort(sortEvaluations).map((evaluation: Evaluation) => (
              <Card
                key={evaluation._id}
                className="bg-white rounded-[20px] hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/evaluations/${evaluation._id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 sm:p-6">
                    {/* Left section with name and status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#27251F] text-base sm:text-lg truncate">
                          {evaluation.employee?.name}
                        </h3>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(evaluation.status)}`}>
                          {evaluation.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                      <p className="text-sm text-[#27251F]/60 mb-3">{evaluation.employee?.position}</p>

                      {/* Template name with icon */}
                      <div className="flex items-center gap-2 text-sm text-[#27251F]/80">
                        <FileText className="w-4 h-4 text-[#27251F]/40" />
                        <span>{evaluation.template?.name}</span>
                      </div>
                    </div>

                    {/* Right section with date and evaluator */}
                    <div className="flex flex-col gap-3 sm:text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#27251F]/40" />
                        <span className="text-[#27251F]/60">Employee Due:</span>
                        <span className="font-medium text-[#27251F]">
                          {evaluation.scheduledDate ? new Date(evaluation.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#27251F]/40" />
                        <span className="text-[#27251F]/60">Evaluator:</span>
                        <span className="font-medium text-[#27251F]">{evaluation.evaluator?.name}</span>
                      </div>
                    </div>

                    {/* Delete button for directors */}
                    {evaluation.status !== 'completed' && user?.position === 'Director' && (
                      <div className="flex sm:flex-col justify-end">
                        <button
                          onClick={(e) => handleDelete(e, evaluation._id)}
                          className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-[#E51636] transition-colors"
                          aria-label="Delete evaluation"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress indicator bar at bottom */}
                  <div className="h-1 w-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <div
                      className={`h-full ${
                        evaluation.status === 'completed'
                          ? 'bg-green-500'
                          : evaluation.status === 'in_review_session'
                          ? 'bg-purple-500'
                          : 'bg-[#E51636]'
                      }`}
                      style={{
                        width: evaluation.status === 'completed'
                          ? '100%'
                          : evaluation.status === 'in_review_session'
                          ? '66%'
                          : evaluation.status === 'pending_manager_review'
                          ? '33%'
                          : '10%'
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this evaluation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 py-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setEvaluationToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* My Team Dialog */}
        <MyTeamDialog
          open={showMyTeamDialog}
          onOpenChange={setShowMyTeamDialog}
        />
      </div>
    </div>
  );
}