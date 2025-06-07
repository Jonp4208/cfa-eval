import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  User,
  Shield,
  Target,
  Zap,
  Activity,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Star,
  Flame,
  Snowflake,
  Timer,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUp,
  ArrowDown,
  TrendingDown
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

// Enhanced progress ring component for beautiful visualizations
const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#E51636",
  backgroundColor = "#F3F4F6",
  showPercentage = true,
  label,
  animated = true
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className={`transform -rotate-90 ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(229, 22, 54, 0.3))'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-[#27251F]">{Math.round(progress)}%</span>
        )}
        {label && (
          <span className="text-xs text-[#27251F]/60 mt-1 text-center">{label}</span>
        )}
      </div>
    </div>
  );
};

interface TempRange {
  min: number
  max: number
  warning: number
  type?: 'product'
}

// Standard restaurant temperature ranges
const TEMP_RANGES: Record<string, TempRange> = {
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

// Standard restaurant checklist categories
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
  const [editedTempRanges, setEditedTempRanges] = useState<Record<string, TempRange>>(TEMP_RANGES);
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
    // Auto-select the most relevant tab based on current store time
    const storeTime = getStoreTime();
    const currentHour = storeTime.getHours();

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
        Object.assign(TEMP_RANGES, newTempRanges);
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

    // Get current store time to determine which timeframes should be completed
    const storeTime = getStoreTime();
    const currentHour = storeTime.getHours();
    const currentMinutes = storeTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    // Count incomplete items that are past their deadline
    Object.values(dailyChecklistItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        if (!item.isCompleted && !canCompleteTask(item.timeframe || 'morning')) {
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

  // Get current time in store's timezone (default to Eastern Time for CFA)
  const getStoreTime = () => {
    // For now, we'll use Eastern Time as default for CFA stores
    // TODO: Get actual store timezone from store settings
    const storeTimezone = user?.store?.timezone || 'America/New_York';

    try {
      const now = new Date();
      const storeTime = new Date(now.toLocaleString('en-US', { timeZone: storeTimezone }));
      return storeTime;
    } catch (error) {
      console.warn('Error getting store time, falling back to local time:', error);
      return new Date();
    }
  };

  // Check if a task can still be completed based on time window
  const canCompleteTask = (timeframe: string): boolean => {
    const storeTime = getStoreTime();
    const currentHour = storeTime.getHours();
    const currentMinutes = storeTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    switch (timeframe) {
      case 'morning':
        // Morning tasks must be completed by 10:30 AM (630 minutes)
        return currentTimeInMinutes <= 630; // 10:30 AM = 10*60 + 30 = 630 minutes
      case 'lunch':
        // Lunch tasks can be started at 10:00 AM and must be completed by 2:00 PM
        return currentTimeInMinutes >= 600 && currentTimeInMinutes <= 840; // 10:00 AM to 2:00 PM
      case 'dinner':
        // Dinner tasks can be started at 1:00 PM and must be completed by 8:00 PM
        return currentTimeInMinutes >= 780 && currentTimeInMinutes <= 1200; // 1:00 PM to 8:00 PM
      case '30min':
      case 'hourly':
        // These can be completed anytime during operating hours (5 AM - 11 PM)
        return currentTimeInMinutes >= 300 && currentTimeInMinutes <= 1380; // 5:00 AM to 11:00 PM
      default:
        return true;
    }
  };

  // Get the reason why a task cannot be completed
  const getTaskRestrictionReason = (timeframe: string): string => {
    const storeTime = getStoreTime();
    const currentHour = storeTime.getHours();
    const currentMinutes = storeTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    switch (timeframe) {
      case 'morning':
        if (currentTimeInMinutes > 630) {
          return 'Morning tasks must be completed by 10:30 AM';
        }
        break;
      case 'lunch':
        if (currentTimeInMinutes < 600) {
          return 'Lunch tasks cannot be started before 10:00 AM';
        }
        if (currentTimeInMinutes > 840) {
          return 'Lunch tasks must be completed by 2:00 PM';
        }
        break;
      case 'dinner':
        if (currentTimeInMinutes < 780) {
          return 'Dinner tasks cannot be started before 1:00 PM';
        }
        if (currentTimeInMinutes > 1200) {
          return 'Dinner tasks must be completed by 8:00 PM';
        }
        break;
      case '30min':
      case 'hourly':
        if (currentTimeInMinutes < 300) {
          return 'Tasks cannot be started before 5:00 AM';
        }
        if (currentTimeInMinutes > 1380) {
          return 'Tasks must be completed by 11:00 PM';
        }
        break;
    }
    return '';
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

    const range = TEMP_RANGES[location as keyof typeof TEMP_RANGES];
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
          temperatureRanges: TEMP_RANGES,
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
          const type = TEMP_RANGES[location]?.type || 'equipment';
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

  // Get current time context for smart UI using store timezone
  const getCurrentTimeContext = () => {
    const storeTime = getStoreTime();
    const hour = storeTime.getHours();
    if (hour >= 5 && hour < 11) return { period: 'morning', icon: Sun, color: 'from-orange-400 to-yellow-500', bgColor: 'bg-orange-50' };
    if (hour >= 11 && hour < 16) return { period: 'lunch', icon: Utensils, color: 'from-blue-400 to-cyan-500', bgColor: 'bg-blue-50' };
    return { period: 'dinner', icon: Moon, color: 'from-purple-400 to-indigo-500', bgColor: 'bg-purple-50' };
  };

  const timeContext = getCurrentTimeContext();
  const TimeIcon = timeContext.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 safe-area-top safe-area-bottom">
      {/* Hero Dashboard Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-6">
        {/* Time-Based Welcome Banner */}
        <Card className={`mb-6 overflow-hidden border-0 shadow-xl ${timeContext.bgColor} relative`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${timeContext.color} opacity-10`}></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${timeContext.color} text-white shadow-lg`}>
                  <TimeIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#27251F] capitalize">
                    Good {timeContext.period}!
                  </h2>
                  <p className="text-[#27251F]/70 text-sm">
                    {timeContext.period === 'morning' && "Start your day with safety checks"}
                    {timeContext.period === 'lunch' && "Keep up the great work!"}
                    {timeContext.period === 'dinner' && "Finish strong with final checks"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => loadData()}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white/50"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Completion Rate with Progress Ring */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={getCompletionRate()}
                  size={80}
                  strokeWidth={6}
                  color="#E51636"
                  animated={true}
                  showPercentage={false}
                />
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-[#27251F] group-hover:text-[#E51636] transition-colors">
                    {getCompletionRate()}%
                  </h3>
                  <p className="text-[#27251F]/60 text-sm font-medium">Completion Rate</p>
                  <p className="text-[#27251F]/40 text-xs mt-1">
                    {Object.values(dailyChecklistItems).flat().filter(item => item.isCompleted).length} completed today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Status */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <ThermometerSun className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {Object.keys(TEMP_RANGES).length} points
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#27251F] group-hover:text-blue-600 transition-colors">
                {Object.keys(temperatures).filter(location =>
                  temperatures[location]?.value !== null &&
                  temperatures[location]?.timestamp &&
                  new Date(temperatures[location]?.timestamp as string).toDateString() === new Date().toDateString()
                ).length}
              </h3>
              <p className="text-[#27251F]/60 text-sm font-medium">Temps Recorded</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-1">
                  {Object.entries(temperatures).slice(0, 3).map(([location, temp], index) => {
                    const status = getTemperatureStatus(location, temp);
                    return (
                      <div
                        key={location}
                        className={cn(
                          "w-3 h-3 rounded-full border-2 border-white",
                          status === 'pass' ? 'bg-green-500' :
                          status === 'warning' ? 'bg-yellow-500' :
                          status === 'fail' ? 'bg-red-500' : 'bg-gray-300'
                        )}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-[#27251F]/40 ml-2">Status indicators</span>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <CalendarClock className="h-6 w-6" />
                </div>
                {getOverdueCount() > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-[#27251F] group-hover:text-amber-600 transition-colors">
                {getOverdueCount()}
              </h3>
              <p className="text-[#27251F]/60 text-sm font-medium">Overdue Tasks</p>
              <p className="text-[#27251F]/40 text-xs mt-1">
                {getOverdueTimeframe() === 'morning' ? 'Morning' : getOverdueTimeframe() === 'lunch' ? 'Lunch' : 'Dinner'} tasks pending
              </p>
            </CardContent>
          </Card>

          {/* Critical Tasks */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Priority
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#27251F] group-hover:text-green-600 transition-colors">
                {getCriticalTasks()}
              </h3>
              <p className="text-[#27251F]/60 text-sm font-medium">Critical Tasks</p>
              <p className="text-[#27251F]/40 text-xs mt-1">
                {Object.values(dailyChecklistItems).flat().filter(item => item.isCompleted && ['sanitizer', 'hygiene', 'food_prep'].includes(item.category || '')).length} completed today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Button
            onClick={() => navigate('/kitchen/food-safety/history')}
            className="h-14 bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white hover:from-[#DD0031] hover:to-[#E51636] shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group"
          >
            <div className="flex flex-col items-center gap-1">
              <History className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">History</span>
            </div>
          </Button>

          <Button
            onClick={() => {
              const currentItems: DailyChecklistItems = { items: [] };
              if (dailyChecklistItems.items && Array.isArray(dailyChecklistItems.items)) {
                currentItems.items = [...dailyChecklistItems.items];
              }
              Object.entries(dailyChecklistItems).forEach(([category, items]) => {
                if (category !== 'items' && Array.isArray(items)) {
                  currentItems[category] = [...items];
                }
              });
              setEditedDailyItems(currentItems);
              setEditListsDialog(true);
            }}
            variant="outline"
            className="h-14 border-2 border-gray-200 hover:border-[#E51636] hover:bg-[#E51636]/5 transition-all duration-300 rounded-2xl group"
          >
            <div className="flex flex-col items-center gap-1">
              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform group-hover:text-[#E51636]" />
              <span className="text-xs font-medium group-hover:text-[#E51636]">Edit Lists</span>
            </div>
          </Button>

          <Button
            onClick={() => {
              setRecordTempDialog(true);
              setNewTemperatures(temperatures);
            }}
            variant="outline"
            className="h-14 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-2xl group"
          >
            <div className="flex flex-col items-center gap-1">
              <ThermometerSun className="h-5 w-5 group-hover:scale-110 transition-transform group-hover:text-blue-600" />
              <span className="text-xs font-medium group-hover:text-blue-600">Record Temps</span>
            </div>
          </Button>

          <Button
            onClick={() => setActiveTab(getOverdueTimeframe())}
            variant="outline"
            className="h-14 border-2 border-amber-200 hover:border-amber-500 hover:bg-amber-50 transition-all duration-300 rounded-2xl group"
          >
            <div className="flex flex-col items-center gap-1">
              <Target className="h-5 w-5 group-hover:scale-110 transition-transform group-hover:text-amber-600" />
              <span className="text-xs font-medium group-hover:text-amber-600">View Tasks</span>
            </div>
          </Button>
        </div>

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
                setEditedTempRanges({ ...TEMP_RANGES });
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
            {Object.entries(TEMP_RANGES)
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

        {/* Enhanced Daily Checklist Section */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Daily Checklist</h2>
                  <p className="text-white/80 text-sm">
                    {getIncompleteCount(activeTab)} tasks remaining for {activeTab}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setNewItemCategory('');
                  setNewItemName('New Item');
                  setNewItemDialog(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
              {/* Enhanced Tab Navigation */}
              <div className="relative mb-6">
                <TabsList className="w-full h-auto p-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl flex shadow-inner">
                  <TabsTrigger
                    value="morning"
                    className="flex-1 flex items-center justify-center h-12 px-4 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#E51636] transition-all duration-300 group"
                  >
                    <Sun className="h-5 w-5 mr-2 group-data-[state=active]:text-orange-500" />
                    <span className="font-semibold text-sm">Morning</span>
                    {getIncompleteCount('morning') > 0 && (
                      <Badge className="ml-2 bg-orange-100 text-orange-600 hover:bg-orange-100 animate-pulse">
                        {getIncompleteCount('morning')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="lunch"
                    className="flex-1 flex items-center justify-center h-12 px-4 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#E51636] transition-all duration-300 group"
                  >
                    <Utensils className="h-5 w-5 mr-2 group-data-[state=active]:text-blue-500" />
                    <span className="font-semibold text-sm">Lunch</span>
                    {getIncompleteCount('lunch') > 0 && (
                      <Badge className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-100 animate-pulse">
                        {getIncompleteCount('lunch')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="dinner"
                    className="flex-1 flex items-center justify-center h-12 px-4 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#E51636] transition-all duration-300 group"
                  >
                    <Moon className="h-5 w-5 mr-2 group-data-[state=active]:text-purple-500" />
                    <span className="font-semibold text-sm">Dinner</span>
                    {getIncompleteCount('dinner') > 0 && (
                      <Badge className="ml-2 bg-purple-100 text-purple-600 hover:bg-purple-100 animate-pulse">
                        {getIncompleteCount('dinner')}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
                <div className="space-y-3">
                  {getItemsForTab(activeTab).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#27251F] mb-2">All tasks completed!</h3>
                      <p className="text-[#27251F]/60">Great job on maintaining food safety standards.</p>
                    </div>
                  ) : (
                    getItemsForTab(activeTab).map((item, index) => {
                      const canComplete = canCompleteTask(item.timeframe || activeTab);
                      const restrictionReason = getTaskRestrictionReason(item.timeframe || activeTab);
                      const isOverdue = !canComplete && !item.isCompleted;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg",
                            item.isCompleted && item.completions && item.completions.length > 0
                              ? item.completions[0].status === 'pass'
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                                : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-300"
                              : isOverdue
                                ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 opacity-75"
                                : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-[#E51636]/30",
                            !isOverdue && "hover:-translate-y-1"
                          )}
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          {/* Status indicator bar */}
                          <div className={cn(
                            "absolute top-0 left-0 w-full h-1",
                            item.isCompleted && item.completions && item.completions.length > 0
                              ? item.completions[0].status === 'pass'
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : "bg-gradient-to-r from-red-400 to-rose-500"
                              : isOverdue
                                ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                                : "bg-gradient-to-r from-gray-300 to-slate-400"
                          )} />

                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Enhanced status icon */}
                              <div className={cn(
                                "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                item.isCompleted && item.completions && item.completions.length > 0
                                  ? item.completions[0].status === 'pass'
                                    ? "bg-green-100 text-green-600 shadow-lg shadow-green-200"
                                    : "bg-red-100 text-red-600 shadow-lg shadow-red-200"
                                  : isOverdue
                                    ? "bg-red-100 text-red-600 shadow-lg shadow-red-200"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-[#E51636]/10 group-hover:text-[#E51636] group-hover:scale-110"
                              )}>
                                {item.isCompleted ? (
                                  item.completions && item.completions[0].status === 'pass' ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                  ) : (
                                    <XCircle className="h-6 w-6" />
                                  )
                                ) : isOverdue ? (
                                  <AlertTriangle className="h-6 w-6" />
                                ) : (
                                  <Clock className="h-6 w-6" />
                                )}
                              </div>

                              {/* Task content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={cn(
                                    "font-semibold transition-colors",
                                    isOverdue ? "text-red-600" : "text-[#27251F] group-hover:text-[#E51636]"
                                  )}>
                                    {item.name}
                                  </h3>
                                  {item.frequency === 'multiple' && (
                                    <Badge variant="outline" className="text-xs bg-white/50">
                                      {item.requiredCompletions}x Daily
                                    </Badge>
                                  )}
                                  {isOverdue && (
                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs animate-pulse">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Overdue
                                    </Badge>
                                  )}
                                </div>

                                {/* Show restriction reason for overdue tasks */}
                                {isOverdue && restrictionReason && (
                                  <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{restrictionReason}</span>
                                  </div>
                                )}

                                {item.completions && item.completions.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-[#27251F]/60">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {item.completions[0].completedBy} • {formatTime(item.completions[0].completedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Action button */}
                              {!item.isCompleted && (
                                canComplete ? (
                                  <Button
                                    onClick={() => handleOpenCompleteDialog(item.category || '', item)}
                                    className="bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white hover:from-[#DD0031] hover:to-[#E51636] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                    size="sm"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete
                                  </Button>
                                ) : (
                                  <Button
                                    disabled
                                    className="bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl"
                                    size="sm"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Missed
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Enhanced Temperature Monitoring Section */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ThermometerSun className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Temperature Monitoring</h2>
                  <p className="text-white/80 text-sm">
                    {Object.keys(temperatures).filter(location =>
                      temperatures[location]?.value !== null &&
                      temperatures[location]?.timestamp &&
                      new Date(temperatures[location]?.timestamp as string).toDateString() === new Date().toDateString()
                    ).length} of {Object.keys(TEMP_RANGES).length} recorded today
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/kitchen/food-safety/history')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  size="sm"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  onClick={() => {
                    setRecordTempDialog(true);
                    setNewTemperatures(temperatures);
                  }}
                  className="bg-white text-blue-600 hover:bg-white/90"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Enhanced Tab Switcher */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-1 shadow-inner">
                <button
                  onClick={() => setTempView('equipment')}
                  className={cn(
                    "px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                    tempView === 'equipment'
                      ? "bg-white text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Equipment
                  </div>
                </button>
                <button
                  onClick={() => setTempView('product')}
                  className={cn(
                    "px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                    tempView === 'product'
                      ? "bg-white text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Products
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced Temperature Grid */}
            <div className="grid gap-4">
              {Object.entries(TEMP_RANGES)
                .filter(([_, range]) =>
                  tempView === 'equipment' ? !range.type : range.type === 'product'
                )
                .map(([location, range], index) => {
                  const temp = temperatures?.[location] || { value: null, timestamp: null };
                  const status = getTemperatureStatus(location, temp);
                  const locationName = location.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');

                  return (
                    <div
                      key={location}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                        status === 'pass' ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300" :
                        status === 'warning' ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300" :
                        status === 'fail' ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-300" :
                        "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-blue-300"
                      )}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Status indicator bar */}
                      <div className={cn(
                        "absolute top-0 left-0 w-full h-1",
                        status === 'pass' ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                        status === 'warning' ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                        status === 'fail' ? "bg-gradient-to-r from-red-400 to-rose-500" :
                        "bg-gradient-to-r from-gray-300 to-slate-400"
                      )} />

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Location info with enhanced icon */}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                              status === 'pass' ? "bg-green-100 text-green-600 shadow-lg shadow-green-200" :
                              status === 'warning' ? "bg-yellow-100 text-yellow-600 shadow-lg shadow-yellow-200" :
                              status === 'fail' ? "bg-red-100 text-red-600 shadow-lg shadow-red-200" :
                              "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                            )}>
                              {status === 'pass' && <ThermometerSun className="h-6 w-6" />}
                              {status === 'warning' && <Thermometer className="h-6 w-6" />}
                              {status === 'fail' && <ThermometerSnowflake className="h-6 w-6" />}
                              {status === 'pending' && <Thermometer className="h-6 w-6" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#27251F] group-hover:text-blue-600 transition-colors">
                                {locationName}
                              </h3>
                              <p className="text-sm text-[#27251F]/60">
                                Target: {range.min}°F - {range.max}°F
                              </p>
                            </div>
                          </div>

                          {/* Temperature display */}
                          <div className="text-right">
                            {temp?.value !== null ? (
                              <>
                                <div className={cn(
                                  "text-2xl font-bold",
                                  status === 'pass' ? "text-green-600" :
                                  status === 'warning' ? "text-yellow-600" :
                                  status === 'fail' ? "text-red-600" :
                                  "text-[#27251F]"
                                )}>
                                  {temp.value}°F
                                </div>
                                {temp?.timestamp && (
                                  <div className="text-xs text-[#27251F]/60 mt-1">
                                    {new Date(temp.timestamp).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                )}
                                {/* Status badge */}
                                <Badge
                                  className={cn(
                                    "mt-2 text-xs",
                                    status === 'pass' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                    status === 'warning' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                                    status === 'fail' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                                    "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                  )}
                                >
                                  {status === 'pass' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {status === 'fail' && <XCircle className="h-3 w-3 mr-1" />}
                                  {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Badge>
                              </>
                            ) : (
                              <div className="text-center">
                                <div className="text-lg font-semibold text-[#27251F]/40 mb-2">
                                  Not recorded
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
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
    </div>
  );
};

export default FoodSafety;