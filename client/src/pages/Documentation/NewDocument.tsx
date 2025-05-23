import { useState, FormEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import documentationService, { CreateDocumentData } from '@/services/documentationService';
import userService, { User } from '@/services/userService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    category: 'Administrative',
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

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    // Show severity field only for disciplinary category
    setShowSeverity(formData.category === 'Disciplinary');
  }, [formData.category]);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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

    // Check if severity is selected for disciplinary documents
    if (formData.category === 'Disciplinary' && !formData.severity) {
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

  const getDocumentTypeOptions = () => {
    // No common options anymore - each category has its own specific options
    const categorySpecificOptions = {
      'Disciplinary': [
        { value: 'Verbal Warning', label: 'Verbal Warning' },
        { value: 'Written Warning', label: 'Written Warning' },
        { value: 'Final Warning', label: 'Final Warning' },
        { value: 'Suspension', label: 'Suspension' },
        { value: 'Termination', label: 'Termination' }
      ],
      'Administrative': [
        { value: 'Call Out', label: 'Call Out' },
        { value: 'Doctor Note', label: 'Doctor Note' },
        { value: 'Other', label: 'Other' }
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
      'Suspension': 'Temporary removal from work duties.',
      'Termination': 'End of employment relationship.',
      'Call Out': 'Documentation of an employee calling out from work.',
      'Doctor Note': 'Medical documentation provided by an employee.',
      'Other': 'Any other administrative documentation.'
    };

    return descriptions[formData.type as keyof typeof descriptions];
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="New Document"
          subtitle="Create a new document for a team member"
          icon={<FilePlus className="h-5 w-5" />}
          actions={
            <Button
              className={headerButtonClass}
              onClick={() => navigate('/documentation')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          }
        />

        {/* Introduction Card */}
        <Card className="bg-white rounded-[20px] shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Creating a New Document</h3>
                <p className="text-gray-600">
                  This form allows you to create documentation for team members. Choose the appropriate category and document type based on your needs.
                  All fields marked with <span className="text-red-500">*</span> are required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardHeader className="pb-0 pt-6 px-6">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#E51636]" />
              Document Information
            </CardTitle>
            <CardDescription>
              Fill out the details below to create a new document
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E51636] text-white font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="employeeId" className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      Employee <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onValueChange={(value) => handleSelectChange('employeeId', value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">The team member this document is for</p>
                  </div>

                  <div>
                    <Label htmlFor="date" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="mt-1.5"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">When this document was created or incident occurred</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="category" className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Disciplinary: For performance or conduct issues</p>
                            <p>Administrative: For general documentation like call-outs or doctor's notes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      id="category"
                      name="category"
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disciplinary">Disciplinary</SelectItem>
                        <SelectItem value="Administrative">Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">The general category of this document</p>
                  </div>

                  <div>
                    <Label htmlFor="type" className="flex items-center gap-1">
                      <ClipboardList className="h-4 w-4 text-gray-500" />
                      Document Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="type"
                      name="type"
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger
                        className={`mt-1.5 ${!formData.type && formData.category ? 'border-amber-500 ring-1 ring-amber-500' : ''}`}
                      >
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDocumentTypeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className={`text-xs mt-1 ${!formData.type && formData.category ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                      {!formData.type && formData.category
                        ? "Please select a document type to continue"
                        : "The specific type of document"}
                    </p>
                  </div>

                  {formData.type && getDocumentTypeDescription() && (
                    <div className="col-span-full mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">About {formData.type}</p>
                          <p className="text-sm text-blue-600">{getDocumentTypeDescription()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showSeverity && (
                    <div>
                      <div className="flex items-center gap-1">
                        <Label htmlFor="severity" className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                          Severity <span className="text-red-500">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Minor: Low impact issues</p>
                              <p>Moderate: Medium impact issues</p>
                              <p>Major: Significant impact issues</p>
                              <p>Critical: Severe impact issues</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        id="severity"
                        name="severity"
                        value={formData.severity || ''}
                        onValueChange={(value) => handleSelectChange('severity', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Minor">Minor</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Major">Major</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">How serious the issue is</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Document Details */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E51636] text-white font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-medium">Document Details</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="description" className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1.5 min-h-[120px]"
                      placeholder={formData.category === 'Disciplinary'
                        ? "Describe the incident or performance issue in detail..."
                        : "Describe the reason for this documentation..."}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.category === 'Disciplinary'
                        ? "Provide a clear, factual account of what happened, when, and who was involved"
                        : "Provide relevant details about this documentation"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="witnesses" className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        Witnesses
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>List any team members or others who witnessed the incident</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="witnesses"
                      name="witnesses"
                      value={formData.witnesses}
                      onChange={handleInputChange}
                      className="mt-1.5"
                      placeholder="Names of any witnesses (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple names with commas</p>
                  </div>

                  {formData.category === 'Disciplinary' && (
                    <div>
                      <Label htmlFor="actionTaken" className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4 text-gray-500" />
                        Action Taken <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="actionTaken"
                        name="actionTaken"
                        value={formData.actionTaken}
                        onChange={handleInputChange}
                        className="mt-1.5 min-h-[120px]"
                        placeholder="Describe the corrective action taken or consequences..."
                        required={formData.category === 'Disciplinary'}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Explain what steps were taken to address the issue and any consequences for the employee
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Follow-up Information */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E51636] text-white font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-medium">Follow-up Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="followUpDate" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Follow-up Date
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>When to check back on this issue</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="date"
                      id="followUpDate"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">When to follow up on this document (optional)</p>
                  </div>

                  <div>
                    <Label htmlFor="followUpActions" className="flex items-center gap-1">
                      <ClipboardList className="h-4 w-4 text-gray-500" />
                      Follow-up Actions
                    </Label>
                    <Input
                      id="followUpActions"
                      name="followUpActions"
                      value={formData.followUpActions}
                      onChange={handleInputChange}
                      className="mt-1.5"
                      placeholder="Actions to be taken during follow-up"
                    />
                    <p className="text-xs text-gray-500 mt-1">What needs to be done during the follow-up (optional)</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="previousIncidents"
                        checked={formData.previousIncidents}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange({
                            target: { name: 'previousIncidents', checked: checked === true }
                          } as any)
                        }
                        className="mt-1 data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="previousIncidents"
                          className="font-medium text-gray-700"
                        >
                          Previous incidents
                        </Label>
                        <p className="text-xs text-gray-500">
                          Check if there have been similar incidents with this employee before
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="documentationAttached"
                        checked={formData.documentationAttached}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange({
                            target: { name: 'documentationAttached', checked: checked === true }
                          } as any)
                        }
                        className="mt-1 data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="documentationAttached"
                          className="font-medium text-gray-700"
                        >
                          Documentation attached
                        </Label>
                        <p className="text-xs text-gray-500">
                          Check if you need to upload supporting documents
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="notifyEmployee"
                        checked={formData.notifyEmployee}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange({
                            target: { name: 'notifyEmployee', checked: checked === true }
                          } as any)
                        }
                        className="mt-1 data-[state=checked]:bg-[#E51636] data-[state=checked]:border-[#E51636]"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="notifyEmployee"
                          className="font-medium text-gray-700"
                        >
                          Notify employee
                        </Label>
                        <p className="text-xs text-gray-500">
                          Send an email notification to the employee
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Document Attachment - Only show when documentationAttached is checked */}
              {formData.documentationAttached && (
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E51636] text-white font-bold">
                      4
                    </div>
                    <h3 className="text-lg font-medium">Document Attachment</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#E51636]" />
                        <Label className="font-medium">
                          Attach Supporting Document <span className="text-red-500">*</span>
                        </Label>
                      </div>
                      {uploadedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearFileSelection}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {uploadedFile ? (
                      <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <FileCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · {uploadedFile.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="documentFile" className="relative cursor-pointer w-full">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition duration-150">
                          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-blue-500" />
                          </div>
                          <p className="text-base font-medium text-gray-700 mb-1">Click to upload a file</p>
                          <p className="text-sm text-gray-500 text-center mb-2">
                            Drag and drop files here or click to browse
                          </p>
                          <p className="text-xs text-gray-400 text-center">
                            PDF, Word documents, or images up to 5MB
                          </p>
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
              )}

              {/* Validation Error Message */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Please fix the following error:</h4>
                    <p className="text-red-700">{validationError}</p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/documentation')}
                  disabled={loading || isUploading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <div className="flex flex-col items-end gap-2">
                  {validationError && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="bg-[#E51636] hover:bg-[#E51636]/90 text-white w-full sm:w-auto"
                    disabled={loading || isUploading}
                  >
                    {loading || isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isUploading ? 'Uploading File...' : 'Creating Document...'}
                      </>
                    ) : (
                      <>
                        <FilePlus className="w-5 h-5 mr-2" />
                        Create Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
