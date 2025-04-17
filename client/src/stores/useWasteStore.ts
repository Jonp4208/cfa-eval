import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/lib/axios'
import { toast } from 'sonner'

export interface WasteEntry {
  _id: string
  date: string
  category: 'food' | 'packaging' | 'other'
  itemName: string
  quantity: number
  unit: string
  cost: number
  reason: string
  actionTaken?: string
  createdBy: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface WasteMetrics {
  totalCost: number
  categoryBreakdown: {
    _id: string
    totalCost: number
    dailyBreakdown: {
      date: string
      cost: number
      count: number
    }[]
  }[]
  dateRange: {
    start: string
    end: string
  }
}

interface WasteStore {
  // State
  entries: WasteEntry[]
  metrics: WasteMetrics | null
  isLoading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    pages: number
  }

  // Actions
  createWasteEntry: (entry: Omit<WasteEntry, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateWasteEntry: (id: string, entry: Partial<WasteEntry>) => Promise<void>
  deleteWasteEntry: (id: string) => Promise<void>
  fetchWasteEntries: (params?: {
    startDate?: string
    endDate?: string
    category?: 'food' | 'packaging' | 'other'
    page?: number
    limit?: number
  }) => Promise<void>
  fetchWasteMetrics: (params: {
    startDate: string
    endDate: string
    category?: 'food' | 'packaging' | 'other'
  }) => Promise<void>
  reset: () => void
}

const useWasteStore = create<WasteStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      entries: [],
      metrics: null,
      isLoading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        pages: 1
      },

      // Actions
      createWasteEntry: async (entry) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Creating waste entry:', {
            url: '/api/kitchen/waste',
            data: entry
          })
          const response = await api.post('/api/kitchen/waste', entry)
          console.log('Create waste entry response:', response.data)
          const newEntry = response.data
          set((state) => ({
            entries: [newEntry, ...state.entries],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1
            }
          }))
          toast.success('Waste entry created successfully')
        } catch (error: any) {
          console.error('Create waste entry error:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          })
          const message = error.response?.data?.message || 'Failed to create waste entry'
          set({ error: message })
          toast.error(`Error creating waste entry: ${message}`)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateWasteEntry: async (id, entry) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Updating waste entry:', {
            url: `/api/kitchen/waste/${id}`,
            data: entry
          })
          const response = await api.patch(`/api/kitchen/waste/${id}`, entry)
          console.log('Update waste entry response:', response.data)
          const updatedEntry = response.data
          set((state) => ({
            entries: state.entries.map((e) => 
              e._id === id ? updatedEntry : e
            )
          }))
          toast.success('Waste entry updated successfully')
        } catch (error: any) {
          console.error('Update waste entry error:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          })
          const message = error.response?.data?.message || 'Failed to update waste entry'
          set({ error: message })
          toast.error(`Error updating waste entry: ${message}`)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      deleteWasteEntry: async (id) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Deleting waste entry:', {
            url: `/api/kitchen/waste/${id}`
          })
          await api.delete(`/api/kitchen/waste/${id}`)
          set((state) => ({
            entries: state.entries.filter((e) => e._id !== id),
            pagination: {
              ...state.pagination,
              total: state.pagination.total - 1
            }
          }))
          toast.success('Waste entry deleted successfully')
        } catch (error: any) {
          console.error('Delete waste entry error:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          })
          const message = error.response?.data?.message || 'Failed to delete waste entry'
          set({ error: message })
          toast.error(`Error deleting waste entry: ${message}`)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      fetchWasteEntries: async (params = {}) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Fetching waste entries:', {
            url: '/api/kitchen/waste',
            params
          })
          const response = await api.get('/api/kitchen/waste', { params })
          console.log('Fetch waste entries response:', response.data)
          
          // Merge new entries with existing ones, removing duplicates by _id
          set((state) => {
            const existingEntries = new Map(state.entries.map(entry => [entry._id, entry]))
            response.data.entries.forEach(entry => {
              existingEntries.set(entry._id, entry)
            })
            return {
              entries: Array.from(existingEntries.values()),
              pagination: response.data.pagination
            }
          })
        } catch (error: any) {
          console.error('Fetch waste entries error:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          })
          const message = error.response?.data?.message || 'Failed to fetch waste entries'
          set({ error: message })
          toast.error(`Error fetching waste entries: ${message}`)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      fetchWasteMetrics: async (params) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Fetching waste metrics:', {
            url: '/api/kitchen/waste/metrics',
            params
          })
          const response = await api.get('/api/kitchen/waste/metrics', { params })
          console.log('Fetch waste metrics response:', response.data)
          set({ metrics: response.data })
        } catch (error: any) {
          console.error('Fetch waste metrics error:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          })
          const message = error.response?.data?.message || 'Failed to fetch waste metrics'
          set({ error: message })
          toast.error(`Error fetching waste metrics: ${message}`)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      reset: () => {
        set({
          entries: [],
          metrics: null,
          isLoading: false,
          error: null,
          pagination: {
            total: 0,
            page: 1,
            pages: 1
          }
        })
      }
    }),
    { name: 'waste-store' }
  )
)

export default useWasteStore 