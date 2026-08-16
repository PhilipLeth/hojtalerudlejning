/* Service worker til hjemmeskærms-appen.
 *
 * Eneste opgave: tage imod push og vise en besked. Der caches ikke noget —
 * admin skal altid vise friske ordrer, og en cache der serverer gårsdagens
 * bookinger er værre end ingen app.
 *
 * iOS kræver, at HVER push resulterer i en synlig besked. Sker det ikke,
 * trækker Safari abonnementet tilbage. Derfor viser vi altid noget — også
 * når indholdet ikke kan læses.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // Kan indholdet ikke læses, viser vi stadig en besked — ellers mister vi
    // abonnementet
  }

  const title = data.title || "Ny booking";
  const options = {
    body: data.body || "Åbn for at se ordren",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // Samme tag betyder at en ny besked erstatter den gamle i stedet for at
    // stable sig op
    tag: data.tag || "booking",
    data: { url: data.url || "/admin" },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Er appen allerede åben, så brug det vindue frem for at åbne et nyt
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
