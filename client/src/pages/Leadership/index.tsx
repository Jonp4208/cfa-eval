import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Target,
  ClipboardList,
  Users,
  BarChart2,
  LayoutDashboard,
  Lock,
  AlertCircle,
  Shield,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Leadership() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useTranslation()
  // Use the subscription context
  const { hasActiveSubscription, subscriptionStatus, loading, refreshSubscription } = useSubscription()

  // Subscription context is now working correctly

  const [refreshing, setRefreshing] = useState(false)


  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSubscription()
    setTimeout(() => setRefreshing(false), 1000) // Show spinner for at least 1 second
  }



  const isActive = (path: string) => {
    return location.pathname.includes(path)
  }

  const handleNavigate = (path: string) => {
    navigate(`/leadership/${path}`)
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#DD0031] rounded-[20px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  Leadership Development
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm rounded-full">
                    CFA #{user?.store?.storeNumber}
                  </span>
                </h1>
                <p className="text-white/80 mt-2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border-none transition-all duration-300 h-7 sm:h-8 px-2 sm:px-3 min-w-0"
              >
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">Back Home</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              <Button
                variant={isActive('dashboard') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('dashboard')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>

              <Button
                variant={isActive('developmental-plan') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('developmental-plan')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('developmental-plan')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Target className="w-4 h-4" />
                Development Plans
              </Button>

              <Button
                variant={isActive('my-plans') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('my-plans')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('my-plans')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                My Plans
              </Button>

              <Button
                variant={isActive('subscription') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('subscription')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('subscription')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {hasActiveSubscription ? (
                  <Shield className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Subscription
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {!loading && !hasActiveSubscription && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <div className="flex justify-between w-full">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                  <div>
                    <AlertTitle className="text-amber-800 font-medium">
                      Subscription Required
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {subscriptionStatus === 'none' ? (
                        'Your store needs a subscription to access all leadership development plans. The first lesson is available for free.'
                      ) : subscriptionStatus === 'expired' ? (
                        'Your subscription has expired. Please renew to regain access to all leadership development plans.'
                      ) : (
                        'A subscription is required to access all leadership development plans. The first lesson is available for free.'
                      )}
                    </AlertDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-amber-700 border-amber-200 hover:bg-amber-100"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          <Outlet />
        </div>
      </div>
    </div>
  )
}