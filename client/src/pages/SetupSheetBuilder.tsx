import { useState, useEffect } from 'react'
import { adjustToSundayToSaturdayRange, getShortDayOfWeekName } from '@/lib/dateUtils'
import { SaveSetupDialog } from '@/components/setup-sheet/SaveSetupDialog'
import { useDropzone } from 'react-dropzone'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Search, Filter, Save } from 'lucide-react'
import * as XLSX from 'xlsx'
import { TemplateBuilder } from '@/components/setup-sheet/TemplateBuilder'
import { EmployeeAssignment } from '@/components/setup-sheet/EmployeeAssignment'
import { DraggableEmployee } from '@/components/setup-sheet/DraggableEmployee'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SetupSheetBuilder() {
  const {
    employees,
    templates,
    weeklySetups,
    currentTemplate,
    currentWeeklySetup,
    currentAssignments,
    setEmployees,
    setCurrentTemplate,
    setCurrentWeeklySetup,
    setCurrentAssignments,
    fetchTemplates,
    fetchWeeklySetups,
    createTemplate,
    createWeeklySetup,
    isLoading,
    error: storeError
  } = useSetupSheetStore()

  const [error, setError] = useState<string | null>(null)
  const [employeeFilter, setEmployeeFilter] = useState<'ALL' | 'FOH' | 'BOH'>('ALL')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [setupName, setSetupName] = useState('')
  const [setupStartDate, setSetupStartDate] = useState('')
  const [setupEndDate, setSetupEndDate] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'assign'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [columnMappings, setColumnMappings] = useState({
    name: 'Employee Name',
    startTime: 'Start Time',
    endTime: 'End Time',
    area: 'Area',
    day: 'Day'
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
    fetchWeeklySetups()
  }, [fetchTemplates, fetchWeeklySetups])

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    setError(null)
    setPreviewData(null)

    try {
      const file = acceptedFiles[0]
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        setError('The uploaded file contains no data. Please check the file and try again.')
        setIsUploading(false)
        return
      }

      // Check if the file has the expected columns
      const firstRow = jsonData[0] as Record<string, any>
      const requiredColumns = [columnMappings.name, columnMappings.startTime, columnMappings.endTime, columnMappings.area]
      const optionalColumns = [columnMappings.day] // Day is optional but recommended
      const missingRequiredColumns = requiredColumns.filter(col => !(col in firstRow))
      const missingOptionalColumns = optionalColumns.filter(col => !(col in firstRow))

      // Warn about missing day column
      if (missingOptionalColumns.length > 0) {
        toast({
          title: 'Warning',
          description: `The day column (${columnMappings.day}) is missing. Employees will be available for all days.`,
          variant: 'default'
        })
      }

      if (missingRequiredColumns.length > 0) {
        setError(`Missing required columns: ${missingRequiredColumns.join(', ')}. Please check your file format.`)
        setIsUploading(false)
        return
      }

      // Store the full data in a ref or state for later use
      window.fullImportData = jsonData;

      // Set preview data for user to confirm (just show first 5 rows)
      setPreviewData(jsonData.slice(0, 5))
      setIsUploading(false)
    } catch (err) {
      setError('Error parsing Excel file. Please ensure it is a valid schedule export.')
      console.error('Error parsing file:', err)
      setIsUploading(false)
    }
  }

  const confirmImport = () => {
    // Use the full data instead of just the preview data
    const fullData = window.fullImportData || previewData;
    if (!fullData) return

    try {
      // Log the first few rows for debugging
      console.log('First few rows of import data:', fullData.slice(0, 3));

      // Parse the data with the selected column mappings
      const parsedEmployees = fullData.map((row: any) => {
        const rawArea = row[columnMappings.area];
        const determinedArea = determineArea(rawArea);
        const shiftStart = formatTime(row[columnMappings.startTime]);
        const shiftEnd = formatTime(row[columnMappings.endTime]);
        const normalizedDay = row[columnMappings.day] ? normalizeDay(row[columnMappings.day]) : null;

        // Log area determination for debugging
        console.log(`Area determination: '${rawArea}' -> '${determinedArea}'`);
        console.log(`Time: ${shiftStart} - ${shiftEnd}`);

        return {
          id: crypto.randomUUID(),
          name: row[columnMappings.name] || 'Unknown',
          shiftStart: shiftStart,
          shiftEnd: shiftEnd,
          area: determinedArea,
          day: normalizedDay,
          // Add timeBlock field for compatibility with the DailyView component
          timeBlock: `${shiftStart} - ${shiftEnd}`
        };
      })

      setEmployees(parsedEmployees)
      setPreviewData(null) // Clear preview after import
      setError(null)

      toast({
        title: 'Success',
        description: `Imported ${parsedEmployees.length} employees from schedule`,
      })
    } catch (err) {
      setError('Error processing employee data. Please check your column mappings.')
      console.error('Error processing data:', err)
    }
  }

  // Helper function to format time consistently
  const formatTime = (timeString: string): string => {
    if (!timeString) return '00:00'

    // Clean up the time string
    const cleanTime = timeString.trim().toLowerCase();

    // Handle various time formats
    // Try to parse as 24-hour format first
    const militaryTimeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/
    if (militaryTimeRegex.test(cleanTime)) {
      return cleanTime
    }

    // Try to parse as 12-hour format with AM/PM with space
    const twelveHourRegex = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM|am|pm)$/
    if (twelveHourRegex.test(cleanTime)) {
      const [_, hours, minutes, period] = cleanTime.match(twelveHourRegex) || []
      const hour = parseInt(hours)

      if (period.toLowerCase() === 'pm' && hour < 12) {
        return `${hour + 12}:${minutes}`
      } else if (period.toLowerCase() === 'am' && hour === 12) {
        return `00:${minutes}`
      } else {
        return `${hour.toString().padStart(2, '0')}:${minutes}`
      }
    }

    // Try to parse as 12-hour format with AM/PM without space (e.g., "6:00a" or "2:00p")
    const shortTwelveHourRegex = /^(1[0-2]|0?[1-9]):([0-5]\d)([ap])$/
    if (shortTwelveHourRegex.test(cleanTime)) {
      const [_, hours, minutes, period] = cleanTime.match(shortTwelveHourRegex) || []
      const hour = parseInt(hours)
      const isPM = period.toLowerCase() === 'p'

      if (isPM && hour < 12) {
        return `${hour + 12}:${minutes}`
      } else if (!isPM && hour === 12) {
        return `00:${minutes}`
      } else {
        return `${hour.toString().padStart(2, '0')}:${minutes}`
      }
    }

    // Try to parse simple hour with AM/PM (e.g., "6a" or "2p")
    const simpleHourRegex = /^(1[0-2]|0?[1-9])([ap])$/
    if (simpleHourRegex.test(cleanTime)) {
      const [_, hours, period] = cleanTime.match(simpleHourRegex) || []
      const hour = parseInt(hours)
      const isPM = period.toLowerCase() === 'p'

      if (isPM && hour < 12) {
        return `${hour + 12}:00`
      } else if (!isPM && hour === 12) {
        return `00:00`
      } else {
        return `${hour.toString().padStart(2, '0')}:00`
      }
    }

    // Log unrecognized formats for debugging
    console.log('Unrecognized time format:', timeString);

    // If all else fails, return as is
    return timeString
  }

  // Helper function to normalize day names
  const normalizeDay = (dayString: string): string | null => {
    if (!dayString) return null

    const normalizedDay = dayString.toLowerCase().trim()

    // Map common day abbreviations and variations to standard format
    const dayMap: Record<string, string> = {
      'mon': 'monday',
      'm': 'monday',
      'tues': 'tuesday',
      'tue': 'tuesday',
      't': 'tuesday',
      'wed': 'wednesday',
      'w': 'wednesday',
      'thurs': 'thursday',
      'thu': 'thursday',
      'th': 'thursday',
      'fri': 'friday',
      'f': 'friday',
      'sat': 'saturday',
      's': 'saturday',
      'sun': 'sunday',
      'su': 'sunday'
    }

    // Check if the input matches a day name or abbreviation
    if (Object.keys(dayMap).includes(normalizedDay)) {
      return dayMap[normalizedDay]
    }

    // Check if the input starts with a day name
    for (const [abbr, fullDay] of Object.entries(dayMap)) {
      if (normalizedDay.startsWith(abbr)) {
        return fullDay
      }
    }

    // Check if the input is already a full day name
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if (days.includes(normalizedDay)) {
      return normalizedDay
    }

    // If we can't determine the day, return null
    return null
  }

  // Helper function to determine FOH/BOH area
  const determineArea = (areaString: string): 'FOH' | 'BOH' => {
    if (!areaString) return 'FOH' // Default to FOH if no area specified

    // Check if the string directly contains 'BOH' or 'FOH'
    if (areaString === 'BOH') return 'BOH'
    if (areaString === 'FOH') return 'FOH'

    const fohAreas = ['front counter', 'drive thru', 'front', 'cashier', 'service', 'dining room', 'foh']
    const bohAreas = ['kitchen', 'prep', 'cook', 'grill', 'back', 'boh']

    const normalizedArea = areaString.toLowerCase().trim()

    // First check for exact BOH/FOH matches
    if (normalizedArea === 'boh') return 'BOH'
    if (normalizedArea === 'foh') return 'FOH'

    // Then check for substring matches
    if (bohAreas.some(area => normalizedArea.includes(area))) {
      return 'BOH'
    } else if (fohAreas.some(area => normalizedArea.includes(area))) {
      return 'FOH'
    }

    // If we can't determine, log the value for debugging
    console.log('Could not determine area from:', areaString)

    // Default to the value as-is if it's BOH or FOH, otherwise default to FOH
    return areaString === 'BOH' ? 'BOH' : 'FOH'
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  const handleTemplateSave = async (template: any) => {
    try {
      console.log('Template received from TemplateBuilder:', template);

      // Check if the template already has a weekSchedule structure
      if (template.weekSchedule) {
        console.log('Template already has weekSchedule structure');
        // Use the existing structure but ensure IDs are unique
        const newTemplate = {
          name: `Template ${templates.length + 1}`,
          weekSchedule: template.weekSchedule
        };

        const createdTemplate = await createTemplate(newTemplate);
        setCurrentTemplate(createdTemplate);
        toast({
          title: 'Success',
          description: 'Template created successfully'
        });
        return;
      }

      // If it's the old format with just timeBlocks, convert it
      if (template.timeBlocks) {
        console.log('Converting old timeBlocks format to weekSchedule');
        // Create the base template structure for one day
        const dayTemplate = {
          timeBlocks: template.timeBlocks.map(block => ({
            id: crypto.randomUUID(),
            start: block.start,
            end: block.end,
            positions: block.positions.map((pos: any) => ({
              id: crypto.randomUUID(),
              name: pos.name,
              category: pos.category,
              section: pos.section,
              color: pos.color,
              count: pos.count || 1
            }))
          }))
        }

        // Create the template with the same structure for all days
        const newTemplate = {
          name: `Template ${templates.length + 1}`,
          weekSchedule: {
            monday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            tuesday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            wednesday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            thursday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            friday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            saturday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] },
            sunday: { ...dayTemplate, timeBlocks: [...dayTemplate.timeBlocks] }
          }
        }

        const createdTemplate = await createTemplate(newTemplate)
        setCurrentTemplate(createdTemplate)
        toast({
          title: 'Success',
          description: 'Template created successfully'
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create template',
        variant: 'destructive'
      })
    }
  }

  const handleAssignmentSave = (assignments: { weekSchedule: any }) => {
    setCurrentAssignments(assignments)
  }

  const handleSaveWeeklySetup = async () => {
    console.log('Save Weekly Setup button clicked');
    if (!setupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this setup",
        variant: "destructive"
      })
      return
    }

    if (!setupStartDate || !setupEndDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      })
      return
    }

    if (!currentTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive"
      })
      return
    }

    try {
      // Show saving indicator
      toast({
        title: "Saving",
        description: "Saving your weekly setup..."
      })

      // Get the current assignments directly from the EmployeeAssignment component
      // This ensures we always have the latest assignments, even if the user hasn't explicitly saved them
      const weekSchedule = document.querySelector('.employee-assignment-component');

      // If we can't get the assignments directly, use the stored assignments or template as fallback
      const finalWeekSchedule = currentAssignments?.weekSchedule || currentTemplate.weekSchedule;

      // Adjust the date range to ensure it's Sunday to Saturday
      const { startDate: adjustedStartDate, endDate: adjustedEndDate } =
        adjustToSundayToSaturdayRange(new Date(setupStartDate), new Date(setupEndDate));

      console.log('Date adjustment:', {
        original: { startDate: setupStartDate, endDate: setupEndDate },
        adjusted: { startDate: adjustedStartDate.toISOString(), endDate: adjustedEndDate.toISOString() }
      });

      // Format the end date to get just the day
      const endDay = adjustedEndDate.getDate();

      // If the setup name is empty or just "Week of", generate a name based on the end date
      let finalSetupName = setupName.trim();
      if (!finalSetupName || finalSetupName === 'Week of') {
        // Format as "Week of MM/DD" using the end date
        const month = adjustedEndDate.getMonth() + 1; // getMonth() is 0-indexed
        finalSetupName = `Week of ${month}/${endDay}`;
      }

      // Prepare employee data - only include essential fields to reduce payload size
      const simplifiedEmployees = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        timeBlock: emp.timeBlock,
        area: emp.area,
        day: emp.day
      }));

      const weeklySetup = {
        name: finalSetupName,
        startDate: adjustedStartDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
        weekSchedule: finalWeekSchedule,
        uploadedSchedules: simplifiedEmployees // Include simplified employee data
      }

      // Log the size of the data being sent
      const dataSize = JSON.stringify(weeklySetup).length;
      console.log(`Saving weekly setup: ${dataSize} bytes`);

      // Check if data is too large
      if (dataSize > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "The setup data is too large to save. Please try with fewer employees or positions.",
          variant: "destructive"
        });
        return;
      }

      // Add a small delay to ensure UI responsiveness
      await new Promise(resolve => setTimeout(resolve, 100));

      const savedSetup = await createWeeklySetup(weeklySetup);

      console.log('Setup saved successfully:', savedSetup);

      // Check if there was a warning about employee data
      if (savedSetup._warning) {
        toast({
          title: "Partial Success",
          description: "Setup saved, but employee data was too large and was not saved.",
          variant: "warning"
        });
      } else {
        toast({
          title: "Success",
          description: "Weekly setup saved successfully"
        });
      }

      setShowSaveDialog(false)

      // Navigate to the setup view
      navigate(`/setup-sheet-view/${savedSetup._id}`);
    } catch (err) {
      console.error('Error saving weekly setup:', err);

      // More detailed error message
      let errorMessage = "Failed to save weekly setup";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Filter employees based on search and area filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(employeeSearch.toLowerCase())
    const matchesFilter = employeeFilter === 'ALL' || employee.area === employeeFilter
    return matchesSearch && matchesFilter
  })

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!currentTemplate || !currentAssignments) return 0

    let totalPositions = 0
    let filledPositions = 0

    Object.values(currentAssignments.weekSchedule).forEach(day => {
      day.timeBlocks.forEach(block => {
        block.positions.forEach(position => {
          totalPositions++
          if (position.employeeId) filledPositions++
        })
      })
    })

    return totalPositions > 0 ? Math.round((filledPositions / totalPositions) * 100) : 0
  }

  const completionPercentage = calculateCompletionPercentage()

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">New Weekly Setup</h1>

        {/* Progress indicator */}
        {activeTab === 'assign' && currentTemplate && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Setup Completion</span>
              <span className="text-sm">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="upload">Upload Schedule</TabsTrigger>
            <TabsTrigger value="assign">Assign Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Upload header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Upload Schedule</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create a sample Excel file for download
                      const worksheet = XLSX.utils.json_to_sheet([
                        {
                          'Employee Name': 'John Smith',
                          'Start Time': '08:00',
                          'End Time': '16:00',
                          'Area': 'Front Counter',
                          'Day': 'Monday'
                        },
                        {
                          'Employee Name': 'Jane Doe',
                          'Start Time': '12:00',
                          'End Time': '20:00',
                          'Area': 'Drive Thru',
                          'Day': 'Tuesday'
                        },
                        {
                          'Employee Name': 'Bob Johnson',
                          'Start Time': '10:00',
                          'End Time': '18:00',
                          'Area': 'Kitchen',
                          'Day': 'Wednesday'
                        },
                        {
                          'Employee Name': 'Sarah Williams',
                          'Start Time': '09:00',
                          'End Time': '17:00',
                          'Area': 'Front Counter',
                          'Day': 'Thursday'
                        }
                      ])
                      const workbook = XLSX.utils.book_new()
                      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Template')
                      XLSX.writeFile(workbook, 'schedule-template.xlsx')
                    }}
                  >
                    Download Template
                  </Button>
                </div>

                {/* File upload area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    ${isDragActive ? 'border-primary bg-primary/10' : isUploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300'}`}
                >
                  <input {...getInputProps()} disabled={isUploading} />
                  {isDragActive ? (
                    <p>Drop the schedule file here...</p>
                  ) : isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                      <p>Processing file...</p>
                    </div>
                  ) : (
                    <div>
                      <p>Drag and drop your schedule export file here, or click to select</p>
                      <p className="text-sm text-gray-500 mt-2">Supports .xlsx and .xls files</p>
                    </div>
                  )}
                </div>

                {/* Column mapping section */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Column Mappings</h4>
                  <p className="text-sm text-gray-500 mb-4">If your file uses different column names, you can adjust the mappings here:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nameColumn" className="text-sm">Employee Name Column</Label>
                      <Input
                        id="nameColumn"
                        value={columnMappings.name}
                        onChange={(e) => setColumnMappings({...columnMappings, name: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="areaColumn" className="text-sm">Area/Position Column</Label>
                      <Input
                        id="areaColumn"
                        value={columnMappings.area}
                        onChange={(e) => setColumnMappings({...columnMappings, area: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="startTimeColumn" className="text-sm">Start Time Column</Label>
                      <Input
                        id="startTimeColumn"
                        value={columnMappings.startTime}
                        onChange={(e) => setColumnMappings({...columnMappings, startTime: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTimeColumn" className="text-sm">End Time Column</Label>
                      <Input
                        id="endTimeColumn"
                        value={columnMappings.endTime}
                        onChange={(e) => setColumnMappings({...columnMappings, endTime: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dayColumn" className="text-sm">Day Column <span className="text-xs text-gray-500">(Optional)</span></Label>
                      <Input
                        id="dayColumn"
                        value={columnMappings.day}
                        onChange={(e) => setColumnMappings({...columnMappings, day: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Load from saved setups */}
                {weeklySetups.length > 0 && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Or load from a saved setup</h3>
                    <Select
                      onValueChange={(value) => {
                        const setup = weeklySetups.find(s => s._id === value)
                        if (setup) {
                          setCurrentWeeklySetup(setup)
                          // Find the template that matches this setup's structure
                          const matchingTemplate = templates.find(t =>
                            t._id === setup._id || t.name === setup.name.replace(' Setup', ' Template')
                          )
                          if (matchingTemplate) setCurrentTemplate(matchingTemplate)
                          setCurrentAssignments({ weekSchedule: setup.weekSchedule })
                          setActiveTab('assign')
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a saved setup" />
                      </SelectTrigger>
                      <SelectContent>
                        {weeklySetups.map(setup => (
                          <SelectItem key={setup._id} value={setup._id}>
                            {setup.name} ({format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Preview data */}
              {previewData && previewData.length > 0 && (
                <div className="mt-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Preview Data</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPreviewData(null)}>Cancel</Button>
                      <Button onClick={confirmImport}>Confirm Import</Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {Object.values(columnMappings).map((column, index) => (
                            <th key={index} className="border p-2 text-left text-sm font-medium">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {Object.values(columnMappings).map((column, colIndex) => (
                              <td key={colIndex} className="border p-2 text-sm">
                                {row[column] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">Showing {previewData.length} of {window.fullImportData?.length || previewData.length} rows. All {window.fullImportData?.length || previewData.length} employees will be imported when you confirm.</p>
                </div>
              )}

              {/* Uploaded employees */}
              {employees.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Uploaded Employees</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="pl-8 w-[200px]"
                        />
                      </div>
                      <Select
                        value={employeeFilter}
                        onValueChange={(value) => setEmployeeFilter(value as 'ALL' | 'FOH' | 'BOH')}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Areas</SelectItem>
                          <SelectItem value="FOH">FOH Only</SelectItem>
                          <SelectItem value="BOH">BOH Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <DraggableEmployee key={employee.id} employee={employee} />
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-4 text-gray-500">
                        No employees match your search criteria
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>Total: {employees.length} employees</span>
                    <span>Showing: {filteredEmployees.length} employees</span>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>



          <TabsContent value="assign">
            <Card className="p-6">
              {employees.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>Please upload a schedule first</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>Please create a template first</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="template-select" className="text-sm font-medium">
                      Select Template
                    </Label>
                    <Select
                      value={currentTemplate?._id || ''}
                      onValueChange={(value) => {
                        const template = templates.find(t => t._id === value)
                        setCurrentTemplate(template || null)
                      }}
                    >
                      <SelectTrigger className="w-full" id="template-select">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template preview */}
                  {currentTemplate && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-2">Template Preview</h3>
                      <div className="text-sm">
                        <p><span className="font-medium">Name:</span> {currentTemplate.name}</p>
                        <p className="mt-1"><span className="font-medium">Time Blocks:</span></p>
                        <ul className="list-disc list-inside ml-2">
                          {currentTemplate.weekSchedule?.monday?.timeBlocks?.map((block, index) => (
                            <li key={index}>{block.start} - {block.end} ({block.positions?.length || 0} positions)</li>
                          )) || <li>No time blocks defined</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentTemplate ? (
                    <>
                      <EmployeeAssignment
                        employees={filteredEmployees.length > 0 ? filteredEmployees : employees}
                        template={currentTemplate}
                        onSave={handleAssignmentSave}
                        showSaveButton={false}
                      />

                      {/* Save Weekly Setup Button */}
                      <SaveSetupDialog
                        showSaveDialog={showSaveDialog}
                        setShowSaveDialog={setShowSaveDialog}
                        setupName={setupName}
                        setSetupName={setSetupName}
                        setupStartDate={setupStartDate}
                        setSetupStartDate={setSetupStartDate}
                        setupEndDate={setupEndDate}
                        setSetupEndDate={setSetupEndDate}
                        handleSaveWeeklySetup={handleSaveWeeklySetup}
                        adjustToSundayToSaturdayRange={adjustToSundayToSaturdayRange}
                        completionPercentage={completionPercentage}
                        currentTemplateName={currentTemplate.name}
                        employeesCount={employees.length}
                      />
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Please select a template</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  )
}
