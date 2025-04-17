import React, { useState, useEffect, useRef } from 'react';
import { UpdateNotification } from '@/components/UpdateNotification';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu as MenuIcon,
  Home,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  X,
  Bell,
  Search as SearchIcon,
  Clock,
  Target,
  BarChart,
  User2,
  CheckSquare,
  ChefHat,
  Calendar,
  LucideIcon,
  ClipboardCheck,
  LineChart,
  LayoutDashboard,
  Trash2,
  BarChart2,
  Wrench,
  ShieldCheck,
  GraduationCap,
  BarChart3,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { MobileNav } from './MobileNav';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationList } from './NotificationList';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  show: boolean;
  badge: string | null;
  color?: string;
  submenu?: {
    icon: LucideIcon;
    label: string;
    href: string;
    badge: string | null;
    color?: string;
  }[];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth() as { user: User | null, logout: () => void };
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [pendingEvaluations, setPendingEvaluations] = useState(0);
  const [newDisciplinaryItems, setNewDisciplinaryItems] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingEvaluations, setUpcomingEvaluations] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial counts and notification status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await api.get('/api/dashboard/stats');
        // If there are any unread notifications, they will be in upcomingEvaluations
        const notifications = dashboardResponse.data.upcomingEvaluations || [];
        setUpcomingEvaluations(notifications);
        // Set hasNotifications directly based on whether there are any notifications
        setHasNotifications(notifications.length > 0);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);

        let errorMessage = "Failed to load notifications";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (!error.response) {
          errorMessage = "Server not responding. Please check your connection.";
        }

        showNotification('error', 'Error', errorMessage);
      }
    };

    if (user?.store?._id) {
      fetchData();
      // Refresh every 5 minutes
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?.store?._id, showNotification]);

  // Add effect to fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        const unreadCount = response.data.notifications.filter(
          (notification: any) => !notification.read
        ).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced click outside handler with proper event propagation
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only handle clicks if the menu is open
      if (!isMobileMenuOpen) return;

      // Check if click is outside both the menu and the toggle button
      const menuButton = document.querySelector('[data-mobile-menu-toggle]');
      const isClickOnButton = menuButton?.contains(event.target as Node);
      const isClickInMenu = menuRef.current?.contains(event.target as Node);

      if (!isClickInMenu && !isClickOnButton) {
        setIsMobileMenuOpen(false);
      }
    }

    // Add capture phase listener to handle events before they reach other handlers
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isMobileMenuOpen]);

  // Toggle menu with proper event handling
  const handleMenuToggle = (event: React.MouseEvent) => {
    // Prevent event from bubbling to document
    event.stopPropagation();
    setIsMobileMenuOpen(prev => !prev);
  };

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: t('navigation.dashboard'),
      href: '/',
      show: true,
      badge: null
    },
    {
      icon: CheckSquare,
      label: 'FOH Tasks',
      href: '/foh',
      show: true,
      badge: null
    },
    // Shifts functionality removed
    {
      icon: ChefHat,
      label: t('navigation.kitchen'),
      href: '/kitchen',
      show: user?.departments?.includes('Kitchen'),
      badge: null,
      submenu: [
        {
          icon: LayoutDashboard,
          label: t('navigation.dashboard'),
          href: '/kitchen',
          badge: null
        },
        {
          icon: Trash2,
          label: t('navigation.wasteTracker'),
          href: '/kitchen/waste-tracker',
          badge: null
        },
        {
          icon: BarChart2,
          label: t('navigation.analytics'),
          href: '/kitchen/waste-tracker/analytics',
          badge: null
        },
        {
          icon: Wrench,
          label: t('navigation.equipmentStatus'),
          href: '/kitchen/equipment',
          badge: null
        },
        {
          icon: ShieldCheck,
          label: t('navigation.foodSafety'),
          href: '/kitchen/food-safety',
          badge: null
        }
      ]
    },
    {
      icon: Users,
      label: user?.position === 'Team Member' ? t('navigation.me') : t('navigation.teamMembers'),
      href: user?.position === 'Team Member' ? `/users/${user?._id}` : '/users',
      show: true,
      badge: null,
      submenu: user?.position === 'Team Member' ? [
        {
          icon: User2,
          label: t('navigation.myProfile'),
          href: `/users/${user?._id}`,
          badge: null
        },

        // Disciplinary moved to Documentation
        // {
        //   icon: AlertTriangle,
        //   label: 'My Disciplinary',
        //   href: '/disciplinary',
        //   badge: newDisciplinaryItems > 0 ? newDisciplinaryItems.toString() : null,
        //   color: newDisciplinaryItems > 0 ? 'text-red-600' : undefined
        // },
        {
          icon: FileText,
          label: 'My Documentation',
          href: '/documentation',
          badge: null
        },
        {
          icon: GraduationCap,
          label: 'My Training',
          href: '/training',
          badge: null
        }
      ] : [
        {
          icon: Users,
          label: 'View All',
          href: '/users',
          badge: null
        },

        // Disciplinary moved to Documentation
        // {
        //   icon: AlertTriangle,
        //   label: 'Disciplinary',
        //   href: '/disciplinary',
        //   badge: newDisciplinaryItems > 0 ? newDisciplinaryItems.toString() : null,
        //   color: newDisciplinaryItems > 0 ? 'text-red-600' : undefined
        // },
        {
          icon: FileText,
          label: 'Documentation',
          href: '/documentation',
          badge: null
        },
        {
          icon: GraduationCap,
          label: 'Training',
          href: '/training',
          badge: null
        }
      ]
    },
    {
      icon: ClipboardList,
      label: 'Development',
      href: '#',
      show: true,
      badge: null,
      submenu: user?.position === 'Team Member' ? [
        {
          icon: ClipboardList,
          label: 'My Evaluations',
          href: '/evaluations',
          badge: pendingEvaluations > 0 ? pendingEvaluations.toString() : null,
          color: pendingEvaluations > 0 ? 'text-red-600' : undefined
        },

      ] : [
        {
          icon: ClipboardList,
          label: 'Evaluations',
          href: '/evaluations',
          badge: pendingEvaluations > 0 ? pendingEvaluations.toString() : null,
          color: pendingEvaluations > 0 ? 'text-red-600' : undefined
        },

        {
          icon: TrendingUp,
          label: 'Leadership',
          href: '/leadership',
          badge: null
        },
        {
          icon: BarChart,
          label: 'Analytics',
          href: '/analytics',
          badge: null
        }
      ]
    }
  ];

  const handleDismissNotification = async (evaluation: any) => {
    try {
      console.log('Dismissing notification:', {
        notificationId: evaluation.notificationId,
        evaluation
      });

      if (!evaluation.notificationId) {
        showNotification('error', t('common.error'), t('notifications.invalidNotification', 'Invalid notification: No notification ID found'));
        return;
      }

      // Delete the notification instead of marking as read
      await api.delete(`/api/notifications/${evaluation.notificationId}`);

      console.log('Successfully deleted notification');

      // Update local state
      setUpcomingEvaluations(prev => {
        const updatedNotifications = prev.filter(e => e.notificationId !== evaluation.notificationId);
        // Set hasNotifications based on whether there are any remaining notifications
        setHasNotifications(updatedNotifications.length > 0);
        return updatedNotifications;
      });

      showNotification('success', t('common.success'), t('notifications.dismissSuccess', 'Notification dismissed successfully'));
    } catch (error: any) {
      console.error('Error dismissing notification:', error);

      // Get a user-friendly error message
      let errorMessage = t('notifications.failedToDelete', 'Failed to dismiss notification. Please try again.');
      if (error.response) {
        // Server responded with error
        if (error.response.status === 404) {
          errorMessage = t('notifications.notFound', 'Notification not found or already dismissed');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 403) {
          errorMessage = t('notifications.noPermission', 'You don\'t have permission to dismiss this notification');
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = t('common.serverNotResponding', 'Server not responding. Please check your connection.');
      } else {
        // Error setting up request
        errorMessage = error.message || t('common.unexpectedError', 'An unexpected error occurred');
      }

      showNotification('error', t('common.error'), errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="[&>*]:min-[938px]:hidden fixed-header-ios">
        {/* iOS Status Bar Spacer - only visible on iOS PWA */}
        <div className="ios-status-bar-height"></div>
        <div className="h-16 px-4 flex items-center justify-between">
          {/* Logo and Store Info */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-manipulation"
          >
            <TrendingUp className="h-6 w-6 text-red-600" />
            <div className="flex flex-col">
              <span className="font-bold">LD Growth</span>
              <span className="text-xs text-gray-500">#{user?.store?.storeNumber || '00000'}</span>
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button
            data-mobile-menu-toggle
            onClick={handleMenuToggle}
            className="min-[938px]:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden min-[938px]:block fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="h-16 mx-auto max-w-7xl px-4 flex items-center justify-between gap-8">
          {/* Left Section: Logo and Store Info */}
          <div className="flex items-center gap-8">
            {/* Logo and Store Info */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <TrendingUp className="h-6 w-6 text-red-600" />
              <div className="flex flex-col">
                <span className="font-bold">LD Growth</span>
                <span className="text-xs text-gray-500">#{user?.store?.storeNumber || '00000'}</span>
              </div>
            </button>

            {/* Desktop Navigation Items */}
            <div className="hidden min-[938px]:flex items-center gap-1">
              {menuItems
                .filter(item => item.show)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href);

                  if (item.submenu) {
                    return (
                      <DropdownMenu key={item.href}>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "px-4 py-2 flex items-center gap-2 rounded-xl min-h-[44px]",
                              (isActive || item.submenu.some(sub => location.pathname.startsWith(sub.href)))
                                ? "bg-red-50 text-red-600"
                                : "hover:bg-gray-50 text-gray-600"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          {item.submenu.map(subItem => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname.startsWith(subItem.href);
                            return (
                              <DropdownMenuItem
                                key={subItem.href}
                                onClick={() => navigate(subItem.href)}
                                className={cn(
                                  "flex items-center gap-2 min-h-[44px] cursor-pointer",
                                  isSubActive ? "bg-red-50" : ""
                                )}
                              >
                                <SubIcon className={cn(
                                  "w-4 h-4",
                                  subItem.color || (isSubActive ? "text-red-600" : "text-gray-400")
                                )} />
                                <span className={cn(
                                  subItem.color || (isSubActive ? "text-red-600" : "text-gray-700")
                                )}>
                                  {subItem.label}
                                </span>
                                {subItem.badge && (
                                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                    {subItem.badge}
                                  </span>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  // Regular menu item without submenu
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "px-4 py-2 flex items-center gap-2 rounded-xl min-h-[44px]",
                        isActive ? "bg-red-50 text-red-600" : "hover:bg-gray-50 text-gray-600"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right Section: Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={t('common.notifications', 'Notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#E51636] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>{t('common.notifications', 'Notifications')}</DropdownMenuLabel>
                  <NotificationList onDismiss={() => {
                    // Refresh notification count after dismissal
                    const fetchNotifications = async () => {
                      try {
                        const response = await api.get('/api/notifications');
                        const unreadCount = response.data.notifications.filter(
                          (notification: any) => !notification.read
                        ).length;
                        setNotificationCount(unreadCount);
                      } catch (error) {
                        console.error('Error fetching notifications:', error);
                      }
                    };
                    fetchNotifications();
                  }} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px]">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User2 className="w-4 h-4 text-gray-600" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>{t('navigation.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 min-h-[44px] cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto p-4 min-[938px]:p-6 min-[938px]:pt-24">
          {children}
        </div>
      </main>

      {/* Update Notification */}
      <UpdateNotification />

      {/* Mobile Navigation */}
      <div className="[&>*]:min-[938px]:hidden">
        <MobileNav />
      </div>
    </div>
  );
}