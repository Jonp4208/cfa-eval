import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Info } from 'lucide-react'
import { useItemPrices } from '@/contexts/ItemPricesContext'
import { useCustomWasteItems } from '@/contexts/CustomWasteItemsContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function ManageItemPrices({ itemsByMeal }) {
  const { customPrices, isLoading, error, updatePrices } = useItemPrices()
  const { customItems } = useCustomWasteItems()
  const [editedPrices, setEditedPrices] = useState({})
  const [savedItems, setSavedItems] = useState({})
  const [activeTab, setActiveTab] = useState('default')

  // Flatten all items into organized sections
  const mealSections = Object.entries(itemsByMeal)

  // Organize custom items by meal period
  const customItemsByMeal = {
    breakfast: customItems.filter(item => item.mealPeriod === 'breakfast'),
    lunch: customItems.filter(item => item.mealPeriod === 'lunch'),
    dinner: customItems.filter(item => item.mealPeriod === 'dinner')
  }

  const handleChange = useCallback((itemName, value) => {
    setEditedPrices(prices => ({ ...prices, [itemName]: value }))
    // Clear saved status when editing
    if (savedItems[itemName]) {
      setSavedItems(state => ({ ...state, [itemName]: false }))
    }
  }, [savedItems])

  const handleSave = useCallback(async (itemName) => {
    // Parse and validate the price
    const newPrice = parseFloat(editedPrices[itemName])
    if (isNaN(newPrice) || newPrice < 0) return

    // Update in the context and show saved state
    try {
      const updatedPrices = {
        ...customPrices,
        [itemName]: newPrice
      }
      await updatePrices(updatedPrices)

      // Clear the edited value
      setEditedPrices(prices => {
        const newPrices = { ...prices }
        delete newPrices[itemName]
        return newPrices
      })

      // Show success
      setSavedItems(state => ({ ...state, [itemName]: true }))

      // Auto-clear success after 2 seconds
      setTimeout(() => {
        setSavedItems(state => ({ ...state, [itemName]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to save price:', err)
    }
  }, [editedPrices, customPrices, updatePrices])

  // Helper to get the current display price for an item
  const getDisplayPrice = (itemName, defaultCost) => {
    // If user is currently editing this item, use that value
    if (editedPrices[itemName] !== undefined) {
      return editedPrices[itemName]
    }
    // Otherwise use the custom price or default
    return customPrices[itemName] !== undefined ? customPrices[itemName] : defaultCost
  }

  // Render a list of items with price inputs
  const renderItemsList = (items, isCustom = false) => {
    return items.map(item => (
      <div
        key={isCustom ? item._id : item.name}
        className="flex items-center py-3 px-2 border-b last:border-b-0 gap-3 hover:bg-gray-50 rounded-md"
      >
        <span className="text-2xl w-8 flex-shrink-0 text-center">{item.icon}</span>
        <span className="flex-1 font-medium">{item.name}</span>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={getDisplayPrice(item.name, item.defaultCost).toString()}
            onChange={e => handleChange(item.name, e.target.value)}
            className="w-20 text-right"
            disabled={isLoading}
          />
          <Button
            type="button"
            size="sm"
            className="ml-2 w-20 flex gap-1 items-center justify-center"
            onClick={() => handleSave(item.name)}
            disabled={isLoading || editedPrices[item.name] === undefined}
            variant={savedItems[item.name] ? "outline" : "default"}
          >
            {savedItems[item.name] ? (
              <>
                <Check className="h-3 w-3" /> Saved
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    ))
  }

  // Render a section for a meal period
  const renderMealSection = (mealPeriod, items, isCustom = false) => {
    if (items.length === 0 && isCustom) {
      return (
        <div className="text-center py-4 text-gray-500 italic">
          No custom items for {mealPeriod}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {renderItemsList(items, isCustom)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 mb-2 font-medium">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="default">Default Items</TabsTrigger>
          <TabsTrigger value="custom">Custom Items</TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="space-y-6">
          {mealSections.map(([mealPeriod, items]) => (
            <div key={mealPeriod} className="space-y-3">
              <h3 className="text-lg font-medium capitalize">{mealPeriod}</h3>
              {renderMealSection(mealPeriod, items)}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {customItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Info className="h-10 w-10 text-blue-400 mb-2" />
              <p className="text-gray-600 mb-1">No custom items found</p>
              <p className="text-sm text-gray-500">
                Add custom items using the "Manage Items" button
              </p>
            </div>
          ) : (
            Object.entries(customItemsByMeal).map(([mealPeriod, items]) => (
              <div key={mealPeriod} className="space-y-3">
                <h3 className="text-lg font-medium capitalize">{mealPeriod}</h3>
                {renderMealSection(mealPeriod, items, true)}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

ManageItemPrices.propTypes = {
  itemsByMeal: PropTypes.object.isRequired
}

export { ManageItemPrices }