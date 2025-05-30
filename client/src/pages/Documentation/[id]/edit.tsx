import { useState, FormEvent, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  AlertTriangle,
  Check,
  X,
  Loader2,
  FileCheck,
  FilePlus,
  ChevronLeft,
  Save
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import documentationService, { DocumentationRecord } from '@/services/documentationService'
import userService, { User } from '@/services/userService'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/PageHeader'

export default function EditDocument() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingDocument, setLoadingDocument] = useState(true)
  const [employees, setEmployees] = useState<User[]>([])
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    category: 'Administrative',
    severity: '',
    description: '',
    witnesses: '',
    actionTaken: '',
    followUpDate: '',
    followUpActions: '',
    previousIncidents: false,
    documentationAttached: false,
    notifyEmployee: true
  })
  const [showSeverity, setShowSeverity] = useState(false)
  const [originalDocument, setOriginalDocument] = useState<DocumentationRecord | null>(null)

  useEffect(() => {
    if (id) {
      loadDocument()
      loadEmployees()
    }
  }, [id])

  useEffect(() => {
    // Show severity field only for disciplinary category
    setShowSeverity(formData.category === 'Disciplinary')
  }, [formData.category])

  const loadDocument = async () => {
    try {
      setLoadingDocument(true)
      const data = await documentationService.getDocumentById(id!)
      setOriginalDocument(data)
      
      // Format the date string to YYYY-MM-DD for the date input
      const formattedDate = new Date(data.date).toISOString().split('T')[0]
      const formattedFollowUpDate = data.followUpDate 
        ? new Date(data.followUpDate).toISOString().split('T')[0] 
        : ''

      setFormData({
        employeeId: data.employee._id,
        date: formattedDate,
        type: data.type,
        category: data.category,
        severity: data.severity || '',
        description: data.description,
        witnesses: data.witnesses || '',
        actionTaken: data.actionTaken || '',
        followUpDate: formattedFollowUpDate,
        followUpActions: data.followUpActions || '',
        previousIncidents: data.previousIncidents,
        documentationAttached: data.documentationAttached,
        notifyEmployee: data.notifyEmployee !== undefined ? data.notifyEmployee : true // Default to true if not defined
      })
    } catch (error) {
      toast.error('Failed to load document')
      console.error('Error loading document:', error)
      navigate('/documentation')
    } finally {
      setLoadingDocument(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await userService.getAllUsers()
      setEmployees(data)
    } catch (error) {
      toast.error('Failed to load employees')
      console.error('Error loading employees:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId) {
      toast.error('Please select an employee')
      return
    }

    if (!formData.type) {
      toast.error('Please select a document type')
      return
    }

    if (formData.category === 'Disciplinary' && !formData.severity) {
      toast.error('Please select a severity level')
      return
    }

    try {
      setLoading(true)
      await documentationService.updateDocument(id!, formData)
      toast.success('Document updated successfully')
      navigate(`/documentation/${id}`)
    } catch (error) {
      toast.error('Failed to update document')
      console.error('Error updating document:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }

    return categorySpecificOptions[formData.category as keyof typeof categorySpecificOptions] || []
  }

  if (loadingDocument) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="Edit Document"
          subtitle="Update this document information"
          icon={<FileCheck className="h-5 w-5" />}
          actions={
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Button
                variant="ghost"
                className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
                onClick={() => navigate(`/documentation/${id}`)}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
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

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/documentation/${id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 