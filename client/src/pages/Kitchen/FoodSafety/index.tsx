import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  History,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  ClipboardCheck,
  CalendarClock,
  TrendingUp,
  XCircle,
  Settings,
  Coffee,
  Utensils,
  Sun,
  Moon,
  AlarmClock,
  User
} from 'lucide-react';
import { kitchenService, DailyChecklistItemWithCompletions as BaseDailyChecklistItemWithCompletions, DailyChecklistCompletion } from '@/services/kitchenService';
import {
  FoodSafetyChecklist,
  ChecklistFrequency,
  FoodSafetyChecklistCompletion,
  WeekDay,
  ValidationCriteria,
  CheckType,
  ChecklistItemCompletion,
  TimeFrame
} from '@/types/kitchen';
import { cn } from "@/lib/utils";
import PageHeader from '@/components/PageHeader';
import ChecklistDialog from './components/ChecklistDialog'

interface TempRange {
  min: number
  max: number
  warning: number
  type?: 'product'
}

// Standard CFA temperature ranges
const CFA_TEMP_RANGES: Record<string, TempRange> = {
  // Equipment Temperatures
  walk_in_cooler: { min: 35, max: 41, warning: 2 },
  walk_in_freezer: { min: -10, max: 0, warning: 5 },
  prep_area_cooler: { min: 35, max: 41, warning: 2 },
  hot_holding: { min: 135, max: 165, warning: 5 },
  cooking_line: { min: 35, max: 41, warning: 2 },
  // Product Temperatures
  filet_cook: { min: 165, max: 175, warning: 5, type: 'product' },
  filet_hold: { min: 140, max: 145, warning: 3, type: 'product' },
  nugget_cook: { min: 165, max: 175, warning: 5, type: 'product' },
  nugget_hold: { min: 140, max: 145, warning: 3, type: 'product' },
  strip_cook: { min: 165, max: 175, warning: 5, type: 'product' },
  strip_hold: { min: 140, max: 145, warning: 3, type: 'product' },
  grilled_filet_cook: { min: 165, max: 175, warning: 5, type: 'product' },
  grilled_filet_hold: { min: 140, max: 145, warning: 3, type: 'product' },
  grilled_nugget_cook: { min: 165, max: 175, warning: 5, type: 'product' }
};

// Standard CFA checklist categories
const CHECKLIST_CATEGORIES = [
  { id: 'opening', label: 'Opening Procedures', icon: 'sunrise' },
  { id: 'temp_monitoring', label: 'Temperature Monitoring', icon: 'thermometer' },
  { id: 'food_prep', label: 'Food Preparation', icon: 'utensils' },
  { id: 'equipment', label: 'Equipment Checks', icon: 'tool' },
  { id: 'sanitation', label: 'Sanitation & Cleaning', icon: 'spray' },
  { id: 'closing', label: 'Closing Procedures', icon: 'moon' }
]

interface DailyChecklistItem {
  id: string
  name: string
  frequency?: 'once' | 'multiple'
  requiredCompletions?: number
  timeframe?: TimeFrame
}

interface DailyChecklistItems {
  [key: string]: DailyChecklistItem[]
  items: DailyChecklistItem[]
}

interface CompletedBy {
  name: string
  [key: string]: any
}

interface ReviewedBy {
  name: string
  [key: string]: any
}

interface DailyCheckCompletion {
  completed: boolean
  completedBy?: string
  completedAt?: string
}

// Update the TabType to exclude '30min' and 'hourly'
type TabType = 'morning' | 'lunch' | 'dinner'

// Extend the base interface to include category
interface DailyChecklistItemWithCompletions extends BaseDailyChecklistItemWithCompletions {
  category?: string;
}

const FoodSafety: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<FoodSafetyChecklist[]>([]);
  const [completions, setCompletions] = useState<FoodSafetyChecklistCompletion[]>([]);
  const [view, setView] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingChecklist, setEditingChecklist] = useState<FoodSafetyChecklist | null>(null);
  const [temperatures, setTemperatures] = useState<Record<string, { value: number | null; timestamp: string | null }>>({});
  const [dailyChecks, setDailyChecks] = useState<Record<string, DailyCheckCompletion>>({});
  const [tempView, setTempView] = useState<'equipment' | 'product'>('equipment');
  const [editListsDialog, setEditListsDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<'temperatures' | 'checklist' | null>(null);
  const [editedTempRanges, setEditedTempRanges] = useState<Record<string, TempRange>>(CFA_TEMP_RANGES);
  const [editedDailyItems, setEditedDailyItems] = useState<DailyChecklistItems>({
    items: []
  });
  const [recordTempDialog, setRecordTempDialog] = useState(false)
  const [recordTempView, setRecordTempView] = useState<'equipment' | 'product'>('equipment')
  const [newTemperatures, setNewTemperatures] = useState<Record<string, { value: number | null; timestamp: string | null }>>(temperatures)
  const [editListsTimeframeTab, setEditListsTimeframeTab] = useState<TimeFrame>('morning');

  // New state variables for daily checklist
  const [dailyChecklistItems, setDailyChecklistItems] = useState<Record<string, DailyChecklistItemWithCompletions[]>>({});
  const [activeTab, setActiveTab] = useState<TabType>('morning');
  const [completeItemDialog, setCompleteItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    category: string
    item: DailyChecklistItemWithCompletions
  } | null>(null);
  const [formData, setFormData] = useState({
    value: '',
    notes: '',
    status: 'pass' // Add status field with default value of 'pass'
  });

  // Add these new state variables for improved dialogs
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemName, setNewItemName] = useState('New Item');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Update useEffect to only call loadData with a refresh interval
  useEffect(() => {
    loadData();

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    // Auto-select the most relevant tab based on current time
    const currentHour = new Date().getHours()

    if (currentHour >= 5 && currentHour < 11) {
      setActiveTab('morning')
    } else if (currentHour >= 11 && currentHour < 16) {
      setActiveTab('lunch')
    } else {
      setActiveTab('dinner')
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true);

      // Directly fetch the daily checklist items with completions from the backend
      const dailyItems = await kitchenService.getDailyChecklistItems();
      console.log('Daily items from backend:', dailyItems);

      // Set the daily checklist items directly from the backend response
      setDailyChecklistItems(dailyItems);

      // Also fetch other data
      const [checklistsData, completionsData, configData, latestTemps] = await Promise.all([
        kitchenService.getAllChecklists(),
        kitchenService.getChecklistCompletions('all'),
        kitchenService.getFoodSafetyConfig(),
        kitchenService.getLatestTemperatures()
      ]);

      setChecklists(checklistsData);
      setCompletions(completionsData);

      // Set the edited daily items for the configuration
      if (configData && configData.dailyChecklistItems) {
        setEditedDailyItems(configData.dailyChecklistItems as DailyChecklistItems);
      } else {
        setEditedDailyItems({ items: [] });
      }

      // Set the temperature ranges
      if (configData && configData.temperatureRanges) {
        const newTempRanges = configData.temperatureRanges;
        setEditedTempRanges(newTempRanges);
        Object.assign(CFA_TEMP_RANGES, newTempRanges);
      }

      // Set the latest temperatures
      if (latestTemps) {
        const formattedTemps: Record<string, { value: number | null; timestamp: string | null }> = {};

        Object.entries(latestTemps).forEach(([location, data]) => {
          formattedTemps[location] = {
            value: data.value,
            timestamp: data.timestamp
          };
        });

        setTemperatures(formattedTemps);
        setNewTemperatures(formattedTemps);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      enqueueSnackbar('Failed to load food safety data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    // Count total required items across all categories
    let totalItems = 0;
    let completedItems = 0;

    // Iterate through all categories and their items
    Object.values(dailyChecklistItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        totalItems++;
        if (item.isCompleted) {
          completedItems++;
        }
      });
    });

    return totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getCriticalTasks = () => {
    // Define critical categories or items based on food safety standards
    const criticalCategories = ['sanitizer', 'hygiene', 'food_prep'];

    // Count critical items
    let criticalCount = 0;

    // Iterate through all categories and count items in critical categories
    Object.entries(dailyChecklistItems).forEach(([category, items]) => {
      if (criticalCategories.includes(category)) {
        criticalCount += items.length;
      }
    });

    return criticalCount;
  };

  const getOverdueCount = () => {
    // Count items that should be completed but aren't
    let overdueCount = 0;

    // Get current time to determine which timeframes should be completed
    const now = new Date();
    const currentHour = now.getHours();

    // Define which timeframes should be completed based on current time
    const requiredTimeframes: TimeFrame[] = [];

    if (currentHour >= 11) { // After 11 AM
      requiredTimeframes.push('morning');
    }

    if (currentHour >= 15) { // After 3 PM
      requiredTimeframes.push('lunch');
    }

    if (currentHour >= 20) { // After 8 PM
      requiredTimeframes.push('dinner');
    }

    // Count incomplete items that should be completed by now
    Object.values(dailyChecklistItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        if (
          requiredTimeframes.includes(item.timeframe as TimeFrame) &&
          !item.isCompleted
        ) {
          overdueCount++;
        }
      });
    });

    return overdueCount;
  };

  const getOverdueTimeframe = (): TabType => {
    const currentHour = new Date().getHours();

    if (currentHour >= 20) {
      return 'dinner';
    } else if (currentHour >= 15) {
      return 'lunch';
    } else {
      return 'morning';
    }
  };

  const handleCreateChecklist = async (data: any) => {
    try {
      await kitchenService.createChecklist({
        ...data,
        department: 'Kitchen'
      })
      enqueueSnackbar('Checklist created successfully', { variant: 'success' })
      loadData()
    } catch (error) {
      console.error('Error creating checklist:', error)
      enqueueSnackbar('Failed to create checklist', { variant: 'error' })
    }
  }

  const handleEditChecklist = async (data: any) => {
    try {
      await kitchenService.updateChecklist(editingChecklist!._id!, {
        ...data,
        department: 'Kitchen'
      })
      enqueueSnackbar('Checklist updated successfully', { variant: 'success' })
      loadData()
    } catch (error) {
      console.error('Error updating checklist:', error)
      enqueueSnackbar('Failed to update checklist', { variant: 'error' })
    }
  }

  const handleDeleteChecklist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await kitchenService.deleteChecklist(id)
        enqueueSnackbar('Checklist deleted successfully', { variant: 'success' })
        loadData()
      } catch (error) {
        console.error('Error deleting checklist:', error)
        enqueueSnackbar('Failed to delete checklist', { variant: 'error' })
      }
    }
  }

  const getTemperatureStatus = (location: string, temp: { value: number | null; timestamp: string | null } | undefined) => {
    // Return 'pending' if temp is undefined or null, or if value is null
    if (!temp || temp.value === null) return 'pending';

    const range = CFA_TEMP_RANGES[location as keyof typeof CFA_TEMP_RANGES];
    if (!range) return 'pending';

    if (temp.value < range.min || temp.value > range.max) return 'fail';
    if (temp.value <= range.min + range.warning || temp.value >= range.max - range.warning) return 'warning';
    return 'pass';
  };

  const handleSaveEdits = async () => {
    try {
      if (editingSection === 'temperatures') {
        await kitchenService.updateFoodSafetyConfig({
          temperatureRanges: editedTempRanges,
          dailyChecklistItems: editedDailyItems
        });
        // Reset current temperatures to force re-validation
        setTemperatures({});
      } else if (editingSection === 'checklist') {
        await kitchenService.updateFoodSafetyConfig({
          temperatureRanges: CFA_TEMP_RANGES,
          dailyChecklistItems: editedDailyItems
        });
        // Reset current checks
        setDailyChecks({});
      }

      setEditListsDialog(false);
      setEditingSection(null);
      enqueueSnackbar('Changes saved successfully', { variant: 'success' });

      // Reload data to get the latest configuration
      loadData();
    } catch (error) {
      console.error('Error saving changes:', error);
      enqueueSnackbar('Failed to save changes', { variant: 'error' });
    }
  };

  const handleRecordTemperature = (location: string, value: string) => {
    const temp = value === '' ? null : Number(value)
    setNewTemperatures(prev => ({
      ...prev,
      [location]: {
        value: temp,
        timestamp: temp !== null ? new Date().toISOString() : null
      }
    }))
  }

  const handleSaveTemperatures = async () => {
    try {
      // Format temperatures for the API with proper type casting
      const tempsToSave = Object.entries(newTemperatures)
        .filter(([_, data]) => data.value !== null)
        .map(([location, data]) => {
          const type = CFA_TEMP_RANGES[location]?.type || 'equipment';
          return {
          location,
          value: data.value as number,
            type: type as 'equipment' | 'product'
          };
        });

      if (tempsToSave.length === 0) {
        enqueueSnackbar('No temperatures to save', { variant: 'warning' });
        return;
      }

      // Save temperatures to the backend
      await kitchenService.recordMultipleTemperatures(tempsToSave);

      // Update local state
      setTemperatures(newTemperatures);
      setRecordTempDialog(false);
      enqueueSnackbar('Temperatures recorded successfully', { variant: 'success' });

      // Reload data to get the latest temperatures
      loadData();
    } catch (error) {
      console.error('Error saving temperatures:', error);
      enqueueSnackbar('Failed to save temperatures', { variant: 'error' });
    }
  }

  const handleDailyCheckToggle = (itemId: string) => {
    setDailyChecks(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.completed
        ? { completed: false }  // If it was completed, just uncomplete it
        : {
            completed: true,
            completedBy: user?.name || 'Unknown User',
            completedAt: new Date().toISOString()
          }
    }))
  }

  // New functions for daily checklist
  const handleOpenCompleteDialog = (category: string, item: DailyChecklistItemWithCompletions) => {
    setSelectedItem({ category, item });
    setFormData({
      value: '',
      notes: '',
      status: 'pass' // Set default status to 'pass'
    });
    setCompleteItemDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setCompleteItemDialog(false);
    setSelectedItem(null);
  };

  const handleCompleteItem = async () => {
    if (!selectedItem) return;

    try {
      const { category, item } = selectedItem;
      console.log('Completing item:', item);
      console.log('Category:', category);
      console.log('Form data:', formData);

      const response = await kitchenService.completeDailyChecklistItem(category, item.id, formData);
      console.log('Completion response:', response);

      // Manually update the state to reflect the completion
      setDailyChecklistItems(prev => {
        const newState = { ...prev };
        if (newState[category]) {
          newState[category] = newState[category].map(i => {
            if (i.id === item.id) {
              return {
                ...i,
                isCompleted: true,
                completedCount: i.completedCount + 1,
                completions: [
                  {
                    id: response.id,
                    completedBy: response.completedBy,
                    completedAt: response.completedAt,
                    value: response.value,
                    notes: response.notes,
                    status: response.status
                  },
                  ...(i.completions || [])
                ]
              };
            }
            return i;
          });
        }
        return newState;
      });

      enqueueSnackbar('Item completed successfully', { variant: 'success' });
      handleCloseCompleteDialog();
    } catch (error) {
      console.error('Error completing item:', error);
      enqueueSnackbar('Failed to complete item', { variant: 'error' });
    }
  };

  const handleDeleteCompletion = async (completionId: string) => {
    if (!window.confirm('Are you sure you want to delete this completion?')) return;

    try {
      await kitchenService.deleteDailyChecklistCompletion(completionId);

      // Manually update the state to reflect the deletion
      setDailyChecklistItems(prev => {
        const newState = { ...prev };

        // Loop through all categories and items to find and update the one with this completion
        Object.keys(newState).forEach(category => {
          if (Array.isArray(newState[category])) {
            newState[category] = newState[category].map(item => {
              if (item.completions && item.completions.length > 0) {
                // Filter out the deleted completion
                const updatedCompletions = item.completions.filter(c => c.id !== completionId);

                // Update the item's completion status
                return {
                  ...item,
                  completions: updatedCompletions,
                  completedCount: updatedCompletions.length,
                  isCompleted: item.frequency === 'once'
                    ? updatedCompletions.length > 0
                    : updatedCompletions.length >= (item.requiredCompletions || 1)
                };
              }
              return item;
            });
          }
        });

        return newState;
      });

      // Remove localStorage code

      enqueueSnackbar('Completion deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting completion:', error);
      enqueueSnackbar('Failed to delete completion', { variant: 'error' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format the time part
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Check if the date is today, yesterday, or another day
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeString}`;
    } else {
      // Format the date for other days
      const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return `${dateString} at ${timeString}`;
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'morning':
        return <Coffee className="h-4 w-4 mr-2" />
      case 'lunch':
        return <Utensils className="h-4 w-4 mr-2" />
      case 'dinner':
        return <Utensils className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  const getTimeframeLabel = (timeframe: TimeFrame) => {
    switch (timeframe) {
      case 'morning':
        return 'Morning (5am-11am)'
      case 'lunch':
        return 'Lunch (11am-4pm)'
      case 'dinner':
        return 'Dinner (4pm-Close)'
      case '30min':
        return '30-Minute Checks'
      case 'hourly':
        return 'Hourly Checks'
      default:
        return timeframe
    }
  }

  const getItemsForTab = (tab: TabType) => {
    let allItems: DailyChecklistItemWithCompletions[] = []

    Object.entries(dailyChecklistItems).forEach(([category, items]) => {
      // Add category information to each item
      const itemsWithCategory = items.map(item => ({
        ...item,
        category // Add the original category key for API calls
      }))
      allItems = [...allItems, ...itemsWithCategory]
    })

    // For morning tab, show morning items plus any 30min/hourly items
    if (tab === 'morning') {
      return allItems.filter(item =>
        item.timeframe === 'morning' ||
        item.timeframe === '30min' ||
        item.timeframe === 'hourly'
      )
    }

    // For lunch tab, show lunch items plus any 30min/hourly items
    if (tab === 'lunch') {
      return allItems.filter(item =>
        item.timeframe === 'lunch' ||
        item.timeframe === '30min' ||
        item.timeframe === 'hourly'
      )
    }

    // For dinner tab, show dinner items plus any 30min/hourly items
    if (tab === 'dinner') {
      return allItems.filter(item =>
        item.timeframe === 'dinner' ||
        item.timeframe === '30min' ||
        item.timeframe === 'hourly'
      )
    }

    return []
  }

  const getIncompleteCount = (tab: TabType) => {
    const items = getItemsForTab(tab)
    return items.filter(item => !item.isCompleted).length
  }

  const handleSaveConfig = async () => {
    try {
      // Make sure we have an items array
      const configToSave = { ...editedDailyItems };
      if (!configToSave.items) {
        configToSave.items = [];
      }

      // Save to backend
      await kitchenService.updateFoodSafetyConfig({
        temperatureRanges: editedTempRanges,
        dailyChecklistItems: configToSave
      });

      // Update local state with the edited items
      // Convert the DailyChecklistItems to Record<string, DailyChecklistItemWithCompletions[]>
      const updatedItems: Record<string, DailyChecklistItemWithCompletions[]> = {};

      // Copy all categories from editedDailyItems
      Object.entries(configToSave).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          // Add the category with its items
          updatedItems[category] = items as DailyChecklistItemWithCompletions[];
        }
      });

      // Make sure we have an 'items' array
      if (!updatedItems.items) {
        updatedItems.items = [];
      }

      // Update the state directly instead of reloading data
      setDailyChecklistItems(updatedItems);

      enqueueSnackbar('Changes saved successfully', { variant: 'success' });

      // Don't reload data after saving to prevent items from disappearing
      // loadData();
    } catch (error) {
      console.error('Error saving configuration:', error);
      enqueueSnackbar('Failed to save configuration', { variant: 'error' });
    }
  };

  // Initialize editedDailyItems with 'items' array if it doesn't exist
  useEffect(() => {
    if (!editedDailyItems['items']) {
      setEditedDailyItems(prev => ({
        ...prev,
        items: []
      }));
    }
  }, [editedDailyItems]);

  const handleEditDailyItem = (category: string, item: DailyChecklistItemWithCompletions) => {
    setSelectedItem({ category, item });
    setNewItemDialog(true);
  };

  const handleTemperatureRecord = (records: { location: string; value: number; type?: 'equipment' | 'product' }[]) => {
    // Implementation here
  };

  return (
    <div className="space-y-3 sm:space-y-6 px-3 sm:px-4 md:px-6 pb-6 safe-area-top safe-area-bottom">

      {/* Add the Edit Lists Dialog */}
      <Dialog open={editListsDialog} onOpenChange={setEditListsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Safety Lists</DialogTitle>
            <DialogDescription>
              Add, remove, or modify food safety items and temperature ranges.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 flex gap-2 border-b">
            <Button
              variant={editingSection === 'temperatures' ? 'default' : 'outline'}
              onClick={() => setEditingSection('temperatures')}
              className={cn(
                "rounded-full",
                editingSection === 'temperatures'
                  ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  : "hover:bg-[#E51636]/10 hover:text-[#E51636]"
              )}
            >
              Temperature Ranges
            </Button>
            <Button
              variant={editingSection === 'checklist' ? 'default' : 'outline'}
              onClick={() => setEditingSection('checklist')}
              className={cn(
                "rounded-full",
                editingSection === 'checklist'
                  ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  : "hover:bg-[#E51636]/10 hover:text-[#E51636]"
              )}
            >
              Daily Checklist
            </Button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {editingSection === 'temperatures' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-lg text-[#27251F]">Equipment Temperatures</div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const id = `equipment_${Date.now()}`;
                      setEditedTempRanges(prev => ({
                        ...prev,
                        [id]: { min: 35, max: 41, warning: 2 }
                      }));
                    }}
                    className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add Equipment
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 pr-4">
                    {Object.entries(editedTempRanges)
                      .filter(([_, range]) => !range.type)
                      .map(([location, range]) => (
                        <div key={location} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Input
                                value={location.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                onChange={(e) => {
                                  const newLocation = e.target.value.toLowerCase().replace(/ /g, '_');
                                  const value = editedTempRanges[location];
                                  const newRanges = { ...editedTempRanges };
                                  delete newRanges[location];
                                  newRanges[newLocation] = value;
                                  setEditedTempRanges(newRanges);
                                }}
                                className="font-medium"
                                placeholder="Equipment Name"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newRanges = { ...editedTempRanges };
                                delete newRanges[location];
                                setEditedTempRanges(newRanges);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Min (°F)</Label>
                              <Input
                                type="number"
                                value={range.min}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], min: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Max (°F)</Label>
                              <Input
                                type="number"
                                value={range.max}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], max: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Warning (±°F)</Label>
                              <Input
                                type="number"
                                value={range.warning}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], warning: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 mt-8">
                  <div className="font-medium text-lg text-[#27251F]">Product Temperatures</div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const id = `product_${Date.now()}`;
                      setEditedTempRanges(prev => ({
                        ...prev,
                        [id]: { min: 165, max: 175, warning: 5, type: 'product' }
                      }));
                    }}
                    className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/10 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {Object.entries(editedTempRanges)
                      .filter(([_, range]) => range.type === 'product')
                      .map(([location, range]) => (
                        <div key={location} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Input
                                value={location.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                onChange={(e) => {
                                  const newLocation = e.target.value.toLowerCase().replace(/ /g, '_');
                                  const value = editedTempRanges[location];
                                  const newRanges = { ...editedTempRanges };
                                  delete newRanges[location];
                                  newRanges[newLocation] = value;
                                  setEditedTempRanges(newRanges);
                                }}
                                className="font-medium"
                                placeholder="Product Name"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newRanges = { ...editedTempRanges };
                                delete newRanges[location];
                                setEditedTempRanges(newRanges);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Min (°F)</Label>
                              <Input
                                type="number"
                                value={range.min}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], min: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Max (°F)</Label>
                              <Input
                                type="number"
                                value={range.max}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], max: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Warning (±°F)</Label>
                              <Input
                                type="number"
                                value={range.warning}
                                onChange={(e) => setEditedTempRanges(prev => ({
                                  ...prev,
                                  [location]: { ...prev[location], warning: Number(e.target.value) }
                                }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : editingSection === 'checklist' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg text-[#27251F]">Daily Checklist Items</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setNewCategoryDialog(true)}
                      className="flex items-center gap-2 text-[#E51636] border-[#E51636] hover:bg-[#E51636]/10"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                    <Button
                      onClick={() => {
                        setNewItemCategory('');
                        setNewItemName('New Item');
                        setNewItemDialog(true);
                      }}
                      className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Add tabs for Morning, Lunch, and Dinner */}
                <Tabs
                  defaultValue="morning"
                  value={editListsTimeframeTab}
                  onValueChange={(value) => setEditListsTimeframeTab(value as TimeFrame)}
                  className="w-full"
                >
                  <TabsList className="w-full h-auto p-1 bg-gray-100/80 rounded-xl flex">
                    <TabsTrigger
                      value="morning"
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      <span className="font-medium">Morning</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="lunch"
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      <span className="font-medium">Lunch</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="dinner"
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      <span className="font-medium">Dinner</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      {getTabIcon(editListsTimeframeTab as TabType)}
                      <h2 className="text-lg font-semibold text-[#27251F]">{getTimeframeLabel(editListsTimeframeTab)}</h2>
                  </div>
                    <p className="text-[#27251F]/60 text-sm">
                      Manage tasks for the {getTimeframeLabel(editListsTimeframeTab).toLowerCase()} timeframe
                    </p>
                    <p className="text-[#27251F]/60 text-xs mt-1 italic">
                      Note: New items will automatically be assigned to the {editListsTimeframeTab} timeframe
                    </p>
              </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-6 pr-4">
                      {/* Filter items by the selected timeframe tab */}
                      {Object.entries(editedDailyItems).map(([category, items]: [string, any[]]) => {
                        // Filter items by the selected timeframe
                        const filteredItems = items.filter(item =>
                          item.timeframe === editListsTimeframeTab ||
                          item.timeframe === '30min' ||
                          item.timeframe === 'hourly'
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                          <div key={category} className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-[#27251F] capitalize">
                                {category.toString().replace('_', ' ')}
                              </h4>
            <Button
                                variant="ghost"
                                          size="sm"
                                onClick={() => {
                                  // Remove this category
                                  const newItems = { ...editedDailyItems };
                                  delete newItems[category];
                                  setEditedDailyItems(newItems);
                                }}
                                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove Category
              </Button>
          </div>

                                      <div className="space-y-2">
                              {filteredItems.map((item) => (
                                <div
                                  key={item.id}
                                                className={cn(
                                    "flex items-center justify-between p-2 bg-gray-50 rounded-lg",
                                    item.isCompleted && item.completions && item.completions.length > 0 && item.completions[0].status === 'fail'
                                      ? "border border-red-300"
                                      : ""
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <Input
                                      value={item.name}
                                      onChange={(e) => {
                                        const newItems = { ...editedDailyItems };
                                        const itemIndex = newItems[category].findIndex(i => i.id === item.id);
                                        if (itemIndex !== -1) {
                                          newItems[category][itemIndex].name = e.target.value;
                                          setEditedDailyItems(newItems);
                                        }
                                      }}
                                      className="font-medium"
                                    />
                                  </div>
                                  <Select
                                    value={item.frequency}
                                    onValueChange={(value) => {
                                      const newItems = { ...editedDailyItems };
                                      const itemIndex = newItems[category].findIndex(i => i.id === item.id);
                                      if (itemIndex !== -1) {
                                        newItems[category][itemIndex].frequency = value as 'once' | 'multiple';
                                        if (value === 'multiple' && !newItems[category][itemIndex].requiredCompletions) {
                                          newItems[category][itemIndex].requiredCompletions = 2;
                                        }
                                        setEditedDailyItems(newItems);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="once">Once</SelectItem>
                                      <SelectItem value="multiple">Multiple</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {item.frequency === 'multiple' && (
                                    <Input
                                      type="number"
                                      value={item.requiredCompletions || 1}
                                      onChange={(e) => {
                                        const newItems = { ...editedDailyItems };
                                        const itemIndex = newItems[category].findIndex(i => i.id === item.id);
                                        if (itemIndex !== -1) {
                                          newItems[category][itemIndex].requiredCompletions = Number(e.target.value);
                                          setEditedDailyItems(newItems);
                                        }
                                      }}
                                      className="w-[80px]"
                                      min={1}
                                    />
                                  )}
              <Button
                                                variant="ghost"
                                                size="icon"
                                    onClick={() => {
                                      const newItems = { ...editedDailyItems };
                                      newItems[category] = newItems[category].filter(i => i.id !== item.id);
                                      setEditedDailyItems(newItems);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
              </Button>
          </div>
                                        ))}
              </div>
            </div>
                              );
                            })}
              </div>
                  </ScrollArea>
                </Tabs>
              </div>
            ) : null}
            </div>

          <DialogFooter className="p-6 border-t">
                <Button
              variant="outline"
                    onClick={() => {
                setEditListsDialog(false);
                // Reset to original values
                setEditedTempRanges({ ...CFA_TEMP_RANGES });
                setEditedDailyItems({ items: [] });
              }}
            >
              Cancel
                </Button>
                <Button
              onClick={handleSaveConfig}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              Save Changes
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add this before the Stats Grid */}
      <Dialog open={recordTempDialog} onOpenChange={setRecordTempDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Record Temperatures</DialogTitle>
          </DialogHeader>

          <div className="p-6 flex gap-2 border-b">
                    <Button
              variant={recordTempView === 'equipment' ? 'default' : 'outline'}
              onClick={() => setRecordTempView('equipment')}
              className={cn(
                "rounded-full",
                recordTempView === 'equipment'
                  ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  : "hover:bg-[#E51636]/10 hover:text-[#E51636]"
              )}
            >
              Equipment
                                </Button>
                                <Button
              variant={recordTempView === 'product' ? 'default' : 'outline'}
              onClick={() => setRecordTempView('product')}
              className={cn(
                "rounded-full",
                recordTempView === 'product'
                  ? "bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                  : "hover:bg-[#E51636]/10 hover:text-[#E51636]"
              )}
            >
              Product
                    </Button>
                </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {Object.entries(CFA_TEMP_RANGES)
              .filter(([_, range]) =>
                recordTempView === 'equipment' ? !range.type : range.type === 'product'
              )
              .map(([location, range]) => {
                const temp = newTemperatures[location]
                const status = getTemperatureStatus(location, temp)
                const locationName = location.split('_').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')

                return (
                  <div key={location} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-[#27251F]">{locationName}</Label>
                      {status !== 'pending' && (
                        <div className="flex items-center gap-2">
                          {status === 'pass' && <ThermometerSun className="h-4 w-4 text-green-600" />}
                          {status === 'warning' && <Thermometer className="h-4 w-4 text-yellow-600" />}
                          {status === 'fail' && <ThermometerSnowflake className="h-4 w-4 text-red-600" />}
                        </div>
                                )}
                              </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={temp?.value === null ? '' : temp?.value}
                          onChange={(e) => handleRecordTemperature(location, e.target.value)}
                          placeholder="Enter temperature"
                          className={cn(
                            "font-medium",
                            status === 'fail' && "border-red-500 focus:ring-red-500",
                            status === 'warning' && "border-yellow-500 focus:ring-yellow-500",
                            status === 'pass' && "border-green-500 focus:ring-green-500"
                          )}
                        />
                      </div>
                      <div className="text-sm text-[#27251F]/60 pb-2">
                        Target: {range.min}°F - {range.max}°F
                      </div>
                    </div>
                    {status === 'fail' && (
                      <p className="text-sm text-red-600">
                        Temperature must be between {range.min}°F and {range.max}°F
                      </p>
                    )}
                    {status === 'warning' && (
                      <p className="text-sm text-yellow-600">
                        Temperature is near the limit (±{range.warning}°F)
                      </p>
                            )}
                          </div>
                )
              })}
                        </div>

          <DialogFooter className="p-6 border-t">
                          <Button
                                variant="outline"
              onClick={() => {
                setRecordTempDialog(false)
                setNewTemperatures(temperatures) // Reset to current temperatures
              }}
            >
              Cancel
                          </Button>
            <Button
              onClick={handleSaveTemperatures}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              Save Temperatures
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Cards - Row on desktop, 2x2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Completion Rate Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 text-sm md:text-base font-medium">Completion Rate</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getCompletionRate()}%</h3>
                <p className="text-[#27251F]/60 text-xs md:text-sm mt-1">
                  {Object.values(dailyChecklistItems).flat().filter(item => item.isCompleted).length} completed today
                </p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 bg-[#E51636]/10 text-[#E51636] rounded-2xl flex items-center justify-center">
                <ClipboardCheck strokeWidth={2} size={20} className="md:h-6 md:w-6 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Checks Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 text-sm md:text-base font-medium">Temperature Checks</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">
                  {Object.keys(temperatures).filter(location =>
                    temperatures[location]?.value !== null &&
                    temperatures[location]?.timestamp &&
                    new Date(temperatures[location]?.timestamp as string).toDateString() === new Date().toDateString()
                  ).length}
                </h3>
                <p className="text-[#27251F]/60 text-xs md:text-sm mt-1">
                  {Object.keys(CFA_TEMP_RANGES).length} total monitoring points
                </p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <ThermometerSun strokeWidth={2} size={20} className="md:h-6 md:w-6 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 text-sm md:text-base font-medium">Overdue Tasks</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getOverdueCount()}</h3>
                <p className="text-[#27251F]/60 text-xs md:text-sm mt-1">
                  {getOverdueTimeframe() === 'morning' ? 'Morning' : getOverdueTimeframe() === 'lunch' ? 'Lunch' : 'Dinner'} tasks pending
                </p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <CalendarClock strokeWidth={2} size={20} className="md:h-6 md:w-6 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Tasks Card */}
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#27251F]/60 text-sm md:text-base font-medium">Critical Tasks</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-[#27251F]">{getCriticalTasks()}</h3>
                <p className="text-[#27251F]/60 text-xs md:text-sm mt-1">
                  {Object.values(dailyChecklistItems).flat().filter(item => item.isCompleted && ['sanitizer', 'hygiene', 'food_prep'].includes(item.category || '')).length} completed today
                </p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle strokeWidth={2} size={20} className="md:h-6 md:w-6 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Button
          onClick={() => navigate('/kitchen/food-safety/history')}
          className="h-9 sm:h-10 text-xs sm:text-sm bg-[#E51636] text-white hover:bg-[#E51636]/90 touch-manipulation active-scale w-full"
        >
          <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Food Safety History
        </Button>
        <Button
          onClick={() => {
            // Initialize editedDailyItems with the current items
            // Make a deep copy to avoid reference issues
            const currentItems: DailyChecklistItems = { items: [] };

            // Copy items from dailyChecklistItems if they exist
            if (dailyChecklistItems.items && Array.isArray(dailyChecklistItems.items)) {
              currentItems.items = [...dailyChecklistItems.items];
            }

            // Copy other categories
            Object.entries(dailyChecklistItems).forEach(([category, items]) => {
              if (category !== 'items' && Array.isArray(items)) {
                currentItems[category] = [...items];
              }
            });

            setEditedDailyItems(currentItems);
            setEditListsDialog(true);
          }}
          variant="outline"
          className="h-9 sm:h-10 text-xs sm:text-sm border-[#27251F]/20 hover:bg-gray-50 w-full"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Edit Lists
        </Button>
        <Button
          variant="outline"
          className="h-9 sm:h-10 text-xs sm:text-sm bg-white shadow-sm border-gray-200 w-full"
          onClick={() => {
            setRecordTempDialog(true)
            setNewTemperatures(temperatures)
          }}
        >
          <ThermometerSun className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500" />
          Record Temperatures
        </Button>
        <Button
          variant="outline"
          className="h-9 sm:h-10 text-xs sm:text-sm bg-white shadow-sm border-gray-200 w-full"
          onClick={() => setActiveTab(getOverdueTimeframe())}
        >
          <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500" />
          View Overdue Tasks
        </Button>
      </div>

      {/* Daily Checklist Section */}
      <Card className="bg-white rounded-[16px] sm:rounded-[20px] hover:shadow-xl transition-all duration-300">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#27251F] flex flex-wrap items-center gap-2">
                Daily Checklist
                <span className="inline-flex items-center justify-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-[#E51636]/10 text-[#E51636] rounded-full">
                  {getIncompleteCount(activeTab)} remaining
                </span>
              </h2>
              <p className="text-sm text-[#27251F]/60 mt-2">Track and complete daily tasks</p>
            </div>
            <Button
              onClick={() => {
                setNewItemCategory('');
                setNewItemName('New Item');
                setNewItemDialog(true);
              }}
              className="w-full sm:w-auto h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-[#E51636] text-white hover:bg-[#E51636]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#E51636]/20 touch-manipulation active-scale"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              Add Item
            </Button>
            </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
            <div className="relative mb-4 sm:mb-6 overflow-hidden">
              <ScrollArea className="w-full momentum-scroll">
                <TabsList className="w-full h-auto p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl flex">
                  <TabsTrigger
                    value="morning"
                    className="flex-1 flex items-center justify-center h-10 sm:h-12 px-2 sm:px-4 py-1 sm:py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 touch-manipulation active-scale"
                  >
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-xs sm:text-sm">Morning</span>
                    {getIncompleteCount('morning') > 0 && (
                      <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs bg-red-100 text-red-600 hover:bg-red-100">
                        {getIncompleteCount('morning')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="lunch"
                    className="flex-1 flex items-center justify-center h-10 sm:h-12 px-2 sm:px-4 py-1 sm:py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 touch-manipulation active-scale"
                  >
                    <AlarmClock className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-xs sm:text-sm">Lunch</span>
                    {getIncompleteCount('lunch') > 0 && (
                      <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs bg-red-100 text-red-600 hover:bg-red-100">
                        {getIncompleteCount('lunch')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="dinner"
                    className="flex-1 flex items-center justify-center h-10 sm:h-12 px-2 sm:px-4 py-1 sm:py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 touch-manipulation active-scale"
                  >
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-xs sm:text-sm">Dinner</span>
                    {getIncompleteCount('dinner') > 0 && (
                      <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs bg-red-100 text-red-600 hover:bg-red-100">
                        {getIncompleteCount('dinner')}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
              <ScrollArea className="h-[400px] xs:h-[450px] sm:h-[500px] md:h-[600px]">
                <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
                  {getItemsForTab(activeTab).map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-300",
                        item.isCompleted && item.completions && item.completions.length > 0
                          ? item.completions[0].status === 'pass'
                            ? "bg-green-50 hover:bg-green-100/80"
                            : "bg-red-50 hover:bg-red-100/80"
                          : "bg-gray-50 hover:bg-gray-100/80",
                        "hover:shadow-md group touch-manipulation active-scale"
                      )}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="mt-0.5 transition-transform duration-300 group-hover:scale-110">
                              {item.isCompleted ? (
                                item.completions && item.completions[0].status === 'pass' ? (
                                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                )
                              ) : (
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-base font-medium text-[#27251F] transition-colors duration-200 group-hover:text-[#E51636]">{item.name}</h3>
                                {item.frequency === 'multiple' && (
                                  <Badge variant="outline" className="text-xs sm:text-sm border-gray-300 text-gray-600">
                                    {item.requiredCompletions}x Daily
                                  </Badge>
                                )}
                              </div>
                              {item.completions && item.completions.length > 0 && (
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                                  <span className="text-xs sm:text-sm text-gray-500 truncate">
                                    {item.completions[0].completedBy} - {formatTime(item.completions[0].completedAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 sm:mt-0">
                          {!item.isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCompleteDialog(item.category || '', item)}
                              className="h-9 sm:h-10 md:h-11 text-xs sm:text-sm border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 hover:shadow-lg hover:shadow-green-600/10 touch-manipulation active-scale"
                            >
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Temperature Monitoring Section */}
        <Card className="bg-white rounded-[16px] sm:rounded-[20px] hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#27251F]">Temperature Logs</h2>
                <p className="text-sm text-[#27251F]/60 mt-1">Monitor and record temperatures</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => navigate('/kitchen/food-safety/history')}
                  className="w-full sm:w-auto h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-white border border-[#E51636] text-[#E51636] hover:bg-[#E51636]/10 touch-manipulation active-scale"
                >
                  <History className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  View History
                </Button>
                <Button
                  onClick={() => {
                    setRecordTempDialog(true)
                    setNewTemperatures(temperatures)
                  }}
                  className="w-full sm:w-auto h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-[#E51636] text-white hover:bg-[#E51636]/90 touch-manipulation active-scale"
                >
                  Record Temperatures
                </Button>
              </div>
            </div>

            <div className="flex justify-end mb-3 sm:mb-4">
              <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTempView('equipment')}
                  className={cn(
                    "px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 touch-manipulation",
                    tempView === 'equipment' ? "bg-white text-[#E51636] shadow-sm" : "text-gray-600"
                  )}
                >
                  Equipment
                </button>
                <button
                  onClick={() => setTempView('product')}
                  className={cn(
                    "px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 touch-manipulation",
                    tempView === 'product' ? "bg-white text-[#E51636] shadow-sm" : "text-gray-600"
                  )}
                >
                  Products
                </button>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {Object.entries(CFA_TEMP_RANGES)
                .filter(([_, range]) =>
                  tempView === 'equipment' ? !range.type : range.type === 'product'
                )
                .map(([location, range]) => {
                  const temp = temperatures?.[location] || { value: null, timestamp: null };
                  const status = getTemperatureStatus(location, temp);
                  const locationName = location.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');

                  return (
                    <div
                      key={location}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200",
                        status === 'pass' ? "bg-green-50" :
                        status === 'warning' ? "bg-yellow-50" :
                        status === 'fail' ? "bg-red-50" :
                        "bg-gray-50",
                        "hover:shadow-md touch-manipulation active-scale"
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {status === 'pass' && <ThermometerSun className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />}
                        {status === 'warning' && <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 shrink-0" />}
                        {status === 'fail' && <ThermometerSnowflake className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0" />}
                        {status === 'pending' && <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 shrink-0" />}
                        <div>
                          <p className="text-sm sm:text-base font-medium text-[#27251F]">{locationName}</p>
                          <p className="text-xs sm:text-sm text-[#27251F]/60">
                            Target: {range.min}°F - {range.max}°F
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1 mt-2 sm:mt-0">
                        {temp?.value !== null ? (
                          <>
                            <span className={cn(
                              "text-lg sm:text-xl font-semibold",
                              status === 'pass' ? "text-green-600" :
                              status === 'warning' ? "text-yellow-600" :
                              status === 'fail' ? "text-red-600" :
                              "text-[#27251F]"
                            )}>
                              {temp.value}°F
                            </span>
                            {temp?.timestamp && (
                              <span className="text-xs sm:text-sm text-[#27251F]/60">
                                {new Date(temp.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm text-[#27251F]/60">Not recorded</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Add the NewItemDialog */}
        <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
          <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Food Safety Checklist</DialogTitle>
            <DialogDescription>
              Add, remove, or modify checklist items. Required items cannot be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-2 mb-6">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add new item..."
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (!newItemName.trim()) {
                    enqueueSnackbar('Please enter an item name', { variant: 'warning' });
                    return;
                  }

                  // Create a copy of the current items
                  const newItems = { ...editedDailyItems };

                  // Ensure the items array exists
                  if (!newItems.items) {
                    newItems.items = [];
                  }

                  // Add the new item with default values
                  newItems.items.push({
                    id: `new_${Date.now()}`,
                    name: newItemName,
                    frequency: 'once',
                    requiredCompletions: 1,
                    timeframe: activeTab as TimeFrame
                  });

                  setEditedDailyItems(newItems);
                  setNewItemName(''); // Reset input field
                }}
                className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-10 w-10 p-0 flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="border rounded-lg">
              {editedDailyItems.items && editedDailyItems.items.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="divide-y">
                    {editedDailyItems.items
                      .filter((item: DailyChecklistItem) => {
                        // Filter items based on the current tab
                        if (activeTab === 'morning') {
                          return item.timeframe === 'morning' ||
                                item.timeframe === '30min' ||
                                item.timeframe === 'hourly';
                        }
                        if (activeTab === 'lunch') {
                          return item.timeframe === 'lunch' ||
                                item.timeframe === '30min' ||
                                item.timeframe === 'hourly';
                        }
                        if (activeTab === 'dinner') {
                          return item.timeframe === 'dinner' ||
                                item.timeframe === '30min' ||
                                item.timeframe === 'hourly';
                        }
                        return false;
                      })
                      .map((item: DailyChecklistItem) => (
                        <div key={item.id} className="flex items-center justify-between p-4">
                          <span className="text-[#27251F]">{item.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newItems = { ...editedDailyItems };

                              if (newItems.items) {
                                newItems.items = newItems.items.filter(i => i.id !== item.id);
                                setEditedDailyItems(newItems);
                              }
                            }}
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No items added yet
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to original items when canceling
                loadData();
                setNewItemDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveConfig()}
              variant="outline"
              className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/10"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                handleSaveConfig();
                setNewItemDialog(false);
              }}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
            >
              Save & Close
            </Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add the Complete Dialog */}
        <Dialog open={completeItemDialog} onOpenChange={setCompleteItemDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Complete Checklist Item</DialogTitle>
              <DialogDescription>
                Record the completion of this food safety check.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.status === 'pass'
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'pass' }))}
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span className="font-medium text-sm">Pass</span>
                  </div>
                  <div
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.status === 'warning'
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'warning' }))}
                  >
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium text-sm">Warning</span>
                  </div>
                  <div
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.status === 'fail'
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'fail' }))}
                  >
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="font-medium text-sm">Fail</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Value (optional)</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter a value if applicable"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any relevant notes"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseCompleteDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteItem}
                className="bg-[#E51636] text-white hover:bg-[#E51636]/90"
              >
                Complete Check
              </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
  );
};

export default FoodSafety;