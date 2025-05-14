import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { Loader2, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useCustomWasteItems } from '@/contexts/CustomWasteItemsContext'
import { WasteItem } from '@/lib/services/settings'
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

// Common emoji icons for food items
const COMMON_ICONS = ['🍗', '🥖', '🥚', '🥯', '🥓', '🥞', '🧇', '🍳', '🥪', '🍔', '🍟', '🍕', '🌮', '🥗', '🥤', '🧃', '🍦', '🍪', '🍩', '🍽️']

export function ManageCustomItems() {
  const { customItems, isLoading, addItem, updateItem, deleteItem } = useCustomWasteItems()
  const [activeTab, setActiveTab] = useState('breakfast')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    unit: 'pieces',
    defaultCost: 1.0,
    icon: '🍽️',
    mealPeriod: 'breakfast' as 'breakfast' | 'lunch' | 'dinner'
  })

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      unit: 'pieces',
      defaultCost: 1.0,
      icon: '🍽️',
      mealPeriod: activeTab as 'breakfast' | 'lunch' | 'dinner'
    })
  }

  // Open add dialog
  const handleOpenAddDialog = () => {
    resetForm()
    setFormData(prev => ({ ...prev, mealPeriod: activeTab as 'breakfast' | 'lunch' | 'dinner' }))
    setShowAddDialog(true)
  }

  // Open edit dialog
  const handleOpenEditDialog = (item: WasteItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      unit: item.unit,
      defaultCost: item.defaultCost,
      icon: item.icon,
      mealPeriod: item.mealPeriod
    })
    setShowEditDialog(true)
  }

  // Open delete dialog
  const handleOpenDeleteDialog = (item: WasteItem) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  // Handle form input changes
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle add item
  const handleAddItem = async () => {
    const result = await addItem(formData)
    if (result) {
      setShowAddDialog(false)
      resetForm()
    }
  }

  // Handle edit item
  const handleEditItem = async () => {
    if (!selectedItem?._id) return

    const result = await updateItem(selectedItem._id, formData)
    if (result) {
      setShowEditDialog(false)
      setSelectedItem(null)
    }
  }

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!selectedItem?._id) return

    const success = await deleteItem(selectedItem._id)
    if (success) {
      setShowDeleteDialog(false)
      setSelectedItem(null)
    }
  }

  // Filter items by meal period
  const filteredItems = customItems.filter(item => item.mealPeriod === activeTab)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom Items</h2>
        <Button
          onClick={handleOpenAddDialog}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
        </TabsList>

        {['breakfast', 'lunch', 'dinner'].map(period => (
          <TabsContent key={period} value={period} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No custom items for {period}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={handleOpenAddDialog}
                >
                  Add your first item
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.defaultCost.toFixed(2)} per {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => handleOpenDeleteDialog(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Waste Item</DialogTitle>
            <DialogDescription>
              Add a new custom waste item to track in the waste tracker.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Item name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => handleChange('icon', value)}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    placeholder="Unit (e.g., pieces)"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Default cost"
                    value={formData.defaultCost.toString()}
                    onChange={(e) => handleChange('defaultCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meal Period</label>
                <Select
                  value={formData.mealPeriod}
                  onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') => handleChange('mealPeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddItem}
              disabled={isLoading || !formData.name}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Waste Item</DialogTitle>
            <DialogDescription>
              Update the details of this custom waste item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Item name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => handleChange('icon', value)}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    placeholder="Unit (e.g., pieces)"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Default cost"
                    value={formData.defaultCost.toString()}
                    onChange={(e) => handleChange('defaultCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meal Period</label>
                <Select
                  value={formData.mealPeriod}
                  onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') => handleChange('mealPeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleEditItem}
              disabled={isLoading || !formData.name}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Waste Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
