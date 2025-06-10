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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  Download,
  Eye,
  Users
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { FoodQualityEvaluation, ProductType } from '@/types/kitchen';
import { cn } from "@/lib/utils";
import PageHeader from '@/components/PageHeader';

const FoodQualityHistory: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<FoodQualityEvaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<FoodQualityEvaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');

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
    loadEvaluations();
  }, [dateFilter]);

  useEffect(() => {
    filterEvaluations();
  }, [evaluations, searchTerm, statusFilter, productFilter]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const days = parseInt(dateFilter);
      const data = await kitchenService.getFoodQualityEvaluations({ 
        days,
        limit: 100 
      });
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      enqueueSnackbar('Failed to load evaluation history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterEvaluations = () => {
    let filtered = [...evaluations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(evaluation =>
        productTypeLabels[evaluation.productType]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof evaluation.evaluatedBy === 'string' ? evaluation.evaluatedBy : evaluation.evaluatedBy?.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.overallStatus === statusFilter);
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.productType === productFilter);
    }

    setFilteredEvaluations(filtered);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueProductTypes = () => {
    const types = [...new Set(evaluations.map(e => e.productType))];
    return types.sort();
  };

  const calculateStats = () => {
    const total = filteredEvaluations.length;
    const passed = filteredEvaluations.filter(e => e.overallStatus === 'pass').length;
    const warnings = filteredEvaluations.filter(e => e.overallStatus === 'warning').length;
    const failed = filteredEvaluations.filter(e => e.overallStatus === 'fail').length;
    const avgScore = total > 0 ? 
      filteredEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / total : 0;

    return { total, passed, warnings, failed, avgScore };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Custom History Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-white/30 rounded-3xl blur-lg"></div>
                <div className="relative p-4 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30">
                  <Clock className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  📊 Evaluation History
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  Track quality trends and performance over time
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live Data</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Advanced Analytics</span>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Stunning Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          <Card className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Tests</p>
                  <p className="text-3xl font-bold mb-1">{stats.total}</p>
                  <p className="text-blue-200 text-xs">Evaluations</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          <Card className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Passed</p>
                  <p className="text-3xl font-bold mb-1">{stats.passed}</p>
                  <p className="text-green-200 text-xs">{stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}% Pass Rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          <Card className="relative bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium mb-1">Warnings</p>
                  <p className="text-3xl font-bold mb-1">{stats.warnings}</p>
                  <p className="text-yellow-200 text-xs">Needs Attention</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          <Card className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Failed</p>
                  <p className="text-3xl font-bold mb-1">{stats.failed}</p>
                  <p className="text-red-200 text-xs">Critical Issues</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
          <Card className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Avg Score</p>
                  <p className="text-3xl font-bold mb-1">{stats.avgScore.toFixed(1)}</p>
                  <p className="text-purple-200 text-xs">Out of 100</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20"></div>
        <Card className="relative border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Filters & Search
                </CardTitle>
                <p className="text-gray-600 mt-1">Find exactly what you're looking for</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Search evaluations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-2xl">
                    <SelectItem value="all" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        All Status
                      </div>
                    </SelectItem>
                    <SelectItem value="pass" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Pass
                      </div>
                    </SelectItem>
                    <SelectItem value="warning" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="fail" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Fail
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Product
                </Label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-2xl">
                    <SelectItem value="all" className="rounded-lg">All Products</SelectItem>
                    {getUniqueProductTypes().map(type => (
                      <SelectItem key={type} value={type} className="rounded-lg">
                        {productTypeLabels[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Time Period
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-2xl">
                    <SelectItem value="7" className="rounded-lg">Last 7 days</SelectItem>
                    <SelectItem value="30" className="rounded-lg">Last 30 days</SelectItem>
                    <SelectItem value="90" className="rounded-lg">Last 90 days</SelectItem>
                    <SelectItem value="365" className="rounded-lg">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setProductFilter('all');
                    setDateFilter('7');
                  }}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-semibold"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stunning Evaluations List */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl blur opacity-20"></div>
        <Card className="relative border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-blue-50/20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Evaluation History
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {filteredEvaluations.length} evaluation{filteredEvaluations.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading evaluation history...</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No evaluations found</h3>
              <p className="text-gray-600 mb-4">
                {evaluations.length === 0
                  ? "No evaluations have been completed yet."
                  : "Try adjusting your filters to see more results."
                }
              </p>
              <Button
                onClick={() => navigate('/kitchen/food-quality')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start New Evaluation
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px] relative">
              <div className="space-y-4 p-2">
                {filteredEvaluations.map((evaluation, index) => (
                  <div key={evaluation._id} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                    <Card className="relative border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm group-hover:shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative">
                              <div className={cn(
                                "p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110",
                                evaluation.overallStatus === 'pass' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                evaluation.overallStatus === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                'bg-gradient-to-br from-red-400 to-red-600'
                              )}>
                                <div className="text-white">
                                  {getStatusIcon(evaluation.overallStatus)}
                                </div>
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">#{index + 1}</span>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {productTypeLabels[evaluation.productType] || evaluation.productType}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(evaluation.overallStatus)}
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-sm font-bold border-2",
                                      evaluation.overallScore >= 90 ? "border-green-300 bg-green-50 text-green-700" :
                                      evaluation.overallScore >= 70 ? "border-yellow-300 bg-yellow-50 text-yellow-700" :
                                      "border-red-300 bg-red-50 text-red-700"
                                    )}
                                  >
                                    Score: {evaluation.overallScore}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="p-1 bg-blue-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="font-medium">{formatDate(evaluation.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="p-1 bg-purple-100 rounded-lg">
                                    <Users className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <span className="font-medium">
                                    {typeof evaluation.evaluatedBy === 'string' ? evaluation.evaluatedBy : evaluation.evaluatedBy?.name || 'Unknown'}
                                  </span>
                                </div>
                                {evaluation.items && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <div className="p-1 bg-green-100 rounded-lg">
                                      <Target className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="font-medium">{evaluation.items.length} criteria</span>
                                  </div>
                                )}
                              </div>

                              {evaluation.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                  <p className="text-sm text-gray-700 line-clamp-2 italic">
                                    "{evaluation.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                enqueueSnackbar('View details coming soon!', { variant: 'info' });
                              }}
                              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl group-hover:scale-105"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodQualityHistory;
