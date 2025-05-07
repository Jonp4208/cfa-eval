import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const token = searchParams.get('token');

  useEffect(() => {
    // Auto-focus password input on mount
    const passwordInput = document.getElementById('password');
    if (passwordInput) passwordInput.focus();
  }, []);

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 8) {
      setPasswordError(t('auth.passwordMinLength', 'Password must be at least 8 characters long'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError(t('auth.confirmPasswordRequired', 'Please confirm your password'));
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
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
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white rounded-[20px] shadow-md">
            <CardContent className="py-6 text-center">
              <p className="text-[#E51636] mb-4">{t('auth.invalidResetLink', 'Invalid reset link. Please request a new password reset.')}</p>
              <Button
                variant="outline"
                className="text-sm font-medium text-[#E51636] hover:text-[#E51636]/90 border-[#E51636]/20 hover:bg-[#E51636]/5"
                asChild
              >
                <Link to="/forgot-password">
                  {t('auth.goToForgotPassword', 'Go to forgot password')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#27251F]/60">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`mt-2 block w-full h-12 px-4 pr-12 rounded-xl border ${
                      passwordError ? 'border-[#E51636]' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    onBlur={() => validatePassword(password)}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-[#E51636]">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#27251F]/60">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`mt-2 block w-full h-12 px-4 pr-12 rounded-xl border ${
                      confirmPasswordError ? 'border-[#E51636]' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#E51636] focus:border-transparent`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateConfirmPassword(e.target.value);
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-[#E51636]">{confirmPasswordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12"
                disabled={isLoading}
              >
                {isLoading ? t('auth.resetting', 'Resetting...') : t('auth.resetPassword')}
              </Button>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-[#E51636] hover:text-[#E51636]/90"
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