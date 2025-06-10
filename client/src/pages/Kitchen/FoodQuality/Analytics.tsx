import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  Calendar,
  Award,
  AlertCircle,
  Zap,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { FoodQualityEvaluation, ProductType } from '@/types/kitchen';
import { cn } from "@/lib/utils";
import PageHeader from '@/components/PageHeader';

interface AnalyticsData {
  totalEvaluations: number;
  averageScore: number;
  passRate: number;
  failRate: number;
  warningRate: number;
  byProductType: Record<string, {
    count: number;
    averageScore: number;
    passRate: number;
  }>;
  dailyTrends: Array<{
    date: string;
    count: number;
    averageScore: number;
  }>;
}

const FoodQualityAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7');
  const [recentEvaluations, setRecentEvaluations] = useState<FoodQualityEvaluation[]>([]);

  const productTypeLabels: Record<string, string> = {
    sandwich_regular: 'Sandwich Regular',
    sandwich_spicy: 'Sandwich Spicy',
    nuggets_8: 'Nuggets 8-count',
    nuggets_12: 'Nuggets 12-count',
    strips_4: 'Strips 4-count',
    grilled_sandwich: 'Grilled Sandwich',
    grilled_nuggets_8: 'Grilled Nuggets 8-count',
    grilled_nuggets_12: 'Grilled Nuggets 12-count',
    fries_small: 'Fries Small',
    fries_medium: 'Fries Medium',
    fries_large: 'Fries Large'
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      
      const [analyticsData, evaluationsData] = await Promise.all([
        kitchenService.getFoodQualityAnalytics({ days }),
        kitchenService.getFoodQualityEvaluations({ days, limit: 20 })
      ]);
      
      setAnalytics(analyticsData);
      setRecentEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      enqueueSnackbar('Failed to load analytics data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pass</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fail</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopPerformingProducts = () => {
    if (!analytics?.byProductType) return [];
    
    return Object.entries(analytics.byProductType)
      .map(([productType, data]) => ({
        productType,
        ...data,
        label: productTypeLabels[productType] || productType
      }))
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 5);
  };

  const getWorstPerformingProducts = () => {
    if (!analytics?.byProductType) return [];
    
    return Object.entries(analytics.byProductType)
      .map(([productType, data]) => ({
        productType,
        ...data,
        label: productTypeLabels[productType] || productType
      }))
      .sort((a, b) => a.passRate - b.passRate)
      .slice(0, 5);
  };

  const getInsights = () => {
    if (!analytics) return [];
    
    const insights = [];
    
    if (analytics.passRate >= 90) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Excellent Quality Performance',
        description: `${analytics.passRate.toFixed(1)}% pass rate - Keep up the great work!`
      });
    } else if (analytics.passRate < 70) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Quality Needs Attention',
        description: `${analytics.passRate.toFixed(1)}% pass rate - Consider reviewing procedures`
      });
    }
    
    if (analytics.totalEvaluations < 10) {
      insights.push({
        type: 'info',
        icon: Activity,
        title: 'Increase Testing Frequency',
        description: 'More frequent evaluations provide better quality insights'
      });
    }
    
    const topProduct = getTopPerformingProducts()[0];
    if (topProduct) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Top Performer',
        description: `${topProduct.label} has ${topProduct.passRate.toFixed(1)}% pass rate`
      });
    }
    
    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Custom Analytics Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 -translate-x-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 translate-x-48"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-white/30 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative p-4 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30">
                  <BarChart3 className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  📈 Smart Analytics
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  AI-powered insights and performance metrics
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <span className="text-sm font-medium">Real-time Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Trend Analysis</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 shadow-2xl">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => navigate('/kitchen/food-quality')}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Quality
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Spectacular Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-2">Total Tests</p>
                      <p className="text-4xl font-black mb-1">{analytics.totalEvaluations}</p>
                      <p className="text-blue-200 text-xs">Evaluations Completed</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                      <BarChart3 className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-2">Pass Rate</p>
                      <p className="text-4xl font-black mb-1">{analytics.passRate.toFixed(1)}%</p>
                      <p className="text-green-200 text-xs">Quality Excellence</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium mb-2">Warning Rate</p>
                      <p className="text-4xl font-black mb-1">{analytics.warningRate.toFixed(1)}%</p>
                      <p className="text-yellow-200 text-xs">Needs Attention</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                      <AlertTriangle className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium mb-2">Fail Rate</p>
                      <p className="text-4xl font-black mb-1">{analytics.failRate.toFixed(1)}%</p>
                      <p className="text-red-200 text-xs">Critical Issues</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                      <XCircle className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-2">Avg Score</p>
                      <p className="text-4xl font-black mb-1">{analytics.averageScore.toFixed(1)}</p>
                      <p className="text-purple-200 text-xs">Out of 100</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                      <Target className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Insights */}
          {getInsights().length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quality Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getInsights().map((insight, index) => (
                    <Card key={index} className={cn(
                      "border-l-4",
                      insight.type === 'success' ? 'border-l-green-500 bg-green-50' :
                      insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            insight.type === 'success' ? 'bg-green-100' :
                            insight.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          )}>
                            <insight.icon className={cn(
                              "h-5 w-5",
                              insight.type === 'success' ? 'text-green-600' :
                              insight.type === 'warning' ? 'text-yellow-600' :
                              'text-blue-600'
                            )} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {insight.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTopPerformingProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getTopPerformingProducts().map((product, index) => (
                      <div key={product.productType} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.label}</h3>
                            <p className="text-sm text-gray-600">{product.count} evaluations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{product.passRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">pass rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Needs Improvement */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getWorstPerformingProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getWorstPerformingProducts().map((product, index) => (
                      <div key={product.productType} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.label}</h3>
                            <p className="text-sm text-gray-600">{product.count} evaluations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{product.passRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">pass rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentEvaluations.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-gray-100">
                    {recentEvaluations.map((evaluation) => (
                      <div key={evaluation._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              evaluation.overallStatus === 'pass' ? 'bg-green-100' :
                              evaluation.overallStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                            )}>
                              {getStatusIcon(evaluation.overallStatus)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {productTypeLabels[evaluation.productType] || evaluation.productType}
                                </h3>
                                {getStatusBadge(evaluation.overallStatus)}
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{formatDate(evaluation.createdAt)}</span>
                                <span>By: {typeof evaluation.evaluatedBy === 'string' ? evaluation.evaluatedBy : evaluation.evaluatedBy?.name || 'Unknown'}</span>
                                <span>Score: {evaluation.overallScore}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent evaluations</h3>
                  <p className="text-gray-600 mb-4">Start conducting quality evaluations to see activity here.</p>
                  <Button
                    onClick={() => navigate('/kitchen/food-quality')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start New Evaluation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data</h3>
          <p className="text-gray-600 mb-4">Complete some evaluations to see analytics.</p>
          <Button
            onClick={() => navigate('/kitchen/food-quality')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start First Evaluation
          </Button>
        </div>
      )}
    </div>
  );
};

export default FoodQualityAnalytics;
