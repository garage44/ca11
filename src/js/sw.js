var cacheStorageKey = 'minimal-pwa-8'

var cacheList = [
    '/',
    'index.html',
]

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(cacheStorageKey).then(function(cache) {
        return cache.addAll(cacheList)
    }).then(function() {
        return self.skipWaiting()
    }))
})

self.addEventListener('activate', function(e) {
    e.waitUntil(Promise.all(caches.keys().then(cacheNames => {
        return cacheNames.map((name) => {
            if (name !== cacheStorageKey) {
                return caches.delete(name)
            }
            return null
        })
    })).then(() => {
        return self.clients.claim()
    }))
})

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request)
        })
    )
})
