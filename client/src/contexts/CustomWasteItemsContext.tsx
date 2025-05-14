import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { settingsService, WasteItem } from '@/lib/services/settings'
import { toast } from 'sonner'

interface CustomWasteItemsContextType {
  customItems: WasteItem[]
  isLoading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (item: Omit<WasteItem, '_id'>) => Promise<WasteItem | null>
  updateItem: (itemId: string, item: Partial<WasteItem>) => Promise<WasteItem | null>
  deleteItem: (itemId: string) => Promise<boolean>
}

const CustomWasteItemsContext = createContext<CustomWasteItemsContextType | null>(null)

export function CustomWasteItemsProvider({ children }: { children: ReactNode }) {
  const [customItems, setCustomItems] = useState<WasteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch items on initial load
  useEffect(() => {
    fetchItems()
  }, [])

  // Fetch all custom waste items from API
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const items = await settingsService.getCustomWasteItems()
      setCustomItems(items || [])
    } catch (err: any) {
      console.error('Failed to fetch custom waste items:', err)
      setError(err.message || 'Failed to load custom waste items')
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new custom waste item
  const addItem = async (item: Omit<WasteItem, '_id'>): Promise<WasteItem | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newItem = await settingsService.addCustomWasteItem(item)
      
      // Update the local state
      setCustomItems(prevItems => [...prevItems, newItem])
      
      toast.success('Item added successfully')
      return newItem
    } catch (err: any) {
      console.error('Failed to add custom waste item:', err)
      setError(err.response?.data?.error || err.message || 'Failed to add item')
      toast.error(err.response?.data?.error || 'Failed to add item')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing custom waste item
  const updateItem = async (itemId: string, item: Partial<WasteItem>): Promise<WasteItem | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updatedItem = await settingsService.updateCustomWasteItem(itemId, item)
      
      // Update the local state
      setCustomItems(prevItems => 
        prevItems.map(i => i._id === itemId ? updatedItem : i)
      )
      
      toast.success('Item updated successfully')
      return updatedItem
    } catch (err: any) {
      console.error('Failed to update custom waste item:', err)
      setError(err.response?.data?.error || err.message || 'Failed to update item')
      toast.error(err.response?.data?.error || 'Failed to update item')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a custom waste item
  const deleteItem = async (itemId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      await settingsService.deleteCustomWasteItem(itemId)
      
      // Update the local state
      setCustomItems(prevItems => prevItems.filter(i => i._id !== itemId))
      
      toast.success('Item deleted successfully')
      return true
    } catch (err: any) {
      console.error('Failed to delete custom waste item:', err)
      setError(err.response?.data?.error || err.message || 'Failed to delete item')
      toast.error(err.response?.data?.error || 'Failed to delete item')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    customItems,
    isLoading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem
  }

  return (
    <CustomWasteItemsContext.Provider value={value}>
      {children}
    </CustomWasteItemsContext.Provider>
  )
}

// Custom hook to use the context
export function useCustomWasteItems() {
  const context = useContext(CustomWasteItemsContext)
  if (!context) {
    throw new Error('useCustomWasteItems must be used within a CustomWasteItemsProvider')
  }
  return context
}
