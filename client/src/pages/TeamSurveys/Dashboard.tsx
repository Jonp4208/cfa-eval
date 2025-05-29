import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Eye,
  Sparkles,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { teamSurveysService } from '@/lib/services/teamSurveys';

export default function TeamSurveysDashboard() {
  const navigate = useNavigate();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['teamSurveys', 'dashboard'],
    queryFn: teamSurveysService.getDashboardStats,
    refetchInterval: 30000 // Refresh every 30 seconds
  });



  const handleViewAnalytics = () => {
    // If there are recent surveys, navigate to the most recent one's analytics
    if (dashboardStats?.recentSurveys && dashboardStats.recentSurveys.length > 0) {
      const mostRecentSurvey = dashboardStats.recentSurveys[0];
      navigate(`/team-surveys/${mostRecentSurvey._id}/results`);
    } else {
      // If no surveys exist, show a message and suggest creating one
      toast({
        title: 'No surveys available',
        description: 'Create your first survey to view analytics!',
      });
      navigate('/team-surveys/new');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Recent surveys skeleton */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          onClick={() => navigate('/team-surveys/new')}
          size="sm"
          className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Survey
        </Button>
        <Button
          onClick={() => navigate('/team-surveys/create-advanced')}
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced Survey
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Active Surveys Card */}
        <Card className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200/50">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-blue-600/70">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-medium">+12%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">{dashboardStats?.activeSurveys || 0}</div>
              <p className="text-gray-700 text-sm font-medium">Active Surveys</p>
              <p className="text-gray-500 text-xs">Currently running</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Responses Card */}
        <Card className="relative overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-200/50">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600/70">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-medium">+24%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">{dashboardStats?.totalResponses || 0}</div>
              <p className="text-gray-700 text-sm font-medium">Total Responses</p>
              <p className="text-gray-500 text-xs">This quarter</p>
            </div>
          </CardContent>
        </Card>

        {/* Response Rate Card */}
        <Card className="relative overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-200/50">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-purple-600/70">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-medium">+8%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">{dashboardStats?.avgResponseRate || 0}%</div>
              <p className="text-gray-700 text-sm font-medium">Avg Response Rate</p>
              <p className="text-gray-500 text-xs">Across all surveys</p>
            </div>
            <div className="mt-4">
              <Progress
                value={dashboardStats?.avgResponseRate || 0}
                className="h-2 bg-purple-100"
                indicatorClassName="bg-gradient-to-r from-purple-400 to-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Survey Card */}
        <Card className="relative overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-200/50">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-orange-600/70">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">14 days</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">Q2</div>
              <p className="text-gray-700 text-sm font-medium">Next Survey</p>
              <p className="text-gray-500 text-xs">Quarterly schedule</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Surveys */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#E51636]" />
                Recent Surveys
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Latest survey activity and performance metrics
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/team-surveys')}
              className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/5"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {dashboardStats?.recentSurveys?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {dashboardStats.recentSurveys.map((survey: any, index: number) => (
                <div
                  key={survey._id}
                  className="group p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white cursor-pointer transition-all duration-300 hover:shadow-sm"
                  onClick={() => navigate(`/team-surveys/${survey._id}/results`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          survey.status === 'active' ? 'bg-green-100 text-green-600' :
                          survey.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getStatusIcon(survey.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#E51636] transition-colors">
                            {survey.title}
                          </h3>
                          <Badge className={`${getStatusColor(survey.status)} text-xs font-medium`}>
                            {survey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{survey.analytics?.totalResponses || 0} responses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            <span>{survey.analytics?.responseRate || 0}% response rate</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(survey.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {survey.analytics?.responseRate || 0}%
                        </div>
                        <div className="text-xs text-gray-500">completion</div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#E51636] transition-colors" />
                    </div>
                  </div>

                  {/* Progress bar for response rate */}
                  <div className="mt-3">
                    <Progress
                      value={survey.analytics?.responseRate || 0}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/5 rounded-full"></div>
                </div>
                <div className="relative">
                  <MessageSquare className="mx-auto h-16 w-16 text-[#E51636]/60 mb-4" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to get started?</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first anonymous team experience survey and start gathering valuable feedback to improve your workplace culture.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/team-surveys/new')}
                  className="bg-[#E51636] hover:bg-[#E51636]/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Survey
                </Button>
                <Button
                  onClick={() => navigate('/team-surveys/create-advanced')}
                  variant="outline"
                  className="border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/5"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Options
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/team-surveys/new')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Quick Survey
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create a simple survey with pre-built templates and get started in minutes
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-medium">
              <Clock className="w-3 h-3" />
              <span>Fast setup</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/team-surveys/create-advanced')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              Advanced Survey
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Build custom surveys with advanced features, custom questions, and detailed analytics
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-600 font-medium">
              <Target className="w-3 h-3" />
              <span>Full customization</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={handleViewAnalytics}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
              View Analytics
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Analyze survey results, track trends, and generate insights for your team
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
              <Activity className="w-3 h-3" />
              <span>Real-time data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
