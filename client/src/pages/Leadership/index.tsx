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
  AlertCircle,
  RefreshCw,
  CheckCircle,
  UserCheck,
  BookOpen,
  Brain
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import PageHeader from '@/components/PageHeader'

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
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Replace Hero Section with PageHeader */}
        <PageHeader
          title="Leadership Development"
          subtitle={`CFA #${user?.store?.storeNumber}`}
          icon={<GraduationCap className="h-5 w-5" />}
          actions={
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back Home</span>
            </button>
          }
        />

        {/* Navigation */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto hide-scrollbar flex items-center">
            <div className="flex items-center space-x-4 overflow-x-auto">
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
                variant={isActive('assessments') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('assessments')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('assessments')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Brain className="w-4 h-4" />
                Assessments
              </Button>

              <Button
                variant={isActive('360-evaluations') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('360-evaluations')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('360-evaluations')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                360° Evaluations
              </Button>

              <Button
                variant={isActive('playbooks') ? 'default' : 'ghost'}
                onClick={() => handleNavigate('playbooks')}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                  isActive('playbooks')
                    ? 'bg-red-50 text-[#E51636] hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Playbooks
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