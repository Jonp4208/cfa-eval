import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  Download,
  Calendar,
  MessageSquare,
  Star,
  Building,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamSurveysService, SurveyAnalytics } from '@/lib/services/teamSurveys';
import { toast } from '@/components/ui/use-toast';

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

  // Fetch survey analytics
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['teamSurveys', 'analytics', surveyId, selectedDepartment, selectedPosition],
    queryFn: () => teamSurveysService.getSurveyAnalytics(surveyId!, {
      department: selectedDepartment === 'all' ? undefined : selectedDepartment,
      position: selectedPosition === 'all' ? undefined : selectedPosition
    }),
    enabled: !!surveyId
  });



  const handleExport = async () => {
    try {
      const exportData = await teamSurveysService.exportSurveyResults(surveyId!);
      console.log('Export data received:', exportData);

      // Create and download CSV
      const csvContent = convertToCSV(exportData);
      console.log('CSV content:', csvContent);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `survey-results-${analytics?.survey.title || 'survey'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export successful',
        description: 'Survey results exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export survey results',
        variant: 'destructive',
      });
    }
  };

  const convertToCSV = (data: any) => {
    // Convert survey results to CSV format
    const headers = ['Response ID', 'Department', 'Position', 'Experience Level', 'Employment Type', 'Submitted At'];

    // Add question headers from the survey questions
    if (data.questions) {
      data.questions.forEach((q: any) => {
        headers.push(`"${q.text.replace(/"/g, '""')}"`);
      });
    }

    const rows = [headers.join(',')];

    // Add data rows from responses
    if (data.responses) {
      data.responses.forEach((response: any) => {
        const row = [
          `"${response.id}"`,
          `"${response.demographics.department || ''}"`,
          `"${response.demographics.position || ''}"`,
          `"${response.demographics.experienceLevel || ''}"`,
          `"${response.demographics.employmentType || ''}"`,
          `"${new Date(response.submittedAt).toLocaleString()}"`
        ];

        // Add answers for each question
        if (data.questions) {
          data.questions.forEach((question: any) => {
            const answer = response.responses.find((r: any) => r.questionId === question.id);
            if (answer) {
              if (question.type === 'text') {
                // Escape quotes in text responses
                row.push(`"${String(answer.answer).replace(/"/g, '""')}"`);
              } else {
                // For rating and other types
                row.push(`"${answer.answer}"`);
              }
            } else {
              row.push('""'); // Empty if no answer
            }
          });
        }

        rows.push(row.join(','));
      });
    }

    return rows.join('\n');
  };

  const getOverallScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallScoreLabel = (score: number | null) => {
    if (score === null) return 'No Data';
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Attention';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Unable to load survey results</h3>
          <p className="mt-1 text-sm text-gray-500">
            There was an error loading the analytics data.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/team-surveys')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Surveys
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/team-surveys')}
            className="hover:bg-red-50 hover:text-red-600 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{analytics.survey.title}</h1>
            <p className="text-gray-600">Survey Results & Analytics</p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/5"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200/50">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div className={`text-xs font-medium ${getOverallScoreColor(analytics.overallScore)}`}>
                {getOverallScoreLabel(analytics.overallScore)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">
                {analytics.overallScore ? `${analytics.overallScore.toFixed(1)}` : 'N/A'}
              </div>
              <p className="text-gray-700 text-sm font-medium">Overall Score</p>
              <p className="text-gray-500 text-xs">Average rating</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-200/50">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600/70">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">{analytics.demographics.totalResponses}</div>
              <p className="text-gray-700 text-sm font-medium">Total Responses</p>
              <p className="text-gray-500 text-xs">Team members responded</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-200/50">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-purple-600/70">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Good</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-gray-900">{analytics.survey.analytics?.responseRate || 0}%</div>
              <p className="text-gray-700 text-sm font-medium">Response Rate</p>
              <p className="text-gray-500 text-xs">Of eligible team members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100/50"></div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-200/50">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-orange-600/70">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Live</span>
              </div>
            </div>
            <div className="space-y-1">
              <Badge
                variant={analytics.survey.status === 'active' ? 'default' : 'secondary'}
                className="text-sm mb-2"
              >
                {analytics.survey.status}
              </Badge>
              <p className="text-gray-700 text-sm font-medium">Survey Status</p>
              <p className="text-gray-500 text-xs">Current state</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="p-2 bg-[#E51636]/10 rounded-lg">
              <Filter className="w-5 h-5 text-[#E51636]" />
            </div>
            Filter Results
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Narrow down the analytics by department and position
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Front of House">Front of House</SelectItem>
                  <SelectItem value="Back of House">Back of House (Kitchen)</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Position</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Shift Leader">Shift Leader</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Question Analytics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Question Analytics</h2>
            <p className="text-gray-600">Detailed breakdown of each survey question</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.questionAnalytics && analytics.questionAnalytics.length > 0 ? (
            analytics.questionAnalytics.map((question, index) => (
            <Card key={question.questionId} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#E51636]/10 rounded-lg flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      Q{index + 1}: {question.questionText}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      {question.totalResponses} responses • {question.questionType} question
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {question.questionType === 'rating' && question.averageRating !== undefined ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <span className="text-sm font-semibold text-gray-700">Average Rating</span>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${getOverallScoreColor(question.averageRating)}`}>
                          {question.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-lg">/10</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {getOverallScoreLabel(question.averageRating)}
                        </div>
                      </div>
                    </div>

                    {question.ratingDistribution && (
                      <div className="space-y-4">
                        <span className="text-sm font-semibold text-gray-700">Rating Distribution</span>
                        <div className="space-y-3">
                          {question.ratingDistribution.map((count, rating) => (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">{rating + 1}</span>
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-[#E51636] to-[#D01530] h-3 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${question.totalResponses > 0 ? (count / question.totalResponses) * 100 : 0}%`
                                  }}
                                />
                              </div>
                              <div className="w-12 text-right">
                                <span className="text-sm font-medium text-gray-700">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : question.questionType === 'text' && question.textResponses ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Recent Responses</span>
                      <Badge variant="secondary" className="text-xs">
                        {question.textResponses.length} total
                      </Badge>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {question.textResponses.slice(0, 5).map((response, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed italic">
                            "{response}"
                          </p>
                        </div>
                      ))}
                      {question.textResponses.length > 5 && (
                        <div className="text-center py-3">
                          <Badge variant="outline" className="text-xs text-gray-500">
                            +{question.textResponses.length - 5} more responses
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                      </div>
                      <div className="relative">
                        <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No responses yet</p>
                    <p className="text-xs text-gray-400 mt-1">Responses will appear here once submitted</p>
                  </div>
                )}
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Data Available</h3>
              <p className="text-gray-500">
                {analytics?.questionAnalytics?.length === 0
                  ? "This survey doesn't have any questions yet."
                  : "Question analytics are being processed."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Demographics Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demographics Breakdown</h2>
            <p className="text-gray-600">Response distribution across different groups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                Department Breakdown
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Responses by department
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.demographics.departmentBreakdown && analytics.demographics.departmentBreakdown.length > 0 ? (
                  analytics.demographics.departmentBreakdown.map((dept: any) => (
                  <div key={dept._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{dept._id || 'Not specified'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{dept.count}</span>
                        <span className="text-xs text-gray-500">
                          ({analytics.demographics.totalResponses > 0 ? Math.round((dept.count / analytics.demographics.totalResponses) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${analytics.demographics.totalResponses > 0 ? (dept.count / analytics.demographics.totalResponses) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No department data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                Position Breakdown
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Responses by position level
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.demographics.positionBreakdown && analytics.demographics.positionBreakdown.length > 0 ? (
                  analytics.demographics.positionBreakdown.map((pos: any) => (
                    <div key={pos._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{pos._id || 'Not specified'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{pos.count}</span>
                          <span className="text-xs text-gray-500">
                            ({analytics.demographics.totalResponses > 0 ? Math.round((pos.count / analytics.demographics.totalResponses) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${analytics.demographics.totalResponses > 0 ? (pos.count / analytics.demographics.totalResponses) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No position data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                Experience Level
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Responses by experience level
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.demographics.experienceBreakdown && analytics.demographics.experienceBreakdown.length > 0 ? (
                  analytics.demographics.experienceBreakdown.map((exp: any) => (
                    <div key={exp._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{exp._id || 'Not specified'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{exp.count}</span>
                          <span className="text-xs text-gray-500">
                            ({analytics.demographics.totalResponses > 0 ? Math.round((exp.count / analytics.demographics.totalResponses) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${analytics.demographics.totalResponses > 0 ? (exp.count / analytics.demographics.totalResponses) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No experience data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                Response Timeline
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Daily response activity (last 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.responseTimeline && analytics.responseTimeline.length > 0 ? (
                  analytics.responseTimeline.slice(0, 7).map((day: any) => (
                    <div key={day._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{new Date(day._id).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{day.count}</span>
                          <span className="text-xs text-gray-500">responses</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(...analytics.responseTimeline.map(d => d.count)) > 0 ? (day.count / Math.max(...analytics.responseTimeline.map(d => d.count))) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No timeline data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
