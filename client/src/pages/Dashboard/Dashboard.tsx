// client/src/pages/Dashboard.tsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
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
  Thermometer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
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

  // Check for mobile app - we want to ensure consistent buttons on all platforms
  const isMobileApp = location.search.includes('mobile=true') || window.navigator.userAgent.includes('CFA-Eval-App');

  // Use our custom hooks for all dashboard data and calculations
  const {
    stats,
    chartData,
    upcomingEvaluations,
    recentIncidents,
    totalDocumentationRecords,
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

  // Log the recent incidents data for debugging
  console.log('Recent incidents data:', recentIncidents);

  // Add a useEffect to log when the data changes
  useEffect(() => {
    console.log('Recent incidents updated:', recentIncidents);
  }, [recentIncidents]);

  // Show Team Member dashboard for Team Members and Trainers
  if (user?.position === 'Team Member' || user?.position === 'Trainer') {
    return <TeamMemberDashboard />;
  }

  // Memoize navigation handlers
  const handleNavigate = useCallback((path: string) => () => navigate(path), [navigate]);

  if (isLoading || kitchenStatsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title={t('dashboard.fohTasks', 'FOH Tasks')}
            value={`${fohTaskMetrics.completionRate}%`}
            subtitle={`${fohTaskMetrics.completedToday}/${fohTaskMetrics.totalTasks} completed today`}
            icon={CheckSquare}
            color="bg-blue-100 text-blue-600"
            progress={fohTaskMetrics.completionRate}
            onClick={handleNavigate('/foh')}
          />
          <StatCard
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
          <StatCard
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
          <StatCard
            title={t('dashboard.openIncidents')}
            value={typedStats?.openDisciplinaryIncidents || 0}
            subtitle={`${typedStats?.resolvedDisciplinaryThisMonth || 0} resolved this month`}
            icon={AlertCircle}
            color="bg-orange-100 text-orange-600"
            progress={typedStats?.resolvedDisciplinaryThisMonth ? (typedStats.resolvedDisciplinaryThisMonth / (typedStats.resolvedDisciplinaryThisMonth + (typedStats?.openDisciplinaryIncidents || 0))) * 100 : 0}
            onClick={handleNavigate('/disciplinary')}
          />
        </div>

        {/* Charts and Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="bg-white rounded-[20px] lg:col-span-2 hover:shadow-xl transition-all duration-300 group">
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

          {/* Quick Actions - Desktop only */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 hidden lg:block">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F]">{t('dashboard.quickActions')}</CardTitle>
                <p className="text-[#27251F]/60 mt-1 text-sm">Frequently used actions</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: t('dashboard.scheduleEvaluation'), path: '/evaluations/new', color: 'from-[#E51636] to-[#DD0031]' },
                  { icon: Users, label: t('dashboard.viewTeam'), path: '/users', color: 'from-[#4F46E5] to-[#4338CA]' },
                  { icon: AlertCircle, label: t('dashboard.newIncident'), path: '/disciplinary/new', color: 'from-[#F97316] to-[#EA580C]' },
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={handleNavigate(action.path)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md group/action active:scale-[0.98]"
                    >
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${action.color} text-white flex items-center justify-center transition-transform duration-300 group-hover/action:scale-110 mb-3 shadow-sm relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm text-center text-[#27251F] transition-colors duration-300 group-hover/action:text-[#E51636]">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FOH Tasks Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-blue-600 transition-colors duration-300">
                  {t('dashboard.fohTasksDetail', 'FOH Task Completion')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.todaysTasks', 'Today\'s task completion status')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigate('/foh')}
                  className="transition-colors duration-300 group-hover:text-blue-600"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {fohTasksLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">Refreshing task data...</span>
                  <p className="text-xs text-gray-400 max-w-xs text-center">
                    If you've just completed a task, it will appear here momentarily.
                  </p>
                </div>
              ) : (
              <div className="space-y-4">
                {/* Shift Type Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Opening Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{fohTaskMetrics.openingRate}%</p>
                    </div>
                    <Progress value={fohTaskMetrics.openingRate} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Transition Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{fohTaskMetrics.transitionRate}%</p>
                    </div>
                    <Progress value={fohTaskMetrics.transitionRate} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Closing Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{fohTaskMetrics.closingRate}%</p>
                    </div>
                    <Progress value={fohTaskMetrics.closingRate} className="h-2 bg-gray-100" indicatorClassName="bg-indigo-500" />
                  </div>
                </div>

                {/* Recent Completions */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[#27251F] mb-3">Recent Completions</h4>
                  <div className="space-y-2">
                    {fohTaskMetrics.recentCompletions.slice(0, 3).map((completion, index) => (
                      <div key={index} className="p-3 bg-[#F4F4F4] rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-[#27251F]">{completion.taskName}</p>
                          <p className="text-xs text-[#27251F]/60 mt-0.5">Completed by {completion.completedBy}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            completion.shiftType === 'opening' ? 'bg-blue-100 text-blue-700' :
                            completion.shiftType === 'transition' ? 'bg-amber-100 text-amber-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {completion.shiftType}
                          </span>
                        </div>
                      </div>
                    ))}

                    {fohTaskMetrics.recentCompletions.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-[#27251F]/60 text-sm">No tasks completed today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluations Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="bg-gradient-to-r from-[#E51636]/5 to-transparent border-b border-[#E51636]/10">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-[#E51636]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-[#E51636] transition-colors duration-300">
                      {t('dashboard.upcomingEvaluations')}
                    </CardTitle>
                    <p className="text-[#27251F]/60 mt-1">{t('dashboard.next7Days')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigate('/evaluations')}
                  className="transition-colors duration-300 group-hover:text-[#E51636] hover:bg-[#E51636]/5"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardHeader>
            </div>
            <CardContent className="p-8 pt-6">
              <div className="space-y-3">
                {upcomingEvaluations.map((evaluation: Evaluation) => {
                  // Calculate days until evaluation
                  const today = new Date();
                  const evalDate = new Date(evaluation.scheduledDate);
                  const diffTime = evalDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  // Format date in a more readable way
                  const formattedDate = evalDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={evaluation._id}
                      className="p-4 bg-[#F4F4F4] rounded-xl hover:bg-white transition-all duration-300 hover:shadow-md cursor-pointer group/item border-l-4 border-transparent hover:border-[#E51636]"
                      onClick={handleNavigate(`/evaluations/${evaluation._id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/5 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 shadow-sm">
                            <Users className="h-5 w-5 text-[#E51636]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#27251F] transition-colors duration-300 group-hover/item:text-[#E51636]">
                                {evaluation.employee?.name || evaluation.employeeName || 'Unknown'}
                              </p>
                              {diffDays <= 2 && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                  Soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#27251F]/60 mt-1 flex items-center gap-1">
                              <ClipboardList className="h-3.5 w-3.5 inline mr-0.5" />
                              {evaluation.template?.name || evaluation.templateName || 'General Evaluation'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-sm font-medium text-[#27251F] bg-white/80 px-2 py-1 rounded-lg shadow-sm">
                            {formattedDate}
                          </p>
                          <p className="text-xs text-[#27251F]/60 mt-1">
                            {diffDays === 0 ? 'Today' :
                             diffDays === 1 ? 'Tomorrow' :
                             `In ${diffDays} days`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!upcomingEvaluations.length && (
                  <div className="text-center py-10 mt-4 bg-[#F9F9F9] rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#E51636]/5 flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="h-6 w-6 text-[#E51636]/60" />
                    </div>
                    <p className="text-[#27251F]/60 font-medium text-lg">{t('dashboard.noUpcomingEvaluations')}</p>
                    <p className="text-[#27251F]/40 text-sm mt-2">All evaluations are up to date</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-5 border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/5"
                      onClick={handleNavigate('/evaluations/new')}
                    >
                      Schedule New Evaluation
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kitchen Checklist Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-amber-600 transition-colors duration-300">
                  {t('dashboard.kitchenTasksDetail', 'Kitchen Task Completion')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.kitchenTasksDescription', 'Kitchen checklist completion status')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigate('/kitchen')}
                  className="transition-colors duration-300 group-hover:text-amber-600"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4">
                {/* Shift Type Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Opening Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{kitchenStats.checklists.opening.completionRate}%</p>
                    </div>
                    <Progress value={kitchenStats.checklists.opening.completionRate} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Transition Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{kitchenStats.checklists.transition.completionRate}%</p>
                    </div>
                    <Progress value={kitchenStats.checklists.transition.completionRate} className="h-2 bg-gray-100" indicatorClassName="bg-orange-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-[#27251F]">Closing Tasks</p>
                      <p className="text-sm text-[#27251F]/60">{kitchenStats.checklists.closing.completionRate}%</p>
                    </div>
                    <Progress value={kitchenStats.checklists.closing.completionRate} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Completed vs Total</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.checklists.totalCompleted}/{kitchenStats.checklists.totalItems}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Overdue Tasks</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.checklists.overdueItems}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Status Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-green-600 transition-colors duration-300">
                  {t('dashboard.equipmentStatus', 'Equipment Status')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.equipmentStatusDescription', 'Kitchen equipment operational status')}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigate('/kitchen/equipment')}
                className="transition-colors duration-300 group-hover:text-green-600"
              >
                {t('dashboard.viewAll')}
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4">
                {/* Equipment Status Overview */}
                <div className="flex items-center justify-between p-4 bg-[#F4F4F4] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#27251F]">Operational Equipment</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {kitchenStats.equipment.operational}/{kitchenStats.equipment.totalEquipment}
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                {/* Issues Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Needs Maintenance</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.equipment.needsMaintenance}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Needs Repair</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.equipment.needsRepair}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Maintenance Due Soon</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.equipment.maintenanceDueSoon}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Temperature Alerts</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.equipment.temperatureAlerts}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Safety Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-red-600 transition-colors duration-300">
                  {t('dashboard.foodSafety', 'Food Safety')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">{t('dashboard.foodSafetyDescription', 'Temperature checks and critical tasks')}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigate('/kitchen/food-safety')}
                className="transition-colors duration-300 group-hover:text-red-600"
              >
                {t('dashboard.viewAll')}
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4">
                {/* Temperature Checks Overview */}
                <div className="flex items-center justify-between p-4 bg-[#F4F4F4] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#27251F]">Temperature Checks</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {kitchenStats.foodSafety.completedTempChecks}/{kitchenStats.foodSafety.totalTempChecks}
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <Thermometer className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                {/* Food Safety Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Checklist Completion</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.foodSafety.completedChecklists}/{kitchenStats.foodSafety.totalChecklists}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Overdue Tasks</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.foodSafety.overdueTasks}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Critical Tasks</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.foodSafety.criticalTasks}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Completion Rate</p>
                    <p className="font-medium text-[#27251F]">
                      {kitchenStats.foodSafety.totalChecklists > 0 ?
                        Math.round((kitchenStats.foodSafety.completedChecklists / kitchenStats.foodSafety.totalChecklists) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incidents Section */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl font-bold text-[#27251F] group-hover:text-[#E51636] transition-colors duration-300">
                  {t('dashboard.recentDocumentation', 'Recent Documentation')}
                </CardTitle>
                <p className="text-[#27251F]/60 mt-1">
                  {t('dashboard.last30Days', 'Last 30 days')} •
                  {t('dashboard.showingRecords', 'Showing {{shown}} of {{total}} records', {
                    shown: recentIncidents.length,
                    total: totalDocumentationRecords
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigate('/documentation/combined')}
                className="transition-colors duration-300 group-hover:text-[#E51636]"
              >
                {t('dashboard.viewAll')}
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-3">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Total Documents</p>
                    <p className="font-medium text-[#27251F]">
                      {recentIncidents.length}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Disciplinary</p>
                    <p className="font-medium text-[#27251F]">
                      {recentIncidents.filter(incident =>
                        incident.source === 'disciplinary' ||
                        incident.type.toLowerCase().includes('warning') ||
                        incident.type.toLowerCase().includes('suspension') ||
                        incident.type.toLowerCase().includes('termination')
                      ).length}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-[#27251F]/60 mb-1">Administrative</p>
                    <p className="font-medium text-[#27251F]">
                      {recentIncidents.filter(incident =>
                        (incident.source === 'documentation' && !incident.type.toLowerCase().includes('warning') &&
                        !incident.type.toLowerCase().includes('suspension') &&
                        !incident.type.toLowerCase().includes('termination')) ||
                        incident.type.toLowerCase().includes('call out') ||
                        incident.type.toLowerCase().includes('doctor') ||
                        incident.type.toLowerCase().includes('note') ||
                        incident.type.toLowerCase().includes('other')
                      ).length}
                    </p>
                  </div>
                </div>

                {/* Documentation List */}
                {recentIncidents.map((incident: Incident) => {
                  // Determine document type and color
                  let docTypeColor = 'bg-blue-100 text-blue-600';
                  let docIcon = <FileText className="h-5 w-5 text-[#E51636]" />;

                  // Check if it's a disciplinary document based on type or source
                  const isDisciplinary =
                    incident.source === 'disciplinary' ||
                    incident.type.toLowerCase().includes('warning') ||
                    incident.type.toLowerCase().includes('suspension') ||
                    incident.type.toLowerCase().includes('termination');

                  if (isDisciplinary) {
                    docTypeColor = 'bg-red-100 text-red-600';
                    docIcon = <AlertCircle className="h-5 w-5 text-[#E51636]" />;
                  } else if (incident.type.toLowerCase().includes('call out')) {
                    docTypeColor = 'bg-yellow-100 text-yellow-600';
                  } else if (incident.type.toLowerCase().includes('doctor')) {
                    docTypeColor = 'bg-green-100 text-green-600';
                  }

                  // Format date to be more readable
                  const incidentDate = new Date(incident.date);
                  const formattedDate = incidentDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  // Calculate days ago
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - incidentDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const daysText = diffDays === 0 ? 'Today' :
                                  diffDays === 1 ? 'Yesterday' :
                                  `${diffDays} days ago`;

                  return (
                    <div
                      key={incident.id}
                      className="p-4 bg-[#F4F4F4] rounded-xl hover:bg-white transition-all duration-300 hover:shadow-md cursor-pointer group/item border-l-4 border-transparent hover:border-[#E51636]"
                      onClick={handleNavigate(`/${incident.source === 'disciplinary' ? 'disciplinary' : 'documentation'}/${incident.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/5 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 shadow-sm">
                            {docIcon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#27251F] transition-colors duration-300 group-hover/item:text-[#E51636]">
                                {incident.name}
                              </p>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${docTypeColor}`}>
                                {incident.type}
                              </span>
                            </div>
                            <p className="text-sm text-[#27251F]/60 mt-1">
                              {isDisciplinary ? incident.severity : 'Administrative'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-sm font-medium text-[#27251F] bg-white/80 px-2 py-1 rounded-lg shadow-sm">
                            {formattedDate}
                          </p>
                          <p className="text-xs text-[#27251F]/60 mt-1">
                            {daysText}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!recentIncidents.length && (
                  <div className="text-center py-8 bg-[#F9F9F9] rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#E51636]/5 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-6 w-6 text-[#E51636]/60" />
                    </div>
                    <p className="text-[#27251F]/60 font-medium text-lg">{t('dashboard.noRecentDocumentation', 'No Recent Documentation')}</p>
                    <p className="text-[#27251F]/40 text-sm mt-2">No documentation or disciplinary records in the last 30 days</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
