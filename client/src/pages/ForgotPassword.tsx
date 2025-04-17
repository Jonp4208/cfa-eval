import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import { useTranslation } from '@/contexts/TranslationContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting forgot password request for:', email);

    try {
      console.log('Making API request to /api/auth/forgot-password');
      const response = await api.post('/api/auth/forgot-password', { email });
      console.log('Response received:', response.data);

      setIsSubmitted(true);
      toast({
        title: t('common.success'),
        description: t('auth.passwordResetSent'),
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('auth.email')}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    {t('auth.passwordResetInstructions', 'Enter your email address and we\'ll send you a temporary password to log in.')}
                  </p>
                  <input
                    id="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? t('auth.sending', 'Sending...') : t('auth.sendResetInstructions', 'Send temporary password')}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  {t('auth.checkEmailForReset', 'Check your email for your temporary password. Use it to log in and then change your password.')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('auth.didntReceiveEmail', 'Didn\'t receive the email? Check your spam folder or try again.')}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  {t('auth.tryAgain', 'Try again')}
                </button>
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin', 'Back to login')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}