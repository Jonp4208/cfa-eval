import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { settingsService } from '@/lib/services/settings'

interface ItemPricesContextType {
  customPrices: Record<string, number>
  isLoading: boolean
  error: string | null
  fetchPrices: () => Promise<void>
  updatePrices: (prices: Record<string, number>) => Promise<void>
  getItemPrice: (itemName: string, defaultPrice: number) => number
}

const ItemPricesContext = createContext<ItemPricesContextType | null>(null)

export function ItemPricesProvider({ children }: { children: ReactNode }) {
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch prices on initial load
  useEffect(() => {
    fetchPrices()
  }, [])

  // Fetch all prices from API
  const fetchPrices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const prices = await settingsService.getWasteItemPrices()
      setCustomPrices(prices || {})
    } catch (err: any) {
      console.error('Failed to fetch prices:', err)
      setError(err.message || 'Failed to load prices')
    } finally {
      setIsLoading(false)
    }
  }

  // Update prices in API
  const updatePrices = async (prices: Record<string, number>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Optimistically update UI
      setCustomPrices(prices)
      
      // Save to API
      await settingsService.updateWasteItemPrices(prices)
    } catch (err: any) {
      console.error('Failed to update prices:', err)
      setError(err.message || 'Failed to update prices')
      
      // If error, refresh prices from server
      fetchPrices()
    } finally {
      setIsLoading(false)
    }
  }

  // Get price, preferring custom price if available
  const getItemPrice = (itemName: string, defaultPrice: number): number => {
    return customPrices[itemName] !== undefined ? customPrices[itemName] : defaultPrice
  }

  const value = {
    customPrices,
    isLoading,
    error,
    fetchPrices,
    updatePrices,
    getItemPrice
  }

  return (
    <ItemPricesContext.Provider value={value}>
      {children}
    </ItemPricesContext.Provider>
  )
}

// Custom hook to use the context
export function useItemPrices() {
  const context = useContext(ItemPricesContext)
  if (!context) {
    throw new Error('useItemPrices must be used within an ItemPricesProvider')
  }
  return context
} 