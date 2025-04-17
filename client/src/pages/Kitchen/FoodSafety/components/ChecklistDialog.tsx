import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { FoodSafetyChecklist, ChecklistFrequency, WeekDay, ValidationCriteria, CheckType } from '@/types/kitchen'
import { cn } from "@/lib/utils"

// Import the CFA temperature ranges from the parent component
const CFA_TEMP_RANGES = {
  chicken_cook: { min: 165, max: 175, warning: 5 },
  chicken_hold: { min: 140, max: 145, warning: 3 },
  refrigerator: { min: 34, max: 40, warning: 2 },
  freezer: { min: -10, max: 0, warning: 5 },
  prep_area: { min: 34, max: 40, warning: 2 }
}

// Import the checklist categories from the parent component
const CHECKLIST_CATEGORIES = [
  { id: 'opening', label: 'Opening Procedures', icon: 'sunrise' },
  { id: 'temp_monitoring', label: 'Temperature Monitoring', icon: 'thermometer' },
  { id: 'food_prep', label: 'Food Preparation', icon: 'utensils' },
  { id: 'equipment', label: 'Equipment Checks', icon: 'tool' },
  { id: 'sanitation', label: 'Sanitation & Cleaning', icon: 'spray' },
  { id: 'closing', label: 'Closing Procedures', icon: 'moon' }
]

interface ChecklistItem {
  name: string
  type: CheckType
  isCritical: boolean
  validation: ValidationCriteria
  order: number
}

interface FormData {
  name: string
  description: string
  category: string
  frequency: ChecklistFrequency
  weeklyDay: WeekDay
  monthlyWeek: 1 | 2 | 3 | 4
  monthlyDay: WeekDay
  items: ChecklistItem[]
}

interface NewItem {
  name: string
  type: CheckType
  validation: ValidationCriteria
  isCritical: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist?: FoodSafetyChecklist
  onSubmit: (data: FormData) => Promise<void>
}

const defaultValidation: Record<CheckType, ValidationCriteria> = {
  'yes_no': { type: 'yes_no', requiredValue: 'yes' },
  'temperature': { 
    type: 'temperature',
    minTemp: 0, 
    maxTemp: 100, 
    warningThreshold: 0, 
    criticalThreshold: 0 
  },
  'text': { type: 'text', requiredPattern: '' }
}

export default function ChecklistDialog({ open, onOpenChange, checklist, onSubmit }: Props) {
  const [formData, setFormData] = useState<FormData>(() => ({
    name: checklist?.name || '',
    description: checklist?.description || '',
    category: checklist?.category || 'opening',
    frequency: checklist?.frequency || 'daily',
    weeklyDay: checklist?.weeklyDay || 'monday',
    monthlyWeek: checklist?.monthlyWeek || 1,
    monthlyDay: checklist?.monthlyDay || 'monday',
    items: checklist?.items.map(item => ({
      name: item.name,
      type: item.type,
      isCritical: item.isCritical,
      validation: item.validation,
      order: item.order
    })) || []
  }))

  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    type: 'yes_no',
    validation: defaultValidation['yes_no'],
    isCritical: false
  })

  const handleTypeChange = (newType: CheckType) => {
    let validation = defaultValidation[newType]
    
    // Set default temperature ranges based on item name
    if (newType === 'temperature') {
      const itemNameLower = newItem.name.toLowerCase()
      if (itemNameLower.includes('chicken') && itemNameLower.includes('cook')) {
        validation = {
          ...validation,
          minTemp: CFA_TEMP_RANGES.chicken_cook.min,
          maxTemp: CFA_TEMP_RANGES.chicken_cook.max,
          warningThreshold: CFA_TEMP_RANGES.chicken_cook.warning
        }
      } else if (itemNameLower.includes('chicken') && itemNameLower.includes('hold')) {
        validation = {
          ...validation,
          minTemp: CFA_TEMP_RANGES.chicken_hold.min,
          maxTemp: CFA_TEMP_RANGES.chicken_hold.max,
          warningThreshold: CFA_TEMP_RANGES.chicken_hold.warning
        }
      } else if (itemNameLower.includes('fridge') || itemNameLower.includes('refrigerator')) {
        validation = {
          ...validation,
          minTemp: CFA_TEMP_RANGES.refrigerator.min,
          maxTemp: CFA_TEMP_RANGES.refrigerator.max,
          warningThreshold: CFA_TEMP_RANGES.refrigerator.warning
        }
      } else if (itemNameLower.includes('freezer')) {
        validation = {
          ...validation,
          minTemp: CFA_TEMP_RANGES.freezer.min,
          maxTemp: CFA_TEMP_RANGES.freezer.max,
          warningThreshold: CFA_TEMP_RANGES.freezer.warning
        }
      } else if (itemNameLower.includes('prep')) {
        validation = {
          ...validation,
          minTemp: CFA_TEMP_RANGES.prep_area.min,
          maxTemp: CFA_TEMP_RANGES.prep_area.max,
          warningThreshold: CFA_TEMP_RANGES.prep_area.warning
        }
      }
    }

    setNewItem(prev => ({
      ...prev,
      type: newType,
      validation
    }))
  }

  const handleValidationChange = (field: keyof ValidationCriteria, value: any) => {
    setNewItem(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: value
      }
    }))
  }

  const handleAddItem = () => {
    if (!newItem.name) return

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...newItem,
          order: prev.items.length + 1
        }
      ]
    }))

    setNewItem({
      name: '',
      type: 'yes_no',
      validation: defaultValidation['yes_no'],
      isCritical: false
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting checklist:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{checklist ? 'Edit Checklist' : 'Create New Checklist'}</DialogTitle>
        </DialogHeader>

        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2"
                placeholder="e.g., Morning Temperature Checks"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2"
                placeholder="Describe the purpose and requirements of this checklist"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-base font-semibold">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHECKLIST_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency" className="text-base font-semibold">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as ChecklistFrequency }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <Label htmlFor="weeklyDay" className="text-base font-semibold">Day of Week</Label>
                <Select
                  value={formData.weeklyDay}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyDay: value as WeekDay }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthlyWeek" className="text-base font-semibold">Week of Month</Label>
                  <Select
                    value={formData.monthlyWeek.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyWeek: parseInt(value) as 1 | 2 | 3 | 4 }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Week</SelectItem>
                      <SelectItem value="2">Second Week</SelectItem>
                      <SelectItem value="3">Third Week</SelectItem>
                      <SelectItem value="4">Fourth Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monthlyDay" className="text-base font-semibold">Day of Week</Label>
                  <Select
                    value={formData.monthlyDay}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyDay: value as WeekDay }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-base font-semibold">Checklist Items</Label>
            
            <div className="space-y-4 mt-4">
              {formData.items.map((item, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg",
                    item.isCritical && "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.isCritical && (
                        <Badge className="bg-red-100 text-red-600">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-500">Type: {item.type}</p>
                      {item.type === 'temperature' && (
                        <p className="text-sm text-gray-500">
                          Range: {item.validation.minTemp}°F - {item.validation.maxTemp}°F
                          {item.validation.warningThreshold && ` (Warning: ±${item.validation.warningThreshold}°F)`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-gray-500 hover:text-red-600 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="p-4 border rounded-lg space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2"
                    placeholder="e.g., Check Chicken Temperature"
                  />
                </div>

                <div>
                  <Label htmlFor="itemType">Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value: CheckType) => handleTypeChange(value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes_no">Yes/No</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newItem.type === 'yes_no' && (
                  <div>
                    <Label htmlFor="requiredValue">Required Value</Label>
                    <Select
                      value={newItem.validation.requiredValue || 'yes'}
                      onValueChange={(value) => handleValidationChange('requiredValue', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newItem.type === 'temperature' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minTemp">Minimum Temperature (°F)</Label>
                        <Input
                          id="minTemp"
                          type="number"
                          value={newItem.validation.minTemp || 0}
                          onChange={(e) => handleValidationChange('minTemp', Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxTemp">Maximum Temperature (°F)</Label>
                        <Input
                          id="maxTemp"
                          type="number"
                          value={newItem.validation.maxTemp || 0}
                          onChange={(e) => handleValidationChange('maxTemp', Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="warningThreshold">Warning Threshold (±°F)</Label>
                      <Input
                        id="warningThreshold"
                        type="number"
                        value={newItem.validation.warningThreshold || 0}
                        onChange={(e) => handleValidationChange('warningThreshold', Number(e.target.value))}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Temperature will show a warning when within this range of the limits
                      </p>
                    </div>
                  </div>
                )}

                {newItem.type === 'text' && (
                  <div>
                    <Label htmlFor="requiredPattern">Required Pattern (optional)</Label>
                    <Input
                      id="requiredPattern"
                      value={newItem.validation.requiredPattern || ''}
                      onChange={(e) => handleValidationChange('requiredPattern', e.target.value)}
                      className="mt-2"
                      placeholder="Regular expression pattern"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isCritical"
                      checked={newItem.isCritical}
                      onChange={(e) => setNewItem(prev => ({ ...prev, isCritical: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-[#E51636] focus:ring-[#E51636]"
                    />
                    <Label htmlFor="isCritical" className="flex items-center gap-2">
                      Critical Item
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </Label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleAddItem} 
                    disabled={!newItem.name}
                    className="bg-[#E51636] text-white hover:bg-[#E51636]/90 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 sm:p-8 border-t bg-white">
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || formData.items.length === 0}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90 w-full sm:w-auto"
            >
              {checklist ? 'Update' : 'Create'} Checklist
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 