import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import ContactSupport from '@/components/ContactSupport';
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
  Calendar,
  Plus,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Users,
  Activity,
  BarChart3,
  ArrowLeft,
  Phone
} from 'lucide-react';
import messageService, { Message } from '@/services/messageService';
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
  bug: { label: 'Bug Report', color: 'bg-red-100 text-red-800' },
  feature_request: { label: 'Feature Request', color: 'bg-purple-100 text-purple-800' },
  question: { label: 'Question', color: 'bg-blue-100 text-blue-800' },
  billing: { label: 'Billing', color: 'bg-green-100 text-green-800' },
  technical_support: { label: 'Technical Support', color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: ''
  });
  const [showContactSupport, setShowContactSupport] = useState(false);
  const { toast } = useToast();

  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ['userMessages', page, filters],
    queryFn: () => messageService.getUserMessages({
      page,
      limit: 20,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.priority && { priority: filters.priority })
    })
  });

  const filteredMessages = messagesData?.messages?.filter(message => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        message.subject.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower) ||
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
        {/* Beautiful Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg">
            <PageHeader
              title="My Support Messages"
              subtitle="Track your support requests and view responses from our team"
              actions={
                <div className="flex gap-3">
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="gap-2 bg-white/50 hover:bg-white/80 border-white/30 hover:border-blue-300 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <ContactSupport
                    trigger={
                      <Button className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="h-4 w-4" />
                        New Message
                      </Button>
                    }
                    onSuccess={() => {
                      refetch();
                      toast({
                        title: 'Message Sent',
                        description: 'Your support message has been sent successfully.',
                        variant: 'default'
                      });
                    }}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Messages',
              value: messagesData?.pagination.total || 0,
              icon: MessageSquare,
              color: 'from-slate-500 to-slate-600',
              bgColor: 'bg-slate-100',
              textColor: 'text-slate-600'
            },
            {
              title: 'Pending',
              value: filteredMessages.filter(m => m.status === 'new' || m.status === 'in_progress').length,
              icon: Clock,
              color: 'from-yellow-500 to-yellow-600',
              bgColor: 'bg-yellow-100',
              textColor: 'text-yellow-600'
            },
            {
              title: 'Resolved',
              value: filteredMessages.filter(m => m.status === 'resolved').length,
              icon: CheckCircle,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-100',
              textColor: 'text-green-600'
            },
            {
              title: 'Urgent',
              value: filteredMessages.filter(m => m.priority === 'urgent').length,
              icon: AlertTriangle,
              color: 'from-red-500 to-red-600',
              bgColor: 'bg-red-100',
              textColor: 'text-red-600'
            }
          ].map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-full group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Filters and View Toggle */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filter Messages</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 bg-white/80 border-white/30 focus:border-red-300 focus:ring-red-200 transition-all duration-200"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="bg-white/80 hover:bg-white border-white/30 hover:border-red-300 transition-all duration-200"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="bg-white/80 hover:bg-white border-white/30 hover:border-red-300 transition-all duration-200"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
                <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-red-100" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-30" />
                  <MessageSquare className="relative h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Messages Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">You haven't sent any support messages yet. Click the button below to get started.</p>
                <ContactSupport
                  trigger={
                    <Button className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                      <Plus className="h-4 w-4" />
                      Send Your First Message
                    </Button>
                  }
                  onSuccess={() => refetch()}
                />
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  onView={() => setSelectedMessage(message)}
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

// Message Card Component (will be added in next part)
interface MessageCardProps {
  message: Message;
  onView: () => void;
  viewMode: 'grid' | 'list';
}

function MessageCard({ message, onView, viewMode }: MessageCardProps) {
  const statusInfo = statusConfig[message.status];
  const priorityInfo = priorityConfig[message.priority];
  const categoryInfo = categoryConfig[message.category];
  const StatusIcon = statusInfo.icon;

  const isUrgent = message.priority === 'urgent';
  const isHigh = message.priority === 'high';
  const isNew = message.status === 'new';
  const hasResponse = !!message.adminResponse;

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

        {/* Response indicator */}
        {hasResponse && (
          <div className="absolute top-4 right-4">
            <div className="p-2 bg-green-100 rounded-full animate-pulse">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
          </div>
        )}

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
                    {hasResponse && (
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-3 py-1.5 text-xs uppercase tracking-wide shadow-sm">
                        Response Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 rounded-lg p-4 mb-4 border border-gray-100">
                <p className="text-gray-700 line-clamp-2 leading-relaxed font-medium">{message.message}</p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{message.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 ml-6">
              <Badge className={`${statusInfo.color} flex items-center gap-2 px-4 py-2 font-semibold text-sm shadow-sm`}>
                <StatusIcon className="h-4 w-4" />
                {statusInfo.label}
              </Badge>

              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
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

      {/* Response indicator */}
      {hasResponse && (
        <div className="absolute top-2 left-2 z-10">
          <div className="p-1.5 bg-green-100 rounded-full animate-pulse">
            <Mail className="h-3 w-3 text-green-600" />
          </div>
        </div>
      )}

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

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{message.contactEmail}</span>
          </div>
        </div>

        {hasResponse && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle className="h-4 w-4" />
              Response Available
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Message Detail Component
function MessageDetail({ message, onBack }: { message: Message; onBack: () => void }) {
  const statusInfo = statusConfig[message.status];
  const priorityInfo = priorityConfig[message.priority];
  const categoryInfo = categoryConfig[message.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
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
                  <div className="text-sm text-gray-500 font-medium">Sent</div>
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

        {/* Enhanced Original Message */}
        <Card className="bg-gradient-to-r from-white via-white to-purple-50/30 border border-purple-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Your Message</CardTitle>
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

        {/* Admin Response (if available) */}
        {message.adminResponse && (
          <Card className="bg-gradient-to-r from-white via-white to-green-50/30 border border-green-200/60 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Our Response</CardTitle>
                  {message.respondedAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Responded {formatDistanceToNow(new Date(message.respondedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-br from-white to-green-50/50 p-6 rounded-xl border border-green-100 shadow-inner">
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium text-lg">
                    {message.adminResponse}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-white via-white to-blue-50/30 border border-blue-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact Email</div>
                    <div className="text-lg font-semibold text-gray-900">{message.contactEmail}</div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
