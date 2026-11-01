export const createServiceWorkerSource = (precacheUrls: string[]): string => `const CACHE_NAME = 'daily-list-v1'
const PRECACHE_URLS = ${JSON.stringify([...new Set(precacheUrls)])}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('daily-list-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (requestUrl.origin !== self.location.origin || requestUrl.pathname === '/sw.js') {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then(
      (cachedResponse) =>
        cachedResponse ??
        fetch(event.request).then((response) => {
          if (!response.ok) {
            return response
          }

          const responseClone = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          return response
        }),
    ),
  )
})
`
