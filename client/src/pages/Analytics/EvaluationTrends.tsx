import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, Filter, Calendar, TrendingUp, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    queryKey: ['evaluation-trends', timeframe],
    queryFn: async () => {
      try {
        // This would be replaced with the actual API endpoint
        const response = await api.get('/api/analytics/evaluation-trends', {
          params: {
            timeframe: timeframe.replace('last', ''),
            view: chartView
          }
        });
        return response.data;
      } catch (error) {
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

  // Use mock data for development
  const trendsData = data || mockData;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8" />
                  <h1 className="text-3xl md:text-4xl font-bold">Evaluation Trends</h1>
                </div>
                <p className="text-white/80 mt-2 text-lg">Track evaluation completion rates and performance over time</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Completion Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Time Analysis</span>
                  </div>
                </div>
                <button
                  onClick={() => window.history.back()}
                  className="mt-4 hover:bg-white/10 text-white border border-white/20 px-4 py-2 h-10 rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  Back to Analytics
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 h-10 rounded-xl transition-all duration-300 text-sm font-medium flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Total Evaluations</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {trendsData.statusBreakdown.reduce((sum, item) => sum + item.count, 0)}
                  </h3>
                  <p className="text-xs text-[#27251F]/60 mt-1">Last {timeframe.replace('last', '')} days</p>
                </div>
                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-7 w-7 text-blue-600" />
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evaluation Trends Chart */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Evaluation Trends</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartView === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('monthly')}
                    className={chartView === 'monthly' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={chartView === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('weekly')}
                    className={chartView === 'weekly' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
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
                      dataKey="completed"
                      name="Completed"
                      fill="#E51636"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pending"
                      name="Pending"
                      fill="#27251F"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Average Score Trends */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold">Average Score Trends</CardTitle>
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
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      name="Average Score"
                      stroke="#E51636"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#E51636' }}
                      activeDot={{ r: 6 }}
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
                      data={trendsData.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
      </div>
    </div>
  );
}
