import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import documentationService from '@/services/documentationService';

interface DashboardStats {
  pendingEvaluations: number;
  completedEvaluations: number;
  totalEmployees: number;
  activeTemplates: number;
  completedReviewsLast30Days: number;
  openDisciplinaryIncidents: number;
  resolvedDisciplinaryThisMonth: number;
  newHiresCount: number;
  upcomingEvaluations: Array<{
    _id: string;
    employeeName: string;
    scheduledDate: string;
    templateName: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
  disciplinary?: {
    active: number;
    followUps: number;
    recent: Array<{
      id: string;
      name: string;
      type: string;
      severity: string;
      date: string;
    }>;
    last30Days: number;
  };
  team?: {
    inTraining: number;
    performance: {
      foh: number;
      boh: number;
    };
    newHiresLast30Days: number;
  };
  fohTasks?: {
    totalTasks: number;
    totalCompletionsToday: number;
    totalCompletionsWeek: number;
    dailyCompletionRate: number;
    tasksByShift: {
      opening: number;
      transition: number;
      closing: number;
    };
    completionsByShift: {
      opening: number;
      transition: number;
      closing: number;
    };
    recentCompletions: Array<{
      taskName: string;
      shiftType: string;
      completedBy: string;
      completedAt: string;
    }>;
  };
}

interface PerformanceData {
  name: string;
  FOH: number;
  BOH: number;
  evaluationCount?: number;
  fohCount?: number;
  bohCount?: number;
}

export function useDashboardStats() {
  // Fetch dashboard stats with optimized caching
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
    refetchOnWindowFocus: false
  });

  // Fetch FOH task stats with more frequent updates
  const { data: fohTaskStats, isLoading: fohTasksLoading } = useQuery({
    queryKey: ['fohTaskStats'],
    queryFn: async () => {
      console.log('Fetching FOH task stats...');

      // First try the new dedicated endpoint
      try {
        const response = await api.get('/api/foh-task-completions/today');
        console.log('FOH task completions response:', response.data);

        // Convert the response to the format expected by the dashboard
        // Use the tasksByShift and completionsByShift from the response if available
        const tasksByShift = response.data.tasksByShift || {
          opening: 0,
          transition: 0,
          closing: 0
        };

        const completionsByShift = response.data.completionsByShift || {
          opening: 0,
          transition: 0,
          closing: 0
        };

        // Use the completionRatesByShift from the response if available
        const completionRatesByShift = response.data.completionRatesByShift || {
          opening: 0,
          transition: 0,
          closing: 0
        };

        return {
          totalTasks: response.data.totalTasks,
          totalCompletionsToday: response.data.completedTasks,
          totalCompletionsWeek: response.data.completedTasks, // We don't have weekly data here
          dailyCompletionRate: response.data.completionRate,
          tasksByShift,
          completionsByShift,
          completionRatesByShift, // Add the completion rates by shift type
          recentCompletions: response.data.completions.map((comp: any) => ({
            taskName: comp.task,
            shiftType: comp.shiftType,
            completedBy: comp.completedBy,
            completedAt: comp.completedAt
          }))
        };
      } catch (error) {
        console.error('Error fetching from new endpoint, falling back to old endpoint', error);

        // Fall back to the original endpoint
        const response = await api.get('/api/foh-stats/stats');
        console.log('FOH task stats fallback response:', response.data);
        return response.data;
      }
    },
    staleTime: 5 * 1000, // Data stays fresh for only 5 seconds
    cacheTime: 5 * 60 * 1000, // Cache persists for 5 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true // Always refetch when component mounts
  });

  // Fetch performance data with separate caching strategy
  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData[]>({
    queryKey: ['performanceTrends'],
    queryFn: async () => {
      const response = await api.get('/api/analytics/performance-trends');
      console.log('Performance trends data:', response.data.performanceTrends);
      return response.data.performanceTrends;
    },
    staleTime: 0, // Force refresh every time
    cacheTime: 0, // Don't cache the data
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Memoized calculations
  const chartData = useMemo(() => {
    if (!performanceData) return [];
    return performanceData.map(data => ({
      ...data,
      date: data.name  // Use the quarter name directly
    }));
  }, [performanceData]);

  const upcomingEvaluations = useMemo(() => {
    if (!stats?.upcomingEvaluations) return [];
    return stats.upcomingEvaluations.slice(0, 5);
  }, [stats?.upcomingEvaluations]);

  // Use documentation service to get all records

  // Fetch all documentation and disciplinary records combined
  const { data: allDocumentation, isLoading: documentationLoading } = useQuery({
    queryKey: ['allDocumentation'],
    queryFn: async () => {
      try {
        // Use the documentationService to get all combined records
        const combinedRecords = await documentationService.getAllCombinedRecords();
        console.log('Combined records:', combinedRecords);

        // Format the records to match the expected structure
        return combinedRecords.map(record => ({
          id: record._id,
          name: record.employee?.name || 'Unknown Employee',
          type: record.type || 'Unknown Type',
          severity: record.severity || 'N/A',
          date: record.date || record.createdAt,
          source: record.source
        }));
      } catch (error) {
        console.error('Error fetching documentation, falling back to disciplinary', error);
        // Fall back to disciplinary data if documentation endpoint fails
        if (stats?.disciplinary?.recent) {
          return stats.disciplinary.recent;
        }
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
    refetchOnWindowFocus: false
  });

  // Number of documentation records to display
  const MAX_DOCUMENTATION_RECORDS = 5;

  // Track the total number of records
  const [totalDocumentationRecords, setTotalDocumentationRecords] = useState(0);

  const recentIncidents = useMemo(() => {
    // Use the fetched documentation data if available
    if (allDocumentation && allDocumentation.length > 0) {
      // Filter records from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentDocs = allDocumentation.filter(doc => {
        const docDate = new Date(doc.date || doc.createdAt);
        return docDate >= thirtyDaysAgo;
      });

      // Sort by date (newest first)
      const sortedDocs = [...recentDocs].sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      // Update the total count
      setTotalDocumentationRecords(sortedDocs.length);

      // Return only the specified number of records
      return sortedDocs.slice(0, MAX_DOCUMENTATION_RECORDS);
    }
    // Fall back to disciplinary data if documentation is not available
    if (!stats?.disciplinary?.recent) {
      setTotalDocumentationRecords(0);
      return [];
    }

    // Update the total count
    setTotalDocumentationRecords(stats.disciplinary.recent.length);

    return stats.disciplinary.recent.slice(0, MAX_DOCUMENTATION_RECORDS);
  }, [allDocumentation, stats?.disciplinary?.recent]);

  const performanceMetrics = useMemo(() => {
    if (!stats?.team?.performance) return { foh: 0, boh: 0, average: 0, change: 0 };
    const { foh, boh } = stats.team.performance;
    const average = Math.round((foh + boh) / 2);

    // Calculate change from last month's performance
    const lastMonthPerformance = performanceData?.[performanceData.length - 2];
    const currentMonthPerformance = performanceData?.[performanceData.length - 1];
    const change = lastMonthPerformance && currentMonthPerformance
      ? Math.round(((currentMonthPerformance.FOH + currentMonthPerformance.BOH) / 2) - ((lastMonthPerformance.FOH + lastMonthPerformance.BOH) / 2))
      : 0;

    return {
      foh,
      boh,
      average,
      change
    };
  }, [stats?.team?.performance, performanceData]);

  const trainingMetrics = useMemo(() => {
    if (!stats?.team) return { inTraining: 0, totalEmployees: 0, trainingRate: 0 };
    return {
      inTraining: stats.team.inTraining,
      totalEmployees: stats.totalEmployees,
      trainingRate: Math.round((stats.team.inTraining / stats.totalEmployees) * 100)
    };
  }, [stats?.team, stats?.totalEmployees]);

  // Combine FOH task stats with dashboard stats
  const combinedStats = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      fohTasks: fohTaskStats
    };
  }, [stats, fohTaskStats]);

  // FOH task metrics for easy access
  const fohTaskMetrics = useMemo(() => {
    if (!fohTaskStats) return {
      totalTasks: 0,
      completedToday: 0,
      completionRate: 0,
      openingRate: 0,
      transitionRate: 0,
      closingRate: 0,
      recentCompletions: []
    };

    // Use the completion rates by shift type from the response if available
    const { tasksByShift, completionsByShift, completionRatesByShift } = fohTaskStats;

    // Calculate completion rates, ensuring they don't exceed 100%
    const calculateRate = (completed, total) => {
      if (total <= 0) return 0;
      const rate = Math.round((completed / total) * 100);
      // Cap at 100% to prevent values over 100%
      return Math.min(rate, 100);
    };

    // Calculate rates using the helper function
    const openingRate = completionRatesByShift?.opening ??
      calculateRate(completionsByShift.opening, tasksByShift.opening);

    const transitionRate = completionRatesByShift?.transition ??
      calculateRate(completionsByShift.transition, tasksByShift.transition);

    const closingRate = completionRatesByShift?.closing ??
      calculateRate(completionsByShift.closing, tasksByShift.closing);

    // Calculate overall completion rate, capped at 100%
    const overallRate = fohTaskStats.dailyCompletionRate > 100 ?
      100 : fohTaskStats.dailyCompletionRate;

    return {
      totalTasks: fohTaskStats.totalTasks,
      completedToday: fohTaskStats.totalCompletionsToday,
      completionRate: overallRate,
      openingRate,
      transitionRate,
      closingRate,
      recentCompletions: fohTaskStats.recentCompletions || []
    };
  }, [fohTaskStats]);

  return {
    stats: combinedStats,
    chartData,
    upcomingEvaluations,
    recentIncidents,
    totalDocumentationRecords,
    performanceMetrics,
    trainingMetrics,
    fohTaskMetrics,
    isLoading: statsLoading || performanceLoading || fohTasksLoading || documentationLoading,
    fohTasksLoading // Expose FOH tasks loading state separately
  };
}