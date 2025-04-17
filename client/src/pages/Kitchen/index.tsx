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
  ChefHat
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-[#F8F8F8] p-3 md:p-6 safe-area-top safe-area-bottom pb-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced premium header with subtle gradient - mobile optimized */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[16px] md:rounded-[20px] p-3 sm:p-4 md:p-6 text-white shadow-md overflow-hidden">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 md:gap-3 mr-auto">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                  <ChefHat className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0 w-full sm:max-w-none">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{t('kitchen.title')}</h1>
                  <p className="text-white/90 text-sm md:text-base mt-1">{t('kitchen.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border-none transition-all duration-300 h-7 sm:h-8 px-2 sm:px-3 min-w-0"
                  size="sm"
                >
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">{t('kitchen.backHome')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation with subtle shadow and smooth transitions - visible on all screen sizes */}
        <div className="bg-white rounded-[16px] p-2 sm:p-3 shadow-sm border-0">
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

        {/* Main content area with smooth animations */}
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Kitchen;