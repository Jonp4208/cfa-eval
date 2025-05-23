// client/src/pages/Templates/TemplateBuilder.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, GripVertical, Trash2, Save, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import DraggableSection from './components/DraggableSection';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { handleError, handleValidationError } from '@/lib/utils/error-handler';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';


interface Section {
  id: string;
  title: string;
  description: string;
  criteria: Criterion[];
  order: number;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  gradingScale: string;
  required: boolean;
}

interface Template {
  _id?: string;
  name: string;
  description: string;
  store: string;
  sections: Section[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TemplateFormData {
  name: string;
  description: string;
  tags: string[];
  sections: Section[];
  store?: string;
  isActive?: boolean;
}

interface GradingScale {
  _id: string;
  name: string;
  description?: string;
  grades: Array<{
    value: number;
    label: string;
    description?: string;
    color: string;
  }>;
  isDefault: boolean;
}

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();  // Get template ID from URL if editing
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [hasCheckedStore, setHasCheckedStore] = useState(false);
  const [isEditMode] = useState(!!id);  // Check if we're in edit mode

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch available grading scales
  const { data: gradingScales } = useQuery({
    queryKey: ['gradingScales'],
    queryFn: async () => {
      const response = await api.get('/api/grading-scales');
      return response.data;
    }
  });

  // Get default scale
  const defaultScale = gradingScales?.find((scale: GradingScale) => scale.isDefault);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    tags: ['General'],
    sections: [],
    store: '',
    isActive: true
  });

  // Add error state
  const [errors, setErrors] = useState<{
    name?: string;
    sections: {
      [key: string]: {
        title?: string;
        criteria: {
          [key: string]: {
            name?: string;
            description?: string;
          };
        };
      };
    };
  }>({
    sections: {}
  });

  const availableTags = ['FOH', 'BOH', 'Leadership', 'General'];

  // Initialize new criterion with default scale
  const createNewCriterion = () => ({
    id: Date.now().toString(),
    name: '',
    description: '',
    gradingScale: defaultScale?._id || '1-5',
    required: true
  });

  // Add this function to get scale name for display
  const getScaleName = (scaleId: string) => {
    if (!gradingScales) return 'Loading...';
    const scale = gradingScales.find((s: GradingScale) => s._id === scaleId);
    if (scale) return scale.name;
    // Handle legacy scales
    if (scaleId === '1-5') return '5 Point Scale';
    if (scaleId === '1-10') return '10 Point Scale';
    if (scaleId === 'yes-no') return 'Yes/No';
    return 'Unknown Scale';
  };

  // Fetch template data if in edit mode
  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const response = await api.get(`/api/templates/${id}`);
          const template = response.data.template;

          // Transform the data to match the form structure
          setFormData({
            name: template.name,
            description: template.description || '',
            tags: template.tags || ['General'],
            sections: template.sections.map((section: any) => ({
              id: section._id || Date.now().toString(),
              title: section.title,
              description: section.description || '',
              order: section.order,
              criteria: section.criteria.map((criterion: any) => ({
                id: criterion._id || Date.now().toString(),
                name: criterion.name,
                description: criterion.description || '',
                gradingScale: criterion.gradingScale || defaultScale?._id || '',
                required: criterion.required
              }))
            })),
            store: template.store || '',
            isActive: template.isActive
          });
        } catch (error) {
          console.error('Error fetching template:', error);
          toast({
            title: "Error",
            description: "Failed to load template data",
            duration: 5000,
          });
          navigate('/templates');
        }
      }
    };

    fetchTemplate();
  }, [id, navigate, toast, defaultScale]);

  useEffect(() => {
    console.log('Auth check effect running', {
      isLoading,
      user,
      userStore: user?.store,
      storeType: user?.store ? typeof user.store : 'undefined'
    });

    if (!isLoading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      if (!user.store) {
        console.log('No store found for user');
        toast({
          title: "Access Denied",
          description: "You must be associated with a store to create templates. Please contact your administrator.",
          variant: "destructive",
        });
        navigate('/templates');
        return;
      }

      // Check the type and structure of store before accessing _id
      let storeId;
      if (typeof user.store === 'string') {
        storeId = user.store;
      } else if (typeof user.store === 'object' && user.store?._id) {
        storeId = user.store._id;
      } else {
        console.error('Invalid store format:', user.store);
        toast({
          title: "Error",
          description: "Invalid store data format. Please contact support.",
          variant: "destructive",
        });
        navigate('/templates');
        return;
      }

      console.log('Setting store ID:', storeId);
      setFormData(prev => ({
        ...prev,
        store: storeId
      }));
      setHasCheckedStore(true);
    }
  }, [isLoading, user, navigate, toast]);

  const addSection = () => {
    const newSectionId = Date.now().toString();
    const newCriterionId = `${Date.now()}-1`;

    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newSectionId,
          title: '',
          description: '',
          order: prev.sections.length,
          criteria: [
            {
              id: newCriterionId,
              name: '',
              description: '',
              gradingScale: defaultScale?._id || '1-5',
              required: true
            }
          ]
        }
      ]
    }));
  };

  const addCriterion = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            criteria: [
              ...section.criteria,
              {
                id: Date.now().toString(),
                name: '',
                description: '',
                gradingScale: defaultScale?._id || '',
                required: true
              }
            ]
          };
        }
        return section;
      })
    }));
  };

  const updateSection = (sectionId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, [field]: value };
        }
        return section;
      })
    }));
  };

  const updateCriterion = (sectionId: string, criterionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            criteria: section.criteria.map(criterion => {
              if (criterion.id === criterionId) {
                return { ...criterion, [field]: value };
              }
              return criterion;
            })
          };
        }
        return section;
      })
    }));
  };

  const removeSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const removeCriterion = (sectionId: string, criterionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            criteria: section.criteria.filter(criterion => criterion.id !== criterionId)
          };
        }
        return section;
      })
    }));
  };

  const handleSave = async () => {
    // Reset errors
    setErrors({ sections: {} });
    let hasErrors = false;

    if (!user?._id) {
      handleValidationError({
        message: "User data not available. Please try again."
      });
      return;
    }

    if (!formData.store) {
      handleValidationError({
        message: "No store selected"
      });
      return;
    }

    // Validate template name
    if (!formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: "Template name is required" }));
      hasErrors = true;
    }

    // Validate sections exist
    if (formData.sections.length === 0) {
      handleValidationError({
        message: "Template must have at least one section"
      });
      return;
    }

    // Validate each section and its criteria
    formData.sections.forEach((section, i) => {
      if (!section.title.trim()) {
        setErrors(prev => ({
          ...prev,
          sections: {
            ...prev.sections,
            [section.id]: {
              ...prev.sections[section.id],
              title: `Section ${i + 1} requires a title`,
              criteria: {}
            }
          }
        }));
        hasErrors = true;
      }

      if (section.criteria.length === 0) {
        setErrors(prev => ({
          ...prev,
          sections: {
            ...prev.sections,
            [section.id]: {
              ...prev.sections[section.id],
              title: `Section must have at least one criterion`,
              criteria: {}
            }
          }
        }));
        hasErrors = true;
      }

      section.criteria.forEach((criterion) => {
        if (!criterion.name.trim()) {
          setErrors(prev => ({
            ...prev,
            sections: {
              ...prev.sections,
              [section.id]: {
                ...prev.sections[section.id],
                criteria: {
                  ...prev.sections[section.id]?.criteria,
                  [criterion.id]: {
                    ...prev.sections[section.id]?.criteria[criterion.id],
                    name: `Question name is required`
                  }
                }
              }
            }
          }));
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      handleValidationError({
        message: "Please fix the highlighted errors"
      });
      return;
    }

    try {
      const templateData = {
        ...formData,
        createdBy: user?._id,
        sections: formData.sections.map((section, index) => ({
          ...section,
          order: index,
          criteria: section.criteria.map(criterion => ({
            name: criterion.name,
            description: criterion.description,
            gradingScale: criterion.gradingScale,
            required: criterion.required
          }))
        }))
      };

      if (isEditMode) {
        await api.put(`/api/templates/${id}`, templateData);
        toast({
          title: "Success",
          description: "Template updated successfully",
          duration: 5000,
        });
      } else {
        await api.post('/api/templates', templateData);
        toast({
          title: "Success",
          description: "Template created successfully",
          duration: 5000,
        });
      }

      navigate('/templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      handleError(error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
        const newIndex = prev.sections.findIndex((s) => s.id === over.id);

        return {
          ...prev,
          sections: arrayMove(prev.sections, oldIndex, newIndex),
        };
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleTagChange = (tag: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    } else {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      });
    }
  };

  const handleCriterionChange = useCallback((sectionId: string, criterionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            criteria: section.criteria.map(criterion => {
              if (criterion.id === criterionId) {
                return {
                  ...criterion,
                  [field]: value
                };
              }
              return criterion;
            })
          };
        }
        return section;
      })
    }));
  }, []);

  const handleRemoveCriterion = useCallback((sectionId: string, criterionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            criteria: section.criteria.filter(criterion => criterion.id !== criterionId)
          };
        }
        return section;
      })
    }));
  }, []);

  const renderCriterionForm = useCallback((criterion: Criterion, sectionId: string, index: number) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-medium text-sm mr-3">
              {index + 1}
            </div>
            <h4 className="font-medium text-[#27251F]">Evaluation Criterion</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full"
            onClick={() => handleRemoveCriterion(sectionId, criterion.id)}
            title="Remove criterion"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`criterion-${criterion.id}-name`} className="flex items-center">
              Question/Criterion
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <Input
              id={`criterion-${criterion.id}-name`}
              value={criterion.name}
              onChange={(e) => handleCriterionChange(sectionId, criterion.id, 'name', e.target.value)}
              className="mt-1.5"
              placeholder="E.g., How effectively does the employee communicate with customers?"
            />
            <p className="mt-1 text-xs text-gray-500">This is what evaluators will be asked to rate</p>
          </div>

          <div>
            <Label htmlFor={`criterion-${criterion.id}-description`}>Description/Guidance</Label>
            <Textarea
              id={`criterion-${criterion.id}-description`}
              value={criterion.description}
              onChange={(e) => handleCriterionChange(sectionId, criterion.id, 'description', e.target.value)}
              className="mt-1.5"
              placeholder="E.g., Consider clarity, tone, listening skills, and ability to handle difficult conversations."
            />
            <p className="mt-1 text-xs text-gray-500">Provide guidance on how to evaluate this criterion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`criterion-${criterion.id}-scale`} className="flex items-center">
                Grading Scale
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <select
                id={`criterion-${criterion.id}-scale`}
                value={criterion.gradingScale}
                onChange={(e) => handleCriterionChange(sectionId, criterion.id, 'gradingScale', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5 h-10"
              >
                {gradingScales?.map((scale: GradingScale) => (
                  <option key={scale._id} value={scale._id}>
                    {scale.name} {scale.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">How this criterion will be scored</p>
            </div>

            <div className="flex flex-col justify-end">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start">
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox
                    id={`criterion-${criterion.id}-required`}
                    checked={criterion.required}
                    onCheckedChange={(checked) =>
                      handleCriterionChange(sectionId, criterion.id, 'required', checked)
                    }
                    className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                  />
                  <div>
                    <Label htmlFor={`criterion-${criterion.id}-required`} className="font-medium">Required Response</Label>
                    <p className="text-xs text-blue-700">Evaluators must provide a rating for this criterion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [gradingScales, handleCriterionChange, handleRemoveCriterion]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PageHeader */}
        <PageHeader
          title={isEditMode ? 'Edit Template' : 'Create Template'}
          subtitle="Design evaluation templates for your team"
          icon={<FileText className="h-5 w-5" />}
          showBackButton={true}
          actions={
            <Button
              className={headerButtonClass}
              onClick={() => navigate('/templates')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          }
        />

        {/* Step-by-Step Guide */}
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#27251F] mb-4">How to Create an Evaluation Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#E51636]/5 p-4 rounded-xl border border-[#E51636]/20">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold mr-2">1</div>
                <h3 className="font-medium text-[#27251F]">Basic Information</h3>
              </div>
              <p className="text-sm text-[#27251F]/70">Start by naming your template and adding a description to help others understand its purpose.</p>
            </div>
            <div className="bg-[#E51636]/5 p-4 rounded-xl border border-[#E51636]/20">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold mr-2">2</div>
                <h3 className="font-medium text-[#27251F]">Create Sections</h3>
              </div>
              <p className="text-sm text-[#27251F]/70">Divide your evaluation into logical sections (e.g., Customer Service, Leadership Skills).</p>
            </div>
            <div className="bg-[#E51636]/5 p-4 rounded-xl border border-[#E51636]/20">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold mr-2">3</div>
                <h3 className="font-medium text-[#27251F]">Add Criteria</h3>
              </div>
              <p className="text-sm text-[#27251F]/70">For each section, add specific criteria that will be evaluated and select appropriate grading scales.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white rounded-[20px] shadow-md">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Template Details */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Template Information
                  </h2>
                  <p className="text-sm text-blue-700">This information helps users understand the purpose and scope of your evaluation template.</p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-base font-medium text-[#27251F] flex items-center">
                    Template Name
                    <span className="ml-1 text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Required)</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1.5 h-12 rounded-xl border-gray-200"
                    placeholder="E.g., Team Member Performance Review"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  <p className="mt-1 text-xs text-gray-500">Choose a clear, descriptive name that indicates the template's purpose.</p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium text-[#27251F]">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[100px] rounded-xl border-gray-200 resize-none"
                    placeholder="E.g., This template is used for quarterly performance reviews of team members, focusing on customer service, productivity, and teamwork."
                  />
                  <p className="mt-1 text-xs text-gray-500">Provide context about when and how this template should be used.</p>
                </div>

                <div>
                  <Label className="text-base font-medium text-[#27251F]">Categories</Label>
                  <p className="text-xs text-gray-500 mb-2">Select all that apply to help with template organization.</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 bg-gray-50 p-3 rounded-xl">
                    {availableTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        <Checkbox
                          id={tag}
                          checked={formData.tags.includes(tag)}
                          onCheckedChange={(checked) => handleTagChange(tag, checked)}
                          className="rounded-md data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                        />
                        <Label
                          htmlFor={tag}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl mb-6">
                  <h2 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Template Sections
                  </h2>
                  <p className="text-sm text-green-700">Divide your evaluation into logical sections. Each section should focus on a specific area of performance or skill set.</p>
                  <div className="mt-3 flex items-center text-xs text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Tip: You can drag and drop sections to reorder them.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-[#27251F]">Sections ({formData.sections.length})</h2>
                  <Button
                    onClick={addSection}
                    className="bg-[#E51636] hover:bg-[#E51636]/90 text-white h-10 px-4 rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Section
                  </Button>
                </div>

                {formData.sections.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Sections Added Yet</h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">Sections help organize your evaluation criteria into logical groups. For example, "Customer Service", "Technical Skills", or "Leadership".</p>
                    <Button
                      onClick={addSection}
                      className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Section
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={formData.sections.map(section => section.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {formData.sections.map((section, index) => (
                          <DraggableSection
                            key={section.id}
                            section={section}
                            index={index}
                            errors={errors.sections[section.id] || {}}
                            onUpdateSection={updateSection}
                            onUpdateCriterion={updateCriterion}
                            onAddCriterion={() => addCriterion(section.id)}
                            onRemoveSection={() => removeSection(section.id)}
                            onRemoveCriterion={(criterionId) => removeCriterion(section.id, criterionId)}
                            renderCriterionForm={renderCriterionForm}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card className="bg-white rounded-[20px] shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Template Preview
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-semibold text-lg">{formData.name || "Template Name"}</h3>
                  <p className="text-gray-500 text-sm">{formData.description || "Template description will appear here"}</p>
                </div>
                <div className="p-4">
                  {formData.sections.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">Add sections to see a preview of your template</p>
                  ) : (
                    <div className="space-y-6">
                      {formData.sections.map((section, index) => (
                        <div key={section.id} className="space-y-4">
                          <div className="border-b pb-2">
                            <h4 className="font-medium text-[#27251F]">{index + 1}. {section.title}</h4>
                            {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
                          </div>
                          {section.criteria.length === 0 ? (
                            <p className="text-gray-400 italic text-sm">No criteria added to this section</p>
                          ) : (
                            <div className="space-y-4 pl-4">
                              {section.criteria.map((criterion, cIndex) => (
                                <div key={criterion.id} className="space-y-1">
                                  <p className="text-[#27251F]">{cIndex + 1}. {criterion.name}</p>
                                  {criterion.description && <p className="text-sm text-gray-500">{criterion.description}</p>}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      Scale: {getScaleName(criterion.gradingScale)}
                                    </span>
                                    {criterion.required && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>This is how your template will appear to evaluators. Continue adding sections and criteria to complete your template.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/templates')}
            className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50 text-[#27251F]"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 hidden md:block">
              {formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'} with
              {' '}{formData.sections.reduce((total, section) => total + section.criteria.length, 0)} criteria
            </p>
            <Button
              onClick={handleSave}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12 px-8 rounded-xl font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              {isEditMode ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}