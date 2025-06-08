import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Clock, DollarSign, Package, Sun, Coffee, Moon, X, CheckCircle } from 'lucide-react'
import useWasteStore from '@/stores/useWasteStore'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { ManageItemPrices } from '@/components/kitchen/waste/ManageItemPrices'
import { ManageCustomItems } from '@/components/kitchen/waste/ManageCustomItems'
import { BulkEntryDialog } from '@/components/kitchen/waste/BulkEntryDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { ItemPricesProvider, useItemPrices } from '@/contexts/ItemPricesContext'
import { CustomWasteItemsProvider, useCustomWasteItems } from '@/contexts/CustomWasteItemsContext'
import { WasteItem as CustomWasteItem } from '@/lib/services/settings'

interface WasteItem {
  name: string
  unit: string
  defaultCost: number
  icon: string
}

interface WasteItems {
  breakfast: WasteItem[]
  lunch: WasteItem[]
  dinner: WasteItem[]
}

type MealPeriod = 'breakfast' | 'lunch' | 'dinner'

interface WasteEntry {
  _id?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  mealPeriod: MealPeriod
  itemName: string
  quantity: number
  cost: number
  notes?: string
}

// Common waste items in restaurant kitchen organized by meal period
const WASTE_ITEMS: WasteItems = {
  breakfast: [
    { name: 'Breakfast Filet', unit: 'pieces', defaultCost: 1.10, icon: '🍗' },
    { name: 'Breakfast Nuggets', unit: 'pieces', defaultCost: 0.25, icon: '🍗' },
    { name: 'Biscuits', unit: 'pieces', defaultCost: 0.30, icon: '🥖' },
    { name: 'Eggs', unit: 'pieces', defaultCost: 0.25, icon: '🥚' },
    { name: 'Egg Whites', unit: 'portions', defaultCost: 0.35, icon: '🥚' },
    { name: 'Mini Bread', unit: 'pieces', defaultCost: 0.15, icon: '🥖' },
    { name: 'English Muffins', unit: 'pieces', defaultCost: 0.30, icon: '🥯' },
  ],
  lunch: [
    { name: 'Filet', unit: 'pieces', defaultCost: 0.85, icon: '🍗' },
    { name: 'Grilled Filet', unit: 'pieces', defaultCost: 1.00, icon: '🔥' },
    { name: 'Nuggets', unit: 'pieces', defaultCost: 0.25, icon: '🍗' },
    { name: 'Grilled Nuggets', unit: 'pieces', defaultCost: 0.35, icon: '🔥' },
    { name: 'Strips', unit: 'pieces', defaultCost: 0.75, icon: '🍗' },
    { name: 'Mac & Cheese', unit: 'portions', defaultCost: 1.25, icon: '🧀' },
    { name: 'White Bun', unit: 'pieces', defaultCost: 0.20, icon: '🍞' },
    { name: 'Multigrain Bun', unit: 'pieces', defaultCost: 0.25, icon: '🥖' },
    { name: 'Gluten Free Bun', unit: 'pieces', defaultCost: 0.50, icon: '🍞' },
  ],
  dinner: [
    { name: 'Filet', unit: 'pieces', defaultCost: 0.85, icon: '🍗' },
    { name: 'Grilled Filet', unit: 'pieces', defaultCost: 1.00, icon: '🔥' },
    { name: 'Nuggets', unit: 'pieces', defaultCost: 0.25, icon: '🍗' },
    { name: 'Grilled Nuggets', unit: 'pieces', defaultCost: 0.35, icon: '🔥' },
    { name: 'Strips', unit: 'pieces', defaultCost: 0.75, icon: '🍗' },
    { name: 'Mac & Cheese', unit: 'portions', defaultCost: 1.25, icon: '🧀' },
    { name: 'White Bun', unit: 'pieces', defaultCost: 0.20, icon: '🍞' },
    { name: 'Multigrain Bun', unit: 'pieces', defaultCost: 0.25, icon: '🥖' },
    { name: 'Gluten Free Bun', unit: 'pieces', defaultCost: 0.50, icon: '🍞' },
  ]
}

const WASTE_REASONS = [
  { label: 'Overproduction', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { label: 'Quality Issues', color: 'bg-red-100 text-red-600 border-red-200' },
  { label: 'Expired', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { label: 'Dropped/Contaminated', color: 'bg-blue-100 text-blue-600 border-blue-200' },
]

// Inner component that uses the context
function WasteTrackerContent() {
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [activeMealPeriod, setActiveMealPeriod] = useState('lunch')
  const [selectedEntryToDelete, setSelectedEntryToDelete] = useState<string | null>(null)
  const [showPricesDialog, setShowPricesDialog] = useState(false)
  const [showCustomItemsDialog, setShowCustomItemsDialog] = useState(false)
  const [showBulkEntryDialog, setShowBulkEntryDialog] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<string>('')

  const { entries, metrics, createWasteEntry, deleteWasteEntry, fetchWasteEntries, fetchWasteMetrics, isLoading } = useWasteStore()
  const { getItemPrice } = useItemPrices()
  const { customItems } = useCustomWasteItems()

  // Filter entries to only show today's entries
  const todaysEntries = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
  }, [entries])

  // Fetch today's entries and metrics on mount and after new entries
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const startOfDay = `${today}T00:00:00.000Z`
    const endOfDay = `${today}T23:59:59.999Z`

    fetchWasteEntries({
      startDate: startOfDay,
      endDate: endOfDay
    })
    fetchWasteMetrics({
      startDate: startOfDay,
      endDate: endOfDay
    })
  }, [fetchWasteEntries, fetchWasteMetrics, createWasteEntry])

  const handleQuickAdd = async (item: WasteItem) => {
    try {
      // Use the custom price if available
      const itemPrice = getItemPrice(item.name, item.defaultCost)

      await createWasteEntry({
        date: new Date().toISOString(),
        category: 'food',
        itemName: item.name,
        quantity: 1,
        unit: item.unit,
        cost: itemPrice,
        reason: reason || 'Overproduction'
      })

      // Refresh metrics immediately after adding new entry
      const today = format(new Date(), 'yyyy-MM-dd')
      const startOfDay = `${today}T00:00:00.000Z`
      const endOfDay = `${today}T23:59:59.999Z`

      fetchWasteMetrics({
        startDate: startOfDay,
        endDate: endOfDay
      })

      // Show success animation
      setLastAddedItem(item.name)
      setShowSuccessAnimation(true)
      setTimeout(() => {
        setShowSuccessAnimation(false)
        setLastAddedItem('')
      }, 2000)

      setReason('')
    } catch (error) {
      console.error('Failed to add waste entry:', error)
    }
  }

  const [customPrice, setCustomPrice] = useState('')

  const handleCustomAdd = async () => {
    if (!selectedItem || !quantity) return
    try {
      const price = parseFloat(customPrice) || 1.00
      const qty = parseInt(quantity) || 1

      await createWasteEntry({
        date: new Date().toISOString(),
        category: 'food',
        itemName: selectedItem,
        quantity: qty,
        unit: 'pieces',
        cost: price * qty,
        reason: reason || 'Other'
      })

      // Show success animation
      setLastAddedItem(selectedItem)
      setShowSuccessAnimation(true)
      setTimeout(() => {
        setShowSuccessAnimation(false)
        setLastAddedItem('')
      }, 2000)

      setSelectedItem('')
      setQuantity('')
      setCustomPrice('')
      setReason('')
    } catch (error) {
      console.error('Failed to add custom waste entry:', error)
    }
  }

  const handleBulkAdd = async (entry: {
    itemName: string
    quantity: number
    unit: string
    cost: number
    reason: string
  }) => {
    try {
      await createWasteEntry({
        date: new Date().toISOString(),
        category: 'food',
        itemName: entry.itemName,
        quantity: entry.quantity,
        unit: entry.unit,
        cost: entry.cost,
        reason: entry.reason
      })

      // Refresh metrics immediately after adding new entry
      const today = format(new Date(), 'yyyy-MM-dd')
      const startOfDay = `${today}T00:00:00.000Z`
      const endOfDay = `${today}T23:59:59.999Z`

      fetchWasteMetrics({
        startDate: startOfDay,
        endDate: endOfDay
      })
    } catch (error) {
      console.error('Failed to add bulk waste entry:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedEntryToDelete) return
    try {
      await deleteWasteEntry(selectedEntryToDelete)

      // Refresh metrics after deletion
      const today = format(new Date(), 'yyyy-MM-dd')
      const startOfDay = `${today}T00:00:00.000Z`
      const endOfDay = `${today}T23:59:59.999Z`

      fetchWasteMetrics({
        startDate: startOfDay,
        endDate: endOfDay
      })
    } finally {
      setSelectedEntryToDelete(null)
    }
  }

  const totalWaste = metrics?.totalCost || 0

  return (
    <div className="space-y-6 px-3 md:px-6 pb-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#E51636]/20 border-t-[#E51636] rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-[#27251F]">Processing...</p>
          </div>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-bounce">
            <CheckCircle className="w-16 h-16 animate-pulse" strokeWidth={2.5} />
            <div className="text-center">
              <p className="text-xl font-bold">Added Successfully!</p>
              <p className="text-lg opacity-90">{lastAddedItem}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Row with Gradient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-[#E51636] to-[#C41230] text-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] border-0">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/80 font-semibold text-sm sm:text-base mb-2">💰 Total Waste Today</p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-white drop-shadow-lg">
                  ${totalWaste.toFixed(2)}
                </h3>
                <p className="text-white/90 text-sm sm:text-base font-medium">
                  {todaysEntries.length} items logged
                </p>
              </div>
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] border-0">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/80 font-semibold text-sm sm:text-base mb-2">📦 Most Wasted</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 text-white drop-shadow-lg line-clamp-2">
                  {todaysEntries[0]?.itemName || 'No items yet'}
                </h3>
                <p className="text-white/90 text-sm sm:text-base font-medium line-clamp-1">
                  {todaysEntries[0] ? `Last: ${format(new Date(todaysEntries[0].date), 'h:mm a')}` : 'Start tracking waste'}
                </p>
              </div>
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Management Buttons */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Dialog open={showCustomItemsDialog} onOpenChange={setShowCustomItemsDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setShowCustomItemsDialog(true)}
              className="w-full h-16 sm:h-20 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <span>Custom Items</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-y-auto p-0">
            <DialogHeader className="sticky top-0 z-10 bg-white p-4 border-b">
              <DialogTitle>Custom Items</DialogTitle>
              <DialogDescription>
                Add, edit, or remove custom waste items for your store.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <ManageCustomItems />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPricesDialog} onOpenChange={setShowPricesDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setShowPricesDialog(true)}
              className="w-full h-16 sm:h-20 bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-2 border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💲</span>
                <span>Manage Prices</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-y-auto p-0">
            <DialogHeader className="sticky top-0 z-10 bg-white p-4 border-b">
              <DialogTitle>Manage Item Prices</DialogTitle>
              <DialogDescription>
                Customize the prices of waste items for your store.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <ManageItemPrices itemsByMeal={WASTE_ITEMS} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Enhanced Quick Add Section - Full width on mobile */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#E51636] to-[#C41230] p-1">
              <div className="bg-white rounded-[20px] p-6 sm:p-8">
                {/* Enhanced Meal Period Selector */}
                <div className="flex flex-col space-y-6 mb-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-black text-[#27251F] flex items-center gap-3">
                      <span className="text-3xl">🍽️</span>
                      Quick Add Waste
                    </h2>
                    <Button
                      onClick={() => setShowBulkEntryDialog(true)}
                      className="bg-gradient-to-r from-[#E51636] to-[#C41230] text-white hover:from-[#C41230] hover:to-[#A01020] h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                    >
                      <span className="mr-2">📝</span>
                      Bulk Entry
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <Button
                      onClick={() => setActiveMealPeriod('breakfast')}
                      variant={activeMealPeriod === 'breakfast' ? 'default' : 'outline'}
                      className={cn(
                        'h-16 sm:h-20 text-sm sm:text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation shadow-lg',
                        activeMealPeriod === 'breakfast'
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-xl border-0'
                          : 'bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300'
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Sun className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                        <span>Breakfast</span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setActiveMealPeriod('lunch')}
                      variant={activeMealPeriod === 'lunch' ? 'default' : 'outline'}
                      className={cn(
                        'h-16 sm:h-20 text-sm sm:text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation shadow-lg',
                        activeMealPeriod === 'lunch'
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-xl border-0'
                          : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Coffee className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                        <span>Lunch</span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setActiveMealPeriod('dinner')}
                      variant={activeMealPeriod === 'dinner' ? 'default' : 'outline'}
                      className={cn(
                        'h-16 sm:h-20 text-sm sm:text-base font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation shadow-lg',
                        activeMealPeriod === 'dinner'
                          ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-xl border-0'
                          : 'bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Moon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                        <span>Dinner</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Enhanced Quick Add Items Grid - Larger buttons for gloves */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Default items */}
                  {WASTE_ITEMS[activeMealPeriod as keyof WasteItems].map((item) => {
                    // Get the custom price (or default if no custom price)
                    const itemPrice = getItemPrice(item.name, item.defaultCost)

                    return (
                      <Button
                        key={item.name}
                        variant="outline"
                        onClick={() => handleQuickAdd(item)}
                        data-item={item.name}
                        className="h-24 sm:h-28 md:h-32 p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:from-[#E51636]/5 hover:to-[#E51636]/10 hover:border-[#E51636]/30 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.95] touch-manipulation group"
                        disabled={isLoading}
                      >
                        <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </span>
                        <div className="text-center">
                          <span className="text-xs sm:text-sm md:text-base font-bold text-[#27251F] line-clamp-2 leading-tight">
                            {item.name}
                          </span>
                          <span className="text-xs sm:text-sm text-[#E51636] font-semibold block mt-1">
                            ${itemPrice.toFixed(2)}
                          </span>
                        </div>
                      </Button>
                    )
                  })}

                  {/* Custom items */}
                  {customItems
                    .filter(item => item.mealPeriod === activeMealPeriod)
                    .map((item) => {
                      // Get the custom price (or default if no custom price)
                      const itemPrice = getItemPrice(item.name, item.defaultCost)

                      return (
                        <Button
                          key={item._id}
                          variant="outline"
                          onClick={() => handleQuickAdd({
                            name: item.name,
                            unit: item.unit,
                            defaultCost: item.defaultCost,
                            icon: item.icon
                          })}
                          data-item={item.name}
                          className="h-24 sm:h-28 md:h-32 p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.95] touch-manipulation group"
                          disabled={isLoading}
                        >
                          <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200">
                            {item.icon}
                          </span>
                          <div className="text-center">
                            <span className="text-xs sm:text-sm md:text-base font-bold text-blue-700 line-clamp-2 leading-tight">
                              {item.name}
                            </span>
                            <span className="text-xs sm:text-sm text-blue-600 font-semibold block mt-1">
                              ${itemPrice.toFixed(2)}
                            </span>
                          </div>
                        </Button>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Reason Selection */}
          <Card className="bg-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1">
              <div className="bg-white rounded-[20px] p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-black text-[#27251F] mb-6 flex items-center gap-3">
                  <span className="text-3xl">🤔</span>
                  Select Reason
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {WASTE_REASONS.map((wasteReason) => (
                    <Button
                      key={wasteReason.label}
                      variant="outline"
                      className={`h-16 sm:h-20 px-4 sm:px-6 text-sm sm:text-base font-bold border-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation shadow-lg ${
                        reason === wasteReason.label
                          ? `bg-gradient-to-r from-[#E51636] to-[#C41230] text-white border-[#E51636] shadow-xl`
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-xl'
                      } rounded-2xl`}
                      onClick={() => setReason(wasteReason.label)}
                      disabled={isLoading}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">
                          {wasteReason.label === 'Overproduction' && '📈'}
                          {wasteReason.label === 'Quality Issues' && '❌'}
                          {wasteReason.label === 'Expired' && '⏰'}
                          {wasteReason.label === 'Dropped/Contaminated' && '💧'}
                        </span>
                        <span className="text-center leading-tight">{wasteReason.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Today's Entries */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-1">
              <div className="bg-white rounded-[20px] p-6">
                <h2 className="text-xl md:text-2xl font-black text-[#27251F] mb-6 flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  Today's Entries
                </h2>
                <ScrollArea className="h-[400px] md:h-[600px] pr-4">
                  <div className="space-y-4">
                    {todaysEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <Trash2 className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-[#27251F]/60 mb-2">No waste logged today</p>
                        <p className="text-sm text-[#27251F]/40">
                          Use the quick add buttons above to start tracking waste
                        </p>
                      </div>
                    ) : (
                      todaysEntries.map((entry) => (
                        <div
                          key={entry._id}
                          className="p-4 md:p-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 relative group transform hover:scale-[1.01]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="pr-12 flex-1">
                              <h4 className="font-bold text-[#27251F] text-base md:text-lg mb-2">{entry.itemName}</h4>
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-sm md:text-base text-[#E51636] font-semibold bg-[#E51636]/10 px-3 py-1 rounded-full">
                                  {entry.quantity} {entry.unit}
                                </span>
                                <span className="text-sm md:text-base text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                                  ${entry.cost.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-[#27251F]/60 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {format(new Date(entry.date), 'h:mm a')} - {entry.reason}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 rounded-xl"
                              onClick={() => setSelectedEntryToDelete(entry._id)}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced Custom Add Card */}
      <Card className="bg-white rounded-[24px] shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-1">
          <div className="bg-white rounded-[20px] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#27251F] mb-6 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Custom Entry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <Input
                  placeholder="Item name"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-medium rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 px-4"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-medium rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 px-4"
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price ($)"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-medium rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 px-4"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={handleCustomAdd}
                  disabled={!selectedItem || !quantity || isLoading}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold bg-gradient-to-r from-[#E51636] to-[#C41230] text-white hover:from-[#C41230] hover:to-[#A01020] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">➕</span>
                  Add Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog
        open={!!selectedEntryToDelete}
        onOpenChange={() => setSelectedEntryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Waste Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this waste entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Entry Dialog */}
      <BulkEntryDialog
        open={showBulkEntryDialog}
        onOpenChange={setShowBulkEntryDialog}
        onSubmit={handleBulkAdd}
        defaultItems={WASTE_ITEMS}
        isLoading={isLoading}
      />
    </div>
  )
}

// Main export component with context provider
export default function WasteTracker() {
  return (
    <ItemPricesProvider>
      <CustomWasteItemsProvider>
        <WasteTrackerContent />
      </CustomWasteItemsProvider>
    </ItemPricesProvider>
  )
}