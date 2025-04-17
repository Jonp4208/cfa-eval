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
  Calendar
} from 'lucide-react'
import { useSnackbar } from 'notistack'
import { kitchenService, EquipmentStatus, EquipmentConfig, EquipmentItem, MaintenanceRecord, CleaningSchedule } from '@/services/kitchenService'
import { cn } from "@/lib/utils"
import { format, formatDistanceStrict } from 'date-fns'

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

  // Cleaning schedule state
  const [cleaningScheduleDialog, setCleaningScheduleDialog] = useState(false)
  const [selectedCleaningSchedule, setSelectedCleaningSchedule] = useState<CleaningSchedule | null>(null)
  const [completeCleaningDialog, setCompleteCleaningDialog] = useState(false)
  const [cleaningHistoryDialog, setCleaningHistoryDialog] = useState(false)

  useEffect(() => {
    loadEquipmentData()
    loadEquipmentConfig()
  }, [])

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
      console.log('Sending status update for equipment:', equipmentId, newStatus)
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

      console.log('Updating equipment status with:', {
        id: selectedEquipment,
        category: selectedCategory,
        status: 'repair',
        issues: updatedIssues
      })

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
      enqueueSnackbar('Equipment marked as broken', { variant: 'success' })
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
        enqueueSnackbar('Please provide names for all equipment items', { variant: 'error' })
        return
      }

      await kitchenService.updateEquipmentConfig(selectedCategory, itemsToSave)
      await loadEquipmentConfig()
      await loadEquipmentData()
      setEditConfigDialog(false)
      enqueueSnackbar('Equipment configuration updated successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error updating equipment config:', error)
      enqueueSnackbar('Failed to update equipment configuration', { variant: 'error' })
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

      console.log('Resolving issues for equipment:', selectedEquipment, currentStatus)

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
      await kitchenService.addMaintenanceNote(selectedEquipment, {
        notes: formattedNotes || 'Issue resolved',
        type: 'maintenance'
      })

      // Reset the form and close the dialog
      setResolveDialog(false)
      setRepairNotes('')
      setRepairCost('')
      setRepairPerson('')
      setSelectedEquipment(null)

      enqueueSnackbar('Equipment marked as operational', { variant: 'success' })
    } catch (error) {
      console.error('Error marking equipment as operational:', error)
      enqueueSnackbar('Failed to mark equipment as operational', { variant: 'error' })
    }
  }

  const loadMaintenanceHistory = async (equipmentId: string) => {
    try {
      const history = await kitchenService.getEquipmentHistory(equipmentId)
      setMaintenanceHistory(history)
      setSelectedEquipment(equipmentId)
      setMaintenanceHistoryDialog(true)
    } catch (error) {
      console.error('Error loading maintenance history:', error)
      enqueueSnackbar('Failed to load maintenance history', { variant: 'error' })
    }
  }

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
        // Create new standalone note
        await kitchenService.addMaintenanceNote(selectedEquipment, {
          notes: newNote.trim()
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
                    className="bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-xl p-5 space-y-5 touch-manipulation transition-all relative overflow-hidden"
                  >
                    {/* Equipment header with name and status */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {equipment.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            'w-fit h-8 px-4 text-sm font-medium capitalize flex items-center whitespace-nowrap rounded-full shadow-sm',
                            status.status === 'operational'
                              ? 'bg-green-50 text-green-600 border-green-200 ring-1 ring-green-100'
                              : 'bg-red-50 text-red-600 border-red-200 ring-1 ring-red-100',
                            status.status !== 'operational' ? 'animate-pulse' : ''
                          )}
                        >
                          {status.status === 'operational' ?
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> :
                            <AlertCircle className="h-4 w-4 mr-1.5" />}
                          <span>{status.status === 'operational' ? 'Operational' : 'Broken'}</span>
                        </Badge>
                      </div>

                      {/* History icon for mobile */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full sm:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm absolute top-4 right-4"
                        onClick={() => {
                          setSelectedEquipment(equipment.id)
                          loadMaintenanceHistory(equipment.id)
                          setMaintenanceHistoryDialog(true)
                        }}
                      >
                        <History className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Issues section */}
                    {status.issues?.length > 0 && (
                      <div className="text-sm text-red-600 bg-red-50 rounded-lg p-4 border border-red-100 shadow-sm ring-1 ring-red-50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-red-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <strong className="font-semibold text-base">Issues ({status.issues.length})</strong>
                        </div>
                        <ul className="list-disc list-outside space-y-2 ml-5">
                          {status.issues.map((issue, index) => (
                            <li key={index} className="text-red-700 leading-relaxed">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cleaning Schedules */}
                    {status.cleaningSchedules && status.cleaningSchedules.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm ring-1 ring-blue-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                              <Brush className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-base">Cleaning Schedules</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 rounded-full px-3 py-1 font-medium">
                            {status.cleaningSchedules.length}
                          </Badge>
                        </div>
                        <div className="space-y-2.5">
                          {status.cleaningSchedules.slice(0, 2).map((schedule, index) => {
                            const isOverdue = schedule.nextDue && new Date(schedule.nextDue) < new Date();
                            const isDueSoon = schedule.nextDue && !isOverdue &&
                              new Date(schedule.nextDue).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between py-3 px-4 rounded-md bg-white border border-blue-100 shadow-sm hover:shadow hover:bg-blue-50 transition-all"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-3 h-3 rounded-full",
                                      isOverdue ? "bg-red-500 ring-2 ring-red-200" :
                                      isDueSoon ? "bg-yellow-500 ring-2 ring-yellow-200" :
                                      "bg-green-500 ring-2 ring-green-200"
                                    )} />
                                    <span className="font-medium text-sm truncate">{schedule.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-5 mt-1">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                                    </span>
                                    <span className="mx-1.5">•</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {schedule.nextDue ? format(new Date(schedule.nextDue), 'MMM d') : 'Not scheduled'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
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
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
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
                          className="h-12 px-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 sm:gap-2.5 touch-manipulation border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all w-full hover:scale-[1.01]"
                          onClick={() => {
                            setSelectedEquipment(equipment.id)
                            loadMaintenanceHistory(equipment.id)
                            setMaintenanceHistoryDialog(true)
                          }}
                        >
                          <div className="bg-gray-100 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center">
                            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                          </div>
                          <span>View History</span>
                        </Button>
                      </div>

                      {/* Add Cleaning and Mark as Broken/Operational buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation bg-blue-50 text-blue-600 border-blue-200 rounded-lg shadow-sm hover:bg-blue-100 transition-all w-full hover:scale-[1.01]"
                          onClick={() => {
                            setSelectedEquipment(equipment.id)
                            setSelectedCleaningSchedule(null)
                            setCleaningScheduleDialog(true)
                          }}
                        >
                          <div className="bg-blue-100 h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center">
                            <Brush className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <span>Add Cleaning</span>
                        </Button>

                        {status.status === 'operational' ? (
                          <Button
                            variant="outline"
                            className="h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation bg-red-50 text-red-600 border-red-200 rounded-lg shadow-sm hover:bg-red-100 transition-all w-full hover:scale-[1.01]"
                            onClick={() => {
                              setSelectedEquipment(equipment.id)
                              setIssueDialog(true)
                            }}
                          >
                            <div className="bg-red-100 h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <span>Mark as Broken</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation bg-green-50 text-green-600 border-green-200 rounded-lg shadow-sm hover:bg-green-100 transition-all w-full hover:scale-[1.01]"
                            onClick={() => {
                              setSelectedEquipment(equipment.id)
                              setResolveDialog(true)
                            }}
                          >
                            <div className="bg-green-100 h-5 w-5 sm:h-7 sm:w-7 rounded-full flex items-center justify-center">
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
              Report equipment that is not functioning properly. This will mark it as broken and notify the team.
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

            {/* Detailed description */}
            <div className="space-y-2">
              <Label className="font-medium">Detailed Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                className="min-h-[100px] resize-none border-gray-200 rounded-xl"
              />
            </div>

            {/* Severity level */}
            <div className="space-y-2">
              <Label className="font-medium">Severity Level</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    id="severity-low"
                    name="severity"
                    className="h-4 w-4 text-red-600"
                    checked={severity === 'low'}
                    onChange={() => setSeverity('low')}
                  />
                  <Label htmlFor="severity-low" className="text-sm font-normal cursor-pointer">Low (Can Wait)</Label>
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
                  <Label htmlFor="severity-medium" className="text-sm font-normal cursor-pointer">Medium</Label>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Equipment Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="Enter equipment name"
                        className="h-10 border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
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
                  // Group records by date (simplified approach to group related events)
                  const groupedRecords = maintenanceHistory.reduce((groups, record) => {
                    // Create a key based on the date (ignoring time) to group related events
                    const dateKey = new Date(record.date).toDateString();

                    // If we don't have this group yet, create it
                    if (!groups[dateKey]) {
                      groups[dateKey] = [];
                    }

                    // Add the record to its group
                    groups[dateKey].push(record);
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

                    return (
                      <div
                        key={dateKey}
                        className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 relative ${isResolved ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}
                      >
                        {/* Header with date and status */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {format(new Date(latestRecord.date), 'PPP')}
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
                            {latestRecord.performedBy && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Last update by:</span> {latestRecord.performedBy.name}
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

                        {/* Timeline section */}
                        <div className="mt-4 border-l-2 border-gray-200 pl-4 space-y-3">
                          {/* Issue reported */}
                          {issueRecord && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  Issue Reported
                                  <span className="text-xs font-normal text-gray-500 ml-2">
                                    {format(new Date(issueRecord.date), 'MMM d, h:mm a')}
                                  </span>
                                </p>
                                {issueRecord.notes && (
                                  <p className="text-sm text-gray-600 mt-1 bg-white/80 p-2 rounded-lg">
                                    {issueRecord.notes}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Reported by: {issueRecord.performedBy.name}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Repair completed */}
                          {repairRecord && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  Repair Completed
                                  <span className="text-xs font-normal text-gray-500 ml-2">
                                    {format(new Date(repairRecord.date), 'MMM d, h:mm a')}
                                  </span>
                                </p>
                                {repairNotes && (
                                  <p className="text-sm text-gray-600 mt-1 bg-white/80 p-2 rounded-lg whitespace-pre-line">
                                    {repairNotes}
                                  </p>
                                )}

                                {/* Cost and repair person info */}
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

                                <p className="text-xs text-gray-500 mt-1">
                                  Fixed by: {repairRecord.performedBy.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex justify-end gap-2">
                          {!isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipment(latestRecord.id)
                                setResolveDialog(true)
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