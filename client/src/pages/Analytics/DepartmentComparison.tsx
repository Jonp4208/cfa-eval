import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, Filter, BarChart4, TrendingUp, Users, Medal, Clock, Calendar } from 'lucide-react';
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
  Line
} from 'recharts';

interface DepartmentMetric {
  department: string;
  performance: number;
  teamMembers: number;
  evaluationsCompleted: number;
  avgCompletionTime: number;
  improvementRate: number;
}

interface DepartmentComparisonData {
  departments: DepartmentMetric[];
  performanceTrends: Array<{
    period: string;
    'Front Counter': number;
    'Drive Thru': number;
    'Kitchen': number;
  }>;
}

export default function DepartmentComparison() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('last90');
  const [metricType, setMetricType] = useState<'performance' | 'improvement'>('performance');

  const { data, isLoading, error } = useQuery<DepartmentComparisonData>({
    queryKey: ['department-comparison', timeframe],
    queryFn: async () => {
      try {
        // This would be replaced with the actual API endpoint
        const response = await api.get('/api/analytics/department-comparison', {
          params: {
            timeframe: timeframe.replace('last', '')
          }
        });
        return response.data;
      } catch (error) {
        throw new Error('Failed to fetch department comparison data');
      }
    }
  });

  // Function to export analytics data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export-department-comparison', {
        params: { timeframe: timeframe.replace('last', '') },
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `department-comparison-${new Date().toISOString().split('T')[0]}.csv`);
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
  const mockData: DepartmentComparisonData = {
    departments: [
      {
        department: 'Front Counter',
        performance: 87,
        teamMembers: 25,
        evaluationsCompleted: 42,
        avgCompletionTime: 4.2,
        improvementRate: 3.5
      },
      {
        department: 'Drive Thru',
        performance: 85,
        teamMembers: 18,
        evaluationsCompleted: 35,
        avgCompletionTime: 3.8,
        improvementRate: 2.1
      },
      {
        department: 'Kitchen',
        performance: 89,
        teamMembers: 22,
        evaluationsCompleted: 38,
        avgCompletionTime: 4.5,
        improvementRate: 4.2
      }
    ],
    performanceTrends: [
      { period: 'Jan', 'Front Counter': 84, 'Drive Thru': 82, 'Kitchen': 86 },
      { period: 'Feb', 'Front Counter': 85, 'Drive Thru': 83, 'Kitchen': 87 },
      { period: 'Mar', 'Front Counter': 86, 'Drive Thru': 84, 'Kitchen': 88 },
      { period: 'Apr', 'Front Counter': 87, 'Drive Thru': 85, 'Kitchen': 89 },
      { period: 'May', 'Front Counter': 88, 'Drive Thru': 86, 'Kitchen': 90 },
      { period: 'Jun', 'Front Counter': 89, 'Drive Thru': 87, 'Kitchen': 91 }
    ]
  };

  // Use mock data for development
  const departmentData = data || mockData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <PageHeader
            title="Department Comparison"
            subtitle="Compare performance metrics across different departments • Advanced Department Analytics"
            showBackButton={true}
            icon={<BarChart4 className="h-5 w-5" />}
            className="shadow-2xl border border-white/20 backdrop-blur-sm"
          />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51636] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading department comparison data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <PageHeader
            title="Department Comparison"
            subtitle="Compare performance metrics across different departments • Advanced Department Analytics"
            showBackButton={true}
            icon={<BarChart4 className="h-5 w-5" />}
            className="shadow-2xl border border-white/20 backdrop-blur-sm"
          />
          <Card className="bg-white rounded-[20px] shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'Failed to load department comparison data'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#E51636] hover:bg-[#E51636]/90"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <PageHeader
          title="Department Comparison"
          subtitle="Compare performance metrics across different departments • Advanced Department Analytics"
          showBackButton={true}
          icon={<BarChart4 className="h-5 w-5" />}
          className="shadow-2xl border border-white/20 backdrop-blur-sm"
          actions={
            <Button
              onClick={handleExportData}
              className="w-full md:w-auto bg-white/95 hover:bg-white text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 md:py-3 md:px-6 rounded-xl transition-all duration-300 text-sm md:text-base font-medium shadow-lg border border-white/30 hover:shadow-xl hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </Button>
          }
        />

        {/* Timeframe Selector */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg border border-white/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#E51636]" />
                <span className="text-sm font-medium text-[#27251F]">Time Period:</span>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last14">Last 14 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last60">Last 60 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="last180">Last 6 Months</SelectItem>
                  <SelectItem value="last365">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                {timeframe === 'last7' && 'Showing data from the past week'}
                {timeframe === 'last14' && 'Showing data from the past 2 weeks'}
                {timeframe === 'last30' && 'Showing data from the past month'}
                {timeframe === 'last60' && 'Showing data from the past 2 months'}
                {timeframe === 'last90' && 'Showing data from the past 3 months'}
                {timeframe === 'last180' && 'Showing data from the past 6 months'}
                {timeframe === 'last365' && 'Showing data from the past year'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {departmentData.departments.map((dept, index) => {
            const gradients = [
              'from-purple-50 via-purple-100/50 to-violet-100/60',
              'from-blue-50 via-blue-100/50 to-indigo-100/60',
              'from-green-50 via-green-100/50 to-emerald-100/60'
            ];
            const iconGradients = [
              'from-purple-500 to-violet-600',
              'from-blue-500 to-indigo-600',
              'from-green-500 to-emerald-600'
            ];
            return (
              <Card key={dept.department} className={`bg-gradient-to-br ${gradients[index]} rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 backdrop-blur-sm hover:border-white/70`}>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 bg-gradient-to-br ${iconGradients[index]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <BarChart4 className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-[#27251F]">{dept.department}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                      <Medal className="h-7 w-7 text-[#E51636] mb-2" />
                      <p className="text-xs text-[#27251F]/70 font-medium">Performance</p>
                      <p className="text-2xl font-bold text-[#27251F] tracking-tight">{dept.performance}%</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                      <Users className="h-7 w-7 text-[#E51636] mb-2" />
                      <p className="text-xs text-[#27251F]/70 font-medium">Team Members</p>
                      <p className="text-2xl font-bold text-[#27251F] tracking-tight">{dept.teamMembers}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                      <TrendingUp className="h-7 w-7 text-[#E51636] mb-2" />
                      <p className="text-xs text-[#27251F]/70 font-medium">Improvement</p>
                      <p className="text-2xl font-bold text-[#27251F] tracking-tight">+{dept.improvementRate}%</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                      <Clock className="h-7 w-7 text-[#E51636] mb-2" />
                      <p className="text-xs text-[#27251F]/70 font-medium">Avg Time</p>
                      <p className="text-2xl font-bold text-[#27251F] tracking-tight">{dept.avgCompletionTime}d</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Comparison */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Department Performance</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={metricType === 'performance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetricType('performance')}
                    className={metricType === 'performance' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
                  >
                    Performance
                  </Button>
                  <Button
                    variant={metricType === 'improvement' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetricType('improvement')}
                    className={metricType === 'improvement' ? 'bg-[#E51636] hover:bg-[#E51636]/90' : ''}
                  >
                    Improvement
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData.departments}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      domain={[0, 100]}
                    />
                    <YAxis
                      dataKey="department"
                      type="category"
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
                      dataKey={metricType === 'performance' ? 'performance' : 'improvementRate'}
                      name={metricType === 'performance' ? 'Performance Score' : 'Improvement Rate'}
                      fill="#E51636"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={departmentData.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      domain={[70, 100]}
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
                      dataKey="Front Counter"
                      stroke="#E51636"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#E51636' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Drive Thru"
                      stroke="#27251F"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#27251F' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Kitchen"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#4CAF50' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}
