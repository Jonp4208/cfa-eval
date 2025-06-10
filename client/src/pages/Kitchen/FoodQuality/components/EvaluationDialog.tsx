import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Scale,
  Thermometer,
  Eye,
  Star,
  Hash,
  Ruler,
  CheckCircle,
  XCircle,
  Camera,
  Save,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { ProductType } from '@/types/kitchen';
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTypes: ProductType[];
  standards: Record<string, any>;
  onComplete: () => void;
}

interface EvaluationItem {
  productType: ProductType;
  criteriaId: string;
  value: any;
  notes?: string;
  photo?: string;
}

const EvaluationDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  productTypes,
  standards,
  onComplete
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

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

  React.useEffect(() => {
    if (productTypes.length > 0 && standards) {
      const allItems: EvaluationItem[] = [];
      productTypes.forEach(productType => {
        const standard = standards[productType];
        if (standard?.criteria) {
          standard.criteria.forEach((criteria: any) => {
            allItems.push({
              productType,
              criteriaId: criteria.id,
              value: getDefaultValue(criteria.type),
              notes: '',
              photo: ''
            });
          });
        }
      });
      setItems(allItems);
    }
  }, [productTypes, standards]);

  // Get all criteria across all products for step-by-step navigation
  const allCriteria = React.useMemo(() => {
    const criteria: Array<{ productType: ProductType; criteria: any; productLabel: string }> = [];
    productTypes.forEach(productType => {
      const standard = standards[productType];
      if (standard?.criteria) {
        standard.criteria.forEach((criteriaItem: any) => {
          criteria.push({
            productType,
            criteria: criteriaItem,
            productLabel: productTypeLabels[productType] || productType
          });
        });
      }
    });
    return criteria;
  }, [productTypes, standards]);

  const totalSteps = allCriteria.length + 1; // +1 for overall notes
  const currentCriteria = currentStep < allCriteria.length ? allCriteria[currentStep] : null;
  const isLastStep = currentStep === totalSteps - 1;
  const isOverallNotesStep = currentStep === allCriteria.length;

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (isOverallNotesStep) return true;

    if (currentCriteria) {
      const item = items.find(i =>
        i.productType === currentCriteria.productType &&
        i.criteriaId === currentCriteria.criteria.id
      );

      // Check if required field is filled
      if (currentCriteria.criteria.required) {
        return item && item.value !== '' && item.value !== null && item.value !== undefined;
      }
      return true;
    }
    return false;
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'yes_no':
        return 'yes';
      case 'temperature':
      case 'weight':
      case 'measurement':
      case 'count':
        return '';
      case 'taste':
        return 7;
      case 'visual':
        return 'pass';
      default:
        return '';
    }
  };

  const updateItem = (productType: ProductType, criteriaId: string, field: keyof EvaluationItem, value: any) => {
    setItems(prev => prev.map(item =>
      item.productType === productType && item.criteriaId === criteriaId
        ? { ...item, [field]: value }
        : item
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Scale className="h-4 w-4" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'visual':
        return <Eye className="h-4 w-4" />;
      case 'taste':
        return <Star className="h-4 w-4" />;
      case 'count':
        return <Hash className="h-4 w-4" />;
      case 'measurement':
        return <Ruler className="h-4 w-4" />;
      case 'yes_no':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const renderInput = (criteria: any, item: EvaluationItem, productType: ProductType) => {
    switch (criteria.type) {
      case 'yes_no':
        return (
          <Select
            value={item.value}
            onValueChange={(value) => updateItem(productType, criteria.id, 'value', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'visual':
        return (
          <Select
            value={item.value}
            onValueChange={(value) => updateItem(productType, criteria.id, 'value', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'taste':
        return (
          <Select
            value={item.value?.toString()}
            onValueChange={(value) => updateItem(productType, criteria.id, 'value', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} {rating >= 8 ? '⭐' : rating >= 6 ? '👍' : '👎'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'temperature':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Temperature"
              value={item.value}
              onChange={(e) => updateItem(productType, criteria.id, 'value', parseFloat(e.target.value) || '')}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">°F</span>
          </div>
        );

      case 'weight':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Weight"
              value={item.value}
              onChange={(e) => updateItem(productType, criteria.id, 'value', parseFloat(e.target.value) || '')}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">oz</span>
          </div>
        );

      case 'count':
        return (
          <Input
            type="number"
            placeholder="Count"
            value={item.value}
            onChange={(e) => updateItem(productType, criteria.id, 'value', parseInt(e.target.value) || '')}
          />
        );

      case 'measurement':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Measurement"
              value={item.value}
              onChange={(e) => updateItem(productType, criteria.id, 'value', parseFloat(e.target.value) || '')}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">inches</span>
          </div>
        );

      default:
        return (
          <Input
            placeholder="Value"
            value={item.value}
            onChange={(e) => updateItem(productType, criteria.id, 'value', e.target.value)}
          />
        );
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting evaluation submission...');
    console.log('📊 Items to submit:', items);
    console.log('📝 Notes:', notes);

    try {
      setLoading(true);

      // Submit evaluations for each product type
      for (const productType of productTypes) {
        console.log(`📦 Processing product type: ${productType}`);
        const productItems = items.filter(item => item.productType === productType);
        const standard = standards[productType];

        console.log(`📋 Product items for ${productType}:`, productItems);

        // Validate required fields for this product
        const missingItems = productItems.filter(item => {
          const criteria = standard?.criteria?.find((c: any) => c.id === item.criteriaId);
          return criteria?.required && (item.value === '' || item.value === null || item.value === undefined);
        });

        if (missingItems.length > 0) {
          console.log('❌ Missing required items:', missingItems);
          enqueueSnackbar(`Please fill in all required fields for ${productType}`, { variant: 'error' });
          setLoading(false);
          return;
        }

        console.log(`✅ Submitting evaluation for ${productType}...`);
        const submissionData = {
          productType,
          items: productItems.map(item => ({
            criteriaId: item.criteriaId,
            value: item.value,
            notes: item.notes,
            photo: item.photo
          })),
          notes,
          photos
        };

        console.log('📤 Submission data:', submissionData);

        const result = await kitchenService.submitFoodQualityEvaluation(submissionData);
        console.log(`✅ Successfully submitted ${productType}:`, result);
      }

      console.log('🎉 All evaluations submitted successfully!');
      enqueueSnackbar('Evaluation submitted successfully!', { variant: 'success' });

      // Close dialog and call completion callback
      onOpenChange(false);
      onComplete();

    } catch (error) {
      console.error('❌ Error submitting evaluation:', error);
      enqueueSnackbar('Failed to submit evaluation', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getValidationInfo = (criteria: any) => {
    const { validation } = criteria;
    if (!validation) return null;

    const info = [];
    if (validation.minTemp !== undefined) info.push(`Min: ${validation.minTemp}°F`);
    if (validation.maxTemp !== undefined) info.push(`Max: ${validation.maxTemp}°F`);
    if (validation.minWeight !== undefined) info.push(`Min: ${validation.minWeight}oz`);
    if (validation.maxWeight !== undefined) info.push(`Max: ${validation.maxWeight}oz`);
    if (validation.minCount !== undefined) info.push(`Min: ${validation.minCount}`);
    if (validation.maxCount !== undefined) info.push(`Max: ${validation.maxCount}`);
    if (validation.minMeasurement !== undefined) info.push(`Min: ${validation.minMeasurement}"`);
    if (validation.maxMeasurement !== undefined) info.push(`Max: ${validation.maxMeasurement}"`);

    return info.length > 0 ? info.join(', ') : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        {/* STEP-BY-STEP HEADER */}
        <DialogHeader className="bg-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Quality Evaluation
                </DialogTitle>
                <DialogDescription className="text-white/90">
                  {isOverallNotesStep ? 'Overall Notes' : `${currentCriteria?.productLabel}`}
                </DialogDescription>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="text-right">
              <div className="text-sm text-white/80">Step</div>
              <div className="text-lg font-bold text-white">
                {currentStep + 1} / {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* STEP CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          {isOverallNotesStep ? (
            /* OVERALL NOTES STEP */
            <div className="space-y-4">
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Save className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        📋 Overall Evaluation Notes
                      </h2>
                      <p className="text-sm text-gray-600">
                        Add any final observations or recommendations
                      </p>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Add overall evaluation notes, observations, and recommendations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-sm"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          ) : currentCriteria ? (
            /* CRITERIA STEP - COMPACT */
            <div className="space-y-4">
              {/* Compact Question Header */}
              <Card className="border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                      {getIcon(currentCriteria.criteria.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900">
                          {currentCriteria.criteria.name}
                        </h2>
                        {currentCriteria.criteria.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>

                      {currentCriteria.criteria.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {currentCriteria.criteria.description}
                        </p>
                      )}

                      {(() => {
                        const validationInfo = getValidationInfo(currentCriteria.criteria);
                        return validationInfo && (
                          <p className="text-xs text-blue-600 mb-3">{validationInfo}</p>
                        );
                      })()}

                      {/* Answer Input */}
                      <div className="mb-3">
                        {(() => {
                          const item = items.find(i =>
                            i.productType === currentCriteria.productType &&
                            i.criteriaId === currentCriteria.criteria.id
                          );
                          return item ? renderInput(currentCriteria.criteria, item, currentCriteria.productType) : null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="pt-3 border-t border-gray-100">
                    <Label className="text-sm text-gray-600 mb-2 block">
                      📝 Notes (optional)
                    </Label>
                    {(() => {
                      const item = items.find(i =>
                        i.productType === currentCriteria.productType &&
                        i.criteriaId === currentCriteria.criteria.id
                      );
                      return (
                        <Textarea
                          placeholder="Add notes..."
                          value={item?.notes || ''}
                          onChange={(e) => updateItem(currentCriteria.productType, currentCriteria.criteria.id, 'notes', e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
          <div className="flex justify-between items-center gap-4">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Step Info */}
            <div className="text-center">
              <div className="text-sm text-gray-600">
                {isOverallNotesStep ? 'Final Step' : `Question ${currentStep + 1} of ${allCriteria.length}`}
              </div>
              {!canProceed() && currentCriteria?.criteria.required && (
                <div className="text-xs text-red-600 mt-1">
                  This field is required
                </div>
              )}
            </div>

            {/* Next/Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              {isLastStep ? (
                <Button
                  onClick={() => {
                    console.log('🔥 SUBMIT BUTTON CLICKED!');
                    handleSubmit();
                  }}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Submit Evaluation
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDialog;
