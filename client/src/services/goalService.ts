import { Goal } from '../types/goals'
import api from '../lib/axios'

export async function getGoals(): Promise<Goal[]> {
  try {
    const response = await api.get('/api/goals')
    return response.data
  } catch (error) {
    console.error('Error fetching goals:', error)
    throw error
  }
}

export async function getGoal(id: string): Promise<Goal> {
  try {
    const response = await api.get(`/api/goals/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching goal:', error)
    throw error
  }
}

export async function createGoal(data: Partial<Goal>): Promise<Goal> {
  try {
    console.log('Making API call to create goal:', data)
    const response = await api.post('/api/goals', data)
    console.log('API response:', response)
    return response.data
  } catch (error) {
    console.error('Error creating goal:', error)
    throw error
  }
}

export async function updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
  try {
    const response = await api.put(`/api/goals/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    await api.delete(`/api/goals/${id}`)
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
} 