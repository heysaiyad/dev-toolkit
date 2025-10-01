// DevToolkit Service Worker
// Enhanced PWA functionality with caching and offline support

const CACHE_NAME = 'devtoolkit-v2.3';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/tools/word-counter/',
  '/tools/word-counter/index.html',
  '/tools/word-counter/script.js',
  '/tools/lorem-ipsum-generator/',
  '/tools/lorem-ipsum-generator/index.html',
  '/tools/lorem-ipsum-generator/script.js',
  '/tools/uuid-generator/',
  '/tools/uuid-generator/index.html',
  '/tools/uuid-generator/script.js',
  '/tools/markdown-previewer/',
  '/tools/markdown-previewer/index.html',
  '/tools/markdown-previewer/script.js',
  '/tools/url-encoder-decoder/',
  '/tools/url-encoder-decoder/index.html',
  '/tools/url-encoder-decoder/script.js',
  '/tools/timer-stopwatch/',
  '/tools/timer-stopwatch/index.html',
  '/tools/timer-stopwatch/script.js',
  '/tools/image-base64-converter/',
  '/tools/image-base64-converter/index.html',
  '/tools/image-base64-converter/script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('🚀 DevToolkit SW: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 DevToolkit SW: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('✅ DevToolkit SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ DevToolkit SW: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 DevToolkit SW: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ DevToolkit SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ DevToolkit SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (different origin)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📦 DevToolkit SW: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Try network request
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('💾 DevToolkit SW: Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('🌐 DevToolkit SW: Network failed, serving offline page');

            // Serve offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }

            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 DevToolkit SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('📬 DevToolkit SW: Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DevToolkit Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🔔 DevToolkit SW: Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('💬 DevToolkit SW: Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      resources: STATIC_RESOURCES.length
    });
  }
});

// Helper function for background sync
async function doBackgroundSync() {
  try {
    // Handle any pending offline actions here
    console.log('✅ DevToolkit SW: Background sync completed');
  } catch (error) {
    console.error('❌ DevToolkit SW: Background sync failed:', error);
  }
}

// Performance monitoring
self.addEventListener('fetch', event => {
  const start = performance.now();

  event.respondWith(
    fetch(event.request).then(response => {
      const duration = performance.now() - start;

      // Log slow requests for performance monitoring
      if (duration > 1000) {
        console.warn(`🐌 DevToolkit SW: Slow request (${duration}ms):`, event.request.url);
      }

      return response;
    })
  );
});

console.log('🛠️ DevToolkit Service Worker loaded successfully');