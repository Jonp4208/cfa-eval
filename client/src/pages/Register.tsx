// client/src/pages/Register.tsx
import React from 'react';
// client/src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/api/auth/register', formData);
      navigate('/login');
      toast({
        title: t('common.success'),
        description: t('auth.registrationSuccessful', 'Registration successful. Please login.'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('auth.registrationFailed', 'Registration failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-red-600 mb-8">
          LD Growth - CFA
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('auth.createAccount', 'Create a new account')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('auth.fullName', 'Full Name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="storeNumber" className="block text-sm font-medium text-gray-700">
                  {t('auth.storeNumber', 'Store Number')}
                </label>
                <input
                  id="storeNumber"
                  name="storeNumber"
                  type="text"
                  required
                  placeholder={t('auth.storeNumberPlaceholder', 'e.g., 00727')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={formData.storeNumber}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                variant="red"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.creatingAccount', 'Creating account...') : t('auth.createAccount', 'Create account')}
              </Button>

              <div className="text-sm text-center">
                <Link
                  to="/login"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {t('auth.alreadyHaveAccount', 'Already have an account? Sign in')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}