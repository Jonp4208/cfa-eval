// Service Worker for LD Growth PWA

// Change this version number whenever you want to force an update
const CACHE_VERSION = '1.0.181';
const CACHE_NAME = `ld-growth-cache-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/ios-fixes.css'
];

// Install event - cache basic assets
self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request - fetch() uses up the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API requests
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If the fetch fails (e.g. network offline), try to return the cached homepage
            return caches.match('/');
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Listen for push events (notifications from the server)
self.addEventListener('push', event => {

  let notificationData = {};
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      // If the data isn't JSON, just use the text
      notificationData = {
        title: 'New Notification',
        body: event.data.text(),
        icon: '/icons/icon-192x192.png'
      };
    }
  } else {
    notificationData = {
      title: 'New Notification',
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png'
    };
  }

  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: '/icons/notification-badge.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    vibrate: [100, 50, 100],
    tag: notificationData.tag || 'default-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'New Notification', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(clientList => {
      // If we have a client already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
