import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, Filter, BarChart4, TrendingUp, Users, Medal, Clock } from 'lucide-react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface DepartmentMetric {
  department: string;
  performance: number;
  teamMembers: number;
  evaluationsCompleted: number;
  avgCompletionTime: number;
  improvementRate: number;
}

interface SkillMetric {
  skill: string;
  'Front Counter': number;
  'Drive Thru': number;
  'Kitchen': number;
}

interface DepartmentComparisonData {
  departments: DepartmentMetric[];
  skillComparison: SkillMetric[];
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
    skillComparison: [
      { skill: 'Customer Service', 'Front Counter': 92, 'Drive Thru': 85, 'Kitchen': 78 },
      { skill: 'Speed', 'Front Counter': 84, 'Drive Thru': 90, 'Kitchen': 86 },
      { skill: 'Accuracy', 'Front Counter': 88, 'Drive Thru': 82, 'Kitchen': 91 },
      { skill: 'Teamwork', 'Front Counter': 86, 'Drive Thru': 84, 'Kitchen': 90 },
      { skill: 'Cleanliness', 'Front Counter': 89, 'Drive Thru': 83, 'Kitchen': 92 }
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

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Department Comparison</h1>
                <p className="text-white/80 mt-2 text-lg">Compare performance metrics across different departments</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Header buttons removed */}
              </div>
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departmentData.departments.map((dept) => (
            <Card key={dept.department} className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-semibold">{dept.department}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-[#F4F4F4] rounded-xl">
                    <Medal className="h-6 w-6 text-[#E51636] mb-1" />
                    <p className="text-xs text-[#27251F]/60">Performance</p>
                    <p className="text-xl font-bold text-[#27251F]">{dept.performance}%</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-[#F4F4F4] rounded-xl">
                    <Users className="h-6 w-6 text-[#E51636] mb-1" />
                    <p className="text-xs text-[#27251F]/60">Team Members</p>
                    <p className="text-xl font-bold text-[#27251F]">{dept.teamMembers}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-[#F4F4F4] rounded-xl">
                    <TrendingUp className="h-6 w-6 text-[#E51636] mb-1" />
                    <p className="text-xs text-[#27251F]/60">Improvement</p>
                    <p className="text-xl font-bold text-[#27251F]">+{dept.improvementRate}%</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-[#F4F4F4] rounded-xl">
                    <Clock className="h-6 w-6 text-[#E51636] mb-1" />
                    <p className="text-xs text-[#27251F]/60">Avg Time</p>
                    <p className="text-xl font-bold text-[#27251F]">{dept.avgCompletionTime}d</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

        {/* Skill Comparison */}
        <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-semibold">Skill Comparison by Department</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={150} data={departmentData.skillComparison}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#27251F', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Front Counter"
                    dataKey="Front Counter"
                    stroke="#E51636"
                    fill="#E51636"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Drive Thru"
                    dataKey="Drive Thru"
                    stroke="#27251F"
                    fill="#27251F"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Kitchen"
                    dataKey="Kitchen"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    fillOpacity={0.2}
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
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
