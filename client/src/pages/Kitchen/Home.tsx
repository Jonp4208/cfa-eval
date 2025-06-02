import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  BarChart2,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Thermometer,
  ClipboardCheck,
  ArrowRight,
  ClipboardList,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { kitchenService } from '@/services/kitchenService'
import useWasteStore from '@/stores/useWasteStore'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/TranslationContext'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'

export default function KitchenHome() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    foodSafety: {
      pendingChecklists: 0,
      completedChecklists: 0,
      totalChecklists: 0,
      completedTempChecks: 0,
      totalTempChecks: 0,
      overdueTasks: 0,
      criticalTasks: 0,
      temperatureChecks: 0
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
  })

  const { entries: wasteEntries, fetchWasteEntries } = useWasteStore()

  // Get time of day for greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('common.goodMorning')
    if (hour < 18) return t('common.goodAfternoon')
    return t('common.goodEvening')
  }



  useEffect(() => {
    try {
      loadMetrics()
      loadWasteData()
      console.log('Metrics loaded successfully')
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const [foodSafetyChecklists, equipmentStatuses, openingChecklist, transitionChecklist, closingChecklist, dailyChecklistItems, equipmentConfig] = await Promise.all([
        kitchenService.getAllChecklists(),
        kitchenService.getEquipmentStatuses(),
        kitchenService.getShiftChecklistItemsWithCompletions('opening'),
        kitchenService.getShiftChecklistItemsWithCompletions('transition'),
        kitchenService.getShiftChecklistItemsWithCompletions('closing'),
        kitchenService.getDailyChecklistItems(),
        kitchenService.getEquipmentConfig()
      ])

      // Debug shift checklists
      console.log('Shift checklists:', {
        opening: {
          items: openingChecklist,
          completed: openingChecklist.filter(item => item.isCompleted).length,
          total: openingChecklist.length
        },
        transition: {
          items: transitionChecklist,
          completed: transitionChecklist.filter(item => item.isCompleted).length,
          total: transitionChecklist.length
        },
        closing: {
          items: closingChecklist,
          completed: closingChecklist.filter(item => item.isCompleted).length,
          total: closingChecklist.length
        }
      })

      // Process food safety metrics
      console.log('Daily checklist items:', dailyChecklistItems)

      // Count the number of incomplete daily checklist items
      let pendingChecklists = 0
      let completedChecklists = 0
      let totalItems = 0
      let completedTempChecks = 0
      let totalTempChecks = 0
      let overdueTasks = 0

      // Get current date for overdue check
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Iterate through each category in dailyChecklistItems
      Object.keys(dailyChecklistItems).forEach(category => {
        const items = dailyChecklistItems[category]
        items.forEach(item => {
          totalItems++

          // Check if it's a temperature check
          const isTemperatureCheck = item.name.toLowerCase().includes('temp') ||
                                    item.name.toLowerCase().includes('temperature')

          if (isTemperatureCheck) {
            totalTempChecks++
            if (item.isCompleted) {
              completedTempChecks++
            }
          }

          // Check if completed
          if (item.isCompleted) {
            completedChecklists++
          } else {
            pendingChecklists++

            // Check if overdue based on timeframe
            if (item.timeframe) {
              // Morning tasks should be done by 11am
              if (item.timeframe === 'morning' && new Date().getHours() >= 11) {
                overdueTasks++
              }
              // Lunch tasks should be done by 4pm
              else if (item.timeframe === 'lunch' && new Date().getHours() >= 16) {
                overdueTasks++
              }
              // Dinner tasks should be done by closing
              else if (item.timeframe === 'dinner' && new Date().getHours() >= 22) {
                overdueTasks++
              }
            }
          }
        })
      })

      console.log('Food safety metrics:', {
        totalItems,
        completedChecklists,
        pendingChecklists,
        totalTempChecks,
        completedTempChecks,
        overdueTasks
      })

      const criticalFoodSafetyTasks = foodSafetyChecklists.filter(c => c.isCritical).length
      const temperatureChecks = foodSafetyChecklists.filter(c =>
        c.items.some(i => i.type === 'temperature')).length

      // Process equipment metrics
      const equipmentArray = Object.values(equipmentStatuses)

      // Define default equipment items for each category - must match Equipment page exactly
      const defaultEquipment = {
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
        ],
      }

      // Calculate total equipment count across all categories
      let totalEquipment = 0
      let operational = 0
      let nonOperational = 0

      // Count equipment from the database configuration
      if (Object.keys(equipmentConfig).length > 0) {
        // If we have equipment config from the database, use that
        Object.keys(equipmentConfig).forEach(category => {
          const categoryItems = equipmentConfig[category] || []
          totalEquipment += categoryItems.length

          // Count operational and non-operational items
          categoryItems.forEach(item => {
            const status = equipmentStatuses[item.id]
            if (status && status.status === 'operational') {
              operational++
            } else if (status) {
              nonOperational++
            } else {
              // If no status exists yet, assume it's operational
              operational++
            }
          })
        })
      } else {
        // Fall back to default equipment items if no config exists
        Object.keys(defaultEquipment).forEach(category => {
          const categoryItems = defaultEquipment[category]
          totalEquipment += categoryItems.length

          // Count operational and non-operational items
          categoryItems.forEach(item => {
            const status = equipmentStatuses[item.id]
            if (status && status.status === 'operational') {
              operational++
            } else if (status) {
              nonOperational++
            } else {
              // If no status exists yet, assume it's operational
              operational++
            }
          })
        })
      }

      const needsMaintenance = equipmentArray.filter(e => e.status === 'maintenance').length
      const needsRepair = equipmentArray.filter(e => e.status === 'repair').length
      const offline = equipmentArray.filter(e => e.status === 'offline').length

      // Count equipment with maintenance due in the next 7 days
      const now = new Date()
      const maintenanceDueSoon = equipmentArray.filter(e => {
        if (!e.nextMaintenance) return false
        const nextMaintenance = new Date(e.nextMaintenance)
        const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilMaintenance <= 7 && daysUntilMaintenance > 0
      }).length

      // Count equipment with overdue maintenance
      const maintenanceOverdue = equipmentArray.filter(e => {
        if (!e.nextMaintenance) return false
        const nextMaintenance = new Date(e.nextMaintenance)
        return nextMaintenance < now
      }).length

      const temperatureAlerts = equipmentArray.filter(e =>
        e.temperature && (e.temperature < 32 || e.temperature > 40)
      ).length

      // Process checklist metrics
      const openingCompleted = openingChecklist.filter(item => item.isCompleted).length
      const transitionCompleted = transitionChecklist.filter(item => item.isCompleted).length
      const closingCompleted = closingChecklist.filter(item => item.isCompleted).length
      const totalCompleted = openingCompleted + transitionCompleted + closingCompleted
      const checklistTotalItems = openingChecklist.length + transitionChecklist.length + closingChecklist.length
      const completionRate = checklistTotalItems > 0 ? Math.round((totalCompleted / checklistTotalItems) * 100) : 0

      // Calculate completion rates for each shift type
      const openingCompletionRate = openingChecklist.length > 0 ? Math.round((openingCompleted / openingChecklist.length) * 100) : 0
      const transitionCompletionRate = transitionChecklist.length > 0 ? Math.round((transitionCompleted / transitionChecklist.length) * 100) : 0
      const closingCompletionRate = closingChecklist.length > 0 ? Math.round((closingCompleted / closingChecklist.length) * 100) : 0

      // Count overdue items
      const currentTime = new Date()
      const currentHour = currentTime.getHours()

      // Opening tasks should be done by 11am
      const overdueOpeningItems = currentHour >= 11 ?
        openingChecklist.filter(item => !item.isCompleted).length : 0

      // Transition tasks should be done by 4pm
      const overdueTransitionItems = currentHour >= 16 ?
        transitionChecklist.filter(item => !item.isCompleted).length : 0

      // Closing tasks should be done by closing time (10pm)
      const overdueClosingItems = currentHour >= 22 ?
        closingChecklist.filter(item => !item.isCompleted).length : 0

      const totalOverdueItems = overdueOpeningItems + overdueTransitionItems + overdueClosingItems

      console.log('Checklist metrics:', {
        opening: {
          total: openingChecklist.length,
          completed: openingCompleted,
          completionRate: openingCompletionRate,
          overdueItems: overdueOpeningItems
        },
        transition: {
          total: transitionChecklist.length,
          completed: transitionCompleted,
          completionRate: transitionCompletionRate,
          overdueItems: overdueTransitionItems
        },
        closing: {
          total: closingChecklist.length,
          completed: closingCompleted,
          completionRate: closingCompletionRate,
          overdueItems: overdueClosingItems
        },
        totalItems: checklistTotalItems,
        totalCompleted,
        completionRate,
        totalOverdueItems
      })

      setMetrics({
        foodSafety: {
          pendingChecklists,
          completedChecklists,
          totalChecklists: totalItems,
          completedTempChecks,
          totalTempChecks,
          overdueTasks,
          criticalTasks: criticalFoodSafetyTasks,
          temperatureChecks
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
      })
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWasteData = async () => {
    try {
      await fetchWasteEntries()
    } catch (error) {
      console.error('Failed to load waste data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTodaysWaste = () => {
    const today = new Date().setHours(0, 0, 0, 0)
    return wasteEntries
      .filter(entry => new Date(entry.date).setHours(0, 0, 0, 0) === today)
      .reduce((total, entry) => total + entry.value, 0)
  }

  // Enhanced metric card with improved visual styling
  const MetricCard = ({
    title,
    icon: Icon,
    stats,
    alerts,
    path
  }: {
    title: string
    icon: any
    stats: { label: string; value: string | number | React.ReactNode; showProgress?: boolean }[]
    alerts?: { type: 'warning' | 'error' | 'success'; message: string }[]
    path: string
  }) => (
    <Card
      className="bg-white rounded-[16px] shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200"
      onClick={() => navigate(path)}
    >
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 bg-[#E51636]/10 text-[#E51636] rounded-md flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#27251F] line-clamp-1">{title}</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-[#27251F]/60 transition-transform group-hover:translate-x-1 duration-300" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-0.5 sm:space-y-1">
              <p className="text-xs text-[#27251F]/60 line-clamp-1">{stat.label}</p>
              <div className="flex flex-col">
                {typeof stat.value === 'string' || typeof stat.value === 'number' ? (
                  <p className="text-xs sm:text-sm font-semibold text-[#27251F]">{stat.value}</p>
                ) : (
                  <div className="text-xs sm:text-sm font-semibold text-[#27251F]">{stat.value}</div>
                )}
                {stat.showProgress && typeof stat.value === 'number' && (
                  <Progress
                    value={stat.value as number}
                    className="h-1.5 mt-1 bg-gray-100"
                    indicatorClassName={`${
                      stat.value >= 70 ? 'bg-green-500' :
                      stat.value >= 40 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {alerts && alerts.length > 0 && (
          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 text-xs p-1 sm:p-1.5 rounded-md",
                  alert.type === 'warning' ? "bg-orange-50 text-orange-600 border border-orange-200" :
                  alert.type === 'error' ? "bg-red-50 text-red-600 border border-red-200" :
                  "bg-green-50 text-green-600 border border-green-200"
                )}
              >
                {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3 flex-shrink-0" /> :
                 alert.type === 'error' ? <AlertCircle className="h-3 w-3 flex-shrink-0" /> :
                 <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                <span className="line-clamp-1 text-[10px] sm:text-xs">{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )





  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="relative h-10 w-10 sm:h-12 sm:w-12">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-2 border-[#E51636]/20"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-t-2 border-[#E51636] animate-spin"></div>
        </div>
      </div>
    )
  }

  // Debug log for attention needed items
  console.log('Attention needed items breakdown:', {
    criticalTasks: metrics.foodSafety.criticalTasks,
    needsMaintenance: metrics.equipment.needsMaintenance,
    needsRepair: metrics.equipment.needsRepair,
    offline: metrics.equipment.offline,
    temperatureAlerts: metrics.equipment.temperatureAlerts
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Smart Overview Section - Mobile optimized */}
      <Card className="bg-gradient-to-br from-white to-gray-50 rounded-[16px] shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          {/* Greeting and overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#27251F] flex items-center gap-2">
                {getTimeBasedGreeting()}, {user?.name?.split(' ')[0] || t('common.user')}
                <Sparkles className="h-4 w-4 text-[#E51636]" />
              </h2>
              <p className="text-xs sm:text-sm text-[#27251F]/70 mt-1">
                {format(new Date(), 'EEEE, MMMM d')} • <span className="text-[#E51636]">{t('kitchen.kitchenOverview')}</span>
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2 sm:mt-0 rounded-full py-1 px-4 border-[#E51636]/20 text-[#E51636] hover:bg-[#E51636]/5 hover:text-[#E51636] transition-all duration-300 text-xs hidden sm:flex touch-manipulation active-scale"
              onClick={() => navigate('/kitchen/waste-tracker/analytics')}
            >
              <BarChart2 className="mr-1 h-3 w-3" />
              {t('kitchen.viewAnalytics')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Grid - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <MetricCard
          title={t('kitchen.foodSafety')}
          icon={ShieldCheck}
          path="/kitchen/food-safety"
          stats={[
            {
              label: t('kitchen.checklistCompletion', 'Checklist Completion'),
              value: `${metrics.foodSafety.completedChecklists}/${metrics.foodSafety.totalChecklists}`
            },
            {
              label: t('kitchen.tempChecksCompleted', 'Temp Checks'),
              value: `${metrics.foodSafety.completedTempChecks}/${metrics.foodSafety.totalTempChecks}`
            }
          ]}
          alerts={[
            ...(metrics.foodSafety.overdueTasks > 0 ? [{
              type: 'error',
              message: `${metrics.foodSafety.overdueTasks} ${t('kitchen.overdueTasks', 'overdue tasks')}`
            }] : []),
            ...(metrics.foodSafety.criticalTasks > 0 ? [{
              type: 'warning',
              message: `${metrics.foodSafety.criticalTasks} ${t('kitchen.criticalTasks')}`
            }] : [])
          ]}
        />

        <MetricCard
          title={t('kitchen.wasteTracker')}
          icon={Trash2}
          path="/kitchen/waste-tracker"
          stats={[
            { label: t('kitchen.todaysWaste'), value: `$${getTodaysWaste().toFixed(2)}` },
            { label: t('kitchen.itemsTracked'), value: wasteEntries.length }
          ]}
        />

        <MetricCard
          title={t('kitchen.equipmentStatus')}
          icon={Wrench}
          path="/kitchen/equipment"
          stats={[
            {
              label: t('kitchen.equipmentStatus', 'Equipment Status'),
              value: `${metrics.equipment.operational}/${metrics.equipment.totalEquipment}`
            },
            {
              label: t('kitchen.maintenanceNeeded', 'Maintenance Needed'),
              value: metrics.equipment.needsMaintenance + metrics.equipment.maintenanceOverdue
            }
          ]}
          alerts={[
            ...(metrics.equipment.offline > 0 ? [{
              type: 'error',
              message: `${metrics.equipment.offline} ${t('kitchen.equipmentOffline', 'equipment offline')}`
            }] : []),
            ...(metrics.equipment.temperatureAlerts > 0 ? [{
              type: 'warning',
              message: `${metrics.equipment.temperatureAlerts} ${t('kitchen.temperatureAlerts', 'temperature alerts')}`
            }] : []),
            ...(metrics.equipment.maintenanceDueSoon > 0 ? [{
              type: 'info',
              message: `${metrics.equipment.maintenanceDueSoon} ${t('kitchen.maintenanceDueSoon', 'due for maintenance soon')}`
            }] : [])
          ]}
        />

        <MetricCard
          title={t('kitchen.shiftChecklists', 'Shift Checklists')}
          icon={ClipboardList}
          path="/kitchen/checklists"
          stats={[
            {
              label: t('kitchen.completionRate', 'Completion Rate'),
              value: metrics.checklists.completionRate,
              showProgress: true
            },
            {
              label: t('kitchen.shiftBreakdown', 'Shift Breakdown'),
              value: (
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span>Opening:</span>
                    <span className="font-medium">{metrics.checklists.opening.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transition:</span>
                    <span className="font-medium">{metrics.checklists.transition.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closing:</span>
                    <span className="font-medium">{metrics.checklists.closing.completionRate}%</span>
                  </div>
                </div>
              )
            }
          ]}
          alerts={metrics.checklists.overdueItems > 0 ? [
            {
              type: 'warning',
              message: `${metrics.checklists.overdueItems} ${t('kitchen.overdueChecklistItems', 'overdue checklist items')}`
            }
          ] : undefined}
        />
      </div>


    </div>
  )
}