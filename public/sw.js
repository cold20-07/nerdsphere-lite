// Minimal service worker for PWA installability only
// No caching - app requires internet connection

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// No fetch handler - all requests go to network
// This ensures app doesn't work offline
