import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { userPreferencesService, MobileNavigationItem } from '@/lib/services/userPreferences';
import {
  Home,
  ChefHat,
  ClipboardList,
  GraduationCap,
  CheckSquare,
  FileText,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  Plus,
  Users,
  TrendingUp,
  BarChart
} from 'lucide-react';

// Define all available navigation items with their configurations
const ALL_NAV_ITEMS = {
  dashboard: {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    defaultShow: false
  },
  home: {
    icon: Home,
    label: 'Home',
    href: '/',
    defaultShow: true
  },
  foh: {
    icon: CheckSquare,
    label: 'FOH Tasks',
    href: '/foh',
    defaultShow: true
  },
  documentation: {
    icon: FileText,
    getLabel: (user: any, t: any) => user?.position === 'Team Member' ? 'My Documentation' : 'Documentation',
    href: (user: any) => user?.position === 'Team Member' ? `/documentation?employee=${user?._id}` : '/documentation',
    defaultShow: true
  },
  kitchen: {
    icon: ChefHat,
    getLabel: (user: any, t: any) => t('navigation.kitchen'),
    href: '/kitchen',
    showIf: (user: any) => user?.departments?.includes('Kitchen') || ['Director', 'Leader'].includes(user?.position || ''),
    defaultShow: true
  },
  training: {
    icon: GraduationCap,
    getLabel: (user: any, t: any) => t('navigation.training'),
    href: '/training',
    defaultShow: true
  },
  setupSheet: {
    icon: CalendarDays,
    label: 'Setup Sheet',
    href: '/saved-setups',
    defaultShow: true
  },
  evaluations: {
    icon: ClipboardList,
    label: 'Evaluations',
    href: '/evaluations',
    defaultShow: false
  },
  leadership: {
    icon: TrendingUp,
    label: 'Leadership',
    href: '/leadership',
    showIf: (user: any) => user?.position !== 'Team Member',
    defaultShow: false
  },
  analytics: {
    icon: BarChart,
    label: 'Analytics',
    href: '/analytics',
    showIf: (user: any) => user?.position !== 'Team Member',
    defaultShow: false
  },
  users: {
    icon: Users,
    getLabel: (user: any, t: any) => user?.position === 'Team Member' ? 'My Profile' : 'Team Members',
    href: (user: any) => user?.position === 'Team Member' ? `/users/${user?._id}` : '/users',
    defaultShow: false
  }
};

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [navItems, setNavItems] = useState<any[]>([]);

  // Fetch user preferences to get navigation preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: userPreferencesService.getUserPreferences,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Process navigation items based on user preferences
  useEffect(() => {
    // Log user preferences for debugging
    console.log('MobileNav received user preferences:', userPreferences?.uiPreferences?.mobileNavigation);

    // Get navigation preferences from user preferences
    const userNavPreferences = userPreferences?.uiPreferences?.mobileNavigation?.items;

    // If user has custom navigation preferences, use those
    if (userNavPreferences && userNavPreferences.length > 0) {
      console.log('Using custom navigation preferences:', userNavPreferences);

      const processedItems = userNavPreferences
        .map(item => {
          const navConfig = ALL_NAV_ITEMS[item.key];
          if (!navConfig) return null;

          // Check if this item should be shown based on user role/department
          let shouldShow = item.show;
          if (navConfig.showIf && typeof navConfig.showIf === 'function') {
            shouldShow = shouldShow && navConfig.showIf(user);
          }

          // Get the label (static or dynamic)
          let label = navConfig.label;
          if (navConfig.getLabel && typeof navConfig.getLabel === 'function') {
            label = navConfig.getLabel(user, t);
          }

          // Get the href (static or dynamic)
          let href = navConfig.href;
          if (typeof href === 'function') {
            href = href(user);
          }

          return {
            icon: navConfig.icon,
            label,
            href,
            show: shouldShow
          };
        })
        .filter(Boolean); // Remove null items

      setNavItems(processedItems);
    } else {
      console.log('Using default navigation items');
      // Use default navigation items if no custom preferences
      const defaultItems = [
        { key: 'dashboard', show: true },
        { key: 'foh', show: true },
        { key: 'documentation', show: true },
        { key: 'evaluations', show: true },
        { key: 'users', show: true }
      ];

      const processedItems = defaultItems
        .map(item => {
          const navConfig = ALL_NAV_ITEMS[item.key];
          if (!navConfig) return null;

          // Check if this item should be shown based on user role/department
          let shouldShow = item.show;
          if (navConfig.showIf && typeof navConfig.showIf === 'function') {
            shouldShow = shouldShow && navConfig.showIf(user);
          }

          // Get the label (static or dynamic)
          let label = navConfig.label;
          if (navConfig.getLabel && typeof navConfig.getLabel === 'function') {
            label = navConfig.getLabel(user, t);
          }

          // Get the href (static or dynamic)
          let href = navConfig.href;
          if (typeof href === 'function') {
            href = href(user);
          }

          return {
            icon: navConfig.icon,
            label,
            href,
            show: shouldShow
          };
        })
        .filter(Boolean); // Remove null items

      setNavItems(processedItems);
    }
  }, [userPreferences, user, t]);

  // Function to detect iPhone 13
  const isIPhone13 = () => {
    if (typeof window === 'undefined') return false;

    // iPhone 13 has 390x844 logical resolution
    const { width, height } = window.screen;
    const isIPhone13Dimensions =
      (width === 390 && height === 844) ||
      (height === 390 && width === 844);

    return isIPhone13Dimensions && /iPhone/.test(navigator.userAgent);
  };

  // Function to detect iPhone 13 Pro Max
  const isIPhone13ProMax = () => {
    if (typeof window === 'undefined') return false;

    // iPhone 13 Pro Max has 428x926 logical resolution
    const { width, height } = window.screen;
    const isIPhone13ProMaxDimensions =
      (width === 428 && height === 926) ||
      (height === 428 && width === 926);

    const result = isIPhone13ProMaxDimensions && /iPhone/.test(navigator.userAgent);
    if (result) {
      console.log('MobileNav detected iPhone 13 Pro Max');
    }
    return result;
  };

  // Add iPhone 13 Pro Max class to document if detected
  useEffect(() => {
    if (isIPhone13ProMax() && typeof document !== 'undefined') {
      document.documentElement.classList.add('iphone-13-pro-max-detected');
      console.log('Added iphone-13-pro-max-detected class');
    }
  }, []);

  // If no items are available or still loading, show a placeholder
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="min-[938px]:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-[9999] shadow-[0_-1px_3px_rgba(0,0,0,0.1)] mobile-nav"
      style={{
        touchAction: 'manipulation',
        position: 'fixed',
        bottom: 0,
        paddingBottom: isIPhone13() ? '0.5rem' : isIPhone13ProMax() ? '1.75rem' : undefined,
        zIndex: 9999
      }}
    >
      <div className={cn(
        "flex items-center justify-between px-2",
        isIPhone13() ? "pb-0" : isIPhone13ProMax() ? "pb-2" : "safe-area-bottom"
      )}>
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
                  "flex flex-col items-center gap-0.5 py-2 px-1 flex-1 touch-manipulation mobile-nav-button",
                  "transition-colors duration-200 relative",
                  "active:opacity-70",
                  isActive ? "text-red-600" : "text-gray-500 hover:text-gray-900"
                )}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
      </div>
    </nav>
  );
}