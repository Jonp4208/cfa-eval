import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: '❌ ' + t('common.error'),
        description: t('auth.passwordsDoNotMatch', 'Passwords do not match'),
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: '❌ ' + t('common.error'),
        description: t('auth.passwordMinLength', 'Password must be at least 8 characters long'),
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword: password
      });

      toast({
        title: '✅ ' + t('auth.passwordResetSuccessTitle', 'Password Reset Successful'),
        description: t('auth.passwordResetSuccessMessage', 'Your password has been reset. You will be redirected to login.'),
        duration: 5000,
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: '❌ ' + t('common.error'),
        description: error.response?.data?.message || t('auth.resetPasswordError', 'Failed to reset password'),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-red-600 mb-4">{t('auth.invalidResetLink', 'Invalid reset link. Please request a new password reset.')}</p>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              {t('auth.goToForgotPassword', 'Go to forgot password')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              LD Growth
              <span className="text-red-600 ml-2 bg-red-50 px-2 rounded text-3xl">CFA</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Empowering Team Member Development</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('auth.resetPassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.newPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                variant="red"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.resetting', 'Resetting...') : t('auth.resetPassword')}
              </Button>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 