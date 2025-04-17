import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/axios';
import {
  TrendingUp,
  Award,
  Calendar,
  Star,
  BookOpen,
  BadgeCheck,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Clock,
  Zap,
  BarChart3,
  Target,
  Sparkles,
  Users,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Progress } from '@/components/ui/progress';

interface TeamMemberDashboardData {
  name: string;
  position: string;
  departments: string[];
  currentPerformance: number | null;
  nextEvaluation: {
    date: string | null;
    templateName: string;
    status: string;
    evaluator: string | null;
    id: string | null;
    acknowledged?: boolean;
    lastEvaluationDate?: string | null;
  };
  activeGoals: number;
  goals: Array<{
    id: string;
    name: string;
    progress: number;
    targetDate: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    date: string;
    type?: 'award' | 'milestone' | 'other';
  }>;
  training: {
    required: Array<{
      id: string;
      name: string;
      progress: number;
      dueDate: string;
    }>;
    completed: Array<{
      id: string;
      name: string;
      completedAt: string;
      type: string;
    }>;
  };
  schedule: Array<{
    id: string;
    name: string;
    date: string;
    type: string;
  }>;
}

export default function TeamMemberDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<TeamMemberDashboardData>({
    queryKey: ['teamMemberDashboard'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/team-member');
      return response.data;
    },
  });

  const [dashboardData, setDashboardData] = useState<TeamMemberDashboardData>({
    name: data?.name || 'Team Member',
    position: data?.position || 'Position',
    departments: data?.departments || [],
    currentPerformance: data?.currentPerformance || 0,
    nextEvaluation: data?.nextEvaluation || {
      date: null,
      templateName: '',
      status: '',
      evaluator: null,
      id: null
    },
    activeGoals: data?.activeGoals || 0,
    goals: data?.goals || [],
    training: {
      required: data?.training?.required || [],
      completed: data?.training?.completed || []
    },
    achievements: data?.achievements || [],
    schedule: data?.schedule || []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard and training data...');
        const [dashboardResponse, trainingResponse] = await Promise.all([
          api.get('/api/dashboard/team-member'),
          api.get('/api/training/progress')
        ]);

        console.log('Dashboard response:', dashboardResponse.data);
        console.log('Training response:', trainingResponse.data);

        const dashboardData = dashboardResponse.data;
        const trainingData = trainingResponse.data;

        // Transform training data for dashboard
        const activeTraining = trainingData
          .filter(progress => progress.status === 'IN_PROGRESS')
          .map(progress => ({
            id: progress._id,
            name: progress.trainingPlan.name,
            type: progress.trainingPlan.type,
            completedModules: progress.moduleProgress.filter(mp => mp.completed).length,
            totalModules: progress.trainingPlan.modules.length,
            progress: Math.round((progress.moduleProgress.filter(mp => mp.completed).length /
                     progress.trainingPlan.modules.length) * 100)
          }));

        console.log('Transformed active training:', activeTraining);

        const completedTraining = trainingData
          .filter(progress => progress.status === 'COMPLETED')
          .map(progress => ({
            id: progress._id,
            name: progress.trainingPlan.name,
            type: progress.trainingPlan.type,
            completedAt: progress.completedAt
          }))
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 3);

        console.log('Transformed completed training:', completedTraining);

        setDashboardData(prev => ({
          ...dashboardData,
          training: {
            required: activeTraining,
            completed: completedTraining
          }
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header with Gradient Background */}
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {t('dashboard.welcomeBack', 'Welcome back, {{name}}!', { name: dashboardData.name })}
                </h1>
                <p className="text-white/80 mt-2 text-lg">
                  {`${dashboardData.position} • ${dashboardData.departments.join(', ')}`}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/users/${user?._id}`)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-300 w-full md:w-auto"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t('dashboard.viewFullProfile', 'View Full Profile')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Card */}
          <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#27251F] group-hover:text-[#E51636] transition-colors">
                  {t('dashboard.currentPerformance', 'Current Performance')}
                </CardTitle>
                <div className="h-10 w-10 bg-[#E51636]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5 text-[#E51636]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#27251F]">{dashboardData.currentPerformance}%</span>
                  <span className="text-sm text-green-600 font-medium pb-1 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> +5%
                  </span>
                </div>
                <p className="text-[#27251F]/60 text-sm mt-1">Based on your last evaluation</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#27251F]/60">Progress</span>
                    <span className="font-medium text-[#27251F]">{dashboardData.currentPerformance}%</span>
                  </div>
                  <Progress
                    value={dashboardData.currentPerformance || 0}
                    className="h-2 bg-[#E51636]/10 [&>div]:bg-[#E51636]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Evaluation Card */}
          <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100/50 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#27251F] group-hover:text-blue-600 transition-colors">
                  {t('dashboard.nextEvaluation', 'Next Evaluation')}
                </CardTitle>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              {dashboardData.nextEvaluation.date ? (
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-[#27251F]">
                      {new Date(dashboardData.nextEvaluation.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-blue-600 font-medium pb-1 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t('dashboard.daysAway', '{{days}} days', {
                        days: Math.ceil((new Date(dashboardData.nextEvaluation.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      })}
                    </span>
                  </div>

                  {dashboardData.nextEvaluation.lastEvaluationDate && (
                    <p className="text-[#27251F]/60 text-sm mt-1">
                      {t('dashboard.lastEvaluation', 'Last evaluation: {{date}}', {
                        date: new Date(dashboardData.nextEvaluation.lastEvaluationDate).toLocaleDateString()
                      })}
                    </p>
                  )}

                  <div className="mt-4">
                    {dashboardData.nextEvaluation.status === 'pending_self_evaluation' && (
                      <Button
                        onClick={() => navigate(`/evaluations/${dashboardData.nextEvaluation.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 group-hover:translate-y-0 transition-all"
                      >
                        <Zap className="h-4 w-4" />
                        {t('dashboard.completeSelfEvaluation', 'Complete Self-Evaluation')}
                      </Button>
                    )}
                    {dashboardData.nextEvaluation.status === 'pending_manager_review' && (
                      <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl text-center text-sm font-medium">
                        {t('dashboard.pendingManagerReview', 'Pending Manager Review')}
                      </div>
                    )}
                    {dashboardData.nextEvaluation.status === 'completed' && !dashboardData.nextEvaluation.acknowledged && (
                      <Button
                        onClick={() => navigate(`/evaluations/${dashboardData.nextEvaluation.id}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        {t('dashboard.reviewAndAcknowledge', 'Review & Acknowledge')}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#27251F]">
                      {t('dashboard.notScheduled', 'Not Scheduled')}
                    </span>
                    <p className="text-[#27251F]/60 text-sm mt-1">
                      {t('dashboard.noUpcomingEvaluation', 'No upcoming evaluation')}
                    </p>

                    {dashboardData.nextEvaluation.lastEvaluationDate && (
                      <p className="text-[#27251F]/60 text-sm mt-3">
                        {t('dashboard.lastEvaluation', 'Last evaluation: {{date}}', {
                          date: new Date(dashboardData.nextEvaluation.lastEvaluationDate).toLocaleDateString()
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Goals Card */}
          <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-br from-green-50 to-green-100/50 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#27251F] group-hover:text-green-600 transition-colors">
                  {t('dashboard.activeGoals', 'Active Goals')}
                </CardTitle>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#27251F]">{dashboardData.activeGoals}</span>
                  <span className="text-sm text-[#27251F]/60 font-medium pb-1">
                    {t('dashboard.goalsInProgress', 'goals in progress')}
                  </span>
                </div>

                {dashboardData.goals.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#27251F]">{dashboardData.goals[0].name}</span>
                      <span className="text-green-600 font-medium">{dashboardData.goals[0].progress}%</span>
                    </div>
                    <Progress
                      value={dashboardData.goals[0].progress || 0}
                      className="h-2 mt-2 bg-green-100 [&>div]:bg-green-600"
                    />
                  </div>
                )}


              </div>
            </CardContent>
          </Card>
        </div>

        {/* FOH Task Completion and Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FOH Task Completion */}
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
                  variant="outline"
                  size="sm"
                  className="transition-colors duration-300 group-hover:text-blue-600"
                  onClick={() => navigate('/foh')}
                >
                  {t('dashboard.viewAll', 'View All')}
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                {/* Opening Tasks */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#27251F]">Opening Tasks</span>
                    <span className="text-[#27251F]/60">100%</span>
                  </div>
                  <Progress value={100} className="h-2 bg-blue-100 [&>div]:bg-blue-600" />
                </div>

                {/* Transition Tasks */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#27251F]">Transition Tasks</span>
                    <span className="text-[#27251F]/60">0%</span>
                  </div>
                  <Progress value={0} className="h-2 bg-gray-100 [&>div]:bg-blue-600" />
                </div>

                {/* Closing Tasks */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#27251F]">Closing Tasks</span>
                    <span className="text-[#27251F]/60">0%</span>
                  </div>
                  <Progress value={0} className="h-2 bg-gray-100 [&>div]:bg-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Goals */}
          <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-[#27251F]">{t('dashboard.storeGoals', 'Store Goals')}</CardTitle>
                  <CardDescription className="text-[#27251F]/60 mt-1">{t('dashboard.storeTargets', 'Our team performance targets')}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/goals')}
                  className="text-[#E51636] border-[#E51636]/30 hover:bg-[#E51636]/5 text-sm"
                >
                  {t('dashboard.viewAll', 'View All')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {dashboardData.goals.length === 0 ? (
                  <div className="py-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#27251F]/60">{t('dashboard.noStoreGoals', 'No store goals currently set')}</p>
                    <Button
                      variant="outline"
                      className="mt-4 text-sm"
                      onClick={() => navigate('/goals')}
                    >
                      {t('dashboard.viewMetrics', 'View Store Metrics')}
                    </Button>
                  </div>
                ) : (
                  dashboardData.goals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-[#F8F8F8] rounded-xl hover:bg-[#F4F4F4] transition-colors border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {/* Category tag based on goal type */}
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              goal.name.toLowerCase().includes('drive') ? 'bg-blue-100 text-blue-700' :
                              goal.name.toLowerCase().includes('sales') ? 'bg-green-100 text-green-700' :
                              goal.name.toLowerCase().includes('customer') ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.name.toLowerCase().includes('drive') ? 'Drive-thru' :
                               goal.name.toLowerCase().includes('sales') ? 'Sales' :
                               goal.name.toLowerCase().includes('customer') ? 'Customer Service' :
                               'Operations'}
                            </span>
                          </div>
                          <h3 className="font-medium text-[#27251F]">{goal.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-[#27251F]/60">{t('dashboard.target', 'Target: {{date}}', { date: new Date(goal.targetDate).toLocaleDateString() })}</p>
                            {/* Add baseline info if available */}
                            {goal.baseline && (
                              <p className="text-xs text-[#27251F]/60">Baseline: {goal.baseline}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className="h-2 mt-2 bg-green-100 [&>div]:bg-green-600"
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Training */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Progress */}
            <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#27251F]">{t('dashboard.trainingProgress', 'Training Progress')}</CardTitle>
                    <CardDescription className="text-[#27251F]/60 mt-1">{t('dashboard.yourAssignedTrainingPlans', 'Your assigned training plans')}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/training')}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-sm"
                  >
                    {t('dashboard.viewAll', 'View All')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Active Training Plans */}
                <div className="space-y-6">
                  {dashboardData.training.required.length === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-[#27251F]/60">{t('dashboard.noActiveTrainingPlans', 'No active training plans')}</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-sm"
                        onClick={() => navigate('/training')}
                      >
                        {t('dashboard.exploreTraining', 'Explore Training')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookOpen className="h-3 w-3 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-[#27251F]">{t('dashboard.activeTraining', 'Active Training')}</h3>
                        </div>

                        {dashboardData.training.required.map((training) => (
                          <div
                            key={training.id}
                            className="p-4 bg-[#F8F8F8] rounded-xl hover:bg-[#F4F4F4] transition-colors cursor-pointer border border-gray-100 group"
                            onClick={() => navigate(`/training/progress/${training.id}`)}
                          >
                            <div className="flex justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-[#27251F] group-hover:text-blue-600 transition-colors">{training.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-[#27251F]/60">
                                    {t('dashboard.tasksCompleted', '{{completed}} of {{total}} tasks completed', { completed: training.completedModules, total: training.totalModules })}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                    {training.type}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-blue-600">{training.progress}%</span>
                            </div>
                            <Progress
                              value={training.progress}
                              className="h-2 mt-2 bg-blue-100 [&>div]:bg-blue-600"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Recently Completed Training */}
                      {dashboardData.training.completed.length > 0 && (
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <BadgeCheck className="h-3 w-3 text-green-600" />
                            </div>
                            <h3 className="font-medium text-[#27251F]">{t('dashboard.recentlyCompleted', 'Recently Completed')}</h3>
                          </div>

                          {dashboardData.training.completed.slice(0, 3).map((training) => (
                            <div
                              key={training.id}
                              className="p-4 bg-[#F8F8F8] rounded-xl hover:bg-[#F4F4F4] transition-colors cursor-pointer border border-gray-100 group"
                              onClick={() => navigate(`/training/progress/${training.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-[#27251F] group-hover:text-green-600 transition-colors">{training.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-[#27251F]/60">
                                      {t('dashboard.completedOn', 'Completed {{date}}', { date: new Date(training.completedAt).toLocaleDateString() })}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                      {training.type}
                                    </span>
                                  </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <BadgeCheck className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Achievements and Schedule */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#27251F]">{t('dashboard.recentAchievements', 'Recent Achievements')}</CardTitle>
                    <CardDescription className="text-[#27251F]/60 mt-1">{t('dashboard.yourLatestAccomplishments', 'Your latest accomplishments')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {dashboardData.achievements.length === 0 ? (
                    <div className="py-8 text-center">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-[#27251F]/60">{t('dashboard.noRecentAchievements', 'No recent achievements')}</p>
                    </div>
                  ) : (
                    dashboardData.achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 bg-[#F8F8F8] rounded-xl hover:bg-[#F4F4F4] transition-colors border border-gray-100 group">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                            achievement.type === 'award' ? 'bg-amber-100' :
                            achievement.type === 'milestone' ? 'bg-purple-100' :
                            'bg-[#E51636]/10'
                          }`}>
                            <span className={`text-lg font-bold ${
                              achievement.type === 'award' ? 'text-amber-600' :
                              achievement.type === 'milestone' ? 'text-purple-600' :
                              'text-[#E51636]'
                            }`}>
                              {achievement.type === 'award' ? '🏆' : achievement.type === 'milestone' ? '⭐' : '📜'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-[#27251F] group-hover:text-[#E51636] transition-colors">{achievement.title}</h3>
                            <p className="text-sm text-[#27251F]/60">{achievement.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Quick Access Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: CheckSquare, label: t('navigation.fohChecklist', 'FOH Checklist'), description: t('dashboard.dailyTasks', 'Daily tasks'), path: '/foh', color: 'text-blue-600 bg-blue-100' },
            { icon: FileText, label: t('navigation.myEvaluations'), description: t('dashboard.viewEvaluationHistory', 'Evaluation history'), path: '/evaluations', color: 'text-[#E51636] bg-[#E51636]/10' },

            { icon: BookOpen, label: t('navigation.training'), description: t('dashboard.viewRequiredTraining', 'Required training'), path: '/training', color: 'text-green-600 bg-green-100' },
          ].map((link, index) => {
            const Icon = link.icon;
            return (
              <Card key={index} className="bg-white rounded-[20px] overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Link to={link.path} className="p-5 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`h-12 w-12 rounded-full ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#27251F] group-hover:text-[#E51636] transition-colors">{link.label}</h3>
                      <p className="text-sm text-[#27251F]/60">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#27251F]/40 group-hover:text-[#E51636] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Footer Space */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}