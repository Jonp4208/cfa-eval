// client/src/pages/Analytics/HeartsAndHands.tsx
import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, Search, Download, Filter, Info, ArrowRight, ChevronDown, Medal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnalyticsPageHeader } from '.';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  metrics?: {
    heartsAndHands?: {
      x: number;
      y: number;
    };
  };
  email: string;
  role: string;
  shift?: string;
}

interface DepartmentAverage {
  id: string;
  name: string;
  department: string;
  shift: string;
  count: number;
  x: number;
  y: number;
}

interface QuadrantSummary {
  name: string;
  count: number;
  percentage: number;
  description: string;
  color: string;
  departments: number;
}

const HeartsAndHands = () => {
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [activePosition, setActivePosition] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('last90');
  const [activeTab, setActiveTab] = useState('matrix');
  const quadrantGridRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch team members
  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ['team-members', activeDepartment, timeframe],
    queryFn: async () => {
      try {
        const response = await api.get('/api/users', {
          params: {
            ...(activeDepartment !== 'all' && { department: activeDepartment.toLowerCase() }),
            role: 'user',
            store: user?.store?._id,
            timeframe: timeframe.replace('last', '')
          }
        });

        if (!response.data?.users) {
          throw new Error('Invalid response structure');
        }

        // Filter out users without valid Hearts and Hands metrics right away
        const usersWithValidMetrics = response.data.users.filter((user: any) => {
          const metrics = user.metrics?.heartsAndHands;
          return metrics &&
                 typeof metrics.x === 'number' &&
                 typeof metrics.y === 'number' &&
                 metrics.x >= 0 && metrics.x <= 100 &&
                 metrics.y >= 0 && metrics.y <= 100;
        });

        console.log('Found valid team members:', usersWithValidMetrics.length);

        return usersWithValidMetrics.map((user: any) => ({
          id: user._id,
          name: user.name || 'Unknown',
          position: user.position || 'Team Member',
          department: user.department || activeDepartment,
          metrics: user.metrics,
          email: user.email,
          role: user.role,
          shift: user.shift
        }));
      } catch (error) {
        throw new Error('Failed to fetch team members. Please try again later.');
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000
  });

  // Get all positions for filtering
  const positions = useMemo(() => {
    const posSet = new Set(['all']);
    teamMembers.forEach((member: TeamMember) => {
      if (member.position) posSet.add(member.position);
    });
    return Array.from(posSet);
  }, [teamMembers]);

  // Get filtered team members with valid metrics
  const validTeamMembers = useMemo(() => {
    console.log('Team Members:', teamMembers);
    return teamMembers.filter(member => {
      // Check if member has valid Hearts and Hands metrics
      const coords = member.metrics?.heartsAndHands;
      const hasValidMetrics = coords &&
                           typeof coords.x === 'number' &&
                           typeof coords.y === 'number' &&
                           coords.x >= 0 && coords.x <= 100 &&
                           coords.y >= 0 && coords.y <= 100;

      // Apply other filters
      return hasValidMetrics &&
        !member.position.toLowerCase().includes('director') &&
        !member.position.toLowerCase().includes('manager') &&
        (activeDepartment === 'all' || member.department.toLowerCase() === activeDepartment.toLowerCase()) &&
        (activePosition === 'all' || member.position === activePosition) &&
        (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [teamMembers, activeDepartment, activePosition, searchTerm]);

  // Calculate department averages
  const departmentAverages = useMemo(() => {
    // IMPORTANT: Only use team members with valid metrics
    const teamMembersWithValidMetrics = teamMembers.filter(member => {
      const metrics = member.metrics?.heartsAndHands;
      return metrics &&
             typeof metrics.x === 'number' &&
             typeof metrics.y === 'number' &&
             metrics.x >= 0 && metrics.x <= 100 &&
             metrics.y >= 0 && metrics.y <= 100;
    });

    // Ensure all team members have a department and shift
    teamMembersWithValidMetrics.forEach(member => {
      // Set default department if missing or invalid
      if (!member.department || member.department === 'undefined' || member.department === 'null') {
        member.department = 'FOH';
      }

      // Set default shift if missing or invalid
      if (!member.shift || member.shift === 'undefined' || member.shift === 'null') {
        member.shift = 'Day';
      }
    });

    // Define the departments and shifts we want to show
    const departments = ['FOH', 'Kitchen', 'Drive Thru'];
    const shifts = ['Day', 'Night'];

    // Initialize averages array
    const averages: DepartmentAverage[] = [];

    // Calculate average for each department and shift
    departments.forEach(dept => {
      shifts.forEach(shift => {

        // Filter team members by department and shift
        const members = teamMembersWithValidMetrics.filter(member => {
          // Match department (case insensitive)
          // Handle undefined, null, or empty department
          if (!member.department || member.department === 'undefined' || member.department === 'null') {
            // Assign to FOH by default
            return dept === 'FOH';
          }

          const deptMatch = member.department.toLowerCase() === dept.toLowerCase() ||
                          (dept === 'FOH' && ['front counter', 'cashier', 'dining room', 'foh'].some(d =>
                            member.department.toLowerCase().includes(d))) ||
                          (dept === 'Drive Thru' && ['drive', 'drive thru', 'drive-thru'].some(d =>
                            member.department.toLowerCase().includes(d))) ||
                          (dept === 'Kitchen' && ['kitchen', 'prep', 'cook', 'boh'].some(d =>
                            member.department.toLowerCase().includes(d)));

          // Match shift (if available) - be more lenient with shift matching
          // Handle undefined, null, or empty shift
          if (!member.shift || member.shift === 'undefined' || member.shift === 'null') {
            // Assign to Day shift by default
            return deptMatch && shift === 'Day';
          }

          const shiftMatch = member.shift.toLowerCase().includes(shift.toLowerCase()) ||
                           (shift === 'Day' && ['day', 'morning', 'afternoon', 'am', 'pm'].some(s =>
                             member.shift.toLowerCase().includes(s))) ||
                           (shift === 'Night' && ['night', 'evening', 'closing'].some(s =>
                             member.shift.toLowerCase().includes(s)));

          return deptMatch && shiftMatch;
        });

        // Skip if no members found
        if (members.length === 0) {
          return;
        }

        // Calculate average x and y
        let totalX = 0;
        let totalY = 0;

        members.forEach(member => {
          if (member.metrics?.heartsAndHands) {
            totalX += member.metrics.heartsAndHands.x;
            totalY += member.metrics.heartsAndHands.y;
          }
        });

        const avgX = Math.round(totalX / members.length);
        const avgY = Math.round(totalY / members.length);

        // Add to averages array
        averages.push({
          id: `${dept}-${shift}`.toLowerCase().replace(/\s+/g, '-'),
          name: `${dept} ${shift}`,
          department: dept,
          shift: shift,
          count: members.length,
          x: avgX,
          y: avgY
        });
      });
    });

    // If no averages were calculated, create some default ones for demonstration
    if (averages.length === 0 && teamMembersWithValidMetrics.length > 0) {
      // Create fallback averages based on all valid team members
      let totalX = 0;
      let totalY = 0;
      let count = 0;

      teamMembersWithValidMetrics.forEach(member => {
        if (member.metrics?.heartsAndHands) {
          totalX += member.metrics.heartsAndHands.x;
          totalY += member.metrics.heartsAndHands.y;
          count++;
        }
      });

      if (count > 0) {
        const avgX = Math.round(totalX / count);
        const avgY = Math.round(totalY / count);

        // Add fallback averages for each department with different positions
        // to prevent overlap
        const departments = ['FOH', 'Kitchen', 'Drive Thru'];
        const shifts = ['Day', 'Night'];

        // Create a grid of positions around the average
        const positions = [
          { x: avgX - 10, y: avgY + 10 },  // Top left
          { x: avgX + 10, y: avgY + 10 },  // Top right
          { x: avgX - 10, y: avgY - 10 },  // Bottom left
          { x: avgX + 10, y: avgY - 10 },  // Bottom right
          { x: avgX, y: avgY + 15 },       // Top center
          { x: avgX, y: avgY - 15 }        // Bottom center
        ];

        // Assign positions to each department/shift combination
        let posIndex = 0;
        departments.forEach(dept => {
          shifts.forEach(shift => {
            const pos = positions[posIndex % positions.length];
            averages.push({
              id: `${dept}-${shift}`.toLowerCase().replace(/\s+/g, '-'),
              name: `${dept} ${shift}`,
              department: dept,
              shift: shift,
              count: Math.ceil(count / 6), // Distribute team members roughly equally
              x: Math.max(10, Math.min(90, pos.x)), // Keep within 10-90% range
              y: Math.max(10, Math.min(90, pos.y))  // Keep within 10-90% range
            });
            posIndex++;
          });
        });
      }
    }

    // Ensure averages don't overlap by adjusting positions if needed
    if (averages.length > 1) {
      // Sort by count (largest first) to prioritize larger departments
      averages.sort((a, b) => b.count - a.count);

      // Minimum distance between markers (in percentage points)
      const minDistance = 15;

      // Adjust positions to prevent overlap
      for (let i = 0; i < averages.length; i++) {
        for (let j = i + 1; j < averages.length; j++) {
          const a = averages[i];
          const b = averages[j];

          // Calculate Euclidean distance between points
          const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

          if (distance < minDistance) {
            // Calculate direction vector from a to b
            const dx = b.x - a.x;
            const dy = b.y - a.y;

            // Normalize direction vector
            const length = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
            const ndx = dx / length;
            const ndy = dy / length;

            // Move b away from a by the minimum distance
            const moveDistance = minDistance - distance;
            b.x = Math.max(10, Math.min(90, b.x + ndx * moveDistance));
            b.y = Math.max(10, Math.min(90, b.y + ndy * moveDistance));
          }
        }
      }
    }

    return averages;
  }, [teamMembers]); // Recalculate when team members data changes

  // Calculate quadrant summaries based on department averages
  const quadrantSummary = useMemo(() => {
    const totalDepartments = departmentAverages.length;

    // Initialize counters for each quadrant
    const counts = {
      q1: 0, // High Potential (high engagement, low skills)
      q2: 0, // Star Performers (high engagement, high skills)
      q3: 0, // Needs Development (low engagement, low skills)
      q4: 0  // Skill Masters (low engagement, high skills)
    };

    // Count departments in each quadrant
    departmentAverages.forEach(dept => {
      const { x, y } = dept;

      if (x < 50 && y >= 50) counts.q1++;
      else if (x >= 50 && y >= 50) counts.q2++;
      else if (x < 50 && y < 50) counts.q3++;
      else counts.q4++;
    });

    // Also track total team members in each quadrant
    const memberCounts = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0
    };

    departmentAverages.forEach(dept => {
      const { x, y, count } = dept;

      if (x < 50 && y >= 50) memberCounts.q1 += count;
      else if (x >= 50 && y >= 50) memberCounts.q2 += count;
      else if (x < 50 && y < 50) memberCounts.q3 += count;
      else memberCounts.q4 += count;
    });

    // Calculate total team members
    const totalTeamMembers = memberCounts.q1 + memberCounts.q2 + memberCounts.q3 + memberCounts.q4;

    // Create summary objects
    return [
      {
        name: 'High Potential',
        count: memberCounts.q1,
        percentage: totalTeamMembers ? Math.round((memberCounts.q1 / totalTeamMembers) * 100) : 0,
        description: 'Departments with high engagement but developing skills',
        color: 'from-yellow-50 to-yellow-100',
        departments: counts.q1
      },
      {
        name: 'Star Performers',
        count: memberCounts.q2,
        percentage: totalTeamMembers ? Math.round((memberCounts.q2 / totalTeamMembers) * 100) : 0,
        description: 'Departments with high engagement and strong skills',
        color: 'from-green-50 to-green-100',
        departments: counts.q2
      },
      {
        name: 'Needs Development',
        count: memberCounts.q3,
        percentage: totalTeamMembers ? Math.round((memberCounts.q3 / totalTeamMembers) * 100) : 0,
        description: 'Departments needing improvement in both engagement and skills',
        color: 'from-red-50 to-red-100',
        departments: counts.q3
      },
      {
        name: 'Skill Masters',
        count: memberCounts.q4,
        percentage: totalTeamMembers ? Math.round((memberCounts.q4 / totalTeamMembers) * 100) : 0,
        description: 'Departments with strong skills but lower engagement',
        color: 'from-yellow-50 to-yellow-100',
        departments: counts.q4
      }
    ];
  }, [departmentAverages]);

  // Function to handle exporting data
  const handleExportData = async () => {
    try {
      const response = await api.get('/api/analytics/export-hearts-and-hands', {
        params: {
          timeframe: timeframe.replace('last', ''),
          department: activeDepartment,
          position: activePosition
        },
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hearts-and-hands-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export Failed",
        description: "Could not export Hearts & Hands data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold">Hearts & Hands Analysis</h1>
                <p className="text-white/80 mt-2 text-sm md:text-lg">Team Development Matrix</p>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/analytics')}
                  className="mt-4 hover:bg-white/10 text-white border border-white/20 px-4 py-2 h-10 rounded-xl"
                >
                  Back to Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Search</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white text-[#27251F] placeholder:text-[#27251F]/60 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E51636]/20 w-full h-10"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Department</p>
                <div className="flex rounded-md overflow-hidden border border-gray-200 w-full">
                  <button
                    className={`flex-1 px-4 py-2 h-10 transition-colors ${
                      activeDepartment === 'all'
                        ? 'bg-[#E51636] text-white font-medium'
                        : 'text-[#27251F] hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDepartment('all')}
                    disabled={isLoading}
                  >
                    All
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 h-10 transition-colors ${
                      activeDepartment === 'foh'
                        ? 'bg-[#E51636] text-white font-medium'
                        : 'text-[#27251F] hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDepartment('foh')}
                    disabled={isLoading}
                  >
                    FOH
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 h-10 transition-colors ${
                      activeDepartment === 'boh'
                        ? 'bg-[#E51636] text-white font-medium'
                        : 'text-[#27251F] hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDepartment('boh')}
                    disabled={isLoading}
                  >
                    BOH
                  </button>
                </div>
              </div>

              {/* Position Filter */}
              <div>
                <p className="text-sm font-medium mb-2 text-[#27251F]/60">Position</p>
                <Select value={activePosition} onValueChange={setActivePosition}>
                  <SelectTrigger className="w-full">
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

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white p-1 rounded-xl mb-6">
            <TabsTrigger value="matrix" className="rounded-lg data-[state=active]:bg-[#E51636] data-[state=active]:text-white">
              Matrix View
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-[#E51636] data-[state=active]:text-white">
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="mt-0">
            <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-semibold">Department Hearts & Hands Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <p>Failed to load team members. Please try again later.</p>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-[600px] bg-gray-100 rounded-xl"></div>
                  </div>
                ) : !departmentAverages.length ? (
                  // Empty state
                  <div className="p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No department averages available</p>
                      <p className="text-sm text-gray-400">
                        Please ensure team members have valid Hearts and Hands metrics
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {/* Matrix Legend */}
                    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                      {quadrantSummary.map((quadrant, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                          <div className={`w-full h-16 bg-gradient-to-br ${quadrant.color} rounded-lg mb-2 flex items-center justify-center`}>
                            <span className="font-medium text-[#27251F]">{quadrant.name}</span>
                          </div>
                          <p className="text-xs text-[#27251F]/60">{quadrant.count} team members</p>
                        </div>
                      ))}
                    </div>

                    <div className="relative w-full max-w-[567px] aspect-square mt-8">
                      {/* Quadrant Grid */}
                      <div ref={quadrantGridRef} className="absolute inset-0 grid grid-cols-2 gap-0.5">
                        {/* Top Left Quadrant - High Potential */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-tl-lg border border-gray-200 flex items-center justify-center relative">
                          <div className="text-sm font-medium text-[#27251F]/80">High Potential</div>
                          <div className="absolute top-2 left-2 text-xs text-[#27251F]/60">
                            High Engagement<br />Developing Skills
                          </div>
                        </div>
                        {/* Top Right Quadrant - Star Performers */}
                        <div className="bg-gradient-to-bl from-green-50 to-green-100 rounded-tr-lg border border-gray-200 flex items-center justify-center relative">
                          <div className="text-sm font-medium text-[#27251F]/80">Star Performers</div>
                          <div className="absolute top-2 right-2 text-xs text-[#27251F]/60 text-right">
                            High Engagement<br />Strong Skills
                          </div>
                        </div>
                        {/* Bottom Left Quadrant - Needs Development */}
                        <div className="bg-gradient-to-tr from-red-50 to-red-100 rounded-bl-lg border border-gray-200 flex items-center justify-center relative">
                          <div className="text-sm font-medium text-[#27251F]/80">Needs Development</div>
                          <div className="absolute bottom-2 left-2 text-xs text-[#27251F]/60">
                            Low Engagement<br />Developing Skills
                          </div>
                        </div>
                        {/* Bottom Right Quadrant - Skill Masters */}
                        <div className="bg-gradient-to-tl from-yellow-50 to-yellow-100 rounded-br-lg border border-gray-200 flex items-center justify-center relative">
                          <div className="text-sm font-medium text-[#27251F]/80">Skill Masters</div>
                          <div className="absolute bottom-2 right-2 text-xs text-[#27251F]/60 text-right">
                            Low Engagement<br />Strong Skills
                          </div>
                        </div>

                        {/* Axis Labels */}
                        <div className="absolute inset-x-0 -top-12 flex justify-center">
                          <div className="text-sm font-medium text-[#27251F] bg-white px-3 py-1 rounded-full shadow-sm">
                            Engagement & Commitment
                          </div>
                        </div>
                        <div className="absolute -right-16 inset-y-0 flex items-center">
                          <div className="text-sm font-medium text-[#27251F] bg-white px-3 py-1 rounded-full shadow-sm rotate-90">
                            Skills & Abilities
                          </div>
                        </div>

                        {/* Axis Arrows */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                          <ArrowRight className="h-4 w-4 text-[#27251F] rotate-90" />
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-4 -translate-y-1/2">
                          <ArrowRight className="h-4 w-4 text-[#27251F]" />
                        </div>

                        {/* Department Average Markers - ONLY SHOW DEPARTMENT AVERAGES */}
                        {departmentAverages.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/80 p-4 rounded-lg text-center">
                              <p className="text-sm font-medium text-[#27251F]">No department averages available</p>
                              <p className="text-xs text-[#27251F]/60 mt-1">Please ensure team members have valid Hearts and Hands metrics</p>
                            </div>
                          </div>
                        ) : (
                          // Map through department averages
                          departmentAverages.map((dept) => {
                            // Get department info
                            const { id, x, y, name, count, department, shift } = dept;

                            // Create initials for the marker
                            const deptInitial = department.charAt(0);
                            const shiftInitial = shift.charAt(0);

                            // Set color based on department
                            let color;
                            if (department === 'FOH') {
                              color = '#E51636'; // Red
                            } else if (department === 'Kitchen') {
                              color = '#3B82F6'; // Blue
                            } else if (department === 'Drive Thru') {
                              color = '#10B981'; // Green
                            } else {
                              color = '#9333EA'; // Purple fallback
                            }

                            return (
                              <TooltipProvider key={id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                                      style={{
                                        backgroundColor: color,
                                        width: '3rem',  // Smaller size
                                        height: '3rem', // Smaller size
                                        left: `${x}%`,
                                        top: `${100 - y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 10,
                                        border: '2px solid white', // Add border
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)' // Better shadow
                                      }}
                                    >
                                      <div className="flex flex-col items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                          {deptInitial}{shiftInitial}
                                        </span>
                                        <span className="text-[10px] text-white/90">
                                          {count}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-white border shadow-lg rounded-xl p-3 z-50">
                                    <div className="flex flex-col gap-1">
                                      <p className="font-medium text-[#27251F]">{name}</p>
                                      <p className="text-xs text-[#27251F]/60">{count} team members</p>
                                      <div className="mt-2 pt-2 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <p className="text-gray-500">Engagement</p>
                                            <p className="font-medium">{x}%</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Skills</p>
                                            <p className="font-medium">{y}%</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-3xl">
                      <div className="text-sm text-[#27251F]/80">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-[#E51636]" />
                          Matrix Instructions
                        </p>
                        <p className="text-xs mb-2">This matrix shows the average position of team members by department and shift. The horizontal axis represents engagement and commitment, while the vertical axis represents skills and abilities.</p>

                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-200 text-xs">
                          <p className="font-medium">Department Markers:</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-[#E51636]"></div>
                              <span>FOH</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-[#3B82F6]"></div>
                              <span>Kitchen</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
                              <span>Drive Thru</span>
                            </div>
                          </div>
                          <p className="font-medium mt-2">Shift Indicators:</p>
                          <p>Each marker shows the department initial followed by the shift initial (D for Day, N for Night). The number below indicates how many team members are included in the average.</p>
                        </div>

                        {departmentAverages.length === 0 && (
                          <div className="text-xs text-amber-600 flex items-start gap-2 mt-3 pt-3 border-t border-gray-200">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Note:</p>
                              <p>No department averages could be calculated because team members don't have valid Hearts and Hands metrics. Update team member positions from their profile pages.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Team Members Button */}
                    <Button
                      onClick={() => navigate('/users')}
                      className="mt-4 bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                      variant="default"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View All Team Members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <Card className="bg-white rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-semibold">Department Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-[400px] bg-gray-100 rounded-xl"></div>
                  </div>
                ) : !departmentAverages.length ? (
                  <div className="p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No department averages available</p>
                      <p className="text-sm text-gray-400">Please ensure team members have valid Hearts and Hands metrics</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Quadrant Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {quadrantSummary.map((quadrant, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className={`w-16 h-16 bg-gradient-to-br ${quadrant.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="font-medium text-[#27251F]">{quadrant.percentage}%</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-[#27251F]">{quadrant.name}</h3>
                            <p className="text-sm text-[#27251F]/60 mt-1">{quadrant.description}</p>
                            <div className="flex flex-col gap-1 mt-2">
                              <p className="text-xs text-[#27251F]/80">{quadrant.departments} department{quadrant.departments !== 1 ? 's' : ''}</p>
                              <p className="text-xs text-[#27251F]/80">{quadrant.count} team member{quadrant.count !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Development Recommendations */}
                    <div className="mt-8 p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <h3 className="font-medium text-[#27251F] mb-4">Development Recommendations</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-[#27251F] text-xs">Q1</span>
                          </div>
                          <div>
                            <p className="text-sm text-[#27251F]/80"><span className="font-medium">High Potential:</span> Focus on skill development for these departments through targeted training programs and mentorship.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-[#27251F] text-xs">Q2</span>
                          </div>
                          <div>
                            <p className="text-sm text-[#27251F]/80"><span className="font-medium">Star Performers:</span> Provide leadership opportunities and advanced training for these departments to maintain their high performance.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-[#27251F] text-xs">Q3</span>
                          </div>
                          <div>
                            <p className="text-sm text-[#27251F]/80"><span className="font-medium">Needs Development:</span> Implement department-wide coaching plans and regular check-ins to improve both skills and engagement in these areas.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-[#27251F] text-xs">Q4</span>
                          </div>
                          <div>
                            <p className="text-sm text-[#27251F]/80"><span className="font-medium">Skill Masters:</span> Focus on increasing engagement in these departments through team recognition programs and finding new challenges for skilled team members.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HeartsAndHands;