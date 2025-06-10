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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Target,
  Thermometer,
  Scale,
  Eye,
  Star,
  Hash,
  Ruler,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { ProductType } from '@/types/kitchen';
import { cn } from "@/lib/utils";
import PageHeader from '@/components/PageHeader';

interface FoodQualityConfig {
  standards: Record<string, any>;
  qualityPhotos: Record<string, string>;
}

interface Criteria {
  id: string;
  name: string;
  type: string;
  description?: string;
  required: boolean;
  validation?: any;
  order: number;
}

const FoodQualitySettings: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FoodQualityConfig | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [showCriteriaDialog, setShowCriteriaDialog] = useState(false);

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

  const criteriaTypes = [
    { value: 'yes_no', label: 'Yes/No', icon: CheckCircle },
    { value: 'temperature', label: 'Temperature', icon: Thermometer },
    { value: 'weight', label: 'Weight', icon: Scale },
    { value: 'rating', label: 'Rating (1-5)', icon: Star },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'measurement', label: 'Measurement', icon: Ruler },
    { value: 'text', label: 'Text', icon: Eye }
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await kitchenService.getFoodQualityConfig();
      setConfig(data);
      
      // Set first product as selected by default
      if (data?.standards && Object.keys(data.standards).length > 0) {
        setSelectedProduct(Object.keys(data.standards)[0]);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      enqueueSnackbar('Failed to load configuration', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      await kitchenService.updateFoodQualityConfig(config);
      enqueueSnackbar('Configuration saved successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error saving config:', error);
      enqueueSnackbar('Failed to save configuration', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: string) => {
    const criteriaType = criteriaTypes.find(ct => ct.value === type);
    const IconComponent = criteriaType?.icon || Target;
    return <IconComponent className="h-4 w-4 text-white" />;
  };

  const handleAddCriteria = () => {
    setEditingCriteria({
      id: `criteria_${Date.now()}`,
      name: '',
      type: 'yes_no',
      description: '',
      required: false,
      order: (config?.standards[selectedProduct]?.criteria?.length || 0) + 1
    });
    setShowCriteriaDialog(true);
  };

  const handleEditCriteria = (criteria: Criteria) => {
    setEditingCriteria({ ...criteria });
    setShowCriteriaDialog(true);
  };

  const handleSaveCriteria = () => {
    if (!editingCriteria || !config || !selectedProduct) return;

    const updatedConfig = { ...config };
    const standard = updatedConfig.standards[selectedProduct];
    
    if (!standard.criteria) {
      standard.criteria = [];
    }

    const existingIndex = standard.criteria.findIndex((c: Criteria) => c.id === editingCriteria.id);
    
    if (existingIndex >= 0) {
      standard.criteria[existingIndex] = editingCriteria;
    } else {
      standard.criteria.push(editingCriteria);
    }

    // Sort by order
    standard.criteria.sort((a: Criteria, b: Criteria) => a.order - b.order);

    setConfig(updatedConfig);
    setShowCriteriaDialog(false);
    setEditingCriteria(null);
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    if (!config || !selectedProduct) return;

    const updatedConfig = { ...config };
    const standard = updatedConfig.standards[selectedProduct];
    
    if (standard.criteria) {
      standard.criteria = standard.criteria.filter((c: Criteria) => c.id !== criteriaId);
    }

    setConfig(updatedConfig);
  };

  const currentStandard = config?.standards[selectedProduct];

  return (
    <div className="space-y-6">
      {/* Custom Settings Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-white/30 rounded-3xl blur-xl"></div>
                <div className="relative p-4 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30" style={{ animation: 'spin 8s linear infinite' }}>
                  <Settings className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  ⚙️ Quality Standards
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  Configure and customize evaluation criteria
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Live Configuration</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Custom Criteria</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={saveConfig}
                disabled={saving}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold border-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Save Changes
              </Button>
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
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stunning Product Selection Sidebar */}
          <div className="lg:col-span-1 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20"></div>
            <Card className="relative border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Product Types
                    </CardTitle>
                    <p className="text-gray-600 text-sm mt-1">Select to configure</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {config && Object.entries(config.standards).map(([productType, standard]) => (
                      <div key={productType} className="relative group">
                        <div className={cn(
                          "absolute -inset-0.5 rounded-2xl blur transition-all duration-300",
                          selectedProduct === productType
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
                            : "bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover:opacity-20"
                        )}></div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative w-full justify-start text-left h-auto p-4 rounded-2xl transition-all duration-300 group-hover:scale-105",
                            selectedProduct === productType
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:from-blue-600 hover:to-purple-700"
                              : "bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                          )}
                          onClick={() => setSelectedProduct(productType)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={cn(
                              "p-2 rounded-xl transition-all duration-300",
                              selectedProduct === productType
                                ? "bg-white/20"
                                : "bg-blue-100 group-hover:bg-blue-200"
                            )}>
                              <Target className={cn(
                                "h-5 w-5 transition-colors",
                                selectedProduct === productType ? "text-white" : "text-blue-600"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-semibold transition-colors",
                                selectedProduct === productType ? "text-white" : "text-gray-900"
                              )}>
                                {productTypeLabels[productType] || productType}
                              </div>
                              <div className={cn(
                                "text-sm mt-1 transition-colors",
                                selectedProduct === productType ? "text-white/80" : "text-gray-500"
                              )}>
                                {standard.criteria?.length || 0} criteria configured
                              </div>
                            </div>
                            {selectedProduct === productType && (
                              <div className="p-1 bg-white/20 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Criteria Management */}
          <Card className="lg:col-span-3 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {productTypeLabels[selectedProduct] || selectedProduct}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    Configure evaluation criteria for this product
                  </p>
                </div>
                <Button
                  onClick={handleAddCriteria}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criteria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentStandard?.criteria?.length > 0 ? (
                <div className="space-y-4">
                  {currentStandard.criteria
                    .sort((a: Criteria, b: Criteria) => a.order - b.order)
                    .map((criteria: Criteria, index: number) => (
                    <Card key={criteria.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                              {getIcon(criteria.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {criteria.name}
                                </h3>
                                {criteria.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {criteriaTypes.find(ct => ct.value === criteria.type)?.label}
                                </Badge>
                              </div>
                              
                              {criteria.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {criteria.description}
                                </p>
                              )}
                              
                              <div className="text-xs text-gray-500">
                                Order: {criteria.order}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCriteria(criteria)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCriteria(criteria.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No criteria configured</h3>
                  <p className="text-gray-600 mb-4">
                    Add evaluation criteria to get started with quality testing.
                  </p>
                  <Button
                    onClick={handleAddCriteria}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Criteria
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Criteria Edit Dialog */}
      <Dialog open={showCriteriaDialog} onOpenChange={setShowCriteriaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCriteria?.id.startsWith('criteria_') ? 'Add New Criteria' : 'Edit Criteria'}
            </DialogTitle>
            <DialogDescription>
              Configure the evaluation criteria for {productTypeLabels[selectedProduct]}
            </DialogDescription>
          </DialogHeader>

          {editingCriteria && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Criteria Name</Label>
                  <Input
                    placeholder="e.g., Temperature check"
                    value={editingCriteria.name}
                    onChange={(e) => setEditingCriteria({
                      ...editingCriteria,
                      name: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Type</Label>
                  <Select
                    value={editingCriteria.type}
                    onValueChange={(value) => setEditingCriteria({
                      ...editingCriteria,
                      type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {criteriaTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Description</Label>
                <Textarea
                  placeholder="Describe what should be evaluated..."
                  value={editingCriteria.description || ''}
                  onChange={(e) => setEditingCriteria({
                    ...editingCriteria,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Order</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingCriteria.order}
                    onChange={(e) => setEditingCriteria({
                      ...editingCriteria,
                      order: parseInt(e.target.value) || 1
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={editingCriteria.required}
                    onCheckedChange={(checked) => setEditingCriteria({
                      ...editingCriteria,
                      required: checked
                    })}
                  />
                  <Label className="text-sm font-medium">Required field</Label>
                </div>
              </div>

              {/* Validation Settings */}
              {(editingCriteria.type === 'temperature' || editingCriteria.type === 'weight' || editingCriteria.type === 'number') && (
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Validation Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Minimum Value</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Min"
                          value={editingCriteria.validation?.min || ''}
                          onChange={(e) => setEditingCriteria({
                            ...editingCriteria,
                            validation: {
                              ...editingCriteria.validation,
                              min: parseFloat(e.target.value) || undefined
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maximum Value</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Max"
                          value={editingCriteria.validation?.max || ''}
                          onChange={(e) => setEditingCriteria({
                            ...editingCriteria,
                            validation: {
                              ...editingCriteria.validation,
                              max: parseFloat(e.target.value) || undefined
                            }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {editingCriteria.type === 'yes_no' && (
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Pass Condition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={editingCriteria.validation?.requiredValue || 'yes'}
                      onValueChange={(value) => setEditingCriteria({
                        ...editingCriteria,
                        validation: {
                          ...editingCriteria.validation,
                          requiredValue: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Must be Yes</SelectItem>
                        <SelectItem value="no">Must be No</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCriteriaDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCriteria}
              disabled={!editingCriteria?.name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Criteria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodQualitySettings;
