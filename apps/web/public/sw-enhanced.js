/**
 * Enhanced Service Worker for Astral Core V2
 * Advanced offline support with background sync and push notifications
 * Implements crisis-first caching strategy
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `astral-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `astral-runtime-${CACHE_VERSION}`;
const MESSAGE_QUEUE_CACHE = `message-queue-${CACHE_VERSION}`;

// Critical resources that must always be available offline
const CRITICAL_RESOURCES = [
  '/',
  '/crisis',
  '/crisis/emergency',
  '/safety',
  '/manifest.json',
  '/offline.html'
];

// Crisis-related API endpoints to cache
const CRISIS_API_CACHE = [
  '/api/crisis/resources',
  '/api/emergency/contacts',
  '/api/safety/plan'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching critical resources');
        // Try to cache each resource individually to avoid failures
        return Promise.allSettled(
          CRITICAL_RESOURCES.map(url => 
            cache.add(url).catch(err => 
              console.warn(`[ServiceWorker] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== MESSAGE_QUEUE_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    // Handle POST requests to crisis endpoints specially
    if (request.method === 'POST' && url.pathname.startsWith('/api/crisis')) {
      event.respondWith(handleCrisisPost(request));
    }
    return;
  }

  // Skip non-HTTP protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Crisis endpoints - network first, fallback to cache
  if (url.pathname.startsWith('/crisis') || 
      url.pathname.startsWith('/api/crisis') ||
      url.pathname.startsWith('/emergency')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // API calls - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - network first with offline page fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request)
            .then(response => response || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Default - network first
  event.respondWith(networkFirstStrategy(request));
});

// Network first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache on network failure
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, response);
        });
      }
    });
    
    return cachedResponse;
  }
  
  // No cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Handle crisis POST requests with queue
async function handleCrisisPost(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Queue the request for later
    await queueRequest(request);
    
    // Return a synthetic response
    return new Response(
      JSON.stringify({
        queued: true,
        message: 'Your message has been queued and will be sent when connection is restored',
        timestamp: new Date().toISOString()
      }),
      {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Queue': 'true'
        }
      }
    );
  }
}

// Queue failed requests
async function queueRequest(request) {
  const cache = await caches.open(MESSAGE_QUEUE_CACHE);
  const timestamp = Date.now();
  const queuedRequest = new Request(
    `${request.url}?queued=${timestamp}`,
    request
  );
  
  await cache.put(queuedRequest, new Response('queued'));
  
  // Register sync if available
  if ('sync' in self.registration) {
    await self.registration.sync.register('crisis-messages');
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  const url = new URL(request.url);
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Background sync for queued messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'crisis-messages') {
    console.log('[ServiceWorker] Syncing queued messages');
    event.waitUntil(syncQueuedMessages());
  }
});

// Sync queued messages when online
async function syncQueuedMessages() {
  const cache = await caches.open(MESSAGE_QUEUE_CACHE);
  const requests = await cache.keys();
  
  const results = await Promise.allSettled(
    requests.map(async (request) => {
      try {
        // Remove queue parameter
        const url = new URL(request.url);
        url.searchParams.delete('queued');
        
        const originalRequest = new Request(url.toString(), request);
        const response = await fetch(originalRequest);
        
        if (response.ok) {
          // Remove from queue
          await cache.delete(request);
          console.log('[ServiceWorker] Synced:', url.pathname);
        }
        
        return response;
      } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
        throw error;
      }
    })
  );
  
  // Notify clients about sync status
  const clients = await self.clients.matchAll();
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  clients.forEach(client => {
    client.postMessage({
      type: 'sync-complete',
      success: successCount,
      total: requests.length
    });
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Crisis Chat',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ],
    tag: 'crisis-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('Astral Core Alert', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open crisis chat
    event.waitUntil(
      clients.openWindow('/crisis')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_QUEUE') {
    checkMessageQueue().then(count => {
      event.ports[0].postMessage({ queued: count });
    });
  }
});

// Check message queue count
async function checkMessageQueue() {
  const cache = await caches.open(MESSAGE_QUEUE_CACHE);
  const requests = await cache.keys();
  return requests.length;
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'crisis-check') {
    console.log('[ServiceWorker] Periodic sync: crisis check');
    event.waitUntil(
      fetch('/api/crisis/check')
        .then(response => response.json())
        .then(data => {
          if (data.hasUrgent) {
            return self.registration.showNotification(
              'Urgent Message',
              {
                body: 'You have an urgent message in crisis chat',
                icon: '/icons/icon-192x192.png',
                tag: 'urgent-crisis',
                requireInteraction: true
              }
            );
          }
        })
        .catch(error => console.error('[ServiceWorker] Periodic sync failed:', error))
    );
  }
});

console.log('[ServiceWorker] Enhanced service worker loaded, version:', CACHE_VERSION);