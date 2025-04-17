import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add refresh token to header if available
    if (refreshToken) {
      config.headers['X-Refresh-Token'] = refreshToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Track if we're currently refreshing the token
let isRefreshing = false
// Queue of requests to retry after token refresh
let failedQueue: any[] = []

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Check if a new token was issued
    const newToken = response.headers['x-new-token']
    if (newToken) {
      console.log('Received new token from server in global interceptor')
      localStorage.setItem('token', newToken)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Special handling for token expiration errors
    if (error.response?.status === 401) {
      console.log('Received 401 error in global interceptor:', error.message)

      // If the error is due to an expired token and we haven't tried to refresh yet
      if (!originalRequest._retry) {
        if (isRefreshing) {
          // If we're already refreshing, add this request to the queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            // No refresh token available, redirect to login
            localStorage.removeItem('token')
            console.log('No refresh token available, redirecting to login')
            window.location.href = '/login'
            return Promise.reject(error)
          }

          console.log('Attempting to refresh token with refresh token')

          // Create a new axios instance for the refresh request to avoid interceptors
          const refreshAxios = axios.create({
            baseURL: '/api',
            headers: {
              'Content-Type': 'application/json',
              'X-Refresh-Token': refreshToken
            }
          })

          // Make a request to any endpoint with the refresh token in the header
          const response = await refreshAxios.get('/auth/profile')

          // Check if a new token was issued in the response header
          const newToken = response.headers['x-new-token']
          if (newToken) {
            console.log('Token refreshed successfully in global interceptor')
            localStorage.setItem('token', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            processQueue(null, newToken)
            return api(originalRequest)
          } else {
            // No new token was issued, redirect to login
            console.log('No new token issued during refresh, redirecting to login')
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(error)
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          console.error('Token refresh failed:', refreshError)
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // This request has already tried to refresh the token
        console.log('Request already attempted token refresh, giving up')
      }
    }

    return Promise.reject(error)
  }
)

export { api }