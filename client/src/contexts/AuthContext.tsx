import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        try {
          const response = await api.get('/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          
          // If we have a refresh token, try to refresh the access token
          if (refreshToken) {
            try {
              const refreshResponse = await api.post('/api/auth/refresh', { refreshToken });
              const newToken = refreshResponse.data.token;
              
              localStorage.setItem('token', newToken);
              setToken(newToken);
              
              // Try to fetch the profile again with the new token
              const profileResponse = await api.get('/api/auth/profile');
              setUser(profileResponse.data.user);
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              // If refresh fails, clear all tokens and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setToken(null);
              setUser(null);
              window.location.href = '/login';
            }
          } else {
            // No refresh token, clear access token and redirect to login
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            window.location.href = '/login';
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Clear any existing auth state before attempting login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid login response from server');
      }

      const { token, refreshToken, user } = response.data;
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error: any) {
      // Ensure auth state is cleared on login error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    
    // Redirect to login page after logout
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};