import api from './api'

export interface KitchenChecklistItem {
  id: string
  label: string
  isRequired?: boolean
  isCompleted: boolean
  type: 'opening' | 'transition' | 'closing'
  completedBy?: {
    id: string
    name: string
  }
  completedAt?: string
}

export interface KitchenChecklistCompletion {
  id: string
  type: string
  items: KitchenChecklistItem[]
  completedBy: {
    id: string
    name: string
  }
  completedAt: string
}

export const kitchenItemService = {
  // Get all checklist items for a specific type
  getChecklistItems: async (type: string): Promise<KitchenChecklistItem[]> => {
    const response = await api.get(`/api/kitchen-item/items/${type}`)
    return response.data
  },

  // Complete a checklist item
  completeChecklistItem: async (itemId: string): Promise<KitchenChecklistCompletion> => {
    const response = await api.post(`/api/kitchen-item/items/${itemId}/complete`)
    return response.data
  },

  // Uncomplete a checklist item
  uncompleteChecklistItem: async (itemId: string): Promise<any> => {
    const response = await api.post(`/api/kitchen-item/items/${itemId}/uncomplete`)
    return response.data
  },

  // Get checklist completions for a date range
  getChecklistCompletions: async (type: string, params: { startDate?: string, endDate?: string } = {}): Promise<KitchenChecklistCompletion[]> => {
    const response = await api.get(`/api/kitchen-item/completions/${type}`, { params })
    return response.data
  }
}
