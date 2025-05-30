import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings,
  AlertTriangle,
  Plus,
  History,
  Wrench,
  Thermometer,
  Trash2,
  Pencil,
  Brush,
  CalendarClock,
  Calendar,
  MessageSquare,
  Timer,
  BarChart,
  ChevronUp,
  ChevronDown,
  User
} from 'lucide-react'
import { EquipmentIcon } from './components/EquipmentIcon'
import { useSnackbar } from 'notistack'
import { kitchenService, EquipmentStatus, EquipmentConfig, EquipmentItem, MaintenanceRecord, CleaningSchedule } from '@/services/kitchenService'
import { cn } from "@/lib/utils"
import { format, formatDistanceStrict, formatDistanceToNow } from 'date-fns'

// Import cleaning schedule components
import CleaningScheduleDialog from './components/CleaningScheduleDialog'
import CompleteCleaningDialog from './components/CompleteCleaningDialog'
import CleaningHistoryDialog from './components/CleaningHistoryDialog'

interface EquipmentCategories {
  cooking: EquipmentItem[]
  refrigeration: EquipmentItem[]
  preparation: EquipmentItem[]
  cleaning: EquipmentItem[]
}

interface EditEquipmentItem extends EquipmentItem {
  isNew?: boolean
  isDeleted?: boolean
}

// Equipment categories and their items
const EQUIPMENT_ITEMS: EquipmentCategories = {
  cooking: [
    { id: 'primary_fryers', name: 'Primary Fryers', maintenanceInterval: 30 },
    { id: 'secondary_fryers', name: 'Secondary Fryers', maintenanceInterval: 30 },
    { id: 'grills', name: 'Grills', maintenanceInterval: 90 },
    { id: 'pressure_fryers', name: 'Pressure Fryers', maintenanceInterval: 30 },
  ],
  refrigeration: [
    { id: 'walk_in_cooler', name: 'Walk-in Cooler', maintenanceInterval: 90 },
    { id: 'walk_in_freezer', name: 'Walk-in Freezer', maintenanceInterval: 90 },
    { id: 'prep_coolers', name: 'Prep Area Coolers', maintenanceInterval: 60 },
    { id: 'line_coolers', name: 'Line Coolers', maintenanceInterval: 60 },
  ],
  preparation: [
    { id: 'prep_tables', name: 'Prep Tables', maintenanceInterval: 30 },
    { id: 'slicers', name: 'Slicers', maintenanceInterval: 7 },
    { id: 'mixers', name: 'Mixers', maintenanceInterval: 30 },
    { id: 'scales', name: 'Scales', maintenanceInterval: 90 },
  ],
  cleaning: [
    { id: 'dish_machine', name: 'Dish Machine', maintenanceInterval: 30 },
    { id: 'sanitizer_dispensers', name: 'Sanitizer Dispensers', maintenanceInterval: 30 },
    { id: 'soap_dispensers', name: 'Soap Dispensers', maintenanceInterval: 30 },
  ]
}

const STATUS_COLORS = {
  operational: 'bg-green-100 text-green-600 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  repair: 'bg-red-100 text-red-600 border-red-200',
  offline: 'bg-gray-100 text-gray-600 border-gray-200'
} as const

type CategoryType = keyof typeof EQUIPMENT_ITEMS

export default function Equipment() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [equipmentStatuses, setEquipmentStatuses] = useState<Record<string, EquipmentStatus>>({})
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('cooking')
  const [editDialog, setEditDialog] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [maintenanceDialog, setMaintenanceDialog] = useState(false)
  const [maintenanceNotes, setMaintenanceNotes] = useState('')
  const [issueDialog, setIssueDialog] = useState(false)
  const [newIssue, setNewIssue] = useState('')
  const [editConfigDialog, setEditConfigDialog] = useState(false)
  const [editingItems, setEditingItems] = useState<EditEquipmentItem[]>([])
  const [equipmentConfig, setEquipmentConfig] = useState<EquipmentConfig | null>(null)
  const [maintenanceHistoryDialog, setMaintenanceHistoryDialog] = useState(false)
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([])
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<{ date: string } | null>(null)
  const [noteDialog, setNoteDialog] = useState(false)
  const [recordToUpdate, setRecordToUpdate] = useState<MaintenanceRecord | null>(null)
  const [newNote, setNewNote] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [resolveDialog, setResolveDialog] = useState(false)
  const [repairNotes, setRepairNotes] = useState('')
  const [repairCost, setRepairCost] = useState('')
  const [repairPerson, setRepairPerson] = useState('')
  const [updateDialog, setUpdateDialog] = useState(false)
  const [updateNotes, setUpdateNotes] = useState('')
  const [updateStatus, setUpdateStatus] = useState('in_progress')

  // Cleaning schedule state
  const [cleaningScheduleDialog, setCleaningScheduleDialog] = useState(false)
  const [selectedCleaningSchedule, setSelectedCleaningSchedule] = useState<CleaningSchedule | null>(null)
  const [completeCleaningDialog, setCompleteCleaningDialog] = useState(false)
  const [cleaningHistoryDialog, setCleaningHistoryDialog] = useState(false)

  // Add state for equipment updates (near the top of the component)
  const [equipmentUpdates, setEquipmentUpdates] = useState<Record<string, MaintenanceRecord[]>>({});

  // Add a function to load equipment updates
  const loadEquipmentUpdates = async (equipmentId: string) => {
    try {
      const history = await kitchenService.getEquipmentHistory(equipmentId);

      // Filter for only update records
      const updateRecords = history.filter(record =>
        record.type === 'note' ||
        (record.notes && (
          record.notes.startsWith('[UPDATE]') ||
          record.notes.startsWith('[PARTS ORDERED]') ||
          record.notes.startsWith('[REPAIR SCHEDULED]') ||
          record.notes.startsWith('[IN PROGRESS]') ||
          record.notes.startsWith('[WAITING APPROVAL]')
        ))
      );

      setEquipmentUpdates(prev => ({
        ...prev,
        [equipmentId]: updateRecords
      }));
    } catch (error) {
      console.error('Error loading equipment updates:', error);
    }
  };

  useEffect(() => {
    loadEquipmentData()
    loadEquipmentConfig()
  }, [])

  // Add another useEffect to load updates when equipmentStatuses changes
  useEffect(() => {
    // Load updates for broken equipment
    Object.entries(equipmentStatuses).forEach(([id, status]) => {
      if (status.status === 'repair') {
        loadEquipmentUpdates(id);
      }
    });
  }, [equipmentStatuses]);

  const loadEquipmentData = async () => {
    try {
      setLoading(true)
      const data = await kitchenService.getEquipmentStatuses()
      setEquipmentStatuses(data)
    } catch (error) {
      console.error('Error loading equipment data:', error)
      enqueueSnackbar('Failed to load equipment data', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadEquipmentConfig = async () => {
    try {
      const config = await kitchenService.getEquipmentConfig()
      setEquipmentConfig(config)
    } catch (error) {
      console.error('Error loading equipment config:', error)
      enqueueSnackbar('Failed to load equipment configuration', { variant: 'error' })
    }
  }

  const handleStatusUpdate = async (equipmentId: string, newStatus: EquipmentStatus) => {
    try {
      // Status update being sent
      await kitchenService.updateEquipmentStatus(equipmentId, newStatus)
      enqueueSnackbar('Equipment status updated successfully', { variant: 'success' })
      loadEquipmentData()
    } catch (error: any) {
      console.error('Error updating equipment status:', error)

      // Provide more detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update equipment status'
      enqueueSnackbar(errorMessage, { variant: 'error' })

      // Re-throw the error so the calling function can handle it
      throw error
    }
  }

  const handleMaintenanceComplete = async () => {
    if (!selectedEquipment) return

    try {
      const now = new Date()
      // Use current equipment config or fall back to default items
      const currentItems = equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory]
      const equipment = currentItems.find(e => e.id === selectedEquipment)
      if (!equipment) return

      const nextMaintenance = new Date(now)
      nextMaintenance.setDate(nextMaintenance.getDate() + equipment.maintenanceInterval)

      const currentStatus = equipmentStatuses[selectedEquipment] || {
        id: selectedEquipment,
        category: selectedCategory,
        status: 'operational',
        lastMaintenance: now.toISOString(),
        nextMaintenance: nextMaintenance.toISOString(),
        notes: '',
        issues: []
      }

      // First update the equipment status
      await handleStatusUpdate(selectedEquipment, {
        ...currentStatus,
        status: 'operational',
        lastMaintenance: now.toISOString(),
        nextMaintenance: nextMaintenance.toISOString(),
        notes: maintenanceNotes || currentStatus.notes,
        issues: currentStatus.issues || []
      })

      // Then add a maintenance record with the maintenance tag
      await kitchenService.addMaintenanceNote(selectedEquipment, {
        notes: maintenanceNotes || 'Routine maintenance completed',
        type: 'maintenance'
      })

      // If this equipment's history dialog is open, refresh it
      if (maintenanceHistoryDialog && selectedEquipment) {
        const history = await kitchenService.getEquipmentHistory(selectedEquipment)
        setMaintenanceHistory(history)
      }

      setMaintenanceDialog(false)
      setMaintenanceNotes('')
      setSelectedEquipment(null)
      enqueueSnackbar('Maintenance completed successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error completing maintenance:', error)
      enqueueSnackbar('Failed to complete maintenance', { variant: 'error' })
    }
  }

  const handleAddIssue = async () => {
    if (!selectedEquipment || !newIssue) return

    try {
      // Get the equipment item to get its maintenance interval
      const equipment = (equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory])
        .find(e => e.id === selectedEquipment)

      if (!equipment) {
        console.error('Equipment not found:', selectedEquipment)
        enqueueSnackbar('Equipment not found', { variant: 'error' })
        return
      }

      // Get current status or initialize a default one if it doesn't exist
      const currentStatus = equipmentStatuses[selectedEquipment] || {
        id: selectedEquipment,
        category: selectedCategory,
        status: 'operational',
        issues: [],
        notes: '',
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + equipment.maintenanceInterval * 24 * 60 * 60 * 1000).toISOString()
      }

      // Format the issue with severity level
      const formattedIssue = `[${severity.toUpperCase()}] ${newIssue}`

      // Ensure issues is an array
      const existingIssues = Array.isArray(currentStatus.issues) ? currentStatus.issues : []
      const updatedIssues = [...existingIssues, formattedIssue]

      // Updating equipment status with repair status and issues

      // Create a complete status object with all required fields
      const updatedStatus = {
        id: selectedEquipment,
        name: equipment.name, // Include the name field
        category: selectedCategory,
        maintenanceInterval: equipment.maintenanceInterval, // Include the maintenanceInterval field
        status: 'repair',
        issues: updatedIssues,
        notes: currentStatus.notes || '',
        lastMaintenance: currentStatus.lastMaintenance || new Date().toISOString(),
        nextMaintenance: currentStatus.nextMaintenance || new Date(Date.now() + equipment.maintenanceInterval * 24 * 60 * 60 * 1000).toISOString()
      }

      await handleStatusUpdate(selectedEquipment, updatedStatus)

      setIssueDialog(false)
      setNewIssue('')
      setSeverity('medium') // Reset severity to default
      setSelectedEquipment(null)
      enqueueSnackbar('Equipment marked as broken. Directors have been notified.', { variant: 'info' })
    } catch (error) {
      console.error('Error marking equipment as broken:', error)
      enqueueSnackbar('Failed to mark equipment as broken', { variant: 'error' })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="w-4 h-4" />
      case 'maintenance':
        return <Clock className="w-4 h-4" />
      case 'repair':
        return <AlertCircle className="w-4 h-4" />
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getDaysUntilMaintenance = (nextMaintenance: string) => {
    const days = Math.ceil((new Date(nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const handleEditConfig = () => {
    // If no config exists yet, use the default items from EQUIPMENT_ITEMS
    const currentItems = equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory]
    setEditingItems(currentItems.map(item => ({ ...item })))
    setEditConfigDialog(true)
  }

  const handleAddItem = () => {
    const newId = `${selectedCategory}_${Date.now()}`
    const newItem = {
      id: newId,
      name: '',
      maintenanceInterval: 30,
      isNew: true
    }
    setEditingItems(prevItems => [...prevItems, newItem])

    // Add a small delay to ensure the new item is rendered before focusing
    setTimeout(() => {
      // Find the last input element in the dialog (which should be the new item)
      const inputs = document.querySelectorAll('.equipment-name-input')
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement
      if (lastInput) {
        lastInput.focus()
        lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...editingItems]
    if (newItems[index].isNew) {
      newItems.splice(index, 1)
    } else {
      newItems[index].isDeleted = true
    }
    setEditingItems(newItems)
  }

  // Function to move an item up in the list
  const handleMoveItemUp = (index: number) => {
    if (index <= 0) return // Can't move up if it's the first item

    const newItems = [...editingItems]
    // Swap the item with the one above it
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp

    setEditingItems(newItems)

    // Focus on the moved item's input after reordering
    setTimeout(() => {
      const inputs = document.querySelectorAll('.equipment-name-input')
      const input = inputs[index - 1] as HTMLInputElement
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  // Function to move an item down in the list
  const handleMoveItemDown = (index: number) => {
    const visibleItems = editingItems.filter(item => !item.isDeleted)
    if (index >= visibleItems.length - 1) return // Can't move down if it's the last item

    const newItems = [...editingItems]
    // Find the next non-deleted item
    let nextIndex = index + 1
    while (nextIndex < newItems.length && newItems[nextIndex].isDeleted) {
      nextIndex++
    }

    if (nextIndex < newItems.length) {
      // Swap the item with the one below it
      const temp = newItems[index]
      newItems[index] = newItems[nextIndex]
      newItems[nextIndex] = temp

      setEditingItems(newItems)

      // Focus on the moved item's input after reordering
      setTimeout(() => {
        const inputs = document.querySelectorAll('.equipment-name-input')
        const input = inputs[nextIndex] as HTMLInputElement
        if (input) {
          input.focus()
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const handleUpdateItem = (index: number, field: keyof EquipmentItem, value: string | number) => {
    const newItems = [...editingItems]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    setEditingItems(newItems)
  }

  const handleSaveConfig = async () => {
    try {
      // Show saving notification
      enqueueSnackbar('Saving equipment configuration...', {
        variant: 'info',
        autoHideDuration: 2000
      })

      // Validate items before saving
      const itemsToSave = editingItems
        .filter(item => !item.isDeleted)
        .map(({ isNew, isDeleted, ...item }) => ({
          ...item,
          // Ensure name is not empty
          name: item.name.trim(),
          // Set a default maintenance interval of 30 days
          maintenanceInterval: 30
        }))

      // Check if any items are missing names
      if (itemsToSave.some(item => !item.name)) {
        enqueueSnackbar('Please provide names for all equipment items', {
          variant: 'error',
          preventDuplicate: true
        })
        return
      }

      await kitchenService.updateEquipmentConfig(selectedCategory, itemsToSave)
      await loadEquipmentConfig()
      await loadEquipmentData()
      setEditConfigDialog(false)

      // Show success notification with longer duration
      enqueueSnackbar(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} equipment saved successfully!`, {
        variant: 'success',
        autoHideDuration: 4000
      })
    } catch (error) {
      console.error('Error updating equipment config:', error)
      enqueueSnackbar('Failed to update equipment configuration', {
        variant: 'error',
        autoHideDuration: 5000
      })
    }
  }

  const handleResolveIssues = async () => {
    if (!selectedEquipment) return

    try {
      // Get the equipment item to get its maintenance interval
      const equipment = (equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory])
        .find(e => e.id === selectedEquipment)

      if (!equipment) {
        console.error('Equipment not found:', selectedEquipment)
        enqueueSnackbar('Equipment not found', { variant: 'error' })
        return
      }

      // Get current status or initialize a default one if it doesn't exist
      const currentStatus = equipmentStatuses[selectedEquipment] || {
        id: selectedEquipment,
        category: selectedCategory,
        status: 'repair',
        issues: [],
        notes: '',
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + equipment.maintenanceInterval * 24 * 60 * 60 * 1000).toISOString()
      }

      // Format the repair notes with cost and person information
      let formattedNotes = repairNotes

      if (repairCost) {
        formattedNotes += `\nCost: $${repairCost}`
      }

      if (repairPerson) {
        formattedNotes += `\nRepaired by: ${repairPerson}`
      }

      // Resolving issues for equipment

      // Create a complete status object with all required fields
      const updatedStatus = {
        id: selectedEquipment,
        name: equipment.name, // Include the name field
        category: selectedCategory,
        maintenanceInterval: equipment.maintenanceInterval, // Include the maintenanceInterval field
        status: 'operational',
        issues: [],
        notes: currentStatus.notes || '',
        lastMaintenance: new Date().toISOString(), // Update maintenance date to now
        nextMaintenance: new Date(Date.now() + equipment.maintenanceInterval * 24 * 60 * 60 * 1000).toISOString()
      }

      // Update the equipment status
      await handleStatusUpdate(selectedEquipment, updatedStatus)

      // Add a maintenance record with the repair information
      // Use type 'repair' to indicate this is a repair completion record
      await kitchenService.addMaintenanceNote(selectedEquipment, {
        notes: formattedNotes || 'Issue resolved',
        type: 'repair',
        previousStatus: 'repair', // Explicitly set previous status
        newStatus: 'operational'  // Explicitly set new status to ensure proper grouping
      })

      // Reset the form and close the dialog
      setResolveDialog(false)
      setRepairNotes('')
      setRepairCost('')
      setRepairPerson('')

      // Refresh the maintenance history if the dialog is open
      if (maintenanceHistoryDialog && selectedEquipment) {
        const history = await kitchenService.getEquipmentHistory(selectedEquipment)
        setMaintenanceHistory(history)
      }

      // Don't clear selectedEquipment if the maintenance history dialog is open
      if (!maintenanceHistoryDialog) {
        setSelectedEquipment(null)
      }

      enqueueSnackbar('Equipment marked as operational', { variant: 'success' })
    } catch (error) {
      console.error('Error marking equipment as operational:', error)
      enqueueSnackbar('Failed to mark equipment as operational', { variant: 'error' })
    }
  }

  const loadMaintenanceHistory = async (equipmentId: string) => {
    try {
      setSelectedEquipment(equipmentId); // Store ID before fetching history
      const history = await kitchenService.getEquipmentHistory(equipmentId);
      setMaintenanceHistory(history);
      setMaintenanceHistoryDialog(true);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
      enqueueSnackbar('Failed to load maintenance history', { variant: 'error' });
    }
  };

  const handleDeleteClick = (record: MaintenanceRecord) => {
    setRecordToDelete(record)
    setDeleteConfirmDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete || !selectedEquipment) return

    try {
      await kitchenService.deleteMaintenanceRecord(selectedEquipment, recordToDelete.date)
      // Reload the maintenance history
      const history = await kitchenService.getEquipmentHistory(selectedEquipment)
      setMaintenanceHistory(history)
      enqueueSnackbar('Maintenance record deleted successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error deleting maintenance record:', error)
      enqueueSnackbar('Failed to delete maintenance record', { variant: 'error' })
    } finally {
      setDeleteConfirmDialog(false)
      setRecordToDelete(null)
    }
  }

  const handleAddNote = async () => {
    if (!selectedEquipment || !newNote.trim()) return

    try {
      if (recordToUpdate) {
        // Update existing note
        await kitchenService.updateMaintenanceRecord(selectedEquipment, recordToUpdate.date, {
          notes: newNote.trim()
        })
      } else {
        // Create new standalone note associated with current issue
        await kitchenService.addMaintenanceNote(selectedEquipment, {
          notes: newNote.trim(),
          type: 'note',
          associatedWithCurrentIssue: true
        })
      }

      // Reload the maintenance history
      const history = await kitchenService.getEquipmentHistory(selectedEquipment)
      setMaintenanceHistory(history)

      // Close note dialog and reset state
      setNoteDialog(false)
      setRecordToUpdate(null)
      setNewNote('')

      enqueueSnackbar(recordToUpdate ? 'Note updated successfully' : 'Note added successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error with note:', error)
      enqueueSnackbar(recordToUpdate ? 'Failed to update note' : 'Failed to add note', { variant: 'error' })
    }
  }

  const handleNewNote = async () => {
    if (!selectedEquipment) return

    try {
      // First ensure equipment exists by checking current status
      const currentStatus = equipmentStatuses[selectedEquipment]

      // If equipment doesn't exist in status, initialize it
      if (!currentStatus) {
        // Get the current equipment item to get its maintenance interval
        const equipment = (equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory])
          .find(e => e.id === selectedEquipment)

        if (!equipment) {
          enqueueSnackbar('Equipment configuration not found', { variant: 'error' })
          return
        }

        const now = new Date()
        const nextMaintenance = new Date(now)
        nextMaintenance.setDate(nextMaintenance.getDate() + equipment.maintenanceInterval)

        await kitchenService.updateEquipmentStatus(selectedEquipment, {
          id: selectedEquipment,
          category: selectedCategory,
          status: 'operational',
          lastMaintenance: now.toISOString(),
          nextMaintenance: nextMaintenance.toISOString(),
          notes: '',
          issues: []
        })

        // Reload equipment data to ensure we have the latest state
        await loadEquipmentData()
      }

      // Now proceed with opening the note dialog
      setRecordToUpdate(null)
      setNewNote('')
      setNoteDialog(true)
    } catch (error) {
      console.error('Error preparing to add note:', error)
      enqueueSnackbar('Failed to prepare for adding note', { variant: 'error' })
    }
  }

  const handleNoteClick = (record: MaintenanceRecord) => {
    setRecordToUpdate(record)
    setNewNote(record.notes || '')
    setNoteDialog(true)
  }

  // Calculate total equipment count across all categories
  const getTotalEquipmentCount = () => {
    let total = 0;
    let operational = 0;
    let needsAttention = 0;

    // Count equipment from the configuration (or default if not available)
    Object.keys(EQUIPMENT_ITEMS).forEach(category => {
      const categoryItems = equipmentConfig?.[category as CategoryType] || EQUIPMENT_ITEMS[category as CategoryType];
      total += categoryItems.length;

      // Count operational and needs attention items
      categoryItems.forEach(item => {
        const status = equipmentStatuses[item.id];
        if (status) {
          if (status.status === 'operational') {
            operational++;
          } else if (status.status === 'maintenance' || status.status === 'repair') {
            needsAttention++;
          }
        } else {
          // If no status exists yet, assume it's operational
          operational++;
        }
      });
    });

    return { total, operational, needsAttention };
  };

  useEffect(() => {
    // Reset editing items when category changes
    if (editConfigDialog) {
      const currentItems = equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory]
      setEditingItems(currentItems.map(item => ({ ...item })))
    }
  }, [selectedCategory, editConfigDialog])

  // Get equipment counts once to avoid multiple calculations
  const { total, operational, needsAttention } = getTotalEquipmentCount();

  const handleAddUpdateNote = async () => {
    if (!selectedEquipment || !updateNotes.trim()) {
      enqueueSnackbar(!selectedEquipment ? 'No equipment selected' : 'Please enter update notes', {
        variant: 'error'
      });
      return;
    }

    try {
      // Format update notes with status prefix
      let statusPrefix = '';
      switch (updateStatus) {
        case 'ordered_parts':
          statusPrefix = '[PARTS ORDERED] ';
          break;
        case 'scheduled_repair':
          statusPrefix = '[REPAIR SCHEDULED] ';
          break;
        case 'in_progress':
          statusPrefix = '[IN PROGRESS] ';
          break;
        case 'waiting_approval':
          statusPrefix = '[WAITING APPROVAL] ';
          break;
        default:
          statusPrefix = '[UPDATE] ';
      }

      const formattedNote = `${statusPrefix}${updateNotes}`;

      // Show feedback to user
      enqueueSnackbar('Sending update...', { variant: 'info' });

      // Close dialog immediately to prevent multiple submissions
      setUpdateDialog(false);

      // Add update note with explicit type field and status information
      // This ensures it will be properly grouped with the current issue
      await kitchenService.addMaintenanceNote(selectedEquipment, {
        notes: formattedNote,
        type: 'note', // Explicitly pass 'note' type
        // Don't include status change information to ensure it's treated as an update
        // to the current issue rather than a new issue or resolution
        associatedWithCurrentIssue: true
      });

      // Reset state
      setUpdateNotes('');
      setUpdateStatus('in_progress');

      // Force refresh maintenance history if dialog is open
      if (maintenanceHistoryDialog) {
        const history = await kitchenService.getEquipmentHistory(selectedEquipment);
        setMaintenanceHistory(history);
      }

      // Also refresh the equipment updates to show new update on the card
      loadEquipmentUpdates(selectedEquipment);

      enqueueSnackbar('Update added successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding update:', error);
      enqueueSnackbar(`Failed to add update: ${(error as any).message || 'Unknown error'}`, {
        variant: 'error'
      });
    }
  };

  return (
    <div className="space-y-4 px-4 md:px-6 pb-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Equipment Status</p>
                <h3 className="text-lg sm:text-2xl font-bold mt-1 text-[#27251F]">
                  {operational} / {total}
                </h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5 sm:mt-1">Operational (All Categories)</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-green-100 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Needs Attention</p>
                <h3 className="text-lg sm:text-2xl font-bold mt-1 text-[#27251F]">
                  {needsAttention}
                </h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5 sm:mt-1">Items (All Categories)</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-orange-100 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Equipment Categories */}
      <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
        <div className="p-3 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-[#27251F]">Equipment Status</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleEditConfig()
                  setEditConfigDialog(true)
                }}
                className="h-8 sm:h-9 text-xs sm:text-sm bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add/Remove Equipment
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(Object.keys(EQUIPMENT_ITEMS) as CategoryType[]).map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 sm:h-9 text-xs sm:text-sm capitalize rounded-full',
                    selectedCategory === category
                      ? 'bg-[#E51636] text-white hover:bg-[#E51636]/90'
                      : 'hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]/20'
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {(equipmentConfig?.[selectedCategory] || EQUIPMENT_ITEMS[selectedCategory]).map((equipment) => {
                const status = equipmentStatuses[equipment.id] || {
                  status: 'operational',
                  lastMaintenance: null,
                  nextMaintenance: null,
                  issues: []
                }

                const daysUntilMaintenance = status.nextMaintenance
                  ? getDaysUntilMaintenance(status.nextMaintenance)
                  : equipment.maintenanceInterval

                return (
                  <div
                    key={equipment.id}
                    className={`${status.status === 'repair'
                      ? 'bg-gradient-to-br from-red-50 to-red-50/70 border border-red-200 shadow-sm hover:shadow-lg'
                      : 'bg-gradient-to-br from-white to-gray-50/30 border border-gray-200 shadow-sm hover:shadow-lg'
                    } rounded-xl p-5 space-y-5 touch-manipulation transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Equipment icon watermark */}
                    <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-6 translate-y-6">
                      <EquipmentIcon equipmentId={equipment.id} size={120} className={`${status.status === 'repair' ? 'text-red-900' : 'text-gray-900'}`} />
                    </div>

                    {/* Equipment header with modern, clean design */}
                    <div className="relative">
                      {/* Side accent bar with status indicator */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-full ${
                        status.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>

                      <div className="pl-4 flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Equipment name with status dot */}
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2.5 ${
                              status.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <h3 className="text-lg font-medium text-gray-800">
                              {equipment.name}
                            </h3>
                          </div>
                        </div>

                        {/* Right side with icon and status text */}
                        <div className="flex items-center">
                          {/* Equipment icon */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                            status.status === 'repair'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-blue-50 text-blue-500'
                          }`}>
                            <EquipmentIcon equipmentId={equipment.id} size={16} />
                          </div>

                          {/* Status text */}
                          <div className="flex flex-col items-end">
                            <span className={`text-xs font-medium ${
                              status.status === 'operational' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {status.status === 'operational' ? 'Operational' : 'Broken'}
                            </span>
                            {status.lastMaintenance && (
                              <span className="text-xs text-gray-400">
                                Last cleaned {formatDistanceToNow(new Date(status.lastMaintenance), { addSuffix: true })}
                              </span>
                            )}
                          </div>

                          {/* History icon */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                              setSelectedEquipment(equipment.id)
                              loadMaintenanceHistory(equipment.id)
                              setMaintenanceHistoryDialog(true)
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Spacer to separate header from content */}
                    <div className="h-4"></div>

                    {/* Issues section with improved styling */}
                    {status.issues?.length > 0 && (
                      <div className={`text-sm relative overflow-hidden ${status.status === 'repair' ? 'text-red-700 bg-gradient-to-br from-red-100 to-red-50' : 'text-red-600 bg-gradient-to-br from-red-50 to-red-50/70'} rounded-lg p-4 border ${status.status === 'repair' ? 'border-red-300' : 'border-red-100'} shadow-sm ${status.status === 'repair' ? 'ring-1 ring-red-200' : 'ring-1 ring-red-50'}`}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:6px_6px]"></div>

                        <div className="flex items-center gap-2 mb-3 relative">
                          <div className={`${status.status === 'repair' ? 'bg-red-200' : 'bg-red-100'} h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <AlertCircle className={`h-5 w-5 ${status.status === 'repair' ? 'text-red-700' : 'text-red-600'}`} />
                          </div>
                          <strong className="font-semibold text-base">Issues ({status.issues.length})</strong>
                        </div>

                        <div className="space-y-2">
                          {status.issues.map((issue, index) => {
                            // Extract severity level if present
                            const severityMatch = issue.match(/^\[(LOW|MEDIUM|HIGH)\]\s*/i);
                            const severity = severityMatch ? severityMatch[1].toLowerCase() : 'medium';
                            const cleanIssue = severityMatch ? issue.replace(severityMatch[0], '') : issue;

                            // Determine badge color based on severity
                            const badgeColor =
                              severity === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                              severity === 'medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200';

                            return (
                              <div key={index} className="bg-white/50 rounded-md p-3 border border-red-200 shadow-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                  <Badge className={`px-2 py-0.5 text-xs font-medium capitalize ${badgeColor}`}>
                                    {severity} Priority
                                  </Badge>
                                </div>
                                <p className={`${status.status === 'repair' ? 'text-red-800' : 'text-red-700'} leading-relaxed font-medium`}>
                                  {cleanIssue}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recent Updates (only for broken equipment) with improved styling */}
                    {status.status === 'repair' && equipmentUpdates[equipment.id]?.length > 0 && (
                      <div className="text-sm relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 shadow-sm mt-4">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[length:16px_16px]"></div>

                        <div className="flex items-center gap-2 mb-3 relative">
                          <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Clock className="h-5 w-5 text-blue-700" />
                          </div>
                          <strong className="font-semibold text-base text-gray-800">Recent Updates</strong>
                        </div>

                        <div className="space-y-3 relative">
                          {/* Timeline connector */}
                          <div className="absolute left-4 top-1 bottom-10 w-0.5 bg-gray-200"></div>

                          {equipmentUpdates[equipment.id]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 2) // Show only the 2 most recent updates
                            .map((record, index) => {
                              // Extract status type from note
                              let statusType = 'Update';
                              let badgeClass = 'bg-blue-100 text-blue-700 border-blue-200';
                              let iconBg = 'bg-blue-100';
                              let iconColor = 'text-blue-700';
                              let icon = <Clock className="h-4 w-4" />;

                              if (record.notes?.startsWith('[PARTS ORDERED]')) {
                                statusType = 'Parts Ordered';
                                badgeClass = 'bg-purple-100 text-purple-700 border-purple-200';
                                iconBg = 'bg-purple-100';
                                iconColor = 'text-purple-700';
                                icon = <Wrench className="h-4 w-4" />;
                              } else if (record.notes?.startsWith('[REPAIR SCHEDULED]')) {
                                statusType = 'Repair Scheduled';
                                badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                                iconBg = 'bg-amber-100';
                                iconColor = 'text-amber-700';
                                icon = <CalendarClock className="h-4 w-4" />;
                              } else if (record.notes?.startsWith('[IN PROGRESS]')) {
                                statusType = 'In Progress';
                                badgeClass = 'bg-blue-100 text-blue-700 border-blue-200';
                                iconBg = 'bg-blue-100';
                                iconColor = 'text-blue-700';
                                icon = <Clock className="h-4 w-4" />;
                              } else if (record.notes?.startsWith('[WAITING APPROVAL]')) {
                                statusType = 'Waiting Approval';
                                badgeClass = 'bg-orange-100 text-orange-700 border-orange-200';
                                iconBg = 'bg-orange-100';
                                iconColor = 'text-orange-700';
                                icon = <AlertTriangle className="h-4 w-4" />;
                              }

                              // Clean up notes to remove status prefix
                              const cleanNotes = record.notes
                                ?.replace(/^\[.*?\]\s*/i, '')
                                .trim();

                              return (
                                <div key={index} className="pl-8 relative">
                                  {/* Timeline dot */}
                                  <div className={`absolute left-2 top-2 transform -translate-x-1/2 h-5 w-5 rounded-full ${iconBg} flex items-center justify-center z-10 border-2 border-white shadow-sm`}>
                                    <div className={`h-2 w-2 rounded-full bg-${iconColor.split('-')[1]}-600`}></div>
                                  </div>

                                  <div className="p-3 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-1.5">
                                        <div className={`h-5 w-5 rounded-full ${iconBg} flex items-center justify-center`}>
                                          {icon}
                                        </div>
                                        <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                                          {statusType}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(record.date), 'MMM d, h:mm a')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium">
                                      {cleanNotes || "No details provided"}
                                    </p>
                                    {record.performedBy && (
                                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {record.performedBy.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          }
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 font-medium rounded-full shadow-sm"
                            onClick={() => {
                              setSelectedEquipment(equipment.id);
                              loadMaintenanceHistory(equipment.id);
                            }}
                          >
                            <History className="h-4 w-4 mr-1.5" />
                            View All Updates
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cleaning Schedules with improved styling */}
                    {status.cleaningSchedules && status.cleaningSchedules.length > 0 && (
                      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-50/70 rounded-lg p-4 border border-blue-100 shadow-sm ring-1 ring-blue-50">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                        <div className="flex items-center justify-between mb-3 relative">
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Brush className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-base">Cleaning Schedules</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1 font-medium shadow-sm">
                            {status.cleaningSchedules.length}
                          </Badge>
                        </div>

                        <div className="space-y-2.5">
                          {status.cleaningSchedules.slice(0, 2).map((schedule, index) => {
                            const isOverdue = schedule.nextDue && new Date(schedule.nextDue) < new Date();
                            const isDueSoon = schedule.nextDue && !isOverdue &&
                              new Date(schedule.nextDue).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days

                            // Determine status badge
                            let statusBadge = "Upcoming";
                            let statusBadgeClass = "bg-green-100 text-green-700 border-green-200";

                            if (isOverdue) {
                              statusBadge = "Overdue";
                              statusBadgeClass = "bg-red-100 text-red-700 border-red-200";
                            } else if (isDueSoon) {
                              statusBadge = "Due Soon";
                              statusBadgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
                            }

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between py-3 px-4 rounded-md bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm truncate">{schedule.name}</span>
                                    <Badge className={`px-2 py-0.5 text-xs font-medium ${statusBadgeClass} ml-2`}>
                                      {statusBadge}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {schedule.nextDue ? format(new Date(schedule.nextDue), 'MMM d') : 'Not scheduled'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEquipment(equipment.id);
                                      setSelectedCleaningSchedule(schedule);
                                      setCleaningScheduleDialog(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEquipment(equipment.id);
                                      setSelectedCleaningSchedule(schedule);
                                      setCompleteCleaningDialog(true);
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          {status.cleaningSchedules.length > 2 && (
                            <div className="text-center mt-3">
                              <Button
                                variant="outline"
                                className="text-sm h-9 px-4 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full shadow-sm"
                                onClick={() => {
                                  setSelectedEquipment(equipment.id)
                                  loadMaintenanceHistory(equipment.id)
                                  setMaintenanceHistoryDialog(true)
                                }}
                              >
                                <Brush className="h-4 w-4 mr-1.5" />
                                View all {status.cleaningSchedules.length} schedules
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-6">
                      {/* History button - only visible on desktop */}
                      <div className="hidden sm:block mb-4">
                        <Button
                          variant="outline"
                          className={`h-12 px-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 sm:gap-2.5 touch-manipulation border rounded-lg shadow-sm hover:bg-gray-50 transition-all w-full hover:scale-[1.01] ${
                            status.status === 'repair'
                              ? 'border-red-200 text-red-700 hover:bg-red-50'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedEquipment(equipment.id)
                            loadMaintenanceHistory(equipment.id)
                            setMaintenanceHistoryDialog(true)
                          }}
                        >
                          <div className={`${status.status === 'repair' ? 'bg-red-100' : 'bg-gray-100'} h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center`}>
                            <History className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${status.status === 'repair' ? 'text-red-700' : 'text-gray-700'}`} />
                          </div>
                          <span>View History</span>
                        </Button>
                      </div>

                      {/* Action buttons with improved styling */}
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className={`relative overflow-hidden h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation rounded-lg shadow-sm transition-all w-full hover:scale-[1.01] ${
                            status.status === 'repair'
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                          }`}
                          onClick={() => {
                            setSelectedEquipment(equipment.id)
                            setSelectedCleaningSchedule(null)
                            setCleaningScheduleDialog(true)
                          }}
                        >
                          {/* Subtle background pattern */}
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_calc(20%_+_1px),_transparent_calc(20%_+_1px))] bg-[length:5px_5px]"></div>

                          <div className={`${status.status === 'repair' ? 'bg-red-100' : 'bg-blue-100'} h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center shadow-sm`}>
                            <Brush className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <span>Add Cleaning</span>
                        </Button>

                        {status.status === 'operational' ? (
                          <Button
                            variant="outline"
                            className="relative overflow-hidden h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation bg-red-50 text-red-600 border-red-200 rounded-lg shadow-sm hover:bg-red-100 transition-all w-full hover:scale-[1.01]"
                            onClick={() => {
                              setSelectedEquipment(equipment.id)
                              setIssueDialog(true)
                            }}
                          >
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_calc(20%_+_1px),_transparent_calc(20%_+_1px))] bg-[length:5px_5px]"></div>

                            <div className="bg-red-100 h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center shadow-sm">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <span>Mark as Broken</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="relative overflow-hidden h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation bg-green-50 text-green-600 border-green-200 rounded-lg shadow-sm hover:bg-green-100 transition-all w-full hover:scale-[1.01]"
                            onClick={() => {
                              setSelectedEquipment(equipment.id)
                              setResolveDialog(true)
                            }}
                          >
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_calc(20%_+_1px),_transparent_calc(20%_+_1px))] bg-[length:5px_5px]"></div>

                            <div className="bg-green-100 h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <span>Mark as Fixed</span>
                          </Button>
                        )}
                      </div>
                    </div>


                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Complete Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Maintenance Notes</Label>
              <Textarea
                placeholder="Enter maintenance details..."
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMaintenanceDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMaintenanceComplete}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white transition-colors"
            >
              Complete Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Broken Dialog */}
      <Dialog open={issueDialog} onOpenChange={(open) => {
        if (!open) {
          setNewIssue('')
          setSeverity('medium')
        }
        setIssueDialog(open)
      }}>
        <DialogContent className="sm:max-w-[500px] p-3 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-red-600">Mark Equipment as Broken</DialogTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Report equipment that is not functioning properly. This will mark it as broken and automatically notify all directors.
            </p>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Common issue categories */}
            <div className="space-y-2">
              <Label className="font-medium">Issue Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Not Working', 'Damaged', 'Making Noise', 'Leaking', 'Overheating', 'Other'].map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    className={cn(
                      'justify-start h-10 px-3 text-sm font-normal',
                      newIssue.includes(category) && 'bg-red-50 text-red-600 border-red-200'
                    )}
                    onClick={() => {
                      if (newIssue.includes(category)) {
                        setNewIssue(newIssue.replace(category, '').trim());
                      } else {
                        setNewIssue(newIssue ? `${newIssue}\n${category}` : category);
                      }
                    }}
                  >
                    <span>{category}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Issue description */}
            <div className="space-y-2">
              <Label className="font-medium">Issue Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                className="min-h-[100px] resize-none border-gray-200 rounded-xl"
              />
              <p className="text-xs text-gray-500">
                Please provide as much detail as possible to help with troubleshooting.
              </p>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label className="font-medium">Issue Severity</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    id="severity-low"
                    name="severity"
                    className="h-4 w-4 text-red-600"
                    checked={severity === 'low'}
                    onChange={() => setSeverity('low')}
                  />
                  <Label htmlFor="severity-low" className="text-sm font-normal cursor-pointer">Low (Minor Issue)</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    id="severity-medium"
                    name="severity"
                    className="h-4 w-4 text-red-600"
                    checked={severity === 'medium'}
                    onChange={() => setSeverity('medium')}
                  />
                  <Label htmlFor="severity-medium" className="text-sm font-normal cursor-pointer">Medium (Affects Operation)</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    id="severity-high"
                    name="severity"
                    className="h-4 w-4 text-red-600"
                    checked={severity === 'high'}
                    onChange={() => setSeverity('high')}
                  />
                  <Label htmlFor="severity-high" className="text-sm font-normal cursor-pointer">High (Urgent)</Label>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Important Note</p>
                  <p className="mt-1">When you mark equipment as broken, all directors will be automatically notified via email and in-app notification with the details you provide here.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIssueDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIssue}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white transition-colors"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Mark as Broken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Issue Dialog */}
      <Dialog open={resolveDialog} onOpenChange={(open) => {
        if (!open) {
          setRepairNotes('')
          setRepairCost('')
          setRepairPerson('')
        }
        setResolveDialog(open)
      }}>
        <DialogContent className="sm:max-w-[500px] p-3 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-green-600">Mark Equipment as Operational</DialogTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Record what was done to fix the equipment and any associated costs.
            </p>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Repair description */}
            <div className="space-y-2">
              <Label className="font-medium">What was done to fix the issue?</Label>
              <Textarea
                placeholder="Describe the repairs or maintenance performed..."
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                className="min-h-[100px] resize-none border-gray-200 rounded-xl"
              />
            </div>

            {/* Cost information */}
            <div className="space-y-2">
              <Label className="font-medium">Repair Cost (optional)</Label>
              <Input
                type="text"
                placeholder="Enter cost (e.g., 150.00)"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="h-10 border-gray-200 rounded-xl"
              />
            </div>

            {/* Who performed the repair */}
            <div className="space-y-2">
              <Label className="font-medium">Repaired By (optional)</Label>
              <Input
                type="text"
                placeholder="Enter name of person or company"
                value={repairPerson}
                onChange={(e) => setRepairPerson(e.target.value)}
                className="h-10 border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveIssues}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Operational
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Configuration Dialog */}
      <Dialog open={editConfigDialog} onOpenChange={setEditConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-xl font-semibold">Add or Remove {selectedCategory} Equipment</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm text-gray-500">
              Manage the equipment items for the {selectedCategory} category. Add new equipment or remove existing items as needed. All equipment will have a standard 30-day maintenance interval.
            </p>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-5">
                {editingItems.map((item, index) => !item.isDeleted && (
                  <div
                    key={item.id}
                    className={`p-5 border rounded-xl transition-all duration-200 ${item.isNew ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {item.isNew ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                            New Item
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 px-2 py-1 rounded-full text-xs font-medium">
                            Existing Item
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Move Up Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveItemUp(index)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>

                        {/* Move Down Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveItemDown(index)}
                          disabled={index === editingItems.filter(item => !item.isDeleted).length - 1}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Equipment Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="Enter equipment name"
                        className="equipment-name-input h-10 border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500">Enter a descriptive name for this equipment</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              onClick={handleAddItem}
              className="w-full h-12 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Equipment
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditConfigDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfig}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white transition-colors"
            >
              Save Equipment Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Repair History Dialog */}
      <Dialog open={maintenanceHistoryDialog} onOpenChange={(open) => {
        if (!open) {
          setSelectedEquipment(null)
        }
        setMaintenanceHistoryDialog(open)
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-xl font-semibold">Equipment Repair Incidents</DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Group records by incident */}
                {(() => {
                  // Group records by issue/incident rather than by date
                  const groupedRecords = maintenanceHistory.reduce((groups, record) => {
                    // First, identify if this is a status change record
                    const isStatusChange = record.previousStatus !== undefined && record.newStatus !== undefined;

                    // If this is a status change from operational to non-operational, it's the start of a new incident
                    if (isStatusChange && record.previousStatus === 'operational' && record.newStatus !== 'operational') {
                      // Create a new incident group with this record's ID as the key
                      const incidentKey = record.id || record.date;
                      groups[incidentKey] = [record];
                      return groups;
                    }

                    // For all other records, we need to find which incident they belong to
                    // First, check if this is a resolution record (status change back to operational)
                    if (isStatusChange && record.previousStatus !== 'operational' && record.newStatus === 'operational') {
                      // Find the most recent incident that doesn't have a resolution yet
                      const openIncidentKeys = Object.keys(groups).filter(key => {
                        const incidentRecords = groups[key];
                        // Check if this incident has a resolution record
                        return !incidentRecords.some(r =>
                          r.previousStatus !== 'operational' && r.newStatus === 'operational'
                        );
                      });

                      // Sort by date to get the most recent open incident
                      openIncidentKeys.sort((a, b) => {
                        const dateA = new Date(groups[a][0].date).getTime();
                        const dateB = new Date(groups[b][0].date).getTime();
                        return dateB - dateA; // Sort descending (newest first)
                      });

                      // Add to the most recent open incident, or create a new one if none found
                      if (openIncidentKeys.length > 0) {
                        groups[openIncidentKeys[0]].push(record);
                      } else {
                        // If no open incident found, create a new one
                        const incidentKey = record.id || record.date;
                        groups[incidentKey] = [record];
                      }
                      return groups;
                    }

                    // For update notes and other records, add to the most recent incident
                    // Sort all incidents by date (newest first)
                    const sortedKeys = Object.keys(groups).sort((a, b) => {
                      const dateA = new Date(groups[a][0].date).getTime();
                      const dateB = new Date(groups[b][0].date).getTime();
                      return dateB - dateA; // Sort descending (newest first)
                    });

                    // If we have incidents, add to the most recent one
                    if (sortedKeys.length > 0) {
                      groups[sortedKeys[0]].push(record);
                    } else {
                      // If no incidents yet, create a new one
                      const incidentKey = record.id || record.date;
                      groups[incidentKey] = [record];
                    }

                    return groups;
                  }, {});

                  // Convert the grouped records object to an array of incidents
                  return Object.entries(groupedRecords).map(([dateKey, records]) => {
                    // Sort records by date (newest first in each group)
                    const sortedRecords = [...records].sort((a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    // Find the issue report (status changed to repair/broken)
                    const issueRecord = sortedRecords.find(r =>
                      r.previousStatus === 'operational' && r.newStatus !== 'operational'
                    );

                    // Find the repair record (status changed back to operational)
                    const repairRecord = sortedRecords.find(r =>
                      r.previousStatus !== 'operational' && r.newStatus === 'operational'
                    );

                    // Find any update notes - look for type='note' and specific prefixes
                    const updateRecords = sortedRecords.filter(r => {
                      // First check if it has type='note'
                      if (r.type === 'note') {
                        return true;
                      }

                      // If not typed, check if the notes start with our prefixes
                      if (r.notes && (
                        r.notes.startsWith('[UPDATE]') ||
                        r.notes.startsWith('[PARTS ORDERED]') ||
                        r.notes.startsWith('[REPAIR SCHEDULED]') ||
                        r.notes.startsWith('[IN PROGRESS]') ||
                        r.notes.startsWith('[WAITING APPROVAL]')
                      )) {
                        return true;
                      }

                      return false;
                    });

                    // If we have both records, we can create a complete incident card
                    // Otherwise, just show the individual record
                    const isCompleteIncident = issueRecord && repairRecord;

                    // Get the latest record for the card header
                    const latestRecord = sortedRecords[0];

                    // Extract repair information if available
                    let costInfo = '';
                    let repairedBy = '';
                    let repairNotes = '';

                    if (repairRecord && repairRecord.notes) {
                      // Extract cost information
                      const costMatch = repairRecord.notes.match(/Cost:\s+\$(\d+(\.\d+)?)/i);
                      if (costMatch && costMatch[1]) {
                        costInfo = costMatch[1];
                      }

                      // Extract who repaired it
                      const repairMatch = repairRecord.notes.match(/Repaired by:\s+([^\n]+)/i);
                      if (repairMatch && repairMatch[1]) {
                        repairedBy = repairMatch[1];
                      }

                      // Clean up notes
                      repairNotes = repairRecord.notes
                        .replace(/Cost:\s+\$\d+(\.\d+)?[\r\n]*/gi, '')
                        .replace(/Repaired by:\s+[^\n]+[\r\n]*/gi, '')
                        .trim();
                    }

                    // Get issue description
                    const issueNotes = issueRecord?.notes || '';

                    // Determine if this is a resolved incident
                    const isResolved = !!repairRecord;

                    // Get the actual equipment ID from original click - stored in selectedEquipment
                    const actualEquipmentId = selectedEquipment;

                    return (
                      <div
                        key={dateKey}
                        className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 relative ${isResolved ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}
                      >
                        {/* Header with issue date, latest update, and status */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {issueRecord ? format(new Date(issueRecord.date), 'PPP') : format(new Date(latestRecord.date), 'PPP')}
                              </p>
                              <Badge
                                variant="secondary"
                                className={`px-2 py-1 rounded-full text-xs font-medium ${isResolved ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}
                              >
                                {isResolved ?
                                  <><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</> :
                                  <><AlertCircle className="w-3 h-3 mr-1" />Unresolved</>
                                }
                              </Badge>
                            </div>

                            {/* Show last update information */}
                            {latestRecord.performedBy && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Last update by:</span> {latestRecord.performedBy.name}
                                {latestRecord !== issueRecord && (
                                  <span className="ml-1 text-xs text-gray-500">
                                    ({format(new Date(latestRecord.date), 'MMM d, h:mm a')})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Current status badge */}
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize px-2 py-1 rounded-full text-xs font-medium",
                              STATUS_COLORS[latestRecord.newStatus as keyof typeof STATUS_COLORS]
                            )}
                          >
                            {getStatusIcon(latestRecord.newStatus)}
                            <span className="ml-1">
                              {latestRecord.newStatus === 'operational' ? 'Operational' :
                               latestRecord.newStatus === 'repair' ? 'Broken' :
                               latestRecord.newStatus === 'maintenance' ? 'Maintenance' : 'Offline'}
                            </span>
                          </Badge>
                        </div>

                        {/* Timeline section - All in one card */}
                        <div className="mt-4 border-l-2 border-gray-200 pl-4 space-y-3">
                          {/* All status updates in a single timeline */}
                          {/* Combine all records and sort by date */}
                          {(() => {
                            // Create an array of all records with their types
                            const allRecords = [];

                            // Add issue record if it exists
                            if (issueRecord) {
                              allRecords.push({
                                ...issueRecord,
                                recordType: 'issue',
                                displayType: 'Issue Reported',
                                iconClass: 'bg-red-500',
                                badgeClass: 'bg-red-100 text-red-700'
                              });
                            }

                            // Add all update records
                            updateRecords.forEach(record => {
                              let statusType = 'Update';
                              let badgeClass = 'bg-blue-100 text-blue-700';
                              let iconClass = 'bg-blue-500';

                              if (record.notes?.startsWith('[PARTS ORDERED]')) {
                                statusType = 'Parts Ordered';
                                badgeClass = 'bg-purple-100 text-purple-700';
                                iconClass = 'bg-purple-500';
                              } else if (record.notes?.startsWith('[REPAIR SCHEDULED]')) {
                                statusType = 'Repair Scheduled';
                                badgeClass = 'bg-amber-100 text-amber-700';
                                iconClass = 'bg-amber-500';
                              } else if (record.notes?.startsWith('[IN PROGRESS]')) {
                                statusType = 'In Progress';
                                badgeClass = 'bg-blue-100 text-blue-700';
                                iconClass = 'bg-blue-500';
                              } else if (record.notes?.startsWith('[WAITING APPROVAL]')) {
                                statusType = 'Waiting Approval';
                                badgeClass = 'bg-orange-100 text-orange-700';
                                iconClass = 'bg-orange-500';
                              }

                              allRecords.push({
                                ...record,
                                recordType: 'update',
                                displayType: statusType,
                                iconClass,
                                badgeClass
                              });
                            });

                            // Add repair record if it exists
                            if (repairRecord) {
                              allRecords.push({
                                ...repairRecord,
                                recordType: 'repair',
                                displayType: 'Repair Completed',
                                iconClass: 'bg-green-500',
                                badgeClass: 'bg-green-100 text-green-700'
                              });
                            }

                            // Sort all records by date (oldest first for chronological display)
                            allRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                            // Render all records in the timeline
                            return allRecords.map((record, index) => {
                              // Clean up notes to remove status prefix for update records
                              let displayNotes = record.notes || '';
                              if (record.recordType === 'update') {
                                displayNotes = displayNotes.replace(/^\[.*?\]\s*/i, '').trim();
                              } else if (record.recordType === 'repair') {
                                // Use the cleaned repair notes
                                displayNotes = repairNotes;
                              }

                              return (
                                <div className="relative" key={index}>
                                  <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full ${record.iconClass} border-2 border-white`}></div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-gray-900">
                                        {record.displayType}
                                      </p>
                                      <Badge variant="secondary" className={`px-2 py-0.5 rounded-full text-xs ${record.badgeClass}`}>
                                        {record.displayType}
                                      </Badge>
                                      <span className="text-xs font-normal text-gray-500">
                                        {format(new Date(record.date), 'MMM d, h:mm a')}
                                      </span>
                                    </div>

                                    {displayNotes && (
                                      <p className="text-sm text-gray-600 mt-1 bg-white/80 p-2 rounded-lg whitespace-pre-line">
                                        {displayNotes}
                                      </p>
                                    )}

                                    {/* Show cost and repair person info for repair records */}
                                    {record.recordType === 'repair' && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {costInfo && (
                                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                            <span className="mr-1">💰</span>
                                            Cost: ${costInfo}
                                          </div>
                                        )}
                                        {repairedBy && (
                                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                            <span className="mr-1">👤</span>
                                            Repaired by: {repairedBy}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-1">
                                      {record.recordType === 'issue' ? 'Reported' :
                                       record.recordType === 'repair' ? 'Fixed' : 'Updated'} by: {record.performedBy.name}
                                    </p>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // No need to set the equipment ID here, it's already in state
                              setUpdateDialog(true);
                            }}
                            className="h-8 text-xs bg-blue-50 text-blue-600 border-blue-200"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Update
                          </Button>

                          {!isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Don't change the selected equipment ID here
                                setResolveDialog(true)
                                // Keep the maintenance history dialog open when fixing
                                // The handleResolveIssues function will refresh the history
                              }}
                              className="h-8 text-xs bg-green-50 text-green-600 border-green-200"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Mark as Fixed
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(latestRecord)}
                            className="text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  });
                })()}

                {maintenanceHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-xl border border-gray-200">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">No repair history available</p>
                    <p className="text-sm mt-1">Repair records will appear here once equipment issues are resolved</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMaintenanceHistoryDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to delete this maintenance record? This action cannot be undone.</p>
            {recordToDelete && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {format(new Date(recordToDelete.date), 'PPP')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmDialog(false)
                setRecordToDelete(null)
              }}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={(open) => {
        if (!open) {
          setRecordToUpdate(null)
          setNewNote('')
        }
        setNoteDialog(open)
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {recordToUpdate ? 'Update Maintenance Notes' : 'Add New Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {recordToUpdate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {format(new Date(recordToUpdate.date), 'PPP')}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter notes..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNoteDialog(false)
                setRecordToUpdate(null)
                setNewNote('')
              }}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white transition-colors"
            >
              {recordToUpdate ? 'Update Notes' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleaning Schedule Dialog */}
      <CleaningScheduleDialog
        open={cleaningScheduleDialog}
        onOpenChange={setCleaningScheduleDialog}
        onSave={selectedCleaningSchedule ? handleUpdateCleaningSchedule : handleAddCleaningSchedule}
        onDelete={handleDeleteCleaningSchedule}
        schedule={selectedCleaningSchedule || undefined}
        title={selectedCleaningSchedule ? 'Edit Cleaning Schedule' : 'Add Cleaning Schedule'}
      />

      {/* Complete Cleaning Dialog */}
      {selectedCleaningSchedule && (
        <CompleteCleaningDialog
          open={completeCleaningDialog}
          onOpenChange={setCompleteCleaningDialog}
          onComplete={handleCompleteCleaningSchedule}
          schedule={selectedCleaningSchedule}
        />
      )}

      {/* Cleaning History Dialog */}
      {selectedCleaningSchedule && (
        <CleaningHistoryDialog
          open={cleaningHistoryDialog}
          onOpenChange={setCleaningHistoryDialog}
          schedule={selectedCleaningSchedule}
        />
      )}

      {/* Add Update Dialog */}
      <Dialog open={updateDialog} onOpenChange={(open) => {
        if (!open) {
          setUpdateNotes('')
          setUpdateStatus('in_progress')
        }
        setUpdateDialog(open)
      }}>
        <DialogContent className="sm:max-w-[500px] p-3 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-blue-600">Add Repair Update</DialogTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add progress updates for ongoing repairs to keep the team informed.
            </p>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Status selection */}
            <div className="space-y-2">
              <Label className="font-medium">Update Status</Label>
              <Select
                value={updateStatus}
                onValueChange={setUpdateStatus}
              >
                <SelectTrigger className="h-10 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordered_parts">Parts Ordered</SelectItem>
                  <SelectItem value="scheduled_repair">Repair Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_approval">Waiting for Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Update details */}
            <div className="space-y-2">
              <Label className="font-medium">Update Details</Label>
              <Textarea
                placeholder="Provide details about the update or progress..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="min-h-[100px] resize-none border-gray-200 rounded-xl"
              />
              <p className="text-xs text-gray-500">
                Include relevant information such as ETA for parts, scheduled repair date, technician name, etc.
              </p>
            </div>

            {!selectedEquipment && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No equipment selected</p>
                    <p className="mt-1">Please close this dialog and try again.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialog(false)}
              className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleAddUpdateNote();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={!selectedEquipment || !updateNotes.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Cleaning schedule handlers
  function handleAddCleaningSchedule(schedule: Omit<CleaningSchedule, 'completionHistory'>) {
    if (!selectedEquipment) return

    try {
      kitchenService.addCleaningSchedule(selectedEquipment, schedule)
        .then(() => {
          enqueueSnackbar('Cleaning schedule added successfully', { variant: 'success' })
          loadEquipmentData() // Refresh equipment data
        })
        .catch(error => {
          console.error('Error adding cleaning schedule:', error)
          enqueueSnackbar('Failed to add cleaning schedule', { variant: 'error' })
        })
    } catch (error) {
      console.error('Error adding cleaning schedule:', error)
      enqueueSnackbar('Failed to add cleaning schedule', { variant: 'error' })
    }
  }

  function handleUpdateCleaningSchedule(schedule: Partial<CleaningSchedule>) {
    if (!selectedEquipment || !selectedCleaningSchedule) return

    try {
      kitchenService.updateCleaningSchedule(selectedEquipment, selectedCleaningSchedule.name, schedule)
        .then(() => {
          enqueueSnackbar('Cleaning schedule updated successfully', { variant: 'success' })
          loadEquipmentData() // Refresh equipment data
        })
        .catch(error => {
          console.error('Error updating cleaning schedule:', error)
          enqueueSnackbar('Failed to update cleaning schedule', { variant: 'error' })
        })
    } catch (error) {
      console.error('Error updating cleaning schedule:', error)
      enqueueSnackbar('Failed to update cleaning schedule', { variant: 'error' })
    }
  }

  function handleDeleteCleaningSchedule(scheduleName: string) {
    if (!selectedEquipment) return

    try {
      kitchenService.deleteCleaningSchedule(selectedEquipment, scheduleName)
        .then(() => {
          enqueueSnackbar('Cleaning schedule deleted successfully', { variant: 'success' })
          loadEquipmentData() // Refresh equipment data
        })
        .catch(error => {
          console.error('Error deleting cleaning schedule:', error)
          enqueueSnackbar('Failed to delete cleaning schedule', { variant: 'error' })
        })
    } catch (error) {
      console.error('Error deleting cleaning schedule:', error)
      enqueueSnackbar('Failed to delete cleaning schedule', { variant: 'error' })
    }
  }

  function handleCompleteCleaningSchedule(notes: string, completedItems: { name: string, isCompleted: boolean }[], isEarlyCompletion: boolean = false) {
    if (!selectedEquipment || !selectedCleaningSchedule) return

    try {
      kitchenService.completeCleaningSchedule(selectedEquipment, selectedCleaningSchedule.name, {
        notes,
        completedItems,
        isEarlyCompletion
      })
        .then(() => {
          enqueueSnackbar('Cleaning task completed successfully', { variant: 'success' })
          loadEquipmentData() // Refresh equipment data
        })
        .catch(error => {
          console.error('Error completing cleaning task:', error)
          enqueueSnackbar('Failed to complete cleaning task', { variant: 'error' })
        })
    } catch (error) {
      console.error('Error completing cleaning task:', error)
      enqueueSnackbar('Failed to complete cleaning task', { variant: 'error' })
    }
  }
}