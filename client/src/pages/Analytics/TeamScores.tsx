import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Download, Filter, ArrowUpDown, ChevronUp, ChevronDown, FileText, Users, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  averageScore: number | null;
  numberOfEvaluations: number;
  recentScore: number | null;
  recentPoints: string | null;
  recentEvaluationDate: string | null;
  trend?: 'up' | 'down' | 'stable';
  improvementRate?: number;
}

interface TeamScoresResponse {
  teamMembers: TeamMember[];
}

type SortField = 'name' | 'position' | 'department' | 'averageScore' | 'recentScore' | 'numberOfEvaluations' | 'recentEvaluationDate';
type SortDirection = 'asc' | 'desc';

export default function TeamScores() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('averageScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [timeframe, setTimeframe] = useState('last90');

  const { data, isLoading } = useQuery<TeamScoresResponse>({
    queryKey: ["team-scores", timeframe],
    queryFn: async () => {
      const response = await api.get("/api/analytics/team-scores", {
        params: { timeframe: timeframe.replace('last', '') }
      });
      return response.data;
    },
  });

  // Function to export team scores data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export-team-scores', {
        params: { timeframe: timeframe.replace('last', '') },
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team-scores-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatScore = (score: number | null) => {
    if (score === null) return "N/A";
    return `${score.toFixed(2)}%`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      // Handle MongoDB date format which comes as a string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      // Format the date - show only date without time
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };

      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return "N/A";
    }
  };

  // Filter and sort team members
  const getFilteredAndSortedMembers = () => {
    if (!data?.teamMembers) return [];

    return [...data.teamMembers]
      // Apply search filter
      .filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.position.toLowerCase().includes(searchLower) ||
          member.department.toLowerCase().includes(searchLower)
        );
      })
      // Apply department filter
      .filter(member => departmentFilter === 'all' || member.department === departmentFilter)
      // Apply position filter
      .filter(member => positionFilter === 'all' || member.position === positionFilter)
      // Sort by selected field
      .sort((a, b) => {
        // Handle null values
        if (sortField === 'averageScore' || sortField === 'recentScore') {
          const aValue = a[sortField] === null ? -1 : a[sortField];
          const bValue = b[sortField] === null ? -1 : b[sortField];
          return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        }

        // Handle date sorting
        if (sortField === 'recentEvaluationDate') {
          const aDate = a.recentEvaluationDate ? new Date(a.recentEvaluationDate).getTime() : 0;
          const bDate = b.recentEvaluationDate ? new Date(b.recentEvaluationDate).getTime() : 0;
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Handle string sorting
        if (sortField === 'name' || sortField === 'position' || sortField === 'department') {
          const aValue = a[sortField].toLowerCase();
          const bValue = b[sortField].toLowerCase();
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle number sorting
        return sortDirection === 'asc'
          ? (a[sortField] as number) - (b[sortField] as number)
          : (b[sortField] as number) - (a[sortField] as number);
      });
  };

  const filteredMembers = getFilteredAndSortedMembers();

  // Get unique departments and positions for filters
  const departments = data?.teamMembers
    ? ['all', ...new Set(data.teamMembers.map(m => m.department))]
    : ['all'];

  const positions = data?.teamMembers
    ? ['all', ...new Set(data.teamMembers.map(m => m.position))]
    : ['all'];

  // Calculate team stats based on filtered members
  const calculateTeamStats = () => {
    if (!filteredMembers.length) return { avgScore: null, totalEvals: 0, topPerformer: null };

    const validScores = filteredMembers.filter(m => m.averageScore !== null);
    const totalEvals = filteredMembers.reduce((sum, m) => sum + m.numberOfEvaluations, 0);
    const avgScore = validScores.length
      ? validScores.reduce((sum, m) => sum + (m.averageScore || 0), 0) / validScores.length
      : null;

    // Find top performer
    const topPerformer = validScores.length
      ? validScores.reduce((top, current) =>
          (current.averageScore || 0) > (top.averageScore || 0) ? current : top, validScores[0])
      : null;

    return { avgScore, totalEvals, topPerformer };
  };

  // Function to toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
  }

  // Prepare data for the performance chart
  const prepareChartData = () => {
    if (!filteredMembers.length) return [];

    // Get top 10 performers for the chart
    return filteredMembers
      .filter(member => member.averageScore !== null)
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 10)
      .map(member => ({
        name: member.name.split(' ')[0], // Use first name only for chart
        score: member.averageScore || 0,
        department: member.department
      }));
  };

  const chartData = prepareChartData();
  const teamStats = calculateTeamStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <PageHeader
          title="Team Performance Scores"
          subtitle={`Comprehensive overview of all team members' evaluation scores • ${data?.teamMembers?.length || 0} Team Members • Performance Excellence Dashboard`}
          showBackButton={true}
          icon={<Medal className="h-5 w-5" />}
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

        {/* Enhanced Team Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-100/60 rounded-[24px] shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-200/50 backdrop-blur-sm hover:border-blue-300/60">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[#27251F]/70 font-semibold text-sm">Team Average</p>
                  <h3 className="text-4xl font-bold mt-2 text-[#27251F] tracking-tight">
                    {formatScore(teamStats.avgScore)}
                  </h3>
                  <div className="mt-3">
                    {teamStats.avgScore && teamStats.avgScore >= 85 ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">Excellent</span>
                      </div>
                    ) : teamStats.avgScore && teamStats.avgScore >= 75 ? (
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">Good</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">Improving</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Total Evaluations</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {teamStats.totalEvals}
                  </h3>
                  <p className="text-xs text-[#27251F]/60 mt-2">
                    {timeframe.replace('last', '')} day period
                  </p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#27251F]/60 font-medium">Team Members</p>
                  <h3 className="text-3xl font-bold mt-2 text-[#27251F]">
                    {filteredMembers.length}
                  </h3>
                  <p className="text-xs text-[#27251F]/60 mt-2">
                    {data?.teamMembers?.length !== filteredMembers.length ?
                      `${data?.teamMembers?.length} total` : 'All members shown'}
                  </p>
                </div>
                <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {teamStats.topPerformer && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#27251F]/60 font-medium">Top Performer</p>
                    <h3 className="text-xl font-bold mt-2 text-[#27251F]">
                      {teamStats.topPerformer.name.split(' ')[0]}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-[#27251F]">
                        {formatScore(teamStats.topPerformer.averageScore)}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Medal className="h-3 w-3" />
                        <span className="text-xs font-medium">Leader</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-14 w-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Medal className="h-7 w-7 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: '#27251F', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Bar
                      dataKey="score"
                      fill="#E51636"
                      radius={[0, 4, 4, 0]}
                      name="Performance Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Search</p>
                <div className="relative">
                  <Input
                    placeholder="Search by name, position, or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Department</p>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Position</p>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos === 'all' ? 'All Positions' : pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores Table */}
        <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b bg-white p-6">
            <CardTitle className="text-xl font-semibold text-[#27251F]">Team Member Scores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#F4F4F4]">
                  <TableHead className="font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1">
                      Name {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('position')}>
                    <div className="flex items-center gap-1">
                      Position {getSortIcon('position')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('department')}>
                    <div className="flex items-center gap-1">
                      Department {getSortIcon('department')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('averageScore')}>
                    <div className="flex items-center gap-1 justify-end">
                      Average Score {getSortIcon('averageScore')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('recentScore')}>
                    <div className="flex items-center gap-1 justify-end">
                      Recent Score {getSortIcon('recentScore')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('numberOfEvaluations')}>
                    <div className="flex items-center gap-1 justify-end">
                      # of Evaluations {getSortIcon('numberOfEvaluations')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-[#27251F]/60 cursor-pointer" onClick={() => toggleSort('recentEvaluationDate')}>
                    <div className="flex items-center gap-1">
                      Last Evaluation {getSortIcon('recentEvaluationDate')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#27251F]/60">
                      No team members match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-[#F4F4F4]">
                      <TableCell className="font-medium text-[#27251F]">{member.name}</TableCell>
                      <TableCell className="text-[#27251F]">{member.position}</TableCell>
                      <TableCell className="text-[#27251F]">{member.department}</TableCell>
                      <TableCell className={`text-right font-medium ${getScoreColor(member.averageScore)}`}>
                        {formatScore(member.averageScore)}
                        {member.trend && (
                          <span className="ml-1">
                            {member.trend === 'up' ? (
                              <span className="text-green-600">↑</span>
                            ) : member.trend === 'down' ? (
                              <span className="text-red-600">↓</span>
                            ) : null}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getScoreColor(member.recentScore)}`}>
                        <div>{member.recentPoints || "N/A"}</div>
                        <div className="text-sm text-[#27251F]/60">{formatScore(member.recentScore)}</div>
                      </TableCell>
                      <TableCell className="text-right text-[#27251F]">{member.numberOfEvaluations}</TableCell>
                      <TableCell className="text-[#27251F]">
                        {formatDate(member.recentEvaluationDate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}