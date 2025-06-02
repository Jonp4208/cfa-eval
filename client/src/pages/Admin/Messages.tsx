import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  ArrowLeft,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Zap,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';
import messageService, { Message, MessageStats } from '@/services/messageService';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Mail },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

const categoryConfig = {
  bug: { label: 'Bug Report', color: 'bg-red-50 text-red-700' },
  feature_request: { label: 'Feature Request', color: 'bg-purple-50 text-purple-700' },
  question: { label: 'Question', color: 'bg-blue-50 text-blue-700' },
  billing: { label: 'Billing', color: 'bg-green-50 text-green-700' },
  technical_support: { label: 'Technical Support', color: 'bg-orange-50 text-orange-700' },
  other: { label: 'Other', color: 'bg-gray-50 text-gray-700' }
};

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-messages', filters, page],
    queryFn: () => messageService.getAllMessages({
      status: filters.status || undefined,
      category: filters.category || undefined,
      priority: filters.priority || undefined,
      page,
      limit: 20
    })
  });

  // Fetch message stats
  const { data: stats } = useQuery({
    queryKey: ['admin-message-stats'],
    queryFn: messageService.getMessageStats
  });

  // Update message status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminResponse }: { id: string; status: string; adminResponse?: string }) =>
      messageService.updateMessageStatus(id, { status: status as any, adminResponse }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-message-stats'] });
      toast({
        title: 'Message Updated',
        description: 'Message status has been updated successfully.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update message.',
        variant: 'destructive'
      });
    }
  });

  const handleStatusUpdate = (messageId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: messageId, status: newStatus });
  };

  const filteredMessages = messagesData?.messages?.filter(message => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        message.subject.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower) ||
        message.userDetails?.name.toLowerCase().includes(searchLower) ||
        message.contactEmail.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  if (selectedMessage) {
    return <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <PageHeader
              title="Support Messages"
              subtitle="Manage customer support requests and communications with style"
              icon={<MessageSquare className="h-6 w-6 text-red-600" />}
              showBackButton={true}
              actions={
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`h-8 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2 bg-white/50 hover:bg-white/80 border-white/30"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              }
            />
          </div>
        </div>

        {/* Beautiful Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Total Messages */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stats.overview.total}</div>
                    <div className="text-sm text-slate-600 font-medium">Total</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* New Messages */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{stats.overview.new}</div>
                    <div className="text-sm text-blue-700 font-medium">New</div>
                  </div>
                  <Mail className="h-8 w-8 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-900">{stats.overview.inProgress}</div>
                    <div className="text-sm text-yellow-700 font-medium">In Progress</div>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400 group-hover:text-yellow-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* Resolved */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-900">{stats.overview.resolved}</div>
                    <div className="text-sm text-green-700 font-medium">Resolved</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400 group-hover:text-green-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* Closed */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.overview.closed}</div>
                    <div className="text-sm text-gray-700 font-medium">Closed</div>
                  </div>
                  <XCircle className="h-8 w-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* Urgent */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-900">{stats.overview.urgent}</div>
                    <div className="text-sm text-red-700 font-medium">Urgent</div>
                  </div>
                  <Zap className="h-8 w-8 text-red-400 group-hover:text-red-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>

            {/* High Priority */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-900">{stats.overview.high}</div>
                    <div className="text-sm text-orange-700 font-medium">High Priority</div>
                  </div>
                  <Star className="h-8 w-8 text-orange-400 group-hover:text-orange-600 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter Messages</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <Input
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-white/80 border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all duration-200"
                />
              </div>
              <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all duration-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.category || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all duration-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.priority || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === "all" ? "" : value }))}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all duration-200">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Messages List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
                <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-red-100" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-30" />
                  <MessageSquare className="relative h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Messages Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">No support messages match your current filters. Try adjusting your search criteria or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  onView={() => setSelectedMessage(message)}
                  onStatusUpdate={handleStatusUpdate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {messagesData && messagesData.pagination.pages > 1 && (
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, messagesData.pagination.total)} of {messagesData.pagination.total} messages
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-white/80 hover:bg-white border-gray-200 hover:border-red-300 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-purple-50 rounded-lg border border-red-100">
                    <span className="text-sm font-medium text-gray-700">
                      Page {page} of {messagesData.pagination.pages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === messagesData.pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="bg-white/80 hover:bg-white border-gray-200 hover:border-red-300 transition-all duration-200"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  onView: () => void;
  onStatusUpdate: (messageId: string, status: string) => void;
  viewMode: 'grid' | 'list';
}

function MessageCard({ message, onView, onStatusUpdate, viewMode }: MessageCardProps) {
  const statusInfo = statusConfig[message.status];
  const priorityInfo = priorityConfig[message.priority];
  const categoryInfo = categoryConfig[message.category];
  const StatusIcon = statusInfo.icon;

  const isUrgent = message.priority === 'urgent';
  const isHigh = message.priority === 'high';
  const isNew = message.status === 'new';

  if (viewMode === 'list') {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-r from-white via-white to-gray-50/50 border border-gray-200/60 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/20 transition-all duration-300 cursor-pointer" onClick={onView}>
        {/* Priority indicator bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isUrgent ? 'bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30' :
          isHigh ? 'bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 shadow-lg shadow-orange-500/30' :
          isNew ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/30' :
          'bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600'
        }`} />

        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="relative p-6 pl-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-600 transition-colors duration-200 line-clamp-1 mb-2">
                    {message.subject}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${priorityInfo.color} font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm`}>
                      {priorityInfo.label}
                    </Badge>
                    <Badge className={`${categoryInfo.color} font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm`}>
                      {categoryInfo.label}
                    </Badge>
                    {isNew && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm animate-pulse">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 rounded-lg p-4 mb-4 border border-gray-100">
                <p className="text-gray-700 line-clamp-2 leading-relaxed font-medium">{message.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 border border-gray-100">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">User</div>
                    <div className="font-semibold text-gray-900">{message.userDetails?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 border border-gray-100">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</div>
                    <div className="font-semibold text-gray-900 truncate">{message.contactEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 border border-gray-100">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Received</div>
                    <div className="font-semibold text-gray-900">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 ml-8">
              <Badge className={`${statusInfo.color} flex items-center gap-2 px-4 py-2 font-semibold text-sm shadow-sm`}>
                <StatusIcon className="h-4 w-4" />
                {statusInfo.label}
              </Badge>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onView(); }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {isNew && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusUpdate(message._id, 'in_progress');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`group relative overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/30 border border-gray-200/60 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
      isUrgent ? 'ring-2 ring-red-200 hover:ring-red-300 shadow-red-100/30' :
      isHigh ? 'ring-2 ring-orange-200 hover:ring-orange-300 shadow-orange-100/30' :
      isNew ? 'ring-2 ring-blue-200 hover:ring-blue-300 shadow-blue-100/30' : ''
    }`} onClick={onView}>
      {/* Priority corner indicator */}
      <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-b-[40px] border-l-transparent ${
        isUrgent ? 'border-b-red-500' :
        isHigh ? 'border-b-orange-500' :
        isNew ? 'border-b-blue-500' : 'border-b-gray-400'
      }`} />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isUrgent ? 'from-red-50/50 to-red-100/30' :
        isHigh ? 'from-orange-50/50 to-orange-100/30' :
        isNew ? 'from-blue-50/50 to-blue-100/30' :
        'from-gray-50/50 to-gray-100/30'
      }`} />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${priorityInfo.color} font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm`}>
              {priorityInfo.label}
            </Badge>
            <Badge className={`${categoryInfo.color} font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm`}>
              {categoryInfo.label}
            </Badge>
          </div>
          <Badge className={`${statusInfo.color} flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs shadow-sm`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
          {message.subject}
        </h3>

        <div className="bg-gray-50/80 rounded-lg p-3 mb-4 border border-gray-100">
          <p className="text-gray-700 line-clamp-3 leading-relaxed text-sm font-medium">
            {message.message}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2 border border-gray-100">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <User className="h-3 w-3 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">User</div>
              <div className="font-semibold text-gray-900 text-sm truncate">{message.userDetails?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2 border border-gray-100">
            <div className="p-1.5 bg-green-100 rounded-full">
              <Mail className="h-3 w-3 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</div>
              <div className="font-semibold text-gray-900 text-sm truncate">{message.contactEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2 border border-gray-100">
            <div className="p-1.5 bg-purple-100 rounded-full">
              <Calendar className="h-3 w-3 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Received</div>
              <div className="font-semibold text-gray-900 text-sm">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {isNew && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(message._id, 'in_progress');
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4"
            >
              <Activity className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Message Detail Component
function MessageDetail({ message, onBack }: { message: Message; onBack: () => void }) {
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState(message.status);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ status, adminResponse }: { status: string; adminResponse?: string }) =>
      messageService.updateMessageStatus(message._id, { status: status as any, adminResponse }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-message-stats'] });
      toast({
        title: 'Message Updated',
        description: 'Message has been updated successfully.',
        variant: 'default'
      });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update message.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmitResponse = () => {
    if (!response.trim()) {
      toast({
        title: 'Response Required',
        description: 'Please enter a response before submitting.',
        variant: 'destructive'
      });
      return;
    }
    updateMutation.mutate({ status: newStatus, adminResponse: response });
  };

  const statusInfo = statusConfig[message.status];
  const priorityInfo = priorityConfig[message.priority];
  const categoryInfo = categoryConfig[message.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        {/* Enhanced Back Button */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg">
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2 bg-white/50 hover:bg-white/80 border-white/30 hover:border-red-300 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Messages
            </Button>
          </div>
        </div>

        {/* Beautiful Message Header */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-white via-white to-gray-50/50 border border-gray-200/60 shadow-xl">
          {/* Priority indicator */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            message.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
            message.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
            message.status === 'new' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            'bg-gradient-to-r from-gray-400 to-gray-500'
          }`} />

          <CardHeader className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <CardTitle className="text-3xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {message.subject}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`${statusInfo.color} flex items-center gap-2 px-4 py-2 font-semibold text-sm shadow-sm`}>
                    <statusInfo.icon className="h-4 w-4" />
                    {statusInfo.label}
                  </Badge>
                  <Badge className={`${priorityInfo.color} font-semibold px-4 py-2 text-sm shadow-sm`}>
                    {priorityInfo.label} Priority
                  </Badge>
                  <Badge className={`${categoryInfo.color} font-semibold px-4 py-2 text-sm shadow-sm`}>
                    {categoryInfo.label}
                  </Badge>
                  {message.status === 'new' && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-4 py-2 text-sm shadow-sm animate-pulse">
                      New Message
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-6">
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Received</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Contact Information */}
        <Card className="bg-gradient-to-r from-white via-white to-blue-50/30 border border-blue-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">User Details</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Full Name</div>
                        <div className="text-lg font-semibold text-gray-900">{message.userDetails?.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email Address</div>
                        <div className="text-lg font-semibold text-gray-900 truncate">{message.contactEmail}</div>
                      </div>
                    </div>
                  </div>
                  {message.contactPhone && (
                    <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Phone className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</div>
                          <div className="text-lg font-semibold text-gray-900">{message.contactPhone}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <Star className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Position</div>
                        <div className="text-lg font-semibold text-gray-900">{message.userDetails?.position}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Building className="h-5 w-5 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Store Information</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Building className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Store Name</div>
                        <div className="text-lg font-semibold text-gray-900">{message.storeDetails?.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Store Number</div>
                        <div className="text-lg font-semibold text-gray-900">#{message.storeDetails?.storeNumber}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Building className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Store Address</div>
                        <div className="text-lg font-semibold text-gray-900 leading-relaxed">{message.storeDetails?.storeAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Original Message */}
        <Card className="bg-gradient-to-r from-white via-white to-purple-50/30 border border-purple-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Original Message</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-white to-purple-50/50 p-6 rounded-xl border border-purple-100 shadow-inner">
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium text-lg">
                  {message.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Response (if any) */}
        {message.adminResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previous Response</CardTitle>
              <p className="text-sm text-gray-600">
                Responded {formatDistanceToNow(new Date(message.respondedAt!), { addSuffix: true })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{message.adminResponse}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Response Message</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response to the user..."
                className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {response.length}/2000
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitResponse}
                disabled={updateMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Updating...
                  </>
                ) : (
                  'Send Response & Update Status'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => updateMutation.mutate({ status: newStatus })}
                disabled={updateMutation.isPending}
              >
                Update Status Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
