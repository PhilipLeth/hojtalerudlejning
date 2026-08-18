/* Minimal service worker — gør appen installérbar. Ingen offline-cache i v1:
   alt indhold er dynamisk (tenant-config, genererede billeder). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  /* passthrough — netværket svarer */
});
