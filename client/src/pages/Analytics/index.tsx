// client/src/pages/Analytics/index.tsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Medal, LayoutDashboard, Sun, Moon, TrendingUp, Download, Users, BarChart4, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';

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
    },
    {
      title: "Team Scores",
      description: "View all team members and their evaluation scores",
      icon: Medal,
      link: "team-scores",
    },
    {
      title: "Day vs Night",
      description: "Compare performance between day and night shifts",
      icon: Sun,
      link: "day-vs-night",
    },
    {
      title: "Evaluation Trends",
      description: "Track evaluation completion rates and performance over time",
      icon: TrendingUp,
      link: "evaluation-trends",
    },
    {
      title: "Department Comparison",
      description: "Compare performance metrics across different departments",
      icon: BarChart4,
      link: "department-comparison",
    },
  ];

  // Function to export analytics data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export', {
        params: { timeframe: timeframe.replace('last', '') },
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
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (!isMainAnalyticsPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Replace custom header with PageHeader */}
        <PageHeader
          title="Analytics"
          subtitle="Team performance and development tracking"
          icon={<BarChart4 className="h-5 w-5" />}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-full sm:w-[140px] bg-white border-2 border-gray-200 rounded-[32px] px-4 text-[14px] font-medium text-[#27251F] hover:border-gray-300 focus:border-[#E51636] focus:ring-0 transition-colors">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg min-w-[140px]">
                  <SelectItem value="last30" className="text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last 30 Days</SelectItem>
                  <SelectItem value="last90" className="text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last 90 Days</SelectItem>
                  <SelectItem value="last180" className="text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last 6 Months</SelectItem>
                  <SelectItem value="last365" className="text-[14px] font-medium text-[#27251F] focus:bg-[#E51636]/5 focus:text-[#E51636]">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          }
        />

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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="h-16 bg-[#F4F4F4] rounded-xl animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : !quickStats ? (
                <Card className="col-span-full bg-white rounded-[20px] shadow-md">
                  <CardContent className="p-8 text-center text-[#27251F]/60">
                    <p>No analytics data available</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card
                    className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate('team-scores')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[#27251F]/60 font-medium">Avg Performance</p>
                          <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{quickStats.avgPerformance}%</h3>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-[#27251F]/60 mt-1">
                              Last {timeframe.replace('last', '')} days
                            </p>
                            <p className="text-xs text-[#27251F]/60">
                              {quickStats.improvementRate > 0 ? (
                                <span className="text-green-600">↑ {quickStats.improvementRate}%</span>
                              ) : quickStats.improvementRate < 0 ? (
                                <span className="text-red-600">↓ {Math.abs(quickStats.improvementRate)}%</span>
                              ) : (
                                <span>No change</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                          <Medal className="h-7 w-7 text-[#E51636]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[#27251F]/60 font-medium">Team Members</p>
                          <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{quickStats.teamMembers}</h3>
                          <p className="text-xs text-[#27251F]/60 mt-1">Active employees</p>
                        </div>
                        <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                          <Users className="h-7 w-7 text-[#E51636]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[#27251F]/60 font-medium">Evaluations</p>
                          <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{quickStats.completedEvaluations}</h3>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-[#27251F]/60 mt-1">
                              Last {timeframe.replace('last', '')} days
                            </p>
                            <p className="text-xs text-[#27251F]/60">
                              {quickStats.pendingEvaluations > 0 ?
                                `${quickStats.pendingEvaluations} pending` : 'All complete'}
                            </p>
                          </div>
                        </div>
                        <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                          <FileText className="h-7 w-7 text-[#E51636]" />
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

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {analyticsCards.map((card) => (
            <Link key={card.link} to={card.link}>
              <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#27251F]">{card.title}</h3>
                      <p className="mt-2 text-[#27251F]/60 text-sm">{card.description}</p>
                    </div>
                    <div className="h-14 w-14 bg-[#E51636]/10 rounded-2xl flex items-center justify-center">
                      <card.icon className="h-7 w-7 text-[#E51636]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;