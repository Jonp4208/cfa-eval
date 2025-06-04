import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Clock, DollarSign, Package, Sun, Coffee, Moon, X } from 'lucide-react'
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
    <div className="space-y-4 px-4 md:px-6 pb-6">

      {/* Stats Row - Made more compact on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Total Waste Today</p>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mt-1 text-[#27251F]">${totalWaste.toFixed(2)}</h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5 sm:mt-1">{todaysEntries.length} items logged</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-[#E51636]/10 text-[#E51636] rounded-xl sm:rounded-2xl flex items-center justify-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#27251F]/60 font-medium line-clamp-1">Most Wasted Item</p>
                <h3 className="text-sm sm:text-lg md:text-2xl font-bold mt-1 text-[#27251F] line-clamp-1">
                  {todaysEntries[0]?.itemName || 'No items logged'}
                </h3>
                <p className="text-xs sm:text-sm text-[#27251F]/60 mt-0.5 sm:mt-1 line-clamp-1">
                  {todaysEntries[0] ? `Last added ${format(new Date(todaysEntries[0].date), 'h:mm a')}` : 'Start logging waste'}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-orange-100 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Management Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Dialog open={showCustomItemsDialog} onOpenChange={setShowCustomItemsDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setShowCustomItemsDialog(true)}
              className="w-full bg-[#E51636]/5 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10 hover:border-[#E51636]/30"
            >
              Custom Items
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
              className="w-full bg-[#E51636]/5 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/10 hover:border-[#E51636]/30"
            >
              Manage Prices
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Quick Add Section - Full width on mobile */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-3 sm:p-6">
              {/* Meal Period Selector */}
              <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-semibold text-[#27251F]">Quick Add Waste</h2>
                  <Button
                    onClick={() => setShowBulkEntryDialog(true)}
                    size="sm"
                    className="bg-[#E51636] text-white hover:bg-[#E51636]/90 h-8 sm:h-9 text-xs sm:text-sm rounded-full"
                  >
                    Bulk Entry
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => setActiveMealPeriod('breakfast')}
                    variant={activeMealPeriod === 'breakfast' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 sm:h-10 text-xs sm:text-sm rounded-full',
                      activeMealPeriod === 'breakfast'
                        ? 'bg-[#E51636] text-white hover:bg-[#E51636]/90'
                        : 'hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]/20'
                    )}
                  >
                    <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Breakfast
                  </Button>
                  <Button
                    onClick={() => setActiveMealPeriod('lunch')}
                    variant={activeMealPeriod === 'lunch' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 sm:h-10 text-xs sm:text-sm rounded-full',
                      activeMealPeriod === 'lunch'
                        ? 'bg-[#E51636] text-white hover:bg-[#E51636]/90'
                        : 'hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]/20'
                    )}
                  >
                    <Coffee className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Lunch
                  </Button>
                  <Button
                    onClick={() => setActiveMealPeriod('dinner')}
                    variant={activeMealPeriod === 'dinner' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 sm:h-10 text-xs sm:text-sm rounded-full',
                      activeMealPeriod === 'dinner'
                        ? 'bg-[#E51636] text-white hover:bg-[#E51636]/90'
                        : 'hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]/20'
                    )}
                  >
                    <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Dinner
                  </Button>
                </div>
              </div>

              {/* Quick Add Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Default items */}
                {WASTE_ITEMS[activeMealPeriod as keyof WasteItems].map((item) => {
                  // Get the custom price (or default if no custom price)
                  const itemPrice = getItemPrice(item.name, item.defaultCost)

                  return (
                    <Button
                      key={item.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(item)}
                      className="h-auto py-2 sm:py-3 px-2 sm:px-4 flex flex-col items-center gap-1 sm:gap-2 text-[#27251F] hover:bg-[#E51636]/5 hover:text-[#E51636] border border-gray-100 rounded-xl sm:rounded-[20px] hover:border-[#E51636]/20"
                    >
                      <span className="text-base sm:text-lg">{item.icon}</span>
                      <span className="text-xs sm:text-sm text-center line-clamp-1">{item.name}</span>
                      <span className="text-[10px] sm:text-xs text-[#27251F]/60">${itemPrice.toFixed(2)}</span>
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
                        size="sm"
                        onClick={() => handleQuickAdd({
                          name: item.name,
                          unit: item.unit,
                          defaultCost: item.defaultCost,
                          icon: item.icon
                        })}
                        className="h-auto py-2 sm:py-3 px-2 sm:px-4 flex flex-col items-center gap-1 sm:gap-2 text-[#27251F] hover:bg-[#E51636]/5 hover:text-[#E51636] border border-gray-100 rounded-xl sm:rounded-[20px] hover:border-[#E51636]/20 bg-blue-50/30"
                      >
                        <span className="text-base sm:text-lg">{item.icon}</span>
                        <span className="text-xs sm:text-sm text-center line-clamp-1">{item.name}</span>
                        <span className="text-[10px] sm:text-xs text-[#27251F]/60">${itemPrice.toFixed(2)}</span>
                      </Button>
                    )
                  })
                }
              </div>
            </div>
          </Card>

          {/* Reason Selection - Grid layout adjusted for mobile */}
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[#27251F] mb-3 sm:mb-4">Select Reason</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {WASTE_REASONS.map((wasteReason) => (
                  <Button
                    key={wasteReason.label}
                    variant="outline"
                    className={`h-auto py-4 sm:py-6 px-2 sm:px-4 text-sm sm:text-base border ${
                      reason === wasteReason.label
                        ? `bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20 hover:bg-[#E51636]/20`
                        : 'border-gray-100 hover:bg-[#E51636]/5 hover:text-[#E51636] hover:border-[#E51636]/20'
                    } rounded-xl sm:rounded-[20px] transition-all duration-200 font-medium`}
                    onClick={() => setReason(wasteReason.label)}
                    disabled={isLoading}
                  >
                    {wasteReason.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Entries - Adjusted height and padding for mobile */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#27251F] mb-4 md:mb-6">Today's Entries</h2>
              <ScrollArea className="h-[400px] md:h-[600px] pr-4">
                <div className="space-y-3 md:space-y-4">
                  {todaysEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <Trash2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-[#27251F]/60">No waste logged today</p>
                      <p className="text-sm text-[#27251F]/40">
                        Use the quick add buttons to log waste
                      </p>
                    </div>
                  ) : (
                    todaysEntries.map((entry) => (
                      <div
                        key={entry._id}
                        className="p-3 md:p-4 border rounded-xl hover:shadow-sm transition-shadow relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="pr-8">
                            <h4 className="font-semibold text-[#27251F] text-sm md:text-base">{entry.itemName}</h4>
                            <p className="text-xs md:text-sm text-[#27251F]/60">
                              {entry.quantity} {entry.unit} - ${entry.cost.toFixed(2)}
                            </p>
                            <p className="text-xs text-[#27251F]/40 mt-1">
                              {format(new Date(entry.date), 'h:mm a')} - {entry.reason}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setSelectedEntryToDelete(entry._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom Add Card */}
      <Card className="bg-white rounded-[20px] hover:shadow-xl transition-all duration-300">
        <div className="p-3 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#27251F]">Custom Entry</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Input
                  placeholder="Item name"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price ($)"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Button
                  onClick={handleCustomAdd}
                  disabled={!selectedItem || !quantity}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-[#E51636] text-white hover:bg-[#E51636]/90 rounded-lg"
                >
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