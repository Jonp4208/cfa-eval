import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, CreditCard, Lock, Mail, Shield, Star, Zap, RefreshCw } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/contexts/AuthContext'

export default function Subscription() {
  const navigate = useNavigate()
  // Use the subscription context
  const { hasActiveSubscription, subscriptionStatus, currentPeriod, refreshSubscription } = useSubscription()
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)


  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSubscription()
    setTimeout(() => setRefreshing(false), 1000)
  }



  // Refresh subscription on mount
  useEffect(() => {
    handleRefresh()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Leadership Development Subscription</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>

          </div>
        </div>

        {hasActiveSubscription ? (
          <Card className="bg-white shadow-md border-green-100">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-800">Active Subscription</CardTitle>
                  <CardDescription className="text-green-700">
                    Your store has full access to all leadership development plans
                  </CardDescription>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subscription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Store</p>
                      <p className="text-lg font-semibold">{user?.store?.name || 'Your Store'} #{user?.store?.storeNumber}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <p className="text-lg font-semibold text-green-600">Active</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Start Date</p>
                      <p className="text-lg font-semibold">{currentPeriod?.startDate ? formatDate(currentPeriod.startDate) : 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Expiration Date</p>
                      <p className="text-lg font-semibold">{currentPeriod?.endDate ? formatDate(currentPeriod.endDate) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Included Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Access to all leadership development plans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Unlimited team member access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Leadership assessment tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Development tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button
                variant="default"
                onClick={() => navigate('/leadership/developmental-plan')}
              >
                View Development Plans
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-amber-800">Subscription Required</CardTitle>
                    <CardDescription className="text-amber-700">
                      Unlock full access to all leadership development plans
                    </CardDescription>
                  </div>
                  <Lock className="h-8 w-8 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Why Subscribe?</h3>
                    <p className="text-gray-600">
                      Our leadership development plans are designed to help your team grow into effective leaders
                      using proven methodologies and practical exercises. While the first plan is available for free,
                      a subscription unlocks the full suite of leadership development resources.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium text-gray-800">Premium Content</h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Access all leadership development plans, including advanced topics like strategic thinking and talent development.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium text-gray-800">Team Access</h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Everyone in your store gets access to the leadership materials, creating a culture of growth.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Subscription Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-800">Annual Subscription</h4>
                        <span className="text-xl font-bold text-gray-900">$499/year</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        One payment covers your entire store for a full year of access.
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">All leadership development plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">Unlimited team member access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">Leadership assessment tools</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">Development tracking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/leadership/developmental-plans/new')}
                >
                  Try Free Plan
                </Button>
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={() => window.location.href = 'mailto:contact@ld-growth.com?subject=Leadership%20Development%20Subscription%20Inquiry&body=I%20am%20interested%20in%20subscribing%20to%20the%20leadership%20development%20plans.%20Please%20provide%20more%20information.%0A%0AStore%20Number%3A%20' + (user?.store?.storeNumber || '')}
                >
                  <Mail className="h-4 w-4" />
                  Contact for Subscription
                </Button>
              </CardFooter>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">How to Subscribe</h4>
                  <p className="text-blue-700 text-sm">
                    To subscribe, please contact our team at <a href="mailto:contact@ld-growth.com" className="underline font-medium">contact@ld-growth.com</a>.
                    We'll provide you with payment information and set up your store's subscription.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}
