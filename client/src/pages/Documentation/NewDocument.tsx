import { useState, FormEvent, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import documentationService, { CreateDocumentData } from '@/services/documentationService';
import userService, { User } from '@/services/userService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';

export default function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
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

    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }

    if (!formData.type) {
      toast.error('Please select a document type');
      return;
    }

    if (formData.category === 'Disciplinary' && !formData.severity) {
      toast.error('Please select a severity level');
      return;
    }

    // Check if file is required when documentationAttached is true
    if (formData.documentationAttached && !uploadedFile) {
      toast.error('Please attach the document file');
      return;
    }

    try {
      setLoading(true);
      
      // If there's a file to upload, upload it first
      if (uploadedFile) {
        setIsUploading(true);
        const fileData = await documentationService.uploadDocumentFile(uploadedFile);
        setIsUploading(false);
        
        // Add the document attachment info to form data
        formData.documentAttachment = {
          name: uploadedFile.name,
          type: uploadedFile.type,
          category: formData.category,
          url: fileData.url,
          key: fileData.key
        };
      }
      
      const result = await documentationService.createDocument(formData);
      toast.success('Document created successfully');
      navigate(`/documentation/${result._id}`);
    } catch (error) {
      toast.error('Failed to create document');
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

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="New Document"
          subtitle="Create a new document for a team member"
          icon={<FilePlus className="h-5 w-5" />}
          actions={
            <Button
              variant="ghost"
              className="bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              onClick={() => navigate('/documentation')}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          }
        />

        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Employee</label>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    onValueChange={(value) => handleSelectChange('employeeId', value)}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Category</label>
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disciplinary">Disciplinary</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Document Type</label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDocumentTypeOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showSeverity && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Severity</label>
                    <Select
                      name="severity"
                      value={formData.severity || ''}
                      onValueChange={(value) => handleSelectChange('severity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minor">Minor</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                  placeholder="Describe the situation or document..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Witnesses (Optional)</label>
                <input
                  type="text"
                  name="witnesses"
                  value={formData.witnesses}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Names of any witnesses"
                />
              </div>

              {formData.category === 'Disciplinary' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Action Taken</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                    placeholder="Describe the action taken..."
                    required={formData.category === 'Disciplinary'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Follow-up Actions (Optional)</label>
                  <input
                    type="text"
                    name="followUpActions"
                    value={formData.followUpActions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Actions to be taken during follow-up"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="previousIncidents"
                    name="previousIncidents"
                    checked={formData.previousIncidents}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-[#E51636] border-gray-300 rounded focus:ring-[#E51636]"
                  />
                  <label htmlFor="previousIncidents" className="ml-2 text-sm text-gray-700">
                    Previous incidents
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="documentationAttached"
                    name="documentationAttached"
                    checked={formData.documentationAttached}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-[#E51636] border-gray-300 rounded focus:ring-[#E51636]"
                  />
                  <label htmlFor="documentationAttached" className="ml-2 text-sm text-gray-700">
                    Documentation attached
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyEmployee"
                    name="notifyEmployee"
                    checked={formData.notifyEmployee}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-[#E51636] border-gray-300 rounded focus:ring-[#E51636]"
                  />
                  <label htmlFor="notifyEmployee" className="ml-2 text-sm text-gray-700">
                    Notify employee
                  </label>
                </div>
              </div>

              {/* File Upload Section - Only show when documentationAttached is checked */}
              {formData.documentationAttached && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Attach Document File</h3>
                    {uploadedFile && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFileSelection}
                        className="text-red-600 hover:text-red-700 p-2 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {uploadedFile ? (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <File className="w-5 h-5 mr-3 text-[#E51636]" />
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · {uploadedFile.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="documentFile" className="relative cursor-pointer w-full">
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-150">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700 mb-1">Click to upload a file</p>
                        <p className="text-xs text-gray-500 text-center">
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
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/documentation')}
                  disabled={loading || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  disabled={loading || isUploading}
                >
                  {loading || isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FilePlus className="w-4 h-4 mr-2" />
                      Create Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
