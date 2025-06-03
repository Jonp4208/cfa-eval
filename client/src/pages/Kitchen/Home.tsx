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
    try {
      const today = new Date().setHours(0, 0, 0, 0)
      const todaysEntries = wasteEntries.filter(entry => {
        try {
          return new Date(entry.date).setHours(0, 0, 0, 0) === today
        } catch (error) {
          console.warn('Invalid date in waste entry:', entry)
          return false
        }
      })

      const total = todaysEntries.reduce((sum, entry) => {
        const cost = typeof entry.cost === 'number' && !isNaN(entry.cost) ? entry.cost : 0
        return sum + cost
      }, 0)

      return isNaN(total) ? 0 : total
    } catch (error) {
      console.error('Error calculating today\'s waste:', error)
      return 0
    }
  }

  // Enhanced metric card with beautiful visual styling and animations
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
      className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-[18px] shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group border border-gray-200/50 relative backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => navigate(path)}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/3 via-transparent to-blue-500/3 opacity-40"></div>

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-[#E51636]/15 to-[#E51636]/5 text-[#E51636] rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-[#27251F] line-clamp-1 group-hover:text-[#E51636] transition-colors duration-300">{title}</h3>
          </div>
          <div className="h-8 w-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:bg-[#E51636]/10">
            <ArrowRight className="h-4 w-4 text-[#27251F]/60 group-hover:text-[#E51636] transition-all duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1 sm:space-y-2 bg-white/60 rounded-lg p-2 sm:p-3 backdrop-blur-sm border border-white/50">
              <p className="text-xs sm:text-sm text-[#27251F]/70 font-medium line-clamp-1">{stat.label}</p>
              <div className="flex flex-col">
                {typeof stat.value === 'string' || typeof stat.value === 'number' ? (
                  <p className="text-sm sm:text-lg font-bold text-[#27251F] group-hover:text-[#E51636] transition-colors duration-300">{stat.value}</p>
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-[#27251F]">{stat.value}</div>
                )}
                {stat.showProgress && typeof stat.value === 'number' && (
                  <div className="mt-2">
                    <Progress
                      value={stat.value as number}
                      className="h-2 bg-gray-200/80 rounded-full overflow-hidden"
                      indicatorClassName={`transition-all duration-700 ease-out rounded-full ${
                        stat.value >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        stat.value >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-[#27251F]/60">Progress</span>
                      <span className="text-xs font-semibold text-[#27251F]">{stat.value}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {alerts && alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-xs p-2 sm:p-3 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02]",
                  alert.type === 'warning' ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200/50 shadow-orange-100/50" :
                  alert.type === 'error' ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/50 shadow-red-100/50" :
                  alert.type === 'info' ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/50 shadow-blue-100/50" :
                  "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/50 shadow-green-100/50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                  alert.type === 'warning' ? "bg-orange-100" :
                  alert.type === 'error' ? "bg-red-100" :
                  alert.type === 'info' ? "bg-blue-100" :
                  "bg-green-100"
                )}>
                  {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                   alert.type === 'error' ? <AlertCircle className="h-3 w-3" /> :
                   <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span className="line-clamp-1 text-xs sm:text-sm font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )





  if (loading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {/* Beautiful loading state with skeleton cards */}
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-[20px] shadow-lg border border-gray-200/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/5 via-transparent to-blue-500/5 opacity-50"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12 sm:h-16 sm:w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#E51636]/20"></div>
                  <div className="absolute inset-0 rounded-full border-t-4 border-[#E51636] animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-[#E51636]/10"></div>
                  <div className="absolute inset-2 rounded-full border-t-2 border-[#E51636]/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-[#27251F] flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-[#E51636]" />
                    Loading Kitchen Dashboard
                  </h3>
                  <p className="text-sm text-[#27251F]/70">Gathering your kitchen metrics...</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Skeleton metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-[18px] shadow-lg border border-gray-200/50 relative backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/3 via-transparent to-blue-500/3 opacity-40"></div>
              <div className="relative p-4 sm:p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-6 bg-gray-200 rounded-lg flex-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 bg-white/60 rounded-lg p-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 bg-white/60 rounded-lg p-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
    <div className="space-y-5 sm:space-y-6">
      {/* Enhanced Smart Overview Section with beautiful gradients */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200/50 overflow-hidden relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/5 via-transparent to-blue-500/5 opacity-50"></div>
        <div className="relative p-5 sm:p-6">
          {/* Enhanced greeting and overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-lg sm:text-2xl font-bold text-[#27251F] flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getTimeBasedGreeting()}, {user?.name?.split(' ')[0] || t('common.user')}
                  <Sparkles className="h-5 w-5 text-[#E51636] animate-pulse" />
                </div>
              </h2>
              <p className="text-sm sm:text-base text-[#27251F]/70 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-[#E51636]" />
                {format(new Date(), 'EEEE, MMMM d')} • <span className="text-[#E51636] font-medium">{t('kitchen.kitchenOverview')}</span>
              </p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <Button
                variant="outline"
                className="rounded-full py-2 px-4 border-[#E51636]/30 text-[#E51636] hover:bg-[#E51636]/10 hover:text-[#E51636] hover:border-[#E51636]/50 transition-all duration-300 text-sm flex items-center gap-2 shadow-sm hover:shadow-md touch-manipulation active-scale backdrop-blur-sm"
                onClick={() => navigate('/kitchen/waste-tracker/analytics')}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('kitchen.viewAnalytics')}</span>
                <span className="sm:hidden">Analytics</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Metrics Grid with beautiful spacing and animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows-fr">
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
            { label: t('kitchen.itemsTracked'), value: Array.isArray(wasteEntries) ? wasteEntries.length : 0 }
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