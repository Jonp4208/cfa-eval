import axios from 'axios'
import { TaskList, TaskInstance, Task, TaskMetrics } from '@/types/task'
import { getIdString } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable sending cookies
  timeout: 15000 // 15 second timeout to avoid hanging requests
})

// Create a separate instance with a shorter timeout for history requests
const historyApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 8000 // 8 second timeout for history requests to fail faster
})

// In-memory cache for better performance
const cache = {
  taskLists: null as TaskList[] | null,
  taskListsTimestamp: 0,
  taskInstances: new Map<string, { data: TaskInstance[], timestamp: number }>()
}

// Cache validity durations
const CACHE_DURATIONS = {
  taskLists: 5 * 60 * 1000, // 5 minutes for task lists
  taskInstances: 2 * 60 * 1000 // 2 minutes for task instances
}

// Helper functions for session storage persistence
const persistToSessionStorage = (key: string, data: any): void => {
  try {
    // Stringify the data once to reuse
    const jsonData = JSON.stringify(data)

    // Check if the data is too large (over 4MB)
    if (jsonData.length > 4 * 1024 * 1024) {
      console.warn(`Data for key ${key} is too large (${(jsonData.length / (1024 * 1024)).toFixed(2)}MB), truncating before saving to sessionStorage`)

      // For task instances, we can limit the number of items
      if (key.startsWith('task_instances_')) {
        // Only keep the most recent 20 instances
        const truncatedData = Array.isArray(data) ? data.slice(0, 20) : data
        sessionStorage.setItem(key, JSON.stringify(truncatedData))
        return
      }
    }

    // Try to set the item
    try {
      sessionStorage.setItem(key, jsonData)
    } catch (storageError) {
      // If we get a quota error, clear some space
      if (storageError.name === 'QuotaExceededError' ||
          // Firefox
          storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          // Safari
          storageError.code === 22) {

        console.warn('Storage quota exceeded, clearing old data')

        // Clear all task_instances keys except the current one
        for (let i = 0; i < sessionStorage.length; i++) {
          const storageKey = sessionStorage.key(i)
          if (storageKey && storageKey.startsWith('task_instances_') && storageKey !== key) {
            sessionStorage.removeItem(storageKey)
          }
        }

        // Try again with truncated data
        if (Array.isArray(data)) {
          const truncatedData = data.slice(0, 10) // Keep only 10 items
          sessionStorage.setItem(key, JSON.stringify(truncatedData))
        } else {
          // Last resort - don't save to session storage
          console.error('Unable to save to sessionStorage even after clearing space')
        }
      } else {
        // Some other error
        console.error('Failed to persist data to sessionStorage:', storageError)
      }
    }
  } catch (error) {
    console.error('Failed to process data for sessionStorage:', error)
  }
}

const getFromSessionStorage = <T>(key: string): T | null => {
  try {
    const data = sessionStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.warn('Failed to get data from sessionStorage:', err)
    return null
  }
}

// Add request interceptor to handle auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Apply the same interceptors to historyApi
historyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

historyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Utility function to implement exponential backoff retries
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wait with exponential backoff before retrying, but not on first attempt
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)))
      }
      return await requestFn()
    } catch (error) {
      lastError = error

      // Don't retry for 4xx client errors except 429 (too many requests)
      const status = axios.isAxiosError(error) && error.response?.status
      if (status && status >= 400 && status < 500 && status !== 429) {
        break
      }
    }
  }

  throw lastError
}

const taskService = {
  // Task Lists
  getLists: async (area?: 'foh' | 'boh'): Promise<TaskList[]> => {
    // Check cache validity
    const now = Date.now()
    if (cache.taskLists && (now - cache.taskListsTimestamp) < CACHE_DURATIONS.taskLists) {
      return cache.taskLists
    }

    try {
      const response = await retryRequest(() =>
        api.get<TaskList[]>('/tasks/lists', {
          params: { area }
        })
      )

      // Normalize the data to ensure consistent format
      let lists = response.data

      // Apply normalization and check for field name issues
      lists = lists.map(list => {
        // Make sure category is a valid TaskCategory
        let category = list.category
        if (!category || !['opening', 'transition', 'closing', 'other'].includes(category)) {
          console.warn(`Invalid category found: "${category}" in list ${list._id}, defaulting to "other"`)
          category = 'other'
        }

        // Fix for name vs title inconsistency (some APIs return name instead of title)
        if (!list.title && list.name) {
          console.log(`Fixing title field for list ${list._id}`)
          list.title = list.name
        }

        // Ensure tasks array exists
        if (!list.tasks) {
          list.tasks = []
        }

        // Normalize task fields
        list.tasks = list.tasks.map(task => {
          // Ensure category is set on each task
          if (!task.category) {
            task.category = category
          }

          // Ensure status is valid
          if (!task.status || !['pending', 'completed'].includes(task.status)) {
            task.status = 'pending'
          }

          return task
        })

        return {
          ...list,
          category
        }
      })

      console.log('Normalized task lists:', lists)

      // Update cache
      cache.taskLists = lists
      cache.taskListsTimestamp = now

      return lists
    } catch (error) {
      // If cache exists but is stale, return stale data on error
      if (cache.taskLists) {
        return cache.taskLists
      }

      throw error
    }
  },

  createList: async (taskList: Omit<TaskList, '_id' | 'createdBy' | 'store' | 'createdAt' | 'updatedAt'>): Promise<TaskList> => {
    try {
      const response = await retryRequest(() =>
        api.post<TaskList>('/tasks/lists', taskList)
      )

      // Invalidate cache
      cache.taskLists = null

      return response.data
    } catch (error) {
      throw error
    }
  },

  updateList: async (id: string, taskList: Partial<TaskList>): Promise<TaskList> => {
    try {
      const response = await retryRequest(() =>
        api.put<TaskList>(`/tasks/lists/${id}`, taskList)
      )

      // Invalidate cache
      cache.taskLists = null

      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteList: async (id: string): Promise<void> => {
    try {
      await retryRequest(() =>
        api.delete(`/tasks/lists/${id}`)
      )

      // Invalidate cache
      cache.taskLists = null
    } catch (error) {
      throw error
    }
  },

  // Task Instances
  getInstances: async (params: {
    startDate?: string | Date
    endDate?: string | Date
    taskListId?: string
    area?: 'foh' | 'boh'
  }): Promise<TaskInstance[]> => {
    const cacheKey = JSON.stringify(params)
    const now = Date.now()
    const cachedData = cache.taskInstances.get(cacheKey)

    // Always fetch fresh data if no cache exists
    if (!cachedData || (now - cachedData.timestamp) >= CACHE_DURATIONS.taskInstances) {
      try {
        const response = await retryRequest(() =>
          api.get<TaskInstance[]>('/tasks/instances', { params })
        )

        // Update cache with fresh data
        cache.taskInstances.set(cacheKey, {
          data: response.data,
          timestamp: now
        })

        // Disable session storage persistence due to quota issues
        // persistToSessionStorage(`taskInstances_${cacheKey}`, {
        //   data: response.data,
        //   timestamp: now
        // })

        return response.data
      } catch (error) {
        // If we have stale cache data, return it as fallback
        if (cachedData) {
          return cachedData.data
        }
        throw error
      }
    }

    // Return cached data if it's still valid
    return cachedData.data
  },

  createInstance: async (data: {
    taskListId: string
    date: string
    assignedTasks?: { [taskId: string]: string }
  }): Promise<TaskInstance> => {
    try {
      // Format the data according to the API's expectations
      const formattedData = {
        taskListId: data.taskListId,
        date: data.date,
        assignedTasks: data.assignedTasks || {}
      }

      console.log('Creating instance with data:', formattedData);
      const response = await retryRequest(() =>
        api.post<TaskInstance>('/tasks/instances', formattedData)
      )

      console.log('Instance creation response:', response.data);

      // Invalidate relevant cache entries
      const dateKey = data.date.split('T')[0]
      for (const key of cache.taskInstances.keys()) {
        if (key.includes(dateKey)) {
          cache.taskInstances.delete(key)
        }
      }

      return response.data
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error
    }
  },

  deleteInstance: async (instanceId: string): Promise<void> => {
    try {
      await retryRequest(() =>
        api.delete(`/tasks/instances/${instanceId}`)
      )

      // Invalidate all instance cache as we don't know the date
      cache.taskInstances.clear()
    } catch (error) {
      throw error
    }
  },

  // Task Status Updates
  updateTaskStatus: async (params: {
    instanceId: string
    taskId: string
    status: 'pending' | 'completed'
    completedAt?: string
    completedBy?: { _id: string; name: string }
  }): Promise<TaskInstance> => {
    console.log('updateTaskStatus called with params:', params);

    try {
      // If it's a temporary instance, create a new instance
      if (params.instanceId.startsWith('temp-')) {
        console.log('Creating new instance for temporary ID');
        const instance = await taskService.createInstance({
          taskListId: params.instanceId.replace('temp-', ''),
          date: new Date().toISOString(),
          assignedTasks: { [params.taskId]: params.status }
        });

        // Update the task status in the new instance
        return taskService.updateTaskStatus({
          ...params,
          instanceId: instance._id
        });
      }

      console.log('Sending update to API:', {
        url: `/tasks/instances/${params.instanceId}/tasks/${params.taskId}`,
        data: {
          status: params.status,
          completedAt: params.completedAt,
          completedBy: params.completedBy
        }
      });

      // Try the update with retries
      try {
        const response = await retryRequest(() =>
          api.patch(
            `/tasks/instances/${params.instanceId}/tasks/${params.taskId}`,
            {
              status: params.status,
              completedAt: params.completedAt,
              completedBy: params.completedBy
            }
          )
        );

        console.log('API response:', response.data);

        // Clear all caches to ensure fresh data
        taskService.clearCache();

        // If the API doesn't return the updated instance, fetch it
        if (!response.data || !response.data._id) {
          console.log('API did not return updated instance data, fetching latest...');
          // Fetch the latest instance data
          const instances = await taskService.getInstances({
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
          });

          const updatedInstance = instances.find(i => getIdString(i._id) === params.instanceId);
          if (updatedInstance) {
            return updatedInstance;
          }
        }

        return response.data;
      } catch (apiError) {
        console.error('API error in updateTaskStatus:', apiError);

        // Check if we're getting a 404 - might be a stale instance ID
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          console.warn('Got 404 for instance, might be stale - trying fallback approach');

          // Try to fetch the latest instances to get a fresh ID
          const today = new Date();
          const todayString = today.toISOString();
          const instances = await taskService.getInstances({
            startDate: todayString,
            endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
          });

          if (instances && instances.length > 0) {
            // Try to find a matching instance
            const matchingInstance = instances.find(instance =>
              instance.taskList === params.instanceId.replace('temp-', '') ||
              (typeof instance.taskList !== 'string' &&
                instance.taskList._id === params.instanceId.replace('temp-', ''))
            );

            if (matchingInstance) {
              // Retry with the fresh instance ID
              return taskService.updateTaskStatus({
                ...params,
                instanceId: matchingInstance._id
              });
            }
          }

          // If we still can't find a valid instance, try creating a new one
          console.log('No valid instance found, creating new one');

          // Get the task list ID from one of the instances or fallback to a param
          const taskListId = instances.length > 0 && typeof instances[0].taskList !== 'string'
            ? instances[0].taskList._id
            : params.instanceId;

          const newInstance = await taskService.createInstance({
            taskListId,
            date: new Date().toISOString(),
            assignedTasks: { [params.taskId]: params.status }
          });

          return newInstance;
        }

        throw apiError;
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw error;
    }
  },

  // Metrics
  getMetrics: async (params: {
    startDate: string
    endDate: string
    department?: string
    shift?: string
  }): Promise<TaskMetrics> => {
    try {
      const response = await retryRequest(() =>
        api.get<TaskMetrics>('/tasks/metrics', { params })
      )

      return response.data
    } catch (error) {
      throw error
    }
  },

  // Task History
  getTaskHistory: async (params: {
    startDate: string
    endDate: string
  }): Promise<TaskInstance[]> => {
    // Create a cache key based on the date range
    const cacheKey = `history_${params.startDate.split('T')[0]}_${params.endDate.split('T')[0]}`

    console.log('Getting task history with params:', params)

    try {
      // Try to fetch fresh data from API first
      const response = await retryRequest(async () => {
        console.log(`Making API request to /tasks/history with params:`, params)
        try {
          // Use historyApi with shorter timeout and increased timeout duration
          const result = await historyApi.get<TaskInstance[]>('/tasks/history', {
            params,
            timeout: 30000 // Increase timeout to 30 seconds
          })
          console.log(`API request successful, status: ${result.status}`)
          return result
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.code === 'ECONNABORTED') {
              console.error('API request timed out. The server may be overloaded or the request may be too large.')
              // Try to get cached data if available
              const cachedData = getFromSessionStorage<TaskInstance[]>(cacheKey)
              if (cachedData) {
                console.log('Using cached data after timeout')
                return { data: cachedData, status: 200 }
              }
            } else {
              console.error('API request error:', err)
            }
          }
          throw err
        }
      }, 2) // Reduce retry attempts to 2 for history

      console.log('Task history API response:', {
        status: response.status,
        dataLength: response.data?.length || 0,
        firstItem: response.data?.length > 0 ? response.data[0] : null
      })

      if (response?.data) {
        // Process and normalize the API response
        const normalizedData = response.data.map(instance => {
          // If taskList is just an ID string, convert it to a minimal object to avoid errors
          if (typeof instance.taskList === 'string') {
            console.log(`Converting string taskList ID to object: ${instance.taskList}`)
            instance.taskList = {
              _id: instance.taskList,
              title: 'Unknown List',
              category: 'other',
              tasks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as unknown as TaskList;
          } else if (instance.taskList && !instance.taskList.category) {
            // Ensure category exists to avoid UI errors
            console.log(`taskList missing category, setting default category`)
            instance.taskList.category = 'other';
          }

          // Log the taskList structure for debugging
          console.log(`taskList structure:`, instance.taskList)

          // Ensure each task has required properties
          instance.tasks = (instance.tasks || []).map(task => {
            const normalizedTask = {
              ...task,
              status: task.status || 'pending',
              title: task.title || 'Untitled Task'
            }

            // Convert completedBy if needed
            if (task.completedBy && typeof task.completedBy === 'string') {
              console.log(`Converting string completedBy to object: ${task.completedBy}`)
              normalizedTask.completedBy = {
                _id: task.completedBy,
                name: 'Unknown User'
              }
            }

            return normalizedTask
          });

          return instance;
        });

        // Cache the normalized response in session storage
        persistToSessionStorage(cacheKey, normalizedData);

        return normalizedData;
      }

      console.warn('API returned empty or invalid data')
      return []
    } catch (error) {
      console.error('Error fetching task history', error);
      // Check session storage as fallback if API call fails
      const sessionData = getFromSessionStorage<TaskInstance[]>(cacheKey);
      if (sessionData) {
        console.log('Falling back to cached task history data');
        return sessionData;
      }

      // If no cached data either, return empty array to avoid UI breaking
      return [];
    }
  },

  // Additional Task List Operations
  getAllTaskLists: async (): Promise<TaskList[]> => {
    try {
      const response = await api.get('/tasks')
      return response.data.tasks
    } catch (error) {
      console.error('Failed to fetch all task lists:', error)
      throw error
    }
  },

  getTaskList: async (id: string): Promise<TaskList> => {
    try {
      const response = await api.get(`/tasks/${id}`)
      return response.data.task
    } catch (error) {
      console.error('Failed to fetch task list:', error)
      throw error
    }
  },

  completeTask: async (
    instanceId: string,
    taskId: string,
    status: 'pending' | 'completed',
    completedAt?: string | Date,
    completedBy?: { _id: string; name: string }
  ): Promise<TaskInstance> => {
    try {
      console.log('Completing task:', { instanceId, taskId, status, completedAt, completedBy });

      // Check if this is a temporary instance (no real instance yet)
      if (!instanceId || instanceId === '' || instanceId.startsWith('temp_')) {
        console.log('Handling temporary instance or missing instanceId');

        // Extract task list ID from temporary instance ID if possible
        let taskListId = '';
        if (instanceId && instanceId.startsWith('temp_')) {
          const parts = instanceId.split('_');
          if (parts.length > 1) {
            taskListId = parts[1];
            console.log(`Extracted task list ID from temp instance: ${taskListId}`);
          }
        }

        // If we don't have a task list ID from the instance ID, try to get it from the task
        if (!taskListId && taskId) {
          // Try to find the task list ID from existing instances
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          try {
            // Create a new instance for today
            console.log(`Creating new instance for task list ID: ${taskListId}`);
            const newInstance = await taskService.createInstance({
              taskListId,
              date: today.toISOString(),
              assignedTasks: { [taskId]: status }
            });

            console.log('Created new instance:', newInstance);

            // Now complete the task in the new instance
            return await taskService.completeTask(
              getIdString(newInstance._id),
              taskId,
              status,
              completedAt,
              completedBy
            );
          } catch (createError) {
            console.error('Error creating new instance:', createError);
            throw createError;
          }
        }
      }

      // Normal case - we have a real instance ID
      console.log(`Updating task ${taskId} in instance ${instanceId}`);

      // Extract task title from completedBy if available
      const taskTitle = completedBy?.taskTitle;

      const response = await api.patch(
        `/tasks/instances/${instanceId}/tasks/${taskId}`,
        {
          status,
          completedAt: status === 'completed' ? completedAt || new Date().toISOString() : undefined,
          completedBy: status === 'completed' ? completedBy || {
            _id: localStorage.getItem('userId') || 'unknown',
            name: localStorage.getItem('userName') || 'Current User'
          } : undefined,
          taskTitle: taskTitle // Pass the task title to help with matching
        }
      );

      console.log('Task completion response:', response.data);

      // Get the cache key for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayKey = `${today.toISOString().split('T')[0]}_${new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`

      // Update both in-memory and session storage cache
      if (response.data) {
        const currentData = cache.taskInstances.get(todayKey)?.data || []

        // Update the cache with the new instance data
        const updatedData = currentData.map(instance => {
          if (getIdString(instance._id) === getIdString(response.data._id)) {
            return response.data
          }
          return instance
        })

        // If the instance wasn't in our cache, add it
        if (!updatedData.some(i => getIdString(i._id) === getIdString(response.data._id))) {
          updatedData.push(response.data)
        }

        // Update both caches
        cache.taskInstances.set(todayKey, {
          data: updatedData,
          timestamp: Date.now()
        })

        persistToSessionStorage(`task_instances_${todayKey}`, updatedData)
      }

      return response.data;
    } catch (error) {
      console.error('Failed to complete task:', error);

      // If we get a 404, the instance might not exist yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Instance not found, trying to create a new one');

        // Try to extract task list ID from the error message or context
        let taskListId = '';

        // If we have a task ID, try to find its list
        if (taskId) {
          // This is a simplified approach - in a real app, you'd have more context
          // about which task list this task belongs to
          console.log('Attempting to find task list for task:', taskId);

          // For now, we'll just create a new instance with the task list ID we have
          if (taskListId) {
            try {
              const today = new Date();
              const newInstance = await taskService.createInstance({
                taskListId,
                date: today.toISOString(),
                assignedTasks: { [taskId]: status }
              });

              // Now complete the task in the new instance
              return await taskService.completeTask(
                getIdString(newInstance._id),
                taskId,
                status,
                completedAt,
                completedBy
              );
            } catch (createError) {
              console.error('Error creating new instance after 404:', createError);
            }
          }
        }
      }

      throw error;
    }
  },

  // Simple direct task completion - a more straightforward approach
  completeTaskDirect: async (taskId: string, instanceId: string): Promise<any> => {
    console.log(`Direct task completion for task: ${taskId} in instance: ${instanceId}`);

    try {
      // Make a direct API call without all the complexity - try various endpoint formats
      // Format 1: The one we were using before
      try {
        const response = await axios.post(`${API_URL}/api/tasks/instances/${instanceId}/tasks/${taskId}/complete`, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          completedBy: {
            _id: localStorage.getItem('userId') || 'user',
            name: localStorage.getItem('userName') || 'Current User'
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('Direct completion response:', response.data);
        cache.taskInstances.clear();
        return response.data;
      } catch (error1) {
        console.log('First endpoint failed, trying alternative...');

        // Format 2: Using the existing completeTask endpoint
        try {
          const response = await api.put(`/tasks/${instanceId}/tasks/${taskId}/complete`, {
            status: 'completed'
          });

          console.log('Alternative endpoint success:', response.data);
          cache.taskInstances.clear();
          return response.data.task;
        } catch (error2) {
          console.log('Second endpoint failed, trying patch...');

          // Format 3: Using a patch request
          const response = await api.patch(`/tasks/instances/${instanceId}/tasks/${taskId}`, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: {
              _id: localStorage.getItem('userId') || 'user',
              name: localStorage.getItem('userName') || 'Current User'
            }
          });

          console.log('Patch endpoint success:', response.data);
          cache.taskInstances.clear();
          return response.data;
        }
      }
    } catch (error) {
      console.error('All completion attempts failed:', error);
      throw error;
    } finally {
      // Always clear the cache to ensure fresh data on next load
      cache.taskLists = null;
      cache.taskListsTimestamp = 0;
      cache.taskInstances.clear();
    }
  },

  // Clear all cache - useful when logging out or when explicitly needed
  clearCache: () => {
    cache.taskLists = null
    cache.taskListsTimestamp = 0
    cache.taskInstances.clear()
  }
}

export { taskService }
export default taskService