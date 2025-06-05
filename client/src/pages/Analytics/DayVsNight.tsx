import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Sun, Moon, BarChart4, Users, Calendar, X, FileText } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ShiftMetrics {
  category: string;
  day: number;
  night: number;
}

interface Employee {
  name: string;
  score: number;
  position: string;
  department: string;
  hasEvaluation?: boolean;
}

interface ShiftComparison {
  metrics: ShiftMetrics[];
  averages: {
    day: number;
    night: number;
  };
  topPerformers: {
    day: Employee[];
    night: Employee[];
  };
  departmentComparison: {
    category: string;
    day: number;
    night: number;
  }[];
  departments: {
    [key: string]: {
      day: number;
      night: number;
      dayCount: number;
      nightCount: number;
    };
  };
}

const DayVsNight = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('quarter');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [showAllDay, setShowAllDay] = useState(false);
  const [showAllNight, setShowAllNight] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{
    department: string;
    shift: 'day' | 'night';
    employees: Employee[];
  } | null>(null);

  const { data, isLoading, error } = useQuery<ShiftComparison>({
    queryKey: ['shift-comparison', timeframe, selectedTemplate, selectedPosition],
    queryFn: async () => {
      try {
        const response = await api.get('/api/analytics/shift-comparison', {
          params: {
            timeframe,
            template: selectedTemplate !== 'all' ? selectedTemplate : undefined,
            position: selectedPosition !== 'all' ? selectedPosition : undefined,
            store: user?.store?._id
          }
        });
        return response.data;
      } catch (error) {
        throw new Error('Failed to fetch shift comparison data');
      }
    }
  });

  // Fetch available templates
  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/templates');
        console.log('Templates response:', response.data);
        // The API returns { templates: [...] }, so extract the templates array
        return response.data.templates || [];
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        return [];
      }
    }
  });

  // Debug: Log the received data
  if (data) {
    console.log('Received shift comparison data:', data);
    console.log('Day performers:', data.topPerformers?.day);
    console.log('Night performers:', data.topPerformers?.night);
  }

  // Handle bar click to show department details
  const handleBarClick = (clickData: any, shift: 'day' | 'night') => {
    if (!clickData || !clickData.payload || !data) return;

    const department = clickData.payload.category;
    const fullDepartmentName = department === 'FC' ? 'Front Counter' :
                              department === 'DT' ? 'Drive Thru' :
                              department;

    console.log('Clicked department:', department, 'Full name:', fullDepartmentName, 'Shift:', shift);
    console.log('Available employees:', shift === 'day' ? data.topPerformers.day : data.topPerformers.night);

    // Get employees for this department and shift from the main data
    const employees = shift === 'day' ?
      data.topPerformers.day.filter((emp: Employee) => {
        console.log(`Checking employee ${emp.name} (${emp.department}) against ${fullDepartmentName}`);
        return emp.department === fullDepartmentName;
      }) || [] :
      data.topPerformers.night.filter((emp: Employee) => {
        console.log(`Checking employee ${emp.name} (${emp.department}) against ${fullDepartmentName}`);
        return emp.department === fullDepartmentName;
      }) || [];

    console.log('Filtered employees:', employees);

    setSelectedDepartment({
      department: fullDepartmentName,
      shift,
      employees
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <PageHeader
          title="Day vs Night Analysis"
          subtitle="Shift Performance Comparison • Advanced Shift Analytics Dashboard"
          showBackButton={true}
          icon={<Sun className="h-5 w-5" />}
          className="shadow-2xl border border-white/20 backdrop-blur-sm"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#27251F]/60" />
              <span className="text-sm font-medium text-[#27251F]/80">Time Period:</span>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[200px] h-12 bg-white/90 border-gray-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#E51636]/30 focus:border-[#E51636]/50">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200/60 shadow-xl">
                <SelectItem value="week" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 7 Days</SelectItem>
                <SelectItem value="month" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 30 Days</SelectItem>
                <SelectItem value="quarter" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last 90 Days</SelectItem>
                <SelectItem value="year" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#27251F]/60" />
              <span className="text-sm font-medium text-[#27251F]/80">Template:</span>
            </div>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[250px] h-12 bg-white/90 border-gray-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#E51636]/30 focus:border-[#E51636]/50">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200/60 shadow-xl">
                <SelectItem value="all" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">All Templates</SelectItem>
                {Array.isArray(templatesData) && templatesData.map((template: any) => (
                  <SelectItem key={template.id} value={template.id} className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#27251F]/60" />
              <span className="text-sm font-medium text-[#27251F]/80">Position:</span>
            </div>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-[200px] h-12 bg-white/90 border-gray-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#E51636]/30 focus:border-[#E51636]/50">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200/60 shadow-xl">
                <SelectItem value="all" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">All Positions</SelectItem>
                <SelectItem value="Team Member" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Team Members</SelectItem>
                <SelectItem value="Trainer" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Trainers</SelectItem>
                <SelectItem value="Leader" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Leaders</SelectItem>
                <SelectItem value="Director" className="rounded-lg hover:bg-gradient-to-r hover:from-[#E51636]/10 hover:to-[#E51636]/5">Directors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load shift comparison data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-white rounded-[20px] shadow-md">
                <CardContent className="p-8">
                  <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Overall Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] shadow-lg border border-white/50 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">Total Team Members</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#27251F]">
                      {data.topPerformers.day.length + data.topPerformers.night.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] shadow-lg border border-white/50 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">Day Shift</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{data.topPerformers.day.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] shadow-lg border border-white/50 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">Night Shift</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{data.topPerformers.night.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] shadow-lg border border-white/50 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BarChart4 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">Performance Gap</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#27251F]">
                      {Math.abs(data.averages.day - data.averages.night).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Enhanced Shift Overview */}
            <Card className="bg-white/80 backdrop-blur-sm rounded-[20px] sm:rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-white/70">
              <CardContent className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-400/10 to-orange-400/5 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#27251F]">Shift Performance Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Day Shift */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-yellow-200/50">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                          <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-semibold text-[#27251F]">Day Shift</h4>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 tracking-tight">
                            {data.averages.day.toFixed(1)}%
                          </p>
                          <p className="text-xs sm:text-sm text-[#27251F]/60 mt-1">
                            {data.topPerformers.day.length} team member{data.topPerformers.day.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {(showAllDay ? data.topPerformers.day : data.topPerformers.day.slice(0, 5)).map((performer, index) => (
                          <div key={index} className={`flex items-center gap-2 ${!performer.hasEvaluation ? 'opacity-60' : ''}`}>
                            <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg flex items-center justify-center ${
                              performer.hasEvaluation
                                ? 'bg-yellow-100'
                                : 'bg-gray-100 border border-gray-300 border-dashed'
                            }`}>
                              <span className={`text-xs sm:text-sm font-medium ${
                                performer.hasEvaluation ? 'text-yellow-600' : 'text-gray-500'
                              }`}>
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-[#27251F] truncate">{performer.name}</p>
                              <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">{performer.position || 'Team Member'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {performer.hasEvaluation ? (
                                <p className="text-sm sm:text-base font-semibold text-yellow-600">{performer.score.toFixed(1)}%</p>
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-500 italic">No recent evaluation</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {data.topPerformers.day.length > 5 && (
                          <button
                            onClick={() => setShowAllDay(!showAllDay)}
                            className="w-full mt-2 sm:mt-3 py-2 text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-200"
                          >
                            {showAllDay ? 'Show Less' : `Show All ${data.topPerformers.day.length} Team Members`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Night Shift */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-blue-200/50">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                          <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-semibold text-[#27251F]">Night Shift</h4>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 tracking-tight">
                            {data.averages.night.toFixed(1)}%
                          </p>
                          <p className="text-xs sm:text-sm text-[#27251F]/60 mt-1">
                            {data.topPerformers.night.length} team member{data.topPerformers.night.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {(showAllNight ? data.topPerformers.night : data.topPerformers.night.slice(0, 5)).map((performer, index) => (
                          <div key={index} className={`flex items-center gap-2 ${!performer.hasEvaluation ? 'opacity-60' : ''}`}>
                            <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg flex items-center justify-center ${
                              performer.hasEvaluation
                                ? 'bg-blue-100'
                                : 'bg-gray-100 border border-gray-300 border-dashed'
                            }`}>
                              <span className={`text-xs sm:text-sm font-medium ${
                                performer.hasEvaluation ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-[#27251F] truncate">{performer.name}</p>
                              <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">{performer.position || 'Team Member'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {performer.hasEvaluation ? (
                                <p className="text-sm sm:text-base font-semibold text-blue-600">{performer.score.toFixed(1)}%</p>
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-500 italic">No recent evaluation</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {data.topPerformers.night.length > 5 && (
                          <button
                            onClick={() => setShowAllNight(!showAllNight)}
                            className="w-full mt-2 sm:mt-3 py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                          >
                            {showAllNight ? 'Show Less' : `Show All ${data.topPerformers.night.length} Team Members`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Performance Chart */}
            <Card className="bg-white/80 backdrop-blur-sm rounded-[20px] sm:rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-white/70">
              <CardContent className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/5 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart4 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#27251F]">Performance by Department</h3>
                  </div>
                  <div className="h-[250px] sm:h-[300px] lg:h-[350px] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-xl sm:rounded-2xl"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.departmentComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="category"
                          tick={{ fill: '#27251F', fontSize: 10 }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fill: '#27251F', fontSize: 10 }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                          dataKey="day"
                          name="Day Shift"
                          fill="#E51636"
                          radius={[2, 2, 0, 0]}
                          onClick={(data) => handleBarClick(data, 'day')}
                          style={{ cursor: 'pointer' }}
                        />
                        <Bar
                          dataKey="night"
                          name="Night Shift"
                          fill="#1E40AF"
                          radius={[2, 2, 0, 0]}
                          onClick={(data) => handleBarClick(data, 'night')}
                          style={{ cursor: 'pointer' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        ) : null}

        {/* Department Detail Dialog */}
        <Dialog open={!!selectedDepartment} onOpenChange={() => setSelectedDepartment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3">
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  selectedDepartment?.shift === 'day'
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {selectedDepartment?.shift === 'day' ? (
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  ) : (
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#27251F] truncate">
                    {selectedDepartment?.department} - {selectedDepartment?.shift === 'day' ? 'Day' : 'Night'} Shift
                  </h3>
                  <p className="text-xs sm:text-sm text-[#27251F]/60 font-normal">
                    {selectedDepartment?.employees.length || 0} team member{selectedDepartment?.employees.length !== 1 ? 's' : ''} with evaluations
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              {selectedDepartment?.employees && selectedDepartment.employees.length > 0 ? (
                selectedDepartment.employees.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-md sm:rounded-lg flex items-center justify-center font-semibold text-white flex-shrink-0 ${
                        selectedDepartment.shift === 'day'
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        <span className="text-xs sm:text-sm">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold text-[#27251F] truncate">{employee.name}</p>
                        <p className="text-xs sm:text-sm text-[#27251F]/60 truncate">{employee.position || 'Team Member'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-lg sm:text-2xl font-bold ${
                        selectedDepartment.shift === 'day' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {employee.score.toFixed(1)}%
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {selectedDepartment.department}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm sm:text-base text-[#27251F]/60">No evaluations found for this department and shift.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DayVsNight; 