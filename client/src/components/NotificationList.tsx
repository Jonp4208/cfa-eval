import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertTriangle, Bell, Target, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import { useNotification } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  status?: 'READ' | 'UNREAD';
  read?: boolean;
  metadata?: {
    evaluationId?: string;
    evaluationType?: string;
    scheduledDate?: string;
    documentId?: string;
    goalId?: string;
    trainingPlanId?: string;
  };
  relatedId?: string;
  relatedModel?: string;
  employee?: {
    name: string;
    position: string;
    department: string;
  };
}

interface NotificationListProps {
  onDismiss: () => void;
  isMobile?: boolean;
  compact?: boolean;
}

export function NotificationList({ onDismiss, isMobile = false, compact = false }: NotificationListProps) {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      const response = await api.get('/api/notifications');
      console.log('Notifications response:', response.data);

      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showNotification('error', t('common.error'), t('notifications.failedToLoad'));
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      let navigated = false;
      
      // Always close the dropdown menu when clicking a notification
      onDismiss();
      
      // Navigate based on notification type
      if (notification.type === 'EVALUATION' && notification.metadata?.evaluationId) {
        navigate(`/evaluations/${notification.metadata.evaluationId}`);
        navigated = true;
      } else if (notification.type.toUpperCase() === 'DOCUMENTATION' || 
                notification.type.toUpperCase() === 'ADMINISTRATIVE' ||
                notification.title.includes('Administrative Documentation')) {
        // For documentation notifications
        if (notification.metadata?.documentId) {
          navigate(`/documentation/${notification.metadata.documentId}`);
          navigated = true;
        } else if (notification.relatedId && notification.relatedModel === 'Documentation') {
          navigate(`/documentation/${notification.relatedId}`);
          navigated = true;
        } else {
          // If no specific document ID, navigate to documentation list
          navigate('/documentation');
          navigated = true;
        }
      } else if (notification.type.toUpperCase() === 'DISCIPLINARY') {
        // For disciplinary notifications
        if (notification.metadata?.documentId) {
          navigate(`/disciplinary/${notification.metadata.documentId}`);
          navigated = true;
        } else if (notification.relatedId && notification.relatedModel === 'Documentation') {
          navigate(`/disciplinary/${notification.relatedId}`);
          navigated = true;
        } else {
          navigate('/disciplinary');
          navigated = true;
        }
      } else if (notification.type.toUpperCase() === 'GOAL') {
        // For goal notifications
        if (notification.metadata?.goalId) {
          navigate(`/goals/${notification.metadata.goalId}`);
          navigated = true;
        } else {
          navigate('/goals');
          navigated = true;
        }
      } else if (notification.type.toUpperCase() === 'TRAINING' || notification.type.includes('TRAINING')) {
        // For training notifications
        if (notification.metadata?.trainingPlanId) {
          navigate(`/training/plans/${notification.metadata.trainingPlanId}`);
          navigated = true;
        } else {
          navigate('/training');
          navigated = true;
        }
      } else {
        // Handle other notification types or fallback to a default page
        console.log('Unknown notification type:', notification.type);
        // Default to documentation list for the one in the screenshot
        if (notification.title.includes('Administrative Documentation')) {
          navigate('/documentation');
          navigated = true;
        }
      }

      // Mark as read
      await api.post(`/api/notifications/${notification._id}/mark-read`);

      // Remove from list
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      
      // If we didn't navigate, at least indicate something is happening
      if (!navigated) {
        showNotification('info', t('notifications.processed'), t('notifications.notificationProcessed'));
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      showNotification('error', t('common.error'), t('notifications.failedToProcess'));
    }
  };



  const getNotificationIcon = (type: string) => {
    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'EVALUATION':
        return <ClipboardList className="w-4 h-4 text-[#E51636]" />;
      case 'DISCIPLINARY':
        return <AlertTriangle className="w-4 h-4 text-[#E51636]" />;
      case 'GOAL':
        return <Target className="w-4 h-4 text-[#E51636]" />;
      case 'RECOGNITION':
        return <TrendingUp className="w-4 h-4 text-[#E51636]" />;
      default:
        return <Bell className="w-4 h-4 text-[#E51636]" />;
    }
  };

  const formatDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      if (date.includes('T')) {
        // If it's a full datetime string
        return format(dateObj, 'M/d/yyyy');
      } else {
        // If it's just a date string
        return format(dateObj, 'M/d/yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "text-center text-gray-500",
        compact ? "p-2" : isMobile ? "p-6" : "p-4"
      )}>
        {t('common.loading')}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={cn(
        "text-center text-gray-500",
        compact ? "p-2" : isMobile ? "p-6" : "p-4"
      )}>
        {t('common.noNotifications')}
      </div>
    );
  }

  return (
    <div className={cn(
      compact && isMobile ? "" : "overflow-y-auto",
      compact && isMobile ? "" : compact ? "max-h-[30vh]" : isMobile ? "max-h-[calc(100vh-280px)] pb-16" : "max-h-[400px] py-2"
    )}>
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={cn(
            "relative hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer notification-list-item",
            compact ? "p-3 border-b border-gray-100" : isMobile ? "p-4 border-b border-gray-100" : "px-4 py-3 border-b border-gray-100"
          )}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <div className={cn(
                "rounded-full bg-[#E51636]/10 flex items-center justify-center",
                compact ? "w-8 h-8" : isMobile ? "w-10 h-10" : "w-8 h-8"
              )}>
                {getNotificationIcon(notification.type)}
              </div>
              {notification.status === 'UNREAD' && (
                <div className={cn(
                  "absolute bg-[#E51636] rounded-full notification-badge",
                  compact ? "-top-1 -right-1 w-3 h-3" : isMobile ? "-top-1 -right-1 w-4 h-4" : "-top-1 -right-1 w-3 h-3"
                )} />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-grow min-w-0">
                  {/* Extract employee name from message or use stored employee name */}
                  {(() => {
                    let notificationType = '';
                    let employeeName = '';

                    // Extract employee name from message patterns
                    if (notification.message) {
                      const forMatch = notification.message.match(/for ([^.]+)/);
                      if (forMatch) {
                        employeeName = forMatch[1];
                      }
                    }

                    // Fallback to stored employee name
                    if (!employeeName && notification.employee?.name) {
                      employeeName = notification.employee.name;
                    }

                    // Determine notification type from title
                    if (notification.title.includes('Documentation')) {
                      notificationType = 'Documentation';
                    } else if (notification.title.includes('Disciplinary')) {
                      notificationType = 'Disciplinary';
                    } else if (notification.title.includes('Evaluation')) {
                      notificationType = 'Evaluation';
                    } else if (notification.title.includes('Task')) {
                      notificationType = 'Task';
                    } else if (notification.title.includes('Goal')) {
                      notificationType = 'Goal';
                    } else {
                      // Use first word of title as fallback
                      notificationType = notification.title.split(' ')[0];
                    }

                    const displayText = employeeName ? `${notificationType} - ${employeeName}` : notification.title;

                    return (
                      <p className={cn(
                        "font-semibold text-[#27251F] leading-tight",
                        compact ? "text-sm" : isMobile ? "text-base" : "text-sm"
                      )}>
                        {displayText}
                      </p>
                    );
                  })()}
                </div>
                <div className="flex-shrink-0">
                  <p className={cn(
                    "text-[#27251F]/60 font-medium",
                    compact ? "text-xs" : isMobile ? "text-sm" : "text-xs"
                  )}>
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}