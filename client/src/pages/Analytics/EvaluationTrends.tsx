import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, Filter, Calendar, TrendingUp, FileText, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface EvaluationTrend {
  period: string;
  completed: number;
  pending: number;
  avgScore: number;
}

interface EvaluationStatus {
  status: string;
  count: number;
}

interface EvaluationByDepartment {
  department: string;
  count: number;
  avgScore: number;
}

interface EvaluationTrendsData {
  trends: EvaluationTrend[];
  statusBreakdown: EvaluationStatus[];
  byDepartment: EvaluationByDepartment[];
  completionTime: {
    average: number;
    fastest: number;
    slowest: number;
  };
}

const COLORS = ['#E51636', '#27251F', '#4CAF50', '#2196F3', '#FF9800'];

export default function EvaluationTrends() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('last90');
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('monthly');

  const { data, isLoading, error } = useQuery<EvaluationTrendsData>({
    queryKey: ['evaluation-trends', timeframe, chartView],
    queryFn: async () => {
      try {
        const response = await api.get('/api/analytics/evaluation-trends', {
          params: {
            timeframe: timeframe.replace('last', ''),
            view: chartView
          }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch evaluation trends data:', error);
        throw new Error('Failed to fetch evaluation trends data');
      }
    }
  });

  // Function to export analytics data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export-evaluation-trends', {
        params: { timeframe: timeframe.replace('last', '') },
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evaluation-trends-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Mock data for development - would be replaced by actual API data
  const mockData: EvaluationTrendsData = {
    trends: [
      { period: 'Jan', completed: 45, pending: 5, avgScore: 87 },
      { period: 'Feb', completed: 52, pending: 8, avgScore: 85 },
      { period: 'Mar', completed: 48, pending: 3, avgScore: 89 },
      { period: 'Apr', completed: 61, pending: 7, avgScore: 86 },
      { period: 'May', completed: 55, pending: 4, avgScore: 88 },
      { period: 'Jun', completed: 67, pending: 2, avgScore: 91 }
    ],
    statusBreakdown: [
      { status: 'Completed', count: 328 },
      { status: 'Pending', count: 29 },
      { status: 'Scheduled', count: 42 },
      { status: 'Draft', count: 15 }
    ],
    byDepartment: [
      { department: 'Front Counter', count: 120, avgScore: 88 },
      { department: 'Drive Thru', count: 105, avgScore: 85 },
      { department: 'Kitchen', count: 103, avgScore: 87 }
    ],
    completionTime: {
      average: 5.2,
      fastest: 1.5,
      slowest: 14.3
    }
  };

  // Use actual data if available, otherwise fall back to mock data
  // If API returns empty trends array, still use mock data for demonstration
  const trendsData = (data && data.trends && data.trends.length > 0) ? data : mockData;

  // Debug logging to help identify the issue
  console.log('Evaluation Trends Debug:', {
    isLoading,
    error,
    data,
    trendsData,
    timeframe,
    chartView
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51636] mx-auto"></div>
              <p className="mt-4 text-[#27251F]/60">Loading evaluation trends...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-xl">⚠</span>
              </div>
              <p className="mt-4 text-red-600">Failed to load evaluation trends</p>
              <p className="text-sm text-[#27251F]/60 mt-2">Using sample data for demonstration</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <PageHeader
          title="Evaluation Trends"
          subtitle={`Track evaluation completion rates and performance over time • Advanced Analytics Dashboard ${(data && data.trends && data.trends.length > 0) ? '• Live Data' : '• Sample Data'}`}
          showBackButton={true}
          icon={<TrendingUp className="h-5 w-5" />}
          className="shadow-2xl border border-white/20 backdrop-blur-sm"
          actions={
            <div className="flex items-center gap-3">
              {!(data && data.trends && data.trends.length > 0) && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Sample Data
                </div>
              )}
              <Button
                onClick={handleExportData}
                className="w-full md:w-auto bg-white/95 hover:bg-white text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 md:py-3 md:px-6 rounded-xl transition-all duration-300 text-sm md:text-base font-medium shadow-lg border border-white/30 hover:shadow-xl hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </Button>
            </div>
          }
        />

        {/* Timeframe Selector */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg border border-white/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#27251F]">Data Timeframe</h3>
                <p className="text-sm text-[#27251F]/60">Select the time period for analysis</p>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'last30', label: '30 Days' },
                  { value: 'last60', label: '60 Days' },
                  { value: 'last90', label: '90 Days' },
                  { value: 'last180', label: '6 Months' },
                  { value: 'last365', label: '1 Year' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={timeframe === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe(option.value)}
                    className={`transition-all duration-300 rounded-xl ${
                      timeframe === option.value
                        ? 'bg-gradient-to-r from-[#E51636] to-[#D01530] hover:from-[#D01530] hover:to-[#B91C3C] shadow-lg'
                        : 'hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-100/60 rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-200/50 backdrop-blur-sm hover:border-blue-300/60">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[#27251F]/70 font-semibold text-sm">Total Evaluations</p>
                  <h3 className="text-4xl font-bold mt-2 text-[#27251F] tracking-tight">
                    {trendsData.statusBreakdown.reduce((sum, item) => sum + item.count, 0)}
                  </h3>
                  <div className="mt-2 bg-blue-50 px-3 py-1 rounded-full">
                    <p className="text-xs text-blue-700 font-medium">Last {timeframe.replace('last', '')} days</p>
                  </div>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Completion Rate</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {Math.round((trendsData.statusBreakdown.find(s => s.status === 'Completed')?.count || 0) /
                      trendsData.statusBreakdown.reduce((sum, item) => sum + item.count, 0) * 100)}%
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">
                      {trendsData.statusBreakdown.find(s => s.status === 'Pending')?.count || 0} pending
                    </p>
                  </div>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Avg Completion Time</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {trendsData.completionTime.average} days
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-orange-600" />
                    <p className="text-xs text-[#27251F]/60">
                      Fastest: {trendsData.completionTime.fastest} days
                    </p>
                  </div>
                </div>
                <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Avg Score</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {Math.round(trendsData.trends.reduce((sum, item) => sum + item.avgScore, 0) / trendsData.trends.length)}%
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">
                      ↑ 2% from previous period
                    </p>
                  </div>
                </div>
                <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Evaluation Trends Chart */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-white/70">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#27251F]">Evaluation Trends</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={chartView === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('monthly')}
                    className={`transition-all duration-300 rounded-xl ${chartView === 'monthly' ? 'bg-gradient-to-r from-[#E51636] to-[#D01530] hover:from-[#D01530] hover:to-[#B91C3C] shadow-lg' : 'hover:bg-gray-50 hover:shadow-md'}`}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={chartView === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('weekly')}
                    className={`transition-all duration-300 rounded-xl ${chartView === 'weekly' ? 'bg-gradient-to-r from-[#E51636] to-[#D01530] hover:from-[#D01530] hover:to-[#B91C3C] shadow-lg' : 'hover:bg-gray-50 hover:shadow-md'}`}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/20 rounded-2xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E51636" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#E51636" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#27251F" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#27251F" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#27251F', fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fill: '#27251F', fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      fill="url(#completedGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="pending"
                      name="Pending"
                      fill="url(#pendingGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Average Score Trends */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Average Score Trends</CardTitle>
                {!(data && data.trends && data.trends.length > 0) && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    Sample Data
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
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
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      name="Average Score"
                      stroke="#E51636"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#E51636', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#E51636', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold">Evaluation Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trendsData.statusBreakdown.filter(item => item.count > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => {
                        // Shorten long labels for display
                        const shortName = name.replace('Pending ', '').replace('Manager ', 'Mgr ').replace('Self Evaluation', 'Self Eval');
                        return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {trendsData.statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [`${value} evaluations`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold">Evaluations by Department</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="department"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      domain={[0, 100]}
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
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      name="# of Evaluations"
                      fill="#E51636"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgScore"
                      name="Avg Score"
                      stroke="#27251F"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Status Information */}
        {!(data && data.trends && data.trends.length > 0) && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[20px] shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-lg">ℹ</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Sample Data Display</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    The charts above are showing sample data for demonstration purposes. This happens when:
                  </p>
                  <ul className="text-amber-700 text-sm mt-2 space-y-1 ml-4">
                    <li>• No evaluations have been completed in the selected timeframe</li>
                    <li>• The evaluation data is still being processed</li>
                    <li>• There's a temporary connection issue with the database</li>
                  </ul>
                  <p className="text-amber-700 text-sm mt-3">
                    Once you have completed evaluations in your system, this page will automatically display your actual data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
