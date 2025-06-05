import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, Filter, Calendar, TrendingUp, Activity, Users, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

interface HeatmapData {
  day: string;
  hour: number;
  department: string;
  performance: number;
  evaluationCount: number;
}

interface HeatmapStats {
  totalEvaluations: number;
  avgPerformance: number;
  peakHour: number;
  bestDepartment: string;
}

const DEPARTMENTS = ['FOH', 'Kitchen', 'Drive Thru'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PerformanceHeatmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('last30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const { data, isLoading, error } = useQuery<{ heatmapData: HeatmapData[], stats: HeatmapStats }>({
    queryKey: ['performance-heatmap', timeframe, selectedDepartment],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      const mockData: HeatmapData[] = [];
      const mockStats: HeatmapStats = {
        totalEvaluations: 245,
        avgPerformance: 87,
        peakHour: 14,
        bestDepartment: 'FOH'
      };

      // Generate mock heatmap data
      DAYS.forEach(day => {
        HOURS.forEach(hour => {
          DEPARTMENTS.forEach(department => {
            if (selectedDepartment === 'all' || department === selectedDepartment) {
              mockData.push({
                day,
                hour,
                department,
                performance: Math.floor(Math.random() * 40) + 60, // 60-100%
                evaluationCount: Math.floor(Math.random() * 10) + 1
              });
            }
          });
        });
      });

      return { heatmapData: mockData, stats: mockStats };
    }
  });

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-500';
    if (performance >= 80) return 'bg-green-400';
    if (performance >= 70) return 'bg-yellow-400';
    if (performance >= 60) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getPerformanceIntensity = (performance: number) => {
    const intensity = Math.min(performance / 100, 1);
    return `opacity-${Math.floor(intensity * 10) * 10}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <PageHeader
          title="Performance Heatmap"
          subtitle="Visual performance patterns across time and departments • Advanced Heat Analytics"
          showBackButton={true}
          icon={<Activity className="h-5 w-5" />}
          className="shadow-2xl border border-white/20 backdrop-blur-sm"
        />

        {/* Enhanced Controls */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-white/70">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/20 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-[#E51636]" />
              </div>
              <h3 className="text-lg font-semibold text-[#27251F]">Analysis Controls</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div>
                <p className="text-sm font-medium mb-3 text-[#27251F]/70">Time Period</p>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[200px] h-12 bg-white/90 border-gray-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#E51636]/30 focus:border-[#E51636]/50">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200/60 shadow-xl">
                    <SelectItem value="last30" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 30 Days</SelectItem>
                    <SelectItem value="last90" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 90 Days</SelectItem>
                    <SelectItem value="last180" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-3 text-[#27251F]/70">Department</p>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px] h-12 bg-white/90 border-gray-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#E51636]/30 focus:border-[#E51636]/50">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200/60 shadow-xl">
                    <SelectItem value="all" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#27251F]/60 font-medium">Total Evaluations</p>
                    <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{data.stats.totalEvaluations}</h3>
                  </div>
                  <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#27251F]/60 font-medium">Avg Performance</p>
                    <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{data.stats.avgPerformance}%</h3>
                  </div>
                  <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#27251F]/60 font-medium">Peak Hour</p>
                    <h3 className="text-3xl font-bold mt-2 text-[#27251F]">{data.stats.peakHour}:00</h3>
                  </div>
                  <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Clock className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#27251F]/60 font-medium">Best Department</p>
                    <h3 className="text-2xl font-bold mt-2 text-[#27251F]">{data.stats.bestDepartment}</h3>
                  </div>
                  <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Activity className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Heatmap */}
        <Card className="bg-white rounded-[20px] shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Performance Heatmap</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#27251F]/60">Performance:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span className="text-xs">Low</span>
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span className="text-xs">Med</span>
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span className="text-xs">High</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse"></div>
            ) : error ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Failed to load heatmap data</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#27251F]/60 mb-4">
                  Each cell represents average performance for that time period. Darker colors indicate higher performance.
                </p>
                
                {/* Coming Soon Message */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-bold text-[#27251F] mb-2">Performance Heatmap</h3>
                  <p className="text-[#27251F]/60 mb-4">
                    Interactive heatmap visualization is coming soon! This will show performance patterns across different times and departments.
                  </p>
                  <Badge className="bg-blue-100 text-blue-700">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
