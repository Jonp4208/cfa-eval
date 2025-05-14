import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Minus, AlertCircle } from 'lucide-react'
import { useCustomWasteItems } from '@/contexts/CustomWasteItemsContext'
import { useItemPrices } from '@/contexts/ItemPricesContext'
import { WasteItem } from '@/lib/services/settings'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

// Define the waste reasons
const WASTE_REASONS = [
  { label: 'Overproduction', value: 'Overproduction' },
  { label: 'Quality Issues', value: 'Quality Issues' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Dropped/Contaminated', value: 'Dropped/Contaminated' },
]

// Define the default waste items
interface DefaultWasteItem {
  name: string
  unit: string
  defaultCost: number
  icon: string
}

interface DefaultWasteItems {
  breakfast: DefaultWasteItem[]
  lunch: DefaultWasteItem[]
  dinner: DefaultWasteItem[]
}

interface BulkEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: {
    itemName: string
    quantity: number
    unit: string
    cost: number
    reason: string
  }) => Promise<void>
  defaultItems: DefaultWasteItems
  isLoading?: boolean
}

export function BulkEntryDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultItems,
  isLoading = false
}: BulkEntryDialogProps) {
  const { customItems } = useCustomWasteItems()
  const { getItemPrice } = useItemPrices()
  const [activeMealPeriod, setActiveMealPeriod] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(10)
  const [reason, setReason] = useState<string>('Overproduction')
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [unit, setUnit] = useState<string>('pieces')
  const [unitCost, setUnitCost] = useState<number>(0)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedItem('')
      setQuantity(10)
      setReason('Overproduction')
      setShowWarning(false)
      setUnit('pieces')
      setUnitCost(0)
    }
  }, [open])

  // Get all items for the current meal period
  const allItems = [
    ...defaultItems[activeMealPeriod].map(item => ({
      ...item,
      _id: item.name, // Use name as ID for default items
      mealPeriod: activeMealPeriod
    })),
    ...customItems.filter(item => item.mealPeriod === activeMealPeriod)
  ]

  // Handle item selection
  const handleItemSelect = (itemName: string) => {
    const item = allItems.find(i => i.name === itemName || i._id === itemName)
    if (item) {
      setSelectedItem(itemName)
      setUnit(item.unit)
      const price = getItemPrice(item.name, item.defaultCost)
      setUnitCost(price)
    }
  }

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    setQuantity(value)
    // Show warning for large quantities
    setShowWarning(value > 100)
  }

  // Handle increment/decrement
  const incrementQuantity = (amount: number) => {
    const newValue = Math.max(1, quantity + amount)
    handleQuantityChange(newValue)
  }

  // Calculate total cost
  const totalCost = selectedItem ? (quantity * unitCost) : 0

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedItem) return

    const item = allItems.find(i => i.name === selectedItem || i._id === selectedItem)
    if (!item) return

    await onSubmit({
      itemName: item.name,
      quantity,
      unit: item.unit,
      cost: totalCost,
      reason
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Waste Entry</DialogTitle>
          <DialogDescription>
            Add multiple items at once to the waste tracker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Meal Period Selector */}
          <Tabs value={activeMealPeriod} onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') => setActiveMealPeriod(value)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item-select">Select Item</Label>
            <Select value={selectedItem} onValueChange={handleItemSelect}>
              <SelectTrigger id="item-select">
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent>
                {allItems.map(item => (
                  <SelectItem 
                    key={item._id} 
                    value={item.name}
                    className="flex items-center"
                  >
                    <span className="mr-2">{item.icon}</span> {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity-input">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => incrementQuantity(-10)}
                disabled={quantity <= 10}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="text-center"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => incrementQuantity(10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Warning for large quantities */}
          {showWarning && (
            <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're adding a large quantity ({quantity} items). Please confirm this is correct.
              </AlertDescription>
            </Alert>
          )}

          {/* Cost Information */}
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-b">
              <div>
                <p className="text-sm text-muted-foreground">Unit Cost:</p>
                <p className="font-medium">${unitCost.toFixed(2)} per {unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost:</p>
                <p className="font-medium text-lg">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label>Reason</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {WASTE_REASONS.map((wasteReason) => (
                <div key={wasteReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={wasteReason.value} id={`reason-${wasteReason.value}`} />
                  <Label htmlFor={`reason-${wasteReason.value}`} className="cursor-pointer">
                    {wasteReason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !selectedItem || quantity < 1}
            className={cn(
              "bg-[#E51636] text-white hover:bg-[#E51636]/90",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Add Bulk Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
