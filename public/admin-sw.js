// Minimal service worker for installering af admin som app.
// Ingen caching med vilje: admin viser live bookingdata, og en stale
// cache ville være værre end et netværksfejl-skærmbillede.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
