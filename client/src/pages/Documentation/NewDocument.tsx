import { useState, FormEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Check,
  X,
  Loader2,
  FileCheck,
  FilePlus,
  ChevronLeft,
  Upload,
  File,
  Trash2,
  Info,
  HelpCircle,
  User as UserIcon,
  Calendar,
  FileText,
  ClipboardList,
  AlertCircle,
  Target,
  Clock,
  BookOpen,
  Shield,
  Users,
  Building,
  Star,
  Zap,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Bell,
  Archive,
  Briefcase,
  Heart,
  Award,
  TrendingUp,
  Sparkles,
  Crown,
  Flame,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import documentationService, { CreateDocumentData } from '@/services/documentationService';
import userService, { User } from '@/services/userService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PIPForm from '@/components/PIPForm';

export default function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CreateDocumentData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    category: '',
    description: '',
    witnesses: '',
    actionTaken: '',
    followUpDate: '',
    followUpActions: '',
    previousIncidents: false,
    documentationAttached: false,
    notifyEmployee: true
  });
  const [showSeverity, setShowSeverity] = useState(false);
  const [showPIPForm, setShowPIPForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    // Show severity field for disciplinary and PIP categories
    setShowSeverity(formData.category === 'Disciplinary' || formData.category === 'PIP');
    // Show PIP form when PIP category is selected
    setShowPIPForm(formData.category === 'PIP');
  }, [formData.category, formData.type]);



  const loadEmployees = async () => {
    try {
      const data = await userService.getAllUsers();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
      console.error('Error loading employees:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user makes changes
    if (validationError) setValidationError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user makes changes
    if (validationError) setValidationError(null);
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      // Clear validation error when user uploads a file
      if (validationError) setValidationError(null);
    }
  };

  const clearFileSelection = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePIPSubmit = async (pipData: any) => {
    try {
      setLoading(true);

      const documentData = {
        ...formData,
        pipDetails: pipData
      };

      const result = await documentationService.createDocument(documentData);
      toast.success('🎯 Performance Improvement Plan created successfully! The employee will be notified and can begin their improvement journey.', {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
      navigate(`/documentation/${result._id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create PIP';
      toast.error(errorMessage);
      console.error('Error creating PIP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous validation errors
    setValidationError(null);

    // Validate required fields with more visible error messages
    if (!formData.employeeId) {
      const errorMsg = 'Please select an employee';
      setValidationError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      // Scroll to the employee field
      document.getElementById('employeeId')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Check if category is selected
    if (!formData.category) {
      const errorMsg = 'Please select a document category';
      setValidationError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      // Scroll to the category field
      document.getElementById('category')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Check if document type is selected
    if (!formData.type) {
      const errorMsg = 'Please select a document type';
      setValidationError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      // Scroll to the type field and highlight it
      document.getElementById('type')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Check if severity is selected for disciplinary and PIP documents
    if ((formData.category === 'Disciplinary' || formData.category === 'PIP') && !formData.severity) {
      const errorMsg = 'Please select a severity level';
      setValidationError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      // Scroll to the severity field
      document.getElementById('severity')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Check if file is required when documentationAttached is true
    if (formData.documentationAttached && !uploadedFile) {
      const errorMsg = 'Please attach the document file';
      setValidationError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      // Scroll to the file upload section
      document.getElementById('documentFile')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setLoading(true);

      // If there's a file to upload, upload it first
      if (uploadedFile) {
        setIsUploading(true);
        console.log('Starting file upload, size:', uploadedFile.size, 'type:', uploadedFile.type);

        try {
          const fileData = await documentationService.uploadDocumentFile(uploadedFile);
          console.log('File upload completed successfully:', fileData);

          // Add the document attachment info to form data
          formData.documentAttachment = {
            name: uploadedFile.name,
            type: uploadedFile.type,
            category: formData.category,
            url: fileData.url,
            key: fileData.key
          };
        } catch (uploadError: any) {
          console.error('File upload error details:', uploadError);
          const errorMessage = uploadError.response?.data?.message || 'File upload failed';
          toast.error(errorMessage);
          setLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      console.log('Creating document with data:', formData);
      const result = await documentationService.createDocument(formData);
      toast.success('Document created successfully');
      navigate(`/documentation/${result._id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create document';
      toast.error(errorMessage);
      console.error('Error creating document:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category information
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'Disciplinary':
        return {
          icon: Shield,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          description: 'Performance or conduct issues requiring formal documentation'
        };
      case 'PIP':
        return {
          icon: TrendingUp,
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          description: 'Structured improvement plans with goals and support'
        };
      case 'Administrative':
        return {
          icon: Archive,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          description: 'General documentation like call-outs and medical notes'
        };
      default:
        return {
          icon: FileText,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          description: 'Select a category to continue'
        };
    }
  };

  const getDocumentTypeOptions = () => {
    // No common options anymore - each category has its own specific options
    const categorySpecificOptions = {
      'Disciplinary': [
        { value: 'Verbal Warning', label: 'Verbal Warning', icon: AlertTriangle, severity: 'Minor' },
        { value: 'Written Warning', label: 'Written Warning', icon: FileText, severity: 'Moderate' },
        { value: 'Final Warning', label: 'Final Warning', icon: AlertCircle, severity: 'Major' },
        { value: 'Suspension', label: 'Suspension', icon: Clock, severity: 'Major' },
        { value: 'Termination', label: 'Termination', icon: X, severity: 'Critical' }
      ],
      'PIP': [
        { value: 'Performance Improvement Plan', label: 'Performance Improvement Plan', icon: Target, severity: 'Moderate' }
      ],
      'Administrative': [
        { value: 'Call Out', label: 'Call Out', icon: Calendar, severity: null },
        { value: 'Doctor Note', label: 'Doctor Note', icon: Heart, severity: null },
        { value: 'Other', label: 'Other', icon: File, severity: null }
      ]
    };

    return categorySpecificOptions[formData.category as keyof typeof categorySpecificOptions] || [];
  };

  // Helper function to get document type description
  const getDocumentTypeDescription = () => {
    if (!formData.type) return null;

    const descriptions = {
      'Verbal Warning': 'A formal conversation about a performance or conduct issue that is documented.',
      'Written Warning': 'A formal written notice about a performance or conduct issue.',
      'Final Warning': 'A final notice before termination if issues are not resolved.',
      'Performance Improvement Plan': 'A structured plan with specific goals, timeline, and support to help an employee improve performance.',
      'Suspension': 'Temporary removal from work duties.',
      'Termination': 'End of employment relationship.',
      'Call Out': 'Documentation of an employee calling out from work.',
      'Doctor Note': 'Medical documentation provided by an employee.',
      'Other': 'Any other administrative documentation.'
    };

    return descriptions[formData.type as keyof typeof descriptions];
  };

  const categoryInfo = getCategoryInfo(formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Create New Document"
          subtitle="Professional documentation for team member records"
          icon={<FilePlus className="h-5 w-5" />}
          actions={
            <Button
              onClick={() => navigate('/documentation')}
              className={headerButtonClass}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Documents</span>
            </Button>
          }
        />





        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
          {/* Step 1: Basic Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                  <Users className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-2xl font-bold">Step 1: Basic Information</CardTitle>
                  <CardDescription className="text-white/90 text-sm md:text-base">
                    Select the employee and document category
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-3 md:p-4 border border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                      <div className="bg-blue-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="text-center md:text-left">
                        <Label className="text-base md:text-lg font-semibold text-blue-900">
                          Select Employee <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs md:text-sm text-blue-700">Choose the team member this document is for</p>
                      </div>
                    </div>
                    <Select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onValueChange={(value) => handleSelectChange('employeeId', value)}
                    >
                      <SelectTrigger className="h-10 md:h-12 border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm md:text-base">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee._id} value={employee._id} className="py-2 md:py-3">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="bg-blue-100 p-1.5 md:p-2 rounded-full">
                                <UserIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm md:text-base">{employee.name}</div>
                                <div className="text-xs md:text-sm text-gray-500">{employee.position}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-3 md:p-4 border border-green-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                      <div className="bg-green-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="text-center md:text-left">
                        <Label className="text-base md:text-lg font-semibold text-green-900">
                          Document Date <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs md:text-sm text-green-700">When this incident occurred or document was created</p>
                      </div>
                    </div>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="h-10 md:h-12 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white text-sm md:text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-full space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
                    <div className="bg-purple-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                      <Building className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="text-center md:text-left">
                      <Label className="text-base md:text-lg font-semibold text-gray-900">
                        Document Category <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs md:text-sm text-gray-600">Choose the type of documentation you're creating</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {[
                      {
                        value: 'Disciplinary',
                        label: 'Disciplinary',
                        icon: Shield,
                        color: 'from-red-500 to-red-600',
                        bgColor: 'bg-red-50',
                        borderColor: 'border-red-200',
                        description: 'Performance or conduct issues'
                      },
                      {
                        value: 'PIP',
                        label: 'Performance Improvement Plan',
                        icon: TrendingUp,
                        color: 'from-orange-500 to-orange-600',
                        bgColor: 'bg-orange-50',
                        borderColor: 'border-orange-200',
                        description: 'Structured improvement plans'
                      },
                      {
                        value: 'Administrative',
                        label: 'Administrative',
                        icon: Archive,
                        color: 'from-blue-500 to-blue-600',
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-200',
                        description: 'General documentation'
                      }
                    ].map((category) => {
                      const isSelected = formData.category === category.value;
                      const IconComponent = category.icon;

                      return (
                        <div
                          key={category.value}
                          onClick={() => handleSelectChange('category', category.value)}
                          className={`p-4 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                            isSelected
                              ? `${category.borderColor} ${category.bgColor} shadow-lg scale-[1.02]`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`mx-auto mb-3 md:mb-4 p-2 md:p-3 rounded-xl w-fit ${
                              isSelected
                                ? `bg-gradient-to-r ${category.color} text-white`
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <h3 className={`font-semibold mb-2 text-sm md:text-base ${
                              isSelected ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {category.label}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600 mb-3">
                              {category.description}
                            </p>
                            {isSelected && (
                              <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm font-medium">Selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {formData.category && (
                  <div className="col-span-full space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
                      <div className="bg-indigo-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                        <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="text-center md:text-left">
                        <Label className="text-base md:text-lg font-semibold text-gray-900">
                          Document Type <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs md:text-sm text-gray-600">Select the specific type of {formData.category.toLowerCase()} document</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {getDocumentTypeOptions().map((option) => {
                        const isSelected = formData.type === option.value;
                        const IconComponent = option.icon;

                        return (
                          <div
                            key={option.value}
                            onClick={() => handleSelectChange('type', option.value)}
                            className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className={`p-1.5 md:p-2 rounded-lg ${
                                isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium text-sm md:text-base ${
                                  isSelected ? 'text-indigo-900' : 'text-gray-900'
                                }`}>
                                  {option.label}
                                </h4>
                                {option.severity && (
                                  <div className="flex items-center gap-1 md:gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Severity:</span>
                                    <span className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                                      option.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                      option.severity === 'Major' ? 'bg-orange-100 text-orange-700' :
                                      option.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {option.severity}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.type && getDocumentTypeDescription() && (
                  <div className="col-span-full">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex gap-4">
                        <div className="bg-blue-500 text-white p-3 rounded-xl">
                          <Info className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900 mb-2">About {formData.type}</h4>
                          <p className="text-blue-800">{getDocumentTypeDescription()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Severity Selection */}
          {showSeverity && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-2xl font-bold">Severity Level</CardTitle>
                    <CardDescription className="text-white/90 text-sm md:text-base">
                      Rate the severity of this {formData.category?.toLowerCase()} issue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { value: 'Minor', color: 'from-green-400 to-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: '🟢' },
                    { value: 'Moderate', color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: '🟡' },
                    { value: 'Major', color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: '🟠' },
                    { value: 'Critical', color: 'from-red-400 to-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: '🔴' }
                  ].map((severity) => {
                    const isSelected = formData.severity === severity.value;

                    return (
                      <div
                        key={severity.value}
                        onClick={() => handleSelectChange('severity', severity.value)}
                        className={`p-4 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                          isSelected
                            ? `${severity.borderColor} ${severity.bgColor} shadow-lg scale-[1.02]`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl md:text-4xl mb-2 md:mb-3">{severity.icon}</div>
                          <h3 className={`font-bold text-sm md:text-lg mb-1 md:mb-2 ${
                            isSelected ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {severity.value}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                            {severity.value === 'Minor' && 'Low impact issues'}
                            {severity.value === 'Moderate' && 'Medium impact issues'}
                            {severity.value === 'Major' && 'Significant impact issues'}
                            {severity.value === 'Critical' && 'Severe impact issues'}
                          </p>
                          {isSelected && (
                            <div className="flex items-center justify-center gap-1 md:gap-2 text-green-600">
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="text-xs md:text-sm font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Document Details */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                  <FileText className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-2xl font-bold">Step 2: Detailed Description</CardTitle>
                  <CardDescription className="text-white/90 text-sm md:text-base">
                    Provide a comprehensive description of the situation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <div className="space-y-4 md:space-y-6">
                <div className="bg-purple-50 rounded-xl p-4 md:p-6 border border-purple-200">
                  <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 mb-4">
                    <div className="bg-purple-500 text-white p-2 md:p-3 rounded-xl mx-auto md:mx-0 w-fit">
                      <FileText className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <Label className="text-base md:text-lg font-semibold text-purple-900 mb-2 block">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-purple-700 mb-4 text-sm md:text-base">
                        {formData.category === 'Disciplinary'
                          ? "Provide a clear, factual account of what happened, when, and who was involved"
                          : formData.category === 'PIP'
                          ? "Provide a detailed description of the performance issues that need improvement"
                          : "Provide relevant details about this documentation"}
                      </p>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="min-h-[120px] md:min-h-[150px] border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-sm md:text-base text-left"
                        placeholder={
                          formData.category === 'Disciplinary'
                            ? "Example: On [date] at approximately [time], [employee name] was observed [specific behavior/incident]. The incident occurred in [location] and was witnessed by [witnesses if any]. The employee [describe actions taken or not taken]. This behavior/incident [explain impact on operations, customers, or team]..."
                            : formData.category === 'PIP'
                            ? "Example: [Employee name] has been experiencing challenges in [specific areas]. Recent performance reviews and observations have identified the following areas for improvement: [list specific issues]. These performance gaps have resulted in [impact on team/operations/customers]..."
                            : "Provide a detailed description of the situation, including relevant dates, times, and circumstances..."
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-purple-100 rounded-lg p-3 md:p-4">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      <span className="font-medium text-purple-800 text-sm md:text-base">Writing Tips</span>
                    </div>
                    <ul className="text-xs md:text-sm text-purple-700 space-y-1 text-center md:text-left">
                      <li>• Be specific and factual - avoid opinions or assumptions</li>
                      <li>• Include dates, times, and locations when relevant</li>
                      <li>• Describe the impact on operations, team, or customers</li>
                      <li>• Use professional, objective language</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
                  <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                    <div className="bg-blue-500 text-white p-2 md:p-3 rounded-xl mx-auto md:mx-0 w-fit">
                      <Users className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <Label className="text-base md:text-lg font-semibold text-blue-900 mb-2 block">
                        Witnesses (Optional)
                      </Label>
                      <p className="text-blue-700 mb-4 text-sm md:text-base">
                        List any team members or others who witnessed the incident
                      </p>
                      <Input
                        id="witnesses"
                        name="witnesses"
                        value={formData.witnesses}
                        onChange={handleInputChange}
                        className="h-10 md:h-12 border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm md:text-base text-left"
                        placeholder="Example: John Smith (Team Lead), Sarah Johnson (Customer present), Mike Davis (Shift Manager)"
                      />
                      <p className="text-xs text-blue-600 mt-2">Separate multiple names with commas</p>
                    </div>
                  </div>
                </div>

                {(formData.category === 'Disciplinary' || formData.category === 'PIP') && (
                  <div className="bg-orange-50 rounded-xl p-4 md:p-6 border border-orange-200">
                    <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                      <div className="bg-orange-500 text-white p-2 md:p-3 rounded-xl mx-auto md:mx-0 w-fit">
                        <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <Label className="text-base md:text-lg font-semibold text-orange-900 mb-2 block">
                          {formData.category === 'PIP' ? 'Initial Action/Context' : 'Action Taken'} <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-orange-700 mb-4 text-sm md:text-base">
                          {formData.category === 'PIP'
                            ? "Explain the background and initial steps taken before creating this PIP"
                            : "Explain what steps were taken to address the issue and any consequences for the employee"}
                        </p>
                        <Textarea
                          id="actionTaken"
                          name="actionTaken"
                          value={formData.actionTaken}
                          onChange={handleInputChange}
                          className="min-h-[120px] md:min-h-[150px] border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white text-sm md:text-base text-left"
                          placeholder={formData.category === 'PIP'
                            ? "Example: Previous coaching sessions were conducted on [dates]. Employee was provided with additional training on [topics]. Despite these efforts, performance gaps persist in [areas]. This PIP is being implemented to provide structured support..."
                            : "Example: Employee was immediately counseled about the behavior. A verbal warning was issued and documented. Employee acknowledged understanding of expectations. Follow-up training scheduled for [date]..."}
                          required={formData.category === 'Disciplinary' || formData.category === 'PIP'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Follow-up Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-2xl font-bold">Step 3: Follow-up & Options</CardTitle>
                  <CardDescription className="text-white/90 text-sm md:text-base">
                    Set follow-up dates and configure notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-teal-50 rounded-xl p-4 md:p-6 border border-teal-200">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
                    <div className="bg-teal-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="text-center md:text-left">
                      <Label className="text-base md:text-lg font-semibold text-teal-900">
                        Follow-up Date
                      </Label>
                      <p className="text-xs md:text-sm text-teal-700">When to check back on this issue</p>
                    </div>
                  </div>
                  <Input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="h-10 md:h-12 border-teal-300 focus:border-teal-500 focus:ring-teal-500 bg-white text-sm md:text-lg"
                  />
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 md:p-6 border border-indigo-200">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4">
                    <div className="bg-indigo-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                      <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="text-center md:text-left">
                      <Label className="text-base md:text-lg font-semibold text-indigo-900">
                        Follow-up Actions
                      </Label>
                      <p className="text-xs md:text-sm text-indigo-700">What needs to be done during follow-up</p>
                    </div>
                  </div>
                  <Input
                    id="followUpActions"
                    name="followUpActions"
                    value={formData.followUpActions}
                    onChange={handleInputChange}
                    className="h-10 md:h-12 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-sm md:text-base"
                    placeholder="Example: Review performance metrics, conduct check-in meeting"
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-8">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                  Additional Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    formData.previousIncidents
                      ? 'border-red-300 bg-red-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={`p-2 md:p-3 rounded-xl ${
                        formData.previousIncidents
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            id="previousIncidents"
                            checked={formData.previousIncidents}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({ ...prev, previousIncidents: checked === true }));
                              if (validationError) setValidationError(null);
                            }}
                            className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                          />
                          <Label htmlFor="previousIncidents" className="font-semibold text-gray-900 cursor-pointer text-sm md:text-base">
                            Previous Incidents
                          </Label>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Similar incidents have occurred with this employee before
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    formData.documentationAttached
                      ? 'border-blue-300 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        formData.documentationAttached
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            id="documentationAttached"
                            checked={formData.documentationAttached}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({ ...prev, documentationAttached: checked === true }));
                              if (validationError) setValidationError(null);
                            }}
                            className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                          />
                          <Label htmlFor="documentationAttached" className="font-semibold text-gray-900 cursor-pointer">
                            Attach Documents
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600">
                          Upload supporting documents or evidence
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    formData.notifyEmployee
                      ? 'border-green-300 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        formData.notifyEmployee
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            id="notifyEmployee"
                            checked={formData.notifyEmployee}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({ ...prev, notifyEmployee: checked === true }));
                              if (validationError) setValidationError(null);
                            }}
                            className="data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                          />
                          <Label htmlFor="notifyEmployee" className="font-semibold text-gray-900 cursor-pointer">
                            Notify Employee
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600">
                          Send email notification to the employee
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Document Attachment - Only show when documentationAttached is checked */}
          {formData.documentationAttached && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                    <Upload className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-2xl font-bold">Step 4: Document Attachment</CardTitle>
                    <CardDescription className="text-white/90 text-sm md:text-base">
                      Upload supporting documents or evidence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-8">

                <div className="space-y-4 md:space-y-6">
                  <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0 mb-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <div className="bg-blue-500 text-white p-1.5 md:p-2 rounded-lg mx-auto md:mx-0 w-fit">
                          <FileText className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="text-center md:text-left">
                          <Label className="text-base md:text-lg font-semibold text-blue-900">
                            Supporting Document <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-xs md:text-sm text-blue-700">Upload evidence or supporting materials</p>
                        </div>
                      </div>
                      {uploadedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearFileSelection}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      )}
                    </div>

                    {uploadedFile ? (
                      <div className="bg-white rounded-xl border-2 border-green-200 p-4 md:p-6 shadow-sm">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-green-100 p-3 md:p-4 rounded-xl">
                            <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-1 text-sm md:text-base">{uploadedFile.name}</h4>
                            <p className="text-xs md:text-sm text-green-700">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · {uploadedFile.type || 'Unknown type'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                              <span className="text-xs md:text-sm font-medium text-green-800">File uploaded successfully</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="documentFile" className="relative cursor-pointer w-full">
                        <div className="flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-blue-300 rounded-xl bg-white hover:bg-blue-50 transition-all duration-200 hover:border-blue-400">
                          <div className="bg-blue-100 p-4 md:p-6 rounded-2xl mb-4 md:mb-6">
                            <Upload className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />
                          </div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Upload Supporting Document</h3>
                          <p className="text-gray-600 text-center mb-4 max-w-sm text-sm md:text-base">
                            Drag and drop your file here, or click to browse and select from your device
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                            <span>PDF</span>
                            <span>•</span>
                            <span>Word</span>
                            <span>•</span>
                            <span>Images</span>
                            <span>•</span>
                            <span>Up to 5MB</span>
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="documentFile"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <Card className="border-0 shadow-lg bg-red-50 border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 text-white p-3 rounded-xl">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-900 mb-2">Please fix the following error:</h4>
                    <p className="text-red-800">{validationError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white p-3 md:p-4 rounded-2xl">
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900">Ready to Create Document?</h3>
                    <p className="text-gray-600 text-sm md:text-base">Review all information before submitting</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/documentation')}
                    disabled={loading || isUploading}
                    className="px-6 md:px-8 py-2 md:py-3 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || isUploading || formData.category === 'PIP'}
                    className="bg-gradient-to-r from-[#E51636] to-[#DD0031] hover:from-[#DD0031] hover:to-[#C41E3A] text-white px-6 md:px-8 py-2 md:py-3 shadow-lg min-w-[160px] md:min-w-[200px] w-full sm:w-auto"
                  >
                    {loading || isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                        {isUploading ? 'Uploading...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FilePlus className="w-4 h-4 md:w-5 md:h-5" />
                        Create Document
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {formData.category === 'PIP' && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Please complete the Performance Improvement Plan below before creating the document
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        {/* PIP Form - Show when Performance Improvement Plan is selected */}
        {showPIPForm && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* PIP Form Container */}
            <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <PIPForm
                  onSubmit={handlePIPSubmit}
                  onCancel={() => setShowPIPForm(false)}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
