import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adjustToSundayToSaturdayRange } from '@/lib/dateUtils'
import { SaveSetupDialog } from '@/components/setup-sheet/SaveSetupDialog'
import { useDropzone } from 'react-dropzone'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Search } from 'lucide-react'
import * as ExcelJS from 'exceljs'
import { DraggableEmployee } from '@/components/setup-sheet/DraggableEmployee'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
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
    setEmployees,
    setCurrentTemplate,
    setCurrentWeeklySetup,
    setCurrentAssignments,
    fetchTemplates,
    fetchWeeklySetups,
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
  const [isShared, setIsShared] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [columnMappings] = useState({
    name: 'Employee Name',
    startTime: 'Start Time',
    endTime: 'End Time',
    area: 'Area',
    day: 'Day'
  })
  const { toast } = useToast()
  const navigate = useNavigate()

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
      let jsonData: any[] = []

      // Check if it's a PDF file
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files, we'll handle processing on the server side
        // Just set a placeholder for now to show the file was accepted
        jsonData = [{
          'File Type': 'PDF',
          'Status': 'Ready for processing',
          'Note': 'PDF will be processed when uploaded to setup'
        }]
      } else {
        // Process Excel/CSV files as before
        const data = await file.arrayBuffer()
        console.log('File size:', data.byteLength, 'bytes')

        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(data)
        console.log('Workbook sheets:', workbook.worksheets.map(ws => ws.name))

        const worksheet = workbook.worksheets[0]
        console.log('Worksheet name:', worksheet.name)

        // Convert worksheet to array of arrays
        const rawData: any[][] = []
        worksheet.eachRow((row, rowNumber) => {
          const rowData: any[] = []
          row.eachCell((cell, colNumber) => {
            rowData[colNumber - 1] = cell.value
          })
          rawData.push(rowData)
        })

        console.log('Raw parsed data (first 3 rows):', rawData.slice(0, 3))

        // Convert array of arrays to array of objects
        if (rawData.length > 0) {
          const headers = rawData[0] as string[]
          const dataRows = rawData.slice(1)

          jsonData = dataRows.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index]
              }
            })
            return obj
          }).filter(row => Object.values(row).some(val => val && val.toString().trim()))
        }

        console.log('Converted to objects (first 3 rows):', jsonData.slice(0, 3))

        if (jsonData.length === 0) {
          setError('The uploaded file contains no data. Please check the file and try again.')
          setIsUploading(false)
          return
        }
      }

      // Check if this is a weekly roster format (has day columns like Sun, Mon, etc.)
      const firstRow = jsonData[0] as Record<string, any>
      console.log('First row columns:', Object.keys(firstRow))
      console.log('First row data:', firstRow)

      const dayColumns = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const hasWeeklyFormat = dayColumns.some(day => day in firstRow)

      // Also check for date-based columns that might indicate a weekly roster
      const columnNames = Object.keys(firstRow)
      const hasDateColumns = columnNames.some(col => {
        const colLower = col.toLowerCase()
        return colLower.includes('5/18') || colLower.includes('5/19') || colLower.includes('5/20') ||
               colLower.includes('5/21') || colLower.includes('5/22') || colLower.includes('5/23') ||
               colLower.includes('5/24') || colLower.includes('may') ||
               /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(col) || // Date pattern like 5/18/25
               /\w+,\s*\d{1,2}\/\d{1,2}\/\d{2,4}/.test(col) // Day, date pattern
      })

      // Check for day names at the start of column headers (like "Sun, 5/18/25")
      const hasDayHeaders = columnNames.some(col => {
        const colStart = col.toLowerCase().substring(0, 3)
        return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
      })

      // Check if this looks like a weekly roster based on multiple employees and time data
      const hasMultipleEmployees = jsonData.length > 1
      const hasTimeData = columnNames.some(col => {
        const sampleData = firstRow[col]
        return sampleData && typeof sampleData === 'string' &&
               (sampleData.includes('AM') || sampleData.includes('PM') || sampleData.includes(':'))
      })

      const isWeeklyRoster = hasWeeklyFormat || hasDateColumns || hasDayHeaders || (hasMultipleEmployees && hasTimeData)

      console.log('Weekly format detected:', hasWeeklyFormat)
      console.log('Date columns detected:', hasDateColumns)
      console.log('Time data detected:', hasTimeData)
      console.log('Is weekly roster:', isWeeklyRoster)
      console.log('Day columns found:', dayColumns.filter(day => day in firstRow))

      if (isWeeklyRoster) {
        // This is a weekly roster format - validate differently
        const hasEmployeeColumn = Object.keys(firstRow).some(key =>
          key.toLowerCase().includes('employee') ||
          key.toLowerCase().includes('name') ||
          key === 'Employee' ||
          key === 'Name'
        )

        if (!hasEmployeeColumn) {
          setError('Weekly roster format detected, but no employee name column found. Please ensure the first column contains employee names.')
          setIsUploading(false)
          return
        }

        // For weekly roster, we don't need to validate shift data in the first row
        // since employees might not have shifts on all days
        console.log('Weekly roster validation passed - skipping shift data validation')

        toast({
          title: 'Weekly Roster Detected',
          description: 'Weekly roster format detected. The system will parse shifts from day columns.',
          variant: 'default'
        })
      } else {
        // Standard format validation
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
      }

      // Store the full data in a ref or state for later use
      window.fullImportData = jsonData;

      // Set preview data for user to confirm (show all rows)
      setPreviewData(jsonData)
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
      // Check if this is a weekly roster format
      const firstRow = fullData[0] as Record<string, any>
      const columnNames = Object.keys(firstRow)
      const hasDayHeaders = columnNames.some(col => {
        const colStart = col.toLowerCase().substring(0, 3)
        return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
      })

      if (hasDayHeaders) {
        // This is a weekly roster - process differently and save directly

        // For weekly roster, parse the actual shift data from the Excel file
        const parsedEmployees = [];

        fullData.forEach((row: any) => {
          const rawEmployeeName = row.Employee || row.employee || row.Name || row.name ||
                                  row['Employee Name'] || row[Object.keys(row)[0]];

          if (!rawEmployeeName || typeof rawEmployeeName !== 'string' || !rawEmployeeName.trim()) {
            return;
          }

          const employeeName = cleanEmployeeName(rawEmployeeName);

          // Get all date columns (skip the employee name column)
          const dateColumns = Object.keys(row).filter(key =>
            key !== 'Employee' && key !== 'employee' && key !== 'Name' && key !== 'name' &&
            key !== 'Employee Name' && (key.includes('/') || key.includes(','))
          );

          // Process each date column to extract shifts
          dateColumns.forEach(dateCol => {
            const cellValue = row[dateCol];
            if (!cellValue || cellValue.toString().trim() === '') return;



            // Parse the day from column header (e.g., "Sun, 5/18/25" -> "Sun")
            let dayOfWeek = '';
            if (dateCol.includes(',')) {
              dayOfWeek = dateCol.split(',')[0].trim();
            }

            // Convert short day names to full day names for consistency with daily view
            const dayMap: Record<string, string> = {
              'Sun': 'sunday',
              'Mon': 'monday',
              'Tue': 'tuesday',
              'Wed': 'wednesday',
              'Thu': 'thursday',
              'Fri': 'friday',
              'Sat': 'saturday'
            }
            dayOfWeek = dayMap[dayOfWeek] || dayOfWeek.toLowerCase()

            // Split cell value by newlines to handle multiple shifts
            const shifts = cellValue.toString().split(/\r?\n/).filter(shift => shift.trim());

            // Process the entire cell content to extract time and position info
            const cellContent = shifts.join(' ').toLowerCase();

            // Look for time patterns in any of the lines
            let timeMatch = null;
            let startTime = '';
            let endTime = '';

            for (const shift of shifts) {
              const match = shift.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
              if (match) {
                timeMatch = match;
                startTime = match[1].trim();
                endTime = match[2].trim();
                break;
              }
            }

            if (timeMatch) {
              // Convert to 24-hour format
              startTime = convertTo24HourFormat(startTime);
              endTime = convertTo24HourFormat(endTime);

              // Determine department from the entire cell content (all lines combined)
              let department = 'FOH'; // Default

              if (cellContent.includes('back of house') ||
                  cellContent.includes('boh') ||
                  cellContent.includes('kitchen') ||
                  cellContent.includes('prep') ||
                  cellContent.includes('cook') ||
                  cellContent.includes('grill')) {
                department = 'BOH';
              } else if (cellContent.includes('front of house') ||
                        cellContent.includes('foh') ||
                        cellContent.includes('cashier') ||
                        cellContent.includes('front counter') ||
                        cellContent.includes('drive thru') ||
                        cellContent.includes('service')) {
                department = 'FOH';
              }

              parsedEmployees.push({
                id: crypto.randomUUID(),
                name: employeeName.trim(),
                shiftStart: startTime,
                shiftEnd: endTime,
                area: department,
                day: dayOfWeek,
                timeBlock: `${startTime} - ${endTime}`,
                isWeeklyRoster: true,
                originalData: row
              });
            }
          });
        });

        setEmployees(parsedEmployees)
        setPreviewData(null)
        setError(null)

        // Show the setup configuration dialog immediately
        setShowSaveDialog(true);

        toast({
          title: 'Weekly Roster Imported',
          description: `Imported ${parsedEmployees.length} shifts from weekly roster.`,
        })
      } else {
        // Standard format processing
        const parsedEmployees = fullData.map((row: any) => {
          const rawArea = row[columnMappings.area];
          const determinedArea = determineArea(rawArea);
          const shiftStart = formatTime(row[columnMappings.startTime]);
          const shiftEnd = formatTime(row[columnMappings.endTime]);
          const normalizedDay = row[columnMappings.day] ? normalizeDay(row[columnMappings.day]) : null;

          return {
            id: crypto.randomUUID(),
            name: cleanEmployeeName(row[columnMappings.name]) || 'Unknown',
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
      }
    } catch (err) {
      setError('Error processing employee data. Please check your column mappings.')
      console.error('Error processing data:', err)
    }
  }

  // Helper function to clean employee names (remove phone numbers and brackets)
  const cleanEmployeeName = (name: string): string => {
    if (!name || typeof name !== 'string') return '';

    // Remove phone numbers in various formats: (123) 456-7890, 123-456-7890, 123.456.7890, 878 -0672, etc.
    let cleaned = name.replace(/\s*\(?\d{3}\)?\s*[-.\s]?\d{3}\s*[-.\s]?\d{4}\s*/g, '');

    // Remove any remaining phone number fragments like "878 -0672" or "-0672"
    cleaned = cleaned.replace(/\s*\d{3}\s*-\s*\d{4}\s*/g, '');
    cleaned = cleaned.replace(/\s*-\s*\d{4}\s*/g, '');

    // Remove brackets and their contents: [] () {}
    cleaned = cleaned.replace(/\s*[\[\(\{][^\]\)\}]*[\]\)\}]\s*/g, '');

    // Remove extra whitespace and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  };

  // Helper function to convert time to 24-hour format for weekly roster
  const convertTo24HourFormat = (timeStr: string): string => {
    if (!timeStr) return '00:00';

    // If already in 24-hour format, return as is
    if (!/AM|PM/i.test(timeStr)) {
      return timeStr.padStart(5, '0');
    }

    const [time, period] = timeStr.split(/\s*(AM|PM)/i);
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = minutes || '00';

    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Helper function to format time consistently
  const formatTime = (timeString: string | number): string => {
    if (!timeString) return '00:00'

    // Handle Excel decimal time format (e.g., 0.6770833333333334 = 4:15 PM)
    if (typeof timeString === 'number' || !isNaN(Number(timeString))) {
      const decimalTime = typeof timeString === 'number' ? timeString : Number(timeString);

      // Excel stores times as decimal fractions of a 24-hour day
      // 0.5 = 12:00 PM, 0.75 = 6:00 PM, etc.
      const totalMinutes = Math.round(decimalTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // For string time formats
    // Clean up the time string
    const cleanTime = timeString.toString().trim().toLowerCase();

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

    // If all else fails, return as is
    return timeString.toString()
  }

  // Helper function to normalize day names
  const normalizeDay = (dayString: string): string | null => {
    if (!dayString) return null

    // Convert to string in case we get a number or other type
    const dayStr = String(dayString).toLowerCase().trim()

    // Map common day abbreviations and variations to standard format
    const dayMap: Record<string, string> = {
      // Full names
      'monday': 'monday',
      'tuesday': 'tuesday',
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday',
      'sunday': 'sunday',
      // Common abbreviations
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
      'su': 'sunday',
      // Numbers (Excel might use these)
      '1': 'monday',
      '2': 'tuesday',
      '3': 'wednesday',
      '4': 'thursday',
      '5': 'friday',
      '6': 'saturday',
      '0': 'sunday',
      '7': 'sunday'
    }

    // Direct lookup in the map
    if (dayMap[dayStr]) {
      return dayMap[dayStr]
    }

    // Check if the input starts with a day name
    for (const [abbr, fullDay] of Object.entries(dayMap)) {
      if (dayStr.startsWith(abbr) && abbr.length > 1) { // Only use abbr with length > 1 to avoid false matches
        return fullDay
      }
    }

    // Try to extract day name from a date string (e.g., "Thursday, June 15")
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for (const day of dayNames) {
      if (dayStr.includes(day)) {
        return day
      }
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

    // Default to the value as-is if it's BOH or FOH, otherwise default to FOH
    return areaString === 'BOH' ? 'BOH' : 'FOH'
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf']
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
    if (!setupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this setup",
        variant: "destructive"
      })
      return
    }

    // Set saving state to true to show loading indicators
    setIsSaving(true);

    if (!setupStartDate || !setupEndDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      })
      setIsSaving(false);
      return
    }

    // Check if we have weekly roster employees
    const hasWeeklyRosterEmployees = employees.some(emp => emp.isWeeklyRoster);

    if (!currentTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive"
      })
      setIsSaving(false);
      return
    }

    try {
      // Show saving indicator
      const savingToast = toast({
        title: "Saving",
        description: "Preparing your weekly setup..."
      })

      // Get the current assignments directly from the EmployeeAssignment component
      // This ensures we always have the latest assignments, even if the user hasn't explicitly saved them
      const weekSchedule = document.querySelector('.employee-assignment-component');

      // If we can't get the assignments directly, use the stored assignments or template as fallback
      let finalWeekSchedule;
      if (hasWeeklyRosterEmployees) {
        // For weekly roster imports, use the template structure but without employee assignments
        finalWeekSchedule = currentTemplate.weekSchedule;
      } else {
        finalWeekSchedule = currentAssignments?.weekSchedule || currentTemplate.weekSchedule;
      }

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

      // Update the toast to show progress
      toast({
        title: "Saving",
        description: "Processing employee data...",
        id: savingToast
      })

      // Prepare employee data - optimize for weekly roster imports
      let simplifiedEmployees = [];

      console.log('Preparing employee data for save:', {
        totalEmployees: employees.length,
        hasWeeklyRosterEmployees,
        sampleEmployee: employees[0]
      });

      if (hasWeeklyRosterEmployees) {
        // For weekly roster imports, use the data as-is (already processed)
        simplifiedEmployees = employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          timeBlock: emp.timeBlock,
          area: emp.area,
          day: emp.day,
          shiftStart: emp.shiftStart,
          shiftEnd: emp.shiftEnd,
          isWeeklyRoster: true,
          originalData: emp.originalData
        }));

        console.log('Simplified employees for weekly roster:', {
          count: simplifiedEmployees.length,
          sampleEmployee: simplifiedEmployees[0]
        });
      } else {
        // For regular imports, process in batches to avoid UI freezing
        const batchSize = 100;
        const employeesWithDay = employees.filter(emp => emp.day);

        for (let i = 0; i < employeesWithDay.length; i += batchSize) {
          const batch = employeesWithDay.slice(i, i + batchSize);

          // Update progress toast
          if (employeesWithDay.length > batchSize) {
            toast({
              title: "Saving",
              description: `Processing employees: ${Math.min(i + batchSize, employeesWithDay.length)}/${employeesWithDay.length}`,
              id: savingToast
            })
          }

          // Process this batch
          const batchResult = batch.map(emp => ({
            id: emp.id,
            name: emp.name,
            timeBlock: emp.timeBlock,
            area: emp.area,
            day: normalizeDay(emp.day)
          }));

          simplifiedEmployees = [...simplifiedEmployees, ...batchResult];

          // Add a small delay to keep UI responsive
          if (employeesWithDay.length > batchSize) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }

      // Update toast for next step
      let optimizedWeekSchedule;

      if (hasWeeklyRosterEmployees) {
        // For weekly roster imports, use the minimal schedule as-is (no optimization needed)
        optimizedWeekSchedule = finalWeekSchedule;

        toast({
          title: "Saving",
          description: "Preparing weekly roster setup...",
          id: savingToast
        });
      } else {
        // For regular imports, optimize the schedule
        toast({
          title: "Saving",
          description: "Optimizing schedule data...",
          id: savingToast
        });

        // Optimize weekSchedule by removing empty timeBlocks and positions
        optimizedWeekSchedule = Object.entries(finalWeekSchedule).reduce((acc, [day, daySchedule]) => {
          // Skip days with no time blocks
          if (!daySchedule.timeBlocks || daySchedule.timeBlocks.length === 0) {
            return acc;
          }

          // Filter out empty time blocks and optimize positions
          const optimizedTimeBlocks = daySchedule.timeBlocks
            .filter(block => block.positions && block.positions.length > 0)
            .map(block => ({
              ...block,
              // Only keep essential position data
              positions: block.positions.map(pos => ({
                id: pos.id,
                name: pos.name,
                category: pos.category,
                section: pos.section,
                employeeId: pos.employeeId,
                employeeName: pos.employeeName
              }))
            }));

          // Only add days with time blocks
          if (optimizedTimeBlocks.length > 0) {
            acc[day] = { timeBlocks: optimizedTimeBlocks };
          }

          return acc;
        }, {});
      }

      const weeklySetup = {
        name: finalSetupName,
        startDate: adjustedStartDate.toISOString(),
        endDate: adjustedEndDate.toISOString(),
        weekSchedule: optimizedWeekSchedule,
        uploadedSchedules: simplifiedEmployees, // Include simplified employee data
        isShared: isShared // Include sharing setting
      }

      // Log the size of the data being sent
      const dataSize = JSON.stringify(weeklySetup).length;
      console.log(`Saving weekly setup: ${dataSize} bytes`);
      console.log('Weekly setup data:', {
        name: weeklySetup.name,
        employeeCount: simplifiedEmployees.length,
        weeklyRosterEmployees: simplifiedEmployees.filter(emp => emp.isWeeklyRoster).length,
        sampleEmployee: simplifiedEmployees[0]
      });

      // Check if data is too large
      if (dataSize > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "The setup data is too large to save. Please try with fewer employees or positions.",
          variant: "destructive"
        });
        return;
      }

      // Update toast for final step
      toast({
        title: "Saving",
        description: "Sending data to server...",
        id: savingToast
      })

      // Add a small delay to ensure UI responsiveness
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set a timeout to update the toast if the save is taking a long time
      const timeoutId = setTimeout(() => {
        toast({
          title: "Still Saving",
          description: "This is taking longer than expected. Please wait...",
          id: savingToast
        })
      }, 5000); // Show after 5 seconds

      try {
        const savedSetup = await createWeeklySetup(weeklySetup);
        clearTimeout(timeoutId); // Clear the timeout

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
        setIsSaving(false) // Reset saving state

        // Navigate to the setup view
        navigate(`/setup-view/${savedSetup._id}`);
      } catch (err) {
        clearTimeout(timeoutId); // Clear the timeout on error
        setIsSaving(false) // Reset saving state on error
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
    } catch (outerErr) {
      setIsSaving(false) // Reset saving state on error
      console.error('Outer error in save process:', outerErr);

      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Weekly Schedule Setup</h1>
          <p className="text-gray-600">Upload your HotSchedules weekly report to create employee assignments</p>
        </div>

        {/* Instructions Section */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">How to Export from HotSchedules</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Steps 1-5: Export from HotSchedules</h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Log in to HotSchedules</li>
                    <li>Click on scheduling to view the week's schedule</li>
                    <li>Navigate to the week you want to upload</li>
                    <li>Top right corner: click Reports → Weekly Report</li>
                    <li>Click Download button (top right) to get PDF</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Steps 6-9: Convert & Upload</h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside" start={6}>
                    <li>Go to <a href="https://www.ilovepdf.com/pdf_to_excel" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">ilovepdf.com/pdf_to_excel</a></li>
                    <li>Convert PDF to Excel format and download</li>
                    <li>Open Excel file and delete the first row</li>
                    <li>Save and upload the file below</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* Main Upload Section */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Upload header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Upload Your Schedule File</h2>
              <p className="text-gray-600">Drag and drop your converted Excel file or click to browse</p>
            </div>

            {/* File upload area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? 'border-blue-400 bg-blue-50 scale-105'
                  : isUploading
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
            >
              <input {...getInputProps()} disabled={isUploading} />
              {isDragActive ? (
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-blue-700">Drop your file here</p>
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-lg font-medium">Processing file...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">Choose your Excel file</p>
                  <p className="text-gray-500 mb-4">Drag and drop or click to browse</p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">.xlsx</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">.xls</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">.pdf</span>
                  </div>
                </div>
              )}
            </div>



            {/* Load from saved setups */}
            {weeklySetups.length > 0 && (
              <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Load from Previous Setup</h3>
                <p className="text-sm text-gray-600 mb-4">You can also load a previously saved weekly setup</p>
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
                      // Navigate to daily view instead of assign tab
                      navigate('/daily-view')
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

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview data */}
            {previewData && previewData.length > 0 && (
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Preview Data</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreviewData(null)}>Cancel</Button>
                    <Button onClick={confirmImport}>Confirm Import</Button>
                  </div>
                </div>

                  {/* Parse Preview for Weekly Roster */}
                  {(() => {
                    const firstRow = previewData[0] as Record<string, any>
                    const columnNames = Object.keys(firstRow)
                    const hasDayHeaders = columnNames.some(col => {
                      const colStart = col.toLowerCase().substring(0, 3)
                      return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
                    })

                    if (hasDayHeaders) {
                      // Show what will be parsed
                      const parsePreview = []
                      previewData.forEach((row, rowIndex) => {
                        const rawEmployeeName = row[Object.keys(row)[0]] // First column is employee name
                        if (!rawEmployeeName) return
                        const employeeName = cleanEmployeeName(rawEmployeeName)

                        const dateColumns = columnNames.filter(col => {
                          const colStart = col.toLowerCase().substring(0, 3)
                          return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
                        })

                        dateColumns.forEach(dateCol => {
                          const cellValue = row[dateCol]
                          if (!cellValue || cellValue.toString().trim() === '') return

                          // Parse the day from column header
                          let dayOfWeek = ''
                          if (dateCol.includes(',')) {
                            dayOfWeek = dateCol.split(',')[0].trim()
                          }

                          // Convert short day names to full day names for consistency
                          const dayMap: Record<string, string> = {
                            'Sun': 'sunday',
                            'Mon': 'monday',
                            'Tue': 'tuesday',
                            'Wed': 'wednesday',
                            'Thu': 'thursday',
                            'Fri': 'friday',
                            'Sat': 'saturday'
                          }
                          dayOfWeek = dayMap[dayOfWeek] || dayOfWeek.toLowerCase()

                          // Split cell value by newlines to handle multiple shifts
                          const shifts = cellValue.toString().split(/\r?\n/).filter(shift => shift.trim())

                          shifts.forEach(shift => {
                            // Look for time patterns
                            const timeMatch = shift.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
                            if (timeMatch) {
                              let startTime = timeMatch[1].trim()
                              let endTime = timeMatch[2].trim()

                              // Determine department
                              let department = 'FOH'
                              if (shift.toLowerCase().includes('back of house') || shift.toLowerCase().includes('boh')) {
                                department = 'BOH'
                              } else if (shift.toLowerCase().includes('front of house') || shift.toLowerCase().includes('foh')) {
                                department = 'FOH'
                              }

                              parsePreview.push({
                                employee: employeeName,
                                day: dayOfWeek,
                                time: `${startTime} - ${endTime}`,
                                area: department,
                                originalText: shift
                              })
                            }
                          })
                        })
                      })

                      if (parsePreview.length > 0) {
                        return (
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Parsed Shifts Preview</h4>
                            <p className="text-sm text-blue-700 mb-3">This shows how your data will be interpreted:</p>
                            <div className="max-h-40 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {parsePreview.slice(0, 10).map((shift, index) => (
                                  <div key={index} className="bg-white p-2 rounded border">
                                    <div className="font-medium">{shift.employee}</div>
                                    <div className="text-gray-600">{shift.day} • {shift.time} • {shift.area}</div>
                                  </div>
                                ))}
                              </div>
                              {parsePreview.length > 10 && (
                                <p className="text-xs text-blue-600 mt-2">
                                  Showing first 10 of {parsePreview.length} total shifts
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      }
                    }
                    return null
                  })()}

                  <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {(() => {
                            // Check if this is weekly roster format
                            const firstRow = previewData[0] as Record<string, any>
                            const columnNames = Object.keys(firstRow)
                            const hasDayHeaders = columnNames.some(col => {
                              const colStart = col.toLowerCase().substring(0, 3)
                              return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
                            })

                            if (hasDayHeaders) {
                              // Show actual column headers for weekly roster
                              return columnNames.map((column, index) => (
                                <th key={index} className="border p-2 text-left text-sm font-medium">{column}</th>
                              ))
                            } else {
                              // Show standard column mappings
                              return Object.values(columnMappings).map((column, index) => (
                                <th key={index} className="border p-2 text-left text-sm font-medium">{column}</th>
                              ))
                            }
                          })()}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {(() => {
                              // Check if this is weekly roster format
                              const firstRow = previewData[0] as Record<string, any>
                              const columnNames = Object.keys(firstRow)
                              const hasDayHeaders = columnNames.some(col => {
                                const colStart = col.toLowerCase().substring(0, 3)
                                return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(colStart)
                              })

                              if (hasDayHeaders) {
                                // Show actual data for weekly roster
                                return columnNames.map((column, colIndex) => (
                                  <td key={colIndex} className="border p-2 text-sm min-w-[150px] whitespace-pre-wrap" title={row[column] || ''}>
                                    {row[column] || '-'}
                                  </td>
                                ))
                              } else {
                                // Show standard column data
                                return Object.values(columnMappings).map((column, colIndex) => (
                                  <td key={colIndex} className="border p-2 text-sm min-w-[120px] whitespace-pre-wrap">
                                    {row[column] || '-'}
                                  </td>
                                ))
                              }
                            })()}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                <p className="text-sm text-gray-500 mt-4">Showing all {previewData.length} rows. All {previewData.length} employees will be imported when you confirm.</p>
              </div>
            )}

            {/* Uploaded employees */}
            {employees.length > 0 && !employees.some(emp => emp.isWeeklyRoster) && (
              <div className="border rounded-lg p-6 bg-white">
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
          </div>
        </Card>

        {/* Save Weekly Setup Dialog - Only show when employees are uploaded */}
        {employees.length > 0 && (
          <SaveSetupDialog
            showSaveDialog={showSaveDialog}
            setShowSaveDialog={setShowSaveDialog}
            setupName={setupName}
            setSetupName={setSetupName}
            setupStartDate={setupStartDate}
            setSetupStartDate={setSetupStartDate}
            setupEndDate={setupEndDate}
            setSetupEndDate={setSetupEndDate}
            isShared={isShared}
            setIsShared={setIsShared}
            handleSaveWeeklySetup={handleSaveWeeklySetup}
            adjustToSundayToSaturdayRange={adjustToSundayToSaturdayRange}
            completionPercentage={100} // Always 100% since we're auto-creating
            currentTemplateName="Weekly Roster Import"
            employeesCount={employees.length}
            templates={templates}
            currentTemplate={currentTemplate}
            setCurrentTemplate={setCurrentTemplate}
            showTemplateSelection={employees.some(emp => emp.isWeeklyRoster)}
          />
        )}
      </div>
    </DndProvider>
  )
}
