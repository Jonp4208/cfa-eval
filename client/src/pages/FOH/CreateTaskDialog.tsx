import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'

// Create a properly configured API instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Check if a new token was issued
    const newToken = response.headers['x-new-token']
    if (newToken) {
      console.log('Received new token from server')
      localStorage.setItem('token', newToken)
    }
    return response
  },
  async (error) => {
    // If we get a 401 error (unauthorized), try to use the refresh token
    if (error.response?.status === 401) {
      console.log('Received 401 error, attempting to refresh token')
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          // Make a request to refresh the token
          const refreshResponse = await axios.get('/api/auth/profile', {
            headers: {
              'X-Refresh-Token': refreshToken
            }
          })

          // Check if we got a new token
          const newToken = refreshResponse.headers['x-new-token']
          if (newToken) {
            console.log('Token refreshed successfully')
            localStorage.setItem('token', newToken)

            // Retry the original request with the new token
            error.config.headers.Authorization = `Bearer ${newToken}`
            return axios(error.config)
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftType: 'opening' | 'transition' | 'closing'
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  shiftType
}: CreateTaskDialogProps) {
  const [taskName, setTaskName] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const createTaskMutation = useMutation({
    mutationFn: async (data: { name: string; shiftType: string }) => {
      console.log('Creating FOH task with data:', data)
      try {
        // Use a relative URL that works in both development and production
        const response = await axios.post('/api/foh/tasks', data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        console.log('Task creation response:', response)
        return response.data
      } catch (error) {
        console.error('Error in task creation request:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foh-tasks'] })
      setTaskName('')
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Task created successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      })
      console.error('Error creating task:', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskName.trim()) {
      createTaskMutation.mutate({ name: taskName.trim(), shiftType })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#27251F]">
            Create New {shiftType.charAt(0).toUpperCase() + shiftType.slice(1)} Task
          </DialogTitle>
          <DialogDescription className="text-[#27251F]/60">
            Add a new task to the {shiftType} checklist.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-3">
            <Label htmlFor="taskName" className="text-[#27251F] font-medium">
              Task Name
            </Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter a descriptive task name"
              className="rounded-lg border-gray-300 focus:border-[#E51636] focus:ring-[#E51636]/10"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!taskName.trim() || createTaskMutation.isPending}
              className="rounded-lg bg-[#E51636] hover:bg-[#D01530] text-white"
            >
              {createTaskMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}