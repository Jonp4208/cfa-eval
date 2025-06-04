// client/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setPasswordError(t('auth.passwordLength'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/');
    } catch (error: any) {
      setPassword('');
      const errorMessage = error.response?.data?.message || t('auth.loginError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

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
              </h1>
            </div>
            <p className="text-white/80 text-center text-lg">Empowering Team Member Development</p>
          </div>
        </div>
        
        <Card className="bg-white rounded-[20px] shadow-md">
          <CardHeader>
            <CardTitle className="text-[#27251F] text-xl text-center">{t('auth.signIn')}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-[#E51636]/10 border border-[#E51636]/20 text-[#E51636] rounded-xl text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#27251F]/60">
                  {t('auth.email')}
                </label>
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#27251F]/60">
                  {t('auth.password')}
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

              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-2 border-gray-200"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-[#27251F]/60">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12"
                disabled={isLoading}
              >
                {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>

              <div className="flex flex-col items-center gap-3 text-sm">
                <Link
                  to="/register"
                  className="font-medium text-[#E51636] hover:text-[#E51636]/90"
                >
                  {t('auth.noAccount')}
                </Link>
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#E51636] hover:text-[#E51636]/90"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}