import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const PUBLIC_ROUTES = [
  '/api/login',
  '/api/register',
  '/api/auth/login',
  '/api/auth/register',
  '/',  // Add root route as public
  '/login',
  '/register'
];
// In production, use relative URLs; in development, use the API URL from env or localhost
const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: isProduction ? '' : API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Helper function to check if we're already on the login page
const isOnLoginPage = () => {
  return window.location.pathname === '/login';
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Don't redirect if accessing public routes or already on login page
  const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isPublicRoute && !isOnLoginPage()) {
    // Only redirect if not already on login page
    window.location.href = '/login';
  }

  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your connection and try again.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors, but not for login/register routes
    const isPublicRoute = PUBLIC_ROUTES.some(route => error.config?.url?.includes(route));

    if (error.response?.status === 401) {
      if (!isPublicRoute && !isOnLoginPage()) {
        // For protected routes, redirect to login only if not already on login page
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (!isOnLoginPage()) {
        // For login/register routes, show error message
        toast({
          title: 'Authentication Error',
          description: error.response?.data?.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } else if (error.response) {
      // Handle other error responses
      toast({
        title: 'Error',
        description: error.response.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export default api;