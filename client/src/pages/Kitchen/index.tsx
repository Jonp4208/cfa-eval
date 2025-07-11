import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import {
  Trash2,
  BarChart2,
  Wrench,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

const Kitchen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => {
    if (path === 'analytics') {
      return location.pathname.includes('waste-tracker/analytics');
    }
    return location.pathname.includes(path) && !location.pathname.includes('analytics');
  };

  const handleNavigate = (path: string) => {
    navigate(`/kitchen/${path}`);
  };

  return (
    <div className="min-h-screen p-3 md:p-6 safe-area-top safe-area-bottom pb-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Use PageHeader component */}
        <PageHeader
          title={t('kitchen.title')}
          subtitle={t('kitchen.subtitle')}
          icon={<ChefHat className="h-5 w-5" />}
          actions={
            <div className="w-full sm:w-auto">
              {location.pathname.includes('/kitchen/checklists/history') ? (
                <button
                  onClick={() => navigate('/kitchen/checklists')}
                  className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Back to Checklists</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('kitchen.backHome')}</span>
                </button>
              )}
            </div>
          }
        />

        {/* Clean Navigation with professional styling */}
        <div className="bg-white rounded-[16px] p-2 sm:p-3 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="overflow-x-auto hide-scrollbar pb-2 sm:pb-0 w-full">
              <div className="inline-flex gap-2 min-w-fit">
                <Button
                  variant={location.pathname === '/kitchen' ? 'default' : 'ghost'}
                  onClick={() => navigate('/kitchen')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    location.pathname === '/kitchen'
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('kitchen.dashboard')}
                </Button>
                <Button
                  variant={isActive('analytics') ? 'default' : 'ghost'}
                  onClick={() => navigate('/kitchen/waste-tracker/analytics')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('analytics')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  {t('kitchen.analytics')}
                </Button>
                <Button
                  variant={isActive('equipment') ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('equipment')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('equipment')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  {t('kitchen.equipmentStatus')}
                </Button>
                <Button
                  variant={isActive('food-safety') ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('food-safety')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('food-safety')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {t('kitchen.foodSafety')}
                </Button>
                <Button
                  variant={isActive('food-quality') ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('food-quality')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('food-quality')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Food Quality
                </Button>
                <Button
                  variant={isActive('checklists') ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('checklists')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('checklists')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  {t('kitchen.shiftChecklists')}
                </Button>
                <Button
                  variant={isActive('waste-tracker') ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('waste-tracker')}
                  className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive('waste-tracker')
                      ? 'bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('kitchen.wasteTracker')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced main content area with beautiful animations */}
        <div className="animate-in slide-in-from-bottom-6 duration-500 ease-out">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Kitchen;