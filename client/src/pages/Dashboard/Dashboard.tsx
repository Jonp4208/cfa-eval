// client/src/pages/Dashboard.tsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  ClipboardList,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Clock,
  Target,
  Award,
  LucideIcon,
  CheckSquare,
  ListChecks,
  RefreshCw,
  Wrench,
  Thermometer,
  Sun,
  Sunrise,
  Sunset,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import TeamMemberDashboard from '../TeamMemberDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useKitchenDashboardStats } from '@/hooks/useKitchenDashboardStats';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  progress?: number;
  onClick: () => void;
  className?: string;
  alert?: {
    count: number,
    text: string,
    color: string
  };
}

interface Evaluation {
  _id: string;
  employeeName?: string;
  employee?: {
    _id: string;
    name: string;
  };
  templateName?: string;
  template?: {
    _id: string;
    name: string;
  };
  scheduledDate: string;
}

interface Incident {
  id: string;
  name: string;
  type: string;
  severity: string;
  date: string;
  source?: 'documentation' | 'disciplinary';
}

interface DashboardStats {
  pendingEvaluations: number;
  completedEvaluations: number;
  totalEmployees: number;
  activeTemplates: number;
  completedReviewsLast30Days: number;
  openDisciplinaryIncidents: number;
  resolvedDisciplinaryThisMonth: number;
  newHiresCount: number;
  upcomingEvaluations: Array<Evaluation>;
  disciplinary?: {
    active: number;
    followUps: number;
    recent: Array<Incident>;
    last30Days: number;
  };
  team?: {
    inTraining: number;
    performance: {
      foh: number;
      boh: number;
      average: number;
      change: number;
    };
    newHiresLast30Days: number;
  };
}

// Memoized card components for better performance
const StatCard = React.memo<StatCardProps>(({ title, value, subtitle, icon: Icon, color, progress, onClick, alert }) => (
  <Card
    className="bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-lg border border-gray-100"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`shrink-0 h-10 w-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon strokeWidth={1.5} size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#27251F]">{title}</p>
          <h3 className="text-xl font-bold text-[#27251F] mt-0.5">{value}</h3>
        </div>
      </div>

      {alert && alert.count > 0 ? (
        <div className={`mt-1 mb-2 py-1 px-2 ${alert.color} rounded-md flex items-center justify-between`}>
          <span className="text-xs font-medium">{alert.text}</span>
          <span className="text-xs font-bold px-1.5 py-0.5 bg-white/30 rounded-full">{alert.count}</span>
        </div>
      ) : (
        <p className="text-xs text-[#27251F]/60">{subtitle}</p>
      )}

      {progress !== undefined && progress > 0 && (
        <div className="mt-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </CardContent>
  </Card>
));

interface PerformanceChartProps {
  data: Array<{
    date: string;
    FOH: number;
    BOH: number;
    evaluationCount?: number;
    fohCount?: number;
    bohCount?: number;
  }>;
}

const PerformanceChart = React.memo<PerformanceChartProps>(({ data }) => {
  const { t } = useTranslation();

  // Custom tooltip to show more context
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value}%
              </p>
            ))}
            {dataPoint.evaluationCount && (
              <p className="text-xs text-gray-600 mt-2">
                {t('dashboard.evaluationCount', { count: dataPoint.evaluationCount })}
                <br />
                {t('dashboard.fohEvaluations', { count: dataPoint.fohCount })} •
                {t('dashboard.bohEvaluations', { count: dataPoint.bohCount })}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#27251F"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            stroke="#27251F"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="FOH"
            name="FOH"
            stroke="#E51636"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="BOH"
            name="BOH"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { isFeatureEnabled } = useSubscription();

  // Check for mobile app - we want to ensure consistent buttons on all platforms
  const isMobileApp = location.search.includes('mobile=true') || window.navigator.userAgent.includes('CFA-Eval-App');

  // Use our custom hooks for all dashboard data and calculations
  const {
    stats,
    chartData,
    upcomingEvaluations,
    recentIncidents,
    totalDocumentationRecords,
    totalDocumentationsThisMonth,
    totalDocumentationsThisWeek,
    performanceMetrics,
    trainingMetrics,
    fohTaskMetrics,
    isLoading,
    fohTasksLoading
  } = useDashboardStats();

  // Get kitchen stats
  const {
    kitchenStats,
    isLoading: kitchenStatsLoading,
    refetchKitchenStats
  } = useKitchenDashboardStats();

  const queryClient = useQueryClient();

  // Explicitly type the stats as DashboardStats
  const typedStats = stats as DashboardStats;

  // Calculate recent documentation count (last 30 days)
  const recentDocumentationCount = recentIncidents.filter(incident => {
    const incidentDate = new Date(incident.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return incidentDate >= thirtyDaysAgo;
  }).length;

  // Show Team Member dashboard for Team Members and Trainers
  if (user?.position === 'Team Member' || user?.position === 'Trainer') {
    return <TeamMemberDashboard />;
  }

  // Fetch training progress data
  const { data: trainingProgressData, isLoading: trainingProgressLoading } = useQuery({
    queryKey: ['trainingProgress'],
    queryFn: async () => {
      const response = await api.get('/api/training/employees/training-progress');
      return response.data;
    },
    enabled: isFeatureEnabled('training'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch new hires data
  const { data: newHiresData, isLoading: newHiresLoading } = useQuery({
    queryKey: ['newHires'],
    queryFn: async () => {
      const response = await api.get('/api/training/employees/new-hires');
      return response.data;
    },
    enabled: isFeatureEnabled('training'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch leadership dashboard data
  const { data: leadershipData, isLoading: leadershipLoading } = useQuery({
    queryKey: ['leadershipDashboard'],
    queryFn: async () => {
      const response = await api.get('/leadership/dashboard');
      return response.data;
    },
    enabled: isFeatureEnabled('leadership'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user counts by position
  const { data: userPositionData, isLoading: userPositionLoading } = useQuery({
    queryKey: ['userPositions'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      return response.data.users || [];
    },
    enabled: isFeatureEnabled('leadership'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch leadership plans
  const { data: leadershipPlansData, isLoading: leadershipPlansLoading } = useQuery({
    queryKey: ['leadershipPlans'],
    queryFn: async () => {
      const response = await api.get('/api/leadership/plans');
      return response.data;
    },
    enabled: isFeatureEnabled('leadership'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch enrolled leadership plans
  const { data: myPlansData, isLoading: myPlansLoading } = useQuery({
    queryKey: ['myLeadershipPlans'],
    queryFn: async () => {
      const response = await api.get('/api/leadership/my-plans');
      return response.data;
    },
    enabled: isFeatureEnabled('leadership'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate training stats
  const trainingStats = useMemo(() => {
    if (!trainingProgressData || !Array.isArray(trainingProgressData)) {
      return {
        needsTraining: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0,
        totalTrainees: 0,
        newHires: 0
      };
    }

    const totalTrainees = trainingProgressData.length;
    const needsTraining = trainingProgressData.filter(trainee => trainee.status === 'not_started').length;
    const inProgress = trainingProgressData.filter(trainee => trainee.status === 'in_progress').length;
    const completed = trainingProgressData.filter(trainee => trainee.status === 'completed').length;
    const completionRate = totalTrainees > 0 ? Math.round((completed / totalTrainees) * 100) : 0;
    const newHires = Array.isArray(newHiresData) ? newHiresData.length : 0;

    return {
      needsTraining,
      inProgress,
      completed,
      completionRate,
      totalTrainees,
      newHires
    };
  }, [trainingProgressData, newHiresData]);

  // Calculate leadership stats
  const leadershipStats = useMemo(() => {
    if (!leadershipData) {
      return {
        plans: {
          enrolled: 0,
          completed: 0,
          inProgress: 0,
          overallProgress: 0
        },
        tasks: {
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0
        },
        teamLeaders: 0,
        shiftLeaders: 0,
        directors: 0
      };
    }

    // Count users by position
    let teamLeaders = 0;
    let shiftLeaders = 0;
    let directors = 0;

    if (Array.isArray(userPositionData)) {
      // Count Team Leaders (users with position 'Leader')
      teamLeaders = userPositionData.filter(user =>
        user.position === 'Leader'
      ).length;

      // Count Shift Leaders (users with position 'Trainer')
      shiftLeaders = userPositionData.filter(user =>
        user.position === 'Trainer'
      ).length;

      // Count Directors (users with position 'Director')
      directors = userPositionData.filter(user =>
        user.position === 'Director'
      ).length;
    }

    // Calculate leadership plan stats
    let enrolled = 0;
    let completed = 0;
    let inProgress = 0;
    let overallProgress = 0;

    if (Array.isArray(myPlansData)) {
      // Count enrolled plans
      enrolled = myPlansData.length;

      // Count completed plans
      completed = myPlansData.filter(plan =>
        plan.status === 'completed'
      ).length;

      // Count in-progress plans
      inProgress = myPlansData.filter(plan =>
        plan.status === 'in-progress'
      ).length;

      // Calculate overall progress
      if (enrolled > 0) {
        const totalProgress = myPlansData.reduce((sum, plan) => sum + (plan.progress || 0), 0);
        overallProgress = Math.round(totalProgress / enrolled);
      }
    }

    return {
      plans: {
        enrolled,
        completed,
        inProgress,
        overallProgress
      },
      tasks: leadershipData.tasks || {
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0
      },
      teamLeaders,
      shiftLeaders,
      directors
    };
  }, [leadershipData, userPositionData, myPlansData]);

  // Memoize navigation handlers
  const handleNavigate = useCallback((path: string) => () => navigate(path), [navigate]);

  if (isLoading || kitchenStatsLoading || trainingProgressLoading || newHiresLoading || leadershipLoading || userPositionLoading || leadershipPlansLoading || myPlansLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
  }

  // Function to render detail cards based on enabled features
  function renderDetailCards() {
    const enabledFeatures = [];
    if (isFeatureEnabled('fohTasks')) enabledFeatures.push('fohTasks');
    if (isFeatureEnabled('kitchen')) enabledFeatures.push('kitchen');
    if (isFeatureEnabled('documentation')) enabledFeatures.push('documentation');
    if (isFeatureEnabled('evaluations')) enabledFeatures.push('evaluations');
    if (isFeatureEnabled('training')) enabledFeatures.push('training');
    if (isFeatureEnabled('leadership')) enabledFeatures.push('leadership');

    // Define feature priority (most important first)
    const featurePriority = ['evaluations', 'leadership', 'fohTasks', 'kitchen', 'documentation', 'training'];

    // Sort enabled features by priority
    const prioritizedFeatures = [...enabledFeatures].sort((a, b) => {
      return featurePriority.indexOf(a) - featurePriority.indexOf(b);
    });

    // Generate detail cards for each enabled feature
    const detailCards = [];

    // Add a large card for each enabled feature
    prioritizedFeatures.forEach(feature => {
      if (feature === 'evaluations') {
        // Performance Chart for Evaluations
        detailCards.push(
          <Card key="performance-trends" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-[#E51636] transition-colors duration-300">
                  {t('dashboard.performanceTrends')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.performanceDescription')}</p>
                <p className="text-[#27251F]/40 text-xs mt-1 italic">{t('dashboard.performanceContext')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#E51636] transition-transform duration-300 group-hover:scale-125" />
                  <span className="text-sm text-[#27251F]/60">FOH</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#2563eb] transition-transform duration-300 group-hover:scale-125" />
                  <span className="text-sm text-[#27251F]/60">BOH</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="transition-transform duration-300 group-hover:scale-[1.02] origin-bottom">
                <PerformanceChart data={chartData} />
              </div>
            </CardContent>
          </Card>
        );
      }

      if (feature === 'fohTasks') {
        // FOH Tasks Overview
        detailCards.push(
          <Card key="foh-tasks-chart" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-blue-600 transition-colors duration-300">
                  {t('dashboard.fohTasksOverview', 'FOH Tasks Overview')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.fohTasksOverviewDescription', 'Task completion trends by shift type')}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Sunrise className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-blue-900">Opening</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{fohTaskMetrics.openingRate}%</p>
                  <Progress value={fohTaskMetrics.openingRate} className="h-2 bg-blue-200 w-full mt-2" />
                </div>
                <div className="bg-amber-50 rounded-xl p-5 flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Sun className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-amber-900">Transition</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">{fohTaskMetrics.transitionRate}%</p>
                  <Progress value={fohTaskMetrics.transitionRate} className="h-2 bg-amber-200 w-full mt-2" />
                </div>
                <div className="bg-indigo-50 rounded-xl p-5 flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Sunset className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-indigo-900">Closing</p>
                  <p className="text-2xl font-bold text-indigo-700 mt-1">{fohTaskMetrics.closingRate}%</p>
                  <Progress value={fohTaskMetrics.closingRate} className="h-2 bg-indigo-200 w-full mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (feature === 'kitchen') {
        // Kitchen Overview
        detailCards.push(
          <Card key="kitchen-overview" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-green-600 transition-colors duration-300">
                  {t('dashboard.kitchenOverview', 'Kitchen Overview')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.kitchenOverviewDescription', 'Equipment and food safety status')}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <Wrench className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-900">Equipment Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-green-800">Operational</span>
                        <span className="text-sm font-bold text-green-800">{kitchenStats.equipment.operational}/{kitchenStats.equipment.totalEquipment}</span>
                      </div>
                      <Progress value={(kitchenStats.equipment.operational / kitchenStats.equipment.totalEquipment) * 100} className="h-2 bg-green-200" indicatorClassName="bg-green-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-amber-800">Needs Maintenance</span>
                        <span className="text-sm font-bold text-amber-800">{kitchenStats.equipment.needsMaintenance}</span>
                      </div>
                      <Progress value={(kitchenStats.equipment.needsMaintenance / kitchenStats.equipment.totalEquipment) * 100} className="h-2 bg-amber-200" indicatorClassName="bg-amber-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-800">Out of Service</span>
                        <span className="text-sm font-bold text-red-800">{kitchenStats.equipment.needsRepair}</span>
                      </div>
                      <Progress value={(kitchenStats.equipment.needsRepair / kitchenStats.equipment.totalEquipment) * 100} className="h-2 bg-red-200" indicatorClassName="bg-red-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <Thermometer className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-900">Food Safety</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-800">Temp Checks</span>
                        <span className="text-sm font-bold text-red-800">{kitchenStats.foodSafety.completedTempChecks}/{kitchenStats.foodSafety.totalTempChecks}</span>
                      </div>
                      <Progress value={(kitchenStats.foodSafety.completedTempChecks / kitchenStats.foodSafety.totalTempChecks) * 100} className="h-2 bg-red-200" indicatorClassName="bg-red-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-800">Checklist Completion</span>
                        <span className="text-sm font-bold text-red-800">{kitchenStats.checklists.completionRate}%</span>
                      </div>
                      <Progress value={kitchenStats.checklists.completionRate} className="h-2 bg-red-200" indicatorClassName="bg-red-600" />
                    </div>
                    {kitchenStats.foodSafety.overdueTasks > 0 && (
                      <div className="bg-amber-100 text-amber-800 p-2 rounded-md mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Overdue Tasks</span>
                        <span className="text-sm font-bold px-2 py-0.5 bg-amber-200 rounded-full">{kitchenStats.foodSafety.overdueTasks}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (feature === 'documentation') {
        // Documentation Overview
        detailCards.push(
          <Card key="documentation-overview" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-orange-600 transition-colors duration-300">
                  {t('dashboard.documentationOverview', 'Documentation Overview')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.documentationOverviewDescription', 'Recent documentation activity')}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-orange-900">Documentation Activity</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">This Month</span>
                      <span className="text-xl font-bold text-orange-800">{totalDocumentationsThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">This Week</span>
                      <span className="text-xl font-bold text-orange-800">{totalDocumentationsThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">Total Records</span>
                      <span className="text-xl font-bold text-orange-800">{totalDocumentationRecords}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-900">Recent Incidents</h3>
                  </div>
                  <div className="space-y-3">
                    {recentIncidents.slice(0, 3).map((incident, index) => (
                      <div key={index} className="border-b border-red-100 pb-2 last:border-0">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-red-800">{incident.name}</span>
                          <span className="text-xs text-red-700">{new Date(incident.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-red-600">{incident.type}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            incident.severity === 'high' ? 'bg-red-200 text-red-800' :
                            incident.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                    {recentIncidents.length === 0 && (
                      <div className="text-center py-4 text-red-500">
                        <p>No recent incidents</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (feature === 'training') {
        // Training Overview
        detailCards.push(
          <Card key="training-overview" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-green-600 transition-colors duration-300">
                  {t('dashboard.trainingOverview', 'Training Overview')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.trainingOverviewDescription', 'Team member training progress')}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <Award className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-900">Training Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-green-800">Completion Rate</span>
                        <span className="text-sm font-bold text-green-800">{trainingStats.completionRate}%</span>
                      </div>
                      <Progress value={trainingStats.completionRate} className="h-2 bg-green-200" indicatorClassName="bg-green-600" />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-green-800">In Training</span>
                      <span className="text-xl font-bold text-green-800">{trainingStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">New Hires</span>
                      <span className="text-xl font-bold text-green-800">{trainingStats.newHires}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-emerald-600 mr-2" />
                    <h3 className="text-lg font-semibold text-emerald-900">Training Progress</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-emerald-100 rounded-lg">
                      <span className="text-sm font-medium text-emerald-800">Not Started</span>
                      <span className="text-lg font-bold text-emerald-800">{trainingStats.needsTraining}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-emerald-100 rounded-lg">
                      <span className="text-sm font-medium text-emerald-800">In Progress</span>
                      <span className="text-lg font-bold text-emerald-800">{trainingStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-emerald-100 rounded-lg">
                      <span className="text-sm font-medium text-emerald-800">Completed</span>
                      <span className="text-lg font-bold text-emerald-800">{trainingStats.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (feature === 'leadership') {
        // Leadership Overview
        detailCards.push(
          <Card key="leadership-overview" className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-indigo-600 transition-colors duration-300">
                  {t('dashboard.leadershipOverview', 'Leadership Overview')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.leadershipOverviewDescription', 'Leadership development progress')}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <Target className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-indigo-900">Leadership Plans</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-indigo-800">Overall Progress</span>
                        <span className="text-sm font-bold text-indigo-800">{leadershipStats.plans.overallProgress}%</span>
                      </div>
                      <Progress value={leadershipStats.plans.overallProgress} className="h-2 bg-indigo-200" indicatorClassName="bg-indigo-600" />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-indigo-800">Active Plans</span>
                      <span className="text-xl font-bold text-indigo-800">{leadershipStats.plans.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-800">Pending Tasks</span>
                      <span className="text-xl font-bold text-indigo-800">{leadershipStats.tasks.pending}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-violet-50 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <ClipboardList className="h-6 w-6 text-violet-600 mr-2" />
                    <h3 className="text-lg font-semibold text-violet-900">Leadership Development</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-violet-100 rounded-lg">
                      <span className="text-sm font-medium text-violet-800">Team Leaders</span>
                      <span className="text-lg font-bold text-violet-800">{leadershipStats.teamLeaders}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-violet-100 rounded-lg">
                      <span className="text-sm font-medium text-violet-800">Shift Leaders</span>
                      <span className="text-lg font-bold text-violet-800">{leadershipStats.shiftLeaders}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-violet-100 rounded-lg">
                      <span className="text-sm font-medium text-violet-800">Directors</span>
                      <span className="text-lg font-bold text-violet-800">{leadershipStats.directors}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }
    });

    // Return the detail cards
    return detailCards;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section with PageHeader */}
        <PageHeader
          title={t('dashboard.welcomeBack', `Welcome back, ${user?.name}!`, { name: user?.name })}
          subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          actions={
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={handleNavigate('/evaluations/new')}
                className={headerButtonClass}
              >
                <ClipboardList className="w-4 h-4" />
                <span>{t('evaluations.create')}</span>
              </Button>
              <Button
                onClick={handleNavigate('/disciplinary/new')}
                className={headerButtonClass}
              >
                <AlertCircle className="w-4 h-4" />
                <span>{t('dashboard.newIncident')}</span>
              </Button>
            </div>
          }
          showBackButton={false}
        />

        {/* Quick Stats Grid - Always show 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Determine which features are enabled */}
          {(() => {
            // Get list of enabled features
            const enabledFeatures = [];
            if (isFeatureEnabled('fohTasks')) enabledFeatures.push('fohTasks');
            if (isFeatureEnabled('kitchen')) enabledFeatures.push('kitchen');
            if (isFeatureEnabled('documentation')) enabledFeatures.push('documentation');
            if (isFeatureEnabled('evaluations')) enabledFeatures.push('evaluations');
            if (isFeatureEnabled('training')) enabledFeatures.push('training');
            if (isFeatureEnabled('leadership')) enabledFeatures.push('leadership');

            // Initialize empty cards array
            const cards = [];

            // Define feature priority (most important first)
            const featurePriority = ['evaluations', 'leadership', 'fohTasks', 'kitchen', 'documentation', 'training'];

            // Sort enabled features by priority
            const prioritizedFeatures = [...enabledFeatures].sort((a, b) => {
              return featurePriority.indexOf(a) - featurePriority.indexOf(b);
            });

            // Define how many cards to show for each feature based on the number of enabled features
            let cardsPerFeature = {};

            if (prioritizedFeatures.length === 0) {
              // No features enabled - show 4 placeholder cards
              for (let i = 0; i < 4; i++) {
                cards.push(
                  <Card
                    key={`placeholder-${i}`}
                    className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border border-gray-100"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-gray-400">{t('dashboard.noFeatureEnabled', 'No feature enabled')}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            } else if (prioritizedFeatures.length === 1) {
              // 1 feature enabled - show 4 cards for that feature
              const feature = prioritizedFeatures[0];
              cardsPerFeature[feature] = 4;
            } else if (prioritizedFeatures.length === 2) {
              // 2 features enabled - show 2 cards for each feature
              prioritizedFeatures.forEach(feature => {
                cardsPerFeature[feature] = 2;
              });
            } else if (prioritizedFeatures.length === 3) {
              // 3 features enabled - show 1 card for each feature, plus 1 extra for the most important
              prioritizedFeatures.forEach(feature => {
                cardsPerFeature[feature] = 1;
              });
              cardsPerFeature[prioritizedFeatures[0]] += 1; // Add extra card for most important feature
            } else {
              // 4+ features enabled - show 1 card for each of the 4 most important features
              prioritizedFeatures.slice(0, 4).forEach(feature => {
                cardsPerFeature[feature] = 1;
              });
            }

            // Generate cards for each feature based on the calculated distribution
            Object.entries(cardsPerFeature).forEach(([feature, count]) => {
              for (let i = 0; i < count; i++) {
                if (feature === 'fohTasks') {
                  if (i === 0) {
                    // Primary FOH card
                    cards.push(
                      <StatCard
                        key="foh-tasks-main"
                        title={t('dashboard.fohTasks', 'FOH Tasks')}
                        value={`${fohTaskMetrics.completionRate}%`}
                        subtitle={`${fohTaskMetrics.completedToday}/${fohTaskMetrics.totalTasks} completed today`}
                        icon={CheckSquare}
                        color="bg-blue-100 text-blue-600"
                        progress={fohTaskMetrics.completionRate}
                        onClick={handleNavigate('/foh')}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary FOH card - Opening Tasks
                    cards.push(
                      <StatCard
                        key="foh-tasks-opening"
                        title={t('dashboard.openingTasks', 'Opening Tasks')}
                        value={`${fohTaskMetrics.openingRate}%`}
                        subtitle={t('dashboard.fohShiftCompletion', 'FOH shift completion')}
                        icon={Sunrise}
                        color="bg-blue-50 text-blue-500"
                        progress={fohTaskMetrics.openingRate}
                        onClick={handleNavigate('/foh')}
                      />
                    );
                  } else if (i === 2) {
                    // Third FOH card - Transition Tasks
                    cards.push(
                      <StatCard
                        key="foh-tasks-transition"
                        title={t('dashboard.transitionTasks', 'Transition Tasks')}
                        value={`${fohTaskMetrics.transitionRate}%`}
                        subtitle={t('dashboard.midDayShift', 'Mid-day shift')}
                        icon={Sun}
                        color="bg-amber-50 text-amber-500"
                        progress={fohTaskMetrics.transitionRate}
                        onClick={handleNavigate('/foh')}
                      />
                    );
                  } else {
                    // Fourth FOH card - Closing Tasks
                    cards.push(
                      <StatCard
                        key="foh-tasks-closing"
                        title={t('dashboard.closingTasks', 'Closing Tasks')}
                        value={`${fohTaskMetrics.closingRate}%`}
                        subtitle={t('dashboard.eveningShift', 'Evening shift')}
                        icon={Sunset}
                        color="bg-indigo-50 text-indigo-500"
                        progress={fohTaskMetrics.closingRate}
                        onClick={handleNavigate('/foh')}
                      />
                    );
                  }
                } else if (feature === 'evaluations') {
                  if (i === 0) {
                    // Primary Evaluations card
                    cards.push(
                      <StatCard
                        key="evaluations-main"
                        title={t('dashboard.evaluations', 'Evaluations')}
                        value={upcomingEvaluations.length}
                        subtitle={t('dashboard.upcomingEvaluations', 'Upcoming evaluations')}
                        icon={ClipboardList}
                        color="bg-purple-100 text-purple-600"
                        onClick={handleNavigate('/evaluations')}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary Evaluations card - Due Soon
                    const dueSoonCount = upcomingEvaluations.filter(evaluation => {
                      const evalDate = new Date(evaluation.scheduledDate);
                      const today = new Date();
                      const diffTime = evalDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 2;
                    }).length;

                    cards.push(
                      <StatCard
                        key="evaluations-due-soon"
                        title={t('dashboard.dueSoon', 'Due Soon')}
                        value={dueSoonCount}
                        subtitle={t('dashboard.evaluationsDueSoon', 'Evaluations due within 2 days')}
                        icon={Clock}
                        color="bg-amber-100 text-amber-600"
                        onClick={handleNavigate('/evaluations')}
                      />
                    );
                  } else {
                    // Third Evaluations card - Performance
                    cards.push(
                      <StatCard
                        key="evaluations-performance"
                        title={t('dashboard.performance', 'Performance')}
                        value={`${performanceMetrics.averageScore}%`}
                        subtitle={t('dashboard.averageScore', 'Average evaluation score')}
                        icon={TrendingUp}
                        color="bg-green-100 text-green-600"
                        onClick={handleNavigate('/analytics/evaluation-trends')}
                      />
                    );
                  }
                } else if (feature === 'kitchen') {
                  if (i === 0) {
                    // Primary Kitchen card - Equipment
                    cards.push(
                      <StatCard
                        key="kitchen-equipment"
                        title={t('dashboard.kitchenEquipment', 'Kitchen Equipment')}
                        value={`${kitchenStats.equipment.operational}/${kitchenStats.equipment.totalEquipment}`}
                        subtitle={`${kitchenStats.equipment.needsMaintenance} need maintenance`}
                        icon={Wrench}
                        color={kitchenStats.equipment.needsRepair > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
                        progress={kitchenStats.equipment.totalEquipment > 0 ? (kitchenStats.equipment.operational / kitchenStats.equipment.totalEquipment) * 100 : 0}
                        onClick={handleNavigate('/kitchen/equipment')}
                        alert={kitchenStats.equipment.needsRepair > 0 ? {
                          count: kitchenStats.equipment.needsRepair,
                          text: `${kitchenStats.equipment.needsRepair} ${kitchenStats.equipment.needsRepair === 1 ? 'item is' : 'items are'} broken`,
                          color: "bg-red-100 text-red-700"
                        } : undefined}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary Kitchen card - Food Safety
                    cards.push(
                      <StatCard
                        key="food-safety"
                        title={t('dashboard.foodSafety', 'Food Safety')}
                        value={`${kitchenStats.foodSafety.completedTempChecks}/${kitchenStats.foodSafety.totalTempChecks}`}
                        subtitle={`${kitchenStats.foodSafety.overdueTasks} overdue tasks`}
                        icon={Thermometer}
                        color="bg-red-100 text-red-600"
                        progress={kitchenStats.foodSafety.totalTempChecks > 0 ? (kitchenStats.foodSafety.completedTempChecks / kitchenStats.foodSafety.totalTempChecks) * 100 : 0}
                        onClick={handleNavigate('/kitchen/food-safety')}
                        alert={kitchenStats.foodSafety.overdueTasks > 0 ? {
                          count: kitchenStats.foodSafety.overdueTasks,
                          text: "Tasks overdue",
                          color: "bg-amber-100 text-amber-700"
                        } : undefined}
                      />
                    );
                  } else {
                    // Third Kitchen card - Checklist
                    cards.push(
                      <StatCard
                        key="kitchen-checklist"
                        title={t('dashboard.kitchenChecklist', 'Kitchen Checklist')}
                        value={`${kitchenStats.checklists.completionRate}%`}
                        subtitle={`${kitchenStats.checklists.totalCompleted}/${kitchenStats.checklists.totalItems} completed`}
                        icon={ListChecks}
                        color="bg-amber-100 text-amber-600"
                        progress={kitchenStats.checklists.completionRate}
                        onClick={handleNavigate('/kitchen')}
                      />
                    );
                  }
                } else if (feature === 'documentation') {
                  if (i === 0) {
                    // Primary Documentation card
                    cards.push(
                      <StatCard
                        key="documentation-main"
                        title={t('dashboard.documentationsThisMonth', 'Documentations')}
                        value={totalDocumentationsThisMonth}
                        subtitle={`${totalDocumentationsThisWeek} this week`}
                        icon={FileText}
                        color="bg-orange-100 text-orange-600"
                        progress={totalDocumentationRecords > 0 ? (totalDocumentationsThisMonth / totalDocumentationRecords) * 100 : 0}
                        onClick={handleNavigate('/documentation/combined')}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary Documentation card - Disciplinary
                    const disciplinaryCount = recentIncidents.filter(incident =>
                      incident.source === 'disciplinary' ||
                      incident.type.toLowerCase().includes('warning') ||
                      incident.type.toLowerCase().includes('suspension') ||
                      incident.type.toLowerCase().includes('termination')
                    ).length;

                    cards.push(
                      <StatCard
                        key="documentation-disciplinary"
                        title={t('dashboard.disciplinary', 'Disciplinary')}
                        value={disciplinaryCount}
                        subtitle={t('dashboard.recentIncidents', 'Recent incidents')}
                        icon={AlertCircle}
                        color="bg-red-100 text-red-600"
                        onClick={handleNavigate('/disciplinary')}
                      />
                    );
                  } else {
                    // Third Documentation card - Administrative
                    const adminCount = recentIncidents.filter(incident =>
                      (incident.source === 'documentation' &&
                      !incident.type.toLowerCase().includes('warning') &&
                      !incident.type.toLowerCase().includes('suspension') &&
                      !incident.type.toLowerCase().includes('termination')) ||
                      incident.type.toLowerCase().includes('call out') ||
                      incident.type.toLowerCase().includes('doctor') ||
                      incident.type.toLowerCase().includes('note')
                    ).length;

                    cards.push(
                      <StatCard
                        key="documentation-admin"
                        title={t('dashboard.administrative', 'Administrative')}
                        value={adminCount}
                        subtitle={t('dashboard.recentDocuments', 'Recent documents')}
                        icon={FileText}
                        color="bg-blue-100 text-blue-600"
                        onClick={handleNavigate('/documentation/combined')}
                      />
                    );
                  }
                } else if (feature === 'training') {
                  if (i === 0) {
                    // Primary Training card
                    cards.push(
                      <StatCard
                        key="training-main"
                        title={t('dashboard.training', 'Training')}
                        value={trainingStats.inProgress}
                        subtitle={t('dashboard.employeesInTraining', 'Employees in training')}
                        icon={Award}
                        color="bg-green-100 text-green-600"
                        onClick={handleNavigate('/training')}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary Training card - Completion
                    cards.push(
                      <StatCard
                        key="training-completion"
                        title={t('dashboard.trainingCompletion', 'Training Completion')}
                        value={`${trainingStats.completionRate}%`}
                        subtitle={t('dashboard.overallCompletion', 'Overall completion rate')}
                        icon={Award}
                        color="bg-emerald-100 text-emerald-600"
                        progress={trainingStats.completionRate}
                        onClick={handleNavigate('/training')}
                      />
                    );
                  } else {
                    // Third Training card - New Hires
                    cards.push(
                      <StatCard
                        key="training-new-hires"
                        title={t('dashboard.newHires', 'New Hires')}
                        value={trainingStats.newHires}
                        subtitle={t('dashboard.last30Days', 'Last 30 days')}
                        icon={Users}
                        color="bg-blue-100 text-blue-600"
                        onClick={handleNavigate('/training')}
                      />
                    );
                  }
                } else if (feature === 'leadership') {
                  if (i === 0) {
                    // Primary Leadership card
                    cards.push(
                      <StatCard
                        key="leadership-main"
                        title={t('dashboard.leadership', 'Leadership')}
                        value={leadershipStats.plans.inProgress}
                        subtitle={t('dashboard.activePlans', 'Active plans')}
                        icon={Target}
                        color="bg-indigo-100 text-indigo-600"
                        onClick={handleNavigate('/leadership')}
                      />
                    );
                  } else if (i === 1) {
                    // Secondary Leadership card - Progress
                    cards.push(
                      <StatCard
                        key="leadership-progress"
                        title={t('dashboard.leadershipProgress', 'Leadership Progress')}
                        value={`${leadershipStats.plans.overallProgress}%`}
                        subtitle={t('dashboard.overallProgress', 'Overall progress')}
                        icon={Target}
                        color="bg-violet-100 text-violet-600"
                        progress={leadershipStats.plans.overallProgress}
                        onClick={handleNavigate('/leadership')}
                      />
                    );
                  } else {
                    // Third Leadership card - Tasks
                    cards.push(
                      <StatCard
                        key="leadership-tasks"
                        title={t('dashboard.leadershipTasks', 'Leadership Tasks')}
                        value={leadershipStats.tasks.pending}
                        subtitle={t('dashboard.pendingTasks', 'Pending tasks')}
                        icon={ClipboardList}
                        color="bg-purple-100 text-purple-600"
                        onClick={handleNavigate('/leadership')}
                      />
                    );
                  }
                }
              }
            });

            // Return exactly 4 cards
            return cards.slice(0, 4);
          })()}
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Determine which detail cards to show based on enabled features */}
          {renderDetailCards()}
        </div>
      </div>
    </div>
  );
}
