import React, { useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  BarChart2,
  Calendar,
  ClipboardList,
  Users,
  ArrowLeft,
  GraduationCap,
  Globe
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PageHeader from '@/components/PageHeader'

export default function Training() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Check if user is a manager/leader/trainer or team member
  const isManager = ['Director', 'Leader', 'Trainer'].includes(user?.position || '')

  useEffect(() => {
    // Redirect based on user role
    if (location.pathname === '/training') {
      // For team members, go directly to plans
      // For managers, go to progress tracking
      navigate(isManager ? '/training/progress' : '/training/plans')
    }

    // If team member tries to access manager-only pages, redirect to plans
    // But allow them to access their own training progress details
    if (!isManager) {
      // Check if they're trying to access a specific progress detail page
      const isProgressDetailPage = /\/training\/progress\/[a-f0-9]+$/i.test(location.pathname);

      // If they're trying to access the main progress page or new-hires page, redirect to plans
      if (!isProgressDetailPage &&
          (location.pathname.includes('/progress') ||
           location.pathname.includes('/new-hires'))) {
        navigate('/training/plans');
      }
    }
  }, [location.pathname, navigate, isManager])

  const isActive = (path: string) => {
    return location.pathname.includes(path)
  }

  const handleNavigate = (path: string) => {
    navigate(`/training/${path}`)
  }

  const navigationItems = [
    {
      title: 'Progress Tracking',
      icon: <BarChart2 className="h-4 w-4" />,
      path: 'progress'
    },
    {
      title: 'Training Plans',
      icon: <ClipboardList className="h-4 w-4" />,
      path: 'plans'
    },
    {
      title: 'New Hires',
      icon: <Users className="h-4 w-4" />,
      path: 'new-hires'
    }
  ]

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Replace the custom header with PageHeader */}
        <PageHeader
          title="Training"
          subtitle={`${user?.store?.name || 'Calhoun FSU'} #${user?.store?.storeNumber}`}
          icon={<GraduationCap className="h-5 w-5" />}
          actions={
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Button
                variant="ghost"
                className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          }
        />

        {/* Navigation - Only show tabs for managers */}
        {isManager ? (
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <Link
                to="/training/progress"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/progress')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="font-medium">Progress Tracking</span>
              </Link>

              <Link
                to="/training/plans"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/plans')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="font-medium">Training Plans</span>
              </Link>

              <Link
                to="/training/new-hires"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/new-hires')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">New Hires</span>
              </Link>

              <Link
                to="/training/community-plans"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/community-plans')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">Community Plans</span>
              </Link>
            </div>
          </div>
        ) : (
          // For team members, show navigation between My Training and Community Plans
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <Link
                to="/training/plans"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/plans') && !isActive('/community-plans')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="font-medium">My Training</span>
              </Link>

              <Link
                to="/training/community-plans"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] transition-all text-sm border ${
                  isActive('/community-plans')
                    ? 'bg-[#E51636] text-white border-[#E51636]'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">Community Plans</span>
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}