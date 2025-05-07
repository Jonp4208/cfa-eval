import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { handleError } from '@/lib/utils/error-handler';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Auto-focus email input on mount
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.invalidEmail'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }

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
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">
                LD Growth
                <span className="bg-white/10 ml-2 px-2 rounded-lg">CFA</span>
              </h1>
            </div>
            <p className="text-white/80 text-center text-lg">Empowering Team Member Development</p>
          </div>
        </div>

        <Card className="bg-white rounded-[20px] shadow-md">
          <CardHeader>
            <CardTitle className="text-[#27251F] text-xl text-center">{t('auth.resetPassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#27251F]/60">
                    {t('auth.email')}
                  </label>
                  <p className="text-sm text-[#27251F]/60 mb-2">
                    {t('auth.passwordResetInstructions', 'Enter your email address and we\'ll send you a temporary password to log in.')}
                  </p>
                  <input
                    id="email"
                    type="email"
                    required
                    className={`mt-2 block w-full h-12 px-4 rounded-xl border ${
                      emailError ? 'border-[#E51636]' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-[#E51636]">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.sending', 'Sending...') : t('auth.sendResetInstructions', 'Send temporary password')}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-[#27251F]/80">
                  {t('auth.checkEmailForReset', 'Check your email for your temporary password. Use it to log in and then change your password.')}
                </p>
                <p className="text-sm text-[#27251F]/60">
                  {t('auth.didntReceiveEmail', 'Didn\'t receive the email? Check your spam folder or try again.')}
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="text-sm font-medium text-[#E51636] hover:text-[#E51636]/90 border-[#E51636]/20 hover:bg-[#E51636]/5"
                >
                  {t('auth.tryAgain', 'Try again')}
                </Button>
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-[#E51636] hover:text-[#E51636]/90"
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