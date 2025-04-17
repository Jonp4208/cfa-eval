import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import {
  Home,
  ChefHat,
  ClipboardList,
  GraduationCap,
  CheckSquare,
  FileText,
  Calendar
} from 'lucide-react';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    {
      icon: Home,
      label: t('navigation.dashboard'),
      href: '/',
      show: true
    },
    {
      icon: CheckSquare,
      label: 'FOH Tasks',
      href: '/foh',
      show: true
    },
    // Shifts functionality removed
    {
      icon: FileText,
      label: user?.position === 'Team Member' ? 'My Documentation' : 'Documentation',
      href: '/documentation',
      show: true
    },
    {
      icon: ChefHat,
      label: t('navigation.kitchen'),
      href: '/kitchen',
      show: user?.departments?.includes('Kitchen') || ['Director', 'Leader'].includes(user?.position || '')
    },
    {
      icon: GraduationCap,
      label: t('navigation.training'),
      href: '/training',
      show: true
    }
  ];

  return (
    <nav className="min-[938px]:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex items-center justify-around">
        {/* Bottom navigation items */}
        {navItems
          .filter(item => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);

            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[64px] touch-manipulation",
                  "transition-colors duration-200",
                  isActive ? "text-red-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
      </div>
      {/* Safe area spacer for iOS notch/home indicator */}
      <div className="safe-area-bottom bg-white"></div>
    </nav>
  );
}