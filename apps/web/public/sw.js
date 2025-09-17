/**
 * Service Worker for Crisis Chat
 * Provides offline support and message queuing
 * Ensures critical resources are cached for fast loading
 */

const CACHE_NAME = 'crisis-chat-v1';
const RUNTIME_CACHE = 'crisis-runtime-v1';

// Critical resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/fonts/inter-var.woff2',
  '/sounds/notification.mp3',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching critical resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (request.destination === 'image' || 
      request.destination === 'font' || 
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
    );
    return;
  }

  // Network-first with fallback for HTML pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If requesting HTML, return offline page
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});

// Background sync for queued messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-messages') {
    event.waitUntil(sendQueuedMessages());
  }
});

// Send queued messages when connection is restored
async function sendQueuedMessages() {
  const cache = await caches.open('message-queue');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request.clone());
      
      if (response.ok) {
        // Remove from queue if successful
        await cache.delete(request);
        
        // Notify the client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'MESSAGE_SENT',
            url: request.url,
          });
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Failed to send queued message:', error);
    }
  }
}

// Push notifications for crisis alerts
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Crisis alert',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'crisis-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'respond',
        title: 'Respond',
        icon: '/icons/respond.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Crisis Alert', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'respond') {
    event.waitUntil(
      clients.openWindow('/chat')
    );
  }
});

// Periodic background sync for checking updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/updates');
    const data = await response.json();
    
    if (data.hasUpdate) {
      // Notify clients about available update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: data.version,
        });
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Update check failed:', error);
  }
}

// Performance monitoring
let performanceData = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  averageResponseTime: 0,
};

// Track performance metrics
function trackPerformance(startTime, cacheHit) {
  const duration = Date.now() - startTime;
  
  if (cacheHit) {
    performanceData.cacheHits++;
  } else {
    performanceData.cacheMisses++;
    performanceData.networkRequests++;
  }
  
  // Calculate rolling average response time
  performanceData.averageResponseTime = 
    (performanceData.averageResponseTime * (performanceData.networkRequests - 1) + duration) / 
    performanceData.networkRequests;
  
  // Send performance data to clients periodically
  if (performanceData.networkRequests % 10 === 0) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PERFORMANCE_DATA',
          data: performanceData,
        });
      });
    });
  }
}

// Clean up old caches periodically
setInterval(() => {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
        caches.delete(cacheName);
      }
    });
  });
}, 1000 * 60 * 60); // Every hour

console.log('[ServiceWorker] Loaded successfully');