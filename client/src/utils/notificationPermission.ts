/**
 * Utility functions for handling notification permissions and push subscriptions
 */

import api from '@/lib/axios';

/**
 * Check if the browser supports notifications
 */
export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.log('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    return false;
  }

  try {
    // Get permission
    const permission = await requestNotificationPermission();
    if (!permission) {
      return false;
    }

    // Get the service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    // If not subscribed, create a new subscription
    if (!subscription) {
      // Get the public VAPID key from the server
      const response = await api.get('/api/notifications/vapid-public-key');
      const vapidPublicKey = response.data.vapidPublicKey;
      
      // Convert the key to array buffer
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Create a new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }
    
    // Send the subscription to the server
    await api.post('/api/notifications/subscribe', {
      subscription: JSON.stringify(subscription)
    });
    
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Unsubscribe from push notifications
      await subscription.unsubscribe();
      
      // Let the server know about the unsubscription
      await api.post('/api/notifications/unsubscribe', {
        subscription: JSON.stringify(subscription)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Helper function to convert a base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 