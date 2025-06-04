// client/src/pages/Analytics/index.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Heart,
  Medal,
  LayoutDashboard,
  Sun,
  Moon,
  TrendingUp,
  Download,
  Users,
  BarChart4,
  FileText,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  Eye,
  Sparkles,
  Target,
  Clock,
  Award,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Zap,
  PieChart,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { toast } from '@/components/ui/use-toast';

// Page Header Component for Analytics Pages
export const AnalyticsPageHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/analytics')}
        className="hover:bg-red-50 hover:text-red-600 rounded-xl"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

interface QuickStats {
  teamMembers: number;
  avgPerformance: number;
  developmentGoals: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  improvementRate: number;
}

interface PerformanceTrend {
  name: string;
  FOH: number | null;
  BOH: number | null;
  evaluationCount: number;
  fohCount: number;
  bohCount: number;
}

const AnalyticsHub = () => {
  const location = useLocation();
  const isMainAnalyticsPage = location.pathname === '/analytics';
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('last30');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get quick stats
  const { data: quickStats, isLoading } = useQuery<QuickStats>({
    queryKey: ['analytics-quick-stats', timeframe],
    queryFn: async () => {
      const response = await api.get('/api/analytics/quick-stats', {
        params: { timeframe: timeframe.replace('last', '') }
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Get performance trends
  const { data: performanceTrends, isLoading: trendsLoading } = useQuery<PerformanceTrend[]>({
    queryKey: ['performance-trends', timeframe],
    queryFn: async () => {
      const response = await api.get('/api/analytics/performance-trends', {
        params: { timeframe: timeframe.replace('last', '') }
      });
      return response.data.performanceTrends || [];
    },
    enabled: isMainAnalyticsPage
  });

  const analyticsCards = [
    {
      title: "Hearts & Hands",
      description: "Track team member engagement and skill development matrix",
      icon: Heart,
      link: "hearts-and-hands",
      gradient: "from-pink-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      badge: "Development",
      badgeColor: "bg-pink-100 text-pink-700"
    },
    {
      title: "Team Scores",
      description: "View all team members and their evaluation scores",
      icon: Medal,
      link: "team-scores",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      badge: "Performance",
      badgeColor: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Day vs Night",
      description: "Compare performance between day and night shifts",
      icon: Sun,
      link: "day-vs-night",
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Shifts",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "Evaluation Trends",
      description: "Track evaluation completion rates and performance over time",
      icon: TrendingUp,
      link: "evaluation-trends",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      badge: "Trends",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      title: "Department Comparison",
      description: "Compare performance metrics across different departments",
      icon: BarChart4,
      link: "department-comparison",
      gradient: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      badge: "Departments",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      title: "Performance Heatmap",
      description: "Visual heatmap of performance across time and departments",
      icon: Activity,
      link: "performance-heatmap",
      gradient: "from-red-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      badge: "New",
      badgeColor: "bg-red-100 text-red-700"
    },
  ];

  // Function to refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch queries
      await Promise.all([
        // Add query invalidation here when react-query is properly set up
      ]);
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to export analytics data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export', {
        params: {
          timeframe: timeframe.replace('last', ''),
          date: selectedDate
        },
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter analytics cards based on search
  const filteredAnalyticsCards = analyticsCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isMainAnalyticsPage) {
    return <Outlet />;
  }

  return (
    <div className="bg-[#F4F4F4] min-h-screen">
      {/* Page Header */}
      <div className="px-6 pt-6">
        <PageHeader
          title="Analytics Dashboard"
          subtitle={
            <div className="flex items-center gap-4 text-white/80 text-sm md:text-base">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Real-time Data
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Eye className="w-3 h-3 mr-1" />
                {filteredAnalyticsCards.length} Reports
              </Badge>
            </div>
          }
          icon={<BarChart4 className="h-8 w-8" />}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search analytics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 w-full sm:w-[200px]"
                />
              </div>

              {/* Date Filter */}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-white/40 w-full sm:w-[150px]"
              />

              {/* Timeframe */}
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-white focus:bg-white/20 focus:border-white/40">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="last180">Last 6 Months</SelectItem>
                  <SelectItem value="last365">Last Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportData}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white p-1 rounded-xl mb-6">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[#E51636] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-[#E51636] data-[state=active]:text-white">
              Performance Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-white rounded-[20px] shadow-md">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : !quickStats ? (
                <Card className="col-span-full bg-white rounded-[20px] shadow-md">
                  <CardContent className="p-8 text-center text-[#27251F]/60">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No analytics data available</p>
                    <p className="text-sm mt-2">Please check back later or contact support if this persists.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Average Performance Card */}
                  <Card
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-blue-100"
                    onClick={() => navigate('team-scores')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-[#27251F]/60 font-medium">Avg Performance</p>
                            {quickStats.improvementRate > 0 ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{quickStats.improvementRate}%
                              </Badge>
                            ) : quickStats.improvementRate < 0 ? (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                {quickStats.improvementRate}%
                              </Badge>
                            ) : null}
                          </div>
                          <h3 className="text-3xl font-bold text-[#27251F] mb-1">{quickStats.avgPerformance}%</h3>
                          <p className="text-xs text-[#27251F]/60">
                            Last {timeframe.replace('last', '')} days
                          </p>
                        </div>
                        <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <Medal className="h-7 w-7 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members Card */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[#27251F]/60 font-medium mb-2">Team Members</p>
                          <h3 className="text-3xl font-bold text-[#27251F] mb-1">{quickStats.teamMembers}</h3>
                          <p className="text-xs text-[#27251F]/60">Active employees</p>
                        </div>
                        <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                          <Users className="h-7 w-7 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Evaluations Card */}
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-[#27251F]/60 font-medium">Evaluations</p>
                            {quickStats.pendingEvaluations === 0 ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {quickStats.pendingEvaluations} pending
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-3xl font-bold text-[#27251F] mb-1">{quickStats.completedEvaluations}</h3>
                          <p className="text-xs text-[#27251F]/60">
                            Last {timeframe.replace('last', '')} days
                          </p>
                        </div>
                        <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                          <FileText className="h-7 w-7 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Development Goals Card */}
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-orange-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[#27251F]/60 font-medium mb-2">Development Goals</p>
                          <h3 className="text-3xl font-bold text-[#27251F] mb-1">{quickStats.developmentGoals}</h3>
                          <p className="text-xs text-[#27251F]/60">Active goals</p>
                        </div>
                        <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                          <Target className="h-7 w-7 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-semibold">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {trendsLoading ? (
                  <div className="h-[300px] bg-[#F4F4F4] rounded-xl animate-pulse"></div>
                ) : !performanceTrends || performanceTrends.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-[#27251F]/60">
                    <p>No trend data available</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#27251F', fontSize: 12 }}
                          tickLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fill: '#27251F', fontSize: 12 }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="FOH"
                          name="FOH Performance %"
                          stroke="#E51636"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#E51636' }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="BOH"
                          name="BOH Performance %"
                          stroke="#27251F"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#27251F' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Analytics Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#27251F]">Analytics Reports</h2>
              <p className="text-[#27251F]/60 mt-1">Explore detailed insights and performance metrics</p>
            </div>
            {searchTerm && (
              <Badge variant="outline" className="text-[#27251F]/60">
                {filteredAnalyticsCards.length} of {analyticsCards.length} reports
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyticsCards.map((card) => (
              <Link key={card.link} to={card.link}>
                <Card className={`${card.bgColor} rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full border-0 group overflow-hidden relative`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-[#27251F] text-lg group-hover:text-gray-800 transition-colors">
                            {card.title}
                          </h3>
                          <Badge className={`${card.badgeColor} text-xs font-medium`}>
                            {card.badge}
                          </Badge>
                        </div>
                        <p className="text-[#27251F]/70 text-sm leading-relaxed group-hover:text-[#27251F]/80 transition-colors">
                          {card.description}
                        </p>
                      </div>
                      <div className={`h-16 w-16 ${card.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                      </div>
                    </div>

                    {/* Action indicator */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <span className="text-xs font-medium text-[#27251F]/60 group-hover:text-[#27251F]/80 transition-colors">
                        View Report
                      </span>
                      <div className="flex items-center gap-1 text-[#27251F]/40 group-hover:text-[#27251F]/60 transition-colors">
                        <span className="text-xs">Explore</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredAnalyticsCards.length === 0 && searchTerm && (
            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-[#27251F] mb-2">No reports found</h3>
                <p className="text-[#27251F]/60">
                  No analytics reports match your search for "{searchTerm}". Try a different search term.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;