import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  History,
  BarChart3,
  Settings,
  Star,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Scale,
  Thermometer,
  Eye,
  ChefHat,
  Clock,
  Award,
  PlayCircle,
  Zap,
  Timer,
  Utensils,
  Coffee,
  Flame,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { ProductType, FoodQualityStandard, FoodQualityEvaluation } from '@/types/kitchen';
import { cn } from "@/lib/utils";
import PageHeader from '@/components/PageHeader';
import EvaluationDialog from './components/EvaluationDialog';

interface FoodQualityConfig {
  standards: Record<string, any>;
  qualityPhotos: Record<string, string>;
}

const productTypeLabels: Record<ProductType, string> = {
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

const FoodQuality: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<FoodQualityConfig | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<FoodQualityEvaluation[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [evaluationDialog, setEvaluationDialog] = useState(false);
  const [productSelectionDialog, setProductSelectionDialog] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [configData, evaluationsData, analyticsData] = await Promise.all([
        kitchenService.getFoodQualityConfig(),
        kitchenService.getFoodQualityEvaluations({ limit: 10 }),
        kitchenService.getFoodQualityAnalytics({ days: 7 })
      ]);
      
      setConfig(configData);
      setRecentEvaluations(evaluationsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading food quality data:', error);
      enqueueSnackbar('Failed to load food quality data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewTest = () => {
    setProductSelectionDialog(true);
  };

  const handleProductToggle = (productType: ProductType) => {
    setSelectedProducts(prev =>
      prev.includes(productType)
        ? prev.filter(p => p !== productType)
        : [...prev, productType]
    );
  };

  const handleStartEvaluations = () => {
    if (selectedProducts.length === 0) {
      enqueueSnackbar('Please select at least one product to evaluate', { variant: 'error' });
      return;
    }
    setProductSelectionDialog(false);
    setEvaluationDialog(true);
  };

  const handleEvaluationComplete = () => {
    setEvaluationDialog(false);
    setSelectedProducts([]);
    loadData(); // Refresh data
    enqueueSnackbar('Evaluation completed successfully', { variant: 'success' });
  };

  const handleSelectAll = () => {
    if (config) {
      const allProductTypes = Object.keys(config.standards) as ProductType[];
      setSelectedProducts(allProductTypes);
    }
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* STUNNING HERO SECTION - Masterpiece Design */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-cyan-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-violet-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Glass Morphism Container - Mobile Optimized */}
        <div className="relative backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8">
                {/* Stunning Icon with Multiple Layers - Mobile Responsive */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                    <Target className="h-12 w-12 sm:h-16 sm:w-16 text-white relative z-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-lg"></div>
                </div>

                <div className="space-y-4 text-center sm:text-left">
                  {/* Stunning Typography - Mobile Responsive */}
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                      Food Quality
                    </h1>
                    <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto sm:mx-0"></div>
                  </div>

                  <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 font-medium max-w-2xl leading-relaxed">
                    Elevate every product to <span className="text-violet-600 font-bold">perfection</span> with our
                    <span className="text-blue-600 font-bold"> intelligent quality system</span>
                  </p>

                  {/* Beautiful Status Indicators - Mobile Responsive */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-8 mt-6">
                    <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50 shadow-lg w-full sm:w-auto justify-center sm:justify-start">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-emerald-700 font-semibold text-sm sm:text-base">Standards Maintained</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/50 shadow-lg w-full sm:w-auto justify-center sm:justify-start">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl shadow-lg">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-amber-700 font-semibold text-sm sm:text-base">Excellence Assured</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 shadow-lg w-full sm:w-auto justify-center sm:justify-start">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-blue-700 font-semibold text-sm sm:text-base">Precision Testing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stunning Action Buttons - Mobile Hidden, Desktop Visible */}
              <div className="hidden lg:flex gap-4 flex-shrink-0">
                <Button
                  onClick={() => navigate('history')}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 px-6 py-3 rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/10 group-hover:to-violet-600/10 transition-all duration-500"></div>
                  <History className="h-5 w-5 mr-3 relative z-10" />
                  <span className="relative z-10 font-semibold">History</span>
                </Button>
                <Button
                  onClick={() => navigate('/kitchen/food-quality/analytics')}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 px-6 py-3 rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/10 group-hover:to-violet-600/10 transition-all duration-500"></div>
                  <BarChart3 className="h-5 w-5 mr-3 relative z-10" />
                  <span className="relative z-10 font-semibold">Analytics</span>
                </Button>
                <Button
                  onClick={() => navigate('/kitchen/food-quality/settings')}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 px-6 py-3 rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/10 group-hover:to-violet-600/10 transition-all duration-500"></div>
                  <Settings className="h-5 w-5 mr-3 relative z-10" />
                  <span className="relative z-10 font-semibold">Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">

        {/* Quick Stats - Mobile 2x2 Grid */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium">Pass Rate</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.passRate?.toFixed(1)}%</p>
                    <p className="text-emerald-200 text-xs mt-1 hidden sm:block">Quality Standard</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-2xl">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Avg Score</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.averageScore?.toFixed(1)}</p>
                    <p className="text-blue-200 text-xs mt-1 hidden sm:block">Out of 100</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-2xl">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Tests</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.totalEvaluations}</p>
                    <p className="text-purple-200 text-xs mt-1 hidden sm:block">This Period</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-2xl">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">This Week</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.totalEvaluations}</p>
                    <p className="text-orange-200 text-xs mt-1 hidden sm:block">Evaluations</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-2xl">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Action Section - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* MASTERPIECE CTA - Start New Test - Mobile Responsive */}
          <div className="lg:col-span-2 order-1">
            <div className="relative group">
              {/* Animated Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-1000 animate-pulse"></div>

              <Card className="relative bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white border-0 shadow-2xl hover:shadow-4xl transition-all duration-700 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                {/* Glass Morphism Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-100"></div>
                  <div className="absolute top-20 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/25 rounded-full animate-bounce delay-500"></div>
                  <div className="absolute bottom-10 right-10 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-700"></div>
                </div>

                <CardContent className="relative z-10 p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 text-center sm:text-left">
                        {/* Stunning Icon with Layers - Mobile Responsive */}
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-lg"></div>
                          <div className="relative p-4 sm:p-5 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-sm border border-white/20 shadow-2xl">
                            <PlayCircle className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                        </div>

                        <div className="space-y-3">
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent">
                            Start Quality Test
                          </h2>
                          <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-lg">
                            Launch your <span className="text-yellow-300 font-bold">intelligent evaluation</span> and
                            maintain <span className="text-cyan-300 font-bold">excellence standards</span>
                          </p>
                        </div>
                      </div>

                      {/* Beautiful Feature Pills - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30 backdrop-blur-sm w-full sm:w-auto justify-center">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                          <span className="text-yellow-100 font-semibold text-sm sm:text-base">Lightning Fast</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-400/30 backdrop-blur-sm w-full sm:w-auto justify-center">
                          <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-300" />
                          <span className="text-cyan-100 font-semibold text-sm sm:text-base">Real-time Results</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm w-full sm:w-auto justify-center">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300" />
                          <span className="text-purple-100 font-semibold text-sm sm:text-base">Quality Assured</span>
                        </div>
                      </div>

                      {/* STUNNING CTA Button - Mobile Responsive */}
                      <Button
                        onClick={handleStartNewTest}
                        className="group relative overflow-hidden bg-gradient-to-r from-white via-blue-50 to-violet-50 hover:from-white hover:via-white hover:to-white text-violet-700 hover:text-violet-800 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-2xl transform hover:scale-105 w-full sm:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-violet-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:via-violet-600/5 group-hover:to-purple-600/5 transition-all duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <span>Start New Test</span>
                          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* STUNNING Quick Actions - Mobile Responsive */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-none">
            {/* History Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              <Card className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
                <CardContent className="relative p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-20"></div>
                      <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                        <History className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">View History</h3>
                      <p className="text-gray-600">Past evaluations & trends</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/kitchen/food-quality/history')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3 rounded-xl font-semibold"
                  >
                    <History className="h-5 w-5 mr-2" />
                    View All Tests
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              <Card className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardContent className="relative p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-20"></div>
                      <div className="relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Analytics</h3>
                      <p className="text-gray-600">Performance insights</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/kitchen/food-quality/analytics')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3 rounded-xl font-semibold"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Settings Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              <Card className="relative bg-gradient-to-br from-gray-50 via-white to-slate-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5"></div>
                <CardContent className="relative p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gray-500 rounded-2xl blur-lg opacity-20"></div>
                      <div className="relative p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Settings</h3>
                      <p className="text-gray-600">Configure standards</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/kitchen/food-quality/settings')}
                    className="w-full bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3 rounded-xl font-semibold"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Manage Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E51636]/10 rounded-2xl">
                  <Clock className="h-6 w-6 text-[#E51636]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Recent Quality Tests</CardTitle>
                  <p className="text-gray-600 text-sm">Latest evaluation results</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/kitchen/food-quality/history')}
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {recentEvaluations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentEvaluations.map((evaluation, index) => (
                    <div key={evaluation._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-2xl",
                            evaluation.overallStatus === 'pass' ? 'bg-green-100' :
                            evaluation.overallStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                          )}>
                            {getStatusIcon(evaluation.overallStatus)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {productTypeLabels[evaluation.productType]}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(evaluation.evaluatedAt).toLocaleDateString()} at{' '}
                              {new Date(evaluation.evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            "text-xs font-medium px-3 py-1",
                            evaluation.overallStatus === 'pass' ? 'bg-green-100 text-green-800 border-green-200' :
                            evaluation.overallStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          )}>
                            {evaluation.overallStatus.toUpperCase()}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{evaluation.overallScore}%</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 p-12">
                  <div className="text-center">
                    <div className="p-6 bg-gray-100 rounded-3xl inline-block mb-4">
                      <Target className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No evaluations yet</h3>
                    <p className="text-gray-600 mb-4">Start your first quality evaluation to see results here</p>
                    <Button
                      onClick={handleStartNewTest}
                      className="bg-[#E51636] hover:bg-[#DD0031] text-white"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start First Test
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Product Selection Dialog - Mobile Optimized */}
      <Dialog open={productSelectionDialog} onOpenChange={setProductSelectionDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden mx-4 sm:mx-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-[#E51636]/10 rounded-xl">
                    <Target className="h-6 w-6 text-[#E51636]" />
                  </div>
                  Select Products to Evaluate
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  ✅ Choose multiple products to include in your quality evaluation test
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2 sm:pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {config && Object.entries(config.standards).map(([productType, standard]) => {
                const isSelected = selectedProducts.includes(productType as ProductType);
                return (
                  <Card
                    key={productType}
                    className={cn(
                      "border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                      isSelected
                        ? "border-[#E51636] bg-[#E51636]/5 shadow-md"
                        : "border-gray-200 hover:border-[#E51636]/30"
                    )}
                    onClick={() => handleProductToggle(productType as ProductType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            isSelected ? "bg-[#E51636] text-white" : "bg-gray-100 text-gray-600"
                          )}>
                            {productType.includes('sandwich') ? <Utensils className="h-5 w-5" /> :
                             productType.includes('nuggets') ? <Coffee className="h-5 w-5" /> :
                             productType.includes('strips') ? <Flame className="h-5 w-5" /> :
                             <ChefHat className="h-5 w-5" />}
                          </div>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleProductToggle(productType as ProductType)}
                            className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                          />
                        </div>
                      </div>
                      <h3 className={cn(
                        "font-semibold mb-2 transition-colors",
                        isSelected ? "text-[#E51636]" : "text-gray-900"
                      )}>
                        {productTypeLabels[productType as ProductType]}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="h-4 w-4" />
                          <span>{standard.criteria?.length || 0} criteria</span>
                        </div>
                        {config.qualityPhotos[productType] && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Camera className="h-4 w-4" />
                            <span>Quality photo available</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <div className="border-t pt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setProductSelectionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartEvaluations}
                disabled={selectedProducts.length === 0}
                className="bg-[#E51636] hover:bg-[#DD0031] text-white"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Evaluation{selectedProducts.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      {selectedProducts.length > 0 && (
        <EvaluationDialog
          open={evaluationDialog}
          onOpenChange={setEvaluationDialog}
          productTypes={selectedProducts}
          standards={config?.standards}
          onComplete={handleEvaluationComplete}
        />
      )}
    </div>
  );
};

export default FoodQuality;
