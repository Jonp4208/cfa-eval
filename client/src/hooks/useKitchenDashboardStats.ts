import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { kitchenService } from '@/services/kitchenService';

export interface KitchenDashboardStats {
  foodSafety: {
    pendingChecklists: number;
    completedChecklists: number;
    totalChecklists: number;
    completedTempChecks: number;
    totalTempChecks: number;
    overdueTasks: number;
    criticalTasks: number;
  };
  equipment: {
    totalEquipment: number;
    operational: number;
    nonOperational: number;
    needsMaintenance: number;
    needsRepair: number;
    offline: number;
    maintenanceDueSoon: number;
    maintenanceOverdue: number;
    temperatureAlerts: number;
  };
  checklists: {
    opening: {
      completed: number;
      total: number;
      completionRate: number;
    };
    transition: {
      completed: number;
      total: number;
      completionRate: number;
    };
    closing: {
      completed: number;
      total: number;
      completionRate: number;
    };
    totalCompleted: number;
    totalItems: number;
    completionRate: number;
    overdueItems: number;
  };
}

export function useKitchenDashboardStats() {
  // Fetch kitchen metrics with optimized caching
  const { data: kitchenStats, isLoading: kitchenStatsLoading, refetch } = useQuery<KitchenDashboardStats>({
    queryKey: ['kitchenDashboardStats'],
    queryFn: async () => {
      try {
        // Fetch all the data we need for kitchen metrics, with individual try-catch for each call
        const fetchSafelyWithDefault = async (fn: () => Promise<any>, defaultValue: any) => {
          try {
            return await fn();
          } catch (error) {
            console.log('Error fetching kitchen data:', error);
            return defaultValue;
          }
        };

        const foodSafetyChecklists = await fetchSafelyWithDefault(
          kitchenService.getAllChecklists, 
          []
        );
        
        const equipmentStatuses = await fetchSafelyWithDefault(
          kitchenService.getEquipmentStatuses, 
          {}
        );
        
        const openingChecklist = await fetchSafelyWithDefault(
          () => kitchenService.getShiftChecklistItemsWithCompletions('opening'), 
          []
        );
        
        const transitionChecklist = await fetchSafelyWithDefault(
          () => kitchenService.getShiftChecklistItemsWithCompletions('transition'), 
          []
        );
        
        const closingChecklist = await fetchSafelyWithDefault(
          () => kitchenService.getShiftChecklistItemsWithCompletions('closing'), 
          []
        );
        
        const dailyChecklistItems = await fetchSafelyWithDefault(
          kitchenService.getDailyChecklistItems, 
          {}
        );

        // Process food safety metrics
        let pendingChecklists = 0;
        let completedChecklists = 0;
        let totalChecklists = 0;
        let completedTempChecks = 0;
        let totalTempChecks = 0;
        let overdueTasks = 0;
        let criticalTasks = 0;

        // Count daily checklist items - dailyChecklistItems is an object with categories as keys
        // Each category contains an array of items
        Object.values(dailyChecklistItems).forEach(categoryItems => {
          if (Array.isArray(categoryItems)) {
            categoryItems.forEach(item => {
              totalChecklists++;
              if (item.isCompleted) {
                completedChecklists++;
              } else {
                pendingChecklists++;
                // Check if item is critical
                if (item.timeframe) {
                  const now = new Date();
                  const hour = now.getHours();

                  // Morning tasks should be done by 11am
                  if (item.timeframe === 'morning' && hour >= 11) {
                    overdueTasks++;
                  }
                  // Lunch tasks should be done by 4pm
                  else if (item.timeframe === 'lunch' && hour >= 16) {
                    overdueTasks++;
                  }
                  // Dinner tasks should be done by closing
                  else if (item.timeframe === 'dinner' && hour >= 22) {
                    overdueTasks++;
                  }
                }
              }
            });
          }
        });

        // Process temperature checks
        let temperatureItems: any[] = [];

        // Collect all temperature-related items from all categories
        Object.values(dailyChecklistItems).forEach(categoryItems => {
          if (Array.isArray(categoryItems)) {
            const tempItems = categoryItems.filter(item =>
              item.name.toLowerCase().includes('temperature') ||
              item.name.toLowerCase().includes('temp')
            );
            temperatureItems = [...temperatureItems, ...tempItems];
          }
        });

        totalTempChecks = temperatureItems.length;
        completedTempChecks = temperatureItems.filter(item => item.isCompleted).length;

        // Process equipment metrics
        const equipmentArray = Object.values(equipmentStatuses);
        const totalEquipment = equipmentArray.length;
        const operational = equipmentArray.filter(e => e.status === 'operational').length;
        const nonOperational = totalEquipment - operational;
        const needsMaintenance = equipmentArray.filter(e => e.status === 'maintenance').length;
        const needsRepair = equipmentArray.filter(e => e.status === 'repair').length;
        const offline = equipmentArray.filter(e => e.status === 'offline').length;

        // Count equipment with maintenance due soon (next 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const maintenanceDueSoon = equipmentArray.filter(e => {
          if (!e.nextMaintenance) return false;
          const nextMaintenance = new Date(e.nextMaintenance);
          return nextMaintenance > now && nextMaintenance <= sevenDaysFromNow;
        }).length;

        // Count equipment with overdue maintenance
        const maintenanceOverdue = equipmentArray.filter(e => {
          if (!e.nextMaintenance) return false;
          const nextMaintenance = new Date(e.nextMaintenance);
          return nextMaintenance < now;
        }).length;

        // Count temperature alerts
        const temperatureAlerts = equipmentArray.filter(e =>
          e.temperature && (e.temperature < 32 || e.temperature > 40)
        ).length;

        // Process checklist metrics
        const openingCompleted = openingChecklist.filter(item => item.isCompleted).length;
        const transitionCompleted = transitionChecklist.filter(item => item.isCompleted).length;
        const closingCompleted = closingChecklist.filter(item => item.isCompleted).length;

        const openingCompletionRate = openingChecklist.length > 0
          ? Math.round((openingCompleted / openingChecklist.length) * 100)
          : 0;

        const transitionCompletionRate = transitionChecklist.length > 0
          ? Math.round((transitionCompleted / transitionChecklist.length) * 100)
          : 0;

        const closingCompletionRate = closingChecklist.length > 0
          ? Math.round((closingCompleted / closingChecklist.length) * 100)
          : 0;

        const totalCompleted = openingCompleted + transitionCompleted + closingCompleted;
        const checklistTotalItems = openingChecklist.length + transitionChecklist.length + closingChecklist.length;

        const completionRate = checklistTotalItems > 0
          ? Math.round((totalCompleted / checklistTotalItems) * 100)
          : 0;

        // Count overdue checklist items
        const hour = now.getHours();
        let totalOverdueItems = 0;

        // Opening tasks should be completed by 11am
        if (hour >= 11) {
          totalOverdueItems += openingChecklist.filter(item => !item.isCompleted).length;
        }

        // Transition tasks should be completed by 4pm
        if (hour >= 16) {
          totalOverdueItems += transitionChecklist.filter(item => !item.isCompleted).length;
        }

        // Closing tasks should be completed by closing time (10pm)
        if (hour >= 22) {
          totalOverdueItems += closingChecklist.filter(item => !item.isCompleted).length;
        }

        return {
          foodSafety: {
            pendingChecklists,
            completedChecklists,
            totalChecklists,
            completedTempChecks,
            totalTempChecks,
            overdueTasks,
            criticalTasks
          },
          equipment: {
            totalEquipment,
            operational,
            nonOperational,
            needsMaintenance,
            needsRepair,
            offline,
            maintenanceDueSoon,
            maintenanceOverdue,
            temperatureAlerts
          },
          checklists: {
            opening: {
              completed: openingCompleted,
              total: openingChecklist.length,
              completionRate: openingCompletionRate
            },
            transition: {
              completed: transitionCompleted,
              total: transitionChecklist.length,
              completionRate: transitionCompletionRate
            },
            closing: {
              completed: closingCompleted,
              total: closingChecklist.length,
              completionRate: closingCompletionRate
            },
            totalCompleted,
            totalItems: checklistTotalItems,
            completionRate,
            overdueItems: totalOverdueItems
          }
        };
      } catch (error) {
        console.error('Error fetching kitchen metrics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
    refetchOnWindowFocus: true
  });

  return {
    kitchenStats: kitchenStats || {
      foodSafety: {
        pendingChecklists: 0,
        completedChecklists: 0,
        totalChecklists: 0,
        completedTempChecks: 0,
        totalTempChecks: 0,
        overdueTasks: 0,
        criticalTasks: 0
      },
      equipment: {
        totalEquipment: 0,
        operational: 0,
        nonOperational: 0,
        needsMaintenance: 0,
        needsRepair: 0,
        offline: 0,
        maintenanceDueSoon: 0,
        maintenanceOverdue: 0,
        temperatureAlerts: 0
      },
      checklists: {
        opening: {
          completed: 0,
          total: 0,
          completionRate: 0
        },
        transition: {
          completed: 0,
          total: 0,
          completionRate: 0
        },
        closing: {
          completed: 0,
          total: 0,
          completionRate: 0
        },
        totalCompleted: 0,
        totalItems: 0,
        completionRate: 0,
        overdueItems: 0
      }
    },
    isLoading: kitchenStatsLoading,
    refetchKitchenStats: refetch
  };
}
